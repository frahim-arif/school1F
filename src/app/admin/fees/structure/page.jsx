"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  IndianRupee,
  X,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const feeFields = [
  { key: "tuition", label: "Tuition Fee" },
  { key: "admission", label: "Admission Fee" },
  { key: "exam", label: "Exam Fee" },
  { key: "computer", label: "Computer Fee" },
  { key: "library", label: "Library Fee" },
  { key: "transport", label: "Transport Fee" },
];

const emptyForm = {
  className: "",
  tuition: "0",
  admission: "0",
  exam: "0",
  computer: "0",
  library: "0",
  transport: "0",
};

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

function getTotal(item) {
  return feeFields.reduce(
    (sum, field) => sum + (Number(item[field.key]) || 0),
    0
  );
}

export default function FeeStructurePage() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadStructures = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/fee-structures`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Fee structures load nahi hui.");
      }

      setRows(Array.isArray(data.structures) ? data.structures : []);
    } catch (err) {
      setError(err.message || "Backend se connection nahi ho raha.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStructures();
  }, [loadStructures]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return rows;

    return rows.filter((item) =>
      String(item.className || "").toLowerCase().includes(query)
    );
  }, [rows, search]);

  const totalMonthlyFees = rows.reduce(
    (sum, item) =>
      sum +
      ["tuition", "computer", "library", "transport"].reduce(
        (subtotal, field) => subtotal + (Number(item[field]) || 0),
        0
      ),
    0
  );

  const averageMonthlyFee = rows.length
    ? totalMonthlyFees / rows.length
    : 0;

  const highestFee = rows.reduce(
    (highest, item) => Math.max(highest, getTotal(item)),
    0
  );

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setNotice("");
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item._id);

    setForm({
      className: item.className || "",
      tuition: String(item.tuition ?? 0),
      admission: String(item.admission ?? 0),
      exam: String(item.exam ?? 0),
      computer: String(item.computer ?? 0),
      library: String(item.library ?? 0),
      transport: String(item.transport ?? 0),
    });

    setError("");
    setNotice("");
    setModalOpen(true);
  };

  const updateForm = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!form.className.trim()) {
      setError("Class name enter karein.");
      return;
    }

    for (const field of feeFields) {
      const value = form[field.key];

      if (
        value === "" ||
        !Number.isFinite(Number(value)) ||
        Number(value) < 0
      ) {
        setError(`${field.label} valid non-negative amount hona chahiye.`);
        return;
      }
    }

    setSaving(true);

    try {
      const payload = {
        className: form.className.trim(),
        ...Object.fromEntries(
          feeFields.map(({ key }) => [key, Number(form[key])])
        ),
      };

      const url = editingId
        ? `${API_BASE}/api/fee-structures/${editingId}`
        : `${API_BASE}/api/fee-structures`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Fee structure save nahi hui.");
      }

      setModalOpen(false);
      setNotice(
        editingId
          ? "Fee structure successfully update ho gayi."
          : "Fee structure successfully add ho gayi."
      );

      await loadStructures();
    } catch (err) {
      setError(err.message || "Fee structure save nahi hui.");
    } finally {
      setSaving(false);
    }
  };

  const deleteStructure = async (item) => {
    const confirmed = window.confirm(
      `Kya aap "${item.className}" ki fee structure delete karna chahte hain?`
    );

    if (!confirmed) return;

    setDeletingId(item._id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_BASE}/api/fee-structures/${item._id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Delete nahi ho saka.");
      }

      setNotice("Fee structure delete ho gayi.");
      await loadStructures();
    } catch (err) {
      setError(err.message || "Delete karte waqt error aaya.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Fee Structure
          </h1>
          <p className="mt-2 text-slate-500">
            Configure class-wise fee structure
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadStructures}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            <Plus size={18} />
            Add Structure
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
        >
          {notice}
        </div>
      )}

      {/* Search */}
      <div className="rounded-2xl border bg-white p-5">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-3.5 text-slate-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search Class..."
            aria-label="Search class"
            className="w-full rounded-xl border py-3 pl-10 pr-4 outline-none focus:border-emerald-500"
          />
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Showing {filteredRows.length} of {rows.length} classes
        </p>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-100">
              <tr>
                {[
                  "Class",
                  "Tuition",
                  "Admission",
                  "Exam",
                  "Computer",
                  "Library",
                  "Transport",
                  "Total",
                  "Action",
                ].map((heading, index) => (
                  <th
                    key={heading}
                    className={`whitespace-nowrap px-5 py-4 text-sm font-bold text-slate-600 ${
                      index === 0 ? "text-left" : "text-center"
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-500">
                    Loading fee structures...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-500">
                    {search
                      ? "Koi matching class nahi mili."
                      : "Abhi fee structure nahi hai. Add Structure par click karein."}
                  </td>
                </tr>
              ) : (
                filteredRows.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-5 py-4 font-bold text-slate-800">
                      {item.className}
                    </td>

                    {feeFields.map(({ key }) => (
                      <td
                        key={key}
                        className="whitespace-nowrap px-5 py-4 text-center text-slate-600"
                      >
                        {money(item[key])}
                      </td>
                    ))}

                    <td className="whitespace-nowrap px-5 py-4 text-center font-bold text-emerald-600">
                      {money(getTotal(item))}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          title="Edit structure"
                          onClick={() => openEditModal(item)}
                          className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          type="button"
                          title="Delete structure"
                          disabled={deletingId === item._id}
                          onClick={() => deleteStructure(item)}
                          className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200 disabled:opacity-50"
                        >
                          {deletingId === item._id ? (
                            <LoaderCircle size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        <Summary title="Total Classes" value={String(rows.length)} />
        <Summary
          title="Average Monthly Fee"
          value={money(averageMonthlyFee)}
        />
        <Summary title="Highest Total Fee" value={money(highestFee)} />
      </div>

      {/* Add/Edit modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          onClick={() => !saving && setModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="fee-modal-title"
            className="my-auto w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 id="fee-modal-title" className="text-xl font-black text-slate-800">
                  {editingId ? "Edit Fee Structure" : "Add Fee Structure"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Class aur uski fee details enter karein.
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitForm} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Class Name *
                </span>
                <input
                  name="className"
                  value={form.className}
                  onChange={updateForm}
                  placeholder="e.g. Nursery, Class 1"
                  required
                  maxLength={80}
                  className={inputClass}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                {feeFields.map(({ key, label }) => (
                  <label key={key} className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      {label} (₹)
                    </span>
                    <input
                      type="number"
                      name={key}
                      value={form[key]}
                      onChange={updateForm}
                      min="0"
                      step="0.01"
                      required
                      className={inputClass}
                    />
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">
                <span className="font-semibold text-slate-700">
                  Total Fee
                </span>
                <span className="text-xl font-black text-emerald-700">
                  {money(
                    feeFields.reduce(
                      (sum, field) => sum + (Number(form[field.key]) || 0),
                      0
                    )
                  )}
                </span>
              </div>

              {error && (
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <Plus size={18} />
                  )}
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Structure"
                    : "Save Structure"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

function Summary({ title, value }) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-slate-500">{title}</p>
          <h2 className="mt-3 text-2xl font-black text-slate-800 sm:text-3xl">
            {value}
          </h2>
        </div>

        <div className="rounded-2xl bg-emerald-500 p-4 text-white">
          <IndianRupee size={28} />
        </div>
      </div>
    </div>
  );
}