
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookPlus, Save } from "lucide-react";
import { libraryApi } from "@/lib/libraryApi";

const initialForm = {
  bookName: "",
  author: "",
  isbn: "",
  category: "Academic",
  publisher: "",
  quantity: "1",
  rackNumber: "",
  coverImage: "",
  description: "",
};

export default function CreateBookPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField(e) {
    const { name, value } = e.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await libraryApi.createBook({
        ...form,
        quantity: Number(form.quantity),
      });
      setSuccess("Book successfully add ho gayi.");
      setForm(initialForm);
      setTimeout(() => router.push("/admin/library"), 700);
    } catch (err) {
      setError(err.message || "Book save nahi hui.");
    } finally {
      setSaving(false);
    }
  }

  const fieldClass = "mt-1 w-full border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-emerald-700";
  const labelClass = "block text-sm font-medium text-slate-700";

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-8">
      <div className="mx-auto max-w-4xl">
<Link href="/admin/library" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-800 hover:underline">          <ArrowLeft size={17} /> Back to Library
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <div className="bg-emerald-100 p-3 text-emerald-800"><BookPlus size={25} /></div>
          <div>
            <h1 className="text-2xl font-bold">Add New Book</h1>
            <p className="text-sm text-slate-500">Enter the book details below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          {error && <p role="alert" className="bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {success && <p className="bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p>}

          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>
              Book Name *
              <input name="bookName" value={form.bookName} onChange={updateField} className={fieldClass} required />
            </label>
            <label className={labelClass}>
              Author *
              <input name="author" value={form.author} onChange={updateField} className={fieldClass} required />
            </label>
            <label className={labelClass}>
              ISBN
              <input name="isbn" value={form.isbn} onChange={updateField} className={fieldClass} />
            </label>
            <label className={labelClass}>
              Category *
              <select name="category" value={form.category} onChange={updateField} className={fieldClass} required>
                <option value="Academic">Academic</option>
                <option value="Science">Science</option>
                <option value="Literature">Literature</option>
                <option value="Language">Language</option>
                <option value="Reference">Reference</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label className={labelClass}>
              Publisher
              <input name="publisher" value={form.publisher} onChange={updateField} className={fieldClass} />
            </label>
            <label className={labelClass}>
              Quantity *
              <input name="quantity" type="number" min="1" step="1" value={form.quantity} onChange={updateField} className={fieldClass} required />
            </label>
            <label className={labelClass}>
              Rack Number
              <input name="rackNumber" value={form.rackNumber} onChange={updateField} className={fieldClass} placeholder="e.g. A-01" />
            </label>
            <label className={labelClass}>
              Cover Image URL
              <input name="coverImage" type="url" value={form.coverImage} onChange={updateField} className={fieldClass} placeholder="https://..." />
            </label>
          </div>

          <label className={labelClass}>
            Description
            <textarea name="description" value={form.description} onChange={updateField} rows={4} className={fieldClass} />
          </label>

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
           <Link href="/admin/library" className="border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50">Cancel</Link>
            <button disabled={saving} className="inline-flex items-center gap-2 bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
              <Save size={17} /> {saving ? "Saving..." : "Save Book"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
