
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  CalendarDays,
  Users,
  CheckCircle2,
  XCircle,
  Clock3,
  LogIn,
  LogOut,
  RefreshCw,
  AlertCircle,
  UserRound,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/$/, "");

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStaffName(staff) {
  if (!staff || typeof staff === "string") return "Unknown Staff";

  if (staff.name) return staff.name;

  return (
    `${staff.firstName || ""} ${staff.lastName || ""}`.trim() ||
    "Unknown Staff"
  );
}

function getStaffId(record) {
  const staff = record.staffId || record.staff;

  if (typeof staff === "string") return staff;
  return staff?._id || staff?.id || "";
}

function formatTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getStatusStyle(status) {
  switch (status) {
    case "Present":
      return "border-green-200 bg-green-50 text-green-700";
    case "Absent":
      return "border-red-200 bg-red-50 text-red-700";
    case "Late":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function getActionStyle(status, selected) {
  const styles = {
    Present: selected
      ? "border-green-600 bg-green-600 text-white shadow-sm"
      : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
    Late: selected
      ? "border-amber-500 bg-amber-500 text-white shadow-sm"
      : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
    Absent: selected
      ? "border-red-600 bg-red-600 text-white shadow-sm"
      : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
  };

  return styles[status];
}

export default function StaffAttendancePage() {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(getLocalDate());
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE}/api/staff-attendance?date=${encodeURIComponent(date)}`,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Attendance load nahi ho saki."
        );
      }

      const records = Array.isArray(data)
        ? data
        : data.attendance || data.records || [];

      setAttendance(Array.isArray(records) ? records : []);
    } catch (err) {
      setError(
        `${err.message || "Attendance load nahi ho saki."} Backend: ${API_BASE}`
      );
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const summary = {
    total: attendance.length,
    present: attendance.filter(
      (item) => item.status === "Present"
    ).length,
    absent: attendance.filter(
      (item) => item.status === "Absent"
    ).length,
    late: attendance.filter(
      (item) => item.status === "Late"
    ).length,
  };

  const filteredStaff = attendance.filter((record) => {
    const staff = record.staffId || record.staff || record;
    const name = getStaffName(staff);
    const role = staff?.designation || staff?.role || "";
    const department = staff?.department || "";

    const searchText = `${name} ${role} ${department}`.toLowerCase();

    return searchText.includes(search.trim().toLowerCase());
  });

  async function sendAttendanceRequest(endpoint, staffId, status) {
    if (!staffId) {
      setError("Staff ID nahi mili. Staff record check karein.");
      return;
    }

    setSavingId(staffId);
    setError("");
    setNotice("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          staffId,
          date,
          ...(status ? { status } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Attendance save nahi ho saki."
        );
      }

      setNotice(data.message || "Attendance successfully update ho gayi.");
      await loadAttendance();
    } catch (err) {
      setError(err.message || "Request complete nahi ho saki.");
    } finally {
      setSavingId("");
    }
  }

  const actionStatuses = ["Present", "Late", "Absent"];

  return (
    <div className="min-h-screen space-y-6 bg-slate-50/70 p-1 sm:p-3">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <CalendarDays size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
                Staff Attendance
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage daily attendance of school staff
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm">
            <CalendarDays size={18} className="shrink-0 text-indigo-600" />
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="min-w-0 bg-transparent text-slate-700 outline-none"
              aria-label="Select attendance date"
            />
          </label>

          <button
            type="button"
            onClick={loadAttendance}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="font-bold">Request failed</p>
            <p className="mt-1 break-words">{error}</p>
          </div>
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
          <p>{notice}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {[
          {
            title: "Total Staff",
            value: summary.total,
            icon: Users,
            iconBg: "bg-indigo-50",
            color: "text-indigo-600",
          },
          {
            title: "Present",
            value: summary.present,
            icon: CheckCircle2,
            iconBg: "bg-green-50",
            color: "text-green-600",
          },
          {
            title: "Absent",
            value: summary.absent,
            icon: XCircle,
            iconBg: "bg-red-50",
            color: "text-red-600",
          },
          {
            title: "Late",
            value: summary.late,
            icon: Clock3,
            iconBg: "bg-amber-50",
            color: "text-amber-600",
          },
        ].map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 sm:text-sm">
                  {card.title}
                </p>

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconBg} ${card.color}`}
                >
                  <Icon size={21} />
                </div>
              </div>

              <h2 className={`mt-3 text-3xl font-black ${card.color}`}>
                {loading ? "…" : card.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Attendance List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* List Header */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-800">
              Staff Attendance List
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Attendance date: {date}
            </p>
          </div>

          <label className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 lg:max-w-xs">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, role, department..."
              className="w-full min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-left">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="whitespace-nowrap px-5 py-4">Staff Name</th>
                <th className="whitespace-nowrap px-5 py-4">Role</th>
                <th className="whitespace-nowrap px-5 py-4">Department</th>
                <th className="whitespace-nowrap px-5 py-4">Check In</th>
                <th className="whitespace-nowrap px-5 py-4">Check Out</th>
                <th className="whitespace-nowrap px-5 py-4">Status</th>
                <th className="min-w-[310px] px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-14 text-center text-sm text-slate-500"
                  >
                    <span className="inline-flex items-center gap-2">
                      <RefreshCw size={17} className="animate-spin" />
                      Loading staff attendance...
                    </span>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center">
                    <div className="mx-auto flex max-w-md flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <UserRound size={23} />
                      </div>

                      <p className="mt-3 font-bold text-slate-700">
                        {search
                          ? "No matching staff found"
                          : "No attendance records found"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {search
                          ? "Search mein doosra naam ya department try karein."
                          : "Selected date ke liye staff attendance records available nahi hain."}
                      </p>

                      <button
                        type="button"
                        onClick={loadAttendance}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                      >
                        <RefreshCw size={15} />
                        Refresh List
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((record, index) => {
                  const staff = record.staffId || record.staff || record;
                  const staffId = getStaffId(record);
                  const name = getStaffName(staff);

                  const role =
                    staff?.designation ||
                    staff?.role ||
                    staff?.position ||
                    "—";

                  const department = staff?.department || "—";
                  const status = record.status || "Absent";
                  const isSaving = savingId === staffId;

                  return (
                    <tr
                      key={staffId || record._id || index}
                      className="transition hover:bg-slate-50/80"
                    >
                      {/* Name */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-800">
                          {name}
                        </div>
                        {staff?.staffId && (
                          <div className="mt-1 text-xs text-slate-400">
                            ID: {staff.staffId}
                          </div>
                        )}
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {role}
                      </td>

                      {/* Department */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {department}
                      </td>

                      {/* Check In */}
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-600">
                        {formatTime(record.checkIn)}
                      </td>

                      {/* Check Out */}
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-600">
                        {formatTime(record.checkOut)}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap items-center rounded-lg border px-3 py-1.5 text-xs font-bold ${getStatusStyle(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex min-w-[290px] flex-col gap-3">
                          {/* Attendance status buttons */}
                          <div className="flex flex-wrap items-center gap-2">
                            {actionStatuses.map((actionStatus) => (
                              <button
                                key={actionStatus}
                                type="button"
                                disabled={!staffId || isSaving}
                                onClick={() =>
                                  sendAttendanceRequest(
                                    "/api/staff-attendance",
                                    staffId,
                                    actionStatus
                                  )
                                }
                                className={`inline-flex min-w-[82px] items-center justify-center rounded-lg border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${getActionStyle(
                                  actionStatus,
                                  status === actionStatus
                                )}`}
                              >
                                {isSaving ? "Saving..." : actionStatus}
                              </button>
                            ))}
                          </div>

                          {/* Check-in / Check-out buttons */}
                          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                            <button
                              type="button"
                              disabled={
                                !staffId ||
                                isSaving ||
                                Boolean(record.checkIn)
                              }
                              onClick={() =>
                                sendAttendanceRequest(
                                  "/api/staff-attendance/check-in",
                                  staffId
                                )
                              }
                              title="Save check-in time"
                              className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <LogIn size={15} />
                              Check In
                            </button>

                            <button
                              type="button"
                              disabled={
                                !staffId ||
                                isSaving ||
                                !record.checkIn ||
                                Boolean(record.checkOut)
                              }
                              onClick={() =>
                                sendAttendanceRequest(
                                  "/api/staff-attendance/check-out",
                                  staffId
                                )
                              }
                              title="Save check-out time"
                              className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <LogOut size={15} />
                              Check Out
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && filteredStaff.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing <strong>{filteredStaff.length}</strong> staff record(s)
            </span>
            <span>
              Present: {summary.present} · Late: {summary.late} · Absent:{" "}
              {summary.absent}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
