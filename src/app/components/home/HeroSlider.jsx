"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronLeft, ChevronRight, Eye } from "lucide-react";

const H = "font-[family-name:var(--font-head)]";
const DURATION = 6500; // ms per slide

/* ------------------------------------------------------------------
   EDIT HERE: put your 3 photos in  public/images/  and set the names.
   Slide 1 uses school.heroImage from the API first, if one exists.
------------------------------------------------------------------ */
const SLIDES = [
  {
    image: "/images/hero-1.jpg",
    thumb: "School Campus",
    tag: "Admissions open",
    line1: "Inspiring Minds.",
    line2: "Shaping Futures.",
    text: "A place where knowledge meets character, curiosity meets opportunity, and every child is encouraged to discover their potential.",
    cta: { label: "Apply for Admission", href: "/online-admission" },
  },
  {
    image: "/images/hero-2.jpg",
    thumb: "Our Achievements",
    tag: "Celebrating success",
    line1: "Proud Moments,",
    line2: "Shining Achievements.",
    text: "Our students and teachers come together to celebrate success in competitions and national programmes.",
    cta: { label: "View Gallery", href: "/gallery" },
  },
  {
    image: "/images/hero-3.jpg",
    thumb: "Our School Family",
    tag: "Teachers & staff",
    line1: "Dedicated Teachers,",
    line2: "A Caring Community.",
    text: "A committed team of teachers and staff guiding every child with care, discipline and encouragement.",
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
  const [touchX, setTouchX] = useState(null);

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

  const slide = SLIDES[current];
  const bar = (key) => (
    <span
      key={key}
      className="hs-anim absolute inset-y-0 left-0 w-full origin-left bg-amber-400"
      style={{
        animation: `hs-bar ${DURATION}ms linear forwards`,
        animationPlayState: paused ? "paused" : "running",
      }}
    />
  );

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#0A1B33] pt-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        setTick((t) => t + 1);
      }}
      onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
        setTouchX(null);
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

      {/* Slides */}
      <div className="absolute inset-x-0 top-20 h-[240px] sm:h-[340px] md:inset-0 md:top-0 md:h-auto">
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
              <div className="absolute inset-0 bg-gradient-to-br from-[#0F2A4D] to-[#143A6B]" />
              <img
                src={images[i]}
                alt={s.thumb}
                onError={(e) => (e.currentTarget.style.display = "none")}
                className={`h-full w-full object-cover ${active ? "hs-zoom" : ""}`}
              />
            </div>
          );
        })}
        {/* Readability overlays */}
        <div className="absolute inset-0 z-20 hidden bg-gradient-to-r from-[#0A1B33] via-[#0A1B33]/75 to-[#0A1B33]/10 md:block" />
        <div className="absolute inset-x-0 bottom-0 z-20 hidden h-1/2 bg-gradient-to-t from-[#0A1B33] to-transparent md:block" />
        <div className="absolute inset-x-0 bottom-0 z-20 h-20 bg-gradient-to-t from-[#0A1B33] to-transparent md:hidden" />
        <div
          className="absolute inset-0 z-20 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
      </div>

      {/* Content */}
      <div className="h-[216px] shrink-0 sm:h-[316px] md:hidden" />
      <div className="relative z-30 mx-auto flex w-full max-w-7xl flex-1 items-center px-5 pb-8 pt-2 md:px-8 md:py-12">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_300px]">
          <div key={current} className="max-w-2xl">
            <div className="hs-up flex flex-wrap items-center gap-3" style={{ animationDelay: "0.35s" }}>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100 ring-1 ring-white/20 backdrop-blur md:gap-2 md:px-4 md:py-2 md:text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 md:h-2 md:w-2" />
                {slide.tag}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-300/25 backdrop-blur md:gap-2 md:px-3.5 md:py-2 md:text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <Eye size={15} /> {visitorsValue} visitors
              </span>
            </div>

            <h1 className={`${H} mt-4 text-[26px] font-black leading-[1.15] text-white sm:text-4xl md:mt-6 md:text-5xl lg:text-6xl`}>
              <span className="hs-up block" style={{ animationDelay: "0.5s" }}>
                {slide.line1}
              </span>
              <span className="hs-up block text-amber-400" style={{ animationDelay: "0.65s" }}>
                {slide.line2}
              </span>
            </h1>

            <span
              className="hs-anim mt-4 block h-1 w-14 origin-left rounded-full bg-amber-400 md:mt-6 md:w-20"
              style={{ animation: "hs-line .9s .8s cubic-bezier(.22,1,.36,1) both" }}
            />

            <p
              className="hs-up mt-4 line-clamp-3 max-w-xl text-[13px] leading-6 text-slate-200 sm:text-sm md:mt-6 md:line-clamp-none md:text-lg md:leading-8"
              style={{ animationDelay: "0.85s" }}
            >
              {slide.text}
            </p>

            <div className="hs-up mt-5 flex gap-2.5 md:mt-8 md:gap-3" style={{ animationDelay: "1s" }}>
              <Link
                href={slide.cta.href}
                className="group inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-400 px-3 py-3 text-[13px] font-bold text-slate-900 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300 sm:flex-none sm:px-6 md:gap-2 md:rounded-xl md:px-7 md:py-4 md:text-base"
              >
                <span className="truncate">{slide.cta.label}</span>
                <ArrowRight size={16} className="shrink-0 transition group-hover:translate-x-1" />
              </Link>
              <Link
                href="/homework"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-3 text-[13px] font-bold text-white ring-1 ring-white/35 backdrop-blur transition hover:bg-white/10 sm:flex-none sm:px-6 md:gap-2 md:rounded-xl md:px-7 md:py-4 md:text-base"
              >
                <BookOpen size={16} className="shrink-0" /> <span className="truncate">Homework</span>
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
                    active ? "ring-2 ring-amber-400" : "opacity-70 ring-1 ring-white/20 hover:opacity-100"
                  }`}
                >
                  <img
                    src={images[i]}
                    alt=""
                    onError={(e) => (e.currentTarget.style.display = "none")}
                    className="absolute inset-0 h-full w-full bg-[#143A6B] object-cover transition duration-500 group-hover:scale-110"
                  />
                  <span className="absolute inset-0 bg-gradient-to-r from-[#0A1B33]/90 to-[#0A1B33]/20" />
                  <span className="relative flex h-full items-center gap-4 px-4">
                    <span className={`${H} text-2xl font-black ${active ? "text-amber-400" : "text-white/60"}`}>
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

      {/* Bottom bar: controls + stats */}
      <div className="relative z-30 border-t border-white/10 bg-[#0A1B33]/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between md:gap-5 md:px-8 md:py-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => goTo(current - 1)}
              aria-label="Previous slide"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-amber-400 hover:text-slate-900"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => goTo(current + 1)}
              aria-label="Next slide"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-amber-400 hover:text-slate-900"
            >
              <ChevronRight size={20} />
            </button>
            <p className={`${H} text-sm font-bold text-white`}>
              0{current + 1} <span className="text-white/40">/ 0{total}</span>
            </p>
            <div className="flex items-center gap-2 lg:hidden">
              {SLIDES.map((s, i) => (
                <button
                  key={s.thumb}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`relative h-1.5 overflow-hidden rounded-full bg-white/30 transition-all ${
                    i === current ? "w-12" : "w-6"
                  }`}
                >
                  {i === current && bar(`d-${current}-${tick}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-white/15 md:min-w-[420px]">
            {[
              [`${yearsOfService}+`, "Years of Excellence"],
              [studentsValue, "Students"],
              [teachersValue, "Teachers"],
            ].map(([v, l], i) => (
              <div key={l} className={i ? "pl-4 sm:pl-6" : "pr-4"}>
                <p className={`${H} text-xl font-black text-white sm:text-2xl`}>{v}</p>
                <p className="text-[11px] text-slate-300 sm:text-xs">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}