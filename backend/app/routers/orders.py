from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas.order import OrderCreate, OrderRead, OrderStatusUpdate
from app.schemas.common import PaginatedResponse
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("", response_model=PaginatedResponse[OrderRead])
def list_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    customer_id: Optional[UUID] = Query(None),
    db: Session = Depends(get_db),
):
    service = OrderService(db)
    items, total = service.list_orders(skip=skip, limit=limit, status=status, customer_id=customer_id)
    return PaginatedResponse(items=items, total=total, skip=skip, limit=limit)


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    service = OrderService(db)
    return service.create_order(payload)


@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: UUID, db: Session = Depends(get_db)):
    service = OrderService(db)
    order = service.get_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/{order_id}/status", response_model=OrderRead)
def update_order_status(order_id: UUID, payload: OrderStatusUpdate, db: Session = Depends(get_db)):
    service = OrderService(db)
    order = service.update_order_status(order_id, payload.status)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_order(order_id: UUID, db: Session = Depends(get_db)):
    service = OrderService(db)
    cancelled = service.cancel_order(order_id)
    if not cancelled:
        raise HTTPException(status_code=404, detail="Order not found")
