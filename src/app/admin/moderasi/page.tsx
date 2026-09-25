"use client";

import { useEffect, useState } from "react";
import { getDemoSession } from "@/lib/demo";
import { useRouter } from "next/navigation";
import { ShieldWarning, Prohibit, Trash } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function AdminModerasiPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const [reports, setReports] = useState([
    { id: "rep-1", type: "toko", target: "Tanah Liat Art", reason: "Melanggar ketentuan harga (price dumping)", status: "pending", date: "24 Okt 2023" },
    { id: "rep-2", type: "ulasan", target: "Review oleh User123 di Mug Daun", reason: "Ulasan mengandung kata kasar", status: "pending", date: "23 Okt 2023" },
    { id: "rep-3", type: "produk", target: "Asbak Bentuk Tangan (Studio Bumi)", reason: "Gambar tidak sesuai produk asli", status: "pending", date: "22 Okt 2023" },
  ]);

  useEffect(() => {
    const session = getDemoSession();
    if (!session || session.role !== "admin") {
      router.push("/admin/login");
      return;
    }
    setLoading(false);
  }, [router]);

  const handleAction = (id: string, action: "suspend" | "delete" | "ignore") => {
    setReports(reports.filter(r => r.id !== id));
    if (action === "ignore") {
      toast.success("Laporan diabaikan");
    } else {
      toast.success(`Tindakan ${action === "suspend" ? "suspend" : "hapus"} berhasil dieksekusi (Mock)`);
    }
  };

  if (loading) return <div>Memuat...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900  mb-1">Moderasi & Keamanan</h1>
        <p className="text-zinc-500 text-sm">Tangani laporan pelanggaran toko, produk, atau ulasan pengguna.</p>
      </div>

      <div className="bg-white  border border-zinc-200  rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200  flex justify-between items-center bg-zinc-50 ">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <ShieldWarning size={24} weight="duotone" className="text-orange-500" />
            Laporan Menunggu Tindakan
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50  border-b border-zinc-200  text-sm text-zinc-500 ">
                <th className="p-4 font-medium">Tanggal</th>
                <th className="p-4 font-medium">Tipe</th>
                <th className="p-4 font-medium">Target Pelanggaran</th>
                <th className="p-4 font-medium">Alasan Laporan</th>
                <th className="p-4 font-medium text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-b border-zinc-200  hover:bg-zinc-50 :bg-zinc-900/50 transition-colors">
                  <td className="p-4 text-sm text-zinc-600 ">{report.date}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800   capitalize">
                      {report.type}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-zinc-900 ">{report.target}</td>
                  <td className="p-4 text-sm text-zinc-600 ">{report.reason}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleAction(report.id, "ignore")}
                        className="px-3 py-1.5 rounded-md bg-zinc-100 text-zinc-600 hover:bg-zinc-200   :bg-zinc-700 text-sm transition-colors"
                      >
                        Abaikan
                      </button>
                      
                      {report.type === "toko" || report.type === "produk" ? (
                        <button 
                          onClick={() => handleAction(report.id, "suspend")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-orange-50 text-orange-600 hover:bg-orange-100   :bg-orange-900/40 text-sm font-medium transition-colors"
                        >
                          <Prohibit size={16} />
                          Suspend
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleAction(report.id, "delete")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100   :bg-red-900/40 text-sm font-medium transition-colors"
                        >
                          <Trash size={16} />
                          Hapus
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    Tidak ada laporan pelanggaran baru.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
