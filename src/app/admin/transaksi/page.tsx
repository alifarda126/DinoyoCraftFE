"use client";

import { useEffect, useState } from "react";
import { getDemoSession } from "@/lib/utils/demo";
import { useRouter } from "next/navigation";
import { Receipt, MagnifyingGlass, DownloadSimple, ClockCounterClockwise } from "@phosphor-icons/react";
import { EarthySelect } from "@/components/ui/EarthySelect";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";

type Transaction = {
  id: string;
  reference_code?: string;
  gateway?: string;
  gateway_order_id?: string | null;
  store: string;
  customer: string;
  payment_method?: string;
  bank?: string | null;
  amount: number;
  status: "success" | "pending" | "failed";
  raw_status?: string;
  date: string;
};

function formatMethodLabel(method?: string, bank?: string | null): string {
  const m = (method || "").toLowerCase();
  if (m === "qris") return "QRIS";
  if (m === "bca_va") return "BCA VA";
  if (m === "bni_va") return "BNI VA";
  if (m === "bri_va") return "BRI VA";
  if (m === "permata_va") return "Permata VA";
  if (m === "mandiri_bill") return "Mandiri Bill";
  if (m === "gopay") return "GoPay";
  if (m === "shopeepay") return "ShopeePay";
  if (bank) return `${bank.toUpperCase()} VA`;
  return m ? m.toUpperCase() : "Midtrans";
}

