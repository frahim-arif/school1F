"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const H = "font-[family-name:var(--font-head)]";
const wrap = "mx-auto max-w-7xl px-5 md:px-8";

/*
  galleryItems = [{ title: "Sports Day", image: "/images/sports.jpg" }, ...]
  10-12 items dene par sabse achha dikhega (maxItems se limit badal sakte ho)
*/
export default function GallerySection({ galleryItems = [], maxItems = 12 }) {
  const gridRef = useRef(null);
  const [shown, setShown] = useState(false);
  const items = galleryItems.slice(0, maxItems);

  // grid screen mein aate hi ek baar stagger reveal chalega
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="gallery" style={{ scrollMarginTop: "5rem" }} className="relative overflow-hidden bg-white py-16 sm:py-20 md:py-24">
      <style>{`
        @keyframes gl-reveal{
          from{opacity:0;transform:translateY(28px) scale(.94)}
          to{opacity:1;transform:none}
        }
        .gl-card{opacity:0}
        .gl-in .gl-card{animation:gl-reveal .7s cubic-bezier(.22,1,.36,1) both;animation-delay:calc(var(--i) * 70ms)}
        .gl-card img{transition:transform .9s cubic-bezier(.22,1,.36,1)}
        .gl-card:hover img,.gl-card:focus-visible img{transform:scale(1.12)}
        .gl-shine{position:absolute;inset:0;background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.3) 50%,transparent 65%);transform:translateX(-120%);transition:transform .8s cubic-bezier(.22,1,.36,1);pointer-events:none}
        .gl-card:hover .gl-shine,.gl-card:focus-visible .gl-shine{transform:translateX(120%)}
        @media (hover:none){.gl-cta{opacity:1!important;transform:none!important}}
        @media (prefers-reduced-motion:reduce){
          .gl-card{opacity:1}
          .gl-in .gl-card{animation:none}
          .gl-card img,.gl-shine{transition:none}
        }
      `}</style>

      {/* soft background glow */}
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-amber-100/50 blur-3xl" />

      <div className={`${wrap} relative`}>
        {/* header */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              School life
            </span>
            <h2 className={`${H} mt-3 text-3xl font-black text-slate-900 sm:text-4xl md:text-5xl`}>Moments That Matter</h2>
            <p className="mt-3 max-w-xl text-sm text-slate-600 sm:text-base">
              Sports, celebrations and classroom days, captured as they happen on campus.
            </p>
          </div>

          <Link
            href="/gallery"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-[#0F2A4D] px-6 py-3.5 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:w-auto"
          >
            <span>View Full Gallery</span>
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* compact grid: 2 col (mobile) -> 3 col (tablet) -> 4 col (desktop) */}
        <div
          ref={gridRef}
          className={`${shown ? "gl-in" : ""} mt-8 grid auto-rows-[9.5rem] grid-cols-2 gap-2.5 sm:mt-10 sm:auto-rows-[11rem] sm:grid-cols-3 sm:gap-4 lg:auto-rows-[12.5rem] lg:grid-cols-4`}
        >
          {items.map((item, i) => (
            <Link
              href="/gallery"
              key={`${item.title}-${i}`}
              style={{ "--i": i }}
              aria-label={`${item.title} - open gallery`}
              className="gl-card group relative isolate overflow-hidden rounded-xl bg-slate-200 shadow-sm ring-1 ring-slate-200 transition-shadow duration-500 hover:shadow-xl hover:shadow-blue-900/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:rounded-2xl"
            >
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1B33]/85 via-[#0A1B33]/5 to-transparent" />
              <div className="absolute inset-0 bg-blue-900/0 transition-colors duration-500 group-hover:bg-blue-900/20" />
              <span className="gl-shine" />

              {/* arrow badge (hover) */}
              <span className="gl-cta absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-blue-800 shadow-md backdrop-blur transition duration-500 sm:right-3 sm:top-3 sm:-translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-visible:translate-y-0 sm:group-focus-visible:opacity-100">
                <ArrowUpRight size={15} />
              </span>

              {/* caption */}
              <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3.5">
                <span className="mb-1.5 block h-0.5 w-5 rounded-full bg-amber-400 transition-all duration-500 group-hover:w-10" />
                <h3 className={`${H} line-clamp-2 text-xs font-bold leading-snug text-white drop-shadow sm:text-sm`}>
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {/* bottom link, mobile-friendly */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/gallery"
            className="group inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800"
          >
            Browse all photos
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}