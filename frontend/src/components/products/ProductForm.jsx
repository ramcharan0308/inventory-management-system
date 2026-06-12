import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "../ui/Modal";
import { required, positiveNumber, nonNegativeInt } from "../../utils/validators";

export function ProductForm({ open, onClose, onSubmit, initialData, isLoading }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: initialData || {} });

  useEffect(() => {
    reset(initialData || { name: "", sku: "", price: "", quantity_in_stock: 0 });
  }, [initialData, reset, open]);

  const isEdit = !!initialData;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Product" : "Add Product"}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">
              Name <span className="form-required">*</span>
            </label>
            <input
              className={`form-input ${errors.name ? "error" : ""}`}
              placeholder="e.g. Wireless Mouse"
              {...register("name", { validate: required() })}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                SKU <span className="form-required">*</span>
              </label>
              <input
                className={`form-input mono ${errors.sku ? "error" : ""}`}
                placeholder="e.g. WMS-001"
                {...register("sku", { validate: required() })}
              />
              {errors.sku && <p className="form-error">{errors.sku.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Price (USD) <span className="form-required">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`form-input ${errors.price ? "error" : ""}`}
                placeholder="0.00"
                {...register("price", { validate: positiveNumber })}
              />
              {errors.price && <p className="form-error">{errors.price.message}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Quantity in Stock <span className="form-required">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="1"
              className={`form-input ${errors.quantity_in_stock ? "error" : ""}`}
              {...register("quantity_in_stock", { validate: nonNegativeInt })}
            />
            {errors.quantity_in_stock && (
              <p className="form-error">{errors.quantity_in_stock.message}</p>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? "Saving…" : isEdit ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
