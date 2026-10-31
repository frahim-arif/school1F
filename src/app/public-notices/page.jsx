
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  Search,
  Download,
  ExternalLink,
  RefreshCw,
  Megaphone,
  Clock,
  AlertCircle,
  Paperclip,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
)
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const CATEGORIES = [
  "All",
  "General",
  "Exam",
  "Holiday",
  "Fee",
  "Event",
];

const categoryColors = {
  General: "bg-blue-50 text-blue-700 border-blue-100",
  Exam: "bg-purple-50 text-purple-700 border-purple-100",
  Holiday: "bg-green-50 text-green-700 border-green-100",
  Fee: "bg-orange-50 text-orange-700 border-orange-100",
  Event: "bg-pink-50 text-pink-700 border-pink-100",
};

function formatDate(date) {
  if (!date) return "Date not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date not available";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getNoticeArray(result) {
  if (Array.isArray(result)) return result;

  const possibleData = [
    result?.notices,
    result?._data?.notices,
    result?._data,
    result?.data?.notices,
    result?.data,
    result?.results,
  ];

  return possibleData.find(Array.isArray) || [];
}

function getAttachmentUrl(url) {
  if (!url) return "";

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function getNoticeStatus(notice) {
  if (notice.status !== "Active") return "hidden";

  const now = Date.now();

  if (notice.publishDate) {
    const publishTime = new Date(notice.publishDate).getTime();

    if (Number.isNaN(publishTime)) return "hidden";

    if (publishTime > now) return "upcoming";
  }

  if (notice.expiryDate) {
    const expiryTime = new Date(notice.expiryDate).getTime();

    if (Number.isNaN(expiryTime) || expiryTime < now) {
      return "hidden";
    }
  }

  return "published";
}

function isPdf(notice) {
  const name = notice.attachmentOriginalName || notice.attachment || "";
  return /\.pdf(?:$|\?)/i.test(name);
}

export default function PublicNoticesPage() {
  const [notices, setNotices] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchNotices = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
        setRefreshing(true);
      }

      const response = await fetch(
        `${API_BASE}/api/notices?limit=100&page=1`,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Unable to load notices (${response.status})`);
      }

      const result = await response.json();

      if (result.success === false || result._status === false) {
        throw new Error(
          result.message ||
          result._message ||
          "Notice loading failed"
        );
      }

      const noticeData = getNoticeArray(result);

      const activeNotices = noticeData
        .filter((notice) => getNoticeStatus(notice) !== "hidden")
        .sort((a, b) => {
          const dateA = new Date(
            a.publishDate || a.createdAt || 0
          ).getTime();

          const dateB = new Date(
            b.publishDate || b.createdAt || 0
          ).getTime();

          return dateB - dateA;
        });

      setNotices(activeNotices);
      setError("");
    } catch (err) {
      console.error("Notice loading error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices(true);

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchNotices(false);
      }
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchNotices(false);
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      clearInterval(interval);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [fetchNotices]);

  const filteredNotices = notices.filter((notice) => {
    const matchesCategory =
      category === "All" || notice.category === category;

    const text = `${notice.title || ""} ${
      notice.description || ""
    } ${notice.audience || ""}`;

    const matchesSearch = text
      .toLowerCase()
      .includes(search.toLowerCase().trim());

    return matchesCategory && matchesSearch;
  });

  const recordView = async (id) => {
    if (!id) return;

    try {
      const viewedKey = `notice_viewed_${id}`;

      if (sessionStorage.getItem(viewedKey)) return;

      sessionStorage.setItem(viewedKey, "true");

      await fetch(`${API_BASE}/api/notices/${id}/view`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Notice view error:", err);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0A1B33] px-5 py-16 text-white md:py-20">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-blue-100">
            <Bell size={16} className="text-amber-400" />
            Adarsha Markaz Academy
          </div>

          <h1 className="text-3xl font-black md:text-5xl">
            Public <span className="text-amber-400">Notices</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 md:text-base">
            Stay updated with the latest school announcements,
            examination schedules, holidays, events and important
            information.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3">
              <Megaphone size={19} className="text-amber-400" />
              <span className="text-sm font-semibold">
                {notices.length} Active Notices
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3">
              <Clock size={18} className="text-amber-400" />
              <span className="text-sm font-semibold">
                Regularly Updated
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        {/* SEARCH AND REFRESH */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notices..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="button"
            onClick={() => fetchNotices(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A1B33] px-5 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* CATEGORY FILTERS */}
        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                category === item
                  ? "border-[#0A1B33] bg-[#0A1B33] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} />
            <span>{error}</span>

            <button
              type="button"
              onClick={() => fetchNotices(true)}
              className="ml-auto font-bold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-52 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Bell size={30} />
            </div>

            <h2 className="text-xl font-bold text-slate-800">
              No Notices Found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {search || category !== "All"
                ? "Try changing your search or category."
                : "There are currently no active notices."}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredNotices.map((notice) => {
              const attachment = getAttachmentUrl(notice.attachment);
              const status = getNoticeStatus(notice);

              return (
                <article
                  key={notice._id}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg md:p-6"
                >
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${
                          categoryColors[notice.category] ||
                          "border-slate-200 bg-slate-50 text-slate-600"
                        }`}
                      >
                        {notice.category || "General"}
                      </span>

                      {status === "upcoming" ? (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
                          UPCOMING
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                          PUBLISHED
                        </span>
                      )}
                    </div>

                    <span className="flex shrink-0 items-center gap-1.5 text-xs text-slate-500">
                      <CalendarDays size={14} />
                      {formatDate(notice.publishDate)}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold leading-snug text-slate-900 transition group-hover:text-blue-800 md:text-xl">
                    {notice.title || "Untitled Notice"}
                  </h2>

                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                    {notice.description || ""}
                  </p>

                  {notice.expiryDate && (
                    <p className="mt-3 text-xs text-slate-400">
                      Valid till: {formatDate(notice.expiryDate)}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <span className="text-xs font-medium text-slate-500">
                      For: {notice.audience || "All Students"}
                    </span>

                    {attachment && (
                      <a
                        href={attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => recordView(notice._id)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                      >
                        {isPdf(notice) ? (
                          <Download size={16} />
                        ) : (
                          <ExternalLink size={16} />
                        )}

                        {isPdf(notice) ? "Download PDF" : "View Attachment"}
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
