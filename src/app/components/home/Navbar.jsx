
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight, MapPin } from "lucide-react";

import logo from "../../../images/logo.png";

const schoolName = "Adarsha Markaz Academy Laharighat";
const schoolLocation = "Laharighat, Morigaon, Assam";

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
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
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
    "group relative whitespace-nowrap px-3.5 py-2 text-sm font-semibold text-pink-50/90 transition hover:text-white xl:px-4";

  const mobileLinkClass =
    "flex items-center justify-between rounded-xl px-4 py-3 font-semibold text-pink-100/85 transition hover:bg-pink-300/15 hover:text-white";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b border-pink-300/25 backdrop-blur-xl transition-all duration-300 ${
          scrolled
            ? "bg-[#22110b]/95 shadow-xl shadow-black/40"
            : "bg-[#3e2218]/85"
        }`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-amber-300 via-pink-400 to-rose-500"
        />

        <div
          className={`mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 transition-all duration-300 sm:px-6 ${
            scrolled ? "min-h-[4.5rem]" : "min-h-20"
          }`}
        >
          {/* LOGO */}
          <Link
            href="/"
            onClick={closeMenu}
            className="flex min-w-0 items-center gap-3"
          >
            <Image
              src={logo}
              alt={`${schoolName} logo`}
              priority
              className={`w-auto shrink-0 drop-shadow-[0_2px_10px_rgba(244,114,182,0.45)] transition-all duration-300 ${
                scrolled ? "h-11 sm:h-12" : "h-12 sm:h-14"
              }`}
            />

            <div className="min-w-0">
              <h2 className="font-serif text-sm font-black leading-tight text-pink-50 sm:text-lg md:text-xl">
                {schoolName}
              </h2>

              <p className="mt-1 flex items-center gap-1 text-sm leading-tight text-pink-200/80 sm:text-base">
                <MapPin size={14} className="shrink-0 text-pink-300" />
                <span className="truncate">{schoolLocation}</span>
              </p>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-1 lg:flex"
          >
            {menu.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => handleNavigation(item.href)}
                className={navLinkClass}
              >
                {item.name}

                <span className="absolute inset-x-3.5 bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-to-r from-pink-300 to-rose-500 transition-transform duration-300 group-hover:scale-x-100 xl:inset-x-4" />
              </Link>
            ))}
          </nav>

          {/* DESKTOP LOGIN */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="whitespace-nowrap rounded-xl border border-pink-200/30 px-4 py-2.5 text-sm font-semibold text-pink-50 transition hover:border-pink-300/60 hover:bg-pink-300/15"
            >
              Student Login
            </Link>

            <Link
              href="/login"
              className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-pink-400 to-rose-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-600/30 transition hover:from-pink-500 hover:to-rose-600"
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
            className="shrink-0 rounded-xl border border-pink-200/20 bg-pink-300/10 p-2 text-pink-50 transition hover:bg-pink-300/20 focus:outline-none focus:ring-2 focus:ring-pink-300/60 lg:hidden"
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
          className="absolute inset-0 h-full w-full cursor-default bg-[#1a0d08]/70 backdrop-blur-[2px]"
        />

        {/* MENU PANEL */}
        <div
          id="mobile-navigation"
          className={`absolute right-0 top-0 flex h-full w-[min(20rem,85vw)] flex-col overflow-y-auto bg-gradient-to-b from-[#5a3425] via-[#3e2218] to-[#22110b] shadow-2xl shadow-black/50 transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-pink-500/25 blur-3xl"
          />

          {/* MOBILE HEADER */}
          <div className="relative flex items-start justify-between gap-3 border-b border-pink-200/10 p-5">
            <div className="flex min-w-0 items-center gap-3">
              <Image
                src={logo}
                alt={`${schoolName} logo`}
                className="h-14 w-auto shrink-0 drop-shadow-[0_2px_10px_rgba(244,114,182,0.45)]"
              />

              <div className="min-w-0">
                <h2 className="font-serif text-base font-black leading-tight text-pink-50">
                  {schoolName}
                </h2>

                <p className="mt-1 text-xs text-pink-200/80">
                  {schoolLocation}
                </p>

                <p className="mt-1 text-xs font-semibold text-pink-300">
                  Established 2014
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Close menu"
              onClick={closeMenu}
              className="shrink-0 rounded-xl p-2 text-pink-100 transition hover:bg-pink-300/15 focus:outline-none focus:ring-2 focus:ring-pink-300/60"
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
                <ChevronRight size={17} className="text-pink-300/70" />
              </Link>
            ))}

            <Link
              href="/login"
              onClick={closeMenu}
              className="mt-6 block rounded-xl border border-pink-200/30 py-3 text-center font-semibold text-pink-50 transition hover:bg-pink-300/15"
            >
              Student Login
            </Link>

            <Link
              href="/login"
              onClick={closeMenu}
              className="mt-3 block rounded-xl bg-gradient-to-r from-pink-400 to-rose-500 py-3 text-center font-bold text-white shadow-lg shadow-pink-600/30"
            >
              Admin Login
            </Link>

            {/* SCHOOL DETAILS */}
            <div className="mt-5 rounded-xl border border-pink-200/15 bg-white/5 p-4 text-sm text-pink-100/80">
              <p className="font-bold text-pink-50">
                Nursery to Class XII
              </p>
              <p className="mt-1">School Timing: 9:00 AM – 12:35 PM</p>
              <p className="mt-1">Board: ASSEB (Received Prior Permission)</p>
              <p className="mt-1">Affiliated to Markazul Ma&apos;arif, Hojai</p>
              <p className="mt-1">PIN: 782127</p>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
