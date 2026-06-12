import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, ResponsiveContainer,
} from "recharts";
import { Package, Users, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react";
import { dashboardService } from "../services/dashboardService";
import { formatCurrency, formatNumber } from "../utils/formatters";
import { Alert } from "../components/ui/Alert";
import { StatusBadge } from "../components/ui/Badge";

function StatCard({ label, value, sub, variant, icon: Icon }) {
  return (
    <div className={`stat-card ${variant}`}>
      {Icon && (
        <div
          className="stat-icon"
          style={{
            background: `var(--color-${variant === "accent" ? "accent" : variant}-muted)`,
            color: `var(--color-${variant === "accent" ? "accent-hover" : variant})`,
          }}
        >
          <Icon size={18} />
        </div>
      )}
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

const CHART_COLORS = {
  accent: "#6366f1",
  success: "#22c55e",
  warning: "#f59e0b",
};

export default function Dashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardService.getStats,
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="page-body">
        <div className="loading-center">
          <div className="spinner" />
          Loading dashboard…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-body">
        <Alert variant="danger">Failed to load dashboard stats.</Alert>
      </div>
    );
  }

  const lowStockProducts = stats?.low_stock_products || [];
  const recentOrders = stats?.recent_orders || [];
  const ordersByDay = stats?.orders_by_day || [];
  const revenueByDay = stats?.revenue_by_day || [];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Real-time overview of your inventory and orders</p>
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* KPI Cards */}
        <div className="stats-grid">
          <StatCard
            label="Total Products"
            value={formatNumber(stats?.total_products)}
            sub={`${stats?.low_stock_count || 0} low stock`}
            variant="accent"
            icon={Package}
          />
          <StatCard
            label="Total Customers"
            value={formatNumber(stats?.total_customers)}
            variant="success"
            icon={Users}
          />
          <StatCard
            label="Orders (30d)"
            value={formatNumber(stats?.orders_last_30_days)}
            sub={`${stats?.pending_orders || 0} pending`}
            variant="warning"
            icon={ShoppingCart}
          />
          <StatCard
            label="Revenue (30d)"
            value={formatCurrency(stats?.revenue_last_30_days)}
            sub="Total order value"
            variant="danger"
            icon={TrendingUp}
          />
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div className="chart-card">
            <div className="chart-header">
              <p className="chart-title">Orders — Last 14 Days</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={ordersByDay}>
                <defs>
                  <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.accent} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} />
                <YAxis tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} />
                <Tooltip
                  contentStyle={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "var(--color-text)" }}
                />
                <Area type="monotone" dataKey="count" stroke={CHART_COLORS.accent} fill="url(#ordersGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <p className="chart-title">Revenue — Last 14 Days</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} />
                <YAxis tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(v) => formatCurrency(v)}
                  contentStyle={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="revenue" fill={CHART_COLORS.success} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low stock alerts + recent orders */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 16 }}>
          {/* Low stock */}
          <div className="table-wrapper">
            <div className="table-toolbar">
              <span style={{ fontWeight: 600, fontSize: "0.875rem", display: "flex", alignItems: "center", gap: 6 }}>
                <AlertTriangle size={15} style={{ color: "var(--color-warning)" }} />
                Low Stock Alerts
              </span>
              <span className="badge badge-warning">{lowStockProducts.length}</span>
            </div>
            {lowStockProducts.length === 0 ? (
              <div className="empty-state" style={{ padding: "32px 24px" }}>
                <p>All products are well stocked.</p>
              </div>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th style={{ textAlign: "right" }}>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 500 }}>{p.name}</td>
                        <td className="mono" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{p.sku}</td>
                        <td style={{ textAlign: "right" }}>
                          <span style={{ color: p.quantity_in_stock === 0 ? "var(--color-danger)" : "var(--color-warning)", fontWeight: 700 }}>
                            {p.quantity_in_stock}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent orders */}
          <div className="table-wrapper">
            <div className="table-toolbar">
              <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>Recent Orders</span>
            </div>
            {recentOrders.length === 0 ? (
              <div className="empty-state" style={{ padding: "32px 24px" }}>
                <p>No orders yet.</p>
              </div>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => (
                      <tr key={o.id}>
                        <td style={{ fontWeight: 500 }}>{o.customer?.full_name || "—"}</td>
                        <td className="mono">{formatCurrency(o.total_amount)}</td>
                        <td><StatusBadge status={o.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
