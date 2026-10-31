
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Download,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  FileText,
  Settings,
  X,
} from "lucide-react";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const configs = {
  income: {
    title: "Other Income",
    description: "Manage school income apart from regular student fees.",
    icon: TrendingUp,
    color: "emerald",
    fields: [
      ["title", "Income Title"],
      ["category", "Category"],
      ["amount", "Amount (₹)"],
      ["date", "Date"],
      ["method", "Payment Method"],
      ["reference", "Reference Number"],
      ["remarks", "Remarks"],
    ],
    columns: ["title", "category", "amount", "date", "method"],
    labels: {
      title: "Income Title",
      category: "Category",
      amount: "Amount",
      date: "Date",
      method: "Payment Method",
    },
    categories: ["Admission", "Donation", "Transport", "Event", "Other"],
  },
  expenses: {
    title: "School Expenses",
    description: "Record and manage the school's operating expenses.",
    icon: TrendingDown,
    color: "rose",
    fields: [
      ["title", "Expense Title"],
      ["category", "Category"],
      ["amount", "Amount (₹)"],
      ["date", "Date"],
      ["method", "Payment Method"],
      ["reference", "Reference Number"],
      ["remarks", "Remarks"],
    ],
    columns: ["title", "category", "amount", "date", "method"],
    labels: {
      title: "Expense Title",
      category: "Category",
      amount: "Amount",
      date: "Date",
      method: "Payment Method",
    },
    categories: [
      "Salary",
      "Electricity",
      "Maintenance",
      "Stationery",
      "Transport",
      "Equipment",
      "Other",
    ],
  },
  transactions: {
    title: "Financial Transactions",
    description: "Review income, expenses and payment records.",
    icon: ArrowLeftRight,
    color: "blue",
    fields: [],
    columns: ["title", "type", "category", "amount", "date", "method"],
    labels: {
      title: "Description",
      type: "Type",
      category: "Category",
      amount: "Amount",
      date: "Date",
      method: "Method",
    },
    categories: [],
  },
};

const emptyForm = {
  title: "",
  category: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  method: "Cash",
  reference: "",
  remarks: "",
};

