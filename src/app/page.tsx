"use client";

import Link from "next/link";
import { ArrowRight, HandsClapping, MapPin, Quotes } from "@phosphor-icons/react";
import {
  Chats,
  Cube,
  Ticket,
} from "@phosphor-icons/react";

const features = [
  {
    icon: Ticket,
    title: "Reservasi Rombongan",
    desc: "Pesan kelas keramik untuk satu rombongan dalam satu transaksi.",
  },
  {
    icon: Cube,
    title: "Suvenir Kustom",
    desc: "Ajukan desain cenderamata langsung ke pengrajin pilihanmu.",
  },
  {
    icon: MapPin,
    title: "Peta Gang",
    desc: "Navigasi interaktif ke bengkel pengrajin di lorong keramik.",
  },
  {
    icon: Chats,
    title: "Bantuan 24 Jam",
    desc: "Chatbot untuk pertanyaan umum, admin untuk kendala spesifik.",
  },
];

export default function Home() {
  return (
    <div className="bg-surface text-bone">
      <nav className="border-b border-line">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
          <span className="font-mono text-sm tracking-[0.2em] uppercase">
            DinoyoCraft
          </span>
          <div className="hidden lg:flex items-center gap-8 text-sm text-bone-muted">
            <a href="#fitur" className="hover:text-bone transition-colors">
              Fitur
            </a>
            <a href="#cara" className="hover:text-bone transition-colors">
              Cara Berkunjung
            </a>
            <a href="#suara" className="hover:text-bone transition-colors">
              Suara Pengunjung
            </a>
          </div>
          <Link
            href="/auth"
            className="text-sm font-medium px-5 py-2 rounded-full bg-amber-brand text-surface hover:bg-amber-dark transition-colors"
          >
            Masuk
          </Link>
        </div>
      </nav>

      <section className="border-b border-line">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-12 items-center min-h-[92dvh] pt-16 pb-20">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.05] max-w-xl">
              Tanah liat Dinoyo, dari roda pemutar langsung ke tanganmu.
            </h1>
            <p className="mt-6 text-lg text-bone-muted leading-relaxed max-w-[65ch]">
              Reservasi kelas keramik, pesan suvenir kustom, jelajahi gang
              bengkel. Satu aplikasi untuk seluruh kampung keramik Malang.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-amber-brand text-surface font-semibold hover:bg-amber-dark transition-colors"
              >
                Mulai Reservasi
                <ArrowRight className="w-4 h-4" weight="bold" />
              </Link>
              <a
                href="#fitur"
                className="inline-flex items-center px-7 py-3.5 rounded-full border border-line text-bone font-medium hover:border-bone-muted transition-colors"
              >
                Lihat Fitur
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <figure className="rounded-2xl overflow-hidden aspect-[4/5]">
                  <img
                    src="https://picsum.photos/seed/dinoyo-potter-wheel-hands/600/750"
                    alt="Pengrajin membentuk tanah liat di roda pemutar"
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </figure>
                <figure className="rounded-2xl overflow-hidden aspect-square">
                  <img
                    src="https://picsum.photos/seed/dinoyo-ceramic-vase-glow/600/600"
                    alt="Vas keramik hasil bengkel Dinoyo"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </figure>
              </div>
              <div className="space-y-4 pt-12">
                <figure className="rounded-2xl overflow-hidden aspect-square">
                  <img
                    src="https://picsum.photos/seed/dinoyo-alley-kiln-smoke/600/600"
                    alt="Lorong gang keramik Dinoyo"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </figure>
                <figure className="rounded-2xl overflow-hidden aspect-[4/5]">
                  <img
                    src="https://picsum.photos/seed/dinoyo-paint-glaze-table/600/750"
                    alt="Meja glasir dan pewarna keramik"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </figure>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="fitur" className="border-b border-line">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tighter leading-[1.1] max-w-2xl">
            Semua yang kamu butuhkan untuk hari yang penuh tanah liat.
          </h2>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-px bg-line rounded-2xl overflow-hidden border border-line">
            {features.map((f) => (
              <div
                key={f.title}
                className="reveal bg-surface-elevated p-8 lg:p-10 hover:bg-surface-raised transition-colors"
              >
                <f.icon className="w-7 h-7 text-amber-brand" />
                <h3 className="mt-5 text-xl font-semibold tracking-tight">
                  {f.title}
                </h3>
                <p className="mt-2.5 text-bone-muted leading-relaxed max-w-[50ch]">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cara" className="border-b border-line">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-[2fr_1fr] gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tighter leading-[1.1]">
                Cara berkunjung dalam empat langkah.
              </h2>

              <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-10">
                {[
                  ["Daftar", "Buat akun dengan email atau Google."],
                  ["Pilih Jadwal", "Cek ketersediaan, isi data rombongan."],
                  ["Bayar", "Transfer bank, VA, e-wallet, atau QRIS."],
                  ["Datang", "Tunjukkan kode booking di gang keramik."],
                ].map(([title, desc], i) => (
                  <div key={title} className="reveal">
                    <span className="font-mono text-amber-brand text-sm">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 text-xl font-semibold tracking-tight">
                      {title}
                    </h3>
                    <p className="mt-2 text-bone-muted leading-relaxed">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="lg:justify-self-end">
              <div className="bg-surface-elevated border border-line rounded-2xl p-8 lg:sticky lg:top-24">
                <HandsClapping className="w-8 h-8 text-amber-brand" />
                <h3 className="mt-5 font-semibold tracking-tight text-lg">
                  Kelas keramik instan
                </h3>
                <p className="mt-2 text-bone-muted text-sm leading-relaxed">
                  Tak perlu tunggu jadwal panjang. Pesan sesi hari ini, bayar,
                  dan langsung bentuk tanah liat pertamamu di roda pemutar.
                </p>
                <Link
                  href="/auth"
                  className="mt-6 inline-flex items-center gap-2 text-amber-brand font-medium hover:text-amber-dark transition-colors"
                >
                  Coba sekarang
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="suara" className="border-b border-line">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tighter leading-[1.1]">
            Suara dari lorong keramik.
          </h2>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "Rombongan kantor kami 12 orang, satu transaksi selesai. Kode booking tinggal ditunjukkan di gang.",
                name: "Ratna Puspitasari",
                role: "HR Manager, Malang",
              },
              {
                quote:
                  "Pesan 40 mug custom untuk tamu undangan. Pengrajinnya langsung yang mengirim progress fotonya.",
                name: "Bagas Anindito",
                role: "Pemilik kafe, Lowokwaru",
              },
              {
                quote:
                  "Anak-anak sekolah ramai di roda pemutar, data rombongan sudah rapi di manifes admin.",
                name: "Sri Wahyuni",
                role: "Guru SD, Kota Malang",
              },
            ].map((t) => (
              <figure
                key={t.name}
                className="reveal bg-surface-elevated border border-line rounded-2xl p-8 flex flex-col"
              >
                <Quotes className="w-6 h-6 text-amber-brand" />
                <blockquote className="mt-4 leading-relaxed flex-1">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6">
                  <span className="font-medium">{t.name}</span>
                  <span className="block text-sm text-bone-muted mt-0.5">
                    {t.role}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-b border-line">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-24 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tighter leading-[1.1] max-w-lg">
              Slot roda pemutar menunggu. Tanah liatnya sudah siap.
            </h2>
          </div>
          <div className="lg:justify-self-end">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-amber-brand text-surface font-semibold hover:bg-amber-dark transition-colors"
            >
              Mulai Reservasi
              <ArrowRight className="w-4 h-4" weight="bold" />
            </Link>
          </div>
        </div>
      </footer>

      <div className="border-b border-line">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-bone-muted">
          <span className="font-mono tracking-[0.2em] uppercase text-xs">
            DinoyoCraft
          </span>
          <p>Kampung Keramik Dinoyo, Lowokwaru, Kota Malang</p>
        </div>
      </div>
    </div>
  );
}
