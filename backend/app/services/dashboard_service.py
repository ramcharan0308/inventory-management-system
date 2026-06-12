from decimal import Decimal
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select, func

from ..models.product import Product
from ..models.customer import Customer
from ..models.order import Order, OrderStatus
from ..models.order_item import OrderItem
from ..schemas.dashboard import DashboardStats, StockStatusCount, OrderStatusCounts
from ..schemas.product import ProductRead
from ..schemas.order import OrderSummary
from ..config import Settings


def get_dashboard_stats(db: Session, settings: Settings) -> DashboardStats:
    # ── Aggregate counts ──────────────────────────────────────────────────────
    total_products = db.scalar(select(func.count(Product.id))) or 0
    total_customers = db.scalar(select(func.count(Customer.id))) or 0
    total_orders = db.scalar(select(func.count(Order.id))) or 0

    total_revenue = db.scalar(
        select(func.coalesce(func.sum(Order.total_amount), 0)).where(
            Order.status != OrderStatus.CANCELLED.value
        )
    ) or Decimal("0.00")

    # ── Stock distribution ────────────────────────────────────────────────────
    in_stock = db.scalar(
        select(func.count(Product.id)).where(Product.quantity_in_stock > 20)
    ) or 0
    low_stock_count = db.scalar(
        select(func.count(Product.id)).where(
            Product.quantity_in_stock >= 6,
            Product.quantity_in_stock <= 20,
        )
    ) or 0
    critical_count = db.scalar(
        select(func.count(Product.id)).where(Product.quantity_in_stock <= 5)
    ) or 0

    # ── Order status breakdown ────────────────────────────────────────────────
    status_rows = db.execute(
        select(Order.status, func.count(Order.id)).group_by(Order.status)
    ).all()
    status_map: dict[str, int] = {str(s): c for s, c in status_rows}

    # ── Low-stock product list ────────────────────────────────────────────────
    low_stock_products = list(
        db.execute(
            select(Product)
            .where(Product.quantity_in_stock <= settings.LOW_STOCK_THRESHOLD)
            .order_by(Product.quantity_in_stock.asc())
            .limit(10)
        )
        .scalars()
        .all()
    )

    # ── Recent orders (with customer) ─────────────────────────────────────────
    recent_orders = list(
        db.execute(
            select(Order)
            .options(selectinload(Order.customer))
            .order_by(Order.created_at.desc())
            .limit(5)
        )
        .scalars()
        .all()
    )

    return DashboardStats(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        total_revenue=Decimal(str(total_revenue)),
        stock_status=StockStatusCount(
            in_stock=in_stock,
            low_stock=low_stock_count,
            critical=critical_count,
        ),
        order_status_counts=OrderStatusCounts(
            pending=status_map.get("pending", 0),
            confirmed=status_map.get("confirmed", 0),
            shipped=status_map.get("shipped", 0),
            delivered=status_map.get("delivered", 0),
            cancelled=status_map.get("cancelled", 0),
        ),
        low_stock_products=[ProductRead.model_validate(p) for p in low_stock_products],
        recent_orders=[OrderSummary.model_validate(o) for o in recent_orders],
    )


class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def get_stats(self) -> DashboardStats:
        from ..config import settings

        return get_dashboard_stats(self.db, settings)
