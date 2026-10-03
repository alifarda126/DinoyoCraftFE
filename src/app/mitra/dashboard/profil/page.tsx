"use client";

import { useState, useEffect, useRef } from "react";
import { getDemoSession } from "@/lib/utils/demo";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Camera, Storefront, MapPin, Phone, EnvelopeSimple,
  CalendarBlank, Globe, InstagramLogo, CheckCircle,
  FloppyDisk, User, IdentificationCard,
} from "@phosphor-icons/react";

type ProfileData = {
  ownerName: string;
  storeName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  yearStarted: string;
  description: string;
  website: string;
  instagram: string;
  kategori: string;
  avatar: string;
};

const INITIAL: ProfileData = {
  ownerName: "Budi Santoso",
  storeName: "Studio Keramik Dinoyo",
  phone: "08123456789",
  email: "budi@email.com",
  address: "Jl. Dinoyo No. 12, RT 03 RW 01",
  city: "Malang",
  yearStarted: "2019",
  description: "Studio keramik handmade dari tanah liat pilihan. Memproduksi vas, mug, piring hias, dan berbagai kerajinan keramik berkualitas tinggi.",
  website: "https://studiokeramik.co.id",
  instagram: "@studiokeramikdinoyo",
  kategori: "Keramik Dekoratif",
  avatar: "",
};

const KATEGORI_LIST = [
  "Keramik Dekoratif", "Peralatan Makan", "Suvenir & Hadiah",
  "Keramik Fungsional", "Custom Order", "Lainnya",
];

