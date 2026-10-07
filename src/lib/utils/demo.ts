/**
 * Demo authentication system for DinoyoCraft simulation.
 * Allows full UI testing without real Supabase credentials.
 * Session is stored in localStorage under a private key.
 */

export type DemoRole = "user" | "admin" | "seller";

export interface DemoUser {
  id: string;
  email: string;
}

export interface DemoProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: DemoRole;
}

export interface DemoSession {
  role: DemoRole;
  user: DemoUser;
  profile: DemoProfile;
}

const DEMO_SESSIONS: Record<DemoRole, DemoSession> = {
  user: {
    role: "user",
    user: { id: "demo-user-0000-0000-0000-000000000001", email: "demo@dinoyocraft.id" },
    profile: {
      id: "demo-user-0000-0000-0000-000000000001",
      email: "demo@dinoyocraft.id",
      full_name: "Demo Pengunjung",
      phone: "081234567890",
      role: "user",
    },
  },
  admin: {
    role: "admin",
    user: { id: "demo-admin-0000-0000-0000-000000000002", email: "admin@dinoyocraft.id" },
    profile: {
      id: "demo-admin-0000-0000-0000-000000000002",
      email: "admin@dinoyocraft.id",
      full_name: "Admin DinoyoCraft",
      phone: "081987654321",
      role: "admin",
    },
  },
  seller: {
    role: "seller",
    user: { id: "demo-seller-0000-0000-0000-000000000003", email: "seller@dinoyocraft.id" },
    profile: {
      id: "demo-seller-0000-0000-0000-000000000003",
      email: "seller@dinoyocraft.id",
      full_name: "Mitra Pengrajin",
      phone: "08111222333",
      role: "seller",
    },
  },
};

const STORAGE_KEY = "_dc_demo_v1";

export function getDemoSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DemoSession) : null;
  } catch {
    return null;
  }
}

export function setDemoSession(role: DemoRole): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_SESSIONS[role]));
}

export function clearDemoSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getDemoUser(): DemoUser | null {
  return getDemoSession()?.user ?? null;
}

export function getDemoProfile(): DemoProfile | null {
  return getDemoSession()?.profile ?? null;
}

export function isDemoAdmin(): boolean {
  return getDemoSession()?.role === "admin";
}

export function isDemoSeller(): boolean {
  return getDemoSession()?.role === "seller";
}
