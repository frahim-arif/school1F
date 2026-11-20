"use client";

import { Gem, Heart, Lightbulb, Rocket, Sparkles, Target, Users } from "lucide-react";

const H = "font-[family-name:var(--font-head)]";

/* Pehli row: icon + chhoti line. Yahan texts badal sakte ho. */
const VALUES = [
  { icon: Lightbulb, text: "Lighting the lamp of knowledge" },
  { icon: Gem, text: "Character before everything" },
  { icon: Target, text: "Discipline that builds dreams" },
  { icon: Users, text: "Respect for teachers and elders" },
  { icon: Heart, text: "Compassion for every child" },
  { icon: Rocket, text: "Leaders of tomorrow" },
  { icon: Sparkles, text: "Confidence to shine" },
];

/* Doosri row: bade khokhle words */
const WORDS = ["Knowledge", "Character", "Discipline", "Respect", "Compassion", "Leadership", "Confidence"];

function Chip({ icon: Icon, text }) {
  return (
    <span className="mx-2 flex shrink-0 items-center gap-3 rounded-full bg-white/[0.07] py-2 pl-2 pr-5 ring-1 ring-white/20 backdrop-blur transition hover:bg-white/15 sm:mx-3 sm:py-2.5 sm:pl-2.5 sm:pr-6">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-300 to-blue-600 text-white shadow-[0_0_18px_rgba(56,189,248,0.7)] sm:h-10 sm:w-10">
        <Icon size={18} />
      </span>
      <span className={`${H} whitespace-nowrap text-base font-bold text-white sm:text-lg md:text-xl`}>{text}</span>
    </span>
  );
}

function Word({ text }) {
  return (
    <span className="flex shrink-0 items-center">
      <span
        className={`${H} px-5 text-4xl font-black text-transparent sm:px-8 sm:text-5xl md:text-6xl`}
        style={{ WebkitTextStroke: "1.5px rgba(125,211,252,0.55)" }}
      >
        {text}
      </span>
      <span className="h-2.5 w-2.5 rotate-45 bg-sky-300 shadow-[0_0_12px_rgba(125,211,252,0.95)]" aria-hidden="true" />
    </span>
  );
}

export default function ValuesBand({ className = "" }) {
  /* seamless loop: ek half ko 2 baar bharte hain, phir poora half dobara */
  const chipHalf = [...VALUES, ...VALUES];
  const wordHalf = [...WORDS, ...WORDS];
  const fade = {
    WebkitMaskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)",
    maskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)",
  };

  return (
    <div
      className={`vb-band relative overflow-hidden py-7 md:py-10 ${className}`}
      style={{ background: "linear-gradient(90deg,#061A3A,#0A2A5E 50%,#061A3A)" }}
      aria-label="Our values"
    >
      <style>{`
        @keyframes vb-left{to{transform:translateX(-50%)}}
        @keyframes vb-right{from{transform:translateX(-50%)}to{transform:translateX(0)}}
        .vb-left{animation:vb-left 48s linear infinite}
        .vb-right{animation:vb-right 60s linear infinite}
        .vb-band:hover .vb-left,.vb-band:hover .vb-right{animation-play-state:paused}
        @media (prefers-reduced-motion:reduce){
          .vb-left,.vb-right{animation:none;width:100%;flex-wrap:wrap;justify-content:center;row-gap:.75rem}
          .vb-dup{display:none}
        }
      `}</style>

      {/* glows and hairlines */}
      <div aria-hidden="true" className="pointer-events-none absolute left-1/4 top-1/2 h-32 w-80 -translate-y-1/2 rounded-full bg-sky-500/30 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute right-1/4 top-1/2 h-32 w-80 -translate-y-1/2 rounded-full bg-blue-500/30 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />

      {/* row 1: value chips, moving left */}
      <div className="relative" style={fade}>
        <div className="vb-left flex w-max items-center">
          {chipHalf.map((v, i) => (
            <Chip key={`a-${i}`} {...v} />
          ))}
          <div className="vb-dup flex items-center" aria-hidden="true">
            {chipHalf.map((v, i) => (
              <Chip key={`b-${i}`} {...v} />
            ))}
          </div>
        </div>
      </div>

      {/* row 2: big outlined words, moving right */}
      <div className="relative mt-5 md:mt-7" style={fade} aria-hidden="true">
        <div className="vb-right flex w-max items-center">
          {wordHalf.map((w, i) => (
            <Word key={`c-${i}`} text={w} />
          ))}
          <div className="vb-dup flex items-center">
            {wordHalf.map((w, i) => (
              <Word key={`d-${i}`} text={w} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}