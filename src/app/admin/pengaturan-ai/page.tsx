"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowCounterClockwise,
  ArrowsClockwise,
  CheckCircle,
  Eye,
  EyeSlash,
  Key,
  Robot,
  ShieldCheck,
  ShieldWarning,
  ToggleLeft,
  ToggleRight,
  Trash,
  WarningCircle,
} from "@phosphor-icons/react";
import api from "@/lib/axios";
import { getDemoSession } from "@/lib/utils/demo";
import { EarthySelect } from "@/components/ui/EarthySelect";

interface DiscoveredModel {
  id: string;
  label: string;
  recommended?: boolean;
}

type ConnectionStatus = "idle" | "checking" | "valid" | "invalid" | "missing";

export default function AdminPengaturanAIPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Saved config states
  const [aiEnabled, setAiEnabled] = useState(true);
  const [provider, setProvider] = useState<string | null>(null);
  const [providerLabel, setProviderLabel] = useState("Belum Diatur");
  const [model, setModel] = useState("gemini-3.5-flash-lite");
  const [models, setModels] = useState<DiscoveredModel[]>([]);

  // API key input & masked saved key
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [hasSavedKey, setHasSavedKey] = useState(false);
  const [maskedSavedKey, setMaskedSavedKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  // Prompts & DB sync metrics
  const [systemPrompt, setSystemPrompt] = useState("");
  const [defaultPrompt, setDefaultPrompt] = useState("");
  const [catalogCount, setCatalogCount] = useState(0);
  const [storeCount, setStoreCount] = useState(0);

  // Connection diagnostics
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
  const [latencyMs, setLatencyMs] = useState(0);
  const [connectionMessage, setConnectionMessage] = useState("");

  const verifyRequestCounter = useRef(0);

  const runVerifyApi = useCallback(
    async (options?: { keyOverride?: string; silent?: boolean }) => {
      const candidateKey = (options?.keyOverride ?? apiKeyInput).trim();
      const silent = Boolean(options?.silent);

      if (!candidateKey && !hasSavedKey) {
        setConnectionStatus("missing");
        setModels([]);
        setLatencyMs(0);
        setConnectionMessage("Masukkan API Key terlebih dahulu lalu klik Cek API.");
        if (!silent) {
          toast.error("Masukkan API Key terlebih dahulu sebelum mengecek koneksi.");
        }
        return;
      }

      const reqId = ++verifyRequestCounter.current;
      setConnectionStatus("checking");
      setConnectionMessage("Menghubungi provider & mengambil daftar model...");

      try {
        const res = await api.post("/admin/ai-settings/verify", {
          api_key: candidateKey || undefined,
          use_saved_key: !candidateKey && hasSavedKey,
        });

        // Abaikan respons lama jika sudah ada pengecekan terbaru
        if (reqId !== verifyRequestCounter.current) return;

        const data = res.data?.data;
        if (!data) {
          throw new Error("Respons server tidak valid.");
        }

        setProvider(data.provider || null);
        setProviderLabel(data.providerLabel || "Tidak Diketahui");
        setLatencyMs(Number(data.latencyMs || 0));
        setConnectionMessage(data.message || "");

        if (data.valid) {
          const discovered: DiscoveredModel[] = Array.isArray(data.models) ? data.models : [];
          setModels(discovered);
          setConnectionStatus("valid");

          setModel((prevModel) => {
            if (discovered.length === 0) return prevModel;
            const stillExists = discovered.some((m) => m.id === prevModel);
            if (stillExists) return prevModel;
            return data.recommendedModel || discovered[0].id;
          });

          if (!silent) {
            toast.success(
              `API Key valid (${data.providerLabel}) — ${discovered.length} model berhasil dimuat (${data.latencyMs}ms).`
            );
          }
        } else {
          setModels([]);
          setConnectionStatus("invalid");
          if (!silent) {
            toast.error(data.message || "API Key tidak valid atau tidak dapat terhubung.");
          }
        }
      } catch (err: any) {
        if (reqId !== verifyRequestCounter.current) return;
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Gagal menghubungi server untuk mengecek API Key.";
        setConnectionStatus("invalid");
        setModels([]);
        setConnectionMessage(msg);
        if (!silent) {
          toast.error(msg);
        }
      }
    },
    [apiKeyInput, hasSavedKey]
  );

  // Load saved AI settings on mount
  useEffect(() => {
    const session = getDemoSession();
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if ((!session || session.role !== "admin") && !storedToken) {
      router.push("/login");
      return;
    }

    let active = true;
    const loadSettings = async () => {
      try {
        const res = await api.get("/admin/ai-settings");
        if (!active) return;

        const d = res.data?.data;
        if (d) {
          setAiEnabled(Boolean(d.is_auto_reply_active));
          setProvider(d.provider || null);
          setProviderLabel(d.provider_label || "Belum Diatur");
          setModel(d.model_name || "gemini-3.5-flash-lite");
          setHasSavedKey(Boolean(d.has_api_key));
          setMaskedSavedKey(d.masked_api_key || "");
          setSystemPrompt(d.system_prompt || d.default_system_prompt || "");
          setDefaultPrompt(d.default_system_prompt || "");
          setCatalogCount(Number(d.catalog_count || 0));
          setStoreCount(Number(d.store_count || 0));

          if (d.has_api_key) {
            setConnectionStatus("checking");
            setConnectionMessage("Memeriksa koneksi API Key tersimpan...");
            try {
              const verifyRes = await api.post("/admin/ai-settings/verify", {
                use_saved_key: true,
              });
              if (!active) return;
              const vd = verifyRes.data?.data;
              if (vd?.valid) {
                const discovered: DiscoveredModel[] = Array.isArray(vd.models) ? vd.models : [];
                setProvider(vd.provider || d.provider || null);
                setProviderLabel(vd.providerLabel || d.provider_label || "Terhubung");
                setLatencyMs(Number(vd.latencyMs || 0));
                setModels(discovered);
                setConnectionStatus("valid");
                setConnectionMessage(vd.message || "Terhubung");
              } else {
                setConnectionStatus("invalid");
                setLatencyMs(Number(vd?.latencyMs || 0));
                setConnectionMessage(vd?.message || "API Key tersimpan tidak valid.");
              }
            } catch {
              if (active) {
                setConnectionStatus("invalid");
                setConnectionMessage("Gagal menguji koneksi API Key tersimpan.");
              }
            }
          } else {
            setConnectionStatus("missing");
            setConnectionMessage("Belum ada API Key tersimpan. Tempel key dari provider AI Anda.");
          }
        }
      } catch (err: any) {
        if (!active) return;
        console.warn("Gagal memuat pengaturan Asisten AI:", err?.message || err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadSettings();

    const syncCountsSilently = async () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      try {
        const res = await api.get("/admin/ai-settings");
        if (!active) return;
        const d = res.data?.data;
        if (d) {
          setCatalogCount(Number(d.catalog_count || 0));
          setStoreCount(Number(d.store_count || 0));
        }
      } catch {
        // silent background sync
      }
    };

    const pollInterval = setInterval(syncCountsSilently, 30000);
    window.addEventListener("focus", syncCountsSilently);
    document.addEventListener("visibilitychange", syncCountsSilently);

    return () => {
      active = false;
      clearInterval(pollInterval);
      window.removeEventListener("focus", syncCountsSilently);
      document.removeEventListener("visibilitychange", syncCountsSilently);
    };
  }, [router]);

  // Auto-detect provider & model list after Admin pastes a new key (debounced)
  useEffect(() => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed || trimmed.length < 20) return;

    const timer = setTimeout(() => {
      runVerifyApi({ keyOverride: trimmed, silent: true });
    }, 750);

    return () => clearTimeout(timer);
  }, [apiKeyInput, runVerifyApi]);

  const modelOptions = useMemo(() => {
    const mapped = models.map((m) => ({
      value: m.id,
      label: m.label,
    }));

    if (model && !mapped.some((m) => m.value === model)) {
      return [
        {
          value: model,
          label: models.length > 0 ? `${model} (Tersimpan sebelumnya)` : model,
        },
        ...mapped,
      ];
    }
    return mapped;
  }, [models, model]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim() && !hasSavedKey) {
      toast.error("Silakan masukkan API Key terlebih dahulu.");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        is_auto_reply_active: aiEnabled,
        provider,
        model_name: model,
        system_prompt: systemPrompt.trim() || defaultPrompt,
      };
      if (apiKeyInput.trim()) {
        payload.api_key = apiKeyInput.trim();
      }

      const res = await api.put("/admin/ai-settings", payload);
      const saved = res.data?.data;
      if (saved) {
        setAiEnabled(Boolean(saved.is_auto_reply_active));
        setProvider(saved.provider || provider);
        setProviderLabel(saved.provider_label || providerLabel);
        setModel(saved.model_name || model);
        setHasSavedKey(Boolean(saved.has_api_key));
        setMaskedSavedKey(saved.masked_api_key || "");
        setSystemPrompt(saved.system_prompt || systemPrompt);
        setCatalogCount(Number(saved.catalog_count ?? catalogCount));
        setStoreCount(Number(saved.store_count ?? storeCount));
      }

      const typedKey = apiKeyInput.trim();
      setApiKeyInput("");
      setShowKey(false);
      toast.success("Konfigurasi Asisten AI berhasil disimpan & API Key terenkripsi!");

      // Jika Admin memasukkan key baru namun belum terverifikasi, verifikasi otomatis setelah simpan
      if (typedKey && connectionStatus !== "valid") {
        await runVerifyApi({ silent: true });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menyimpan konfigurasi AI.");
    } finally {
      setSaving(false);
    }
  };

  const toggleAi = async () => {
    const nextState = !aiEnabled;
    setAiEnabled(nextState);
    try {
      await api.put("/admin/ai-settings", {
        is_auto_reply_active: nextState,
      });
      toast.success(`Asisten AI telah ${nextState ? "diaktifkan" : "dinonaktifkan"} secara global.`);
    } catch (err: any) {
      setAiEnabled(!nextState);
      toast.error(err?.response?.data?.message || "Gagal mengubah status Asisten AI.");
    }
  };

  const handleClearKey = async () => {
    setSaving(true);
    try {
      await api.put("/admin/ai-settings", { clear_api_key: true });
      setApiKeyInput("");
      setHasSavedKey(false);
      setMaskedSavedKey("");
      setProvider(null);
      setProviderLabel("Belum Diatur");
      setModels([]);
      setConnectionStatus("missing");
      setLatencyMs(0);
      setConnectionMessage("API Key dihapus. Silakan masukkan API Key baru.");
      toast.success("API Key tersimpan berhasil dihapus.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menghapus API Key.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPrompt = () => {
    if (!defaultPrompt) return;
    setSystemPrompt(defaultPrompt);
    toast.success("Prompt instruksi dikembalikan ke template standar DinoyoCraft (CS & Mitra).");
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 mb-1">Pengaturan Asisten AI</h1>
        <p className="text-zinc-500 text-sm">
          Tempel API Key dari provider LLM mana pun (Gemini, OpenAI, Groq, OpenRouter, Claude, DeepSeek, Mistral, xAI),
          cek koneksi, lalu pilih model otomatis untuk melayani Customer Service & Asisten Mitra.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Kredensial & Prompt */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white border border-zinc-200 rounded-xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <Key size={22} className="text-clay" />
                Kredensial Provider & Model AI
              </h2>
              {loading ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-500 animate-pulse">
                  Memuat konfigurasi...
                </span>
              ) : provider ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                  Provider Terdeteksi: {providerLabel}
                </span>
              ) : null}
            </div>

            <div className="space-y-5">
              {/* 1. API Key Bebas Provider + Tombol Cek API */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label className="block text-sm font-semibold text-zinc-800">
                    API Key Rahasia (Multi-Provider)
                  </label>
                  {hasSavedKey && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        Tersimpan: {maskedSavedKey}
                      </span>
                      <button
                        type="button"
                        onClick={handleClearKey}
                        disabled={saving}
                        className="text-xs text-red-600 hover:text-red-700 inline-flex items-center gap-1 font-medium"
                        title="Hapus API Key tersimpan"
                      >
                        <Trash size={13} /> Hapus
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <input
                      type={showKey ? "text" : "password"}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder={
                        hasSavedKey
                          ? `Biarkan kosong untuk tetap memakai key tersimpan (${maskedSavedKey}) atau tempel key baru...`
                          : "Tempel API Key di sini (AIza..., sk-..., gsk_..., sk-or-..., sk-ant-..., dll)"
                      }
                      className="w-full pl-4 pr-11 py-2.5 rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                      aria-label={showKey ? "Sembunyikan API Key" : "Tampilkan API Key"}
                    >
                      {showKey ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => runVerifyApi({ silent: false })}
                    disabled={connectionStatus === "checking"}
                    className="px-4 py-2.5 rounded-lg border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 font-semibold text-sm inline-flex items-center justify-center gap-2 shrink-0 disabled:opacity-60 transition-colors cursor-pointer"
                  >
                    <ArrowsClockwise
                      size={17}
                      className={connectionStatus === "checking" ? "animate-spin text-clay" : "text-clay"}
                    />
                    {connectionStatus === "checking" ? "Mengecek..." : "Cek API"}
                  </button>
                </div>

                {/* Umpan balik koneksi inline */}
                {connectionMessage && (
                  <div
                    className={`mt-2.5 px-3.5 py-2.5 rounded-lg text-xs flex items-start gap-2 border ${connectionStatus === "valid"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : connectionStatus === "invalid"
                          ? "bg-red-50 border-red-200 text-red-700"
                          : connectionStatus === "checking"
                            ? "bg-zinc-50 border-zinc-200 text-zinc-700"
                            : "bg-amber-50 border-amber-200 text-amber-800"
                      }`}
                  >
                    {connectionStatus === "valid" ? (
                      <CheckCircle size={16} weight="fill" className="shrink-0 mt-0.5 text-emerald-600" />
                    ) : connectionStatus === "invalid" ? (
                      <WarningCircle size={16} weight="fill" className="shrink-0 mt-0.5 text-red-600" />
                    ) : connectionStatus === "checking" ? (
                      <ArrowsClockwise size={16} className="shrink-0 mt-0.5 animate-spin text-zinc-500" />
                    ) : (
                      <ShieldWarning size={16} weight="fill" className="shrink-0 mt-0.5 text-amber-600" />
                    )}
                    <span>{connectionMessage}</span>
                  </div>
                )}

                <p className="text-xs text-zinc-500 mt-2">
                  API Key dienkripsi (AES-256) sebelum disimpan ke database. Sistem otomatis mendeteksi provider dan daftar model yang dimiliki key Anda.
                </p>
              </div>

              {/* 2. Dropdown Model Dinamis dari API Provider */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label className="block text-sm font-semibold text-zinc-800">
                    Model AI yang Digunakan
                  </label>
                  <span className="text-xs text-zinc-500">
                    {models.length > 0
                      ? `${models.length} model terdeteksi dari ${providerLabel}`
                      : "Deteksi model otomatis setelah Cek API"}
                  </span>
                </div>

                <EarthySelect
                  value={model}
                  onChange={setModel}
                  searchable={models.length > 6}
                  searchPlaceholder="Cari model (mis. flash, pro, gpt-4o, llama, claude)..."
                  maxHeight={280}
                  options={
                    modelOptions.length > 0
                      ? modelOptions
                      : [
                        {
                          value: model,
                          label: `${model} — klik "Cek API" untuk memuat semua model dari key Anda`,
                        },
                      ]
                  }
                  style={{ width: "100%", padding: "0.625rem 0.9rem" }}
                />
              </div>

              {/* 3. Prompt Sistem Terarah (Customer Service + Asisten Mitra) */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label className="block text-sm font-semibold text-zinc-800">
                    Prompt Sistem / Instruksi Default (Customer Service &amp; Asisten Mitra)
                  </label>
                  {defaultPrompt && (
                    <button
                      type="button"
                      onClick={handleResetPrompt}
                      className="text-xs font-medium text-clay hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowCounterClockwise size={13} />
                      Gunakan Prompt Standar Detail
                    </button>
                  )}
                </div>

                <textarea
                  rows={10}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Tulis instruksi detail untuk peran Customer Service dan Asisten Mitra DinoyoCraft..."
                  className="w-full px-4 py-3 rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm leading-relaxed"
                />

                <div className="mt-2.5 p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 leading-relaxed">
                  <strong className="text-zinc-800">Guardrail Keamanan Topik Aktif Otomatis:</strong>{" "}
                  Di server, instruksi ini dilapisi batasan ketat sehingga bot secara otomatis menolak pertanyaan di luar platform DinoyoCraft—termasuk umpan campuran (<em>sandwich</em>) seperti menyelipkan <em>copas kode error</em> atau tugas non-keramik di tengah pertanyaan harga produk.
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium text-sm disabled:opacity-60 cursor-pointer"
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
                <p className="text-xs text-zinc-500 mt-0.5">
                  Berlaku untuk ClayBot, Bot Toko &amp; Asisten Mitra
                </p>
              </div>
              <button
                type="button"
                onClick={toggleAi}
                className="text-zinc-400 hover:text-clay transition-colors cursor-pointer"
                aria-label="Toggle Auto-Reply AI"
              >
                {aiEnabled ? (
                  <ToggleRight size={40} weight="fill" className="text-clay" />
                ) : (
                  <ToggleLeft size={40} weight="fill" />
                )}
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Status Koneksi Real */}
              <div className="flex items-start gap-3">
                {connectionStatus === "valid" ? (
                  <ShieldCheck size={18} weight="fill" className="text-emerald-600 mt-0.5 shrink-0" />
                ) : connectionStatus === "invalid" ? (
                  <WarningCircle size={18} weight="fill" className="text-red-600 mt-0.5 shrink-0" />
                ) : connectionStatus === "checking" ? (
                  <ArrowsClockwise size={18} className="text-zinc-500 mt-0.5 shrink-0 animate-spin" />
                ) : (
                  <ShieldWarning size={18} weight="fill" className="text-amber-600 mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium text-zinc-800">
                    {connectionStatus === "valid"
                      ? `Koneksi API Normal (${providerLabel})`
                      : connectionStatus === "checking"
                        ? "Memeriksa Koneksi API..."
                        : connectionStatus === "invalid"
                          ? "Koneksi API Tidak Valid"
                          : "API Key Belum Terhubung"}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {connectionStatus === "valid"
                      ? `Ping ${latencyMs}ms • Model aktif: ${model}`
                      : connectionStatus === "invalid"
                        ? connectionMessage || "Silakan periksa kembali API Key Anda."
                        : connectionStatus === "checking"
                          ? "Sedang menguji konektivitas & mengambil daftar model."
                          : "Tempel API Key dan tekan Cek API untuk mengaktifkan LLM."}
                  </p>
                </div>
              </div>

              {/* Sinkronisasi Katalog Real */}
              <div className="flex items-start gap-3">
                <ShieldCheck size={18} weight="fill" className="text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-zinc-800">Konteks Katalog Tersinkron</p>
                  <p className="text-xs text-zinc-500">
                    {catalogCount} produk keramik &amp; {storeCount} toko mitra siap dijadikan referensi jawaban AI.
                  </p>
                </div>
              </div>

              {/* Guardrail Aktif */}
              <div className="flex items-start gap-3">
                <ShieldCheck size={18} weight="fill" className="text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-zinc-800">Batasan Topik Platform Aktif</p>
                  <p className="text-xs text-zinc-500">
                    Menolak otomatis pertanyaan di luar platform, kode/error programming, dan prompt injection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
