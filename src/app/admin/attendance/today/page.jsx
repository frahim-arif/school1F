"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock3,
  Plane,
  Search,
  Calendar,
  Printer,
  Download,
  RefreshCw,
  Eye,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/+$/, "");

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function unwrap(json) {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.records)) return json.records;
  if (Array.isArray(json?.data?.records)) return json.data.records;
  if (Array.isArray(json?.students)) return json.students;
  if (Array.isArray(json?.data?.students)) return json.data.students;
  return [];
}

function getName(student) {
  return (
    student?.name ||
    student?.fullName ||
    [student?.firstName, student?.lastName].filter(Boolean).join(" ") ||
    "Unknown Student"
  );
}

function getClass(student) {
  const value =
    student?.className?.name ||
    student?.className ||
    student?.class?.name ||
    student?.class?.className ||
    student?.class ||
    "Unassigned";

  return typeof value === "object"
    ? value.name || value.className || "Unassigned"
    : String(value);
}

function getSection(student) {
  const value =
    student?.section?.name ||
    student?.section?.sectionName ||
    student?.section ||
    "Unassigned";

  return typeof value === "object"
    ? value.name || value.sectionName || "Unassigned"
    : String(value);
}

function getDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatTime(value) {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function normalizeStatus(value) {
  const status = String(value || "").trim().toLowerCase();
  if (status === "present") return "Present";
  if (status === "absent") return "Absent";
  if (status === "late") return "Late";
  if (status === "leave" || status === "on leave") return "Leave";
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unmarked";
}

function getStatusClass(status) {
  switch (status) {
    case "Present":
      return "bg-emerald-100 text-emerald-700";
    case "Absent":
      return "bg-red-100 text-red-700";
    case "Late":
      return "bg-amber-100 text-amber-700";
    case "Leave":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getStudentRows(items, selectedDate) {
  const rows = [];

  items.forEach((record, index) => {
    const attendanceEntries = Array.isArray(record.attendance)
      ? record.attendance
      : record.attendance && typeof record.attendance === "object"
        ? [record.attendance]
        : [];

    const entries = attendanceEntries.length
      ? attendanceEntries
      : record.status
        ? [record]
        : [];

    entries.forEach((entry, entryIndex) => {
      const date = getDate(entry.date || record.date);
      if (date !== selectedDate) return;

      const student = entry.student || record.student || record;
      const rawStatus = normalizeStatus(entry.status || record.status);
      const checkIn =
        entry.checkIn ||
        entry.checkInTime ||
        entry.markedAt ||
        entry.createdAt ||
        record.checkIn ||
        record.markedAt;

      rows.push({
        id:
          entry._id ||
          entry.id ||
          record._id ||
          record.id ||
          `${selectedDate}-${index}-${entryIndex}`,
        roll:
          student.rollNumber ??
          student.rollNo ??
          student.roll ??
          "—",
        admissionNo:
          student.admissionNumber ||
          student.admissionNo ||
          student.admissionId ||
          "—",
        name: getName(student),
        className: getClass(student),
        section: getSection(student),
        status: rawStatus,
        time:
          rawStatus === "Absent" || rawStatus === "Leave"
            ? "--"
            : formatTime(checkIn),
        remarks: entry.remarks || record.remarks || "",
      });
    });
  });

  return rows;
}

function SummaryCard({ title, value, color, icon }) {
  const styles = {
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
  };

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <div className={`rounded-xl p-3 ${styles[color]}`}>{icon}</div>
      </div>
      <p className="mt-4 text-3xl font-black text-slate-800">{value}</p>
    </div>
  );
}

export default function TodayAttendancePage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedSection, setSelectedSection] = useState("All");
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewStudent, setViewStudent] = useState(null);

  const loadAttendance = useCallback(async (date) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ date });
      const response = await fetch(
        `${API_BASE}/api/attendance?${params.toString()}`,
        { cache: "no-store" }
      );

      const json = await response.json().catch(() => ({}));

      if (!response.ok || json?._status === false || json?.success === false) {
        throw new Error(
          json?._message ||
            json?.message ||
            `Attendance load failed (${response.status})`
        );
      }

      setStudents(getStudentRows(unwrap(json), date));
    } catch (err) {
      setStudents([]);
      setError(
        err.message ||
          "Attendance load nahi hui. Backend aur API response check karein."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAttendance(selectedDate);
  }, [selectedDate, loadAttendance]);

  const classes = useMemo(
    () => [
      "All Classes",
      ...new Set(students.map((student) => student.className)),
    ],
    [students]
  );

  const sections = useMemo(
    () => [
      "All",
      ...new Set(
        students
          .filter(
            (student) =>
              selectedClass === "All Classes" ||
              student.className === selectedClass
          )
          .map((student) => student.section)
      ),
    ],
    [students, selectedClass]
  );

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !query ||
        student.name.toLowerCase().includes(query) ||
        String(student.admissionNo).toLowerCase().includes(query) ||
        String(student.roll).toLowerCase().includes(query);

      const matchesClass =
        selectedClass === "All Classes" ||
        student.className === selectedClass;

      const matchesSection =
        selectedSection === "All" ||
        student.section === selectedSection;

      return matchesSearch && matchesClass && matchesSection;
    });
  }, [students, search, selectedClass, selectedSection]);

  const present = filteredStudents.filter((s) => s.status === "Present").length;
  const absent = filteredStudents.filter((s) => s.status === "Absent").length;
  const late = filteredStudents.filter((s) => s.status === "Late").length;
  const leave = filteredStudents.filter((s) => s.status === "Leave").length;

  function exportCSV() {
    const headers = [
      "Roll",
      "Admission Number",
      "Student Name",
      "Class",
      "Section",
      "Status",
      "Time",
      "Remarks",
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const content = [
      headers,
      ...filteredStudents.map((s) => [
        s.roll,
        s.admissionNo,
        s.name,
        s.className,
        s.section,
        s.status,
        s.time,
        s.remarks,
      ]),
    ]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + content], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-${selectedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function resetFilters() {
    setSearch("");
    setSelectedClass("All Classes");
    setSelectedSection("All");
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
            Today&apos;s Attendance
          </h1>
          <p className="mt-2 text-slate-500">
            View attendance records for the selected date.
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            {selectedDate}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold hover:bg-slate-100"
          >
            <Printer size={18} />
            Print
          </button>
          <button
            type="button"
            onClick={exportCSV}
            disabled={!filteredStudents.length}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold hover:bg-slate-100 disabled:opacity-50"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => loadAttendance(selectedDate)}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Present"
          value={loading ? "—" : present}
          color="emerald"
          icon={<CheckCircle2 size={22} />}
        />
        <SummaryCard
          title="Absent"
          value={loading ? "—" : absent}
          color="red"
          icon={<XCircle size={22} />}
        />
        <SummaryCard
          title="Late"
          value={loading ? "—" : late}
          color="amber"
          icon={<Clock3 size={22} />}
        />
        <SummaryCard
          title="Leave"
          value={loading ? "—" : leave}
          color="blue"
          icon={<Plane size={22} />}
        />
      </div>

      {/* FILTERS */}
      <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6 print:hidden">
        <div className="mb-4 flex items-center gap-2 font-bold text-slate-800">
          <Search size={19} className="text-emerald-600" />
          Search & Filter
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-3.5 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student/admission..."
              className="w-full rounded-xl border py-3 pl-10 pr-4 outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSection("All");
            }}
            className="rounded-xl border p-3"
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
            className="rounded-xl border p-3"
          >
            {sections.map((section) => (
              <option key={section} value={section}>
                {section === "All" ? "All Sections" : `Section ${section}`}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full rounded-xl border p-3"
            aria-label="Select attendance date"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            {filteredStudents.length} student records
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
          >
            Reset filters
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-bold">Attendance load error</p>
          <p className="mt-1">{error}</p>
          <p className="mt-2 break-all">
            API: {API_BASE}/api/attendance
          </p>
        </div>
      )}

      {/* ATTENDANCE TABLE */}
      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Student Attendance
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Adarsha Markaz Academy · {selectedDate}
            </p>
          </div>
          <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
            {filteredStudents.length} students
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[850px] w-full">
            <thead className="bg-slate-100">
              <tr>
                {["Roll", "Admission", "Student", "Status", "Time", "Action"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className={`px-4 py-4 ${
                        ["Status", "Time", "Action"].includes(heading)
                          ? "text-center"
                          : "text-left"
                      }`}
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Loading attendance...
                  </td>
                </tr>
              ) : filteredStudents.length ? (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-t transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-4 font-semibold">{student.roll}</td>
                    <td className="px-4 py-4">{student.admissionNo}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">
                            {student.name}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {student.className} · {student.section}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`rounded-full px-3 py-2 text-xs font-bold ${getStatusClass(student.status)}`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center font-semibold">
                      {student.time}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => setViewStudent(student)}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <Users className="mx-auto mb-3 text-slate-300" size={36} />
                    <p className="font-semibold text-slate-700">
                      No attendance records found.
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Selected date ya filters ke liye attendance record nahi mila.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW STUDENT */}
      {viewStudent && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setViewStudent(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800">
                Student Attendance
              </h2>
              <button
                type="button"
                onClick={() => setViewStudent(null)}
                className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <p><strong>Name:</strong> {viewStudent.name}</p>
              <p><strong>Admission No:</strong> {viewStudent.admissionNo}</p>
              <p><strong>Roll:</strong> {viewStudent.roll}</p>
              <p><strong>Class:</strong> {viewStudent.className}</p>
              <p><strong>Section:</strong> {viewStudent.section}</p>
              <p><strong>Date:</strong> {selectedDate}</p>
              <p><strong>Status:</strong> {viewStudent.status}</p>
              <p><strong>Time:</strong> {viewStudent.time}</p>
              {viewStudent.remarks && (
                <p><strong>Remarks:</strong> {viewStudent.remarks}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}