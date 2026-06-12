import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "../services/productService";
import { toast } from "react-toastify";

const KEYS = {
  all: ["products"],
  list: (params) => ["products", "list", params],
  detail: (id) => ["products", id],
};

export function useProducts(params) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => productService.list(params),
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => productService.get(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success("Product created");
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => productService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success("Product updated");
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success("Product deleted");
    },
  });
}
