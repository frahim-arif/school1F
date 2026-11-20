
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Save,
  ClipboardCheck,
  AlertCircle,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/+$/, "");

const API_ROOT = API_BASE.endsWith("/api")
  ? API_BASE
  : `${API_BASE}/api`;

const STATUSES = ["Present", "Absent", "Late", "Half Day", "Leave"];

const getToday = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10);
};

export default function StudentAttendancePage() {
  const [date, setDate] = useState(getToday());
  const [students, setStudents] = useState([]);
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [search, setSearch] = useState("");

  const [attendance, setAttendance] = useState({});
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
      const params = new URLSearchParams({ date });

      if (className) params.set("className", className);
      if (section) params.set("section", section);

      const response = await fetch(
        `${API_ROOT}/attendance?${params.toString()}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Attendance load nahi hui.");
      }

      const list = Array.isArray(data.students) ? data.students : [];

      setStudents(list);

      const initialAttendance = {};

      list.forEach((student) => {
        initialAttendance[student._id] = {
          status: student.attendance?.status || "",
          remarks: student.attendance?.remarks || "",
          savedStatus: student.attendance?.status || "",
          savedRemarks: student.attendance?.remarks || "",
        };
      });

      setAttendance(initialAttendance);
    } catch (err) {
      setStudents([]);
      setAttendance({});
      setError(err.message || "Attendance load karne mein error.");
    } finally {
      setLoading(false);
    }
  }, [date, className, section]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const classOptions = useMemo(
    () =>
      [...new Set(students.map((s) => s.className).filter(Boolean))].sort(),
    [students]
  );

  const sectionOptions = useMemo(
    () =>
      [
        ...new Set(
          students
            .filter((s) => !className || s.className === className)
            .map((s) => s.section)
            .filter(Boolean)
        ),
      ].sort(),
    [students, className]
  );

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      if (!query) return true;

      const name =
        `${student.firstName || ""} ${student.lastName || ""}`.toLowerCase();

      return (
        name.includes(query) ||
        String(student.admissionNo || "").toLowerCase().includes(query) ||
        String(student.rollNo || "").toLowerCase().includes(query)
      );
    });
  }, [students, search]);

  const counts = useMemo(() => {
    const result = {
      Present: 0,
      Absent: 0,
      Late: 0,
      "Half Day": 0,
      Leave: 0,
      Unmarked: 0,
    };

    students.forEach((student) => {
      const status = attendance[student._id]?.status;

      if (STATUSES.includes(status)) result[status]++;
      else result.Unmarked++;
    });

    return result;
  }, [students, attendance]);

  const updateAttendance = (studentId, field, value) => {
    setAttendance((previous) => ({
      ...previous,
      [studentId]: {
        ...previous[studentId],
        [field]: value,
      },
    }));
  };

  const isChanged = (studentId) => {
    const item = attendance[studentId];

    return (
      item &&
      (item.status !== item.savedStatus ||
        item.remarks !== item.savedRemarks)
    );
  };

  const saveOne = async (student) => {
    const item = attendance[student._id];

    if (!item?.status || !STATUSES.includes(item.status)) {
      setError(`${student.firstName}: attendance status select karein.`);
      return false;
    }

    const response = await fetch(`${API_ROOT}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: student._id,
        date,
        status: item.status,
        remarks: item.remarks || "",
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Attendance save nahi hui.");
    }

    setAttendance((previous) => ({
      ...previous,
      [student._id]: {
        ...previous[student._id],
        savedStatus: previous[student._id].status,
        savedRemarks: previous[student._id].remarks,
      },
    }));

    return true;
  };

  const handleSaveOne = async (student) => {
    setError("");
    setMessage("");
    setSaving(true);

    try {
      await saveOne(student);
      setMessage(`${student.firstName} ki attendance save ho gayi.`);
    } catch (err) {
      setError(err.message || "Save karne mein error.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setError("");
    setMessage("");

    const changedStudents = filteredStudents.filter((student) =>
      isChanged(student._id)
    );

    if (!changedStudents.length) {
      setMessage("Koi changed attendance nahi hai.");
      return;
    }

    const invalidStudent = changedStudents.find(
      (student) => !STATUSES.includes(attendance[student._id]?.status)
    );

    if (invalidStudent) {
      setError(
        `${invalidStudent.firstName} ${invalidStudent.lastName || ""} ka status select karein.`
      );
      return;
    }

    setSaving(true);

    try {
      const results = await Promise.allSettled(
        changedStudents.map((student) => saveOne(student))
      );

      const failed = results.filter((result) => result.status === "rejected");

      if (failed.length) {
        throw new Error(
          `${changedStudents.length - failed.length} records saved. ${failed.length} records failed: ${failed[0].reason?.message || "Unknown error"}`
        );
      }

      setMessage(`${changedStudents.length} students ki attendance saved successfully.`);
    } catch (err) {
      setError(err.message || "Attendance save nahi hui.");
    } finally {
      setSaving(false);
    }
  };

  const changedCount = filteredStudents.filter((student) =>
    isChanged(student._id)
  ).length;

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 text-slate-800 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <ClipboardCheck size={18} />
            Student Management
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Student Attendance
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Daily student attendance mark, update aur manage karein.
          </p>
        </div>

        <button
          onClick={loadAttendance}
          disabled={loading || saving}
          className="inline-flex items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Students" value={students.length} icon={<Users size={19} />} />
        <StatCard label="Present" value={counts.Present} icon={<CheckCircle2 size={19} />} />
        <StatCard label="Absent" value={counts.Absent} icon={<XCircle size={19} />} />
        <StatCard label="Late" value={counts.Late} icon={<Clock size={19} />} />
        <StatCard label="Leave" value={counts.Leave} icon={<CalendarDays size={19} />} />
        <StatCard label="Unmarked" value={counts.Unmarked} icon={<AlertCircle size={19} />} />
      </div>

      {error && (
        <div className="flex items-start gap-2 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {message && (
        <div className="border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <section className="border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 font-bold">Attendance Filters</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Attendance Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="field"
            />
          </Field>

          <Field label="Class">
            <select
              value={className}
              onChange={(e) => {
                setClassName(e.target.value);
                setSection("");
              }}
              className="field"
            >
              <option value="">All Classes</option>
              {classOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </Field>

          <Field label="Section">
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="field"
            >
              <option value="">All Sections</option>
              {sectionOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </Field>

          <Field label="Search Student">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, admission no. or roll no."
                className="field pl-9"
              />
            </div>
          </Field>
        </div>
      </section>

      <section className="border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold">Student Attendance List</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredStudents.length} students found · {changedCount} unsaved changes
            </p>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving || loading || changedCount === 0}
            className="inline-flex items-center justify-center gap-2 bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={17} />
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Admission No.</th>
                <th className="px-4 py-3">Class / Section</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Remarks</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {!loading && filteredStudents.map((student, index) => {
                const item = attendance[student._id] || {};
                const changed = isChanged(student._id);

                return (
                  <tr key={student._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">{index + 1}</td>

                    <td className="px-4 py-3">
                      <div className="font-semibold">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-xs text-slate-500">
                        Roll No: {student.rollNo || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-3">{student.admissionNo || "-"}</td>

                    <td className="px-4 py-3">
                      {student.className} / {student.section || "-"}
                    </td>

                    <td className="px-4 py-3">
                      <select
                        value={item.status || ""}
                        onChange={(e) =>
                          updateAttendance(student._id, "status", e.target.value)
                        }
                        className="w-32 border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-emerald-600"
                      >
                        <option value="">Select Status</option>
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-3">
                      <input
                        value={item.remarks || ""}
                        onChange={(e) =>
                          updateAttendance(student._id, "remarks", e.target.value)
                        }
                        placeholder="Optional remarks"
                        className="w-40 border border-slate-200 px-2 py-2 text-sm outline-none focus:border-emerald-600"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleSaveOne(student)}
                        disabled={saving || !changed}
                        className="inline-flex items-center gap-1 bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Save size={14} />
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })}

              {!loading && filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    Is date aur filter ke liye koi student nahi mila.
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    Attendance load ho rahi hai...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
          Present, Absent, Late, Half Day aur Leave supported hain. Existing
          attendance ko dobara save karne par update kiya jayega.
        </div>
      </section>

      <style jsx>{`
        .field {
          width: 100%;
          border: 1px solid #e2e8f0;
          background: white;
          padding: 10px 12px;
          font-size: 14px;
          outline: none;
        }
        .field:focus {
          border-color: #047857;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="block text-sm font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="flex items-center gap-3 border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-emerald-50 text-emerald-700">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}
