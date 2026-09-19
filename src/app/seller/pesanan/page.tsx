"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDemoSession } from "@/lib/demo";
import { toast } from "sonner";
import { 
  Package, 
  Receipt,
  Truck,
  CheckCircle,
  Clock,
  User,
  MagnifyingGlass
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
  customerName: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
};

export default function PesananSellerPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | OrderStatus>("all");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const session = getDemoSession();
    if (!session || session.role !== "seller") {
      router.push("/auth");
      return;
    }

    // Mock initial data
    setOrders([
      {
        id: "ORD-20231024-001",
        customerName: "Budi Santoso",
        date: "24 Okt 2023 10:30",
        status: "unpaid",
        total: 150000,
        items: [
          { id: "p1", name: "Vas Bunga Minimalis", price: 75000, qty: 2, image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=150&auto=format&fit=crop" }
        ]
      },
      {
        id: "ORD-20231023-002",
        customerName: "Siti Aminah",
        date: "23 Okt 2023 14:15",
        status: "packed",
        total: 85000,
        items: [
          { id: "p2", name: "Mug Teh Klasik", price: 85000, qty: 1, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=150&auto=format&fit=crop" }
        ]
      },
      {
        id: "ORD-20231022-003",
        customerName: "Joko Anwar",
        date: "22 Okt 2023 09:00",
        status: "shipped",
        total: 250000,
        items: [
          { id: "p3", name: "Piring Hias Dinding", price: 250000, qty: 1, image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=150&auto=format&fit=crop" }
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

  const filteredOrders = activeTab === "all" 
    ? orders 
    : orders.filter(o => o.status === activeTab);

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast.success("Status pesanan berhasil diperbarui (Mock)");
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch(status) {
      case "unpaid": return <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md text-xs font-semibold"><Clock size={14} /> Belum Dibayar</div>;
      case "packed": return <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md text-xs font-semibold"><Package size={14} /> Perlu Dikemas</div>;
      case "shipped": return <div className="flex items-center gap-1.5 text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md text-xs font-semibold"><Truck size={14} /> Sedang Dikirim</div>;
      case "completed": return <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-md text-xs font-semibold"><CheckCircle size={14} /> Selesai</div>;
    }
  };

  if (loading) return <div>Memuat...</div>;

  return (
    <div>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-1">Manajemen Pesanan</h1>
          <p className="text-zinc-500 text-sm">Pantau dan kelola pesanan masuk dari pelanggan Anda.</p>
        </div>
        <div className="relative w-64">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Cari ID pesanan atau nama..." 
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-zinc-200 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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
                <div key={order.id} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-zinc-50/50 transition-colors">
                  
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
                          </div>
                        </div>
                      ))}
                    </div>
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
                      
                      {/* Action Buttons based on Status */}
                      {order.status === "packed" && (
                        <button 
                          onClick={() => handleUpdateStatus(order.id, "shipped")}
                          className="w-full px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colors"
                        >
                          Atur Pengiriman
                        </button>
                      )}
                      
                      {order.status === "shipped" && (
                        <button 
                          onClick={() => handleUpdateStatus(order.id, "completed")}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                        >
                          Selesaikan Pesanan
                        </button>
                      )}

                      {order.status === "unpaid" && (
                        <button className="w-full px-4 py-2 bg-zinc-100 text-zinc-400 rounded-lg text-sm font-semibold cursor-not-allowed">
                          Menunggu Pembayaran
                        </button>
                      )}

                      <button 
                        onClick={() => toast.info("Menampilkan rincian pesanan (Mock)")}
                        className="w-full px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-semibold hover:bg-zinc-50 transition-colors"
                      >
                        Lihat Rincian
                      </button>
                    </div>
                  </div>

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
    </div>
  );
}
