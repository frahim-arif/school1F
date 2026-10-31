"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Search,
  RefreshCw,
  Save,
  Users,
  CheckCircle2,
  XCircle,
  Clock3,
  ClipboardCheck,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const STATUSES = ["Present", "Absent", "Late", "Leave"];

const STATUS_STYLES = {
  Present: "bg-green-100 text-green-800 border-green-300",
  Absent: "bg-red-100 text-red-800 border-red-300",
  Late: "bg-amber-100 text-amber-800 border-amber-300",
  Leave: "bg-blue-100 text-blue-800 border-blue-300",
};

function getToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function getStudentName(student) {
  return (
    student.name ||
    student.studentName ||
    [student.firstName, student.lastName].filter(Boolean).join(" ") ||
    "Unnamed Student"
  );
}

function getClassName(student) {
  const value =
    student.className ??
    student.class?.name ??
    student.class?.className ??
    student.class ??
    "";

  return typeof value === "object"
    ? value?.name || value?.className || ""
    : String(value);
}

function getSectionName(student) {
  const value =
    student.sectionName ??
    student.section?.name ??
    student.section?.sectionName ??
    student.section ??
    "";

  return typeof value === "object"
    ? value?.name || value?.sectionName || ""
    : String(value);
}

function getStudentId(student) {
  return student._id || student.id || student.studentId;
}

