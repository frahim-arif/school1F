
"use client";

import Link from "next/link";
import {
  HiOutlineCurrencyDollar,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineChartBar,
  HiOutlineArrowRight,
} from "react-icons/hi2";

const payrollMenu = [
  {
    title: "Salary Structure",
    description: "Staff ki basic salary, allowances aur deductions manage karein.",
    href: "/admin/payroll/structure",
    icon: HiOutlineCurrencyDollar,
  },
  {
    title: "Generate Salary",
    description: "Selected month ke liye staff ki salary generate karein.",
    href: "/admin/payroll/generate",
    icon: HiOutlineDocumentText,
  },
  {
    title: "Salary Payments",
    description: "Paid aur pending salary payments manage karein.",
    href: "/admin/payroll/payments",
    icon: HiOutlineCheckCircle,
  },
  {
    title: "Salary Slips",
    description: "Staff ki monthly salary slips dekhein.",
    href: "/admin/payroll/slips",
    icon: HiOutlineDocumentText,
  },
  {
    title: "Deductions & Allowances",
    description: "Salary deductions aur additional allowances dekhein.",
    href: "/admin/payroll/deductions",
    icon: HiOutlineUsers,
  },
  {
    title: "Payroll Reports",
    description: "Monthly aur yearly payroll reports dekhein.",
    href: "/admin/payroll/reports",
    icon: HiOutlineChartBar,
  },
  {
    title: "Payroll Settings",
    description: "Payroll ke default settings configure karein.",
    href: "/admin/payroll/settings",
    icon: HiOutlineClock,
  },
];

export default function PayrollDashboardPage() {
  return (
    <main className="min-h-screen bg-[#f8faf9] p-4 text-slate-800 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#073b32] via-[#0b5143] to-[#126653] p-6 text-white shadow-lg md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="mb-2 text-sm font-medium text-emerald-200">
                SCHOOL MANAGEMENT SYSTEM
              </p>
              <h1 className="text-2xl font-bold md:text-3xl">
                Payroll Dashboard
              </h1>
              <p className="mt-2 max-w-xl text-sm text-emerald-50">
                Manage staff salaries, salary structures, payments and payroll
                reports from one place.
              </p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/20 bg-white/10">
              <HiOutlineCurrencyDollar className="h-9 w-9" />
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Salary Structure",
              subtitle: "Manage staff salaries",
              icon: HiOutlineUsers,
              href: "/admin/payroll/structure",
            },
            {
              title: "Generate Salary",
              subtitle: "Create monthly payroll",
              icon: HiOutlineCurrencyDollar,
              href: "/admin/payroll/generate",
            },
            {
              title: "Salary Payments",
              subtitle: "Track paid and pending",
              icon: HiOutlineCheckCircle,
              href: "/admin/payroll/payments",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.subtitle}
                  </p>
                </div>
                <HiOutlineArrowRight className="ml-auto h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-700" />
              </Link>
            );
          })}
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold">Payroll Management</h2>
          <p className="mt-1 text-sm text-slate-500">
            Select a module to continue.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {payrollMenu.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#e8f4ef] text-[#126653]">
                    <Icon className="h-6 w-6" />
                  </div>

                  <HiOutlineArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-700" />
                </div>

                <h3 className="font-semibold text-slate-800">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
