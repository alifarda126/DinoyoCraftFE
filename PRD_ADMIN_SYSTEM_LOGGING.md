# PRD — Admin System Logging & Live Monitoring

**Produk:** DinoyoCraft (Web Admin, Backend API, dan aplikasi mobile)  
**Status:** Draft untuk implementasi  
**Pemilik:** Tim DinoyoCraft  
**Dibuat:** 11 November 2026  

## 1. Ringkasan

Bangun pusat monitoring log pada dashboard admin agar tim dapat melihat kejadian sistem secara terstruktur, menemukan sumber masalah tanpa menebak-nebak, dan menelusuri dampak sebuah error dari awal sampai akhir.

Halaman ini menyediakan dua cara melihat data:

1. **Live Logs** — satu aliran real-time yang memuat seluruh kategori log.
2. **Log per kategori** — tampilan dan filter terpisah untuk autentikasi, transaksi/pembayaran, pesanan, produk/toko, chat, notifikasi, moderasi, integrasi pihak ketiga, aplikasi mobile, dan sistem/infrastruktur.

Hanya pengguna dengan peran **admin** yang dapat membuka, mencari, melihat detail, dan mengekspor log. Log bukan alat untuk menampilkan rahasia atau data pribadi secara penuh; informasi sensitif harus disamarkan sebelum disimpan dan ditampilkan.

## 2. Latar belakang dan kondisi saat ini

DinoyoCraft telah memiliki beberapa fondasi observability, tetapi belum ada satu layar monitoring yang menyatukan semuanya.

| Area | Kondisi yang ditemukan | Kesenjangan yang perlu ditutup |
|---|---|---|
| Backend Express | `auditMiddleware` sudah menyimpan request ke tabel `audit_logs` secara non-blocking. | Data saat ini hanya berupa aksi, pengguna, IP, dan user-agent; belum menyimpan kategori, kode respons, durasi, tingkat keparahan, request ID, detail error, atau event real-time. |
| Error backend | Ada handler global untuk 404 dan unhandled error, serta log proses seperti `unhandledRejection`. | Error belum menjadi event terstruktur yang dapat dicari dan dilihat admin. |
| Pembayaran | Ada integrasi Midtrans, webhook, status sync, dan background payment poller. | Kejadian charge/webhook/sinkronisasi/error belum mempunyai jejak operasional terpadu. |
| Real-time | Backend dan frontend web sudah memakai Pusher untuk chat dan event pesanan. | Belum ada channel/event khusus monitoring admin untuk semua kategori log. |
| Web admin | Sudah ada dashboard admin, sidebar, transaksi, moderasi, verifikasi, chat, dan pengaturan AI. | Belum ada menu/halaman **System Logs**. |
| Mobile Flutter | Sudah memakai Firebase Crashlytics untuk fatal error serta mencatat error jaringan, Pusher, FCM, dan fallback koneksi. | Error aplikasi yang relevan belum dikirim ke stream monitoring admin dengan konteks yang aman. |

## 3. Tujuan dan ukuran keberhasilan

### Tujuan

- Admin dapat melihat aktivitas dan error dari seluruh sistem di satu tempat.
- Admin dapat memfilter log berdasarkan kategori, status HTTP, level, layanan, pengguna, rentang waktu, request ID, order ID, transaksi, dan kata kunci.
- Error baru muncul di Live Logs tanpa refresh halaman.
- Admin dapat menemukan jejak lengkap sebuah permintaan atau transaksi: siapa, dari mana, endpoint apa, status apa, berapa lama, dan error apa bila gagal.
- Kegagalan monitoring tidak boleh menghambat transaksi atau alur pengguna utama.

### Metrik keberhasilan

- Event log baru muncul pada Live Logs maksimal **3 detik** setelah tercatat backend.
- Setidaknya **95%** error API 4xx/5xx, error proses, dan event pembayaran penting tercatat dengan request/correlation ID.
- Pencarian log 24 jam terakhir selesai maksimal **2 detik** pada volume target awal.
- Admin dapat mengidentifikasi endpoint, kategori, dan pesan error dari satu entri tanpa membuka console server.
- Tidak ada password, token JWT/refresh token, OTP, API key, isi pesan privat, alamat lengkap, atau nomor pembayaran lengkap yang tampil dalam log.

