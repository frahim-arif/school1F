"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Wallet,
  CheckCircle2,
  Clock,
  IndianRupee,
  CreditCard,
  X,
  AlertCircle,
  CalendarDays,
  Users,
} from "lucide-react";

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const API_BASE = API_ORIGIN.endsWith("/api")
  ? API_ORIGIN
  : `${API_ORIGIN}/api`;

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const getId = (item) => item?._id || item?.id || "";

const getStaffName = (item) => {
  const staff = item?.staff || item?.employee || item?.user;

  if (typeof staff === "string") return staff;
  if (typeof staff === "object" && staff) {
    return (
      staff.name ||
      staff.fullName ||
      [staff.firstName, staff.lastName].filter(Boolean).join(" ") ||
      staff.employeeName ||
      "Staff"
    );
  }

  return (
    item?.staffName ||
    item?.employeeName ||
    item?.name ||
    "Unknown Staff"
  );
};

const getEmployeeId = (item) => {
  const staff = item?.staff || item?.employee || item?.user;

  if (typeof staff === "object" && staff) {
    return staff.employeeId || staff.staffId || staff._id || "";
  }

  return item?.employeeId || item?.staffId || "";
};

const getAmount = (item) =>
  item?.netSalary ??
  item?.netPay ??
  item?.netAmount ??
  item?.payableAmount ??
  item?.totalSalary ??
  item?.amount ??
  0;

const isPaid = (item) => {
  const status = String(
    item?.paymentStatus || item?.status || ""
  ).toLowerCase();

  return (
    ["paid", "completed", "success", "successful"].includes(status) ||
    item?.isPaid === true
  );
};

const getMonth = (item) =>
  item?.month ||
  item?.salaryMonth ||
  item?.payrollMonth ||
  item?.period ||
  "";

const getYear = (item) =>
  item?.year ||
  item?.salaryYear ||
  item?.payrollYear ||
  "";

const getDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getErrorMessage = (data, fallback) =>
  data?.message || data?.error || data?._message || fallback;

