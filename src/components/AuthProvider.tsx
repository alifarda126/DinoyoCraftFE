"use client";

// ============================================================
//  src/components/AuthProvider.tsx
//  Hydrate auth state dari localStorage saat app pertama mount
// ============================================================

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return <>{children}</>;
}
