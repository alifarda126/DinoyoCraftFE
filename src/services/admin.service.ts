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
};