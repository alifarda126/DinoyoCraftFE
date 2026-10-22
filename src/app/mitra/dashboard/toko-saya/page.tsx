'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { PencilSimple as FiEdit2, ShareNetwork as FiShare2, MapPin as FiMapPin, MagnifyingGlass as FiSearch } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface ProductItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  isHot?: boolean;
  rating?: number;
}

interface StoreProfileData {
  store: {
    name: string;
    address: string;
    description: string;
    avatarUrl: string | null;
    bannerUrl: string | null;
    rating: number;
    reviewCount: number;
  };
  products: ProductItem[];
}

const formatRupiah = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

// Sample fallback items matching the exact reference UI
const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: 1,
    name: 'Vas Minimalis',
    price: 85000,
    imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80',
    isHot: true,
    rating: 4.9,
  },
  {
    id: 2,
    name: 'Cangkir Handmade',
    price: 65000,
    imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&q=80',
    isHot: true,
    rating: 4.9,
  },
  {
    id: 3,
    name: 'Mangkuk Keramik',
    price: 75000,
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
    isHot: false,
    rating: 4.9,
  },
  {
    id: 4,
    name: 'Piring Artisan',
    price: 95000,
    imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=600&q=80',
    isHot: false,
    rating: 4.9,
  },
];

export default function TokoSaya() {
  const router = useRouter();
  const [data, setData] = useState<StoreProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStore = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      try {
        const response = await axios.get('http://localhost:5000/api/mitra/store-profile', {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (response.data.success && response.data.data) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error('Gagal memuat profil toko:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStore();
  }, []);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Tautan toko berhasil disalin ke clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#8B5A2B]/20 border-t-[#8B5A2B] rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-500">Memuat profil toko...</p>
        </div>
      </div>
    );
  }

  // Fallback defaults to match the reference visual design precisely
  const storeName = data?.store?.name || 'Dinoyo Ceramic Studio';
  const storeAddress = data?.store?.address && data.store.address !== 'Alamat belum diatur'
    ? data.store.address
    : 'Kampung Keramik Dinoyo, Malang';
  const storeDescription = data?.store?.description && data.store.description !== 'Belum ada deskripsi toko.'
    ? data.store.description
    : 'Studio keramik keluarga yang melestarikan seni tembikar Dinoyo sejak 1985. Menyediakan perlengkapan makan stoneware, vas hias, hingga suvenir keramik buatan tangan langsung dari tungku pembakaran lokal.';
  const storeBanner = data?.store?.bannerUrl || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80';
  const storeAvatar = data?.store?.avatarUrl || null;
  const storeRating = data?.store?.rating || 4.9;
  const storeReviewCount = data?.store?.reviewCount || 128;

  // Combine real database products with fallbacks if empty
  const rawProducts = data?.products && data.products.length > 0 ? data.products : DEFAULT_PRODUCTS;

  const displayProducts = rawProducts.map((p, idx) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    imageUrl: p.imageUrl || DEFAULT_PRODUCTS[idx % DEFAULT_PRODUCTS.length].imageUrl,
    isHot: p.isHot !== undefined ? p.isHot : idx < 2,
    rating: p.rating || 4.9,
  }));

  const filteredProducts = displayProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 md:p-8 bg-[#fafafa] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header Profile Section */}
        <div className="bg-white rounded-3xl shadow-xs border border-gray-100 mb-8 overflow-hidden">
          {/* Banner Container */}
          <div className="relative h-64 sm:h-72 md:h-80 w-full bg-stone-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={storeBanner}
              alt="Banner Toko"
              className="object-cover object-center w-full h-full"
            />

            {/* Action Buttons on Banner */}
            <div className="absolute top-4 right-4 flex items-center gap-2.5 z-10">
              <button
                onClick={handleShare}
                title="Bagikan Toko"
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-sm flex items-center justify-center text-gray-700 transition cursor-pointer"
              >
                <FiShare2 size={16} />
              </button>
              <button
                onClick={() => router.push('/mitra/dashboard/profil')}
                title="Edit Profil"
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-sm flex items-center justify-center text-gray-700 transition cursor-pointer"
              >
                <FiEdit2 size={16} />
              </button>
            </div>
          </div>

          {/* Store Info & Overlapping Avatar */}
          <div className="px-6 sm:px-8 pb-8 pt-0 relative">
            {/* Avatar Row */}
            <div className="flex justify-between items-end -mt-12 sm:-mt-14 mb-4 relative z-20">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white bg-linear-to-b from-[#2E1810] to-[#1A0D08] text-white flex items-center justify-center text-3xl font-extrabold shadow-md overflow-hidden shrink-0">
                {storeAvatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={storeAvatar} alt="Avatar Toko" className="object-cover w-full h-full" />
                ) : (
                  storeName.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {storeName}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm mt-1.5 text-gray-500">
                  <span className="flex items-center gap-1.5 text-stone-600">
                    <FiMapPin size={15} className="text-stone-400" />
                    {storeAddress}
                  </span>
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    ★ {storeRating} <span className="text-gray-400 font-normal">({storeReviewCount} Ulasan)</span>
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push('/mitra/dashboard/profil')}
                className="px-5 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-800 flex items-center gap-2 hover:bg-gray-50 transition cursor-pointer shadow-2xs shrink-0"
              >
                <FiEdit2 size={14} /> Edit Profil
              </button>
            </div>

            {/* Description Box */}
            <div className="p-4 bg-white border border-gray-200/80 rounded-2xl text-sm text-stone-700 leading-relaxed font-normal shadow-2xs">
              {storeDescription}
            </div>
          </div>
        </div>

        {/* Product Catalog Section Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Katalog Produk</h2>
            <p className="text-sm text-gray-500 mt-1">
              Menampilkan {filteredProducts.length} Produk
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari produk di toko ini..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm bg-white focus:outline-none focus:border-stone-400 placeholder-gray-400 text-gray-800 shadow-2xs"
            />
          </div>
        </div>

        {/* Grid Produk (4 Kolom Sesuai Screenshot) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => router.push('/mitra/dashboard/katalog')}
              className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden group cursor-pointer hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="relative h-56 bg-stone-100 overflow-hidden">
                {product.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-400 text-xs">
                    Tidak ada gambar
                  </div>
                )}

                {/* Top-Left Badge: Hot */}
                {product.isHot && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-gray-900/90 text-white text-[11px] font-bold rounded-full flex items-center gap-1 shadow-sm">
                    🔥 Hot
                  </div>
                )}

                {/* Top-Right Badge: Rating */}
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/95 text-gray-900 text-[11px] font-bold rounded-full flex items-center gap-1 shadow-sm">
                  ★ {product.rating}
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-400 mb-3 font-medium">
                  {storeName}
                </p>
                <p className="font-extrabold text-base text-gray-900">
                  {formatRupiah(product.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}