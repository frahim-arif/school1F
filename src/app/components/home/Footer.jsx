"use client";

import Link from "next/link";
import Image from "next/image";

import { Mail, Phone, MapPin, ArrowUp, ArrowRight, ChevronRight, ShieldCheck, GraduationCap } from "lucide-react";

import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp } from "react-icons/fa6";

import logo from "../../../images/logo.png";

const wrap = "mx-auto max-w-7xl px-5 md:px-8";

export default function Footer() {
  const year = new Date().getFullYear();
  const schoolName = "Adarsha Markaz Academy";

  const socialLinks = [
    { icon: FaFacebookF, href: "#", label: "Facebook" },
    { icon: FaInstagram, href: "#", label: "Instagram" },
    { icon: FaYoutube, href: "#", label: "YouTube" },
    { icon: FaWhatsapp, href: "#", label: "WhatsApp" },
  ];

  const quickLinks = [
    { title: "Home", href: "#home" },
    { title: "About School", href: "#about" },
    { title: "Academics", href: "#academics" },
    { title: "Facilities", href: "#facilities" },
    { title: "Gallery", href: "#gallery" },
    { title: "Contact", href: "#contact" },
  ];

  const schoolLinks = ["Admissions", "Notice Board", "School Events", "Examination", "Our Teachers", "Photo Gallery"];

 const contacts = [
  { icon: Phone, label: "Phone", value: "+91 99570 83223", href: "tel:+919957083223" },
  { icon: Mail, label: "Email", value: "amalaharighat@gmail.com", href: "mailto:amalaharighat@gmail.com" },
  {
    icon: MapPin,
    label: "Address",
    value: "Laharighat, Morigaon, Assam, India – 782127",
    href: "https://www.google.com/maps/search/?api=1&query=Laharighat+Morigaon+Assam+782127",
  },
];

  const linkClass =
    "group flex items-center gap-1.5 text-[13.5px] text-pink-100/70 transition-all duration-300 hover:translate-x-1 hover:text-pink-300 md:text-[15px]";

  const heading = "font-serif text-base font-bold text-pink-50 md:text-xl";
  const underline = "mt-2 h-0.5 w-10 rounded-full bg-gradient-to-r from-pink-300 to-rose-500";

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative text-white">
      {/* ---------- BACKGROUND LAYER (starts below the top of the CTA so the CTA straddles the edge) ---------- */}
      <div className="absolute inset-x-0 bottom-0 top-14 overflow-hidden bg-gradient-to-b from-[#3e2218] to-[#1a0d08] md:top-20">
        {/* top accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-300/60 to-transparent" />

        {/* glows */}
        <div className="absolute -left-32 top-10 h-64 w-64 rounded-full bg-pink-500/15 blur-3xl md:-left-40 md:h-96 md:w-96" />
        <div className="absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-rose-400/10 blur-3xl md:-right-40 md:h-96 md:w-96" />

        {/* dotted pattern */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "22px 22px" }}
        />

        {/* big watermark (desktop only) */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-6 left-1/2 hidden -translate-x-1/2 select-none whitespace-nowrap font-serif text-[9vw] font-black leading-none text-transparent md:block"
          style={{ WebkitTextStroke: "1.5px rgba(251,207,232,.07)" }}
        >
          ADARSHA MARKAZ
        </span>
      </div>

      <div className={`${wrap} relative`}>
        {/* ---------- CTA ---------- */}
        <div className="relative overflow-hidden rounded-3xl border border-pink-200/20 bg-gradient-to-r from-[#5a3425] via-[#7a3b4f] to-rose-500 p-6 shadow-2xl shadow-black/40 sm:p-8 md:rounded-[32px] lg:flex lg:items-center lg:justify-between lg:gap-10 lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-pink-300/30 blur-3xl md:h-64 md:w-64" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "20px 20px" }}
          />
          <GraduationCap
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-6 right-4 hidden h-40 w-40 -rotate-12 text-white/[0.07] sm:block lg:h-56 lg:w-56"
            strokeWidth={1.2}
          />

          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-pink-50 ring-1 ring-white/20 sm:px-4 sm:py-1.5 sm:text-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-200 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-pink-200" />
              </span>
              Admissions open
            </span>

            <h2 className="mt-3 font-serif text-2xl font-black leading-tight text-white sm:mt-5 sm:text-3xl md:text-4xl">
              Give Your Child a Better Future
            </h2>

            <p className="mt-2.5 text-[13.5px] leading-6 text-pink-50/85 sm:mt-4 sm:text-base sm:leading-7">
              Join our school community and give your child quality education, strong values and a bright future.
            </p>

            <div className="mt-4 hidden flex-wrap gap-x-5 gap-y-2 text-sm text-pink-50/90 sm:flex">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-pink-200" /> Safe campus
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-pink-200" /> Caring teachers
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-pink-200" /> Value-based learning
              </span>
            </div>
          </div>

          <div className="relative mt-5 flex flex-col gap-2.5 sm:mt-7 sm:flex-row lg:mt-0 lg:shrink-0 lg:flex-col">
            <Link
              href="/admission"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#fffaf8] px-6 py-3 text-sm font-bold text-[#3e2218] shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-2xl sm:px-8 sm:py-3.5 md:rounded-2xl md:text-base"
            >
              Apply for Admission
              <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </Link>
            <a
              href="tel:+919876543210"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white ring-1 ring-white/35 transition hover:bg-white/10 sm:px-8 sm:py-3.5 md:rounded-2xl md:text-base"
            >
              <Phone size={16} /> Call us
            </a>
          </div>
        </div>

        {/* ---------- MAIN FOOTER ---------- */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 py-10 sm:gap-x-10 md:py-16 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1.2fr] lg:gap-x-12">
          {/* School Info */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3.5 md:gap-4">
              <Image
                src={logo}
                alt={`${schoolName} logo`}
                width={80}
                height={80}
                className="h-12 w-auto shrink-0 object-contain drop-shadow-[0_2px_12px_rgba(244,114,182,0.45)] md:h-16"
              />
              <div>
                <h2 className="font-serif text-lg font-black leading-tight text-pink-50 md:text-xl">{schoolName}</h2>
                <p className="mt-0.5 text-xs text-pink-300">Estd. 2014</p>
              </div>
            </div>

            <p className="mt-4 max-w-md text-[13.5px] leading-6 text-pink-100/70 md:mt-6 md:text-base md:leading-8">
              We are committed to providing quality education, developing strong character and preparing students for a
              successful future.
            </p>

            <p className="mt-3 text-xs leading-5 text-pink-200/70 md:mt-4 md:text-sm md:leading-6">
              Board: ASSEB (Received Prior Permission)
              <br />
              Affiliated to Markazul Ma&apos;arif, Hojai
            </p>

            <p className="mt-3 border-l-2 border-pink-400/60 pl-3 font-serif text-sm italic text-pink-200/80 md:mt-4 md:pl-4 md:text-base">
              Taught man which he knew not.
            </p>

            <div className="mt-5 flex gap-2.5 md:mt-7 md:gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-pink-200/15 bg-white/5 text-pink-100/80 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:bg-gradient-to-br hover:from-pink-400 hover:to-rose-500 hover:text-white hover:shadow-lg hover:shadow-pink-500/30 md:h-11 md:w-11"
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={heading}>Quick Links</h3>
            <div className={underline} />
            <ul className="mt-4 space-y-2.5 md:mt-6 md:space-y-3.5">
              {quickLinks.map((item) => (
                <li key={item.title}>
                  <Link href={item.href} className={linkClass}>
                    <ChevronRight
                      size={14}
                      className="shrink-0 text-pink-400/50 transition group-hover:text-pink-300"
                    />
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* School Links */}
          <div>
            <h3 className={heading}>School</h3>
            <div className={underline} />
            <ul className="mt-4 space-y-2.5 md:mt-6 md:space-y-3.5">
              {schoolLinks.map((item) => (
                <li key={item} className={linkClass}>
                  <ChevronRight
                    size={14}
                    className="shrink-0 text-pink-400/50 transition group-hover:text-pink-300"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className={heading}>Contact Us</h3>
            <div className={underline} />

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 sm:gap-3 lg:mt-6 lg:grid-cols-1">
              {contacts.map(({ icon: Icon, label, value, href }, i) => (
                <a
  href="tel:+919957083223"
  className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white ring-1 ring-white/35 transition hover:bg-white/10 sm:px-8 sm:py-3.5 md:rounded-2xl md:text-base"
>
  <Phone size={16} /> Call us
</a>
              ))}
            </div>
          </div>
        </div>

        {/* ---------- BOTTOM BAR ---------- */}
        <div className="border-t border-pink-200/10 py-5 md:py-7">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between md:gap-5">
            <p className="order-2 text-center text-xs text-pink-200/60 md:order-1 md:text-sm">
              © Powered by- Web core cube tech. _9058596626.
            </p>

            <div className="order-1 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 md:order-2 md:gap-6">
              {["Privacy Policy", "Terms & Conditions", "Support"].map((item) => (
                <span key={item} className="text-xs text-pink-100/70 md:text-sm">
                  {item}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Scroll to top"
              className="order-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-lg shadow-pink-600/30 transition duration-300 hover:-translate-y-1 hover:from-pink-500 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-pink-300/60 md:h-11 md:w-11"
            >
              <ArrowUp size={19} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}