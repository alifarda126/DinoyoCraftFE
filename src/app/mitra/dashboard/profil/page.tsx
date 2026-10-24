"use client";

import { useState, useEffect, useRef } from "react";
import { getDemoSession } from "@/lib/utils/demo";
import { useRouter } from "next/navigation";
import { mitraService } from "@/services/mitra.service";
import { toast } from "sonner";
import api from "@/lib/axios";
import {
  Camera, Storefront, MapPin, Phone, EnvelopeSimple,
  CalendarBlank, Globe, InstagramLogo, CheckCircle,
  FloppyDisk, User, IdentificationCard, WarningCircle,
  Clock, UploadSimple, X, ArrowRight, FileText, Check,
  LockKey, ChatText, Warning, Eye,
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
  banner: string;
};

type RegistrationData = {
  fileKTP: File | null;
  fileNIB: File | null;
  fileProduk: File[];
  agreed: boolean;
};

const INITIAL: ProfileData = {
  ownerName: "",
  storeName: "",
  phone: "",
  email: "",
  address: "",
  city: "Malang",
  yearStarted: "",
  description: "",
  website: "",
  instagram: "",
  kategori: "",
  avatar: "",
  banner: "",
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

const isCustomAvatar = (url?: string | null) => {
  if (!url) return false;
  if (url.includes("googleusercontent.com") || url.includes("google.com")) {
    return false;
  }
  return true;
};

export default function SellerProfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isVerified, setIsVerified] = useState(true);

  // Status Verifikasi: 'pending' (0) | 'approved' (1) | 'rejected' (2)
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  // Dokumen dari backend
  const [docsData, setDocsData] = useState<{
    ktp_file_url?: string | null;
    nib_file_url?: string | null;
    sample_product_images?: string[] | string | null;
  }>({});

  // Modals & form re-upload
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isPopupAlertOpen, setIsPopupAlertOpen] = useState(false);
  const [reuploadKtp, setReuploadKtp] = useState<File | null>(null);
  const [reuploadNib, setReuploadNib] = useState<File | null>(null);
  const [reuploadProducts, setReuploadProducts] = useState<File[]>([]);
  const [reuploadSubmitting, setReuploadSubmitting] = useState(false);

  const [profile, setProfile] = useState<ProfileData>(INITIAL);
  const [preview, setPreview] = useState<string>("");
  const [imgError, setImgError] = useState(false);
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

  // Kelengkapan dokumen
  const hasKtp = Boolean(docsData.ktp_file_url && docsData.ktp_file_url.trim() !== "" && docsData.ktp_file_url !== "null");
  const hasNib = Boolean(docsData.nib_file_url && docsData.nib_file_url.trim() !== "" && docsData.nib_file_url !== "null");

  let productImagesList: string[] = [];
  if (Array.isArray(docsData.sample_product_images)) {
    productImagesList = docsData.sample_product_images;
  } else if (typeof docsData.sample_product_images === "string" && docsData.sample_product_images.trim()) {
    try {
      const parsed = JSON.parse(docsData.sample_product_images);
      if (Array.isArray(parsed)) productImagesList = parsed;
      else productImagesList = [docsData.sample_product_images];
    } catch {
      productImagesList = [docsData.sample_product_images];
    }
  }
  const hasProducts = productImagesList.length >= 1;
  const isDocsIncomplete = !hasKtp || !hasNib || !hasProducts;

  // Fungsi fetch data profil & status verifikasi dari backend
  async function fetchProfileData() {
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
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
        if (d.avatar_url && isCustomAvatar(d.avatar_url)) {
          setPreview(getImageUrl(d.avatar_url));
        } else {
          setPreview("");
        }
        if (d.banner_url) {
          setBannerPreview(getImageUrl(d.banner_url));
        }

        // Dokumen & verifikasi
        setDocsData({
          ktp_file_url: d.ktp_file_url,
          nib_file_url: d.nib_file_url,
          sample_product_images: d.sample_product_images,
        });

        const reason = d.rejection_reason || null;
        setRejectionReason(reason);

        let status: "pending" | "approved" | "rejected" = "pending";
        if (d.is_verified === 1 || d.is_verified === true) {
          status = "approved";
        } else if (d.is_verified === 2 || reason) {
          status = "rejected";
        } else {
          status = "pending";
        }
        setVerificationStatus(status);
        setIsVerified(status === "approved");

        // Tampilkan pop-up pengumuman verifikasi pertama kali jika toko belum terverifikasi
        if (status !== "approved") {
          const popupKey = `has_seen_popup_${d.id || "mitra"}_${status}`;
          if (typeof window !== "undefined" && !sessionStorage.getItem(popupKey)) {
            setIsPopupAlertOpen(true);
            sessionStorage.setItem(popupKey, "1");
          }
        }

        // Sinkronisasi status mutakhir ke localStorage
        if (typeof window !== "undefined") {
          const userStr = localStorage.getItem("user");
          let parsedUser = {};
          try { parsedUser = userStr ? JSON.parse(userStr) : {}; } catch { }
          localStorage.setItem("user", JSON.stringify({
            ...parsedUser,
            name: d.name || profile.ownerName,
            store_name: d.store_name || profile.storeName,
            is_verified: d.is_verified,
            rejection_reason: reason,
          }));
        }
      }
    } catch (err) {
      console.warn("Gagal memuat profil toko dari backend:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!storedToken) {
      router.push("/login");
      return;
    }

    fetchProfileData();
  }, [router]);

  function handleChange(field: keyof ProfileData, value: string) {
    setProfile(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  // Handler saat memilih banner baru
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setSaved(false);
  }

  // Handler saat memilih foto profil baru
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBannerPreview(url);
    setSaved(false);
    toast.success("Banner toko berhasil diganti!");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    toast.success("Profil toko berhasil disimpan!");
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

  async function handleReuploadSubmit(e: React.FormEvent) {
    e.preventDefault();
    setReuploadSubmitting(true);
    try {
      const formData = new FormData();
      if (reuploadKtp) formData.append("ktp_file", reuploadKtp);
      if (reuploadNib) formData.append("nib_file", reuploadNib);
      reuploadProducts.forEach(f => formData.append("sample_product_images", f));

      await api.post("/auth/reupload-docs", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Dokumen berhasil diunggah ulang! Menunggu verifikasi admin.");
      setIsDocModalOpen(false);
      await fetchProfileData();
    } catch (err: any) {
      console.error("Gagal unggah dokumen:", err);
      toast.error(err?.response?.data?.message || "Gagal mengunggah ulang dokumen");
    } finally {
      setReuploadSubmitting(false);
    }
  }

  const storeDisplayName = profile.storeName || profile.ownerName || "Toko";
  const initials = storeDisplayName
    .trim()
    .split(/\s+/)
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "DC";

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
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--bark)", marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>
          Edit Profil Toko
        </h1>
        <p style={{ color: "var(--bark-muted)", fontSize: "0.95rem" }}>
          Lengkapi informasi toko agar lebih mudah ditemukan dan dipercaya pelanggan.
        </p>
      </header>

      {/* ── Banners Pengumuman Status Verifikasi ── */}
      {verificationStatus === "rejected" && (
        <div style={{
          marginBottom: "1.75rem",
          background: "linear-gradient(135deg, #fff1f2 0%, #fff5f5 100%)",
          border: "1.5px solid #fecdd3",
          borderRadius: "1rem",
          padding: "1.25rem 1.5rem",
          boxShadow: "0 4px 15px rgba(225, 29, 72, 0.06)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem"
        }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flex: 1, minWidth: 0 }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "#fee2e2", border: "2px solid #fca5a5",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0
              }}>
                <WarningCircle size={24} color="#e11d48" weight="fill" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase",
                    letterSpacing: "0.05em", background: "#ffe4e6", color: "#be123c",
                    padding: "0.2rem 0.6rem", borderRadius: "9999px", flexShrink: 0
                  }}>
                    Pengajuan Ditolak
                  </span>
                  <span style={{ fontSize: "0.78rem", color: "#9f1239", fontWeight: 600 }}>
                    Perlu Perbaikan Dokumen
                  </span>
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#881337", margin: "0 0 0.25rem" }}>
                  Pendaftaran Toko Anda Ditolak oleh Admin
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#9f1239", margin: 0, lineHeight: 1.5 }}>
                  Admin telah meninjau pengajuan toko Anda dan menemukan data/dokumen yang perlu disesuaikan. Silakan perbaiki untuk mengajukan kembali.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDocModalOpen(true)}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                background: "#be123c", color: "#fff",
                padding: "0.65rem 1.25rem", borderRadius: "0.75rem",
                fontWeight: 700, fontSize: "0.875rem", border: "none",
                cursor: "pointer", boxShadow: "0 4px 12px rgba(190, 18, 60, 0.25)",
                transition: "all 0.2s ease",
                flexShrink: 0,
                whiteSpace: "nowrap"
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#9f1239")}
              onMouseLeave={e => (e.currentTarget.style.background = "#be123c")}
            >
              <UploadSimple size={18} weight="bold" />
              Perbaiki &amp; Unggah Ulang Dokumen
            </button>
          </div>

          {/* Alasan Penolakan Callout Box */}
          <div style={{
            background: "#fff",
            border: "1px solid #fecdd3",
            borderLeft: "4px solid #e11d48",
            borderRadius: "0.625rem",
            padding: "0.9rem 1.15rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", color: "#be123c", fontSize: "0.8rem", fontWeight: 700 }}>
              <ChatText size={16} weight="bold" />
              Alasan Penolakan dari Admin:
            </div>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#4c0519", fontWeight: 600, lineHeight: 1.5 }}>
              {rejectionReason || "Dokumen belum lengkap atau tidak sesuai dengan standar kurasi DinoyoCraft."}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px dashed #fecdd3", paddingTop: "0.75rem", fontSize: "0.78rem", color: "#9f1239", flexWrap: "wrap", gap: "0.5rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <LockKey size={14} weight="bold" />
              Menu sidebar dan fitur dashboard lainnya terkunci sampai dokumen diperbaiki dan disetujui admin.
            </span>
            <button
              type="button"
              onClick={() => setIsPopupAlertOpen(true)}
              style={{ background: "none", border: "none", color: "#be123c", fontWeight: 700, cursor: "pointer", textDecoration: "underline", fontSize: "0.78rem" }}
            >
              Lihat Detail Pengumuman
            </button>
          </div>
        </div>
      )}

      {verificationStatus === "pending" && (
        <div style={{
          marginBottom: "1.75rem",
          background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
          border: "1.5px solid #fde68a",
          borderRadius: "1rem",
          padding: "1.25rem 1.5rem",
          boxShadow: "0 4px 15px rgba(217, 119, 6, 0.06)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem"
        }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flex: 1, minWidth: 0 }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "#fef3c7", border: "2px solid #fcd34d",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0
              }}>
                <Clock size={24} color="#d97706" weight="fill" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase",
                    letterSpacing: "0.05em", background: "#fde68a", color: "#92400e",
                    padding: "0.2rem 0.6rem", borderRadius: "9999px", flexShrink: 0
                  }}>
                    Menunggu Verifikasi Admin
                  </span>
                  {isDocsIncomplete ? (
                    <span style={{ fontSize: "0.78rem", color: "#b45309", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Warning size={14} weight="bold" /> Dokumen Belum Lengkap
                    </span>
                  ) : (
                    <span style={{ fontSize: "0.78rem", color: "#15803d", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <CheckCircle size={14} weight="fill" /> Dokumen Lengkap (Dalam Antrean)
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#78350f", margin: "0 0 0.25rem" }}>
                  Pendaftaran Toko Anda Sedang Ditinjau Admin
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#92400e", margin: 0, lineHeight: 1.5 }}>
                  {isDocsIncomplete
                    ? "Terdapat dokumen persyaratan yang belum lengkap. Harap segera lengkapi agar proses verifikasi dapat disetujui."
                    : "Tim admin DinoyoCraft sedang meninjau pendaftaran dan dokumen toko Anda (estimasi 1x24 jam kerja)."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDocModalOpen(true)}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                background: isDocsIncomplete ? "var(--clay)" : "#b45309", color: "#fff",
                padding: "0.65rem 1.25rem", borderRadius: "0.75rem",
                fontWeight: 700, fontSize: "0.875rem", border: "none",
                cursor: "pointer", boxShadow: "0 4px 12px rgba(180, 83, 9, 0.2)",
                transition: "all 0.2s ease",
                flexShrink: 0,
                whiteSpace: "nowrap"
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              <UploadSimple size={18} weight="bold" />
              {isDocsIncomplete ? "Lengkapi Dokumen Sekarang" : "Perbarui / Cek Dokumen"}
            </button>
          </div>

          {/* Status checklist dokumen mini */}
          <div style={{
            background: "#fff",
            border: "1px solid #fde68a",
            borderRadius: "0.625rem",
            padding: "0.75rem 1.15rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap", fontSize: "0.82rem" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: hasKtp ? "#15803d" : "#b45309", fontWeight: 600 }}>
                {hasKtp ? <CheckCircle size={15} weight="fill" color="#16a34a" /> : <WarningCircle size={15} weight="bold" color="#d97706" />}
                KTP Pemilik {hasKtp ? "✓" : "(Belum Ada)"}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: hasNib ? "#15803d" : "#b45309", fontWeight: 600 }}>
                {hasNib ? <CheckCircle size={15} weight="fill" color="#16a34a" /> : <WarningCircle size={15} weight="bold" color="#d97706" />}
                NIB / Surat Usaha {hasNib ? "✓" : "(Belum Ada)"}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: hasProducts ? "#15803d" : "#b45309", fontWeight: 600 }}>
                {hasProducts ? <CheckCircle size={15} weight="fill" color="#16a34a" /> : <WarningCircle size={15} weight="bold" color="#d97706" />}
                Foto Produk {hasProducts ? `(${productImagesList.length} Foto)` : "(Belum Ada)"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsPopupAlertOpen(true)}
              style={{ background: "none", border: "none", color: "#b45309", fontWeight: 700, cursor: "pointer", textDecoration: "underline", fontSize: "0.78rem" }}
            >
              Lihat Detail Pengumuman
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "#92400e" }}>
            <LockKey size={14} weight="bold" />
            Menu sidebar dan transaksi toko lainnya terkunci sementara sampai akun disetujui admin.
          </div>
        </div>
      )}

      {verificationStatus === "approved" && (
        <div style={{
          marginBottom: "1.75rem",
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "0.875rem",
          padding: "0.85rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <CheckCircle size={22} color="#16a34a" weight="fill" />
            <div>
              <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#166534" }}>
                Akun Toko Resmi Terverifikasi
              </span>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#15803d" }}>
                Toko Anda telah memenuhi semua persyaratan kurasi DinoyoCraft. Semua fitur dashboard aktif sepenuhnya.
              </p>
            </div>
          </div>
        </div>
      )}

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
                    background: preview && !imgError && isCustomAvatar(preview) ? "transparent" : "linear-gradient(135deg, var(--clay), #c0673d)",
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
              background: isVerified ? "#f0fdf4" : verificationStatus === "rejected" ? "#fff1f2" : "#fffbeb",
              border: `1px solid ${isVerified ? "#bbf7d0" : verificationStatus === "rejected" ? "#fecdd3" : "#fde68a"}`,
              borderRadius: "0.75rem",
              padding: "1rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                {isVerified ? (
                  <CheckCircle size={18} color="#16a34a" weight="fill" />
                ) : verificationStatus === "rejected" ? (
                  <WarningCircle size={18} color="#e11d48" weight="fill" />
                ) : (
                  <Clock size={18} color="#d97706" weight="fill" />
                )}
                <span style={{
                  fontSize: "0.85rem", fontWeight: 700,
                  color: isVerified ? "#15803d" : verificationStatus === "rejected" ? "#be123c" : "#b45309"
                }}>
                  {isVerified ? "Toko Terverifikasi" : verificationStatus === "rejected" ? "Verifikasi Ditolak" : "Menunggu Verifikasi"}
                </span>
              </div>
              <p style={{
                fontSize: "0.75rem",
                color: isVerified ? "#166534" : verificationStatus === "rejected" ? "#9f1239" : "#92400e",
                lineHeight: 1.5, margin: "0 0 0.75rem"
              }}>
                {isVerified
                  ? "Toko Anda sudah diverifikasi oleh tim DinoyoCraft. Semua fitur transaksi aktif."
                  : verificationStatus === "rejected"
                    ? "Pengajuan toko ditolak oleh admin. Perbaiki dokumen yang tidak sesuai."
                    : isDocsIncomplete
                      ? "Dokumen persyaratan toko belum lengkap. Harap segera lengkapi agar segera diverifikasi."
                      : "Pengajuan akun toko Anda sedang dalam peninjauan oleh tim admin DinoyoCraft."}
              </p>
              {!isVerified && (
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(true)}
                  style={{
                    width: "100%", padding: "0.45rem",
                    borderRadius: "0.5rem",
                    background: verificationStatus === "rejected" ? "#be123c" : "#b45309",
                    color: "#fff", fontSize: "0.75rem", fontWeight: 700,
                    border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem"
                  }}
                >
                  <UploadSimple size={14} weight="bold" />
                  {verificationStatus === "rejected" ? "Perbaiki Dokumen" : isDocsIncomplete ? "Lengkapi Dokumen" : "Cek / Unggah Ulang"}
                </button>
              )}
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

      {/* ── Modal Pop-up Pengumuman Status Verifikasi ── */}
      {isPopupAlertOpen && (
        <div
          onClick={() => setIsPopupAlertOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 250,
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
            animation: "fadeIn 0.2s ease-out"
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: "1.25rem", width: "100%", maxWidth: 540,
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden",
              display: "flex", flexDirection: "column"
            }}
          >
            {/* Header Modal */}
            <div style={{
              background: verificationStatus === "rejected"
                ? "linear-gradient(135deg, #9f1239, #e11d48)"
                : "linear-gradient(135deg, #92400e, #d97706)",
              padding: "1.25rem 1.5rem",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {verificationStatus === "rejected" ? (
                    <WarningCircle size={22} color="#fff" weight="fill" />
                  ) : (
                    <Clock size={22} color="#fff" weight="fill" />
                  )}
                </div>
                <div>
                  <h3 style={{ color: "#fff", fontWeight: 800, fontSize: "1.05rem", margin: 0 }}>
                    {verificationStatus === "rejected"
                      ? "Pemberitahuan: Pengajuan Ditolak"
                      : "Pemberitahuan: Status Pendaftaran Mitra"}
                  </h3>
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.78rem", margin: 0 }}>
                    {verificationStatus === "rejected"
                      ? "Terdapat berkas yang perlu diperbaiki"
                      : "Verifikasi toko dalam proses peninjauan"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPopupAlertOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%",
                  width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#fff"
                }}
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            {/* Isi Modal */}
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {verificationStatus === "rejected" ? (
                <>
                  <p style={{ fontSize: "0.875rem", color: "var(--bark)", lineHeight: 1.6, margin: 0 }}>
                    Halo <strong>{profile.ownerName}</strong>, admin telah meninjau pendaftaran toko <strong>{profile.storeName}</strong>, namun belum dapat menyetujuinya karena alasan berikut:
                  </p>

                  <div style={{
                    background: "#fff1f2", border: "1px solid #fecdd3",
                    borderLeft: "4px solid #e11d48", borderRadius: "0.625rem",
                    padding: "1rem 1.15rem"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#be123c", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                      <ChatText size={16} weight="bold" />
                      Alasan Penolakan dari Admin:
                    </div>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#881337", fontWeight: 700, lineHeight: 1.5 }}>
                      &ldquo;{rejectionReason || "Dokumen persyaratan belum lengkap atau tidak sesuai standar kurasi DinoyoCraft."}&rdquo;
                    </p>
                  </div>

                  <div style={{
                    background: "#f9fafb", borderRadius: "0.75rem", padding: "0.85rem 1rem",
                    border: "1px solid var(--line)", fontSize: "0.8rem", color: "var(--bark-muted)",
                    display: "flex", alignItems: "flex-start", gap: "0.5rem"
                  }}>
                    <LockKey size={16} color="var(--bark)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>
                      Menu sidebar dashboard lainnya terkunci sementara. Anda hanya dapat mengakses halaman profil ini untuk melengkapi dan memperbaiki dokumen toko Anda.
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: "0.875rem", color: "var(--bark)", lineHeight: 1.6, margin: 0 }}>
                    Halo <strong>{profile.ownerName}</strong>, akun toko <strong>{profile.storeName}</strong> sedang dalam antrean kurasi dan verifikasi oleh tim kurator DinoyoCraft.
                  </p>

                  <div style={{
                    background: "#fffbeb", border: "1px solid #fde68a",
                    borderRadius: "0.75rem", padding: "1rem"
                  }}>
                    <p style={{ fontWeight: 700, fontSize: "0.82rem", color: "#92400e", margin: "0 0 0.5rem" }}>
                      Status Kelengkapan Dokumen:
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.82rem" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--bark)" }}>1. KTP Pemilik Usaha</span>
                        <span style={{ fontWeight: 700, color: hasKtp ? "#15803d" : "#b45309" }}>
                          {hasKtp ? "✓ Terunggah" : "⚠ Belum Lengkap"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--bark)" }}>2. NIB / Surat Keterangan Usaha</span>
                        <span style={{ fontWeight: 700, color: hasNib ? "#15803d" : "#b45309" }}>
                          {hasNib ? "✓ Terunggah" : "⚠ Belum Lengkap"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--bark)" }}>3. Foto Sampel Produk (Min. 3 Foto)</span>
                        <span style={{ fontWeight: 700, color: hasProducts ? "#15803d" : "#b45309" }}>
                          {hasProducts ? `✓ Terunggah (${productImagesList.length} Foto)` : "⚠ Belum Lengkap"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isDocsIncomplete ? (
                    <div style={{
                      background: "#fff7ed", border: "1px solid #fed7aa",
                      borderRadius: "0.625rem", padding: "0.75rem 1rem",
                      fontSize: "0.8rem", color: "#c2410c", display: "flex", alignItems: "center", gap: "0.5rem"
                    }}>
                      <Warning size={16} weight="bold" />
                      <span>Masih ada dokumen yang belum lengkap. Harap segera lengkapi agar verifikasi admin dapat disetujui.</span>
                    </div>
                  ) : (
                    <div style={{
                      background: "#f0fdf4", border: "1px solid #bbf7d0",
                      borderRadius: "0.625rem", padding: "0.75rem 1rem",
                      fontSize: "0.8rem", color: "#166534", display: "flex", alignItems: "center", gap: "0.5rem"
                    }}>
                      <CheckCircle size={16} weight="fill" color="#16a34a" />
                      <span>Dokumen lengkap. Tim admin sedang memverifikasi toko Anda (estimasi 1x24 jam kerja).</span>
                    </div>
                  )}

                  <div style={{
                    background: "#f9fafb", borderRadius: "0.75rem", padding: "0.75rem 1rem",
                    border: "1px solid var(--line)", fontSize: "0.78rem", color: "var(--bark-muted)",
                    display: "flex", alignItems: "center", gap: "0.5rem"
                  }}>
                    <LockKey size={14} color="var(--bark)" />
                    <span>Fitur transaksi & menu lainnya terbuka otomatis setelah akun diverifikasi.</span>
                  </div>
                </>
              )}
            </div>

            {/* Footer Modal */}
            <div style={{
              padding: "1rem 1.5rem", borderTop: "1px solid #e5e7eb",
              display: "flex", gap: "0.75rem", justifyContent: "flex-end", background: "#fafafa"
            }}>
              <button
                type="button"
                onClick={() => setIsPopupAlertOpen(false)}
                style={{
                  padding: "0.65rem 1.25rem", borderRadius: "0.625rem",
                  border: "1px solid var(--line)", background: "#fff",
                  color: "var(--bark)", fontSize: "0.85rem", fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                {verificationStatus === "rejected" || isDocsIncomplete ? "Lanjut ke Profil" : "Saya Mengerti"}
              </button>

              {(verificationStatus === "rejected" || isDocsIncomplete) && (
                <button
                  type="button"
                  onClick={() => {
                    setIsPopupAlertOpen(false);
                    setIsDocModalOpen(true);
                  }}
                  style={{
                    padding: "0.65rem 1.25rem", borderRadius: "0.625rem",
                    background: verificationStatus === "rejected" ? "#be123c" : "var(--clay)",
                    color: "#fff", fontSize: "0.85rem", fontWeight: 700,
                    border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "0.4rem"
                  }}
                >
                  <UploadSimple size={16} weight="bold" />
                  {verificationStatus === "rejected" ? "Perbaiki Dokumen Sekarang" : "Lengkapi Dokumen"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Lengkapi / Perbaiki & Unggah Ulang Dokumen ── */}
      {isDocModalOpen && (
        <div
          onClick={() => !reuploadSubmitting && setIsDocModalOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 300,
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
            animation: "fadeIn 0.2s ease-out"
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: "1.25rem", width: "100%", maxWidth: 620,
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden",
              display: "flex", flexDirection: "column", maxHeight: "90vh"
            }}
          >
            {/* Header Modal */}
            <div style={{
              background: verificationStatus === "rejected"
                ? "linear-gradient(135deg, #881337, #be123c)"
                : "linear-gradient(135deg, #3b3025, #5a3d28)",
              padding: "1.25rem 1.5rem",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              flexShrink: 0
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <IdentificationCard size={22} color="#fff" weight="duotone" />
                </div>
                <div>
                  <h3 style={{ color: "#fff", fontWeight: 800, fontSize: "1.05rem", margin: 0 }}>
                    {verificationStatus === "rejected"
                      ? "Perbaiki Dokumen Pendaftaran"
                      : "Lengkapi Dokumen Persyaratan Toko"}
                  </h3>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.78rem", margin: 0 }}>
                    Unggah berkas KTP, NIB, dan foto produk terbaru untuk diverifikasi ulang
                  </p>
                </div>
              </div>
              <button
                disabled={reuploadSubmitting}
                onClick={() => setIsDocModalOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%",
                  width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: reuploadSubmitting ? "not-allowed" : "pointer", color: "#fff"
                }}
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleReuploadSubmit} style={{ display: "flex", flexDirection: "column", overflowY: "auto", flex: 1 }}>
              <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                {/* Catatan Rejection jika ditolak */}
                {rejectionReason && (
                  <div style={{
                    background: "#fff1f2", border: "1px solid #fecdd3",
                    borderLeft: "4px solid #e11d48", borderRadius: "0.625rem",
                    padding: "0.85rem 1rem"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#be123c", fontSize: "0.78rem", fontWeight: 700, marginBottom: "0.2rem" }}>
                      <ChatText size={15} weight="bold" />
                      Catatan Penolakan Admin:
                    </div>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#881337", fontWeight: 600, lineHeight: 1.5 }}>
                      {rejectionReason}
                    </p>
                  </div>
                )}

                {/* 1. KTP */}
                <div style={{
                  border: "1px solid var(--line)", borderRadius: "0.75rem", padding: "1rem",
                  background: "#fafafa"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--bark)" }}>
                      1. KTP Pemilik Usaha
                    </label>
                    <span style={{
                      fontSize: "0.72rem", fontWeight: 700,
                      color: reuploadKtp ? "#15803d" : hasKtp ? "#15803d" : "#b45309",
                      background: reuploadKtp ? "#dcfce7" : hasKtp ? "#f0fdf4" : "#fef3c7",
                      padding: "0.2rem 0.5rem", borderRadius: "0.35rem"
                    }}>
                      {reuploadKtp
                        ? `✓ File Baru: ${reuploadKtp.name}`
                        : hasKtp
                          ? "✓ Dokumen Tersimpan"
                          : "⚠ Belum Terunggah"}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "var(--bark-muted)", margin: "0 0 0.65rem" }}>
                    Format .jpg, .jpeg, .png, atau .pdf (Maks. 5MB). Pastikan tulisan dan foto KTP terbaca jelas.
                  </p>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={e => setReuploadKtp(e.target.files?.[0] || null)}
                    style={{ ...inputStyle, padding: "0.45rem", fontSize: "0.8rem", background: "#fff" }}
                  />
                  {reuploadKtp && (
                    <span style={{ display: "block", fontSize: "0.75rem", color: "var(--clay)", fontWeight: 600, marginTop: "0.35rem" }}>
                      File siap diunggah: {reuploadKtp.name} ({(reuploadKtp.size / 1024).toFixed(0)} KB)
                    </span>
                  )}
                </div>

                {/* 2. NIB */}
                <div style={{
                  border: "1px solid var(--line)", borderRadius: "0.75rem", padding: "1rem",
                  background: "#fafafa"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--bark)" }}>
                      2. Surat Keterangan Usaha / NIB
                    </label>
                    <span style={{
                      fontSize: "0.72rem", fontWeight: 700,
                      color: reuploadNib ? "#15803d" : hasNib ? "#15803d" : "#b45309",
                      background: reuploadNib ? "#dcfce7" : hasNib ? "#f0fdf4" : "#fef3c7",
                      padding: "0.2rem 0.5rem", borderRadius: "0.35rem"
                    }}>
                      {reuploadNib
                        ? `✓ File Baru: ${reuploadNib.name}`
                        : hasNib
                          ? "✓ Dokumen Tersimpan"
                          : "⚠ Belum Terunggah"}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "var(--bark-muted)", margin: "0 0 0.65rem" }}>
                    Format .jpg, .jpeg, .png, atau .pdf (Maks. 5MB). Surat Keterangan Domisili Usaha dari Kelurahan / NIB OSS.
                  </p>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={e => setReuploadNib(e.target.files?.[0] || null)}
                    style={{ ...inputStyle, padding: "0.45rem", fontSize: "0.8rem", background: "#fff" }}
                  />
                  {reuploadNib && (
                    <span style={{ display: "block", fontSize: "0.75rem", color: "var(--clay)", fontWeight: 600, marginTop: "0.35rem" }}>
                      File siap diunggah: {reuploadNib.name} ({(reuploadNib.size / 1024).toFixed(0)} KB)
                    </span>
                  )}
                </div>

                {/* 3. Foto Produk */}
                <div style={{
                  border: "1px solid var(--line)", borderRadius: "0.75rem", padding: "1rem",
                  background: "#fafafa"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--bark)" }}>
                      3. Foto Sampel Produk Keramik (Min. 3 Foto)
                    </label>
                    <span style={{
                      fontSize: "0.72rem", fontWeight: 700,
                      color: reuploadProducts.length > 0 ? "#15803d" : hasProducts ? "#15803d" : "#b45309",
                      background: reuploadProducts.length > 0 ? "#dcfce7" : hasProducts ? "#f0fdf4" : "#fef3c7",
                      padding: "0.2rem 0.5rem", borderRadius: "0.35rem"
                    }}>
                      {reuploadProducts.length > 0
                        ? `✓ ${reuploadProducts.length} Foto Baru Dipilih`
                        : hasProducts
                          ? `✓ ${productImagesList.length} Foto Tersimpan`
                          : "⚠ Belum Terunggah"}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "var(--bark-muted)", margin: "0 0 0.65rem" }}>
                    Pilih minimal 3 foto karya keramik asli buatan workshop Anda. Format .jpg, .jpeg, .png.
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png"
                    onChange={e => setReuploadProducts(e.target.files ? Array.from(e.target.files) : [])}
                    style={{ ...inputStyle, padding: "0.45rem", fontSize: "0.8rem", background: "#fff" }}
                  />
                  {reuploadProducts.length > 0 && (
                    <span style={{ display: "block", fontSize: "0.75rem", color: "var(--clay)", fontWeight: 600, marginTop: "0.35rem" }}>
                      {reuploadProducts.length} foto dipilih: {reuploadProducts.map(f => f.name).join(", ")}
                    </span>
                  )}
                </div>

                <div style={{
                  fontSize: "0.78rem", color: "var(--bark-muted)", lineHeight: 1.5,
                  padding: "0.75rem", background: "#f5f5f4", borderRadius: "0.5rem"
                }}>
                  💡 <em>Catatan: Anda dapat mengunggah hanya dokumen yang ingin diperbaiki atau dilengkapi. Dokumen yang tidak dipilih ulang akan tetap menggunakan dokumen sebelumnya yang sudah ada di sistem.</em>
                </div>

              </div>

              {/* Footer Modal Form */}
              <div style={{
                padding: "1rem 1.5rem", borderTop: "1px solid #e5e7eb",
                display: "flex", gap: "0.75rem", justifyContent: "flex-end", background: "#fafafa",
                flexShrink: 0
              }}>
                <button
                  type="button"
                  disabled={reuploadSubmitting}
                  onClick={() => setIsDocModalOpen(false)}
                  style={{
                    padding: "0.7rem 1.25rem", borderRadius: "0.625rem",
                    border: "1px solid var(--line)", background: "#fff",
                    color: "var(--bark)", fontSize: "0.85rem", fontWeight: 600,
                    cursor: reuploadSubmitting ? "not-allowed" : "pointer"
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={reuploadSubmitting}
                  style={{
                    padding: "0.7rem 1.5rem", borderRadius: "0.625rem",
                    background: reuploadSubmitting ? "var(--clay-light, #d4956a)" : "var(--clay)",
                    color: "#fff", fontSize: "0.85rem", fontWeight: 700,
                    border: "none", cursor: reuploadSubmitting ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", gap: "0.5rem"
                  }}
                >
                  {reuploadSubmitting ? (
                    <>
                      <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      Mengunggah...
                    </>
                  ) : (
                    <>
                      <UploadSimple size={16} weight="bold" />
                      Kirim &amp; Ajukan Ulang Verifikasi
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

