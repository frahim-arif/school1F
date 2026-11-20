"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, GraduationCap, MapPin, Plane, ShieldCheck, Sun } from "lucide-react";

const H = "font-[family-name:var(--font-head)]";
const wrap = "mx-auto max-w-7xl px-5 md:px-8";

/* ---------- default school facts ----------
   Established 2019 is confirmed. The other values are PLACEHOLDERS:
   replace them with the school's real details (or pass `facts` as a prop). */
const DEFAULT_FACTS = [
  { label: "Established", value: "2019" },
  { label: "Classes", value: "Class 1 to Class 8" },
  { label: "School timing", value: "9:00 AM - 3:30 PM" },
  { label: "School board", value: "SEBA" },
  { label: "Affiliated to", value: "Government of Assam" },
];

/* ---------- helpers ---------- */
function useCountUp(target, start) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
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
  }, [start, target]);
  return n;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  return reduced;
}

/* "9:00 AM" -> 9, "12:35 PM" -> 12.58 */
function toHours(str = "") {
  const m = str.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (!m) return null;
  let h = parseInt(m[1], 10) % 12;
  if ((m[3] || "").toUpperCase() === "PM") h += 12;
  return h + parseInt(m[2] || "0", 10) / 60;
}

/* ---------- glass tile: gradient border, cursor spotlight, subtle 3D tilt ---------- */
function Tile({ i, shown, span = "", bg = "rgba(8,30,72,.62)", className = "", reduced, children }) {
  const cardRef = useRef(null);

  const onMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    el.style.setProperty("--mx", `${px}px`);
    el.style.setProperty("--my", `${py}px`);
    if (!reduced) {
      const x = px / r.width - 0.5;
      const y = py / r.height - 0.5;
      el.style.transform = `translateY(-4px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg)`;
    }
  };
  const onLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = "";
  };

  return (
    <div
      className={`${shown ? "pm-in" : "opacity-0"} flex [perspective:1100px] ${span}`}
      style={shown ? { animationDelay: `${i * 110}ms` } : undefined}
    >
      <div
        ref={cardRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="group flex min-w-0 flex-1 rounded-[1.75rem] bg-gradient-to-br from-white/45 via-white/10 to-sky-300/35 p-px shadow-2xl shadow-black/40 transition-transform duration-200 ease-out will-change-transform sm:rounded-[2rem]"
      >
        <div
          className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[calc(1.75rem-1px)] p-5 backdrop-blur-xl sm:rounded-[calc(2rem-1px)] sm:p-6 md:p-8"
          style={{ background: bg, boxShadow: "inset 0 1px 0 rgba(255,255,255,.14)" }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(380px circle at var(--mx,50%) var(--my,50%), rgba(125,211,252,.2), transparent 45%)",
            }}
          />
          <div className={`relative flex-1 ${className}`}>{children}</div>
        </div>
      </div>
    </div>
  );
}

const label = "text-sm font-medium text-sky-200/75";
const BARS = [3, 1, 2, 1, 3, 2, 1, 1, 3, 2, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2];
const STARS = [
  ["18%", "16%", "0s"],
  ["34%", "8%", "1.2s"],
  ["62%", "20%", "2.1s"],
  ["86%", "12%", "0.6s"],
  ["74%", "42%", "2.8s"],
];

/* facts = [{ label, value }, ...]
   labels: "Established", "Classes", "School timing", "School board", "Affiliated to" */
