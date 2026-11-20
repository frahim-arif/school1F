"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronLeft, ChevronRight, Eye } from "lucide-react";

const H = "font-[family-name:var(--font-head)]";
const DURATION = 6500; // ms per slide

/* ------------------------------------------------------------------
   Rang yahin se badal sakte ho:
   DARK   = section ka gehra background
   MID    = gradient ka doosra rang
   ACCENT = buttons, line, progress bar (logo ke lal jaisa)
   GOLD   = visitors badge
------------------------------------------------------------------ */
const DARK = "#0B2A21";
const MID = "#14503E";
const ACCENT = "#FF6B4A";
const GOLD = "#FFD166";

/* ------------------------------------------------------------------
   EDIT HERE: 3 photos public/images/ me rakho aur naam set karo.
   Slide 1 pehle school.heroImage (API) use karta hai, agar ho.
   pos = photo ka focus point (mobile me crop hone par kaam aata hai),
         jaise "center 25%" agar bachchon ke chehre upar hain.
------------------------------------------------------------------ */
const SLIDES = [
  {
    image: "/images/hero-3.jpg",
    pos: "center",
    thumb: "Morning Prayer",
    tag: "Admissions open",
    line1: "Where Every Day",
    line2: "Begins With Values.",
    text: "Our students start each morning together in prayer, building discipline, respect and a calm mind for learning.",
    cta: { label: "Apply for Admission", href: "/online-admission" },
  },
  {
    image: "/images/hero-2.jpg",
    pos: "center",
    thumb: "School Campus",
    tag: "Our campus",
    line1: "A Green Campus,",
    line2: "A Growing Future.",
    text: "A friendly and open campus in Niz Dhing where children learn, play and grow with the guidance of caring teachers.",
    cta: { label: "View Gallery", href: "/gallery" },
  },
  {
    image: "/images/hero-1.jpg",
    pos: "center",
    thumb: "Our Students",
    tag: "Discipline & learning",
    line1: "Learning Together,",
    line2: "Standing Tall.",
    text: "Hundreds of students, one school family, united by dedication and the will to do better every day.",
    cta: { label: "Meet Our Teachers", href: "/teachers" },
  },
];

