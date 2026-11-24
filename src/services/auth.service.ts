// src/services/authService.ts
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

export const authService = {
  // --- FUNGSI LOGIN (Sudah ada sebelumnya) ---
  login: async (credentials: { email: string; password: string; portal?: 'web' | 'mobile' }) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json', // WAJIB ADA UNTUK LOGIN
      },
      body: JSON.stringify({ ...credentials, portal: credentials.portal ?? 'web' }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw { response: { status: res.status, data: { ...data, message: data.message || 'Gagal login' } } };
    }

    const token = data.data?.token || data.token || "";
    const user = data.data?.user || data.data;

    return {
      success: true,
      message: data.message,
      requires_2fa: Boolean(data.requires_2fa || data.data?.requires_2fa),
      data: {
        user,
        token
      }
    };
  },

  // --- FUNGSI REGISTER BARU UNTUK MEMPERBAIKI ERROR ---
  register: async (formData: FormData) => {
    const res = await fetch(`${API_BASE_URL}/auth/register-mitra`, {
      method: 'POST',
      // PENTING: JANGAN ADA PROPERTI 'headers' DI SINI SAMA SEKALI
      // Biarkan browser yang men-generate 'Content-Type: multipart/form-data; boundary=...'
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw { response: { data: { message: data.message || 'Gagal mendaftar' } } };
    }
    return data;
  },

  // --- FUNGSI GOOGLE LOGIN ---
  googleLogin: async (payload: { credential?: string; access_token?: string; userInfo?: any; role?: string; portal?: 'web' | 'mobile' }) => {
    const res = await fetch(`${API_BASE_URL}/auth/google-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...payload, portal: payload.portal ?? 'web' }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw { response: { status: res.status, data: { ...data, message: data.message || 'Gagal login dengan Google' } } };
    }

    return {
      success: true,
      message: data.message,
      requires_2fa: Boolean(data.requires_2fa || data.data?.requires_2fa),
      data: {
        user: data.data?.user || data.data,
        token: data.token || data.data?.token || ""
      }
    };
  },

  // --- FUNGSI LUPA KATA SANDI ---
  forgotPassword: async (email: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw { response: { data: { message: data.message || 'Gagal mengirim tautan reset kata sandi' } } };
    }

    return data;
  },

  // --- FUNGSI VERIFIKASI OTP ---
  verifyOtp: async (payload: { email: string; otp: string }) => {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw { response: { data: { message: data.message || 'Gagal memverifikasi kode OTP' } } };
    }

    return data;
  },

  // --- FUNGSI RESET KATA SANDI ---
  resetPassword: async (payload: { email: string; newPassword: string; otp?: string }) => {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw { response: { data: { message: data.message || 'Gagal mengatur ulang kata sandi' } } };
    }

    return data;
  }
};