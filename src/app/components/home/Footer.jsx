"use client";

import Link from "next/link";
import Image from "next/image";

import { Mail, Phone, MapPin, ArrowUp, ArrowRight, ChevronRight, ShieldCheck } from "lucide-react";

import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp } from "react-icons/fa6";

import logo from "../../../images/logo.png";

const H = "font-[family-name:var(--font-head)]";
const wrap = "mx-auto max-w-7xl px-5 md:px-8";

/* Change contact details only here */
const SCHOOL = {
  name: "Adarsha Markaz Academy Laharighat",
  phoneDisplay: "+91 99570 83223",
  phoneTel: "+919957083223",
  whatsapp: "919957083223",
  email: "amalaharighat@gmail.com",
  address: "Laharighat, Morigaon, Assam, India – 782127",
  mapQuery: "Laharighat+Morigaon+Assam+782127",
};

const CREDIT = {
  name: "Web Core Cube Tech",
  phoneDisplay: "9058596626",
  phoneTel: "+919058596626",
};

/* diamond lattice, same as the woven bamboo walls (matches the other sections) */
const weave = {
  backgroundImage:
    "repeating-linear-gradient(45deg,rgba(255,255,255,.045) 0 2px,transparent 2px 14px),repeating-linear-gradient(-45deg,rgba(255,255,255,.045) 0 2px,transparent 2px 14px)",
};

