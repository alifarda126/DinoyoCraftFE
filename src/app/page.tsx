"use client";

import Link from "next/link";
import Image from "next/image";
import MagneticButton from "@/components/MagneticButton";
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

const testimonials = [
  {
    quote: "Rombongan kantor kami 12 orang, satu transaksi selesai. Kode booking tinggal ditunjukkan di gang.",
    name: "Ratna Puspitasari",
    role: "HR Manager, Malang",
    initials: "RP",
    span: 3,
    large: true,
  },
  {
    quote: "Pesan 40 mug custom untuk tamu undangan. Pengrajinnya langsung mengirim progress fotonya.",
    name: "Bagas Anindito",
    role: "Pemilik kafe, Lowokwaru",
    initials: "BA",
    span: 2,
    large: false,
  },
  {
    quote: "Anak-anak sekolah ramai di roda pemutar, data rombongan sudah rapi di manifes admin.",
    name: "Sri Wahyuni",
    role: "Guru SD, Kota Malang",
    initials: "SW",
    span: 2,
    large: false,
  },
  {
    quote: "Dari sketsa di WhatsApp, keramiknya jadi persis bayangan kami. Studio sangat responsif dan ramah.",
    name: "Dewi Wulandari",
    role: "Dekorator interior, Surabaya",
    initials: "DW",
    span: 3,
    large: false,
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

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="border-b border-line relative overflow-hidden">
        {/* Ambient glow blobs */}
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-60 -left-32 w-[700px] h-[700px] rounded-full bg-amber-brand opacity-[0.07] blur-[110px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-amber-brand opacity-[0.04] blur-[130px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-amber-brand opacity-[0.03] blur-[80px]" />
        </div>

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
              <MagneticButton
                href="/auth"
                className="inline-flex items-center px-7 py-3.5 rounded-full bg-amber-brand text-surface font-semibold hover:bg-amber-dark transition-colors"
              >
                Mulai Reservasi
                <ArrowRight className="w-4 h-4" weight="bold" />
              </MagneticButton>
              <MagneticButton
                href="#fitur"
                className="inline-flex items-center px-7 py-3.5 rounded-full border border-line text-bone font-medium hover:border-bone-muted transition-colors"
              >
                Lihat Fitur
              </MagneticButton>
            </div>
          </div>

          <div className="relative">
            {/* Subtle inner glow behind the image grid */}
            <div aria-hidden className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-amber-brand opacity-[0.09] blur-[80px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <figure className="rounded-2xl overflow-hidden aspect-[4/5] ring-1 ring-white/5">
                  <Image
                    src="https://picsum.photos/seed/dinoyo-potter-hands-clay-wheel/600/750"
                    alt="Pengrajin Dinoyo membentuk tanah liat dengan tangan di roda pemutar"
                    width={600}
                    height={750}
                    priority
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </figure>
                <figure className="rounded-2xl overflow-hidden aspect-square ring-1 ring-white/5">
                  <Image
                    src="https://picsum.photos/seed/dinoyo-fired-pottery-kiln-glaze/600/600"
                    alt="Keramik hasil pembakaran kiln tradisional Dinoyo dengan glasir matang"
                    width={600}
                    height={600}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </figure>
              </div>
              <div className="space-y-4 pt-12">
                <figure className="rounded-2xl overflow-hidden aspect-square ring-1 ring-white/5">
                  <Image
                    src="https://picsum.photos/seed/dinoyo-narrow-alley-pottery-workshop/600/600"
                    alt="Lorong sempit gang keramik Dinoyo dengan bengkel di kiri kanan"
                    width={600}
                    height={600}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </figure>
                <figure className="rounded-2xl overflow-hidden aspect-[4/5] ring-1 ring-white/5">
                  <Image
                    src="https://picsum.photos/seed/dinoyo-clay-preparation-mud-workshop/600/750"
                    alt="Meja persiapan tanah liat dan alat-alat keramik di bengkel Dinoyo"
                    width={600}
                    height={750}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </figure>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FITUR ──────────────────────────────────────────────────────────── */}
      <section id="fitur" className="border-b border-line relative overflow-hidden">
        {/* Centered warm glow behind cards */}
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-amber-brand opacity-[0.05] blur-[140px]" />
          <div className="absolute -bottom-20 right-1/4 w-[400px] h-[400px] rounded-full bg-amber-brand opacity-[0.03] blur-[100px]" />
        </div>

        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tighter leading-[1.1] max-w-2xl">
            Semua yang kamu butuhkan untuk hari yang penuh tanah liat.
          </h2>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-max">
            {features.map((f, i) => {
              const Icon = f.icon;
              const isWide = i === 0 || i === 3;
              return (
                <div
                  key={f.title}
                  className={`reveal card-hover-glow bg-surface-elevated border border-line rounded-2xl p-8 lg:p-10 hover:bg-surface-raised transition-colors relative overflow-hidden ${isWide ? "md:col-span-2" : ""}`}
                >
                  {/* Corner accent glow */}
                  <div aria-hidden className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-amber-brand opacity-[0.07] blur-[40px] pointer-events-none" />
                  <Icon className="w-7 h-7 text-amber-brand" />
                  <h3 className="mt-5 text-xl font-semibold tracking-tight">
                    {f.title}
                  </h3>
                  <p className="mt-2.5 text-bone-muted leading-relaxed max-w-[50ch]">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CARA BERKUNJUNG ────────────────────────────────────────────────── */}
      <section id="cara" className="border-b border-line relative overflow-hidden">
        {/* Side glow */}
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-amber-brand opacity-[0.04] blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-amber-brand opacity-[0.04] blur-[100px]" />
        </div>

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
              <div className="card-hover-glow bg-surface-elevated border border-amber-brand/20 rounded-2xl p-8 lg:sticky lg:top-24 relative overflow-hidden">
                {/* Glow inside the aside card */}
                <div aria-hidden className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-amber-brand opacity-[0.1] blur-[50px] pointer-events-none" />
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

      {/* ── TESTIMONIALS ───────────────────────────────────────────────────── */}
      <section id="suara" className="border-b border-line relative overflow-hidden">
        {/* Decorative background quote watermark */}
        <div aria-hidden className="absolute top-0 right-10 select-none pointer-events-none overflow-hidden">
          <span className="text-[28rem] font-serif leading-none text-amber-brand opacity-[0.025]">&ldquo;</span>
        </div>
        {/* Bottom glow */}
        <div aria-hidden className="absolute bottom-0 left-1/3 w-[500px] h-[300px] rounded-full bg-amber-brand opacity-[0.04] blur-[120px] pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-24 lg:py-32">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tighter leading-[1.1]">
            Suara dari lorong keramik.
          </h2>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-5 gap-6 auto-rows-max">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className={`reveal card-hover-glow bg-surface-elevated border border-line rounded-2xl flex flex-col relative overflow-hidden ${
                  t.span === 3 ? "md:col-span-3" : "md:col-span-2"
                } ${t.large ? "p-8 lg:p-10" : "p-8"}`}
              >
                {/* Subtle inner glow on each card */}
                <div aria-hidden className="absolute top-0 right-0 w-24 h-24 rounded-full bg-amber-brand opacity-[0.06] blur-[30px] pointer-events-none" />
                <Quotes className={`text-amber-brand ${t.large ? "w-6 h-6" : "w-5 h-5"}`} />
                <blockquote className={`flex-1 leading-relaxed ${t.large ? "mt-6 text-lg" : "mt-4 text-sm"}`}>
                  {t.quote}
                </blockquote>
                <figcaption className={`flex items-center gap-3 ${t.large ? "mt-8" : "mt-6"}`}>
                  {/* Avatar with initials */}
                  <div className="w-9 h-9 rounded-full bg-amber-brand/15 border border-amber-brand/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-amber-brand">{t.initials}</span>
                  </div>
                  <div>
                    <span className={`font-medium block ${t.large ? "" : "text-sm"}`}>{t.name}</span>
                    <span className={`text-bone-muted block mt-0.5 ${t.large ? "text-sm" : "text-xs"}`}>
                      {t.role}
                    </span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ─────────────────────────────────────────────────────── */}
      <footer className="border-b border-line relative overflow-hidden">
        {/* Glow behind heading */}
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-amber-brand opacity-[0.06] blur-[120px]" />
        </div>
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
