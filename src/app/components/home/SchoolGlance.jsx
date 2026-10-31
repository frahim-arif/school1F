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

  const tile = "relative overflow-hidden rounded-3xl p-6 md:p-7";
  const anim = (i) => ({
    className: shown ? "sg-in" : "opacity-0",
    style: shown ? { animationDelay: `${i * 120}ms` } : undefined,
  });

  return (
    <section className="relative bg-slate-50 pb-10">
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
        @media (prefers-reduced-motion:reduce){.sg-in,.sg-grow,.sg-spin,.sg-draw,.sg-glow{animation:none!important;opacity:1!important}}
      `}</style>

      {/* Header band, continues the hero's navy */}
      <div className="relative overflow-hidden bg-[#0A1B33] pb-24 pt-10 md:pb-28 md:pt-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-blue-500/25 blur-[100px]" />
        <div className={`${wrap} relative text-center`}>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-blue-100 ring-1 ring-white/15">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            School at a glance
          </span>
          <h2 className={`${H} mx-auto mt-4 max-w-2xl text-2xl font-black leading-tight text-white md:text-4xl`}>
            Adarsha Markaz Academy,{" "}
<span className="text-amber-400">in five quick facts</span>
          </h2>
        </div>
      </div>

      {/* Bento grid */}
      <div className={`${wrap} -mt-14 md:-mt-16`}>
        <div ref={ref} className="grid gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-5">
          {/* 1. Established (tall) */}
          <div
            {...anim(0)}
            className={`${tile} flex min-h-[300px] flex-col justify-between bg-gradient-to-br from-[#0F2A4D] via-[#12366A] to-blue-700 text-white shadow-xl shadow-blue-900/20 md:col-span-2 lg:col-span-4 lg:row-span-2 ${anim(0).className}`}
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <p className="relative text-sm font-semibold text-blue-100">Established</p>
            <div className="relative">
              <p
                className={`${H} text-[96px] font-black leading-none text-transparent sm:text-[120px]`}
                style={{ WebkitTextStroke: "2px #FBBF24" }}
              >
                {est}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <span className="rounded-xl bg-amber-400 px-3.5 py-2 text-xl font-black text-slate-900">
                  {yearsCount}+
                </span>
                <p className="text-sm leading-5 text-blue-100">
                  years of teaching,
                  <br />
                  learning and growing
                </p>
              </div>
            </div>
          </div>

          {/* 2. Classes: rising staircase */}
          <div
            {...anim(1)}
            className={`${tile} bg-white shadow-lg shadow-slate-900/5 ring-1 ring-slate-200 md:col-span-2 lg:col-span-8 ${anim(1).className}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Classes</p>
                <p className={`${H} mt-1 text-xl font-black text-slate-900 md:text-2xl`}>{classes}</p>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <GraduationCap size={22} />
              </span>
            </div>
            <div className="mt-6 flex h-28 items-end gap-1.5 sm:gap-2">
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
            <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500">
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
          </div>

          {/* 3. Timing: sun arc */}
          <div
            {...anim(2)}
            className={`${tile} bg-gradient-to-br from-amber-50 to-orange-50 ring-1 ring-amber-100 lg:col-span-4 ${anim(2).className}`}
          >
            <p className="text-sm font-medium text-amber-800/70">School timing</p>
            <div className="relative mx-auto mt-3 h-24 max-w-[220px]">
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
              <span className="sg-glow absolute left-1/2 top-0 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-amber-400 text-white">
                <Sun size={22} />
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <p className={`${H} text-base font-black text-slate-900`}>{tStart}</p>
              <p className={`${H} text-base font-black text-slate-900`}>{tEnd}</p>
            </div>
          </div>

          {/* 4. Board: rotating seal */}
          <div
            {...anim(3)}
            className={`${tile} flex items-center gap-5 bg-white shadow-lg shadow-slate-900/5 ring-1 ring-slate-200 lg:col-span-4 ${anim(3).className}`}
          >
            <div className="relative h-28 w-28 shrink-0 text-blue-700">
              <svg viewBox="0 0 120 120" className="sg-spin absolute inset-0 h-full w-full">
                <defs>
                  <path id="sg-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
                </defs>
                <text fontSize="9.5" fontWeight="700" fill="currentColor" textLength="284" lengthAdjust="spacing">
                  <textPath href="#sg-circle">ASSEB • PRIOR PERMISSION • ASSEB • PRIOR PERMISSION •</textPath>
                </text>
              </svg>
              <span className="absolute inset-[26px] flex items-center justify-center rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                <ShieldCheck size={28} />
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500">School board</p>
              <p className={`${H} mt-1 text-xl font-black text-slate-900`}>{boardMain}</p>
              {boardNote && <p className="mt-1 text-sm leading-5 text-slate-600">{boardNote}</p>}
            </div>
          </div>

          {/* 5. Affiliation banner */}
          <div
            {...anim(4)}
            className={`${tile} flex flex-col gap-5 bg-[#0A1B33] text-white shadow-xl shadow-slate-900/10 sm:flex-row sm:items-center sm:justify-between md:col-span-2 lg:col-span-12 ${anim(4).className}`}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
            />
            <div className="pointer-events-none absolute -right-10 top-0 h-full w-64 bg-gradient-to-l from-blue-600/30 to-transparent" />
            <div className="relative flex items-center gap-5">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-slate-900">
                <Building2 size={26} />
              </span>
              <div>
                <p className="text-sm font-medium text-blue-200">Affiliated to</p>
                <p className={`${H} mt-1 text-xl font-black md:text-2xl`}>{affil}</p>
              </div>
            </div>
            <span className="relative inline-flex items-center gap-2 self-start rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15 sm:self-auto">
              <MapPin size={16} className="text-amber-400" />
              Assam, India
              <ArrowUpRight size={15} className="text-blue-200" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}