export default function HeroSlider({
  schoolName = "Our School",
  school = {},
  visitorsValue = "—",
  studentsValue = "—",
  teachersValue = "—",
  yearsOfService = 0,
}) {
  const total = SLIDES.length;
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);
  const touch = useRef(null);

  const images = SLIDES.map((s, i) => (i === 0 ? school.heroImage || s.image : s.image));

  const goTo = useCallback(
    (next) => {
      const n = (next + total) % total;
      if (n === current) return;
      setPrev(current);
      setCurrent(n);
      setTick((t) => t + 1);
    },
    [current, total]
  );

  // Autoplay (restarts whenever the slide changes or hover ends)
  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => goTo(current + 1), DURATION);
    return () => clearTimeout(id);
  }, [current, paused, tick, goTo]);

  // Tab chhupa ho to autoplay ruk jaye
  useEffect(() => {
    const onVis = () => {
      setPaused(document.hidden);
      if (!document.hidden) setTick((t) => t + 1);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const slide = SLIDES[current];
  const bar = (key) => (
    <span
      key={key}
      className="hs-anim absolute inset-y-0 left-0 w-full origin-left"
      style={{
        background: ACCENT,
        animation: `hs-bar ${DURATION}ms linear forwards`,
        animationPlayState: paused ? "paused" : "running",
      }}
    />
  );

  return (
    <section
      id="home"
      aria-label={`${schoolName} welcome`}
      className="relative flex min-h-[100svh] flex-col overflow-hidden pt-16 sm:pt-20"
      style={{ background: DARK }}
      /* Sirf mouse hover pe pause. Touch pe pause atak jata tha. */
      onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        setPaused(false);
        setTick((t) => t + 1);
      }}
      onTouchStart={(e) => {
        const t = e.touches[0];
        touch.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchEnd={(e) => {
        if (!touch.current) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - touch.current.x;
        const dy = t.clientY - touch.current.y;
        touch.current = null;
        // Sirf clear horizontal swipe; vertical scroll ko mat rokna
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) goTo(current + (dx < 0 ? 1 : -1));
      }}
    >
      <style>{`
        @keyframes hs-reveal{from{clip-path:inset(0 0 0 100%)}to{clip-path:inset(0 0 0 0)}}
        @keyframes hs-zoom{from{transform:scale(1.18)}to{transform:scale(1)}}
        @keyframes hs-up{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}
        @keyframes hs-bar{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        @keyframes hs-line{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        .hs-reveal{animation:hs-reveal 1.1s cubic-bezier(.77,0,.18,1) both}
        .hs-zoom{animation:hs-zoom 8s ease-out both}
        .hs-up{opacity:0;animation:hs-up .8s cubic-bezier(.22,1,.36,1) forwards}
        @media (prefers-reduced-motion:reduce){.hs-anim,.hs-reveal,.hs-zoom,.hs-up{animation:none!important;opacity:1!important;clip-path:none!important}}
      `}</style>

      {/* Slides: mobile me normal flow (upar photo), md+ me poore section ka background */}
      <div className="relative h-[clamp(230px,40svh,360px)] w-full shrink-0 md:absolute md:inset-0 md:h-auto">
        {SLIDES.map((s, i) => {
          const active = i === current;
          const leaving = i === prev;
          return (
            <div
              key={s.image}
              aria-hidden={!active}
              className={`absolute inset-0 ${
                active ? "hs-reveal z-20" : leaving ? "z-10" : "invisible z-0"
              }`}
            >
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(135deg, ${MID}, ${DARK})` }}
              />
              <img
                src={images[i]}
                alt={s.thumb}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                onError={(e) => (e.currentTarget.style.display = "none")}
                className={`h-full w-full object-cover ${active ? "hs-zoom" : ""}`}
                style={{ objectPosition: s.pos || "center" }}
              />
            </div>
          );
        })}
        {/* Readability overlays */}
        <div
          className="absolute inset-0 z-20 hidden md:block"
          style={{
            background: `linear-gradient(to right, ${DARK}, ${DARK}c0 45%, ${DARK}1a)`,
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 z-20 hidden h-1/2 md:block"
          style={{ background: `linear-gradient(to top, ${DARK}, transparent)` }}
        />
        {/* Mobile: photo neeche se dheere dheere section me ghul jaye */}
        <div
          className="absolute inset-x-0 bottom-0 z-20 h-24 md:hidden"
          style={{ background: `linear-gradient(to top, ${DARK}, ${DARK}99 45%, transparent)` }}
        />
        <div
          className="absolute inset-x-0 top-0 z-20 h-16 md:hidden"
          style={{ background: `linear-gradient(to bottom, ${DARK}99, transparent)` }}
        />
        <div
          className="absolute inset-0 z-20 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
      </div>

      {/* Content (mobile pe photo ke upar thoda overlap hota hai) */}
      <div className="relative z-30 mx-auto -mt-10 flex w-full max-w-7xl flex-1 items-start px-4 pb-6 sm:px-6 md:mt-0 md:items-center md:px-8 md:py-12">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_300px]">
          <div key={current} className="max-w-2xl">
            <div className="hs-up flex flex-wrap items-center gap-2 md:gap-3" style={{ animationDelay: "0.35s" }}>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-50 ring-1 ring-white/20 backdrop-blur md:gap-2 md:px-4 md:py-2 md:text-sm">
                <span className="h-1.5 w-1.5 rounded-full md:h-2 md:w-2" style={{ background: ACCENT }} />
                {slide.tag}
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur md:gap-2 md:px-3.5 md:py-2 md:text-sm"
                style={{
                  color: GOLD,
                  background: `${GOLD}1a`,
                  boxShadow: `inset 0 0 0 1px ${GOLD}40`,
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
                    style={{ background: GOLD }}
                  />
                  <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: GOLD }} />
                </span>
                <Eye size={14} className="md:h-[15px] md:w-[15px]" /> {visitorsValue} visitors
              </span>
            </div>

            <h1
              className={`${H} mt-3.5 text-[28px] font-black leading-[1.12] text-white min-[400px]:text-[32px] sm:text-4xl md:mt-6 md:text-5xl md:leading-[1.15] lg:text-6xl`}
            >
              <span className="hs-up block" style={{ animationDelay: "0.5s" }}>
                {slide.line1}
              </span>
              <span className="hs-up block" style={{ animationDelay: "0.65s", color: ACCENT }}>
                {slide.line2}
              </span>
            </h1>

            <span
              className="hs-anim mt-3.5 block h-1 w-12 origin-left rounded-full md:mt-6 md:w-20"
              style={{ background: GOLD, animation: "hs-line .9s .8s cubic-bezier(.22,1,.36,1) both" }}
            />

            <p
              className="hs-up mt-3.5 line-clamp-3 max-w-xl text-sm leading-6 text-emerald-50/90 sm:text-base sm:leading-7 md:mt-6 md:line-clamp-none md:text-lg md:leading-8"
              style={{ animationDelay: "0.85s" }}
            >
              {slide.text}
            </p>

            {/* Mobile: primary button poori width, secondary neeche; sm+ me side by side */}
            <div className="hs-up mt-5 grid grid-cols-2 gap-2.5 sm:flex sm:gap-3 md:mt-8" style={{ animationDelay: "1s" }}>
              <Link
                href={slide.cta.href}
                className="group col-span-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition active:scale-[0.98] hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:px-6 md:px-7 md:py-4 md:text-base"
                style={{ background: ACCENT, boxShadow: `0 10px 25px -8px ${ACCENT}99` }}
              >
                <span>{slide.cta.label}</span>
                <ArrowRight size={17} className="shrink-0 transition group-hover:translate-x-1" />
              </Link>
              <Link
                href="/homework"
                className="col-span-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white ring-1 ring-white/35 backdrop-blur transition active:scale-[0.98] hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:px-6 md:px-7 md:py-4 md:text-base"
              >
                <BookOpen size={17} className="shrink-0" /> <span>Homework</span>
              </Link>
            </div>
          </div>

          {/* Thumbnail selector (large screens) */}
          <div className="hidden flex-col gap-3 lg:flex">
            {SLIDES.map((s, i) => {
              const active = i === current;
              return (
                <button
                  key={s.thumb}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}: ${s.thumb}`}
                  className={`group relative h-24 overflow-hidden rounded-2xl text-left transition ${
                    active ? "ring-2" : "opacity-70 ring-1 ring-white/20 hover:opacity-100"
                  }`}
                  style={active ? { boxShadow: `0 0 0 2px ${ACCENT}` } : undefined}
                >
                  <img
                    src={images[i]}
                    alt=""
                    onError={(e) => (e.currentTarget.style.display = "none")}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    style={{ background: MID }}
                  />
                  <span
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(to right, ${DARK}e6, ${DARK}33)` }}
                  />
                  <span className="relative flex h-full items-center gap-4 px-4">
                    <span
                      className={`${H} text-2xl font-black`}
                      style={{ color: active ? ACCENT : "rgba(255,255,255,0.6)" }}
                    >
                      0{i + 1}
                    </span>
                    <span className="text-sm font-semibold text-white">{s.thumb}</span>
                  </span>
                  {active && (
                    <span className="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-white/20">
                      {bar(`t-${current}-${tick}`)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom bar: mobile pe pehle stats, phir controls. md+ pe pehle jaisa (controls left, stats right) */}
      <div
        className="relative z-30 border-t border-white/10 backdrop-blur-md"
        style={{ background: `${DARK}b3` }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 pb-[calc(0.875rem+env(safe-area-inset-bottom))] pt-3.5 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-5 md:px-8 md:py-5">
          {/* Stats */}
          <div className="order-1 grid grid-cols-3 gap-2 md:order-2 md:min-w-[420px] md:gap-0 md:divide-x md:divide-white/15">
            {[
              [`${yearsOfService}+`, "Years of Excellence"],
              [studentsValue, "Students"],
              [teachersValue, "Teachers"],
            ].map(([v, l], i) => (
              <div
                key={l}
                className={`rounded-xl bg-white/[0.07] px-2 py-2.5 text-center ring-1 ring-white/10 md:rounded-none md:bg-transparent md:p-0 md:text-left md:ring-0 ${
                  i ? "md:pl-6" : "md:pr-4"
                }`}
              >
                <p className={`${H} text-lg font-black leading-none text-white sm:text-2xl`}>{v}</p>
                <p className="mt-1 text-[10px] leading-tight text-emerald-100/75 sm:text-xs">{l}</p>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="order-2 flex items-center gap-3 md:order-1 md:gap-4">
            <button
              type="button"
              onClick={() => goTo(current - 1)}
              aria-label="Previous slide"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition active:scale-95 hover:bg-white hover:text-[#0B2A21] md:h-11 md:w-11"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => goTo(current + 1)}
              aria-label="Next slide"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition active:scale-95 hover:bg-white hover:text-[#0B2A21] md:h-11 md:w-11"
            >
              <ChevronRight size={20} />
            </button>
            <p className={`${H} text-sm font-bold text-white`}>
              0{current + 1} <span className="text-white/40">/ 0{total}</span>
            </p>
            <div className="ml-auto flex items-center gap-1 lg:hidden md:ml-0">
              {SLIDES.map((s, i) => (
                <button
                  key={s.thumb}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className="flex h-8 items-center"
                >
                  <span
                    className={`relative block h-1.5 overflow-hidden rounded-full bg-white/30 transition-all ${
                      i === current ? "w-10 sm:w-12" : "w-5 sm:w-6"
                    }`}
                  >
                    {i === current && bar(`d-${current}-${tick}`)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}