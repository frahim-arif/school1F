
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ImagePlus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Images,
  Eye,
  EyeOff,
  CalendarDays,
  LoaderCircle,
  AlertCircle,
  Upload,
  FileText,
  ExternalLink,
  FileImage,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_ROOT = API_BASE.endsWith("/api")
  ? API_BASE
  : `${API_BASE}/api`;

const API_ORIGIN = API_BASE.replace(/\/api$/, "");
const GALLERY_API = `${API_ROOT}/gallery`;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

const CATEGORIES = [
  "Events",
  "Classroom",
  "Sports",
  "Celebrations",
  "Activities",
  "Documents",
  "Other",
];

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "Events",
  eventDate: today(),
  isPublished: true,
};

const getFileUrl = (fileUrl) => {
  if (!fileUrl) return "";

  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl;
  }

  return `${API_ORIGIN}/${fileUrl.replace(/^\/+/, "")}`;
};

const getDateValue = (value) => {
  if (!value) return today();

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return today();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getErrorMessage = async (response) => {
  try {
    const data = await response.json();
    return data.message || data.error || "Request failed.";
  } catch {
    return `Request failed (${response.status}).`;
  }
};

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  // Create and clean up local file previews.
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (search.trim()) params.set("search", search.trim());
      if (category !== "All") params.set("category", category);

      const query = params.toString();
      const response = await fetch(
        `${GALLERY_API}${query ? `?${query}` : ""}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = await response.json();

      if (data.success === false) {
        throw new Error(data.message || "Gallery load nahi ho saki.");
      }

      const gallery = Array.isArray(data.gallery)
        ? data.gallery
        : Array.isArray(data.data)
          ? data.data
          : [];

      setItems(gallery);
    } catch (err) {
      setError(
        `${err.message || "Gallery load nahi ho saki."} Backend aur API URL check karein.`
      );
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setEditingItem(null);
    setSelectedFile(null);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    resetForm();
    setError("");
  };

  const openAddForm = () => {
    resetForm();
    setNotice("");
    setError("");
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingId(item._id);
    setEditingItem(item);
    setSelectedFile(null);

    setForm({
      title: item.title || "",
      description: item.description || "",
      category: item.category || "Other",
      eventDate: getDateValue(item.eventDate),
      isPublished: item.isPublished !== false,
    });

    setNotice("");
    setError("");
    setShowForm(true);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    // Allow choosing the same file again after an invalid selection.
    event.target.value = "";

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Sirf JPG, PNG, WEBP, GIF aur PDF files allowed hain.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File ka size maximum 10 MB hona chahiye.");
      return;
    }

    setError("");
    setSelectedFile(file);
  };

  const saveGallery = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Photo/document ka title enter karein.");
      return;
    }

    if (!editingId && !selectedFile) {
      setError("Please image ya PDF file select karein.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = new FormData();

      payload.append("title", form.title.trim());
      payload.append("description", form.description.trim());
      payload.append("category", form.category);
      payload.append("eventDate", form.eventDate || today());
      payload.append("isPublished", String(form.isPublished));

      if (selectedFile) {
        payload.append("file", selectedFile);
      }

      const response = await fetch(
        editingId ? `${GALLERY_API}/${editingId}` : GALLERY_API,
        {
          method: editingId ? "PUT" : "POST",
          // Do not set Content-Type manually for FormData.
          // The browser adds the multipart boundary automatically.
          body: payload,
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = await response.json();

      if (data.success === false) {
        throw new Error(data.message || "Gallery save nahi hui.");
      }

      setNotice(
        editingId
          ? "Gallery item successfully updated."
          : "Gallery item successfully added."
      );

      setShowForm(false);
      resetForm();

      await fetchGallery();
    } catch (err) {
      setError(err.message || "Gallery save nahi hui.");
    } finally {
      setSaving(false);
    }
  };

  const removeGallery = async (item) => {
    if (!window.confirm(`"${item.title}" ko delete karna hai?`)) return;

    setError("");
    setNotice("");
    setDeletingId(item._id);

    try {
      const response = await fetch(`${GALLERY_API}/${item._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = await response.json();

      if (data.success === false) {
        throw new Error(data.message || "Delete nahi ho saka.");
      }

      setNotice("Gallery item deleted.");
      await fetchGallery();
    } catch (err) {
      setError(err.message || "Delete nahi ho saka.");
    } finally {
      setDeletingId(null);
    }
  };

  const togglePublished = async (item) => {
    setError("");
    setNotice("");
    setStatusUpdatingId(item._id);

    try {
      const response = await fetch(`${GALLERY_API}/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPublished: item.isPublished === false,
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = await response.json();

      if (data.success === false) {
        throw new Error(data.message || "Status update nahi hua.");
      }

      setNotice("Publish status updated.");
      await fetchGallery();
    } catch (err) {
      setError(err.message || "Status update nahi hua.");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const publishedCount = items.filter(
    (item) => item.isPublished !== false
  ).length;

  const selectedIsPdf = selectedFile?.type === "application/pdf";
  const oldFileIsPdf = editingItem?.fileType === "pdf";
  const currentOldFileUrl = getFileUrl(editingItem?.fileUrl);

  return (
    <main className="min-h-screen bg-[#faf8f3] p-4 text-[#20332d] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#071c19] via-[#0b302a] to-[#17483b] p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#c8ae6a]/50 bg-white/10 px-3 py-1 text-xs font-semibold text-[#f3df9e]">
                <Images size={14} />
                SCHOOL MEDIA
              </div>

              <h1 className="font-serif text-3xl font-black sm:text-4xl">
                School Gallery
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">
                Manage school events, classroom moments, sports, celebrations
                and documents from one place.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c8ae6a] px-5 py-3 text-sm font-bold text-[#071c19] transition hover:bg-[#e0ca88]"
            >
              <ImagePlus size={18} />
              Add Media
            </button>
          </div>
        </header>

        {notice && (
          <div
            role="status"
            className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800"
          >
            {notice}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 shrink-0" size={17} />
            <span className="break-words">{error}</span>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Filtered Media"
            value={items.length}
            icon={<Images size={20} />}
          />
          <StatCard
            title="Published"
            value={publishedCount}
            icon={<Eye size={20} />}
          />
          <StatCard
            title="Hidden"
            value={items.length - publishedCount}
            icon={<EyeOff size={20} />}
          />
        </section>

        {showForm && (
          <section className="rounded-2xl border border-[#e8dfce] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">
                  {editingId ? "Edit Gallery Item" : "Add Gallery Media"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Image ya PDF upload karein. Maximum file size 10 MB.
                </p>
              </div>

              <button
                onClick={closeForm}
                type="button"
                disabled={saving}
                className="rounded-lg border p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                aria-label="Close form"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={saveGallery} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Title *">
                  <input
                    name="title"
                    value={form.title}
                    onChange={updateField}
                    required
                    maxLength={150}
                    placeholder="Annual Function 2026"
                    className={inputClass}
                  />
                </Field>

                <Field label="Category">
                  <select
                    name="category"
                    value={form.category}
                    onChange={updateField}
                    className={inputClass}
                  >
                    {CATEGORIES.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Event Date">
                  <input
                    name="eventDate"
                    type="date"
                    value={form.eventDate}
                    onChange={updateField}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label={editingId ? "Replace File (Optional)" : "Upload Image or PDF *"}>
                <div className="rounded-2xl border-2 border-dashed border-[#d9ceb6] bg-[#fcfaf5] p-5 sm:p-6">
                  <input
                    id="gallery-file"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,image/jpeg,image/png,image/webp,image/gif,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <label
                    htmlFor="gallery-file"
                    className="flex cursor-pointer flex-col items-center justify-center text-center"
                  >
                    <div className="mb-3 rounded-2xl bg-[#eee6d3] p-4 text-[#806a35]">
                      <Upload size={27} />
                    </div>

                    <span className="text-sm font-bold text-[#20332d]">
                      Click to choose a file
                    </span>

                    <span className="mt-1 text-xs text-gray-500">
                      JPG, PNG, WEBP, GIF or PDF · Max 10 MB
                    </span>
                  </label>

                  {selectedFile && (
                    <div className="mt-5 border-t border-[#e8dfce] pt-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          {selectedIsPdf ? (
                            <FileText
                              className="shrink-0 text-red-600"
                              size={23}
                            />
                          ) : (
                            <FileImage
                              className="shrink-0 text-[#806a35]"
                              size={23}
                            />
                          )}

                          <div className="min-w-0">
                            <p className="break-all text-sm font-semibold">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="shrink-0 rounded-lg border p-2 text-gray-500 hover:bg-white"
                          aria-label="Remove selected file"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {selectedIsPdf ? (
                        <iframe
                          src={previewUrl}
                          title="Selected PDF preview"
                          className="h-80 w-full rounded-xl border bg-white"
                        />
                      ) : (
                        <img
                          src={previewUrl}
                          alt="Selected image preview"
                          className="max-h-80 w-full rounded-xl bg-white object-contain"
                        />
                      )}
                    </div>
                  )}

                  {!selectedFile && editingItem && (
                    <div className="mt-5 border-t border-[#e8dfce] pt-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Current file
                      </p>

                      <div className="flex items-center gap-3 rounded-xl border bg-white p-3">
                        {oldFileIsPdf ? (
                          <FileText
                            className="shrink-0 text-red-600"
                            size={25}
                          />
                        ) : (
                          <FileImage
                            className="shrink-0 text-[#806a35]"
                            size={25}
                          />
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="break-all text-sm font-semibold">
                            {editingItem.fileName || editingItem.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            Existing file will be kept unless you select a replacement.
                          </p>
                        </div>

                        {currentOldFileUrl && (
                          <a
                            href={currentOldFileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#806a35] hover:underline"
                          >
                            Open <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Field>

              <Field label="Description">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  rows={3}
                  maxLength={1000}
                  placeholder="Is event ya document ke baare mein likhein..."
                  className={inputClass}
                />
              </Field>

              <label className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 text-sm">
                <input
                  name="isPublished"
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={updateField}
                  className="h-4 w-4 accent-[#0b302a]"
                />
                Publish on the public gallery
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0b302a] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {saving && (
                    <LoaderCircle className="animate-spin" size={17} />
                  )}
                  {saving
                    ? "Uploading..."
                    : editingId
                      ? "Update Gallery Item"
                      : "Upload Media"}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="rounded-2xl border border-[#e8dfce] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search gallery..."
                className={`${inputClass} pl-10`}
              />
            </div>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={`${inputClass} md:w-52`}
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={fetchGallery}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </section>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-3 text-gray-500">
            <LoaderCircle className="animate-spin" size={22} />
            Loading gallery...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d8cdb7] bg-white p-12 text-center">
            <Images className="mx-auto text-[#a08d66]" size={42} />
            <h3 className="mt-4 text-lg font-bold">No media found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Upload your first school image or PDF to get started.
            </p>
            <button
              type="button"
              onClick={openAddForm}
              className="mt-5 rounded-xl bg-[#0b302a] px-5 py-3 text-sm font-bold text-white"
            >
              Add First Media
            </button>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const fileUrl = getFileUrl(item.fileUrl);
              const isPdf =
                item.fileType === "pdf" ||
                item.mimeType === "application/pdf" ||
                (!item.fileType && /\.pdf(?:$|\?)/i.test(item.fileUrl || ""));

              return (
                <article
                  key={item._id}
                  className="overflow-hidden rounded-2xl border border-[#e8dfce] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-[#f1eee5]">
                    {isPdf ? (
                      <div className="flex flex-col items-center px-4 text-center">
                        <div className="rounded-2xl bg-red-50 p-5 text-red-600">
                          <FileText size={48} />
                        </div>
                        <p className="mt-3 max-w-full break-all text-sm font-bold text-[#20332d]">
                          {item.fileName || item.title}
                        </p>
                        {fileUrl && (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#0b302a] px-3 py-2 text-xs font-bold text-white hover:bg-[#17483b]"
                          >
                            Open PDF <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    ) : fileUrl ? (
                      <img
  src={fileUrl}
  alt={item.title || "Gallery image"}
  loading="lazy"
  className="h-full w-full object-cover"
  onError={(event) => {
    console.error("Gallery image failed:", {
      url: event.currentTarget.src,
      error: event.currentTarget.error,
    });
    event.currentTarget.style.display = "none";
  }}
/>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <ImagePlus size={38} />
                        <span className="text-xs">File unavailable</span>
                      </div>
                    )}

                    <span
                      className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${
                        item.isPublished === false
                          ? "bg-gray-800 text-white"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {item.isPublished === false ? "Hidden" : "Published"}
                    </span>
                  </div>

                  <div className="space-y-3 p-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[#987c43]">
                        {item.category || "Other"}
                      </p>
                      <h3 className="mt-1 break-words text-lg font-bold text-[#20332d]">
                        {item.title}
                      </h3>
                    </div>

                    {item.description && (
                      <p className="line-clamp-2 break-words text-sm leading-5 text-gray-500">
                        {item.description}
                      </p>
                    )}

                    <p className="flex items-center gap-2 text-xs text-gray-500">
                      <CalendarDays size={14} />
                      {item.eventDate
                        ? new Date(item.eventDate).toLocaleDateString("en-IN")
                        : "Date not set"}
                    </p>

                    <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
                      <button
                        type="button"
                        onClick={() => openEditForm(item)}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-200 px-2 py-2 text-xs font-semibold hover:bg-gray-50"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => togglePublished(item)}
                        disabled={statusUpdatingId === item._id}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-200 px-2 py-2 text-xs font-semibold hover:bg-gray-50 disabled:opacity-50"
                      >
                        {statusUpdatingId === item._id ? (
                          <LoaderCircle className="animate-spin" size={14} />
                        ) : item.isPublished === false ? (
                          <Eye size={14} />
                        ) : (
                          <EyeOff size={14} />
                        )}
                        {item.isPublished === false ? "Publish" : "Hide"}
                      </button>

                      <button
                        type="button"
                        onClick={() => removeGallery(item)}
                        disabled={deletingId === item._id}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-100 px-2 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === item._id ? (
                          <LoaderCircle className="animate-spin" size={14} />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        Delete
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

const inputClass =
  "w-full rounded-xl border border-[#e4ddcf] bg-white px-3 py-3 text-sm text-[#20332d] outline-none transition placeholder:text-gray-400 focus:border-[#a48b4e] focus:ring-2 focus:ring-[#c8ae6a]/20";

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-[#493e30]">{label}</span>
      {children}
    </label>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#e8dfce] bg-white p-5 shadow-sm">
      <div className="rounded-xl bg-[#f4efdf] p-3 text-[#8a733c]">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-black text-[#20332d]">{value}</p>
      </div>
    </div>
  );
}
