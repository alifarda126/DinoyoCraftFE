"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, MagnifyingGlass, Plus, DotsThree, Trash, PencilSimple } from "@phosphor-icons/react";

import { Toaster, toast } from "sonner";

const INITIAL_USERS = [
  { id: 1, name: "Budi Santoso", email: "budi@example.com", role: "Customer", status: "Active", joined: "12 Okt 2023" },
  { id: 2, name: "Siti Rahma", email: "siti.rahma@example.com", role: "Seller", status: "Active", joined: "15 Okt 2023" },
  { id: 3, name: "Admin Utama", email: "admin@dinoyocraft.com", role: "Admin", status: "Active", joined: "01 Jan 2023" },
  { id: 4, name: "Andi Saputra", email: "andi.s@example.com", role: "Customer", status: "Suspended", joined: "20 Nov 2023" },
];

export default function ManajemenPenggunaPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState(INITIAL_USERS);

  const handleAdd = () => {
    toast.info("Modal 'Tambah Pengguna' akan muncul di sini (Mock)");
  };

  const handleEdit = (name: string) => {
    toast.info(`Modal Edit untuk pengguna ${name} akan muncul di sini (Mock)`);
  };

  const handleDelete = (id: number, name: string) => {
    setUsers(users.filter(u => u.id !== id));
    toast.success(`Pengguna ${name} berhasil dihapus (Mock)`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Users size={28} /> Manajemen Pengguna
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Kelola data pelanggan, penjual, dan administrator sistem.</p>
        </div>
        
        <button onClick={handleAdd} className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
          <Plus size={20} /> Tambah Pengguna
        </button>
      </div>

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
            <select className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none">
              <option value="">Semua Role</option>
              <option value="Admin">Admin</option>
              <option value="Seller">Seller</option>
              <option value="Customer">Customer</option>
            </select>
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
              {users.map((user) => (
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
                      <button onClick={() => handleEdit(user.name)} className="p-2 text-zinc-400 hover:text-blue-600 transition-colors" title="Edit">
                        <PencilSimple size={18} />
                      </button>
                      <button onClick={() => handleDelete(user.id, user.name)} className="p-2 text-zinc-400 hover:text-red-600 transition-colors" title="Hapus">
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 text-sm text-zinc-500 flex justify-between items-center">
          <span>Menampilkan 1-{users.length} dari {users.length} pengguna</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-zinc-200 dark:border-zinc-800 rounded disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 bg-zinc-900 text-white rounded">1</button>
            <button className="px-3 py-1 border border-zinc-200 dark:border-zinc-800 rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
