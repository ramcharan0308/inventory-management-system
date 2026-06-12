import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { StockCell } from "./LowStockBadge";

export function ProductTable({ products, onEdit, onDelete }) {
  if (!products?.length) {
    return (
      <div className="empty-state">
        <h3>No products yet</h3>
        <p>Add your first product to get started.</p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Added</th>
            <th style={{ width: 80 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td style={{ fontWeight: 500 }}>{p.name}</td>
              <td className="mono" style={{ color: "var(--color-text-secondary)" }}>
                {p.sku}
              </td>
              <td className="mono">{formatCurrency(p.price)}</td>
              <td>
                <StockCell quantity={p.quantity_in_stock} />
              </td>
              <td style={{ color: "var(--color-text-muted)" }}>{formatDate(p.created_at)}</td>
              <td>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => onEdit(p)}
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => onDelete(p)}
                    title="Delete"
                    style={{ color: "var(--color-danger)" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
