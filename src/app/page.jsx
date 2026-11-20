
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Inter, Merriweather } from "next/font/google";

import Navbar from "./components/home/Navbar";
import Footer from "./components/home/Footer";
import HeroSlider from "./components/home/HeroSlider";
import SchoolGlance from "./components/home/SchoolGlance";
import WelcomeSection from "./components/home/WelcomeSection";
import PrincipalSection from "./components/home/PrincipalSection";
import AcademicsSection from "./components/home/AcademicsSection";
import FacilitiesSection from "./components/home/FacilitiesSection";
import StatsSection from "./components/home/StatsSection";
import NoticesSection from "./components/home/NoticesSection";
import GallerySection from "./components/home/GallerySection";

import principalPhoto from "../images/principal.jpg";

import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Users,
  Trophy,
  ShieldCheck,
  CalendarDays,
  MapPin,
  Phone,
  Mail,
  Award,
  Building2,
  HeartHandshake,
  Clock,
  BadgeCheck,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

const merri = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-head",
});

const H = "font-[family-name:var(--font-head)]";
const wrap = "mx-auto max-w-7xl px-5 md:px-8";

// ======================================================
// SCHOOL CONFIGURATION
// ======================================================

const SCHOOL_NAME = "Niz Dhing GyanDeep Jatiya Bidyalaya";

const SCHOOL_CONTACT = {
  phone: "9101026601",
  email: "nizdhinggyandeepjb@gmail.com",
  address: "Vill + P.O. Niz Dhing, Nagaon, Assam - 782123",
  udise: "18100102011",
};

// Backend API
const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

// ======================================================
// PUBLIC API FUNCTIONS
// ======================================================

async function fetchPublicData(endpoint) {
  try {
    const response = await fetch(
      `${API_BASE}/api/${endpoint}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(
        `${endpoint} request failed (${response.status})`
      );
    }

    const result = await response.json();

    if (
      result?._status === false ||
      result?.success === false
    ) {
      throw new Error(
        result?._message || `Unable to load ${endpoint}`
      );
    }

    return result;
  } catch (error) {
    console.error(
      `Homepage: failed to load ${endpoint}`,
      error
    );

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

function formatCount(count) {
  return count > 0
    ? count.toLocaleString("en-IN")
    : "0";
}

// ======================================================
// LIVE VISITOR COUNTER
// ======================================================

function useVisitors() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    let alive = true;

    async function loadVisitors() {
      try {
        const alreadyVisited =
          sessionStorage.getItem("visited") === "1";

        const response = await fetch(
          `${API_BASE}/api/visitors${
            alreadyVisited ? "" : "/hit"
          }`,
          {
            method: alreadyVisited ? "GET" : "POST",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Visitors API failed: ${response.status}`
          );
        }

        const json = await response.json();

        if (json.success !== true) {
          throw new Error(
            json.message || "Unable to load visitors"
          );
        }

        const total = Number(json?.data?.total);

        if (!Number.isFinite(total)) {
          throw new Error("Invalid visitor count");
        }

        if (alive) {
          setCount(total);
          sessionStorage.setItem("visited", "1");
        }
      } catch (error) {
        console.error(
          "Homepage: visitor counter unavailable",
          error
        );
      }
    }

    loadVisitors();

    return () => {
      alive = false;
    };
  }, []);

  return count;
}

// ======================================================
// SECTION HEADING
// ======================================================

function SectionHead({
  tag,
  title,
  text,
  center = false,
  dark = false,
}) {
  return (
    <div
      className={
        center
          ? "mx-auto max-w-3xl text-center"
          : "max-w-2xl"
      }
    >
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
          dark
            ? "bg-white/10 text-blue-100 ring-1 ring-white/15"
            : "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            dark ? "bg-amber-400" : "bg-blue-600"
          }`}
        />
        {tag}
      </span>

      <h2
        className={`${H} mt-4 text-3xl font-black leading-tight md:text-4xl ${
          dark ? "text-white" : "text-slate-900"
        }`}
      >
        {title}
      </h2>

      {text && (
        <p
          className={`mt-4 text-base leading-7 md:text-lg ${
            dark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {text}
        </p>
      )}
    </div>
  );
}

// ======================================================
// HOME PAGE
// ======================================================

