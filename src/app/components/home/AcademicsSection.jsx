"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Palette,
  Users,
} from "lucide-react";

const H = "font-[family-name:var(--font-head)]";
const wrap = "mx-auto max-w-7xl px-5 md:px-8";
const CYCLE_MS = 7000;

/* One look per program, in order */
const LOOKS = [
  { grad: "from-sky-400 to-blue-600", glow: "rgba(56,189,248,.45)", stage: "Foundation" },
  { grad: "from-blue-500 to-indigo-600", glow: "rgba(99,102,241,.45)", stage: "Growth" },
  { grad: "from-cyan-400 to-sky-600", glow: "rgba(34,211,238,.4)", stage: "Excellence" },
  { grad: "from-indigo-500 to-blue-700", glow: "rgba(79,70,229,.45)", stage: "Beyond the classroom" },
];

/* Agar programs prop khali ho to ye sample dikhte hain. Apni details bhej do to badal dunga. */
const DEFAULT_PROGRAMS = [
  { icon: BookOpen, title: "Primary Education", desc: "A joyful start where children build reading, writing and number skills along with good habits." },
  { icon: Users, title: "Middle School", desc: "Strong concepts across subjects, with guidance that builds curiosity, discipline and confidence." },
  { icon: GraduationCap, title: "Secondary Education", desc: "Focused preparation for board examinations and for the next step in every student's journey." },
  { icon: Palette, title: "Co-curricular Activities", desc: "Sports, culture and creative activities that shape character and leadership outside the classroom." },
];

