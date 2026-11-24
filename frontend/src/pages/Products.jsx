
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import API_BASE_URL from "../config";
import "./Products.css";

function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const limit = 5;
  const token = localStorage.getItem("access_token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    description: "",
    quantity: 0,
    cost_price: "",
    selling_price: "",
    low_stock_threshold: "",
  });

  const totalPages = Math.ceil(total / limit);

  const fetchProducts = useCallback(async () => {
    if (!token) {
      navigate("/");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        skip: String((page - 1) * limit),
        limit: String(limit),
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/products/?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/");
        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load products");
      }

      setProducts(data.items || []);
      setTotal(data.total || 0);
      setError("");
    } catch (err) {
      console.error("Product fetch error:", err);
      setError(err.message || "Unable to connect to backend");
    } finally {
      setLoading(false);
    }
  }, [token, navigate, page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const resetForm = () => {
    setForm({
      name: "",
      sku: "",
      description: "",
      quantity: 0,
      cost_price: "",
      selling_price: "",
      low_stock_threshold: "",
    });

    setEditingProduct(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description.trim() || null,
      quantity: Number(form.quantity),
      cost_price:
        form.cost_price === ""
          ? null
          : Number(form.cost_price),
      selling_price:
        form.selling_price === ""
          ? null
          : Number(form.selling_price),
      low_stock_threshold:
        form.low_stock_threshold === ""
          ? null
          : Number(form.low_stock_threshold),
    };

    try {
      const isEditing = Boolean(editingProduct);

      const response = await fetch(
        isEditing
          ? `${API_BASE_URL}/api/v1/products/${editingProduct.id}`
          : `${API_BASE_URL}/api/v1/products/`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/");
        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || "Product operation failed");
      }

      setMessage(
        isEditing
          ? "Product updated successfully"
          : "Product created successfully"
      );

      setError("");
      resetForm();

      if (page !== 1) {
        setPage(1);
      } else {
        await fetchProducts();
      }
    } catch (err) {
      console.error("Product save error:", err);
      setError(err.message || "Unable to save product");
      setMessage("");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      sku: product.sku || "",
      description: product.description || "",
      quantity: product.quantity ?? 0,
      cost_price: product.cost_price ?? "",
      selling_price: product.selling_price ?? "",
      low_stock_threshold: product.low_stock_threshold ?? "",
    });

    setShowForm(true);
    setError("");
    setMessage("");
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to delete product");
      }

      setMessage("Product deleted successfully");
      setError("");

      await fetchProducts();
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message || "Unable to delete product");
      setMessage("");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    navigate("/");
  };

  return (
    <div className="products-page">
      <header className="products-header">
        <div>
          <h1>Products</h1>
          <p>Manage your inventory products</p>
        </div>

        <div className="products-header-buttons">
          <button
            className="add-product-button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            + Add Product
          </button>

          <button
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>

          <button
            className="back-button"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      {message && (
        <p className="products-success">{message}</p>
      )}

      {error && (
        <p className="products-error">{error}</p>
      )}

      {showForm && (
        <form className="add-product-form" onSubmit={handleSubmit}>
          <h2>
            {editingProduct ? "Edit Product" : "Add Product"}
          </h2>

          <div className="product-form-grid">
            <input
              name="name"
              placeholder="Product Name"
              value={form.name}
              onChange={handleChange}
              minLength={2}
              maxLength={150}
              required
            />

            <input
              name="sku"
              placeholder="SKU"
              value={form.sku}
              onChange={handleChange}
              maxLength={100}
              required
            />

            <input
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
            />

            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              min="0"
              value={form.quantity}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="cost_price"
              placeholder="Cost Price"
              min="0"
              step="0.01"
              value={form.cost_price}
              onChange={handleChange}
            />

            <input
              type="number"
              name="selling_price"
              placeholder="Selling Price"
              min="0"
              step="0.01"
              value={form.selling_price}
              onChange={handleChange}
            />

            <input
              type="number"
              name="low_stock_threshold"
              placeholder="Low Stock Threshold (optional)"
              min="0"
              value={form.low_stock_threshold}
              onChange={handleChange}
            />
          </div>

          <div className="product-form-actions">
            <button type="submit" className="save-product-button">
              {editingProduct ? "Update Product" : "Create Product"}
            </button>

            <button
              type="button"
              className="cancel-edit-button"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <form className="product-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search products by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button type="submit">Search</button>
      </form>

      <p>
        Total Products: <strong>{total}</strong>
      </p>

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>SKU</th>
              <th>Quantity</th>
              <th>Cost Price</th>
              <th>Selling Price</th>
              <th>Low Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9">Loading products...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="9">No products found</td>
              </tr>
            ) : (
              products.map((product) => {
                const threshold =
                  product.low_stock_threshold ?? 5;

                const isLowStock =
                  product.quantity <= threshold;

                return (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>{product.quantity}</td>
                    <td>
                      {product.cost_price ?? "-"}
                    </td>
                    <td>
                      {product.selling_price ?? "-"}
                    </td>
                    <td>{threshold}</td>
                    <td>
                      {product.quantity === 0
                        ? "Out of stock"
                        : isLowStock
                          ? "Low stock"
                          : "In stock"}
                    </td>
                    <td>
                      <div className="product-actions">
                        <button
                          className="edit-product-button"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-product-button"
                          onClick={() => handleDelete(product.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          disabled={page <= 1}
          onClick={() => setPage((previous) => previous - 1)}
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages || 1}
        </span>

        <button
          disabled={page >= totalPages || totalPages === 0}
          onClick={() => setPage((previous) => previous + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Products;
