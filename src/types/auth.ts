export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "mitra" | "pengunjung";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    isNewUser?: boolean;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "mitra" | "pengunjung";
  shop_name?: string;
  address?: string;
  phone?: string;
  year_started?: number;
}

export interface GoogleAuthPayload {
  credential: string;
}
