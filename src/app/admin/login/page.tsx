"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { setDemoSession } from "@/lib/utils/demo";
import { ArrowLeft, ArrowRight, LockSimple } from "@phosphor-icons/react";
import { Plus_Jakarta_Sans } from "next/font/google";

const pjs = Plus_Jakarta_Sans({ subsets: ["latin"] });

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.toLowerCase().includes("admin")) {
      toast.error("Kredensial tidak dikenali.");
      return;
    }
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setDemoSession("admin");
      toast.success("Login Admin berhasil (Mock)");
      router.push("/admin");
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface)",
        fontFamily: pjs.style.fontFamily,
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 500,
            height: 500,
            borderRadius: "9999px",
            background: "var(--clay)",
            opacity: 0.05,
            filter: "blur(120px)",
          }}
        />
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#fff",
          border: "1.5px solid var(--line)",
          borderRadius: "1.25rem",
          padding: "2rem",
          position: "relative",
          boxShadow: "0 4px 32px rgba(61,43,31,0.07)",
        }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--bark-muted)", marginBottom: "1.75rem" }}>
          <ArrowLeft size={14} />
          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Kembali ke beranda</span>
        </Link>

        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "1rem",
            background: "var(--surface-raised)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.25rem",
          }}
        >
          <LockSimple size={26} weight="duotone" style={{ color: "var(--clay)" }} />
        </div>

        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "var(--bark)",
            marginBottom: "0.35rem",
          }}
        >
          Portal Admin
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--bark-muted)",
            marginBottom: "2rem",
            lineHeight: 1.6,
          }}
        >
          Area khusus pengelola DinoyoCraft. Halaman ini tidak ditautkan ke
          mana pun demi keamanan.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label htmlFor="admin-email" style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.4rem" }}>
              Email Admin
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@dinoyocraft.id"
              className="input-earthy"
              required
            />
          </div>
          <div>
            <label htmlFor="admin-password" style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.4rem" }}>
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="input-earthy"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.8rem",
              borderRadius: "0.75rem",
              background: loading ? "var(--clay-light)" : "var(--clay)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.9rem",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              marginTop: "0.25rem",
            }}
          >
            {loading ? (
              <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "9999px", animation: "spin 0.75s linear infinite" }} />
            ) : (
              <>
                Masuk
                <ArrowRight size={16} weight="bold" />
              </>
            )}
          </button>
        </form>

        <p style={{ marginTop: "1.5rem", fontSize: "0.72rem", color: "var(--bark-muted)", textAlign: "center", lineHeight: 1.6 }}>
          Gunakan email ber-awalan &quot;admin&quot; (mis. admin@dinoyocraft.id) untuk masuk sebagai demo.
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}