/* programs = [{ icon: LucideIcon, title, desc }, ...]  (same array as before, up to 4 items) */
export default function AcademicsSection({ programs = [] }) {
  const items = programs.length ? programs : DEFAULT_PROGRAMS;
  const total = items.length;

  const ref = useRef(null);
  const tabsRef = useRef(null);
  const tabRefs = useRef([]);
  const [shown, setShown] = useState(false);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

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
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* auto cycle (pauses on hover/focus, off for reduced motion) */
  useEffect(() => {
    if (!shown || paused || reduced || total < 2) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % total), CYCLE_MS);
    return () => clearTimeout(id);
  }, [active, shown, paused, reduced, total]);

  /* keep the active tab visible in the horizontal mobile strip (no page scroll) */
  useEffect(() => {
    const box = tabsRef.current;
    const tab = tabRefs.current[active];
    if (!box || !tab || box.scrollWidth <= box.clientWidth + 2) return;
    box.scrollTo({ left: tab.offsetLeft - 20, behavior: reduced ? "auto" : "smooth" });
  }, [active, reduced]);

  const onKeyDown = (e) => {
    const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const n = (active + keys[e.key] + total) % total;
    setActive(n);
    tabRefs.current[n]?.focus();
  };

  const cur = items[active];
  const look = LOOKS[active % LOOKS.length];
  const CurIcon = cur.icon;
  const num = String(active + 1).padStart(2, "0");

  return (
    <section
      id="academics"
      style={{ scrollMarginTop: "5rem", background: "linear-gradient(180deg,#F6FBFF 0%,#E8F4FF 100%)" }}
      className="relative overflow-hidden py-16 text-[#0A2A5E] sm:py-20 md:py-28"
    >
      <style>{`
        @keyframes ac-in{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes ac-bar{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        @keyframes ac-spin{to{transform:rotate(360deg)}}
        @keyframes ac-pulse{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.08);opacity:.9}}
        .ac-in{animation:ac-in .7s cubic-bezier(.22,1,.36,1) both}
        .ac-spin{animation:ac-spin 28s linear infinite}
        .ac-pulse{animation:ac-pulse 4s ease-in-out infinite}
        .ac-tabs{scrollbar-width:none}
        .ac-tabs::-webkit-scrollbar{display:none}
        @media (prefers-reduced-motion:reduce){.ac-in,.ac-spin,.ac-pulse,.ac-bar{animation:none!important;opacity:1!important}}
      `}</style>

      {/* soft glows + fine dots */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-sky-300/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-indigo-300/30 blur-3xl" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "radial-gradient(#0A2A5E 1px, transparent 1px)", backgroundSize: "30px 30px" }}
      />

      <div className={`${wrap} relative`}>
        {/* Heading */}
        <div className="max-w-3xl">
          <h2
            className={`${H} bg-gradient-to-b from-[#0A2A5E] to-[#1D6FD8] bg-clip-text text-3xl font-black leading-[1.1] text-transparent sm:text-4xl md:text-5xl lg:text-6xl`}
          >
            Learning for every stage
          </h2>
          <span aria-hidden="true" className="mt-5 block h-1 w-24 rounded-full bg-gradient-to-r from-sky-500 to-transparent" />
          <p className="mt-5 max-w-xl text-base leading-7 text-[#35557F] sm:text-lg">
            Our academic programmes are designed to build strong foundations and prepare students for a successful
            future.
          </p>
        </div>

        {/* Showcase */}
        <div
          ref={ref}
          className={`mt-10 grid gap-5 transition duration-700 motion-reduce:transition-none md:mt-14 lg:grid-cols-[0.82fr_1.18fr] lg:gap-8 ${
            shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {/* TABS: horizontal strip on mobile, vertical list on desktop */}
          <div
            ref={tabsRef}
            role="tablist"
            aria-label="Academic programmes"
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
            className="ac-tabs -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2 lg:mx-0 lg:grid lg:content-start lg:gap-3 lg:overflow-visible lg:px-0 lg:pb-0"
          >
            {items.map(({ icon: Icon, title }, i) => {
              const on = i === active;
              const l = LOOKS[i % LOOKS.length];
              return (
                <button
                  key={title}
                  ref={(el) => (tabRefs.current[i] = el)}
                  type="button"
                  role="tab"
                  id={`ac-tab-${i}`}
                  aria-selected={on}
                  aria-controls="ac-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  className={`group relative min-w-[14.5rem] shrink-0 snap-start overflow-hidden rounded-2xl p-3.5 text-left outline-none transition duration-300 focus-visible:ring-2 focus-visible:ring-[#0A2A5E] lg:min-w-0 lg:p-4 ${
                    on
                      ? `bg-gradient-to-br ${l.grad} text-white shadow-xl shadow-sky-600/30`
                      : "bg-white/85 ring-1 ring-sky-100 backdrop-blur hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-sky-500/15 hover:ring-sky-300"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                        on ? "bg-white/20 text-white ring-1 ring-white/40" : "bg-sky-50 text-sky-600 ring-1 ring-sky-100"
                      }`}
                    >
                      <Icon size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[11px] font-bold ${on ? "text-white/80" : "text-[#35557F]"}`}>
                        0{i + 1} · {l.stage}
                      </p>
                      <p className={`${H} truncate text-[15px] font-black leading-tight sm:text-base`}>{title}</p>
                    </div>
                    <ChevronRight
                      size={18}
                      className={`hidden shrink-0 transition lg:block ${on ? "translate-x-0.5 text-white" : "text-sky-400 group-hover:translate-x-0.5"}`}
                    />
                  </div>

                  {on && !reduced && total > 1 && (
                    <span className="absolute inset-x-0 bottom-0 h-1 bg-white/25">
                      <span
                        key={`${active}-${paused}`}
                        className="ac-bar absolute inset-0 origin-left bg-white"
                        style={{
                          animation: `ac-bar ${CYCLE_MS}ms linear forwards`,
                          animationPlayState: paused ? "paused" : "running",
                        }}
                      />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* DETAIL PANEL */}
          <div className="rounded-[1.75rem] bg-gradient-to-br from-sky-300 via-white to-blue-400 p-[2px] shadow-2xl shadow-sky-900/25 sm:rounded-[2rem]">
            <div
              id="ac-panel"
              role="tabpanel"
              aria-labelledby={`ac-tab-${active}`}
              className="relative flex min-h-[26rem] flex-col justify-between overflow-hidden rounded-[calc(1.75rem-2px)] p-6 text-white sm:rounded-[calc(2rem-2px)] sm:p-8 md:p-10"
              style={{ background: "linear-gradient(145deg,#0B3A9A 0%,#0A2A5E 55%,#061A3A 100%)" }}
            >
              {/* panel glows + dots */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl transition-colors duration-700"
                style={{ background: look.glow }}
              />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.08]"
                style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
              />

              {/* giant outlined number */}
              <span
                key={`n-${active}`}
                aria-hidden="true"
                className={`${H} ac-in pointer-events-none absolute -bottom-6 right-3 select-none text-[150px] font-black leading-none text-transparent sm:text-[220px]`}
                style={{ WebkitTextStroke: "2px rgba(125,211,252,0.28)" }}
              >
                {num}
              </span>

              {/* content (re-animates on change) */}
              <div key={active} className="relative">
                <div className="ac-in flex items-start justify-between gap-4">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold ring-1 ring-white/25 backdrop-blur sm:text-sm">
                    <span className="h-2 w-2 rounded-full bg-sky-300 shadow-[0_0_10px_rgba(125,211,252,.9)]" />
                    {look.stage}
                  </span>
                </div>

                <div className="ac-in mt-8 flex items-center gap-5" style={{ animationDelay: "80ms" }}>
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center sm:h-24 sm:w-24">
                    <span className="ac-pulse absolute inset-0 rounded-full border border-sky-300/50" />
                    <svg viewBox="0 0 100 100" className="ac-spin absolute inset-1 h-[calc(100%-0.5rem)] w-[calc(100%-0.5rem)]" aria-hidden="true">
                      <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(186,230,253,.55)" strokeWidth="1.5" strokeDasharray="3 8" strokeLinecap="round" />
                    </svg>
                    <span
                      className={`relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${look.grad} text-white shadow-[0_0_30px_rgba(56,189,248,.7)] sm:h-16 sm:w-16`}
                    >
                      <CurIcon size={28} />
                    </span>
                  </div>
                </div>

                <h3 className={`${H} ac-in mt-6 text-2xl font-black leading-tight sm:text-3xl md:text-4xl`} style={{ animationDelay: "140ms" }}>
                  {cur.title}
                </h3>
                <p className="ac-in mt-3 max-w-xl text-[15px] leading-7 text-sky-100/85 sm:text-base sm:leading-8" style={{ animationDelay: "200ms" }}>
                  {cur.desc}
                </p>
              </div>

              {/* stage tracker */}
              <div className="relative mt-10">
                <div className="flex items-center">
                  {items.map((it, i) => (
                    <div key={it.title} className={`flex items-center ${i < total - 1 ? "flex-1" : ""}`}>
                      <button
                        type="button"
                        onClick={() => setActive(i)}
                        aria-label={`Show ${it.title}`}
                        className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black outline-none ring-2 transition focus-visible:ring-white ${
                          i === active
                            ? "bg-white text-[#0A2A5E] ring-sky-300 shadow-[0_0_18px_rgba(125,211,252,.9)]"
                            : i < active
                              ? "bg-sky-400 text-[#061A3A] ring-sky-400"
                              : "bg-white/10 text-white/70 ring-white/25 hover:bg-white/20"
                        }`}
                      >
                        {i + 1}
                      </button>
                      {i < total - 1 && (
                        <span className="mx-1 h-0.5 flex-1 rounded-full bg-white/15">
                          <span
                            className="block h-full rounded-full bg-gradient-to-r from-sky-300 to-white transition-all duration-700"
                            style={{ width: i < active ? "100%" : "0%" }}
                          />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2 hidden justify-between text-[11px] font-semibold text-sky-200/70 sm:flex">
                  {items.map((_, i) => (
                    <span key={i} className={i === active ? "text-white" : ""}>
                      {LOOKS[i % LOOKS.length].stage}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center md:mt-14">
          <Link
            href="/academics"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-700 px-7 py-3.5 font-bold text-white shadow-[0_10px_28px_-8px_rgba(14,165,233,0.8)] transition hover:from-sky-400 hover:to-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2A5E] focus-visible:ring-offset-2"
          >
            Explore Academics
            <ArrowRight size={18} className="transition group-hover:translate-x-1" />
          </Link>
          <Link
            href="/online-admission"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/80 px-7 py-3.5 font-bold text-[#0B3A9A] ring-1 ring-sky-200 backdrop-blur transition hover:bg-white hover:ring-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2A5E]"
          >
            Apply for Admission <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}