export default function FinancePage({ type }) {
  const config = configs[type];
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const total = records.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;

    return records.filter((item) =>
      Object.values(item).some((value) =>
        String(value ?? "").toLowerCase().includes(q)
      )
    );
  }, [records, search]);

  if (!config) {
    return <p className="p-6">Invalid Finance page.</p>;
  }

  const Icon = config.icon;

  function openNewForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setShowForm(true);
  }

  function saveRecord(event) {
    event.preventDefault();
    setError("");

    if (!form.title.trim() || !form.category || !form.amount || Number(form.amount) <= 0 || !form.date) {
      setError("Title, category, valid amount aur date required hain.");
      return;
    }

    const record = {
      ...form,
      amount: Number(form.amount),
      type,
      id: editingId || `${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
    };

    setRecords((current) =>
      editingId
        ? current.map((item) => (item.id === editingId ? record : item))
        : [record, ...current]
    );

    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
  }

  function editRecord(record) {
    setForm({
      title: record.title || "",
      category: record.category || "",
      amount: String(record.amount ?? ""),
      date: record.date || "",
      method: record.method || "Cash",
      reference: record.reference || "",
      remarks: record.remarks || "",
    });
    setEditingId(record.id);
    setShowForm(true);
    setError("");
  }

  function deleteRecord(id) {
    if (!window.confirm("Is record ko delete karna hai?")) return;
    setRecords((current) => current.filter((item) => item.id !== id));
  }

  function exportCSV() {
    const rows = [
      config.columns,
      ...filtered.map((record) =>
        config.columns.map((column) => record[column] ?? "")
      ),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${type}-records.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen space-y-6 bg-slate-50/60 p-4 sm:p-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
            School Administration / Finance
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">
            {config.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">{config.description}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            <Download size={17} /> Export CSV
          </button>

          {type !== "transactions" && (
            <button
              onClick={openNewForm}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800"
            >
              <Plus size={18} /> Add Record
            </button>
          )}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">
              {type === "expenses" ? "Total Expenses" : type === "income" ? "Total Income" : "Total Transactions"}
            </p>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
              <Icon size={22} />
            </div>
          </div>
          <h2 className="mt-4 text-3xl font-black text-slate-900">
            {money(total)}
          </h2>
          <p className="mt-2 text-xs text-slate-500">
            {records.length} record(s) in this page session
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <Wallet size={22} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Visible Records</p>
              <h2 className="text-2xl font-black text-slate-900">
                {filtered.length}
              </h2>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Search results from currently loaded records.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-50 p-3 text-violet-700">
              <FileText size={22} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Module Status</p>
              <h2 className="text-lg font-black text-slate-900">
                Frontend Preview
              </h2>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Records are held in page memory only. Backend integration is still required.
          </p>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-extrabold text-slate-900">Records</h2>
            <p className="mt-1 text-sm text-slate-500">
              Search, edit, delete and export records.
            </p>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search records..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {config.columns.map((column) => (
                  <th key={column} className="whitespace-nowrap px-5 py-4">
                    {config.labels[column] || column}
                  </th>
                ))}
                {type !== "transactions" && (
                  <th className="px-5 py-4 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={config.columns.length + (type === "transactions" ? 0 : 1)}
                    className="px-5 py-14 text-center"
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="rounded-2xl bg-slate-100 p-4 text-slate-500">
                        <Icon size={26} />
                      </div>
                      <p className="mt-4 font-bold text-slate-800">No records found</p>
                      <p className="mt-1 text-slate-500">
                        Add a record to see it listed here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((record) => (
                  <tr key={record.id} className="border-t border-slate-100 hover:bg-slate-50">
                    {config.columns.map((column) => (
                      <td key={column} className="whitespace-nowrap px-5 py-4 text-slate-700">
                        {column === "amount"
                          ? money(record.amount)
                          : record[column] || "-"}
                      </td>
                    ))}
                    {type !== "transactions" && (
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <button onClick={() => editRecord(record)} className="mr-3 font-bold text-blue-700 hover:underline">
                          Edit
                        </button>
                        <button onClick={() => deleteRecord(record.id)} className="font-bold text-rose-700 hover:underline">
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <form onSubmit={saveRecord} className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {editingId ? "Edit Record" : `Add ${config.title}`}
                </h2>
                <p className="mt-1 text-sm text-slate-500">Enter the record details below.</p>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-2 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {config.fields.map(([field, label]) => (
                <label key={field} className={`block ${["remarks"].includes(field) ? "sm:col-span-2" : ""}`}>
                  <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
                  {field === "category" ? (
                    <select
                      required
                      value={form.category}
                      onChange={(event) => setForm({ ...form, category: event.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-emerald-600"
                    >
                      <option value="">Select category</option>
                      {config.categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  ) : field === "method" ? (
                    <select
                      value={form.method}
                      onChange={(event) => setForm({ ...form, method: event.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-emerald-600"
                    >
                      {["Cash", "UPI", "Bank Transfer", "Card", "Cheque", "Other"].map((method) => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  ) : field === "remarks" ? (
                    <textarea
                      rows={3}
                      value={form.remarks}
                      onChange={(event) => setForm({ ...form, remarks: event.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600"
                    />
                  ) : (
                    <input
                      required={["title", "amount", "date"].includes(field)}
                      type={field === "amount" ? "number" : field === "date" ? "date" : "text"}
                      min={field === "amount" ? "0.01" : undefined}
                      step={field === "amount" ? "0.01" : undefined}
                      value={form[field] || ""}
                      onChange={(event) => setForm({ ...form, [field]: event.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600"
                    />
                  )}
                </label>
              ))}
            </div>

            {error && (
              <p className="mx-5 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 border-t p-5">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border px-5 py-3 font-bold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800">
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}