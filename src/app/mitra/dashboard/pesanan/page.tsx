"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDemoSession } from "@/lib/utils/demo";
import { toast } from "sonner";
import {
  Package,
  Receipt,
  Truck,
  CheckCircle,
  Clock,
  User,
  MagnifyingGlass,
  X,
  ChatCircle,
  PaperPlaneTilt,
  Star,
  Storefront,
} from "@phosphor-icons/react";
import { EarthySelect } from "@/components/ui/EarthySelect";

type OrderStatus = "unpaid" | "packed" | "shipped" | "completed";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  variantName?: string;
  variantHex?: string;
};

type Order = {
  id: string;
  customerName: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  resi?: string;
  kurir?: string;
  rating?: number;
  ulasan?: string;
  ulasanAvatar?: string;
  ulasanFoto?: string;
  balasanMitra?: string;
};

type ChatMsg = { from: "mitra" | "customer"; text: string; time: string };

const MOCK_CUSTOMER_CHATS: Record<string, ChatMsg[]> = {
  "ORD-20231024-001": [
    { from: "customer", text: "Halo kak, pesanan saya sudah sampai belum ya?", time: "10:15" },
    { from: "mitra", text: "Halo Kak Budi! Pesanan sedang kami proses, sebentar lagi akan kami kirim.", time: "10:20" },
  ],
  "ORD-20231023-002": [
    { from: "customer", text: "Kak, bisa minta foto produknya dulu sebelum dikirim?", time: "14:30" },
  ],
  "ORD-20231022-003": [],
};

