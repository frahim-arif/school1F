"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "../components/home/Navbar";
import Footer from "../components/home/Footer";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Camera,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  RefreshCw,
  ExternalLink,
  X,
} from "lucide-react";

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
)
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const PUBLIC_GALLERY_API = `${API_ORIGIN}/api/gallery/public`;

function getItems(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.gallery)) return result.gallery;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.data?.gallery)) return result.data.gallery;
  if (Array.isArray(result?.data?.items)) return result.data.items;
  if (Array.isArray(result?.data)) return result.data;
  return [];
}

function getFileUrl(item) {
  const raw =
    item?.fileUrl ||
    item?.imageUrl ||
    item?.image ||
    item?.url ||
    item?.file ||
    "";

  if (typeof raw !== "string" || !raw.trim()) return "";

  const value = raw.trim();

  // Keep absolute URLs unchanged.
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) {
    return value;
  }

  // Backend stores paths such as /uploads/gallery/example.jpg.
  return `${API_ORIGIN}/${value.replace(/^\/+/, "")}`;
}

function isPdf(item) {
  return (
    item?.fileType === "pdf" ||
    item?.mimeType === "application/pdf" ||
    /\.pdf(?:$|[?#])/i.test(item?.fileUrl || item?.fileName || "")
  );
}

function isVideo(item) {
  const type = String(item?.fileType || item?.type || item?.mimeType || "").toLowerCase();
  const url = getFileUrl(item);
  return (
    type.includes("video") ||
    /\.(mp4|webm|mov|m4v)(?:$|[?#])/i.test(url)
  );
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function GalleryCard({ item, onPreview }) {
  const src = getFileUrl(item);
  const pdf = isPdf(item);
  const video = isVideo(item);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-64 overflow-hidden bg-slate-100 sm:h-72">
        {pdf ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-50 to-blue-50 p-6 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <FileText size={42} />
            </span>
            <span className="text-sm font-bold uppercase tracking-wider text-red-600">
              PDF Document
            </span>
            <p className="max-w-full truncate text-sm font-semibold text-slate-700">
              {item.fileName || item.title || "School document"}
            </p>
            {src && (
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0F2A4D] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800"
              >
                View PDF <ExternalLink size={15} />
              </a>
            )}
          </div>
        ) : video ? (
          <button
            type="button"
            onClick={() => onPreview(item)}
            className="block h-full w-full"
            aria-label={`Play ${item.title || "school video"}`}
          >
            <video
              src={src}
              className="h-full w-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
            <span className="absolute right-4 top-4 rounded-lg bg-black/65 px-3 py-1.5 text-xs font-bold text-white">
              VIDEO
            </span>
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-left text-sm font-semibold text-white">
              Play video
            </span>
          </button>
        ) : src && !imageFailed ? (
          <button
            type="button"
            onClick={() => onPreview(item)}
            className="block h-full w-full"
            aria-label={`View ${item.title || "gallery image"}`}
          >
            <img
              src={src}
              alt={item.title || "School gallery"}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              onError={() => setImageFailed(true)}
            />
          </button>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-5 text-center text-slate-500">
            <ImageIcon size={42} />
            <span className="text-sm font-semibold">
              {src ? "Image could not be loaded" : "File unavailable"}
            </span>
            {src && (
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-blue-700 underline"
              >
                Open file directly
              </a>
            )}
          </div>
        )}

        {!pdf && (
          <>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A1B33]/90 via-transparent to-transparent" />
            <div className="pointer-events-none absolute inset-x-4 bottom-4">
              {item.category && (
                <span className="inline-block rounded-md bg-amber-400 px-2.5 py-1 text-xs font-bold text-slate-900">
                  {item.category}
                </span>
              )}
              <h3 className="mt-2 text-lg font-bold text-white">
                {item.title || "School Memories"}
              </h3>
              {item.eventDate && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-200">
                  <CalendarDays size={14} />
                  {formatDate(item.eventDate)}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {(pdf || item.description) && (
        <div className="p-4">
          {pdf && (
            <h3 className="font-bold text-slate-900">
              {item.title || "School document"}
            </h3>
          )}
          {item.description && (
            <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-600">
              {item.description}
            </p>
          )}
          {pdf && item.eventDate && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <CalendarDays size={14} />
              {formatDate(item.eventDate)}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

export default function PublicGalleryPage() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  const loadGallery = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(PUBLIC_GALLERY_API, { cache: "no-store" });
      const result = await response.json().catch(() => ({}));

      if (
        !response.ok ||
        result?.success === false ||
        result?._status === false
      ) {
        throw new Error(
          result?.message ||
            result?._message ||
            `Gallery request failed (${response.status}).`
        );
      }

      setItems(getItems(result).filter((item) => item && item.isPublished !== false));
    } catch (err) {
      console.error("Public gallery error:", err);
      setError(
        "Gallery load nahi ho paayi. Backend URL, API route aur server logs check karein."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  useEffect(() => {
    if (!selected) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected]);

  const categories = useMemo(() => {
    const values = items
      .map((item) => item.category)
      .filter((value) => typeof value === "string" && value.trim());
    return ["All", ...new Set(values)];
  }, [items]);

  const filteredItems = useMemo(
    () =>
      category === "All"
        ? items
        : items.filter((item) => item.category === category),
    [items, category]
  );

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 text-slate-800">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0A1B33] via-[#0F2A4D] to-[#143A6B]">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-blue-100 transition hover:text-amber-400"
            >
              <ArrowLeft size={17} /> Back to Home
            </Link>

            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 text-slate-900">
                <Camera size={25} />
              </span>
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">
                School Memories
              </span>
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl">
              Our School Gallery
              <span className="mt-2 block text-amber-400">
                Moments That Matter.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
              Explore school events, classroom activities, celebrations,
              documents and memorable moments from our school community.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#gallery-items"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 font-bold text-slate-900 transition hover:bg-amber-300"
              >
                Explore Gallery <ArrowRight size={18} />
              </a>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-bold text-white ring-1 ring-white/30 transition hover:bg-white/10"
              >
                Home Page
              </Link>
            </div>
          </div>
        </section>

        <section
          id="gallery-items"
          className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20"
        >
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
                Photo & Document Collection
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">
                Explore Our Memories
              </h2>
              <p className="mt-3 max-w-xl leading-7 text-slate-600">
                Browse published photos and school documents uploaded by the
                administration.
              </p>
            </div>
            {!loading && !error && (
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <ImageIcon size={19} />
                {filteredItems.length}{" "}
                {filteredItems.length === 1 ? "item" : "items"}
              </div>
            )}
          </div>

          {!loading && !error && items.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {categories.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategory(value)}
                  className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                    category === value
                      ? "bg-[#0F2A4D] text-white shadow-md"
                      : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <LoaderCircle size={38} className="animate-spin text-blue-700" />
              <p className="mt-4 font-semibold text-slate-700">
                Loading gallery...
              </p>
            </div>
          ) : error ? (
            <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="font-semibold text-red-700">{error}</p>
              <button
                type="button"
                onClick={loadGallery}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0F2A4D] px-5 py-3 font-bold text-white hover:bg-blue-800"
              >
                <RefreshCw size={17} /> Try Again
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="mt-10 rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-slate-200">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <Camera size={30} />
              </span>
              <h3 className="mt-5 text-xl font-bold text-slate-900">
                {items.length === 0
                  ? "Gallery coming soon"
                  : "No items in this category"}
              </h3>
              <p className="mx-auto mt-2 max-w-md leading-7 text-slate-600">
                {items.length === 0
                  ? "Published school photos and documents will appear here."
                  : "Choose another category to explore more school memories."}
              </p>
              {category !== "All" && (
                <button
                  type="button"
                  onClick={() => setCategory("All")}
                  className="mt-5 rounded-lg bg-[#0F2A4D] px-5 py-3 font-bold text-white"
                >
                  View All Items
                </button>
              )}
            </div>
          ) : (
            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item, index) => (
                <GalleryCard
                  key={item._id || item.id || `${item.fileUrl || item.title}-${index}`}
                  item={item}
                  onPreview={setSelected}
                />
              ))}
            </div>
          )}
        </section>

        <section className="px-5 pb-16 md:px-8 md:pb-20">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-r from-[#0A1B33] to-[#143A6B] p-8 text-white md:flex-row md:items-center md:p-12">
            <div>
              <h2 className="text-2xl font-black md:text-3xl">
                Every Picture Tells a Story
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                Discover the learning, friendships and experiences that make
                our school special.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 font-bold text-slate-900 transition hover:bg-amber-300"
            >
              Back to Home <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {selected && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelected(null)}
            role="dialog"
            aria-modal="true"
            aria-label={selected.title || "Gallery preview"}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
              aria-label="Close preview"
            >
              <X size={24} />
            </button>
            <div
              className="w-full max-w-5xl"
              onClick={(event) => event.stopPropagation()}
            >
              {isVideo(selected) ? (
                <video
                  src={getFileUrl(selected)}
                  controls
                  autoPlay
                  className="mx-auto max-h-[75vh] max-w-full rounded-xl"
                />
              ) : (
                <img
                  src={getFileUrl(selected)}
                  alt={selected.title || "School gallery"}
                  className="mx-auto max-h-[75vh] max-w-full rounded-xl object-contain"
                />
              )}
              <h3 className="mt-4 text-xl font-bold text-white">
                {selected.title || "School Memories"}
              </h3>
              {selected.description && (
                <p className="mt-2 leading-7 text-slate-300">
                  {selected.description}
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
