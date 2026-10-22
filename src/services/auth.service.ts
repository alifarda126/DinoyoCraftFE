// src/services/authService.ts

export const authService = {
  // --- FUNGSI LOGIN (Sudah ada sebelumnya) ---
  login: async (credentials: { email: string; password: string }) => {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json', // WAJIB ADA UNTUK LOGIN
      },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();

    if (!res.ok) {
      throw { response: { data: { message: data.message || 'Gagal login' } } };
    }

    const token = data.data?.token || data.token || "token-sementara";
    const user = data.data?.user || data.data;

    return {
      success: true,
      message: data.message,
      data: {
        user,
        token
      }
    };
  },

  // --- FUNGSI REGISTER BARU UNTUK MEMPERBAIKI ERROR ---
  register: async (formData: FormData) => {
    const res = await fetch('http://localhost:5000/api/auth/register-mitra', {
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
  googleLogin: async (payload: { credential?: string; userInfo?: any }) => {
    const res = await fetch('http://localhost:5000/api/auth/google-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw { response: { data: { message: data.message || 'Gagal login dengan Google' } } };
    }

    return {
      success: true,
      message: data.message,
      data: {
        user: data.data,
        token: data.token || "token-sementara"
      }
    };
  },

  // --- FUNGSI LUPA KATA SANDI ---
  forgotPassword: async (email: string) => {
    const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
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
    const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
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
    const res = await fetch('http://localhost:5000/api/auth/reset-password', {
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