export default function SalaryPaymentsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [paymentReference, setPaymentReference] = useState("");
  const [saving, setSaving] = useState(false);

  const getHeaders = useCallback(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("adminToken")
        : null;

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const fetchRecords = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_BASE}/payroll/records`, {
        method: "GET",
        headers: getHeaders(),
        cache: "no-store",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false || data?._status === false) {
        throw new Error(
          getErrorMessage(data, "Salary records load nahi ho sake.")
        );
      }

      const list = Array.isArray(data)
        ? data
        : data?.records ??
          data?.data?.records ??
          data?.data ??
          data?.results ??
          [];

      if (!Array.isArray(list)) {
        throw new Error("Backend se salary records ka format valid nahi hai.");
      }

      setRecords(list);
    } catch (err) {
      setError(
        err.message ||
          "Records load nahi hue. API URL aur backend server check karein."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const monthOptions = useMemo(() => {
    const values = records
      .map((record) => {
        const month = getMonth(record);
        const year = getYear(record);

        if (!month) return "";

        return year ? `${month} ${year}` : String(month);
      })
      .filter(Boolean);

    return [...new Set(values)];
  }, [records]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const paid = isPaid(record);
      const staffName = getStaffName(record);
      const employeeId = getEmployeeId(record);
      const month = getMonth(record);
      const year = getYear(record);
      const period = `${month} ${year}`.trim();

      const matchesSearch =
        !query ||
        staffName.toLowerCase().includes(query) ||
        String(employeeId).toLowerCase().includes(query) ||
        period.toLowerCase().includes(query) ||
        String(getId(record)).toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "paid" && paid) ||
        (statusFilter === "pending" && !paid);

      const monthLabel = year ? `${month} ${year}` : String(month || "");

      const matchesMonth =
        monthFilter === "all" || monthLabel === monthFilter;

      return matchesSearch && matchesStatus && matchesMonth;
    });
  }, [records, search, statusFilter, monthFilter]);

  const stats = useMemo(() => {
    const paidRecords = records.filter(isPaid);
    const pendingRecords = records.filter((record) => !isPaid(record));

    return {
      total: records.length,
      paidCount: paidRecords.length,
      pendingCount: pendingRecords.length,
      paidAmount: paidRecords.reduce(
        (sum, record) => sum + Number(getAmount(record) || 0),
        0
      ),
      pendingAmount: pendingRecords.reduce(
        (sum, record) => sum + Number(getAmount(record) || 0),
        0
      ),
    };
  }, [records]);

  const openPaymentModal = (record) => {
    setSelectedRecord(record);
    setPaymentMethod("Bank Transfer");
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setPaymentReference("");
    setError("");
    setNotice("");
  };

  const updatePayment = async (event) => {
    event.preventDefault();

    if (!selectedRecord || !getId(selectedRecord)) {
      setError("Salary record ki ID nahi mili.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_BASE}/payroll/records/${encodeURIComponent(
          getId(selectedRecord)
        )}/payment`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({
            paymentStatus: "Paid",
            status: "Paid",
            paymentMethod,
            paymentDate,
            paymentReference,
            transactionId: paymentReference,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (
        !response.ok ||
        data?.success === false ||
        data?._status === false
      ) {
        throw new Error(
          getErrorMessage(data, "Payment status update nahi hua.")
        );
      }

      setSelectedRecord(null);
      setNotice("Payment status update ho gaya.");
      await fetchRecords(true);
    } catch (err) {
      setError(
        err.message ||
          "Payment update nahi hua. Backend payment controller check karein."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <Wallet size={16} />
              <span>Admin / Payroll / Salary Payments</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Salary Payments
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Staff salary records aur payment status manage karein.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchRecords(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <div className="flex-1">{error}</div>
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
          <div className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <CheckCircle2 size={18} />
            {notice}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Salary Records"
            value={stats.total}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Paid Amount"
            value={money(stats.paidAmount)}
            subtitle={`${stats.paidCount} paid records`}
            icon={CheckCircle2}
            color="green"
          />
          <StatCard
            title="Pending Amount"
            value={money(stats.pendingAmount)}
            subtitle={`${stats.pendingCount} pending records`}
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="Total Records"
            value={stats.total}
            subtitle="All generated salary records"
            icon={IndianRupee}
            color="purple"
          />
        </section>

        <section className="border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search staff, employee ID, month..."
                className="w-full border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-600"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>

              <select
                value={monthFilter}
                onChange={(event) => setMonthFilter(event.target.value)}
                className="border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
              >
                <option value="all">All Months</option>
                {monthOptions.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-500">
            <span>
              Showing {filteredRecords.length} of {records.length} records
            </span>
            <span className="hidden sm:inline">
              Payment status management
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4 font-semibold">Staff Member</th>
                  <th className="px-5 py-4 font-semibold">Salary Period</th>
                  <th className="px-5 py-4 font-semibold">Net Salary</th>
                  <th className="px-5 py-4 font-semibold">Payment Date</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <RefreshCw
                        size={22}
                        className="mx-auto animate-spin text-emerald-700"
                      />
                      <p className="mt-3 text-sm text-slate-500">
                        Salary records load ho rahe hain...
                      </p>
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center bg-slate-100 text-slate-500">
                        <Wallet size={23} />
                      </div>
                      <p className="mt-3 font-semibold text-slate-800">
                        No salary records found
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Generate Salary page se records create karein ya filters
                        change karein.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => {
                    const paid = isPaid(record);
                    const staffId = getEmployeeId(record);
                    const period = [getMonth(record), getYear(record)]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <tr
                        key={getId(record) || `${staffId}-${period}`}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-emerald-50 text-sm font-bold text-emerald-800">
                              {getStaffName(record)
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">
                                {getStaffName(record)}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {staffId
                                  ? `ID: ${staffId}`
                                  : `Record: ${getId(record) || "—"}`}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <CalendarDays
                              size={15}
                              className="text-slate-400"
                            />
                            {period || "—"}
                          </div>
                        </td>

                        <td className="px-5 py-4 font-semibold text-slate-900">
                          {money(getAmount(record))}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {getDate(
                            record?.paymentDate ||
                              record?.paidAt ||
                              record?.paidDate
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold ${
                              paid
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {paid ? (
                              <CheckCircle2 size={14} />
                            ) : (
                              <Clock size={14} />
                            )}
                            {paid ? "Paid" : "Pending"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          {paid ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                              <CheckCircle2 size={15} />
                              Completed
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openPaymentModal(record)}
                              className="inline-flex items-center gap-2 bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800"
                            >
                              <CreditCard size={14} />
                              Mark as Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setSelectedRecord(null);
            }
          }}
        >
          <div className="my-auto w-full max-w-lg border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Update Salary Payment
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {getStaffName(selectedRecord)}
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => setSelectedRecord(null)}
                className="p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={updatePayment} className="space-y-5 p-5">
              <div className="bg-emerald-50 p-4">
                <p className="text-sm text-emerald-800">Net Salary</p>
                <p className="mt-1 text-2xl font-bold text-emerald-900">
                  {money(getAmount(selectedRecord))}
                </p>
                <p className="mt-1 text-xs text-emerald-700">
                  {[getMonth(selectedRecord), getYear(selectedRecord)]
                    .filter(Boolean)
                    .join(" ") || "Salary period not specified"}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  required
                  className="w-full border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(event) => setPaymentDate(event.target.value)}
                  required
                  className="w-full border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Transaction / Reference ID (optional)
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(event) => setPaymentReference(event.target.value)}
                  placeholder="Enter transaction reference"
                  className="w-full border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setSelectedRecord(null)}
                  className="border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Confirm Payment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  const styles = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 break-words text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {value}
          </p>
          {subtitle && (
            <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center ${styles[color]}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}
