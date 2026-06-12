from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select, func, or_

from ..models.customer import Customer
from ..schemas.customer import CustomerCreate
from ..exceptions import NotFoundError, ConflictError


def _get_or_404(db: Session, customer_id: UUID) -> Customer:
    customer = db.get(Customer, customer_id)
    if not customer:
        raise NotFoundError("Customer", str(customer_id))
    return customer


def _check_email_unique(db: Session, email: str, exclude_id: UUID | None = None) -> None:
    stmt = select(Customer).where(Customer.email == email)
    if exclude_id:
        stmt = stmt.where(Customer.id != exclude_id)
    if db.scalar(stmt):
        raise ConflictError(f"A customer with email '{email}' already exists.")


# ── CRUD ──────────────────────────────────────────────────────────────────────

def create_customer(db: Session, data: CustomerCreate) -> Customer:
    _check_email_unique(db, data.email)
    customer = Customer(**data.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


def get_customer(db: Session, customer_id: UUID) -> Customer:
    return _get_or_404(db, customer_id)


def list_customers(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    search: str | None = None,
) -> tuple[list[Customer], int]:
    stmt = select(Customer)
    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            or_(
                Customer.full_name.ilike(pattern),
                Customer.email.ilike(pattern),
                Customer.phone_number.ilike(pattern),
            )
        )
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    items = list(
        db.execute(
            stmt.order_by(Customer.created_at.desc()).offset(skip).limit(limit)
        )
        .scalars()
        .all()
    )
    return items, total


def update_customer(db: Session, customer_id: UUID, data: CustomerCreate) -> Customer:
    customer = _get_or_404(db, customer_id)
    if data.email != customer.email:
        _check_email_unique(db, data.email, exclude_id=customer_id)
    for field, value in data.model_dump().items():
        setattr(customer, field, value)
    db.commit()
    db.refresh(customer)
    return customer


def delete_customer(db: Session, customer_id: UUID) -> None:
    customer = _get_or_404(db, customer_id)
    from ..models.order import Order
    linked = db.scalar(
        select(func.count(Order.id)).where(Order.customer_id == customer_id)
    )
    if linked:
        raise ConflictError(
            "Cannot delete a customer that has existing orders. "
            "Cancel or remove those orders first."
        )
    db.delete(customer)
    db.commit()


class CustomerService:
    def __init__(self, db: Session):
        self.db = db

    def create_customer(self, payload: CustomerCreate) -> Customer:
        return create_customer(self.db, payload)

    def get_customer(self, customer_id: UUID) -> Customer | None:
        try:
            return get_customer(self.db, customer_id)
        except NotFoundError:
            return None

    def list_customers(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
    ) -> tuple[list[Customer], int]:
        return list_customers(self.db, skip=skip, limit=limit, search=search)

    def update_customer(self, customer_id: UUID, payload: CustomerCreate) -> Customer | None:
        try:
            return update_customer(self.db, customer_id, payload)
        except NotFoundError:
            return None

    def delete_customer(self, customer_id: UUID) -> bool:
        try:
            delete_customer(self.db, customer_id)
            return True
        except NotFoundError:
            return False
