"use client";

import { useState } from "react";
import { Folder, MagnifyingGlass, Plus, PencilSimple, Trash, Check, X } from "@phosphor-icons/react";
import { toast } from "sonner";

type Category = {
  id: number;
  name: string;
  slug: string;
  products: number;
  status: "Active" | "Inactive";
};

const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: "Vas Keramik", slug: "vas-keramik", products: 45, status: "Active" },
  { id: 2, name: "Piring & Mangkuk", slug: "piring-mangkuk", products: 120, status: "Active" },
  { id: 3, name: "Dekorasi", slug: "dekorasi", products: 32, status: "Active" },
  { id: 4, name: "Lainnya", slug: "lainnya", products: 15, status: "Inactive" },
];

export default function ManajemenKategoriPage() {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] = useState<"Active" | "Inactive">("Active");
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState<"Active" | "Inactive">("Active");

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const slug = newName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const newCat: Category = {
      id: Math.max(0, ...categories.map(c => c.id)) + 1,
      name: newName.trim(), slug, products: 0, status: newStatus,
    };
    setCategories(prev => [...prev, newCat]);
    setNewName(""); setNewStatus("Active"); setShowAddForm(false);
    toast.success(`Kategori "${newCat.name}" berhasil ditambahkan!`);
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditStatus(cat.status);
  }

  function handleEdit(e: React.FormEvent, id: number) {
    e.preventDefault();
    if (!editName.trim()) return;
    const slug = editName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name: editName.trim(), slug, status: editStatus } : c));
    setEditingId(null);
    toast.success("Kategori berhasil diperbarui!");
  }

  function handleDelete(id: number, name: string) {
    setCategories(prev => prev.filter(c => c.id !== id));
    toast.success(`Kategori "${name}" berhasil dihapus!`);
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Folder size={28} /> Manajemen Kategori
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Kelola daftar kategori produk untuk memudahkan pencarian pelanggan.</p>
        </div>
        <button
          onClick={() => { setShowAddForm(v => !v); setEditingId(null); }}
          className="bg-zinc-900 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-zinc-700 transition-colors"
        >
          {showAddForm ? <X size={20} /> : <Plus size={20} />}
          {showAddForm ? "Batal" : "Tambah Kategori"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="mb-6 bg-white border border-zinc-200 rounded-xl p-5 flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold mb-1.5 text-zinc-700">Nama Kategori</label>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required
              placeholder="Contoh: Pot Tanaman"
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-zinc-700">Status</label>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value as "Active" | "Inactive")}
              className="px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <button type="submit" className="bg-zinc-900 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-zinc-700 transition-colors flex items-center gap-2">
            <Check size={18} /> Simpan
          </button>
        </form>
      )}

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
          <div className="relative w-64">
            <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input type="text" placeholder="Cari kategori..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900" />
          </div>
          <span className="text-sm text-zinc-400">{filtered.length} kategori</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500">
              <tr>
                <th className="px-6 py-3 font-semibold w-16">ID</th>
                <th className="px-6 py-3 font-semibold">Nama Kategori</th>
                <th className="px-6 py-3 font-semibold">Slug URL</th>
                <th className="px-6 py-3 font-semibold">Jumlah Produk</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filtered.map((cat) => (
                <tr key={cat.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-zinc-500">#{cat.id}</td>
                  <td className="px-6 py-4">
                    {editingId === cat.id ? (
                      <form onSubmit={e => handleEdit(e, cat.id)} className="flex items-center gap-2">
                        <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required autoFocus
                          className="px-2 py-1 rounded border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 w-40" />
                        <select value={editStatus} onChange={e => setEditStatus(e.target.value as "Active" | "Inactive")}
                          className="px-2 py-1 rounded border border-zinc-300 text-sm focus:outline-none bg-white">
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                        <button type="submit" className="p-1 text-green-600 hover:text-green-700" title="Simpan"><Check size={18} weight="bold" /></button>
                        <button type="button" onClick={() => setEditingId(null)} className="p-1 text-zinc-400 hover:text-zinc-600" title="Batal"><X size={18} weight="bold" /></button>
                      </form>
                    ) : (
                      <span className="font-semibold text-zinc-900">{cat.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{cat.slug}</td>
                  <td className="px-6 py-4">{cat.products} produk</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${cat.status === "Active" ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-700"}`}>
                      {cat.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingId !== cat.id && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEdit(cat)} className="p-2 text-zinc-400 hover:text-blue-600 transition-colors" title="Edit">
                          <PencilSimple size={18} />
                        </button>
                        <button onClick={() => handleDelete(cat.id, cat.name)} className="p-2 text-zinc-400 hover:text-red-600 transition-colors" title="Hapus">
                          <Trash size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-zinc-400">
                  {search ? `Tidak ada kategori yang cocok dengan "${search}"` : "Belum ada kategori."}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
