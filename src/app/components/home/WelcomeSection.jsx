"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Building2, GraduationCap, Users } from "lucide-react";

import ValuesBand from "./ValuesBand";

const H = "font-[family-name:var(--font-head)]";
const wrap = "mx-auto max-w-7xl px-5 md:px-8";
const SLIDE_MS = 5500;

const FEATURES = [
  { icon: Users, title: "Student-focused learning" },
  { icon: GraduationCap, title: "Experienced and dedicated teachers" },
  { icon: Building2, title: "Modern learning environment" },
  { icon: BookOpen, title: "Strong academic foundation" },
];

/* Photos public/images/ me rakho aur naam yahan badlo */
const PHOTOS = [
  { src: "/images/about-1.jpg", title: "Morning prayer assembly", note: "Every school day begins together." },
  { src: "/images/about-2.jpg", title: "Our green campus", note: "Open space to learn, play and grow." },
  { src: "/images/about-3.jpg", title: "Learning together", note: "One school family, one goal." },
];

export default function WelcomeSection({
  school = {},
  schoolName = "Niz Dhing GyanDeep Jatiya Bidyalaya",
  estd = school.established || "",
  photos = PHOTOS,
}) {
  const ref = useRef(null);
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

  const list = photos.map((p, i) => (i === 0 && school.campusImage ? { ...p, src: school.campusImage } : p));
  const total = list.length;
  const cur = list[active] || list[0];

  /* auto slideshow (pauses on hover/focus, off for reduced motion) */
  useEffect(() => {
    if (!shown || paused || reduced || total < 2) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % total), SLIDE_MS);
    return () => clearTimeout(id);
  }, [active, shown, paused, reduced, total]);

  const up = (n) => ({ animationDelay: shown ? `${n * 110}ms` : undefined });
  const upClass = shown ? "wl-up" : "opacity-0";

  return (
    <section
      id="about"
      style={{ scrollMarginTop: "5rem", background: "linear-gradient(180deg,#F3F9FF 0%,#E8F4FF 100%)" }}
      className="relative overflow-hidden pt-16 text-[#0A2A5E] sm:pt-20 md:pt-28"
    >
      <style>{`
        @keyframes wl-up{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
        @keyframes wl-zoom{from{transform:scale(1.1)}to{transform:scale(1)}}
        @keyframes wl-bar{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        @keyframes wl-spin{to{transform:rotate(360deg)}}
        .wl-up{opacity:0;animation:wl-up .85s cubic-bezier(.22,1,.36,1) forwards}
        .wl-zoom{animation:wl-zoom 7s ease-out both}
        .wl-spin{animation:wl-spin 24s linear infinite}
        @media (prefers-reduced-motion:reduce){.wl-up,.wl-zoom,.wl-spin,.wl-bar{animation:none!important;opacity:1!important}}
      `}</style>

      {/* soft glows + fine dots */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-16 h-96 w-96 rounded-full bg-sky-300/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-40 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "radial-gradient(#0A2A5E 1px, transparent 1px)", backgroundSize: "30px 30px" }}
      />

      <div ref={ref} className={`${wrap} relative grid items-center gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20`}>
        {/* PHOTO VIEWER */}
        <div
          className={`relative mx-auto w-full max-w-[640px] ${upClass}`}
          style={up(0)}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div aria-hidden="true" className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-sky-300/60 to-blue-500/30 blur-xl" />

          <div className="relative rounded-[1.75rem] bg-gradient-to-br from-sky-300 via-white to-blue-400 p-[3px] shadow-2xl shadow-sky-900/25">
            <div className="rounded-[calc(1.75rem-3px)] bg-[#0A2A5E] p-2.5 sm:p-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B3A9A] to-[#061A3A]">
                {list.map((p, i) => (
                  <img
                    key={p.src}
                    src={p.src}
                    alt={i === active ? p.title : ""}
                    aria-hidden={i !== active}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 motion-reduce:transition-none ${
                      i === active ? "wl-zoom opacity-100" : "opacity-0"
                    }`}
                  />
                ))}

                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#061A3A]/90 via-[#061A3A]/40 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 text-white sm:p-5" aria-live="polite">
                  <div className="min-w-0">
                    <p className={`${H} truncate text-lg font-black sm:text-2xl`}>{cur.title}</p>
                    <p className="mt-0.5 text-[13px] text-sky-100/85 sm:text-sm">{cur.note}</p>
                  </div>
                  <p className={`${H} shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-bold ring-1 ring-white/30 backdrop-blur sm:text-sm`}>
                    0{active + 1} <span className="text-white/60">/ 0{total}</span>
                  </p>
                </div>

                {/* slide progress */}
                {!reduced && total > 1 && (
                  <span className="absolute inset-x-0 top-0 h-1 bg-white/15">
                    <span
                      key={`${active}-${paused}`}
                      className="wl-bar absolute inset-0 origin-left bg-gradient-to-r from-sky-300 to-white"
                      style={{
                        animation: `wl-bar ${SLIDE_MS}ms linear forwards`,
                        animationPlayState: paused ? "paused" : "running",
                      }}
                    />
                  </span>
                )}
              </div>

              <div className="mt-2.5 grid grid-cols-3 gap-2 sm:mt-3 sm:gap-3">
                {list.map((p, i) => (
                  <button
                    key={p.src}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-pressed={i === active}
                    aria-label={`Show photo: ${p.title}`}
                    className={`relative aspect-[16/9] overflow-hidden rounded-lg bg-[#061A3A] outline-none transition focus-visible:ring-2 focus-visible:ring-white sm:rounded-xl ${
                      i === active ? "ring-2 ring-sky-300" : "opacity-55 hover:opacity-100"
                    }`}
                  >
                    <img src={p.src} alt="" onError={(e) => (e.currentTarget.style.display = "none")} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* rotating Estd. seal */}
          {estd && (
            <div
              className="absolute -right-2 -top-8 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl shadow-sky-900/30 ring-4 ring-sky-300/60 sm:-right-5 sm:h-28 sm:w-28"
              role="img"
              aria-label={`Established ${estd}`}
            >
              <svg viewBox="0 0 120 120" className="wl-spin absolute inset-0 h-full w-full text-sky-600" aria-hidden="true">
                <defs>
                  <path id="wl-circle" d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0" />
                </defs>
                <text fontSize="10" fontWeight="700" fill="currentColor" textLength="290" lengthAdjust="spacing">
                  <textPath href="#wl-circle">ESTABLISHED • ESTABLISHED • ESTABLISHED •</textPath>
                </text>
              </svg>
              <span className={`${H} relative text-xl font-black text-[#0A2A5E] sm:text-2xl`}>{estd}</span>
            </div>
          )}
        </div>

        {/* TEXT */}
        <div>
          <h2
            className={`${H} ${upClass} bg-gradient-to-b from-[#0A2A5E] to-[#1D6FD8] bg-clip-text text-3xl font-black leading-[1.12] text-transparent md:text-4xl lg:text-[46px]`}
            style={up(1)}
          >
            Where every child has a place to shine
          </h2>
          <span aria-hidden="true" className={`${upClass} mt-4 block h-1 w-20 rounded-full bg-gradient-to-r from-sky-500 to-transparent`} style={up(2)} />

          <p className={`${upClass} mt-5 max-w-xl text-base leading-7 text-[#35557F] md:text-lg md:leading-8`} style={up(2)}>
            Welcome to {schoolName}. Our school provides a nurturing and inspiring environment where students are
            encouraged to learn, explore and grow with confidence.
          </p>

          {/* quote card */}
          <figure
            className={`${upClass} relative mt-7 overflow-hidden rounded-2xl p-6 text-white shadow-xl shadow-sky-900/20 ring-1 ring-white/20`}
            style={{ background: "linear-gradient(135deg,#0B3A9A 0%,#0A2A5E 60%,#061A3A 100%)", ...up(3) }}
          >
            <div aria-hidden="true" className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-400/30 blur-3xl" />
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-sky-300 to-blue-500" />
            <span aria-hidden="true" className={`${H} absolute right-5 top-0 text-7xl font-black leading-none text-white/15`}>
              &rdquo;
            </span>
            <blockquote className={`${H} relative pl-2 text-[15px] leading-7 sm:text-base`}>
              We believe that true education develops not only academic ability but also character, creativity,
              discipline, leadership and compassion.
            </blockquote>
          </figure>

          {/* feature cards */}
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title }, i) => (
              <li
                key={title}
                className={`${upClass} group flex items-center gap-3.5 rounded-2xl bg-white/80 p-3.5 shadow-sm ring-1 ring-sky-100 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-500/20 hover:ring-sky-300`}
                style={up(4 + i * 0.5)}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-700 text-white shadow-md shadow-sky-600/30 transition group-hover:scale-105">
                  <Icon size={20} />
                </span>
                <span className="text-[15px] font-bold leading-snug">{title}</span>
              </li>
            ))}
          </ul>

          <div className={`${upClass} mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6`} style={up(6.5)}>
            <Link
              href="/online-admission"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-700 px-6 py-3.5 font-bold text-white shadow-[0_10px_28px_-8px_rgba(14,165,233,0.8)] transition hover:from-sky-400 hover:to-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2A5E] focus-visible:ring-offset-2"
            >
              Apply for admission
              <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </Link>
            <Link
              href="/about"
              className="group inline-flex items-center justify-center gap-2 py-2 font-bold text-[#0B3A9A] transition hover:text-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2A5E]"
            >
              <span className="border-b-2 border-sky-400 pb-0.5">Learn more about us</span>
              <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* VALUES BAND */}
      <ValuesBand className="mt-16 md:mt-24" />
    </section>
  );
}