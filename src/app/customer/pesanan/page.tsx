"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDemoSession } from "@/lib/demo";
import { 
  Package, 
  Storefront, 
  Receipt,
  Truck,
  CheckCircle,
  Clock,
  ArrowRight
} from "@phosphor-icons/react";

type OrderStatus = "unpaid" | "packed" | "shipped" | "completed";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
};

type Order = {
  id: string;
  storeName: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
};

const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-20231024-001",
    storeName: "Studio Bumi",
    date: "24 Okt 2023",
    status: "unpaid",
    total: 150000,
    items: [
      { id: "p1", name: "Vas Bunga Minimalis", price: 75000, qty: 2, image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=150&auto=format&fit=crop" }
    ]
  },
  {
    id: "ORD-20231023-002",
    storeName: "Keramik Rina",
    date: "23 Okt 2023",
    status: "packed",
    total: 85000,
    items: [
      { id: "p2", name: "Mug Teh Klasik", price: 85000, qty: 1, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=150&auto=format&fit=crop" }
    ]
  },
  {
    id: "ORD-20231022-003",
    storeName: "Tanah Liat Art",
    date: "22 Okt 2023",
    status: "shipped",
    total: 250000,
    items: [
      { id: "p3", name: "Piring Hias Dinding", price: 250000, qty: 1, image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=150&auto=format&fit=crop" }
    ]
  },
  {
    id: "ORD-20231020-004",
    storeName: "Studio Bumi",
    date: "20 Okt 2023",
    status: "completed",
    total: 300000,
    items: [
      { id: "p4", name: "Set Piring Makan", price: 150000, qty: 2, image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=150&auto=format&fit=crop" }
    ]
  }
];

export default function PesananUserPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | OrderStatus>("all");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const demo = getDemoSession();
    // For demo purposes, we allow viewing even if not logged in to show the mock UI,
    // but in a real app we'd redirect.
    setLoading(false);
  }, [router]);

  const tabs = [
    { id: "all", label: "Semua" },
    { id: "unpaid", label: "Belum Dibayar" },
    { id: "packed", label: "Dikemas" },
    { id: "shipped", label: "Dikirim" },
    { id: "completed", label: "Selesai" },
  ];

  const filteredOrders = activeTab === "all" 
    ? MOCK_ORDERS 
    : MOCK_ORDERS.filter(o => o.status === activeTab);

  const getStatusBadge = (status: OrderStatus) => {
    switch(status) {
      case "unpaid": return <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md text-xs font-semibold"><Clock size={14} /> Belum Dibayar</div>;
      case "packed": return <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md text-xs font-semibold"><Package size={14} /> Sedang Dikemas</div>;
      case "shipped": return <div className="flex items-center gap-1.5 text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md text-xs font-semibold"><Truck size={14} /> Sedang Dikirim</div>;
      case "completed": return <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-md text-xs font-semibold"><CheckCircle size={14} /> Selesai</div>;
    }
  };

  if (loading) return <div>Memuat...</div>;

  return (
    <div className="font-outfit pb-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 mb-1">Pesanan Saya</h1>
          <p className="text-zinc-500 text-sm">Lacak status pesanan dan pembelian keramik Anda.</p>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id 
                  ? "bg-zinc-900 text-white" 
                  : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Order List */}
        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Storefront size={18} className="text-zinc-500" />
                    <span className="font-semibold text-sm text-zinc-900">{order.storeName}</span>
                    <ArrowRight size={14} className="text-zinc-400" />
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="p-4 flex flex-col gap-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-zinc-100" />
                      <div className="flex-1">
                        <h3 className="font-medium text-zinc-900 text-sm mb-1">{item.name}</h3>
                        <p className="text-xs text-zinc-500 mb-1">{item.qty} barang</p>
                        <p className="text-sm font-semibold text-zinc-900">Rp {item.price.toLocaleString("id-ID")}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5">Total Pesanan</p>
                    <p className="text-base font-bold text-clay">Rp {order.total.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="flex gap-2">
                    {order.status === "unpaid" && (
                      <button 
                        onClick={() => router.push(`/customer/pembayaran/${order.id}`)}
                        className="px-4 py-2 bg-clay text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors"
                      >
                        Bayar Sekarang
                      </button>
                    )}
                    {order.status === "shipped" && (
                      <button 
                        onClick={() => toast.success("Pesanan telah diterima (Mock)")}
                        className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colors"
                      >
                        Pesanan Diterima
                      </button>
                    )}
                    {(order.status === "packed" || order.status === "completed") && (
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-semibold hover:bg-zinc-50 transition-colors"
                      >
                        Lihat Detail
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white border border-zinc-200 rounded-xl">
              <Receipt size={48} className="text-zinc-300 mx-auto mb-4" />
              <h3 className="text-zinc-900 font-semibold mb-1">Belum ada pesanan</h3>
              <p className="text-zinc-500 text-sm">Tidak ada pesanan untuk status ini.</p>
            </div>
          )}
        </div>

        {/* Modal Detail Pesanan (Mock) */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl">
              <h2 className="text-xl font-bold mb-4">Detail Pesanan: {selectedOrder.id}</h2>
              <div className="space-y-4 mb-6">
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-sm">
                  <p><span className="text-zinc-500">Toko:</span> <span className="font-semibold">{selectedOrder.storeName}</span></p>
                  <p><span className="text-zinc-500">Tanggal:</span> <span className="font-semibold">{selectedOrder.date}</span></p>
                  <p><span className="text-zinc-500">Status:</span> {getStatusBadge(selectedOrder.status)}</p>
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
                  <span>Total Tagihan</span>
                  <span className="text-clay">Rp {selectedOrder.total.toLocaleString("id-ID")}</span>
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
    </div>
  );
}
