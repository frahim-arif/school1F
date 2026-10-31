
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  HiOutlineBookOpen,
  HiOutlineClipboardDocumentCheck,
  HiOutlineClock,
  HiOutlineChartBar,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowPath,
  HiOutlineArrowDownTray,
  HiOutlineCalendarDays,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineDocumentText,
} from "react-icons/hi2";

import { homeworkApi } from "@/lib/homeworkApi";

const initialStats = {
  totalHomework: 0,
  totalSubmissions: 0,
  pendingSubmissions: 0,
  checkedSubmissions: 0,
};

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
          <p className="mt-2 text-xs text-gray-500">{subtitle}</p>
        </div>

        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function getArray(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.data?.items)) return result.data.items;
  return [];
}

function getName(value, fallback = "—") {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return (
    value.name ||
    value.title ||
    value.className ||
    value.subjectName ||
    fallback
  );
}

function getHomeworkStatus(item) {
  if (item.status) return String(item.status);

  if (item.dueDate && new Date(item.dueDate) < new Date()) {
    return "Overdue";
  }

  return "Active";
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();

  let classes = "bg-blue-50 text-blue-700";

  if (
    normalized.includes("complete") ||
    normalized.includes("checked") ||
    normalized.includes("approved")
  ) {
    classes = "bg-emerald-50 text-emerald-700";
  } else if (
    normalized.includes("pending") ||
    normalized.includes("active")
  ) {
    classes = "bg-amber-50 text-amber-700";
  } else if (
    normalized.includes("overdue") ||
    normalized.includes("late")
  ) {
    classes = "bg-red-50 text-red-700";
  }

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>
      {status || "Unknown"}
    </span>
  );
}