## 4. Pengguna dan user story

| Pengguna | Kebutuhan |
|---|---|
| Super Admin | Memantau kesehatan sistem secara live, menemukan error, lalu menelusuri detailnya. |
| Admin operasional | Mengecek transaksi, pesanan, notifikasi, chat, dan aktivitas akun ketika menerima laporan kendala pengguna. |
| Developer/Support (melalui akun admin yang diizinkan) | Mencari request ID/error code dan mengekspor bukti untuk investigasi. |

User story utama:

- Sebagai admin, saya dapat melihat semua log terbaru dalam satu stream agar mengetahui masalah yang sedang terjadi.
- Sebagai admin, saya dapat membuka kategori Auth atau Transaction saja agar fokus pada sumber gangguan.
- Sebagai admin, saya dapat melihat error 500 berwarna merah beserta pesan, stack trace yang aman, endpoint, dan request ID agar dapat menemukan lokasi error.
- Sebagai admin, saya dapat menelusuri order/transaction ID agar dapat memahami mengapa pembayaran atau pesanan pengguna gagal.
- Sebagai admin, saya dapat menjeda Live Logs ketika membaca insiden tanpa kehilangan informasi bahwa ada event baru.

## 5. Ruang lingkup

### Termasuk versi pertama

- Halaman admin baru `/admin/logs`.
- Live Logs lintas seluruh kategori melalui Pusher, dengan fallback polling ringan.
- Penyimpanan log terstruktur di MySQL dan endpoint khusus admin.
- Pencatatan request/response API, error aplikasi, aktivitas autentikasi, pembayaran/transaction, order, data produk/toko, chat, notifikasi/FCM, moderasi, AI, dan integrasi eksternal.
- Detail log, filtering, pilihan jangkauan waktu, pagination/cursor, ekspor unduhan, hapus log terkontrol, dan tautan korelasi antarevent.
- Instrumentasi aman untuk aplikasi Flutter dan penerusan referensi Crashlytics (bukan mengunduh seluruh crash data ke MySQL).
- Retensi, masking, RBAC, dan audit atas akses ke log.

### Tidak termasuk versi pertama

- Penggantian Firebase Crashlytics atau dashboard Midtrans.
- Sistem alerting eksternal otomatis ke Slack/email/PagerDuty. Data dan threshold disiapkan agar fitur ini dapat ditambahkan kemudian.
- Perekaman body request/response penuh.
- Akses log untuk mitra atau pengunjung.

## 6. Kategori log

Setiap entri mempunyai tepat satu kategori utama dan dapat memiliki tag tambahan.

| Kategori | Contoh event yang dicatat |
|---|---|
| `auth` | register, verifikasi OTP, login berhasil/gagal, Google login, refresh token, lupa/reset password, force logout, perubahan profil/dokumen, percobaan akses tanpa izin. |
| `transaction` | checkout, pembuatan payment charge, Midtrans webhook, status pembayaran berubah, polling/sync, cancel/expire, nominal/signature tidak valid, withdrawal. |
| `order` | order dibuat, dibatalkan, diproses, dikirim, selesai, perubahan resi/status, gagal update status. |
| `product_store` | tambah/edit/hapus produk, unggah media, stok, toko/mitra, verifikasi atau penolakan toko. |
| `cart_address` | perubahan keranjang dan alamat yang gagal/berhasil bila relevan untuk investigasi checkout. |
| `chat` | kirim pesan, delivery Pusher gagal, channel/subscribe error. Isi pesan tidak disimpan pada log. |
| `notification` | FCM token register/refresh, pengiriman notifikasi, kegagalan delivery, notifikasi dibaca. Token tidak ditampilkan. |
| `moderation` | laporan dibuat, tindakan laporan, permintaan hapus akun, keputusan admin. |
| `ai` | request ClayBot, model yang digunakan, durasi, kegagalan provider. Prompt dan respons penuh tidak disimpan. |
| `external` | Midtrans, Pusher, Firebase/FCM, Google OAuth, email/Nodemailer, upload/storage, DNS/network dependency. |
| `mobile` | network fallback, API error terpilih, Pusher/FCM initialization error, referensi Crashlytics. |
| `system` | startup/shutdown, health/dependency issue, rate limit, 404, uncaught exception, unhandled rejection, pekerjaan background/poller. |
| `admin_audit` | admin membuka detail/mengekspor log, mengubah konfigurasi monitoring, atau melakukan tindakan administratif penting. |

