import axios, { InternalAxiosRequestConfig } from 'axios';
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

const adminHttp = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    withCredentials: true,
});

adminHttp.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

adminHttp.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
        const method = (config?.method || 'get').toLowerCase();
        const status = error.response?.status;
        const isTransient =
            !error.response ||
            error.code === 'ECONNABORTED' ||
            status === 502 ||
            status === 503 ||
            status === 504;

        if (config && method === 'get' && !config._retried && isTransient) {
            config._retried = true;
            await new Promise((resolve) => setTimeout(resolve, 800));
            return adminHttp(config);
        }
        return Promise.reject(error);
    }
);

export const adminService = {
    getVerifikasiList: async () => {
        const response = await adminHttp.get('/admin/verifikasi');
        return response.data;
    },

    getDashboardStats: async () => {
        const response = await adminHttp.get('/admin/dashboard-stats');
        return response.data;
    },

    getTransactions: async (params?: { status?: string; q?: string; page?: number; limit?: number }) => {
        const response = await adminHttp.get('/admin/transactions', { params });
        return response.data;
    },

    verifyStore: async (id: number, status: 'approved' | 'rejected', reason?: string) => {
        const response = await adminHttp.patch(`/admin/verifikasi/${id}`, { status, reason });
        return response.data;
    },

    getModerationReports: async (params?: {
        status?: string;
        type?: string;
        search?: string;
        page?: number;
        limit?: number;
    }) => {
        const response = await adminHttp.get('/admin/moderation/reports', { params });
        return response.data;
    },

    handleModerationReportAction: async (
        id: string | number,
        payload: {
            action: 'abaikan' | 'suspend' | 'hapus' | 'delete' | 'ignore' | 'takedown';
            targetId?: number | null;
            type?: string | null;
        }
    ) => {
        const response = await adminHttp.put(`/admin/moderation/reports/${id}/action`, payload);
        return response.data;
    },

    getAccountDeletions: async (params?: {
        status?: string;
        search?: string;
        page?: number;
        limit?: number;
    }) => {
        const response = await adminHttp.get('/admin/moderation/account-deletions', { params });
        return response.data;
    },

    handleAccountDeletionAction: async (
        id: string | number,
        action: 'approved' | 'rejected'
    ) => {
        const response = await adminHttp.put(`/admin/moderation/account-deletions/${id}/action`, { action });
        return response.data;
    },

    getUnreadChatCount: async () => {
        const response = await adminHttp.get('/chat/unread-count');
        return response.data;
    },

    getUsers: async (params?: { page?: number; limit?: number }) => {
        const response = await adminHttp.get('/admin/users', {
            params: { limit: 100, ...params },
        });
        return response.data;
    },

    updateUserStatus: async (id: number, is_active: boolean) => {
        const response = await adminHttp.patch(`/admin/users/${id}/status`, { is_active });
        return response.data;
    },

    forceLogoutUser: async (id: number) => {
        const response = await adminHttp.patch(`/admin/users/${id}/force-logout`, {});
        return response.data;
    },

    getAiSettings: async () => {
        const response = await adminHttp.get('/admin/ai-settings');
        return response.data;
    },

    updateAiSettings: async (payload: {
        is_auto_reply_active: boolean;
        model_name: string;
        api_key: string;
        system_prompt: string;
    }) => {
        const response = await adminHttp.put('/admin/ai-settings', payload);
        return response.data;
    },

    getMasterData: async (category?: string) => {
        const response = await adminHttp.get('/admin/master-data', {
            params: category ? { category } : undefined,
        });
        return response.data;
    },

    createMasterData: async (payload: {
        category: string;
        key: string;
        value: string;
        description?: string;
    }) => {
        const response = await adminHttp.post('/admin/master-data', payload);
        return response.data;
    },
};
