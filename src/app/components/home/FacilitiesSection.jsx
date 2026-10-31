"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const H = "font-[family-name:var(--font-head)]";
const wrap = "mx-auto max-w-7xl px-5 md:px-8";
const DURATION = 4800; // ms per facility

/* facilities = [{ icon: LucideIcon, title, desc }, ...]  (same array as before, 6 items) */
export default function FacilitiesSection({ facilities = [] }) {
  const n = facilities.length;
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);

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

  // auto-rotate (stops on hover/touch, and for people who prefer reduced motion)
  useEffect(() => {
    if (!shown || paused || n < 2) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => {
      setActive((a) => (a + 1) % n);
      setTick((t) => t + 1);
    }, DURATION);
    return () => clearTimeout(id);
  }, [shown, paused, active, tick, n]);

  const go = (i) => {
    setActive((i + n) % n);
    setTick((t) => t + 1);
  };

  if (!n) return null;
  const cur = facilities[active];
  const CurIcon = cur.icon;

  return (
    <section
      id="facilities"
      style={{ scrollMarginTop: "5rem" }}
      className="relative overflow-hidden bg-white py-16 md:py-28"
    >
      <style>{`
        @keyframes fc-in{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
        @keyframes fc-icon{from{opacity:0;transform:scale(.6) rotate(-12deg)}to{opacity:1;transform:none}}
        @keyframes fc-spin{to{transform:rotate(360deg)}}
        @keyframes fc-bar{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        .fc-in{animation:fc-in .6s cubic-bezier(.22,1,.36,1) both}
        .fc-icon{animation:fc-icon .7s cubic-bezier(.22,1,.36,1) both}
        .fc-spin{animation:fc-spin 26s linear infinite}
        @media (prefers-reduced-motion:reduce){.fc-in,.fc-icon,.fc-spin{animation:none}}
      `}</style>

      {/* background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(#E2E8F0 1px, transparent 1px), linear-gradient(90deg, #E2E8F0 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 85% 20%, black, transparent 70%)",
          maskImage: "radial-gradient(ellipse 70% 60% at 85% 20%, black, transparent 70%)",
        }}
      />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" />

      <div
        ref={ref}
        className={`${wrap} relative grid items-start gap-8 transition duration-700 motion-reduce:transition-none lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 ${
          shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          setPaused(false);
          setTick((t) => t + 1);
        }}
        onTouchStart={() => setPaused(true)}
      >
        {/* LEFT: heading + list */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            Our facilities
          </span>
          <h2 className={`${H} mt-4 text-2xl font-black leading-tight text-slate-900 sm:text-3xl md:text-4xl lg:text-[42px]`}>
            Everything Students Need to <span className="text-blue-700">Grow</span>
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600 sm:text-base md:leading-7">
            A comfortable, safe and modern environment designed to support learning and student development.
          </p>

          {/* chips on mobile, vertical list on desktop */}
          <div className="-mx-5 mt-6 flex gap-2.5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] lg:mx-0 lg:mt-8 lg:flex-col lg:gap-2.5 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
            {facilities.map(({ icon: Icon, title }, i) => {
              const on = i === active;
              return (
                <button
                  key={title}
                  type="button"
                  onClick={() => go(i)}
                  onMouseEnter={() => i !== active && go(i)}
                  aria-pressed={on}
                  className={`group flex shrink-0 items-center gap-2.5 rounded-full px-3.5 py-2.5 text-left text-sm font-bold transition duration-300 lg:w-full lg:gap-4 lg:rounded-2xl lg:px-4 lg:py-3.5 lg:text-base ${
                    on
                      ? "bg-gradient-to-r from-[#0F2A4D] to-blue-700 text-white shadow-lg shadow-blue-900/20 lg:translate-x-2"
                      : "bg-slate-50 text-slate-700 ring-1 ring-slate-200 hover:bg-white hover:ring-blue-200"
                  }`}
                >
                  <span className={`${H} hidden w-6 text-sm font-black lg:block ${on ? "text-amber-400" : "text-slate-300"}`}>
                    0{i + 1}
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full lg:h-10 lg:w-10 lg:rounded-xl ${
                      on ? "bg-white/15 text-white" : "bg-white text-blue-600 ring-1 ring-slate-200"
                    }`}
                  >
                    <Icon size={17} />
                  </span>
                  <span className="whitespace-nowrap lg:flex-1 lg:whitespace-normal">{title}</span>
                  <ArrowRight
                    size={17}
                    className={`hidden transition lg:block ${on ? "text-amber-400" : "text-slate-300 group-hover:text-blue-500"}`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: showcase card */}
        <div className="relative lg:sticky lg:top-28">
          <div className="absolute -inset-2 rounded-[32px] bg-gradient-to-br from-blue-200 to-amber-100 blur-xl" />
          <div className="relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A1B33] via-[#0F2A4D] to-[#143A6B] p-6 text-white shadow-2xl shadow-blue-900/30 sm:p-8 lg:min-h-[480px] lg:p-10">
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
            />
            <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-blue-500/30 blur-[70px]" />
            <div className="absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-amber-400/15 blur-[70px]" />
            <span
              key={`n-${active}`}
              className={`${H} fc-in pointer-events-none absolute -right-2 top-2 select-none text-[110px] font-black leading-none text-transparent sm:text-[150px]`}
              style={{ WebkitTextStroke: "1.5px rgba(255,255,255,.12)" }}
            >
              0{active + 1}
            </span>

            {/* top row: counter + arrows */}
            <div className="relative flex items-center justify-between">
              <p className="text-sm font-semibold text-blue-100">
                Facility <span className="text-amber-400">0{active + 1}</span> / 0{n}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => go(active - 1)}
                  aria-label="Previous facility"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 transition hover:bg-amber-400 hover:text-slate-900"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => go(active + 1)}
                  aria-label="Next facility"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 transition hover:bg-amber-400 hover:text-slate-900"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* icon + text */}
            <div key={active} className="relative mt-6 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7 lg:mt-0">
              <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28 lg:h-36 lg:w-36">
                <div className="fc-spin absolute inset-0 rounded-full border-2 border-dashed border-amber-400/60" />
                <div className="absolute inset-3 rounded-full bg-amber-400/20 blur-xl" />
                <div className="fc-icon absolute inset-3 flex items-center justify-center rounded-full bg-gradient-to-br from-white to-blue-100 text-blue-700 shadow-xl ring-4 ring-white/20 lg:inset-4">
                  <CurIcon size={40} className="lg:h-12 lg:w-12" />
                </div>
              </div>
              <div className="fc-in">
                <h3 className={`${H} text-2xl font-black leading-tight sm:text-3xl lg:text-[34px]`}>{cur.title}</h3>
                <p className="mt-2.5 max-w-md text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">{cur.desc}</p>
              </div>
            </div>

            {/* bottom: progress + dots + link */}
            <div className="relative mt-7">
              <div className="flex items-center gap-1.5">
                {facilities.map((f, i) => (
                  <button
                    key={f.title}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Show ${f.title}`}
                    className={`relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/20`}
                  >
                    {i < active && <span className="absolute inset-0 bg-white/60" />}
                    {i === active && (
                      <span
                        key={`${active}-${tick}`}
                        className="absolute inset-y-0 left-0 w-full origin-left bg-amber-400"
                        style={{
                          animation: `fc-bar ${DURATION}ms linear forwards`,
                          animationPlayState: paused ? "paused" : "running",
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
              <Link
                href="/gallery"
                className="group mt-5 inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300"
              >
                See our campus in the gallery
                <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}