
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  ClipboardList,
  ExternalLink,
  Inbox,
  Paperclip,
  Sun,
  Wallet,
  X,
  Clock,
  RefreshCw,
} from "lucide-react";

const H = "font-[family-name:var(--font-head)]";
const wrap = "mx-auto max-w-7xl px-5 md:px-8";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
)
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const CAT = {
  General: {
    icon: Bell,
    chip: "bg-slate-100 text-slate-700",
  },
  Exam: {
    icon: ClipboardList,
    chip: "bg-rose-100 text-rose-700",
  },
  Holiday: {
    icon: Sun,
    chip: "bg-emerald-100 text-emerald-700",
  },
  Fee: {
    icon: Wallet,
    chip: "bg-amber-100 text-amber-800",
  },
  Event: {
    icon: CalendarDays,
    chip: "bg-pink-100 text-pink-700",
  },
};

const fmt = (date) => {
  if (!date) return "Date not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date not available";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const day = (date) => {
  if (!date) return "--";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "--";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
  });
};

const mon = (date) => {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString("en-IN", {
    month: "short",
  });
};

const isNew = (date) => {
  if (!date) return false;

  const time = new Date(date).getTime();

  if (Number.isNaN(time)) return false;

  const age = Date.now() - time;

  return age >= 0 && age < 3 * 86400000;
};

const isUpcoming = (date) => {
  if (!date) return false;

  const publishTime = new Date(date).getTime();

  return (
    !Number.isNaN(publishTime) &&
    publishTime > Date.now()
  );
};

const isImage = (url = "") => {
  return /\.(png|jpe?g|webp|gif)$/i.test(url);
};

