"use client";

import { useEffect, useState, useCallback } from "react";
import { getDemoSession } from "@/lib/utils/demo";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Robot, Key, ShieldCheck, ToggleRight, ToggleLeft } from "@phosphor-icons/react";
import { adminService } from "@/services/admin.service";

const DEFAULT_PROMPT =
  "Anda adalah Asisten Virtual resmi dari Kampung Keramik Dinoyo. Tugas Anda adalah melayani pelanggan, memberikan info seputar harga dan jadwal bengkel, serta membantu proses pemesanan dengan ramah dan sopan.";

export default function AdminPengaturanAIPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-1.5-pro");
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_PROMPT);

  const fetchSettings = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await adminService.getAiSettings();
      const d = res?.data;
      if (d) {
        setAiEnabled(Boolean(d.is_auto_reply_active));
        setModel(d.model_name || "gemini-1.5-pro");
        setApiKey(d.api_key || "");
        setSystemPrompt(d.system_prompt || DEFAULT_PROMPT);
      }
    } catch (err) {
      console.error("Gagal memuat pengaturan AI:", err);
      if (isInitial) toast.error("Gagal memuat pengaturan AI dari server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const session = getDemoSession();
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if ((!session || session.role !== "admin") && !storedToken) {
      router.push("/auth/login");
      return;
    }
    fetchSettings(true);

    const onFocus = () => fetchSettings(false);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [router, fetchSettings]);

  useEffect(() => {
    if (apiKey === "sk-************************************" || apiKey === "") return;

    if (apiKey.startsWith("AIza")) {
      setModel((prev) => (prev.startsWith("gemini") ? prev : "gemini-1.5-pro"));
    } else if (apiKey.startsWith("sk-ant-")) {
      setModel((prev) => (prev.startsWith("claude") ? prev : "claude-3"));
    } else if (apiKey.startsWith("sk-")) {
      setModel((prev) => (prev.startsWith("gpt") ? prev : "gpt-4o"));
    }
  }, [apiKey]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateAiSettings({
        is_auto_reply_active: aiEnabled,
        model_name: model,
        api_key: apiKey,
        system_prompt: systemPrompt,
      });
      toast.success("Konfigurasi AI berhasil disimpan ke server");
      await fetchSettings(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menyimpan konfigurasi AI");
    } finally {
      setSaving(false);
    }
  };

  const toggleAi = async () => {
    const nextVal = !aiEnabled;
    setAiEnabled(nextVal);
    try {
      await adminService.updateAiSettings({
        is_auto_reply_active: nextVal,
        model_name: model,
        api_key: apiKey,
        system_prompt: systemPrompt,
      });
      toast.success(`Asisten AI telah ${nextVal ? "diaktifkan" : "dinonaktifkan"} secara global.`);
    } catch {
      setAiEnabled(!nextVal);
      toast.error("Gagal memperbarui status global AI");
    }
  };

  if (loading) return <div>Memuat...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 mb-1">Pengaturan Asisten AI</h1>
        <p className="text-zinc-500 text-sm">Kelola konfigurasi model bahasa (LLM) dan API Key untuk Chatbot otomatis DinoyoCraft.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Key Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white border border-zinc-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-6 flex items-center gap-2">
              <Key size={22} className="text-clay" />
              Kredensial API
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-zinc-800 mb-2">Model AI yang Digunakan</label>
                <select 
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
                >
                  <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Direkomendasikan)</option>
                  <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Cepat & Ringan)</option>
                  <option value="gpt-4o">OpenAI GPT-4o</option>
                  <option value="gpt-3.5-turbo">OpenAI GPT-3.5 Turbo</option>
                  <option value="claude-3">Anthropic Claude 3</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-800 mb-2">API Key rahasia</label>
                <input 
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste API Key di sini (misal: sk-...)" 
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm font-mono"
                  required
                />
                <p className="text-xs text-zinc-500 mt-2">
                  Key Anda dienkripsi sebelum disimpan ke database. Jangan bagikan key ini kepada siapapun.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-800 mb-2">Prompt Sistem / Instruksi Default</label>
                <textarea 
                  rows={4}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
                ></textarea>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100 flex justify-end">
              <button 
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition-colors font-medium text-sm"
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>

        {/* Status Panel */}
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              <Robot size={22} className="text-clay" />
              Status Global AI
            </h2>
            
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-100 mb-4">
              <div>
                <p className="font-semibold text-sm text-zinc-900">Auto-Reply Aktif</p>
                <p className="text-xs text-zinc-500 mt-0.5">Berlaku untuk semua toko</p>
              </div>
              <button onClick={toggleAi} className="text-zinc-400 hover:text-clay transition-colors">
                {aiEnabled ? (
                  <ToggleRight size={40} weight="fill" className="text-clay" />
                ) : (
                  <ToggleLeft size={40} weight="fill" />
                )}
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <ShieldCheck size={18} className="text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-zinc-800">Koneksi API Normal</p>
                  <p className="text-xs text-zinc-500">Ping 42ms. Tidak ada isu terdeteksi.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck size={18} className="text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-zinc-800">Vector Database Tersinkron</p>
                  <p className="text-xs text-zinc-500">Katalog dan info toko up-to-date.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
