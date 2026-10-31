
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  RefreshCw,
  FileText,
  CalendarDays,
  Printer,
  GraduationCap,
  ClipboardCheck,
  AlertCircle,
} from "lucide-react";
import { examRequest } from "@/lib/examApi";

export default function AdmitCardsPage() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadExams = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await examRequest("/");
      const examList = response.exams || [];

      setExams(examList);

      setSelectedExam((current) => {
        if (current && examList.some((exam) => exam._id === current)) {
          return current;
        }

        return examList[0]?._id || "";
      });
    } catch (e) {
      setError(e.message || "Exams load nahi ho sake.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  const exam = exams.find((item) => item._id === selectedExam);

  const filteredExams = exams.filter((item) => {
    const query = search.trim().toLowerCase();

    return (
      !query ||
      item.name?.toLowerCase().includes(query) ||
      item.type?.toLowerCase().includes(query) ||
      item.classId?.name?.toLowerCase().includes(query)
    );
  });

  function printExamSummary(item) {
    if (!item) return;

    const printWindow = window.open("", "_blank", "width=900,height=700");

    if (!printWindow) {
      setError("Print window block ho gayi. Browser mein pop-ups allow karein.");
      return;
    }

    const startDate = item.startDate
      ? new Date(item.startDate).toLocaleDateString("en-IN")
      : "Not specified";

    const endDate = item.endDate
      ? new Date(item.endDate).toLocaleDateString("en-IN")
      : "Not specified";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Exam Details - ${escapeHtml(item.name || "Examination")}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 35px;
              color: #1e293b;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #312e81;
              padding-bottom: 18px;
              margin-bottom: 25px;
            }
            h1 { color: #312e81; margin-bottom: 6px; }
            .subtitle { color: #64748b; }
            table { width: 100%; border-collapse: collapse; }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 12px;
              text-align: left;
            }
            th { background: #eef2ff; width: 35%; }
            .note { margin-top: 25px; color: #64748b; font-size: 12px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ADARSHA MARKAZ ACADEMY</h1>
            <div class="subtitle">Examination Details</div>
          </div>
          <table>
            <tr><th>Examination</th><td>${escapeHtml(item.name || "—")}</td></tr>
            <tr><th>Exam Type</th><td>${escapeHtml(item.type || "—")}</td></tr>
            <tr><th>Class</th><td>${escapeHtml(item.classId?.name || "—")}</td></tr>
            <tr><th>Section</th><td>${escapeHtml(item.sectionId?.name || "—")}</td></tr>
            <tr><th>Start Date</th><td>${startDate}</td></tr>
            <tr><th>End Date</th><td>${endDate}</td></tr>
            <tr><th>Status</th><td>${escapeHtml(item.status || "—")}</td></tr>
          </table>
          <p class="note">
            This is an examination details sheet, not an individual student's admit card.
            Student details and exam-wise subject schedule must be connected before official
            admit cards can be generated.
          </p>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[char]);
  }

  const upcomingCount = exams.filter(
    (item) => item.status === "Upcoming"
  ).length;

  const completedCount = exams.filter(
    (item) => item.status === "Completed"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Link
            href="/admin/exams"
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft size={16} />
            Back to Exams
          </Link>

          <h1 className="text-3xl font-black text-slate-800">
            Admit Cards
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage examinations and prepare for student admit-card generation.
          </p>
        </div>

        <button
          type="button"
          onClick={loadExams}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-3 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">Total Exams</p>
            <FileText size={22} className="text-indigo-600" />
          </div>
          <h2 className="mt-3 text-3xl font-black text-indigo-600">
            {exams.length}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">Upcoming Exams</p>
            <CalendarDays size={22} className="text-orange-500" />
          </div>
          <h2 className="mt-3 text-3xl font-black text-orange-500">
            {upcomingCount}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">Completed Exams</p>
            <ClipboardCheck size={22} className="text-green-600" />
          </div>
          <h2 className="mt-3 text-3xl font-black text-green-600">
            {completedCount}
          </h2>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Unable to load exams</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Exam selector */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-black text-slate-800">
            Select Examination
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose an examination to view its details.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Search Exams
            </label>
            <div className="flex items-center gap-2 rounded-xl border px-3">
              <Search size={18} className="shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by exam, type or class..."
                className="min-w-0 flex-1 py-3 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Examination
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full rounded-xl border bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
              disabled={loading}
            >
              <option value="">Select an exam</option>
              {filteredExams.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                  {item.classId?.name ? ` — ${item.classId.name}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-slate-500">
            Loading examinations...
          </p>
        ) : exams.length === 0 ? (
          <div className="py-10 text-center">
            <GraduationCap size={38} className="mx-auto mb-3 text-slate-300" />
            <p className="font-bold text-slate-700">No examinations found</p>
            <p className="mt-1 text-sm text-slate-500">
              Create an exam before preparing admit cards.
            </p>
            <Link
              href="/admin/exams/create"
              className="mt-4 inline-flex items-center rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700"
            >
              Create Exam
            </Link>
          </div>
        ) : !exam ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No matching examination selected.
          </p>
        ) : (
          <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                  {exam.status || "Status unavailable"}
                </span>
                <h3 className="mt-3 text-xl font-black text-slate-800">
                  {exam.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {exam.type || "General Examination"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => printExamSummary(exam)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white hover:bg-indigo-700"
              >
                <Printer size={17} />
                Print Exam Details
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border bg-white p-4">
                <p className="text-xs font-semibold text-slate-500">Class</p>
                <p className="mt-2 font-bold text-slate-800">
                  {exam.classId?.name || "—"}
                </p>
              </div>

              <div className="rounded-xl border bg-white p-4">
                <p className="text-xs font-semibold text-slate-500">Section</p>
                <p className="mt-2 font-bold text-slate-800">
                  {exam.sectionId?.name || "All / Not specified"}
                </p>
              </div>

              <div className="rounded-xl border bg-white p-4">
                <p className="text-xs font-semibold text-slate-500">Start Date</p>
                <p className="mt-2 font-bold text-slate-800">
                  {exam.startDate
                    ? new Date(exam.startDate).toLocaleDateString("en-IN")
                    : "Not set"}
                </p>
              </div>

              <div className="rounded-xl border bg-white p-4">
                <p className="text-xs font-semibold text-slate-500">End Date</p>
                <p className="mt-2 font-bold text-slate-800">
                  {exam.endDate
                    ? new Date(exam.endDate).toLocaleDateString("en-IN")
                    : "Not set"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Next integration step */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle size={21} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <h3 className="font-black text-amber-900">
              Student Admit Cards
            </h3>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              Individual admit cards ke liye selected exam ke students,
              roll numbers aur subject-wise exam schedule connect karna hoga.
              Yeh page abhi existing exam API se examination details load karta
              hai; actual student admit cards abhi generate nahi karta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