## 7. Prioritas dan status log

Pisahkan **HTTP status** dari **severity**. Contoh: 404 akibat salah URL adalah `warning`; 404 pada endpoint yang seharusnya ada setelah deploy bisa dinaikkan menjadi `error` lewat aturan server.

| Severity | Kondisi | Tampilan utama |
|---|---|---|
| `critical` | outage, uncaught exception, payment webhook/signature breach, kegagalan fatal berulang | latar merah gelap/transparan dan teks merah terang; icon alarm. |
| `error` | HTTP 5xx, exception tertangani, payment/job/integrasi gagal | teks pesan dan status error **merah**; baris diberi aksen merah. |
| `warning` | HTTP 4xx, rate limit 429, validasi, token expired, retry/fallback, transaksi pending/expired | aksen oranye/kuning agar dibedakan dari error server. |
| `info` | HTTP 3xx, lifecycle, perubahan status, aktivitas penting non-error | aksen biru. |
| `success` | HTTP 2xx, login/checkout/pembayaran/action berhasil | badge status hijau dengan **teks putih**; teks isi log tetap putih/abu terang agar mudah dibaca. |
| `debug` | detail diagnostik yang diaktifkan di non-production atau sampling terbatas | abu-abu, tersembunyi secara default di production. |

Aturan warna HTTP pada tabel:

- `2xx`: chip hijau (`#16A34A`/setara), **angka status berwarna putih**; teks deskripsi baris tidak diubah menjadi hijau.
- `3xx`: chip biru.
- `4xx`: chip amber/oranye; `401/403/404/422/429` diberi label alasan yang manusiawi.
- `5xx`: chip dan pesan error merah; teks error harus merah seperti permintaan produk.
- `0`/tanpa HTTP: gunakan severity event (misalnya crash mobile atau job poller gagal).

Warna tidak boleh menjadi satu-satunya pembeda: tampilkan icon dan label severity/status untuk aksesibilitas.

## 8. Pengalaman admin

### 8.1 Navigasi

- Tambahkan menu sidebar admin **System Logs** dengan ikon aktivitas/terminal dan badge jumlah `critical + error` yang belum diakui dalam 15 menit terakhir.
- Rute: `/admin/logs`.
- Hanya `admin`; bila token tidak memenuhi peran, API mengembalikan 403 dan halaman menampilkan akses ditolak.

### 8.2 Layout halaman

1. Header: judul **System Logs**, indikator koneksi real-time (`Live`, `Reconnecting`, `Offline`), timestamp pembaruan terakhir, tombol pause/resume, refresh, ekspor, dan hapus.
2. Ringkasan 24 jam: kartu `Critical`, `Error`, `Warning`, `Success`, serta tingkat error API. Kartu dapat diklik untuk menjadi filter.
3. Tab kategori: `Live Logs`, `Auth`, `Transaction`, `Order`, `Product & Store`, `Chat`, `Notification`, `Moderation`, `AI`, `External`, `Mobile`, `System`.
4. Panel filter: rentang waktu, severity multi-pilih, HTTP status/group, source/service, actor role, user/order/transaction/request ID, dan pencarian teks.
5. Tabel/stream log: waktu WIB, severity, kategori, status, event, ringkasan, aktor, sumber, durasi, dan ID korelasi.
6. Drawer detail saat baris dibuka: metadata lengkap, sanitised error, chain/correlation events, link ke order/transaksi/user yang diizinkan, serta tombol salin request ID.

Kolom minimum pada desktop: `Waktu`, `Level`, `Kategori`, `Status`, `Event`, `Ringkasan`, `Aktor`, `Sumber`, `Durasi`, `Request ID`.

### 8.3 Jangkauan waktu

Sediakan pilihan cepat di atas tabel dan filter tanggal kustom. Pilihan aktif harus terlihat jelas, tersimpan di URL agar tetap ada saat halaman dimuat ulang, dan diterapkan sama pada tabel, kartu ringkasan, ekspor, serta aksi hapus.

