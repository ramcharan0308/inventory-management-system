import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { LayoutDashboard, Package, Users, ShoppingCart } from "lucide-react";
import { NotificationProvider } from "./context/NotificationContext";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import "react-toastify/dist/ReactToastify.css";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/products", label: "Products", icon: Package },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Package size={17} color="white" />
        </div>
        <div>
          <h1>Inventory</h1>
          <span>Management System</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-label">Navigation</span>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div
        style={{
          padding: "12px 20px",
          borderTop: "1px solid var(--color-border)",
          fontSize: "0.7rem",
          color: "var(--color-text-muted)",
        }}
      >
        v1.0.0 · Production Ready
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        <ToastContainer
          position="bottom-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          theme="dark"
          toastStyle={{
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
            fontSize: "0.875rem",
          }}
        />
      </NotificationProvider>
    </BrowserRouter>
  );
}
