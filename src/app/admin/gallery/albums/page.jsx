
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, RefreshCw, Images, Trash2, LoaderCircle } from "lucide-react";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
const ROOT = BASE.endsWith("/api") ? BASE : `${BASE}/api`;
const API = `${ROOT}/gallery/albums`;

export default function GalleryAlbumsPage() {
  const [albums, setAlbums] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", eventDate: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) throw new Error(data.message || `Albums API unavailable (${response.status})`);
      setAlbums(Array.isArray(data.albums) ? data.albums : Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      setError(`${e.message}. Backend mein GET /api/gallery/albums route check karein.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function createAlbum(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) throw new Error(data.message || `Create failed (${response.status})`);
      setForm({ name: "", description: "", eventDate: "" });
      setNotice("Album created.");
      await load();
    } catch (e) {
      setError(`${e.message}. Backend mein POST /api/gallery/albums route check karein.`);
    } finally {
      setSaving(false);
    }
  }

  async function deleteAlbum(album) {
    if (!window.confirm(`"${album.name || album.title}" delete karna hai?`)) return;
    setBusyId(album._id);
    setError("");
    try {
      const response = await fetch(`${API}/${album._id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) throw new Error(data.message || "Delete failed");
      setNotice("Album deleted.");
      await load();
    } catch (e) {
      setError(`${e.message}. Backend mein DELETE /api/gallery/albums/:id route check karein.`);
    } finally {
      setBusyId("");
    }
  }

  return (
    <main className="min-h-screen bg-[#faf8f3] p-4 text-[#20332d] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="bg-gradient-to-r from-[#071c19] via-[#0b302a] to-[#17483b] p-6 text-white sm:p-8">
          <Link href="/admin/gallery" className="mb-4 inline-flex items-center gap-2 text-sm text-white/75"><ArrowLeft size={16} /> Gallery Dashboard</Link>
          <h1 className="text-3xl font-black">Gallery Albums</h1>
          <p className="mt-2 text-sm text-white/75">Organize school memories into albums.</p>
        </header>

        {notice && <p role="status" className="border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
        {error && <p role="alert" className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <form onSubmit={createAlbum} className="grid gap-4 border border-[#e8dfce] bg-white p-5 md:grid-cols-2">
          <h2 className="text-lg font-bold md:col-span-2">Create Album</h2>
          <input required maxLength={150} className="border p-3 text-sm" placeholder="Album name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input type="date" className="border p-3 text-sm" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
          <textarea className="border p-3 text-sm md:col-span-2" rows={3} placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button disabled={saving} className="inline-flex items-center justify-center gap-2 bg-[#0b302a] px-5 py-3 text-sm font-bold text-white disabled:opacity-50 md:col-span-2">
            {saving ? <LoaderCircle size={16} className="animate-spin" /> : <Plus size={16} />} Create Album
          </button>
        </form>

        <section className="border border-[#e8dfce] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">All Albums ({albums.length})</h2>
            <button onClick={load} disabled={loading} className="inline-flex items-center gap-2 border px-3 py-2 text-sm"><RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh</button>
          </div>
          {loading ? <p className="py-8 text-center text-gray-500">Loading albums...</p> : albums.length === 0 ? (
            <div className="py-10 text-center"><Images size={36} className="mx-auto text-[#a08d66]" /><p className="mt-3 font-semibold">No albums found</p></div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((album) => <article key={album._id} className="flex items-start justify-between gap-3 border border-[#e8dfce] p-4">
                <div><h3 className="font-bold">{album.name || album.title}</h3><p className="mt-1 text-sm text-gray-500">{album.description || "No description"}</p>{album.eventDate && <p className="mt-2 text-xs text-gray-500">{new Date(album.eventDate).toLocaleDateString("en-IN")}</p>}</div>
                <button disabled={busyId === album._id} onClick={() => deleteAlbum(album)} aria-label="Delete album" className="border border-red-100 p-2 text-red-600 disabled:opacity-50">{busyId === album._id ? <LoaderCircle size={16} className="animate-spin" /> : <Trash2 size={16} />}</button>
              </article>)}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