| Pilihan | Perilaku |
|---|---|
| `Live` | Menampilkan 100 event terbaru dari seluruh kategori dan menerima event baru secara real-time. Saat berpindah ke Live, filter kategori/severity lain tetap berlaku. |
| `24 jam` | Histori dari 24 jam terakhir, tanpa auto-scroll real-time kecuali admin menyalakan tombol Live. |
| `7 hari` | Histori 7 hari terakhir untuk melihat pola error mingguan. |
| `1 bulan` | Histori 30 hari terakhir untuk audit operasional dan analisis tren. |
| `Kustom` | Admin memilih tanggal/waktu mulai dan akhir; maksimum rentang awal 90 hari untuk menjaga performa. |

Setiap rentang memakai batas waktu inklusif dan ditampilkan dalam **WIB (Asia/Jakarta)**. Data tetap disimpan dalam UTC di backend.

### 8.4 Live Logs

- Default membuka 100 event terbaru dari seluruh kategori, lalu subscribe ke channel Pusher privat `private-admin-system-logs`.
- Event baru ditambahkan di bagian atas tanpa refresh.
- Saat mode **Live** aktif, daftar otomatis mengikuti entri terbaru. Saat **Pause**, event tetap diterima dan ditandai sebagai `N event baru`; admin dapat melompat ke event baru tanpa kehilangan filter saat ini.
- Filter aktif diterapkan juga pada event Pusher di browser. Server tetap melakukan otorisasi channel; browser tidak menerima log yang bukan untuk admin.
- Jika koneksi Pusher putus, tampilkan status `Reconnecting`. Setelah reconnect, ambil event sejak `latest_event_id`/`occurred_at` terakhir agar tidak ada celah atau duplikasi.
- Jika Pusher tidak tersedia, lakukan polling endpoint delta setiap 10 detik, gunakan exponential backoff bila gagal, dan tampilkan `Polling fallback`.
- Stream hanya menampilkan metadata aman. Detail teknis lengkap diambil setelah admin membuka entri.

### 8.5 Ekspor dan hapus log

**Ekspor log**

- Tombol `Ekspor` mengunduh hasil sesuai filter aktif, termasuk kategori dan jangkauan waktu. Pada `Live`, ekspor adalah snapshot dari event yang sedang tampil.
- Format versi pertama adalah CSV UTF-8 dengan nama file seperti `dinoyocraft-logs-2026-11-11-7-hari.csv`; struktur disiapkan agar XLSX dapat ditambahkan kemudian.
- File hanya berisi data aman: waktu, level, kategori, event, status HTTP, ringkasan, aktor termasking, sumber, durasi, dan ID korelasi. Stack trace, secret, token, serta metadata sensitif tidak pernah diekspor.
- Jika hasil melebihi batas sinkron (misalnya 10.000 baris), sistem membuat ekspor asinkron dan memberi tautan unduh yang kedaluwarsa otomatis.
- Setiap unduhan mencatat event `admin_audit.logs_exported` berisi admin, filter, jumlah baris, dan waktu—tanpa menyimpan isi file lagi.

**Hapus log**

- Admin dapat memilih satu/beberapa log, atau memakai `Hapus hasil filter` untuk semua hasil sesuai kategori dan jangkauan waktu aktif (contoh: log `debug` selama 1 bulan).
- Aksi hapus selalu membuka konfirmasi yang menampilkan jumlah log, kategori, dan rentang waktu. Untuk hapus massal, admin wajib mengetik `HAPUS <jumlah>` sebelum tombol aktif.
- Penghapusan versi pertama adalah **soft delete**: log hilang dari daftar normal tetapi dapat dipulihkan selama 30 hari oleh admin berizin. Sesudah itu, retention job dapat melakukan purge permanen sesuai kebijakan retensi.
- Purge permanen sebelum 30 hari hanya tersedia bagi izin khusus `logs:purge` (atau Super Admin ketika peran tersedia), memerlukan konfirmasi kedua, dan tidak dapat dibatalkan.
- Semua hapus, pemulihan, dan purge dicatat sebagai `admin_audit` berisi actor, alasan opsional, jumlah record, filter, dan waktu. Event audit ini tidak boleh ikut terhapus oleh aksi yang sama.
- Tombol hapus disembunyikan atau disabled bila tidak ada hasil/izin; backend tetap wajib memeriksa izin dan scope.