export default function HomeworkReportsPage() {
  const [homework, setHomework] = useState([]);
  const [stats, setStats] = useState(initialStats);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = async () => {
    setLoading(true);
    setError("");

    try {
      const [listResult, statsResult] = await Promise.all([
        homeworkApi.list({ status: "all", limit: 500 }),
        homeworkApi.stats(),
      ]);

      const list = getArray(listResult);
      const statsData = statsResult?.data ?? statsResult ?? {};

      setHomework(list);
      setStats({
        totalHomework: Number(
          statsData.totalHomework ?? list.length
        ),
        totalSubmissions: Number(
          statsData.totalSubmissions ??
          statsData.submissions ??
          0
        ),
        pendingSubmissions: Number(
          statsData.pendingSubmissions ?? 0
        ),
        checkedSubmissions: Number(
          statsData.checkedSubmissions ?? 0
        ),
      });
    } catch (err) {
      setError(
        err.message ||
          "Reports load nahi ho sake. Backend API check karein."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const filteredHomework = useMemo(() => {
    const query = search.trim().toLowerCase();

    return homework.filter((item) => {
      const title = String(item.title || "").toLowerCase();
      const subject = getName(item.subject, item.subjectName).toLowerCase();
      const className = getName(item.class, item.className).toLowerCase();
      const section = getName(item.section, item.sectionName).toLowerCase();
      const status = getHomeworkStatus(item).toLowerCase();

      const matchesSearch =
        !query ||
        title.includes(query) ||
        subject.includes(query) ||
        className.includes(query) ||
        section.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [homework, search, statusFilter]);

  const completionRate =
    stats.totalSubmissions > 0
      ? Math.round(
          (stats.checkedSubmissions / stats.totalSubmissions) * 100
        )
      : 0;

  const exportCSV = () => {
    const headers = [
      "Homework Title",
      "Subject",
      "Class",
      "Section",
      "Assigned Date",
      "Due Date",
      "Status",
    ];

    const rows = filteredHomework.map((item) => [
      item.title || "",
      getName(item.subject, item.subjectName),
      getName(item.class, item.className),
      getName(item.section, item.sectionName),
      formatDate(item.assignedDate),
      formatDate(item.dueDate),
      getHomeworkStatus(item),
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "homework-reports.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <Link
                href="/admin/homework"
                className="transition hover:text-emerald-700"
              >
                Homework
              </Link>
              <span>/</span>
              <span className="font-medium text-emerald-700">
                Reports
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Homework Reports
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Homework activity, submission progress aur due dates ka overview.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadReports}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:opacity-50"
            >
              <HiOutlineArrowPath
                size={18}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={exportCSV}
              disabled={filteredHomework.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HiOutlineArrowDownTray size={18} />
              Export CSV
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-2">
              <HiOutlineExclamationCircle
                size={21}
                className="mt-0.5 shrink-0"
              />
              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={loadReports}
              className="shrink-0 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* STAT CARDS */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Homework"
            value={loading ? "—" : stats.totalHomework}
            subtitle="Homework records"
            icon={HiOutlineBookOpen}
            color="bg-emerald-50 text-emerald-700"
          />

          <StatCard
            title="Total Submissions"
            value={loading ? "—" : stats.totalSubmissions}
            subtitle="Recorded student submissions"
            icon={HiOutlineClipboardDocumentCheck}
            color="bg-blue-50 text-blue-700"
          />

          <StatCard
            title="Pending Submissions"
            value={loading ? "—" : stats.pendingSubmissions}
            subtitle="Awaiting review"
            icon={HiOutlineClock}
            color="bg-amber-50 text-amber-700"
          />

          <StatCard
            title="Checked Submissions"
            value={loading ? "—" : stats.checkedSubmissions}
            subtitle={`${completionRate}% of recorded submissions checked`}
            icon={HiOutlineChartBar}
            color="bg-purple-50 text-purple-700"
          />
        </section>

        {/* PROGRESS */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-gray-900">
                Submission Review Progress
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Recorded submissions mein se kitni check ho chuki hain.
              </p>
            </div>

            <p className="text-2xl font-bold text-emerald-700">
              {loading ? "—" : `${completionRate}%`}
            </p>
          </div>

          <div
            className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100"
            role="progressbar"
            aria-label="Submission review progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={completionRate}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>

          <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-gray-500">
            <span>
              Checked: {loading ? "—" : stats.checkedSubmissions}
            </span>
            <span>
              Pending: {loading ? "—" : stats.pendingSubmissions}
            </span>
          </div>
        </section>

        {/* HOMEWORK TABLE */}
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  Homework Summary
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Har homework ki class, subject aur due date dekhein.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <HiOutlineMagnifyingGlass
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search homework..."
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:w-64"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter homework by status"
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="overdue">Overdue</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Homework</th>
                  <th className="px-5 py-4 font-semibold">Subject</th>
                  <th className="px-5 py-4 font-semibold">Class / Section</th>
                  <th className="px-5 py-4 font-semibold">Assigned</th>
                  <th className="px-5 py-4 font-semibold">Due Date</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-14 text-center text-gray-500"
                    >
                      <HiOutlineArrowPath
                        size={24}
                        className="mx-auto mb-2 animate-spin text-emerald-600"
                      />
                      Loading homework reports...
                    </td>
                  </tr>
                ) : filteredHomework.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center">
                      <HiOutlineDocumentText
                        size={32}
                        className="mx-auto mb-3 text-gray-300"
                      />
                      <p className="font-semibold text-gray-700">
                        No homework found
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Search/filter change karein ya naya homework create karein.
                      </p>
                      <Link
                        href="/admin/homework/create"
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white transition hover:bg-emerald-800"
                      >
                        <HiOutlineBookOpen size={17} />
                        Create Homework
                      </Link>
                    </td>
                  </tr>
                ) : (
                  filteredHomework.map((item) => (
                    <tr
                      key={item._id || item.id || item.title}
                      className="transition hover:bg-emerald-50/30"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">
                          {item.title || "Untitled Homework"}
                        </p>
                        {item.description && (
                          <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                            {item.description}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {getName(item.subject, item.subjectName)}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        <p>{getName(item.class, item.className)}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          Section: {getName(item.section, item.sectionName)}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        <span className="inline-flex items-center gap-1.5">
                          <HiOutlineCalendarDays
                            size={16}
                            className="text-gray-400"
                          />
                          {formatDate(item.assignedDate || item.createdAt)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {formatDate(item.dueDate)}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={getHomeworkStatus(item)} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredHomework.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-gray-100 px-5 py-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {filteredHomework.length} of {homework.length} homework records
              </span>
              <span>
                <HiOutlineCheckCircle
                  size={15}
                  className="mr-1 inline text-emerald-600"
                />
                Data from your homework API
              </span>
            </div>
          )}
        </section>

        {/* QUICK LINKS */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/admin/homework"
            className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                <HiOutlineBookOpen size={22} />
              </div>
              <div>
                <h3 className="font-bold">Homework Dashboard</h3>
                <p className="mt-1 text-sm text-gray-500">
                  View and manage homework
                </p>
              </div>
            </div>
            <span className="text-xl text-gray-400 transition group-hover:translate-x-1 group-hover:text-emerald-700">
              →
            </span>
          </Link>

          <Link
            href="/admin/homework/submitted"
            className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                <HiOutlineClipboardDocumentCheck size={22} />
              </div>
              <div>
                <h3 className="font-bold">Submitted Homework</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Review student submissions
                </p>
              </div>
            </div>
            <span className="text-xl text-gray-400 transition group-hover:translate-x-1 group-hover:text-emerald-700">
              →
            </span>
          </Link>
        </section>
      </div>
    </main>
  );
}
