"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Eye, GraduationCap, RefreshCw, Star, TrendingUp, Users } from "lucide-react";

const H = "font-[family-name:var(--font-head)]";
const wrap = "mx-auto max-w-7xl px-5 md:px-8";
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://schoolnb.onrender.com").replace(/\/+$/, "");

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

/* one line of the notebook: icon | title ........ number */
function StatRow({ icon: Icon, value, title, index, shown }) {
  const display = useCountUp(value, shown);
  return (
    <li
      className={`relative flex items-center border-b border-sky-200 py-4 pl-[4.5rem] pr-5 transition duration-700 ease-out motion-reduce:transition-none sm:py-5 sm:pr-7 ${
        shown ? "translate-x-0 opacity-100" : "translate-x-5 opacity-0"
      }`}
      style={{ transitionDelay: shown ? `${200 + index * 130}ms` : "0ms" }}
    >
      <span className="absolute left-2.5 flex h-9 w-9 items-center justify-center rounded-md bg-[#0B3B2E] text-white sm:left-3 sm:h-10 sm:w-10">
        <Icon size={18} />
      </span>
      <span className={`${H} text-base font-black text-[#0B2A21] sm:text-xl`}>{title}</span>
      <span aria-hidden="true" className="mx-3 h-0 flex-1 border-b-2 border-dotted border-[#0B3B2E]/30" />
      <span className={`${H} text-4xl font-black tabular-nums text-[#0B3B2E] sm:text-5xl`}>{display}</span>
    </li>
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
    <section className="relative overflow-hidden bg-[#F5F6EF] py-16 text-[#0B2A21] md:py-24">
      {/* faint ruled-paper lines behind everything */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ backgroundImage: "repeating-linear-gradient(180deg,transparent 0 35px,rgba(11,59,46,.07) 35px 36px)" }}
      />

      <div ref={ref} className={`${wrap} relative grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16`}>
        {/* LEFT: heading + live visitors */}
        <div>
          <h2 className={`${H} text-3xl font-black leading-[1.1] text-[#0B3B2E] sm:text-4xl md:text-5xl`}>
            Growing through excellence
          </h2>
          <p className="mt-4 max-w-md text-base leading-7 text-[#3B5A4F] sm:text-lg sm:leading-8">
            A growing school family, and a community that keeps growing with us.
          </p>

          {/* live visitors: scoreboard plate */}
          <div
            className={`relative mt-8 overflow-hidden rounded-md bg-[#0B2A21] p-5 shadow-2xl shadow-emerald-950/30 ring-1 ring-black/20 transition duration-700 motion-reduce:transition-none sm:p-6 ${
              shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[#C8392F]" />

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="relative flex h-10 w-10 items-center justify-center rounded-md bg-amber-300 text-emerald-950 sm:h-12 sm:w-12">
                  <Eye size={21} />
                  <span className="absolute -right-1 -top-1 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#0B2A21]" />
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

            <div className="mt-5 flex justify-center sm:justify-start">
              <Odometer value={current} shown={shown} />
            </div>

            {delta > 0 && (
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-300 sm:justify-start">
                <TrendingUp size={14} /> +{delta.toLocaleString("en-IN")} since you opened this page
              </p>
            )}
          </div>
        </div>

        {/* RIGHT: notebook page with the three numbers */}
        <div
          className={`relative mx-auto w-full max-w-xl lg:rotate-[1.2deg] transition duration-700 motion-reduce:transition-none ${
            shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <span aria-hidden="true" className="absolute -top-3 left-1/2 z-10 h-6 w-20 -translate-x-1/2 -rotate-3 bg-[#F2C94C]/80 shadow-sm" />
          <div className="relative overflow-hidden rounded-sm bg-white shadow-2xl shadow-emerald-950/20 ring-1 ring-black/5">
            {/* red margin line */}
            <span aria-hidden="true" className="absolute inset-y-0 left-14 w-px bg-[#C8392F]/60 sm:left-[3.75rem]" />

            <div className="border-b-2 border-[#C8392F] py-4 pl-[4.5rem] pr-5">
              <p className={`${H} text-sm font-black uppercase tracking-wide text-[#C8392F]`}>Our achievements</p>
            </div>

            <ul>
              {stats.map((s, i) => (
                <StatRow key={s.title} {...s} index={i} shown={shown} />
              ))}
            </ul>

            <Link
              href="/online-admission"
              className="group flex items-center justify-between gap-4 bg-[#C8392F] py-5 pl-[4.5rem] pr-5 text-white transition hover:bg-[#A92D25] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white sm:pr-7"
            >
              <span>
                <span className={`${H} block text-lg font-black leading-tight sm:text-2xl`}>Join our school family</span>
                <span className="mt-0.5 block text-xs font-semibold text-white/85 sm:text-sm">Apply for admission</span>
              </span>
              <ArrowUpRight size={26} className="shrink-0 transition group-hover:rotate-45" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}