### 8.6 Empty, loading, dan error state

- Loading: skeleton tabel dan status koneksi.
- Tidak ada hasil: jelaskan filter yang aktif dan tombol `Reset filter`.
- Gagal memuat historis: pesan jelas + tombol `Coba lagi`; jangan menghapus data yang sudah tampil.
- Tidak ada koneksi live: histori tetap dapat dicari; tampilkan banner koneksi real-time terputus.

## 9. Spesifikasi event dan data

### 9.1 Kontrak event log

Setiap sumber menulis event melalui satu layanan backend (`loggingService`). Tidak ada controller yang menyusun SQL log sendiri.

```ts
type LogSeverity = 'debug' | 'info' | 'success' | 'warning' | 'error' | 'critical';

interface SystemLogEvent {
  eventId: string;              // ULID/UUID, unik dan dapat diurutkan
  occurredAt: string;           // ISO-8601 UTC; UI menampilkan WIB
  category: string;             // salah satu kategori §6
  eventName: string;            // contoh: auth.login.failed
  severity: LogSeverity;
  outcome: 'success' | 'failure' | 'pending' | 'info';
  message: string;              // ringkasan aman untuk manusia
  source: 'backend' | 'web' | 'mobile' | 'worker' | 'external';
  service: string;              // api, payment-poller, web-admin, mobile-android, dll.
  http?: { method: string; route: string; statusCode: number; durationMs: number };
  correlation?: {
    requestId?: string;
    traceId?: string;
    userId?: number;
    role?: string;
    orderId?: number;
    transactionId?: number;
    referenceCode?: string;
  };
  client?: { platform?: string; appVersion?: string; ipMasked?: string; userAgent?: string };
  error?: { code?: string; name?: string; message: string; stack?: string; providerCode?: string };
  metadata?: Record<string, unknown>; // sudah disanitasi dan dibatasi ukuran
}
```

### 9.2 Penyimpanan

Gunakan tabel baru `system_logs`; tabel `audit_logs` lama tetap dipertahankan untuk kompatibilitas dan dimigrasikan/ditautkan secara bertahap.

Kolom minimum:

| Kelompok | Kolom |
|---|---|
| Identitas | `id BIGINT`, `event_id CHAR(26/36) UNIQUE`, `occurred_at`, `created_at` |
| Klasifikasi | `category`, `event_name`, `severity`, `outcome`, `source`, `service` |
| HTTP | `http_method`, `route_template`, `status_code`, `duration_ms` |
| Korelasi | `request_id`, `trace_id`, `user_id` nullable, `role`, `order_id`, `transaction_id`, `reference_code` |
| Diagnostik aman | `message`, `error_code`, `error_name`, `error_message`, `error_stack` (restricted), `metadata_json` |
| Klien | `ip_hash` atau IP termask, `user_agent`, `platform`, `app_version` |
| Siklus hidup | `acknowledged_at`, `acknowledged_by`, `deleted_at`, `deleted_by`, `delete_reason`, `retention_expires_at` |

Index wajib: `(occurred_at DESC)`, `(category, occurred_at DESC)`, `(severity, occurred_at DESC)`, `(request_id)`, `(event_id)`, `(user_id, occurred_at DESC)`, `(order_id)`, `(transaction_id)`, `(status_code, occurred_at DESC)`. Terapkan pagination berbasis cursor (`occurred_at + id`), bukan offset untuk Live Logs.

### 9.3 Data yang harus dimasking

Sebelum insert maupun publish Pusher, hapus atau samarkan: password, OTP, bearer/refresh token, cookie, API key, Midtrans server key/signature, FCM token, nomor kartu/VA penuh, CVV, isi chat, alamat lengkap, dokumen identitas, dan payload upload.

Email dapat ditampilkan sebagian seperti `fa***@domain.com`; nomor telepon dan IP dimasking/hash. Stack trace hanya tersedia untuk admin dan environment yang diizinkan; hapus path lokal, secret, dan request body sensitif.

## 10. Instrumentasi per komponen

### 10.1 Backend API

