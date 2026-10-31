
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Search, RefreshCw, Pencil, Trash2, X, LoaderCircle,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const configs = {
  visitors: {
    title: "Visitor Book",
    description: "Manage visitor entries and check-in/check-out records.",
    endpoint: "/visitors",
    searchPlaceholder: "Search visitor, phone or purpose...",
    fields: [
      { name: "visitorName", label: "Visitor Name", required: true },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "email", label: "Email", type: "email" },
      { name: "purpose", label: "Purpose", required: true },
      { name: "personToMeet", label: "Person to Meet" },
      { name: "visitorType", label: "Visitor Type", type: "select", options: ["Parent", "Student", "Vendor", "Guest", "Other"] },
      { name: "status", label: "Status", type: "select", options: ["Visiting", "Checked Out"] },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      ["visitorName", "Visitor"],
      ["phone", "Phone"],
      ["purpose", "Purpose"],
      ["personToMeet", "Meeting With"],
      ["status", "Status"],
    ],
    initial: { visitorType: "Other", status: "Visiting" },
  },
  calls: {
    title: "Phone Call Log",
    description: "Track incoming calls, outgoing calls and callbacks.",
    endpoint: "/calls",
    searchPlaceholder: "Search caller, phone or purpose...",
    fields: [
      { name: "callerName", label: "Caller Name", required: true },
      { name: "phone", label: "Phone", type: "tel", required: true },
      { name: "callType", label: "Call Type", type: "select", options: ["Incoming", "Outgoing"] },
      { name: "purpose", label: "Purpose", required: true },
      { name: "staffName", label: "Staff Name" },
      { name: "durationMinutes", label: "Duration (minutes)", type: "number" },
      { name: "status", label: "Status", type: "select", options: ["Answered", "Missed", "Callback Required", "Completed"] },
      { name: "followUpDate", label: "Follow-up Date", type: "datetime-local" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      ["callerName", "Caller"],
      ["phone", "Phone"],
      ["callType", "Type"],
      ["purpose", "Purpose"],
      ["status", "Status"],
    ],
    initial: { callType: "Incoming", status: "Answered", durationMinutes: 0 },
  },
  "postal-records": {
    title: "Postal / Dispatch Records",
    description: "Manage incoming mail and outgoing dispatches.",
    endpoint: "/postal-records",
    searchPlaceholder: "Search tracking, sender or recipient...",
    fields: [
      { name: "recordType", label: "Record Type", type: "select", options: ["Inward", "Outward"], required: true },
      { name: "trackingNumber", label: "Tracking Number" },
      { name: "sender", label: "Sender" },
      { name: "recipient", label: "Recipient", required: true },
      { name: "address", label: "Address", type: "textarea" },
      { name: "subject", label: "Subject", required: true },
      { name: "status", label: "Status", type: "select", options: ["Received", "Dispatched", "Delivered", "Pending"] },
      { name: "handledBy", label: "Handled By" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      ["recordType", "Type"],
      ["trackingNumber", "Tracking No."],
      ["sender", "Sender"],
      ["recipient", "Recipient"],
      ["subject", "Subject"],
      ["status", "Status"],
    ],
    initial: { recordType: "Inward", status: "Pending" },
  },
  complaints: {
    title: "Complaints",
    description: "Record complaints, assign staff and track resolutions.",
    endpoint: "/complaints",
    searchPlaceholder: "Search complainant, subject or category...",
    fields: [
      { name: "complainantName", label: "Complainant Name", required: true },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "category", label: "Category", required: true },
      { name: "subject", label: "Subject", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "priority", label: "Priority", type: "select", options: ["Low", "Medium", "High", "Urgent"] },
      { name: "status", label: "Status", type: "select", options: ["Open", "In Progress", "Resolved", "Closed"] },
      { name: "assignedTo", label: "Assigned To" },
      { name: "resolution", label: "Resolution", type: "textarea" },
    ],
    columns: [
      ["complainantName", "Complainant"],
      ["subject", "Subject"],
      ["category", "Category"],
      ["priority", "Priority"],
      ["status", "Status"],
      ["assignedTo", "Assigned To"],
    ],
    initial: { priority: "Medium", status: "Open" },
  },
};

function makeEmpty(config) {
  return Object.fromEntries(
    config.fields.map((field) => [field.name, config.initial?.[field.name] ?? ""])
  );
}

function displayValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export default function FrontOfficeRecords({ module }) {
  const router = useRouter();
  const config = configs[module];

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1, limit: 10, total: 0, totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const loadRecords = useCallback(async () => {
    if (!config) return;

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
      });

      if (search.trim()) params.set("search", search.trim());
      if (status) params.set("status", status);

      const response = await fetch(
        `${API_BASE}/api/front-office${config.endpoint}?${params.toString()}`
      );
      const result = await response.json();

      if (!response.ok || result._status === false) {
        throw new Error(result._message || "Could not load records");
      }

      setItems(Array.isArray(result._data?.items) ? result._data.items : []);
      setPagination((old) => ({
        ...old,
        ...(result._data?.pagination || {}),
      }));
    } catch (err) {
      setError(err.message || "Failed to load records");
    } finally {
      setLoading(false);
    }
  }, [config, pagination.page, pagination.limit, search, status]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  if (!config) {
    return <p className="p-6 text-red-600">Invalid Front Office module.</p>;
  }

  const openCreate = () => {
    setEditingId(null);
    setForm(makeEmpty(config));
    setNotice("");
    setModal(true);
  };

  const openEdit = (item) => {
    setEditingId(item._id);
    const values = makeEmpty(config);

    config.fields.forEach((field) => {
      const value = item[field.name];
      if (value !== undefined && value !== null) {
        values[field.name] =
          ["date", "datetime-local"].includes(field.type) && value
            ? new Date(value).toISOString().slice(
                0,
                field.type === "date" ? 10 : 16
              )
            : value;
      }
    });

    setForm(values);
    setNotice("");
    setModal(true);
  };

  const saveRecord = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = { ...form };

      config.fields.forEach((field) => {
        if (field.type === "number" && payload[field.name] !== "") {
          payload[field.name] = Number(payload[field.name]);
        }
        if (field.type === "datetime-local" && !payload[field.name]) {
          payload[field.name] = null;
        }
      });

      const response = await fetch(
        `${API_BASE}/api/front-office${config.endpoint}${editingId ? `/${editingId}` : ""}`,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok || result._status === false) {
        throw new Error(result._message || "Could not save record");
      }

      setModal(false);
      setNotice(editingId ? "Record updated successfully." : "Record added successfully.");
      setPagination((old) => ({ ...old, page: 1 }));
      await loadRecords();
    } catch (err) {
      setError(err.message || "Failed to save record");
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (item) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_BASE}/api/front-office${config.endpoint}/${item._id}`,
        { method: "DELETE" }
      );
      const result = await response.json();

      if (!response.ok || result._status === false) {
        throw new Error(result._message || "Could not delete record");
      }

      setNotice("Record deleted successfully.");

      if (items.length === 1 && pagination.page > 1) {
        setPagination((old) => ({ ...old, page: old.page - 1 }));
      } else {
        await loadRecords();
      }
    } catch (err) {
      setError(err.message || "Failed to delete record");
    }
  };

  const statusOptions = {
    visitors: ["Visiting", "Checked Out"],
    calls: ["Answered", "Missed", "Callback Required", "Completed"],
    "postal-records": ["Received", "Dispatched", "Delivered", "Pending"],
    complaints: ["Open", "In Progress", "Resolved", "Closed"],
  }[module];

  const badgeClass = (value) => {
    const v = String(value || "").toLowerCase();
    if (["resolved", "closed", "delivered", "checked out", "completed"].includes(v)) {
      return "bg-emerald-50 text-emerald-700";
    }
    if (["urgent", "high", "missed", "open"].includes(v)) {
      return "bg-rose-50 text-rose-700";
    }
    if (["in progress", "callback required", "pending", "visiting"].includes(v)) {
      return "bg-amber-50 text-amber-700";
    }
    return "bg-slate-100 text-slate-700";
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] p-4 text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <button
              onClick={() => router.push("/admin/front-office")}
              className="mb-3 text-sm font-medium text-emerald-700 hover:underline"
            >
              ← Front Office
            </button>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{config.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{config.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={loadRecords}
              className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
            >
              <RefreshCw size={16} /> Refresh
            </button>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"
            >
              <Plus size={17} /> Add New
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Total Records</p>
            <p className="mt-2 text-3xl font-bold">{pagination.total}</p>
          </div>
          <div className="border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Current Page</p>
            <p className="mt-2 text-3xl font-bold">{pagination.page}</p>
          </div>
          <div className="border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Total Pages</p>
            <p className="mt-2 text-3xl font-bold">{pagination.totalPages || 0}</p>
          </div>
        </div>

        {error && (
          <div className="flex items-start justify-between gap-3 border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss error"><X size={17} /></button>
          </div>
        )}
        {notice && (
          <div className="border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {notice}
          </div>
        )}

        <section className="overflow-hidden border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row">
            <div className="relative flex-1">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPagination((old) => ({ ...old, page: 1 }));
                }}
                placeholder={config.searchPlaceholder}
                className="w-full border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-700"
              />
            </div>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPagination((old) => ({ ...old, page: 1 }));
              }}
              className="border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
            >
              <option value="">All statuses</option>
              {statusOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {config.columns.map((column) => <th key={column[0]} className="px-5 py-4 font-semibold">{column[1]}</th>)}
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={config.columns.length + 2} className="p-12 text-center text-slate-500">
                    <LoaderCircle className="mx-auto mb-2 animate-spin" size={22} /> Loading records...
                  </td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={config.columns.length + 2} className="p-12 text-center text-slate-500">
                    No records found. Click “Add New” to create one.
                  </td></tr>
                ) : items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/70">
                    {config.columns.map(([key]) => (
                      <td key={key} className="px-5 py-4">
                        {["status", "priority"].includes(key) ? (
                          <span className={`inline-flex whitespace-nowrap px-2.5 py-1 text-xs font-semibold ${badgeClass(item[key])}`}>
                            {displayValue(item[key])}
                          </span>
                        ) : (
                          <span className="block max-w-[240px] truncate" title={displayValue(item[key])}>
                            {displayValue(item[key])}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(item)} title="Edit" className="border border-slate-200 p-2 hover:bg-emerald-50 hover:text-emerald-800">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => deleteRecord(item)} title="Delete" className="border border-slate-200 p-2 text-rose-600 hover:bg-rose-50">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col justify-between gap-3 border-t border-slate-200 p-4 text-sm sm:flex-row sm:items-center">
            <span className="text-slate-500">
              {pagination.total ? `Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total}` : "No records"}
            </span>
            <div className="flex items-center gap-2">
              <label htmlFor="page-size" className="text-slate-500">Rows:</label>
              <select
                id="page-size"
                value={pagination.limit}
                onChange={(event) => setPagination((old) => ({ ...old, limit: Number(event.target.value), page: 1 }))}
                className="border border-slate-200 bg-white px-2 py-1.5"
              >
                {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination((old) => ({ ...old, page: old.page - 1 }))}
                className="border border-slate-200 px-3 py-1.5 disabled:opacity-40"
              >Previous</button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((old) => ({ ...old, page: old.page + 1 }))}
                className="border border-slate-200 px-3 py-1.5 disabled:opacity-40"
              >Next</button>
            </div>
          </div>
        </section>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 sm:p-6">
          <div className="my-auto max-h-[94vh] w-full max-w-3xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
              <div>
                <h2 className="text-xl font-bold">{editingId ? "Edit Record" : `Add ${config.title}`}</h2>
                <p className="mt-1 text-sm text-slate-500">Fill in the details below.</p>
              </div>
              <button onClick={() => setModal(false)} className="border border-slate-200 p-2 hover:bg-slate-100" aria-label="Close form">
                <X size={19} />
              </button>
            </div>

            <form onSubmit={saveRecord} className="p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {config.fields.map((field) => (
                  <label key={field.name} className={`block ${field.type === "textarea" ? "sm:col-span-2" : ""}`}>
                    <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                      {field.label}{field.required ? " *" : ""}
                    </span>
                    {field.type === "select" ? (
                      <select
                        required={field.required}
                        value={form[field.name] ?? ""}
                        onChange={(event) => setForm((old) => ({ ...old, [field.name]: event.target.value }))}
                        className="w-full border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
                      >
                        <option value="">Select {field.label}</option>
                        {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        required={field.required}
                        rows={3}
                        value={form[field.name] ?? ""}
                        onChange={(event) => setForm((old) => ({ ...old, [field.name]: event.target.value }))}
                        className="w-full border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
                      />
                    ) : (
                      <input
                        type={field.type || "text"}
                        required={field.required}
                        min={field.type === "number" ? 0 : undefined}
                        maxLength={field.type === "tel" ? 10 : undefined}
                        pattern={field.type === "tel" ? "[0-9]{10}" : undefined}
                        value={form[field.name] ?? ""}
                        onChange={(event) => setForm((old) => ({ ...old, [field.name]: event.target.value }))}
                        className="w-full border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
                      />
                    )}
                  </label>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                <button type="button" onClick={() => setModal(false)} className="border border-slate-200 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50">
                  Cancel
                </button>
                <button disabled={saving} className="inline-flex items-center gap-2 bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60">
                  {saving && <LoaderCircle size={16} className="animate-spin" />}
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Create Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
