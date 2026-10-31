"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/home/Navbar";
import Footer from "./components/home/Footer";
import Link from "next/link";
import Image from "next/image";
import { Inter, Merriweather } from "next/font/google";
 import HeroSlider from "./components/home/HeroSlider";
  import SchoolGlance from "./components/home/SchoolGlance";
  import WelcomeSection from "./components/home/WelcomeSection";
  import PrincipalSection from "./components/home/PrincipalSection";
   import AcademicsSection from "./components/home/AcademicsSection";
    import FacilitiesSection from "./components/home/FacilitiesSection";
    import StatsSection from "./components/home/StatsSection";
    import NoticesSection from "./components/home/NoticesSection";
    import GallerySection from "./components/home/GallerySection";

// Principal photo is stored at: src/images/principal.jpg (this file is src/app/page.jsx)
import principalPhoto from "../images/principal.jpg";
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Users,
  BookOpen,
  Trophy,
  ShieldCheck,
  Bell,
  CalendarDays,
  MapPin,
  Phone,
  Mail,
  Award,
  Building2,
  HeartHandshake,
  Star,
  Clock,
  BadgeCheck,
  Eye,
  Quote,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"] });
const merri = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-head",
});
const H = "font-[family-name:var(--font-head)]";
const wrap = "mx-auto max-w-7xl px-5 md:px-8";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");

async function fetchPublicData(endpoint) {
  try {
    const response = await fetch(`${API_BASE}/api/${endpoint}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`${endpoint} request failed (${response.status})`);
    const result = await response.json();
    if (result?._status === false || result?.success === false) {
      throw new Error(result?._message || `Unable to load ${endpoint}`);
    }
    return result;
  } catch (error) {
    console.error(`Homepage: failed to load ${endpoint}`, error);
    return null;
  }
}

function unwrapData(result) {
  if (!result) return null;
  if (result.data !== undefined) return result.data;
  if (result.school !== undefined) return result.school;
  return result;
}

function toList(result, possibleKeys = []) {
  const data = unwrapData(result);
  if (Array.isArray(data)) return data;
  for (const key of possibleKeys) {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(result?.[key])) return result[key];
  }
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(result?.items)) return result.items;
  return [];
}

function toSchool(result) {
  const data = unwrapData(result);
  if (Array.isArray(data)) return data[0] || {};
  return data && typeof data === "object" ? data : {};
}

function formatCount(count, fallback) {
  return count > 0 ? count.toLocaleString("en-IN") : fallback;
}

/* Live visitor counter: counts once per browser session, then just reads the total */
/* Live visitor counter: counts once per browser session */
function useVisitors() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    let alive = true;

    async function loadVisitors() {
      try {
        const alreadyVisited = sessionStorage.getItem("visited") === "1";

        const response = await fetch(
          `${API_BASE}/api/visitors${alreadyVisited ? "" : "/hit"}`,
          {
            method: alreadyVisited ? "GET" : "POST",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(`Visitors API failed: ${response.status}`);
        }

        const json = await response.json();

        if (json.success !== true) {
          throw new Error(json.message || "Unable to load visitor count");
        }

        const total = Number(json?.data?.total);

        if (!Number.isFinite(total)) {
          throw new Error("Invalid visitor count received");
        }

        if (alive) {
          setCount(total);
          sessionStorage.setItem("visited", "1");
        }
      } catch (error) {
        console.error("Homepage: visitor counter unavailable", error);
      }
    }

    loadVisitors();

    return () => {
      alive = false;
    };
  }, []);

  return count;
}

function SectionHead({ tag, title, text, center = false, dark = false }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
          dark ? "bg-white/10 text-blue-100 ring-1 ring-white/15" : "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${dark ? "bg-amber-400" : "bg-blue-600"}`} />
        {tag}
      </span>
      <h2 className={`${H} mt-4 text-3xl font-black leading-tight md:text-4xl ${dark ? "text-white" : "text-slate-900"}`}>
        {title}
      </h2>
      {text && <p className={`mt-4 text-base leading-7 md:text-lg ${dark ? "text-slate-300" : "text-slate-600"}`}>{text}</p>}
    </div>
  );
}

