"use client";

import { useEffect, useRef, useState } from "react";
import { Sun, ShieldCheck, Building2, GraduationCap, MapPin, ArrowUpRight } from "lucide-react";

const H = "font-[family-name:var(--font-head)]";
const wrap = "mx-auto max-w-7xl px-5 md:px-8";

function useCountUp(target, start) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf;
    let t0;
    const step = (t) => {
      if (!t0) t0 = t;
      const p = Math.min((t - t0) / 1500, 1);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [start, target]);
  return n;
}

/*
  Tile = card with an animated (rotating light) border.
  wrapper  -> 1.5px padding + clipped rotating beam behind
  inner    -> the real card content on top
*/
function Tile({ i, shown, span = "", dark = false, shadow = "shadow-lg shadow-slate-900/5", className = "", children }) {
  return (
    <div
      className={`${shown ? "sg-in" : "opacity-0"} relative overflow-hidden rounded-2xl p-[1.5px] md:rounded-3xl ${
        dark ? "bg-white/10" : "bg-slate-200"
      } ${shadow} ${span}`}
      style={shown ? { animationDelay: `${i * 120}ms` } : undefined}
    >
      <span
        aria-hidden="true"
        className={`sg-beam ${dark ? "sg-beam-dark" : "sg-beam-light"}`}
        style={{ animationDelay: `-${i * 1.3}s` }}
      />
      <div className={`relative h-full overflow-hidden rounded-[14.5px] p-4 sm:p-5 md:rounded-[22.5px] md:p-7 ${className}`}>
        {children}
      </div>
    </div>
  );
}

