"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Atom, BookOpen, Calculator, Globe, Lightbulb, Pencil } from "lucide-react";

const H = "font-[family-name:var(--font-head)]";
const wrap = "mx-auto max-w-7xl px-5 md:px-8";

/* One look per card, in order. Gradient gets darker as the child moves up a stage. */
const LOOKS = [
  { grad: "from-sky-500 to-blue-600", stage: "Foundation", dark: false },
  { grad: "from-blue-600 to-indigo-700", stage: "Growth", dark: false },
  { grad: "from-indigo-700 to-[#0F2A4D]", stage: "Excellence", dark: false },
  { grad: "from-amber-300 to-amber-500", stage: "Beyond the classroom", dark: true },
];
const STAIR = ["lg:mt-24", "lg:mt-16", "lg:mt-8", "lg:mt-0"];

/* Faint study icons floating in the background */
const FLOATERS = [
  { Icon: BookOpen, left: "6%", top: "14%", size: 46, delay: "0s", hide: false },
  { Icon: Atom, left: "90%", top: "18%", size: 52, delay: "1.2s", hide: false },
  { Icon: Calculator, left: "3%", top: "62%", size: 40, delay: "2.4s", hide: true },
  { Icon: Globe, left: "94%", top: "58%", size: 48, delay: "0.6s", hide: true },
  { Icon: Pencil, left: "14%", top: "86%", size: 38, delay: "1.8s", hide: false },
  { Icon: Lightbulb, left: "84%", top: "88%", size: 42, delay: "3s", hide: false },
];

