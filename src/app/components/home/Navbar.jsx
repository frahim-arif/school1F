"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight, MapPin } from "lucide-react";

import logo from "../../../images/logo.png";

const schoolName = "Niz Dhing GyanDeep Jatiya Bidyalaya";
const schoolLocation = "Niz Dhing, Nagaon, Assam";
const udiseCode = "18100102011";

const menu = [
  { name: "Home", href: "/#home" },
  { name: "About", href: "/#about" },
  { name: "Academics", href: "/#academics" },
  { name: "Facilities", href: "/#facilities" },
  { name: "Gallery", href: "/#gallery" },
  { name: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileOpen]);

  const closeMenu = () => setMobileOpen(false);

  const handleNavigation = (href) => {
    closeMenu();

    if (href.startsWith("/#") && pathname === "/") {
      const sectionId = href.substring(2);

      if (sectionId === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const section = document.getElementById(sectionId);

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

  const navLinkClass =
    "whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold text-sky-100/85 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 xl:px-4";

  const mobileLinkClass =
    "flex items-center justify-between rounded-xl px-4 py-3 font-semibold text-sky-100/90 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 backdrop-blur-xl transition-all duration-300 ${
          scrolled
            ? "bg-[#061A3A]/90 shadow-2xl shadow-black/40"
            : "bg-[#061A3A]/70"
        }`}
      >
        {/* soft sky glow behind the bar */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -left-10 -top-16 h-40 w-72 rounded-full bg-sky-500/25 blur-3xl" />
          <div className="absolute -right-10 -top-16 h-40 w-72 rounded-full bg-blue-500/25 blur-3xl" />
        </div>

        {/* bottom hairline + scroll progress */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-sky-300/50 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-px left-0 h-0.5 origin-left bg-gradient-to-r from-sky-400 via-white to-sky-300 shadow-[0_0_12px_rgba(125,211,252,0.9)] transition-transform duration-150 ease-out"
          style={{ width: "100%", transform: `scaleX(${progress})` }}
        />

        <div
          className={`relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 transition-all duration-300 sm:px-6 ${
            scrolled ? "min-h-[4.5rem]" : "min-h-20"
          }`}
        >
          {/* LOGO */}
          <Link
            href="/"
            onClick={closeMenu}
            className="flex min-w-0 items-center gap-3"
          >
            {/* White box so the logo's white background looks clean on the dark navbar */}
            <span
              className={`flex shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-[0_0_24px_rgba(56,189,248,0.45)] ring-2 ring-sky-300/50 transition-all duration-300 ${
                scrolled
                  ? "h-12 w-12 sm:h-14 sm:w-14"
                  : "h-14 w-14 sm:h-16 sm:w-16"
              }`}
            >
              <Image
                src={logo}
                alt={`${schoolName} logo`}
                priority
                className="h-full w-full object-contain"
              />
            </span>

            <div className="min-w-0">
              <h2 className="font-serif text-sm font-black leading-tight text-white sm:text-lg md:text-xl">
                {schoolName}
              </h2>

              <p className="mt-1 flex items-center gap-1 text-sm leading-tight text-sky-200/80 sm:text-base">
                <MapPin size={14} className="shrink-0 text-sky-300" />
                <span className="truncate">{schoolLocation}</span>
              </p>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION (glass pill) */}
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-0.5 rounded-full bg-white/5 p-1 ring-1 ring-white/15 lg:flex"
          >
            {menu.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => handleNavigation(item.href)}
                className={navLinkClass}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* DESKTOP LOGIN */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/student/login"
              className="whitespace-nowrap rounded-xl bg-white/5 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            >
              Student Login
            </Link>

            <Link
              href="/login"
              className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_-6px_rgba(56,189,248,0.7)] transition hover:from-sky-300 hover:to-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Admin Login
              <ChevronRight size={18} />
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen(true)}
            className="shrink-0 rounded-xl bg-white/10 p-2 text-white ring-1 ring-white/25 transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 lg:hidden"
          >
            <Menu size={26} />
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 z-[60] transition ${
          mobileOpen
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0"
        }`}
        aria-hidden={!mobileOpen}
      >
        {/* OVERLAY */}
        <button
          type="button"
          aria-label="Close navigation menu"
          tabIndex={mobileOpen ? 0 : -1}
          onClick={closeMenu}
          className="absolute inset-0 h-full w-full cursor-default bg-[#030d20]/70 backdrop-blur-[3px]"
        />

        {/* MENU PANEL */}
        <div
          id="mobile-navigation"
          className={`absolute right-0 top-0 flex h-full w-[min(20rem,85vw)] flex-col overflow-y-auto bg-gradient-to-b from-[#0B3A7A] via-[#0A2A5E] to-[#061A3A] shadow-2xl shadow-black/60 ring-1 ring-white/10 transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-400/35 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-blue-500/25 blur-3xl"
          />

          {/* MOBILE HEADER */}
          <div className="relative flex items-start justify-between gap-3 border-b border-white/10 p-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-[0_0_24px_rgba(56,189,248,0.45)] ring-2 ring-sky-300/50">
                <Image
                  src={logo}
                  alt={`${schoolName} logo`}
                  className="h-full w-full object-contain"
                />
              </span>

              <div className="min-w-0">
                <h2 className="font-serif text-base font-black leading-tight text-white">
                  {schoolName}
                </h2>

                <p className="mt-1 text-xs text-sky-200/80">
                  {schoolLocation}
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Close menu"
              onClick={closeMenu}
              className="shrink-0 rounded-xl p-2 text-sky-100 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            >
              <X size={26} />
            </button>
          </div>

          {/* MOBILE LINKS */}
          <nav
            aria-label="Mobile navigation"
            className="relative space-y-1.5 p-5"
          >
            {menu.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => handleNavigation(item.href)}
                className={mobileLinkClass}
              >
                {item.name}
                <ChevronRight size={17} className="text-sky-300/80" />
              </Link>
            ))}

            <Link
              href="/student/login"
              onClick={closeMenu}
              className="mt-6 block rounded-xl bg-white/5 py-3 text-center font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/15"
            >
              Student Login
            </Link>

            <Link
              href="/login"
              onClick={closeMenu}
              className="mt-3 block rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 py-3 text-center font-bold text-white shadow-[0_8px_24px_-6px_rgba(56,189,248,0.7)]"
            >
              Admin Login
            </Link>

            {/* SCHOOL DETAILS */}
            <div className="mt-5 rounded-xl border border-white/15 bg-white/5 p-4 text-sm text-sky-100/85 backdrop-blur">
              <p className="font-bold text-white">{schoolName}</p>
              <p className="mt-1">{schoolLocation}</p>
              <p className="mt-1">UDISE: {udiseCode}</p>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}