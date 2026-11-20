import api from "../lib/axios";
import { PaginatedResponse } from "../types/api";

export interface Transaction {
  id: string;
  storeName: string;
  buyerName: string;
  date: string;
  amount: number;
  status: "pending" | "completed" | "cancelled";
}

export const transactionService = {
  getAll: async (params?: any): Promise<PaginatedResponse<Transaction>> => {
    const response = await api.get("/admin/transactions", { params });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/admin/dashboard-stats");
    return response.data;
  },
};
