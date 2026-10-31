
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, FileBarChart, Users, CalendarCheck, CalendarDays,
  Download, TrendingUp, Clock3, Wallet
} from "lucide-react";

export default function HRReportsPage() {
  const [period, setPeriod] = useState("This Month");
  const [category, setCategory] = useState("All Reports");

  const reports = [
    { title: "Staff Directory", description: "Employee profiles, departments and designations", category: "Staff", icon: Users },
    { title: "Attendance Report", description: "Daily attendance, absences and punctuality", category: "Attendance", icon: CalendarCheck },
    { title: "Leave Report", description: "Leave applications, approvals and leave balances", category: "Leave", icon: CalendarDays },
    { title: "Payroll Summary", description: "Monthly salary, allowances and deductions", category: "Payroll", icon: Wallet },
    { title: "Attendance Trends", description: "Attendance patterns across the selected period", category: "Attendance", icon: TrendingUp },
    { title: "Staff Working Hours", description: "Check-in and check-out summary", category: "Attendance", icon: Clock3 },
  ];

  const filtered = reports.filter((r) => category === "All Reports" || r.category === category);

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-7 lg:p-9">
      <div className="mx-auto max-w-7xl">
        <Link href="/admin/hr" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-800">
          <ArrowLeft size={17} /> HR Dashboard
        </Link>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Human Resources</p>
            <h1 className="mt-2 text-3xl font-extrabold">HR Reports</h1>
            <p className="mt-2 text-sm text-slate-500">Review staff, attendance, leave and payroll reports.</p>
          </div>
          <div className="flex items-center gap-2 border border-slate-200 bg-white px-4 py-3 text-sm font-semibold">
            <FileBarChart size={18} className="text-emerald-700" /> Reporting Centre
          </div>
        </div>

        <section className="mt-7 border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="font-bold">Report Filters</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-600">
              Reporting Period
              <select value={period} onChange={(e) => setPeriod(e.target.value)} className="mt-2 block w-full border border-slate-200 bg-white px-3 py-3 font-normal text-slate-800 outline-none focus:border-emerald-700">
                {["This Month", "Last Month", "This Quarter", "This Academic Year"].map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-600">
              Report Category
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2 block w-full border border-slate-200 bg-white px-3 py-3 font-normal text-slate-800 outline-none focus:border-emerald-700">
                {["All Reports", "Staff", "Attendance", "Leave", "Payroll"].map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>
          </div>
          <p className="mt-4 text-xs text-slate-500">Selected period: {period}. Reports need to be connected to your existing backend to display real data and generate downloads.</p>
        </section>

        <div className="mt-7 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold">Available Reports</h2>
            <p className="mt-1 text-sm text-slate-500">Choose a report to review.</p>
          </div>
          <span className="text-sm text-slate-500">{filtered.length} reports</span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((report) => {
            const Icon = report.icon;
            return (
              <article key={report.title} className="flex flex-col border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm">
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center bg-emerald-50 text-emerald-800"><Icon size={23} /></span>
                  <span className="bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{report.category}</span>
                </div>
                <h3 className="mt-5 font-bold">{report.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{report.description}</p>
                <button type="button" disabled title="Connect report API to enable downloads" className="mt-5 inline-flex cursor-not-allowed items-center justify-center gap-2 border border-slate-200 px-4 py-3 text-sm font-bold text-slate-400">
                  <Download size={17} /> Export Report
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
