import { useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { useOrders, useCreateOrder, useCancelOrder } from "../hooks/useOrders";
import { OrderTable } from "../components/orders/OrderTable";
import { OrderForm } from "../components/orders/OrderForm";
import { OrderDetail } from "../components/orders/OrderDetail";
import { Modal } from "../components/ui/Modal";

const STATUS_OPTIONS = ["", "pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const LIMIT = 20;

  const params = { skip: page * LIMIT, limit: LIMIT, ...(statusFilter && { status: statusFilter }) };
  const { data, isLoading, refetch } = useOrders(params);
  const createMut = useCreateOrder();
  const cancelMut = useCancelOrder();

  const orders = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / LIMIT);

  async function handleCreate(values) {
    await createMut.mutateAsync(values);
    setCreateOpen(false);
  }

  async function confirmCancel() {
    await cancelMut.mutateAsync(cancelTarget.id);
    setCancelTarget(null);
    if (viewOrder?.id === cancelTarget.id) setViewOrder(null);
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">Orders</h1>
            <p className="page-subtitle">{total} total order{total !== 1 ? "s" : ""}</p>
          </div>
          <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
            <Plus size={15} /> New Order
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="table-wrapper">
          <div className="table-toolbar">
            <div className="table-toolbar-left">
              <select
                className="form-input"
                style={{ width: "auto" }}
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} style={{ background: "var(--color-surface)" }}>
                    {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All Statuses"}
                  </option>
                ))}
              </select>
            </div>
            <div className="table-toolbar-right">
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => refetch()} title="Refresh">
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            <OrderTable orders={orders} onView={setViewOrder} onCancel={setCancelTarget} />
          )}

          {totalPages > 1 && (
            <div className="table-footer">
              <span>Showing {page * LIMIT + 1}–{Math.min((page + 1) * LIMIT, total)} of {total}</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                  Previous
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <OrderForm
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        isLoading={createMut.isPending}
      />

      <OrderDetail
        open={!!viewOrder}
        onClose={() => setViewOrder(null)}
        order={viewOrder}
        onCancel={() => setCancelTarget(viewOrder)}
      />

      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel Order">
        <div className="modal-body">
          <p>
            Cancel order <span className="mono">{cancelTarget?.id?.slice(0, 8)}…</span>?
            Stock for all line items will be restored.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setCancelTarget(null)}>Keep Order</button>
          <button className="btn btn-danger" onClick={confirmCancel} disabled={cancelMut.isPending}>
            {cancelMut.isPending ? "Cancelling…" : "Cancel Order"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
