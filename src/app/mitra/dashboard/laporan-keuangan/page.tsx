"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { CurrencyCircleDollar, Wallet, ArrowUpRight, DownloadSimple, ClockCounterClockwise } from "@phosphor-icons/react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { EarthySelect } from "@/components/ui/EarthySelect";
import { useAuthStore } from "@/store/useAuthStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function LaporanKeuanganPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [financeData, setFinanceData] = useState<{
    saldoAktif: number;
    pendapatanTertunda: number;
    totalDitarik: number;
    riwayatTransaksi: Array<{
      id: string;
      tanggal: string;
      deskripsi: string;
      status: string;
      nominal: number;
      type?: string;
    }>;
  }>({
    saldoAktif: 0,
    pendapatanTertunda: 0,
    totalDitarik: 0,
    riwayatTransaksi: [],
  });

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingCsv, setIsDownloadingCsv] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawBank, setWithdrawBank] = useState("");
  const [withdrawAccountNumber, setWithdrawAccountNumber] = useState("");
  const [withdrawAccountName, setWithdrawAccountName] = useState("");
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  const [riwayatPenarikan, setRiwayatPenarikan] = useState<Array<{
    id: number;
    amount: number;
    fee: number;
    bank_name: string;
    account_number: string;
    account_name: string;
    status: string;
    admin_note?: string | null;
    created_at: string;
  }>>([]);
  const [minWithdrawal, setMinWithdrawal] = useState(50000);
  const [filterTrxType, setFilterTrxType] = useState("semua");
  const [filterTrxStatus, setFilterTrxStatus] = useState("semua");
  const [chartPeriod, setChartPeriod] = useState<"7hari" | "30hari">("7hari");
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    useAuthStore.getState().initAuth();

    const fetchFinance = async (isInitial = false) => {
      const storedToken = (typeof window !== "undefined" ? localStorage.getItem("token") : null) || Cookies.get("token");

      if (!storedToken) {
        router.push("/login");
        return;
      }

      try {
        if (isInitial) setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/mitra/finance`, {
          headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
          withCredentials: true,
        });

        if (res.data?.success && res.data?.data) {
          setFinanceData(res.data.data);
          setRiwayatPenarikan(res.data.data.riwayatPenarikan || []);
          setMinWithdrawal(res.data.data.minWithdrawal || 50000);
        }
      } catch (error) {
        console.error("Gagal memuat laporan keuangan:", error);
        if (isInitial) toast.error("Gagal memuat data laporan keuangan");
      } finally {
        if (isInitial) {
          setLoading(false);
        }
      }
    };

    fetchFinance(true);

    const onRefresh = () => {
      if (typeof document === "undefined" || document.visibilityState === "visible") {
        fetchFinance(false);
      }
    };

    const pollInterval = setInterval(onRefresh, 45_000);
    window.addEventListener("focus", onRefresh);
    document.addEventListener("visibilitychange", onRefresh);
    window.addEventListener("mitra_orders_updated", onRefresh);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("focus", onRefresh);
      document.removeEventListener("visibilitychange", onRefresh);
      window.removeEventListener("mitra_orders_updated", onRefresh);
    };
  }, [router]);

  const transactions = (financeData.riwayatTransaksi || []).map((t: any) => {
    const rawNominal =
      typeof t.nominal === "number"
        ? t.nominal
        : Number(String(t.amount || "0").replace(/[^\d-]/g, "")) || 0;
    return {
      id: String(t.id || "-"),
      date: String(t.tanggal || t.date || "-"),
      desc: String(t.deskripsi || t.desc || "Penjualan"),
      rawNominal,
      amount:
        typeof t.nominal === "number"
          ? `+ Rp ${t.nominal.toLocaleString("id-ID")}`
          : t.amount || "+ Rp 0",
      type: String(t.type || "in"),
      status: String(t.status || "Selesai"),
    };
  });

  const filteredTrx = transactions.filter((t) => {
    const matchType = filterTrxType === "semua" || t.type === filterTrxType;
    const matchStatus = filterTrxStatus === "semua" || t.status === filterTrxStatus;
    return matchType && matchStatus;
  });

  const handleDownload = async () => {
    setIsDownloading(true);
    toast.info("Menyiapkan laporan PDF...");

    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 14;
      const usableWidth = pageWidth - marginX * 2;

      const printedAt = new Date().toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const typeLabelMap: Record<string, string> = {
        semua: "Semua Tipe",
        in: "Pemasukan",
        out: "Pengeluaran",
      };
      const filterDesc = `${typeLabelMap[filterTrxType] || "Semua Tipe"}  |  ${
        filterTrxStatus === "semua" ? "Semua Status" : filterTrxStatus
      }`;

      // Header Laporan
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(113, 113, 122);
      doc.text("DINOYOCRAFT MITRA", marginX, 14);

      doc.setFontSize(15);
      doc.setTextColor(24, 24, 27);
      doc.text("Laporan Keuangan Toko", marginX, 20.5);

      const mitraLabel = user?.store_name || user?.name;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(82, 82, 91);
      if (mitraLabel) {
        doc.text(`Mitra: ${mitraLabel}`, marginX, 25.5);
      }
      doc.text(`Dicetak: ${printedAt} WIB`, pageWidth - marginX, 14, { align: "right" });
      doc.text(`Filter: ${filterDesc}`, pageWidth - marginX, 19.5, { align: "right" });

      const headerLineY = mitraLabel ? 29 : 25;
      doc.setDrawColor(228, 228, 231);
      doc.setLineWidth(0.3);
      doc.line(marginX, headerLineY, pageWidth - marginX, headerLineY);

      // Ringkasan Saldo (3 Kartu)
      const summaryCards = [
        {
          label: "SALDO AKTIF",
          value: `Rp ${(financeData.saldoAktif || 0).toLocaleString("id-ID")}`,
        },
        {
          label: "PENDAPATAN TERTUNDA",
          value: `Rp ${(financeData.pendapatanTertunda || 0).toLocaleString("id-ID")}`,
        },
        {
          label: "TOTAL DITARIK",
          value: `Rp ${(financeData.totalDitarik || 0).toLocaleString("id-ID")}`,
        },
      ];

      const cardGap = 4;
      const cardWidth = (usableWidth - cardGap * 2) / 3;
      const cardY = headerLineY + 4;
      const cardH = 15;

      summaryCards.forEach((card, idx) => {
        const x = marginX + idx * (cardWidth + cardGap);
        doc.setFillColor(250, 250, 250);
        doc.setDrawColor(228, 228, 231);
        doc.roundedRect(x, cardY, cardWidth, cardH, 1.5, 1.5, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(113, 113, 122);
        doc.text(card.label, x + 3.5, cardY + 5.2);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(24, 24, 27);
        doc.text(card.value, x + 3.5, cardY + 11.5);
      });

      // Judul Bagian 1: Riwayat Transaksi
      let nextY = cardY + cardH + 8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(24, 24, 27);
      doc.text(`Riwayat Transaksi (${filteredTrx.length})`, marginX, nextY);

      const trxRows =
        filteredTrx.length > 0
          ? filteredTrx.map((trx, idx) => [
              String(idx + 1),
              trx.id,
              trx.date,
              trx.desc,
              trx.status,
              trx.amount,
            ])
          : [["-", "-", "-", "Belum ada riwayat transaksi sesuai filter", "-", "-"]];

      autoTable(doc, {
        startY: nextY + 3,
        margin: { left: marginX, right: marginX, bottom: 16 },
        head: [["No", "ID Transaksi", "Tanggal", "Deskripsi", "Status", "Nominal"]],
        body: trxRows,
        theme: "grid",
        showHead: "everyPage",
        styles: {
          font: "helvetica",
          fontSize: 8,
          cellPadding: { top: 2.5, right: 2.8, bottom: 2.5, left: 2.8 },
          textColor: [39, 39, 42],
          lineColor: [228, 228, 231],
          lineWidth: 0.2,
          valign: "middle",
        },
        headStyles: {
          fillColor: [24, 24, 27],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8,
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 24, fontStyle: "bold" },
          2: { cellWidth: 26 },
          3: { cellWidth: 68 },
          4: { cellWidth: 24, halign: "center", fontStyle: "bold" },
          5: { cellWidth: 30, halign: "right", fontStyle: "bold" },
        },
        didParseCell: (hookData) => {
          if (hookData.section === "head") {
            if (hookData.column.index === 0 || hookData.column.index === 4) {
              hookData.cell.styles.halign = "center";
            } else if (hookData.column.index === 5) {
              hookData.cell.styles.halign = "right";
            }
          }
          if (hookData.section === "body" && hookData.column.index === 4) {
            const val = String(hookData.cell.raw || "");
            if (val === "Selesai") {
              hookData.cell.styles.textColor = [22, 101, 52];
              hookData.cell.styles.fillColor = [240, 253, 244];
            } else if (val === "Dibatalkan") {
              hookData.cell.styles.textColor = [153, 27, 27];
              hookData.cell.styles.fillColor = [254, 242, 242];
            } else if (val === "Tertunda") {
              hookData.cell.styles.textColor = [146, 64, 14];
              hookData.cell.styles.fillColor = [255, 251, 235];
            }
          }
        },
      });

      // Bagian 2: Riwayat Penarikan (jika ada)
      if (riwayatPenarikan.length > 0) {
        const prevFinalY = (doc as any).lastAutoTable?.finalY ?? nextY + 20;
        let withdrawTitleY = prevFinalY + 10;
        if (withdrawTitleY > pageHeight - 35) {
          doc.addPage();
          withdrawTitleY = 18;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(24, 24, 27);
        doc.text(`Riwayat Penarikan Dana (${riwayatPenarikan.length})`, marginX, withdrawTitleY);

        const withdrawRows = riwayatPenarikan.map((w, idx) => [
          String(idx + 1),
          new Date(w.created_at).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          `${w.bank_name} - ${w.account_number}`,
          w.account_name,
          w.status === "approved" ? "Disetujui" : w.status === "rejected" ? "Ditolak" : "Menunggu",
          `Rp ${(w.amount || 0).toLocaleString("id-ID")}`,
        ]);

        autoTable(doc, {
          startY: withdrawTitleY + 3,
          margin: { left: marginX, right: marginX, bottom: 16 },
          head: [["No", "Tanggal", "Bank & Rekening", "Pemilik Rekening", "Status", "Nominal"]],
          body: withdrawRows,
          theme: "grid",
          showHead: "everyPage",
          styles: {
            font: "helvetica",
            fontSize: 8,
            cellPadding: { top: 2.5, right: 2.8, bottom: 2.5, left: 2.8 },
            textColor: [39, 39, 42],
            lineColor: [228, 228, 231],
            lineWidth: 0.2,
            valign: "middle",
          },
          headStyles: {
            fillColor: [24, 24, 27],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 8,
          },
          alternateRowStyles: {
            fillColor: [250, 250, 250],
          },
          columnStyles: {
            0: { cellWidth: 10, halign: "center" },
            1: { cellWidth: 26 },
            2: { cellWidth: 46 },
            3: { cellWidth: 46 },
            4: { cellWidth: 24, halign: "center", fontStyle: "bold" },
            5: { cellWidth: 30, halign: "right", fontStyle: "bold" },
          },
          didParseCell: (hookData) => {
            if (hookData.section === "head") {
              if (hookData.column.index === 0 || hookData.column.index === 4) {
                hookData.cell.styles.halign = "center";
              } else if (hookData.column.index === 5) {
                hookData.cell.styles.halign = "right";
              }
            }
            if (hookData.section === "body" && hookData.column.index === 4) {
              const val = String(hookData.cell.raw || "");
              if (val === "Disetujui") {
                hookData.cell.styles.textColor = [22, 101, 52];
                hookData.cell.styles.fillColor = [240, 253, 244];
              } else if (val === "Ditolak") {
                hookData.cell.styles.textColor = [153, 27, 27];
                hookData.cell.styles.fillColor = [254, 242, 242];
              } else {
                hookData.cell.styles.textColor = [146, 64, 14];
                hookData.cell.styles.fillColor = [255, 251, 235];
              }
            }
          },
        });
      }

      // Footer nomor halaman
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(113, 113, 122);
        doc.text("DinoyoCraft Mitra â€” Laporan Keuangan Toko", marginX, pageHeight - 8);
        doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - marginX, pageHeight - 8, {
          align: "right",
        });
      }

      const fileDate = new Date().toISOString().slice(0, 10);
      doc.save(`laporan-keuangan-mitra-${fileDate}.pdf`);
      toast.success("Laporan keuangan berhasil diunduh dalam format PDF.");
    } catch (err) {
      console.error("Gagal mengekspor PDF mitra:", err);
      toast.error("Gagal membuat file PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadCsv = () => {
    setIsDownloadingCsv(true);
    toast.info("Menyiapkan file CSV...");

    try {
      const escapeCsv = (cell: unknown) => `"${String(cell ?? "").replace(/"/g, '""')}"`;
      const mitraLabel = user?.store_name || user?.name;
      const lines: string[][] = [
        ["RINGKASAN KEUANGAN MITRA", mitraLabel ? mitraLabel : ""],
        ["Saldo Aktif", `Rp ${(financeData.saldoAktif || 0).toLocaleString("id-ID")}`],
        ["Pendapatan Tertunda", `Rp ${(financeData.pendapatanTertunda || 0).toLocaleString("id-ID")}`],
        ["Total Ditarik", `Rp ${(financeData.totalDitarik || 0).toLocaleString("id-ID")}`],
        [],
        ["RIWAYAT TRANSAKSI"],
        ["ID Transaksi", "Tanggal", "Deskripsi", "Status", "Nominal"],
        ...(filteredTrx.length > 0
          ? filteredTrx.map((trx) => [
              trx.id,
              trx.date,
              trx.desc,
              trx.status,
              `Rp ${trx.rawNominal.toLocaleString("id-ID")}`,
            ])
          : [["-", "-", "Belum ada riwayat transaksi", "-", "Rp 0"]]),
      ];

      if (riwayatPenarikan.length > 0) {
        lines.push(
          [],
          ["RIWAYAT PENARIKAN DANA"],
          ["Tanggal", "Bank", "No. Rekening", "Pemilik Rekening", "Status", "Nominal", "Catatan"],
          ...riwayatPenarikan.map((w) => [
            new Date(w.created_at).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            w.bank_name,
            w.account_number,
            w.account_name,
            w.status === "approved" ? "Disetujui" : w.status === "rejected" ? "Ditolak" : "Menunggu",
            `Rp ${(w.amount || 0).toLocaleString("id-ID")}`,
            w.admin_note || "-",
          ])
        );
      }

      const csvContent = "\uFEFF" + lines.map((row) => row.map(escapeCsv).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileDate = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `laporan-keuangan-mitra-${fileDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Laporan keuangan berhasil diunduh dalam format CSV.");
    } catch (err) {
      console.error("Gagal mengekspor CSV mitra:", err);
      toast.error("Gagal membuat file CSV.");
    } finally {
      setIsDownloadingCsv(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || isSubmittingWithdraw) return;

    const storedToken =
      (typeof window !== "undefined" ? localStorage.getItem("token") : null) || Cookies.get("token");
    if (!storedToken) {
      router.push("/login");
      return;
    }

    setIsSubmittingWithdraw(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/mitra/wallet/withdraw`,
        {
          amount: parseInt(withdrawAmount, 10),
          bank_name: withdrawBank,
          account_number: withdrawAccountNumber,
          account_name: withdrawAccountName,
        },
        {
          headers: { Authorization: `Bearer ${storedToken}` },
          withCredentials: true,
        }
      );

      if (res.data?.success) {
        toast.success(res.data.message || "Pengajuan penarikan terkirim. Menunggu persetujuan admin.");
        setIsWithdrawModalOpen(false);
        setWithdrawAmount("");
        setWithdrawBank("");
        setWithdrawAccountNumber("");
        setWithdrawAccountName("");
        // Muat ulang saldo & riwayat
        const refresh = await axios.get(`${API_BASE_URL}/mitra/finance`, {
          headers: { Authorization: `Bearer ${storedToken}` },
          withCredentials: true,
        });
        if (refresh.data?.success && refresh.data?.data) {
          setFinanceData(refresh.data.data);
          setRiwayatPenarikan(refresh.data.data.riwayatPenarikan || []);
        }
      } else {
        toast.error(res.data?.message || "Gagal mengajukan penarikan.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengajukan penarikan.");
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", padding: "1rem" }}>
        <div style={{ height: "32px", width: "240px", background: "var(--surface)", borderRadius: "8px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: "110px", background: "#fff", borderRadius: "12px", border: "1px solid var(--line)" }} />
          ))}
        </div>
        <div style={{ height: "260px", background: "#fff", borderRadius: "12px", border: "1px solid var(--line)" }} />
      </div>
    );
  }

  const stats = [
    { 
      label: "Saldo Aktif", 
      value: `Rp ${(financeData.saldoAktif || 0).toLocaleString('id-ID')}`, 
      icon: Wallet, 
      color: "var(--moss)", 
      desc: "Siap ditarik" 
    },
    { 
      label: "Pendapatan Tertunda", 
      value: `Rp ${(financeData.pendapatanTertunda || 0).toLocaleString('id-ID')}`, 
      icon: ClockCounterClockwise, 
      color: "var(--sand)", 
      desc: "Menunggu pesanan selesai" 
    },
    { 
      label: "Total Ditarik", 
      value: `Rp ${(financeData.totalDitarik || 0).toLocaleString('id-ID')}`, 
      icon: ArrowUpRight, 
      color: "#2b6cb0", 
      desc: "Sejak bergabung" 
    },
  ];

  const dayLabels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const serverChart = Array.isArray((financeData as any).chartMingguan) && (financeData as any).chartMingguan.length > 0
    ? (financeData as any).chartMingguan
    : (Array.isArray((financeData as any).chartData) && (financeData as any).chartData.length > 0 ? (financeData as any).chartData : null);

  const maxWeeklyAmount = serverChart 
    ? Math.max(1, ...serverChart.map((c: any) => Number(c.total ?? c.total_amount ?? 0)))
    : 1;

  const data7 = serverChart
    ? serverChart.map((d: any) => {
        const val = Number(d.total ?? d.total_amount ?? 0);
        return {
          label: d.hari || d.label || "-",
          value: Math.round((val / maxWeeklyAmount) * 100),
          amount: `Rp ${val.toLocaleString('id-ID')}`
        };
      })
    : dayLabels.map((day) => ({
        label: day,
        value: financeData.saldoAktif > 0 ? Math.round((financeData.saldoAktif / 7) / (financeData.saldoAktif || 1) * 100) : 0,
        amount: `Rp ${financeData.saldoAktif > 0 ? Math.round(financeData.saldoAktif / 7).toLocaleString('id-ID') : 0}`
      }));

  const serverMonthlyChart = Array.isArray((financeData as any).chartBulanan) && (financeData as any).chartBulanan.length > 0
    ? (financeData as any).chartBulanan
    : null;

  const maxMonthlyAmount = serverMonthlyChart
    ? Math.max(1, ...serverMonthlyChart.map((c: any) => Number(c.total ?? c.total_amount ?? 0)))
    : 1;

  const data30 = serverMonthlyChart
    ? serverMonthlyChart.map((d: any) => {
        const val = Number(d.total ?? d.total_amount ?? 0);
        return {
          label: d.label || d.hari || "-",
          value: Math.round((val / maxMonthlyAmount) * 100),
          amount: `Rp ${val.toLocaleString('id-ID')}`
        };
      })
    : Array.from({ length: 30 }, (_, i) => ({
        label: `${i + 1}`,
        value: financeData.saldoAktif > 0 ? Math.round((financeData.saldoAktif / 30) / (financeData.saldoAktif || 1) * 100) : 0,
        amount: `Rp ${financeData.saldoAktif > 0 ? Math.round(financeData.saldoAktif / 30).toLocaleString('id-ID') : 0}`
      }));

  const currentChartData = chartPeriod === "7hari" ? data7 : data30;

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--bark)", marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>
            Laporan Keuangan
          </h1>
          <p style={{ color: "var(--bark-muted)", fontSize: "0.95rem" }}>
            Kelola saldo, pendapatan, dan riwayat penarikan dana tokomu.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: "#059669",
              color: "#fff",
              border: "none",
              padding: "0.6rem 1.25rem", borderRadius: "0.5rem",
              fontWeight: 700, fontSize: "0.85rem",
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(5, 150, 105, 0.2)",
            }}
          >
            <Wallet size={18} />
            Tarik Saldo
          </button>
          {/* Unduh CSV */}
          <button
            onClick={handleDownloadCsv}
            disabled={isDownloadingCsv}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: isDownloadingCsv ? "var(--surface)" : "#fff",
              color: "var(--bark)", border: "1px solid var(--line)",
              padding: "0.6rem 1rem", borderRadius: "0.5rem",
              fontWeight: 600, fontSize: "0.85rem",
              cursor: isDownloadingCsv ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => !isDownloadingCsv && (e.currentTarget.style.background = "var(--surface)")}
            onMouseLeave={(e) => !isDownloadingCsv && (e.currentTarget.style.background = "#fff")}
          >
            {isDownloadingCsv ? <ClockCounterClockwise size={18} className="animate-spin" /> : <DownloadSimple size={18} />}
            {isDownloadingCsv ? "Mengunduh..." : "Unduh CSV"}
          </button>
          {/* Unduh PDF */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: isDownloading ? "var(--surface)" : "var(--clay)",
              color: isDownloading ? "var(--bark)" : "#fff",
              border: "none",
              padding: "0.6rem 1.25rem", borderRadius: "0.5rem",
              fontWeight: 600, fontSize: "0.85rem",
              cursor: isDownloading ? "not-allowed" : "pointer",
              transition: "background 0.2s, transform 0.15s",
              boxShadow: isDownloading ? "none" : "0 4px 10px rgba(184, 92, 60, 0.2)"
            }}
            onMouseEnter={(e) => !isDownloading && (e.currentTarget.style.background = "var(--clay-dark)")}
            onMouseLeave={(e) => !isDownloading && (e.currentTarget.style.background = "var(--clay)")}
          >
            {isDownloading ? <ClockCounterClockwise size={18} className="animate-spin" /> : <DownloadSimple size={18} />}
            {isDownloading ? "Mengunduh..." : "Unduh PDF"}
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
        {stats.map((stat, i) => (
          <div key={i} style={{
            background: "#fff", padding: "1.5rem", borderRadius: "1rem",
            border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: "1.25rem",
            position: "relative", overflow: "hidden",
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
          }}>
            <div style={{
              position: "absolute", top: -20, right: -20, width: 100, height: 100,
              background: `radial-gradient(circle, ${stat.color}15 0%, transparent 70%)`,
              borderRadius: "50%", pointerEvents: "none"
            }} />
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "0.75rem",
                background: `${stat.color}15`, color: stat.color,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <stat.icon size={26} weight="duotone" />
              </div>
              <div>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--bark-muted)", marginBottom: "0.2rem" }}>{stat.label}</p>
                <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--bark)", letterSpacing: "-0.02em" }}>{stat.value}</p>
              </div>
            </div>
            <div style={{ paddingTop: "1rem", borderTop: "1px dashed var(--line-light)", fontSize: "0.8rem", color: "var(--bark-muted)", fontWeight: 500 }}>
              {stat.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Financial Chart Placeholder */}
      <div className="card-shadow" style={{ background: "#fff", borderRadius: "1rem", border: "1px solid var(--line)", padding: "1.5rem", marginBottom: "2.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", position: "relative", flexWrap: "wrap", gap: "1rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--bark)", margin: 0, zIndex: 1 }}>
            Grafik Pendapatan {chartPeriod === "7hari" ? "Mingguan" : "Bulanan"}
          </h2>

          <div style={{
            position: "absolute", left: "50%", transform: "translateX(-50%)",
            fontSize: "0.85rem", fontWeight: 800, color: "var(--clay)", padding: "0.3rem 1rem",
            background: "rgba(184,92,60,0.1)", borderRadius: "999px", zIndex: 0,
            letterSpacing: "0.05em"
          }} className="hidden sm:block">
            TAHUN {new Date().getFullYear()}
          </div>

          <div style={{ display: "flex", gap: "0.5rem", background: "var(--surface)", padding: "0.25rem", borderRadius: "0.5rem", zIndex: 1 }}>
            <button
              onClick={() => setChartPeriod("7hari")}
              style={{
                padding: "0.4rem 0.8rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 600,
                border: "none", cursor: "pointer", transition: "all 0.2s",
                background: chartPeriod === "7hari" ? "#fff" : "transparent",
                color: chartPeriod === "7hari" ? "var(--bark)" : "var(--bark-muted)",
                boxShadow: chartPeriod === "7hari" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
              }}
            >
              7 Hari
            </button>
            <button
              onClick={() => setChartPeriod("30hari")}
              style={{
                padding: "0.4rem 0.8rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 600,
                border: "none", cursor: "pointer", transition: "all 0.2s",
                background: chartPeriod === "30hari" ? "#fff" : "transparent",
                color: chartPeriod === "30hari" ? "var(--bark)" : "var(--bark-muted)",
                boxShadow: chartPeriod === "30hari" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
              }}
            >
              30 Hari
            </button>
          </div>
        </div>
        <div style={{
          height: "260px", background: "linear-gradient(to top, rgba(184,92,60,0.03), transparent)",
          borderRadius: "0.5rem", border: "1px dashed var(--line-light)",
          display: "flex", alignItems: "flex-end", padding: "1rem", gap: "0.2rem",
          position: "relative"
        }}>
          {currentChartData.map((d: any, i: number) => {
            const isHighest = d.value === Math.max(...currentChartData.map((c: any) => c.value));
            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredBar(i)}
                onMouseLeave={() => setHoveredBar(null)}
                style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: "0.5rem", height: "100%", position: "relative", cursor: "pointer" }}
              >
                {/* Tooltip */}
                {hoveredBar === i && (
                  <div style={{
                    position: "absolute", bottom: `calc(${d.value}% + 10px)`, zIndex: 10,
                    background: "var(--bark)", color: "#fff", padding: "0.5rem 0.75rem",
                    borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: 600,
                    whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    pointerEvents: "none", animation: "fadeIn 0.2s ease-out"
                  }}>
                    <div style={{ color: "var(--clay)", fontSize: "0.65rem", marginBottom: "0.1rem" }}>{d.label}</div>
                    {d.amount}
                    {/* Tooltip arrow */}
                    <div style={{
                      position: "absolute", bottom: "-4px", left: "50%", transform: "translateX(-50%) rotate(45deg)",
                      width: "8px", height: "8px", background: "var(--bark)"
                    }} />
                  </div>
                )}

                {/* Bar */}
                <div style={{
                  width: "100%", maxWidth: "100%", height: `${d.value}%`,
                  background: hoveredBar === i ? "var(--clay-dark)" : (isHighest ? "var(--clay)" : "var(--clay-light)"),
                  borderRadius: "4px 4px 0 0", transition: "height 0.8s ease-out, background 0.2s",
                  opacity: hoveredBar !== null && hoveredBar !== i ? 0.6 : 1
                }} />

                {/* X-Axis Label */}
                <span style={{
                  fontSize: chartPeriod === "7hari" ? "0.65rem" : "0.5rem",
                  color: "var(--bark-muted)",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  writingMode: chartPeriod === "30hari" ? "vertical-rl" : "horizontal-tb",
                  transform: chartPeriod === "30hari" ? "rotate(180deg)" : "none",
                  marginTop: chartPeriod === "30hari" ? "0.25rem" : "0"
                }}>
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction History */}
      <div className="card-shadow" style={{ background: "#fff", borderRadius: "1rem", border: "1px solid var(--line)", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", marginBottom: "2rem" }}>
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--bark)", margin: 0 }}>Riwayat Transaksi</h2>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <EarthySelect
              value={filterTrxType}
              onChange={setFilterTrxType}
              options={[
                { value: "semua", label: "Semua Tipe" },
                { value: "in", label: "Pemasukan" },
                { value: "out", label: "Pengeluaran" },
              ]}
            />
            <EarthySelect
              value={filterTrxStatus}
              onChange={setFilterTrxStatus}
              options={[
                { value: "semua", label: "Semua Status" },
                { value: "Selesai", label: "Selesai" },
                { value: "Tertunda", label: "Tertunda" },
              ]}
            />
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--line-light)" }}>
                <th style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark-muted)" }}>ID Transaksi</th>
                <th style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark-muted)" }}>Tanggal</th>
                <th style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark-muted)" }}>Deskripsi</th>
                <th style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark-muted)" }}>Status</th>
                <th style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark-muted)", textAlign: "right" }}>Nominal</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrx.length > 0 ? (
                filteredTrx.map((trx, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--line-light)", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "1rem 1.5rem", fontSize: "0.9rem", color: "var(--bark)", fontWeight: 600 }}>{trx.id}</td>
                    <td style={{ padding: "1rem 1.5rem", fontSize: "0.9rem", color: "var(--bark-muted)" }}>{trx.date}</td>
                    <td style={{ padding: "1rem 1.5rem", fontSize: "0.9rem", color: "var(--bark)" }}>{trx.desc}</td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <span style={{
                        padding: "0.35rem 0.85rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700,
                        background: trx.status === "Selesai" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                        color: trx.status === "Selesai" ? "#047857" : "#b45309",
                      }}>
                        {trx.status}
                      </span>
                    </td>
                    <td style={{ padding: "1rem 1.5rem", fontSize: "0.9rem", fontWeight: 800, textAlign: "right", color: trx.type === "in" ? "#059669" : "var(--bark)" }}>
                      {trx.amount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: "3rem 1.5rem", textAlign: "center", color: "var(--bark-muted)", fontSize: "0.9rem" }}>
                    Belum ada riwayat transaksi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Penarikan Dana */}
      {(riwayatPenarikan || []).length > 0 && (
        <section style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "1rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--bark)", marginBottom: "1rem" }}>Riwayat Penarikan</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {riwayatPenarikan.map((w) => {
              const statusColor = w.status === "approved" ? "#2f855a" : w.status === "rejected" ? "#c53030" : "#b7791f";
              const statusLabel = w.status === "approved" ? "Disetujui" : w.status === "rejected" ? "Ditolak" : "Menunggu";
              return (
                <div key={w.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1rem", borderRadius: "0.75rem", border: "1px solid var(--line)", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <p style={{ fontWeight: 700, color: "var(--bark)", fontSize: "0.95rem" }}>
                      Rp {w.amount.toLocaleString('id-ID')}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "var(--bark-muted)" }}>
                      {w.bank_name} â€¢ {w.account_number} â€¢ {w.account_name}
                    </p>
                    {w.admin_note ? (
                      <p style={{ fontSize: "0.75rem", color: "var(--bark-muted)", marginTop: "0.2rem" }}>Catatan: {w.admin_note}</p>
                    ) : null}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: statusColor }}>{statusLabel}</span>
                    <p style={{ fontSize: "0.75rem", color: "var(--bark-muted)" }}>
                      {new Date(w.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {isWithdrawModalOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#fff", borderRadius: "1.5rem", padding: "2rem", maxWidth: "450px", width: "100%", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--bark)", marginBottom: "1.5rem" }}>Tarik Dana</h2>

            <div style={{ background: "var(--surface)", padding: "1rem", borderRadius: "1rem", marginBottom: "1.5rem", border: "1px solid var(--line)" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--bark-muted)", marginBottom: "0.25rem" }}>Saldo Aktif Tersedia</p>
              <p style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--moss)" }}>Rp {(financeData.saldoAktif || 0).toLocaleString('id-ID')}</p>
            </div>

            <form onSubmit={handleWithdraw}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.5rem" }}>Nominal Penarikan (Rp)</label>
                <input
                  type="number"
                  required
                  min="50000"
                  max={String(financeData.saldoAktif || 0)}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Contoh: 1000000"
                  style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.75rem", border: "1px solid var(--line)", fontSize: "1rem", outline: "none", transition: "border-color 0.2s" }}
                />
                <p style={{ fontSize: "0.75rem", color: "var(--bark-muted)", marginTop: "0.5rem" }}>Minimal penarikan Rp {minWithdrawal.toLocaleString('id-ID')}</p>
              </div>

              <div style={{ marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.4rem" }}>Nama Bank</label>
                  <input
                    type="text"
                    required
                    value={withdrawBank}
                    onChange={(e) => setWithdrawBank(e.target.value)}
                    placeholder="Contoh: BCA, Mandiri, BRI"
                    style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.75rem", border: "1px solid var(--line)", fontSize: "0.95rem", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.4rem" }}>Nomor Rekening</label>
                  <input
                    type="text"
                    required
                    value={withdrawAccountNumber}
                    onChange={(e) => setWithdrawAccountNumber(e.target.value)}
                    placeholder="Nomor rekening tujuan"
                    style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.75rem", border: "1px solid var(--line)", fontSize: "0.95rem", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.4rem" }}>Nama Pemilik Rekening</label>
                  <input
                    type="text"
                    required
                    value={withdrawAccountName}
                    onChange={(e) => setWithdrawAccountName(e.target.value)}
                    placeholder="Sesuai buku tabungan"
                    style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.75rem", border: "1px solid var(--line)", fontSize: "0.95rem", outline: "none" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "0.75rem", background: "#fff", color: "var(--bark)", fontWeight: 700, border: "1px solid var(--line-strong)", cursor: "pointer" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWithdraw}
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "0.75rem", background: "var(--clay)", color: "#fff", fontWeight: 700, border: "none", cursor: isSubmittingWithdraw ? "wait" : "pointer", opacity: isSubmittingWithdraw ? 0.7 : 1 }}
                >
                  {isSubmittingWithdraw ? "Mengirim..." : "Proses"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
