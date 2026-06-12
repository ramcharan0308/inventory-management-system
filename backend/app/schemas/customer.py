from __future__ import annotations
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, EmailStr


class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255, examples=["Jane Smith"])
    email: EmailStr = Field(..., examples=["jane@example.com"])
    phone_number: str | None = Field(None, max_length=50, examples=["+1-555-0100"])


class CustomerCreate(CustomerBase):
    pass


class CustomerRead(CustomerBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CustomerSummary(BaseModel):
    """Lightweight view used inside OrderRead."""

    id: UUID
    full_name: str
    email: str

    model_config = ConfigDict(from_attributes=True)