export default function SchoolGlancePremium({
  facts = DEFAULT_FACTS,
  schoolName = "Niz Dhing GyanDeep Jatiya Bidyalaya",
  udise = "18100102011",
  location = "Niz Dhing, Nagaon, Assam",
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);
  const reduced = useReducedMotion();

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
      { threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const get = (l) => facts.find((f) => f.label === l)?.value || "";
  const est = get("Established");
  const classes = get("Classes");
  const timing = get("School timing");
  const board = get("School board");
  const affil = get("Affiliated to");
  const empty = "Details coming soon";

  const estYear = parseInt(est, 10);
  const years = estYear ? Math.max(new Date().getFullYear() - estYear, 0) : 0;
  const yearsCount = useCountUp(years, shown);

  const [classFrom, classTo] = classes.split(/\s+to\s+/i);

  const [tStart, tEnd] = timing ? timing.split(/\s*[–—-]\s*/) : [];
  const D0 = 6;
  const D1 = 18;
  const sH = toHours(tStart);
  const eH = toHours(tEnd);
  const hasWindow = sH !== null && eH !== null && eH > sH;
  const clamp = (v) => Math.min(Math.max(v, D0), D1);
  const winLeft = hasWindow ? ((clamp(sH) - D0) / (D1 - D0)) * 100 : 0;
  const winWidth = hasWindow ? ((clamp(eH) - clamp(sH)) / (D1 - D0)) * 100 : 0;

  const flight = "M20 92 C 100 92, 120 22, 200 48 S 320 98, 380 26";
  const ringMask = "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))";

  const copyUdise = async () => {
    try {
      await navigator.clipboard.writeText(udise);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      /* clipboard not available */
    }
  };

  return (
    <section
      className="relative overflow-hidden pb-32 pt-16 text-white sm:pt-20 md:pb-40 md:pt-28"
      style={{ background: "linear-gradient(180deg,#061A3A 0%,#0A2A5E 60%,#0A2A5E 100%)" }}
    >
      <style>{`
        @keyframes pm-in{from{opacity:0;transform:translateY(34px) scale(.97)}to{opacity:1;transform:none}}
        @keyframes pm-spin{to{transform:rotate(360deg)}}
        @keyframes pm-trail{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
        @keyframes pm-ripple{0%{transform:scale(.3);opacity:.8}100%{transform:scale(1);opacity:0}}
        @keyframes pm-pop{from{opacity:0;transform:translateY(14px) scale(.7)}to{opacity:1;transform:none}}
        @keyframes pm-win{from{width:0}}
        @keyframes pm-twinkle{0%,100%{opacity:.25}50%{opacity:.95}}
        @keyframes pm-sheen{0%,55%{transform:translateX(-120%) skewX(-20deg)}100%{transform:translateX(520%) skewX(-20deg)}}
        @keyframes pm-shoot{0%{transform:translate(0,0) rotate(32deg);opacity:0}4%{opacity:1}16%{transform:translate(420px,262px) rotate(32deg);opacity:0}100%{transform:translate(420px,262px) rotate(32deg);opacity:0}}
        @keyframes pm-wave{to{transform:translateX(-50%)}}
        .pm-in{animation:pm-in .9s cubic-bezier(.22,1,.36,1) both}
        .pm-orbit{animation:pm-spin 22s linear infinite}
        .pm-ring{animation:pm-spin 10s linear infinite}
        .pm-trail{stroke-dasharray:1;animation:pm-trail 3.2s .6s linear both}
        .pm-ripple{animation:pm-ripple 3.2s ease-out infinite}
        .pm-pop{animation:pm-pop .6s cubic-bezier(.34,1.56,.64,1) both}
        .pm-win{animation:pm-win 1.4s .5s cubic-bezier(.22,1,.36,1) both}
        .pm-star{animation:pm-twinkle 4s ease-in-out infinite}
        .pm-sheen{animation:pm-sheen 7s ease-in-out infinite}
        .pm-shoot{animation:pm-shoot 9s ease-out 2s infinite}
        .pm-wave1{animation:pm-wave 26s linear infinite}
        .pm-wave2{animation:pm-wave 40s linear infinite reverse}
        @media (prefers-reduced-motion:reduce){.pm-in,.pm-orbit,.pm-ring,.pm-trail,.pm-ripple,.pm-pop,.pm-win,.pm-star,.pm-sheen,.pm-shoot,.pm-wave1,.pm-wave2{animation:none!important;opacity:1!important;stroke-dashoffset:0!important}.pm-shoot,.pm-sheen{display:none}}
      `}</style>

      {/* aurora glows + fine dot field */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/4 h-[30rem] w-[30rem] rounded-full bg-sky-500/30 blur-[130px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-1/2 h-[26rem] w-[26rem] rounded-full bg-blue-500/30 blur-[130px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-0 h-[22rem] w-[22rem] rounded-full bg-cyan-400/20 blur-[120px]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(rgba(186,230,253,.7) 1px, transparent 1px)",
          backgroundSize: "38px 38px",
          WebkitMaskImage: "linear-gradient(180deg,#000,transparent 70%)",
          maskImage: "linear-gradient(180deg,#000,transparent 70%)",
        }}
      />
      {STARS.map(([l, t, d], i) => (
        <span
          key={i}
          aria-hidden="true"
          className="pm-star pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-white"
          style={{ left: l, top: t, animationDelay: d }}
        />
      ))}
      {/* one shooting star */}
      <span
        aria-hidden="true"
        className="pm-shoot pointer-events-none absolute left-[8%] top-16 h-px w-28 bg-gradient-to-r from-transparent via-sky-200 to-white opacity-0"
      />

      {/* layered waves at the bottom */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 overflow-hidden md:h-32">
        <svg viewBox="0 0 1200 100" preserveAspectRatio="none" className="pm-wave2 absolute bottom-0 h-full w-[200%] text-sky-400/15" fill="currentColor">
          <path d="M0 55 C100 15 200 95 300 55 S500 15 600 55 S800 95 900 55 S1100 15 1200 55 V100 H0 Z" />
        </svg>
        <svg viewBox="0 0 1200 100" preserveAspectRatio="none" className="pm-wave1 absolute -bottom-1 h-[80%] w-[200%] text-sky-300/20" fill="currentColor">
          <path d="M0 50 C100 10 200 90 300 50 S500 10 600 50 S800 90 900 50 S1100 10 1200 50 V100 H0 Z" />
        </svg>
      </div>

      <div className={`${wrap} relative`}>
        {/* Heading */}
        <div className="max-w-4xl">
          <h2
            className={`${H} bg-gradient-to-b from-white via-white to-sky-200 bg-clip-text text-[28px] font-black leading-tight text-transparent sm:text-4xl md:text-5xl md:leading-[1.08] lg:text-6xl`}
          >
            {schoolName}
          </h2>
          <span aria-hidden="true" className="mt-5 block h-1 w-28 rounded-full bg-gradient-to-r from-sky-300 via-white to-transparent" />
          <p className="mt-5 max-w-xl text-base leading-7 text-sky-100/80 sm:text-lg">
            Our school at a glance: the facts that matter, from takeoff to today.
          </p>
        </div>

        <div ref={ref} className="mt-10 grid gap-4 sm:gap-5 md:mt-16 md:grid-cols-2 md:gap-6 lg:grid-cols-12">
          {/* 1. Established */}
          <Tile
            i={0}
            shown={shown}
            reduced={reduced}
            span="md:col-span-2 lg:col-span-5 lg:row-span-2"
            bg="linear-gradient(160deg,#38BDF8 0%,#1D7CE0 48%,#0B3A9A 100%)"
            className="flex min-h-[280px] flex-col justify-between sm:min-h-[320px] lg:min-h-[440px]"
          >
            {/* sheen sweep */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
              <span className="pm-sheen absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              {STARS.map(([l, t, d], i) => (
                <span key={i} className="pm-star absolute h-1 w-1 rounded-full bg-white" style={{ left: l, top: t, animationDelay: d }} />
              ))}
            </div>

            {/* orbit rings */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-28 top-1/2 h-[260px] w-[260px] -translate-y-1/2 opacity-60 sm:-right-16 sm:h-[340px] sm:w-[340px] sm:opacity-80"
            >
              <span className="absolute inset-0 rounded-full border border-white/25" />
              <span className="absolute inset-[11%] rounded-full border border-white/25" />
              <span className="absolute inset-[21%] rounded-full border border-white/30" />
              <span className="absolute inset-[32%] rounded-full bg-white/10 shadow-[0_0_60px_20px_rgba(255,255,255,0.15)]" />
              <div className="pm-orbit absolute inset-0">
                <span className="absolute left-1/2 top-0 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-300 shadow-[0_0_24px_8px_rgba(253,224,71,0.7)] sm:h-4 sm:w-4" />
              </div>
            </div>

            <p className="relative text-sm font-medium text-sky-50/90">Established</p>
            <div className="relative">
              <p
                className={`${H} text-[clamp(72px,19vw,140px)] font-black leading-none tracking-tight drop-shadow-[0_8px_24px_rgba(6,26,58,0.5)]`}
              >
                {est || "—"}
              </p>
              {years > 0 && (
                <div className="mt-5 inline-flex items-center gap-3 rounded-2xl bg-white/15 p-2 pr-4 ring-1 ring-white/30 backdrop-blur sm:mt-6 sm:pr-5">
                  <span className="rounded-xl bg-white px-3 py-2 text-lg font-black text-sky-700 sm:px-3.5 sm:text-xl">{yearsCount}+</span>
                  <p className="text-[13px] leading-5 text-white sm:text-sm">
                    years of teaching,
                    <br />
                    learning and growing
                  </p>
                </div>
              )}
            </div>
          </Tile>

          {/* 2. Classes */}
          <Tile i={1} shown={shown} reduced={reduced} span="md:col-span-2 lg:col-span-7">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={label}>Classes</p>
                <p className={`${H} mt-1 text-lg font-black sm:text-xl md:text-2xl`}>{classes || empty}</p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-400/20 text-sky-200 ring-1 ring-sky-300/30 sm:h-11 sm:w-11">
                <GraduationCap size={22} />
              </span>
            </div>

            <svg viewBox="0 0 400 120" className="mt-4 h-24 w-full sm:h-32" role="img" aria-label="Flight path from first to last class">
              <defs>
                <linearGradient id="pm-grad" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
              <path d={flight} fill="none" stroke="rgba(186,230,253,.28)" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 9" />
              <path
                d={flight}
                pathLength="1"
                fill="none"
                stroke="url(#pm-grad)"
                strokeWidth="4"
                strokeLinecap="round"
                className={shown ? "pm-trail" : ""}
                style={{
                  filter: "drop-shadow(0 0 6px rgba(125,211,252,.9))",
                  ...(shown ? {} : { strokeDasharray: 1, strokeDashoffset: 1 }),
                }}
              />
              <circle cx="20" cy="92" r="7" fill="#0A2A5E" stroke="#7DD3FC" strokeWidth="3.5" />
              <circle cx="380" cy="26" r="9" fill="#FDE047" stroke="#fff" strokeWidth="3" style={{ filter: "drop-shadow(0 0 8px rgba(253,224,71,.9))" }} />
              {shown &&
                (reduced ? (
                  <g transform="translate(380 26) rotate(-30)">
                    <polygon points="13,0 -12,-9 -5,0 -12,9" fill="#fff" />
                  </g>
                ) : (
                  <g style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,.9))" }}>
                    <polygon points="13,0 -12,-9 -5,0 -12,9" fill="#fff" />
                    <animateMotion path={flight} dur="3.2s" begin="0.6s" fill="freeze" rotate="auto" />
                  </g>
                ))}
            </svg>

            {classTo && (
              <div className="flex items-center justify-between gap-2 text-xs font-bold sm:text-sm">
                <span className="truncate rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/20 sm:px-3.5">{classFrom}</span>
                <span className="truncate rounded-full bg-sky-400 px-3 py-1.5 text-sky-950 sm:px-3.5">{classTo}</span>
              </div>
            )}
          </Tile>

          {/* 3. Timing */}
          <Tile i={2} shown={shown} reduced={reduced} span="md:col-span-2 lg:col-span-7">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={label}>School timing</p>
                <p className={`${H} mt-1 text-lg font-black sm:text-xl md:text-2xl`}>{timing || empty}</p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-yellow-300/15 text-yellow-300 ring-1 ring-yellow-300/30 sm:h-11 sm:w-11">
                <Sun size={22} />
              </span>
            </div>

            {hasWindow && (
              <div className="mt-6 sm:mt-7">
                <div
                  className="relative h-12 rounded-full ring-1 ring-white/20 sm:h-14"
                  style={{
                    background:
                      "linear-gradient(90deg,#C98B52 0%,#2B7FD6 25%,#49B4FF 50%,#2B7FD6 75%,#C9715A 100%)",
                  }}
                >
                  <div
                    className={`${shown ? "pm-win" : ""} absolute inset-y-1.5 flex items-center overflow-hidden rounded-full bg-white shadow-[0_0_34px_rgba(125,211,252,.85)]`}
                    style={{ left: `${winLeft}%`, width: `${winWidth}%` }}
                  >
                    <span className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-yellow-300 text-yellow-700 sm:ml-1.5 sm:h-8 sm:w-8">
                      <Sun size={16} />
                    </span>
                    <span className="ml-2 hidden truncate pr-3 text-sm font-bold text-sky-950 sm:inline">School hours</span>
                  </div>
                </div>
                <div className="mt-2.5 flex justify-between text-[10px] font-semibold text-sky-200/70 sm:text-xs">
                  {["6 AM", "9 AM", "12 PM", "3 PM", "6 PM"].map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
            )}
          </Tile>

          {/* 4. Board seal */}
          <Tile i={3} shown={shown} reduced={reduced} span="md:col-span-2 lg:col-span-5" className="flex items-center gap-4 sm:gap-6">
            <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
              <div
                className="pm-ring absolute inset-0 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg,#7DD3FC,#ffffff,#38BDF8,#0EA5E9,#7DD3FC)",
                  WebkitMask: ringMask,
                  mask: ringMask,
                }}
              />
              <span className="absolute inset-3 flex items-center justify-center rounded-full bg-gradient-to-br from-sky-400/35 to-blue-600/35 text-white shadow-[inset_0_0_24px_rgba(125,211,252,.35)] ring-1 ring-white/25">
                <ShieldCheck size={34} />
              </span>
            </div>
            <div className="min-w-0">
              <p className={label}>School board</p>
              <p className={`${H} mt-1 text-lg font-black leading-snug sm:text-xl`}>{board || empty}</p>
              {affil && <p className="mt-1.5 text-sm leading-5 text-sky-100/75">Affiliated to {affil}</p>}
            </div>
          </Tile>

          {/* 5. Location radar */}
          <Tile i={4} shown={shown} reduced={reduced} span="md:col-span-2 lg:col-span-7" className="flex items-center gap-4 sm:gap-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-8 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(125,211,252,.25) 1px,transparent 1px),linear-gradient(90deg,rgba(125,211,252,.25) 1px,transparent 1px)",
                backgroundSize: "30px 30px",
                WebkitMaskImage: "radial-gradient(circle at 20% 50%,#000,transparent 65%)",
                maskImage: "radial-gradient(circle at 20% 50%,#000,transparent 65%)",
              }}
            />
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center sm:h-32 sm:w-32">
              {[0, 1, 2].map((r) => (
                <span
                  key={r}
                  className="pm-ripple absolute inset-0 rounded-full border-2 border-sky-300"
                  style={{ animationDelay: `${r * 1.05}s` }}
                />
              ))}
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-300 to-blue-600 text-white shadow-[0_0_30px_rgba(56,189,248,.8)] sm:h-14 sm:w-14">
                <MapPin size={24} />
              </span>
            </div>
            <div className="relative min-w-0">
              <p className={label}>Where to find us</p>
              <p className={`${H} mt-1 text-xl font-black leading-tight sm:text-2xl md:text-3xl`}>{location}</p>
            </div>
          </Tile>

          {/* 6. UDISE boarding pass */}
          <div
            className={`${shown ? "pm-in" : "opacity-0"} md:col-span-2 lg:col-span-12`}
            style={shown ? { animationDelay: "600ms" } : undefined}
          >
            <div className="rounded-[1.75rem] bg-gradient-to-br from-white/45 via-white/10 to-sky-300/35 p-px shadow-2xl shadow-black/40 sm:rounded-[2rem]">
              <div
                className="relative flex flex-col overflow-hidden rounded-[calc(1.75rem-1px)] backdrop-blur-xl sm:rounded-[calc(2rem-1px)] md:flex-row"
                style={{ background: "rgba(8,30,72,.62)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.14)" }}
              >
                <div
                  className="relative flex shrink-0 items-center justify-between gap-4 p-5 sm:p-6 md:w-64 md:flex-col md:items-start md:p-8"
                  style={{ background: "linear-gradient(160deg,#38BDF8,#0B3A9A)" }}
                >
                  <div>
                    <p className="text-sm font-medium text-sky-50/90">UDISE code</p>
                    <p className={`${H} text-lg font-black leading-tight sm:text-xl`}>Our official school ID</p>
                  </div>
                  <Plane size={32} className="shrink-0 md:self-end" />
                </div>

                <span aria-hidden="true" className="absolute top-0 hidden h-7 w-7 -translate-y-1/2 rounded-full bg-[#0A2A5E] md:left-64 md:-ml-3.5 md:block" />
                <span aria-hidden="true" className="absolute bottom-0 hidden h-7 w-7 translate-y-1/2 rounded-full bg-[#0A2A5E] md:left-64 md:-ml-3.5 md:block" />

                <div className="flex min-w-0 flex-1 flex-col justify-center gap-4 border-t-2 border-dashed border-sky-300/40 p-5 sm:p-6 md:gap-5 md:border-l-2 md:border-t-0 md:p-8">
                  <ul
                    className="grid w-full max-w-[34rem] gap-1 sm:gap-2"
                    style={{ gridTemplateColumns: `repeat(${udise.length}, minmax(0, 1fr))` }}
                    aria-label={`UDISE code ${udise}`}
                  >
                    {udise.split("").map((d, i) => (
                      <li
                        key={i}
                        className={`${H} ${shown ? "pm-pop" : "opacity-0"} flex aspect-[3/4] items-center justify-center rounded-lg bg-white/10 text-[clamp(14px,4.4vw,26px)] font-black text-white ring-1 ring-white/25 [text-shadow:0_0_14px_rgba(125,211,252,.9)] sm:rounded-xl`}
                        style={shown ? { animationDelay: `${800 + i * 70}ms` } : undefined}
                      >
                        {d}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={copyUdise}
                      className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 sm:text-sm"
                    >
                      {copied ? <Check size={15} className="text-emerald-300" /> : <Copy size={15} />}
                      <span aria-live="polite">{copied ? "Copied" : "Copy ID"}</span>
                    </button>
                    <div aria-hidden="true" className="hidden items-end gap-[3px] opacity-60 sm:flex">
                      {BARS.map((w, i) => (
                        <span key={i} className="h-5 rounded-[1px] bg-sky-100" style={{ width: `${w + 1}px` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}