- Tambahkan `requestIdMiddleware` paling awal untuk membaca `X-Request-ID` atau membuat ID baru. Balas ID ini melalui header respons.
- Ubah audit middleware menjadi request logger terstruktur yang mengukur durasi dari awal sampai event `finish` dan `close`.
- Klasifikasikan route dengan metadata kategori, bukan sekadar `req.path`; contoh `/api/auth/*` = `auth`, `/api/payments/*` = `transaction`.
- Catat 2xx/3xx secara sampling/konfigurasi agar tabel tidak penuh, sedangkan 4xx/5xx/critical selalu dicatat.
- Error middleware wajib mengambil `requestId`, status yang tepat, nama error, kode provider bila ada, dan stack yang telah disanitasi.
- Tambahkan penanganan log untuk 404, 429, error upload, error validasi Zod, unhandled rejection/exception, startup/shutdown, dan kesehatan dependensi.
- `loggingService` melakukan write secara asynchronous dan ber-timeout singkat. Jika insert log gagal, tulis fallback ke console/Crashlytics tetapi jangan memblokir respons bisnis.

### 10.2 Domain bisnis

- **Auth:** log sukses/gagal tanpa password; alasan aman seperti `invalid_credentials`, `otp_expired`, `token_invalid`, `role_forbidden`.
- **Payment/Midtrans:** log payment created, webhook received/verified/rejected, mapped status, sync/poller result, cancel/expire, provider error; sertakan `orderId`, `transactionId`, `referenceCode`, dan `gateway`.
- **Order:** log perubahan status beserta status sebelumnya/baru dan actor.
- **Produk/Toko/Moderasi:** log tindakan CRUD dan keputusan administrasi, menggunakan `recordId` serta nilai perubahan yang sudah disaring.
- **Chat/Notification:** log metadata delivery dan failure, bukan konten pesan atau token perangkat.
- **AI:** log provider/model, durasi dan hasil aman; jangan simpan prompt/respons lengkap pada system log.

### 10.3 Web admin/frontend

- Tambahkan `logs.service.ts`, hook pagination/filter, dan subscriber Pusher dengan deduplikasi `eventId`.
- Tambahkan interceptor Axios/fetch untuk menangkap error frontend yang layak dilaporkan. Kirim hanya event error terstruktur dan sudah disanitasi ke endpoint ingest internal; jangan mengirim console log mentah.
- Sertakan `requestId` dari header API pada toast/error state dan drawer log bila tersedia.

### 10.4 Mobile Flutter

- Pertahankan Firebase Crashlytics sebagai sumber crash utama.
- Tambahkan wrapper pelaporan non-fatal untuk failure API, Pusher, FCM, dan fallback jaringan yang memenuhi aturan sampling serta privasi.
- Payload mobile: kategori, event, severity, status HTTP bila ada, route API, platform, app version/build, device OS versi ringkas, request ID, dan pesan tersanitasi.
- Kirim ke `POST /api/internal/logs/mobile` dengan kredensial/service token yang dibatasi atau endpoint terautentikasi pengguna sesuai desain keamanan. Jangan pernah memakai secret admin di aplikasi.
- Jika offline, antre event maksimum (misalnya 100) di storage lokal, retry saat online, dan buang event yang melewati masa berlaku/ukuran antrean.

## 11. API dan real-time contract

Seluruh endpoint baca/tulis admin di bawah memerlukan `verifyToken + isAdmin`. Endpoint ingest mobile menggunakan autentikasi service/mobile yang terpisah, tervalidasi, dan memiliki izin hanya untuk menulis event yang diizinkan.

