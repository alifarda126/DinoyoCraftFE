"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  EnvelopeSimple,
  Lock,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeSlash,
} from "@phosphor-icons/react";
import { authService } from "@/services/auth.service";

type Step = "email" | "otp" | "newpass" | "done";

/* ─── shared input style ─── */
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  borderRadius: "0.75rem",
  border: "1.5px solid var(--line-strong, #ccc)",
  background: "#fff",
  fontSize: "0.9rem",
  fontFamily: "inherit",
  color: "var(--bark, #000)",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const btnPrimaryStyle = (disabled: boolean): React.CSSProperties => ({
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  padding: "0.85rem",
  borderRadius: "0.75rem",
  background: disabled
    ? "#aaa"
    : "linear-gradient(135deg, var(--bark, #000), #2d2a26)",
  color: "#fff",
  fontWeight: 700,
  fontSize: "0.95rem",
  border: "none",
  cursor: disabled ? "not-allowed" : "pointer",
  transition: "opacity 0.2s",
  letterSpacing: "-0.01em",
  fontFamily: "inherit",
});

/* ─── OTP digit input ─── */
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    const inp = e.currentTarget;
    if (e.key === "Backspace" && !inp.value) {
      const prev = document.getElementById(`otp-${i - 1}`) as HTMLInputElement | null;
      prev?.focus();
    }
  }

  function handleChange(i: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const arr = digits.map((d, idx) => (idx === i ? val : d));
    onChange(arr.join("").replace(/ /g, ""));
    if (val) {
      const next = document.getElementById(`otp-${i + 1}`) as HTMLInputElement | null;
      next?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
  }

  return (
    <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center" }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] === " " ? "" : digits[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          style={{
            width: 46,
            height: 52,
            textAlign: "center",
            fontSize: "1.4rem",
            fontWeight: 700,
            borderRadius: "0.75rem",
            border: `2px solid ${digits[i] && digits[i] !== " " ? "var(--bark, #000)" : "var(--line-strong, #ccc)"}`,
            outline: "none",
            background: "#fff",
            color: "var(--bark, #000)",
            transition: "border-color 0.15s",
            fontFamily: "monospace",
          }}
        />
      ))}
    </div>
  );
}

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  function startCountdown() {
    setCountdown(60);
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Email tidak valid.");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      toast.success(res.message || `Kode OTP dikirim ke ${email}`);
      startCountdown();
      setStep("otp");
    } catch (error: any) {
      console.error("Forgot password error:", error);
      const errorMessage =
        error.response?.data?.message || "Terjadi kesalahan saat memproses permintaan.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Masukkan 6 digit kode OTP.");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.verifyOtp({ email, otp });
      toast.success(res.message || "OTP berhasil diverifikasi!");
      setStep("newpass");
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      const errorMessage =
        error.response?.data?.message || "Kode OTP tidak valid.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    if (countdown > 0) return;
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setOtp("");
      toast.success(res.message || "Kode OTP baru telah dikirim ulang.");
      startCountdown();
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      const errorMessage =
        error.response?.data?.message || "Gagal mengirim ulang kode OTP.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPass.length < 8) {
      toast.error("Kata sandi minimal 8 karakter.");
      return;
    }
    if (newPass !== confirmPass) {
      toast.error("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.resetPassword({
        email,
        newPassword: newPass,
        otp,
      });
      toast.success(res.message || "Kata sandi berhasil diperbarui!");
      setStep("done");
    } catch (error: any) {
      console.error("Reset password error:", error);
      const errorMessage =
        error.response?.data?.message || "Gagal mengatur ulang kata sandi.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  /* ─── Progress bar ─── */
  const steps = ["email", "otp", "newpass", "done"] as Step[];
  const stepIdx = steps.indexOf(step);

  return (
    <main style={{ padding: "2.5rem 2rem", position: "relative", zIndex: 10, flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 460, margin: "0 auto" }}>
        {/* Back Link */}
        <div style={{ marginBottom: "1.25rem" }}>
          <Link
            href="/login"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", color: "var(--bark-muted)", fontSize: "0.85rem", fontWeight: 600 }}
          >
            <ArrowLeft size={16} /> Kembali ke Halaman Masuk
          </Link>
        </div>

        {/* Step indicator */}
        {step !== "done" && (
          <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
            {steps.slice(0, 3).map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: i <= stepIdx ? "var(--bark, #000)" : "var(--line-strong, #ccc)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    flexShrink: 0,
                    transition: "background 0.3s",
                  }}
                >
                  {i < stepIdx ? "✓" : i + 1}
                </div>
                {i < 2 && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      background: i < stepIdx ? "var(--bark, #000)" : "var(--line-strong, #ccc)",
                      margin: "0 4px",
                      transition: "background 0.3s",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Card */}
        <div
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(16px)",
            border: "1.5px solid rgba(255,255,255,0.8)",
            borderRadius: "1.75rem",
            padding: "2.5rem 2.25rem",
            boxShadow: "0 8px 40px rgba(120,70,30,0.12), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          {/* ── STEP 1: Email ── */}
          {step === "email" && (
            <>
              <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "1rem",
                    background: "linear-gradient(135deg, var(--clay), #c0673d)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                    boxShadow: "0 4px 12px rgba(180,90,50,0.25)",
                  }}
                >
                  <EnvelopeSimple size={28} weight="fill" color="#fff" />
                </div>
                <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--bark)", margin: 0, letterSpacing: "-0.03em" }}>
                  Lupa Kata Sandi?
                </h1>
                <p style={{ fontSize: "0.83rem", color: "var(--bark-muted)", marginTop: "0.4rem", lineHeight: 1.6 }}>
                  Masukkan email akun Mitra kamu. Kami akan mengirimkan kode verifikasi (OTP).
                </p>
              </div>
              <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label htmlFor="forgot-email" style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.4rem" }}>
                    Alamat Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bark)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--line-strong, #ccc)")}
                  />
                </div>
                <button type="submit" disabled={loading} style={btnPrimaryStyle(loading)}>
                  {loading ? (
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "9999px",
                        display: "inline-block",
                        animation: "spin 0.75s linear infinite",
                      }}
                    />
                  ) : (
                    <>
                      <EnvelopeSimple size={16} weight="bold" /> Kirim Kode OTP
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === "otp" && (
            <>
              <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "1rem",
                    background: "linear-gradient(135deg, var(--clay), #c0673d)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                    boxShadow: "0 4px 12px rgba(180,90,50,0.25)",
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>📩</span>
                </div>
                <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--bark)", margin: 0, letterSpacing: "-0.03em" }}>
                  Masukkan Kode OTP
                </h1>
                <p style={{ fontSize: "0.83rem", color: "var(--bark-muted)", marginTop: "0.4rem", lineHeight: 1.6 }}>
                  Kode 6 digit telah dikirim ke<br />
                  <strong style={{ color: "var(--bark)" }}>{email}</strong>
                </p>
              </div>
              <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <OtpInput value={otp} onChange={setOtp} />

                <button type="submit" disabled={loading || otp.length < 6} style={btnPrimaryStyle(loading || otp.length < 6)}>
                  {loading ? (
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "9999px",
                        display: "inline-block",
                        animation: "spin 0.75s linear infinite",
                      }}
                    />
                  ) : (
                    <>
                      <ArrowRight size={16} weight="bold" /> Verifikasi Kode
                    </>
                  )}
                </button>

                <div style={{ textAlign: "center" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--bark-muted)" }}>Tidak menerima kode? </span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={countdown > 0}
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: countdown > 0 ? "var(--bark-muted)" : "var(--clay)",
                      background: "none",
                      border: "none",
                      cursor: countdown > 0 ? "not-allowed" : "pointer",
                      padding: 0,
                      fontFamily: "inherit",
                      textDecoration: countdown > 0 ? "none" : "underline",
                    }}
                  >
                    {countdown > 0 ? `Kirim ulang (${countdown}s)` : "Kirim Ulang"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--bark-muted)",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    textAlign: "center",
                    fontFamily: "inherit",
                  }}
                >
                  ← Ganti email
                </button>
              </form>
            </>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === "newpass" && (
            <>
              <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "1rem",
                    background: "linear-gradient(135deg, var(--clay), #c0673d)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                    boxShadow: "0 4px 12px rgba(180,90,50,0.25)",
                  }}
                >
                  <Lock size={28} weight="fill" color="#fff" />
                </div>
                <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--bark)", margin: 0, letterSpacing: "-0.03em" }}>
                  Buat Kata Sandi Baru
                </h1>
                <p style={{ fontSize: "0.83rem", color: "var(--bark-muted)", marginTop: "0.4rem" }}>
                  Minimal 8 karakter.
                </p>
              </div>
              <form onSubmit={handleSetPassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* New password */}
                <div>
                  <label htmlFor="new-pass" style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.4rem" }}>
                    Kata Sandi Baru
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="new-pass"
                      type={showPass ? "text" : "password"}
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="Minimal 8 karakter"
                      required
                      minLength={8}
                      style={{ ...inputStyle, paddingRight: "2.8rem" }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bark)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--line-strong, #ccc)")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      style={{
                        position: "absolute",
                        right: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--bark-muted)",
                        display: "flex",
                      }}
                      tabIndex={-1}
                    >
                      {showPass ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {newPass.length > 0 && (
                    <div style={{ marginTop: "0.4rem" }}>
                      <div style={{ height: 3, borderRadius: 999, background: "var(--line-strong, #ccc)", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: newPass.length >= 12 ? "100%" : newPass.length >= 8 ? "60%" : "30%",
                            background: newPass.length >= 12 ? "#10b981" : newPass.length >= 8 ? "#f59e0b" : "#ef4444",
                            borderRadius: 999,
                            transition: "width 0.3s, background 0.3s",
                          }}
                        />
                      </div>
                      <span style={{ fontSize: "0.7rem", color: newPass.length >= 8 ? "#10b981" : "#ef4444" }}>
                        {newPass.length >= 12 ? "Kuat" : newPass.length >= 8 ? "Cukup" : "Terlalu pendek"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label htmlFor="confirm-pass" style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.4rem" }}>
                    Konfirmasi Kata Sandi
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="confirm-pass"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Ulangi kata sandi baru"
                      required
                      style={{
                        ...inputStyle,
                        paddingRight: "2.8rem",
                        borderColor: confirmPass && confirmPass !== newPass ? "#ef4444" : undefined,
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bark)")}
                      onBlur={(e) =>
                        (e.currentTarget.style.borderColor = confirmPass && confirmPass !== newPass ? "#ef4444" : "var(--line-strong, #ccc)")
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      style={{
                        position: "absolute",
                        right: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--bark-muted)",
                        display: "flex",
                      }}
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPass && confirmPass !== newPass && (
                    <p style={{ fontSize: "0.72rem", color: "#ef4444", marginTop: "0.3rem" }}>Kata sandi tidak cocok</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || newPass.length < 8 || newPass !== confirmPass}
                  style={btnPrimaryStyle(loading || newPass.length < 8 || newPass !== confirmPass)}
                >
                  {loading ? (
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "9999px",
                        display: "inline-block",
                        animation: "spin 0.75s linear infinite",
                      }}
                    />
                  ) : (
                    <>
                      <Lock size={16} weight="bold" /> Simpan Kata Sandi Baru
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ── STEP 4: Done ── */}
          {step === "done" && (
            <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  boxShadow: "0 6px 20px rgba(16,185,129,0.3)",
                  animation: "popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) both",
                }}
              >
                <CheckCircle size={36} weight="fill" color="#fff" />
              </div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--bark)", margin: 0, letterSpacing: "-0.03em" }}>
                Kata Sandi Diperbarui!
              </h1>
              <p style={{ fontSize: "0.85rem", color: "var(--bark-muted)", margin: "0.6rem 0 2rem", lineHeight: 1.6 }}>
                Kata sandi akun Mitra kamu berhasil diubah.<br />
                Silakan masuk dengan kata sandi baru.
              </p>
              <button onClick={() => router.push("/login")} style={btnPrimaryStyle(false)}>
                <ArrowRight size={16} weight="bold" />
                Masuk Sekarang
              </button>
            </div>
          )}
        </div>

        {/* Badge bawah */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "1.5rem" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--bark)", fontWeight: 600, opacity: 0.85 }}>
            &copy; {new Date().getFullYear()} DinoyoCraft. Hak Cipta Dilindungi.
          </span>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </main>
  );
}
