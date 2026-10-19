"use client";

import { useState, useEffect, useRef } from "react";
import { getDemoSession } from "@/lib/utils/demo";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/axios";
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

type RegistrationData = {
  fileKTP: File | null;
  fileNIB: File | null;
  fileProduk: File[];
  agreed: boolean;
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

const getImageUrl = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:") || path.startsWith("data:")) {
    return path;
  }
  const apiHost = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:5000";
  return `${apiHost}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default function SellerProfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isVerified, setIsVerified] = useState(true);
  const [profile, setProfile] = useState<ProfileData>(INITIAL);
  const [preview, setPreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>(
    "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1200&auto=format&fit=crop"
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [isNewRegistration, setIsNewRegistration] = useState(false);
  const [regData, setRegData] = useState<RegistrationData>({
    fileKTP: null,
    fileNIB: null,
    fileProduk: [],
    agreed: false,
  });
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const storedUserStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const session = getDemoSession();

    if (!storedToken && !session) {
      router.push("/login");
      return;
    }

    if (storedUserStr) {
      try {
        const u = JSON.parse(storedUserStr);
        setProfile(prev => ({
          ...prev,
          ownerName: u.name || prev.ownerName,
          storeName: u.store_name || prev.storeName,
          email: u.email || prev.email,
        }));
        if (u.avatar_url) {
          setPreview(getImageUrl(u.avatar_url));
        }
      } catch (e) {
        console.error("Gagal parse stored user:", e);
      }
    } else if (session) {
      setProfile(prev => ({ ...prev, ownerName: session.profile.full_name || prev.ownerName }));
      setIsNewRegistration(session.isNewRegistration || false);
    }

    // Ambil data profil mutakhir dari database Backend
    async function fetchProfile() {
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/auth/profile");
        if (res.data?.success && res.data?.data) {
          const d = res.data.data;
          setProfile(prev => ({
            ...prev,
            ownerName: d.name || prev.ownerName,
            storeName: d.store_name || prev.storeName,
            phone: d.whatsapp_number || prev.phone,
            email: d.email || prev.email,
            address: d.workshop_address || prev.address,
            yearStarted: d.started_year ? String(d.started_year) : prev.yearStarted,
            description: d.description || prev.description,
            website: d.website || prev.website,
            instagram: d.instagram || prev.instagram,
          }));
          if (d.avatar_url) {
            setPreview(getImageUrl(d.avatar_url));
          }
          if (d.banner_url) {
            setBannerPreview(getImageUrl(d.banner_url));
          }
          if (typeof d.is_verified !== "undefined") {
            setIsVerified(d.is_verified === 1 || d.is_verified === true);
          }
        }
      } catch (err) {
        console.warn("Gagal memuat profil toko dari backend:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  function handleChange(field: keyof ProfileData, value: string) {
    setProfile(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
    setSaved(false);
  }

  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    const url = URL.createObjectURL(file);
    setBannerPreview(url);
    setSaved(false);
    toast.success("Banner dipilih! Klik 'Simpan Perubahan' untuk menerapkan.");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    
    if (isNewRegistration) {
      handleRegistrationSubmit(e);
      return;
    }
    
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("ownerName", profile.ownerName);
      formData.append("storeName", profile.storeName);
      formData.append("phone", profile.phone);
      formData.append("address", profile.address);
      formData.append("yearStarted", profile.yearStarted);
      formData.append("description", profile.description);
      formData.append("website", profile.website);
      formData.append("instagram", profile.instagram);

      // Alias kompatibilitas
      formData.append("nama", profile.ownerName);
      formData.append("nama_toko", profile.storeName);
      formData.append("alamat", profile.address);
      formData.append("tahun_mulai", profile.yearStarted);
      formData.append("deskripsi", profile.description);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }
      if (bannerFile) {
        formData.append("banner", bannerFile);
      }

      const response = await api.put("/auth/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.success) {
        setSaved(true);
        setAvatarFile(null);
        setBannerFile(null);

        const updatedData = response.data.data;
        if (updatedData) {
          if (updatedData.avatar_url) {
            setPreview(getImageUrl(updatedData.avatar_url));
          }
          if (updatedData.banner_url) {
            setBannerPreview(getImageUrl(updatedData.banner_url));
          }

          // Sinkronkan data ke localStorage agar Navbar & halaman lain terupdate
          if (typeof window !== "undefined") {
            const userStr = localStorage.getItem("user");
            let parsedUser = {};
            try { parsedUser = userStr ? JSON.parse(userStr) : {}; } catch {}
            localStorage.setItem("user", JSON.stringify({
              ...parsedUser,
              name: updatedData.name || profile.ownerName,
              store_name: updatedData.store_name || profile.storeName,
              avatar_url: updatedData.avatar_url || (parsedUser as any).avatar_url,
            }));
          }
        }

        toast.success("Profil toko berhasil disimpan!");
      } else {
        toast.error(response.data?.message || "Gagal menyimpan profil.");
      }
    } catch (error: any) {
      console.error("Gagal menyimpan profil toko:", error);
      toast.error(error.response?.data?.message || "Gagal menyimpan profil toko.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRegistrationSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRegErrors({});
    let newErrors: Record<string, string> = {};
    let firstErrorField = "";

    const addError = (field: string, msg: string) => {
      newErrors[field] = msg;
      if (!firstErrorField) firstErrorField = field;
    };

    if (!profile.ownerName.trim()) addError("reg-nama", "Nama Lengkap wajib diisi");
    if (!profile.phone.trim()) addError("reg-wa", "Nomor HP wajib diisi");
    if (!profile.storeName.trim()) addError("reg-toko", "Nama Toko wajib diisi");
    if (!profile.address.trim()) addError("reg-alamat", "Alamat Lengkap wajib diisi");
    if (!profile.yearStarted) addError("reg-tahun", "Tahun Mulai Usaha wajib diisi");

    const MAX_MB = 5;
    const MAX_SIZE = MAX_MB * 1024 * 1024;

    if (!regData.fileKTP) addError("reg-ktp", "Dokumen KTP wajib diunggah");
    else if (regData.fileKTP.size > MAX_SIZE) addError("reg-ktp", `Ukuran file maks ${MAX_MB}MB`);

    if (!regData.fileNIB) addError("reg-nib", "Dokumen NIB/Usaha wajib diunggah");
    else if (regData.fileNIB.size > MAX_SIZE) addError("reg-nib", `Ukuran file maks ${MAX_MB}MB`);

    if (regData.fileProduk.length === 0) addError("reg-produk", "Foto produk wajib diunggah");
    else if (regData.fileProduk.length < 3) addError("reg-produk", "Pilih minimal 3 foto");
    else {
      let isOverSize = false;
      for (let i = 0; i < regData.fileProduk.length; i++) {
        if (regData.fileProduk[i].size > MAX_SIZE) isOverSize = true;
      }
      if (isOverSize) addError("reg-produk", `Tiap foto maks ${MAX_MB}MB`);
    }

    if (!regData.agreed) addError("reg-agree", "Harap centang persetujuan terlebih dahulu");

    if (Object.keys(newErrors).length > 0) {
      setRegErrors(newErrors);
      toast.error("Mohon lengkapi semua data yang wajib diisi");
      return;
    }

    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      toast.success("Pendaftaran berhasil! Selamat datang di DinoyoCraft.");
      router.push("/mitra/dashboard");
    } catch {
      toast.error("Terjadi kesalahan saat pendaftaran");
    } finally {
      setSaving(false);
    }
  }

  const initials = profile.ownerName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  if (loading) return <div>Memuat...</div>;

  if (isNewRegistration) {
    return (
      <div style={{ animation: "fadeIn 0.4s ease-out" }}>
        <header style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--bark)", marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>
            Lengkapi Profil Mitra
          </h1>
          <p style={{ color: "var(--bark-muted)", fontSize: "0.95rem" }}>
            Selesaikan pendaftaran Anda dengan data lengkap dan dokumen yang diperlukan.
          </p>
        </header>

        <form onSubmit={handleSave} style={{ maxWidth: "720px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Data Pribadi */}
            <Section title="Data Pribadi" icon={<User size={18} color="var(--clay)" />}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Field label="Nama Lengkap" required>
                  <input
                    type="text" required value={profile.ownerName}
                    onChange={e => { setProfile(prev => ({ ...prev, ownerName: e.target.value })); if (regErrors["reg-nama"]) setRegErrors(p => ({ ...p, "reg-nama": "" })); }}
                    placeholder="Sesuai KTP"
                    style={{ ...inputStyle, borderColor: regErrors["reg-nama"] ? "#e53e3e" : "1px solid var(--line)" }}
                  />
                  {regErrors["reg-nama"] && <span style={{ fontSize: "0.75rem", color: "#e53e3e", marginTop: "0.25rem" }}>{regErrors["reg-nama"]}</span>}
                </Field>
                <Field label="Nomor HP (WhatsApp)" required>
                  <input
                    type="tel" required value={profile.phone}
                    onChange={e => { setProfile(prev => ({ ...prev, phone: e.target.value })); if (regErrors["reg-wa"]) setRegErrors(p => ({ ...p, "reg-wa": "" })); }}
                    placeholder="08xxxxxxxxxx"
                    style={{ ...inputStyle, borderColor: regErrors["reg-wa"] ? "#e53e3e" : "1px solid var(--line)" }}
                  />
                  {regErrors["reg-wa"] && <span style={{ fontSize: "0.75rem", color: "#e53e3e", marginTop: "0.25rem" }}>{regErrors["reg-wa"]}</span>}
                </Field>
              </div>
            </Section>

            {/* Data Toko */}
            <Section title="Data Toko / Workshop" icon={<Storefront size={18} color="var(--clay)" />}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Field label="Nama Toko" required>
                  <input
                    type="text" required value={profile.storeName}
                    onChange={e => { setProfile(prev => ({ ...prev, storeName: e.target.value })); if (regErrors["reg-toko"]) setRegErrors(p => ({ ...p, "reg-toko": "" })); }}
                    placeholder="Contoh: Studio Keramik Bumi"
                    style={{ ...inputStyle, borderColor: regErrors["reg-toko"] ? "#e53e3e" : "1px solid var(--line)" }}
                  />
                  {regErrors["reg-toko"] && <span style={{ fontSize: "0.75rem", color: "#e53e3e", marginTop: "0.25rem" }}>{regErrors["reg-toko"]}</span>}
                </Field>
                <Field label="Tahun Mulai Usaha" required>
                  <input
                    type="number" required min="1990" max={new Date().getFullYear()}
                    value={profile.yearStarted}
                    onChange={e => { setProfile(prev => ({ ...prev, yearStarted: e.target.value })); if (regErrors["reg-tahun"]) setRegErrors(p => ({ ...p, "reg-tahun": "" })); }}
                    placeholder="2018"
                    style={{ ...inputStyle, borderColor: regErrors["reg-tahun"] ? "#e53e3e" : "1px solid var(--line)" }}
                  />
                  {regErrors["reg-tahun"] && <span style={{ fontSize: "0.75rem", color: "#e53e3e", marginTop: "0.25rem" }}>{regErrors["reg-tahun"]}</span>}
                </Field>
              </div>
              <Field label="Alamat Lengkap Workshop" required style={{ marginTop: "1rem" }}>
                <textarea
                  required value={profile.address}
                  onChange={e => { setProfile(prev => ({ ...prev, address: e.target.value })); if (regErrors["reg-alamat"]) setRegErrors(p => ({ ...p, "reg-alamat": "" })); }}
                  rows={3}
                  placeholder="Jalan, RT/RW, Kelurahan..."
                  style={{ ...inputStyle, resize: "vertical", minHeight: 80, borderColor: regErrors["reg-alamat"] ? "#e53e3e" : "1px solid var(--line)" }}
                />
                {regErrors["reg-alamat"] && <span style={{ fontSize: "0.75rem", color: "#e53e3e", marginTop: "0.25rem" }}>{regErrors["reg-alamat"]}</span>}
              </Field>
            </Section>

            {/* Unggah Dokumen */}
            <Section title="Unggah Dokumen" icon={<IdentificationCard size={18} color="var(--clay)" />}>
              <p style={{ fontSize: "0.85rem", color: "var(--bark-muted)", marginBottom: "1rem" }}>Maks 5MB per file</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <Field label="KTP Pemilik Usaha" required>
                  <input
                    type="file" required accept=".jpg,.jpeg,.png,.pdf"
                    onChange={e => { setRegData(p => ({ ...p, fileKTP: e.target.files?.[0] || null })); if (regErrors["reg-ktp"]) setRegErrors(prev => ({ ...prev, "reg-ktp": "" })); }}
                    style={{ ...inputStyle, padding: "0.45rem", borderColor: regErrors["reg-ktp"] ? "#e53e3e" : "1px solid var(--line)" }}
                  />
                  {regErrors["reg-ktp"] && <span style={{ fontSize: "0.75rem", color: "#e53e3e", marginTop: "0.25rem" }}>{regErrors["reg-ktp"]}</span>}
                </Field>
                <Field label="Surat Keterangan Usaha / NIB" required>
                  <input
                    type="file" required accept=".jpg,.jpeg,.png,.pdf"
                    onChange={e => { setRegData(p => ({ ...p, fileNIB: e.target.files?.[0] || null })); if (regErrors["reg-nib"]) setRegErrors(prev => ({ ...prev, "reg-nib": "" })); }}
                    style={{ ...inputStyle, padding: "0.45rem", borderColor: regErrors["reg-nib"] ? "#e53e3e" : "1px solid var(--line)" }}
                  />
                  {regErrors["reg-nib"] && <span style={{ fontSize: "0.75rem", color: "#e53e3e", marginTop: "0.25rem" }}>{regErrors["reg-nib"]}</span>}
                </Field>
                <Field label="Foto Produk (Min. 3 Foto)" required>
                  <input
                    type="file" required multiple accept=".jpg,.jpeg,.png"
                    onChange={e => { setRegData(p => ({ ...p, fileProduk: e.target.files ? Array.from(e.target.files) : [] })); if (regErrors["reg-produk"]) setRegErrors(prev => ({ ...prev, "reg-produk": "" })); }}
                    style={{ ...inputStyle, padding: "0.45rem", borderColor: regErrors["reg-produk"] ? "#e53e3e" : "1px solid var(--line)" }}
                  />
                  {regData.fileProduk.length > 0 && <span style={{ fontSize: "0.75rem", color: "var(--clay)", marginTop: "0.25rem", fontWeight: 600 }}>{regData.fileProduk.length} foto terpilih</span>}
                  {regErrors["reg-produk"] && <span style={{ fontSize: "0.75rem", color: "#e53e3e", marginTop: "0.25rem" }}>{regErrors["reg-produk"]}</span>}
                </Field>
              </div>
            </Section>

            {/* Persetujuan */}
            <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid var(--line)", padding: "1.25rem" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "0.65rem", cursor: "pointer", userSelect: "none" }}>
                <input
                  type="checkbox"
                  checked={regData.agreed}
                  onChange={e => { setRegData(p => ({ ...p, agreed: e.target.checked })); if (regErrors["reg-agree"]) setRegErrors(prev => ({ ...prev, "reg-agree": "" })); }}
                  style={{ marginTop: "0.25rem", width: 18, height: 18, cursor: "pointer" }}
                />
                <span style={{ fontSize: "0.85rem", color: "var(--bark)", lineHeight: 1.6 }}>
                  Saya menyetujui <a href="/syarat-ketentuan" style={{ color: "var(--clay)", fontWeight: 700, textDecoration: "none" }}>Syarat &amp; Ketentuan</a> serta persyaratan pendaftaran Mitra DinoyoCraft.
                </span>
              </label>
              {regErrors["reg-agree"] && <span style={{ fontSize: "0.75rem", color: "#e53e3e", marginTop: "0.5rem", display: "block" }}>{regErrors["reg-agree"]}</span>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%", padding: "0.875rem",
                borderRadius: "0.75rem",
                background: saving ? "var(--clay-light, #d4956a)" : "var(--clay)",
                color: "#fff", fontWeight: 700, fontSize: "0.95rem",
                border: "none", cursor: saving ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                transition: "background 0.3s",
              }}
            >
              {saving ? (
                <span style={{ display: "inline-block", width: 16, height: 16, border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              ) : (
                <>Selesaikan Pendaftaran</>
              )}
            </button>
          </div>
        </form>

        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

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
            {/* Avatar Card — matches toko-saya style */}
            <div style={{
              background: "#fff", borderRadius: "1rem", border: "1px solid var(--line)",
              overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            }}>
              {/* Banner */}
              <div style={{
                height: 120, position: "relative", overflow: "hidden",
                background: `url('${bannerPreview}') center/cover`,
                cursor: "pointer",
              }}
                onClick={() => bannerRef.current?.click()}
                title="Klik untuk ganti banner"
              >
                {/* Dark overlay on hover hint */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(0,0,0,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: "0.35rem",
                    background: "rgba(255,255,255,0.18)", backdropFilter: "blur(4px)",
                    border: "1px solid rgba(255,255,255,0.35)",
                    borderRadius: "9999px", padding: "0.3rem 0.7rem",
                    color: "#fff", fontSize: "0.72rem", fontWeight: 700,
                  }}>
                    <Camera size={12} />
                    Ganti Banner
                  </div>
                </div>
                <input ref={bannerRef} type="file" accept="image/*" onChange={handleBannerChange} style={{ display: "none" }} />
              </div>

              {/* Avatar overlapping banner */}
              <div style={{ padding: "0 1.25rem 1.25rem", position: "relative" }}>
                <div style={{
                  position: "relative", marginTop: -38, marginBottom: "0.75rem",
                  display: "inline-block",
                }}>
                  <div style={{
                    width: 76, height: 76, borderRadius: "50%",
                    background: preview ? "transparent" : "linear-gradient(135deg, var(--clay), #c0673d)",
                    border: "3px solid #fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.5rem", fontWeight: 800, color: "#fff",
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}>
                    {preview
                      ? <img src={preview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : initials
                    }
                  </div>
                  {/* Avatar edit button */}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    title="Ganti foto profil"
                    style={{
                      position: "absolute", bottom: 0, right: 0,
                      width: 24, height: 24, borderRadius: "50%",
                      background: "var(--clay)", border: "2px solid #fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Camera size={11} color="#fff" weight="bold" />
                  </button>
                </div>

                <p style={{ fontWeight: 700, fontSize: "1rem", color: "var(--bark)", margin: "0 0 0.15rem" }}>
                  {profile.storeName || "Nama Toko"}
                </p>
                <p style={{ fontSize: "0.78rem", color: "var(--bark-muted)", margin: "0 0 0.75rem" }}>
                  {profile.kategori}
                </p>

                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.4rem",
                    padding: "0.45rem 0.9rem", borderRadius: "0.6rem",
                    border: "1px solid var(--line-strong)", background: "#fff",
                    color: "var(--bark)", fontSize: "0.78rem", fontWeight: 600,
                    cursor: "pointer", transition: "background 0.2s",
                    fontFamily: "var(--font-outfit), sans-serif",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                >
                  <Camera size={14} />
                  Ganti Foto
                </button>
              </div>
            </div>

            {/* Status Verifikasi */}
            <div style={{
              background: isVerified ? "#f0fdf4" : "#fffbeb",
              border: `1px solid ${isVerified ? "#bbf7d0" : "#fde68a"}`,
              borderRadius: "0.75rem",
              padding: "1rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <CheckCircle size={18} color={isVerified ? "#16a34a" : "#d97706"} weight="fill" />
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: isVerified ? "#15803d" : "#b45309" }}>
                  {isVerified ? "Toko Terverifikasi" : "Menunggu Verifikasi"}
                </span>
              </div>
              <p style={{ fontSize: "0.75rem", color: isVerified ? "#166534" : "#92400e", lineHeight: 1.5, margin: 0 }}>
                {isVerified
                  ? "Toko Anda sudah diverifikasi oleh tim DinoyoCraft. Perubahan data utama perlu persetujuan ulang."
                  : "Pengajuan akun toko Anda sedang dalam peninjauan oleh tim admin DinoyoCraft."}
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

