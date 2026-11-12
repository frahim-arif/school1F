
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, ImagePlus, LoaderCircle, AlertCircle } from "lucide-react";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com").replace(/\/$/, "");
const ROOT = BASE.endsWith("/api") ? BASE : `${BASE}/api`;
const API = `${ROOT}/gallery`;

const inputClass = "w-full border border-[#e4ddcf] bg-white px-3 py-3 text-sm outline-none focus:border-[#a48b4e]";
const categories = ["Events", "Classroom", "Sports", "Celebrations", "Activities", "Documents", "Other"];
const today = () => new Date().toISOString().slice(0, 10);

export default function CreateGalleryItemPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", category: "Events", eventDate: today(), isPublished: true });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function chooseFile(e) {
    const selected = e.target.files?.[0];
    e.target.value = "";
    if (!selected) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"].includes(selected.type)) {
      setError("Sirf JPG, PNG, WEBP, GIF aur PDF allowed hain.");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError("File maximum 10 MB honi chahiye.");
      return;
    }
    setError("");
    setFile(selected);
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!file) { setError("Image ya PDF select karein."); return; }
    setSaving(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, String(value)));
      payload.append("file", file);
      const response = await fetch(API, { method: "POST", body: payload });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) throw new Error(data.message || `Upload failed (${response.status})`);
      setSuccess("Gallery item successfully uploaded.");
      setTimeout(() => router.push("/admin/gallery/photos"), 700);
    } catch (e) {
      setError(`${e.message}. Backend/API URL check karein.`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf8f3] p-4 text-[#20332d] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="bg-gradient-to-r from-[#071c19] via-[#0b302a] to-[#17483b] p-6 text-white sm:p-8">
          <Link href="/admin/gallery" className="mb-4 inline-flex items-center gap-2 text-sm text-white/75 hover:text-white"><ArrowLeft size={16} /> Gallery Dashboard</Link>
          <h1 className="text-3xl font-black">Add Gallery Item</h1>
          <p className="mt-2 text-sm text-white/75">Upload a school photo or PDF document.</p>
        </header>

        {error && <p role="alert" className="flex items-center gap-2 border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={17} />{error}</p>}
        {success && <p role="status" className="border border-green-200 bg-green-50 p-3 text-sm text-green-800">{success}</p>}

        <form onSubmit={submit} className="space-y-5 border border-[#e8dfce] bg-white p-5 sm:p-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold">Title *
              <input className={inputClass} required maxLength={150} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Annual Function 2026" />
            </label>
            <label className="space-y-2 text-sm font-semibold">Category
              <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm font-semibold">Event Date
              <input type="date" className={inputClass} value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
            </label>
          </div>

          <label className="block space-y-2 text-sm font-semibold">Description
            <textarea className={inputClass} rows={4} maxLength={1000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Event ya document ke baare mein..." />
          </label>

          <div className="border-2 border-dashed border-[#d9ceb6] bg-[#fcfaf5] p-6 text-center">
            <input id="gallery-upload" type="file" className="hidden" accept=".jpg,.jpeg,.png,.webp,.gif,.pdf" onChange={chooseFile} />
            <label htmlFor="gallery-upload" className="flex cursor-pointer flex-col items-center">
              <span className="mb-3 bg-[#eee6d3] p-4 text-[#806a35]"><Upload size={28} /></span>
              <span className="font-bold">Choose image or PDF *</span>
              <span className="mt-1 text-xs text-gray-500">JPG, PNG, WEBP, GIF or PDF · Max 10 MB</span>
            </label>
            {file && <p className="mt-4 break-all text-sm font-semibold">{file.name} · {(file.size / 1048576).toFixed(2)} MB</p>}
            {preview && (file?.type === "application/pdf"
              ? <iframe src={preview} title="PDF preview" className="mt-4 h-72 w-full border" />
              : <img src={preview} alt="Preview" className="mx-auto mt-4 max-h-72 object-contain" />)}
            {!file && <ImagePlus size={26} className="mx-auto mt-4 text-gray-400" />}
          </div>

          <label className="flex items-center gap-3 border p-3 text-sm">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="h-4 w-4 accent-[#0b302a]" />
            Publish on public gallery
          </label>

          <div className="flex flex-wrap gap-3">
            <button disabled={saving} className="inline-flex items-center gap-2 bg-[#0b302a] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
              {saving && <LoaderCircle size={17} className="animate-spin" />}
              {saving ? "Uploading..." : "Upload Media"}
            </button>
            <Link href="/admin/gallery/photos" className="border px-5 py-3 text-sm font-semibold">Cancel</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