export default function SellerProfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<ProfileData>(INITIAL);
  const [preview, setPreview] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const session = getDemoSession();
    if (!session || session.role !== "seller") {
      router.push("/mitra/login");
      return;
    }
    setProfile(prev => ({ ...prev, ownerName: session.profile.full_name || prev.ownerName }));
    setLoading(false);
  }, [router]);

  function handleChange(field: keyof ProfileData, value: string) {
    setProfile(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    toast.success("Profil toko berhasil disimpan!");
  }

  const initials = profile.ownerName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  if (loading) return <div>Memuat...</div>;

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>
      {/* Page Header */}
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--bark)", marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>
          Edit Profil Toko
        </h1>
        <p style={{ color: "var(--bark-muted)", fontSize: "0.95rem" }}>
          Lengkapi informasi toko agar lebih mudah ditemukan dan dipercaya pelanggan.
        </p>
      </header>

      <form onSubmit={handleSave}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem", alignItems: "start" }}>

          {/* ── Kolom Kiri: Foto & Pratinjau ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Avatar Card */}
            <div style={{
              background: "#fff", borderRadius: "1rem", border: "1px solid var(--line)",
              overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            }}>
              <div style={{ background: "linear-gradient(135deg, var(--clay), #a05a3b)", height: 80, position: "relative" }}>
                <div style={{
                  position: "absolute", bottom: -36, left: "50%", transform: "translateX(-50%)",
                  width: 72, height: 72, borderRadius: "50%",
                  background: preview ? "transparent" : "linear-gradient(135deg, var(--clay), #c0673d)",
                  border: "3px solid #fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.35rem", fontWeight: 800, color: "#fff",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}>
                  {preview
                    ? <img src={preview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : initials
                  }
                </div>
              </div>
              <div style={{ paddingTop: 44, paddingBottom: "1.5rem", textAlign: "center" }}>
                <p style={{ fontWeight: 700, fontSize: "1rem", color: "var(--bark)", margin: "0 0 0.15rem" }}>
                  {profile.storeName || "Nama Toko"}
                </p>
                <p style={{ fontSize: "0.78rem", color: "var(--bark-muted)", margin: "0 0 1rem" }}>
                  {profile.kategori}
                </p>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.4rem",
                    padding: "0.5rem 1rem", borderRadius: "0.6rem",
                    border: "1px solid var(--line-strong)", background: "#fff",
                    color: "var(--bark)", fontSize: "0.8rem", fontWeight: 600,
                    cursor: "pointer", transition: "background 0.2s",
                    fontFamily: "var(--font-outfit), sans-serif",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                >
                  <Camera size={15} />
                  Ganti Foto
                </button>
              </div>
            </div>

            {/* Status Verifikasi */}
            <div style={{
              background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "0.75rem", padding: "1rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <CheckCircle size={18} color="#16a34a" weight="fill" />
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#15803d" }}>Toko Terverifikasi</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#166534", lineHeight: 1.5, margin: 0 }}>
                Toko Anda sudah diverifikasi oleh tim DinoyoCraft. Perubahan data utama perlu persetujuan ulang.
              </p>
            </div>

            {/* Tombol Simpan (di kolom kiri, sticky feel) */}
            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%", padding: "0.875rem",
                borderRadius: "0.75rem",
                background: saving ? "var(--clay-light, #d4956a)" : saved ? "#16a34a" : "var(--clay)",
                color: "#fff", fontWeight: 700, fontSize: "0.95rem",
                border: "none", cursor: saving ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                transition: "background 0.3s",
                fontFamily: "var(--font-outfit), sans-serif",
              }}
            >
              {saving ? (
                <span style={{ display: "inline-block", width: 16, height: 16, border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              ) : saved ? (
                <><CheckCircle size={18} weight="fill" /> Tersimpan</>
              ) : (
                <><FloppyDisk size={18} weight="fill" /> Simpan Perubahan</>
              )}
            </button>
          </div>

          {/* ── Kolom Kanan: Form ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Seksi: Informasi Pemilik */}
            <Section title="Informasi Pemilik" icon={<User size={18} color="var(--clay)" />}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Field label="Nama Pemilik" required>
                  <input
                    type="text" required value={profile.ownerName}
                    onChange={e => handleChange("ownerName", e.target.value)}
                    placeholder="Sesuai KTP"
                    className="input-earthy"
                    style={inputStyle}
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email" value={profile.email}
                    onChange={e => handleChange("email", e.target.value)}
                    placeholder="email@domain.com"
                    style={inputStyle}
                  />
                </Field>
                <Field label="Nomor HP (WhatsApp)" required>
                  <div style={{ position: "relative" }}>
                    <Phone size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--bark-muted)" }} />
                    <input
                      type="tel" required value={profile.phone}
                      onChange={e => handleChange("phone", e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      style={{ ...inputStyle, paddingLeft: "2.25rem" }}
                    />
                  </div>
                </Field>
                <Field label="Email Toko">
                  <div style={{ position: "relative" }}>
                    <EnvelopeSimple size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--bark-muted)" }} />
                    <input
                      type="email" value={profile.email}
                      onChange={e => handleChange("email", e.target.value)}
                      placeholder="toko@email.com"
                      style={{ ...inputStyle, paddingLeft: "2.25rem" }}
                    />
                  </div>
                </Field>
              </div>
            </Section>

            {/* Seksi: Informasi Toko */}
            <Section title="Informasi Toko" icon={<Storefront size={18} color="var(--clay)" />}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Field label="Nama Toko" required>
                  <input
                    type="text" required value={profile.storeName}
                    onChange={e => handleChange("storeName", e.target.value)}
                    placeholder="Nama toko Anda"
                    style={inputStyle}
                  />
                </Field>
                <Field label="Kategori Utama">
                  <select
                    value={profile.kategori}
                    onChange={e => handleChange("kategori", e.target.value)}
                    style={{ ...inputStyle, appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%236b7280' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem center" }}
                  >
                    {KATEGORI_LIST.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </Field>
                <Field label="Tahun Mulai Usaha">
                  <div style={{ position: "relative" }}>
                    <CalendarBlank size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--bark-muted)" }} />
                    <input
                      type="number" min="1990" max={new Date().getFullYear()}
                      value={profile.yearStarted}
                      onChange={e => handleChange("yearStarted", e.target.value)}
                      placeholder="2020"
                      style={{ ...inputStyle, paddingLeft: "2.25rem" }}
                    />
                  </div>
                </Field>
                <Field label="Kota / Kabupaten">
                  <input
                    type="text" value={profile.city}
                    onChange={e => handleChange("city", e.target.value)}
                    placeholder="Malang"
                    style={inputStyle}
                  />
                </Field>
              </div>
              <Field label="Alamat Lengkap Workshop" style={{ marginTop: "1rem" }}>
                <div style={{ position: "relative" }}>
                  <MapPin size={15} style={{ position: "absolute", left: "0.75rem", top: "0.85rem", color: "var(--bark-muted)" }} />
                  <textarea
                    value={profile.address}
                    onChange={e => handleChange("address", e.target.value)}
                    rows={3}
                    placeholder="Jalan, nomor, RT/RW, kelurahan..."
                    style={{ ...inputStyle, paddingLeft: "2.25rem", resize: "vertical", minHeight: 80 }}
                  />
                </div>
              </Field>
              <Field label="Deskripsi Toko" style={{ marginTop: "1rem" }}>
                <textarea
                  value={profile.description}
                  onChange={e => handleChange("description", e.target.value)}
                  rows={4}
                  maxLength={300}
                  placeholder="Ceritakan tentang toko dan produk Anda..."
                  style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
                />
                <p style={{ fontSize: "0.72rem", color: "var(--bark-muted)", textAlign: "right", marginTop: "0.25rem" }}>
                  {profile.description.length}/300
                </p>
              </Field>
            </Section>

            {/* Seksi: Media Sosial */}
            <Section title="Media Sosial & Website" icon={<Globe size={18} color="var(--clay)" />}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Field label="Website">
                  <div style={{ position: "relative" }}>
                    <Globe size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--bark-muted)" }} />
                    <input
                      type="url" value={profile.website}
                      onChange={e => handleChange("website", e.target.value)}
                      placeholder="https://..."
                      style={{ ...inputStyle, paddingLeft: "2.25rem" }}
                    />
                  </div>
                </Field>
                <Field label="Instagram">
                  <div style={{ position: "relative" }}>
                    <InstagramLogo size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--bark-muted)" }} />
                    <input
                      type="text" value={profile.instagram}
                      onChange={e => handleChange("instagram", e.target.value)}
                      placeholder="@namatoko"
                      style={{ ...inputStyle, paddingLeft: "2.25rem" }}
                    />
                  </div>
                </Field>
              </div>
            </Section>

          </div>
        </div>
      </form>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Komponen pembantu ──
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#fff", borderRadius: "1rem", border: "1px solid var(--line)",
      overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
    }}>
      <div style={{
        padding: "1rem 1.25rem", borderBottom: "1px solid var(--line)",
        display: "flex", alignItems: "center", gap: "0.6rem",
        background: "var(--surface)",
      }}>
        {icon}
        <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--bark)", margin: 0 }}>{title}</h2>
      </div>
      <div style={{ padding: "1.25rem" }}>{children}</div>
    </div>
  );
}

function Field({ label, required, children, style }: { label: string; required?: boolean; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.4rem" }}>
        {label}{required && <span style={{ color: "var(--clay)", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.85rem",
  borderRadius: "0.625rem",
  border: "1px solid var(--line)",
  fontSize: "0.875rem",
  outline: "none",
  color: "var(--bark)",
  fontFamily: "var(--font-outfit), sans-serif",
  background: "#fff",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

