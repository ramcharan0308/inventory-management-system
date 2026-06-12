import { Modal } from "../ui/Modal";
import { StatusBadge } from "../ui/Badge";
import { formatCurrency, formatDatetime } from "../../utils/formatters";

export function OrderDetail({ open, onClose, order, onCancel }) {
  if (!order) return null;

  return (
    <Modal open={open} onClose={onClose} title="Order Details" size="lg">
      <div className="modal-body">
        {/* Header info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="card" style={{ padding: 14 }}>
            <p className="card-title">Order ID</p>
            <p className="mono" style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
              {order.id}
            </p>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <p className="card-title">Status</p>
            <StatusBadge status={order.status} />
          </div>
          <div className="card" style={{ padding: 14 }}>
            <p className="card-title">Customer</p>
            <p style={{ fontWeight: 600 }}>{order.customer?.full_name}</p>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
              {order.customer?.email}
            </p>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <p className="card-title">Placed At</p>
            <p style={{ fontSize: "0.875rem" }}>{formatDatetime(order.created_at)}</p>
          </div>
        </div>

        {/* Items table */}
        <div>
          <p className="card-title" style={{ marginBottom: 10 }}>
            Line Items
          </p>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Unit Price</th>
                  <th>Qty</th>
                  <th style={{ textAlign: "right" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product?.name || item.product_id}</td>
                    <td className="mono">{formatCurrency(item.unit_price)}</td>
                    <td>{item.quantity}</td>
                    <td className="mono" style={{ textAlign: "right" }}>
                      {formatCurrency(Number(item.unit_price) * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 16,
            paddingTop: 8,
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <span style={{ color: "var(--color-text-muted)" }}>Total</span>
          <span style={{ fontSize: "1.25rem", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
            {formatCurrency(order.total_amount)}
          </span>
        </div>
      </div>

      <div className="modal-footer">
        {order.status !== "cancelled" && onCancel && (
          <button className="btn btn-danger" onClick={onCancel} style={{ marginRight: "auto" }}>
            Cancel Order
          </button>
        )}
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}
