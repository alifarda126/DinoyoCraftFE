"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Pusher from "pusher-js";
import { getDemoSession } from "@/lib/utils/demo";
import { useRouter } from "next/navigation";
import { Receipt, MagnifyingGlass, DownloadSimple, ClockCounterClockwise } from "@phosphor-icons/react";
import { EarthySelect } from "@/components/ui/EarthySelect";
import { PaymentMethodBadge, formatPaymentLabel as formatMethodLabel } from "@/components/ui/PaymentMethodBadge";
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

  const isFetchingRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);

  const fetchTransactions = useCallback(async (isInitial = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    let shouldKeepLoading = false;
    try {
      if (isInitial && !hasLoadedRef.current) setLoading(true);
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
      hasLoadedRef.current = true;
      retryCountRef.current = 0;
    } catch (err) {
      console.error("Gagal mengambil daftar transaksi:", err);
      if (!hasLoadedRef.current && retryCountRef.current < 4) {
        retryCountRef.current += 1;
        shouldKeepLoading = true;
        retryTimerRef.current = setTimeout(() => {
          fetchTransactions(false);
        }, 3000);
      }
    } finally {
      isFetchingRef.current = false;
      if (!shouldKeepLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const session = getDemoSession();
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if ((!session || session.role !== "admin") && !storedToken) {
      router.push("/login");
      return;
    }

    fetchTransactions(true);

    const onFocusOrVisible = () => {
      if (typeof document === "undefined" || document.visibilityState === "visible") {
        fetchTransactions(false);
      }
    };

    const pollInterval = setInterval(onFocusOrVisible, 45_000);
    window.addEventListener("focus", onFocusOrVisible);
    document.addEventListener("visibilitychange", onFocusOrVisible);

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || "b5fa050e0050acfb222a";
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";
    let pusher: Pusher | null = null;
    try {
      pusher = new Pusher(pusherKey, { cluster: pusherCluster });
      const ch = pusher.subscribe("admin-system-logs");
      ch.bind("system-log.created", (evt: any) => {
        if (evt?.category === "transaction" || evt?.category === "order") {
          fetchTransactions(false);
        }
      });
    } catch {}

    return () => {
      clearInterval(pollInterval);
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
      window.removeEventListener("focus", onFocusOrVisible);
      document.removeEventListener("visibilitychange", onFocusOrVisible);
      if (pusher) {
        try {
          pusher.unsubscribe("admin-system-logs");
          pusher.disconnect();
        } catch {}
      }
    };
  }, [router, fetchTransactions]);

  const filtered = transactions.filter(t => {
    const q = search.toLowerCase();
    const matchSearch =
      t.id.toLowerCase().includes(q) ||
      (t.reference_code || "").toLowerCase().includes(q) ||
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

  async function exportPDF() {
    if (filtered.length === 0) {
      toast.warning("Tidak ada data transaksi untuk diekspor.");
      return;
    }

    setIsDownloadingPdf(true);
    toast.info("Menyiapkan laporan PDF...");

    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 14;

      const statusLabelMap: Record<string, string> = {
        semua: "Semua Status",
        success: "Berhasil",
        pending: "Tertunda",
        failed: "Gagal",
      };

      const printedAt = new Date().toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // Hitung ringkasan hanya dari data penting
      const successTrx = filtered.filter((t) => t.status === "success");
      const pendingTrx = filtered.filter((t) => t.status === "pending");
      const failedTrx = filtered.filter((t) => t.status === "failed");

      const sumAmount = (list: Transaction[]) =>
        list.reduce((acc, item) => acc + (Number.isFinite(item.amount) ? item.amount : 0), 0);

      const totalSuccessAmount = sumAmount(successTrx);
      const totalPendingAmount = sumAmount(pendingTrx);

      // Header Laporan
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(113, 113, 122);
      doc.text("DINOYOCRAFT", marginX, 14);

      doc.setFontSize(16);
      doc.setTextColor(24, 24, 27);
      doc.text("Laporan Transaksi Lintas Toko", marginX, 21);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(82, 82, 91);
      const filterInfo = `Filter: ${statusLabelMap[filterStatus] || "Semua Status"}${
        search.trim() ? `  |  Kata kunci: "${search.trim()}"` : ""
      }`;
      doc.text(`Dicetak: ${printedAt} WIB`, pageWidth - marginX, 14, { align: "right" });
      doc.text(filterInfo, pageWidth - marginX, 20, { align: "right" });

      doc.setDrawColor(228, 228, 231);
      doc.setLineWidth(0.3);
      doc.line(marginX, 25, pageWidth - marginX, 25);

      // Kartu Ringkasan Data Penting (4 kolom)
      const summaryItems = [
        {
          label: "TOTAL TRANSAKSI",
          value: `${filtered.length} transaksi`,
        },
        {
          label: "BERHASIL (NOMINAL)",
          value: `${successTrx.length}  |  Rp ${totalSuccessAmount.toLocaleString("id-ID")}`,
        },
        {
          label: "TERTUNDA",
          value: `${pendingTrx.length}  |  Rp ${totalPendingAmount.toLocaleString("id-ID")}`,
        },
        {
          label: "GAGAL",
          value: `${failedTrx.length} transaksi`,
        },
      ];

      const cardGap = 4;
      const usableWidth = pageWidth - marginX * 2;
      const cardWidth = (usableWidth - cardGap * 3) / 4;
      const cardY = 29;
      const cardH = 14;

      summaryItems.forEach((item, idx) => {
        const x = marginX + idx * (cardWidth + cardGap);
        doc.setFillColor(250, 250, 250);
        doc.setDrawColor(228, 228, 231);
        doc.roundedRect(x, cardY, cardWidth, cardH, 1.5, 1.5, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(113, 113, 122);
        doc.text(item.label, x + 3, cardY + 5);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(24, 24, 27);
        doc.text(item.value, x + 3, cardY + 10.8);
      });

      // Tabel Transaksi (Hanya kolom data penting)
      const tableBody = filtered.map((t, index) => [
        String(index + 1),
        t.id,
        t.store,
        t.customer,
        formatMethodLabel(t.payment_method, t.bank),
        t.date,
        `Rp ${t.amount.toLocaleString("id-ID")}`,
        t.status === "success" ? "Berhasil" : t.status === "failed" ? "Gagal" : "Tertunda",
      ]);

      autoTable(doc, {
        startY: cardY + cardH + 6,
        margin: { left: marginX, right: marginX, bottom: 16 },
        head: [["No", "Invoice", "Mitra Pengrajin", "Pelanggan", "Metode", "Tanggal", "Nominal", "Status"]],
        body: tableBody,
        theme: "grid",
        showHead: "everyPage",
        styles: {
          font: "helvetica",
          fontSize: 8.5,
          cellPadding: { top: 2.8, right: 3, bottom: 2.8, left: 3 },
          textColor: [39, 39, 42],
          lineColor: [228, 228, 231],
          lineWidth: 0.2,
          valign: "middle",
        },
        headStyles: {
          fillColor: [24, 24, 27],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8.5,
          halign: "left",
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 52, fontStyle: "bold" },
          2: { cellWidth: 45 },
          3: { cellWidth: 42 },
          4: { cellWidth: 26 },
          5: { cellWidth: 38 },
          6: { cellWidth: 33, halign: "right", fontStyle: "bold" },
          7: { cellWidth: 23, halign: "center", fontStyle: "bold" },
        },
        didParseCell: (hookData) => {
          if (hookData.section === "head") {
            if (hookData.column.index === 0 || hookData.column.index === 7) {
              hookData.cell.styles.halign = "center";
            } else if (hookData.column.index === 6) {
              hookData.cell.styles.halign = "right";
            }
          }
          if (hookData.section === "body" && hookData.column.index === 7) {
            const raw = String(hookData.cell.raw || "");
            if (raw === "Berhasil") {
              hookData.cell.styles.textColor = [22, 101, 52];
              hookData.cell.styles.fillColor = [240, 253, 244];
            } else if (raw === "Gagal") {
              hookData.cell.styles.textColor = [153, 27, 27];
              hookData.cell.styles.fillColor = [254, 242, 242];
            } else {
              hookData.cell.styles.textColor = [146, 64, 14];
              hookData.cell.styles.fillColor = [255, 251, 235];
            }
          }
        },
      });

      // Footer nomor halaman di tiap halaman
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(113, 113, 122);
        doc.text(
          "DinoyoCraft Admin â€” Laporan Transaksi Lintas Toko",
          marginX,
          pageHeight - 8
        );
        doc.text(
          `Halaman ${i} dari ${totalPages}`,
          pageWidth - marginX,
          pageHeight - 8,
          { align: "right" }
        );
      }

      const fileDate = new Date().toISOString().slice(0, 10);
      doc.save(`laporan-transaksi-${fileDate}.pdf`);
      toast.success("Laporan transaksi berhasil diunduh dalam format PDF.");
    } catch (err) {
      console.error("Gagal mengekspor PDF:", err);
      toast.error("Gagal membuat file PDF.");
    } finally {
      setIsDownloadingPdf(false);
    }
  }


  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900  mb-1">Transaksi Lintas Toko</h1>
          <p className="text-zinc-500 text-sm">Pantau perputaran uang dari seluruh Mitra Pengrajin.</p>
        </div>
        {/* Tombol Ekspor â€” CSV (outline) + PDF (clay primary) */}
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
              {loading && transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-zinc-400 animate-pulse">
                    Memuat data transaksi...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
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
                      <PaymentMethodBadge method={trx.payment_method} bank={trx.bank} />
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
