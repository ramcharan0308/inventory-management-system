import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// Response interceptor – surface backend errors as toasts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;
    const msg =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
        ? detail.map((e) => e.msg).join("; ")
        : error.message || "An unexpected error occurred";

    if (status !== 422) {
      toast.error(msg, { toastId: msg });
    }
    return Promise.reject(error);
  }
);

export default api;
