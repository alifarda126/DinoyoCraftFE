"use client";

import { createClient } from "@/lib/supabase";
import { getDemoSession } from "@/lib/demo";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { TrendUp, Bank, Calculator, Download } from "@phosphor-icons/react";
import Link from "next/link";

type Report = {
  id: string;
  date: string;
  booking_revenue: number;
  custom_order_revenue: number;
  total_revenue: number;
  total_expenses: number;
  profit: number;
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const router = useRouter();
  const supabase = createClient();

  const checkAdmin = async () => {
    const demo = getDemoSession();
    if (demo) {
      if (demo.role !== "admin") router.push("/dashboard");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      router.push("/dashboard");
    }
  };

  const loadReports = async () => {
    const { data } = await supabase
      .from("financial_reports")
      .select("*")
      .order("date", { ascending: false })
      .limit(30);

    if (data) setReports(data);
  };

  useEffect(() => {
    checkAdmin();
    loadReports();
  }, [period]);

  function aggregateByPeriod(reps: Report[]) {
    if (period === "daily") return reps;

    const map = new Map<string, Report>();
    reps.forEach((r) => {
      const key =
        period === "weekly"
          ? `Minggu ${format(new Date(r.date), "w")}` 
          : format(new Date(r.date), "MMMM yyyy");
      const exists = map.get(key);
      if (exists) {
        map.set(key, {
          ...exists,
          booking_revenue: exists.booking_revenue + r.booking_revenue,
          custom_order_revenue: exists.custom_order_revenue + r.custom_order_revenue,
          total_revenue: exists.total_revenue + r.total_revenue,
          total_expenses: exists.total_expenses + r.total_expenses,
          profit: exists.profit + r.profit,
        });
      } else {
        map.set(key, { ...r });
      }
    });
    return Array.from(map.values());
  }

  function convertToCSV(data: Report[]) {
    const header = ["Tanggal", "Pendapatan Reservasi", "Pendapatan Kustom", "Total Pendapatan", "Pengeluaran", "Laba"];
    const rows = data.map((r) => [
      r.date,
      r.booking_revenue,
      r.custom_order_revenue,
      r.total_revenue,
      r.total_expenses,
      r.profit,
    ]);
    return [header, ...rows]
      .map((row) => row.join(","))
      .join("\n");
  }

  function downloadCSV() {
    const filtered = aggregateByPeriod(reports);
    const csv = convertToCSV(filtered);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-${period}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const summarized = aggregateByPeriod(reports);
  const totalRevenue = summarized.reduce((sum, r) => sum + r.total_revenue, 0);
  const totalProfit = summarized.reduce((sum, r) => sum + r.profit, 0);
  const totalBookings = summarized.reduce((sum, r) => sum + r.booking_revenue, 0);

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
              &larr; Admin
            </Link>
            <h1 className="text-xl font-semibold">Laporan Keuangan</h1>
          </div>
          <button
            onClick={downloadCSV}
            className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-2 text-zinc-500 mb-2">
              <TrendUp className="w-4 h-4" />
              <span className="text-sm">Total Pendapatan</span>
            </div>
            <div className="text-2xl font-semibold">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-2 text-zinc-500 mb-2">
              <Bank className="w-4 h-4" />
              <span className="text-sm">Pendapatan Reservasi</span>
            </div>
            <div className="text-2xl font-semibold">
              Rp {totalBookings.toLocaleString("id-ID")}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-2 text-zinc-500 mb-2">
              <Calculator className="w-4 h-4" />
              <span className="text-sm">Laba Bersih</span>
            </div>
            <div className="text-2xl font-semibold text-emerald-600">
              Rp {totalProfit.toLocaleString("id-ID")}
            </div>
          </div>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex gap-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
              {(["daily", "weekly", "monthly"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    period === p
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  {p === "daily" ? "Harian" : p === "weekly" ? "Mingguan" : "Bulanan"}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-zinc-500">Periode</th>
                  <th className="text-right px-5 py-3 font-medium text-zinc-500">Reservasi</th>
                  <th className="text-right px-5 py-3 font-medium text-zinc-500">Kustom</th>
                  <th className="text-right px-5 py-3 font-medium text-zinc-500">Total</th>
                  <th className="text-right px-5 py-3 font-medium text-zinc-500">Laba</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {summarized.map((report) => (
                  <tr key={report.id}>
                    <td className="px-5 py-3 font-medium">
                      {format(new Date(report.date), "d MMM yyyy", { locale: localeId })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      Rp {report.booking_revenue.toLocaleString("id-ID")}
                    </td>
                    <td className="px-5 py-3 text-right">
                      Rp {report.custom_order_revenue.toLocaleString("id-ID")}
                    </td>
                    <td className="px-5 py-3 text-right font-medium">
                      Rp {report.total_revenue.toLocaleString("id-ID")}
                    </td>
                    <td className="px-5 py-3 text-right text-emerald-600 font-medium">
                      Rp {report.profit.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {summarized.length === 0 && (
              <p className="text-center text-zinc-500 py-12">
                Belum ada data laporan.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}