
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus, Search, RefreshCw, FileText, Clock3,
  CheckCircle2, Award, Trash2, CalendarDays,
} from "lucide-react";
import { examRequest } from "@/lib/examApi";

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (status) params.set("status", status);

      const [list, stats] = await Promise.all([
        examRequest(`/?${params.toString()}`),
        examRequest("/dashboard"),
      ]);

      setExams(list.exams || []);
      setDashboard(stats.dashboard || {});
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  async function deleteExam(id) {
    if (!window.confirm("Delete this exam, its schedules and results?")) return;

    try {
      await examRequest(`/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  const cards = [
    ["Total Exams", dashboard.totalExams || 0, FileText, "text-indigo-600"],
    ["Upcoming", dashboard.upcoming || 0, Clock3, "text-orange-500"],
    ["Completed", dashboard.completed || 0, CheckCircle2, "text-green-600"],
    ["Published Results", dashboard.publishedResults || 0, Award, "text-purple-600"],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Exams Management</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage examinations, schedules and results
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={load}
            className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 font-bold">
            <RefreshCw size={17} /> Refresh
          </button>
          <Link href="/admin/exams/create"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white">
            <Plus size={18} /> Create Exam
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(([label, value, Icon, color]) => (
          <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">{label}</p>
              <Icon size={22} className={color} />
            </div>
            <h2 className={`mt-3 text-3xl font-black ${color}`}>{value}</h2>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b p-5 md:flex-row md:items-center">
          <h2 className="text-lg font-black text-slate-800">Exam List</h2>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex items-center gap-2 rounded-xl border px-3">
              <Search size={17} className="text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search exam..." className="min-w-0 py-3 text-sm outline-none" />
            </div>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="rounded-xl border px-3 py-3 text-sm outline-none">
              <option value="">All statuses</option>
              <option>Upcoming</option>
              <option>Ongoing</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="p-8 text-center text-slate-500">Loading exams...</p>
        ) : exams.length === 0 ? (
          <div className="p-10 text-center">
            <CalendarDays className="mx-auto mb-3 text-slate-400" size={34} />
            <p className="font-bold text-slate-700">No exams found</p>
            <p className="mt-1 text-sm text-slate-500">Create your first exam to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  {["Exam Name", "Class", "Start Date", "End Date", "Status", "Actions"].map(x =>
                    <th key={x} className="whitespace-nowrap px-5 py-4">{x}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {exams.map(exam => (
                  <tr key={exam._id} className="border-t hover:bg-slate-50">
                    <td className="px-5 py-4 font-bold text-slate-800">
                      {exam.name}
                      <p className="mt-1 text-xs font-normal text-slate-500">{exam.type}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {exam.classId?.name || "—"}
                      {exam.sectionId?.name ? ` / ${exam.sectionId.name}` : ""}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                      {exam.startDate ? new Date(exam.startDate).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                      {exam.endDate ? new Date(exam.endDate).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                        exam.status === "Completed" ? "bg-green-100 text-green-700" :
                        exam.status === "Ongoing" ? "bg-blue-100 text-blue-700" :
                        exam.status === "Cancelled" ? "bg-red-100 text-red-700" :
                        "bg-orange-100 text-orange-700"
                      }`}>{exam.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => deleteExam(exam._id)}
                        className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                        title="Delete exam">
                        <Trash2 size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
