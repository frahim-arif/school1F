
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Search,
  FileText,
  GraduationCap,
  CalendarDays,
  Download,
  Printer,
  AlertCircle,
} from "lucide-react";
import { examRequest } from "@/lib/examApi";

export default function ExamReportsPage() {
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadExams = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (status) params.set("status", status);

      const response = await examRequest(`/?${params.toString()}`);
      setExams(response.exams || []);
    } catch (e) {
      setError(e.message || "Exams load nahi ho sake.");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = setTimeout(loadExams, 250);
    return () => clearTimeout(timer);
  }, [loadExams]);

  const completed = exams.filter((e) => e.status === "Completed").length;
  const upcoming = exams.filter((e) => e.status === "Upcoming").length;
  const ongoing = exams.filter((e) => e.status === "Ongoing").length;

  function exportCSV() {
    const headers = [
      "Exam Name",
      "Exam Type",
      "Class",
      "Section",
      "Start Date",
      "End Date",
      "Status",
    ];

    const rows = exams.map((exam) => [
      exam.name || "",
      exam.type || "",
      exam.classId?.name || "",
      exam.sectionId?.name || "",
      exam.startDate
        ? new Date(exam.startDate).toLocaleDateString("en-IN")
        : "",
      exam.endDate
        ? new Date(exam.endDate).toLocaleDateString("en-IN")
        : "",
      exam.status || "",
    ]);

    const escapeCSV = (value) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "exam-report.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Link
            href="/admin/exams"
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600"
          >
            <ArrowLeft size={16} /> Back to Exams
          </Link>
          <h1 className="text-3xl font-black text-slate-800">Exam Reports</h1>
          <p className="mt-2 text-sm text-slate-500">
            View examination summaries and export exam records.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadExams}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-3 font-bold text-slate-700"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={exportCSV}
            disabled={loading || exams.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white disabled:opacity-50"
          >
            <Download size={17} /> Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-3 font-bold text-slate-700"
          >
            <Printer size={17} /> Print
          </button>
        </div>
      </div>

      {error && (
        <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Total Exams", exams.length, FileText, "text-indigo-600"],
          ["Upcoming", upcoming, CalendarDays, "text-orange-500"],
          ["Ongoing", ongoing, GraduationCap, "text-blue-600"],
          ["Completed", completed, FileText, "text-green-600"],
        ].map(([label, value, Icon, color]) => (
          <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-500">{label}</p>
              <Icon size={21} className={color} />
            </div>
            <h2 className={`mt-3 text-3xl font-black ${color}`}>{value}</h2>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b p-5 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-black text-slate-800">
              Examination Summary
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Report data is based on the currently loaded exams.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex items-center gap-2 rounded-xl border px-3">
              <Search size={17} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search exams..."
                className="min-w-0 py-3 text-sm outline-none"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border bg-white px-3 py-3 text-sm outline-none"
            >
              <option value="">All statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="p-10 text-center text-slate-500">Loading reports...</p>
        ) : exams.length === 0 ? (
          <div className="p-10 text-center">
            <FileText size={36} className="mx-auto mb-3 text-slate-300" />
            <p className="font-bold text-slate-700">No exam records found</p>
            <p className="mt-1 text-sm text-slate-500">
              Create an exam to start viewing reports.
            </p>
            <Link
              href="/admin/exams/create"
              className="mt-4 inline-flex rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white"
            >
              Create Exam
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  {["Exam Name", "Class / Section", "Start Date", "End Date", "Status"].map((x) => (
                    <th key={x} className="whitespace-nowrap px-5 py-4">{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam._id} className="border-t hover:bg-slate-50">
                    <td className="px-5 py-4 font-bold text-slate-800">
                      {exam.name}
                      <p className="mt-1 text-xs font-normal text-slate-500">
                        {exam.type || "—"}
                      </p>
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
                      }`}>
                        {exam.status || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs leading-5 text-slate-500">
        Note: This report includes exam records only. Student-wise marks,
        pass percentage, toppers and subject-wise performance require the
        existing marks/results API to be connected.
      </p>
    </div>
  );
}
