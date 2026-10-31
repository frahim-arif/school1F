
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  BookOpen,
  ClipboardList,
  Archive,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  Filter,
  AlertCircle,
  CheckCircle2,
  Save,
} from "lucide-react";

import { homeworkApi, fetchOptions } from "@/lib/homeworkApi";

const STATUS_FILTERS = ["all", "Active", "Archived"];

function getId(item) {
  if (!item) return "";
  if (typeof item === "string") return item;
  return item._id || item.id || "";
}

function getName(item) {
  if (!item) return "—";
  if (typeof item === "string") return item;

  return (
    item.name ||
    item.title ||
    item.className ||
    item.subjectName ||
    item.sectionName ||
    "—"
  );
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

function statusStyle(status) {
  return status === "Archived"
    ? "border-slate-200 bg-slate-100 text-slate-600"
    : "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>

        <div className={`rounded-lg p-3 ${color}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

export default function AllHomeworkPage() {
  const router = useRouter();

  const [homeworks, setHomeworks] = useState([]);
  const [stats, setStats] = useState({
    totalHomework: 0,
    activeHomework: 0,
    archivedHomework: 0,
    totalSubmissions: 0,
    pendingSubmissions: 0,
    checkedSubmissions: 0,
    averageMarks: 0,
  });

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [status, setStatus] = useState("Active");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selectedHomework, setSelectedHomework] = useState(null);
  const [editingHomework, setEditingHomework] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadHomeworks = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      try {
        const params = {
          search: search.trim(),
          status,
          page: "1",
          limit: "100",
        };

        if (classId) params.classId = classId;
        if (sectionId) params.sectionId = sectionId;
        if (subjectId) params.subjectId = subjectId;

        const [listResult, statsResult] = await Promise.all([
          homeworkApi.list(params),
          homeworkApi.stats(),
        ]);

        const listData = Array.isArray(listResult)
          ? listResult
          : listResult.data ?? listResult.items ?? [];

        setHomeworks(listData);
        setStats((previous) => ({
          ...previous,
          ...(statsResult.data ?? statsResult),
        }));
      } catch (err) {
        setError(err.message || "Homework list load nahi hui.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, status, classId, sectionId, subjectId]
  );

  useEffect(() => {
    async function loadFilters() {
      try {
        const [classData, sectionData, subjectData] = await Promise.all([
          fetchOptions("classes"),
          fetchOptions("sections"),
          fetchOptions("subjects"),
        ]);

        setClasses(classData);
        setSections(sectionData);
        setSubjects(subjectData);
      } catch (err) {
        setError(
          `Class/section/subject filters load nahi hue: ${err.message}`
        );
      }
    }

    loadFilters();
  }, []);

  useEffect(() => {
    loadHomeworks();
  }, [loadHomeworks]);

  const visibleSections = useMemo(() => {
    if (!classId) return sections;

    return sections.filter((section) => {
      const linkedClass =
        section.classId?._id ||
        section.classId ||
        section.class?._id ||
        section.class ||
        "";

      return !linkedClass || String(linkedClass) === String(classId);
    });
  }, [sections, classId]);

  function startEdit(item) {
    setEditingHomework(item);
    setSelectedHomework(null);

    setEditForm({
      title: item.title || "",
      subjectId: getId(item.subjectId),
      classId: getId(item.classId),
      sectionId: getId(item.sectionId),
      assignedDate: item.assignedDate
        ? new Date(item.assignedDate).toISOString().slice(0, 10)
        : "",
      dueDate: item.dueDate
        ? new Date(item.dueDate).toISOString().slice(0, 10)
        : "",
      description: item.description || "",
      status: item.status || "Active",
    });
  }

  async function saveEdit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (
      !editForm.title.trim() ||
      !editForm.subjectId ||
      !editForm.classId ||
      !editForm.sectionId ||
      !editForm.dueDate
    ) {
      setError("Title, subject, class, section aur due date required hain.");
      return;
    }

    setSavingEdit(true);

    try {
      await homeworkApi.update(editingHomework._id, {
        ...editForm,
        title: editForm.title.trim(),
        assignedDate: editForm.assignedDate
          ? new Date(`${editForm.assignedDate}T12:00:00`).toISOString()
          : editingHomework.assignedDate,
        dueDate: new Date(`${editForm.dueDate}T12:00:00`).toISOString(),
      });

      setEditingHomework(null);
      setNotice("Homework successfully update ho gaya.");
      await loadHomeworks(true);
    } catch (err) {
      setError(err.message || "Homework update nahi hua.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget?._id) return;

    setDeleting(true);
    setError("");
    setNotice("");

    try {
      await homeworkApi.remove(deleteTarget._id);
      setDeleteTarget(null);
      setNotice("Homework successfully delete ho gaya.");
      await loadHomeworks(true);
    } catch (err) {
      setError(err.message || "Homework delete nahi hua.");
    } finally {
      setDeleting(false);
    }
  }

  async function toggleArchive(item) {
    const nextStatus = item.status === "Archived" ? "Active" : "Archived";

    setError("");
    setNotice("");

    try {
      await homeworkApi.update(item._id, { status: nextStatus });
      setNotice(
        nextStatus === "Archived"
          ? "Homework archive ho gaya."
          : "Homework active ho gaya."
      );
      await loadHomeworks(true);
    } catch (err) {
      setError(err.message || "Homework status update nahi hua.");
    }
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
                <BookOpen size={23} />
              </div>

              <h1 className="text-2xl font-bold text-slate-900">
                All Homework
              </h1>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Saare assigned homework manage karein, details dekhein aur
              status update karein.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loadHomeworks(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/homework/create")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Plus size={18} />
              Create Homework
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => loadHomeworks()}
              className="font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {notice && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 size={18} />
            {notice}
            <button
              type="button"
              onClick={() => setNotice("")}
              className="ml-auto"
              aria-label="Dismiss notification"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total Homework"
            value={stats.totalHomework ?? 0}
            icon={ClipboardList}
            color="bg-indigo-50 text-indigo-700"
          />

          <StatCard
            title="Active Homework"
            value={stats.activeHomework ?? 0}
            icon={BookOpen}
            color="bg-emerald-50 text-emerald-700"
          />

          <StatCard
            title="Archived Homework"
            value={stats.archivedHomework ?? 0}
            icon={Archive}
            color="bg-slate-100 text-slate-600"
          />
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2 font-semibold text-slate-800">
            <Filter size={18} />
            Search & Filters
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <label className="text-sm font-medium text-slate-700">
                Search Homework
              </label>

              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Enter homework title..."
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Class
              </label>
              <select
                value={classId}
                onChange={(event) => {
                  setClassId(event.target.value);
                  setSectionId("");
                }}
                className={inputClass}
              >
                <option value="">All classes</option>
                {classes.map((item) => (
                  <option key={getId(item)} value={getId(item)}>
                    {getName(item)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Section
              </label>
              <select
                value={sectionId}
                onChange={(event) => setSectionId(event.target.value)}
                className={inputClass}
              >
                <option value="">All sections</option>
                {visibleSections.map((item) => (
                  <option key={getId(item)} value={getId(item)}>
                    {getName(item)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Subject
              </label>
              <select
                value={subjectId}
                onChange={(event) => setSubjectId(event.target.value)}
                className={inputClass}
              >
                <option value="">All subjects</option>
                {subjects.map((item) => (
                  <option key={getId(item)} value={getId(item)}>
                    {getName(item)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setStatus(item)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                    status === item
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {item === "all"
                    ? "All Statuses"
                    : item === "Active"
                    ? "Active"
                    : "Archived"}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setClassId("");
                setSectionId("");
                setSubjectId("");
                setStatus("all");
              }}
              className="text-sm font-semibold text-indigo-700 hover:underline"
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Homework table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
            <div>
              <h2 className="font-bold text-slate-900">
                Homework Records
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {homeworks.length} record(s) loaded
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-52 items-center justify-center gap-3 text-sm text-slate-500">
              <RefreshCw size={20} className="animate-spin" />
              Loading homework...
            </div>
          ) : homeworks.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
              <div className="rounded-full bg-slate-100 p-4 text-slate-400">
                <BookOpen size={30} />
              </div>
              <h3 className="mt-4 font-semibold text-slate-800">
                No homework found
              </h3>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                Is filter ke saath koi homework nahi mila. Filters clear karein
                ya naya homework create karein.
              </p>
              <button
                type="button"
                onClick={() => router.push("/admin/homework/create")}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Plus size={17} />
                Create Homework
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Homework</th>
                    <th className="px-5 py-4 font-semibold">Class</th>
                    <th className="px-5 py-4 font-semibold">Section</th>
                    <th className="px-5 py-4 font-semibold">Subject</th>
                    <th className="px-5 py-4 font-semibold">Assigned</th>
                    <th className="px-5 py-4 font-semibold">Due Date</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {homeworks.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {item.title}
                        </p>
                        <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                          {item.description || "No description"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {getName(item.classId)}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {getName(item.sectionId)}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {getName(item.subjectId)}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(item.assignedDate)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <CalendarDays
                            size={15}
                            className="text-slate-400"
                          />
                          {formatDate(item.dueDate)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle(
                            item.status
                          )}`}
                        >
                          {item.status || "Active"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            title="View details"
                            onClick={() => setSelectedHomework(item)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            title="Edit homework"
                            onClick={() => startEdit(item)}
                            className="rounded-lg border border-indigo-100 p-2 text-indigo-700 hover:bg-indigo-50"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            title={
                              item.status === "Archived"
                                ? "Activate homework"
                                : "Archive homework"
                            }
                            onClick={() => toggleArchive(item)}
                            className="rounded-lg border border-amber-100 p-2 text-amber-700 hover:bg-amber-50"
                          >
                            <Archive size={16} />
                          </button>

                          <button
                            type="button"
                            title="Delete homework"
                            onClick={() => setDeleteTarget(item)}
                            className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Details modal */}
      {selectedHomework && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Homework Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedHomework.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHomework(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  ["Class", getName(selectedHomework.classId)],
                  ["Section", getName(selectedHomework.sectionId)],
                  ["Subject", getName(selectedHomework.subjectId)],
                  ["Assigned Date", formatDate(selectedHomework.assignedDate)],
                  ["Due Date", formatDate(selectedHomework.dueDate)],
                  ["Status", selectedHomework.status || "Active"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-500">
                      {label}
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Description
                </p>
                <div className="mt-2 whitespace-pre-wrap rounded-lg border border-slate-200 p-4 text-sm leading-6 text-slate-600">
                  {selectedHomework.description || "No description provided."}
                </div>
              </div>

              {selectedHomework.attachment?.url && (
                <a
                  href={selectedHomework.attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:underline"
                >
                  <Eye size={16} />
                  {selectedHomework.attachment.name || "Open attachment"}
                </a>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedHomework(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(selectedHomework)}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <Pencil size={16} />
                  Edit Homework
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingHomework && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Edit Homework
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Homework details update karein.
                </p>
              </div>
              <button
                type="button"
                disabled={savingEdit}
                onClick={() => setEditingHomework(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveEdit} className="space-y-4 p-5">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Homework Title *
                </label>
                <input
                  required
                  value={editForm.title}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Class *
                  </label>
                  <select
                    required
                    value={editForm.classId}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        classId: event.target.value,
                        sectionId: "",
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="">Select class</option>
                    {classes.map((item) => (
                      <option key={getId(item)} value={getId(item)}>
                        {getName(item)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Section *
                  </label>
                  <select
                    required
                    value={editForm.sectionId}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        sectionId: event.target.value,
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="">Select section</option>
                    {sections.map((item) => (
                      <option key={getId(item)} value={getId(item)}>
                        {getName(item)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Subject *
                  </label>
                  <select
                    required
                    value={editForm.subjectId}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        subjectId: event.target.value,
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="">Select subject</option>
                    {subjects.map((item) => (
                      <option key={getId(item)} value={getId(item)}>
                        {getName(item)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Assigned Date
                  </label>
                  <input
                    type="date"
                    value={editForm.assignedDate}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        assignedDate: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.dueDate}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        dueDate: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      status: event.target.value,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={() => setEditingHomework(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {savingEdit ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={23} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Delete Homework?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              <strong>{deleteTarget.title}</strong> delete karne par backend
              controller ke mutabiq is homework ki associated submissions
              bhi delete ho jayengi. Yeh action undo nahi hoga.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting && (
                  <RefreshCw size={15} className="animate-spin" />
                )}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