| Endpoint | Fungsi |
|---|---|
| `GET /api/admin/logs` | Daftar historis dengan filter dan cursor. |
| `GET /api/admin/logs/summary` | Angka severity/status/kategori untuk rentang waktu. |
| `GET /api/admin/logs/:eventId` | Detail satu log, termasuk error dan event terkait yang aman. |
| `GET /api/admin/logs/:eventId/related` | Chain berdasarkan request/trace/order/transaction ID. |
| `POST /api/admin/logs/:eventId/acknowledge` | Tandai error/critical telah diperiksa, tanpa menghapusnya. |
| `GET /api/admin/logs/export` | Menyediakan unduhan CSV sesuai filter dan jangkauan waktu aktif; akses ekspor diaudit. |
| `DELETE /api/admin/logs/:eventId` | Soft delete satu log dengan alasan opsional dan audit aksi. |
| `POST /api/admin/logs/bulk-delete` | Soft delete hasil pilihan/filter setelah validasi jumlah, scope, dan konfirmasi. |
| `POST /api/admin/logs/:eventId/restore` | Memulihkan log soft-deleted selama masa pemulihan. |
| `DELETE /api/admin/logs/:eventId/purge` | Purge permanen; hanya untuk izin `logs:purge` dan konfirmasi kedua. |
| `POST /api/internal/logs/mobile` | Ingest event mobile yang divalidasi dan dibatasi. |

Query filter minimum: `range` (`live`, `24h`, `7d`, `30d`, `custom`), `category`, `severity`, `statusCode`, `source`, `from`, `to`, `query`, `requestId`, `userId`, `orderId`, `transactionId`, `cursor`, `limit` (maksimum 100).

Setelah transaksi database sukses menyimpan event, backend publish payload ringkas ke Pusher:

- Channel privat: `private-admin-system-logs`.
- Event: `system-log.created`.
- Payload tidak menyertakan stack trace, secret, atau metadata sensitif.
- Bila publish Pusher gagal, event tetap tersimpan dan akan muncul lewat refresh/polling; kegagalan publish dicatat sebagai `external.pusher.publish_failed` dengan pencegahan loop tak terbatas.

## 12. Keamanan, retensi, dan performa

- Terapkan RBAC di API dan otorisasi private-channel Pusher, bukan hanya menyembunyikan menu frontend.
- Terapkan rate limit ketat untuk endpoint ingest dan ekspor; validasi schema dan batas ukuran `metadata`/stack trace.
- Jangan izinkan perubahan isi event oleh UI. Acknowledge, soft delete, restore, ekspor, dan purge selalu dicatat sebagai event `admin_audit` yang terlindungi.
- Default retensi: `debug` 7 hari, `info/success` 30 hari, `warning` 90 hari, `error/critical` 180 hari. Durasi perlu dapat dikonfigurasi kemudian sesuai kapasitas dan kebijakan organisasi.
- Jalankan job terjadwal untuk archive/purge aman berdasarkan `retention_expires_at`; jangan menghapus tanpa catatan agregat.
- Terapkan sampling untuk success/debug ber-volume tinggi. Error/warning tidak disampling kecuali ada mekanisme deduplikasi burst yang tetap menghitung jumlah kejadian.
- Hindari logging query string dan request body mentah. Route disimpan sebagai template (`/orders/:id`), bukan URL mentah yang dapat berisi data sensitif.
- Gunakan UTC pada database/event dan WIB pada UI (`Asia/Jakarta`).

## 13. Non-functional requirements

- Monitoring tidak menambah latensi request bisnis lebih dari target 20 ms secara rata-rata; write log bersifat best-effort/asinkron.
- Tampilan list tetap responsif sampai minimal 100 event per halaman dan histori besar melalui cursor/index.
- Event real-time harus idempoten di UI berdasarkan `eventId`.
- Sistem harus tahan terhadap Pusher down, database log down sementara, dan reconnect browser.
- Aksesibilitas: rasio kontras memadai, label teks/icon selain warna, keyboard navigable, dan drawer detail dapat ditutup dengan keyboard.

## 14. Tahap implementasi

### Tahap 1 — Fondasi backend

1. Buat migration `system_logs`, index, dan retensi.
2. Tambah request/correlation ID, sanitizer/redactor, `loggingService`, dan klasifikasi route.
3. Integrasikan error middleware, 404, rate limit, lifecycle process, serta domain auth/payment/order.
4. Buat endpoint admin baca/detail/summary dan authorization.

### Tahap 2 — UI Admin dan live streaming

1. Tambah menu `/admin/logs`, tabel, filter jangkauan waktu (`Live`, `7 hari`, `1 bulan`, dan kustom), summary, drawer detail, ekspor unduhan, serta hapus/pemulihan log.
2. Publish `system-log.created` ke private Pusher channel.
3. Tambah subscriber, reconnect catch-up, polling fallback, deduplikasi, dan pause/resume.

