import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const mitraService = {
    getDashboard: async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await axios.get(`${API_BASE_URL}/mitra/dashboard`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true,
        });
        return response.data;
    },

    getProfile: async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true,
        });
        return response.data;
    },

    updateProfile: async (formData: FormData) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await axios.put(`${API_BASE_URL}/auth/profile`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
};