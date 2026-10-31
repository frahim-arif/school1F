"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Building2, GraduationCap, Quote, Users } from "lucide-react";

const H = "font-[family-name:var(--font-head)]";
const wrap = "mx-auto max-w-7xl px-5 md:px-8";

const FEATURES = [
  { icon: Users, title: "Student-focused learning" },
  { icon: GraduationCap, title: "Experienced and dedicated teachers" },
  { icon: Building2, title: "Modern learning environment" },
  { icon: BookOpen, title: "Strong academic foundation" },
];

const VALUES = ["Character", "Creativity", "Discipline", "Leadership", "Compassion", "Knowledge", "Confidence"];

/* Photos: about-1.jpg and about-2.jpg in public/images/
   (school.campusImage from the API is used for the big photo if it exists) */
export default function WelcomeSection({ school = {}, schoolName = "our school" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

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

  const reveal = (from) =>
    `transition duration-[900ms] ease-out motion-reduce:transition-none ${
      shown ? "translate-x-0 translate-y-0 opacity-100" : `${from} opacity-0`
    }`;

  return (
    <section id="about" style={{ scrollMarginTop: "5rem" }} className="relative overflow-hidden pt-20 md:pt-28">
      <style>{`
        @keyframes wl-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes wl-spin{to{transform:rotate(360deg)}}
        @keyframes wl-marquee{to{transform:translateX(-50%)}}
        @keyframes wl-ping{0%{box-shadow:0 0 0 0 rgba(16,185,129,.55)}100%{box-shadow:0 0 0 10px rgba(16,185,129,0)}}
        .wl-float{animation:wl-float 4.5s ease-in-out infinite}
        .wl-spin{animation:wl-spin 24s linear infinite}
        .wl-marquee{animation:wl-marquee 28s linear infinite}
        .wl-marquee-wrap:hover .wl-marquee{animation-play-state:paused}
        .wl-ping{animation:wl-ping 1.8s ease-out infinite}
        @media (prefers-reduced-motion:reduce){.wl-float,.wl-spin,.wl-marquee,.wl-ping{animation:none}}
      `}</style>

      {/* soft background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{ backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)", backgroundSize: "26px 26px" }}
      />
      <div className="pointer-events-none absolute -left-24 top-20 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-24 h-80 w-80 rounded-full bg-amber-200/50 blur-3xl" />

      <div ref={ref} className={`${wrap} relative grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20`}>
        {/* PHOTO COLLAGE */}
        <div className={`mx-auto w-full max-w-[470px] ${reveal("-translate-x-10")}`}>
          <div
            className="relative pb-14 pr-6 sm:pr-10"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setTilt({
                x: ((e.clientX - r.left) / r.width - 0.5) * 9,
                y: -((e.clientY - r.top) / r.height - 0.5) * 9,
              });
            }}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            style={{
              transform: `perspective(1100px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
              transition: "transform .25s ease-out",
            }}
          >
            <div
              className="absolute -left-6 top-14 h-40 w-40"
              style={{ backgroundImage: "radial-gradient(#60A5FA 2px, transparent 2px)", backgroundSize: "16px 16px" }}
            />
            <div className="absolute -bottom-2 left-5 right-1 top-6 rounded-t-[999px] rounded-b-3xl bg-gradient-to-b from-blue-300 to-blue-100" />

            {/* main photo: arch */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-3xl bg-gradient-to-br from-[#0F2A4D] to-[#143A6B] shadow-2xl shadow-blue-900/25 ring-4 ring-white">
              <img
                src={school.campusImage || "/images/about-1.jpg"}
                alt={`${schoolName} students`}
                onError={(e) => (e.currentTarget.style.display = "none")}
                className="h-full w-full object-cover object-[60%_40%] transition duration-700 hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0A1B33]/50 to-transparent" />
            </div>

            {/* small overlapping photo */}
            <div className="absolute bottom-0 right-0 aspect-square w-[46%] overflow-hidden rounded-3xl border-[6px] border-slate-50 bg-[#143A6B] shadow-xl">
              <img
                src="/images/about-2.jpg"
                alt={`${schoolName} campus`}
                onError={(e) => (e.currentTarget.style.display = "none")}
                className="h-full w-full object-cover transition duration-700 hover:scale-110"
              />
            </div>

            {/* rotating-ring badge */}
            <div className="wl-float absolute right-0 top-14 h-28 w-28 sm:-right-2">
              <div className="absolute inset-0 rounded-full bg-white shadow-xl ring-1 ring-slate-200" />
              <svg viewBox="0 0 120 120" className="wl-spin absolute inset-0 h-full w-full text-blue-800">
                <defs>
                  <path id="wl-ring" d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0" />
                </defs>
                <text fontSize="9" fontWeight="700" fill="currentColor" textLength="290" lengthAdjust="spacing">
                  <textPath href="#wl-ring">ADARSHA MARKAZ ACADEMY • LAHARIGHAT •</textPath>
                </text>
              </svg>
              <div className="absolute inset-[26px] flex flex-col items-center justify-center rounded-full bg-amber-400 text-slate-900">
                <span className="text-[9px] font-bold leading-none">Estd.</span>
                <span className={`${H} text-base font-black leading-tight`}>2014</span>
              </div>
            </div>

            {/* floating admissions card */}
            <Link
              href="/online-admission"
              className="group absolute bottom-24 left-0 flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-xl ring-1 ring-slate-200 backdrop-blur transition hover:-translate-y-1 sm:-left-4"
            >
              <span className="wl-ping h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
              <span className="leading-tight">
                <span className="block text-sm font-bold text-slate-900">Admissions open</span>
                <span className="block text-xs text-slate-500">Apply online today</span>
              </span>
              <ArrowRight size={16} className="text-blue-600 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* TEXT */}
        <div className={reveal("translate-x-10")} style={{ transitionDelay: shown ? "150ms" : "0ms" }}>
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            Welcome to {schoolName}
          </span>

          <h2 className={`${H} mt-4 text-3xl font-black leading-[1.15] text-slate-900 md:text-4xl lg:text-[44px]`}>
            Where Every Child Has a{" "}
            <span className="relative inline-block text-blue-700">
              Place to Shine
              <svg
                viewBox="0 0 220 12"
                preserveAspectRatio="none"
                className="absolute -bottom-2 left-0 h-2.5 w-full text-amber-400"
                aria-hidden="true"
              >
                <path d="M2 8 C 50 2, 120 2, 218 7" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h2>

          <p className="mt-6 text-base leading-7 text-slate-600 md:text-lg md:leading-8">
            Our school provides a nurturing and inspiring environment where students are encouraged to learn,
            explore and grow with confidence.
          </p>

          <div className="relative mt-6 rounded-2xl bg-white p-5 pl-6 shadow-sm ring-1 ring-slate-200">
            <span className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-gradient-to-b from-blue-600 to-amber-400" />
            <Quote size={22} className="text-blue-200" />
            <p className={`${H} mt-1 text-[15px] leading-7 text-slate-700`}>
              We believe that true education develops not only academic ability but also character, creativity,
              discipline, leadership and compassion.
            </p>
          </div>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title }) => (
              <li
                key={title}
                className="group flex items-center gap-3.5 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-blue-200"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F2A4D] to-blue-600 text-white shadow-md shadow-blue-600/25 transition duration-300 group-hover:rotate-6">
                  <Icon size={20} />
                </span>
                <span className="text-sm font-bold leading-snug text-slate-800">{title}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/about"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 font-bold text-white transition hover:bg-blue-700"
            >
              Learn More About Us
              <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </Link>
            <Link
              href="/online-admission"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-bold text-slate-800 ring-1 ring-slate-300 transition hover:bg-white hover:ring-blue-300"
            >
              Apply for Admission
            </Link>
          </div>
        </div>
      </div>

      {/* VALUES MARQUEE */}
      <div className="wl-marquee-wrap relative mt-20 overflow-hidden bg-[#0A1B33] py-5 md:mt-24 md:py-6">
        <div className="wl-marquee flex w-max items-center">
          {[...VALUES, ...VALUES, ...VALUES, ...VALUES].map((v, i) => (
            <span key={i} className="flex items-center">
              <span className={`${H} px-6 text-lg font-bold text-white md:px-8 md:text-2xl`}>{v}</span>
              <span className="h-2 w-2 rotate-45 bg-amber-400" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}