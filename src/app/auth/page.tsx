"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { setDemoSession } from "@/lib/demo";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, User, ShieldCheck } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        toast.success("Cek email untuk verifikasi akun");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Login berhasil");
        router.push("/dashboard");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleAuth() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error(message);
    }
  }

  function handleDemoLogin(role: "user" | "admin") {
    setDemoSession(role);
    toast.success(
      role === "admin"
        ? "Masuk sebagai Demo Admin"
        : "Masuk sebagai Demo Pengunjung"
    );
    router.push(role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <div className="min-h-[100dvh] bg-surface text-bone flex flex-col justify-between relative overflow-hidden selection:bg-amber-brand selection:text-surface">
      {/* Ambient glow blobs matching homepage */}
      <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-32 w-[700px] h-[700px] rounded-full bg-amber-brand opacity-[0.07] blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[550px] h-[550px] rounded-full bg-amber-brand opacity-[0.04] blur-[130px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-amber-brand opacity-[0.03] blur-[90px]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-[1400px] mx-auto px-5 lg:px-8 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="font-mono text-sm tracking-[0.2em] uppercase text-bone hover:text-amber-brand transition-colors"
        >
          DINOYOCRAFT
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-bone-muted hover:text-bone transition-colors px-3 py-1.5 rounded-full border border-line bg-surface-elevated/60"
        >
          <ArrowLeft size={13} />
          <span>Kembali ke Beranda</span>
        </Link>
      </header>

      {/* Main Auth Form Container */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 py-6">
        <div className="bg-surface-elevated border border-line rounded-3xl p-7 sm:p-9 shadow-2xl backdrop-blur-md">
          <div className="mb-6">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-amber-brand font-semibold">
              AKUN DINOYOCRAFT
            </span>
            <h1 className="text-3xl font-semibold tracking-tighter text-bone mt-1">
              {mode === "signin" ? "Selamat Datang" : "Buat Akun Baru"}
            </h1>
            <p className="text-xs sm:text-sm text-bone-muted mt-1.5">
              {mode === "signin"
                ? "Masuk untuk mengelola reservasi dan kelas keramik"
                : "Daftar untuk reservasi kelas dan pesan suvenir kustom"}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-bone-muted mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-line bg-surface-raised text-bone text-sm placeholder:text-bone-muted/30 focus:outline-none focus:border-amber-brand focus:ring-1 focus:ring-amber-brand/40 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-bone-muted mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-line bg-surface-raised text-bone text-sm placeholder:text-bone-muted/30 focus:outline-none focus:border-amber-brand focus:ring-1 focus:ring-amber-brand/40 transition font-mono"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-brand hover:bg-amber-dark text-surface font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-amber-brand/20 disabled:opacity-50 cursor-pointer"
            >
              {loading
                ? "Memproses..."
                : mode === "signin"
                ? "Masuk Sekarang"
                : "Daftar Akun"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-surface-elevated text-bone-muted/60 font-mono uppercase text-[10px] tracking-wider">
                atau
              </span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleAuth}
            className="w-full py-2.5 border border-line rounded-xl text-xs font-medium text-bone hover:border-bone-muted/50 bg-surface-raised/40 hover:bg-surface-raised transition flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Lanjut dengan Google
          </button>

          {/* Toggle Signin / Signup */}
          <p className="text-center text-xs text-bone-muted mt-6">
            {mode === "signin" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-amber-brand font-semibold hover:underline cursor-pointer ml-1"
            >
              {mode === "signin" ? "Daftar di sini" : "Masuk di sini"}
            </button>
          </p>

          {/* Demo Simulation Section */}
          <div className="mt-7 pt-6 border-t border-line">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-line" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-brand uppercase px-1">
                SIMULASI DEMO
              </span>
              <div className="flex-1 h-px bg-line" />
            </div>
            <p className="text-[11px] text-bone-muted/80 text-center mb-3 leading-relaxed">
              Coba langsung tanpa akun — simulasi penuh fitur DinoyoCraft
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleDemoLogin("user")}
                className="py-2.5 px-3 border border-line rounded-xl text-xs font-medium bg-surface-raised/50 hover:bg-surface-raised hover:border-bone-muted/40 text-bone transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <User size={14} className="text-bone-muted" />
                <span>Pengunjung</span>
              </button>
              <button
                onClick={() => handleDemoLogin("admin")}
                className="py-2.5 px-3 border border-amber-brand/40 bg-amber-brand/10 text-amber-brand rounded-xl text-xs font-semibold hover:bg-amber-brand/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck size={14} className="text-amber-brand" />
                <span>Admin Demo</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-[1400px] mx-auto px-5 lg:px-8 py-5 text-center text-xs text-bone-muted/60">
        <p>© 2026 Kampung Keramik Dinoyo, Kota Malang</p>
      </footer>
    </div>
  );
}
