
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  School,
  Phone,
  Mail,
  Download,
  Printer,
  CheckCircle2,
  XCircle,
  Clock3,
  Plane,
  Calendar,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/+$/, "");

const API_ROOT = API_BASE.endsWith("/api")
  ? API_BASE
  : `${API_BASE}/api`;

const STATUS_STYLES = {
  Present: "bg-emerald-500 text-white",
  Absent: "bg-red-500 text-white",
  Late: "bg-yellow-500 text-white",
  "Half Day": "bg-orange-500 text-white",
  Leave: "bg-blue-500 text-white",
};

const STATUS_BADGES = {
  Present: "bg-emerald-100 text-emerald-700",
  Absent: "bg-red-100 text-red-700",
  Late: "bg-yellow-100 text-yellow-700",
  "Half Day": "bg-orange-100 text-orange-700",
  Leave: "bg-blue-100 text-blue-700",
};

function getDateKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function formatDate(date) {
  if (!date) return "--";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function AttendanceCard({ title, value, icon, color }) {
  const colors = {
    emerald: "bg-emerald-500",
    red: "bg-red-500",
    amber: "bg-yellow-500",
    blue: "bg-blue-500",
    orange: "bg-orange-500",
  };

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h2 className="mt-3 text-3xl font-black text-slate-800">
            {value}
          </h2>
        </div>

        <div
          className={`${colors[color] || colors.emerald} rounded-2xl p-4 text-white`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function StudentAttendancePage() {
  const params = useParams();
  const router = useRouter();

  const studentId = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [student, setStudent] = useState(null);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({
    Present: 0,
    Absent: 0,
    Late: 0,
    "Half Day": 0,
    Leave: 0,
  });

  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();

    return `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!studentId) {
      setError("Student ID URL mein nahi mila.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [studentResponse, year, month] = [
        await fetch(`${API_ROOT}/students/${studentId}`),
        ...selectedMonth.split("-").map(Number),
      ];

      const studentData = await studentResponse.json();

      if (!studentResponse.ok || !studentData.success) {
        throw new Error(
          studentData.message || "Student details load nahi hui."
        );
      }

      setStudent(studentData.student);

      const attendanceResponse = await fetch(
        `${API_ROOT}/attendance/student/${studentId}?month=${month}&year=${year}`
      );

      const attendanceData = await attendanceResponse.json();

      if (!attendanceResponse.ok || !attendanceData.success) {
        throw new Error(
          attendanceData.message || "Attendance data load nahi hua."
        );
      }

      setRecords(attendanceData.records || []);
      setSummary(
        attendanceData.summary || {
          Present: 0,
          Absent: 0,
          Late: 0,
          "Half Day": 0,
          Leave: 0,
        }
      );

      setAttendancePercentage(
        attendanceData.attendancePercentage || 0
      );
    } catch (err) {
      setError(
        err.message ||
          "Backend se data load nahi hua. Backend server check karein."
      );
    } finally {
      setLoading(false);
    }
  }, [studentId, selectedMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const [year, month] = selectedMonth.split("-").map(Number);

  const daysInMonth = new Date(year, month, 0).getDate();

  const firstWeekday = new Date(
    Date.UTC(year, month - 1, 1)
  ).getUTCDay();

  const attendanceByDay = useMemo(() => {
    const map = new Map();

    records.forEach((record) => {
      map.set(getDateKey(record.date), record);
    });

    return map;
  }, [records]);

  const workingDays =
    (summary.Present || 0) +
    (summary.Absent || 0) +
    (summary.Late || 0) +
    (summary["Half Day"] || 0);

  const displayName = student
    ? `${student.firstName || ""} ${student.lastName || ""}`.trim()
    : "";

  const downloadReport = () => {
    const headings = ["Date", "Status", "Remarks"];

    const rows = records.map((record) => [
      formatDate(record.date),
      record.status || "",
      record.remarks || "",
    ]);

    const escapeCSV = (value) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [headings, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `attendance-${student?.admissionNo || studentId}-${selectedMonth}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex items-center gap-3 text-emerald-700">
          <RefreshCw className="animate-spin" size={22} />
          <span className="font-semibold">
            Attendance data load ho raha hai...
          </span>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="space-y-5 rounded-3xl border bg-white p-8 shadow-sm">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-emerald-600"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-5 text-red-700">
          <AlertCircle className="mt-0.5 shrink-0" size={22} />
          <div>
            <h2 className="font-bold">Data load nahi hua</h2>
            <p className="mt-1 text-sm">{error || "Student nahi mila."}</p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          <RefreshCw size={18} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-slate-600 hover:text-emerald-600"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <h1 className="text-3xl font-black text-slate-800">
            Student Attendance
          </h1>

          <p className="mt-2 text-slate-500">
            Individual attendance details
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl border px-5 py-3 hover:bg-slate-100"
          >
            <Printer size={18} />
            Print
          </button>

          <button
            onClick={downloadReport}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-white hover:bg-emerald-700"
          >
            <Download size={18} />
            Download CSV
          </button>
        </div>
      </div>

      {/* Student Profile */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center">
            {student.photo ? (
              <img
                src={student.photo}
                alt={displayName}
                className="h-32 w-32 rounded-full border-4 border-emerald-100 object-cover"
              />
            ) : (
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || "Student")}&size=200`}
                alt={displayName}
                className="h-32 w-32 rounded-full border-4 border-emerald-100"
              />
            )}

            <h2 className="mt-5 text-center text-2xl font-black">
              {displayName || "Student"}
            </h2>

            <p className="text-slate-500">
              {student.admissionNo || "--"}
            </p>

            <span
              className={`mt-3 rounded-full px-3 py-1 text-xs font-bold ${
                student.status === "Active"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {student.status || "Unknown"}
            </span>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <School size={20} className="shrink-0 text-emerald-600" />
              <span>
                {student.className || "--"} - {student.section || "--"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <User size={20} className="shrink-0 text-blue-600" />
              <span>Father: {student.fatherName || "--"}</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone size={20} className="shrink-0 text-purple-600" />
              <span>{student.phone || "--"}</span>
            </div>

            <div className="flex items-center gap-3">
              <Mail size={20} className="shrink-0 text-red-600" />
              <span className="break-all">{student.email || "--"}</span>
            </div>

            <div className="flex items-center gap-3">
              <Calendar size={20} className="shrink-0 text-amber-600" />
              <span>Roll No: {student.rollNo ?? "--"}</span>
            </div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="lg:col-span-2">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <AttendanceCard
              title="Present"
              value={summary.Present || 0}
              color="emerald"
              icon={<CheckCircle2 size={22} />}
            />

            <AttendanceCard
              title="Absent"
              value={summary.Absent || 0}
              color="red"
              icon={<XCircle size={22} />}
            />

            <AttendanceCard
              title="Late"
              value={summary.Late || 0}
              color="amber"
              icon={<Clock3 size={22} />}
            />

            <AttendanceCard
              title="Leave"
              value={summary.Leave || 0}
              color="blue"
              icon={<Plane size={22} />}
            />

            <AttendanceCard
              title="Half Day"
              value={summary["Half Day"] || 0}
              color="orange"
              icon={<Clock3 size={22} />}
            />
          </div>

          <div className="mt-6 rounded-3xl border bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-black">
              Monthly Attendance
            </h2>

            <div className="mt-6">
              <div className="mb-3 flex justify-between gap-4">
                <span className="text-slate-600">
                  Attendance Percentage
                </span>

                <span className="font-black text-emerald-600">
                  {attendancePercentage}%
                </span>
              </div>

              <div
                className="h-4 overflow-hidden rounded-full bg-slate-200"
                role="progressbar"
                aria-valuenow={attendancePercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(0, attendancePercentage))}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-sm text-slate-500">
                {workingDays} attendance-counted days recorded this month.
                Leave days are shown separately.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Calendar */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border bg-white p-6 shadow-sm lg:col-span-2 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-800">
                Monthly Attendance
              </h2>
              <p className="mt-2 text-slate-500">
                Actual records from the database
              </p>
            </div>

            <input
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="mt-8 grid grid-cols-7 gap-2 sm:gap-3">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div
                  key={day}
                  className="py-2 text-center text-xs font-bold text-slate-500 sm:text-sm"
                >
                  {day}
                </div>
              )
            )}

            {Array.from({ length: firstWeekday }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dateKey = `${selectedMonth}-${String(day).padStart(2, "0")}`;
              const record = attendanceByDay.get(dateKey);
              const status = record?.status;

              return (
                <div
                  key={day}
                  title={
                    status
                      ? `${dateKey}: ${status}${record.remarks ? ` — ${record.remarks}` : ""}`
                      : `${dateKey}: No record`
                  }
                  className={`flex h-10 items-center justify-center rounded-lg text-sm font-bold sm:h-12 sm:rounded-xl ${
                    status
                      ? STATUS_STYLES[status] || "bg-slate-100 text-slate-600"
                      : "border border-dashed border-slate-200 bg-slate-50 text-slate-500"
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold sm:text-sm">
            {Object.entries(STATUS_STYLES).map(([status]) => (
              <div key={status} className="flex items-center gap-2">
                <span
                  className={`h-3 w-3 rounded-sm ${STATUS_STYLES[status].split(" ")[0]}`}
                />
                {status}
              </div>
            ))}

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm border border-dashed border-slate-400" />
              No Record
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black">Statistics</h2>

          <div className="mt-8 space-y-6">
            <div>
              <p className="text-slate-500">Recorded Attendance Days</p>
              <h3 className="mt-2 text-4xl font-black text-slate-800">
                {workingDays}
              </h3>
            </div>

            <div>
              <p className="text-slate-500">Present Days</p>
              <h3 className="mt-2 text-4xl font-black text-emerald-600">
                {summary.Present || 0}
              </h3>
            </div>

            <div>
              <p className="text-slate-500">Absent Days</p>
              <h3 className="mt-2 text-4xl font-black text-red-600">
                {summary.Absent || 0}
              </h3>
            </div>

            <div>
              <p className="text-slate-500">Late Days</p>
              <h3 className="mt-2 text-4xl font-black text-yellow-600">
                {summary.Late || 0}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="rounded-3xl border bg-white shadow-sm">
        <div className="border-b p-6">
          <h2 className="text-2xl font-black text-slate-800">
            Attendance History
          </h2>

          <p className="mt-2 text-slate-500">
            {records.length} records for the selected month
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-5 py-4 text-left">Date</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-center">In Time</th>
                <th className="px-5 py-4 text-center">Out Time</th>
                <th className="px-5 py-4 text-center">Remarks</th>
              </tr>
            </thead>

            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Is month ke liye attendance records nahi mile.
                  </td>
                </tr>
              ) : (
                [...records]
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() -
                      new Date(a.date).getTime()
                  )
                  .map((record) => (
                    <tr
                      key={record._id}
                      className="border-t hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4">
                        {formatDate(record.date)}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-block rounded-full px-4 py-2 text-sm font-bold ${
                            STATUS_BADGES[record.status] ||
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">--</td>
                      <td className="px-5 py-4 text-center">--</td>

                      <td className="px-5 py-4 text-center">
                        {record.remarks || "--"}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="flex flex-wrap justify-end gap-4">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl border px-5 py-3 hover:bg-slate-100"
        >
          <Printer size={18} />
          Print Report
        </button>

        <button
          onClick={downloadReport}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          <Download size={18} />
          Download CSV
        </button>
      </div>
    </div>
  );
}
