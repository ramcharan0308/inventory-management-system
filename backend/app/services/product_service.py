from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select, func, or_

from ..models.product import Product
from ..schemas.product import ProductCreate, ProductUpdate
from ..exceptions import NotFoundError, ConflictError


def _get_or_404(db: Session, product_id: UUID) -> Product:
    product = db.get(Product, product_id)
    if not product:
        raise NotFoundError("Product", str(product_id))
    return product


def _check_sku_unique(db: Session, sku: str, exclude_id: UUID | None = None) -> None:
    stmt = select(Product).where(Product.sku == sku)
    if exclude_id:
        stmt = stmt.where(Product.id != exclude_id)
    existing = db.scalar(stmt)
    if existing:
        raise ConflictError(f"A product with SKU '{sku}' already exists.")


# ── CRUD ──────────────────────────────────────────────────────────────────────

def create_product(db: Session, data: ProductCreate) -> Product:
    _check_sku_unique(db, data.sku)
    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def get_product(db: Session, product_id: UUID) -> Product:
    return _get_or_404(db, product_id)


def list_products(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    search: str | None = None,
    low_stock: bool | None = None,
) -> tuple[list[Product], int]:
    from ..config import settings

    stmt = select(Product)
    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            or_(
                Product.name.ilike(pattern),
                Product.sku.ilike(pattern),
            )
        )
    if low_stock is True:
        stmt = stmt.where(Product.quantity_in_stock <= settings.LOW_STOCK_THRESHOLD)
    elif low_stock is False:
        stmt = stmt.where(Product.quantity_in_stock > settings.LOW_STOCK_THRESHOLD)

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    items = list(
        db.execute(
            stmt.order_by(Product.created_at.desc()).offset(skip).limit(limit)
        )
        .scalars()
        .all()
    )
    return items, total


def update_product(db: Session, product_id: UUID, data: ProductUpdate) -> Product:
    product = _get_or_404(db, product_id)
    patch = data.model_dump(exclude_unset=True)
    if "sku" in patch and patch["sku"] != product.sku:
        _check_sku_unique(db, patch["sku"], exclude_id=product_id)
    for field, value in patch.items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: UUID) -> None:
    product = _get_or_404(db, product_id)
    # Guard: don't delete if referenced by existing order items
    from ..models.order_item import OrderItem
    linked = db.scalar(
        select(func.count(OrderItem.id)).where(OrderItem.product_id == product_id)
    )
    if linked:
        raise ConflictError(
            "Cannot delete a product that is referenced by existing orders. "
            "Cancel or remove those orders first."
        )
    db.delete(product)
    db.commit()


class ProductService:
    def __init__(self, db: Session):
        self.db = db

    def create_product(self, payload: ProductCreate) -> Product:
        return create_product(self.db, payload)

    def get_product(self, product_id: UUID) -> Product | None:
        try:
            return get_product(self.db, product_id)
        except NotFoundError:
            return None

    def list_products(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        low_stock: bool | None = None,
    ) -> tuple[list[Product], int]:
        return list_products(self.db, skip=skip, limit=limit, search=search, low_stock=low_stock)

    def update_product(self, product_id: UUID, payload: ProductUpdate) -> Product | None:
        try:
            return update_product(self.db, product_id, payload)
        except NotFoundError:
            return None

    def delete_product(self, product_id: UUID) -> bool:
        try:
            delete_product(self.db, product_id)
            return True
        except NotFoundError:
            return False
