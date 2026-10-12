import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk menyisipkan token pada setiap request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token"); // Atau bisa ambil dari Zustand
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk menangani error respons dari server
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token tidak valid atau kedaluwarsa -> otomatis logout
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        // Gunakan event atau redirect ke login
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