### Tahap 3 — Perluasan sumber event

1. Instrumentasi produk, toko, chat, notifikasi, moderasi, AI, upload, dan worker/poller.
2. Tambah mobile event reporter yang aman serta hubungan dengan Crashlytics.
3. Aktifkan sampling, retensi job, monitoring volume, dan dokumentasi operasional.

## 15. Kriteria penerimaan

1. Admin dapat membuka `/admin/logs`; pengguna non-admin mendapat 403 dan tidak dapat subscribe channel Pusher.
2. Satu login sukses menghasilkan log `auth.login.succeeded` dengan 2xx hijau dan teks angka status putih.
3. Login gagal menghasilkan event `auth.login.failed` tanpa password/email penuh; status/error tampil merah atau amber sesuai aturan.
4. Route API yang tidak ada menghasilkan event 404 yang dapat dicari.
5. Error backend 500 menghasilkan event `error/critical` dengan request ID, route, durasi, pesan aman, dan detail terbatas untuk admin.
6. Payment create, webhook, sync/poller failure, dan status payment berubah memiliki `orderId`/`transactionId`/`referenceCode` yang dapat ditelusuri.
7. Event baru di salah satu kategori muncul di tab Live Logs tanpa reload dalam maksimum 3 detik.
8. Saat Pusher reconnect, tidak ada event terduplikasi dan event yang terlewat diambil kembali.
9. Filter kategori Auth tidak menampilkan event Transaction; filter tetap berlaku pada event real-time baru.
10. Tombol pause menghentikan auto-scroll tetapi menampilkan jumlah event baru.
11. Pencarian dengan request ID/order ID menemukan rangkaian event terkait.
12. Pilihan `Live`, `7 hari`, dan `1 bulan` menampilkan data dengan rentang yang tepat dalam WIB; filter tersebut berlaku konsisten pada tabel, kartu ringkasan, ekspor, dan hapus massal.
13. Ekspor hanya memuat data sesuai filter dan mencatat aktivitas admin yang melakukan ekspor.
14. Hapus satu/massal memerlukan konfirmasi, melakukan soft delete, dapat dipulihkan selama 30 hari, dan setiap aksinya diaudit.
15. Tidak ada secret/OTP/password/token/isi chat/alamat lengkap dalam tabel, API, Pusher payload, atau CSV.
16. Jika database log/Pusher gagal, checkout/login tetap menyelesaikan respons bisnis sesuai perilaku asal dan kegagalan observability memiliki fallback.

## 16. Risiko dan keputusan yang perlu dikonfirmasi

| Topik | Rekomendasi awal |
|---|---|
| Volume data | Mulai dengan sampling 2xx/debug dan retensi bertingkat; ukur volume sebelum memperpanjang retensi. |
| Pusher | Manfaatkan Pusher yang sudah dipakai proyek untuk v1 agar tidak menambah broker baru. Gunakan private channel khusus admin. |
| Crash mobile | Crashlytics tetap sumber utama; dashboard admin menyimpan referensi/ringkasan error, bukan duplikasi data crash mentah. |
| Stack trace | Hanya detail tersanitasi di production dan hanya di drawer admin. |
| Alert otomatis | Jadikan fase berikutnya setelah pola error dan threshold nyata terkumpul. |

## 17. Catatan teknis implementasi

Backend saat ini sudah menulis `audit_logs` setelah response selesai. Implementasi baru sebaiknya memperluas pola ini, bukan menggantikan alur bisnis: event ditulis melalui satu `loggingService`, lalu dipublikasikan setelah tersimpan. Karena middleware audit terpasang sebelum route auth tetapi membaca `res.locals` di event `finish`, data aktor yang diisi middleware autentikasi masih dapat digunakan—namun perlu distandardkan bersama `requestId` dan durasi.

Untuk menjaga pemisahan tanggung jawab, gunakan `audit_logs` sebagai jejak audit legacy/administratif dan `system_logs` sebagai event observability yang kaya konteks. Bila diperlukan kemudian, dashboard dapat menampilkan keduanya sebagai kategori berbeda tanpa memaksa skema lama menyimpan stack trace atau payload diagnostik.
