from __future__ import annotations
from uuid import UUID
from decimal import Decimal
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field, computed_field
from ..models.order import OrderStatus
from .product import ProductSummary
from .customer import CustomerSummary


# ── Create schemas ────────────────────────────────────────────────────────────

class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(..., gt=0, examples=[2])


class OrderCreate(BaseModel):
    customer_id: UUID
    items: List[OrderItemCreate] = Field(..., min_length=1)


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


# ── Read schemas ──────────────────────────────────────────────────────────────

class OrderItemRead(BaseModel):
    id: UUID
    product_id: UUID
    quantity: int
    unit_price: Decimal
    product: Optional[ProductSummary] = None

    @computed_field
    @property
    def subtotal(self) -> Decimal:
        return self.unit_price * self.quantity

    model_config = ConfigDict(from_attributes=True)


class OrderRead(BaseModel):
    id: UUID
    customer_id: UUID
    customer: Optional[CustomerSummary] = None
    total_amount: Decimal
    status: OrderStatus
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemRead] = []

    model_config = ConfigDict(from_attributes=True)


class OrderSummary(BaseModel):
    """Used in dashboard recent-orders list (no items array)."""

    id: UUID
    customer_id: UUID
    customer: Optional[CustomerSummary] = None
    total_amount: Decimal
    status: OrderStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
