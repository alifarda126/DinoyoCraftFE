// src/services/authService.ts

export const authService = {
  // --- FUNGSI LOGIN (Sudah ada sebelumnya) ---
  login: async (credentials: { email: string; password: string }) => {
    const res = await fetch('http://localhost:5000/api/auth/login-mitra', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // WAJIB ADA UNTUK LOGIN
      },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();

    if (!res.ok) {
      throw { response: { data: { message: data.message || 'Gagal login' } } };
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
  }
};