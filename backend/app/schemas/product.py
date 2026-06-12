from __future__ import annotations
from uuid import UUID
from decimal import Decimal
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, examples=["Wireless Keyboard"])
    sku: str = Field(..., min_length=1, max_length=100, examples=["WK-001"])
    price: Decimal = Field(..., gt=0, decimal_places=2, examples=[49.99])
    quantity_in_stock: int = Field(..., ge=0, examples=[100])


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    quantity_in_stock: Optional[int] = Field(None, ge=0)


class ProductRead(ProductBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductSummary(BaseModel):
    """Lightweight view used inside OrderItemRead."""

    id: UUID
    name: str
    sku: str

    model_config = ConfigDict(from_attributes=True)
