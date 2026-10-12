export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "mitra";
  token?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}
