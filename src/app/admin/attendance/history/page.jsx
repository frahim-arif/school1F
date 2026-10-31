"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Download,
  Printer,
  Eye,
  RefreshCw,
  Calendar,
  X,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function todayLocal() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function unwrapResponse(json) {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.records)) return json.records;
  if (Array.isArray(json?.data?.records)) return json.data.records;
  if (Array.isArray(json?.data?.students)) return json.data.students;
  if (Array.isArray(json?.students)) return json.students;
  return [];
}

function getClassName(student) {
  const value =
    student?.className?.name ||
    student?.className ||
    student?.class?.name ||
    student?.class?.className ||
    student?.class ||
    student?.student?.className?.name ||
    student?.student?.className ||
    student?.student?.class?.name ||
    student?.student?.class ||
    "Unassigned";

  return typeof value === "object"
    ? value.name || value.className || "Unassigned"
    : String(value);
}

function getSectionName(student) {
  const value =
    student?.section?.name ||
    student?.section?.sectionName ||
    student?.section ||
    student?.student?.section?.name ||
    student?.student?.section ||
    "Unassigned";

  return typeof value === "object"
    ? value.name || value.sectionName || "Unassigned"
    : String(value);
}

function getDateValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function normalizeStatus(status) {
  const value = String(status || "").toLowerCase();

  if (value === "present") return "present";
  if (value === "absent") return "absent";
  if (value === "late") return "late";
  if (value === "half day" || value === "half-day") return "halfDay";
  if (value === "leave") return "leave";

  return "unmarked";
}

function getAttendanceArray(item) {
  if (Array.isArray(item?.attendance)) return item.attendance;
  if (item?.attendance && typeof item.attendance === "object") {
    return [item.attendance];
  }
  return [];
}

