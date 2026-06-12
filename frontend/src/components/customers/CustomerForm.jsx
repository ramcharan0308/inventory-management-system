import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "../ui/Modal";
import { required, email as validateEmail } from "../../utils/validators";

export function CustomerForm({ open, onClose, onSubmit, initialData, isLoading }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    reset(initialData || { full_name: "", email: "", phone_number: "" });
  }, [initialData, reset, open]);

  const isEdit = !!initialData;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Customer" : "Add Customer"}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">
              Full Name <span className="form-required">*</span>
            </label>
            <input
              className={`form-input ${errors.full_name ? "error" : ""}`}
              placeholder="e.g. Jane Doe"
              {...register("full_name", { validate: required() })}
            />
            {errors.full_name && <p className="form-error">{errors.full_name.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Email <span className="form-required">*</span>
            </label>
            <input
              type="email"
              className={`form-input ${errors.email ? "error" : ""}`}
              placeholder="jane@example.com"
              {...register("email", { validate: validateEmail })}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              className="form-input"
              placeholder="+1 (555) 000-0000"
              {...register("phone_number")}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? "Saving…" : isEdit ? "Save Changes" : "Add Customer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
