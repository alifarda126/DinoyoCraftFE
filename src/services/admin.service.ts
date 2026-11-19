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

export const adminService = {
    getVerifikasiList: async () => {
        const token = getToken();
        console.log("Token yang dikirim ke backend:", token);

        const response = await axios.get(`${API_BASE_URL}/admin/verifikasi`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    getDashboardStats: async () => {
        const token = getToken();
        const response = await axios.get(`${API_BASE_URL}/admin/dashboard-stats`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true,
        });
        return response.data;
    },

    getTransactions: async (params?: { status?: string; q?: string; page?: number; limit?: number }) => {
        const token = getToken();
        const response = await axios.get(`${API_BASE_URL}/admin/transactions`, {
            params,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true,
        });
        return response.data;
    },

    verifyStore: async (id: number, status: 'approved' | 'rejected', reason?: string) => {
        const token = getToken();
        console.log("Token yang dikirim ke backend (verifyStore):", token);

        const response = await axios.patch(
            `${API_BASE_URL}/admin/verifikasi/${id}`,
            { status, reason },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    },

    getModerationReports: async (params?: {
        status?: string;
        type?: string;
        search?: string;
        page?: number;
        limit?: number;
    }) => {
        const token = getToken();
        const response = await axios.get(`${API_BASE_URL}/admin/moderation/reports`, {
            params,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true,
        });
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
        const token = getToken();
        const response = await axios.put(
            `${API_BASE_URL}/admin/moderation/reports/${id}/action`,
            payload,
            {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                withCredentials: true,
            }
        );
        return response.data;
    },

    getAccountDeletions: async (params?: {
        status?: string;
        search?: string;
        page?: number;
        limit?: number;
    }) => {
        const token = getToken();
        const response = await axios.get(`${API_BASE_URL}/admin/moderation/account-deletions`, {
            params,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true,
        });
        return response.data;
    },

    handleAccountDeletionAction: async (
        id: string | number,
        action: 'approved' | 'rejected'
    ) => {
        const token = getToken();
        const response = await axios.put(
            `${API_BASE_URL}/admin/moderation/account-deletions/${id}/action`,
            { action },
            {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                withCredentials: true,
            }
        );
        return response.data;
    },

    getUnreadChatCount: async () => {
        const token = getToken();
        const response = await axios.get(`${API_BASE_URL}/chat/unread-count`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true,
        });
        return response.data;
    },

    getUsers: async (params?: { page?: number; limit?: number }) => {
        const token = getToken();
        const response = await axios.get(`${API_BASE_URL}/admin/users`, {
            params: { limit: 100, ...params },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true,
        });
        return response.data;
    },

    updateUserStatus: async (id: number, is_active: boolean) => {
        const token = getToken();
        const response = await axios.patch(
            `${API_BASE_URL}/admin/users/${id}/status`,
            { is_active },
            {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                withCredentials: true,
            }
        );
        return response.data;
    },

    forceLogoutUser: async (id: number) => {
        const token = getToken();
        const response = await axios.patch(
            `${API_BASE_URL}/admin/users/${id}/force-logout`,
            {},
            {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                withCredentials: true,
            }
        );
        return response.data;
    },

    getAiSettings: async () => {
        const token = getToken();
        const response = await axios.get(`${API_BASE_URL}/admin/ai-settings`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true,
        });
        return response.data;
    },

    updateAiSettings: async (payload: {
        is_auto_reply_active: boolean;
        model_name: string;
        api_key: string;
        system_prompt: string;
    }) => {
        const token = getToken();
        const response = await axios.put(`${API_BASE_URL}/admin/ai-settings`, payload, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true,
        });
        return response.data;
    },

    getMasterData: async (category?: string) => {
        const token = getToken();
        const response = await axios.get(`${API_BASE_URL}/admin/master-data`, {
            params: category ? { category } : undefined,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true,
        });
        return response.data;
    },

    createMasterData: async (payload: {
        category: string;
        key: string;
        value: string;
        description?: string;
    }) => {
        const token = getToken();
        const response = await axios.post(`${API_BASE_URL}/admin/master-data`, payload, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true,
        });
        return response.data;
    },
};