export default function Home() {
  const [school, setSchool] = useState({});
  const [studentCount, setStudentCount] = useState(null);
  const [teacherCount, setTeacherCount] = useState(null);
  const visitors = useVisitors();

  useEffect(() => {
    let isMounted = true;
    async function loadHomepage() {
      const [schoolResult, studentsResult, teachersResult] = await Promise.all([
        fetchPublicData("school"),
        fetchPublicData("students"),
        fetchPublicData("teachers"),
      ]);
      if (!isMounted) return;
      setSchool(toSchool(schoolResult));
      setStudentCount(toList(studentsResult, ["students"]).length);
      setTeacherCount(toList(teachersResult, ["teachers"]).length);
    }
    loadHomepage();
    return () => {
      isMounted = false;
    };
  }, []);

  const schoolName = school.schoolName || school.name || "Adarsha Markaz Academy";
  const schoolPhone = school.phone || school.contactNumber || "";
  const schoolEmail = school.email || "";
  const schoolAddress = school.address || "";
  // Principal details (fixed, not loaded from the API)
  const principalName = "Md Baharul Islam";
  const principalQualification = "MM, MA, PhD (Scholar)";

  const schoolFacts = [
    { icon: CalendarDays, label: "Established", value: "2014" },
    { icon: GraduationCap, label: "Classes", value: "Nursery to Class XII" },
    { icon: Clock, label: "School timing", value: "9:00 AM – 12:35 PM" },
    { icon: BadgeCheck, label: "School board", value: "ASSEB (Received Prior Permission)" },
    { icon: Building2, label: "Affiliated to", value: "Markazul Ma\u2019arif, Hojai" },
  ];

  const academicPrograms = [
    { icon: BookOpen, title: "Primary School", desc: "Building strong foundations through engaging learning." },
    { icon: GraduationCap, title: "Middle School", desc: "Developing knowledge, confidence and independent thinking." },
    { icon: Award, title: "Secondary School", desc: "Focused preparation for academic excellence and future goals." },
    { icon: Trophy, title: "Activities", desc: "Sports, arts, cultural activities and competitions." },
  ];

  const facilities = [
    { icon: BookOpen, title: "Library", desc: "A rich collection of books and learning resources." },
    { icon: Building2, title: "Smart Classrooms", desc: "Modern classrooms supporting interactive learning." },
    { icon: Trophy, title: "Sports", desc: "Opportunities for physical fitness and teamwork." },
    { icon: Users, title: "Activity Rooms", desc: "Creative spaces for art, culture and activities." },
    { icon: ShieldCheck, title: "Safe Campus", desc: "A secure and caring environment for students." },
    { icon: HeartHandshake, title: "Student Support", desc: "Guidance and support throughout the school journey." },
  ];

  const fallbackNotices = [
    "Admission forms are now available.",
    "Annual examination schedule published.",
    "Parent-Teacher Meeting announced.",
    "School holiday notice.",
  ];
  const fallbackEvents = ["Annual Examination", "Parent-Teacher Meeting", "Annual Sports Day", "Cultural Programme"];
  const galleryItems = [
    { image: "/images/gallery-1.jpg", title: "School Campus" },
    { image: "/images/gallery-2.jpg", title: "Classroom Activities" },
    { image: "/images/gallery-3.jpg", title: "Annual Events" },
  ];

  const yearsOfService = Math.max(new Date().getFullYear() - 2014, 0);
  const studentsValue = studentCount === null ? "—" : formatCount(studentCount, "0");
  const teachersValue = teacherCount === null ? "—" : formatCount(teacherCount, "0");
  const visitorsValue = visitors === null ? "—" : visitors.toLocaleString("en-IN");

  const contactIcon =
    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20";

  return (
    <>
      <Navbar />
      <main className={`${inter.className} ${merri.variable} overflow-hidden bg-slate-50 text-slate-800`}>
        {/* HERO */}
           <HeroSlider
     schoolName={schoolName}
     school={school}
     visitorsValue={visitorsValue}
     studentsValue={studentsValue}
     teachersValue={teachersValue}
     yearsOfService={yearsOfService}
   />

        {/* SCHOOL AT A GLANCE */}
          <SchoolGlance facts={schoolFacts} schoolName={schoolName} />

        {/* WELCOME */}
       <WelcomeSection school={school} schoolName={schoolName} />

        {/* PRINCIPAL MESSAGE */}
        <PrincipalSection
     principalName={principalName}
     principalQualification={principalQualification}
     principalPhoto={principalPhoto}
     schoolName={schoolName}
   />

        {/* ACADEMICS */}
         <AcademicsSection programs={academicPrograms} />
        {/* FACILITIES */}
          <FacilitiesSection facilities={facilities} />

        {/* STATS */}
       <StatsSection
  studentsValue={studentsValue}
  teachersValue={teachersValue}
  yearsOfService={yearsOfService}
  visitors={visitors}
/>

        {/* NOTICES + EVENTS */}
       <NoticesSection fallbackEvents={fallbackEvents} />

        
        {/* GALLERY */}
<GallerySection galleryItems={galleryItems} />

        {/* ADMISSION CTA */}
        {/* ADMISSIONS CTA */}
<section className="py-16 sm:py-20 md:py-24">
  <style>{`
    @keyframes cta-float{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-18px,16px) scale(1.08)}}
    @keyframes cta-float2{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-14px)}}
    @keyframes cta-shine{0%{transform:translateX(-130%) skewX(-20deg)}55%,100%{transform:translateX(230%) skewX(-20deg)}}
    @keyframes cta-pulse{0%,100%{box-shadow:0 0 0 0 rgba(251,191,36,.55)}70%{box-shadow:0 0 0 14px rgba(251,191,36,0)}}
    .cta-blob{animation:cta-float 9s ease-in-out infinite}
    .cta-blob2{animation:cta-float2 11s ease-in-out infinite}
    .cta-btn{animation:cta-pulse 2.6s ease-out infinite}
    .cta-btn::after{content:"";position:absolute;inset:0;width:40%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.65),transparent);animation:cta-shine 3.6s ease-in-out infinite;pointer-events:none}
    @media (prefers-reduced-motion:reduce){.cta-blob,.cta-blob2,.cta-btn,.cta-btn::after{animation:none}}
  `}</style>

  <div className={wrap}>
    <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-[#0F2A4D] p-6 shadow-2xl shadow-blue-900/30 sm:p-10 md:p-14">
      {/* animated background */}
      <div className="cta-blob pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-xl" />
      <div className="cta-blob2 pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <GraduationCap
        size={190}
        strokeWidth={1}
        className="pointer-events-none absolute -bottom-8 -right-6 hidden text-white/10 sm:block"
      />

      <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto] lg:gap-12">
        <div>
          <SectionHead dark tag="Admissions open" title="Give Your Child a Strong Start" />
          <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base sm:leading-8">
            Join {schoolName} and give your child an environment where learning, confidence and character
            grow together.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Link
            href="/online-admission"
            className="cta-btn group/btn relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-amber-400 px-8 py-4 font-bold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
          >
            Apply for Admission
            <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex w-full items-center justify-center rounded-xl bg-white/10 px-8 py-4 font-bold text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
          >
            Contact School
          </Link>
        </div>
      </div>
    </div>
  </div>
</section>

        {/* CONTACT */}
       {/* CONTACT */}
<section id="contact" style={{ scrollMarginTop: "5rem" }} className="relative overflow-hidden bg-white py-16 sm:py-20 md:py-24">
  <style>{`
    @keyframes ct-rise{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:none}}
    @keyframes ct-glow{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-14px,12px) scale(1.12)}}
    @keyframes ct-beat{0%,100%{transform:scale(1)}50%{transform:scale(1.14)}}
    .ct-blob{animation:ct-glow 10s ease-in-out infinite}
    .ct-heart{animation:ct-beat 2.4s ease-in-out infinite}
    /* scroll-reveal sirf un browsers mein jo support karte hain; baaki mein content seedha dikhta hai */
    @supports (animation-timeline: view()){
      .ct-rise{animation:ct-rise linear both;animation-timeline:view();animation-range:entry 0% entry 45%}
    }
    @media (prefers-reduced-motion:reduce){
      .ct-blob,.ct-heart{animation:none}
      .ct-rise{animation:none!important;opacity:1!important;transform:none!important}
    }
  `}</style>

  {/* soft background glow */}
  <div className="ct-blob pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
  <div className="ct-blob pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-amber-100/50 blur-3xl" />

  <div className={`${wrap} relative grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16`}>
    {/* ============ LEFT: CONTACT INFO ============ */}
    <div className="ct-rise">
      <SectionHead
        tag="Contact us"
        title="We'd Love to Hear From You"
        text="For admissions, enquiries or any other information, please feel free to contact our school office."
      />

      <div className="mt-8 space-y-3 sm:mt-9 sm:space-y-4">
        {/* Phone */}
        <div className="group flex items-center gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-blue-900/10 hover:ring-blue-200 sm:p-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30 transition duration-300 group-hover:scale-110 group-hover:-rotate-6">
            <Phone size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 sm:text-sm">Phone</p>
            {schoolPhone ? (
              <a href={`tel:${schoolPhone}`} className="font-bold text-slate-900 transition hover:text-blue-700">
                {schoolPhone}
              </a>
            ) : (
              <p className="font-bold text-slate-900">Contact number not available</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="group flex items-center gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-blue-900/10 hover:ring-blue-200 sm:p-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30 transition duration-300 group-hover:scale-110 group-hover:-rotate-6">
            <Mail size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 sm:text-sm">Email</p>
            {schoolEmail ? (
              <a href={`mailto:${schoolEmail}`} className="break-all font-bold text-slate-900 transition hover:text-blue-700">
                {schoolEmail}
              </a>
            ) : (
              <p className="font-bold text-slate-900">Email not available</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="group flex items-center gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-blue-900/10 hover:ring-blue-200 sm:p-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30 transition duration-300 group-hover:scale-110 group-hover:-rotate-6">
            <MapPin size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-500 sm:text-sm">Address</p>
            <p className="font-bold leading-snug text-slate-900">
              {schoolAddress || "Laharighat, Morigaon, Assam – 782127"}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                schoolAddress || "Laharighat, Morigaon, Assam 782127"
              )}`}
              target="_blank"
              rel="noreferrer"
              className="group/dir mt-1.5 inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-800"
            >
              Get directions
              <ArrowRight size={14} className="transition-transform group-hover/dir:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </div>

    {/* ============ RIGHT: QUICK LINKS ============ */}
    <div className="ct-rise rounded-3xl bg-slate-50 p-5 shadow-xl shadow-blue-900/5 ring-1 ring-slate-200 sm:p-7 md:p-8">
      <h3 className={`${H} text-xl font-black text-slate-900 sm:text-2xl`}>Quick Links</h3>

      <div className="mt-5 grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 sm:mt-6 sm:gap-3">
        {[
          ["About School", "/about"],
          ["Academics", "/academics"],
          ["Teachers", "/teachers"],
          ["Gallery", "/gallery"],
          ["Notices", "/notices"],
          ["Contact", "/contact"],
        ].map(([title, href]) => (
          <Link
            key={title}
            href={href}
            className="group flex items-center justify-between rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-600/25 hover:ring-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:px-5"
          >
            {title}
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        ))}
      </div>

      {/* Commitment */}
      <div className="relative mt-6 flex gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F2A4D] to-blue-900 p-5 sm:mt-7">
        <div className="ct-blob pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-400/15 blur-2xl" />
        <span className="ct-heart relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 ring-1 ring-amber-400/30">
          <HeartHandshake size={24} className="text-amber-400" />
        </span>
        <div className="relative">
          <h4 className={`${H} font-bold text-white`}>Our Commitment</h4>
          <p className="mt-1 text-sm leading-6 text-slate-300">
            Every child deserves quality education, encouragement and an opportunity to succeed.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

        <Footer />
      </main>
    </>
  );
}