export default function PesananSellerPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | OrderStatus>("all");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchPesanan, setSearchPesanan] = useState("");
  const [sortOrder, setSortOrder] = useState("terbaru");

  // Chat state
  const [chatOrder, setChatOrder] = useState<Order | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");

  // Atur Pengiriman state
  const [shippingOrder, setShippingOrder] = useState<Order | null>(null);
  const [kurir, setKurir] = useState("JNE");
  const [resi, setResi] = useState("");
  const [isSubmittingShipping, setIsSubmittingShipping] = useState(false);

  // Balasan ulasan state
  const [replyOrder, setReplyOrder] = useState<Order | null>(null);
  const [replyInput, setReplyInput] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  useEffect(() => {
    const session = getDemoSession();
    if (!session || session.role !== "seller") {
      router.push("/mitra/login");
      return;
    }

    setOrders([
      {
        id: "ORD-20231024-001",
        customerName: "Budi Santoso",
        date: "24 Okt 2023 10:30",
        status: "unpaid",
        total: 170000,
        items: [
          { id: "p1", name: "Vas Minimalis", price: 85000, qty: 2, image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=150&auto=format&fit=crop", variantName: "Sand White", variantHex: "#f0ebe3" }
        ]
      },
      {
        id: "ORD-20231023-002",
        customerName: "Siti Aminah",
        date: "23 Okt 2023 14:15",
        status: "packed",
        total: 65000,
        items: [
          { id: "p2", name: "Cangkir Handmade", price: 65000, qty: 1, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=150&auto=format&fit=crop", variantName: "Terracotta", variantHex: "#c1694f" }
        ]
      },
      {
        id: "ORD-20231022-003",
        customerName: "Joko Anwar",
        date: "22 Okt 2023 09:00",
        status: "shipped",
        total: 95000,
        resi: "JNE1234567890",
        kurir: "JNE",
        items: [
          { id: "p4", name: "Piring Artisan", price: 95000, qty: 1, image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=150&auto=format&fit=crop", variantName: "Raw Speckle", variantHex: "#d4cfc8" }
        ]
      },
      {
        id: "ORD-20231020-004",
        customerName: "Rina Marlina",
        date: "20 Okt 2023 11:45",
        status: "completed",
        total: 150000,
        resi: "SICEPAT987654",
        kurir: "SiCepat",
        rating: 5,
        ulasan: "Kualitas sangat bagus dan pengemasan super aman! Mangkuk keramiknya cantik dan kokoh, warnanya persis seperti foto. Terima kasih seller, pasti order lagi!",
        ulasanAvatar: "https://i.pravatar.cc/48?img=31",
        ulasanFoto: "https://images.unsplash.com/photo-1530006498959-b7884e829a04?q=80&w=300&auto=format&fit=crop",
        items: [
          { id: "p3", name: "Mangkuk Keramik", price: 75000, qty: 2, image: "https://images.unsplash.com/photo-1530006498959-b7884e829a04?q=80&w=150&auto=format&fit=crop", variantName: "Sand White", variantHex: "#f0ebe3" }
        ]
      },
      {
        id: "ORD-20231019-005",
        customerName: "Tono Wijaya",
        date: "19 Okt 2023 16:20",
        status: "completed",
        total: 75000,
        resi: "JNT098765432",
        kurir: "J&T",
        rating: 5,
        ulasan: "Mangkuknya luar biasa! Desainnya unik dan terasa premium. Sangat puas dengan kualitas pengrajin lokal Dinoyo. Sudah saya rekomendasikan ke teman-teman.",
        ulasanAvatar: "https://i.pravatar.cc/48?img=8",
        ulasanFoto: "https://images.unsplash.com/photo-1530006498959-b7884e829a04?q=80&w=300&auto=format&fit=crop",
        items: [
          { id: "p3", name: "Mangkuk Keramik", price: 75000, qty: 1, image: "https://images.unsplash.com/photo-1530006498959-b7884e829a04?q=80&w=150&auto=format&fit=crop", variantName: "Charcoal Ash", variantHex: "#3d3d3d" }
        ]
      },
      {
        id: "ORD-20231015-006",
        customerName: "Mochammad Al Mizan",
        date: "15 Okt 2023 08:30",
        status: "completed",
        total: 85000,
        resi: "ANTERAJA556677",
        kurir: "Anteraja",
        rating: 5,
        ulasan: "Glasirnya sangat halus dan rapi, warna aslinya lebih estetik daripada di foto. Pengemasan sangat kokoh dan aman sampai rumah tanpa retak sedikitpun. Bangga beli produk keramik lokal Dinoyo!",
        ulasanAvatar: "https://i.pravatar.cc/48?img=11",
        ulasanFoto: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=300&q=80",
        items: [
          { id: "p1", name: "Vas Minimalis", price: 85000, qty: 1, image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=150&auto=format&fit=crop", variantName: "Sand White", variantHex: "#f0ebe3" }
        ]
      }
    ]);

    setLoading(false);
  }, [router]);

  const tabs = [
    { id: "all", label: "Semua" },
    { id: "unpaid", label: "Belum Dibayar" },
    { id: "packed", label: "Perlu Dikemas" },
    { id: "shipped", label: "Sedang Dikirim" },
    { id: "completed", label: "Selesai" },
  ];

  const filteredOrders = (() => {
    let list = activeTab === "all" ? orders : orders.filter(o => o.status === activeTab);
    if (searchPesanan.trim()) {
      const q = searchPesanan.toLowerCase();
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q)
      );
    }
    if (sortOrder === "tertinggi") list = [...list].sort((a, b) => b.total - a.total);
    if (sortOrder === "terendah") list = [...list].sort((a, b) => a.total - b.total);
    return list;
  })();

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast.success("Status pesanan berhasil diperbarui.");
  };

  function openChat(order: Order) {
    setChatOrder(order);
    setChatMessages(MOCK_CUSTOMER_CHATS[order.id] ?? []);
    setChatInput("");
  }

  function sendChat() {
    if (!chatInput.trim() || !chatOrder) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const newMsg: ChatMsg = { from: "mitra", text: chatInput.trim(), time };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput("");
    setTimeout(() => {
      setChatMessages(prev => [...prev, { from: "customer", text: "Baik kak, terima kasih infonya! 🙏", time }]);
    }, 1400);
  }

  function openShipping(order: Order) {
    setShippingOrder(order);
    setKurir(order.kurir ?? "JNE");
    setResi(order.resi ?? "");
  }

  async function submitShipping(e: React.FormEvent) {
    e.preventDefault();
    if (!shippingOrder || !resi.trim()) return;
    setIsSubmittingShipping(true);
    await new Promise(r => setTimeout(r, 900));
    setOrders(prev => prev.map(o =>
      o.id === shippingOrder.id
        ? { ...o, status: "shipped" as OrderStatus, resi: resi.trim(), kurir }
        : o
    ));
    toast.success(`Pesanan ${shippingOrder.id} berhasil diserahkan ke ${kurir}. Resi: ${resi}`);
    setShippingOrder(null);
    setIsSubmittingShipping(false);
    setResi("");
  }

  async function submitReply(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!replyOrder || !replyInput.trim()) return;
    setIsSubmittingReply(true);
    await new Promise(r => setTimeout(r, 600));
    setOrders(prev => prev.map(o =>
      o.id === replyOrder.id
        ? { ...o, balasanMitra: replyInput.trim() }
        : o
    ));
    toast.success("Balasan ulasan berhasil dikirim.");
    setReplyOrder(null);
    setIsSubmittingReply(false);
    setReplyInput("");
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "unpaid": return <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md text-xs font-semibold"><Clock size={14} /> Belum Dibayar</div>;
      case "packed": return <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md text-xs font-semibold"><Package size={14} /> Perlu Dikemas</div>;
      case "shipped": return <div className="flex items-center gap-1.5 text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md text-xs font-semibold"><Truck size={14} /> Sedang Dikirim</div>;
      case "completed": return <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-md text-xs font-semibold"><CheckCircle size={14} /> Selesai</div>;
    }
  };

  if (loading) return <div>Memuat...</div>;

  return (
    <div>
      <div className="mb-6 flex justify-between items-end flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-1">Manajemen Pesanan</h1>
          <p className="text-zinc-500 text-sm">Pantau dan kelola pesanan masuk dari pelanggan Anda.</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <div className="relative">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchPesanan}
              onChange={e => setSearchPesanan(e.target.value)}
              placeholder="Cari ID atau nama customer..."
              className="pl-9 pr-4 py-2 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none"
              style={{ width: 220 }}
            />
          </div>
          <EarthySelect
            value={sortOrder}
            onChange={setSortOrder}
            options={[
              { value: "terbaru", label: "Terbaru" },
              { value: "tertinggi", label: "Nominal Tertinggi" },
              { value: "terendah", label: "Nominal Terendah" },
            ]}
            minWidth={160}
          />
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-zinc-200 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "all" | OrderStatus)}
              className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors relative ${
                activeTab === tab.id
                  ? "text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900" />
              )}
            </button>
          ))}
        </div>

        {/* Order List */}
        <div className="p-0">
          {filteredOrders.length > 0 ? (
            <div className="divide-y divide-zinc-200">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-zinc-50/50 transition-colors">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left: Customer & Items */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1.5 text-zinc-900 font-semibold">
                        <User size={16} className="text-zinc-500" />
                        {order.customerName}
                      </div>
                      <span className="text-zinc-300">•</span>
                      <span className="text-sm text-zinc-500">{order.date}</span>
                      <span className="text-zinc-300">•</span>
                      <span className="text-sm font-mono text-zinc-500">{order.id}</span>
                    </div>

                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg border border-zinc-200" />
                          <div>
                            <h3 className="font-medium text-zinc-900 mb-1">{item.name}</h3>
                            <p className="text-sm text-zinc-500 mb-1">{item.qty} barang x Rp {item.price.toLocaleString("id-ID")}</p>
                            {item.variantName && (
                              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: "#f5f5f5", borderRadius: "999px", padding: "0.2rem 0.6rem 0.2rem 0.35rem", border: "1px solid #e5e5e5" }}>
                                <span style={{ width: 12, height: 12, borderRadius: "50%", background: item.variantHex, border: "1.5px solid rgba(0,0,0,0.12)", flexShrink: 0, display: "inline-block" }} />
                                <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#52525b" }}>{item.variantName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Resi info jika sudah dikirim */}
                    {order.resi && (
                      <div className="mt-3 inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
                        <Truck size={13} />
                        {order.kurir} · No. Resi: {order.resi}
                      </div>
                    )}
                  </div>

                  {/* Right: Status & Actions */}
                  <div className="w-full md:w-64 flex flex-col items-end border-t md:border-t-0 md:border-l border-zinc-100 pt-4 md:pt-0 md:pl-6 justify-between">
                    <div className="w-full flex justify-between md:flex-col md:items-end gap-2 mb-4">
                      <p className="text-sm text-zinc-500">Total Belanja</p>
                      <p className="text-lg font-bold text-zinc-900">Rp {order.total.toLocaleString("id-ID")}</p>
                    </div>

                    <div className="w-full flex flex-col gap-2">
                      <div className="flex justify-end mb-2">
                        {getStatusBadge(order.status)}
                      </div>

                      {/* Action Buttons */}
                      {order.status === "packed" && (
                        <button
                          onClick={() => openShipping(order)}
                          className="w-full px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colors"
                        >
                          Atur Pengiriman
                        </button>
                      )}

                      {order.status === "shipped" && (
                        <button
                          disabled
                          className="w-full px-4 py-2 bg-purple-50 text-purple-500 rounded-lg text-sm font-semibold cursor-default border border-purple-200"
                        >
                          Menunggu Pembeli Konfirmasi
                        </button>
                      )}

                      {order.status === "unpaid" && (
                        <button className="w-full px-4 py-2 bg-zinc-100 text-zinc-400 rounded-lg text-sm font-semibold cursor-not-allowed">
                          Menunggu Pembayaran
                        </button>
                      )}

                      {/* Chat dengan customer */}
                      <button
                        onClick={() => openChat(order)}
                        className="w-full px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-semibold hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <ChatCircle size={15} />
                        Chat Customer
                        {(MOCK_CUSTOMER_CHATS[order.id]?.length ?? 0) > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                            {MOCK_CUSTOMER_CHATS[order.id].length}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="w-full px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-semibold hover:bg-zinc-50 transition-colors"
                      >
                        Lihat Rincian
                      </button>
                    </div>
                  </div>
                  </div>

                  {/* Ulasan jika Selesai */}
                  {order.status === "completed" && (
                    <div className="mt-6 pt-5 border-t border-zinc-100">
                      <p className="text-sm font-bold text-zinc-900 mb-3">Ulasan dari pembeli</p>
                      {order.rating ? (
                        <div style={{ padding: "1.25rem", border: "1px solid var(--line)", borderRadius: "1rem" }}>
                          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.65rem" }}>
                            {order.ulasanAvatar ? (
                              <img src={order.ulasanAvatar} alt={order.customerName} style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: "1.5px solid var(--line)", flexShrink: 0 }} />
                            ) : (
                              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--clay)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem", flexShrink: 0 }}>
                                {order.customerName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--bark)", margin: 0 }}>{order.customerName}</p>
                              <p style={{ fontSize: "0.72rem", color: "var(--bark-muted)", margin: 0 }}>{order.date.split(" ")[0]} {order.date.split(" ")[1]} {order.date.split(" ")[2]}</p>
                            </div>
                          </div>
                          
                          <div style={{ display: "flex", gap: "2px", color: "#f59e0b", marginBottom: "0.35rem" }}>
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} weight={i <= order.rating! ? "fill" : "regular"} />)}
                          </div>
                          
                          <p style={{ fontSize: "0.72rem", color: "var(--bark-muted)", margin: "0 0 0.6rem" }}>
                            Varian: <strong style={{ color: "var(--bark)" }}>{order.items[0]?.variantName} — {order.items[0]?.variantName === "Sand White" ? "Glossy Finish" : "Standard"}</strong>
                          </p>
                          
                          <p style={{ fontSize: "0.88rem", color: "var(--bark)", lineHeight: 1.55, margin: "0 0 0.75rem" }}>
                            {order.ulasan}
                          </p>

                          {order.ulasanFoto && (
                            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                              <img src={order.ulasanFoto} alt="Foto ulasan" style={{ width: 88, height: 72, borderRadius: "0.5rem", objectFit: "cover", border: "1px solid var(--line)" }} />
                            </div>
                          )}

                          {order.balasanMitra ? (
                            <div style={{ marginTop: "1rem", background: "var(--surface)", padding: "1rem", borderRadius: "0.75rem", position: "relative" }}>
                              <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--bark)", margin: "0 0 0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                <Storefront size={14} /> Dinoyo Ceramic Studio
                              </p>
                              <p style={{ fontSize: "0.8rem", color: "var(--bark-muted)", fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>
                                "{order.balasanMitra}"
                              </p>
                            </div>
                          ) : replyOrder?.id === order.id ? (
                            <div style={{ marginTop: "1rem" }}>
                              <textarea
                                value={replyInput}
                                onChange={(e) => setReplyInput(e.target.value)}
                                placeholder="Tulis balasan Anda untuk pembeli ini..."
                                style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--line-strong)", fontSize: "0.85rem", resize: "vertical", minHeight: 80, fontFamily: "var(--font-outfit), sans-serif", boxSizing: "border-box" }}
                              />
                              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.75rem" }}>
                                <button onClick={() => setReplyOrder(null)} style={{ padding: "0.4rem 0.8rem", borderRadius: "0.5rem", border: "1px solid var(--line-strong)", background: "#fff", color: "var(--bark)", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>Batal</button>
                                <button onClick={() => submitReply()} style={{ padding: "0.4rem 0.8rem", borderRadius: "0.5rem", border: "none", background: "var(--bark)", color: "#fff", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>Simpan Balasan</button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ marginTop: "1rem", textAlign: "right" }}>
                              <button onClick={() => { setReplyOrder(order); setReplyInput(""); }} style={{ padding: "0.5rem 1rem", borderRadius: "9999px", border: "1px solid var(--clay)", background: "#fff", color: "var(--clay)", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
                                Balas Ulasan
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-center text-zinc-500 bg-zinc-50 py-4 rounded-xl border border-zinc-100">
                          Belum ada ulasan
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Receipt size={48} className="text-zinc-300 mx-auto mb-4" />
              <h3 className="text-zinc-900 font-semibold mb-1">Belum ada pesanan</h3>
              <p className="text-zinc-500 text-sm">Tidak ada pesanan masuk untuk status ini.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Rincian Pesanan ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl">
            <h2 className="text-xl font-bold mb-4">Rincian Pesanan: {selectedOrder.id}</h2>
            <div className="space-y-4 mb-6">
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-sm">
                <p><span className="text-zinc-500">Pelanggan:</span> <span className="font-semibold">{selectedOrder.customerName}</span></p>
                <p><span className="text-zinc-500">Tanggal:</span> <span className="font-semibold">{selectedOrder.date}</span></p>
                <p><span className="text-zinc-500">Alamat:</span> Jl. Bunga Mawar No. 12, Malang</p>
                {selectedOrder.resi && (
                  <p><span className="text-zinc-500">No. Resi:</span> <span className="font-semibold">{selectedOrder.kurir} — {selectedOrder.resi}</span></p>
                )}
              </div>
              <div>
                <h3 className="font-semibold mb-2">Item:</h3>
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm mb-2">
                    <span>{item.qty}x {item.name}</span>
                    <span>Rp {(item.price * item.qty).toLocaleString("id-ID")}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-zinc-200 pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>Rp {selectedOrder.total.toLocaleString("id-ID")}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ── Modal Atur Pengiriman ── */}
      {shippingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div style={{ background: "linear-gradient(135deg, #3b3025, #5a3d28)", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="flex items-center gap-2">
                <Truck size={20} color="#fff" weight="fill" />
                <h2 style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", margin: 0 }}>Atur Pengiriman</h2>
              </div>
              <button onClick={() => setShippingOrder(null)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                <X size={14} weight="bold" />
              </button>
            </div>

            <form onSubmit={submitShipping} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Info pesanan */}
              <div style={{ background: "var(--surface)", borderRadius: "0.75rem", padding: "1rem", border: "1px solid var(--line)" }}>
                <p style={{ fontSize: "0.75rem", color: "var(--bark-muted)", marginBottom: "0.25rem" }}>Pesanan</p>
                <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--bark)", margin: 0 }}>{shippingOrder.id} · {shippingOrder.customerName}</p>
              </div>

              {/* Pilih kurir */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.5rem" }}>Kurir Pengiriman</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                  {["JNE", "J&T", "SiCepat", "Anteraja", "Pos Indonesia", "Tiki"].map(k => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKurir(k)}
                      style={{
                        padding: "0.6rem 0.5rem",
                        borderRadius: "0.6rem",
                        border: `1.5px solid ${kurir === k ? "var(--clay)" : "var(--line)"}`,
                        background: kurir === k ? "var(--clay-muted, #f5ede0)" : "#fff",
                        color: kurir === k ? "var(--clay)" : "var(--bark)",
                        fontSize: "0.78rem", fontWeight: 600,
                        cursor: "pointer", transition: "all 0.15s",
                        fontFamily: "var(--font-outfit), sans-serif",
                      }}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nomor resi */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--bark)", marginBottom: "0.5rem" }}>Nomor Resi</label>
                <input
                  type="text"
                  required
                  value={resi}
                  onChange={e => setResi(e.target.value)}
                  placeholder={`Masukkan nomor resi ${kurir}`}
                  style={{
                    width: "100%", padding: "0.75rem 1rem", borderRadius: "0.75rem",
                    border: "1px solid var(--line)", fontSize: "0.9rem",
                    outline: "none", boxSizing: "border-box",
                    fontFamily: "var(--font-outfit), sans-serif",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
                <button
                  type="button"
                  onClick={() => setShippingOrder(null)}
                  style={{ flex: 1, padding: "0.8rem", borderRadius: "0.75rem", background: "#fff", border: "1px solid var(--line-strong)", color: "var(--bark)", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-outfit), sans-serif" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingShipping || !resi.trim()}
                  style={{
                    flex: 2, padding: "0.8rem", borderRadius: "0.75rem",
                    background: isSubmittingShipping ? "var(--clay-light)" : "var(--clay)",
                    color: "#fff", fontWeight: 700, border: "none",
                    cursor: isSubmittingShipping ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-outfit), sans-serif",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  }}
                >
                  <Truck size={16} />
                  {isSubmittingShipping ? "Memproses..." : "Konfirmasi Pengiriman"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* ── Modal Chat Customer ── */}
      {chatOrder && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 bg-black/50 backdrop-blur-sm">
          <div style={{
            background: "#fff", borderRadius: "1.25rem", width: "100%", maxWidth: 380,
            boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
            display: "flex", flexDirection: "column", height: "500px", overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, #3b3025, #5a3d28)", padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontWeight: 700, color: "#fff", fontSize: "0.9rem", margin: 0 }}>
                  {chatOrder.customerName}
                </p>
                <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.65)", margin: "0.1rem 0 0" }}>
                  {chatOrder.id}
                </p>
              </div>
              <button onClick={() => setChatOrder(null)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                <X size={15} weight="bold" />
              </button>
            </div>

            {/* Pesan */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem", background: "#fafaf9" }}>
              {chatMessages.length === 0 && (
                <div style={{ textAlign: "center", marginTop: "2rem", color: "var(--bark-muted)", fontSize: "0.85rem" }}>
                  Belum ada pesan. Mulai percakapan dengan customer.
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.from === "mitra" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "78%",
                    background: msg.from === "mitra" ? "var(--clay)" : "#fff",
                    color: msg.from === "mitra" ? "#fff" : "var(--bark)",
                    padding: "0.6rem 0.9rem",
                    borderRadius: msg.from === "mitra" ? "1rem 1rem 0.2rem 1rem" : "1rem 1rem 1rem 0.2rem",
                    fontSize: "0.85rem", lineHeight: 1.5,
                    border: msg.from === "customer" ? "1px solid var(--line)" : "none",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}>
                    <p style={{ margin: 0 }}>{msg.text}</p>
                    <p style={{ margin: "0.25rem 0 0", fontSize: "0.65rem", opacity: 0.6, textAlign: "right" }}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid var(--line)", display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendChat()}
                placeholder="Ketik balasan..."
                style={{
                  flex: 1, padding: "0.6rem 0.9rem", borderRadius: "9999px",
                  border: "1px solid var(--line)", fontSize: "0.875rem",
                  outline: "none", fontFamily: "var(--font-outfit), sans-serif",
                  background: "var(--surface)",
                }}
              />
              <button
                onClick={sendChat}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "var(--clay)", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", flexShrink: 0,
                }}
              >
                <PaperPlaneTilt size={16} color="#fff" weight="fill" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
