"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Dancing_Script } from "next/font/google";
import { Award, BookOpen, GraduationCap, HeartHandshake } from "lucide-react";

const H = "font-[family-name:var(--font-head)]";
const wrap = "mx-auto max-w-7xl px-5 md:px-8";
const script = Dancing_Script({ subsets: ["latin"], weight: ["600", "700"] });

const PILLS = [
  { icon: BookOpen, label: "Knowledge" },
  { icon: HeartHandshake, label: "Character" },
  { icon: Award, label: "Excellence" },
];

/* principalPhoto = the static import:  import principalPhoto from "../images/principal.jpg"  */
export default function PrincipalSection({
  principalName = "Principal",
  principalQualification = "",
  principalPhoto,
  schoolName = "our school",
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

  const reveal = (from) =>
    `transition duration-[900ms] ease-out motion-reduce:transition-none ${
      shown ? "translate-x-0 translate-y-0 opacity-100" : `${from} opacity-0`
    }`;

  return (
    <section
      id="principal"
      style={{ scrollMarginTop: "5rem" }}
      className="relative overflow-hidden bg-white py-14 sm:py-16 md:py-28"
    >
      <style>{`
        @keyframes pr-spin{to{transform:rotate(360deg)}}
        @keyframes pr-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        .pr-spin{animation:pr-spin 40s linear infinite}
        .pr-bob{animation:pr-bob 4s ease-in-out infinite}
        @media (prefers-reduced-motion:reduce){.pr-spin,.pr-bob{animation:none}}
      `}</style>

      {/* Navy backdrop: top block on mobile, left panel on desktop */}
      <div className="absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-[#0A1B33] to-[#143A6B] sm:h-[380px] md:h-[430px] lg:inset-y-0 lg:right-auto lg:h-auto lg:w-[42%] lg:bg-gradient-to-br">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "26px 26px" }}
        />
        <div className="absolute -left-16 bottom-6 h-56 w-56 rounded-full bg-blue-500/25 blur-[80px]" />
        <span className="absolute left-5 top-1/2 hidden -translate-y-1/2 -rotate-90 whitespace-nowrap text-[11px] font-semibold tracking-[0.45em] text-white/30 lg:block">
          FROM THE PRINCIPAL&apos;S DESK
        </span>
      </div>

      <div ref={ref} className={`${wrap} relative grid items-center gap-9 sm:gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20`}>
        {/* ROUND PHOTO */}
        <div className={`mx-auto w-full ${reveal("-translate-x-10")}`}>
          <div className="relative mx-auto h-[220px] w-[220px] sm:h-[280px] sm:w-[280px] lg:h-[340px] lg:w-[340px]">
            {/* glow */}
            <div className="absolute inset-4 rounded-full bg-amber-400/30 blur-2xl" />
            {/* rotating dashed orbit */}
            <div className="pr-spin absolute inset-0 rounded-full border-2 border-dashed border-amber-400/70" />

            {/* gradient ring + photo */}
            <div className="absolute inset-[14px] rounded-full bg-[conic-gradient(from_180deg,#FBBF24,#60A5FA,#FBBF24)] p-[5px] shadow-2xl shadow-slate-900/40 sm:inset-[18px] lg:inset-[22px]">
              <div className="relative h-full w-full overflow-hidden rounded-full bg-[#0F2A4D] ring-4 ring-white">
                {principalPhoto && (
                  <Image
                    src={principalPhoto}
                    alt={principalName}
                    fill
                    sizes="(min-width:1024px) 300px, (min-width:640px) 240px, 190px"
                    className="object-cover object-top"
                  />
                )}
              </div>
            </div>

            {/* floating cap badge */}
            <div className="pr-bob absolute bottom-3 right-1 flex h-11 w-11 items-center justify-center rounded-full bg-amber-400 text-slate-900 shadow-xl ring-4 ring-white sm:bottom-5 sm:h-12 sm:w-12 lg:bottom-8 lg:right-2 lg:h-14 lg:w-14">
              <GraduationCap size={22} />
            </div>
          </div>

          {/* name plate */}
          <div className="relative z-10 mx-auto -mt-6 max-w-[290px] rounded-2xl bg-white px-5 py-3.5 text-center shadow-xl ring-1 ring-slate-200 sm:-mt-8 sm:max-w-[320px] sm:py-4">
            <p className={`${H} text-base font-black leading-tight text-slate-900 sm:text-lg`}>{principalName}</p>
            <p className="mt-1.5 inline-block rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-800">
              Principal
            </p>
            {principalQualification && (
              <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">{principalQualification}</p>
            )}
          </div>
        </div>

        {/* MESSAGE */}
        <div className={reveal("translate-x-10")} style={{ transitionDelay: shown ? "150ms" : "0ms" }}>
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100 sm:px-3.5 sm:py-1.5 sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            Principal&apos;s message
          </span>
          <h2 className={`${H} mt-3 text-2xl font-black leading-tight text-slate-900 sm:text-3xl md:text-4xl lg:text-[42px]`}>
            A Message From Our <span className="text-blue-700">Principal</span>
          </h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base md:text-lg">
            Guiding our students towards knowledge, character and excellence.
          </p>

          <div className="mt-4 flex flex-wrap gap-2 sm:mt-5 sm:gap-2.5">
            {PILLS.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 sm:gap-2 sm:px-3.5 sm:py-2 sm:text-sm"
              >
                <Icon size={14} className="text-blue-600" />
                {label}
              </span>
            ))}
          </div>

          <figure className="relative mt-6 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200 sm:mt-8 sm:rounded-3xl sm:p-8 md:p-10">
            <span
              aria-hidden="true"
              className={`${H} pointer-events-none absolute -top-1 left-4 select-none text-[72px] font-black leading-none text-amber-400/40 sm:text-[100px] md:text-[120px]`}
            >
              “
            </span>
            <blockquote className="relative">
              <p className={`${H} text-[15px] leading-7 text-slate-800 sm:text-lg sm:leading-9 md:text-[22px] md:leading-[2.4rem]`}>
                Education is the foundation upon which we build our future. Our mission is to create an
                environment where every student feels valued, supported and inspired to achieve excellence.
              </p>
              <p className="mt-4 text-[13px] leading-6 text-slate-600 sm:mt-5 sm:text-base sm:leading-8">
                Together with our teachers, parents and community, we strive to provide every child with the
                knowledge, confidence and values needed to become a responsible and successful citizen.
              </p>
            </blockquote>

            <figcaption className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-slate-200 pt-5 sm:mt-8 sm:pt-6">
              <div>
                <p className="text-xs text-slate-500 sm:text-sm">With warm regards</p>
                <p className={`${script.className} mt-1 text-3xl leading-none text-blue-800 sm:text-4xl`}>
                  {principalName}
                </p>
              </div>
              <div className="text-xs sm:text-right sm:text-sm">
                <p className="font-bold text-slate-900">
                  {principalName}
                  {principalQualification ? `, ${principalQualification}` : ""}
                </p>
                <p className="mt-0.5 text-slate-500">Principal, {schoolName}</p>
              </div>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}