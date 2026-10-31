
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  LoaderCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Users,
  AlertCircle,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/+$/, "");

const API_URL = API_BASE.endsWith("/api")
  ? `${API_BASE}/departments`
  : `${API_BASE}/api/departments`;

const emptyForm = {
  name: "",
  code: "",
  description: "",
  status: "Active",
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const request = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  };

  const loadDepartments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await request(API_URL);
      const list = Array.isArray(data)
        ? data
        : data.departments || data.data || [];

      setDepartments(list);
    } catch (err) {
      setError(err.message || "Departments load nahi ho paye.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (department) => {
    setEditingId(department._id);
    setForm({
      name: department.name || "",
      code: department.code || "",
      description: department.description || "",
      status: department.status || "Active",
    });
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "code"
          ? value.toUpperCase().replace(/\s/g, "")
          : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!form.name.trim() || !form.code.trim()) {
      setError("Department name aur code dono required hain.");
      return;
    }

    setSaving(true);

    try {
      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      await request(url, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          code: form.code.trim().toUpperCase(),
          description: form.description.trim(),
          status: form.status,
        }),
      });

      setModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      setNotice(
        editingId
          ? "Department updated successfully."
          : "Department added successfully."
      );

      await loadDepartments();
    } catch (err) {
      setError(err.message || "Department save nahi hua.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (department) => {
    setError("");
    setNotice("");

    try {
      await request(`${API_URL}/${department._id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: department.name,
          code: department.code,
          description: department.description || "",
          status:
            department.status === "Active" ? "Inactive" : "Active",
        }),
      });

      setNotice("Department status updated.");
      await loadDepartments();
    } catch (err) {
      setError(err.message || "Status update nahi hua.");
    }
  };

  const handleDelete = async (department) => {
    const confirmed = window.confirm(
      `Kya aap "${department.name}" department delete karna chahte hain?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await request(`${API_URL}/${department._id}`, {
        method: "DELETE",
      });

      setNotice("Department deleted successfully.");
      await loadDepartments();
    } catch (err) {
      setError(err.message || "Department delete nahi hua.");
    }
  };

  const filteredDepartments = departments.filter((department) => {
    const term = search.trim().toLowerCase();

    return (
      (department.name || "").toLowerCase().includes(term) ||
      (department.code || "").toLowerCase().includes(term) ||
      (department.description || "").toLowerCase().includes(term)
    );
  });

  const activeCount = departments.filter(
    (department) => department.status === "Active"
  ).length;

  const inactiveCount = departments.length - activeCount;

  return (
    <div className="min-h-screen space-y-6 text-slate-800">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
            <Building2 size={17} />
            Teachers Management
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Departments
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            School departments ko manage karein.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-800"
        >
          <Plus size={18} />
          Add Department
        </button>
      </div>

      {/* Alerts */}
      {notice && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <span>{notice}</span>
          <button
            type="button"
            className="ml-auto"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {error && !modalOpen && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            className="ml-auto"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Departments"
          value={departments.length}
          icon={<Building2 size={21} />}
          color="emerald"
        />
        <StatCard
          title="Active Departments"
          value={activeCount}
          icon={<CheckCircle2 size={21} />}
          color="blue"
        />
        <StatCard
          title="Inactive Departments"
          value={inactiveCount}
          icon={<XCircle size={21} />}
          color="amber"
        />
      </div>

      {/* Department list */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="font-bold text-slate-900">All Departments</h2>
            <p className="mt-1 text-xs text-slate-500">
              {filteredDepartments.length} department(s) found
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1 sm:w-72">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search departments..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <button
              type="button"
              onClick={loadDepartments}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              title="Refresh"
              aria-label="Refresh departments"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-slate-500">
            <LoaderCircle
              size={30}
              className="animate-spin text-emerald-700"
            />
            <p className="text-sm">Loading departments...</p>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Building2 size={30} />
            </div>

            <h3 className="font-bold text-slate-800">
              {search ? "No matching departments" : "No departments yet"}
            </h3>

            <p className="mt-2 max-w-sm text-sm text-slate-500">
              {search
                ? "Search term change karke dobara try karein."
                : "Apne school ka pehla department add karein."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={openAddModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                <Plus size={17} />
                Add Department
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Department</th>
                    <th className="px-5 py-4 font-semibold">Code</th>
                    <th className="px-5 py-4 font-semibold">Description</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredDepartments.map((department) => (
                    <tr
                      key={department._id}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                            <Building2 size={19} />
                          </div>
                          <span className="font-semibold text-slate-800">
                            {department.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700">
                          {department.code}
                        </span>
                      </td>

                      <td className="max-w-xs px-5 py-4 text-slate-500">
                        <p className="line-clamp-2">
                          {department.description || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={department.status} />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <ActionButton
                            title={
                              department.status === "Active"
                                ? "Deactivate"
                                : "Activate"
                            }
                            onClick={() => toggleStatus(department)}
                            className="text-emerald-700 hover:bg-emerald-50"
                          >
                            {department.status === "Active" ? (
                              <XCircle size={17} />
                            ) : (
                              <CheckCircle2 size={17} />
                            )}
                          </ActionButton>

                          <ActionButton
                            title="Edit department"
                            onClick={() => openEditModal(department)}
                            className="text-blue-700 hover:bg-blue-50"
                          >
                            <Pencil size={17} />
                          </ActionButton>

                          <ActionButton
                            title="Delete department"
                            onClick={() => handleDelete(department)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={17} />
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="grid gap-3 p-3 md:hidden">
              {filteredDepartments.map((department) => (
                <div
                  key={department._id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <Building2 size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-bold text-slate-900">
                        {department.name}
                      </h3>
                      <p className="mt-1 font-mono text-xs text-slate-500">
                        {department.code}
                      </p>
                    </div>

                    <StatusBadge status={department.status} />
                  </div>

                  {department.description && (
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {department.description}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => toggleStatus(department)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      {department.status === "Active" ? (
                        <XCircle size={15} />
                      ) : (
                        <CheckCircle2 size={15} />
                      )}
                      {department.status === "Active"
                        ? "Deactivate"
                        : "Activate"}
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditModal(department)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 px-3 py-2 text-xs font-semibold text-blue-700"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(department)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add / Edit modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="department-modal-title"
            className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-emerald-800 to-emerald-700 px-5 py-4 text-white sm:px-6">
              <div>
                <h2
                  id="department-modal-title"
                  className="text-lg font-bold"
                >
                  {editingId ? "Edit Department" : "Add Department"}
                </h2>
                <p className="mt-1 text-xs text-emerald-100">
                  Department details enter karein
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 transition hover:bg-white/10 disabled:opacity-50"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="department-name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Department Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="department-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  placeholder="e.g. Science Department"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label
                  htmlFor="department-code"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Department Code <span className="text-red-500">*</span>
                </label>
                <input
                  id="department-code"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  required
                  maxLength={20}
                  placeholder="e.g. SCI"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label
                  htmlFor="department-description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Description
                </label>
                <textarea
                  id="department-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                  placeholder="Department ke baare mein likhein..."
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label
                  htmlFor="department-status"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Status
                </label>
                <select
                  id="department-status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <LoaderCircle size={17} className="animate-spin" />
                  )}
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Department"
                    : "Save Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            colors[color] || colors.emerald
          }`}
        >
          {icon}
        </div>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const active = status === "Active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {status || "Inactive"}
    </span>
  );
}

function ActionButton({ children, title, onClick, className }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${className}`}
    >
      {children}
    </button>
  );
}
