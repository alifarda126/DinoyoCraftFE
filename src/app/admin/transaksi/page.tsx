"use client";

import { useEffect, useState } from "react";
import { getDemoSession } from "@/lib/demo";
import { useRouter } from "next/navigation";
import { Receipt, MagnifyingGlass, DownloadSimple } from "@phosphor-icons/react";

type Transaction = {
  id: string;
  store: string;
  customer: string;
  amount: number;
  status: "success" | "pending" | "failed";
  date: string;
};

export default function AdminTransaksiPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getDemoSession();
    if (!session || session.role !== "admin") {
      router.push("/admin/login");
      return;
    }

    // Mock data
    setTransactions([
      { id: "INV/2023/10/XX1", store: "Studio Bumi", customer: "Budi Santoso", amount: 150000, status: "success", date: "24 Okt 2023" },
      { id: "INV/2023/10/XX2", store: "Keramik Rina", customer: "Siti Aminah", amount: 85000, status: "success", date: "23 Okt 2023" },
      { id: "INV/2023/10/XX3", store: "Tanah Liat Art", customer: "Joko Anwar", amount: 250000, status: "pending", date: "23 Okt 2023" },
      { id: "INV/2023/10/XX4", store: "Studio Bumi", customer: "Rina Nose", amount: 120000, status: "failed", date: "22 Okt 2023" },
    ]);
    setLoading(false);
  }, [router]);

  if (loading) return <div>Memuat...</div>;

  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900  mb-1">Transaksi Lintas Toko</h1>
          <p className="text-zinc-500 text-sm">Pantau perputaran uang dari seluruh Mitra Pengrajin.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white  border border-zinc-200  rounded-lg text-sm font-medium hover:bg-zinc-50 :bg-zinc-700 transition-colors">
          <DownloadSimple size={18} />
          Ekspor CSV
        </button>
      </div>

      <div className="bg-white  border border-zinc-200  rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200  flex justify-between items-center bg-zinc-50 ">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Receipt size={24} weight="duotone" className="text-zinc-500" />
            Daftar Transaksi
          </h2>
          <div className="relative">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Cari invoice atau nama..." 
              className="pl-9 pr-4 py-2 rounded-lg border border-zinc-200  bg-white  text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
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
                <th className="p-4 font-medium">Tanggal</th>
                <th className="p-4 font-medium text-right">Nominal</th>
                <th className="p-4 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((trx) => (
                <tr key={trx.id} className="border-b border-zinc-200  hover:bg-zinc-50 :bg-zinc-900/50 transition-colors">
                  <td className="p-4 font-medium text-zinc-900 ">{trx.id}</td>
                  <td className="p-4 text-sm text-zinc-600 ">{trx.store}</td>
                  <td className="p-4 text-sm text-zinc-600 ">{trx.customer}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
