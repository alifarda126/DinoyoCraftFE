import { z } from "zod";

// ============================================================
// 1. Skema Login
// ============================================================
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(1, "Password wajib diisi"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ============================================================
// 2. Skema Lupa Kata Sandi (Step 1: Kirim OTP)
// ============================================================
export const forgotPasswordEmailSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
});

export type ForgotPasswordEmailFormData = z.infer<typeof forgotPasswordEmailSchema>;

// ============================================================
// 3. Skema Verifikasi OTP (Step 2)
// ============================================================
export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .length(6, "Kode OTP harus berupa 6 digit angka")
    .regex(/^\d+$/, "Kode OTP hanya boleh berisi angka"),
});

export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

// ============================================================
// 4. Skema Reset Password Baru (Step 3)
// ============================================================
export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Kata sandi minimal 8 karakter"),
    confirmPassword: z
      .string()
      .min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ============================================================
// 5. Skema Registrasi Mitra (Step 1: Data Pribadi & Keamanan)
// ============================================================
export const step1BaseSchema = z.object({
  namaLengkap: z
    .string()
    .min(1, "Nama Lengkap wajib diisi")
    .regex(/^[a-zA-Z\s]+$/, "Format nama tidak valid (hanya huruf)"),
  noWa: z
    .string()
    .min(1, "Nomor HP wajib diisi")
    .regex(/^[0-9]+$/, "Nomor HP hanya boleh berisi angka")
    .min(10, "Nomor HP harus 10-14 digit")
    .max(14, "Nomor HP harus 10-14 digit"),
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z.string().optional(),
  konfirmasiPassword: z.string().optional(),
  isGoogleAuth: z.boolean().default(false),
});

export const registerStep1Schema = step1BaseSchema.superRefine((data, ctx) => {
  if (!data.isGoogleAuth) {
    if (!data.password || data.password.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password wajib diisi",
        path: ["password"],
      });
    } else if (data.password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password min. 8 karakter",
        path: ["password"],
      });
    }

    if (!data.konfirmasiPassword || data.konfirmasiPassword.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Konfirmasi password wajib diisi",
        path: ["konfirmasiPassword"],
      });
    } else if (data.password && data.password !== data.konfirmasiPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password tidak cocok",
        path: ["konfirmasiPassword"],
      });
    }
  }
});

export type RegisterStep1FormData = z.infer<typeof registerStep1Schema>;

// ============================================================
// 6. Skema Registrasi Mitra (Step 2: Data Toko & Dokumen)
// ============================================================
export const registerStep2Schema = z.object({
  namaToko: z
    .string()
    .min(1, "Nama Toko wajib diisi"),
  alamatToko: z
    .string()
    .min(1, "Alamat Lengkap Workshop wajib diisi"),
  tahunUsaha: z
    .string()
    .min(1, "Tahun Mulai Usaha wajib diisi"),
  agreed: z.literal(true, {
    message: "Harap centang persetujuan persyaratan terlebih dahulu.",
  }),
});

export type RegisterStep2FormData = z.infer<typeof registerStep2Schema>;
