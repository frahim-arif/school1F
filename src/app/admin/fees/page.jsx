"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Eye,
  Printer,
  CircleDollarSign,
  RefreshCw,
  X,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/+$/, "");

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatus = (fee) => {
  if (fee.status) return fee.status;

  if (Number(fee.due) <= 0) return "Paid";
  if (Number(fee.paid) > 0) return "Partial";

  return "Pending";
};

export default function FeesPage() {
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    collected: 0,
    pending: 0,
    todayCollection: 0,
  });

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedFee, setSelectedFee] = useState(null);

  const loadFees = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);

    setError("");

    try {
      const [feesResponse, summaryResponse] = await Promise.all([
        fetch(`${API_BASE}/api/fees`, { cache: "no-store" }),
        fetch(`${API_BASE}/api/fees/summary`, { cache: "no-store" }),
      ]);

      const feesData = await feesResponse.json();
      const summaryData = await summaryResponse.json();

      if (!feesResponse.ok) {
        throw new Error(feesData.message || feesData.error || "Fees load nahi hui.");
      }

      if (!summaryResponse.ok) {
        throw new Error(
          summaryData.message ||
            summaryData.error ||
            "Fee summary load nahi hui."
        );
      }

      setFees(Array.isArray(feesData.fees) ? feesData.fees : []);

      const data = summaryData.summary || summaryData;

      setSummary({
        totalAmount: Number(data.totalAmount) || 0,
        collected: Number(data.collected) || 0,
        pending:
          data.pending !== undefined
            ? Number(data.pending) || 0
            : Math.max(
                0,
                (Number(data.totalAmount) || 0) -
                  (Number(data.collected) || 0)
              ),
        todayCollection: Number(data.todayCollection) || 0,
      });
    } catch (err) {
      setError(
        err.message ||
          "Backend se connection nahi ho raha. Server check karein."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFees();
  }, [loadFees]);

  const filteredFees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return fees;

    return fees.filter((fee) =>
      [
        fee.receipt,
        fee.admissionNo,
        fee.student,
        fee.className,
        fee.class,
        getStatus(fee),
      ].some((value) => String(value || "").toLowerCase().includes(query))
    );
  }, [fees, search]);

  const refresh = () => {
    setRefreshing(true);
    loadFees(false);
  };

  const printReceipt = (fee) => {
    const receiptWindow = window.open("", "_blank", "width=800,height=700");

    if (!receiptWindow) {
      alert("Receipt print karne ke liye browser mein pop-ups allow karein.");
      return;
    }

    const details = [
      ["Receipt No.", fee.receipt],
      ["Student Name", fee.student],
      ["Admission No.", fee.admissionNo],
      ["Class", fee.className || fee.class || "-"],
      ["Total Fee", formatMoney(fee.amount)],
      ["Paid Amount", formatMoney(fee.paid)],
      ["Due Amount", formatMoney(fee.due)],
      ["Payment Date", formatDate(fee.paymentDate || fee.date)],
      ["Payment Method", fee.paymentMethod || "-"],
      ["Status", getStatus(fee)],
    ];

    const rows = details
      .map(
        ([label, value]) =>
          `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`
      )
      .join("");

    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fee Receipt - ${escapeHtml(fee.receipt || "")}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 35px; color: #172033; }
            h1 { text-align: center; margin-bottom: 5px; }
            p { text-align: center; color: #64748b; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            td { padding: 13px; border: 1px solid #ddd; }
            td:first-child { font-weight: bold; width: 40%; background: #f8fafc; }
            .footer { margin-top: 45px; display: flex; justify-content: space-between; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>School Fee Receipt</h1>
          <p>Official Fee Payment Record</p>
          <table>${rows}</table>
          <div class="footer">
            <span>Parent/Guardian Signature</span>
            <span>Authorized Signature</span>
          </div>
          <script>window.onload = () => window.print();<\/script>
        </body>
      </html>
    `);

    receiptWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Fee Collection
          </h1>
          <p className="mt-2 text-slate-500">
            Manage student fee payments
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>

          <Link
            href="/admin/fees/collect"
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            <Plus size={18} />
            Collect Fee
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <Card
          title="Collected"
          value={formatMoney(summary.collected)}
          color="emerald"
        />

        <Card
          title="Pending"
          value={formatMoney(summary.pending)}
          color="red"
        />

        <Card
          title="Today's Collection"
          value={formatMoney(summary.todayCollection)}
          color="blue"
        />
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => loadFees()}
            className="shrink-0 font-semibold underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Search */}
      <div className="rounded-2xl border bg-white p-5">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-4 top-3.5 text-gray-400"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search student, admission no. or receipt..."
            aria-label="Search fees"
            className="w-full rounded-xl border py-3 pl-11 pr-4 outline-none focus:border-emerald-500"
          />
        </div>

        <p className="mt-3 text-sm text-slate-500">
          Showing {filteredFees.length} of {fees.length} fee records
        </p>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-100">
              <tr>
                {[
                  "Receipt",
                  "Student",
                  "Class",
                  "Amount",
                  "Paid",
                  "Due",
                  "Status",
                  "Action",
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`whitespace-nowrap px-5 py-4 text-left text-sm font-bold text-slate-600 ${
                      heading === "Action" ? "text-center" : ""
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
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    Loading fee records...
                  </td>
                </tr>
              ) : filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    {search
                      ? "Aapki search se koi fee record nahi mila."
                      : "Abhi koi fee record nahi hai. Collect Fee se pehli entry add karein."}
                  </td>
                </tr>
              ) : (
                filteredFees.map((item) => {
                  const status = getStatus(item);

                  return (
                    <tr
                      key={item._id || item.id || item.receipt}
                      className="border-t hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-700">
                        {item.receipt || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <div>
                          <h4 className="font-semibold text-slate-800">
                            {item.student || "-"}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {item.admissionNo || "-"}
                          </p>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        {item.className || item.class || "-"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        {formatMoney(item.amount)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-bold text-green-600">
                        {formatMoney(item.paid)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-bold text-red-600">
                        {formatMoney(item.due)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                            status === "Paid"
                              ? "bg-green-100 text-green-700"
                              : status === "Partial"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            title="View receipt details"
                            aria-label={`View ${item.receipt}`}
                            onClick={() => setSelectedFee(item)}
                            className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            type="button"
                            title="Print receipt"
                            aria-label={`Print ${item.receipt}`}
                            onClick={() => printReceipt(item)}
                            className="rounded-lg bg-emerald-100 p-2 text-emerald-600 hover:bg-emerald-200"
                          >
                            <Printer size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View receipt modal */}
      {selectedFee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedFee(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="fee-details-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 id="fee-details-title" className="text-xl font-bold text-slate-800">
                  Fee Receipt Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedFee.receipt}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFee(null)}
                aria-label="Close receipt details"
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {[
                ["Student", selectedFee.student],
                ["Admission No.", selectedFee.admissionNo],
                ["Class", selectedFee.className || selectedFee.class],
                ["Total Amount", formatMoney(selectedFee.amount)],
                ["Paid", formatMoney(selectedFee.paid)],
                ["Due", formatMoney(selectedFee.due)],
                ["Payment Date", formatDate(selectedFee.paymentDate || selectedFee.date)],
                ["Payment Method", selectedFee.paymentMethod || "-"],
                ["Status", getStatus(selectedFee)],
                ["Remarks", selectedFee.remarks || "-"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4 border-b pb-3 text-sm"
                >
                  <span className="text-slate-500">{label}</span>
                  <span className="text-right font-semibold text-slate-800">
                    {value || "-"}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => printReceipt(selectedFee)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              <Printer size={18} />
              Print Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, value, color }) {
  const colors = {
    emerald: "bg-emerald-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
  };

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-slate-500">{title}</p>
          <h2 className="mt-3 text-2xl font-black text-slate-800 sm:text-3xl">
            {value}
          </h2>
        </div>

        <div className={`shrink-0 rounded-2xl p-4 text-white ${colors[color]}`}>
          <CircleDollarSign size={30} />
        </div>
      </div>
    </div>
  );
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}