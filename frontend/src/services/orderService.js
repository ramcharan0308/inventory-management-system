import api from "./api";

export const orderService = {
  list: (params) => api.get("/orders", { params }).then((r) => r.data),
  get: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  create: (data) => api.post("/orders", data).then((r) => r.data),
  updateStatus: (id, status) =>
    api.patch(`/orders/${id}/status`, { status }).then((r) => r.data),
  cancel: (id) => api.delete(`/orders/${id}`),
};
