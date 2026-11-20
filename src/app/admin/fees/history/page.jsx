"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  History,
  Receipt,
  IndianRupee,
  CalendarDays,
  Eye,
  Printer,
  X,
  Download,
} from "lucide-react";

const API = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/+$/, "");

const money = (value) =>
  "₹" + Number(value || 0).toLocaleString("en-IN");

const dateText = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN");
};

function getFeeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.fees)) return data.fees;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.fees)) return data.data.fees;
  if (Array.isArray(data?.data?.records)) return data.data.records;

  return [];
}

export default function FeeHistoryPage() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState(null);

  const loadFees = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/api/fees`, {
        cache: "no-store",
      });

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          `Backend ne JSON response nahi diya (HTTP ${response.status}). API URL check karein.`
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Fees load nahi hui (HTTP ${response.status})`
        );
      }

      const list = getFeeList(data);

      // Some APIs return { success, data } or { _status, _data }.
      if (!list.length && data?._data) {
        const nestedList = getFeeList(data._data);
        setFees(nestedList);
      } else {
        setFees(list);
      }

      if (
        data?._status === false ||
        data?.success === false
      ) {
        throw new Error(
          data?._message || data?.message || "Fees load nahi hui."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Backend se connection nahi hua."
      );
      setFees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFees();
  }, [loadFees]);

  const filtered = useMemo(() => {
    return fees.filter((fee) => {
      const query = search.toLowerCase().trim();

      const searchableText = [
        fee.receipt,
        fee.student,
        fee.studentName,
        fee.admissionNo,
        fee.className,
        fee.paymentMethod,
        fee.collectedBy,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const paymentDate = fee.paymentDate
        ? new Date(fee.paymentDate)
        : null;

      const startDate = from
        ? new Date(`${from}T00:00:00`)
        : null;

      const endDate = to
        ? new Date(`${to}T23:59:59.999`)
        : null;

      const validPaymentDate =
        paymentDate && !Number.isNaN(paymentDate.getTime());

      return (
        (!query || searchableText.includes(query)) &&
        (status === "All" ||
          (fee.status || "Pending") === status) &&
        (!startDate ||
          (validPaymentDate && paymentDate >= startDate)) &&
        (!endDate ||
          (validPaymentDate && paymentDate <= endDate))
      );
    });
  }, [fees, search, status, from, to]);

  const totalPaid = filtered.reduce(
    (sum, fee) => sum + Number(fee.paid || 0),
    0
  );

  const totalDue = filtered.reduce(
    (sum, fee) => sum + Number(fee.due || 0),
    0
  );

  function clearFilters() {
    setSearch("");
    setStatus("All");
    setFrom("");
    setTo("");
  }

  function exportCSV() {
    const rows = [
      [
        "Receipt",
        "Student",
        "Admission No",
        "Class",
        "Total Fee",
        "Paid",
        "Due",
        "Status",
        "Payment Method",
        "Date",
      ],
      ...filtered.map((fee) => [
        fee.receipt || "",
        fee.student || fee.studentName || "",
        fee.admissionNo || "",
        fee.className || "",
        fee.amount || 0,
        fee.paid || 0,
        fee.due || 0,
        fee.status || "Pending",
        fee.paymentMethod || "",
        dateText(fee.paymentDate),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "fee-history.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }

  function printReceipt(fee) {
    const printWindow = window.open(
      "",
      "_blank",
      "width=700,height=800"
    );

    if (!printWindow) {
      setError(
        "Print window block ho gayi. Browser mein pop-ups allow karein."
      );
      return;
    }

    // Escape user-provided values before inserting them into HTML.
    const escapeHTML = (value) =>
      String(value ?? "—").replace(/[&<>"']/g, (character) => {
        const entities = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        };
        return entities[character];
      });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fee Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 35px; color: #172d27; }
            h1 { text-align: center; }
            hr { border: 1px solid #ddd; }
            table { width: 100%; border-collapse: collapse; margin-top: 25px; }
            td { padding: 12px; border: 1px solid #ddd; }
            .center { text-align: center; margin-top: 25px; }
          </style>
        </head>
        <body>
          <h1>Fee Payment Receipt</h1>
          <hr />
          <p><b>Receipt:</b> ${escapeHTML(fee.receipt)}</p>
          <p><b>Date:</b> ${escapeHTML(dateText(fee.paymentDate))}</p>
          <p><b>Student:</b> ${escapeHTML(fee.student || fee.studentName)}</p>
          <p><b>Admission No:</b> ${escapeHTML(fee.admissionNo)}</p>
          <p><b>Class:</b> ${escapeHTML(fee.className)}</p>
          <table>
            <tr><td>Total Fee</td><td>${escapeHTML(money(fee.amount))}</td></tr>
            <tr><td>Paid</td><td>${escapeHTML(money(fee.paid))}</td></tr>
            <tr><td>Due</td><td>${escapeHTML(money(fee.due))}</td></tr>
            <tr><td>Status</td><td>${escapeHTML(fee.status || "Pending")}</td></tr>
            <tr><td>Payment Method</td><td>${escapeHTML(fee.paymentMethod)}</td></tr>
          </table>
          <p class="center">Thank you.</p>
          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  }

  const statusClass = (value) => {
    if (value === "Paid") {
      return "bg-emerald-100 text-emerald-700";
    }

    if (value === "Partial") {
      return "bg-amber-100 text-amber-700";
    }

    return "bg-red-100 text-red-700";
  };

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 text-slate-800 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700">
            <History size={25} />
            <h1 className="text-2xl font-bold">Fee History</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            All fee records and payment details
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportCSV}
            disabled={!filtered.length}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={17} />
            Export CSV
          </button>

          <button
            type="button"
            onClick={loadFees}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          icon={<Receipt size={22} />}
          label="Fee Records"
          value={filtered.length}
        />
        <Stat
          icon={<IndianRupee size={22} />}
          label="Amount Collected"
          value={money(totalPaid)}
        />
        <Stat
          icon={<CalendarDays size={22} />}
          label="Outstanding Due"
          value={money(totalDue)}
        />
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search
            className="absolute left-3 top-3 text-slate-400"
            size={18}
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search student, receipt, admission no..."
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 outline-none focus:border-emerald-600"
          />
        </div>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2.5 outline-none"
        >
          <option value="All">All statuses</option>
          <option value="Paid">Paid</option>
          <option value="Partial">Partial</option>
          <option value="Pending">Pending</option>
        </select>

        <button
          type="button"
          onClick={clearFilters}
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold hover:bg-slate-50"
        >
          Clear Filters
        </button>

        <label className="text-xs text-slate-500">
          From date
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(event) => setFrom(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>

        <label className="text-xs text-slate-500">
          To date
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(event) => setTo(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={loadFees}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-600">
              <tr>
                {[
                  "Receipt / Date",
                  "Student",
                  "Class",
                  "Total Fee",
                  "Paid",
                  "Due",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-4">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center">
                    Loading fee history...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="p-10 text-center text-slate-500"
                  >
                    {error ? "Unable to load fee records." : "No fee records found."}
                  </td>
                </tr>
              ) : (
                filtered.map((fee, index) => (
                  <tr
                    key={fee._id || fee.id || fee.receipt || index}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-4 py-4">
                      <b>{fee.receipt || "—"}</b>
                      <div className="mt-1 text-xs text-slate-500">
                        {dateText(fee.paymentDate)}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <b>{fee.student || fee.studentName || "—"}</b>
                      <div className="mt-1 text-xs text-slate-500">
                        {fee.admissionNo || "—"}
                      </div>
                    </td>

                    <td className="px-4 py-4">{fee.className || "—"}</td>
                    <td className="px-4 py-4">{money(fee.amount)}</td>
                    <td className="px-4 py-4 font-semibold text-emerald-700">
                      {money(fee.paid)}
                    </td>
                    <td className="px-4 py-4 font-semibold text-red-600">
                      {money(fee.due)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                          fee.status
                        )}`}
                      >
                        {fee.status || "Pending"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          title="View details"
                          onClick={() => setSelected(fee)}
                          className="rounded-lg border p-2 hover:bg-slate-100"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          title="Print receipt"
                          onClick={() => printReceipt(fee)}
                          className="rounded-lg border p-2 hover:bg-slate-100"
                        >
                          <Printer size={16} />
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

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="fee-details-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 id="fee-details-title" className="text-xl font-bold">
                Fee Details
              </h2>
              <button
                type="button"
                aria-label="Close fee details"
                onClick={() => setSelected(null)}
              >
                <X />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["Receipt", selected.receipt],
                ["Student", selected.student || selected.studentName],
                ["Admission No", selected.admissionNo],
                ["Class", selected.className],
                ["Payment Date", dateText(selected.paymentDate)],
                ["Payment Method", selected.paymentMethod],
                ["Total Fee", money(selected.amount)],
                ["Paid", money(selected.paid)],
                ["Due", money(selected.due)],
                ["Status", selected.status || "Pending"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">{label}</div>
                  <div className="mt-1 break-words font-semibold">
                    {value || "—"}
                  </div>
                </div>
              ))}
            </div>

            {selected.remarks && (
              <p className="mt-4 text-sm">
                <b>Remarks:</b> {selected.remarks}
              </p>
            )}

            <button
              type="button"
              onClick={() => printReceipt(selected)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 py-3 font-semibold text-white"
            >
              <Printer size={17} />
              Print Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
      <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}