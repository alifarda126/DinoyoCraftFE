"use client";

import { usePathname } from "next/navigation";
import MitraSidebar from "@/components/layout/MitraSidebar";
import { useState, useEffect } from "react";
import { List, X } from "@phosphor-icons/react";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (pathname === "/mitra/dashboard/registrasi") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-white" style={{ fontFamily: "var(--font-outfit), sans-serif" }}>
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-zinc-200 z-40 flex items-center justify-between px-4 shadow-sm">
        <span className="font-bold text-lg text-zinc-900">Dinoyo<span className="text-zinc-500">Craft</span> Mitra</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-zinc-900">
          {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Wrapper */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 h-full flex transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <MitraSidebar />
      </div>

      {/* Main Content */}
      <main className="no-scrollbar flex-1 overflow-y-auto mt-14 md:mt-0 p-4 md:p-8 overscroll-contain">
        <div className="max-w-[1000px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
