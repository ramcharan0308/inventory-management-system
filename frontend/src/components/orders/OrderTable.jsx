import { Eye, Trash2 } from "lucide-react";
import { StatusBadge } from "../ui/Badge";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { useUpdateOrderStatus } from "../../hooks/useOrders";

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export function OrderTable({ orders, onView, onCancel }) {
  const updateStatus = useUpdateOrderStatus();

  if (!orders?.length) {
    return (
      <div className="empty-state">
        <h3>No orders yet</h3>
        <p>Create your first order to see it here.</p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th style={{ width: 90 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="mono" style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
                {o.id.slice(0, 8)}…
              </td>
              <td style={{ fontWeight: 500 }}>{o.customer?.full_name || "—"}</td>
              <td style={{ color: "var(--color-text-secondary)" }}>{o.items?.length ?? 0} item{o.items?.length !== 1 ? "s" : ""}</td>
              <td className="mono">{formatCurrency(o.total_amount)}</td>
              <td>
                <select
                  value={o.status}
                  onChange={(e) =>
                    updateStatus.mutate({ id: o.id, status: e.target.value })
                  }
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    font: "inherit",
                    padding: 0,
                    color: "inherit",
                  }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} style={{ background: "var(--color-surface)" }}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
              <td style={{ color: "var(--color-text-muted)" }}>{formatDate(o.created_at)}</td>
              <td>
                <div style={{ display: "flex", gap: 4 }}>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onView(o)} title="View details">
                    <Eye size={14} />
                  </button>
                  {o.status !== "cancelled" && (
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => onCancel(o)}
                      title="Cancel order"
                      style={{ color: "var(--color-danger)" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
