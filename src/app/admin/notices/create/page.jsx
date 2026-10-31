
"use client";

import { useState } from "react";
import {
  BellPlus,
  CalendarDays,
  Upload,
  Save,
  Users,
  FileText,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const categories = ["General", "Exam", "Holiday", "Fee", "Event"];
const audiences = ["All Students", "Teachers", "Staff", "Parents"];

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

export default function CreateNoticePage() {
  const [form, setForm] = useState({
    title: "",
    category: "General",
    audience: "All Students",
    publishDate: new Date().toLocaleDateString("en-CA"),
    expiryDate: "",
    description: "",
  });

  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: "error",
        text: "Sirf PDF, PNG, JPG aur JPEG files upload kar sakte hain.",
      });
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "File ka size 5 MB se kam hona chahiye.",
      });
      e.target.value = "";
      return;
    }

    setAttachment(file);
    setMessage(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (!form.title.trim()) {
      setMessage({ type: "error", text: "Notice title enter karein." });
      return;
    }

    if (!form.description.trim()) {
      setMessage({
        type: "error",
        text: "Notice description enter karein.",
      });
      return;
    }

    if (
      form.expiryDate &&
      form.publishDate &&
      form.expiryDate < form.publishDate
    ) {
      setMessage({
        type: "error",
        text: "Expiry date, publish date se pehle nahi ho sakti.",
      });
      return;
    }

    const data = new FormData();

    data.append("title", form.title.trim());
    data.append("category", form.category);
    data.append("audience", form.audience);
    data.append("publishDate", form.publishDate);
    data.append("description", form.description.trim());
    data.append("status", "Active");

    if (form.expiryDate) {
      data.append("expiryDate", form.expiryDate);
    }

    if (attachment) {
      data.append("attachment", attachment);
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/notices`, {
        method: "POST",
        body: data,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || result?._status === false) {
        throw new Error(
          result?._message ||
            result?.message ||
            `Notice save nahi hua. HTTP ${response.status}`
        );
      }

      setMessage({
        type: "success",
        text: result?._message || "Notice successfully publish ho gaya!",
      });

      setForm({
        title: "",
        category: "General",
        audience: "All Students",
        publishDate: new Date().toLocaleDateString("en-CA"),
        expiryDate: "",
        description: "",
      });

      setAttachment(null);

      const fileInput = document.getElementById("notice-attachment");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.message === "Failed to fetch"
            ? "Backend se connection nahi ho raha. Server aur CORS settings check karein."
            : error.message || "Notice save karte waqt error aaya.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white shadow-lg sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <BellPlus size={28} />
          </div>

          <div>
            <h1 className="text-2xl font-black sm:text-3xl">
              Create New Notice
            </h1>
            <p className="mt-2 text-sm text-indigo-100">
              Publish announcements for students, teachers and staff.
            </p>
          </div>
        </div>
      </div>

      {/* Notification */}
      {message && (
        <div
          role="alert"
          className={`flex items-start gap-3 rounded-xl border p-4 ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="mt-0.5 shrink-0" size={20} />
          ) : (
            <AlertCircle className="mt-0.5 shrink-0" size={20} />
          )}

          <p className="flex-1 text-sm font-medium">{message.text}</p>

          <button
            type="button"
            onClick={() => setMessage(null)}
            aria-label="Dismiss message"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
          <h2 className="font-bold text-slate-800">Notice Information</h2>
          <p className="mt-1 text-sm text-slate-500">
            Fill in the details below to publish your notice.
          </p>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          {/* Title */}
          <div>
            <label
              htmlFor="notice-title"
              className="text-sm font-bold text-slate-700"
            >
              Notice Title <span className="text-red-500">*</span>
            </label>

            <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
              <BellPlus size={19} className="shrink-0 text-indigo-600" />

              <input
                id="notice-title"
                name="title"
                value={form.title}
                onChange={handleChange}
                maxLength={200}
                required
                placeholder="Enter notice title"
                className="w-full py-3 outline-none"
              />
            </div>
          </div>

          {/* Category and Audience */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="notice-category"
                className="text-sm font-bold text-slate-700"
              >
                Category
              </label>

              <select
                id="notice-category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className={inputClass}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="notice-audience"
                className="text-sm font-bold text-slate-700"
              >
                Audience
              </label>

              <div className="relative">
                <Users
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600"
                />

                <select
                  id="notice-audience"
                  name="audience"
                  value={form.audience}
                  onChange={handleChange}
                  className={`${inputClass} pl-11`}
                >
                  {audiences.map((audience) => (
                    <option key={audience} value={audience}>
                      {audience}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="publish-date"
                className="text-sm font-bold text-slate-700"
              >
                Publish Date <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <CalendarDays
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600"
                />

                <input
                  id="publish-date"
                  type="date"
                  name="publishDate"
                  value={form.publishDate}
                  onChange={handleChange}
                  required
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="expiry-date"
                className="text-sm font-bold text-slate-700"
              >
                Expiry Date
              </label>

              <div className="relative">
                <CalendarDays
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                />

                <input
                  id="expiry-date"
                  type="date"
                  name="expiryDate"
                  value={form.expiryDate}
                  min={form.publishDate || undefined}
                  onChange={handleChange}
                  className={`${inputClass} pl-11`}
                />
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Optional: notice kab expire hoga.
              </p>
            </div>
          </div>

          {/* Attachment */}
          <div>
            <label
              htmlFor="notice-attachment"
              className="text-sm font-bold text-slate-700"
            >
              Attachment <span className="font-normal text-slate-400">(Optional)</span>
            </label>

            <label
              htmlFor="notice-attachment"
              className="mt-2 flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-slate-200 p-5 transition hover:border-indigo-400 hover:bg-indigo-50/40"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Upload size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-700">
                  {attachment ? attachment.name : "Choose a file to upload"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  PDF, PNG, JPG or JPEG · Maximum 5 MB
                </p>
              </div>

              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600">
                Browse
              </span>

              <input
                id="notice-attachment"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>

            {attachment && (
              <button
                type="button"
                onClick={() => {
                  setAttachment(null);
                  const fileInput = document.getElementById(
                    "notice-attachment"
                  );
                  if (fileInput) fileInput.value = "";
                }}
                className="mt-2 text-sm font-semibold text-red-600 hover:text-red-700"
              >
                Remove attachment
              </button>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="notice-description"
              className="text-sm font-bold text-slate-700"
            >
              Notice Description <span className="text-red-500">*</span>
            </label>

            <div className="mt-2 flex items-start gap-3 rounded-xl border border-slate-200 p-4 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
              <FileText
                size={20}
                className="mt-1 shrink-0 text-purple-600"
              />

              <textarea
                id="notice-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={6}
                required
                placeholder="Write complete notice details here..."
                className="w-full resize-y text-sm leading-6 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-xs text-slate-500">
            <span className="text-red-500">*</span> Required fields
          </p>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle size={19} className="animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Save size={19} />
                Publish Notice
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
