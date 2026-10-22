import { create } from "zustand";
import Cookies from "js-cookie";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "mitra" | "pengunjung";
  is_active: boolean;
  store_name?: string;
  is_verified?: number | boolean;
  rejection_reason?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  initAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  
  login: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      Cookies.set("token", token, { expires: 1 });
    }
    set({ user, token, isAuthenticated: true });
  },
  
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      Cookies.remove("token");
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  initAuth: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token") || Cookies.get("token");
      const userStr = localStorage.getItem("user");
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          if (!Cookies.get("token")) {
            Cookies.set("token", token, { expires: 1 });
          }
          set({ user, token, isAuthenticated: true });
        } catch (error) {
          console.error("Error parsing stored user data:", error);
          get().logout();
        }
      }
    }
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
}));
