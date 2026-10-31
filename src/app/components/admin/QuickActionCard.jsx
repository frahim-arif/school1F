"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function QuickActionCard({
  title,
  desc,
  icon: Icon,
  href,
  color = "emerald",
}) {
  const colors = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
    cyan: "bg-cyan-500",
  };

  return (
    <Link
      href={href}
      className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white ${colors[color]}`}
      >
        <Icon size={28} />
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-800">
        {title}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {desc}
      </p>

      <div className="mt-5 flex items-center gap-2 font-semibold text-emerald-600">
        Open

        <ArrowRight
          size={18}
          className="transition group-hover:translate-x-2"
        />
      </div>
    </Link>
  );
}