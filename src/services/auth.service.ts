import api from "../lib/axios";
import { LoginPayload, AuthResponse } from "../types/auth";

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", payload);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  logout: async () => {
    // Backend mungkin butuh endpoint logout jika menyimpan invalid token list
    const response = await api.post("/auth/logout");
    return response.data;
  },
};
