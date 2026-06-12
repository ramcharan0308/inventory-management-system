import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService } from "../services/customerService";
import { toast } from "react-toastify";

const KEYS = {
  all: ["customers"],
  list: (params) => ["customers", "list", params],
  detail: (id) => ["customers", id],
};

export function useCustomers(params) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => customerService.list(params),
  });
}

export function useCustomer(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => customerService.get(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: customerService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success("Customer created");
    },
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => customerService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success("Customer updated");
    },
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: customerService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success("Customer deleted");
    },
  });
}
