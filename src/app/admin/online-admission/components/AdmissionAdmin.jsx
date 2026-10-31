
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  Eye,
  Save,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Settings,
  BarChart3,
} from "lucide-react";

const API_BASE = (() => {
  const base = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
  ).replace(/\/+$/, "");

  return base.endsWith("/api") ? base : `${base}/api`;
})();

const CLASSES = [
  "Nursery",
  "LKG",
  "UKG",
  ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`),
];

const STATUS_COLORS = {
  Pending: "bg-amber-100 text-amber-800",
  "Under Review": "bg-blue-100 text-blue-800",
  Approved: "bg-emerald-100 text-emerald-800",
  Rejected: "bg-red-100 text-red-800",
};

const EMPTY_SETTINGS = {
  academicSession: "2026-2027",
  isOpen: false,
  allowedClasses: ["Nursery", "LKG", "UKG", "Class 1"],
  instructions: "",
  startDate: "",
  endDate: "",
};

async function apiRequest(path, options = {}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("adminToken") ||
        localStorage.getItem("token")
      : "";

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || data._message || "Request failed. Please try again."
    );
  }

  if (data._status === false) {
    throw new Error(data._message || "Request failed.");
  }

  return data;
}

function getData(response) {
  return response?._data ?? response?.data ?? response;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function getStudentName(application) {
  return (
    application?.student?.fullName ||
    application?.student?.name ||
    application?.studentName ||
    "Unnamed Student"
  );
}

function getClassName(application) {
  return (
    application?.admission?.className ||
    application?.className ||
    "—"
  );
}

function getApplicationNumber(application) {
  return application?.applicationNumber || application?._id || "—";
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${
        STATUS_COLORS[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status || "Pending"}
    </span>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value ?? 0}
          </p>
        </div>
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, description, children }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </div>
  );
}

function ApplicationTable({ applications, onView, loading }) {
  if (loading) {
    return (
      <div className="p-10 text-center text-slate-500">
        Loading applications...
      </div>
    );
  }

  if (!applications.length) {
    return (
      <div className="p-10 text-center">
        <FileText className="mx-auto mb-3 text-slate-300" size={38} />
        <p className="font-semibold text-slate-700">
          No applications found
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Applications will appear here when available.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-5 py-4">Application No.</th>
            <th className="px-5 py-4">Student</th>
            <th className="px-5 py-4">Class</th>
            <th className="px-5 py-4">Session</th>
            <th className="px-5 py-4">Submitted</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4">Action</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {applications.map((application) => (
            <tr
              key={application._id || application.applicationNumber}
              className="hover:bg-slate-50"
            >
              <td className="px-5 py-4 font-semibold text-slate-800">
                {getApplicationNumber(application)}
              </td>
              <td className="px-5 py-4">
                <p className="font-semibold text-slate-800">
                  {getStudentName(application)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {application?.student?.dateOfBirth
                    ? formatDate(application.student.dateOfBirth)
                    : ""}
                </p>
              </td>
              <td className="px-5 py-4">{getClassName(application)}</td>
              <td className="px-5 py-4">
                {application.academicSession || "—"}
              </td>
              <td className="px-5 py-4">
                {formatDate(application.createdAt)}
              </td>
              <td className="px-5 py-4">
                <StatusBadge status={application.status} />
              </td>
              <td className="px-5 py-4">
                <button
                  onClick={() => onView(application)}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Eye size={15} />
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function AdmissionAdmin({ mode = "dashboard" }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [stats, setStats] = useState({});
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [selected, setSelected] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [newStatus, setNewStatus] = useState("Under Review");

  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [settingsId, setSettingsId] = useState(null);
  const [newClass, setNewClass] = useState("Class 2");
  const [report, setReport] = useState({});

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (mode === "dashboard") {
        const response = await apiRequest(
          "/online-admission/dashboard"
        );
        const data = getData(response) || {};

        setStats(data.stats || data.counts || data);
        setApplications(
          data.recentApplications || data.recent || data.applications || []
        );
      } else if (
        ["applications", "review", "approved", "rejected"].includes(mode)
      ) {
        const params = new URLSearchParams();
        params.set("page", String(pagination.page));
        params.set("limit", "10");

        if (search.trim()) params.set("search", search.trim());
        if (classFilter) params.set("className", classFilter);
        if (sessionFilter) params.set("session", sessionFilter);

        if (mode === "review") {
          params.set("status", "Under Review");
        } else if (mode === "approved") {
          params.set("status", "Approved");
        } else if (mode === "rejected") {
          params.set("status", "Rejected");
        } else if (statusFilter) {
          params.set("status", statusFilter);
        }

        const response = await apiRequest(
          `/online-admission?${params.toString()}`
        );
        const data = getData(response) || {};

        setApplications(
          Array.isArray(data)
            ? data
            : data.applications || data.results || []
        );

        setPagination((current) => ({
          ...current,
          page: Number(data.page || pagination.page),
          totalPages: Number(data.totalPages || 1),
          total: Number(data.total ?? data.count ?? 0),
        }));
      } else if (mode === "settings") {
        const response = await apiRequest("/admission-settings");
        const data = getData(response);
        const list = Array.isArray(data)
          ? data
          : data?.settings
            ? data.settings
            : data
              ? [data]
              : [];

        if (list.length) {
          const item =
            list.find(
              (entry) =>
                entry.academicSession === settings.academicSession
            ) || list[0];

          setSettingsId(item._id || null);
          setSettings({
            ...EMPTY_SETTINGS,
            ...item,
            startDate: item.startDate
              ? String(item.startDate).slice(0, 10)
              : "",
            endDate: item.endDate
              ? String(item.endDate).slice(0, 10)
              : "",
            allowedClasses: item.allowedClasses || [],
          });
        }
      } else if (mode === "reports") {
        const response = await apiRequest("/online-admission/reports");
        setReport(getData(response) || {});
      }
    } catch (err) {
      setError(err.message || "Unable to load data.");
    } finally {
      setLoading(false);
    }
  }, [
    mode,
    pagination.page,
    search,
    classFilter,
    sessionFilter,
    statusFilter,
    settings.academicSession,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openApplication = (application) => {
    setSelected(application);
    setRemarks(application.adminRemarks || "");
    setNewStatus(
      application.status === "Pending"
        ? "Under Review"
        : application.status || "Under Review"
    );
    setError("");
    setSuccess("");
  };

  const updateApplication = async () => {
    if (!selected?._id && !selected?.applicationNumber) {
      setError("Application ID is missing.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const id = encodeURIComponent(
        selected._id || selected.applicationNumber
      );

      await apiRequest(`/online-admission/${id}/review`, {
        method: "PATCH",
        body: JSON.stringify({
          status: newStatus,
          adminRemarks: remarks,
        }),
      });

      setSelected(null);
      setSuccess("Application updated successfully.");
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to update application.");
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...settings,
        startDate: settings.startDate || null,
        endDate: settings.endDate || null,
      };

      await apiRequest(
        settingsId
          ? `/admission-settings/${settingsId}`
          : "/admission-settings",
        {
          method: settingsId ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      );

      setSuccess("Admission settings saved successfully.");
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = () => {
    const columns = [
      "Application Number",
      "Student Name",
      "Class",
      "Session",
      "Status",
      "Submitted",
    ];

    const rows = applications.map((app) => [
      getApplicationNumber(app),
      getStudentName(app),
      getClassName(app),
      app.academicSession || "",
      app.status || "Pending",
      app.createdAt || "",
    ]);

    const csv = [columns, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = `admission-${mode}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const updateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const addClass = () => {
    if (
      newClass &&
      !settings.allowedClasses.includes(newClass)
    ) {
      updateSetting("allowedClasses", [
        ...settings.allowedClasses,
        newClass,
      ]);
    }
  };

  const removeClass = (className) => {
    updateSetting(
      "allowedClasses",
      settings.allowedClasses.filter((item) => item !== className)
    );
  };

  const pageTitles = {
    dashboard: ["Admission Dashboard", "Overview of online admission activity."],
    applications: ["Admission Applications", "Search and manage student applications."],
    review: ["Review Applications", "Check applications awaiting review."],
    approved: ["Approved Applications", "View applications approved by the administration."],
    rejected: ["Rejected Applications", "View applications marked as rejected."],
    settings: ["Admission Form Settings", "Configure sessions, classes and admission dates."],
    reports: ["Admission Reports", "Review application totals and class-wise statistics."],
  };

  const [title, description] = pageTitles[mode] || pageTitles.dashboard;

  const stat = (keys) => {
    for (const key of keys) {
      if (stats[key] !== undefined) return stats[key];
    }
    return 0;
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <SectionHeader title={title} description={description}>
        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </SectionHeader>

      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {success}
        </div>
      )}

      {mode === "dashboard" && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Applications"
              value={stat(["total", "totalApplications", "all"])}
              icon={Users}
              color="bg-blue-50 text-blue-700"
            />
            <StatCard
              title="Pending"
              value={stat(["pending", "pendingApplications"])}
              icon={Clock}
              color="bg-amber-50 text-amber-700"
            />
            <StatCard
              title="Approved"
              value={stat(["approved", "approvedApplications"])}
              icon={CheckCircle2}
              color="bg-emerald-50 text-emerald-700"
            />
            <StatCard
              title="Rejected"
              value={stat(["rejected", "rejectedApplications"])}
              icon={XCircle}
              color="bg-red-50 text-red-700"
            />
          </div>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="font-bold text-slate-900">Recent Applications</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Latest submitted admission forms
                </p>
              </div>
              <FileText className="text-slate-400" />
            </div>

            <ApplicationTable
              applications={applications}
              loading={loading}
              onView={openApplication}
            />
          </section>
        </>
      )}

      {["applications", "review", "approved", "rejected"].includes(mode) && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPagination((current) => ({ ...current, page: 1 }));
                }}
                placeholder="Search name or application number..."
                className={`${inputClass} pl-9`}
              />
            </div>

            <select
              value={classFilter}
              onChange={(event) => {
                setClassFilter(event.target.value);
                setPagination((current) => ({ ...current, page: 1 }));
              }}
              className={`${inputClass} lg:w-44`}
            >
              <option value="">All Classes</option>
              {CLASSES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <input
              value={sessionFilter}
              onChange={(event) => {
                setSessionFilter(event.target.value);
                setPagination((current) => ({ ...current, page: 1 }));
              }}
              placeholder="Academic session"
              className={`${inputClass} lg:w-44`}
            />

            {mode === "applications" && (
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPagination((current) => ({ ...current, page: 1 }));
                }}
                className={`${inputClass} lg:w-44`}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            )}

            <button
              onClick={exportCSV}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>

          <ApplicationTable
            applications={applications}
            loading={loading}
            onView={openApplication}
          />

          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 p-4 sm:flex-row">
            <p className="text-sm text-slate-500">
              Total records: {pagination.total}
            </p>
            <div className="flex items-center gap-3">
              <button
                disabled={pagination.page <= 1 || loading}
                onClick={() =>
                  setPagination((current) => ({
                    ...current,
                    page: current.page - 1,
                  }))
                }
                className="rounded-md border border-slate-300 p-2 disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-slate-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={
                  pagination.page >= pagination.totalPages || loading
                }
                onClick={() =>
                  setPagination((current) => ({
                    ...current,
                    page: current.page + 1,
                  }))
                }
                className="rounded-md border border-slate-300 p-2 disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </section>
      )}

      {mode === "settings" && (
        <form
          onSubmit={saveSettings}
          className="max-w-4xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-700">
              <Settings size={22} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Admission Configuration</h2>
              <p className="text-sm text-slate-500">
                Set up the online admission form.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Academic Session">
              <input
                required
                value={settings.academicSession}
                onChange={(e) => updateSetting("academicSession", e.target.value)}
                placeholder="2026-2027"
                className={inputClass}
              />
            </Field>

            <Field label="Admission Status">
              <select
                value={settings.isOpen ? "open" : "closed"}
                onChange={(e) =>
                  updateSetting("isOpen", e.target.value === "open")
                }
                className={inputClass}
              >
                <option value="closed">Closed</option>
                <option value="open">Open</option>
              </select>
            </Field>

            <Field label="Admission Start Date">
              <input
                type="date"
                value={settings.startDate}
                onChange={(e) => updateSetting("startDate", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Admission End Date">
              <input
                type="date"
                value={settings.endDate}
                onChange={(e) => updateSetting("endDate", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="mt-6">
            <Field label="Available Classes">
              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  className={inputClass}
                >
                  {CLASSES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addClass}
                  className="rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  Add Class
                </button>
              </div>
            </Field>

            <div className="mt-3 flex flex-wrap gap-2">
              {settings.allowedClasses.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeClass(item)}
                    className="font-bold text-red-600"
                    aria-label={`Remove ${item}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Field label="Instructions for Applicants">
              <textarea
                rows={4}
                value={settings.instructions}
                onChange={(e) => updateSetting("instructions", e.target.value)}
                placeholder="Enter admission instructions..."
                className={inputClass}
              />
            </Field>
          </div>

          <div className="mt-7 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              <Save size={17} />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      )}

      {mode === "reports" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <BarChart3 className="text-blue-700" />
              <h2 className="font-bold text-slate-900">Applications by Status</h2>
            </div>

            {loading ? (
              <p className="text-sm text-slate-500">Loading report...</p>
            ) : (
              <div className="space-y-4">
                {(report.byStatus || report.statusCounts || []).length ? (
                  (report.byStatus || report.statusCounts).map((item) => (
                    <div
                      key={item._id || item.status}
                      className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3"
                    >
                      <StatusBadge status={item._id || item.status} />
                      <span className="font-bold text-slate-900">
                        {item.count ?? item.total ?? 0}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No status report data returned by the API.
                  </p>
                )}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <Users className="text-blue-700" />
              <h2 className="font-bold text-slate-900">Applications by Class</h2>
            </div>

            {loading ? (
              <p className="text-sm text-slate-500">Loading report...</p>
            ) : (
              <div className="space-y-4">
                {(report.byClass || report.classCounts || []).length ? (
                  (report.byClass || report.classCounts).map((item) => (
                    <div
                      key={item._id || item.className}
                      className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3"
                    >
                      <span className="text-sm text-slate-700">
                        {item._id || item.className}
                      </span>
                      <span className="font-bold text-slate-900">
                        {item.count ?? item.total ?? 0}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No class report data returned by the API.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Application Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {getApplicationNumber(selected)}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-md px-3 py-2 text-xl text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {[
                ["Student Name", getStudentName(selected)],
                ["Class", getClassName(selected)],
                ["Academic Session", selected.academicSession || "—"],
                ["Status", selected.status || "Pending"],
                ["Date of Birth", formatDate(selected.student?.dateOfBirth)],
                ["Gender", selected.student?.gender || "—"],
                ["Parent/Guardian", selected.parents?.fatherName || selected.parents?.guardianName || "—"],
                ["Mobile", selected.parents?.mobile || selected.parents?.phone || "—"],
                ["Email", selected.parents?.email || "—"],
                ["Address", selected.address?.fullAddress || selected.address?.address || "—"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    {label}
                  </p>
                  <p className="mt-1 break-words text-sm font-medium text-slate-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t border-slate-200 p-5">
              <Field label="Application Status">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className={inputClass}
                >
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </Field>

              <Field label="Admin Remarks">
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter review remarks..."
                  className={inputClass}
                />
              </Field>

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={updateApplication}
                  disabled={saving}
                  className="rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Review"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
