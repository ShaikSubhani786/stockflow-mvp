







from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.product import Product
from app.models.organization import Organization


def get_dashboard_stats(db: Session, organization_id: int):
    # Get the organization
    organization = (
        db.query(Organization)
        .filter(Organization.id == organization_id)
        .first()
    )

    if not organization:
        raise ValueError("Organization not found")

    # Get organization's default low-stock threshold
    default_threshold = organization.default_low_stock_threshold

    # Total number of products
    total_products = (
        db.query(func.count(Product.id))
        .filter(Product.organization_id == organization_id)
        .scalar()
        or 0
    )

    # Total quantity of all products
    total_stock = (
        db.query(func.coalesce(func.sum(Product.quantity), 0))
        .filter(Product.organization_id == organization_id)
        .scalar()
        or 0
    )

    # Count low-stock products
    # Includes products with quantity = 0
    low_stock_products = (
        db.query(func.count(Product.id))
        .filter(
            Product.organization_id == organization_id,
            Product.quantity <= func.coalesce(
                Product.low_stock_threshold,
                default_threshold
            )
        )
        .scalar()
        or 0
    )

    return {
        "total_products": total_products,
        "total_stock": total_stock,
        "low_stock_products": low_stock_products
    }


