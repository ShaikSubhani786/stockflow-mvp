
from pydantic import BaseModel


class DashboardResponse(BaseModel):
    total_products: int
    total_stock: int
    low_stock_products: int
