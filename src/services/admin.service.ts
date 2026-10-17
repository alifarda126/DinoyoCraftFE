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

    verifyStore: async (id: number, status: 'approved' | 'rejected') => {
        const token = getToken();
        console.log("Token yang dikirim ke backend (verifyStore):", token);

        const response = await axios.patch(
            `${API_BASE_URL}/admin/verifikasi/${id}`,
            { status },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    },
};