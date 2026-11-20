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

/* chips tuned for the dark theme */
const CAT = {
  General: { icon: Bell, chip: "bg-slate-400/15 text-slate-200 ring-slate-300/25" },
  Exam: { icon: ClipboardList, chip: "bg-rose-400/15 text-rose-200 ring-rose-300/25" },
  Holiday: { icon: Sun, chip: "bg-emerald-400/15 text-emerald-200 ring-emerald-300/25" },
  Fee: { icon: Wallet, chip: "bg-amber-400/15 text-amber-200 ring-amber-300/25" },
  Event: { icon: CalendarDays, chip: "bg-fuchsia-400/15 text-fuchsia-200 ring-fuchsia-300/25" },
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

  return !Number.isNaN(publishTime) && publishTime > Date.now();
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

  if (publishTime !== null && !Number.isNaN(publishTime) && publishTime > now) {
    return "upcoming";
  }

  if (expiryTime !== null && !Number.isNaN(expiryTime) && expiryTime < now) {
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
      const res = await fetch(`${API_BASE}/api/notices?limit=100&page=1`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Notices request failed (${res.status})`);
      }

      const json = await res.json();

      if (json.success === false || json._status === false) {
        throw new Error(json.message || json._message || "Unable to load notices");
      }

      const list = getNoticeArray(json);

      if (!Array.isArray(list)) {
        throw new Error("Invalid notice response");
      }

      // Active notices: published + upcoming.
      // Draft and Expired notices are excluded.
      const activeNotices = list
        .filter((notice) => {
          return notice.status === "Active" && getNoticeState(notice) !== "hidden";
        })
        .sort((a, b) => {
          const dateA = new Date(a.publishDate || a.createdAt || 0).getTime();

          const dateB = new Date(b.publishDate || b.createdAt || 0).getTime();

          return dateA - dateB;
        });

      setItems(activeNotices);
      setLastUpdated(new Date());
      setState("ready");
    } catch (error) {
      console.error("Homepage notices error:", error);

      setState((previous) => (previous === "ready" ? "ready" : "error"));
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

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);

      document.removeEventListener("visibilitychange", handleVisibility);
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
  const events = items.filter((notice) => notice.category === "Event").slice(0, 4);

  return (
    <section
      id="notices"
      className="relative overflow-hidden py-16 text-white md:py-24"
      style={{ background: "linear-gradient(180deg,#070B14 0%,#0F172A 100%)" }}
    >
      <style>{`
        @keyframes nt-pop{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}
        @keyframes nt-in{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:none}}
        .nt-pop{animation:nt-pop .35s cubic-bezier(.22,1,.36,1) both}
        .nt-in{animation:nt-in .6s cubic-bezier(.22,1,.36,1) both}
        @media (prefers-reduced-motion:reduce){.nt-pop,.nt-in{animation:none}}
      `}</style>

      {/* lime glows + fine dots */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-lime-400/15 blur-[110px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-emerald-400/15 blur-[110px]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(#d9f99d 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          WebkitMaskImage: "linear-gradient(180deg,#000,transparent 70%)",
          maskImage: "linear-gradient(180deg,#000,transparent 70%)",
        }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime-300/50 to-transparent" />

      <div className={`${wrap} relative grid gap-5 lg:grid-cols-[1.12fr_0.88fr] lg:gap-6`}>
        {/* NOTICES: live feed timeline */}
        <div className="rounded-[1.75rem] bg-gradient-to-br from-lime-300/50 via-white/10 to-emerald-300/30 p-px shadow-2xl shadow-black/40 sm:rounded-[2rem]">
          <div className="h-full rounded-[calc(1.75rem-1px)] bg-[#0B1220]/90 p-5 backdrop-blur-xl sm:rounded-[calc(2rem-1px)] sm:p-7 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-lime-300/10 px-3 py-1 text-[11px] font-bold text-lime-200 ring-1 ring-lime-300/30 sm:px-3.5 sm:py-1.5 sm:text-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" />
                  </span>
                  Live from the school office
                </span>

                <h2
                  className={`${H} mt-3 bg-gradient-to-b from-white to-lime-100 bg-clip-text text-3xl font-black text-transparent md:text-4xl`}
                >
                  Latest Notices
                </h2>

                <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                  Announcements, circulars and school updates
                </p>
              </div>

              <span className="rounded-2xl bg-lime-300 p-3 text-[#0B1220] shadow-[0_0_28px_rgba(190,242,100,0.45)] sm:p-3.5">
                <Bell size={22} />
              </span>
            </div>

            <div className="mt-7">
              {state === "loading" && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex animate-pulse items-center gap-4 rounded-2xl bg-white/5 p-4">
                      <div className="h-14 w-14 rounded-xl bg-white/10" />

                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 w-3/4 rounded bg-white/10" />
                        <div className="h-3 w-1/2 rounded bg-white/10" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {state === "error" && (
                <div className="rounded-2xl bg-rose-400/10 p-6 text-center ring-1 ring-rose-300/25">
                  <p className="text-sm font-semibold text-rose-200">Could not load notices right now.</p>

                  <button
                    type="button"
                    onClick={() => {
                      setState("loading");
                      load();
                    }}
                    className="mt-3 rounded-lg bg-lime-300 px-4 py-2 text-sm font-bold text-[#0B1220] transition hover:bg-lime-200"
                  >
                    Try again
                  </button>
                </div>
              )}

              {state === "ready" && notices.length === 0 && (
                <div className="flex flex-col items-center rounded-2xl bg-white/5 p-8 text-center ring-1 ring-white/10">
                  <Inbox size={34} className="text-lime-300/60" />

                  <p className="mt-3 text-sm font-semibold text-slate-200">No notices right now</p>

                  <p className="mt-1 text-xs text-slate-400">New notices from the school office will appear here.</p>
                </div>
              )}

              {state === "ready" && notices.length > 0 && (
                <ul className="relative space-y-3">
                  {/* timeline rail */}
                  <span
                    aria-hidden="true"
                    className="absolute bottom-6 left-7 top-6 w-px -translate-x-1/2 bg-gradient-to-b from-lime-300/70 via-lime-300/20 to-transparent sm:left-8"
                  />

                  {notices.map((notice, index) => {
                    const category = CAT[notice.category] || CAT.General;
                    const Icon = category.icon;

                    const upcoming = isUpcoming(notice.publishDate);

                    return (
                      <li key={notice._id} className="nt-in" style={{ animationDelay: `${index * 80}ms` }}>
                        <button
                          type="button"
                          onClick={() => open(notice)}
                          className="group flex w-full items-center gap-3 text-left sm:gap-4"
                        >
                          <span className="relative z-10 flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#0F1D14] ring-1 ring-lime-300/40 transition group-hover:bg-lime-300 group-hover:ring-lime-300 sm:h-16 sm:w-16">
                            <span
                              className={`${H} text-xl font-black leading-none text-lime-300 transition group-hover:text-[#0B1220] sm:text-2xl`}
                            >
                              {day(notice.publishDate)}
                            </span>

                            <span className="mt-0.5 text-[10px] font-bold uppercase text-lime-100/70 transition group-hover:text-[#0B1220]/80 sm:text-xs">
                              {mon(notice.publishDate)}
                            </span>
                          </span>

                          <span className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10 transition group-hover:bg-white/[0.08] group-hover:ring-lime-300/40 sm:p-4">
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-1.5">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 sm:text-[11px] ${category.chip}`}
                                >
                                  <Icon size={11} />
                                  {notice.category || "General"}
                                </span>

                                {upcoming ? (
                                  <span className="rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-black text-amber-950">
                                    UPCOMING
                                  </span>
                                ) : (
                                  isNew(notice.publishDate) && (
                                    <span className="rounded-full bg-lime-300 px-2 py-0.5 text-[10px] font-black text-[#0B1220]">
                                      NEW
                                    </span>
                                  )
                                )}

                                {notice.attachment && <Paperclip size={13} className="text-slate-400" />}
                              </span>

                              <span className="mt-1 block truncate text-sm font-bold text-white sm:text-base">
                                {notice.title || "Untitled Notice"}
                              </span>

                              <span className="mt-0.5 line-clamp-1 text-xs text-slate-400 sm:line-clamp-2 sm:text-sm">
                                {notice.description || ""}
                              </span>
                            </span>

                            <ArrowRight
                              size={17}
                              className="hidden shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-lime-300 sm:block"
                            />
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/public-notices"
                className="group inline-flex items-center gap-2 text-sm font-bold text-lime-300 transition hover:text-lime-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-300 sm:text-base"
              >
                View All Notices
                <ArrowRight size={17} className="transition group-hover:translate-x-1" />
              </Link>

              {lastUpdated && (
                <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 sm:text-xs">
                  <RefreshCw size={11} />
                  Updated {lastUpdated.toLocaleTimeString("en-IN")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* EVENTS: lime ticket stubs */}
        <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-lime-300 via-lime-300 to-emerald-300 p-5 text-[#0B1220] shadow-[0_24px_60px_-20px_rgba(163,230,53,0.45)] sm:rounded-[2rem] sm:p-7 md:p-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-14 h-56 w-56 rounded-full bg-white/40 blur-2xl" />

          <CalendarDays
            aria-hidden="true"
            size={170}
            strokeWidth={1}
            className="pointer-events-none absolute -bottom-8 -right-8 text-[#0B1220]/10"
          />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#0B1220] px-3 py-1 text-[11px] font-bold text-lime-200 sm:px-3.5 sm:py-1.5 sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-300" />
              School calendar
            </span>

            <h2 className={`${H} mt-3 text-3xl font-black md:text-4xl`}>Upcoming Events</h2>

            <div className="mt-6 space-y-3">
              {events.length > 0
                ? events.map((notice) => {
                    const upcoming = isUpcoming(notice.publishDate);

                    return (
                      <button
                        type="button"
                        key={notice._id}
                        onClick={() => open(notice)}
                        className="group flex w-full items-stretch overflow-hidden rounded-2xl bg-white/60 text-left shadow-sm ring-1 ring-[#0B1220]/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-lg"
                      >
                        <span className="flex w-16 shrink-0 flex-col items-center justify-center bg-[#0B1220] py-3 text-lime-300 sm:w-[4.5rem]">
                          <span className={`${H} text-2xl font-black leading-none`}>{day(notice.publishDate)}</span>

                          <span className="mt-1 text-[10px] font-bold uppercase text-lime-100/80">{mon(notice.publishDate)}</span>
                        </span>

                        <span className="flex min-w-0 flex-1 items-center gap-3 border-l-2 border-dashed border-[#0B1220]/25 p-3 sm:p-4">
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-1.5">
                              <span className="block truncate text-sm font-black sm:text-base">{notice.title}</span>

                              {upcoming && (
                                <span className="rounded-full bg-[#0B1220] px-2 py-0.5 text-[9px] font-black text-lime-200">
                                  UPCOMING
                                </span>
                              )}
                            </span>

                            <span className="mt-0.5 line-clamp-1 text-xs font-medium text-[#0B1220]/70">{notice.description}</span>
                          </span>

                          <ArrowRight size={16} className="shrink-0 transition group-hover:translate-x-1" />
                        </span>
                      </button>
                    );
                  })
                : fallbackEvents.map((event) => (
                    <div
                      key={event}
                      className="flex items-stretch overflow-hidden rounded-2xl bg-white/60 shadow-sm ring-1 ring-[#0B1220]/10 backdrop-blur"
                    >
                      <span className="flex w-16 shrink-0 items-center justify-center bg-[#0B1220] text-lime-300 sm:w-[4.5rem]">
                        <CalendarDays size={22} />
                      </span>

                      <span className="min-w-0 flex-1 border-l-2 border-dashed border-[#0B1220]/25 p-3 sm:p-4">
                        <span className="block text-sm font-black sm:text-base">{event}</span>

                        <span className="mt-0.5 block text-xs font-medium text-[#0B1220]/70">Date will be announced</span>
                      </span>
                    </div>
                  ))}
            </div>

            <Link
              href="/public-notices"
              className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0B1220] px-5 py-3 text-sm font-bold text-lime-300 shadow-lg transition hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1220] focus-visible:ring-offset-2 focus-visible:ring-offset-lime-300"
            >
              See all updates
              <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* NOTICE DETAIL MODAL */}
      {sel && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setSel(null)}
          role="dialog"
          aria-modal="true"
          aria-label={sel.title}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="nt-pop relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-[#0F172A] p-6 text-slate-100 shadow-2xl ring-1 ring-lime-300/25 sm:rounded-3xl sm:p-8"
          >
            <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-lime-400/20 blur-3xl" />

            <button
              type="button"
              onClick={() => setSel(null)}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-200 transition hover:bg-lime-300 hover:text-[#0B1220] focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-300"
            >
              <X size={18} />
            </button>

            <div className="relative flex flex-wrap items-center gap-2 pr-10">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${
                  (CAT[sel.category] || CAT.General).chip
                }`}
              >
                {sel.category || "General"}
              </span>

              {sel.audience && (
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/10">
                  {sel.audience}
                </span>
              )}

              {isUpcoming(sel.publishDate) && (
                <span className="rounded-full bg-amber-300 px-2.5 py-1 text-xs font-bold text-amber-950">UPCOMING</span>
              )}
            </div>

            <h3 className={`${H} relative mt-3 text-xl font-black leading-snug text-white sm:text-2xl`}>{sel.title}</h3>

            <p className="relative mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-lime-200/80">
              <CalendarDays size={13} />
              Published {fmt(sel.publishDate)}
            </p>

            {sel.expiryDate && <p className="relative mt-1 text-xs text-slate-400">Valid till {fmt(sel.expiryDate)}</p>}

            <p className="relative mt-4 whitespace-pre-line text-sm leading-7 text-slate-300 sm:text-base">{sel.description}</p>

            {sel.attachment && (
              <div className="relative mt-5">
                {isImage(sel.attachment) && (
                  <a href={getAttachmentUrl(sel.attachment)} target="_blank" rel="noopener noreferrer">
                    <img
                      src={getAttachmentUrl(sel.attachment)}
                      alt={sel.attachmentOriginalName || sel.title || "Notice attachment"}
                      className="mb-3 max-h-72 w-full rounded-2xl object-contain ring-1 ring-white/15"
                    />
                  </a>
                )}

                <a
                  href={getAttachmentUrl(sel.attachment)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex max-w-full items-center gap-2 rounded-xl bg-lime-300 px-5 py-3 text-sm font-bold text-[#0B1220] shadow-[0_10px_28px_-8px_rgba(190,242,100,0.6)] transition hover:bg-lime-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Paperclip size={16} />

                  <span className="truncate">{sel.attachmentOriginalName || "Open attachment"}</span>

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