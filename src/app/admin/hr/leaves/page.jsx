
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays, Search, RefreshCw, CheckCircle2, XCircle,
  Clock3, ArrowLeft, Filter, FileText
} from "lucide-react";

const initialLeaves = [];

export default function HRLeavesPage() {
  const [leaves, setLeaves] = useState(initialLeaves);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const filtered = leaves.filter((leave) => {
    const matchesSearch = `${leave.name} ${leave.department} ${leave.type}`
      .toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (status === "All" || leave.status === status);
  });

  function updateStatus(id, nextStatus) {
    setLeaves((current) =>
      current.map((leave) =>
        leave.id === id ? { ...leave, status: nextStatus } : leave
      )
    );
  }

  const counts = {
    Total: leaves.length,
    Pending: leaves.filter((x) => x.status === "Pending").length,
    Approved: leaves.filter((x) => x.status === "Approved").length,
    Rejected: leaves.filter((x) => x.status === "Rejected").length,
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-7 lg:p-9">
      <div className="mx-auto max-w-7xl">
        <Link href="/admin/hr" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-800">
          <ArrowLeft size={17} /> HR Dashboard
        </Link>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Human Resources</p>
            <h1 className="mt-2 text-3xl font-extrabold">Leave Management</h1>
            <p className="mt-2 text-sm text-slate-500">Review and manage staff leave applications.</p>
          </div>
          <div className="flex items-center gap-2 border border-slate-200 bg-white px-4 py-3 text-sm font-semibold">
            <CalendarDays size={18} className="text-emerald-700" /> Leave Applications
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            ["Total Requests", counts.Total, FileText, "bg-blue-50 text-blue-700"],
            ["Pending", counts.Pending, Clock3, "bg-amber-50 text-amber-700"],
            ["Approved", counts.Approved, CheckCircle2, "bg-emerald-50 text-emerald-700"],
            ["Rejected", counts.Rejected, XCircle, "bg-rose-50 text-rose-700"],
          ].map(([label, value, Icon, color]) => (
            <div key={label} className="border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-slate-500">{label}</span>
                <span className={`flex h-10 w-10 items-center justify-center ${color}`}><Icon size={20} /></span>
              </div>
              <p className="mt-3 text-3xl font-extrabold">{value}</p>
            </div>
          ))}
        </div>

        <section className="mt-7 border border-slate-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold">Staff Leave Requests</h2>
              <p className="mt-1 text-sm text-slate-500">Search applications and review their status.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex items-center gap-2 border border-slate-200 px-3 py-2.5">
                <Search size={17} className="text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search staff..." className="min-w-0 bg-transparent text-sm outline-none" />
              </label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none">
                {["All", "Pending", "Approved", "Rejected"].map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {["Staff Member", "Leave Type", "Dates", "Days", "Reason", "Status", "Actions"].map((x) => <th key={x} className="px-5 py-4 font-bold">{x}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-bold">{leave.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{leave.department}</p>
                    </td>
                    <td className="px-5 py-4">{leave.type}</td>
                    <td className="px-5 py-4">{leave.from} – {leave.to}</td>
                    <td className="px-5 py-4">{leave.days}</td>
                    <td className="max-w-48 px-5 py-4">{leave.reason}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold ${leave.status === "Approved" ? "bg-emerald-50 text-emerald-700" : leave.status === "Rejected" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>{leave.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      {leave.status === "Pending" ? (
                        <div className="flex gap-2">
                          <button onClick={() => updateStatus(leave.id, "Approved")} title="Approve" className="border border-emerald-200 p-2 text-emerald-700 hover:bg-emerald-50"><CheckCircle2 size={17} /></button>
                          <button onClick={() => updateStatus(leave.id, "Rejected")} title="Reject" className="border border-rose-200 p-2 text-rose-700 hover:bg-rose-50"><XCircle size={17} /></button>
                        </div>
                      ) : <span className="text-xs text-slate-400">Reviewed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="px-5 py-16 text-center">
              <CalendarDays size={35} className="mx-auto text-slate-300" />
              <h3 className="mt-3 font-bold">No leave applications to display</h3>
              <p className="mt-1 text-sm text-slate-500">Applications will appear here when connected to your leave API.</p>
            </div>
          )}
        </section>
        <p className="mt-4 text-xs text-slate-500">Approval buttons currently update this page's temporary state only. Connect the existing backend before using them for real leave decisions.</p>
      </div>
    </main>
  );
}
