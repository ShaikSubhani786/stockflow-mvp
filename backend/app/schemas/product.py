
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


# Used when creating a product
class ProductCreate(BaseModel):

    name: str = Field(min_length=2, max_length=150)
    sku: str = Field(min_length=1, max_length=100)

    description: str | None = None

    quantity: int = Field(default=0, ge=0)

    cost_price: Decimal | None = Field(
        default=None,
        ge=0
    )

    selling_price: Decimal | None = Field(
        default=None,
        ge=0
    )

    low_stock_threshold: int | None = Field(
        default=None,
        ge=0
    )


# Used when updating a product
class ProductUpdate(BaseModel):

    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150
    )

    sku: str | None = Field(
        default=None,
        min_length=1,
        max_length=100
    )

    description: str | None = None

    quantity: int | None = Field(
        default=None,
        ge=0
    )

    cost_price: Decimal | None = Field(
        default=None,
        ge=0
    )

    selling_price: Decimal | None = Field(
        default=None,
        ge=0
    )

    low_stock_threshold: int | None = Field(
        default=None,
        ge=0
    )


# Returned when a product is requested
class ProductResponse(BaseModel):

    id: int
    organization_id: int

    name: str
    sku: str
    description: str | None

    quantity: int

    cost_price: Decimal | None
    selling_price: Decimal | None

    low_stock_threshold: int | None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Returned when listing products
class ProductListResponse(BaseModel):

    total: int
    items: list[ProductResponse]
