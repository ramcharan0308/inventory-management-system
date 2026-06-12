import { useState } from "react";
import { Plus, Search, RefreshCw } from "lucide-react";
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from "../hooks/useCustomers";
import { CustomerTable } from "../components/customers/CustomerTable";
import { CustomerForm } from "../components/customers/CustomerForm";
import { Modal } from "../components/ui/Modal";

export default function Customers() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const LIMIT = 20;

  const params = { skip: page * LIMIT, limit: LIMIT, ...(search && { search }) };
  const { data, isLoading, refetch } = useCustomers(params);

  const createMut = useCreateCustomer();
  const updateMut = useUpdateCustomer();
  const deleteMut = useDeleteCustomer();

  const customers = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / LIMIT);

  function handleEdit(customer) {
    setEditTarget(customer);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditTarget(null);
  }

  async function handleSubmit(values) {
    if (editTarget) {
      await updateMut.mutateAsync({ id: editTarget.id, data: values });
    } else {
      await createMut.mutateAsync(values);
    }
    closeForm();
  }

  async function confirmDelete() {
    await deleteMut.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">Customers</h1>
            <p className="page-subtitle">{total} registered customer{total !== 1 ? "s" : ""}</p>
          </div>
          <button className="btn btn-primary" onClick={() => setFormOpen(true)}>
            <Plus size={15} /> Add Customer
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="table-wrapper">
          <div className="table-toolbar">
            <div className="table-toolbar-left">
              <div className="search-input-wrapper">
                <Search size={14} />
                <input
                  className="form-input search-input"
                  placeholder="Search customers…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                />
              </div>
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
            <CustomerTable customers={customers} onEdit={handleEdit} onDelete={setDeleteTarget} />
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

      <CustomerForm
        open={formOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        initialData={editTarget}
        isLoading={createMut.isPending || updateMut.isPending}
      />

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Customer">
        <div className="modal-body">
          <p>Delete <strong>{deleteTarget?.full_name}</strong>? This will fail if they have existing orders.</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={confirmDelete} disabled={deleteMut.isPending}>
            {deleteMut.isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
