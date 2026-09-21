# DinoyoCraft

Platform reservasi dan penjualan keramik kampung Dinoyo, Malang.

## Stack
- **Frontend**: Next.js 16 (App Router, Turbopack) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (Postgres + Auth + Storage)
- **Payment**: Midtrans Snap (Transfer Bank, VA, E-Wallet, QRIS)
- **PWA**: Native service worker + manifest
- **Icons**: Phosphor Icons
- **Date**: date-fns
- **Toast**: sonner
- **QR Code**: qrcode.react

## Pembaruan Terbaru (Frontend)
- **Glassmorphism Design**: Seluruh *card* produk pada Beranda, Katalog, dan Detail Toko kini menggunakan efek *frosted glass* yang cerah dan estetis.
- **Interactive UI Mock**: 
  - Penambahan form modal untuk interaksi pengguna (Detail Pesanan, Penarikan Dana).
  - Toast *feedback* dengan `sonner` untuk simulasi aksi seperti Tambah Keranjang, Unduh CSV, dan Hapus Pengguna/Kategori/Toko (Admin).
  - Alur fungsional *mock* pada fitur **Checkout** dan **Pembayaran** (sebelum *backend* dihubungkan).

## Cara Menjalankan

### 1. Setup Supabase
1. Buat project baru di [supabase.com](https://supabase.com)
2. Copy URL dan Anon Key
3. Jalankan `supabase/schema.sql` di SQL Editor Supabase
5. Buat Admin User: update role di tabel profiles

### 2. Setup Midtrans
1. Daftar di [midtrans.com](https://midtrans.com)
2. Dapatkan Server Key dan Client Key (sandbox untuk development)
3. Set webhook URL: `https://yourdomain.com/api/midtrans/webhook`

### 3. Konfigurasi Environment
Isi `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your-client-key
MIDTRANS_SERVER_KEY=your-server-key
```

### 4. Install dan Jalankan
```bash
npm install
npm run dev
```

Akses `http://localhost:3000`.

## Struktur Aplikasi

### Untuk Pengguna (Website & Mobile App sama)
- `/` — Landing page
- `/auth` — Login / Register
- `/dashboard` — Dashboard utama
- `/dashboard/reservasi` — Reservasi kelas rombongan
- `/dashboard/katalog` — Katalog keramik
- `/dashboard/katalog/[id]` — Detail karya + ajukan pesanan kustom
- `/dashboard/pembayaran/[id]` — Pembayaran Midtrans
- `/dashboard/peta` — Peta gang keramik
- `/dashboard/bantuan` — Chatbot AI + Live chat admin
- `/dashboard/profil` — Profil + riwayat pesanan + QR kode booking

### Untuk Admin
- `/admin` — Dashboard admin
- `/admin/jadwal` — Smart scheduling + kunci jadwal otomatis saat penuh
- `/admin/manifes` — Manifes kehadiran digital + validasi tamu
- `/admin/katalog` — Manajemen karya (CRUD)
- `/admin/inbox` — Inbox live chat
- `/admin/laporan` — Laporan keuangan + export CSV

## Fitur Unggulan

1. **Reservasi Rombongan**: Satu akun untuk banyak peserta, kode booking unik
2. **Smart Scheduling**: Sistem otomatis mengunci jadwal saat kapasitas penuh
3. **Manifes Digital**: Validasi tamu hari-H via QR / kode booking
4. **Multi Payment**: Transfer bank, Virtual Account, E-Wallet, QRIS via Midtrans
5. **Pesanan Kustom**: Pengajuan desain langsung ke pengrajin
6. **Peta Gang**: Navigasi interaktif ke bengkel pengrajin
7. **Bantuan Terpadu**: Chatbot AI untuk FAQ, Live chat untuk kendala spesifik
8. **Laporan Otomatis**: Pembukuan otomatis, omzet, arus kas, bagi hasil
9. **PWA**: Installable di HP sebagai aplikasi native

## Build Production
```bash
npm run build
npm run start
```

## Catatan Teknis
- Next.js 16 dengan Turbopack
- React 19 dengan Server Components
- Tailwind v4 (utilities only, no plugin di postcss)
- Service worker di `public/sw.js` (cache-first strategy)
- Real-time chat menggunakan Supabase Realtime