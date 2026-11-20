
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  Search,
  Plus,
  Pencil,
  Trash2,
  PartyPopper,
  RefreshCw,
  X,
  FileText,
  ImagePlus,
  ExternalLink,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/+$/, "");

const API_URL = API_BASE.endsWith("/api")
  ? `${API_BASE}/holidays`
  : `${API_BASE}/api/holidays`;

const initialForm = {
  title: "",
  date: "",
  type: "National Holiday",
  description: "",
};

const holidayTypes = [
  "National Holiday",
  "Festival Holiday",
  "School Event",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function getDay(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });
}

function getFileUrl(value) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;

  const origin = API_BASE.replace(/\/api$/, "");
  return `${origin}${value.startsWith("/") ? "" : "/"}${value}`;
}

export default function HolidaysPage() {
  const [search, setSearch] = useState("");
  const [holidays, setHolidays] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    upcoming: 0,
    thisMonth: 0,
    events: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [removePdf, setRemovePdf] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);

  const fetchHolidays = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to load holidays");
      }

      const list = Array.isArray(data.holidays) ? data.holidays : [];

      setHolidays(list);
      setSummary({
        total: data.summary?.total ?? list.length,
        upcoming: data.summary?.upcoming ?? 0,
        thisMonth: data.summary?.thisMonth ?? 0,
        events: data.summary?.events ?? 0,
      });
    } catch (err) {
      setError(err.message || "Backend se connect nahi ho raha.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const resetAttachments = () => {
    setPdfFile(null);
    setImageFile(null);
    setExistingPdfUrl("");
    setExistingImageUrl("");
    setRemovePdf(false);
    setRemoveImage(false);
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm({ ...initialForm });
    resetAttachments();
    setMessage("");
    setError("");
    setShowForm(true);
  };

  const openEditForm = (holiday) => {
    setEditingId(holiday._id);
    setForm({
      title: holiday.title || "",
      date: holiday.date
        ? new Date(holiday.date).toISOString().slice(0, 10)
        : "",
      type: holiday.type || "National Holiday",
      description: holiday.description || "",
    });

    setPdfFile(null);
    setImageFile(null);
    setExistingPdfUrl(holiday.pdfUrl || "");
    setExistingImageUrl(holiday.imageUrl || "");
    setRemovePdf(false);
    setRemoveImage(false);
    setMessage("");
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...initialForm });
    resetAttachments();
  };

  const validateFile = (file, kind) => {
    if (!file) return "";

    if (file.size > MAX_FILE_SIZE) {
      return `${kind} maximum 5 MB ki honi chahiye.`;
    }

    if (kind === "PDF") {
      if (
        file.type !== "application/pdf" ||
        !file.name.toLowerCase().endsWith(".pdf")
      ) {
        return "Sirf PDF file upload karein.";
      }
    } else if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    ) {
      return "Image JPG, PNG ya WebP format mein honi chahiye.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const pdfError = validateFile(pdfFile, "PDF");
      const imageError = validateFile(imageFile, "Image");

      if (pdfError || imageError) {
        throw new Error(pdfError || imageError);
      }

      const body = new FormData();
      body.append("title", form.title.trim());
      body.append("date", form.date);
      body.append("type", form.type);
      body.append("description", form.description.trim());

      if (pdfFile) body.append("pdf", pdfFile);
      if (imageFile) body.append("image", imageFile);

      body.append("removePdf", String(removePdf));
      body.append("removeImage", String(removeImage));

      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? "PUT" : "POST",
          body,
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to save holiday");
      }

      const wasEditing = Boolean(editingId);
      closeForm();
      setMessage(
        wasEditing
          ? "Holiday updated successfully."
          : "Holiday added successfully."
      );

      await fetchHolidays();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (holiday) => {
    if (!window.confirm(`Delete "${holiday.title}" holiday?`)) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${holiday._id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to delete holiday");
      }

      setMessage("Holiday deleted successfully.");
      await fetchHolidays();
    } catch (err) {
      setError(err.message || "Delete failed.");
    }
  };

  const filteredHoliday = holidays.filter((item) =>
    `${item.title} ${item.type} ${item.description || ""}`
      .toLowerCase()
      .includes(search.toLowerCase().trim())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Holiday Management
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage school holidays, events, PDFs and images
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={fetchHolidays}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openAddForm}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700"
          >
            <Plus size={18} />
            Add Holiday
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl border bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-800">
                {editingId ? "Edit Holiday" : "Add Holiday"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                PDF aur image optional hain.
              </p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close form"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Holiday Name *
                </label>
                <input
                  required
                  maxLength={120}
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="e.g. Independence Day"
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Date *
                </label>
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({ ...form, date: e.target.value })
                  }
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Holiday Type *
                </label>
                <select
                  required
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value })
                  }
                  className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  {holidayTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Description
                </label>
                <input
                  maxLength={500}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Optional details"
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <FileText size={20} className="text-indigo-600" />
                  <label className="text-sm font-bold text-slate-700">
                    Holiday PDF (Optional)
                  </label>
                </div>

                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    const validationError = validateFile(file, "PDF");

                    if (validationError) {
                      setError(validationError);
                      e.target.value = "";
                      setPdfFile(null);
                      return;
                    }

                    setError("");
                    setPdfFile(file);
                    if (file) setRemovePdf(false);
                  }}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-2 file:font-semibold file:text-white"
                />

                <p className="mt-2 text-xs text-slate-500">
                  PDF, maximum 5 MB.
                </p>

                {existingPdfUrl && !removePdf && (
                  <a
                    href={getFileUrl(existingPdfUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700"
                  >
                    <ExternalLink size={15} />
                    View existing PDF
                  </a>
                )}

                {pdfFile && (
                  <p className="mt-2 break-all text-xs text-green-700">
                    Selected: {pdfFile.name}
                  </p>
                )}

                {editingId && existingPdfUrl && (
                  <label className="mt-3 flex items-center gap-2 text-xs text-red-700">
                    <input
                      type="checkbox"
                      checked={removePdf}
                      onChange={(e) => {
                        setRemovePdf(e.target.checked);
                        if (e.target.checked) setPdfFile(null);
                      }}
                    />
                    Remove existing PDF
                  </label>
                )}
              </div>

              <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ImagePlus size={20} className="text-emerald-600" />
                  <label className="text-sm font-bold text-slate-700">
                    Holiday Image (Optional)
                  </label>
                </div>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    const validationError = validateFile(file, "Image");

                    if (validationError) {
                      setError(validationError);
                      e.target.value = "";
                      setImageFile(null);
                      return;
                    }

                    setError("");
                    setImageFile(file);
                    if (file) setRemoveImage(false);
                  }}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-3 file:py-2 file:font-semibold file:text-white"
                />

                <p className="mt-2 text-xs text-slate-500">
                  JPG, PNG or WebP, maximum 5 MB.
                </p>

                {existingImageUrl && !removeImage && (
                  <div className="mt-3 space-y-2">
                    <img
                      src={getFileUrl(existingImageUrl)}
                      alt="Existing holiday"
                      className="h-28 w-auto rounded-lg border object-cover"
                    />
                    <a
                      href={getFileUrl(existingImageUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"
                    >
                      <ExternalLink size={15} />
                      View existing image
                    </a>
                  </div>
                )}

                {imageFile && (
                  <div className="mt-3 space-y-2">
                    <p className="break-all text-xs text-green-700">
                      Selected: {imageFile.name}
                    </p>
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Selected holiday preview"
                      className="h-28 w-auto rounded-lg border object-cover"
                    />
                  </div>
                )}

                {editingId && existingImageUrl && (
                  <label className="mt-3 flex items-center gap-2 text-xs text-red-700">
                    <input
                      type="checkbox"
                      checked={removeImage}
                      onChange={(e) => {
                        setRemoveImage(e.target.checked);
                        if (e.target.checked) setImageFile(null);
                      }}
                    />
                    Remove existing image
                  </label>
                )}
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl border px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Holiday"
                  : "Save Holiday"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex justify-between gap-2">
            <p className="text-sm font-semibold text-slate-500">
              Total Holidays
            </p>
            <CalendarDays size={22} className="shrink-0 text-indigo-600" />
          </div>
          <h2 className="mt-3 text-3xl font-black text-slate-800">
            {loading ? "…" : summary.total}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex justify-between gap-2">
            <p className="text-sm font-semibold text-slate-500">Upcoming</p>
            <PartyPopper size={22} className="shrink-0 text-green-600" />
          </div>
          <h2 className="mt-3 text-3xl font-black text-green-600">
            {loading ? "…" : summary.upcoming}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex justify-between gap-2">
            <p className="text-sm font-semibold text-slate-500">This Month</p>
            <CalendarDays size={22} className="shrink-0 text-orange-500" />
          </div>
          <h2 className="mt-3 text-3xl font-black text-orange-500">
            {loading ? "…" : summary.thisMonth}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex justify-between gap-2">
            <p className="text-sm font-semibold text-slate-500">Events</p>
            <PartyPopper size={22} className="shrink-0 text-purple-600" />
          </div>
          <h2 className="mt-3 text-3xl font-black text-purple-600">
            {loading ? "…" : summary.events}
          </h2>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-800">Holiday List</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredHoliday.length} holiday(s) displayed
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border px-4 py-2">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search holiday..."
              className="w-full min-w-0 text-sm outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="px-6 py-4">Holiday Name</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Day</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Attachments</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading && holidays.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    Loading holidays...
                  </td>
                </tr>
              ) : filteredHoliday.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    {search
                      ? "No holidays match your search."
                      : "No holidays found. Click Add Holiday to create one."}
                  </td>
                </tr>
              ) : (
                filteredHoliday.map((holiday) => (
                  <tr key={holiday._id} className="border-t hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      <div>{holiday.title}</div>
                      {holiday.description && (
                        <p className="mt-1 max-w-xs text-xs font-normal text-slate-500">
                          {holiday.description}
                        </p>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      {formatDate(holiday.date)}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {getDay(holiday.date)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="whitespace-nowrap rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                        {holiday.type}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {holiday.pdfUrl && (
                          <a
                            href={getFileUrl(holiday.pdfUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1.5 text-xs font-semibold text-red-700"
                          >
                            <FileText size={14} />
                            PDF
                          </a>
                        )}
                        {holiday.imageUrl && (
                          <a
                            href={getFileUrl(holiday.imageUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1.5 text-xs font-semibold text-emerald-700"
                          >
                            <ImagePlus size={14} />
                            Image
                          </a>
                        )}
                        {!holiday.pdfUrl && !holiday.imageUrl && (
                          <span className="text-xs text-slate-400">None</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(holiday)}
                          title="Edit holiday"
                          className="rounded-lg bg-blue-100 p-2 text-blue-700 hover:bg-blue-200"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(holiday)}
                          title="Delete holiday"
                          className="rounded-lg bg-red-100 p-2 text-red-700 hover:bg-red-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
