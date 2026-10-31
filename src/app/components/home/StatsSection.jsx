"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Eye, GraduationCap, RefreshCw, Star, TrendingUp, Users } from "lucide-react";

const H = "font-[family-name:var(--font-head)]";
const wrap = "mx-auto max-w-7xl px-5 md:px-8";
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");

/* ---- THEME: change these three lines to recolour the whole section ---- */
const BG = "bg-gradient-to-br from-emerald-800 via-emerald-900 to-[#022C22]"; // section background
const PANEL = "bg-[#022C22]"; // dark visitor panel
const ACCENT = "text-amber-300"; // gold highlight text

/* subtle 8-point star pattern (fits a school with an Islamic heritage) */
const STAR_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 60 60'><path d='M30 4 L36 16 L48 12 L44 24 L56 30 L44 36 L48 48 L36 44 L30 56 L24 44 L12 48 L16 36 L4 30 L16 24 L12 12 L24 16 Z' fill='none' stroke='white' stroke-width='1'/></svg>";
const STAR_BG = `url("data:image/svg+xml;utf8,${encodeURIComponent(STAR_SVG)}")`;

/* Counts up to the number inside a string like "1,234", "12+" or "—" (shown as-is). */
function useCountUp(value, start) {
  const raw = String(value ?? "");
  const target = parseInt(raw.replace(/[^0-9]/g, ""), 10);
  const numeric = Number.isFinite(target) && /\d/.test(raw);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!start || !numeric) return;
    let raf;
    let t0;
    const step = (t) => {
      if (!t0) t0 = t;
      const p = Math.min((t - t0) / 1600, 1);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [start, numeric, target]);

  if (!numeric) return raw;
  return n.toLocaleString("en-IN") + (raw.includes("+") ? "+" : "");
}

function StatTile({ icon: Icon, value, title, index, shown }) {
  const display = useCountUp(value, shown);
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur-md transition duration-700 ease-out hover:-translate-y-1 hover:bg-white/15 hover:ring-amber-300/50 motion-reduce:transition-none sm:rounded-3xl sm:p-6 ${
        shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
      style={{ transitionDelay: shown ? `${index * 110}ms` : "0ms" }}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-300/15 blur-2xl transition group-hover:bg-amber-300/30" />
      <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-200 to-amber-400 text-emerald-950 shadow-lg shadow-black/20 transition duration-500 group-hover:rotate-6 sm:h-12 sm:w-12 sm:rounded-2xl">
        <Icon size={20} />
      </span>
      <p className={`${H} relative mt-3 text-3xl font-black tabular-nums text-white sm:mt-4 sm:text-4xl lg:text-5xl`}>
        {display}
      </p>
      <p className="relative mt-0.5 text-xs font-semibold text-emerald-100/90 sm:text-sm">{title}</p>
    </div>
  );
}

/* One rolling digit (a 0-9 strip that slides to the right number) */
function Digit({ d }) {
  return (
    <span className="relative inline-block h-[1.3em] w-[0.82em] overflow-hidden rounded-md bg-black/40 ring-1 ring-amber-300/30 sm:rounded-lg">
      <span
        className="flex flex-col transition-transform duration-[1400ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none"
        style={{ transform: `translateY(-${d * 10}%)`, height: "1300%" }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="flex h-[1.3em] flex-none items-center justify-center font-black leading-none text-amber-300">
            {i}
          </span>
        ))}
      </span>
      <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-black/60" />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent" />
    </span>
  );
}

function Odometer({ value, shown }) {
  const text = value === null ? "—" : value.toLocaleString("en-IN");
  const chars = text.split("");
  return (
    <div className={`${H} flex items-center gap-1 text-[28px] sm:gap-1.5 sm:text-[44px]`} aria-label={text}>
      {chars.map((c, i) =>
        /\d/.test(c) ? (
          <Digit key={`${chars.length}-${i}`} d={shown ? Number(c) : 0} />
        ) : (
          <span key={`${chars.length}-${i}`} className="px-0.5 font-black text-white/70">
            {c}
          </span>
        )
      )}
    </div>
  );
}

/* Props: values you already compute in page.jsx.
   `visitors` is the NUMBER from useVisitors() (or null). The panel keeps itself
   up to date by polling GET /api/visitors every `pollMs`. */
