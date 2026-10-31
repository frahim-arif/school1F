"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import {
  HiOutlineBell,
  HiOutlineMagnifyingGlass,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineChevronDown,
  HiOutlineCalendarDays,
} from "react-icons/hi2";

// Turns "/admin/academic-setup/classes" into the page title "Academic Setup".
// Shows "Dashboard" for /admin/dashboard and anything unknown.
function getPageTitle(pathname) {
  const segments = (pathname || "").split("/").filter(Boolean);
  const section = segments[1];

  if (!section || section === "dashboard") return "Dashboard";

  return section
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function Navbar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);

  const title = getPageTitle(pathname);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 border-b border-pink-100 bg-[#fffaf8]/90 shadow-sm shadow-pink-100/40 backdrop-blur-xl">
      {/* thin pink accent line */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#5a3425] via-pink-400 to-rose-500"
      />

      {/* pl-16 on small screens keeps clear of the fixed mobile menu button */}
      <div className="flex min-h-20 items-center justify-between gap-4 py-3 pl-16 pr-4 md:pr-6 lg:pl-8 lg:pr-8">
        {/* LEFT */}
        <div className="hidden shrink-0 md:flex md:flex-col">
          <h1 className="font-serif text-2xl font-black text-[#3e2218]">
            {title}
          </h1>

          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[#a58576]">
            <HiOutlineCalendarDays size={15} className="text-pink-400" />
            {today}
          </p>
        </div>

        {/* SEARCH */}
        <div className="hidden w-full max-w-xl lg:flex">
          <div className="relative w-full">
            <HiOutlineMagnifyingGlass
              size={20}
              className="absolute left-4 top-3.5 text-pink-400"
            />

            <input
              type="text"
              placeholder="Search students, teachers, fees..."
              aria-label="Search"
              className="w-full rounded-xl border border-pink-100 bg-pink-50/70 py-3 pl-12 pr-4 text-sm text-[#3e2218] outline-none transition placeholder:text-[#b59a8d] focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-200/60"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* DARK MODE */}
          <button
            type="button"
            onClick={() => setDark(!dark)}
            className="rounded-xl border border-pink-100 bg-white p-3 text-[#5a3425] transition hover:border-pink-300 hover:bg-pink-50 hover:text-rose-500 focus:outline-none focus:ring-2 focus:ring-pink-300/60"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {dark ? <HiOutlineSun size={20} /> : <HiOutlineMoon size={20} />}
          </button>

          {/* NOTIFICATION */}
          <button
            type="button"
            className="relative rounded-xl border border-pink-100 bg-white p-3 text-[#5a3425] transition hover:border-pink-300 hover:bg-pink-50 hover:text-rose-500 focus:outline-none focus:ring-2 focus:ring-pink-300/60"
            title="Notifications"
            aria-label="Notifications"
          >
            <HiOutlineBell size={20} />

            <span className="absolute right-2 top-2 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 ring-2 ring-white" />
            </span>
          </button>

          {/* PROFILE */}
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-pink-100 bg-white px-2 py-2 transition hover:border-pink-300 hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-300/60 sm:gap-3 sm:px-3"
          >
            <img
              src="https://ui-avatars.com/api/?name=School+Admin&background=3e2218&color=fbcfe8"
              alt="School Administrator"
              className="h-9 w-9 rounded-full ring-2 ring-pink-300 sm:h-10 sm:w-10"
            />

            <div className="hidden text-left lg:block">
              <h4 className="text-sm font-bold text-[#3e2218]">
                Administrator
              </h4>

              <p className="text-xs text-[#a58576]">School Admin</p>
            </div>

            <HiOutlineChevronDown
              size={18}
              className="hidden text-pink-400 sm:block"
            />
          </button>
        </div>
      </div>
    </header>
  );
}