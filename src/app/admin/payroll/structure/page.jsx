
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  Wallet,
  Users,
  Banknote,
  TrendingUp,
  Pencil,
  Trash2,
  X,
  Save,
  SlidersHorizontal,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const API_BASE = API_ORIGIN.endsWith("/api")
  ? API_ORIGIN
  : `${API_ORIGIN}/api`;

const emptyForm = {
  staffId: "",
  basicSalary: "",
  hra: "",
  allowance: "",
  bonus: "",
  pf: "",
  tax: "",
  otherDeduction: "",
  notes: "",
};

function amount(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount(value));
}

function employeeName(staff) {
  if (!staff) return "Unknown Employee";
  if (typeof staff === "string") return staff;

  return (
    staff.name ||
    staff.fullName ||
    [staff.firstName, staff.lastName].filter(Boolean).join(" ") ||
    staff.employeeName ||
    staff.staffName ||
    "Unknown Employee"
  );
}

function normalizeList(result, keys = []) {
  if (Array.isArray(result)) return result;

  for (const key of keys) {
    if (Array.isArray(result?.[key])) return result[key];
    if (Array.isArray(result?.data?.[key])) return result.data[key];
  }

  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.results)) return result.results;

  return [];
}

function getDeduction(items, name) {
  if (!Array.isArray(items)) return 0;

  return amount(
    items.find(
      (item) =>
        String(item?.name || "").toLowerCase() === name.toLowerCase()
    )?.amount
  );
}

function totalAllowances(structure) {
  const items = structure?.allowances;

  if (Array.isArray(items)) {
    return items.reduce((sum, item) => sum + amount(item?.amount), 0);
  }

  return amount(items);
}

function grossSalary(structure) {
  return (
    amount(structure?.basicSalary) +
    amount(structure?.hra) +
    totalAllowances(structure) +
    amount(structure?.bonus)
  );
}

function totalDeductions(structure) {
  const items = structure?.deductions;

  if (Array.isArray(items)) {
    return items.reduce((sum, item) => sum + amount(item?.amount), 0);
  }

  return amount(items);
}

function netSalary(structure) {
  return grossSalary(structure) - totalDeductions(structure);
}

async function apiRequest(path, options = {}) {
  const normalizedPath = `/${path.replace(/^\/+/, "")}`;
  const url = `${API_BASE}${normalizedPath}`;

  let response;

  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("adminToken")
        : null;

    response = await fetch(url, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new Error(
      `Backend se connection nahi ho saka. API URL: ${url}`
    );
  }

  const result = await response.json().catch(() => ({}));

  if (
    !response.ok ||
    result?.success === false ||
    result?._status === false
  ) {
    throw new Error(
      result?.message ||
        result?._message ||
        `Request failed (${response.status}).`
    );
  }

  return result;
}

