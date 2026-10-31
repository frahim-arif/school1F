
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Save,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

function getHeaders(json = false) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false || data._status === false) {
    throw new Error(
      data.message ||
        data._message ||
        `Request failed (${response.status})`
    );
  }

  return data;
}

function staffName(staff) {
  return (
    staff?.name ||
    [staff?.firstName, staff?.lastName].filter(Boolean).join(" ") ||
    "Unknown Staff"
  );
}

function staffIdOf(staff) {
  return typeof staff === "string" ? staff : staff?._id || staff?.id;
}

function normalizeStatus(status) {
  const value = String(status || "").toLowerCase();

  if (value === "present") return "Present";
  if (value === "absent") return "Absent";
  if (value === "leave" || value === "on leave") return "Leave";

  return "Unmarked";
}

export default function StaffAttendancePage() {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(today());
  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const [staffResponse, attendanceResponse] = await Promise.all([
        fetch(`${API_BASE}/api/staff`, {
          headers: getHeaders(),
          cache: "no-store",
        }),
        fetch(
          `${API_BASE}/api/staff-attendance?date=${encodeURIComponent(date)}`,
          {
            headers: getHeaders(),
            cache: "no-store",
          }
        ),
      ]);

      const [staffData, attendanceData] = await Promise.all([
        readResponse(staffResponse),
        readResponse(attendanceResponse),
      ]);

      const staffRecords = Array.isArray(staffData)
        ? staffData
        : staffData.staff || staffData.data || staffData.records || [];

      const attendanceRecords = Array.isArray(attendanceData)
        ? attendanceData
        : attendanceData.attendance ||
          attendanceData.records ||
          attendanceData.data ||
          [];

      const activeStaff = staffRecords.filter(
        (person) =>
          !person.status ||
          String(person.status).toLowerCase() === "active"
      );

      const attendanceMap = {};

      attendanceRecords.forEach((record) => {
        const id = staffIdOf(record.staff || record.staffId);

        if (id) {
          attendanceMap[id] = normalizeStatus(record.status);
        }
      });

      setStaff(activeStaff);
      setAttendance(attendanceMap);
    } catch (err) {
      setError(
        `${err.message || "Attendance load nahi ho saki."} API check karein: ${API_BASE}/api/staff-attendance`
      );
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();

    return staff.filter((person) => {
      const searchable = [
        staffName(person),
        person.staffId,
        person.designation,
        person.role,
        person.department,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [staff, search]);

  const stats = useMemo(() => {
    const values = staff.map((person) => {
      const id = staffIdOf(person);
      return attendance[id] || "Unmarked";
    });

    return {
      total: staff.length,
      present: values.filter((value) => value === "Present").length,
      absent: values.filter((value) => value === "Absent").length,
      leave: values.filter((value) => value === "Leave").length,
      unmarked: values.filter((value) => value === "Unmarked").length,
    };
  }, [staff, attendance]);

  function changeAttendance(id, value) {
    setAttendance((previous) => ({
      ...previous,
      [id]: value,
    }));

    setNotice("");
  }

  async function saveAttendance() {
    if (!staff.length) {
      setError("Save karne ke liye staff records nahi mile.");
      return;
    }

    const unmarked = staff.filter(
      (person) => !["Present", "Absent", "Leave"].includes(
        attendance[staffIdOf(person)]
      )
    );

    if (unmarked.length > 0) {
      setError(
        `${unmarked.length} staff member(s) ki attendance select nahi hui. Sabhi staff ki attendance select karein.`
      );
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const records = staff.map((person) => ({
        staffId: staffIdOf(person),
        date,
        status: attendance[staffIdOf(person)],
      }));

      // Existing backend check-in endpoint is used to save each staff record.
      // This expects the backend to upsert attendance by staffId + date.
      const results = await Promise.all(
        records.map(async (record) => {
          const response = await fetch(
            `${API_BASE}/api/staff-attendance/check-in`,
            {
              method: "POST",
              headers: getHeaders(true),
              body: JSON.stringify(record),
            }
          );

          return readResponse(response);
        })
      );

      setNotice(`Attendance saved successfully for ${results.length} staff members.`);
      await loadAttendance();
    } catch (err) {
      setError(
        `${err.message || "Attendance save nahi ho saki."} Backend check-in route aur request format verify karein.`
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Staff Attendance
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage daily staff attendance records
          </p>
        </div>

        <button
          type="button"
          onClick={loadAttendance}
          disabled={loading}
          className="flex items-center justify-center gap-2 self-start rounded-xl border bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Date picker */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border bg-white p-4">
        <label className="flex flex-col gap-2 text-xs font-bold text-slate-500">
          Attendance Date
          <input
            type="date"
            value={date}
            max={today()}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-xl border px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500"
          />
        </label>
      </div>

      {/* Error and success messages */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="break-words">{error}</p>
            <button
              type="button"
              onClick={loadAttendance}
              className="mt-2 font-bold underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          {notice}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Staff"
          value={stats.total}
          icon={Users}
          color="text-indigo-600"
        />

        <StatCard
          title="Present"
          value={stats.present}
          icon={CheckCircle2}
          color="text-green-600"
        />

        <StatCard
          title="Absent"
          value={stats.absent}
          icon={XCircle}
          color="text-red-600"
        />

        <StatCard
          title="Leave"
          value={stats.leave}
          icon={CalendarDays}
          color="text-orange-500"
        />
      </div>

      {/* Attendance table */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-800">
              Attendance Records
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {date}
              {stats.unmarked > 0 && (
                <span className="ml-2 text-orange-600">
                  · {stats.unmarked} unmarked
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border px-4 py-2">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search staff..."
              aria-label="Search staff"
              className="min-w-0 text-sm outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="px-6 py-4">Staff Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Attendance</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    Loading staff attendance...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    {staff.length === 0
                      ? "No active staff records found."
                      : "No staff match your search."}
                  </td>
                </tr>
              ) : (
                filteredStaff.map((person) => {
                  const id = staffIdOf(person);
                  const status = attendance[id] || "Unmarked";

                  return (
                    <tr
                      key={id}
                      className="border-t hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {staffName(person)}
                        {person.staffId && (
                          <p className="mt-1 text-xs font-normal text-slate-400">
                            ID: {person.staffId}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {person.designation || person.role || "—"}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {person.department || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={status}
                          onChange={(event) =>
                            changeAttendance(id, event.target.value)
                          }
                          className={`rounded-xl border px-4 py-2 outline-none focus:border-indigo-500 ${
                            status === "Present"
                              ? "border-green-200 bg-green-50 text-green-700"
                              : status === "Absent"
                              ? "border-red-200 bg-red-50 text-red-700"
                              : status === "Leave"
                              ? "border-orange-200 bg-orange-50 text-orange-700"
                              : "border-slate-300 bg-white text-slate-600"
                          }`}
                          aria-label={`Attendance for ${staffName(person)}`}
                        >
                          <option value="Unmarked">Select status</option>
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Leave">Leave</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t bg-slate-50 px-5 py-3 text-sm text-slate-500">
          Showing {filteredStaff.length} of {staff.length} staff members
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={saveAttendance}
          disabled={loading || saving || staff.length === 0}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {saving ? "Saving Attendance..." : "Save Attendance"}
        </button>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-slate-500">{title}</p>
        <Icon size={22} className={color} />
      </div>

      <h2 className={`mt-3 text-3xl font-black ${color}`}>{value}</h2>
    </div>
  );
}