function getAttachmentUrl(url) {
  if (!url) return "";

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function getNoticeArray(json) {
  if (Array.isArray(json)) return json;

  return (
    json?.notices ||
    json?._data?.notices ||
    json?._data ||
    json?.data?.notices ||
    json?.data ||
    []
  );
}

function getNoticeState(notice) {
  const now = Date.now();

  const publishTime = notice.publishDate
    ? new Date(notice.publishDate).getTime()
    : null;

  const expiryTime = notice.expiryDate
    ? new Date(notice.expiryDate).getTime()
    : null;

  if (notice.status !== "Active") {
    return "hidden";
  }

  if (
    publishTime !== null &&
    !Number.isNaN(publishTime) &&
    publishTime > now
  ) {
    return "upcoming";
  }

  if (
    expiryTime !== null &&
    !Number.isNaN(expiryTime) &&
    expiryTime < now
  ) {
    return "hidden";
  }

  return "published";
}

export default function NoticesSection({
  fallbackEvents = [
    "Annual Examination",
    "Parent-Teacher Meeting",
    "Annual Sports Day",
    "Cultural Programme",
  ],
  refreshMs = 30000,
}) {
  const [items, setItems] = useState([]);
  const [state, setState] = useState("loading");
  const [sel, setSel] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/notices?limit=100&page=1`,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Notices request failed (${res.status})`);
      }

      const json = await res.json();

      if (json.success === false || json._status === false) {
        throw new Error(
          json.message ||
          json._message ||
          "Unable to load notices"
        );
      }

      const list = getNoticeArray(json);

      if (!Array.isArray(list)) {
        throw new Error("Invalid notice response");
      }

      // Active notices: published + upcoming.
      // Draft and Expired notices are excluded.
      const activeNotices = list
        .filter((notice) => {
          return (
            notice.status === "Active" &&
            getNoticeState(notice) !== "hidden"
          );
        })
        .sort((a, b) => {
          const dateA = new Date(
            a.publishDate || a.createdAt || 0
          ).getTime();

          const dateB = new Date(
            b.publishDate || b.createdAt || 0
          ).getTime();

          return dateA - dateB;
        });

      setItems(activeNotices);
      setLastUpdated(new Date());
      setState("ready");
    } catch (error) {
      console.error("Homepage notices error:", error);

      setState((previous) =>
        previous === "ready" ? "ready" : "error"
      );
    }
  }, []);

  useEffect(() => {
    load();

    const interval = setInterval(() => {
      if (!document.hidden) {
        load();
      }
    }, Math.max(15000, refreshMs));

    const handleVisibility = () => {
      if (!document.hidden) {
        load();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      clearInterval(interval);

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [load, refreshMs]);

  // Update upcoming/published badge when publish date arrives.
  useEffect(() => {
    const timer = setInterval(() => {
      setItems((previous) => [...previous]);
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  // Modal keyboard and scroll handling
  useEffect(() => {
    if (!sel) return;

    const onKey = (event) => {
      if (event.key === "Escape") {
        setSel(null);
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [sel]);

  const recordView = async (id) => {
    if (!id) return;

    try {
      const key = `notice-viewed-${id}`;

      if (sessionStorage.getItem(key)) return;

      sessionStorage.setItem(key, "1");

      await fetch(`${API_BASE}/api/notices/${id}/view`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Notice view error:", error);
    }
  };

  const open = (notice) => {
    setSel(notice);
    recordView(notice._id);
  };

  // Show upcoming notices too.
  const notices = items.slice(0, 5);

  // Event notices are displayed separately.
  const events = items
    .filter((notice) => notice.category === "Event")
    .slice(0, 4);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-rose-50 via-white to-pink-50 py-14 md:py-24">
      <style>{`
        @keyframes nt-pop {
          from {
            opacity: 0;
            transform: translateY(24px) scale(.97);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }

        .nt-pop {
          animation: nt-pop .35s cubic-bezier(.22,1,.36,1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .nt-pop {
            animation: none;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-rose-200/50 blur-3xl" />

      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-pink-200/50 blur-3xl" />

      <div
        className={`${wrap} relative grid gap-5 lg:grid-cols-[1.12fr_0.88fr] lg:gap-6`}
      >
        {/* NOTICES */}
        <div className="rounded-3xl bg-white p-5 shadow-xl shadow-rose-900/5 ring-1 ring-rose-100 sm:p-7 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-100 sm:px-3.5 sm:py-1.5 sm:text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600" />
                </span>
                School updates
              </span>

              <h2
                className={`${H} mt-3 text-2xl font-black text-slate-900 md:text-3xl`}
              >
                Latest Notices
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Announcements from the school office
              </p>
            </div>

            <span className="rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 p-3 text-white shadow-lg shadow-rose-500/30 sm:p-3.5">
              <Bell size={22} />
            </span>
          </div>

          <div className="mt-6 space-y-2.5 sm:space-y-3">
            {state === "loading" &&
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex animate-pulse items-center gap-4 rounded-2xl bg-slate-50 p-4"
                >
                  <div className="h-14 w-14 rounded-xl bg-slate-200" />

                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-3/4 rounded bg-slate-200" />
                    <div className="h-3 w-1/2 rounded bg-slate-200" />
                  </div>
                </div>
              ))}

            {state === "error" && (
              <div className="rounded-2xl bg-rose-50 p-6 text-center ring-1 ring-rose-100">
                <p className="text-sm font-semibold text-rose-800">
                  Could not load notices right now.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setState("loading");
                    load();
                  }}
                  className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-700"
                >
                  Try again
                </button>
              </div>
            )}

            {state === "ready" && notices.length === 0 && (
              <div className="flex flex-col items-center rounded-2xl bg-slate-50 p-8 text-center">
                <Inbox size={34} className="text-rose-300" />

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No notices right now
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  New notices from the school office will appear here.
                </p>
              </div>
            )}

            {state === "ready" &&
              notices.map((notice) => {
                const category = CAT[notice.category] || CAT.General;
                const Icon = category.icon;

                const upcoming = isUpcoming(notice.publishDate);

                return (
                  <button
                    type="button"
                    key={notice._id}
                    onClick={() => open(notice)}
                    className="group flex w-full items-center gap-3.5 rounded-2xl bg-slate-50 p-3 text-left ring-1 ring-transparent transition hover:bg-rose-50 hover:ring-rose-200 sm:gap-4 sm:p-4"
                  >
                    <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-rose-100 sm:h-16 sm:w-16">
                      <span
                        className={`${H} text-xl font-black leading-none text-rose-600 sm:text-2xl`}
                      >
                        {day(notice.publishDate)}
                      </span>

                      <span className="mt-0.5 text-[10px] font-bold text-slate-500 sm:text-xs">
                        {mon(notice.publishDate)}
                      </span>
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold sm:text-[11px] ${category.chip}`}
                        >
                          <Icon size={11} />
                          {notice.category || "General"}
                        </span>

                        {upcoming ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800">
                            UPCOMING
                          </span>
                        ) : (
                          isNew(notice.publishDate) && (
                            <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-black text-white">
                              NEW
                            </span>
                          )
                        )}

                        {notice.attachment && (
                          <Paperclip
                            size={13}
                            className="text-slate-400"
                          />
                        )}
                      </span>

                      <span className="mt-1 block truncate text-sm font-bold text-slate-900 sm:text-base">
                        {notice.title || "Untitled Notice"}
                      </span>

                      <span className="mt-0.5 line-clamp-1 text-xs text-slate-500 sm:line-clamp-2 sm:text-sm">
                        {notice.description || ""}
                      </span>
                    </span>

                    <ArrowRight
                      size={17}
                      className="hidden shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-rose-600 sm:block"
                    />
                  </button>
                );
              })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 sm:mt-6">
            <Link
              href="/public-notices"
              className="group inline-flex items-center gap-2 text-sm font-bold text-rose-700 hover:text-rose-800 sm:text-base"
            >
              View All Notices
              <ArrowRight
                size={17}
                className="transition group-hover:translate-x-1"
              />
            </Link>

            {lastUpdated && (
              <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-400">
                <RefreshCw size={11} />
                Updated {lastUpdated.toLocaleTimeString("en-IN")}
              </span>
            )}
          </div>
        </div>

        {/* EVENTS */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-rose-600 to-pink-700 p-5 text-white shadow-xl shadow-rose-900/20 sm:p-7 md:p-8">
          <div className="pointer-events-none absolute -right-14 -top-14 h-56 w-56 rounded-full bg-white/15 blur-2xl" />

          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-pink-300/25 blur-3xl" />

          <CalendarDays
            size={150}
            strokeWidth={1}
            className="pointer-events-none absolute -bottom-6 -right-6 text-white/10"
          />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold ring-1 ring-white/25 sm:px-3.5 sm:py-1.5 sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              School calendar
            </span>

            <h2
              className={`${H} mt-3 text-2xl font-black md:text-3xl`}
            >
              Upcoming Events
            </h2>

            <div className="mt-6 space-y-2.5 sm:space-y-3">
              {events.length > 0 ? (
                events.map((notice) => {
                  const upcoming = isUpcoming(notice.publishDate);

                  return (
                    <button
                      type="button"
                      key={notice._id}
                      onClick={() => open(notice)}
                      className="group flex w-full items-center gap-3.5 rounded-2xl bg-white/12 p-3 text-left ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20 sm:gap-4 sm:p-4"
                    >
                      <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-white text-rose-700 shadow-md">
                        <span
                          className={`${H} text-xl font-black leading-none`}
                        >
                          {day(notice.publishDate)}
                        </span>

                        <span className="mt-0.5 text-[10px] font-bold">
                          {mon(notice.publishDate)}
                        </span>
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="block truncate text-sm font-bold sm:text-base">
                            {notice.title}
                          </span>

                          {upcoming && (
                            <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[9px] font-black text-amber-900">
                              UPCOMING
                            </span>
                          )}
                        </span>

                        <span className="mt-0.5 line-clamp-1 text-xs text-rose-100">
                          {notice.description}
                        </span>
                      </span>

                      <ArrowRight
                        size={16}
                        className="shrink-0 text-rose-100 transition group-hover:translate-x-1"
                      />
                    </button>
                  );
                })
              ) : (
                fallbackEvents.map((event) => (
                  <div
                    key={event}
                    className="flex items-center gap-3.5 rounded-2xl bg-white/12 p-3 ring-1 ring-white/20 backdrop-blur sm:gap-4 sm:p-4"
                  >
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-rose-700 shadow-md">
                      <CalendarDays size={22} />
                    </span>

                    <span>
                      <span className="block text-sm font-bold sm:text-base">
                        {event}
                      </span>

                      <span className="mt-0.5 block text-xs text-rose-100">
                        Date will be announced
                      </span>
                    </span>
                  </div>
                ))
              )}
            </div>

            <Link
              href="/public-notices"
              className="group mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-rose-700 shadow-lg transition hover:bg-rose-50 sm:mt-6"
            >
              See all updates

              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* NOTICE DETAIL MODAL */}
      {sel && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setSel(null)}
          role="dialog"
          aria-modal="true"
          aria-label={sel.title}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="nt-pop relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8"
          >
            <button
              type="button"
              onClick={() => setSel(null)}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-rose-100 hover:text-rose-700"
            >
              <X size={18} />
            </button>

            <div className="flex flex-wrap items-center gap-2 pr-10">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                  (CAT[sel.category] || CAT.General).chip
                }`}
              >
                {sel.category || "General"}
              </span>

              {sel.audience && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {sel.audience}
                </span>
              )}

              {isUpcoming(sel.publishDate) && (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                  UPCOMING
                </span>
              )}
            </div>

            <h3
              className={`${H} mt-3 text-xl font-black leading-snug text-slate-900 sm:text-2xl`}
            >
              {sel.title}
            </h3>

            <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <CalendarDays size={13} />
              Published {fmt(sel.publishDate)}
            </p>

            {sel.expiryDate && (
              <p className="mt-1 text-xs text-slate-500">
                Valid till {fmt(sel.expiryDate)}
              </p>
            )}

            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700 sm:text-base">
              {sel.description}
            </p>

            {sel.attachment && (
              <div className="mt-5">
                {isImage(sel.attachment) && (
                  <a
                    href={getAttachmentUrl(sel.attachment)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={getAttachmentUrl(sel.attachment)}
                      alt={
                        sel.attachmentOriginalName ||
                        sel.title ||
                        "Notice attachment"
                      }
                      className="mb-3 max-h-72 w-full rounded-2xl object-contain ring-1 ring-slate-200"
                    />
                  </a>
                )}

                <a
                  href={getAttachmentUrl(sel.attachment)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex max-w-full items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition hover:bg-rose-700"
                >
                  <Paperclip size={16} />

                  <span className="truncate">
                    {sel.attachmentOriginalName || "Open attachment"}
                  </span>

                  <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
