from __future__ import annotations
from decimal import Decimal
from typing import List
from pydantic import BaseModel
from .product import ProductRead
from .order import OrderSummary


class StockStatusCount(BaseModel):
    in_stock: int    # quantity > 20
    low_stock: int   # 6 – 20
    critical: int    # 0 – 5


class OrderStatusCounts(BaseModel):
    pending: int
    confirmed: int
    shipped: int
    delivered: int
    cancelled: int


class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    total_revenue: Decimal
    stock_status: StockStatusCount
    order_status_counts: OrderStatusCounts
    low_stock_products: List[ProductRead]
    recent_orders: List[OrderSummary]
