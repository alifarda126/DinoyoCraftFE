"use client";

import { useEffect, useState } from "react";
import { getDemoSession } from "@/lib/utils/demo";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Check, X, Storefront, MagnifyingGlass, Eye,
  IdentificationCard, FileText, CheckSquare, Warning,
  Phone, EnvelopeSimple, MapPin, CalendarBlank, User,
} from "@phosphor-icons/react";
import { EarthySelect } from "@/components/ui/EarthySelect";

type StoreRegistration = {
  id: string;
  owner_name: string;
  phone: string;
  email: string;
  store_name: string;
  address: string;
  year_started: string;
  status: "pending" | "approved" | "rejected";
  date: string;
  // Dokumen persyaratan
  docs: {
    ktp: boolean;
    usaha: boolean;
    sop: boolean;
    setuju: boolean;
  };
};

export default function AdminVerifikasiPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<StoreRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState<StoreRegistration | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterDok, setFilterDok] = useState("semua");

  useEffect(() => {
    const session = getDemoSession();
    if (!session || session.role !== "admin") {
      router.push("/admin/login");
      return;
    }

    setRegistrations([
      {
        id: "reg-1",
        owner_name: "Bapak Hartono",
        phone: "08123456789",
        email: "hartono@email.com",
        store_name: "Studio Bumi",
        address: "Jl. Keramik No. 12, Dinoyo, Malang",
        year_started: "2019",
        status: "pending",
        date: "12 Okt 2023",
        docs: { ktp: true, usaha: true, sop: true, setuju: true },
      },
      {
        id: "reg-2",
        owner_name: "Ibu Rina Sari",
        phone: "08234567890",
        email: "rina@email.com",
        store_name: "Keramik Rina",
        address: "Gg. Makmur RT 02 RW 01, Dinoyo, Malang",
        year_started: "2021",
        status: "approved",
        date: "10 Okt 2023",
        docs: { ktp: true, usaha: true, sop: true, setuju: true },
      },
      {
        id: "reg-3",
        owner_name: "Andi Saputra",
        phone: "08345678901",
        email: "andi@email.com",
        store_name: "Tanah Liat Art",
        address: "Jl. Bunga Melati No. 8, Malang",
        year_started: "2022",
        status: "pending",
        date: "15 Okt 2023",
        // Sengaja ada yang belum lengkap untuk demo
        docs: { ktp: true, usaha: false, sop: true, setuju: true },
      },
    ]);
    setLoading(false);
  }, [router]);

  const handleUpdateStatus = (id: string, newStatus: "approved" | "rejected") => {
    setRegistrations(prev => prev.map(reg =>
      reg.id === id ? { ...reg, status: newStatus } : reg
    ));
    setSelectedReg(null);
    toast.success(`Pengajuan toko berhasil ${newStatus === "approved" ? "disetujui" : "ditolak"}.`);
  };

  const filtered = registrations.filter(r => {
    const matchSearch =
      r.store_name.toLowerCase().includes(search.toLowerCase()) ||
      r.owner_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "semua" || r.status === filterStatus;
    const docsComplete = Object.values(r.docs).every(Boolean);
    const matchDok = filterDok === "semua" ||
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

  if (loading) return <div>Memuat...</div>;

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
            Daftar Pengajuan
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari toko atau pemilik..."
                className="pl-9 pr-4 py-2 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
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
                <th className="p-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reg) => {
                const docsComplete = Object.values(reg.docs).every(Boolean);
                return (
                  <tr key={reg.id} className="border-b border-zinc-200 hover:bg-zinc-50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-zinc-900">{reg.store_name}</div>
                      <div className="text-sm text-zinc-500">{reg.owner_name}</div>
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        reg.status === "approved" ? "bg-green-100 text-green-800" :
                        reg.status === "rejected" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {reg.status === "approved" ? "Disetujui" : reg.status === "rejected" ? "Ditolak" : "Menunggu"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {reg.status === "pending" && (
                          <>
                            {/* Tolak */}
                            <button
                              onClick={() => handleUpdateStatus(reg.id, "rejected")}
                              className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              title="Tolak"
                            >
                              <X size={18} weight="bold" />
                            </button>
                            {/* Setujui */}
                            <button
                              onClick={() => handleUpdateStatus(reg.id, "approved")}
                              className="p-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                              title="Setujui"
                            >
                              <Check size={18} weight="bold" />
                            </button>
                          </>
                        )}
                        {/* Lihat Detail — selalu di paling kanan, warna zinc */}
                        <button
                          onClick={() => setSelectedReg(reg)}
                          className="p-1.5 rounded-md bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
                          title="Lihat Detail & Persyaratan"
                        >
                          <Eye size={18} weight="bold" />
                        </button>
                      </div>

                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Detail & Persyaratan ── */}
      {selectedReg && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
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

            {/* Body Modal — scrollable */}
            <div style={{ overflowY: "auto", flex: 1, padding: "1.5rem" }}>

              {/* Info Pendaftar */}
              <h3 style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#71717a", marginBottom: "0.75rem" }}>
                Data Pendaftar
              </h3>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem",
                background: "#f9fafb", borderRadius: "0.75rem", padding: "1rem",
                border: "1px solid #e5e7eb", marginBottom: "1.5rem",
              }}>
                {[
                  { icon: User, label: "Nama Pemilik", value: selectedReg.owner_name },
                  { icon: Storefront, label: "Nama Toko", value: selectedReg.store_name },
                  { icon: Phone, label: "No. HP (WA)", value: selectedReg.phone },
                  { icon: EnvelopeSimple, label: "Email", value: selectedReg.email },
                  { icon: MapPin, label: "Alamat", value: selectedReg.address },
                  { icon: CalendarBlank, label: "Mulai Usaha", value: selectedReg.year_started },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", gridColumn: row.label === "Alamat" ? "1 / -1" : "auto" }}>
                    <row.icon size={16} color="#b85c3c" style={{ flexShrink: 0, marginTop: "0.1rem" }} />
                    <div>
                      <p style={{ fontSize: "0.7rem", color: "#9ca3af", margin: 0 }}>{row.label}</p>
                      <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#111827", margin: 0 }}>{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Verifikasi Persyaratan */}
              <h3 style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#71717a", marginBottom: "0.75rem" }}>
                Cek Persyaratan Pendaftaran
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.5rem" }}>
                {DOCS_LIST.map(doc => {
                  const ok = selectedReg.docs[doc.key];
                  return (
                    <div key={doc.key} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "0.85rem 1rem", borderRadius: "0.75rem",
                      border: `1.5px solid ${ok ? "#d1fae5" : "#fee2e2"}`,
                      background: ok ? "#f0fdf4" : "#fff5f5",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "0.5rem",
                          background: ok ? "#dcfce7" : "#fee2e2",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: ok ? "#16a34a" : "#dc2626",
                        }}>
                          <doc.icon size={16} weight="duotone" />
                        </div>
                        <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#111827" }}>
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
                  onClick={() => handleUpdateStatus(selectedReg.id, "rejected")}
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
    </div>
  );
}