function formatTrxDate(raw?: string | null): string {
  if (!raw) return "-";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminTransaksiPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [isDownloadingCsv, setIsDownloadingCsv] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  useEffect(() => {
    const session = getDemoSession();
    if (!session || session.role !== "admin") {
      router.push("/auth/login");
      return;
    }

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const res = await adminService.getTransactions({ limit: 100 });
        const list = Array.isArray(res?.data) ? res.data : [];
        const mapped: Transaction[] = list.map((t: any) => ({
          id: String(t.id || t.reference_code || t.gateway_order_id || "-"),
          reference_code: t.reference_code || t.id,
          gateway: t.gateway || "midtrans",
          gateway_order_id: t.gateway_order_id || null,
          store: t.store || "-",
          customer: t.customer || "-",
          payment_method: t.payment_method || "qris",
          bank: t.bank || null,
          amount: Number(t.amount || 0),
          status:
            t.status === "success" || t.status === "failed"
              ? t.status
              : "pending",
          raw_status: t.raw_status,
          date: formatTrxDate(t.paid_at || t.date),
        }));
        setTransactions(mapped);
      } catch (err) {
        console.error("Gagal mengambil daftar transaksi:", err);
        toast.error("Gagal memuat daftar transaksi dari server.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [router]);

  const filtered = transactions.filter(t => {
    const q = search.toLowerCase();
    const matchSearch =
      t.id.toLowerCase().includes(q) ||
      (t.gateway_order_id || "").toLowerCase().includes(q) ||
      t.customer.toLowerCase().includes(q) ||
      t.store.toLowerCase().includes(q) ||
      formatMethodLabel(t.payment_method, t.bank).toLowerCase().includes(q);
    const matchStatus = filterStatus === "semua" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  function exportCSV() {
    setIsDownloadingCsv(true);
    toast.info("Menyiapkan file CSV...");
    setTimeout(() => {
      const header = ["Invoice", "Mitra Pengrajin", "Pelanggan", "Metode", "Tanggal", "Nominal", "Status"];
      const rows = filtered.map(t => [
        t.id,
        t.store,
        t.customer,
        formatMethodLabel(t.payment_method, t.bank),
        t.date,
        `Rp ${t.amount.toLocaleString("id-ID")}`,
        t.status === "success" ? "Berhasil" : t.status === "failed" ? "Gagal" : "Tertunda",
      ]);
      const csv = [header, ...rows]
        .map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `transaksi-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setIsDownloadingCsv(false);
      toast.success("Laporan transaksi berhasil diunduh dalam format CSV.");
    }, 500);
  }

  function exportPDF() {
    setIsDownloadingPdf(true);
    toast.info("Membuka dialog cetak / simpan PDF...");
    setTimeout(() => {
      setIsDownloadingPdf(false);
      if (typeof window !== "undefined") window.print();
    }, 300);
  }


  if (loading) return <div>Memuat...</div>;

  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900  mb-1">Transaksi Lintas Toko</h1>
          <p className="text-zinc-500 text-sm">Pantau perputaran uang dari seluruh Mitra Pengrajin.</p>
        </div>
        {/* Tombol Ekspor — CSV (outline) + PDF (clay primary) */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {/* CSV */}
          <button
            onClick={exportCSV}
            disabled={isDownloadingCsv}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: isDownloadingCsv ? "#f4f4f5" : "#fff",
              color: "var(--bark, #3d2b1f)",
              border: "1.5px solid var(--line, #ddd0c8)",
              padding: "0.6rem 1rem", borderRadius: "0.625rem",
              fontWeight: 600, fontSize: "0.85rem",
              cursor: isDownloadingCsv ? "not-allowed" : "pointer",
              fontFamily: "var(--font-outfit), sans-serif",
              transition: "background 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
            onMouseEnter={e => !isDownloadingCsv && (e.currentTarget.style.background = "var(--surface, #f9f5f1)")}
            onMouseLeave={e => !isDownloadingCsv && (e.currentTarget.style.background = "#fff")}
          >
            {isDownloadingCsv
              ? <ClockCounterClockwise size={17} style={{ animation: "spin 0.7s linear infinite" }} />
              : <DownloadSimple size={17} />}
            {isDownloadingCsv ? "Mengunduh..." : "Ekspor CSV"}
          </button>

          {/* PDF */}
          <button
            onClick={exportPDF}
            disabled={isDownloadingPdf}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: isDownloadingPdf ? "var(--surface, #f9f5f1)" : "var(--clay, #b85c3c)",
              color: isDownloadingPdf ? "var(--bark, #3d2b1f)" : "#fff",
              border: "none",
              padding: "0.6rem 1.25rem", borderRadius: "0.625rem",
              fontWeight: 600, fontSize: "0.85rem",
              cursor: isDownloadingPdf ? "not-allowed" : "pointer",
              fontFamily: "var(--font-outfit), sans-serif",
              transition: "background 0.2s",
              boxShadow: isDownloadingPdf ? "none" : "0 4px 10px rgba(184,92,60,0.2)",
            }}
            onMouseEnter={e => !isDownloadingPdf && (e.currentTarget.style.background = "var(--clay-dark, #8b4a2a)")}
            onMouseLeave={e => !isDownloadingPdf && (e.currentTarget.style.background = "var(--clay, #b85c3c)")}
          >
            {isDownloadingPdf
              ? <ClockCounterClockwise size={17} style={{ animation: "spin 0.7s linear infinite" }} />
              : <DownloadSimple size={17} />}
            {isDownloadingPdf ? "Mengunduh..." : "Ekspor PDF"}
          </button>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      <div className="bg-white  border border-zinc-200  rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200  flex justify-between items-center bg-zinc-50 ">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Receipt size={24} weight="duotone" className="text-zinc-500" />
            Daftar Transaksi
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari invoice atau nama..."
                className="pl-9 pr-4 py-2 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
            <EarthySelect
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { value: "semua", label: "Semua Status" },
                { value: "success", label: "Berhasil" },
                { value: "pending", label: "Tertunda" },
                { value: "failed", label: "Gagal" },
              ]}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50  border-b border-zinc-200  text-sm text-zinc-500 ">
                <th className="p-4 font-medium">Invoice</th>
                <th className="p-4 font-medium">Mitra Pengrajin</th>
                <th className="p-4 font-medium">Pelanggan</th>
                <th className="p-4 font-medium">Metode</th>
                <th className="p-4 font-medium">Tanggal</th>
                <th className="p-4 font-medium text-right">Nominal</th>
                <th className="p-4 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-zinc-500">
                    Belum ada transaksi yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filtered.map((trx) => (
                  <tr key={trx.id} className="border-b border-zinc-200  hover:bg-zinc-50 :bg-zinc-900/50 transition-colors">
                    <td className="p-4 font-medium text-zinc-900 ">{trx.id}</td>
                    <td className="p-4 text-sm text-zinc-600 ">{trx.store}</td>
                    <td className="p-4 text-sm text-zinc-600 ">{trx.customer}</td>
                    <td className="p-4 text-sm">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-xs font-medium">
                        {formatMethodLabel(trx.payment_method, trx.bank)}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-zinc-600 ">{trx.date}</td>
                    <td className="p-4 text-right font-medium text-zinc-900 ">
                      Rp {trx.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        trx.status === "success" ? "bg-green-100 text-green-800  " :
                        trx.status === "failed" ? "bg-red-100 text-red-800  " :
                        "bg-yellow-100 text-yellow-800  "
                      }`}>
                        {trx.status === "success" ? "Berhasil" : trx.status === "failed" ? "Gagal" : "Tertunda"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