export default function SalaryStructurePage() {
  const [structures, setStructures] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError("");

    try {
      const [structureResult, staffResult] = await Promise.all([
        apiRequest("/payroll/structures"),
        apiRequest("/payroll/staff"),
      ]);

      setStructures(
        normalizeList(structureResult, ["structures"])
      );

      setStaffList(
        normalizeList(staffResult, ["staff", "employees"])
      );
    } catch (err) {
      setError(
        err.message ||
          "Salary structures load nahi ho sake. Backend check karein."
      );
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const departments = useMemo(() => {
    const values = structures
      .map((item) => item.staff?.department)
      .filter(Boolean);

    return [...new Set(values)].sort();
  }, [structures]);

  const filteredStructures = useMemo(() => {
    const query = search.trim().toLowerCase();

    return structures.filter((item) => {
      const staff = item.staff || {};
      const name = employeeName(staff);

      const matchesSearch =
        !query ||
        name.toLowerCase().includes(query) ||
        String(staff.staffId || "").toLowerCase().includes(query) ||
        String(staff.designation || "").toLowerCase().includes(query) ||
        String(staff.department || "").toLowerCase().includes(query);

      const matchesDepartment =
        department === "All" || staff.department === department;

      return matchesSearch && matchesDepartment;
    });
  }, [structures, search, department]);

  const stats = useMemo(() => {
    return structures.reduce(
      (result, item) => {
        result.employees += 1;
        result.totalGross += grossSalary(item);
        result.totalNet += netSalary(item);
        result.totalDeduction += totalDeductions(item);
        return result;
      },
      {
        employees: 0,
        totalGross: 0,
        totalNet: 0,
        totalDeduction: 0,
      }
    );
  }, [structures]);

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    setNotice("");
    setModalOpen(true);
  };

  const openEditModal = (structure) => {
    const staff = structure.staff;
    const staffId =
      typeof staff === "object" && staff ? staff._id : structure.staffId;

    setEditingId(structure._id);

    setForm({
      staffId: staffId || "",
      basicSalary: String(structure.basicSalary ?? ""),
      hra: String(structure.hra ?? ""),
      allowance: String(getDeduction(structure.allowances, "Other Allowance") || ""),
      bonus: String(structure.bonus ?? ""),
      pf: String(getDeduction(structure.deductions, "PF") || ""),
      tax: String(getDeduction(structure.deductions, "Tax") || ""),
      otherDeduction: String(
        getDeduction(structure.deductions, "Other Deduction") || ""
      ),
      notes: structure.notes || "",
    });

    setError("");
    setNotice("");
    setModalOpen(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!form.staffId) {
      setError("Please select a staff member.");
      return;
    }

    const numericFields = [
      "basicSalary",
      "hra",
      "allowance",
      "bonus",
      "pf",
      "tax",
      "otherDeduction",
    ];

    for (const field of numericFields) {
      if (
        form[field] !== "" &&
        (!Number.isFinite(Number(form[field])) ||
          Number(form[field]) < 0)
      ) {
        setError("Salary amounts valid aur non-negative hone chahiye.");
        return;
      }
    }

    const deductions = [
      { name: "PF", amount: amount(form.pf) },
      { name: "Tax", amount: amount(form.tax) },
      {
        name: "Other Deduction",
        amount: amount(form.otherDeduction),
      },
    ].filter((item) => item.amount > 0);

    const allowances = [
      {
        name: "Other Allowance",
        amount: amount(form.allowance),
      },
    ].filter((item) => item.amount > 0);

    const payload = {
      staffId: form.staffId,
      basicSalary: amount(form.basicSalary),
      hra: amount(form.hra),
      bonus: amount(form.bonus),
      allowances,
      deductions,
      notes: form.notes.trim(),
    };

    setSaving(true);

    try {
      const path = editingId
        ? `/payroll/structures/${editingId}`
        : "/payroll/structures";

      const result = await apiRequest(path, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      setNotice(
        result.message ||
          result._message ||
          "Salary structure saved successfully."
      );

      setModalOpen(false);
      setEditingId(null);
      setForm({ ...emptyForm });

      await loadData(false);
    } catch (err) {
      setError(err.message || "Salary structure save nahi ho saka.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (structure) => {
    const name = employeeName(structure.staff);

    if (
      !window.confirm(
        `Kya aap ${name} ka salary structure delete karna chahte hain?`
      )
    ) {
      return;
    }

    setError("");
    setNotice("");
    setDeletingId(structure._id);

    try {
      const result = await apiRequest(
        `/payroll/structures/${structure._id}`,
        { method: "DELETE" }
      );

      setNotice(
        result.message || result._message || "Salary structure deleted."
      );

      await loadData(false);
    } catch (err) {
      setError(err.message || "Salary structure delete nahi ho saka.");
    } finally {
      setDeletingId(null);
    }
  };

  const statCards = [
    {
      title: "Employees",
      value: stats.employees.toLocaleString("en-IN"),
      note: "Saved salary structures",
      icon: Users,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Total Gross Salary",
      value: money(stats.totalGross),
      note: "Monthly before deductions",
      icon: Wallet,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Total Net Salary",
      value: money(stats.totalNet),
      note: "Monthly after deductions",
      icon: Banknote,
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "Total Deductions",
      value: money(stats.totalDeduction),
      note: "Configured deductions",
      icon: TrendingUp,
      color: "bg-amber-100 text-amber-700",
    },
  ];

  const previewGross =
    amount(form.basicSalary) +
    amount(form.hra) +
    amount(form.allowance) +
    amount(form.bonus);

  const previewNet =
    previewGross -
    amount(form.pf) -
    amount(form.tax) -
    amount(form.otherDeduction);

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/admin/payroll"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-700"
            >
              <ArrowLeft size={16} />
              Back to Payroll
            </Link>

            <p className="mb-2 text-sm font-semibold text-emerald-700">
              PAYROLL MANAGEMENT
            </p>

            <h1 className="text-3xl font-bold">Salary Structure</h1>

            <p className="mt-2 text-slate-500">
              Manage employee salary details using your payroll backend.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loadData()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
            >
              <Plus size={18} />
              Add Salary Structure
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {notice && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <CheckCircle2 size={18} />
            <span className="flex-1">{notice}</span>
            <button type="button" onClick={() => setNotice("")}>
              <X size={16} />
            </button>
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </p>
                    <h2 className="mt-3 break-words text-2xl font-bold tracking-tight">
                      {stat.value}
                    </h2>
                  </div>

                  <span className={`rounded-xl p-3 ${stat.color}`}>
                    <Icon size={22} />
                  </span>
                </div>

                <p className="mt-4 text-xs text-slate-500">{stat.note}</p>
              </div>
            );
          })}
        </div>

        <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <h2 className="font-bold text-emerald-900">Salary calculation</h2>
          <p className="mt-2 text-sm leading-6 text-emerald-900">
            Gross Salary = Basic Salary + HRA + Allowances + Bonus. Net Salary
            = Gross Salary − Deductions.
          </p>
        </div>

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_240px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employee, ID or designation..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="relative">
              <SlidersHorizontal
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
              >
                <option value="All">All Departments</option>
                {departments.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">
                Employee Salary Structures
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredStructures.length} record(s) found
              </p>
            </div>

            <span className="w-fit rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              LIVE BACKEND DATA
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <RefreshCw
                size={26}
                className="mx-auto mb-3 animate-spin"
              />
              Loading salary structures...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Employee</th>
                    <th className="px-5 py-4 font-semibold">Basic Salary</th>
                    <th className="px-5 py-4 font-semibold">HRA</th>
                    <th className="px-5 py-4 font-semibold">Allowances</th>
                    <th className="px-5 py-4 font-semibold">Gross Salary</th>
                    <th className="px-5 py-4 font-semibold">Deductions</th>
                    <th className="px-5 py-4 font-semibold">Net Salary</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredStructures.map((structure) => {
                    const staff =
                      typeof structure.staff === "object"
                        ? structure.staff || {}
                        : {};

                    return (
                      <tr
                        key={structure._id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold">
                            {employeeName(staff)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {staff.staffId || "No staff ID"} ·{" "}
                            {staff.designation || "Staff"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {staff.department || "No department"}
                          </p>
                        </td>

                        <td className="px-5 py-4 font-medium">
                          {money(structure.basicSalary)}
                        </td>

                        <td className="px-5 py-4">
                          {money(structure.hra)}
                        </td>

                        <td className="px-5 py-4">
                          {money(
                            totalAllowances(structure) +
                              amount(structure.bonus)
                          )}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {money(grossSalary(structure))}
                        </td>

                        <td className="px-5 py-4 text-rose-700">
                          {money(totalDeductions(structure))}
                        </td>

                        <td className="px-5 py-4 font-bold text-emerald-700">
                          {money(netSalary(structure))}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(structure)}
                              title="Edit salary structure"
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              disabled={deletingId === structure._id}
                              onClick={() => handleDelete(structure)}
                              title="Delete salary structure"
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
                            >
                              {deletingId === structure._id ? (
                                <RefreshCw size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredStructures.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-12 text-center text-slate-500"
                      >
                        <Users
                          size={32}
                          className="mx-auto mb-3 text-slate-300"
                        />
                        <p className="font-semibold">
                          No salary structures found
                        </p>
                        <p className="mt-1 text-sm">
                          Add a salary structure or change your search filters.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4 py-8 backdrop-blur-sm">
            <div className="my-auto w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 p-5">
                <div>
                  <h2 className="text-xl font-bold">
                    {editingId
                      ? "Edit Salary Structure"
                      : "Add Salary Structure"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Enter the employee's monthly salary details.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave}>
                <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="block sm:col-span-2 lg:col-span-3">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Staff Member *
                    </span>

                    <select
                      name="staffId"
                      required
                      disabled={Boolean(editingId)}
                      value={form.staffId}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-500 disabled:bg-slate-100"
                    >
                      <option value="">Select staff member</option>

                      {staffList.map((staff) => (
                        <option key={staff._id} value={staff._id}>
                          {employeeName(staff)}
                          {staff.staffId ? ` (${staff.staffId})` : ""}
                          {staff.designation
                            ? ` — ${staff.designation}`
                            : ""}
                        </option>
                      ))}
                    </select>

                    {staffList.length === 0 && (
                      <span className="mt-2 block text-xs text-amber-700">
                        No staff found. Check the staff API and add staff first.
                      </span>
                    )}
                  </label>

                  <div className="sm:col-span-2 lg:col-span-3">
                    <h3 className="border-b border-slate-100 pb-2 font-bold">
                      Earnings (monthly)
                    </h3>
                  </div>

                  {[
                    { name: "basicSalary", label: "Basic Salary" },
                    { name: "hra", label: "House Rent Allowance (HRA)" },
                    { name: "allowance", label: "Other Allowances" },
                    { name: "bonus", label: "Bonus / Incentives" },
                  ].map((field) => (
                    <label key={field.name} className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">
                        {field.label} (₹)
                      </span>

                      <input
                        name={field.name}
                        type="number"
                        min="0"
                        step="0.01"
                        value={form[field.name]}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                    </label>
                  ))}

                  <div className="sm:col-span-2 lg:col-span-3">
                    <h3 className="border-b border-slate-100 pb-2 font-bold">
                      Deductions (monthly)
                    </h3>
                  </div>

                  {[
                    { name: "pf", label: "PF / Provident Fund" },
                    { name: "tax", label: "Tax" },
                    { name: "otherDeduction", label: "Other Deductions" },
                  ].map((field) => (
                    <label key={field.name} className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">
                        {field.label} (₹)
                      </span>

                      <input
                        name={field.name}
                        type="number"
                        min="0"
                        step="0.01"
                        value={form[field.name]}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                    </label>
                  ))}

                  <label className="block sm:col-span-2 lg:col-span-3">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Notes
                    </span>

                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Optional salary notes"
                      className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>
                </div>

                <div className="border-t border-slate-200 bg-slate-50 p-5">
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-xs text-slate-500">Gross Salary</p>
                      <p className="mt-1 font-bold">
                        {money(previewGross)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-xs text-emerald-700">Net Salary</p>
                      <p
                        className={`mt-1 font-bold ${
                          previewNet < 0 ? "text-rose-700" : "text-emerald-800"
                        }`}
                      >
                        {money(previewNet)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={saving || staffList.length === 0}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? (
                        <RefreshCw size={17} className="animate-spin" />
                      ) : (
                        <Save size={17} />
                      )}

                      {saving
                        ? "Saving..."
                        : editingId
                        ? "Save Changes"
                        : "Save Structure"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
