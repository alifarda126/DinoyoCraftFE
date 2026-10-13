import api from "../lib/axios";
import { LoginPayload, RegisterPayload, GoogleAuthPayload, AuthResponse } from "../types/auth";

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", payload);
    return response.data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", payload);
    return response.data;
  },

  googleLogin: async (payload: GoogleAuthPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/google", payload);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
};
