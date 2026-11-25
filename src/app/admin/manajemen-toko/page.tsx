"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Storefront, MagnifyingGlass, CheckCircle, XCircle, Eye } from "@phosphor-icons/react";
import Link from "next/link";
import Pusher from "pusher-js";
import { toast } from "sonner";
import { adminService } from "@/services/admin.service";
import { EarthySelect } from "@/components/ui/EarthySelect";

type ShopItem = {
  id: number;
  name: string;
  owner: string;
  status: "Active" | "Pending" | "Suspended";
  rating: number;
  joined: string;
};

export default function ManajemenTokoPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [shops, setShops] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isFetchingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  const fetchShops = useCallback(async (isInitial = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (isInitial && !hasLoadedRef.current) setLoading(true);
    try {
      const res = await adminService.getVerifikasiList();
      const rawList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const mapped: ShopItem[] = rawList.map((item: any) => {
        let status: "Active" | "Pending" | "Suspended" = "Pending";
        if (item.is_verified === 1) {
          status = "Active";
        } else if (
          item.is_verified === 2 ||
          item.rejection_reason ||
          (item.is_verified === 0 && item.is_active === 0)
        ) {
          status = "Suspended";
        }
        return {
          id: Number(item.id),
          name: item.store_name || "Toko Mitra",
          owner: item.owner_name || "Pemilik Toko",
          status,
          rating: Number(item.rating || 0),
          joined: item.created_at
            ? new Date(item.created_at).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-",
        };
      });
      setShops(mapped);
      hasLoadedRef.current = true;
    } catch (err: any) {
      console.error("Gagal memuat daftar toko:", err);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShops(true);
    const onFocus = () => {
      if (typeof document === "undefined" || document.visibilityState === "visible") {
        fetchShops(false);
      }
    };
    const interval = setInterval(onFocus, 45_000);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("admin_verifikasi_updated", onFocus);

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || "b5fa050e0050acfb222a";
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";
    let pusher: Pusher | null = null;
    try {
      pusher = new Pusher(pusherKey, { cluster: pusherCluster });
      const ch = pusher.subscribe("mitra-verification");
      ch.bind("verification-status-updated", () => fetchShops(false));
    } catch {}

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("admin_verifikasi_updated", onFocus);
      if (pusher) {
        try {
          pusher.unsubscribe("mitra-verification");
          pusher.disconnect();
        } catch {}
      }
    };
  }, [fetchShops]);

  const handleAccept = async (id: number, name: string) => {
    try {
      await adminService.verifyStore(id, "approved");
      setShops((prev) => prev.map((shop) => (shop.id === id ? { ...shop, status: "Active" } : shop)));
      toast.success(`Toko ${name} berhasil diverifikasi dan diaktifkan.`);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("admin_verifikasi_updated"));
      }
      fetchShops(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal memverifikasi toko.");
    }
  };

  const handleReject = async (id: number, name: string) => {
    try {
      await adminService.verifyStore(id, "rejected", "Pendaftaran toko ditolak oleh Admin.");
      setShops((prev) => prev.map((shop) => (shop.id === id ? { ...shop, status: "Suspended" } : shop)));
      toast.error(`Pendaftaran toko ${name} ditolak.`);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("admin_verifikasi_updated"));
      }
      fetchShops(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menolak pendaftaran toko.");
    }
  };

  const filteredShops = shops.filter((shop) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q || shop.name.toLowerCase().includes(q) || shop.owner.toLowerCase().includes(q);
    const matchStatus = !statusFilter || shop.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Storefront size={28} /> Manajemen Toko / Workshop
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Tinjau pendaftaran mitra pengrajin baru dan kelola toko yang sudah aktif.</p>
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
            <EarthySelect
              value={statusFilter || "all"}
              onChange={(val) => setStatusFilter(val === "all" ? "" : val)}
              minWidth={170}
              options={[
                { value: "all", label: "Semua Status" },
                { value: "Active", label: "Aktif" },
                { value: "Pending", label: "Menunggu Verifikasi" },
                { value: "Suspended", label: "Ditangguhkan" },
              ]}
            />
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
              {loading && shops.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    Memuat data toko dari server...
                  </td>
                </tr>
              ) : filteredShops.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    Tidak ada toko yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredShops.map((shop) => (
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
                        <Link href="/admin/verifikasi" className="p-2 text-zinc-400 hover:text-blue-600 transition-colors" title="Detail Verifikasi">
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
