import { useState } from "react";
import { Plus, Search, RefreshCw } from "lucide-react";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "../hooks/useProducts";
import { ProductTable } from "../components/products/ProductTable";
import { ProductForm } from "../components/products/ProductForm";
import { Modal } from "../components/ui/Modal";

export default function Products() {
  const [search, setSearch] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [page, setPage] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const LIMIT = 20;

  const params = { skip: page * LIMIT, limit: LIMIT, ...(search && { search }), ...(lowStock && { low_stock: true }) };
  const { data, isLoading, refetch } = useProducts(params);

  const createMut = useCreateProduct();
  const updateMut = useUpdateProduct();
  const deleteMut = useDeleteProduct();

  const products = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / LIMIT);

  function handleEdit(product) {
    setEditTarget(product);
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
            <h1 className="page-title">Products</h1>
            <p className="page-subtitle">{total} product{total !== 1 ? "s" : ""} in catalog</p>
          </div>
          <button className="btn btn-primary" onClick={() => setFormOpen(true)}>
            <Plus size={15} /> Add Product
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
                  placeholder="Search products…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", cursor: "pointer", color: "var(--color-text-secondary)" }}>
                <input
                  type="checkbox"
                  checked={lowStock}
                  onChange={(e) => { setLowStock(e.target.checked); setPage(0); }}
                />
                Low stock only
              </label>
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
            <ProductTable products={products} onEdit={handleEdit} onDelete={setDeleteTarget} />
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

      <ProductForm
        open={formOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        initialData={editTarget}
        isLoading={createMut.isPending || updateMut.isPending}
      />

      {/* Delete confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Product">
        <div className="modal-body">
          <p>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</p>
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
