import api from "../lib/axios";
import { PaginatedResponse } from "../types/api";

// Skeleton struktur, bisa disesuaikan dengan skema produk nanti
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
}

export const productService = {
  getAll: async (params?: any): Promise<PaginatedResponse<Product>> => {
    const response = await api.get("/products", { params });
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },

  create: async (data: any) => {
    const response = await api.post("/products", data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};
