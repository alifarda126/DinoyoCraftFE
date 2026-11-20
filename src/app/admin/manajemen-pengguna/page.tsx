"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, MagnifyingGlass, ArrowsClockwise, Prohibit, CheckCircle, SignOut } from "@phosphor-icons/react";
import { toast } from "sonner";
import { adminService } from "@/services/admin.service";
import { EarthySelect } from "@/components/ui/EarthySelect";

type UserItem = {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Seller" | "Customer";
  rawRole: string;
  status: "Active" | "Suspended";
  isActive: boolean;
  joined: string;
};

export default function ManajemenPenggunaPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchUsers = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await adminService.getUsers({ limit: 100 });
      const rawList = Array.isArray(res?.data) ? res.data : [];
      const mapped: UserItem[] = rawList.map((u: any) => {
        const rawRole = String(u.role || "buyer").toLowerCase();
        const roleLabel: "Admin" | "Seller" | "Customer" =
          rawRole === "admin"
            ? "Admin"
            : rawRole === "mitra" || rawRole === "seller"
            ? "Seller"
            : "Customer";
        const isActive = Boolean(u.is_active === 1 || u.is_active === true);
        return {
          id: Number(u.id),
          name: u.name || "Pengguna",
          email: u.email || "-",
          role: roleLabel,
          rawRole,
          status: isActive ? "Active" : "Suspended",
          isActive,
          joined: u.created_at
            ? new Date(u.created_at).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-",
        };
      });
      setUsers(mapped);
      setErrorMsg(null);
    } catch (err: any) {
      console.error("Gagal memuat daftar pengguna:", err);
      setErrorMsg(err?.response?.data?.message || "Gagal memuat data pengguna dari server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(true);
    const onFocus = () => {
      if (typeof document === "undefined" || document.visibilityState === "visible") {
        fetchUsers(false);
      }
    };
    const interval = setInterval(onFocus, 45_000);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [fetchUsers]);

  const handleToggleStatus = async (user: UserItem) => {
    const nextActive = !user.isActive;
    try {
      await adminService.updateUserStatus(user.id, nextActive);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, isActive: nextActive, status: nextActive ? "Active" : "Suspended" }
            : u
        )
      );
      toast.success(
        `Status akun ${user.name} berhasil diubah menjadi ${nextActive ? "Active" : "Suspended"}.`
      );
      fetchUsers(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal memperbarui status pengguna.");
    }
  };

  const handleForceLogout = async (user: UserItem) => {
    try {
      await adminService.forceLogoutUser(user.id);
      toast.success(`Seluruh sesi perangkat untuk ${user.name} telah diakhiri.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal mengakhiri sesi pengguna.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Users size={28} /> Manajemen Pengguna
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Kelola data pelanggan, penjual, dan administrator sistem.</p>
        </div>
        
        <button
          onClick={() => fetchUsers(false)}
          className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm"
        >
          <ArrowsClockwise size={18} className={loading ? "animate-spin" : ""} /> Refresh Data
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-red-800">{errorMsg}</span>
          <button
            onClick={() => fetchUsers(true)}
            className="px-3 py-1 rounded-md text-xs font-bold bg-red-600 text-white hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
          <div className="relative w-64">
            <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Cari nama atau email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none"
            />
          </div>
          
          <div className="flex gap-2">
            <EarthySelect
              value={roleFilter || "all"}
              onChange={(val) => setRoleFilter(val === "all" ? "" : val)}
              minWidth={150}
              options={[
                { value: "all", label: "Semua Role" },
                { value: "Admin", label: "Admin" },
                { value: "Seller", label: "Seller" },
                { value: "Customer", label: "Customer" },
              ]}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500">
              <tr>
                <th className="px-6 py-3 font-semibold">Pengguna</th>
                <th className="px-6 py-3 font-semibold">Role</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Bergabung</th>
                <th className="px-6 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    Memuat data pengguna dari server...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    Tidak ada pengguna yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</div>
                      <div className="text-zinc-500 text-xs">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                        user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'Seller' ? 'bg-blue-100 text-blue-700' :
                        'bg-zinc-100 text-zinc-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                        user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">{user.joined}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-2 transition-colors ${
                            user.isActive
                              ? "text-zinc-400 hover:text-red-600"
                              : "text-zinc-400 hover:text-green-600"
                          }`}
                          title={user.isActive ? "Tangguhkan Akun (Suspend)" : "Aktifkan Akun"}
                        >
                          {user.isActive ? <Prohibit size={18} /> : <CheckCircle size={18} />}
                        </button>
                        <button
                          onClick={() => handleForceLogout(user)}
                          className="p-2 text-zinc-400 hover:text-amber-600 transition-colors"
                          title="Akhiri Sesi di Semua Perangkat"
                        >
                          <SignOut size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 text-sm text-zinc-500 flex justify-between items-center">
          <span>Menampilkan {filteredUsers.length} dari {users.length} pengguna</span>
        </div>
      </div>
    </div>
  );
}
