
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  CalendarDays,
  Users,
  CheckCircle2,
  XCircle,
  Clock3,
  Save,
  RefreshCw,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/+$/, "");

const API_URL = API_BASE.endsWith("/api")
  ? `${API_BASE}/teacher-attendance`
  : `${API_BASE}/api/teacher-attendance`;

const STATUSES = ["Present", "Absent", "Late", "Half Day", "Leave"];

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time) {
  if (!time) return "-";

  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return time;

  const date = new Date();
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getStatusStyle(status) {
  switch (status) {
    case "Present":
      return "bg-green-100 text-green-700";
    case "Absent":
      return "bg-red-100 text-red-700";
    case "Late":
      return "bg-orange-100 text-orange-700";
    case "Half Day":
      return "bg-amber-100 text-amber-700";
    case "Leave":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function TeacherAttendancePage() {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(getToday());
  const [teachers, setTeachers] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    leave: 0,
    notMarked: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}?date=${encodeURIComponent(date)}`,
        { cache: "no-store" }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Attendance load nahi ho saki.");
      }

      const list = Array.isArray(data.teachers) ? data.teachers : [];

      setTeachers(list);
      setSummary(
        data.summary || {
          total: list.length,
          present: 0,
          absent: 0,
          late: 0,
          halfDay: 0,
          leave: 0,
          notMarked: list.length,
        }
      );

      const nextDrafts = {};

      list.forEach((teacher) => {
        const attendance = teacher.attendance;

        nextDrafts[teacher._id] = {
          status: attendance?.status || "Present",
          checkIn: attendance?.checkIn || "",
          checkOut: attendance?.checkOut || "",
          remarks: attendance?.remarks || "",
        };
      });

      setDrafts(nextDrafts);
    } catch (err) {
      setError(
        err.message ||
          "Backend se connection nahi ho raha. Server aur API URL check karein."
      );
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  function updateDraft(teacherId, field, value) {
    setDrafts((previous) => ({
      ...previous,
      [teacherId]: {
        ...previous[teacherId],
        [field]: value,
      },
    }));
  }

  async function saveAttendance(teacher) {
    const draft = drafts[teacher._id];

    if (!draft?.status) {
      setError("Attendance status select karein.");
      return;
    }

    setSavingId(teacher._id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacherId: teacher._id,
          date,
          status: draft.status,
          checkIn: draft.checkIn,
          checkOut: draft.checkOut,
          remarks: draft.remarks,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Attendance save nahi hui.");
      }

      setMessage(`${teacher.name} ki attendance save ho gayi.`);
      await loadAttendance();
    } catch (err) {
      setError(err.message || "Attendance save karne mein error aaya.");
    } finally {
      setSavingId("");
    }
  }

  const filteredTeachers = teachers.filter((teacher) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
      (teacher.name || "").toLowerCase().includes(query) ||
      (teacher.employeeId || "").toLowerCase().includes(query) ||
      (teacher.email || "").toLowerCase().includes(query)
    );
  });

  const statCards = [
    {
      title: "Total Teachers",
      value: summary.total ?? teachers.length,
      icon: Users,
      color: "text-indigo-600",
    },
    {
      title: "Present",
      value: summary.present ?? 0,
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      title: "Absent",
      value: summary.absent ?? 0,
      icon: XCircle,
      color: "text-red-600",
    },
    {
      title: "Late",
      value: summary.late ?? 0,
      icon: Clock3,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Teacher Attendance
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage and monitor teacher daily attendance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm shadow-sm">
            <CalendarDays size={18} className="text-indigo-600" />
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="min-w-0 bg-transparent font-semibold text-slate-700 outline-none"
            />
          </label>

          <button
            type="button"
            onClick={loadAttendance}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-500">
                  {card.title}
                </p>
                <Icon className={card.color} size={22} />
              </div>
              <h2 className={`mt-3 text-3xl font-black ${card.color}`}>
                {card.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Additional summary */}
      <div className="flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-amber-50 px-4 py-2 font-semibold text-amber-700">
          Half Day: {summary.halfDay ?? 0}
        </span>
        <span className="rounded-full bg-blue-50 px-4 py-2 font-semibold text-blue-700">
          Leave: {summary.leave ?? 0}
        </span>
        <span className="rounded-full bg-slate-100 px-4 py-2 font-semibold text-slate-700">
          Not Marked: {summary.notMarked ?? 0}
        </span>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
          {message}
        </div>
      )}

      {/* Attendance table */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-800">
              Teacher Attendance List
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Date: {formatDate(date)}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border px-4 py-2">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search name or employee ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full min-w-0 text-sm outline-none md:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="whitespace-nowrap px-5 py-4">Teacher</th>
                <th className="whitespace-nowrap px-5 py-4">Subject</th>
                <th className="whitespace-nowrap px-5 py-4">Check In</th>
                <th className="whitespace-nowrap px-5 py-4">Check Out</th>
                <th className="whitespace-nowrap px-5 py-4">Status</th>
                <th className="whitespace-nowrap px-5 py-4">Remarks</th>
                <th className="whitespace-nowrap px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <LoaderCircle size={20} className="animate-spin" />
                      Loading teachers...
                    </span>
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    {teachers.length === 0
                      ? "Is date ke liye koi active teacher nahi mila."
                      : "Search se matching teacher nahi mila."}
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => {
                  const draft = drafts[teacher._id] || {};
                  const attendance = teacher.attendance;

                  return (
                    <tr
                      key={teacher._id}
                      className="border-t align-top transition hover:bg-slate-50"
                    >
                      <td className="min-w-52 px-5 py-4">
                        <p className="font-bold text-slate-800">
                          {teacher.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          ID: {teacher.employeeId || "-"}
                        </p>
                      </td>

                      <td className="min-w-36 px-5 py-4 text-sm text-slate-600">
                        {Array.isArray(teacher.subjectIds) &&
                        teacher.subjectIds.length
                          ? teacher.subjectIds
                              .map((subject) => subject.name)
                              .filter(Boolean)
                              .join(", ")
                          : "-"}
                      </td>

                      <td className="min-w-36 px-5 py-4">
                        <input
                          type="time"
                          value={draft.checkIn || ""}
                          onChange={(event) =>
                            updateDraft(
                              teacher._id,
                              "checkIn",
                              event.target.value
                            )
                          }
                          className="w-32 rounded-lg border px-2 py-2 text-sm outline-none focus:border-indigo-500"
                          aria-label={`Check in time for ${teacher.name}`}
                        />
                      </td>

                      <td className="min-w-36 px-5 py-4">
                        <input
                          type="time"
                          value={draft.checkOut || ""}
                          onChange={(event) =>
                            updateDraft(
                              teacher._id,
                              "checkOut",
                              event.target.value
                            )
                          }
                          className="w-32 rounded-lg border px-2 py-2 text-sm outline-none focus:border-indigo-500"
                          aria-label={`Check out time for ${teacher.name}`}
                        />
                      </td>

                      <td className="min-w-40 px-5 py-4">
                        <span
                          className={`mb-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            attendance
                              ? getStatusStyle(attendance.status)
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {attendance?.status || "Not Marked"}
                        </span>

                        <select
                          value={draft.status || "Present"}
                          onChange={(event) =>
                            updateDraft(
                              teacher._id,
                              "status",
                              event.target.value
                            )
                          }
                          className="block w-full rounded-lg border bg-white px-2 py-2 text-sm outline-none focus:border-indigo-500"
                          aria-label={`Attendance status for ${teacher.name}`}
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="min-w-44 px-5 py-4">
                        <input
                          type="text"
                          value={draft.remarks || ""}
                          onChange={(event) =>
                            updateDraft(
                              teacher._id,
                              "remarks",
                              event.target.value
                            )
                          }
                          placeholder="Optional remarks"
                          className="w-40 rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-500"
                          aria-label={`Remarks for ${teacher.name}`}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => saveAttendance(teacher)}
                          disabled={savingId === teacher._id}
                          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingId === teacher._id ? (
                            <LoaderCircle size={16} className="animate-spin" />
                          ) : (
                            <Save size={16} />
                          )}
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
