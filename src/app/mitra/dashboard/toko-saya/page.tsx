'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import {
  PencilSimple as FiEdit2,
  ShareNetwork as FiShare2,
  MapPin as FiMapPin,
  MagnifyingGlass as FiSearch,
  ArrowLeft,
  Star,
  Package,
  ChatCircleText,
  Storefront,
  PaperPlaneRight,
} from '@phosphor-icons/react';
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
    id?: number;
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

interface ProductVariantDetail {
  name: string;
  hex: string;
  label: string;
  stock: number;
}

interface ProductReviewItem {
  id: number;
  rating: number;
  variant?: string | null;
  comment?: string | null;
  photo_urls?: string[];
  seller_reply?: string | null;
  replied_at?: string | null;
  created_at?: string | null;
  user_name: string;
  user_avatar?: string | null;
}

interface ProductFullDetail {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  weight_gram: number;
  category: string;
  rating: number;
  total_reviews: number;
  sold_count: number;
  images: string[];
  variants: ProductVariantDetail[];
  reviews: ProductReviewItem[];
}

const formatRupiah = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const isCustomAvatar = (url?: string | null) => {
  if (!url) return false;
  if (url.includes('googleusercontent.com') || url.includes('google.com')) {
    return false;
  }
  return true;
};

const formatReviewDate = (raw?: string | null) => {
  if (!raw) return '';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function TokoSaya() {
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const [data, setData] = useState<StoreProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // State Detail Produk (mode tampilan Mitra — tanpa tombol Keranjang/Beli, dengan fitur Balas Ulasan)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [productDetail, setProductDetail] = useState<ProductFullDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [replyingReviewId, setReplyingReviewId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const getToken = () =>
    (typeof window !== 'undefined' ? localStorage.getItem('token') : null) || Cookies.get('token') || null;

  const fetchStore = useCallback(async (isInitial = false) => {
    const token = getToken();
    if (isInitial) setIsLoading(true);
    try {
      const response = await axios.get(`${apiBase}/mitra/store-profile`, {
        withCredentials: true,
        timeout: 15000,
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
  }, [apiBase]);

  useEffect(() => {
    fetchStore(true);
    const onRefresh = () => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        fetchStore(false);
      }
    };
    window.addEventListener('focus', onRefresh);
    document.addEventListener('visibilitychange', onRefresh);
    window.addEventListener('mitra_products_updated', onRefresh);
    window.addEventListener('mitra-verification-updated', onRefresh);
    return () => {
      window.removeEventListener('focus', onRefresh);
      document.removeEventListener('visibilitychange', onRefresh);
      window.removeEventListener('mitra_products_updated', onRefresh);
      window.removeEventListener('mitra-verification-updated', onRefresh);
    };
  }, [fetchStore]);

  const openProductDetail = async (item: ProductItem) => {
    setSelectedProductId(item.id);
    setActiveImageIdx(0);
    setReplyingReviewId(null);
    setReplyText('');
    setDetailLoading(true);
    setProductDetail({
      id: String(item.id),
      name: item.name,
      description: '',
      price: item.price,
      stock: 0,
      weight_gram: 500,
      category: 'Keramik',
      rating: item.rating ?? 0,
      total_reviews: 0,
      sold_count: 0,
      images: item.imageUrl ? [item.imageUrl] : [],
      variants: [],
      reviews: [],
    });

    try {
      const [prodRes, revRes] = await Promise.allSettled([
        axios.get(`${apiBase}/products/${item.id}/public`, { timeout: 15000 }),
        axios.get(`${apiBase}/reviews/product/${item.id}`, { timeout: 15000 }),
      ]);

      const rawProd =
        prodRes.status === 'fulfilled' && prodRes.value.data?.success
          ? prodRes.value.data.data
          : null;
      const rawRevData =
        revRes.status === 'fulfilled' && revRes.value.data?.success
          ? revRes.value.data.data
          : null;

      const fullReviews: ProductReviewItem[] = Array.isArray(rawRevData?.reviews)
        ? rawRevData.reviews
        : Array.isArray(rawProd?.reviews)
          ? rawProd.reviews
          : [];

      const gallery: string[] =
        Array.isArray(rawProd?.images) && rawProd.images.length > 0
          ? rawProd.images
          : rawProd?.image_url
            ? [rawProd.image_url]
            : item.imageUrl
              ? [item.imageUrl]
              : [];

      setProductDetail({
        id: String(rawProd?.id ?? item.id),
        name: rawProd?.name || item.name,
        description: rawProd?.description || 'Belum ada deskripsi produk.',
        price: Number(rawProd?.price ?? item.price),
        stock: Number(rawProd?.stock ?? 0),
        weight_gram: Number(rawProd?.weight_gram ?? 500),
        category: rawProd?.category || 'Keramik',
        rating:
          rawRevData?.totalReviews > 0
            ? Number(rawRevData.avgRating || 0)
            : Number(rawProd?.rating ?? item.rating ?? 0),
        total_reviews:
          typeof rawRevData?.totalReviews === 'number'
            ? rawRevData.totalReviews
            : Number(rawProd?.total_reviews ?? fullReviews.length),
        sold_count: Number(rawProd?.sold_count ?? 0),
        images: gallery,
        variants: Array.isArray(rawProd?.variants) ? rawProd.variants : [],
        reviews: fullReviews,
      });
    } catch (err) {
      console.error('Gagal memuat detail produk:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSubmitReviewReply = async (reviewId: number) => {
    const cleanReply = replyText.trim();
    if (!cleanReply) {
      toast.error('Balasan ulasan tidak boleh kosong.');
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error('Sesi login tidak ditemukan. Silakan masuk ulang.');
      return;
    }

    setSubmittingReply(true);
    try {
      const res = await axios.post(
        `${apiBase}/reviews/${reviewId}/reply`,
        { seller_reply: cleanReply },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.success) {
        const nowIso = new Date().toISOString();
        setProductDetail((prev) =>
          prev
            ? {
                ...prev,
                reviews: prev.reviews.map((r) =>
                  r.id === reviewId
                    ? { ...r, seller_reply: cleanReply, replied_at: nowIso }
                    : r
                ),
              }
            : prev
        );
        setReplyingReviewId(null);
        setReplyText('');
        toast.success('Balasan ulasan berhasil dikirim!');
      } else {
        toast.error(res.data?.message || 'Gagal mengirim balasan ulasan.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal membalas ulasan.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const isDataLoading = isLoading && !data;

  const storeName = data?.store?.name || 'Dinoyo Ceramic Studio';
  const storeAddress = data?.store?.address && data.store.address !== 'Alamat belum diatur'
    ? data.store.address
    : 'Kampung Keramik Dinoyo, Malang';
  const storeDescription = data?.store?.description && data.store.description !== 'Belum ada deskripsi toko.'
    ? data.store.description
    : 'Studio keramik keluarga yang melestarikan seni tembikar Dinoyo sejak 1985. Menyediakan perlengkapan makan stoneware, vas hias, hingga suvenir keramik buatan tangan langsung dari tungku pembakaran lokal.';
  const storeBanner = data?.store?.bannerUrl || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80';
  const storeAvatar = data?.store?.avatarUrl || null;
  const storeRating = data?.store?.rating ?? 0;
  const storeReviewCount = data?.store?.reviewCount ?? 0;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const storeSlug = slugify(storeName) || 'toko';
      const storeLink = data?.store?.id
        ? `https://dinoyocraft.my.id/store/${storeSlug}-${data.store.id}`
        : `https://dinoyocraft.my.id/store/${storeSlug}`;
      navigator.clipboard.writeText(storeLink);
      toast.success('Tautan toko berhasil disalin ke clipboard!');
    }
  };

  const handleShareProduct = (prod: ProductFullDetail) => {
    if (typeof window !== 'undefined') {
      const prodSlug = slugify(prod.name) || 'produk';
      const prodLink = `https://dinoyocraft.my.id/product/${prodSlug}-${prod.id}`;
      navigator.clipboard.writeText(prodLink);
      toast.success('Tautan produk berhasil disalin ke clipboard!');
    }
  };

  const initials = storeName
    .trim()
    .split(/\s+/)
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const realProducts = data?.products || [];

  const displayProducts = realProducts.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    imageUrl: p.imageUrl,
    isHot: p.isHot !== undefined ? p.isHot : false,
    rating: p.rating ?? 0,
  }));

  const filteredProducts = displayProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── TAMPILAN DETAIL PRODUK (MODE MITRA — SEPERTI DETAIL PRODUK APP + BALAS ULASAN) ──
  if (selectedProductId !== null && productDetail) {
    const activeImage = productDetail.images[activeImageIdx] || productDetail.images[0] || null;
    const effectiveStock =
      productDetail.variants.length > 0
        ? productDetail.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0)
        : productDetail.stock;

    return (
      <div className="flex-1 p-0 sm:p-4 md:p-6 bg-[#fafafa] min-h-screen">
        <div className="max-w-5xl mx-auto">
          {/* Top Bar Navigasi Mitra */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <button
              type="button"
              onClick={() => {
                setSelectedProductId(null);
                setProductDetail(null);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition cursor-pointer shadow-2xs"
            >
              <ArrowLeft size={16} weight="bold" />
              Kembali ke Toko Saya
            </button>

            <div className="flex items-center flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => handleShareProduct(productDetail)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer shadow-2xs"
              >
                <FiShare2 size={15} />
                Salin Link Produk
              </button>
              <button
                type="button"
                onClick={() => router.push('/mitra/dashboard/katalog')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition cursor-pointer shadow-2xs"
              >
                <FiEdit2 size={15} />
                Kelola di Katalog
              </button>
            </div>
          </div>

          {/* Kartu Utama Detail Produk (seperti tampilan Mobile App tanpa tombol Keranjang / Beli) */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Galeri Foto Produk */}
              <div className="p-5 sm:p-6 border-b md:border-b-0 md:border-r border-gray-100 bg-stone-50/50 flex flex-col">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-stone-100 border border-gray-100">
                  {activeImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={activeImage}
                      alt={productDetail.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 text-sm">
                      Tidak ada foto produk
                    </div>
                  )}

                  {productDetail.images.length > 1 && (
                    <div className="absolute right-3 bottom-3 px-3 py-1 rounded-full bg-black/65 text-white text-xs font-semibold">
                      {activeImageIdx + 1} / {productDetail.images.length}
                    </div>
                  )}
                </div>

                {productDetail.images.length > 1 && (
                  <div className="flex items-center gap-2.5 mt-3 overflow-x-auto pb-1">
                    {productDetail.images.map((imgUrl, idx) => (
                      <button
                        key={`${imgUrl}-${idx}`}
                        type="button"
                        onClick={() => setActiveImageIdx(idx)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition ${
                          idx === activeImageIdx ? 'border-zinc-900' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Informasi Detail Produk */}
              <div className="p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/70">
                      {productDetail.category}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700">
                      Pratinjau Toko Mitra
                    </span>
                  </div>

                  <h1 className="text-2xl font-extrabold text-gray-900 leading-snug mb-2">
                    {productDetail.name}
                  </h1>

                  <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mb-4">
                    {formatRupiah(productDetail.price)}
                  </p>

                  {/* Baris Statistik: Rating • Ulasan • Terjual • Stok */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 mb-6">
                    <div>
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Rating</p>
                      <p className="text-sm font-bold text-gray-900 flex items-center gap-1 mt-0.5">
                        <Star size={15} weight="fill" className="text-amber-500" />
                        {productDetail.total_reviews > 0 ? productDetail.rating.toFixed(1) : 'Baru'}
                        <span className="text-xs font-normal text-gray-400">
                          ({productDetail.total_reviews})
                        </span>
                      </p>
                    </div>
                    <div className="border-t sm:border-t-0 sm:border-l border-stone-200 pt-2.5 sm:pt-0 sm:pl-3">
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Terjual</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">
                        {productDetail.sold_count} pcs
                      </p>
                    </div>
                    <div className="border-t sm:border-t-0 sm:border-l border-stone-200 pt-2.5 sm:pt-0 sm:pl-3">
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Stok Tersedia</p>
                      <p className="text-sm font-bold text-gray-900 flex items-center gap-1 mt-0.5">
                        <Package size={15} className="text-stone-500" />
                        {detailLoading ? '...' : `${effectiveStock} unit`}
                      </p>
                    </div>
                  </div>

                  {/* Varian Warna & Stok (jika ada) */}
                  {productDetail.variants.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
                        Pilihan Variasi &amp; Sisa Stok ({productDetail.variants.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {productDetail.variants.map((v) => (
                          <div
                            key={v.name}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-800"
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                              style={{ backgroundColor: v.hex || '#b85c3c' }}
                            />
                            <span>{v.name}</span>
                            <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[11px] font-bold">
                              Stok: {v.stock ?? 0}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Deskripsi Produk */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Deskripsi Produk
                    </h3>
                    {detailLoading && !productDetail.description ? (
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                        <div className="h-4 w-4/5 bg-gray-100 rounded animate-pulse" />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {productDetail.description || 'Belum ada deskripsi untuk produk ini.'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Info Toko Ringkas di bawah seperti di App */}
                <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-extrabold overflow-hidden shrink-0"
                      style={{
                        background:
                          storeAvatar && isCustomAvatar(storeAvatar)
                            ? 'transparent'
                            : 'linear-gradient(135deg, var(--clay), #c0673d)',
                      }}
                    >
                      {storeAvatar && isCustomAvatar(storeAvatar) ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={storeAvatar} alt={storeName} className="w-full h-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{storeName}</p>
                      <p className="text-xs text-gray-500 truncate">{storeAddress}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-medium shrink-0">
                    Berat ±{productDetail.weight_gram}g
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bagian Ulasan Pembeli & Balas Ulasan Langsung */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ChatCircleText size={22} weight="duotone" className="text-amber-600" />
                  Ulasan Pembeli ({productDetail.reviews.length})
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Anda dapat membalas atau memperbarui tanggapan resmi toko langsung pada setiap ulasan pelanggan.
                </p>
              </div>
              {productDetail.total_reviews > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 text-sm font-bold border border-amber-200/70">
                  <Star size={16} weight="fill" className="text-amber-500" />
                  {productDetail.rating.toFixed(1)} / 5.0
                </div>
              )}
            </div>

            {detailLoading ? (
              <div className="py-10 text-center text-sm text-gray-400 animate-pulse">
                Memuat ulasan produk...
              </div>
            ) : productDetail.reviews.length === 0 ? (
              <div className="py-12 text-center bg-stone-50/70 rounded-2xl border border-stone-100">
                <p className="text-sm font-semibold text-gray-700 mb-1">Belum ada ulasan untuk produk ini</p>
                <p className="text-xs text-gray-500">
                  Ulasan dari pembeli yang telah menyelesaikan pesanan akan muncul di sini.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {productDetail.reviews.map((rev) => {
                  const isReplying = replyingReviewId === rev.id;
                  const reviewerInitials = (rev.user_name || 'P')
                    .trim()
                    .split(/\s+/)
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <div
                      key={rev.id}
                      className="p-5 rounded-2xl border border-gray-200/80 bg-white hover:border-gray-300/80 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-xs font-bold overflow-hidden shrink-0">
                            {rev.user_avatar && isCustomAvatar(rev.user_avatar) ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={rev.user_avatar} alt={rev.user_name} className="w-full h-full object-cover" />
                            ) : (
                              reviewerInitials
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{rev.user_name}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              <div className="flex items-center gap-0.5 text-amber-500">
                                {Array.from({ length: 5 }, (_, idx) => (
                                  <Star
                                    key={idx}
                                    size={13}
                                    weight={idx < Math.round(rev.rating) ? 'fill' : 'regular'}
                                  />
                                ))}
                              </div>
                              {rev.variant && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                                  Variasi: {rev.variant}
                                </span>
                              )}
                              {rev.created_at && (
                                <span className="text-xs text-gray-400">
                                  • {formatReviewDate(rev.created_at)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {!isReplying && (
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingReviewId(rev.id);
                              setReplyText(rev.seller_reply || '');
                            }}
                            className="px-3.5 py-1.5 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-xs font-bold text-stone-800 transition cursor-pointer shrink-0"
                          >
                            {rev.seller_reply ? 'Edit Balasan' : 'Balas Ulasan'}
                          </button>
                        )}
                      </div>

                      {rev.comment && (
                        <p className="text-sm text-gray-700 leading-relaxed mt-3">
                          {rev.comment}
                        </p>
                      )}

                      {Array.isArray(rev.photo_urls) && rev.photo_urls.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {rev.photo_urls.map((pUrl, pIdx) => (
                            <a
                              key={`${pUrl}-${pIdx}`}
                              href={pUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 block"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={pUrl} alt="Foto ulasan" className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Balasan Toko yang sudah tersimpan */}
                      {rev.seller_reply && !isReplying && (
                        <div className="mt-4 p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                          <p className="text-xs font-bold text-stone-800 flex items-center gap-1.5 mb-1">
                            <Storefront size={14} weight="duotone" className="text-amber-700" />
                            Balasan {storeName}
                            {rev.replied_at && (
                              <span className="font-normal text-gray-400">
                                • {formatReviewDate(rev.replied_at)}
                              </span>
                            )}
                          </p>
                          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                            {rev.seller_reply}
                          </p>
                        </div>
                      )}

                      {/* Form Inline Balas Ulasan */}
                      {isReplying && (
                        <div className="mt-4 p-4 rounded-xl bg-stone-50 border border-stone-200">
                          <label className="block text-xs font-bold text-stone-800 mb-2">
                            Balasan Toko untuk {rev.user_name}
                          </label>
                          <textarea
                            rows={3}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Tulis ucapan terima kasih atau tanggapan ramah untuk pembeli..."
                            className="w-full p-3 rounded-xl border border-stone-300 bg-white text-sm text-gray-800 focus:outline-none focus:border-zinc-800 resize-y"
                          />
                          <div className="flex justify-end items-center gap-2 mt-2.5">
                            <button
                              type="button"
                              disabled={submittingReply}
                              onClick={() => {
                                setReplyingReviewId(null);
                                setReplyText('');
                              }}
                              className="px-3.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              disabled={submittingReply}
                              onClick={() => handleSubmitReviewReply(rev.id)}
                              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
                            >
                              <PaperPlaneRight size={13} weight="fill" />
                              {submittingReply ? 'Mengirim...' : 'Kirim Balasan'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-0 sm:p-4 md:p-6 bg-[#fafafa] min-h-screen">
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
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white text-white flex items-center justify-center text-3xl sm:text-4xl font-extrabold shadow-md overflow-hidden shrink-0"
                style={{
                  background:
                    storeAvatar && isCustomAvatar(storeAvatar)
                      ? "transparent"
                      : "linear-gradient(135deg, var(--clay), #c0673d)",
                }}
              >
                {storeAvatar && isCustomAvatar(storeAvatar) ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={storeAvatar} alt="Avatar Toko" className="object-cover w-full h-full" />
                ) : (
                  initials
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
              <div>
                {isDataLoading ? (
                  <>
                    <div className="h-7 w-56 rounded-lg bg-gray-200 animate-pulse" />
                    <div className="h-4 w-44 rounded bg-gray-100 animate-pulse mt-2" />
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                      {storeName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm mt-1.5 text-gray-500">
                      <span className="flex items-center gap-1.5 text-stone-600">
                        <FiMapPin size={15} className="text-stone-400" />
                        {storeAddress}
                      </span>
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        ★ {storeRating > 0 ? storeRating.toFixed(1) : 'Baru'} <span className="text-gray-400 font-normal">({storeReviewCount} Ulasan)</span>
                      </span>
                    </div>
                  </>
                )}
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
              {isDataLoading ? (
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-gray-100 animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
                </div>
              ) : (
                storeDescription
              )}
            </div>
          </div>
        </div>

        {/* Product Catalog Section Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Katalog Produk</h2>
            <p className="text-sm text-gray-500 mt-1">
              {isDataLoading ? 'Memuat produk...' : `Menampilkan ${filteredProducts.length} Produk — klik produk untuk melihat detail & membalas ulasan`}
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

        {/* Grid Produk atau Empty State */}
        {isDataLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                <div className="h-56 bg-stone-100 animate-pulse" />
                <div className="p-5 space-y-2.5">
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
                  <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4 text-2xl">
              📦
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              {searchTerm ? 'Produk tidak ditemukan' : 'Belum ada produk di katalog'}
            </h3>
            <p className="text-sm text-gray-500 mb-5 max-w-md mx-auto">
              {searchTerm
                ? `Tidak ada produk yang cocok dengan kata kunci "${searchTerm}".`
                : 'Toko Anda belum memiliki karya keramik aktif. Tambahkan karya pertama Anda di katalog untuk mulai memajangnya.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => router.push('/mitra/dashboard/katalog')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-stone-800 transition cursor-pointer shadow-sm"
              >
                + Tambah Produk Sekarang
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => openProductDetail(product)}
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
                    ★ {product.rating > 0 ? product.rating.toFixed(1) : 'Baru'}
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
        )}
      </div>
    </div>
  );
}
