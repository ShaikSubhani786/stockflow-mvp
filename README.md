
# StockFlow – SaaS Inventory Management System

A full-stack, multi-tenant inventory management application built with **FastAPI, React, PostgreSQL, SQLAlchemy, Alembic, and JWT Authentication**.

StockFlow enables organizations to manage products, monitor inventory levels, and track low-stock items through a simple and secure dashboard.

## Project Overview

StockFlow is a scope-reduced SaaS inventory management application designed to demonstrate core multi-tenant architecture and full-stack development.

Each registered user creates an organization. Products are associated with that organization, ensuring that users can access only their own organization's inventory.

The backend is developed using FastAPI and PostgreSQL, while the frontend uses React and Vite.

## Key Features

### Authentication and Organization Management
- User registration with organization creation.
- JWT-based login and authentication.
- Secure password hashing.
- Protected frontend routes and backend endpoints.
- Organization-specific data access.

### Product Management
- Create, view, update, and delete products.
- Product name and SKU management.
- Quantity tracking.
- Cost price and selling price.
- Product-specific low-stock thresholds.
- Product search.
- Organization-specific SKU uniqueness.

### Dashboard
- Total product count.
- Total inventory quantity.
- Low-stock product count.
- Organization-specific inventory statistics.
- Configurable organization-level default low-stock threshold.

### Multi-Tenant Architecture
- Organization creation during registration.
- User-to-organization association.
- Organization-scoped product queries.
- Cross-organization data isolation.
- Database-enforced SKU uniqueness within each organization.

## Technology Stack

### Frontend
- React.js
- Vite
- JavaScript (ES6+)
- HTML5 and CSS3
- React Router
- Fetch API

### Backend
- Python
- FastAPI
- Uvicorn
- Pydantic
- SQLAlchemy
- JWT
- Passlib and bcrypt

### Database
- PostgreSQL
- SQLAlchemy ORM
- Alembic migrations

### Development and Testing
- Git and GitHub
- Swagger UI / OpenAPI
- VS Code
- PowerShell

## Project Architecture

```text
              React Frontend
             (React + Vite)
                    |
                    |
              HTTP / REST API
              JWT Authentication
                    |
                    v
              FastAPI Backend
                    |
          +---------+---------+
          |                   |
          v                   v
    PostgreSQL           Business Logic
    Database             and Validation
          |
          v
    SQLAlchemy ORM
          |
          v
    Alembic Migrations
```

## Application Workflow

1. A user registers with an email, password, and organization name.
2. The backend creates an organization and associates the user with it.
3. The user logs in using their credentials.
4. FastAPI generates a JWT access token.
5. The frontend uses the token for protected API requests.
6. Products are created and managed within the authenticated user's organization.
7. The dashboard calculates inventory statistics using organization-specific data.

## Project Structure

```text
stockflow-mvp/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── dependencies.py
│   │   │   └── v1/
│   │   │       ├── auth.py
│   │   │       ├── products.py
│   │   │       └── dashboard.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── exceptions.py
│   │   │   └── security.py
│   │   │
│   │   ├── crud/
│   │   │   ├── user.py
│   │   │   ├── product.py
│   │   │   └── dashboard.py
│   │   │
│   │   ├── database/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── main.py
│   │
│   ├── alembic/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Products.jsx
│   │   ├── App.jsx
│   │   └── config.js
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## Database Design

StockFlow uses PostgreSQL with SQLAlchemy ORM.

### Organizations

| Field | Description |
|---|---|
| id | Organization identifier |
| name | Organization name |
| default_low_stock_threshold | Default low-stock threshold |

### Users

| Field | Description |
|---|---|
| id | User identifier |
| email | Unique email |
| hashed_password | Hashed password |
| organization_id | Associated organization |
| is_active | Account status |
| created_at | Account creation timestamp |

### Products

| Field | Description |
|---|---|
| id | Product identifier |
| organization_id | Associated organization |
| name | Product name |
| sku | Organization-specific SKU |
| description | Optional description |
| quantity | Available stock |
| cost_price | Optional cost price |
| selling_price | Optional selling price |
| low_stock_threshold | Optional product threshold |
| created_at | Creation timestamp |
| updated_at | Last update timestamp |

### Low-Stock Calculation

A product is considered low stock when:

```text
quantity <= effective_threshold
```

The effective threshold is the product-specific threshold when provided; otherwise, the organization's default threshold is used.

Zero-quantity products are also included in the low-stock count.

## API Endpoints

All endpoints are organized under `/api/v1`.

| Module | Method | Endpoint |
|---|---|---|
| Registration | POST | `/auth/register` |
| Login | POST | `/auth/login` |
| Current User | GET | `/auth/me` |
| Create Product | POST | `/products/` |
| List Products | GET | `/products/` |
| Get Product | GET | `/products/{product_id}` |
| Update Product | PUT | `/products/{product_id}` |
| Delete Product | DELETE | `/products/{product_id}` |
| Dashboard | GET | `/dashboard/` |

Interactive API documentation is available through FastAPI Swagger UI.

## Installation and Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ShaikSubhani786/stockflow-mvp.git
cd stockflow-mvp
```

### 2. Backend Setup

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create a `.env` file inside the backend directory:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME
SECRET_KEY=your_secure_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=http://localhost:5173
```

Create a PostgreSQL database and configure the connection.

Apply database migrations:

```powershell
alembic upgrade head
```

Start the backend:

```powershell
python -m uvicorn app.main:app --reload
```

Backend URL:

http://localhost:8000

Swagger documentation:

http://localhost:8000/docs

### 3. Frontend Setup

Open another terminal:

```powershell
cd frontend
npm install
```

Create a `.env` file inside the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the frontend:

```powershell
npm run dev
```

Frontend URL:

http://localhost:5173

### 4. Production Build

To create a production frontend build:

```powershell
npm run build
```

The generated production files are available in the `frontend/dist` directory.

## Security and Validation

StockFlow implements:

- JWT-based authentication.
- Password hashing.
- Protected API endpoints.
- Protected frontend routes.
- Organization-scoped database queries.
- Organization-specific SKU uniqueness.
- Pydantic request validation.
- Environment-based configuration.
- Cross-organization product access prevention.

## Testing Performed

The following application scenarios have been tested:

| Test | Expected Result |
|---|---|
| User registration | Organization and user created |
| User login | JWT access token returned |
| Product creation | Product created successfully |
| Product update | Product updated successfully |
| Product deletion | Product deleted successfully |
| Duplicate SKU | HTTP 409 Conflict |
| Unauthorized access | HTTP 401 Unauthorized |
| Cross-organization access | HTTP 404 Not Found |
| Dashboard statistics | Organization-specific totals |
| Frontend production build | Successful |

## Scope and Future Enhancements

The current MVP focuses on authentication, organization management, product CRUD, and inventory dashboard statistics.

Potential future enhancements include:

- Organization settings and threshold management UI.
- Staff accounts and role-based permissions.
- Inventory transaction history.
- Supplier management.
- Purchase and sales management.
- CSV import and export.
- Email low-stock notifications.
- Advanced analytics and reporting.
- Automated backend and frontend testing.
- Cloud deployment and CI/CD.

## Author

**Shaik Subhani**

B.Tech – Computer Science

Interested in Python Development, Full Stack Development, Cloud Computing, and DevOps.

### GitHub

https://github.com/ShaikSubhani786

---

If you find this project useful, consider giving the repository a star.
```
