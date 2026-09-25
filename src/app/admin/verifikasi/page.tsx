"use client";

import { useEffect, useState } from "react";
import { getDemoSession } from "@/lib/demo";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, Storefront, MagnifyingGlass } from "@phosphor-icons/react";
import Link from "next/link";

type StoreRegistration = {
  id: string;
  owner_name: string;
  store_name: string;
  address: string;
  status: "pending" | "approved" | "rejected";
  date: string;
};

export default function AdminVerifikasiPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<StoreRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getDemoSession();
    if (!session || session.role !== "admin") {
      router.push("/admin/login");
      return;
    }

    // Mock data for new store registrations
    setRegistrations([
      {
        id: "reg-1",
        owner_name: "Bapak Hartono",
        store_name: "Studio Bumi",
        address: "Jl. Keramik No. 12, Dinoyo",
        status: "pending",
        date: "12 Okt 2023",
      },
      {
        id: "reg-2",
        owner_name: "Ibu Rina Sari",
        store_name: "Keramik Rina",
        address: "Gg. Makmur RT 02 RW 01, Dinoyo",
        status: "approved",
        date: "10 Okt 2023",
      },
      {
        id: "reg-3",
        owner_name: "Andi Saputra",
        store_name: "Tanah Liat Art",
        address: "Jl. Bunga Melati No. 8",
        status: "pending",
        date: "15 Okt 2023",
      }
    ]);
    setLoading(false);
  }, [router]);

  const handleUpdateStatus = (id: string, newStatus: "approved" | "rejected") => {
    setRegistrations(registrations.map(reg => 
      reg.id === id ? { ...reg, status: newStatus } : reg
    ));
    toast.success(`Pengajuan toko ${newStatus === "approved" ? "disetujui" : "ditolak"} (Mock)`);
  };

  if (loading) return <div>Memuat...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900  mb-1">Verifikasi Toko Mitra</h1>
        <p className="text-zinc-500 text-sm">Tinjau pengajuan Mitra Pengrajin baru yang ingin bergabung.</p>
      </div>
        <div className="bg-white  border border-zinc-200  rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-200  flex justify-between items-center bg-zinc-50 ">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Storefront size={24} weight="duotone" className="text-zinc-500" />
              Daftar Pengajuan
            </h2>
            <div className="relative">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Cari toko..." 
                className="pl-9 pr-4 py-2 rounded-lg border border-zinc-200  bg-white  text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50  border-b border-zinc-200  text-sm text-zinc-500 ">
                  <th className="p-4 font-medium">Toko & Pemilik</th>
                  <th className="p-4 font-medium">Alamat</th>
                  <th className="p-4 font-medium">Tanggal</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg.id} className="border-b border-zinc-200  hover:bg-zinc-50 :bg-zinc-900/50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-zinc-900 ">{reg.store_name}</div>
                      <div className="text-sm text-zinc-500 ">{reg.owner_name}</div>
                    </td>
                    <td className="p-4 text-sm text-zinc-600 ">
                      {reg.address}
                    </td>
                    <td className="p-4 text-sm text-zinc-600 ">
                      {reg.date}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        reg.status === "approved" ? "bg-green-100 text-green-800  " :
                        reg.status === "rejected" ? "bg-red-100 text-red-800  " :
                        "bg-yellow-100 text-yellow-800  "
                      }`}>
                        {reg.status === "approved" ? "Disetujui" : reg.status === "rejected" ? "Ditolak" : "Menunggu"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {reg.status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(reg.id, "approved")}
                            className="p-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100   :bg-green-900/40 transition-colors"
                            title="Setujui"
                          >
                            <Check size={18} weight="bold" />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(reg.id, "rejected")}
                            className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100   :bg-red-900/40 transition-colors"
                            title="Tolak"
                          >
                            <X size={18} weight="bold" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-zinc-400">-</span>
                      )}
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
