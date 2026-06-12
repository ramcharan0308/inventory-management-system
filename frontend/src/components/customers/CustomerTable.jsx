import { Pencil, Trash2, Mail, Phone } from "lucide-react";
import { formatDate } from "../../utils/formatters";

export function CustomerTable({ customers, onEdit, onDelete }) {
  if (!customers?.length) {
    return (
      <div className="empty-state">
        <h3>No customers yet</h3>
        <p>Add your first customer to start taking orders.</p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Added</th>
            <th style={{ width: 80 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td style={{ fontWeight: 500 }}>{c.full_name}</td>
              <td>
                <a
                  href={`mailto:${c.email}`}
                  style={{ color: "var(--color-accent-hover)", display: "flex", alignItems: "center", gap: 4 }}
                >
                  <Mail size={13} />
                  {c.email}
                </a>
              </td>
              <td style={{ color: "var(--color-text-secondary)" }}>
                {c.phone_number ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Phone size={13} />
                    {c.phone_number}
                  </span>
                ) : (
                  <span style={{ color: "var(--color-text-muted)" }}>—</span>
                )}
              </td>
              <td style={{ color: "var(--color-text-muted)" }}>{formatDate(c.created_at)}</td>
              <td>
                <div style={{ display: "flex", gap: 4 }}>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onEdit(c)} title="Edit">
                    <Pencil size={14} />
                  </button>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => onDelete(c)}
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