export default function StudentAttendancePage() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(getToday());
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadStudents() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/api/students`);
      if (!response.ok) {
        throw new Error(`Students API error: ${response.status}`);
      }

      const result = await response.json();
      const list = Array.isArray(result)
        ? result
        : result.data?.students ||
          result.data ||
          result.students ||
          result._data?.students ||
          result._data ||
          [];

      if (!Array.isArray(list)) {
        throw new Error("Students API ka response format sahi nahi hai.");
      }

      setStudents(list);

      setAttendance((previous) => {
        const next = {};
        list.forEach((student) => {
          const id = getStudentId(student);
          if (id) {
            next[id] = previous[id] || {
              status: "Present",
              remark: "",
            };
          }
        });
        return next;
      });
    } catch (err) {
      setError(err.message || "Students load nahi hue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const classes = useMemo(() => {
    return [...new Set(students.map(getClassName).filter(Boolean))].sort(
      (a, b) => a.localeCompare(b, undefined, { numeric: true })
    );
  }, [students]);

  const sections = useMemo(() => {
    return [
      ...new Set(
        students
          .filter(
            (student) =>
              !selectedClass || getClassName(student) === selectedClass
          )
          .map(getSectionName)
          .filter(Boolean)
      ),
    ].sort();
  }, [students, selectedClass]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const classMatch =
        !selectedClass || getClassName(student) === selectedClass;
      const sectionMatch =
        !selectedSection || getSectionName(student) === selectedSection;
      const query = search.trim().toLowerCase();
      const text = [
        getStudentName(student),
        student.admissionNo,
        student.admissionNumber,
        student.rollNo,
        student.rollNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return classMatch && sectionMatch && text.includes(query);
    });
  }, [students, selectedClass, selectedSection, search]);

  const counts = useMemo(() => {
    const result = {
      Present: 0,
      Absent: 0,
      Late: 0,
      Leave: 0,
    };

    filteredStudents.forEach((student) => {
      const id = getStudentId(student);
      const status = attendance[id]?.status;
      if (result[status] !== undefined) result[status]++;
    });

    return result;
  }, [filteredStudents, attendance]);

  function updateStudent(id, field, value) {
    setAttendance((previous) => ({
      ...previous,
      [id]: {
        status: previous[id]?.status || "Present",
        remark: previous[id]?.remark || "",
        [field]: value,
      },
    }));
    setMessage("");
  }

  function markAll(status) {
    setAttendance((previous) => {
      const next = { ...previous };

      filteredStudents.forEach((student) => {
        const id = getStudentId(student);
        if (id) {
          next[id] = {
            status,
            remark: previous[id]?.remark || "",
          };
        }
      });

      return next;
    });

    setMessage("");
  }

  async function saveAttendance() {
    if (!filteredStudents.length) {
      setError("Attendance save karne ke liye students nahi hain.");
      return;
    }

    if (!selectedClass) {
      setError("Pehle class select karein.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const records = filteredStudents
        .map((student) => {
          const id = getStudentId(student);
          if (!id) return null;

          return {
            studentId: id,
            admissionNo:
              student.admissionNo ||
              student.admissionNumber ||
              "",
            rollNo: student.rollNo || student.rollNumber || "",
            studentName: getStudentName(student),
            status: attendance[id]?.status || "Present",
            remark: attendance[id]?.remark || "",
          };
        })
        .filter(Boolean);

      const response = await fetch(`${API_BASE}/api/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          className: selectedClass,
          section: selectedSection,
          attendance: records,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result._status === false) {
        throw new Error(
          result._message ||
            result.message ||
            `Attendance save failed (${response.status}).`
        );
      }

      setMessage(
        result._message || "Attendance save request successful."
      );
    } catch (err) {
      setError(
        `${err.message} Backend ka actual attendance route aur request format check karein.`
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              SCHOOL MANAGEMENT
            </p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Student Attendance
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Students ki daily attendance manage karein.
            </p>
          </div>

          <button
            type="button"
            onClick={loadStudents}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh Students
          </button>
        </div>

        {error && (
          <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            {message}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Total Students",
              value: filteredStudents.length,
              icon: Users,
              color: "text-slate-700",
            },
            {
              label: "Present",
              value: counts.Present,
              icon: CheckCircle2,
              color: "text-green-700",
            },
            {
              label: "Absent",
              value: counts.Absent,
              icon: XCircle,
              color: "text-red-700",
            },
            {
              label: "Late / Leave",
              value: counts.Late + counts.Leave,
              icon: Clock3,
              color: "text-amber-700",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    {item.label}
                  </span>
                  <Icon size={20} className={item.color} />
                </div>
                <p className={`mt-3 text-3xl font-bold ${item.color}`}>
                  {item.value}
                </p>
              </div>
            );
          })}
        </section>

        <section className="border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardCheck size={20} className="text-emerald-700" />
            <h2 className="font-bold">Attendance Filters</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm font-medium">
              Attendance Date
              <div className="mt-1 flex items-center gap-2 border border-slate-300 px-3">
                <CalendarDays size={17} className="text-slate-500" />
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="min-w-0 flex-1 py-2.5 outline-none"
                />
              </div>
            </label>

            <label className="text-sm font-medium">
              Class
              <select
                value={selectedClass}
                onChange={(event) => {
                  setSelectedClass(event.target.value);
                  setSelectedSection("");
                }}
                className="mt-1 w-full border border-slate-300 bg-white px-3 py-2.5 outline-none"
              >
                <option value="">Select Class</option>
                {classes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium">
              Section
              <select
                value={selectedSection}
                onChange={(event) => setSelectedSection(event.target.value)}
                className="mt-1 w-full border border-slate-300 bg-white px-3 py-2.5 outline-none"
              >
                <option value="">All Sections</option>
                {sections.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium">
              Search Student
              <div className="mt-1 flex items-center gap-2 border border-slate-300 px-3">
                <Search size={17} className="text-slate-500" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Name, admission no..."
                  className="min-w-0 flex-1 py-2.5 outline-none"
                />
              </div>
            </label>
          </div>
        </section>

        <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold">Student List</h2>
              <p className="mt-1 text-xs text-slate-500">
                {selectedClass || "No class selected"}
                {selectedSection ? ` • Section ${selectedSection}` : ""}
                {" • "}
                {date}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => markAll("Present")}
                className="border border-green-300 px-3 py-2 text-sm font-semibold text-green-800 hover:bg-green-50"
              >
                All Present
              </button>
              <button
                type="button"
                onClick={() => markAll("Absent")}
                className="border border-red-300 px-3 py-2 text-sm font-semibold text-red-800 hover:bg-red-50"
              >
                All Absent
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">
              Students load ho rahe hain...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={35} className="mx-auto text-slate-300" />
              <p className="mt-3 font-semibold">Students nahi mile</p>
              <p className="mt-1 text-sm text-slate-500">
                Students add karein ya class/search filter check karein.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Admission No.</th>
                    <th className="px-4 py-3">Class / Section</th>
                    <th className="px-4 py-3">Attendance Status</th>
                    <th className="px-4 py-3">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student, index) => {
                    const id = getStudentId(student);
                    const record = attendance[id] || {
                      status: "Present",
                      remark: "",
                    };

                    return (
                      <tr key={id || index} className="hover:bg-slate-50">
                        <td className="px-4 py-4 text-slate-500">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 font-semibold">
                          {getStudentName(student)}
                        </td>
                        <td className="px-4 py-4">
                          {student.admissionNo ||
                            student.admissionNumber ||
                            student.rollNo ||
                            student.rollNumber ||
                            "—"}
                        </td>
                        <td className="px-4 py-4">
                          {getClassName(student) || "—"}
                          {getSectionName(student)
                            ? ` / ${getSectionName(student)}`
                            : ""}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {STATUSES.map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() =>
                                  updateStudent(id, "status", status)
                                }
                                className={`border px-2 py-1.5 text-xs font-semibold ${
                                  record.status === status
                                    ? STATUS_STYLES[status]
                                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <input
                            value={record.remark}
                            onChange={(event) =>
                              updateStudent(id, "remark", event.target.value)
                            }
                            placeholder="Optional"
                            className="w-36 border border-slate-300 px-2 py-2 outline-none focus:border-emerald-600"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col justify-between gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center">
            <p className="text-sm text-slate-500">
              {filteredStudents.length} students • {counts.Present} present •{" "}
              {counts.Absent} absent
            </p>

            <button
              type="button"
              onClick={saveAttendance}
              disabled={saving || loading || filteredStudents.length === 0}
              className="inline-flex items-center justify-center gap-2 bg-emerald-800 px-5 py-3 font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={17} />
              {saving ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
