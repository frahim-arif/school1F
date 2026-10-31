"use client";

import Link from "next/link";
import Image from "next/image";

import {
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  ArrowRight,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa6";

import logo from "../../../images/logo.png";

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

  const schoolLinks = [
    "Admissions",
    "Notice Board",
    "School Events",
    "Examination",
    "Our Teachers",
    "Photo Gallery",
  ];

  const linkClass =
    "group flex items-center gap-2 text-pink-100/70 transition-all duration-300 hover:translate-x-1.5 hover:text-pink-300";

  const dot =
    "h-1.5 w-1.5 shrink-0 rounded-full bg-pink-400/0 transition group-hover:bg-pink-400";

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-[#3e2218] to-[#1a0d08] text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-pink-500/15 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-rose-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* CTA */}
        <div className="relative -mt-16 overflow-hidden rounded-[32px] border border-pink-200/20 bg-gradient-to-r from-[#5a3425] via-[#7a3b4f] to-rose-500 p-8 shadow-2xl shadow-black/40 lg:flex lg:items-center lg:justify-between lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-pink-300/30 blur-3xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-pink-50">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-200" />
              Admissions open
            </span>

            <h2 className="mt-5 font-serif text-3xl font-black text-white sm:text-4xl">
              Give Your Child a Better Future
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-pink-50/85">
              Join our school community and give your child quality education,
              strong values and a bright future.
            </p>
          </div>

          <div className="relative mt-7 lg:mt-0">
            <Link
              href="/admission"
              className="group inline-flex items-center gap-2 rounded-2xl bg-[#fffaf8] px-8 py-4 font-bold text-[#3e2218] shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-2xl"
            >
              Apply for Admission
              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>

        {/* MAIN FOOTER */}
        <div className="grid gap-12 py-20 md:grid-cols-2 lg:grid-cols-4">
          {/* School Info */}
          <div>
            <div className="flex items-center gap-4">
              <Image
                src={logo}
                alt={`${schoolName} logo`}
                width={80}
                height={80}
                className="h-16 w-auto shrink-0 object-contain drop-shadow-[0_2px_12px_rgba(244,114,182,0.45)]"
              />

              <div>
                <h2 className="font-serif text-xl font-black leading-tight text-pink-50">
                  {schoolName}
                </h2>
                <p className="mt-1 text-xs text-pink-300">Estd. 2014</p>
              </div>
            </div>

            <p className="mt-6 leading-8 text-pink-100/70">
              We are committed to providing quality education, developing
              strong character and preparing students for a successful future.
            </p>

            <p className="mt-4 text-sm leading-6 text-pink-200/70">
              Board: ASSEB (Received Prior Permission)
              <br />
              Affiliated to Markazul Ma&apos;arif, Hojai
            </p>

            <p className="mt-4 border-l-2 border-pink-400/60 pl-4 font-serif italic text-pink-200/80">
              Taught man which he knew not.
            </p>

            {/* Social Links */}
            <div className="mt-7 flex gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    aria-label={item.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-pink-200/15 bg-white/5 text-pink-100/80 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:bg-gradient-to-br hover:from-pink-400 hover:to-rose-500 hover:text-white hover:shadow-lg hover:shadow-pink-500/30"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-xl font-bold text-pink-50">
              Quick Links
            </h3>

            <div className="mt-2 h-0.5 w-10 rounded-full bg-gradient-to-r from-pink-300 to-rose-500" />

            <div className="mt-7 space-y-4">
              {quickLinks.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className={linkClass}
                >
                  <span className={dot} />
                  {item.title}
                </Link>
              ))}
            </div>
          </div>

          {/* School Links */}
          <div>
            <h3 className="font-serif text-xl font-bold text-pink-50">
              School
            </h3>

            <div className="mt-2 h-0.5 w-10 rounded-full bg-gradient-to-r from-pink-300 to-rose-500" />

            <div className="mt-7 space-y-4">
              {schoolLinks.map((item) => (
                <div key={item} className={linkClass}>
                  <span className={dot} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-serif text-xl font-bold text-pink-50">
              Contact Us
            </h3>

            <div className="mt-2 h-0.5 w-10 rounded-full bg-gradient-to-r from-pink-300 to-rose-500" />

            <div className="mt-7 space-y-6">
              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-gradient-to-br from-pink-400/25 to-rose-500/25 p-3 text-pink-300">
                  <Phone size={20} />
                </div>

                <div>
                  <p className="font-semibold text-pink-50">Phone</p>
                  <p className="mt-1 text-sm text-pink-100/70">
                    +91 98765 43210
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-gradient-to-br from-pink-400/25 to-rose-500/25 p-3 text-pink-300">
                  <Mail size={20} />
                </div>

                <div>
                  <p className="font-semibold text-pink-50">Email</p>
                  <p className="mt-1 break-all text-sm text-pink-100/70">
                    info@ourschool.com
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-gradient-to-br from-pink-400/25 to-rose-500/25 p-3 text-pink-300">
                  <MapPin size={20} />
                </div>

                <div>
                  <p className="font-semibold text-pink-50">Address</p>
                  <p className="mt-1 text-sm leading-6 text-pink-100/70">
                    Laharighat, Morigaon,
                    <br />
                    Assam, India – 782127
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM FOOTER */}
        <div className="border-t border-pink-200/10 py-7">
          <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
            <p className="text-center text-sm text-pink-200/60">
              © {year} {schoolName}. All Rights Reserved.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6">
              {["Privacy Policy", "Terms & Conditions", "Support"].map(
                (item) => (
                  <span
                    key={item}
                    className="text-sm text-pink-100/70"
                  >
                    {item}
                  </span>
                )
              )}
            </div>

            {/* Scroll Top */}
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Scroll to top"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-lg shadow-pink-600/30 transition duration-300 hover:-translate-y-1 hover:from-pink-500 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-pink-300/60"
            >
              <ArrowUp size={19} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}