/* programs = [{ icon: LucideIcon, title, desc }, ...]  (same array as before, 4 items) */
export default function AcademicsSection({ programs = [] }) {
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
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="academics"
      style={{ scrollMarginTop: "5rem" }}
      className="relative overflow-hidden bg-gradient-to-br from-[#0A1B33] via-[#0F2A4D] to-[#143A6B] pb-24 pt-24 md:pb-40 md:pt-40"
    >
      <style>{`
        @keyframes ac-line{from{transform:scaleY(0)}to{transform:scaleY(1)}}
        @keyframes ac-drift-a{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(60px,40px) scale(1.15)}}
        @keyframes ac-drift-b{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-70px,-30px) scale(1.2)}}
        @keyframes ac-bob{0%,100%{transform:translateY(0) rotate(-6deg)}50%{transform:translateY(-16px) rotate(6deg)}}
        .ac-line{transform-origin:top;animation:ac-line 1.4s .2s ease-out both}
        .ac-a{animation:ac-drift-a 16s ease-in-out infinite}
        .ac-b{animation:ac-drift-b 19s ease-in-out infinite}
        .ac-bob{animation:ac-bob 7s ease-in-out infinite}
        @media (prefers-reduced-motion:reduce){.ac-line,.ac-a,.ac-b,.ac-bob{animation:none}}
      `}</style>

      {/* ---------- BACKGROUND ---------- */}
      {/* aurora blobs */}
      <div className="ac-a pointer-events-none absolute -left-24 top-24 h-[420px] w-[420px] rounded-full bg-blue-500/30 blur-[110px]" />
      <div className="ac-b pointer-events-none absolute -right-24 top-1/3 h-[460px] w-[460px] rounded-full bg-indigo-500/30 blur-[120px]" />
      <div className="ac-a pointer-events-none absolute bottom-10 left-1/3 h-[320px] w-[320px] rounded-full bg-amber-400/15 blur-[110px]" />

      {/* fading grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 35%, transparent 75%)",
          maskImage: "radial-gradient(ellipse at center, black 35%, transparent 75%)",
        }}
      />

      {/* spotlight behind the heading */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{ background: "radial-gradient(ellipse 60% 70% at 50% 0%, rgba(96,165,250,.22), transparent 70%)" }}
      />

      {/* floating study icons */}
      {FLOATERS.map(({ Icon, left, top, size, delay, hide }, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`ac-bob pointer-events-none absolute text-white/[0.09] ${hide ? "hidden md:block" : ""}`}
          style={{ left, top, animationDelay: delay }}
        >
          <Icon size={size} strokeWidth={1.4} />
        </span>
      ))}

      {/* wave edges (white = neighbouring sections) */}
      <svg
        className="pointer-events-none absolute inset-x-0 top-0 block h-8 w-full text-white md:h-16"
        viewBox="0 0 1440 64"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path fill="currentColor" d="M0 0H1440V28C1260 64 1020 64 720 36C420 8 180 8 0 44Z" />
      </svg>
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 block h-8 w-full rotate-180 text-white md:h-16"
        viewBox="0 0 1440 64"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path fill="currentColor" d="M0 0H1440V28C1260 64 1020 64 720 36C420 8 180 8 0 44Z" />
      </svg>

      {/* ---------- CONTENT ---------- */}
      <div className={`${wrap} relative`}>
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-blue-100 ring-1 ring-white/20 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Academics
          </span>
          <h2 className={`${H} mt-4 text-2xl font-black leading-tight text-white sm:text-3xl md:text-5xl`}>
            Learning for <span className="text-amber-400">Every Stage</span>
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base md:mt-4 md:text-lg md:leading-7">
            Our academic programmes are designed to build strong foundations and prepare students for a
            successful future.
          </p>
        </div>

        <div ref={ref} className="relative mx-auto mt-10 max-w-xl md:mt-16 md:max-w-none">
          {/* vertical journey line (mobile only) */}
          <span
            className={`absolute bottom-4 left-[15px] top-4 w-0.5 bg-gradient-to-b from-sky-400 via-indigo-400 to-amber-400 md:hidden ${
              shown ? "ac-line" : "scale-y-0"
            }`}
          />

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 lg:items-start lg:gap-6">
            {programs.map(({ icon: Icon, title, desc }, i) => {
              const look = LOOKS[i % LOOKS.length];
              return (
                <div
                  key={title}
                  className={`relative pl-11 transition duration-700 ease-out motion-reduce:transition-none md:pl-0 ${STAIR[i % STAIR.length]} ${
                    shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  }`}
                  style={{ transitionDelay: shown ? `${i * 130}ms` : "0ms" }}
                >
                  <span
                    className={`absolute left-0 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${look.grad} text-xs font-black ring-4 ring-[#10305A] md:hidden ${
                      look.dark ? "text-slate-900" : "text-white"
                    }`}
                  >
                    {i + 1}
                  </span>

                  <article className="group relative overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/30 ring-1 ring-white/20 transition duration-300 hover:-translate-y-1.5 hover:shadow-blue-500/30 md:rounded-3xl">
                    <div className={`relative flex h-24 items-center justify-between overflow-hidden bg-gradient-to-br ${look.grad} px-5 md:h-28 md:px-6`}>
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{ backgroundImage: "radial-gradient(#fff 1.5px, transparent 1.5px)", backgroundSize: "16px 16px" }}
                      />
                      <span
                        className={`relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/95 shadow-lg transition duration-500 group-hover:rotate-6 group-hover:scale-110 md:h-14 md:w-14 ${
                          look.dark ? "text-amber-600" : "text-blue-700"
                        }`}
                      >
                        <Icon size={24} />
                      </span>
                      <span
                        className={`${H} relative text-5xl font-black leading-none md:text-6xl ${
                          look.dark ? "text-slate-900/25" : "text-white/30"
                        }`}
                      >
                        0{i + 1}
                      </span>
                    </div>

                    <div className="p-5 md:p-6">
                      <span className="inline-block rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                        {look.stage}
                      </span>
                      <h3 className={`${H} mt-3 text-lg font-bold text-slate-900 md:text-xl`}>{title}</h3>
                      <p className="mt-2 text-[13px] leading-6 text-slate-600 md:text-sm">{desc}</p>
                      <div className="mt-4 h-0.5 w-10 rounded-full bg-gradient-to-r from-blue-600 to-amber-400 transition-all duration-500 group-hover:w-full" />
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row md:mt-14">
          <Link
            href="/academics"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-bold text-slate-900 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300 md:text-base"
          >
            Explore Academics
            <ArrowRight size={17} className="transition group-hover:translate-x-1" />
          </Link>
          <Link
            href="/online-admission"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/10 md:text-base"
          >
            Apply for Admission <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}