export default function Home() {
  const [school, setSchool] = useState({});
  const [studentCount, setStudentCount] = useState(null);
  const [teacherCount, setTeacherCount] = useState(null);

  const visitors = useVisitors();

  // Load school, student and teacher data
  useEffect(() => {
    let isMounted = true;

    async function loadHomepage() {
      const [
        schoolResult,
        studentsResult,
        teachersResult,
      ] = await Promise.all([
        fetchPublicData("school"),
        fetchPublicData("students"),
        fetchPublicData("teachers"),
      ]);

      if (!isMounted) return;

      setSchool(toSchool(schoolResult));

      setStudentCount(
        toList(studentsResult, ["students"]).length
      );

      setTeacherCount(
        toList(teachersResult, ["teachers"]).length
      );
    }

    loadHomepage();

    return () => {
      isMounted = false;
    };
  }, []);

  // ====================================================
  // SCHOOL DETAILS
  // ====================================================

  const schoolName = SCHOOL_NAME;

  const schoolPhone = SCHOOL_CONTACT.phone;
  const schoolEmail = SCHOOL_CONTACT.email;
  const schoolAddress = SCHOOL_CONTACT.address;

  const principalName =
    school.principalName || "Principal";

  const principalQualification =
    school.principalQualification || "";

  // Do not assume an establishment year or affiliation.
  const establishedYear = Number(
    school.establishedYear || school.established || 0
  );

  const yearsOfService = establishedYear > 0
    ? Math.max(
        new Date().getFullYear() - establishedYear,
        0
      )
    : null;

  const studentsValue =
    studentCount === null
      ? "—"
      : formatCount(studentCount);

  const teachersValue =
    teacherCount === null
      ? "—"
      : formatCount(teacherCount);

  const visitorsValue =
    visitors === null
      ? "—"
      : visitors.toLocaleString("en-IN");

  // ====================================================
  // SCHOOL FACTS
  // ====================================================

  const schoolFacts = [
    {
      icon: MapPin,
      label: "Location",
      value: "Niz Dhing, Nagaon, Assam",
    },
    {
      icon: BadgeCheck,
      label: "UDISE Code",
      value: SCHOOL_CONTACT.udise,
    },
    {
      icon: Phone,
      label: "Contact",
      value: SCHOOL_CONTACT.phone,
    },
    {
      icon: Mail,
      label: "Email",
      value: SCHOOL_CONTACT.email,
    },
  ];

  // ====================================================
  // ACADEMIC PROGRAMS
  // ====================================================

  const academicPrograms = [
    {
      icon: BookOpen,
      title: "Primary Education",
      desc: "Building strong foundations through engaging and meaningful learning.",
    },
    {
      icon: GraduationCap,
      title: "Middle Education",
      desc: "Developing knowledge, confidence and independent thinking.",
    },
    {
      icon: Award,
      title: "Secondary Education",
      desc: "Encouraging academic growth and preparing students for future opportunities.",
    },
    {
      icon: Trophy,
      title: "Co-curricular Activities",
      desc: "Encouraging creativity, sports, teamwork and overall development.",
    },
  ];

  // ====================================================
  // SCHOOL FACILITIES
  // ====================================================

  const facilities = [
    {
      icon: BookOpen,
      title: "Library",
      desc: "A learning space that encourages reading and knowledge.",
    },
    {
      icon: Building2,
      title: "Classrooms",
      desc: "An environment designed to support effective learning.",
    },
    {
      icon: Trophy,
      title: "Sports & Activities",
      desc: "Opportunities for physical fitness and teamwork.",
    },
    {
      icon: Users,
      title: "Student Development",
      desc: "Encouraging participation, confidence and creativity.",
    },
    {
      icon: ShieldCheck,
      title: "Student Safety",
      desc: "Promoting a safe and supportive school environment.",
    },
    {
      icon: HeartHandshake,
      title: "Student Support",
      desc: "Supporting students throughout their learning journey.",
    },
  ];

  // ====================================================
  // NOTICES AND EVENTS
  // ====================================================

  const fallbackEvents = [
    "School Events",
    "Academic Activities",
    "Parent-Teacher Meetings",
    "Sports and Cultural Programmes",
  ];

  // ====================================================
  // GALLERY
  // Add your photographs in public/images/
  // ====================================================

  const galleryItems = [
    {
      image: "/images/gallery-1.jpg",
      title: "School Campus",
    },
    {
      image: "/images/gallery-2.jpg",
      title: "Classroom Activities",
    },
    {
      image: "/images/gallery-3.jpg",
      title: "School Events",
    },
  ];

  // ====================================================
  // CONTACT
  // ====================================================

  const mapAddress = encodeURIComponent(
    "Niz Dhing, Nagaon, Assam 782123"
  );

  return (
    <>
      <Navbar />

      <main
        className={`${inter.className} ${merri.variable} overflow-hidden bg-slate-50 text-slate-800`}
      >

        {/* ==========================================
            HERO SLIDER
        ========================================== */}

        <HeroSlider
          schoolName={schoolName}
          school={school}
          visitorsValue={visitorsValue}
          studentsValue={studentsValue}
          teachersValue={teachersValue}
          yearsOfService={yearsOfService}
        />

        {/* ==========================================
            SCHOOL AT A GLANCE
        ========================================== */}

        <SchoolGlance
          facts={schoolFacts}
          schoolName={schoolName}
        />

        {/* ==========================================
            WELCOME SECTION
        ========================================== */}

        <WelcomeSection
          school={school}
          schoolName={schoolName}
        />

        {/* ==========================================
            PRINCIPAL MESSAGE
        ========================================== */}

       <PrincipalSection
  principalName={principalName}
  principalQualification={principalQualification}
  schoolName={schoolName}
/>

        {/* ==========================================
            ACADEMICS
        ========================================== */}

        <AcademicsSection
          programs={academicPrograms}
        />

        {/* ==========================================
            FACILITIES
        ========================================== */}

        <FacilitiesSection
          facilities={facilities}
        />

        {/* ==========================================
            STATISTICS
        ========================================== */}

        <StatsSection
          studentsValue={studentsValue}
          teachersValue={teachersValue}
          yearsOfService={yearsOfService}
          visitors={visitors}
        />

        {/* ==========================================
            NOTICES AND EVENTS
        ========================================== */}

        <NoticesSection
          fallbackEvents={fallbackEvents}
        />

        {/* ==========================================
            GALLERY
        ========================================== */}

       <GallerySection
  galleryItems={galleryItems}
/>

        {/* ==========================================
            ADMISSIONS CTA
        ========================================== */}

        <section className="py-16 sm:py-20 md:py-24">
          <div className={wrap}>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-[#0F2A4D] p-6 shadow-2xl shadow-blue-900/30 sm:p-10 md:p-14">

              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-xl" />

              <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" />

              <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">

                <div>
                  <SectionHead
                    dark
                    tag="Admissions"
                    title="Build a Bright Future With Us"
                  />

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base sm:leading-8">
                    Join {schoolName} and become a part of
                    a learning community that encourages
                    knowledge, confidence and personal growth.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">

                  <Link
                    href="/online-admission"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-8 py-4 font-bold text-slate-900 shadow-lg transition hover:-translate-y-1 hover:bg-amber-300"
                  >
                    Apply for Admission
                    <ArrowRight size={18} />
                  </Link>

                  <Link
                    href="#contact"
                    className="inline-flex items-center justify-center rounded-xl bg-white/10 px-8 py-4 font-bold text-white ring-1 ring-white/30 transition hover:bg-white/20"
                  >
                    Contact School
                  </Link>

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            CONTACT SECTION
        ========================================== */}

        <section
          id="contact"
          style={{ scrollMarginTop: "5rem" }}
          className="relative overflow-hidden bg-white py-16 sm:py-20 md:py-24"
        >
          <div className={`${wrap} grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16`}>

            {/* CONTACT INFORMATION */}

            <div>
              <SectionHead
                tag="Contact Us"
                title="Get in Touch With Our School"
                text="For admission enquiries, school information or other assistance, please contact us."
              />

              <div className="mt-8 space-y-4">

                {/* Phone */}

                <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Phone size={20} />
                  </span>

                  <div className="min-w-0">
                    <p className="text-sm text-slate-500">
                      Phone
                    </p>

                    <a
                      href={`tel:${schoolPhone}`}
                      className="break-all font-bold text-slate-900 hover:text-blue-700"
                    >
                      {schoolPhone}
                    </a>
                  </div>
                </div>

                {/* Email */}

                <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Mail size={20} />
                  </span>

                  <div className="min-w-0">
                    <p className="text-sm text-slate-500">
                      Email
                    </p>

                    <a
                      href={`mailto:${schoolEmail}`}
                      className="break-all font-bold text-slate-900 hover:text-blue-700"
                    >
                      {schoolEmail}
                    </a>
                  </div>
                </div>

                {/* Address */}

                <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <MapPin size={20} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-500">
                      School Address
                    </p>

                    <p className="font-bold leading-snug text-slate-900">
                      {schoolAddress}
                    </p>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${mapAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900"
                    >
                      Get Directions
                      <ArrowRight size={15} />
                    </a>
                  </div>
                </div>

                {/* UDISE */}

                <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <BadgeCheck size={20} />
                  </span>

                  <div>
                    <p className="text-sm text-slate-500">
                      UDISE Code
                    </p>

                    <p className="font-bold text-slate-900">
                      {SCHOOL_CONTACT.udise}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* QUICK LINKS */}

            <div className="rounded-3xl bg-slate-50 p-5 shadow-xl shadow-blue-900/5 ring-1 ring-slate-200 sm:p-7 md:p-8">

              <h3 className={`${H} text-xl font-black text-slate-900 sm:text-2xl`}>
                Quick Links
              </h3>

              <div className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">

                {[
                  ["About School", "/about"],
                  ["Academics", "/academics"],
                  ["Teachers", "/teachers"],
                  ["Gallery", "/gallery"],
                  ["Notices", "/notices"],
                  ["Online Admission", "/online-admission"],
                  ["Student Login", "/login"],
                  ["Homework", "/homework"],
                ].map(([title, href]) => (
                  <Link
                    key={title}
                    href={href}
                    className="group flex items-center justify-between rounded-xl bg-white px-5 py-4 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:-translate-y-1 hover:bg-blue-600 hover:text-white hover:ring-blue-600"
                  >
                    {title}

                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                ))}

              </div>

              {/* COMMITMENT */}

              <div className="mt-7 flex gap-4 rounded-2xl bg-gradient-to-br from-[#0F2A4D] to-blue-900 p-5">

                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400 ring-1 ring-amber-400/30">
                  <HeartHandshake size={25} />
                </span>

                <div>
                  <h4 className={`${H} font-bold text-white`}>
                    Our Commitment
                  </h4>

                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Encouraging every student to develop
                    knowledge, confidence, good character
                    and a positive attitude towards learning.
                  </p>
                </div>

              </div>

            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
