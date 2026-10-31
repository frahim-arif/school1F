"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserRound,
  Receipt,
  IndianRupee,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const initialForm = {
  admissionNo: "",
  student: "",
  className: "",
  amount: "",
  paid: "",
  paymentMethod: "Cash",
  paymentDate: new Date().toISOString().slice(0, 10),
  remarks: "",
};

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export default function CollectFeePage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);

  const total = Number(form.amount) || 0;
  const paid = Number(form.paid) || 0;
  const due = Math.max(0, total - paid);

  const status =
    total > 0 && due === 0
      ? "Paid"
      : paid > 0
      ? "Partial"
      : "Pending";

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
    setReceipt(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setReceipt(null);

    if (!form.admissionNo.trim()) {
      setError("Admission number enter karein.");
      return;
    }

    if (!form.student.trim()) {
      setError("Student ka naam enter karein.");
      return;
    }

    if (!form.className.trim()) {
      setError("Student ki class enter karein.");
      return;
    }

    if (!Number.isFinite(total) || total <= 0) {
      setError("Total fee zero se zyada honi chahiye.");
      return;
    }

    if (!Number.isFinite(paid) || paid < 0 || paid > total) {
      setError("Paid amount zero aur total fee ke beech honi chahiye.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/fees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          admissionNo: form.admissionNo.trim(),
          student: form.student.trim(),
          className: form.className.trim(),
          amount: total,
          paid,
          paymentMethod: form.paymentMethod,
          paymentDate: paid > 0 ? form.paymentDate : null,
          remarks: form.remarks.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
            data.error ||
            data._message ||
            "Fee save nahi ho saki."
        );
      }

      const savedFee = data.fee || data.data || data;

      setReceipt(savedFee);
      setMessage(
        `Fee successfully save ho gayi. Receipt: ${
          savedFee.receipt || "Generated"
        }`
      );
    } catch (err) {
      setError(
        err.message ||
          "Backend se connection nahi ho raha. Server check karein."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const printReceipt = () => {
    if (!receipt) return;

    const printWindow = window.open("", "_blank", "width=800,height=700");

    if (!printWindow) {
      setError("Receipt print karne ke liye browser pop-ups allow karein.");
      return;
    }

    const escapeHtml = (value) =>
      String(value ?? "").replace(/[&<>"']/g, (character) => {
        const entities = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        };

        return entities[character];
      });

    const rows = [
      ["Receipt Number", receipt.receipt || "-"],
      ["Student", receipt.student || form.student],
      ["Admission Number", receipt.admissionNo || form.admissionNo],
      ["Class", receipt.className || receipt.class || form.className],
      ["Total Fee", money(receipt.amount ?? total)],
      ["Paid Amount", money(receipt.paid ?? paid)],
      ["Balance Due", money(receipt.due ?? due)],
      ["Payment Date", form.paymentDate || "-"],
      ["Payment Method", receipt.paymentMethod || form.paymentMethod],
      ["Status", receipt.status || status],
      ["Remarks", receipt.remarks || form.remarks || "-"],
    ];

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fee Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 35px; color: #172033; }
            h1, .subtitle { text-align: center; }
            .subtitle { color: #64748b; }
            table { width: 100%; border-collapse: collapse; margin-top: 28px; }
            td { padding: 12px; border: 1px solid #ddd; }
            td:first-child { width: 40%; font-weight: bold; background: #f8fafc; }
            .signatures { display: flex; justify-content: space-between; margin-top: 55px; }
          </style>
        </head>
        <body>
          <h1>School Fee Receipt</h1>
          <p class="subtitle">Official Payment Receipt</p>
          <table>
            ${rows
              .map(
                ([label, value]) =>
                  `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(
                    value
                  )}</td></tr>`
              )
              .join("")}
          </table>
          <div class="signatures">
            <span>Parent/Guardian Signature</span>
            <span>Authorized Signature</span>
          </div>
          <script>window.onload = () => window.print();<\/script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/fees"
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-700"
          >
            <ArrowLeft size={17} />
            Back to Fee Collection
          </Link>

          <h1 className="text-3xl font-black text-slate-800">
            Collect Student Fee
          </h1>

          <p className="mt-2 text-slate-500">
            Enter student details and record a fee payment.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
          <Receipt size={20} />
          <span className="font-semibold">New Fee Receipt</span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
        >
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {message && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
        >
          <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{message}</p>
            <p className="mt-1 text-sm">
              Receipt number: {receipt?.receipt || "-"}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Student details */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center gap-3 border-b pb-4">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                <UserRound size={22} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Student Details
                </h2>
                <p className="text-sm text-slate-500">
                  Enter the student's admission information.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Admission Number" required>
                <input
                  name="admissionNo"
                  value={form.admissionNo}
                  onChange={updateField}
                  placeholder="e.g. SCH001"
                  required
                  maxLength={50}
                  className={inputClass}
                />
              </Field>

              <Field label="Student Name" required>
                <input
                  name="student"
                  value={form.student}
                  onChange={updateField}
                  placeholder="Enter full name"
                  required
                  maxLength={120}
                  className={inputClass}
                />
              </Field>

              <Field label="Class / Grade" required>
                <input
                  name="className"
                  value={form.className}
                  onChange={updateField}
                  placeholder="e.g. Class 10"
                  required
                  maxLength={80}
                  className={inputClass}
                />
              </Field>
            </div>
          </section>

          {/* Payment details */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center gap-3 border-b pb-4">
              <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                <CreditCard size={22} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Payment Details
                </h2>
                <p className="text-sm text-slate-500">
                  Enter the total fee and amount received.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Total Fee (₹)" required>
                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={updateField}
                  placeholder="Enter total fee"
                  required
                  className={inputClass}
                />
              </Field>

              <Field label="Amount Received (₹)" required>
                <input
                  name="paid"
                  type="number"
                  min="0"
                  max={form.amount || undefined}
                  step="0.01"
                  value={form.paid}
                  onChange={updateField}
                  placeholder="Enter amount received"
                  required
                  className={inputClass}
                />
              </Field>

              <Field label="Payment Method" required>
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={updateField}
                  className={inputClass}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </Field>

              <Field label="Payment Date">
                <div className="relative">
                  <CalendarDays
                    size={18}
                    className="pointer-events-none absolute left-3 top-3.5 text-slate-400"
                  />
                  <input
                    name="paymentDate"
                    type="date"
                    value={form.paymentDate}
                    onChange={updateField}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </Field>

              <div className="sm:col-span-2">
                <Field label="Remarks (Optional)">
                  <textarea
                    name="remarks"
                    value={form.remarks}
                    onChange={updateField}
                    placeholder="Installment details or other notes..."
                    rows={3}
                    maxLength={1000}
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/fees"
              className="rounded-xl border bg-white px-6 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <LoaderCircle size={19} className="animate-spin" />
                  Saving Fee...
                </>
              ) : (
                <>
                  <IndianRupee size={19} />
                  Save Fee & Generate Receipt
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live summary */}
        <aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-6">
          <h2 className="text-lg font-bold text-slate-800">
            Payment Summary
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Amounts update automatically.
          </p>

          <div className="mt-6 space-y-4">
            <SummaryRow label="Total Fee" value={money(total)} />

            <SummaryRow
              label="Amount Received"
              value={money(paid)}
              valueClass="text-emerald-600"
            />

            <div className="border-t pt-4">
              <SummaryRow
                label="Remaining Due"
                value={money(due)}
                valueClass={due > 0 ? "text-red-600" : "text-emerald-600"}
                large
              />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 p-4">
            <span className="text-sm text-slate-600">Payment Status</span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                status === "Paid"
                  ? "bg-emerald-100 text-emerald-700"
                  : status === "Partial"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {status}
            </span>
          </div>

          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
            {paid === 0
              ? "No payment received yet. This record will be marked Pending."
              : due === 0
              ? "Full payment received. This record will be marked Paid."
              : "Partial payment received. The remaining balance will be marked Due."}
          </div>

          {receipt && (
            <button
              type="button"
              onClick={printReceipt}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              <Receipt size={18} />
              Print Saved Receipt
            </button>
          )}
        </aside>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function SummaryRow({ label, value, valueClass = "", large = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span
        className={`font-bold ${large ? "text-xl" : "text-base"} ${
          valueClass || "text-slate-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}