function aggregateAttendance(items) {
  const groups = new Map();

  items.forEach((item, index) => {
    const attendanceEntries = getAttendanceArray(item);
    const entries = attendanceEntries.length
      ? attendanceEntries
      : item?.status
        ? [item]
        : [];

    entries.forEach((attendance) => {
      const date = getDateValue(attendance.date || item.date);
      if (!date) return;

      const student = attendance.student || item.student || item;
      const className = getClassName(student);
      const section = getSectionName(student);
      const key = `${date}|${className}|${section}`;

      if (!groups.has(key)) {
        groups.set(key, {
          id: key,
          date,
          className,
          section,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          halfDay: 0,
          leave: 0,
          unmarked: 0,
          students: [],
        });
      }

      const group = groups.get(key);
      const status = normalizeStatus(attendance.status || item.status);

      group.total += 1;
      if (status === "present") group.present += 1;
      else if (status === "absent") group.absent += 1;
      else if (status === "late") group.late += 1;
      else if (status === "halfDay") group.halfDay += 1;
      else if (status === "leave") group.leave += 1;
      else group.unmarked += 1;

      group.students.push({
        id: attendance._id || attendance.id || `${key}-${index}`,
        name:
          student.name ||
          student.fullName ||
          [student.firstName, student.lastName].filter(Boolean).join(" ") ||
          "Student",
        rollNumber: student.rollNumber || student.rollNo || "",
        status: attendance.status || item.status || "Unmarked",
        remarks: attendance.remarks || "",
      });
    });
  });

  return Array.from(groups.values()).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

export default function AttendanceHistoryPage() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayLocal);
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedSection, setSelectedSection] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appliedDate, setAppliedDate] = useState(todayLocal);
  const [viewRecord, setViewRecord] = useState(null);

  const loadRecords = useCallback(async (date) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (date) params.set("date", date);

      const response = await fetch(
        `${API_BASE}/api/attendance?${params.toString()}`,
        { cache: "no-store" }
      );

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          json.message || json._message || "Attendance records load nahi ho sake."
        );
      }

      if (json._status === false || json.success === false) {
        throw new Error(
          json._message || json.message || "Attendance records load nahi ho sake."
        );
      }

      const items = unwrapResponse(json);
      setRecords(aggregateAttendance(items));
    } catch (err) {
      setRecords([]);
      setError(
        err.message ||
          "Backend se connection nahi ho raha. Backend server check karein."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords(appliedDate);
  }, [appliedDate, loadRecords]);

  const classes = useMemo(
    () => [
      "All Classes",
      ...new Set(records.map((item) => item.className)),
    ],
    [records]
  );

  const sections = useMemo(
    () => [
      "All",
      ...new Set(
        records
          .filter(
            (item) =>
              selectedClass === "All Classes" ||
              item.className === selectedClass
          )
          .map((item) => item.section)
      ),
    ],
    [records, selectedClass]
  );

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();

    return records.filter((item) => {
      const matchSearch =
        !term ||
        item.date.includes(term) ||
        item.className.toLowerCase().includes(term) ||
        item.section.toLowerCase().includes(term);

      const matchClass =
        selectedClass === "All Classes" ||
        item.className === selectedClass;

      const matchSection =
        selectedSection === "All" ||
        item.section === selectedSection;

      return matchSearch && matchClass && matchSection;
    });
  }, [records, search, selectedClass, selectedSection]);

  function handleFilter(event) {
    event.preventDefault();
    setAppliedDate(selectedDate);
  }

  function exportCSV() {
    const headings = [
      "Date",
      "Class",
      "Section",
      "Total",
      "Present",
      "Absent",
      "Late",
      "Half Day",
      "Leave",
      "Unmarked",
    ];

    const rows = filteredRecords.map((item) => [
      item.date,
      item.className,
      item.section,
      item.total,
      item.present,
      item.absent,
      item.late,
      item.halfDay,
      item.leave,
      item.unmarked,
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [headings, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-history-${appliedDate || "all"}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function handlePrint() {
    window.print();
  }

  function resetFilters() {
    setSearch("");
    setSelectedClass("All Classes");
    setSelectedSection("All");
    setSelectedDate(todayLocal());
    setAppliedDate(todayLocal());
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between print:hidden">
        <div>
          <p className="mb-2 text-sm font-semibold text-emerald-700">
            Adarsha Markaz Academy, Laharighat
          </p>

          <h1 className="text-3xl font-black text-slate-800">
            Attendance History
          </h1>

          <p className="mt-2 text-slate-500">
            View class-wise and section-wise attendance records.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold hover:bg-slate-100"
          >
            <Printer size={18} />
            Print
          </button>

          <button
            type="button"
            onClick={exportCSV}
            disabled={!filteredRecords.length}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={18} />
            Export CSV
          </button>

          <button
            type="button"
            onClick={() => loadRecords(appliedDate)}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <form
        onSubmit={handleFilter}
        className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6 print:hidden"
      >
        <div className="mb-4 flex items-center gap-2 font-bold text-slate-800">
          <Calendar size={19} className="text-emerald-600" />
          Filter Attendance
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-3.5 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search date/class..."
              aria-label="Search attendance records"
              className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            aria-label="Attendance date"
            className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-emerald-500"
          />

          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSection("All");
            }}
            aria-label="Filter by class"
            className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-emerald-500"
          >
            {classes.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>

          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            aria-label="Filter by section"
            className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-emerald-500"
          >
            {sections.map((section) => (
              <option key={section} value={section}>
                {section === "All" ? "All Sections" : `Section ${section}`}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Apply Filter"}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-500">
            Selected date: {appliedDate || "Not selected"}
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
          >
            <X size={15} />
            Reset filters
          </button>
        </div>
      </form>

      {/* ERROR */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-bold">Attendance load error</p>
          <p className="mt-1">{error}</p>
          <p className="mt-2">
            Backend URL: {API_BASE}/api/attendance
          </p>
        </div>
      )}

      {/* SUMMARY */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Class / Section Records",
            value: filteredRecords.length,
            color: "text-slate-800",
          },
          {
            label: "Students Present",
            value: filteredRecords.reduce((sum, item) => sum + item.present, 0),
            color: "text-emerald-700",
          },
          {
            label: "Students Absent",
            value: filteredRecords.reduce((sum, item) => sum + item.absent, 0),
            color: "text-red-700",
          },
          {
            label: "Students Late",
            value: filteredRecords.reduce((sum, item) => sum + item.late, 0),
            color: "text-amber-700",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className={`mt-2 text-3xl font-black ${stat.color}`}>
              {loading ? "—" : stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* HISTORY TABLE */}
      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Attendance Records
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {appliedDate ? `Date: ${appliedDate}` : "All available dates"}
            </p>
          </div>

          <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
            {filteredRecords.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead className="bg-slate-100 text-sm text-slate-600">
              <tr>
                {[
                  "Date",
                  "Class",
                  "Section",
                  "Total",
                  "Present",
                  "Absent",
                  "Late",
                  "Other",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`px-4 py-4 ${
                      ["Total", "Present", "Absent", "Late", "Other", "Actions"].includes(
                        heading
                      )
                        ? "text-center"
                        : "text-left"
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-slate-500">
                    Loading attendance records...
                  </td>
                </tr>
              ) : filteredRecords.length ? (
                filteredRecords.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t transition hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-700">
                      {item.date}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-800">
                      {item.className}
                    </td>
                    <td className="px-4 py-4">{item.section}</td>
                    <td className="px-4 py-4 text-center font-semibold">
                      {item.total}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                        {item.present}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                        {item.absent}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                        {item.late}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-slate-600">
                      {item.halfDay + item.leave + item.unmarked}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => setViewRecord(item)}
                          title="View attendance details"
                          aria-label={`View ${item.className} section ${item.section}`}
                          className="rounded-lg bg-blue-600 p-2 text-white transition hover:bg-blue-700"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-14 text-center">
                    <Calendar className="mx-auto mb-3 text-slate-300" size={36} />
                    <p className="font-semibold text-slate-700">
                      No attendance records found.
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Date ya filters change karke dobara try karein.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER */}
      <div className="rounded-2xl border bg-white p-5 text-sm text-slate-500">
        Showing {filteredRecords.length} class/section attendance records.
      </div>

      {/* VIEW DETAILS MODAL */}
      {viewRecord && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setViewRecord(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="attendance-details-title"
            className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b p-5">
              <div>
                <h2
                  id="attendance-details-title"
                  className="text-xl font-black text-slate-800"
                >
                  Attendance Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {viewRecord.className} · Section {viewRecord.section} ·{" "}
                  {viewRecord.date}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewRecord(null)}
                aria-label="Close details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
              {[
                ["Total", viewRecord.total],
                ["Present", viewRecord.present],
                ["Absent", viewRecord.absent],
                ["Late", viewRecord.late],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-1 text-2xl font-black text-slate-800">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="max-h-[45vh] overflow-y-auto px-5 pb-5">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-100">
                  <tr>
                    <th className="p-3">Student</th>
                    <th className="p-3">Roll No.</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {viewRecord.students.map((student) => (
                    <tr key={student.id} className="border-t">
                      <td className="p-3 font-medium">{student.name}</td>
                      <td className="p-3">{student.rollNumber || "—"}</td>
                      <td className="p-3">{student.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}