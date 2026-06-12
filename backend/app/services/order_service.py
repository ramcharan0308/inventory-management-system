from uuid import UUID
from decimal import Decimal
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select, func

from ..models.order import Order, OrderStatus
from ..models.order_item import OrderItem
from ..models.product import Product
from ..models.customer import Customer
from ..schemas.order import OrderCreate
from ..exceptions import NotFoundError, ConflictError, InsufficientStockError


def _load_order(db: Session, order_id: UUID) -> Order | None:
    """Eagerly load order with customer and items.product."""
    return db.scalar(
        select(Order)
        .options(
            selectinload(Order.customer),
            selectinload(Order.items).selectinload(OrderItem.product),
        )
        .where(Order.id == order_id)
    )


# ── CRUD ──────────────────────────────────────────────────────────────────────

def create_order(db: Session, data: OrderCreate) -> Order:
    """
    Atomically validate stock, create order + items, and deduct inventory.
    All changes are rolled back if any product lacks sufficient stock.
    """
    # 1. Validate customer exists
    customer = db.get(Customer, data.customer_id)
    if not customer:
        raise NotFoundError("Customer", str(data.customer_id))

    # 2. Validate all products and stock levels before making any changes
    resolved_items: list[dict] = []
    for item in data.items:
        product = db.get(Product, item.product_id)
        if not product:
            raise NotFoundError("Product", str(item.product_id))
        if product.quantity_in_stock < item.quantity:
            raise InsufficientStockError(
                product_name=product.name,
                available=product.quantity_in_stock,
                requested=item.quantity,
            )
        resolved_items.append(
            {
                "product": product,
                "quantity": item.quantity,
                "unit_price": product.price,
            }
        )

    # 3. Calculate total
    total_amount = sum(
        Decimal(str(i["unit_price"])) * i["quantity"] for i in resolved_items
    )

    # 4. Persist order
    order = Order(
        customer_id=data.customer_id,
        total_amount=total_amount,
        status=OrderStatus.PENDING.value,
    )
    db.add(order)
    db.flush()  # Obtain order.id without committing

    # 5. Persist order items and deduct stock
    for i in resolved_items:
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=i["product"].id,
                quantity=i["quantity"],
                unit_price=i["unit_price"],
            )
        )
        i["product"].quantity_in_stock -= i["quantity"]

    db.commit()

    # Return with eager-loaded relationships
    return _load_order(db, order.id)


def get_order(db: Session, order_id: UUID) -> Order:
    order = _load_order(db, order_id)
    if not order:
        raise NotFoundError("Order", str(order_id))
    return order


def list_orders(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    status: str | None = None,
    customer_id: UUID | None = None,
) -> tuple[list[Order], int]:
    stmt = select(Order).options(
        selectinload(Order.customer),
        selectinload(Order.items).selectinload(OrderItem.product),
    )
    if status:
        stmt = stmt.where(Order.status == OrderStatus(status).value)
    if customer_id:
        stmt = stmt.where(Order.customer_id == customer_id)

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    items = list(
        db.execute(
            stmt.order_by(Order.created_at.desc()).offset(skip).limit(limit)
        )
        .scalars()
        .all()
    )
    return items, total


def update_order_status(db: Session, order_id: UUID, status: OrderStatus) -> Order:
    order = _load_order(db, order_id)
    if not order:
        raise NotFoundError("Order", str(order_id))
    order.status = status.value
    db.commit()
    db.refresh(order)
    return _load_order(db, order_id)


def cancel_order(db: Session, order_id: UUID) -> bool:
    try:
        delete_order(db, order_id)
        return True
    except NotFoundError:
        return False


def delete_order(db: Session, order_id: UUID) -> None:
    """Cancel (delete) an order and restore stock for every item."""
    order = _load_order(db, order_id)
    if not order:
        raise NotFoundError("Order", str(order_id))

    # Restore stock
    for item in order.items:
        product = db.get(Product, item.product_id)
        if product:
            product.quantity_in_stock += item.quantity

    db.delete(order)
    db.commit()


class OrderService:
    def __init__(self, db: Session):
        self.db = db

    def create_order(self, payload: OrderCreate) -> Order:
        return create_order(self.db, payload)

    def get_order(self, order_id: UUID) -> Order | None:
        try:
            return get_order(self.db, order_id)
        except NotFoundError:
            return None

    def list_orders(
        self,
        skip: int = 0,
        limit: int = 20,
        status: str | None = None,
        customer_id: UUID | None = None,
    ) -> tuple[list[Order], int]:
        return list_orders(
            self.db,
            skip=skip,
            limit=limit,
            status=status,
            customer_id=customer_id,
        )

    def update_order_status(self, order_id: UUID, status: OrderStatus) -> Order | None:
        try:
            return update_order_status(self.db, order_id, status)
        except NotFoundError:
            return None

    def cancel_order(self, order_id: UUID) -> bool:
        return cancel_order(self.db, order_id)
