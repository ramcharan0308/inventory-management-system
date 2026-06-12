import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../services/orderService";
import { toast } from "react-toastify";

const KEYS = {
  all: ["orders"],
  list: (params) => ["orders", "list", params],
  detail: (id) => ["orders", id],
};

export function useOrders(params) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => orderService.list(params),
  });
}

export function useOrder(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => orderService.get(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: orderService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Order placed");
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => orderService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success("Status updated");
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: orderService.cancel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Order cancelled");
    },
  });
}
