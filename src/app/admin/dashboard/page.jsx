"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  Users,
  UserCheck,
  UserPlus,
  UserRoundCog,
  Wallet,
  ClipboardCheck,
  ClipboardList,
  Bell,
  CalendarDays,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  BookOpen,
  CreditCard,
  Activity,
  ChevronRight,
  MapPin,
  Phone,
  BadgeCheck,
  Building2,
  Clock,
  UserRound,
  FileText,
  Images,
  Eye,
  Paperclip,
  Percent,
  Layers,
   Bus,
  Award,
  BedDouble,
  Library,
  Settings,
  Banknote,
  LayoutGrid,
  ChevronDown,
} from "lucide-react";

// Logo is stored at: src/images/logo.png
// Path below is relative to src/app/admin/dashboard/page.jsx
import logo from "../../../images/logo.png";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const API_ROOT = API_BASE.endsWith("/api") ? API_BASE : `${API_BASE}/api`;

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_STYLE = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Draft: "bg-slate-100 text-slate-600 ring-slate-200",
  Expired: "bg-amber-50 text-amber-700 ring-amber-200",
};
const MODULES = [
  { title: "Front Office", icon: Building2, tone: "rose", links: [
    ["Dashboard", "/admin/front-office"], ["Admission Enquiry", "/admin/front-office/admission-enquiry"],
    ["Visitor Book", "/admin/front-office/visitors"], ["Phone Call Log", "/admin/front-office/calls"],
    ["Postal / Dispatch Records", "/admin/front-office/postal-records"], ["Complaints", "/admin/front-office/complaints"],
    ["Front Office Settings", "/admin/front-office/settings"],
  ]},
  { title: "Students", icon: Users, tone: "indigo", links: [
    ["All Students", "/admin/students"], ["Add Student", "/admin/students/create"],
    ["Student Details", "/admin/students/details"], ["Student Categories", "/admin/students/categories"],
    ["Student House / Groups", "/admin/students/houses"], ["Promotion", "/admin/students/promotion"],
    ["Student ID Cards", "/admin/students/id-cards"], ["Student Attendance", "/admin/attendance/student"],
    ["Student Reports", "/admin/students/reports"],
  ]},
  { title: "Academics", icon: GraduationCap, tone: "emerald", links: [
    ["Academic Overview", "/admin/academic-setup"], ["Classes", "/admin/academic-setup/classes"],
    ["Sections", "/admin/academic-setup/sections"], ["Subjects", "/admin/academic-setup/subjects"],
    ["Class–Subject Assignment", "/admin/academic-setup/class-subjects"], ["Timetable", "/admin/academic-setup/timetable"],
    ["Class Timetable", "/admin/academic-setup/class-timetable"], ["Teacher Timetable", "/admin/academic-setup/teacher-timetable"],
    ["Academic Calendar", "/admin/academic-setup/calendar"], ["Syllabus", "/admin/academic-setup/syllabus"],
    ["Academic Settings", "/admin/academic-setup/settings"],
  ]},
  { title: "Attendance", icon: ClipboardCheck, tone: "amber", links: [
    ["Dashboard", "/admin/attendance"], ["Take Attendance", "/admin/attendance/take"], ["Today", "/admin/attendance/today"],
    ["Student Attendance", "/admin/attendance/student"], ["Teacher Attendance", "/admin/attendance/teacher"],
    ["Staff Attendance", "/admin/attendance/staff"], ["Attendance History", "/admin/attendance/history"],
    ["Leave Management", "/admin/attendance/leave"], ["Holidays", "/admin/attendance/holidays"],
    ["Biometric Attendance", "/admin/attendance/biometric"], ["Attendance Reports", "/admin/attendance/reports"],
    ["Attendance Settings", "/admin/attendance/settings"],
  ]},
  { title: "Finance", icon: Wallet, tone: "sky", links: [
    ["Finance Dashboard", "/admin/fees"], ["Fee Structure", "/admin/fees/structure"], ["Collect Fees", "/admin/fees/collect"],
    ["Fee Discounts", "/admin/fees/discounts"], ["Fee Due / Defaulters", "/admin/fees/defaulters"],
    ["Fee History", "/admin/fees/history"], ["Payment Transactions", "/admin/fees/transactions"],
    ["Expenses", "/admin/finance/expenses"], ["Income", "/admin/finance/income"],
    ["Financial Reports", "/admin/fees/reports"], ["Finance Settings", "/admin/finance/settings"],
  ]},
  { title: "Human Resource", icon: UserRoundCog, tone: "pink", links: [
    ["HR Dashboard", "/admin/hr"], ["All Teachers", "/admin/teachers"], ["Add Teacher", "/admin/teachers/create"],
    ["Departments", "/admin/teachers/departments"], ["All Staff", "/admin/staff"], ["Add Staff", "/admin/staff/create"],
    ["Staff Attendance", "/admin/staff/attendance"], ["Leave Applications", "/admin/hr/leaves"],
    ["Staff ID Cards", "/admin/certificates/staff-id-cards"], ["HR Reports", "/admin/hr/reports"], ["HR Settings", "/admin/hr/settings"],
  ]},
  { title: "Payroll", icon: Banknote, tone: "emerald", links: [
    ["Payroll Dashboard", "/admin/payroll"], ["Salary Structure", "/admin/payroll/structure"],
    ["Generate Salary", "/admin/payroll/generate"], ["Salary Payments", "/admin/payroll/payments"],
    ["Salary Slips", "/admin/payroll/slips"], ["Deductions & Allowances", "/admin/payroll/deductions"],
    ["Payroll Reports", "/admin/payroll/reports"], ["Payroll Settings", "/admin/payroll/settings"],
  ]},
  { title: "Examinations", icon: GraduationCap, tone: "indigo", links: [
    ["Exam Dashboard", "/admin/exams"], ["Create Exam", "/admin/exams/create"], ["Exam List", "/admin/exams/list"],
    ["Exam Schedule", "/admin/exams/schedule"], ["Marks Entry", "/admin/exams/marks"], ["Results", "/admin/exams/results"],
    ["Admit Cards", "/admin/exams/admit-cards"], ["Grade Settings", "/admin/exams/grades"],
    ["Exam Reports", "/admin/exams/reports"], ["Exam Settings", "/admin/exams/settings"],
  ]},
  { title: "Communication", icon: Bell, tone: "rose", links: [
    ["Notice Dashboard", "/admin/notices"], ["All Notices", "/admin/notices"], ["Create Notice", "/admin/notices/create"],
    ["Notice Settings", "/admin/notices/settings"], ["Events & Calendar", "/admin/communication/events"],
    ["SMS / Notifications", "/admin/communication/notifications"], ["Email Messages", "/admin/communication/email"],
    ["Message Templates", "/admin/communication/templates"], ["Communication Reports", "/admin/communication/reports"],
  ]},
  { title: "Transportation", icon: Bus, tone: "amber", links: [
    ["Transport Dashboard", "/admin/transportation"], ["Routes", "/admin/transportation/routes"],
    ["Vehicles", "/admin/transportation/vehicles"], ["Drivers & Attendants", "/admin/transportation/staff"],
    ["Assign Students", "/admin/transportation/assignments"], ["Transport Fees", "/admin/transportation/fees"],
    ["Fuel & Maintenance", "/admin/transportation/maintenance"], ["Transport Reports", "/admin/transportation/reports"],
    ["Transport Settings", "/admin/transportation/settings"],
  ]},
  { title: "Certificates", icon: Award, tone: "sky", links: [
    ["Certificate Dashboard", "/admin/certificates"], ["Create Certificate", "/admin/certificates/create"],
    ["Issued Certificates", "/admin/certificates/issued"], ["Student ID Cards", "/admin/students/id-cards"],
    ["Staff ID Cards", "/admin/certificates/staff-id-cards"], ["Certificate Templates", "/admin/certificates/templates"],
    ["Certificate Settings", "/admin/certificates/settings"],
  ]},
  { title: "Hostels", icon: BedDouble, tone: "pink", links: [
    ["Hostel Dashboard", "/admin/hostels"], ["Hostel List", "/admin/hostels/list"], ["Rooms", "/admin/hostels/rooms"],
    ["Room Allocation", "/admin/hostels/allocation"], ["Hostel Attendance", "/admin/hostels/attendance"],
    ["Hostel Fees", "/admin/hostels/fees"], ["Visitors & Complaints", "/admin/hostels/visitors"],
    ["Hostel Reports", "/admin/hostels/reports"], ["Hostel Settings", "/admin/hostels/settings"],
  ]},
  { title: "Online Admission", icon: FileText, tone: "emerald", links: [
    ["Admission Dashboard", "/admin/online-admission"], ["Admission Applications", "/admin/online-admission/applications"],
    ["Review Applications", "/admin/online-admission/review"], ["Approved Applications", "/admin/online-admission/approved"],
    ["Rejected Applications", "/admin/online-admission/rejected"], ["Admission Form Settings", "/admin/online-admission/settings"],
    ["Admission Reports", "/admin/online-admission/reports"],
  ]},
  { title: "Library", icon: Library, tone: "indigo", links: [
    ["Library Dashboard", "/admin/library"], ["Books", "/admin/library/books"], ["Add Book", "/admin/library/create"],
    ["Issue Books", "/admin/library/issue"], ["Return Books", "/admin/library/return"],
    ["Overdue Books", "/admin/library/overdue"], ["Members", "/admin/library/members"],
    ["Library Reports", "/admin/library/reports"], ["Library Settings", "/admin/library/settings"],
  ]},
  { title: "Homework", icon: BookOpen, tone: "amber", links: [
    ["Homework Dashboard", "/admin/homework"], ["Create Homework", "/admin/homework/create"],
    ["All Homework", "/admin/homework/all"], ["Submitted Homework", "/admin/homework/submitted"],
    ["Homework Reports", "/admin/homework/reports"], ["Homework Settings", "/admin/homework/settings"],
  ]},
  { title: "Gallery", icon: Images, tone: "rose", links: [
    ["Gallery Dashboard", "/admin/gallery"], ["All Photos & Videos", "/admin/gallery/photos"],
    ["Add Gallery Item", "/admin/gallery/create"], ["Albums", "/admin/gallery/albums"],
    ["Gallery Settings", "/admin/gallery/settings"],
  ]},
  { title: "Settings", icon: Settings, tone: "sky", links: [
    ["General Settings", "/admin/settings"], ["School Profile", "/admin/settings/profile"],
    ["Academic Settings", "/admin/settings/academic"], ["Users & Roles", "/admin/settings/roles"],
    ["Permissions", "/admin/settings/permissions"], ["Notifications", "/admin/settings/notifications"],
    ["Backup & Restore", "/admin/settings/backup"],
  ]},
];

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [school, setSchool] = useState(null);
  const [notices, setNotices] = useState([]);
  const [noticeStats, setNoticeStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dateLabel, setDateLabel] = useState("");
  const [greeting, setGreeting] = useState("Welcome back");

  const loadDashboard = async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);
    setApiError("");

    const request = async (path) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`${API_ROOT}${path}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || `Failed to load ${path}`);
      }
      return data;
    };

    try {
      const results = await Promise.allSettled([
        request("/students"),
        request("/teachers"),
        request("/school"),
        request("/notices?limit=5"),
        request("/notices/stats"),
      ]);
      const failures = [];

      if (results[0].status === "fulfilled") {
        const data = results[0].value;
        const list = Array.isArray(data) ? data : data.students || data.data?.students || data.data || [];
        setStudents(Array.isArray(list) ? list : []);
      } else {
        failures.push("students");
        setStudents([]);
      }

      if (results[1].status === "fulfilled") {
        const data = results[1].value;
        const list = Array.isArray(data) ? data : data.teachers || data.data?.teachers || data.data || [];
        setTeachers(Array.isArray(list) ? list : []);
      } else {
        failures.push("teachers");
        setTeachers([]);
      }

      if (results[2].status === "fulfilled") {
        const data = results[2].value;
        setSchool(data.school || data.data?.school || data);
      } else {
        failures.push("school information");
        setSchool(null);
      }

      if (results[3].status === "fulfilled") {
        const list = results[3].value.notices;
        setNotices(Array.isArray(list) ? list : []);
      } else {
        failures.push("notices");
        setNotices([]);
      }

      if (results[4].status === "fulfilled") {
        setNoticeStats(results[4].value.stats || null);
      } else {
        setNoticeStats(null);
      }

      if (failures.length) {
        setApiError(`Kuch data load nahi hua: ${failures.join(", ")}. Backend routes check karein.`);
      }
      setLastUpdated(new Date());
    } catch (error) {
      setApiError(error.message || "Dashboard load nahi ho saka.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Date + greeting are set after mount so server and browser output always match.
  useEffect(() => {
    const now = new Date();
    setDateLabel(
      new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now)
    );
    const h = now.getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  const schoolName = "Adarsha Markaz Academy";
  // Principal is fixed (not loaded from the API)
  const principal = "Md Baharul Islam";
  const address = school?.address || "Laharighat, Morigaon, Assam - 782127";

  const formatName = (s) => [s.firstName, s.lastName].filter(Boolean).join(" ") || "Unnamed Student";

  const recentStudents = useMemo(
    () =>
      [...students]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 5),
    [students]
  );

  const classAnalytics = useMemo(() => {
    const counts = {};
    students.forEach((s) => {
      const c = s.className || "Unassigned";
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [students]);

  const activeStudents = students.filter((s) => !s.status || s.status === "Active").length;
  const inactiveStudents = Math.max(0, students.length - activeStudents);
  const pct = (n) => (students.length ? Math.round((n / students.length) * 100) : 0);
  const activePercent = pct(activeStudents);
  const ratio = teachers.length ? Math.round(students.length / teachers.length) : 0;
  const classCount = classAnalytics.filter((c) => c.name !== "Unassigned").length;
  const maxClass = Math.max(1, ...classAnalytics.map((c) => c.count));
  const v = (n) => (loading ? "…" : Number(n).toLocaleString("en-IN"));

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 pb-8 text-slate-800 sm:space-y-8">
      {/* HEADER (left padding on mobile leaves room for the sidebar menu button) */}
      <div className="flex flex-col justify-between gap-4 pl-14 sm:flex-row sm:items-center lg:pl-0">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-100">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            School management system
          </span>
          <h1 className="mt-2.5 text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">Analytics Dashboard</h1>
          <p className="mt-1.5 flex min-h-5 items-center gap-2 text-sm text-slate-500">
            <CalendarDays size={16} className="text-rose-500" />
            {dateLabel || "\u00a0"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadDashboard(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-rose-50 hover:text-rose-700 hover:ring-rose-200 disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {apiError && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-bold">Dashboard data incomplete</p>
            <p className="mt-1">{apiError}</p>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-rose-600 to-pink-700 p-5 text-white shadow-2xl shadow-rose-900/20 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-72 w-72 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-pink-300/30 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold ring-1 ring-white/25">
              <Activity size={14} />
              {greeting}, Administrator
            </span>
            <h2 className="mt-4 text-2xl font-black leading-tight sm:text-4xl">{schoolName}</h2>
            <p className="mt-2.5 text-sm leading-6 text-rose-50/90 sm:text-base">
              Monitor your school operations, student records and daily activities from one place.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/admin/students/create"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-rose-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-rose-50"
              >
                <UserPlus size={17} />
                New Admission
              </Link>
              <Link
                href="/admin/students"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-bold ring-1 ring-white/30 backdrop-blur transition hover:bg-white/20"
              >
                View Students <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white/12 p-4 ring-1 ring-white/25 backdrop-blur-md sm:gap-5 sm:p-5 lg:min-w-80">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white p-1.5 shadow-lg sm:h-20 sm:w-20">
              <Image src={logo} alt={`${schoolName} logo`} className="h-full w-auto object-contain" />
            </div>
            <div>
              <p className="text-xs font-semibold text-rose-100">Total enrollment</p>
              <p className="mt-0.5 text-4xl font-black tabular-nums sm:text-5xl">{v(students.length)}</p>
              <p className="mt-0.5 text-xs text-rose-100/90">Students in database</p>
            </div>
          </div>
        </div>
      </section>

      {/* KPI CARDS */}
      <section>
        <SectionTitle title="School at a Glance" sub="Key figures from connected APIs" right={loading ? "Loading..." : "Latest available data"} />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-6">
          <StatTile title="Total Students" value={v(students.length)} icon={GraduationCap} tone="rose" />
          <StatTile title="Teachers" value={v(teachers.length)} icon={Users} tone="indigo" />
          <StatTile title="Active Students" value={v(activeStudents)} icon={UserCheck} tone="emerald" />
          <StatTile title="Inactive Students" value={v(inactiveStudents)} icon={UserRoundCog} tone="amber" />
          <StatTile title="Classes" value={v(classCount)} icon={Layers} tone="sky" />
          <StatTile title="Students per Teacher" value={loading ? "…" : ratio || "—"} icon={Percent} tone="pink" />
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section>
        <SectionTitle title="Quick Actions" sub="Frequently used school management tools" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 xl:grid-cols-8">
          {[
            ["New Admission", "/admin/students/create", UserPlus],
            ["Collect Fees", "/admin/fees/collect", Wallet],
            ["Attendance", "/admin/attendance/take", ClipboardCheck],
            ["Create Notice", "/admin/notices/create", Bell],
            ["Create Exam", "/admin/exams/create", GraduationCap],
            ["Homework", "/admin/homework/create", BookOpen],
            ["Add to Gallery", "/admin/gallery/create", Images],
            ["Admissions", "/admin/online-admission", ClipboardList],
          ].map(([title, href, Icon]) => (
            <ActionTile key={title} title={title} href={href} icon={Icon} />
          ))}
        </div>
      </section>

      {/* ALL MODULES (sidebar quick links) */}
<section>
  <SectionTitle title="All Modules" sub="Sidebar ke saare quick links ek jagah" right={`${MODULES.length} modules`} />
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {MODULES.map((m) => (
      <ModuleCard key={m.title} module={m} />
    ))}
  </div>
</section>

      {/* ANALYTICS */}
      <section className="grid gap-5 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Class-wise Student Distribution" sub="Enrollment across available classes" icon={BookOpen}>
          {loading ? (
            <p className="py-12 text-center text-sm text-slate-400">Loading class analytics...</p>
          ) : classAnalytics.length ? (
            <div className="mt-6 space-y-4">
              {classAnalytics.map((item) => {
                const p = pct(item.count);
                return (
                  <div key={item.name}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                      <span className="font-bold text-slate-700">
                        {item.name === "Unassigned" ? item.name : `Class ${item.name}`}
                      </span>
                      <span className="shrink-0 font-bold tabular-nums text-slate-700">
                        {item.count} <span className="font-medium text-slate-400">({p}%)</span>
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-rose-50">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-600 to-pink-400 transition-all duration-700"
                        style={{ width: `${Math.max(4, (item.count / maxClass) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={GraduationCap} title="No student analytics yet" text="Class distribution will appear after student records are added." />
          )}
          <Link href="/admin/students" className="mt-6 inline-flex items-center gap-1 text-sm font-extrabold text-rose-600 hover:text-rose-700">
            Manage student records <ChevronRight size={16} />
          </Link>
        </Panel>

        <Panel title="Student Status" sub="Active versus inactive records" icon={Users}>
          {loading ? (
            <p className="py-12 text-center text-sm text-slate-400">Loading...</p>
          ) : (
            <>
              <div className="mt-6 flex items-center gap-5">
                <div
                  className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#e11d48 ${students.length ? (activeStudents / students.length) * 360 : 0}deg, #ffe4e6 0deg)`,
                  }}
                >
                  <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white shadow-inner">
                    <span className="text-2xl font-black text-slate-900">{activePercent}%</span>
                    <span className="text-[10px] text-slate-500">Active</span>
                  </div>
                </div>
                <div className="min-w-0 space-y-4">
                  <Legend color="bg-rose-600" label="Active" value={activeStudents} />
                  <Legend color="bg-rose-100 ring-1 ring-rose-200" label="Inactive" value={inactiveStudents} />
                </div>
              </div>
              <p className="mt-6 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
                Students without a status are counted as active, consistent with the default Student model status.
              </p>
            </>
          )}
        </Panel>
      </section>

      {/* NOTICES (live) + RECENT ADMISSIONS */}
      <section className="grid gap-5 xl:grid-cols-2">
        <Panel title="Notices & Announcements" sub="Live from your notices backend" icon={Bell}>
          {noticeStats && (
            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {[
                ["Total", noticeStats.total, "bg-slate-50 text-slate-700"],
                ["Active", noticeStats.active, "bg-emerald-50 text-emerald-700"],
                ["Drafts", noticeStats.drafts, "bg-rose-50 text-rose-700"],
                ["Views", noticeStats.views, "bg-sky-50 text-sky-700"],
              ].map(([label, n, tone]) => (
                <div key={label} className={`rounded-2xl p-3 text-center ${tone}`}>
                  <p className="text-xl font-black tabular-nums">{Number(n || 0).toLocaleString("en-IN")}</p>
                  <p className="text-[11px] font-semibold opacity-80">{label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 space-y-2.5">
            {loading ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Loading notices...</p>
            ) : notices.length ? (
              notices.map((n) => (
                <Link
                  key={n._id}
                  href="/admin/notices"
                  className="group flex items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-transparent transition hover:bg-rose-50 hover:ring-rose-200"
                >
                  <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-rose-100">
                    <span className="text-lg font-black leading-none text-rose-600">
                      {n.publishDate ? new Date(n.publishDate).toLocaleDateString("en-IN", { day: "2-digit" }) : "--"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {n.publishDate ? new Date(n.publishDate).toLocaleDateString("en-IN", { month: "short" }) : ""}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-extrabold text-slate-900">{n.title}</span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                      <span>{n.category || "General"}</span>
                      <span>·</span>
                      <span>{n.audience || "All Students"}</span>
                      {n.attachment && <Paperclip size={12} />}
                      <span className="inline-flex items-center gap-1">
                        <Eye size={12} /> {n.views || 0}
                      </span>
                    </span>
                  </span>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold ring-1 ${STATUS_STYLE[n.status] || STATUS_STYLE.Active}`}>
                    {n.status || "Active"}
                  </span>
                </Link>
              ))
            ) : (
              <EmptyState icon={Bell} title="No notices yet" text="Create your first notice and it will appear here and on the school website." />
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href="/admin/notices/create"
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-500/25 transition hover:bg-rose-700"
            >
              <Bell size={16} /> Create Notice
            </Link>
            <Link href="/admin/notices" className="inline-flex items-center gap-1 text-sm font-extrabold text-rose-600 hover:text-rose-700">
              View all notices <ChevronRight size={16} />
            </Link>
          </div>
        </Panel>

        <Panel title="Recent Admissions" sub="Latest student records" icon={UserPlus} action={{ label: "View all", href: "/admin/students" }}>
          <div className="mt-5 space-y-2.5">
            {loading ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Loading students...</p>
            ) : recentStudents.length ? (
              recentStudents.map((s) => (
                <div
                  key={s._id || s.admissionNo}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-transparent transition hover:bg-rose-50 hover:ring-rose-200"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-sm font-black text-white shadow-md shadow-rose-500/25">
                    {(s.firstName || "S").slice(0, 1).toUpperCase()}
                    {(s.lastName || "").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-slate-900">{formatName(s)}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Class {s.className || "—"}
                      {s.section ? ` · Section ${s.section}` : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">Admission No: {s.admissionNo || "—"}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold ring-1 ${
                      s.status === "Inactive" ? STATUS_STYLE.Draft : STATUS_STYLE.Active
                    }`}
                  >
                    {s.status || "Active"}
                  </span>
                </div>
              ))
            ) : (
              <EmptyState icon={GraduationCap} title="No admissions yet" text="New student records will appear here." />
            )}
          </div>
        </Panel>
      </section>

      {/* OPERATIONS */}
      <section className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        <OperationCard
          icon={ClipboardCheck}
          title="Today's Attendance"
          description="Attendance figures will show after the attendance API is connected."
          href="/admin/attendance"
          action="Open Attendance"
          tone="rose"
        />
        <OperationCard
          icon={CreditCard}
          title="Fee Collection"
          description="Monthly collection and pending dues require fee records and a fees API."
          href="/admin/fees"
          action="Manage Fees"
          tone="amber"
        />
        <OperationCard
          icon={CalendarDays}
          title="School Calendar"
          description="Upcoming events will show when calendar records are available."
          href="/admin/communication/events"
          action="View Calendar"
          tone="indigo"
        />
      </section>

      {/* SCHOOL INFORMATION */}
      <section className="relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm ring-1 ring-rose-100 sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-rose-100/70 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-rose-50 p-2 ring-1 ring-rose-100">
            <Image src={logo} alt={`${schoolName} logo`} className="h-full w-auto object-contain" />
          </div>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-100">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              School profile
            </span>
            <h3 className="mt-2 text-xl font-black text-slate-900">{schoolName}</h3>
            <p className="mt-1.5 flex items-start gap-2 text-sm leading-5 text-slate-600">
              <MapPin className="mt-0.5 shrink-0 text-rose-500" size={15} />
              {address}
            </p>
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <InfoBox icon={UserRound} label="Principal" value={principal} />
          <InfoBox icon={Phone} label="Contact number" value={school?.phone || "Not configured"} />
          <InfoBox icon={GraduationCap} label="Classes" value="Nursery to Class XII" />
          <InfoBox icon={Clock} label="School timing" value="9:00 AM – 12:35 PM" />
          <InfoBox icon={BadgeCheck} label="School board" value="ASSEB (Received Prior Permission)" />
          <InfoBox icon={Building2} label="Affiliated to" value="Markazul Ma’arif, Hojai" />
        </div>

        <div className="relative mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500">
            {lastUpdated
              ? `Last refreshed: ${lastUpdated.toLocaleTimeString("en-IN")}`
              : "Dashboard data has not been refreshed yet."}
          </p>
          <Link
            href="/admin/students/id-cards"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-rose-600"
          >
            <FileText size={16} />
            Student ID Cards
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ---------- Small components (kept in this file, no extra imports needed) ---------- */

const TONES = {
  rose: "bg-rose-50 text-rose-600",
  pink: "bg-pink-50 text-pink-600",
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  sky: "bg-sky-50 text-sky-600",
};

function SectionTitle({ title, sub, right }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3 sm:mb-4">
      <div>
        <h2 className="text-lg font-black text-slate-900 sm:text-xl">{title}</h2>
        <p className="mt-0.5 text-sm text-slate-500">{sub}</p>
      </div>
      {right && <span className="text-xs font-medium text-slate-400">{right}</span>}
    </div>
  );
}

function ModuleCard({ module: m }) {
  const [showAll, setShowAll] = useState(false);
  const Icon = m.icon;
  const LIMIT = 5;
  const visible = showAll ? m.links : m.links.slice(0, LIMIT);
  const extra = m.links.length - LIMIT;

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-200/40 hover:ring-rose-200">
      <div className="flex items-center gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${TONES[m.tone] || TONES.rose}`}>
          <Icon size={21} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-black text-slate-900">{m.title}</h3>
          <p className="text-xs text-slate-500">{m.links.length} quick links</p>
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        {visible.map(([label, href]) => (
          <Link
            key={`${label}-${href}`}
            href={href}
            className="group flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-transparent transition hover:bg-rose-50 hover:text-rose-700 hover:ring-rose-200"
          >
            <span className="truncate">{label}</span>
            <ChevronRight size={15} className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-rose-500" />
          </Link>
        ))}
      </div>

      {extra > 0 && (
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className="mt-3 inline-flex items-center gap-1 text-sm font-extrabold text-rose-600 hover:text-rose-700"
        >
          {showAll ? "Show less" : `+${extra} more`}
          <ChevronDown size={16} className={`transition-transform ${showAll ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
}
function StatTile({ title, value, icon: Icon, tone = "rose" }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-200/40 hover:ring-rose-200 sm:rounded-3xl sm:p-5">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl transition duration-300 group-hover:rotate-6 sm:h-11 sm:w-11 sm:rounded-2xl ${TONES[tone] || TONES.rose}`}>
        <Icon size={20} />
      </span>
      <p className="mt-3 text-2xl font-black tabular-nums text-slate-900 sm:text-3xl">{value}</p>
      <p className="mt-0.5 text-xs font-semibold text-slate-500 sm:text-sm">{title}</p>
    </div>
  );
}

function ActionTile({ title, href, icon: Icon }) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-2.5 rounded-2xl bg-white p-3.5 text-center shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:bg-gradient-to-br hover:from-rose-600 hover:to-pink-600 hover:shadow-xl hover:shadow-rose-300/40 hover:ring-transparent sm:p-4"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition duration-300 group-hover:bg-white/20 group-hover:text-white">
        <Icon size={21} />
      </span>
      <span className="text-xs font-extrabold leading-tight text-slate-800 transition group-hover:text-white sm:text-sm">{title}</span>
    </Link>
  );
}

function Panel({ title, sub, icon: Icon, action, className = "", children }) {
  return (
    <div className={`rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900 sm:text-lg">{title}</h3>
          <p className="mt-0.5 text-sm text-slate-500">{sub}</p>
        </div>
        {action ? (
          <Link href={action.href} className="text-sm font-bold text-rose-600 hover:text-rose-700">
            {action.label}
          </Link>
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <Icon size={21} />
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Legend({ color, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        {label}
      </div>
      <p className="mt-0.5 text-xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="py-9 text-center">
      <Icon size={30} className="mx-auto text-rose-300" />
      <p className="mt-3 font-bold text-slate-700">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function OperationCard({ icon: Icon, title, description, href, action, tone }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-200/40 hover:ring-rose-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-slate-900">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${TONES[tone] || TONES.rose}`}>
          <Icon size={20} />
        </span>
      </div>
      <Link href={href} className="mt-4 inline-flex items-center gap-1 text-sm font-extrabold text-rose-600 hover:text-rose-700">
        {action} <ChevronRight size={16} />
      </Link>
    </div>
  );
}

function InfoBox({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm ring-1 ring-rose-100">
        <Icon size={17} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="mt-0.5 break-words text-sm font-extrabold text-slate-900">{value}</p>
      </div>
    </div>
  );
}