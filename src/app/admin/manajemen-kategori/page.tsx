"use client";

import { useState } from "react";
import { Folder, MagnifyingGlass, Plus, PencilSimple, Trash } from "@phosphor-icons/react";
import Image from "next/image";

import { Toaster, toast } from "sonner";

const INITIAL_CATEGORIES = [
  { id: 1, name: "Vas Keramik", slug: "vas-keramik", products: 45, status: "Active" },
  { id: 2, name: "Piring & Mangkuk", slug: "piring-mangkuk", products: 120, status: "Active" },
  { id: 3, name: "Dekorasi", slug: "dekorasi", products: 32, status: "Active" },
  { id: 4, name: "Lainnya", slug: "lainnya", products: 15, status: "Inactive" },
];

export default function ManajemenKategoriPage() {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);

  const handleAdd = () => {
    toast.info("Modal 'Tambah Kategori' akan muncul di sini (Mock)");
  };

  const handleEdit = (name: string) => {
    toast.info(`Modal Edit untuk kategori ${name} akan muncul di sini (Mock)`);
  };

  const handleDelete = (id: number, name: string) => {
    setCategories(categories.filter(c => c.id !== id));
    toast.success(`Kategori ${name} berhasil dihapus (Mock)`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Folder size={28} /> Manajemen Kategori
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Kelola daftar kategori produk untuk memudahkan pencarian pelanggan.</p>
        </div>
        
        <button onClick={handleAdd} className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
          <Plus size={20} /> Tambah Kategori
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
          <div className="relative w-64">
            <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Cari kategori..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500">
              <tr>
                <th className="px-6 py-3 font-semibold w-16">ID</th>
                <th className="px-6 py-3 font-semibold">Nama Kategori</th>
                <th className="px-6 py-3 font-semibold">Slug URL</th>
                <th className="px-6 py-3 font-semibold">Jumlah Produk</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                  <td className="px-6 py-4 font-mono text-zinc-500">#{cat.id}</td>
                  <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">{cat.name}</td>
                  <td className="px-6 py-4 text-zinc-500">{cat.slug}</td>
                  <td className="px-6 py-4">{cat.products} produk</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                      cat.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-700'
                    }`}>
                      {cat.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(cat.name)} className="p-2 text-zinc-400 hover:text-blue-600 transition-colors" title="Edit">
                        <PencilSimple size={18} />
                      </button>
                      <button onClick={() => handleDelete(cat.id, cat.name)} className="p-2 text-zinc-400 hover:text-red-600 transition-colors" title="Hapus">
                        <Trash size={18} />
                      </button>
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
