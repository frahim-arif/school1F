"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Fingerprint,
  RefreshCcw,
  Users,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Search,
  CalendarDays,
  MonitorCheck,
  ShieldCheck,
  LoaderCircle,
  Save,
  Download,
  Plus,
  X,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_URL = API_BASE.endsWith("/api")
  ? `${API_BASE}/biometric`
  : `${API_BASE}/api/biometric`;

const PERSON_TYPES = ["Teacher", "Student", "Staff"];
const EVENT_TYPES = ["Check In", "Check Out"];

function getToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getEventStyle(eventType) {
  return eventType === "Check In"
    ? "bg-green-100 text-green-700"
    : "bg-blue-100 text-blue-700";
}

function StatCard({ title, value, icon: Icon, color, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <div className={`rounded-xl bg-slate-50 p-2 ${color}`}>
          <Icon size={22} />
        </div>
      </div>
      <h2 className={`mt-3 text-3xl font-black ${color}`}>{value}</h2>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

const emptyForm = {
  personType: "Teacher",
  personId: "",
  personName: "",
  identifier: "",
  eventType: "Check In",
  timestamp: "",
  deviceId: "",
  deviceName: "",
  remarks: "",
};

export default function BiometricPage() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(getToday());
  const [filterEvent, setFilterEvent] = useState("All");
  const [filterPerson, setFilterPerson] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadLogs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");
    setNotice("");

    try {
      const params = new URLSearchParams();
      if (date) params.set("date", date);

      const response = await fetch(`${API_URL}?${params.toString()}`, {
        cache: "no-store",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Biometric attendance records load nahi hue."
        );
      }

      setLogs(Array.isArray(data.logs) ? data.logs : []);
    } catch (err) {
      setError(
        err.message ||
          "Backend se connection nahi ho raha. Server aur API URL check karein."
      );
      setLogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [date]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return logs.filter((log) => {
      const searchableText = [
        log.personName,
        log.personType,
        log.employeeId,
        log.admissionNo,
        log.deviceName,
        log.deviceId,
        log.eventType,
        log.source,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);
      const matchesEvent =
        filterEvent === "All" || log.eventType === filterEvent;
      const matchesPerson =
        filterPerson === "All" || log.personType === filterPerson;

      return matchesSearch && matchesEvent && matchesPerson;
    });
  }, [logs, search, filterEvent, filterPerson]);

  const summary = useMemo(() => {
    const people = new Set(
      logs.map((log) => `${log.personType}:${log.personId}`)
    );

    return {
      total: logs.length,
      checkIns: logs.filter((log) => log.eventType === "Check In").length,
      checkOuts: logs.filter((log) => log.eventType === "Check Out").length,
      deviceRecords: logs.filter((log) => log.source === "Device").length,
      people: people.size,
    };
  }, [logs]);

  function updateForm(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function saveLog(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!form.personId.trim() || !form.personName.trim()) {
      setError("Person ka MongoDB ID aur naam enter karein.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        personType: form.personType,
        personId: form.personId.trim(),
        personName: form.personName.trim(),
        eventType: form.eventType,
        source: "Manual",
        remarks: form.remarks.trim(),
        deviceId: form.deviceId.trim(),
        deviceName: form.deviceName.trim(),
      };

      const identifier = form.identifier.trim();

      if (form.personType === "Teacher" || form.personType === "Staff") {
        payload.employeeId = identifier;
      } else {
        payload.admissionNo = identifier;
      }

      if (form.timestamp) {
        payload.timestamp = new Date(form.timestamp).toISOString();
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Attendance record save nahi hua.");
      }

      setNotice("Attendance record successfully save ho gaya.");
      setForm(emptyForm);
      setShowForm(false);
      await loadLogs(true);
    } catch (err) {
      setError(err.message || "Attendance record save karne mein error aaya.");
    } finally {
      setSaving(false);
    }
  }

  function exportLogs() {
    if (!filteredLogs.length) {
      setNotice("Export karne ke liye koi record nahi hai.");
      return;
    }

    const headers = [
      "Name",
      "Person Type",
      "Employee ID",
      "Admission No",
      "Event",
      "Timestamp",
      "Source",
      "Device ID",
      "Device Name",
      "Remarks",
    ];

    const rows = filteredLogs.map((log) => [
      log.personName,
      log.personType,
      log.employeeId,
      log.admissionNo,
      log.eventType,
      log.timestamp,
      log.source,
      log.deviceId,
      log.deviceName,
      log.remarks,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `biometric-logs-${date || getToday()}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            <Fingerprint size={15} />
            ATTENDANCE MANAGEMENT
          </div>

          <h1 className="text-3xl font-black text-slate-800">
            Biometric Attendance
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View and manage attendance records from your School ERP backend.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm shadow-sm">
            <CalendarDays size={17} className="text-indigo-600" />
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="min-w-0 bg-transparent font-semibold text-slate-700 outline-none"
              aria-label="Attendance date"
            />
          </label>

          <button
            type="button"
            onClick={() => loadLogs(true)}
            disabled={loading || refreshing}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60"
          >
            <RefreshCcw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setShowForm((previous) => !previous)}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            {showForm ? <X size={17} /> : <Plus size={17} />}
            {showForm ? "Close Form" : "Add Record"}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {notice && (
        <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <p>{notice}</p>
        </div>
      )}

      {/* Add record form */}
      {showForm && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-black text-slate-800">
              Add Attendance Record
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manual entry only. This form does not scan fingerprints.
            </p>
          </div>

          <form onSubmit={saveLog} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm font-semibold text-slate-600">
              Person Type *
              <select
                value={form.personType}
                onChange={(event) => updateForm("personType", event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 font-normal outline-none focus:border-indigo-500"
              >
                {PERSON_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-semibold text-slate-600">
              MongoDB Person ID *
              <input
                value={form.personId}
                onChange={(event) => updateForm("personId", event.target.value)}
                placeholder="Person's actual _id"
                required
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-indigo-500"
              />
            </label>

            <label className="text-sm font-semibold text-slate-600">
              Person Name *
              <input
                value={form.personName}
                onChange={(event) => updateForm("personName", event.target.value)}
                placeholder="Full name"
                required
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-indigo-500"
              />
            </label>

            <label className="text-sm font-semibold text-slate-600">
              {form.personType === "Student"
                ? "Admission Number"
                : "Employee ID"}
              <input
                value={form.identifier}
                onChange={(event) => updateForm("identifier", event.target.value)}
                placeholder="Optional"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-indigo-500"
              />
            </label>

            <label className="text-sm font-semibold text-slate-600">
              Attendance Event *
              <select
                value={form.eventType}
                onChange={(event) => updateForm("eventType", event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 font-normal outline-none focus:border-indigo-500"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-semibold text-slate-600">
              Date &amp; Time
              <input
                type="datetime-local"
                value={form.timestamp}
                onChange={(event) => updateForm("timestamp", event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-indigo-500"
              />
            </label>

            <label className="text-sm font-semibold text-slate-600">
              Device ID
              <input
                value={form.deviceId}
                onChange={(event) => updateForm("deviceId", event.target.value)}
                placeholder="Optional"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-indigo-500"
              />
            </label>

            <label className="text-sm font-semibold text-slate-600">
              Device Name
              <input
                value={form.deviceName}
                onChange={(event) => updateForm("deviceName", event.target.value)}
                placeholder="Optional"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-indigo-500"
              />
            </label>

            <label className="text-sm font-semibold text-slate-600">
              Remarks
              <input
                value={form.remarks}
                onChange={(event) => updateForm("remarks", event.target.value)}
                placeholder="Optional remarks"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-indigo-500"
              />
            </label>

            <div className="flex items-end sm:col-span-2 lg:col-span-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}
                {saving ? "Saving..." : "Save Attendance"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Integration status */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <AlertCircle size={19} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-bold">Biometric device not configured</p>
          <p className="mt-1">
            This page loads saved backend records. Automatic fingerprint
            scanning and live device status require a compatible device
            integration. Records entered through this page are marked Manual.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Records"
          value={summary.total}
          icon={Fingerprint}
          color="text-indigo-600"
          description="Records for selected date"
        />
        <StatCard
          title="Check Ins"
          value={summary.checkIns}
          icon={CheckCircle2}
          color="text-green-600"
          description="Entry events"
        />
        <StatCard
          title="Check Outs"
          value={summary.checkOuts}
          icon={Clock3}
          color="text-blue-600"
          description="Exit events"
        />
        <StatCard
          title="Unique People"
          value={summary.people}
          icon={Users}
          color="text-purple-600"
          description="People with recorded events"
        />
      </div>

      {/* Device integration panel */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <MonitorCheck size={25} />
            </div>
            <div>
              <h2 className="font-black text-slate-800">
                Device Integration
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                API endpoint: /api/biometric
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
            <AlertCircle size={14} />
            Not configured
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <ShieldCheck size={18} className="text-indigo-600" />
              Backend connection
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {error
                ? "API request failed. Check the backend and endpoint."
                : loading
                  ? "Checking API response..."
                  : "API request completed successfully."}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <Fingerprint size={18} className="text-indigo-600" />
              Hardware connection
            </div>
            <p className="mt-2 text-sm text-slate-500">
              No hardware connection is configured. A compatible device and
              its integration details are required.
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Device-record count from selected date: {summary.deviceRecords}
        </p>
      </section>

      {/* Scan Logs */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-black text-slate-800">
              Biometric Attendance Logs
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Saved records for {date || "all dates"}.
            </p>
          </div>

          <button
            type="button"
            onClick={exportLogs}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <Download size={17} />
            Export CSV
          </button>
        </div>

        <div className="grid gap-3 p-5 md:grid-cols-3">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
            <Search size={17} className="shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, ID, device..."
              className="w-full py-3 text-sm outline-none"
            />
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
            <ShieldCheck size={17} className="shrink-0 text-slate-400" />
            <select
              value={filterEvent}
              onChange={(event) => setFilterEvent(event.target.value)}
              className="w-full bg-white py-3 text-sm outline-none"
            >
              <option value="All">All events</option>
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
            <Users size={17} className="shrink-0 text-slate-400" />
            <select
              value={filterPerson}
              onChange={(event) => setFilterPerson(event.target.value)}
              className="w-full bg-white py-3 text-sm outline-none"
            >
              <option value="All">All people</option>
              {PERSON_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">Person</th>
                <th className="px-5 py-4">Type / ID</th>
                <th className="px-5 py-4">Date &amp; Time</th>
                <th className="px-5 py-4">Event</th>
                <th className="px-5 py-4">Device</th>
                <th className="px-5 py-4">Source</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <LoaderCircle size={19} className="animate-spin" />
                      Loading attendance records...
                    </span>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    {error
                      ? "Backend se records load nahi hue. Error message check karein."
                      : "Is date/filter ke liye koi attendance record nahi mila."}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log._id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-700">
                          {(log.personName || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">
                            {log.personName || "Unnamed person"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {log.remarks || "No remarks"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      <p>{log.personType || "-"}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {log.employeeId || log.admissionNo || "-"}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {formatDateTime(log.timestamp)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${getEventStyle(
                          log.eventType
                        )}`}
                      >
                        {log.eventType || "Unknown"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      <p>{log.deviceName || "Not specified"}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {log.deviceId || "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
                          log.source === "Device"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {log.source || "Manual"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-200 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {filteredLogs.length} of {logs.length} loaded records
          </span>
          <span>Maximum 500 records per API request</span>
        </div>
      </section>
    </div>
  );
}