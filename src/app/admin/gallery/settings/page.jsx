
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Save, LoaderCircle, Settings2 } from "lucide-react";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com").replace(/\/$/, "");
const ROOT = BASE.endsWith("/api") ? BASE : `${BASE}/api`;
const API = `${ROOT}/gallery/settings`;

const DEFAULTS = {
  galleryTitle: "School Gallery",
  description: "",
  itemsPerPage: 12,
  allowPublicViewing: true,
  showEventDates: true,
};

export default function GallerySettingsPage() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) throw new Error(data.message || `Settings API unavailable (${response.status})`);
      setSettings({ ...DEFAULTS, ...(data.settings || data.data || {}) });
    } catch (e) {
      setError(`${e.message}. Backend mein GET /api/gallery/settings route check karein.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(API, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) throw new Error(data.message || `Save failed (${response.status})`);
      setSettings({ ...DEFAULTS, ...(data.settings || data.data || settings) });
      setNotice("Gallery settings saved successfully.");
    } catch (e) {
      setError(`${e.message}. Backend mein PUT /api/gallery/settings route aur schema check karein.`);
    } finally {
      setSaving(false);
    }
  }

  function change(key, value) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="min-h-screen bg-[#faf8f3] p-4 text-[#20332d] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="bg-gradient-to-r from-[#071c19] via-[#0b302a] to-[#17483b] p-6 text-white sm:p-8">
          <Link href="/admin/gallery" className="mb-4 inline-flex items-center gap-2 text-sm text-white/75"><ArrowLeft size={16} /> Gallery Dashboard</Link>
          <div className="flex items-center gap-3"><Settings2 size={28} className="text-[#c8ae6a]" /><h1 className="text-3xl font-black">Gallery Settings</h1></div>
          <p className="mt-2 text-sm text-white/75">Configure the gallery display options.</p>
        </header>

        {notice && <p role="status" className="border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
        {error && <p role="alert" className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        {loading ? (
          <div className="flex justify-center gap-2 py-12 text-gray-500"><LoaderCircle className="animate-spin" /> Loading settings...</div>
        ) : (
          <form onSubmit={save} className="space-y-5 border border-[#e8dfce] bg-white p-5 sm:p-7">
            <label className="block space-y-2 text-sm font-semibold">Gallery Title
              <input required maxLength={150} value={settings.galleryTitle} onChange={(e) => change("galleryTitle", e.target.value)} className="w-full border border-[#e4ddcf] px-3 py-3 font-normal outline-none focus:border-[#a48b4e]" />
            </label>

            <label className="block space-y-2 text-sm font-semibold">Gallery Description
              <textarea rows={4} maxLength={1000} value={settings.description} onChange={(e) => change("description", e.target.value)} className="w-full border border-[#e4ddcf] px-3 py-3 font-normal outline-none focus:border-[#a48b4e]" placeholder="Public gallery ke liye description..." />
            </label>

            <label className="block space-y-2 text-sm font-semibold">Items Per Page
              <input type="number" min="1" max="100" required value={settings.itemsPerPage} onChange={(e) => change("itemsPerPage", Number(e.target.value))} className="w-full border border-[#e4ddcf] px-3 py-3 font-normal outline-none focus:border-[#a48b4e]" />
            </label>

            <div className="space-y-3 border-t border-gray-100 pt-4">
              <label className="flex items-center gap-3 border p-3 text-sm">
                <input type="checkbox" checked={Boolean(settings.allowPublicViewing)} onChange={(e) => change("allowPublicViewing", e.target.checked)} className="h-4 w-4 accent-[#0b302a]" />
                Allow public viewing of the gallery
              </label>
              <label className="flex items-center gap-3 border p-3 text-sm">
                <input type="checkbox" checked={Boolean(settings.showEventDates)} onChange={(e) => change("showEventDates", e.target.checked)} className="h-4 w-4 accent-[#0b302a]" />
                Show event dates on gallery items
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <button disabled={saving} className="inline-flex items-center gap-2 bg-[#0b302a] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
                {saving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />} Save Settings
              </button>
              <button type="button" onClick={load} disabled={saving} className="inline-flex items-center gap-2 border px-5 py-3 text-sm font-semibold"><RefreshCw size={16} /> Reload</button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
