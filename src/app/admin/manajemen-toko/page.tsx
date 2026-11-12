"use client";

import { useState } from "react";
import { Storefront, MagnifyingGlass, CheckCircle, XCircle, Eye } from "@phosphor-icons/react";
import Link from "next/link";

import { Toaster, toast } from "sonner";

const INITIAL_SHOPS = [
  { id: 1, name: "Studio Keramik Bumi", owner: "Siti Rahma", status: "Active", rating: 4.8, joined: "15 Okt 2023" },
  { id: 2, name: "Dinoyo Indah", owner: "Budi Santoso", status: "Pending", rating: 0, joined: "20 Okt 2023" },
  { id: 3, name: "Kerajinan Tanah Liat", owner: "Andi Saputra", status: "Suspended", rating: 3.2, joined: "05 Jan 2023" },
];

export default function ManajemenTokoPage() {
  const [search, setSearch] = useState("");
  const [shops, setShops] = useState(INITIAL_SHOPS);

  const handleAccept = (id: number, name: string) => {
    setShops(shops.map(shop => shop.id === id ? { ...shop, status: "Active" } : shop));
    toast.success(`Toko ${name} berhasil diverifikasi dan diaktifkan.`);
  };

  const handleReject = (id: number, name: string) => {
    setShops(shops.map(shop => shop.id === id ? { ...shop, status: "Suspended" } : shop));
    toast.error(`Pendaftaran toko ${name} ditolak.`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Storefront size={28} /> Manajemen Toko / Workshop
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Tinjau pendaftaran mitra pengrajin baru dan kelola toko yang sudah aktif.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
          <div className="relative w-64">
            <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Cari nama toko atau pemilik..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none"
            />
          </div>
          
          <div className="flex gap-2">
            <select className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none">
              <option value="">Semua Status</option>
              <option value="Active">Aktif</option>
              <option value="Pending">Menunggu Verifikasi</option>
              <option value="Suspended">Ditangguhkan</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500">
              <tr>
                <th className="px-6 py-3 font-semibold">Toko</th>
                <th className="px-6 py-3 font-semibold">Pemilik</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Rating</th>
                <th className="px-6 py-3 font-semibold">Tanggal Daftar</th>
                <th className="px-6 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {shops.map((shop) => (
                <tr key={shop.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">{shop.name}</div>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{shop.owner}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                      shop.status === 'Active' ? 'bg-green-100 text-green-700' : 
                      shop.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {shop.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {shop.rating > 0 ? `${shop.rating} / 5.0` : '-'}
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{shop.joined}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/toko/${shop.id}`} className="p-2 text-zinc-400 hover:text-blue-600 transition-colors" title="Lihat Toko Publik">
                        <Eye size={18} />
                      </Link>
                      {shop.status === 'Pending' && (
                        <>
                          <button onClick={() => handleAccept(shop.id, shop.name)} className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors" title="Terima Pendaftaran">
                            <CheckCircle size={18} />
                          </button>
                          <button onClick={() => handleReject(shop.id, shop.name)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Tolak Pendaftaran">
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
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