export default function StatsSection({
  studentsValue = "—",
  teachersValue = "—",
  yearsOfService = 0,
  visitors = null,
  apiBase = API_BASE,
  pollMs = 30000,
}) {
  const ref = useRef(null);
  const baseRef = useRef(null);
  const [shown, setShown] = useState(false);
  const [live, setLive] = useState(null);
  const [spin, setSpin] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // keep the visitor total live
  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        setSpin(true);
        const res = await fetch(`${apiBase}/api/visitors`, { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        const total = Number(json?.data?.total ?? json?.total);
        if (alive && Number.isFinite(total)) setLive(total);
      } catch {
        /* keep last value */
      } finally {
        setTimeout(() => alive && setSpin(false), 900);
      }
    };
    const id = setInterval(load, pollMs);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [apiBase, pollMs]);

  const current = live ?? (Number.isFinite(visitors) ? visitors : null);
  useEffect(() => {
    if (current !== null && baseRef.current === null) baseRef.current = current;
  }, [current]);
  const delta = current !== null && baseRef.current !== null ? current - baseRef.current : 0;

  const stats = [
    { icon: GraduationCap, value: studentsValue, title: "Students" },
    { icon: Users, value: teachersValue, title: "Teachers" },
    { icon: Star, value: `${yearsOfService}+`, title: "Years of service" },
  ];

  return (
    <section className={`relative overflow-hidden ${BG} pb-16 pt-14 md:pb-24 md:pt-20`}>
      <style>{`
        @keyframes st-drift{0%,100%{transform:translate(0,0)}50%{transform:translate(40px,24px)}}
        .st-drift{animation:st-drift 16s ease-in-out infinite}
        @media (prefers-reduced-motion:reduce){.st-drift{animation:none}}
      `}</style>

      {/* background: star pattern + glows */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: STAR_BG, backgroundSize: "64px 64px" }} />
      <div className="st-drift pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-400/25 blur-[100px]" />
      <div className="st-drift pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-amber-300/20 blur-[100px]" />

      {/* shallow wave edges (white above, light grey below) */}
      <svg className="pointer-events-none absolute inset-x-0 top-0 block h-5 w-full text-white md:h-9" viewBox="0 0 1440 64" preserveAspectRatio="none" aria-hidden="true">
        <path fill="currentColor" d="M0 0H1440V44C1200 6 960 6 720 34C480 62 240 62 0 28Z" />
      </svg>
      <svg className="pointer-events-none absolute inset-x-0 bottom-0 block h-5 w-full rotate-180 text-slate-50 md:h-9" viewBox="0 0 1440 64" preserveAspectRatio="none" aria-hidden="true">
        <path fill="currentColor" d="M0 0H1440V44C1200 6 960 6 720 34C480 62 240 62 0 28Z" />
      </svg>

      <div ref={ref} className={`${wrap} relative grid items-center gap-7 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14`}>
        {/* LEFT: heading + live visitors */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
            Our achievements
          </span>
          <h2 className={`${H} mt-3 text-2xl font-black leading-tight text-white sm:text-3xl md:text-4xl lg:text-[44px]`}>
            Growing Through <span className={ACCENT}>Excellence</span>
          </h2>
          <p className="mt-2.5 max-w-md text-sm leading-6 text-emerald-100/90 sm:text-base">
            A growing school family, and a community that keeps growing with us.
          </p>

          {/* live visitors panel */}
          <div
            className={`relative mt-5 overflow-hidden rounded-3xl ${PANEL} p-4 shadow-2xl shadow-black/30 ring-1 ring-amber-300/30 transition duration-700 motion-reduce:transition-none sm:mt-6 sm:p-6 ${
              shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-300/15 blur-3xl" />

            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-amber-300 text-emerald-950 sm:h-12 sm:w-12 sm:rounded-2xl">
                  <Eye size={21} />
                  <span className="absolute -right-1 -top-1 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#022C22]" />
                  </span>
                </span>
                <div>
                  <p className={`${H} text-base font-black text-white sm:text-lg`}>Website visitors</p>
                  <p className="text-[11px] font-bold text-emerald-300 sm:text-xs">LIVE · updates automatically</p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-slate-200 ring-1 ring-white/15">
                <RefreshCw size={12} className={spin ? "animate-spin text-amber-300" : "text-slate-400"} />
                {Math.round(pollMs / 1000)}s
              </span>
            </div>

            <div className="relative mt-4 flex justify-center sm:mt-5 sm:justify-start">
              <Odometer value={current} shown={shown} />
            </div>

            {delta > 0 && (
              <p className="relative mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-300 sm:justify-start">
                <TrendingUp size={14} /> +{delta.toLocaleString("en-IN")} since you opened this page
              </p>
            )}
          </div>
        </div>

        {/* RIGHT: stat tiles + CTA */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {stats.map((s, i) => (
            <StatTile key={s.title} {...s} index={i} shown={shown} />
          ))}

          <Link
            href="/online-admission"
            className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 p-4 text-emerald-950 shadow-xl shadow-black/20 transition duration-700 ease-out hover:-translate-y-1 motion-reduce:transition-none sm:rounded-3xl sm:p-6 ${
              shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
            style={{ transitionDelay: shown ? "330ms" : "0ms" }}
          >
            <div className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-white/30 blur-2xl" />
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950 text-amber-300 transition group-hover:rotate-45 sm:h-12 sm:w-12 sm:rounded-2xl">
              <ArrowUpRight size={20} />
            </span>
            <div className="relative mt-3 sm:mt-4">
              <p className={`${H} text-lg font-black leading-tight sm:text-2xl`}>Join our school family</p>
              <p className="mt-1 text-xs font-semibold text-emerald-900 sm:text-sm">Apply for admission</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}