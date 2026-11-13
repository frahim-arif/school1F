"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  RefreshCw,
  UserRound,
  Eye,
  GraduationCap,
  Users,
  AlertCircle,
  X,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  Heart,
  User,
  ReceiptText,
  IndianRupee,
  Wallet,
  Clock3,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/+$/, "");

const API_ROOT = API_BASE.endsWith("/api")
  ? API_BASE
  : `${API_BASE}/api`;

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("en-IN");
}

export default function StudentDetailsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fee Details State
  const [feeRecords, setFeeRecords] = useState([]);
  const [feeLoading, setFeeLoading] = useState(false);
  const [feeError, setFeeError] = useState("");

  async function loadStudents() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_ROOT}/students`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Students load nahi hue.");
      }

      setStudents(
        Array.isArray(data.students) ? data.students : []
      );
    } catch (err) {
      setError(err.message || "Error loading students.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  // Load only the selected student's fee records and transactions.
  useEffect(() => {
    if (!selected?._id) {
      setFeeRecords([]);
      setFeeError("");
      return;
    }

    let cancelled = false;

    async function loadStudentFees() {
      setFeeLoading(true);
      setFeeError("");
      setFeeRecords([]);

      try {
        if (!selected.admissionNo) {
          throw new Error("Student admission number is missing.");
        }

        const params = new URLSearchParams({
          search: selected.admissionNo,
        });

        const response = await fetch(
          `${API_ROOT}/fees?${params.toString()}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Fee records load nahi hue."
          );
        }

        const allFees = Array.isArray(data.fees)
          ? data.fees
          : [];

        // Exact student matching. Do not show another student's fee.
        const matchingFees = allFees.filter((fee) => {
          if (fee.studentId) {
            return (
              String(fee.studentId) === String(selected._id)
            );
          }

          return (
            String(fee.admissionNo || "").trim().toLowerCase() ===
            String(selected.admissionNo || "").trim().toLowerCase()
          );
        });

        // Load installment/payment history separately for each receipt.
        const feesWithTransactions = await Promise.all(
          matchingFees.map(async (fee) => {
            try {
              const transactionResponse = await fetch(
                `${API_ROOT}/fees/${fee._id}/transactions`,
                { cache: "no-store" }
              );

              const transactionData =
                await transactionResponse.json();

              return {
                ...fee,
                transactions:
                  transactionResponse.ok &&
                  transactionData.success &&
                  Array.isArray(transactionData.transactions)
                    ? transactionData.transactions
                    : [],
                transactionError: !transactionResponse.ok,
              };
            } catch {
              return {
                ...fee,
                transactions: [],
                transactionError: true,
              };
            }
          })
        );

        if (!cancelled) {
          setFeeRecords(feesWithTransactions);
        }
      } catch (err) {
        if (!cancelled) {
          setFeeError(
            err.message || "Unable to load student fee details."
          );
        }
      } finally {
        if (!cancelled) {
          setFeeLoading(false);
        }
      }
    }

    loadStudentFees();

    return () => {
      cancelled = true;
    };
  }, [selected?._id, selected?.admissionNo]);

  const feeSummary = useMemo(() => {
    return feeRecords.reduce(
      (summary, fee) => ({
        totalFee: summary.totalFee + Number(fee.amount || 0),
        totalPaid: summary.totalPaid + Number(fee.paid || 0),
        totalDue: summary.totalDue + Number(fee.due || 0),
      }),
      {
        totalFee: 0,
        totalPaid: 0,
        totalDue: 0,
      }
    );
  }, [feeRecords]);

  const classes = useMemo(
    () =>
      [...new Set(
        students.map((s) => s.className).filter(Boolean)
      )].sort(),
    [students]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return students.filter((s) => {
      const name = `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase();

      const matchesSearch =
        !q ||
        name.includes(q) ||
        String(s.admissionNo || "").toLowerCase().includes(q) ||
        String(s.phone || "").includes(q) ||
        String(s.rollNo || "").includes(q);

      const matchesClass =
        !classFilter || s.className === classFilter;

      return matchesSearch && matchesClass;
    });
  }, [students, search, classFilter]);

  const activeCount = students.filter(
    (s) => s.status === "Active"
  ).length;

  return (
    <div className="min-h-screen space-y-5 bg-slate-50 p-4 text-slate-800 sm:p-6">

      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <GraduationCap size={18} />
            Student Management
          </p>

          <h1 className="text-2xl font-bold sm:text-3xl">
            Student Details
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Student records aur personal details dekhein.
          </p>
        </div>

        <button
          onClick={loadStudents}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-100 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Total Students"
          value={students.length}
          icon={<Users size={20} />}
        />

        <Stat
          label="Active Students"
          value={activeCount}
          icon={<UserRound size={20} />}
        />

        <Stat
          label="Total Classes"
          value={classes.length}
          icon={<GraduationCap size={20} />}
        />
      </div>

      {/* Student Table */}
      <section className="border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-4 sm:flex-row">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, admission no, phone..."
              className="w-full border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600"
            />
          </div>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
          >
            <option value="">All Classes</option>

            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {filtered.length}
            </span>{" "}
            of {students.length} students
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Admission No.</th>
                <th className="px-4 py-3">Roll No.</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr
                  key={s._id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border border-slate-200 bg-slate-100 text-slate-500">
                        {s.photo ? (
                          <img
                            src={s.photo}
                            alt={s.firstName || "Student"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserRound size={18} />
                        )}
                      </div>

                      <span className="font-semibold">
                        {s.firstName} {s.lastName}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {s.admissionNo || "-"}
                  </td>

                  <td className="px-4 py-3">
                    {s.rollNo ?? "-"}
                  </td>

                  <td className="px-4 py-3">
                    {s.className || "-"} / {s.section || "-"}
                  </td>

                  <td className="px-4 py-3">
                    {s.phone || "-"}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-semibold ${
                        s.status === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {s.status || "Unknown"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(s)}
                      className="inline-flex items-center gap-1 border border-slate-200 px-3 py-2 text-xs font-semibold transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    No students found.
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    Loading students...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Student Details Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-4xl overflow-y-auto border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Student Profile
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  {selected.firstName} {selected.lastName}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Admission No: {selected.admissionNo || "-"}
                </p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="border border-slate-200 p-2 transition hover:bg-slate-100"
                aria-label="Close details"
              >
                <X size={19} />
              </button>
            </div>

            {/* Profile */}
            <div className="flex flex-col items-center gap-3 border-b border-slate-100 bg-slate-50 p-5 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border border-slate-200 bg-white">
                {selected.photo ? (
                  <img
                    src={selected.photo}
                    alt="Student"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound size={35} className="text-slate-400" />
                )}
              </div>

              <div className="text-center sm:text-left">
                <h3 className="text-lg font-bold">
                  {selected.firstName} {selected.lastName}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {selected.className || "-"} / {selected.section || "-"}
                  {" "} · Roll No: {selected.rollNo ?? "-"}
                </p>

                <span
                  className={`mt-2 inline-block px-2 py-1 text-xs font-semibold ${
                    selected.status === "Active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {selected.status || "Unknown"}
                </span>
              </div>
            </div>

            {/* Personal Information */}
            <div className="p-5">
              <h3 className="mb-4 flex items-center gap-2 font-bold">
                <User size={17} className="text-emerald-700" />
                Personal Information
              </h3>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="First Name" value={selected.firstName} />
                <Detail label="Last Name" value={selected.lastName} />
                <Detail label="Admission Number" value={selected.admissionNo} />
                <Detail label="Roll Number" value={selected.rollNo} />
                <Detail label="Gender" value={selected.gender} />

                <Detail
                  label="Date of Birth"
                  value={
                    selected.dob
                      ? new Date(selected.dob).toLocaleDateString("en-IN")
                      : "-"
                  }
                />

                <Detail label="Blood Group" value={selected.bloodGroup} />
                <Detail label="Aadhaar" value={selected.aadhaar} />
                <Detail label="Session" value={selected.session} />
              </div>

              <div className="my-5 border-t border-slate-100" />

              <h3 className="mb-4 flex items-center gap-2 font-bold">
                <Heart size={17} className="text-emerald-700" />
                Parent Information
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <Detail label="Father Name" value={selected.fatherName} />
                <Detail label="Mother Name" value={selected.motherName} />
              </div>

              <div className="my-5 border-t border-slate-100" />

              <h3 className="mb-4 flex items-center gap-2 font-bold">
                <Phone size={17} className="text-emerald-700" />
                Contact Information
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <Detail
                  label="Phone"
                  value={selected.phone}
                  icon={<Phone size={15} />}
                />

                <Detail
                  label="Email"
                  value={selected.email}
                  icon={<Mail size={15} />}
                />

                <div className="sm:col-span-2">
                  <Detail
                    label="Address"
                    value={selected.address}
                    icon={<MapPin size={15} />}
                  />
                </div>
              </div>

              {/* Fee Details */}
              <div className="my-6 border-t border-slate-200" />

              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 font-bold">
                  <ReceiptText size={18} className="text-emerald-700" />
                  Fee Details
                </h3>

                <span className="text-xs text-slate-500">
                  Admission: {selected.admissionNo || "-"}
                </span>
              </div>

              {feeLoading && (
                <div className="border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  <RefreshCw
                    size={20}
                    className="mx-auto mb-2 animate-spin"
                  />
                  Loading fee details...
                </div>
              )}

              {feeError && !feeLoading && (
                <div className="flex items-start gap-2 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle size={18} className="shrink-0" />
                  {feeError}
                </div>
              )}

              {!feeLoading && !feeError && (
                <>
                  {/* Fee Summary */}
                  <div className="grid gap-3 sm:grid-cols-3">
                    <FeeStat
                      label="Total Fee"
                      value={money(feeSummary.totalFee)}
                      icon={<IndianRupee size={19} />}
                      color="slate"
                    />

                    <FeeStat
                      label="Total Paid"
                      value={money(feeSummary.totalPaid)}
                      icon={<Wallet size={19} />}
                      color="emerald"
                    />

                    <FeeStat
                      label="Remaining Due"
                      value={money(feeSummary.totalDue)}
                      icon={<Clock3 size={19} />}
                      color="red"
                    />
                  </div>

                  {feeRecords.length === 0 ? (
                    <div className="mt-4 border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                      <ReceiptText
                        size={28}
                        className="mx-auto mb-2 text-slate-400"
                      />

                      <p className="font-semibold text-slate-700">
                        No Fee Records Found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Is student ke liye abhi koi fee record available nahi hai.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800">
                          Fee Receipts
                        </h4>

                        <span className="text-xs text-slate-500">
                          {feeRecords.length} record(s)
                        </span>
                      </div>

                      {feeRecords.map((fee) => (
                        <div
                          key={fee._id}
                          className="overflow-hidden border border-slate-200"
                        >
                          {/* Receipt Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 px-4 py-3">
                            <div>
                              <p className="text-xs font-semibold uppercase text-slate-500">
                                Receipt Number
                              </p>

                              <p className="mt-1 font-bold text-slate-800">
                                {fee.receipt || "-"}
                              </p>
                            </div>

                            <span
                              className={`px-3 py-1 text-xs font-bold ${
                                fee.status === "Paid"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : fee.status === "Partial"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {fee.status || "Pending"}
                            </span>
                          </div>

                          {/* Receipt Amounts */}
                          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
                            <Detail
                              label="Total Amount"
                              value={money(fee.amount)}
                            />

                            <Detail
                              label="Paid Amount"
                              value={money(fee.paid)}
                            />

                            <Detail
                              label="Due Amount"
                              value={money(fee.due)}
                            />

                            <Detail
                              label="Payment Date"
                              value={formatDate(fee.paymentDate)}
                            />

                            <Detail
                              label="Payment Method"
                              value={fee.paymentMethod}
                            />

                            <Detail
                              label="Class"
                              value={fee.className}
                            />

                            <Detail
                              label="Collected By"
                              value={fee.collectedBy}
                            />

                            <Detail
                              label="Created On"
                              value={formatDate(fee.createdAt)}
                            />
                          </div>

                          {fee.remarks && (
                            <div className="border-t border-slate-100 px-4 py-3">
                              <Detail
                                label="Remarks"
                                value={fee.remarks}
                              />
                            </div>
                          )}

                          {/* Installment History */}
                          <div className="border-t border-slate-200 p-4">
                            <h5 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                              <Clock3
                                size={16}
                                className="text-emerald-700"
                              />
                              Payment / Installment History
                            </h5>

                            {fee.transactionError ? (
                              <p className="text-xs text-amber-700">
                                Payment history could not be loaded. Receipt totals are still available.
                              </p>
                            ) : fee.transactions.length === 0 ? (
                              <p className="text-sm text-slate-500">
                                No payment transactions recorded.
                              </p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full min-w-[520px] text-left text-xs">
                                  <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                      <th className="px-3 py-2">Date</th>
                                      <th className="px-3 py-2">Receipt</th>
                                      <th className="px-3 py-2">Amount</th>
                                      <th className="px-3 py-2">Method</th>
                                      <th className="px-3 py-2">Collected By</th>
                                    </tr>
                                  </thead>

                                  <tbody className="divide-y divide-slate-100">
                                    {fee.transactions.map((transaction) => (
                                      <tr key={transaction._id}>
                                        <td className="px-3 py-2">
                                          {formatDate(transaction.paymentDate)}
                                        </td>

                                        <td className="px-3 py-2 font-medium">
                                          {transaction.receipt || fee.receipt}
                                        </td>

                                        <td className="px-3 py-2 font-bold text-emerald-700">
                                          {money(transaction.amount)}
                                        </td>

                                        <td className="px-3 py-2">
                                          {transaction.paymentMethod || "-"}
                                        </td>

                                        <td className="px-3 py-2">
                                          {transaction.collectedBy || "-"}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex flex-wrap justify-between gap-3 border-t border-slate-200 bg-slate-50 p-5">
              <button
                onClick={() => setSelected(null)}
                className="border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100"
              >
                Close
              </button>

              <Link
                href={`/admin/attendance/student/${selected._id}`}
                className="inline-flex items-center gap-2 bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                <CalendarDays size={16} />
                Attendance History
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div className="border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-sm">{label}</span>
        {icon}
      </div>

      <p className="mt-2 text-2xl font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function FeeStat({ label, value, icon, color }) {
  const styles = {
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    red: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <div className={`border p-3 ${styles[color] || styles.slate}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold">{label}</span>
        {icon}
      </div>

      <p className="mt-2 text-xl font-bold">
        {value}
      </p>
    </div>
  );
}

function Detail({ label, value, icon }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-500">
        {icon}
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-slate-800">
        {value !== undefined && value !== null && value !== ""
          ? String(value)
          : "-"}
      </p>
    </div>
  );
}