
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserPlus,
  CalendarDays,
  Wallet,
  Clock3,
  ArrowUpRight,
  ArrowRight,
  Search,
  Bell,
  Download,
  BriefcaseBusiness,
  GraduationCap,
  ClipboardCheck,
  CalendarOff,
  TrendingUp,
  MoreHorizontal,
  CheckCircle2,
  CircleAlert,
  Menu,
} from "lucide-react";

const stats = [
  {
    title: "Total Employees",
    value: "—",
    note: "Teaching & non-teaching",
    icon: Users,
    color: "bg-blue-50 text-blue-700",
  },
  {
    title: "Present Today",
    value: "—",
    note: "Today's attendance",
    icon: UserCheck,
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Leave Requests",
    value: "—",
    note: "Awaiting approval",
    icon: CalendarOff,
    color: "bg-amber-50 text-amber-700",
  },
  {
    title: "Payroll",
    value: "—",
    note: "Current month",
    icon: Wallet,
    color: "bg-violet-50 text-violet-700",
  },
];

const modules = [
  {
    title: "Staff Management",
    description: "Staff profiles, departments and documents",
    icon: Users,
    color: "bg-blue-50 text-blue-700",
    href: "/admin/staff",
  },
  {
    title: "Attendance",
    description: "Daily attendance and attendance reports",
    icon: ClipboardCheck,
    color: "bg-emerald-50 text-emerald-700",
    href: "/admin/staff/attendance",
  },
  {
    title: "Leave Management",
    description: "Leave applications and approvals",
    icon: CalendarOff,
    color: "bg-amber-50 text-amber-700",
    href: "/admin/hr/leaves",
  },
  {
    title: "Payroll & Salary",
    description: "Salary records, deductions and payslips",
    icon: Wallet,
    color: "bg-violet-50 text-violet-700",
    href: "/admin/payroll",
  },
  {
    title: "Recruitment",
    description: "Job openings and candidate applications",
    icon: BriefcaseBusiness,
    color: "bg-pink-50 text-pink-700",
    href: "/admin/hr/recruitment",
  },
  {
    title: "Departments",
    description: "Manage departments and designations",
    icon: GraduationCap,
    color: "bg-cyan-50 text-cyan-700",
    href: "/admin/teachers/departments",
  },
];

const activities = [
  {
    title: "Staff Management",
    description: "View employee records and profile details",
    icon: Users,
  },
  {
    title: "Attendance Records",
    description: "Review attendance and punctuality",
    icon: Clock3,
  },
  {
    title: "Leave Applications",
    description: "Review pending leave requests",
    icon: CalendarDays,
  },
];

export default function HRDashboardPage() {
  const [search, setSearch] = useState("");

  const filteredModules = modules.filter((module) =>
    `${module.title} ${module.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center bg-[#0b302a] text-white">
              <Users size={23} />
            </div>

            <div>
              <h1 className="text-lg font-extrabold tracking-tight">
                Human Resources
              </h1>
              <p className="text-xs text-slate-500">
                School-1 ERP · HR Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="hidden text-sm font-semibold text-slate-600 hover:text-[#0b302a] sm:inline-flex"
            >
              Admin Dashboard
            </Link>

            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center border border-slate-200 bg-white hover:bg-slate-50"
            >
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 bg-rose-500" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
        {/* Welcome */}
        <section className="relative overflow-hidden bg-gradient-to-r from-[#071c19] via-[#0b302a] to-[#155342] p-6 text-white sm:p-9">
          <div className="pointer-events-none absolute -right-10 -top-24 h-72 w-72 rounded-full border-[35px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-32 right-48 h-64 w-64 rounded-full border-[30px] border-white/5" />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                <TrendingUp size={15} />
                HUMAN RESOURCES OVERVIEW
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                HR Dashboard
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
                Manage school employees, monitor attendance, review leave
                requests and organise payroll from one place.
              </p>
            </div>

            <Link
              href="/admin/hr/staff"
              className="inline-flex items-center justify-center gap-2 self-start bg-[#c8ae6a] px-5 py-3 text-sm font-bold text-[#071c19] transition hover:bg-[#dfc98e] lg:self-center"
            >
              <UserPlus size={18} />
              Manage Staff
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </section>

        {/* Statistics */}
        <section className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                key={stat.title}
                className="border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </p>
                    <p className="mt-3 text-3xl font-extrabold tracking-tight">
                      {stat.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center ${stat.color}`}
                  >
                    <Icon size={23} />
                  </div>
                </div>

                <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                  {stat.note}
                </p>
              </article>
            );
          })}
        </section>

        {/* Quick Actions */}
        <section className="mt-9">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold">HR Modules</h2>
              <p className="mt-1 text-sm text-slate-500">
                Choose a module to manage your school workforce.
              </p>
            </div>

            <label className="flex items-center gap-2 border border-slate-200 bg-white px-3 py-2.5">
              <Search size={17} className="text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search HR modules..."
                className="w-full bg-transparent text-sm outline-none sm:w-56"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredModules.map((module) => {
              const Icon = module.icon;

              return (
                <Link
                  key={module.title}
                  href={module.href}
                  className="group flex min-h-40 flex-col justify-between border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#9bb9ad] hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center ${module.color}`}
                    >
                      <Icon size={23} />
                    </div>

                    <ArrowUpRight
                      size={19}
                      className="text-slate-400 transition group-hover:text-[#0b302a]"
                    />
                  </div>

                  <div className="mt-5">
                    <h3 className="font-bold">{module.title}</h3>
                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      {module.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {filteredModules.length === 0 && (
            <div className="border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              No HR modules match your search.
            </div>
          )}
        </section>

        {/* Bottom section */}
        <section className="mt-9 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="border border-slate-200 bg-white p-5 sm:p-6 xl:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold">HR Quick Access</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Frequently used HR operations
                </p>
              </div>

              <MoreHorizontal size={22} className="text-slate-400" />
            </div>

            <div className="mt-5 divide-y divide-slate-100">
              {activities.map((activity) => {
                const Icon = activity.icon;

                return (
                  <div
                    key={activity.title}
                    className="flex items-center gap-4 py-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-slate-100 text-slate-700">
                      <Icon size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold">{activity.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {activity.description}
                      </p>
                    </div>

                    <ArrowRight
                      size={17}
                      className="shrink-0 text-slate-400"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-extrabold">HR Checklist</h2>
            <p className="mt-1 text-sm text-slate-500">
              Important tasks to review
            </p>

            <div className="mt-5 space-y-4">
              <div className="flex gap-3">
                <CheckCircle2
                  size={20}
                  className="shrink-0 text-emerald-600"
                />
                <div>
                  <p className="text-sm font-semibold">Staff records</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Keep employee information updated.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CircleAlert
                  size={20}
                  className="shrink-0 text-amber-600"
                />
                <div>
                  <p className="text-sm font-semibold">Leave approvals</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Review pending applications regularly.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CalendarDays
                  size={20}
                  className="shrink-0 text-blue-600"
                />
                <div>
                  <p className="text-sm font-semibold">Monthly payroll</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Verify attendance and salary records.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <p className="text-xs leading-5 text-slate-500">
                Dashboard figures will appear when the existing HR APIs are
                connected.
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-8 flex flex-col gap-2 border-t border-slate-200 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>School-1 ERP · Human Resources</p>
          <p>HR Dashboard</p>
        </footer>
      </div>
    </main>
  );
}
