
"""add organizations and organization scoped products

Revision ID: 0ea5b41603e8
Revises: fe88bc499699
"""

from alembic import op
import sqlalchemy as sa


revision = "0ea5b41603e8"
down_revision = "fe88bc499699"
branch_labels = None
depends_on = None


def upgrade() -> None:

    # Create organizations table
    op.create_table(
        "organizations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column(
            "default_low_stock_threshold",
            sa.Integer(),
            nullable=False,
            server_default="5"
        ),
    )

    # Add organization to users
    op.add_column(
        "users",
        sa.Column("organization_id", sa.Integer(), nullable=True)
    )

    # Add organization to products
    op.add_column(
        "products",
        sa.Column("organization_id", sa.Integer(), nullable=True)
    )

    # Create foreign keys
    op.create_foreign_key(
        "fk_users_organization",
        "users",
        "organizations",
        ["organization_id"],
        ["id"]
    )

    op.create_foreign_key(
        "fk_products_organization",
        "products",
        "organizations",
        ["organization_id"],
        ["id"]
    )

    # Make organization IDs mandatory
    op.alter_column(
        "users",
        "organization_id",
        existing_type=sa.Integer(),
        nullable=False
    )

    op.alter_column(
        "products",
        "organization_id",
        existing_type=sa.Integer(),
        nullable=False
    )

    # Remove old product constraints
    op.drop_constraint(
        "products_sku_key",
        "products",
        type_="unique"
    )

    op.drop_constraint(
        "products_barcode_key",
        "products",
        type_="unique"
    )

    # Add organization-specific SKU uniqueness
    op.create_unique_constraint(
        "uq_product_organization_sku",
        "products",
        ["organization_id", "sku"]
    )

    op.create_index(
        "ix_products_organization_id",
        "products",
        ["organization_id"]
    )

    # Remove old category relationship
    op.drop_constraint(
        "products_category_id_fkey",
        "products",
        type_="foreignkey"
    )

    # Remove unnecessary legacy product columns
    op.drop_column("products", "category_id")
    op.drop_column("products", "barcode")
    op.drop_column("products", "image_url")
    op.drop_column("products", "price")
    op.drop_column("products", "minimum_stock")

    # Add new StockFlow product fields
    op.add_column(
        "products",
        sa.Column("cost_price", sa.Numeric(10, 2), nullable=True)
    )

    op.add_column(
        "products",
        sa.Column("selling_price", sa.Numeric(10, 2), nullable=True)
    )

    op.add_column(
        "products",
        sa.Column("low_stock_threshold", sa.Integer(), nullable=True)
    )

    op.add_column(
        "products",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now()
        )
    )

    # Remove old user fields
    op.drop_constraint(
        "users_username_key",
        "users",
        type_="unique"
    )

    op.drop_column("users", "username")
    op.drop_column("users", "role")

    # User belongs to one organization in this MVP
    op.create_unique_constraint(
        "uq_users_organization",
        "users",
        ["organization_id"]
    )


def downgrade() -> None:
    raise NotImplementedError(
        "This MVP migration is not reversible automatically."
    )