/* facts = same array as before: [{ label, value }, ...]  (icons are not needed here) */
export default function SchoolGlanceBento({
  facts = [],
  schoolName = "Adarsha Markaz Academy",
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

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
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const get = (label, fallback) => facts.find((f) => f.label === label)?.value || fallback;
  const est = get("Established", "2014");
  const classes = get("Classes", "Nursery to Class XII");
  const timing = get("School timing", "9:00 AM – 12:35 PM");
  const board = get("School board", "ASSEB (Received Prior Permission)");
  const affil = get("Affiliated to", "Markazul Ma\u2019arif, Hojai");

  const years = Math.max(new Date().getFullYear() - (parseInt(est, 10) || 2014), 0);
  const yearsCount = useCountUp(years, shown);
  const [tStart, tEnd] = timing.split(/\s*[–-]\s*/);
  const [boardMain, boardNote] = board.replace(")", "").split(" (");

  return (
    <section className="relative bg-slate-50 pb-8 md:pb-10">
      <style>{`
        @keyframes sg-in{from{opacity:0;transform:translateY(28px) scale(.97)}to{opacity:1;transform:none}}
        @keyframes sg-grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
        @keyframes sg-spin{to{transform:rotate(360deg)}}
        @keyframes sg-draw{from{stroke-dashoffset:200}to{stroke-dashoffset:0}}
        @keyframes sg-glow{0%,100%{box-shadow:0 0 0 0 rgba(251,191,36,.55)}50%{box-shadow:0 0 0 14px rgba(251,191,36,0)}}
        .sg-in{animation:sg-in .8s cubic-bezier(.22,1,.36,1) both}
        .sg-grow{animation:sg-grow .7s cubic-bezier(.22,1,.36,1) both}
        .sg-spin{animation:sg-spin 22s linear infinite}
        .sg-draw{stroke-dasharray:200;animation:sg-draw 1.6s .4s ease-out both}
        .sg-glow{animation:sg-glow 2.4s ease-out infinite}

        /* animated border beam: big square, centred on the card, rotating behind it */
        .sg-beam{position:absolute;left:50%;top:50%;width:200%;aspect-ratio:1/1;margin-left:-100%;margin-top:-100%;animation:sg-spin 6s linear infinite;pointer-events:none}
        .sg-beam-light{background:conic-gradient(from 0deg,transparent 0%,transparent 58%,#60A5FA 80%,#F59E0B 96%,transparent 100%)}
        .sg-beam-dark{background:conic-gradient(from 0deg,transparent 0%,transparent 58%,#FBBF24 82%,#ffffff 97%,transparent 100%)}

        @media (prefers-reduced-motion:reduce){.sg-in,.sg-grow,.sg-spin,.sg-draw,.sg-glow,.sg-beam{animation:none!important;opacity:1!important}}
      `}</style>

      {/* Header band, continues the hero's navy */}
      <div className="relative overflow-hidden bg-[#0A1B33] pb-20 pt-8 md:pb-28 md:pt-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-500/25 blur-[90px] md:h-72 md:w-72 md:blur-[100px]" />
        <div className={`${wrap} relative text-center`}>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-blue-100 ring-1 ring-white/15 sm:px-3.5 sm:py-1.5 sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            School at a glance
          </span>
          <h2 className={`${H} mx-auto mt-3 max-w-2xl text-xl font-black leading-tight text-white sm:mt-4 sm:text-2xl md:text-4xl`}>
            {schoolName} <span className="text-amber-400">in five quick facts</span>
          </h2>
        </div>
      </div>

      {/* Bento grid */}
      <div className={`${wrap} -mt-12 md:-mt-16`}>
        <div ref={ref} className="grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-12 lg:gap-5">
          {/* 1. Established (tall) */}
          <Tile
            i={0}
            shown={shown}
            dark
            span="md:col-span-2 lg:col-span-4 lg:row-span-2"
            shadow="shadow-xl shadow-blue-900/20"
            className="flex min-h-[210px] flex-col justify-between bg-gradient-to-br from-[#0F2A4D] via-[#12366A] to-blue-700 text-white sm:min-h-[260px] lg:min-h-[300px]"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl md:h-48 md:w-48" />
            <p className="relative text-[13px] font-semibold text-blue-100 md:text-sm">Established</p>
            <div className="relative">
              <p
                className={`${H} text-[72px] font-black leading-none text-transparent sm:text-[110px] lg:text-[120px]`}
                style={{ WebkitTextStroke: "2px #FBBF24" }}
              >
                {est}
              </p>
              <div className="mt-3 flex items-center gap-3 md:mt-5">
                <span className="rounded-lg bg-amber-400 px-3 py-1.5 text-lg font-black text-slate-900 md:rounded-xl md:px-3.5 md:py-2 md:text-xl">
                  {yearsCount}+
                </span>
                <p className="text-[13px] leading-5 text-blue-100 md:text-sm">
                  years of teaching,
                  <br />
                  learning and growing
                </p>
              </div>
            </div>
          </Tile>

          {/* 2. Classes: rising staircase */}
          <Tile i={1} shown={shown} span="md:col-span-2 lg:col-span-8" className="bg-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[13px] font-medium text-slate-500 md:text-sm">Classes</p>
                <p className={`${H} mt-0.5 text-lg font-black text-slate-900 md:mt-1 md:text-2xl`}>{classes}</p>
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 md:h-11 md:w-11">
                <GraduationCap size={20} />
              </span>
            </div>
            <div className="mt-4 flex h-16 items-end gap-1 sm:mt-5 sm:h-24 sm:gap-2 md:mt-6 md:h-28">
              {Array.from({ length: 13 }).map((_, i) => (
                <span
                  key={i}
                  className={`flex-1 origin-bottom rounded-t-md ${
                    i === 12 ? "bg-gradient-to-t from-amber-500 to-amber-300" : "bg-gradient-to-t from-blue-700 to-blue-400"
                  } ${shown ? "sg-grow" : "scale-y-0"}`}
                  style={{
                    height: `${20 + i * (80 / 12)}%`,
                    animationDelay: shown ? `${400 + i * 70}ms` : undefined,
                  }}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-slate-500 md:mt-3 md:text-xs">
              <span>Nursery</span>
              <span className="hidden gap-2 sm:flex">
                {["Primary", "Middle", "Secondary"].map((s) => (
                  <span key={s} className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                    {s}
                  </span>
                ))}
              </span>
              <span>Class XII</span>
            </div>
          </Tile>

          {/* 3. Timing: sun arc (row on mobile, stacked from sm up) */}
          <Tile
            i={2}
            shown={shown}
            span="lg:col-span-4"
            className="bg-gradient-to-br from-amber-50 to-orange-50"
          >
            <p className="hidden text-sm font-medium text-amber-800/70 sm:block">School timing</p>
            <div className="flex items-center gap-4 sm:block">
              <div className="relative h-16 w-28 shrink-0 sm:mx-auto sm:mt-3 sm:h-24 sm:w-full sm:max-w-[220px]">
                <svg viewBox="0 0 140 72" className="h-full w-full">
                  <path d="M10 66 A60 60 0 0 1 130 66" fill="none" stroke="#FCD34D" strokeWidth="3" strokeDasharray="2 7" strokeLinecap="round" />
                  <path
                    d="M10 66 A60 60 0 0 1 130 66"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className={shown ? "sg-draw" : ""}
                  />
                  <circle cx="10" cy="66" r="4.5" fill="#F59E0B" />
                  <circle cx="130" cy="66" r="4.5" fill="#F59E0B" />
                </svg>
                <span className="sg-glow absolute left-1/2 top-0 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-amber-400 text-white sm:h-10 sm:w-10">
                  <Sun size={18} className="sm:h-[22px] sm:w-[22px]" />
                </span>
              </div>

              {/* mobile: label + one-line timing */}
              <div className="min-w-0 flex-1 sm:hidden">
                <p className="text-[13px] font-medium text-amber-800/70">School timing</p>
                <p className={`${H} mt-0.5 text-[15px] font-black leading-snug text-slate-900`}>{timing}</p>
              </div>

              {/* sm+: start / end under the arc */}
              <div className="mt-1 hidden items-center justify-between sm:flex">
                <p className={`${H} text-base font-black text-slate-900`}>{tStart}</p>
                <p className={`${H} text-base font-black text-slate-900`}>{tEnd}</p>
              </div>
            </div>
          </Tile>

          {/* 4. Board: rotating seal */}
          <Tile i={3} shown={shown} span="lg:col-span-4" className="flex items-center gap-4 bg-white sm:gap-5">
            <div className="relative h-20 w-20 shrink-0 text-blue-700 sm:h-28 sm:w-28">
              <svg viewBox="0 0 120 120" className="sg-spin absolute inset-0 h-full w-full">
                <defs>
                  <path id="sg-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
                </defs>
                <text fontSize="9.5" fontWeight="700" fill="currentColor" textLength="284" lengthAdjust="spacing">
                  <textPath href="#sg-circle">ASSEB • PRIOR PERMISSION • ASSEB • PRIOR PERMISSION •</textPath>
                </text>
              </svg>
              <span className="absolute inset-[19px] flex items-center justify-center rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100 sm:inset-[26px]">
                <ShieldCheck size={28} className="h-5 w-5 sm:h-7 sm:w-7" />
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-slate-500 md:text-sm">School board</p>
              <p className={`${H} mt-0.5 text-lg font-black text-slate-900 sm:mt-1 sm:text-xl`}>{boardMain}</p>
              {boardNote && <p className="mt-0.5 text-[13px] leading-5 text-slate-600 sm:mt-1 sm:text-sm">{boardNote}</p>}
            </div>
          </Tile>

          {/* 5. Affiliation banner */}
          <Tile
            i={4}
            shown={shown}
            dark
            span="md:col-span-2 lg:col-span-12"
            shadow="shadow-xl shadow-slate-900/10"
            className="flex flex-col gap-3.5 bg-[#0A1B33] text-white sm:flex-row sm:items-center sm:justify-between sm:gap-5"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
            />
            <div className="pointer-events-none absolute -right-10 top-0 h-full w-64 bg-gradient-to-l from-blue-600/30 to-transparent" />
            <div className="relative flex items-center gap-3.5 sm:gap-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-slate-900 sm:h-14 sm:w-14 sm:rounded-2xl">
                <Building2 size={22} className="sm:h-[26px] sm:w-[26px]" />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-blue-200 md:text-sm">Affiliated to</p>
                <p className={`${H} mt-0.5 text-lg font-black leading-snug sm:mt-1 md:text-2xl`}>{affil}</p>
              </div>
            </div>
            <span className="relative inline-flex items-center gap-1.5 self-start rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/15 sm:gap-2 sm:self-auto sm:px-4 sm:py-2 sm:text-sm">
              <MapPin size={15} className="text-amber-400" />
              Assam, India
              <ArrowUpRight size={14} className="text-blue-200" />
            </span>
          </Tile>
        </div>
      </div>
    </section>
  );
}