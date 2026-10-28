import { create } from "zustand";
import Cookies from "js-cookie";
import api from "@/lib/axios";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "mitra" | "pengunjung";
  is_active: boolean;
  store_name?: string;
  is_verified?: number | boolean | string;
  rejection_reason?: string;
  avatar_url?: string;
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
  updateUser: (userData: Partial<User>) => void;
  fetchProfile: () => Promise<void>;
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
      Cookies.set("token", token, { expires: 7 });
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
            Cookies.set("token", token, { expires: 7 });
          }
          set({ user, token, isAuthenticated: true });
        } catch (error) {
          console.error("Error parsing stored user data:", error);
          get().logout();
        }
      }
    }
  },

  updateUser: (userData) => {
    set((state) => {
      const currentUser = state.user || ({} as User);
      const updated = { ...currentUser, ...userData } as User;
      if (typeof window !== "undefined") {
        try {
          const existing = localStorage.getItem("user");
          const parsed = existing ? JSON.parse(existing) : {};
          localStorage.setItem("user", JSON.stringify({ ...parsed, ...updated }));
        } catch {}
      }
      return { user: updated };
    });
  },

  fetchProfile: async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;

      const res = await api.get("/auth/profile");
      if (res.data?.success && res.data?.data) {
        const d = res.data.data;
        get().updateUser({
          id: d.id,
          name: d.name,
          email: d.email,
          role: d.role,
          store_name: d.store_name,
          is_verified: d.is_verified,
          rejection_reason: d.rejection_reason,
          avatar_url: d.avatar_url,
        });
      }
    } catch (e) {
      // ignore network errors on background refresh
    }
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
}));
