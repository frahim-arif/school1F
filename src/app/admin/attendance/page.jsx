"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, RefreshCw, Save, ClipboardCheck, Search, AlertCircle } from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/+$/, "");

const API_ROOT = API_BASE.endsWith("/api")
  ? API_BASE
  : `${API_BASE}/api`;

const STATUSES = ["Present", "Absent", "Late", "Half Day", "Leave"];

function localDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AttendancePage() {
  const [date, setDate] = useState(localDateString());
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedSection, setSelectedSection] = useState("All Sections");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadAttendance = useCallback(async () => {
    if (!date) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_ROOT}/attendance?date=${encodeURIComponent(date)}`
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Attendance load nahi hui.");
      }

      const list = Array.isArray(data.students) ? data.students : [];
      setStudents(list);

      const initial = {};

      list.forEach((student) => {
        initial[student._id] = {
          status: student.attendance?.status || "",
          remarks: student.attendance?.remarks || "",
        };
      });

      setAttendance(initial);
    } catch (err) {
      setError(err.message || "Backend se connection nahi ho raha.");
      setStudents([]);
      setAttendance({});
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const classes = useMemo(
    () => [...new Set(students.map((s) => s.className).filter(Boolean))].sort(
      (a, b) => String(a).localeCompare(String(b), undefined, { numeric: true })
    ),
    [students]
  );

  const sections = useMemo(
    () => [
      ...new Set(
        students
          .filter(
            (s) =>
              selectedClass === "All Classes" ||
              s.className === selectedClass
          )
          .map((s) => s.section)
          .filter(Boolean)
      ),
    ].sort(),
    [students, selectedClass]
  );

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return students.filter((student) => {
      const name =
        `${student.firstName || ""} ${student.lastName || ""}`
          .trim()
          .toLowerCase();

      const matchesClass =
        selectedClass === "All Classes" ||
        student.className === selectedClass;

      const matchesSection =
        selectedSection === "All Sections" ||
        student.section === selectedSection;

      const matchesSearch =
        !term ||
        name.includes(term) ||
        (student.admissionNo || "").toLowerCase().includes(term) ||
        String(student.rollNo ?? "").toLowerCase().includes(term);

      return matchesClass && matchesSection && matchesSearch;
    });
  }, [students, selectedClass, selectedSection, search]);

  function updateAttendance(studentId, field, value) {
    setAttendance((current) => ({
      ...current,
      [studentId]: {
        status: current[studentId]?.status || "",
        remarks: current[studentId]?.remarks || "",
        [field]: value,
      },
    }));
  }

  function markAll(status) {
    setAttendance((current) => {
      const next = { ...current };

      filteredStudents.forEach((student) => {
        next[student._id] = {
          status,
          remarks: next[student._id]?.remarks || "",
        };
      });

      return next;
    });
  }

  async function saveAttendance() {
    setError("");
    setMessage("");

    const markedStudents = filteredStudents.filter(
      (student) => attendance[student._id]?.status
    );

    if (markedStudents.length === 0) {
      setError("Save karne se pehle kam se kam ek student ka status select karein.");
      return;
    }

    setSaving(true);

    try {
      const results = await Promise.all(
        markedStudents.map(async (student) => {
          const item = attendance[student._id];

          const response = await fetch(`${API_ROOT}/attendance`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId: student._id,
              date,
              status: item.status,
              remarks: item.remarks || "",
              markedBy: "School Administrator",
            }),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(
              `${student.firstName || student.admissionNo}: ${
                data.message || "Attendance save nahi hui."
              }`
            );
          }

          return data;
        })
      );

      setMessage(
        `${results.length} students ki attendance successfully save ho gayi.`
      );

      await loadAttendance();
    } catch (err) {
      setError(
        err.message ||
          "Attendance save karte waqt error aaya. Dobara check karein."
      );
    } finally {
      setSaving(false);
    }
  }

  const counts = useMemo(() => {
    const result = {
      Present: 0,
      Absent: 0,
      Late: 0,
      "Half Day": 0,
      Leave: 0,
      Unmarked: 0,
    };

    filteredStudents.forEach((student) => {
      const status = attendance[student._id]?.status;
      if (status && result[status] !== undefined) result[status]++;
      else result.Unmarked++;
    });

    return result;
  }, [filteredStudents, attendance]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 sm:text-3xl">
            Student Attendance
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Class-wise daily attendance mark aur save karein.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2.5 text-sm font-semibold text-slate-700">
          <CalendarDays size={18} className="text-emerald-600" />
          {date || "Select date"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["Total", filteredStudents.length, "text-slate-800"],
          ["Present", counts.Present, "text-emerald-700"],
          ["Absent", counts.Absent, "text-red-600"],
          ["Late", counts.Late, "text-amber-600"],
          ["Leave", counts.Leave, "text-blue-600"],
          ["Unmarked", counts.Unmarked, "text-slate-500"],
        ].map(([label, value, color]) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-slate-500">{label}</p>
            <p className={`mt-1 text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">
              Attendance Date
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">
              Class
            </span>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSection("All Sections");
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500"
            >
              <option>All Classes</option>
              {classes.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">
              Section
            </span>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500"
            >
              <option>All Sections</option>
              {sections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">
              Search Student
            </span>
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-3 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, admission no..."
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 outline-none focus:border-emerald-500"
              />
            </div>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
          <button
            type="button"
            onClick={() => markAll("Present")}
            className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            Mark All Present
          </button>
          <button
            type="button"
            onClick={() => markAll("Absent")}
            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
          >
            Mark All Absent
          </button>
          <button
            type="button"
            onClick={loadAttendance}
            disabled={loading || saving}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          {message}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-slate-800">Students List</h2>
            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Loading students..."
                : `${filteredStudents.length} student(s)`}
            </p>
          </div>

          <button
            type="button"
            onClick={saveAttendance}
            disabled={saving || loading || filteredStudents.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Saving..." : "Save Attendance"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[850px] w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-3">Roll No.</th>
                <th className="px-4 py-3">Admission No.</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Class / Section</th>
                <th className="px-4 py-3">Attendance Status</th>
                <th className="px-4 py-3">Remarks</th>
              </tr>
            </thead>

            <tbody>
              {!loading && filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    Koi active student nahi mila. Student Management aur backend connection check karein.
                  </td>
                </tr>
              )}

              {filteredStudents.map((student) => {
                const item = attendance[student._id] || {
                  status: "",
                  remarks: "",
                };

                return (
                  <tr
                    key={student._id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">{student.rollNo ?? "--"}</td>
                    <td className="px-4 py-3 font-semibold">
                      {student.admissionNo || "--"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {`${student.firstName || ""} ${student.lastName || ""}`.trim() || "--"}
                    </td>
                    <td className="px-4 py-3">
                      {student.className || "--"} / {student.section || "--"}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          updateAttendance(student._id, "status", e.target.value)
                        }
                        className="w-36 rounded-lg border border-slate-300 px-2.5 py-2 outline-none focus:border-emerald-500"
                      >
                        <option value="">Select status</option>
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={item.remarks}
                        onChange={(e) =>
                          updateAttendance(student._id, "remarks", e.target.value)
                        }
                        placeholder="Optional"
                        className="w-40 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-start gap-2 border-t bg-slate-50 p-4 text-xs text-slate-500">
          <ClipboardCheck size={17} className="shrink-0" />
          Sirf un students ke records save honge jinka status select kiya gaya hai.
          Dobara save karne par usi student aur date ka status update hoga.
        </div>
      </div>
    </div>
  );
}