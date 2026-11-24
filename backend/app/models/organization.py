
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database.base import Base


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)

    default_low_stock_threshold = Column(
        Integer,
        nullable=False,
        default=5
    )

    users = relationship("User", back_populates="organization")
    products = relationship("Product", back_populates="organization")
