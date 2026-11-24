
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API_BASE_URL from "../config";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_products: 0,
    total_stock: 0,
    low_stock_products: 0,
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    const fetchDashboardData = async () => {
      try {
        const [userResponse, dashboardResponse] =
          await Promise.all([
            fetch(`${API_BASE_URL}/api/v1/auth/me`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch(`${API_BASE_URL}/api/v1/dashboard/`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        if (
          userResponse.status === 401 ||
          dashboardResponse.status === 401
        ) {
          localStorage.removeItem("access_token");
          navigate("/", { replace: true });
          return;
        }

        const userData = await userResponse.json();
        const dashboardData = await dashboardResponse.json();

        if (!userResponse.ok) {
          throw new Error(
            userData.detail || "Failed to load user information"
          );
        }

        if (!dashboardResponse.ok) {
          throw new Error(
            dashboardData.detail || "Failed to load dashboard"
          );
        }

        setUser(userData);
        setStats(dashboardData);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(err.message || "Unable to connect to backend");
      } finally {
        setLoading(false);
      }
    };

    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/", { replace: true });
  };

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div>
          <h2>StockFlow</h2>

          {user && (
            <div className="sidebar-user">
              <p>{user.email}</p>
              <small>Organization #{user.organization_id}</small>
            </div>
          )}

          <nav>
            <button
              className="active"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>

            <button onClick={() => navigate("/products")}>
              Products
            </button>
          </nav>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      <main className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Overview of your inventory</p>
          </div>

          {user && (
            <div className="user-info">
              <h3>Welcome!</h3>
              <p>{user.email}</p>
              <p>
                Account status:{" "}
                {user.is_active ? "Active" : "Inactive"}
              </p>
            </div>
          )}
        </div>

        {error && (
          <p className="dashboard-error">{error}</p>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Products</h3>
            <p>{stats.total_products}</p>
          </div>

          <div className="stat-card">
            <h3>Total Stock</h3>
            <p>{stats.total_stock}</p>
          </div>

          <div className="stat-card">
            <h3>Low Stock Products</h3>
            <p>{stats.low_stock_products}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
