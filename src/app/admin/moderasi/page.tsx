"use client";

import { useEffect, useState } from "react";
import { getDemoSession } from "@/lib/utils/demo";
import { useRouter } from "next/navigation";
import {
  ShieldWarning, Prohibit, Trash, MagnifyingGlass,
  FunnelSimple, UserMinus, CheckCircle, X, Warning,
  CalendarBlank, User,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { EarthySelect } from "@/components/ui/EarthySelect";

type ReportType = "toko" | "ulasan" | "produk";
type ReportStatus = "pending" | "resolved";
type DeleteStatus = "pending" | "approved" | "rejected";

type Report = {
  id: string; type: ReportType; target: string;
  reporter: string; reason: string; status: ReportStatus; date: string;
};

type DeleteRequest = {
  id: string; name: string; email: string;
  reason: string; date: string; status: DeleteStatus;
};

const INITIAL_REPORTS: Report[] = [
  { id: "rep-1", type: "toko", target: "Tanah Liat Art", reporter: "Budi Santoso", reason: "Melanggar ketentuan harga (price dumping)", status: "pending", date: "24 Okt 2023" },
  { id: "rep-2", type: "ulasan", target: "Review oleh User123 di Mug Daun", reporter: "Siti Rahayu", reason: "Ulasan mengandung kata kasar", status: "pending", date: "23 Okt 2023" },
  { id: "rep-3", type: "produk", target: "Asbak Bentuk Tangan (Studio Bumi)", reporter: "Joko Santoso", reason: "Gambar tidak sesuai produk asli", status: "pending", date: "22 Okt 2023" },
  { id: "rep-4", type: "toko", target: "Keramik Murah Meriah", reporter: "Dewi Kartika", reason: "Foto produk menggunakan gambar curian", status: "pending", date: "20 Okt 2023" },
  { id: "rep-5", type: "ulasan", target: "Review di Piring Hias (Keramik Rina)", reporter: "Ahmad Fauzi", reason: "Ulasan palsu & tidak relevan", status: "resolved", date: "18 Okt 2023" },
];

const INITIAL_DELETES: DeleteRequest[] = [
  { id: "del-1", name: "Rina Kusuma", email: "rina.k@gmail.com", reason: "Tidak ingin menggunakan platform lagi", date: "25 Okt 2023", status: "pending" },
  { id: "del-2", name: "Denny Prasetyo", email: "denny.p@yahoo.com", reason: "Pindah ke platform lain", date: "24 Okt 2023", status: "pending" },
  { id: "del-3", name: "Mega Wulandari", email: "mega.w@gmail.com", reason: "Privasi data — ingin semua data dihapus", date: "22 Okt 2023", status: "approved" },
  { id: "del-4", name: "Farhan Aziz", email: "farhan.a@email.com", reason: "Akun duplikat, sudah punya akun lain", date: "20 Okt 2023", status: "rejected" },
  { id: "del-5", name: "Laila Novita", email: "laila.n@gmail.com", reason: "Sudah tidak aktif bertransaksi", date: "19 Okt 2023", status: "pending" },
];

const TYPE_COLORS: Record<ReportType, { bg: string; text: string; label: string }> = {
  toko:    { bg: "#fff7ed", text: "#c2410c", label: "Toko" },
  ulasan:  { bg: "#f0f9ff", text: "#0369a1", label: "Ulasan" },
  produk:  { bg: "#fdf4ff", text: "#7e22ce", label: "Produk" },
};

export default function AdminModerasiPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"laporan" | "hapus-akun">("laporan");

  // Laporan state
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [filterType, setFilterType] = useState<"semua" | ReportType>("semua");
  const [filterStatus, setFilterStatus] = useState<"semua" | ReportStatus>("semua");
  const [search, setSearch] = useState("");

  // Hapus akun state
  const [deletes, setDeletes] = useState<DeleteRequest[]>(INITIAL_DELETES);
  const [deleteSearch, setDeleteSearch] = useState("");
  const [deleteFilter, setDeleteFilter] = useState<"semua" | DeleteStatus>("semua");

  useEffect(() => {
    const session = getDemoSession();
    if (!session || session.role !== "admin") {
      router.push("/admin/login");
      return;
    }
    setLoading(false);
  }, [router]);

  const handleReport = (id: string, action: "suspend" | "delete" | "ignore") => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: "resolved" as ReportStatus } : r));
    const msg = action === "ignore" ? "Laporan diabaikan" :
      action === "suspend" ? "Tindakan suspend berhasil dieksekusi" : "Konten berhasil dihapus";
    toast.success(msg);
  };

  const handleDelete = (id: string, action: "approved" | "rejected") => {
    setDeletes(prev => prev.map(d => d.id === id ? { ...d, status: action } : d));
    toast.success(action === "approved"
      ? "Pengajuan penghapusan akun disetujui. Akun akan dihapus dalam 7 hari."
      : "Pengajuan penghapusan akun ditolak.");
  };

  const filteredReports = reports.filter(r => {
    const matchType = filterType === "semua" || r.type === filterType;
    const matchStatus = filterStatus === "semua" || r.status === filterStatus;
    const matchSearch = r.target.toLowerCase().includes(search.toLowerCase()) ||
      r.reason.toLowerCase().includes(search.toLowerCase()) ||
      r.reporter.toLowerCase().includes(search.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  const filteredDeletes = deletes.filter(d => {
    const matchStatus = deleteFilter === "semua" || d.status === deleteFilter;
    const matchSearch = d.name.toLowerCase().includes(deleteSearch.toLowerCase()) ||
      d.email.toLowerCase().includes(deleteSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  const pendingCount = reports.filter(r => r.status === "pending").length;
  const deleteCount = deletes.filter(d => d.status === "pending").length;

  if (loading) return <div>Memuat...</div>;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 mb-1">Moderasi &amp; Keamanan</h1>
        <p className="text-zinc-500 text-sm">Tangani laporan pelanggaran dan pengajuan penghapusan akun customer.</p>
      </div>

      {/* Tab Switch */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {([
          { id: "laporan", label: "Laporan Pelanggaran", count: pendingCount, icon: ShieldWarning },
          { id: "hapus-akun", label: "Pengajuan Hapus Akun", count: deleteCount, icon: UserMinus },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.6rem 1.1rem", borderRadius: "0.625rem",
              fontSize: "0.875rem", fontWeight: 600,
              background: activeTab === tab.id ? "#18181b" : "#fff",
              color: activeTab === tab.id ? "#fff" : "#52525b",
              border: `1.5px solid ${activeTab === tab.id ? "#18181b" : "#e5e7eb"}`,
              cursor: "pointer", transition: "all 0.18s",
            }}
          >
            <tab.icon size={16} weight={activeTab === tab.id ? "fill" : "regular"} />
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                background: activeTab === tab.id ? "rgba(255,255,255,0.2)" : "#ef4444",
                color: "#fff", fontSize: "0.65rem", fontWeight: 800,
                padding: "0.1rem 0.4rem", borderRadius: "9999px",
              }}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB: LAPORAN PELANGGARAN ── */}
      {activeTab === "laporan" && (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex flex-wrap gap-3 items-center justify-between">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <ShieldWarning size={22} weight="duotone" className="text-orange-500" />
              Laporan Menunggu Tindakan
              {pendingCount > 0 && (
                <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{pendingCount} pending</span>
              )}
            </h2>
            <div className="flex gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari laporan..."
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 w-44"
                />
              </div>
              <EarthySelect
                value={filterType}
                onChange={v => setFilterType(v as typeof filterType)}
                options={[
                  { value: "semua", label: "Semua Tipe" },
                  { value: "toko", label: "Toko" },
                  { value: "produk", label: "Produk" },
                  { value: "ulasan", label: "Ulasan" },
                ]}
              />
              <EarthySelect
                value={filterStatus}
                onChange={v => setFilterStatus(v as typeof filterStatus)}
                options={[
                  { value: "semua", label: "Semua Status" },
                  { value: "pending", label: "Pending" },
                  { value: "resolved", label: "Resolved" },
                ]}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-sm text-zinc-500">
                  <th className="p-4 font-medium">Tanggal</th>
                  <th className="p-4 font-medium">Tipe</th>
                  <th className="p-4 font-medium">Target Pelanggaran</th>
                  <th className="p-4 font-medium">Pelapor</th>
                  <th className="p-4 font-medium">Alasan Laporan</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map(report => {
                  const typeStyle = TYPE_COLORS[report.type];
                  return (
                    <tr key={report.id} className="border-b border-zinc-200 hover:bg-zinc-50/60 transition-colors">
                      <td className="p-4 text-sm text-zinc-500 whitespace-nowrap">{report.date}</td>
                      <td className="p-4">
                        <span style={{
                          display: "inline-flex", alignItems: "center",
                          padding: "0.2rem 0.65rem", borderRadius: "9999px",
                          fontSize: "0.72rem", fontWeight: 700,
                          background: typeStyle.bg, color: typeStyle.text,
                        }}>
                          {typeStyle.label}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-zinc-900 text-sm max-w-[160px]">
                        <span className="line-clamp-2">{report.target}</span>
                      </td>
                      <td className="p-4 text-sm text-zinc-500 whitespace-nowrap">{report.reporter}</td>
                      <td className="p-4 text-sm text-zinc-600 max-w-[180px]">
                        <span className="line-clamp-2">{report.reason}</span>
                      </td>
                      <td className="p-4">
                        {report.status === "pending" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-1 rounded-full">
                            <Warning size={11} weight="fill" /> Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full">
                            <CheckCircle size={11} weight="fill" /> Selesai
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {report.status === "pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleReport(report.id, "ignore")}
                              className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-zinc-100 text-zinc-600 hover:bg-zinc-200 text-sm font-medium transition-colors"
                              style={{ minWidth: 80 }}
                            >
                              Abaikan
                            </button>
                            {(report.type === "toko" || report.type === "produk") ? (
                              <button
                                onClick={() => handleReport(report.id, "suspend")}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-orange-50 text-orange-600 hover:bg-orange-100 text-sm font-medium transition-colors"
                                style={{ minWidth: 96 }}
                              >
                                <Prohibit size={15} /> Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReport(report.id, "delete")}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium transition-colors"
                                style={{ minWidth: 96 }}
                              >
                                <Trash size={15} /> Hapus
                              </button>
                            )}
                          </div>


                        ) : (
                          <div className="flex justify-center"><span className="text-sm text-zinc-400">—</span></div>
                        )}

                      </td>
                    </tr>
                  );
                })}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-zinc-400 text-sm">
                      <ShieldWarning size={36} className="mx-auto mb-2 opacity-30" />
                      Tidak ada laporan yang sesuai filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: PENGAJUAN HAPUS AKUN ── */}
      {activeTab === "hapus-akun" && (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex flex-wrap gap-3 items-center justify-between">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <UserMinus size={22} weight="duotone" className="text-red-500" />
              Pengajuan Penghapusan Akun Customer
              {deleteCount > 0 && (
                <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{deleteCount} menunggu</span>
              )}
            </h2>
            <div className="flex gap-2">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text" value={deleteSearch} onChange={e => setDeleteSearch(e.target.value)}
                  placeholder="Cari nama atau email..."
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 w-52"
                />
              </div>
              <EarthySelect
                value={deleteFilter}
                onChange={v => setDeleteFilter(v as typeof deleteFilter)}
                options={[
                  { value: "semua", label: "Semua Status" },
                  { value: "pending", label: "Menunggu" },
                  { value: "approved", label: "Disetujui" },
                  { value: "rejected", label: "Ditolak" },
                ]}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-sm text-zinc-500">
                  <th className="p-4 font-medium">Tanggal</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Alasan Pengajuan</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeletes.map(req => (
                  <tr key={req.id} className="border-b border-zinc-200 hover:bg-zinc-50/60 transition-colors">
                    <td className="p-4 text-sm text-zinc-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <CalendarBlank size={13} className="text-zinc-400" />
                        {req.date}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div style={{
                          width: 34, height: 34, borderRadius: "50%",
                          background: "#e4e4e7", display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: "0.72rem", fontWeight: 800, color: "#52525b",
                          flexShrink: 0,
                        }}>
                          {req.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-zinc-900 m-0">{req.name}</p>
                          <p className="text-xs text-zinc-500 m-0">{req.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-zinc-600 max-w-[220px]">
                      <span className="line-clamp-2">{req.reason}</span>
                    </td>
                    <td className="p-4">
                      {req.status === "pending" && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-1 rounded-full">
                          <Warning size={11} weight="fill" /> Menunggu
                        </span>
                      )}
                      {req.status === "approved" && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2 py-1 rounded-full">
                          <CheckCircle size={11} weight="fill" /> Disetujui
                        </span>
                      )}
                      {req.status === "rejected" && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 bg-zinc-100 px-2 py-1 rounded-full">
                          <X size={11} weight="bold" /> Ditolak
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {req.status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(req.id, "rejected")}
                            className="px-3 py-1.5 rounded-md bg-zinc-100 text-zinc-600 hover:bg-zinc-200 text-sm font-medium transition-colors flex items-center gap-1"
                          >
                            <X size={14} weight="bold" /> Tolak
                          </button>
                          <button
                            onClick={() => handleDelete(req.id, "approved")}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium transition-colors"
                          >
                            <Trash size={15} /> Hapus Akun
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-zinc-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredDeletes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-zinc-400 text-sm">
                      <User size={36} className="mx-auto mb-2 opacity-30" />
                      Tidak ada pengajuan yang sesuai filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
