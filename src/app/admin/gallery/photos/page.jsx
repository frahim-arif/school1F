
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Search, RefreshCw, ImagePlus, Trash2, Eye, EyeOff,
  LoaderCircle, Images, Plus, FileText, AlertCircle,
} from "lucide-react";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com")
  .replace(/\/$/, "");
const ROOT = BASE.endsWith("/api") ? BASE : `${BASE}/api`;
const API = `${ROOT}/gallery`;
const ORIGIN = BASE.replace(/\/api$/, "");

function fileUrl(url) {
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : `${ORIGIN}/${url.replace(/^\/+/, "")}`;
}

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  return data;
}

export default function GalleryPhotosPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (category !== "All") params.set("category", category);
      const response = await fetch(`${API}${params.size ? `?${params}` : ""}`, {
        cache: "no-store",
      });
      const data = await readResponse(response);
      setItems(Array.isArray(data.gallery) ? data.gallery : Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      setError(`${e.message}. Backend/API URL check karein.`);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => { load(); }, [load]);

  async function updateItem(item, changes) {
    setBusyId(item._id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${API}/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      await readResponse(response);
      setNotice("Gallery item updated.");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId("");
    }
  }

  async function removeItem(item) {
    if (!window.confirm(`"${item.title}" delete karna hai?`)) return;
    setBusyId(item._id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${API}/${item._id}`, { method: "DELETE" });
      await readResponse(response);
      setNotice("Gallery item deleted.");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId("");
    }
  }

  return (
    <main className="min-h-screen bg-[#faf8f3] p-4 text-[#20332d] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 bg-gradient-to-r from-[#071c19] via-[#0b302a] to-[#17483b] p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="mb-2 text-xs font-bold tracking-widest text-[#c8ae6a]">SCHOOL MEDIA</p>
            <h1 className="text-3xl font-black">All Photos & Videos</h1>
            <p className="mt-2 text-sm text-white/70">Search and manage your gallery items.</p>
          </div>
          <Link href="/admin/gallery/create" className="inline-flex items-center justify-center gap-2 bg-[#c8ae6a] px-5 py-3 text-sm font-bold text-[#071c19]">
            <Plus size={18} /> Add Gallery Item
          </Link>
        </header>

        {notice && <p role="status" className="border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
        {error && <p role="alert" className="flex items-center gap-2 border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={17} />{error}</p>}

        <section className="flex flex-col gap-3 border border-[#e8dfce] bg-white p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title or description..." className="w-full border border-[#e4ddcf] py-3 pl-10 pr-3 text-sm outline-none focus:border-[#a48b4e]" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="border border-[#e4ddcf] px-3 py-3 text-sm">
            {["All", "Events", "Classroom", "Sports", "Celebrations", "Activities", "Documents", "Other"].map((c) => <option key={c}>{c}</option>)}
          </select>
          <button onClick={load} disabled={loading} className="inline-flex items-center justify-center gap-2 border px-4 py-3 text-sm font-semibold disabled:opacity-50">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </section>

        {loading ? (
          <div className="flex min-h-40 items-center justify-center gap-2 text-gray-500"><LoaderCircle className="animate-spin" /> Loading gallery...</div>
        ) : items.length === 0 ? (
          <div className="border border-dashed border-[#d8cdb7] bg-white p-12 text-center">
            <Images className="mx-auto text-[#a08d66]" size={42} />
            <h2 className="mt-4 font-bold">No gallery items found</h2>
            <p className="mt-2 text-sm text-gray-500">Try another search or add your first item.</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const url = fileUrl(item.fileUrl);
              const isPdf = item.fileType === "pdf" || item.mimeType === "application/pdf" || /\.pdf(?:$|\?)/i.test(item.fileUrl || "");
              return (
                <article key={item._id} className="overflow-hidden border border-[#e8dfce] bg-white shadow-sm">
                  <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-[#f1eee5]">
                    {isPdf ? <div className="text-center"><FileText size={42} className="mx-auto text-red-600" /><p className="mt-2 text-sm font-semibold">PDF Document</p>{url && <a href={url} target="_blank" rel="noreferrer" className="text-sm text-blue-700 underline">Open PDF</a>}</div> :
                      url ? <img src={url} alt={item.title || "Gallery item"} className="h-full w-full object-cover" /> :
                      <ImagePlus size={38} className="text-gray-400" />}
                    <span className={`absolute left-3 top-3 px-3 py-1 text-xs font-bold ${item.isPublished === false ? "bg-gray-800 text-white" : "bg-green-100 text-green-800"}`}>
                      {item.isPublished === false ? "Hidden" : "Published"}
                    </span>
                  </div>
                  <div className="space-y-3 p-4">
                    <p className="text-xs font-bold uppercase text-[#987c43]">{item.category || "Other"}</p>
                    <h2 className="break-words text-lg font-bold">{item.title}</h2>
                    {item.description && <p className="line-clamp-2 text-sm text-gray-500">{item.description}</p>}
                    <div className="grid grid-cols-2 gap-2 border-t pt-3">
                      <button disabled={busyId === item._id} onClick={() => updateItem(item, { isPublished: item.isPublished === false })} className="inline-flex items-center justify-center gap-2 border px-2 py-2 text-xs font-semibold disabled:opacity-50">
                        {item.isPublished === false ? <Eye size={14} /> : <EyeOff size={14} />}
                        {item.isPublished === false ? "Publish" : "Hide"}
                      </button>
                      <button disabled={busyId === item._id} onClick={() => removeItem(item)} className="inline-flex items-center justify-center gap-2 border border-red-100 px-2 py-2 text-xs font-semibold text-red-600 disabled:opacity-50">
                        {busyId === item._id ? <LoaderCircle size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
