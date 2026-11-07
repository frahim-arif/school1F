
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/+$/, "");

const API_ROOT = API_BASE.endsWith("/api")
  ? API_BASE
  : `${API_BASE}/api`;

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

const STATUS_COLORS = {
  Present: "bg-emerald-100 text-emerald-700",
  Absent: "bg-red-100 text-red-700",
  Late: "bg-amber-100 text-amber-700",
  "Half Day": "bg-blue-100 text-blue-700",
  Leave: "bg-purple-100 text-purple-700",
};

function getStudentName(student) {
  return [student?.firstName, student?.lastName]
    .filter(Boolean)
    .join(" ") || "Unknown Student";
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function StatCard({ title, value, color, subtitle }) {
  return (
    <div className="bg-white border border-slate-200 p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className={`mt-2 text-3xl font-bold ${color}`}>
        {value}
      </h3>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}

export default function StudentReportsPage() {
  const today = new Date();

  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [month, setMonth] = useState(String(today.getMonth() + 1));
  const [year, setYear] = useState(String(today.getFullYear()));

  const [report, setReport] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const getHeaders = () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("adminToken") ||
          localStorage.getItem("token")
        : null;

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const loadStudents = useCallback(async () => {
    try {
      setLoadingStudents(true);
      setError("");

      const response = await fetch(`${API_ROOT}/students`, {
        headers: getHeaders(),
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load students.");
      }

      const list = Array.isArray(data)
        ? data
        : data.students || data.data || [];

      setStudents(list);

      if (list.length > 0) {
        setStudentId((current) =>
          current && list.some((s) => s._id === current)
            ? current
            : list[0]._id
        );
      } else {
        setStudentId("");
      }
    } catch (err) {
      setError(err.message || "Unable to load students.");
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  const loadReport = useCallback(async () => {
    if (!studentId) {
      setReport(null);
      return;
    }

    try {
      setLoadingReport(true);
      setError("");

      const url =
        `${API_ROOT}/attendance/student/${studentId}` +
        `?month=${month}&year=${year}`;

      const response = await fetch(url, {
        headers: getHeaders(),
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to load attendance report.");
      }

      setReport(data);
    } catch (err) {
      setReport(null);
      setError(err.message || "Unable to load report.");
    } finally {
      setLoadingReport(false);
    }
  }, [studentId, month, year]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    if (studentId) loadReport();
    else setReport(null);
  }, [studentId, month, year, loadReport]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return students;

    return students.filter((student) => {
      const name = getStudentName(student).toLowerCase();
      const admission = String(student.admissionNo || "").toLowerCase();
      const className = String(student.className || "").toLowerCase();

      return (
        name.includes(query) ||
        admission.includes(query) ||
        className.includes(query)
      );
    });
  }, [students, search]);

  const selectedStudent = students.find(
    (student) => student._id === studentId
  );

  const summary = report?.summary || {};
  const records = report?.records || [];

  const present = Number(summary.Present || 0);
  const absent = Number(summary.Absent || 0);
  const late = Number(summary.Late || 0);
  const halfDay = Number(summary["Half Day"] || 0);
  const leave = Number(summary.Leave || 0);

  const totalRecords =
    Number(report?.totalRecords ?? records.length);

  const percentage = Number(report?.attendancePercentage || 0);

  const attendanceDays = present + absent + late + halfDay;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
              Student Management
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-800">
              Student Reports
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              View and print monthly student attendance reports.
            </p>
          </div>

          <button
            onClick={handlePrint}
            disabled={!report || loadingReport}
            className="rounded-sm bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 print:hidden"
          >
            Print Report
          </button>
        </div>

        {/* Filters */}
        <div className="border border-slate-200 bg-white p-5 shadow-sm print:hidden">
          <h2 className="mb-4 text-base font-bold text-slate-800">
            Report Filters
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                Search Student
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name / Admission No."
                className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                Select Student
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                disabled={loadingStudents}
                className="w-full rounded-sm border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
              >
                <option value="">
                  {loadingStudents ? "Loading students..." : "Select Student"}
                </option>

                {filteredStudents.map((student) => (
                  <option key={student._id} value={student._id}>
                    {getStudentName(student)} - {student.admissionNo || "No Admission No."}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full rounded-sm border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
              >
                {MONTHS.map((name, index) => (
                  <option key={name} value={String(index + 1)}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full rounded-sm border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
              >
                {Array.from({ length: 8 }, (_, i) => today.getFullYear() - 5 + i)
                  .map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {(loadingStudents || loadingReport) && (
          <div className="border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            Loading report...
          </div>
        )}

        {!loadingStudents && students.length === 0 && (
          <div className="border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-800">
            No students found. Please add students first.
          </div>
        )}

        {!loadingStudents && students.length > 0 && !studentId && (
          <div className="border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-800">
            Select a student to view the attendance report.
          </div>
        )}

        {/* Report */}
        {!loadingReport && report && selectedStudent && (
          <div id="student-attendance-report" className="space-y-6">

            {/* Student details */}
            <div className="border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Attendance Report
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-800">
                    {getStudentName(selectedStudent)}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Admission No: {selectedStudent.admissionNo || "-"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-slate-400">Class</p>
                    <p className="font-semibold text-slate-800">
                      {selectedStudent.className || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Section</p>
                    <p className="font-semibold text-slate-800">
                      {selectedStudent.section || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Session</p>
                    <p className="font-semibold text-slate-800">
                      {selectedStudent.session || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-sm font-semibold text-slate-700">
                  Report Period: {MONTHS[Number(month) - 1]} {year}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Attendance Percentage"
                value={`${percentage.toFixed(1)}%`}
                color="text-emerald-700"
                subtitle="Present + Late + Half Day (weighted)"
              />
              <StatCard
                title="Present"
                value={present}
                color="text-emerald-700"
              />
              <StatCard
                title="Absent"
                value={absent}
                color="text-red-600"
              />
              <StatCard
                title="Late"
                value={late}
                color="text-amber-600"
              />
              <StatCard
                title="Half Day"
                value={halfDay}
                color="text-blue-600"
              />
              <StatCard
                title="Leave"
                value={leave}
                color="text-purple-600"
              />
            </div>

            {/* Summary */}
            <div className="border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-bold text-slate-800">
                  Attendance Summary
                </h3>
                <span className="text-sm text-slate-500">
                  Total Records: <strong className="text-slate-800">{totalRecords}</strong>
                </span>
              </div>

              <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                {attendanceDays > 0 && (
                  <div className="flex h-full w-full">
                    <div
                      className="bg-emerald-500"
                      style={{ width: `${(present / attendanceDays) * 100}%` }}
                    />
                    <div
                      className="bg-red-500"
                      style={{ width: `${(absent / attendanceDays) * 100}%` }}
                    />
                    <div
                      className="bg-amber-500"
                      style={{ width: `${(late / attendanceDays) * 100}%` }}
                    />
                    <div
                      className="bg-blue-500"
                      style={{ width: `${(halfDay / attendanceDays) * 100}%` }}
                    />
                  </div>
                )}
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Leave records are shown separately and are excluded from the attendance percentage.
              </p>
            </div>

            {/* Records table */}
            <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 p-5">
                <h3 className="font-bold text-slate-800">
                  Daily Attendance Records
                </h3>
                <span className="text-xs text-slate-500">
                  {records.length} record(s)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">#</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Day</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Remarks</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {records.length > 0 ? (
                      records.map((record, index) => {
                        const date = new Date(record.date);
                        const day = Number.isNaN(date.getTime())
                          ? "-"
                          : date.toLocaleDateString("en-IN", {
                              weekday: "long",
                              timeZone: "UTC",
                            });

                        return (
                          <tr key={record._id || `${record.date}-${index}`}>
                            <td className="px-5 py-3 text-slate-500">
                              {index + 1}
                            </td>
                            <td className="px-5 py-3 font-medium text-slate-800">
                              {formatDate(record.date)}
                            </td>
                            <td className="px-5 py-3 text-slate-600">
                              {day}
                            </td>
                            <td className="px-5 py-3">
                              <span className={`inline-block rounded-sm px-2.5 py-1 text-xs font-semibold ${
                                STATUS_COLORS[record.status] ||
                                "bg-slate-100 text-slate-600"
                              }`}>
                                {record.status || "-"}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-slate-500">
                              {record.remarks || "-"}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-5 py-12 text-center text-slate-400"
                        >
                          No attendance records found for this month.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="hidden print:block pt-10">
              <div className="flex justify-between gap-10 text-sm text-slate-700">
                <div className="border-t border-slate-400 pt-2">
                  Class Teacher Signature
                </div>
                <div className="border-t border-slate-400 pt-2">
                  Principal Signature
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          body * {
            visibility: hidden;
          }

          #student-attendance-report,
          #student-attendance-report * {
            visibility: visible;
          }

          #student-attendance-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          @page {
            size: A4;
            margin: 12mm;
          }
        }
      `}</style>
    </div>
  );
}
