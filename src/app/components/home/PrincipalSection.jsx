"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Dancing_Script } from "next/font/google";
import { ArrowRight, Award, BookOpen, HeartHandshake, Quote } from "lucide-react";

/* Static image: file ko images/principal.jpg naam se rakho
   (path navbar ke logo jaisa hi hai, apne folder ke hisaab se badal lena) */
import principalImage from "../../../images/principal.jpg";

const H = "font-[family-name:var(--font-head)]";
const wrap = "mx-auto max-w-7xl px-5 md:px-8";
const script = Dancing_Script({ subsets: ["latin"], weight: ["600", "700"] });

const PILLS = [
  { icon: BookOpen, label: "Knowledge" },
  { icon: HeartHandshake, label: "Character" },
  { icon: Award, label: "Excellence" },
];

export default function PrincipalSection({
  principalName = "Nurul Amin",
  principalQualification = "BSc",
  principalPhoto = principalImage,
  schoolName = "Niz Dhing GyanDeep Jatiya Bidyalaya",
}) {
  const ref = useRef(null);
  const frameRef = useRef(null);
  const [shown, setShown] = useState(false);
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

  /* 3D tilt + glare following the mouse (desktop only) */
  const onMove = (e) => {
    if (e.pointerType !== "mouse" || !frameRef.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const el = frameRef.current;
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
    if (!reduced) {
      el.style.transform = `rotateX(${((0.5 - py) * 7).toFixed(2)}deg) rotateY(${((px - 0.5) * 9).toFixed(2)}deg)`;
    }
  };
  const onLeave = () => {
    if (frameRef.current) frameRef.current.style.transform = "";
  };

  const upClass = shown ? "pr-up" : "opacity-0";
  const up = (n) => ({ animationDelay: shown ? `${n * 110}ms` : undefined });
  const isStatic = typeof principalPhoto === "object";

  return (
    <section
      id="principal"
      style={{ scrollMarginTop: "5rem", background: "linear-gradient(180deg,#EAF4FF 0%,#F6FBFF 100%)" }}
      className="relative overflow-hidden py-16 text-[#0A2A5E] sm:py-20 md:py-28"
    >
      <style>{`
        @keyframes pr-up{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}
        @keyframes pr-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes pr-spin{to{transform:rotate(360deg)}}
        .pr-up{opacity:0;animation:pr-up .9s cubic-bezier(.22,1,.36,1) forwards}
        .pr-float{animation:pr-float 5s ease-in-out infinite}
        .pr-spin{animation:pr-spin 26s linear infinite}
        .pr-beam{position:absolute;left:50%;top:50%;width:220%;aspect-ratio:1/1;margin-left:-110%;margin-top:-110%;animation:pr-spin 6s linear infinite;background:conic-gradient(from 0deg,transparent 0%,transparent 55%,#38BDF8 78%,#ffffff 94%,transparent 100%)}
        @media (prefers-reduced-motion:reduce){.pr-up,.pr-float,.pr-spin,.pr-beam{animation:none!important;opacity:1!important}}
      `}</style>

      {/* soft glows + fine dots */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-10 h-[28rem] w-[28rem] rounded-full bg-sky-300/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-0 h-[24rem] w-[24rem] rounded-full bg-blue-300/30 blur-3xl" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "radial-gradient(#0A2A5E 1px, transparent 1px)", backgroundSize: "30px 30px" }}
      />
      {/* huge outlined word behind the portrait */}
      <span
        aria-hidden="true"
        className={`${H} pointer-events-none absolute -right-6 bottom-6 hidden select-none text-[190px] font-black leading-none text-transparent lg:block`}
        style={{ WebkitTextStroke: "2px rgba(56,189,248,0.28)" }}
      >
        Principal
      </span>

      <div ref={ref} className={`${wrap} relative grid items-center gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16`}>
        {/* MESSAGE CARD (mobile par portrait ke neeche aata hai) */}
        <div className={`${upClass} order-2 lg:order-1`} style={up(1)}>
          <div className="relative rounded-[1.75rem] bg-gradient-to-br from-sky-300 via-white to-blue-300 p-px shadow-2xl shadow-sky-900/15 sm:rounded-[2rem]">
            <article className="relative overflow-hidden rounded-[calc(1.75rem-1px)] bg-white p-6 sm:rounded-[calc(2rem-1px)] sm:p-10 md:p-12">
              <div aria-hidden="true" className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-200/60 blur-3xl" />
              <Quote
                aria-hidden="true"
                size={96}
                className="absolute right-6 top-6 text-sky-100 sm:right-10 sm:top-8 sm:h-28 sm:w-28"
                strokeWidth={1.5}
              />

              <div className="relative flex items-center gap-3 border-b border-sky-100 pb-4">
                <span className="h-2.5 w-2.5 rotate-45 bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,.7)]" aria-hidden="true" />
                <p className={`${H} text-sm font-bold text-[#0B3A9A] sm:text-base`}>{schoolName}</p>
              </div>

              <h2
                className={`${H} relative mt-7 bg-gradient-to-b from-[#0A2A5E] to-[#1D6FD8] bg-clip-text text-3xl font-black leading-[1.12] text-transparent sm:text-4xl md:text-[44px]`}
              >
                A message from our Principal
              </h2>
              <p className="relative mt-3 max-w-xl text-base text-[#35557F] sm:text-lg">
                Guiding our students towards knowledge, character and excellence.
              </p>

              <div className="relative mt-8">
                <p
                  className={`${H} border-l-4 border-sky-400 pl-4 text-lg leading-8 text-[#0A2A5E] sm:pl-5 sm:text-xl sm:leading-9 md:text-2xl md:leading-[2.4rem]`}
                >
                  Education is the foundation upon which we build our future. Our mission is to create an
                  environment where every student feels valued, supported and inspired to achieve excellence.
                </p>
                <p className="mt-5 max-w-prose text-[15px] leading-7 text-[#35557F] sm:text-base sm:leading-8">
                  Together with our teachers, parents and community, we strive to provide every child with the
                  knowledge, confidence and values needed to become a responsible and successful citizen.
                </p>
              </div>

              {/* signature */}
              <div className="relative mt-9">
                <p className="text-sm text-[#35557F]">With warm regards,</p>
                <p className={`${script.className} mt-1 text-4xl leading-none text-[#0B3A9A] sm:text-5xl`}>
                  {principalName}
                </p>
                <span aria-hidden="true" className="mt-3 block h-px w-40 bg-gradient-to-r from-sky-400 to-transparent" />
                <p className="mt-3 text-sm font-semibold text-[#0A2A5E] sm:text-base">
                  {principalName}
                  {principalQualification ? ` (${principalQualification})` : ""}
                  <span className="text-[#35557F]"> · Principal</span>
                </p>
              </div>

              {/* pillars */}
              <ul className="relative mt-9 grid grid-cols-3 gap-2.5 sm:gap-3">
                {PILLS.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="group flex flex-col items-center gap-2 rounded-2xl bg-sky-50 p-3 text-center text-xs font-bold ring-1 ring-sky-100 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-sky-500/20 hover:ring-sky-300 sm:p-4 sm:text-sm"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-700 text-white shadow-md shadow-sky-600/30 transition group-hover:scale-105">
                      <Icon size={19} />
                    </span>
                    {label}
                  </li>
                ))}
              </ul>

              <div className="relative mt-8">
                <Link
                  href="/teachers"
                  className="group inline-flex items-center gap-2 font-bold text-[#0B3A9A] transition hover:text-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2A5E]"
                >
                  <span className="border-b-2 border-sky-400 pb-0.5">Meet our teachers</span>
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </Link>
              </div>
            </article>
          </div>
        </div>

        {/* PORTRAIT */}
        <div
          className={`${upClass} order-1 mx-auto w-full max-w-[19rem] sm:max-w-sm lg:order-2 lg:max-w-md`}
          style={up(0)}
        >
          <div className="[perspective:1200px]" onPointerMove={onMove} onPointerLeave={onLeave}>
            <div
              ref={frameRef}
              className="group relative transition-transform duration-200 ease-out will-change-transform"
            >
              {/* glow behind */}
              <div aria-hidden="true" className="absolute -inset-5 rounded-[2.2rem] bg-gradient-to-br from-sky-400/55 to-blue-600/35 blur-2xl" />

              {/* corner brackets */}
              {[
                "-left-3 -top-3 border-l-2 border-t-2 rounded-tl-xl",
                "-right-3 -top-3 border-r-2 border-t-2 rounded-tr-xl",
                "-bottom-3 -left-3 border-b-2 border-l-2 rounded-bl-xl",
                "-bottom-3 -right-3 border-b-2 border-r-2 rounded-br-xl",
              ].map((c) => (
                <span key={c} aria-hidden="true" className={`absolute h-7 w-7 border-sky-500 ${c}`} />
              ))}

              {/* frame with spinning light border */}
              <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-sky-300/70 via-white/60 to-blue-400/70 p-[3px] shadow-2xl shadow-sky-900/35">
                <span aria-hidden="true" className="pr-beam" />
                <div className="relative overflow-hidden rounded-[calc(1.75rem-3px)] bg-[#0A2A5E]">
                  {principalPhoto && (
                    <Image
                      src={principalPhoto}
                      alt={`Principal ${principalName}`}
                      priority
                      placeholder={isStatic ? "blur" : "empty"}
                      sizes="(min-width:1024px) 28rem, (min-width:640px) 24rem, 19rem"
                      className="h-auto w-full"
                    />
                  )}
                  {/* glare that follows the cursor */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(260px circle at var(--gx,50%) var(--gy,50%), rgba(255,255,255,.28), transparent 60%)",
                    }}
                  />
                </div>
              </div>

              {/* floating badge */}
              <div className="pr-float absolute -left-3 top-8 flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-4 shadow-xl shadow-sky-900/20 ring-1 ring-sky-200 sm:-left-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-700 text-white">
                  <Award size={16} />
                </span>
                <span className="text-xs font-bold text-[#0A2A5E] sm:text-sm">Principal&apos;s desk</span>
              </div>

              {/* rotating seal */}
              <div
                className="absolute -bottom-6 -right-3 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl shadow-sky-900/30 ring-4 ring-sky-300/60 sm:-right-6 sm:h-28 sm:w-28"
                role="img"
                aria-label="Knowledge, Character, Excellence"
              >
                <svg viewBox="0 0 120 120" className="pr-spin absolute inset-0 h-full w-full text-sky-600" aria-hidden="true">
                  <defs>
                    <path id="pr-circle" d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0" />
                  </defs>
                  <text fontSize="9.5" fontWeight="700" fill="currentColor" textLength="290" lengthAdjust="spacing">
                    <textPath href="#pr-circle">KNOWLEDGE • CHARACTER • EXCELLENCE •</textPath>
                  </text>
                </svg>
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-700 text-white sm:h-12 sm:w-12">
                  <Award size={22} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}