export default function Footer() {
  const year = new Date().getFullYear();
  const schoolName = SCHOOL.name;
  const watermark = schoolName.split(" ").slice(0, 2).join(" ").toUpperCase();

  const socialLinks = [
    { icon: FaFacebookF, href: "#", label: "Facebook" },
    { icon: FaInstagram, href: "#", label: "Instagram" },
    { icon: FaYoutube, href: "#", label: "YouTube" },
    { icon: FaWhatsapp, href: `https://wa.me/${SCHOOL.whatsapp}`, label: "WhatsApp" },
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
    { icon: Phone, label: "Phone", value: SCHOOL.phoneDisplay, href: `tel:${SCHOOL.phoneTel}` },
    { icon: Mail, label: "Email", value: SCHOOL.email, href: `mailto:${SCHOOL.email}` },
    {
      icon: MapPin,
      label: "Address",
      value: SCHOOL.address,
      href: `https://www.google.com/maps/search/?api=1&query=${SCHOOL.mapQuery}`,
    },
  ];

  const linkClass =
    "group flex items-center gap-1.5 text-[13.5px] text-emerald-50/70 transition-all duration-300 hover:translate-x-1 hover:text-[#F2C94C] md:text-[15px]";

  const heading = `${H} text-base font-black text-white md:text-xl`;
  const underline = "mt-2 h-0.5 w-10 bg-[#F2C94C]";

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative text-white">
      {/* ---------- BACKGROUND LAYER (starts below the top of the CTA so the CTA straddles the edge) ---------- */}
      <div
        className="absolute inset-x-0 bottom-0 top-14 overflow-hidden bg-[#0A2A21] md:top-20"
        style={weave}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-[#C8392F]" />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 100%, transparent 30%, rgba(2,14,10,.6) 100%)" }}
        />

        {/* big watermark (desktop only) */}
        <span
          aria-hidden="true"
          className={`${H} pointer-events-none absolute -bottom-6 left-1/2 hidden -translate-x-1/2 select-none whitespace-nowrap text-[9vw] font-black leading-none text-transparent md:block`}
          style={{ WebkitTextStroke: "1.5px rgba(255,255,255,.07)" }}
        >
          {watermark}
        </span>
      </div>

      <div className={`${wrap} relative`}>
        {/* ---------- CTA: admission slip ---------- */}
        <div className="relative flex flex-col overflow-hidden rounded-md bg-[#F8F8F2] text-[#0B2A21] shadow-2xl shadow-black/50 ring-1 ring-black/10 lg:flex-row">
          <div className="bg-[#C8392F] px-5 py-2 text-center text-[11px] font-black uppercase tracking-[0.25em] text-white lg:flex lg:items-center lg:justify-center lg:px-3 lg:py-4 lg:text-xs lg:[writing-mode:vertical-rl] lg:rotate-180">
            Admissions open
          </div>

          <div className="flex flex-1 flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:p-10">
            <div className="max-w-2xl">
              <h2 className={`${H} text-2xl font-black leading-tight text-[#0B3B2E] sm:text-3xl md:text-4xl`}>
                Give your child a better future
              </h2>
              <p className="mt-3 text-[14px] leading-6 text-[#3B5A4F] sm:text-base sm:leading-7">
                Join our school community and give your child quality education, strong values and a bright future.
              </p>
              <div className="mt-4 hidden flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[#0B3B2E] sm:flex">
                {["Safe campus", "Caring teachers", "Value-based learning"].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-[#C8392F]" /> {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row lg:shrink-0 lg:flex-col">
              <Link
                href="/admission"
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-[#0B3B2E] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#145C46] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3B2E] focus-visible:ring-offset-2 md:text-base"
              >
                Apply for Admission
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </Link>
              <a
                href={`tel:${SCHOOL.phoneTel}`}
                className="inline-flex items-center justify-center gap-2 rounded-md px-7 py-3.5 text-sm font-bold text-[#0B3B2E] ring-1 ring-[#0B3B2E]/40 transition hover:bg-[#0B3B2E]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3B2E] md:text-base"
              >
                <Phone size={16} /> Call us
              </a>
            </div>
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
                className="h-12 w-auto shrink-0 object-contain drop-shadow-[0_2px_12px_rgba(242,201,76,0.35)] md:h-16"
              />
              <div>
                <h2 className={`${H} text-lg font-black leading-tight text-white md:text-xl`}>{schoolName}</h2>
                <p className="mt-0.5 text-xs font-semibold text-[#F2C94C]">Estd. 2014</p>
              </div>
            </div>

            <p className="mt-4 max-w-md text-[13.5px] leading-6 text-emerald-50/70 md:mt-6 md:text-base md:leading-8">
              We are committed to providing quality education, developing strong character and preparing students for a
              successful future.
            </p>

            <p className="mt-3 text-xs leading-5 text-emerald-100/65 md:mt-4 md:text-sm md:leading-6">
              Board: ASSEB (Received Prior Permission)
              <br />
              Affiliated to Markazul Ma&apos;arif, Hojai
            </p>

            <p className={`${H} mt-3 border-l-2 border-[#C8392F] pl-3 text-sm italic text-emerald-50/80 md:mt-4 md:pl-4 md:text-base`}>
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
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20 text-emerald-50/80 transition-all duration-300 hover:-translate-y-1 hover:border-[#F2C94C] hover:bg-[#F2C94C] hover:text-[#0A2A21] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2C94C] md:h-11 md:w-11"
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
                    <ChevronRight size={14} className="shrink-0 text-[#C8392F] transition group-hover:text-[#F2C94C]" />
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
                  <ChevronRight size={14} className="shrink-0 text-[#C8392F] transition group-hover:text-[#F2C94C]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className={heading}>Contact Us</h3>
            <div className={underline} />

            <ul className="mt-4 divide-y divide-white/15 border-y border-white/15 lg:mt-6">
              {contacts.map(({ icon: Icon, label, value, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={label === "Address" ? "_blank" : undefined}
                    rel={label === "Address" ? "noopener noreferrer" : undefined}
                    className="group flex items-start gap-3.5 py-3.5 transition hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F2C94C]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#F2C94C] text-[#0A2A21] transition group-hover:bg-white md:h-10 md:w-10">
                      <Icon size={17} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-bold text-white md:text-sm">{label}</span>
                      <span className="mt-0.5 block break-words text-[12.5px] leading-5 text-emerald-50/70 md:text-sm">
                        {value}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---------- BOTTOM BAR ---------- */}
        <div className="border-t border-white/15 py-5 md:py-7">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between md:gap-5">
            <div className="order-2 text-center text-xs text-emerald-100/60 md:order-1 md:text-left md:text-sm">
              <p>
                © {year} {schoolName}. All Rights Reserved.
              </p>
              <p className="mt-1">
                Powered by <span className="font-semibold text-emerald-50/85">{CREDIT.name}</span>
                <span className="mx-1.5 text-white/30">•</span>
                <a href={`tel:${CREDIT.phoneTel}`} className="transition hover:text-[#F2C94C]">
                  {CREDIT.phoneDisplay}
                </a>
              </p>
            </div>

            <div className="order-1 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 md:order-2 md:gap-6">
              {["Privacy Policy", "Terms & Conditions", "Support"].map((item) => (
                <span key={item} className="text-xs text-emerald-50/70 md:text-sm">
                  {item}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Scroll to top"
              className="order-3 flex h-10 w-10 items-center justify-center rounded-md bg-[#F2C94C] text-[#0A2A21] shadow-lg shadow-black/30 transition duration-300 hover:-translate-y-1 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:h-11 md:w-11"
            >
              <ArrowUp size={19} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}