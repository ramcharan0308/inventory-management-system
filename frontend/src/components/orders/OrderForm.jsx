import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "../ui/Modal";
import { formatCurrency } from "../../utils/formatters";
import { useProducts } from "../../hooks/useProducts";
import { useCustomers } from "../../hooks/useCustomers";
import { required } from "../../utils/validators";

export function OrderForm({ open, onClose, onSubmit, isLoading }) {
  const { data: productsData } = useProducts({ limit: 100 });
  const { data: customersData } = useCustomers({ limit: 100 });

  const products = productsData?.items || [];
  const customers = customersData?.items || [];

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customer_id: "",
      items: [{ product_id: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items");

  useEffect(() => {
    if (!open) reset({ customer_id: "", items: [{ product_id: "", quantity: 1 }] });
  }, [open, reset]);

  const computedTotal = watchedItems.reduce((sum, item) => {
    const prod = products.find((p) => p.id === item.product_id);
    return sum + (prod ? Number(prod.price) * Number(item.quantity || 0) : 0);
  }, 0);

  return (
    <Modal open={open} onClose={onClose} title="Create Order" size="lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="modal-body">
          {/* Customer */}
          <div className="form-group">
            <label className="form-label">
              Customer <span className="form-required">*</span>
            </label>
            <select
              className={`form-input ${errors.customer_id ? "error" : ""}`}
              {...register("customer_id", { validate: required() })}
            >
              <option value="">Select a customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} — {c.email}
                </option>
              ))}
            </select>
            {errors.customer_id && <p className="form-error">{errors.customer_id.message}</p>}
          </div>

          {/* Line items */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <label className="form-label" style={{ marginBottom: 0 }}>
                Order Items <span className="form-required">*</span>
              </label>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => append({ product_id: "", quantity: 1 })}
              >
                <Plus size={13} /> Add Item
              </button>
            </div>

            <div className="order-items-section">
              {/* Header row */}
              <div
                className="order-item-row"
                style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", paddingBottom: 4 }}
              >
                <span>Product</span>
                <span>Qty</span>
                <span>Subtotal</span>
                <span />
              </div>

              {fields.map((field, i) => {
                const selectedProd = products.find((p) => p.id === watchedItems[i]?.product_id);
                const qty = Number(watchedItems[i]?.quantity || 0);
                const subtotal = selectedProd ? selectedProd.price * qty : 0;

                return (
                  <div className="order-item-row" key={field.id}>
                    <select
                      className={`form-input ${errors.items?.[i]?.product_id ? "error" : ""}`}
                      {...register(`items.${i}.product_id`, { validate: required() })}
                    >
                      <option value="">Select product…</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id} disabled={p.quantity_in_stock === 0}>
                          {p.name} ({p.quantity_in_stock} left)
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      className={`form-input ${errors.items?.[i]?.quantity ? "error" : ""}`}
                      {...register(`items.${i}.quantity`, {
                        min: { value: 1, message: "Min 1" },
                        validate: (v) =>
                          !selectedProd ||
                          Number(v) <= selectedProd.quantity_in_stock ||
                          `Max ${selectedProd.quantity_in_stock}`,
                      })}
                    />

                    <span className="mono" style={{ fontSize: "0.8rem" }}>
                      {formatCurrency(subtotal)}
                    </span>

                    <button
                      type="button"
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => remove(i)}
                      disabled={fields.length === 1}
                      style={{ color: "var(--color-danger)" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 12,
              paddingTop: 8,
              borderTop: "1px solid var(--color-border)",
            }}
          >
            <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
              Order Total
            </span>
            <span style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
              {formatCurrency(computedTotal)}
            </span>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? "Placing…" : "Place Order"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
