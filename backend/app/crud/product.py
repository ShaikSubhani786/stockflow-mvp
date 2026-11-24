
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


def create_product(
    db: Session,
    product: ProductCreate,
    organization_id: int
):
    product_data = product.model_dump()

    db_product = Product(
        **product_data,
        organization_id=organization_id
    )

    try:
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product

    except IntegrityError as exc:
        db.rollback()
        print("PRODUCT DATABASE ERROR:", exc.orig)

        raise ValueError(
            "Product creation failed due to a database constraint"
        )


def get_products(
    db: Session,
    organization_id: int,
    search: str | None = None,
    skip: int = 0,
    limit: int = 10
):
    query = db.query(Product).filter(
        Product.organization_id == organization_id
    )

    if search:
        query = query.filter(
            Product.name.ilike(f"%{search}%")
        )

    total = query.count()

    products = (
        query
        .order_by(Product.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "items": products
    }


def get_product(
    db: Session,
    product_id: int,
    organization_id: int
):
    return (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.organization_id == organization_id
        )
        .first()
    )


def update_product(
    db: Session,
    product_id: int,
    product: ProductUpdate,
    organization_id: int
):
    db_product = get_product(
        db,
        product_id,
        organization_id
    )

    if not db_product:
        return None

    update_data = product.model_dump(exclude_unset=True)

    for field in ("name", "sku", "quantity"):
        if field in update_data and update_data[field] is None:
            raise ValueError(f"{field} cannot be null")

    for key, value in update_data.items():
        setattr(db_product, key, value)

    try:
        db.commit()
        db.refresh(db_product)
        return db_product

    except IntegrityError as exc:
        db.rollback()
        print("PRODUCT UPDATE DATABASE ERROR:", exc.orig)

        raise ValueError(
            "Product update failed due to a database constraint"
        )


def delete_product(
    db: Session,
    product_id: int,
    organization_id: int
):
    db_product = get_product(
        db,
        product_id,
        organization_id
    )

    if not db_product:
        return None

    db.delete(db_product)
    db.commit()

    return db_product
