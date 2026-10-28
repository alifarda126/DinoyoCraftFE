# 🏺 DinoyoCraft Web (Frontend Platform)

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Pusher](https://img.shields.io/badge/Pusher-Real--Time_WebSockets-300D4F?logo=pusher&logoColor=white)](https://pusher.com)
[![Leaflet](https://img.shields.io/badge/Leaflet-Interactive_Maps-199900?logo=leaflet&logoColor=white)](https://leafletjs.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Platform Web Portal, Dasbor Mitra Pengrajin (Seller Centre), & Manajemen Sentra Keramik Dinoyo, Kota Malang.**  
> Ekosistem web modern berbasis Next.js 16 (App Router) dan React 19 yang menghubungkan calon mitra pengrajin, memfasilitasi operasional toko keramik lokal, serta menyediakan sistem administrasi sentral yang terintegrasi dan aman.

**Design Source:** [Figma — DinoyoCraft](https://www.figma.com/design/8Zi0L9aiDqJFwbrPsQsJx2/DinoyoCraft)

---

## 📑 Daftar Isi

- [Fitur Utama](#-fitur-utama)
  - [1. Halaman Publik & Program Kemitraan](#1-halaman-publik--program-kemitraan)
  - [2. Autentikasi Multi-Peran & Keamanan Akses](#2-autentikasi-multi-peran--keamanan-akses)
  - [3. Dasbor Mitra Pengrajin (Seller Centre)](#3-dasbor-mitra-pengrajin-seller-centre)
  - [4. Dasbor Administrasi Sentral (Super Admin)](#4-dasbor-administrasi-sentral-super-admin)
  - [5. Sistem Desain Earthy & UX Adaptif](#5-sistem-desain-earthy--ux-adaptif)
- [Integrasi Real-Time Chat (Pusher)](#-integrasi-real-time-chat-pusher)
- [Arsitektur & Struktur Proyek](#-arsitektur--struktur-proyek)
- [Teknologi & Dependensi](#-teknologi--dependensi)
- [Panduan Instalasi & Menjalankan](#-panduan-instalasi--menjalankan)
- [Pengujian & Kualitas Kode](#-pengujian--kualitas-kode)
- [Navigasi & Demo Alur Aplikasi](#-navigasi--demo-alur-aplikasi)
- [Lisensi](#-lisensi)

---

## 🌟 Fitur Utama

### 1. Halaman Publik & Program Kemitraan
- **Landing Page Interaktif (`/`)**:
  - Hero banner berorientasi konversi dengan ajakan bergabung (*Call to Action*) sebagai Mitra Pengrajin Dinoyo.
  - Alur 4 langkah mudah kemitraan: *Daftar Jadi Mitra*, *Pilih Produk Keramik*, *Jual di Channelmu*, hingga *Proses & Pengiriman oleh Sentra*.
  - Keunggulan program mitra: Bantuan *Relationship Manager*, panduan edukasi & tips bisnis keramik, fleksibilitas penentuan margin harga, serta transparansi laporan omzet real-time.
  - Komponen **FAQ Akordion Interaktif**: Jawaban instan untuk pertanyaan seputar syarat, komisi, dan alur operasional.
- **Pusat Regulasi & Kepatuhan Legal**:
  - Halaman **Kebijakan Privasi (`/kebijakan-privasi`)**: Tata kelola perlindungan data pengrajin dan pelanggan.
  - Halaman **Syarat & Ketentuan (`/syarat-ketentuan`)**: Hak dan kewajiban mitra, standar mutu kerajinan, dan pedoman transaksi.

### 2. Autentikasi Multi-Peran & Keamanan Akses
- **Login Multi-Role Terpadu (`/login`)**:
  - Mendukung autentikasi kredensial (Email & Password) dengan validasi real-time.
  - Integrasi **Google OAuth 2.0 Single Sign-On** (`@react-oauth/google`) untuk pengalaman masuk satu klik.
  - Penyimpanan sesi terproteksi via *HTTP-aware browser cookie* (`js-cookie`) dan sinkronisasi store global.
  - *Demo Session Fallback*: Memudahkan evaluasi UI/UX dasbor mitra dan admin tanpa ketergantungan mutlak pada database live.
- **Registrasi Mitra Baru (`/register`)**:
  - Pendaftaran akun calon pengrajin lengkap dengan konfirmasi kata sandi dan proteksi duplikasi data.
- **Alur Pemulihan Kata Sandi (`/lupa-kata-sandi`)**:
  - Alur reset password terstruktur dengan input email terverifikasi dan umpan balik notifikasi instan.
- **Route Guarding & RBAC**:
  - Proteksi rute dasbor secara selektif antara rute Mitra (`/mitra/dashboard/*`) dan Administrator (`/admin/*`).

### 3. Dasbor Mitra Pengrajin (Seller Centre)
- **Ringkasan Performa Toko (`/mitra/dashboard`)**:
  - Kartu statistik metrik: Total Penjualan, Pesanan Masuk, Produk Aktif, dan Estimasi Saldo Dompet.
  - Tinjauan pesanan terbaru dan akses cepat ke fitur manajemen utama.
- **Manajemen Katalog Produk (`/mitra/dashboard/katalog`)**:
  - Tambah, ubah, dan hapus karya keramik (*CRUD Produk*).
  - **Sistem Variasi Warna Glaze Otentik**: Preset pilihan glaze khas (*Sand White, Terracotta, Raw Speckle, Charcoal Ash, Sage Green, Cobalt Blue*).
  - Pengelolaan stok per varian dan input multi-foto karya keramik.
  - Filter pencarian instan dan klasifikasi kategori kerajinan.
- **Manajemen Pesanan Real-time (`/mitra/dashboard/pesanan`)**:
  - Siklus status pesanan terorganisir: *Belum Bayar, Dikemas, Dikirim, Selesai*.
  - Pembaruan nomor resi dan pemilihan ekspedisi pengiriman (*JNE, J&T, SiCepat, dll.*).
  - Tinjauan ulasan pelanggan (bintang 1–5) beserta fitur balasan ulasan langsung dari pengrajin.
- **Laporan Keuangan & Penarikan Dana (`/mitra/dashboard/laporan-keuangan`)**:
  - Visualisasi grafik batang omzet dinamis dengan filter periode (7 Hari / 30 Hari terakhir).
  - Riwayat mutasi transaksi keuangan dan pencatatan saldo dompet mitra.
  - Modal penarikan dana (*Withdrawal*) ke rekening bank pengrajin.
  - **Fitur Ekspor Laporan**: Unduh rekapitulasi finansial dalam format **PDF** dan **CSV**.
- **Profil Toko & Pemetaan Lokasi Studio (`/mitra/dashboard/toko-saya`)**:
  - Pengaturan nama toko, deskripsi profil studio, jam operasional, dan nomor WhatsApp resmi.
  - Upload banner toko dan foto avatar studio keramik.
  - **Integrasi Peta Interaktif Leaflet**: Penandaan titik koordinat fisik studio keramik di kawasan Kampung Dinoyo.
- **Legalitas & Verifikasi Akun Pengrajin (`/mitra/dashboard/profil`)**:
  - Unggah dokumen resmi: Berkas KTP pemilik, Nomor Induk Berusaha (NIB) / Surat Keterangan Usaha, dan sampel foto produk.
  - Indikator status verifikasi dinamis (*Belum Terverifikasi, Menunggu Tinjauan, Ditolak dengan Catatan Perbaikan, atau Terverifikasi*).
  - Form pembaharuan data pemilik dan penggantian kata sandi akun.
- **Live Chat Pengrajin Real-Time (`/mitra/dashboard/chat`)**:
  - **Pusher WebSockets Integration**: Percakapan dua arah seketika (*two-way instant messaging*) tanpa perlu memuat ulang (*refresh*) halaman peramban.
  - **Dua Saluran Terpisah**: Obrolan bantuan sentra (*Customer Support Admin*) dan pesan langsung dari pembeli/wisatawan (*Direct Customer Chat*).
  - **Manajemen Channel Dinamis**: Otomatis berlangganan channel ruang obrolan `chat-{id1}-{id2}` dan channel personal `user-{id}` untuk menerima notifikasi pesan masuk dari kontak mana pun.
  - **Dual Reliability & Optimistic UI**: Pesan tampil instan saat dikirim (*optimistic UI*), didukung mekanisme *smart auto-polling fallback* (interval 2 detik) untuk menjaga keandalan saat fluktuasi jaringan.

### 4. Dasbor Administrasi Sentral (Super Admin)
- **Dasbor Analitik Sentra (`/admin`)**:
  - Agregasi metrik skala sentra: Total Transaksi Lintas Toko, Total Omzet Bulanan, Estimasi Kunjungan Wisatawan, dan Jumlah Studio Aktif.
  - Daftar transaksi terbaru yang berlangsung di seluruh kawasan Dinoyo.
- **Verifikasi Legalitas Mitra (`/admin/verifikasi`)**:
  - Antrean permohonan pembukaan toko pengrajin baru.
  - Modal pratinjau dokumen legalitas (KTP & NIB) secara transparan.
  - Fitur persetujuan (*Approve*) atau penolakan (*Reject*) dengan pilihan template alasan penolakan maupun catatan khusus.
- **Monitoring Transaksi Lintas Toko (`/admin/transaksi`)**:
  - Pemantauan seluruh invoice transaksi dari seluruh toko keramik Dinoyo.
  - Filter status pembayaran (*Sukses, Tertunda, Dibatalkan*) dan ekspor rekapitulasi data transaksi ke **CSV**.
- **Moderasi & Keamanan Platform (`/admin/moderasi`)**:
  - Pengawasan laporan pengguna atas potensi pelanggaran konten produk, ulasan tidak pantas, atau praktik toko tidak etis.
  - Manajemen tiket permohonan penghapusan akun pengguna secara terverifikasi.
- **Meja Bantuan Live Chat Terpusat (`/admin/chat`)**:
  - **Monitoring & Respon Cepat Berbasis Pusher**: Meja bantuan terpusat bagi Super Admin untuk melayani pertanyaan, kendala, atau konsultasi dari pengrajin mitra dan pembeli secara real-time.
  - **Penyortiran Kontak Otomatis**: Daftar kontak obrolan terurut otomatis berdasarkan riwayat pesan terakhir (*last message timestamp*).
  - **Indikator Otomasi AI vs Agen**: Penanda visual percakapan yang ditangani otomatis oleh ClayBot AI vs kebutuhan eskalasi langsung ke staf admin.
- **Konfigurasi Kecerdasan Buatan ClayBot (`/admin/pengaturan-ai`)**:
  - Pengaturan saklar global chatbot AI DinoyoCraft.
  - Manajemen API Key dan pemilihan model LLM (*Google Gemini, Anthropic Claude, OpenAI GPT*).

### 5. Sistem Desain Earthy & UX Adaptif
- **Sidebar Cerdas & Adaptif (Auto-Collapse)**:
  - Sidebar navigasi admin dan mitra otomatis beralih menjadi mode *collapsed* (ringkas) saat zoom browser pengguna > 100% demi menjaga ruang kerja tetap lapang.
  - Animasi transisi lebar yang halus dengan kemampuan toggle manual (*hamburger menu*).
- **Badge Counter Reaktif**:
  - Indikator angka notifikasi merah (*unread badge*) pada menu pesanan baru, pesan chat, dan antrean verifikasi toko.
- **Palet Warna Sentra Keramik (Design Tokens)**:
  - Nuansa warna modern minimalis berkarakter kriya: *Terracotta*, *Clay*, *Pure White*, dan *Charcoal*.
  - Komponen kustom ramah pengguna seperti `EarthySelect` dan animasi toast elegan via **Sonner**.

---

## ⚡ Integrasi Real-Time Chat (Pusher)

Platform DinoyoCraft mengadopsi arsitektur komunikasi berbasis event seketika (*event-driven real-time communication*) menggunakan **Pusher Channels (WebSockets)** untuk fitur perpesanan instan pada dasbor Mitra Pengrajin dan Super Admin.

### 1. Alur Kerja Perpesanan (Message Flow)

```
[Pengguna A (Kirim Pesan)]
         │
         ▼
[REST API: POST /chat/send/:id]  ───>  [Simpan Pesan ke Database]
         │
         ▼
[Pusher Backend Broadcast]
         │
         ▼
[Pusher Cloud WebSockets Service]
         │
         ├───> [Channel: chat-{id1}-{id2}]  ───>  [Pengguna B (Layar Obrolan Aktif)]
         │                                        (Pesan muncul seketika di ruang chat)
         │
         └───> [Channel: user-{id2}]         ───>  [Pengguna B (Global/Sidebar Kontak)]
                                                  (Pembaruan preview pesan & unread badge)
```

### 2. Struktur Channel & Event Pusher

| Tipe Channel | Format Penamaan | Kegunaan | Event yang Didengarkan |
|---|---|---|---|
| **Room Channel** | `chat-{minId}-{maxId}` | Saluran privat dua arah antara dua pihak (misal: Mitra & Pembeli, atau Mitra & Admin) | `new-message` |
| **Personal User Channel** | `user-{userId}` | Saluran notifikasi perorangan untuk mendeteksi pesan masuk saat pengguna sedang membuka kontak lain | `new-message` |

### 3. Jaminan Keandalan (High Availability & Fallback)

- **Event-Driven WebSockets (Primer)**: Mengalirkan data pesan secara *low-latency* dalam hitungan milidetik melalui library resmi `pusher-js`.
- **Smart Auto-Polling Fallback (Sekunder)**: Sistem mengimplementasikan polling terjadwal setiap 2 detik sebagai *fail-safe* jika jaringan pengguna mengalami packet loss atau sedang dalam status reconnecting.
- **Deduplikasi Pesan Cerdas**: Antarmuka frontend memeriksa `message.id` dan kombinasi teks/waktu untuk mencegah redundansi tampilan pesan saat event Pusher dan auto-polling berjalan bersamaan.
- **Optimistic UI Rendering**: Pesan baru langsung muncul pada bubble chat seketika tombol kirim ditekan untuk pengalaman pengguna yang sangat responsif.

---

## 🏗 Arsitektur & Struktur Proyek

Aplikasi dikembangkan menggunakan struktur modular **Next.js App Router** dengan pemisahan peran dan modul yang rapi:

```
c:\DinoyoCraftFE/
├── public/                     # Aset statis (ikon, ilustrasi, logo DinoyoCraft)
├── src/
│   ├── app/                    # Next.js App Router (Routes & Layouts)
│   │   ├── (auth)/             # Modul Rute Autentikasi
│   │   │   ├── login/          # Halaman Login Multi-Role & Google Sign-In
│   │   │   ├── register/       # Halaman Pendaftaran Calon Mitra
│   │   │   └── lupa-kata-sandi/# Halaman Pemulihan Akun Pengrajin
│   │   ├── admin/              # Dasbor Super Administrator
│   │   │   ├── chat/           # Meja Bantuan Chat Pengrajin & Pembeli (Pusher)
│   │   │   ├── jadwal/         # Pengaturan Jadwal Workshop Sentra
│   │   │   ├── manajemen-kategori/ # Pengaturan Kategori Keramik
│   │   │   ├── manajemen-pengguna/ # Pengelolaan Data Pengguna Platform
│   │   │   ├── manajemen-toko/ # Direktori & Status Studio Keramik
│   │   │   ├── moderasi/       # Moderasi Konten & Tiket Hapus Akun
│   │   │   ├── pengaturan-ai/  # Pengaturan Model AI Chatbot ClayBot
│   │   │   ├── transaksi/      # Pemantauan Transaksi Lintas Toko & Export
│   │   │   ├── verifikasi/     # Verifikasi Dokumen KTP/NIB Pengrajin
│   │   │   ├── layout.tsx      # Shell Layout Admin dengan Sidebar
│   │   │   └── page.tsx        # Dasbor Utama Metrik Sentra Dinoyo
│   │   ├── mitra/dashboard/    # Dasbor Mitra Pengrajin (Seller Centre)
│   │   │   ├── chat/           # Live Chat CS & Pelanggan Toko (Pusher)
│   │   │   ├── katalog/        # Manajemen Produk, Stok & Glaze
│   │   │   ├── laporan-keuangan/# Finansial, Omzet, Payout & Unduh PDF/CSV
│   │   │   ├── pesanan/        # Pelacakan Pesanan Masuk & Resi Kurir
│   │   │   ├── profil/         # Pengaturan Profil, Legalitas & Password
│   │   │   ├── toko-saya/      # Etalase Studio & Titik Koordinat Peta
│   │   │   ├── layout.tsx      # Shell Layout Mitra dengan Sidebar
│   │   │   └── page.tsx        # Dasbor Ringkasan Penjualan Toko
│   │   ├── kebijakan-privasi/  # Regulasi Privasi Data
│   │   ├── syarat-ketentuan/   # Syarat & Ketentuan Penggunaan Platform
│   │   ├── globals.css         # Token Desain & Styling Tailwind CSS v4
│   │   ├── layout.tsx          # Root Layout Aplikasi Web
│   │   └── page.tsx            # Landing Page Publik DinoyoCraft
│   ├── components/             # Komponen UI Reusable
│   │   ├── layout/             # AdminSidebar, MitraSidebar, Navbar
│   │   ├── ui/                 # EarthySelect, FAB, Form Controls
│   │   └── AuthProvider.tsx    # Provider Sinkronisasi Sesi Autentikasi
│   ├── hooks/                  # Custom React Hooks
│   ├── lib/                    # Utilitas & Klien Pihak Ketiga
│   │   ├── api/                # Database & Skema Midtrans
│   │   ├── utils/              # Helper Sesi Demo & Formatting
│   │   └── axios.ts            # Instance Axios Terkonfigurasi
│   ├── services/               # Lapisan Layanan API Backend (Service Layer)
│   │   ├── admin.service.ts    # Komunikasi API Dasbor Admin
│   │   ├── auth.service.ts     # Komunikasi API Autentikasi
│   │   ├── mitra.service.ts    # Komunikasi API Dasbor Mitra
│   │   ├── product.service.ts  # Komunikasi API Produk Keramik
│   │   └── transaction.service.ts # Komunikasi API Transaksi & Invoice
│   ├── store/                  # Global State Management (Zustand)
│   │   └── useAuthStore.ts     # State Autentikasi Pengguna
│   ├── types/                  # Definisi Tipe TypeScript
│   └── utils/                  # Format Mata Uang (IDR) & Helper Lainnya
├── .env.example                # Template Variabel Lingkungan
├── .env.local                  # Konfigurasi Environment Variable
├── package.json                # Dependensi & Skrip Node.js
└── tsconfig.json               # Konfigurasi TypeScript Compiler
```

---

## 🛠 Teknologi & Dependensi

| Paket / Library | Versi | Kegunaan |
|---|---|---|
| **Next.js** | `16.3.5` | Framework React modern dengan App Router & Turbopack |
| **React** | `19.2.8` | Library antarmuka komponen web generasi terbaru |
| **TypeScript** | `^5.x` | Static typing ketat untuk keandalan dan skalabilitas kode |
| **Tailwind CSS** | `^4.0` | Utility-first CSS framework dengan performa generasi ke-4 |
| **Zustand** | `^5.0.15` | State management global yang ringan, modular, dan cepat |
| **Axios & SWR** | `^1.20 / ^2.5` | Klien HTTP REST API dengan kemampuan revalidasi data |
| **Leaflet & React-Leaflet** | `^1.9.4 / ^5.0.0` | Peta interaktif penanda lokasi studio keramik Dinoyo |
| **@phosphor-icons/react** | `^2.1.10` | Ikonografi modern yang tajam, estetik, dan konsisten |
| **Sonner** | `^2.0.8` | Komponen notifikasi toast yang mulus dan interaktif |
| **@react-oauth/google** | `^0.13.5` | Integrasi autentikasi Google OAuth 2.0 Single Sign-On |
| **Pusher & Pusher-JS** | `^5.3.4 / ^8.6.0` | Layanan WebSockets real-time publish/subscribe untuk Live Chat instan |
| **qrcode.react** | `^4.2.0` | Generator QR Code untuk pembayaran digital atau verifikasi |
| **date-fns** | `^4.4.0` | Format dan kalkulasi tanggal yang ringan dan akurat |
| **js-cookie** | `^3.0.8` | Pengelolaan session cookie lintas halaman browser |

---

## 🚀 Panduan Instalasi & Menjalankan

### Prasyarat
1. Telah menginstal **Node.js** versi `18.x` atau lebih baru (`node -v`).
2. Paket manajer **npm**, **yarn**, atau **pnpm**.

### 1. Kloning & Masuk ke Direktori Proyek

```bash
# Masuk ke direktori proyek
cd c:\DinoyoCraftFE
```

### 2. Konfigurasi Environment Variable

Salin file template `.env.example` menjadi `.env.local` di root direktori proyek:

```bash
cp .env.example .env.local
```

Lalu sesuaikan nilai variabel kredensial dengan akun Anda:

```env
# URL Layanan Backend DinoyoCraft API
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Kredensial Google OAuth 2.0 Single Sign-On
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com

# Kredensial Pusher Channels (Real-Time Live Chat WebSockets)
NEXT_PUBLIC_PUSHER_KEY=your_pusher_app_key_here
NEXT_PUBLIC_PUSHER_CLUSTER=ap1
```

> **Catatan Kredensial Pusher:**  
> Klien `pusher-js` menggunakan `NEXT_PUBLIC_PUSHER_KEY` dan `NEXT_PUBLIC_PUSHER_CLUSTER` untuk menghubungkan aplikasi ke kluster Pusher Channels secara real-time. Jika variabel ini tidak ditentukan di `.env.local`, aplikasi telah menyediakan nilai fallback default agar fitur chat tetap berfungsi normal di lingkungan pengembangan lokal.

### 3. Instalasi Dependensi

Jalankan perintah instalasi paket dependensi:

```bash
npm install
```

> **Catatan Instalasi Pusher:**  
> Library `pusher` (`^5.3.4`) dan `pusher-js` (`^8.6.0`) sudah tercatat di dalam dependensi `package.json`, sehingga **otomatis langsung terpasang** saat Anda menjalankan `npm install`.  
> Jika Anda ingin memasang atau memperbaruinya secara manual dan terpisah, cukup jalankan:
> ```bash
> npm install pusher-js pusher
> ```

### 4. Menjalankan Server Pengembangan

```bash
npm run dev
```

Buka peramban (*browser*) dan akses: **`http://localhost:3000`**

### 5. Kompilasi Produksi (Production Build)

```bash
# Kompilasi aplikasi untuk lingkungan produksi
npm run build

# Menjalankan server produksi
npm run start
```

---

## 🧪 Pengujian & Kualitas Kode

Proyek ini menerapkan standar penulisan kode modern dengan pengecekan statis otomatis:

```bash
# Menjalankan static analysis & linter kode
npm run lint

# Menjalankan pengecekan tipe statis TypeScript
npx tsc --noEmit
```

---

## 🗺 Navigasi & Demo Alur Aplikasi

| Dari Layar | Tindakan Pengguna | Rute / Hasil |
|---|---|---|
| **Landing Page** | Klik tombol **Daftar Sekarang** | Masuk ke formulir pendaftaran mitra (`/register`) |
| **Landing Page** | Klik tautan **Masuk** pada Navbar | Masuk ke formulir login akun (`/login`) |
| **Halaman Login** | Masuk dengan akun **Mitra** | Diarahkan ke **Dasbor Toko Mitra** (`/mitra/dashboard`) |
| **Halaman Login** | Masuk dengan akun **Admin** | Diarahkan ke **Dasbor Sentra Admin** (`/admin`) |
| **Halaman Login** | Klik **Masuk dengan Google** | Autentikasi cepat via popup Google OAuth SSO |
| **Halaman Login** | Klik **Lupa Kata Sandi?** | Membuka alur pemulihan akun (`/lupa-kata-sandi`) |
| **Sidebar Mitra** | Klik **Katalog Produk** | Membuka katalog, kelola stok & variasi warna glaze (`/mitra/dashboard/katalog`) |
| **Sidebar Mitra** | Klik **Pesanan** | Tinjau status pesanan, input resi, dan balas ulasan (`/mitra/dashboard/pesanan`) |
| **Sidebar Mitra** | Klik **Laporan Keuangan** | Pantau grafik omzet, tarik saldo, & unduh rekap PDF/CSV (`/mitra/dashboard/laporan-keuangan`) |
| **Sidebar Mitra** | Klik **Profil Toko** | Unggah KTP/NIB legalitas, atur info studio (`/mitra/dashboard/profil`) |
| **Sidebar Mitra** | Klik **Live Chat** | Komunikasi pesan instan dua arah (*real-time Pusher*) dengan CS Admin dan Pelanggan (`/mitra/dashboard/chat`) |
| **Sidebar Admin** | Klik **Verifikasi Toko** | Tinjau dokumen pengrajin, lakukan aksi Setujui / Tolak (`/admin/verifikasi`) |
| **Sidebar Admin** | Klik **Transaksi Lintas Toko** | Rekap seluruh pesanan sentra & ekspor CSV (`/admin/transaksi`) |
| **Sidebar Admin** | Klik **Meja Bantuan Chat** | Monitor dan respon konsultasi/komplain secara real-time (*Pusher Channels*) (`/admin/chat`) |
| **Sidebar Admin** | Klik **Pengaturan AI** | Konfigurasi API Key & model bahasa ClayBot (`/admin/pengaturan-ai`) |
| **Semua Dasbor** | Tingkatkan zoom browser (> 100%) | Sidebar **otomatis menyusut (*auto-collapse*)** menjaga kenyamanan ruang |

---

## 📄 Lisensi

Proyek ini dikembangkan dalam rangka digitalisasi, pelestarian, dan pemberdayaan ekonomi kreatif **Sentra Pengrajin Keramik Dinoyo, Kota Malang**. Hak cipta atas karya kerajinan dan merek studio lokal dilindungi oleh masing-masing pengrajin mitra.
