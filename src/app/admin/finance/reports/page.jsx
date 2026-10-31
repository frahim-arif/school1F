
"use client";

import { useState } from "react";
import { FileText, Download, CalendarDays } from "lucide-react";

export default function FinanceReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function exportReport() {
    const csv = [
      ["Report", "From", "To", "Status"],
      ["Finance Summary", from || "All dates", to || "All dates", "Preview only"],
    ]
      .map((row) => row.map((value) => `"${value}"`).join(","))
      .join("\r\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "finance-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="space-y-6 bg-slate-50/50 p-4 sm:p-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Finance</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Financial Reports</h1>
        <p className="mt-2 text-sm text-slate-500">Review financial data by date range.</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-50 p-3 text-violet-700">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900">Report Filters</h2>
            <p className="text-sm text-slate-500">Select the period for your report.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-bold text-slate-700">From Date</span>
            <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className="w-full rounded-xl border border-slate-200 p-3" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold text-slate-700">To Date</span>
            <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className="w-full rounded-xl border border-slate-200 p-3" />
          </label>
        </div>

        <button onClick={exportReport} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800">
          <Download size={18} /> Export Report CSV
        </button>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <div className="flex items-center gap-2 font-bold"><CalendarDays size={18} /> Backend connection pending</div>
        <p className="mt-2 leading-6">The date filters and CSV export are ready for the frontend preview. Actual income, expenses and fee totals will appear after connecting the finance APIs.</p>
      </section>
    </main>
  );
}
