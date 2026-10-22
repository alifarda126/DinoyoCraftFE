"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Check, X, Storefront, MagnifyingGlass, Eye,
  IdentificationCard, FileText, CheckSquare, Warning,
  Phone, EnvelopeSimple, MapPin, CalendarBlank, User,
  WarningCircle, ChatText
} from "@phosphor-icons/react";
import { EarthySelect } from "@/components/ui/EarthySelect";
import { adminService } from "@/services/admin.service";

type StoreRegistration = {
  id: string | number;
  owner_name: string;
  phone: string;
  email: string;
  store_name: string;
  address: string;
  year_started: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  date: string;
  docs: {
    ktp: boolean;
    usaha: boolean;
    sop: boolean;
    setuju: boolean;
  };
  ktp_file_url?: string;
  nib_file_url?: string;
};

const REJECTION_PRESETS = [
  "Dokumen KTP tidak jelas, buram, atau terpotong",
  "Surat Keterangan Usaha / NIB tidak sesuai atau tidak valid",
  "Foto produk tidak memenuhi standar keramik (min. 3 foto berkualitas)",
  "Data alamat workshop tidak lengkap atau tidak dapat diverifikasi",
  "Lainnya (Tulis catatan khusus)"
];

export default function AdminVerifikasiPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<StoreRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState<StoreRegistration | null>(null);
  const [docPreview, setDocPreview] = useState<{ url: string; label: string } | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterDok, setFilterDok] = useState("semua");

  // State untuk modal penolakan pengajuan
  const [rejectModalReg, setRejectModalReg] = useState<StoreRegistration | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>(REJECTION_PRESETS[0]);
  const [customReason, setCustomReason] = useState<string>("");
  const [rejecting, setRejecting] = useState<boolean>(false);

  // 1. Ambil data pengajuan toko dari backend
  const fetchVerifikasi = async () => {
    setLoading(true);
    try {
      const res = await adminService.getVerifikasiList();
      const rawData = res.data || res;

      if (Array.isArray(rawData)) {
        const isValidUrl = (url?: string | null) =>
          Boolean(url && typeof url === "string" && url.trim() !== "" && url !== "null" && url !== "undefined");

        const mappedData: StoreRegistration[] = rawData.map((item: any) => {
          let status: "pending" | "approved" | "rejected" = "pending";
          if (item.is_verified === 1) {
            status = "approved";
          } else if (item.is_verified === 2 || item.rejection_reason || (item.is_verified === 0 && item.is_active === 0)) {
            status = "rejected";
          } else {
            status = "pending";
          }

          const hasKtp = isValidUrl(item.ktp_file_url);
          const hasNib = isValidUrl(item.nib_file_url);

          return {
            id: item.id,
            owner_name: item.owner_name || "Pemilik Toko",
            phone: item.whatsapp_number || "-",
            email: item.email || "-",
            store_name: item.store_name || "Toko Mitra",
            address: item.workshop_address || "-",
            year_started: String(item.started_year || "-"),
            status,
            rejection_reason: item.rejection_reason || undefined,
            date: item.created_at
              ? new Date(item.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
              : "-",
            docs: {
              ktp: hasKtp,
              usaha: hasNib || item.is_verified === 1,
              sop: true,
              setuju: true,
            },
            ktp_file_url: item.ktp_file_url,
            nib_file_url: item.nib_file_url,
          };
        });

        setRegistrations(mappedData);
      } else {
        setRegistrations([]);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("admin_verifikasi_updated"));
      }
    } catch (error: any) {
      console.error("Gagal memuat data verifikasi:", error);
      toast.error(error?.response?.data?.message || "Gagal memuat daftar pengajuan verifikasi toko.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifikasi();
  }, []);

  // 2. Handler untuk Setujui atau Tolak Pengajuan
  const handleUpdateStatus = async (
    id: string | number,
    newStatus: "approved" | "rejected",
    reason?: string
  ) => {
    try {
      const res = await adminService.verifyStore(Number(id), newStatus, reason);
      toast.success(res.message || `Pengajuan toko berhasil ${newStatus === "approved" ? "disetujui" : "ditolak"}.`);

      setSelectedReg(null);
      setRejectModalReg(null);
      await fetchVerifikasi();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("admin_verifikasi_updated"));
      }
    } catch (error: any) {
      console.error("Gagal memperbarui status:", error);
      toast.error(error?.response?.data?.message || "Gagal memperbarui status pengajuan toko.");
    }
  };

  // Konfirmasi tolak dengan alasan
  const handleConfirmReject = async () => {
    if (!rejectModalReg) return;
    setRejecting(true);
    try {
      let finalReason = selectedPreset;
      if (selectedPreset === "Lainnya (Tulis catatan khusus)" || customReason.trim()) {
        finalReason = customReason.trim()
          ? (selectedPreset.startsWith("Lainnya") ? customReason.trim() : `${selectedPreset}. Catatan: ${customReason.trim()}`)
          : selectedPreset;
      }
      await handleUpdateStatus(rejectModalReg.id, "rejected", finalReason);
    } finally {
      setRejecting(false);
    }
  };

  // 3. Handler download file langsung (blob — bypass CORS download restriction)
  const handleDownload = async (url: string, label: string) => {
    try {
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok) throw new Error("Gagal mengambil file");
      const blob = await response.blob();
      const ext = url.split(".").pop()?.split("?")[0] || "file";
      const fileName = `${label.replace(/[^a-zA-Z0-9]/g, "_")}.${ext}`;
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Gagal mengunduh file:", err);
      toast.error("Gagal mengunduh dokumen. Coba buka di tab baru.");
      window.open(url, "_blank");
    }
  };

  // Filter pencarian & status
  const filtered = registrations.filter((r) => {
    const matchSearch =
      r.store_name.toLowerCase().includes(search.toLowerCase()) ||
      r.owner_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "semua" || r.status === filterStatus;
    const docsComplete = Object.values(r.docs).every(Boolean);
    const matchDok =
      filterDok === "semua" ||
      (filterDok === "lengkap" && docsComplete) ||
      (filterDok === "tidak" && !docsComplete);
    return matchSearch && matchStatus && matchDok;
  });

  const DOCS_LIST = [
    { key: "ktp" as const, icon: IdentificationCard, label: "KTP / Identitas Diri Valid" },
    { key: "usaha" as const, icon: Storefront, label: "Memiliki Usaha Kerajinan yang Jelas" },
    { key: "sop" as const, icon: FileText, label: "Bersedia Ikuti SOP Packing & Pengiriman" },
    { key: "setuju" as const, icon: CheckSquare, label: "Menyetujui Syarat & Ketentuan Mitra" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-zinc-500 font-medium">Memuat data pengajuan...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 mb-1">Verifikasi Toko Mitra</h1>
        <p className="text-zinc-500 text-sm">Tinjau pengajuan Mitra baru dan cek kelengkapan dokumen persyaratan.</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Storefront size={24} weight="duotone" className="text-zinc-500" />
            Daftar Pengajuan ({filtered.length})
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari toko atau pemilik..."
                className="pl-9 pr-4 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:border-zinc-400 placeholder-zinc-400 text-zinc-800"
              />
            </div>
            <EarthySelect
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { value: "semua", label: "Semua Status" },
                { value: "pending", label: "Menunggu" },
                { value: "approved", label: "Disetujui" },
                { value: "rejected", label: "Ditolak" },
              ]}
            />
            <EarthySelect
              value={filterDok}
              onChange={setFilterDok}
              options={[
                { value: "semua", label: "Semua Dokumen" },
                { value: "lengkap", label: "Lengkap" },
                { value: "tidak", label: "Tidak Lengkap" },
              ]}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-sm text-zinc-500">
                <th className="p-4 font-medium">Toko & Pemilik</th>
                <th className="p-4 font-medium">Alamat</th>
                <th className="p-4 font-medium">Tanggal</th>
                <th className="p-4 font-medium">Dokumen</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500 text-sm">
                    Tidak ada pengajuan verifikasi toko yang ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((reg) => {
                  const docsComplete = Object.values(reg.docs).every(Boolean);
                  return (
                    <tr key={reg.id} className="border-b border-zinc-200 hover:bg-zinc-50 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-zinc-900">{reg.store_name}</div>
                        <div className="text-sm text-zinc-500">{reg.owner_name}</div>
                        {reg.status === "rejected" && reg.rejection_reason && (
                          <div className="mt-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 max-w-[280px] truncate" title={reg.rejection_reason}>
                            Alasan: {reg.rejection_reason}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-sm text-zinc-600 max-w-[200px]">
                        <span className="line-clamp-2">{reg.address}</span>
                      </td>
                      <td className="p-4 text-sm text-zinc-600 whitespace-nowrap">{reg.date}</td>
                      <td className="p-4">
                        {docsComplete ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full">
                            <Check size={12} weight="bold" /> Lengkap
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                            <Warning size={12} weight="fill" /> Tidak Lengkap
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${reg.status === "approved" ? "bg-green-100 text-green-800" :
                            reg.status === "rejected" ? "bg-red-100 text-red-800" :
                              "bg-yellow-100 text-yellow-800"
                          }`}>
                          {reg.status === "approved" ? "Disetujui" : reg.status === "rejected" ? "Ditolak" : "Menunggu"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {reg.status === "pending" && (
                            <>
                              {/* Tolak */}
                              <button
                                onClick={() => {
                                  setRejectModalReg(reg);
                                  setSelectedPreset(REJECTION_PRESETS[0]);
                                  setCustomReason("");
                                }}
                                className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                                title="Tolak Pengajuan"
                              >
                                <X size={18} weight="bold" />
                              </button>
                              {/* Setujui */}
                              <button
                                onClick={() => handleUpdateStatus(reg.id, "approved")}
                                className="p-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors cursor-pointer"
                                title="Setujui Pengajuan"
                              >
                                <Check size={18} weight="bold" />
                              </button>
                            </>
                          )}
                          {/* Lihat Detail */}
                          <button
                            onClick={() => setSelectedReg(reg)}
                            className="p-1.5 rounded-md bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors cursor-pointer"
                            title="Lihat Detail & Persyaratan"
                          >
                            <Eye size={18} weight="bold" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Konfirmasi Penolakan Pengajuan ── */}
      {rejectModalReg && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 250,
          background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        }}>
          <div style={{
            background: "#fff", borderRadius: "1.25rem", width: "100%", maxWidth: 520,
            boxShadow: "0 20px 48px rgba(0,0,0,0.2)", overflow: "hidden",
            display: "flex", flexDirection: "column",
          }}>
            {/* Header Modal */}
            <div style={{
              background: "#ef4444",
              padding: "1.25rem 1.5rem",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              color: "#fff",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <WarningCircle size={22} weight="bold" />
                <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>
                  Alasan Penolakan Pengajuan Toko
                </h2>
              </div>
              <button
                onClick={() => setRejectModalReg(null)}
                style={{
                  background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%",
                  width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#fff",
                }}
              >
                <X size={15} weight="bold" />
              </button>
            </div>

            {/* Body Modal */}
            <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "0.75rem", padding: "0.75rem 1rem" }}>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#991b1b" }}>
                  Menolak pengajuan toko: <strong>{rejectModalReg.store_name}</strong> ({rejectModalReg.owner_name})
                </p>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.72rem", color: "#b91c1c" }}>
                  Alasan penolakan ini akan dikirimkan dan muncul pada dashboard profil mitra agar dapat diperbaiki.
                </p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--bark)", marginBottom: "0.5rem" }}>
                  Pilih Alasan Penolakan Utama:
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                  {REJECTION_PRESETS.map((preset) => (
                    <label
                      key={preset}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: "0.5rem",
                        padding: "0.55rem 0.75rem", borderRadius: "0.5rem",
                        border: selectedPreset === preset ? "1.5px solid #ef4444" : "1px solid #e5e7eb",
                        background: selectedPreset === preset ? "#fef2f2" : "#fafafa",
                        cursor: "pointer", fontSize: "0.8rem", color: "var(--bark)",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <input
                        type="radio"
                        name="rejectionPreset"
                        checked={selectedPreset === preset}
                        onChange={() => setSelectedPreset(preset)}
                        style={{ marginTop: "0.15rem" }}
                      />
                      <span>{preset}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--bark)", marginBottom: "0.4rem" }}>
                  Catatan Tambahan untuk Mitra (Opsional):
                </label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Contoh: Foto KTP terpotong pada bagian NIK. Mohon foto ulang dengan pencahayaan terang."
                  rows={3}
                  style={{
                    width: "100%", padding: "0.65rem 0.85rem",
                    borderRadius: "0.625rem", border: "1.5px solid #d1d5db",
                    fontSize: "0.82rem", outline: "none", resize: "vertical",
                    boxSizing: "border-box", fontFamily: "inherit",
                  }}
                />
              </div>
            </div>

            {/* Footer Modal */}
            <div style={{
              padding: "1rem 1.5rem", borderTop: "1px solid #e5e7eb",
              display: "flex", gap: "0.75rem", justifyContent: "flex-end", background: "#fafafa"
            }}>
              <button
                type="button"
                onClick={() => setRejectModalReg(null)}
                disabled={rejecting}
                style={{
                  padding: "0.65rem 1.15rem", borderRadius: "0.625rem",
                  border: "1px solid #d1d5db", background: "#fff",
                  color: "#374151", fontWeight: 600, fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={rejecting}
                style={{
                  padding: "0.65rem 1.25rem", borderRadius: "0.625rem",
                  border: "none", background: "#dc2626",
                  color: "#fff", fontWeight: 700, fontSize: "0.85rem",
                  cursor: rejecting ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  boxShadow: "0 2px 8px rgba(220,38,38,0.25)",
                }}
              >
                {rejecting ? "Menolak..." : "Konfirmasi Tolak Pengajuan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Detail & Persyaratan ── */}
      {selectedReg && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.3)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        }}>
          <div style={{
            background: "#fff", borderRadius: "1.25rem", width: "100%", maxWidth: 560,
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)", overflow: "hidden",
            maxHeight: "90vh", display: "flex", flexDirection: "column",
          }}>
            {/* Header Modal */}
            <div style={{
              background: "linear-gradient(135deg,#3b3025,#5a3d28)",
              padding: "1.25rem 1.5rem",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.9rem", fontWeight: 800, color: "#fff",
                }}>
                  {selectedReg.store_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1rem", margin: 0 }}>
                    {selectedReg.store_name}
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.78rem", margin: 0 }}>
                    Detail & Verifikasi Persyaratan
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReg(null)}
                style={{
                  background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%",
                  width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#fff",
                }}
              >
                <X size={15} weight="bold" />
              </button>
            </div>

            {/* Isi Modal */}
            <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1 }}>
              {/* Alasan penolakan jika ada */}
              {selectedReg.status === "rejected" && selectedReg.rejection_reason && (
                <div style={{
                  background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "0.75rem",
                  padding: "0.85rem 1rem", marginBottom: "1.25rem", display: "flex", gap: "0.6rem", alignItems: "flex-start",
                }}>
                  <WarningCircle size={20} color="#dc2626" weight="fill" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <p style={{ margin: "0 0 0.2rem", fontSize: "0.8rem", fontWeight: 700, color: "#991b1b" }}>
                      Catatan Penolakan Admin:
                    </p>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#b91c1c", lineHeight: 1.5 }}>
                      {selectedReg.rejection_reason}
                    </p>
                  </div>
                </div>
              )}

              {/* Info Mitra */}
              <div style={{
                background: "#fafaf9", border: "1px solid #e7e5e4", borderRadius: "0.75rem",
                padding: "1rem", marginBottom: "1.25rem",
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.82rem" }}>
                  <div>
                    <span style={{ color: "#78716c", display: "block", fontSize: "0.72rem", marginBottom: "0.15rem" }}>PEMILIK USAHA</span>
                    <strong style={{ color: "var(--bark)" }}>{selectedReg.owner_name}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#78716c", display: "block", fontSize: "0.72rem", marginBottom: "0.15rem" }}>NOMOR WHATSAPP</span>
                    <strong style={{ color: "var(--bark)" }}>{selectedReg.phone}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#78716c", display: "block", fontSize: "0.72rem", marginBottom: "0.15rem" }}>EMAIL</span>
                    <strong style={{ color: "var(--bark)" }}>{selectedReg.email}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#78716c", display: "block", fontSize: "0.72rem", marginBottom: "0.15rem" }}>TAHUN MULAI</span>
                    <strong style={{ color: "var(--bark)" }}>{selectedReg.year_started}</strong>
                  </div>
                </div>
                <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #e7e5e4", fontSize: "0.82rem" }}>
                  <span style={{ color: "#78716c", display: "block", fontSize: "0.72rem", marginBottom: "0.15rem" }}>ALAMAT WORKSHOP</span>
                  <span style={{ color: "var(--bark)" }}>{selectedReg.address}</span>
                </div>
              </div>

              {/* Checklist Persyaratan */}
              <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--bark)", marginBottom: "0.75rem" }}>
                Pemeriksaan Kelengkapan Dokumen &amp; SOP
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
                {DOCS_LIST.map(doc => {
                  const ok = selectedReg.docs[doc.key];
                  const docUrl = doc.key === "ktp" ? selectedReg.ktp_file_url : doc.key === "usaha" ? selectedReg.nib_file_url : null;

                  return (
                    <div
                      key={doc.key}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "0.75rem 1rem", borderRadius: "0.6rem",
                        background: ok ? "rgba(22,163,74,0.06)" : "rgba(220,38,38,0.06)",
                        border: `1px solid ${ok ? "rgba(22,163,74,0.2)" : "rgba(220,38,38,0.2)"}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <doc.icon size={18} color={ok ? "#16a34a" : "#dc2626"} weight="duotone" />
                        <span style={{ fontSize: "0.83rem", fontWeight: 600, color: "var(--bark)" }}>
                          {doc.label}
                        </span>
                      </div>
                      <div style={{
                        display: "flex", alignItems: "center", gap: "0.35rem",
                        fontSize: "0.75rem", fontWeight: 700,
                        color: ok ? "#16a34a" : "#dc2626",
                      }}>
                        {ok ? <Check size={15} weight="bold" /> : <X size={15} weight="bold" />}
                        {ok ? "Terpenuhi" : "Tidak Terpenuhi"}

                        {/* Tombol Lihat Dokumen */}
                        {docUrl ? (
                          <button
                            title="Lihat Dokumen"
                            onClick={() => setDocPreview({ url: docUrl, label: doc.label })}
                            style={{
                              background: "transparent", border: "none", cursor: "pointer",
                              color: "#6b7280", display: "flex", alignItems: "center", padding: "0.2rem", marginLeft: "0.5rem",
                              borderRadius: "0.3rem", transition: "background 0.2s",
                            }}
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.05)"}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
                          >
                            <Eye size={18} weight="bold" />
                          </button>
                        ) : (
                          <button
                            disabled
                            title={doc.key === "ktp" || doc.key === "usaha" ? "Dokumen belum diunggah" : "Tidak memerlukan file"}
                            style={{
                              background: "transparent", border: "none", cursor: "not-allowed",
                              color: "#d1d5db", display: "flex", alignItems: "center", padding: "0.2rem", marginLeft: "0.5rem",
                              borderRadius: "0.3rem",
                            }}
                          >
                            <Eye size={18} weight="bold" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Peringatan jika dokumen tidak lengkap */}
              {!Object.values(selectedReg.docs).every(Boolean) && (
                <div style={{
                  display: "flex", gap: "0.75rem", alignItems: "flex-start",
                  background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "0.75rem", padding: "1rem",
                  marginBottom: "1.25rem",
                }}>
                  <Warning size={18} color="#b45309" weight="duotone" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: "0.82rem", color: "#92400e", lineHeight: 1.6, margin: 0 }}>
                    Terdapat persyaratan yang belum terpenuhi. Disarankan untuk <strong>menolak</strong> pengajuan ini dan meminta pendaftar melengkapi data kembali.
                  </p>
                </div>
              )}
            </div>

            {/* Footer aksi */}
            {selectedReg.status === "pending" && (
              <div style={{
                padding: "1.25rem 1.5rem", borderTop: "1px solid #e5e7eb",
                display: "flex", gap: "0.75rem", flexShrink: 0,
              }}>
                <button
                  onClick={() => {
                    setRejectModalReg(selectedReg);
                    setSelectedPreset(REJECTION_PRESETS[0]);
                    setCustomReason("");
                  }}
                  style={{
                    flex: 1, padding: "0.8rem", borderRadius: "0.75rem",
                    background: "#fff", border: "1.5px solid #fca5a5",
                    color: "#dc2626", fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  }}
                >
                  <X size={16} weight="bold" /> Tolak Pengajuan
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedReg.id, "approved")}
                  style={{
                    flex: 1, padding: "0.8rem", borderRadius: "0.75rem",
                    background: "#16a34a", border: "none",
                    color: "#fff", fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  }}
                >
                  <Check size={16} weight="bold" /> Setujui Pengajuan
                </button>
              </div>
            )}
            {selectedReg.status !== "pending" && (
              <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid #e5e7eb", flexShrink: 0 }}>
                <button
                  onClick={() => setSelectedReg(null)}
                  style={{
                    width: "100%", padding: "0.8rem", borderRadius: "0.75rem",
                    background: "#18181b", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer",
                  }}
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal Preview Dokumen ── */}
      {docPreview && (
        <div
          onClick={() => setDocPreview(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 300,
            background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: "1.25rem", width: "100%", maxWidth: 560,
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)", overflow: "hidden",
              display: "flex", flexDirection: "column", maxHeight: "90vh",
            }}
          >
            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg,#3b3025,#5a3d28)",
              padding: "1.25rem 1.5rem",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <FileText size={20} color="#fff" weight="duotone" />
                </div>
                <div>
                  <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1rem", margin: 0 }}>
                    {docPreview.label}
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.78rem", margin: 0 }}>
                    Pratinjau Dokumen
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button
                  onClick={() => handleDownload(docPreview.url, docPreview.label)}
                  title="Unduh Dokumen"
                  style={{
                    background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "0.5rem",
                    padding: "0.35rem 0.75rem", cursor: "pointer", color: "#fff",
                    fontSize: "0.78rem", fontWeight: 600,
                    display: "flex", alignItems: "center", gap: "0.35rem",
                  }}
                >
                  ↓ Unduh
                </button>
                <button
                  onClick={() => setDocPreview(null)}
                  style={{
                    background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%",
                    width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "#fff",
                  }}
                >
                  <X size={15} weight="bold" />
                </button>
              </div>
            </div>

            {/* Konten Dokumen */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.25rem", background: "#f9fafb" }}>
              {/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(docPreview.url) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={docPreview.url}
                  alt={docPreview.label}
                  style={{ maxWidth: "100%", maxHeight: "60vh", borderRadius: "0.75rem", objectFit: "contain", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
                />
              ) : (
                <iframe
                  src={docPreview.url}
                  title={docPreview.label}
                  style={{ width: "100%", height: "60vh", border: "none", borderRadius: "0.75rem", background: "#fff", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                />
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid #e5e7eb", flexShrink: 0 }}>
              <button
                onClick={() => setDocPreview(null)}
                style={{
                  width: "100%", padding: "0.8rem", borderRadius: "0.75rem",
                  background: "#18181b", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer",
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
