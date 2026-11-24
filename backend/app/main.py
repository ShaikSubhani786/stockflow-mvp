import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.core.exceptions import (
    http_exception_handler,
    global_exception_handler
)

from app.api.v1.auth import router as auth_router
from app.api.v1.products import router as product_router
from app.api.v1.dashboard import router as dashboard_router

app = FastAPI(
    title="StockFlow MVP",
    description="A simple multi-tenant SaaS inventory management API",
    version="1.0.0"
)

# CORS configuration
settings_frontend_url = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings_frontend_url,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Exception handlers
app.add_exception_handler(
    HTTPException,
    http_exception_handler
)

app.add_exception_handler(
    Exception,
    global_exception_handler
)


# Authentication routes
app.include_router(
    auth_router,
    prefix="/api/v1"
)
app.include_router(
    product_router,
    prefix="/api/v1"
)
app.include_router(dashboard_router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "message": "Welcome to StockFlow MVP API",
        "status": "running"
    }
