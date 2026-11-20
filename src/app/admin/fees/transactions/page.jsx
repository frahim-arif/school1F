"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ReceiptText,
  IndianRupee,
  RefreshCw,
  Download,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Wallet,
} from "lucide-react";

const API = (process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com").replace(/\/+$/, "");

const money = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const getStatus = (fee) => {
  const status = String(fee.status || "").toLowerCase();

  if (status === "paid" || (Number(fee.due || 0) <= 0 && Number(fee.paid || 0) > 0)) {
    return "Paid";
  }

  if (status === "partial" || (Number(fee.paid || 0) > 0 && Number(fee.due || 0) > 0)) {
    return "Partial";
  }

  return "Pending";
};

const getStudent = (fee) =>
  fee.studentName ||
  (typeof fee.student === "string" ? fee.student : fee.student?.name) ||
  fee.name ||
  "Unknown Student";

const getClass = (fee) =>
  fee.className ||
  fee.class ||
  fee.student?.className ||
  "—";

export default function PaymentTransactionsPage() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadFees = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/fees`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Payment records load nahi hue"
        );
      }

      const records = Array.isArray(data)
        ? data
        : data.fees || data.records || data.data || [];

      if (!Array.isArray(records)) {
        throw new Error("Backend se fee records ka format sahi nahi mila");
      }

      setFees(records);
    } catch (e) {
      setError(e.message || "Backend se connection nahi hua");
      setFees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFees();
  }, [loadFees]);

  // Existing fee records mein jin par payment hui hai unko dikhayein.
  // Alag-alag installment history ke liye backend mein transaction records zaroori hain.
  const transactions = useMemo(() => {
    return fees
      .filter((fee) => Number(fee.paid || 0) > 0)
      .map((fee, index) => ({
        ...fee,
        _id: fee._id || fee.id || `fee-${index}`,
        _paid: Number(fee.paid || 0),
        _date: fee.paymentDate || fee.date || fee.updatedAt || fee.createdAt || "",
        _method: fee.paymentMethod || "Not specified",
        _status: getStatus(fee),
      }));
  }, [fees]);

  const methods = useMemo(
    () => [...new Set(transactions.map((t) => t._method))].sort(),
    [transactions]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((t) => {
      const date = t._date ? new Date(t._date) : null;
      const validDate = date && !Number.isNaN(date.getTime());
      const start = from ? new Date(`${from}T00:00:00`) : null;
      const end = to ? new Date(`${to}T23:59:59.999`) : null;

      const matchesDate =
        (!start || (validDate && date >= start)) &&
        (!end || (validDate && date <= end));

      const matchesMethod =
        methodFilter === "All" || t._method === methodFilter;

      const matchesStatus =
        statusFilter === "All" || t._status === statusFilter;

      const student = getStudent(t).toLowerCase();
      const admission = String(t.admissionNo || t.admissionNumber || "").toLowerCase();
      const receipt = String(t.receipt || t.receiptNo || "").toLowerCase();

      const matchesSearch =
        !query ||
        student.includes(query) ||
        admission.includes(query) ||
        receipt.includes(query) ||
        getClass(t).toLowerCase().includes(query) ||
        t._method.toLowerCase().includes(query);

      return matchesDate && matchesMethod && matchesStatus && matchesSearch;
    });
  }, [transactions, search, from, to, methodFilter, statusFilter]);

  const stats = useMemo(() => {
    return filtered.reduce(
      (s, t) => {
        s.collected += t._paid;
        s.count += 1;

        if (t._status === "Paid") s.paid += 1;
        else if (t._status === "Partial") s.partial += 1;
        else s.pending += 1;

        return s;
      },
      { collected: 0, count: 0, paid: 0, partial: 0, pending: 0 }
    );
  }, [filtered]);

  function exportCSV() {
    const rows = [
      [
        "Receipt",
        "Admission No",
        "Student",
        "Class",
        "Payment Date",
        "Payment Method",
        "Amount Paid",
        "Status",
      ],
      ...filtered.map((t) => [
        t.receipt || t.receiptNo || "",
        t.admissionNo || t.admissionNumber || "",
        getStudent(t),
        getClass(t),
        t._date ? formatDate(t._date) : "",
        t._method,
        t._paid,
        t._status,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    );

    const a = document.createElement("a");
    a.href = url;
    a.download = "payment-transactions.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function clearFilters() {
    setSearch("");
    setFrom("");
    setTo("");
    setMethodFilter("All");
    setStatusFilter("All");
  }

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 text-slate-800 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/fees"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-700"
          >
            <ArrowLeft size={16} />
            Back to Fee Collection
          </Link>

          <div className="flex items-center gap-2 text-emerald-700">
            <ReceiptText size={26} />
            <h1 className="text-2xl font-bold">Payment Transactions</h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            View collected payments, receipts and payment methods
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportCSV}
            disabled={loading || filtered.length === 0}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={17} />
            Export CSV
          </button>

          <button
            onClick={loadFees}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Unable to load payment records</p>
            <p className="mt-1">{error}</p>
            <button
              onClick={loadFees}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={<Wallet size={22} />}
          label="Total Collected"
          value={money(stats.collected)}
          color="green"
        />
        <Stat
          icon={<ReceiptText size={22} />}
          label="Payment Records"
          value={stats.count}
          color="blue"
        />
        <Stat
          icon={<CheckCircle2 size={22} />}
          label="Fully Paid"
          value={stats.paid}
          color="green"
        />
        <Stat
          icon={<Clock size={22} />}
          label="Partial Payments"
          value={stats.partial}
          color="amber"
        />
      </div>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold">Filter Payment Records</h2>
          <button
            onClick={clearFilters}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            Clear Filters
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <label className="text-xs font-medium text-slate-500 xl:col-span-2">
            Search
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-200 px-3">
              <Search size={17} className="shrink-0 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Student, admission no., receipt..."
                className="w-full py-2.5 text-sm outline-none"
              />
            </div>
          </label>

          <label className="text-xs font-medium text-slate-500">
            From Date
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            />
          </label>

          <label className="text-xs font-medium text-slate-500">
            To Date
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            />
          </label>

          <label className="text-xs font-medium text-slate-500">
            Payment Method
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="All">All Methods</option>
              {methods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-medium text-slate-500">
            Status
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm sm:col-span-2 xl:col-span-1"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
            </select>
          </label>
        </div>

        <p className="text-sm text-slate-500">
          {loading ? "Loading records..." : `${filtered.length} payment records found`}
        </p>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-bold">Transaction History</h2>
            <p className="mt-1 text-sm text-slate-500">
              Payments recorded in the existing fee records
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Filtered collection</p>
            <p className="text-lg font-bold text-emerald-700">
              {money(stats.collected)}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-600">
              <tr>
                {[
                  "Receipt",
                  "Student",
                  "Class",
                  "Payment Date",
                  "Method",
                  "Amount Paid",
                  "Status",
                ].map((heading) => (
                  <th key={heading} className="px-5 py-4">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500">
                    <RefreshCw size={20} className="mx-auto mb-2 animate-spin" />
                    Loading payment records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center">
                    <ReceiptText size={30} className="mx-auto mb-3 text-slate-300" />
                    <p className="font-semibold text-slate-600">
                      No payment records found
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Try changing the filters or check whether payments exist in Fee Collection.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-700">
                        {t.receipt || t.receiptNo || "—"}
                      </span>
                      <p className="mt-1 text-xs text-slate-400">
                        {t.admissionNo || t.admissionNumber || ""}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold">{getStudent(t)}</p>
                    </td>

                    <td className="px-5 py-4">{getClass(t)}</td>

                    <td className="px-5 py-4">
                      {formatDate(t._date)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {t._method}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-bold text-emerald-700">
                      {money(t._paid)}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={t._status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {!loading && filtered.length > 0 && (
              <tfoot className="bg-slate-50 font-bold">
                <tr>
                  <td colSpan={5} className="px-5 py-4 text-right">
                    Total Collected
                  </td>
                  <td className="px-5 py-4 text-emerald-700">
                    {money(stats.collected)}
                  </td>
                  <td className="px-5 py-4">—</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>

      <p className="text-xs leading-5 text-slate-500">
        Note: This page uses the existing <code>/api/fees</code> records.
        If your backend stores only the current total paid per fee record,
        this table represents fee payment records, not a separate history of
        every installment. For individual installment transactions, a dedicated
        backend transaction model and API will be needed.
      </p>
    </div>
  );
}

function Stat({ icon, label, value, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
      <div className={`rounded-xl p-3 ${colors[color]}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 break-words text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Partial: "bg-amber-50 text-amber-700 ring-amber-200",
    Pending: "bg-red-50 text-red-700 ring-red-200",
  };

  const Icon =
    status === "Paid"
      ? CheckCircle2
      : status === "Partial"
      ? Clock
      : AlertCircle;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
        styles[status] || styles.Pending
      }`}
    >
      <Icon size={13} />
      {status}
    </span>
  );
}
