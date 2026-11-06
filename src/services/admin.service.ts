import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper untuk mengambil token dari cookie (prioritas) atau localStorage
export const getToken = () => {
    if (typeof window !== 'undefined') {
        const token = Cookies.get('token') || localStorage.getItem('token');
        return token;
    }
    return null;
};

const authHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const adminService = {
    getVerifikasiList: async () => {
        const response = await axios.get(`${API_BASE_URL}/admin/verifikasi`, {
            headers: authHeaders(),
            withCredentials: true,
        });
        return response.data;
    },

    getDashboardStats: async () => {
        const response = await axios.get(`${API_BASE_URL}/admin/dashboard-stats`, {
            headers: authHeaders(),
            withCredentials: true,
        });
        return response.data;
    },

    verifyStore: async (id: number, status: 'approved' | 'rejected', reason?: string) => {
        const response = await axios.patch(
            `${API_BASE_URL}/admin/verifikasi/${id}`,
            { status, reason },
            { headers: authHeaders(), withCredentials: true }
        );
        return response.data;
    },

    updateStoreStatus: async (id: number, is_active: boolean) => {
        const response = await axios.patch(
            `${API_BASE_URL}/admin/stores/${id}/status`,
            { is_active },
            { headers: authHeaders(), withCredentials: true }
        );
        return response.data;
    },

    deleteStore: async (id: number) => {
        const response = await axios.delete(`${API_BASE_URL}/admin/stores/${id}`, {
            headers: authHeaders(),
            withCredentials: true,
        });
        return response.data;
    },

    getTransactions: async () => {
        const response = await axios.get(`${API_BASE_URL}/admin/transactions`, {
            headers: authHeaders(),
            withCredentials: true,
        });
        return response.data;
    },

    getUsers: async (page = 1, limit = 100) => {
        const response = await axios.get(`${API_BASE_URL}/admin/users?page=${page}&limit=${limit}`, {
            headers: authHeaders(),
            withCredentials: true,
        });
        return response.data;
    },

    createUser: async (payload: { name: string; email: string; role: string; password?: string; store_name?: string }) => {
        const response = await axios.post(`${API_BASE_URL}/admin/users`, payload, {
            headers: authHeaders(),
            withCredentials: true,
        });
        return response.data;
    },

    updateUser: async (id: number, payload: { name?: string; email?: string; role?: string; is_active?: boolean; store_name?: string }) => {
        const response = await axios.put(`${API_BASE_URL}/admin/users/${id}`, payload, {
            headers: authHeaders(),
            withCredentials: true,
        });
        return response.data;
    },

    updateUserStatus: async (id: number, is_active: boolean) => {
        const response = await axios.patch(
            `${API_BASE_URL}/admin/users/${id}/status`,
            { is_active },
            { headers: authHeaders(), withCredentials: true }
        );
        return response.data;
    },

    deleteUser: async (id: number) => {
        const response = await axios.delete(`${API_BASE_URL}/admin/users/${id}`, {
            headers: authHeaders(),
            withCredentials: true,
        });
        return response.data;
    },

    getCategories: async () => {
        const response = await axios.get(`${API_BASE_URL}/admin/categories`, {
            headers: authHeaders(),
            withCredentials: true,
        });
        return response.data;
    },

    createCategory: async (payload: { name: string; description?: string }) => {
        const response = await axios.post(`${API_BASE_URL}/admin/categories`, payload, {
            headers: authHeaders(),
            withCredentials: true,
        });
        return response.data;
    },

    updateCategory: async (id: number, payload: { name?: string; description?: string }) => {
        const response = await axios.put(`${API_BASE_URL}/admin/categories/${id}`, payload, {
            headers: authHeaders(),
            withCredentials: true,
        });
        return response.data;
    },

    deleteCategory: async (id: number) => {
        const response = await axios.delete(`${API_BASE_URL}/admin/categories/${id}`, {
            headers: authHeaders(),
            withCredentials: true,
        });
        return response.data;
    },

    getSchedules: async () => {
        const response = await axios.get(`${API_BASE_URL}/admin/schedules`, {
            headers: authHeaders(),
            withCredentials: true,
        });
        return response.data;
    },

    createSchedule: async (payload: any) => {
        const response = await axios.post(`${API_BASE_URL}/admin/schedules`, payload, {
            headers: authHeaders(),
            withCredentials: true,
        });
        return response.data;
    },

    updateSchedule: async (id: string | number, payload: any) => {
        const response = await axios.put(`${API_BASE_URL}/admin/schedules/${id}`, payload, {
            headers: authHeaders(),
            withCredentials: true,
        });
        return response.data;
    },

    deleteSchedule: async (id: string | number) => {
        const response = await axios.delete(`${API_BASE_URL}/admin/schedules/${id}`, {
            headers: authHeaders(),
            withCredentials: true,
        });
        return response.data;
    },

    getReports: async (params?: { search?: string; type?: string; status?: string; page?: number; limit?: number }) => {
        const response = await axios.get(`${API_BASE_URL}/admin/moderation/reports`, {
            params: { limit: 100, ...params },
            headers: authHeaders(),
            withCredentials: true,
        });
        return response.data;
    },

    handleReportAction: async (id: string | number, payload: { action: string; targetId?: number; type?: string }) => {
        const response = await axios.put(`${API_BASE_URL}/admin/moderation/reports/${id}/action`, payload, {
            headers: authHeaders(),
            withCredentials: true,
        });
        return response.data;
    },

    getDeletionRequests: async (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
        const response = await axios.get(`${API_BASE_URL}/admin/moderation/account-deletions`, {
            params: { limit: 100, ...params },
            headers: authHeaders(),
            withCredentials: true,
        });
        return response.data;
    },

    handleDeletionAction: async (id: string | number, action: 'approved' | 'rejected') => {
        const response = await axios.put(
            `${API_BASE_URL}/admin/moderation/account-deletions/${id}/action`,
            { action },
            { headers: authHeaders(), withCredentials: true }
        );
        return response.data;
    },

    getAiSettings: async () => {
        const response = await axios.get(`${API_BASE_URL}/admin/ai-settings`, {
            headers: authHeaders(),
            withCredentials: true,
        });
        return response.data;
    },

    updateAiSettings: async (payload: { systemInstruction: string; temperature: number; maxTokens: number; isActive: boolean }) => {
        const response = await axios.put(`${API_BASE_URL}/admin/ai-settings`, payload, {
            headers: authHeaders(),
            withCredentials: true,
        });
        return response.data;
    },
};
