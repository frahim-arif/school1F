
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  HiOutlineCurrencyRupee,
  HiOutlineUsers,
  HiOutlineCalendarDays,
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineDocumentText,
  HiOutlineArrowLeft,
} from "react-icons/hi2";

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const API_BASE = API_ORIGIN.endsWith("/api")
  ? API_ORIGIN
  : `${API_ORIGIN}/api`;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
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

async function apiRequest(path, options = {}) {
  const url = `${API_BASE}/${path.replace(/^\/+/, "")}`;

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
        result?.error ||
        `Request failed (${response.status}).`
    );
  }

  return result;
}

function getStaffName(record) {
  const staff = record?.staff || record?.employee || {};

  if (typeof staff === "string") {
    return record?.staffName || staff;
  }

  return (
    staff.name ||
    staff.fullName ||
    [staff.firstName, staff.lastName].filter(Boolean).join(" ") ||
    record?.staffName ||
    record?.employeeName ||
    "Staff member"
  );
}

function getStaffId(record) {
  const staff = record?.staff || record?.employee || {};

  if (typeof staff === "string") {
    return record?.staffId || "—";
  }

  return staff.staffId || record?.staffId || "—";
}

function getGross(record) {
  return Number(record?.grossSalary) || 0;
}

function getDeductions(record) {
  if (record?.totalDeductions != null) {
    return Number(record.totalDeductions) || 0;
  }

  return (
    (Number(record?.deductions) || 0) +
    (Number(record?.tax) || 0) +
    (Number(record?.pf) || 0)
  );
}

function getNet(record) {
  if (record?.netSalary != null) {
    return Number(record.netSalary) || 0;
  }

  return getGross(record) - getDeductions(record);
}

export default function GeneratePayrollPage() {
  const initialDate = new Date();

  const [month, setMonth] = useState(
    String(initialDate.getMonth() + 1)
  );
  const [year, setYear] = useState(
    String(initialDate.getFullYear())
  );

  const [staff, setStaff] = useState([]);
  const [structures, setStructures] = useState([]);
  const [existingRecords, setExistingRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [summary, setSummary] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError("");

    try {
      const [staffResult, structureResult, recordResult] =
        await Promise.all([
          apiRequest("/payroll/staff"),
          apiRequest("/payroll/structures"),
          apiRequest(
            `/payroll/records?month=${encodeURIComponent(month)}&year=${encodeURIComponent(year)}`
          ),
        ]);

      setStaff(normalizeList(staffResult, ["staff", "employees"]));
      setStructures(
        normalizeList(structureResult, ["structures"])
      );
      setExistingRecords(
        normalizeList(recordResult, ["records", "payrollRecords"])
      );
    } catch (err) {
      setError(
        `${err.message} Check the backend URL, authentication and payroll routes.`
      );
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    return existingRecords.reduce(
      (result, record) => {
        result.gross += getGross(record);
        result.deductions += getDeductions(record);
        result.net += getNet(record);
        return result;
      },
      { gross: 0, deductions: 0, net: 0 }
    );
  }, [existingRecords]);

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();

    return Array.from(
      { length: 7 },
      (_, index) => currentYear - 3 + index
    );
  }, []);

  const handlePeriodChange = (setter) => (event) => {
    setter(event.target.value);
    setNotice("");
    setSummary(null);
    setConfirmed(false);
  };

  const handleGenerate = async () => {
    if (!confirmed) {
      setError("Payroll generate karne se pehle confirmation select karein.");
      return;
    }

    if (Number(month) < 1 || Number(month) > 12) {
      setError("Please select a valid payroll month.");
      return;
    }

    if (!Number.isInteger(Number(year))) {
      setError("Please select a valid payroll year.");
      return;
    }

    setGenerating(true);
    setError("");
    setNotice("");
    setSummary(null);

    try {
      const result = await apiRequest("/payroll/generate", {
        method: "POST",
        body: JSON.stringify({
          month: Number(month),
          year: Number(year),
        }),
      });

      setSummary(result);
      setNotice(
        result.message ||
          result._message ||
          "Payroll generation request completed."
      );

      setConfirmed(false);

      // Refresh the records for the selected period.
      await loadData(false);
    } catch (err) {
      setError(err.message || "Unable to generate payroll.");
    } finally {
      setGenerating(false);
    }
  };

  const cards = [
    {
      title: "Staff Members",
      value: loading ? "—" : staff.length,
      detail: "Staff returned by API",
      icon: HiOutlineUsers,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Salary Structures",
      value: loading ? "—" : structures.length,
      detail: "Saved salary structures",
      icon: HiOutlineDocumentText,
      color: "bg-violet-50 text-violet-700",
    },
    {
      title: "Payroll Records",
      value: loading ? "—" : existingRecords.length,
      detail: `${MONTHS[Number(month) - 1]} ${year}`,
      icon: HiOutlineCalendarDays,
      color: "bg-amber-50 text-amber-700",
    },
    {
      title: "Net Payroll",
      value: loading ? "—" : money(stats.net),
      detail: "Total net salary for this period",
      icon: HiOutlineCurrencyRupee,
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Link
              href="/admin/payroll"
              aria-label="Back to payroll dashboard"
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
            >
              <HiOutlineArrowLeft className="h-5 w-5" />
            </Link>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                Payroll Management
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Generate Payroll
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Generate monthly salary records using saved salary structures.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadData()}
            disabled={loading || generating}
            className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <HiOutlineArrowPath
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </header>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <HiOutlineExclamationCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Could not complete the request</p>
              <p className="mt-1 break-words">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError("")}
              className="font-bold"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* Success */}
        {notice && (
          <div
            role="status"
            className="flex items-start gap-3 border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <HiOutlineCheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{notice}</p>
              <p className="mt-1">
                Review the payroll records below before proceeding to payment.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNotice("")}
              className="font-bold"
              aria-label="Dismiss notice"
            >
              ×
            </button>
          </div>
        )}

        {/* Statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <StatCard
                key={card.title}
                title={card.title}
                value={card.value}
                detail={card.detail}
                icon={<Icon className="h-5 w-5" />}
                color={card.color}
              />
            );
          })}
        </section>

        {/* Payroll period and summary */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
          <div className="border border-slate-200 bg-white p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-emerald-50 text-emerald-700">
                <HiOutlineCalendarDays className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Payroll Period
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Choose the month and year for payroll generation.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Month
                </span>

                <select
                  value={month}
                  onChange={handlePeriodChange(setMonth)}
                  disabled={generating}
                  className="w-full border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
                >
                  {MONTHS.map((name, index) => (
                    <option key={name} value={index + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Year
                </span>

                <select
                  value={year}
                  onChange={handlePeriodChange(setYear)}
                  disabled={generating}
                  className="w-full border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
                >
                  {availableYears.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              <strong>Before generating:</strong> Check that staff records and
              salary structures are correct. If payroll already exists for this
              period, the backend may reject, skip, or update duplicate records.
              Confirm your backend behavior before generating again.
            </div>

            <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-600">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                disabled={generating}
                className="mt-1 h-4 w-4 shrink-0 accent-emerald-700"
              />
              <span>
                I have checked the selected month and year and want to generate
                payroll records.
              </span>
            </label>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || generating || !confirmed}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-emerald-800 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {generating ? (
                <HiOutlineArrowPath className="h-5 w-5 animate-spin" />
              ) : (
                <HiOutlineCurrencyRupee className="h-5 w-5" />
              )}
              {generating ? "Generating Payroll..." : "Generate Payroll"}
            </button>
          </div>

          <div className="border border-slate-200 bg-white p-5 sm:p-7">
            <h2 className="text-lg font-bold text-slate-900">
              Current Period Summary
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Based on records returned by the backend.
            </p>

            <div className="mt-5 space-y-4">
              <SummaryRow
                label="Gross Salary"
                value={loading ? "—" : money(stats.gross)}
              />
              <SummaryRow
                label="Total Deductions"
                value={loading ? "—" : money(stats.deductions)}
              />

              <div className="border-t border-slate-200 pt-4">
                <SummaryRow
                  label="Net Salary"
                  value={loading ? "—" : money(stats.net)}
                  strong
                />
              </div>
            </div>

            <div className="mt-6 border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">
                Next step
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Verify the generated records before reviewing or updating
                salary payments.
              </p>
              <Link
                href="/admin/payroll/payments"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-950"
              >
                View Payroll Payments <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Existing records */}
        <section className="border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Existing Payroll Records
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {MONTHS[Number(month) - 1]} {year}
              </p>
            </div>

            <span className="border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">
              {loading ? "Loading..." : `${existingRecords.length} records`}
            </span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              <HiOutlineArrowPath className="mx-auto mb-3 h-6 w-6 animate-spin" />
              Loading payroll records...
            </div>
          ) : existingRecords.length === 0 ? (
            <div className="p-10 text-center">
              <HiOutlineDocumentText className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-700">
                No payroll records for this period
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Select a different period or generate payroll to create records.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-bold">Staff</th>
                    <th className="px-5 py-4 font-bold">Gross Salary</th>
                    <th className="px-5 py-4 font-bold">Deductions</th>
                    <th className="px-5 py-4 font-bold">Net Salary</th>
                    <th className="px-5 py-4 font-bold">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {existingRecords.map((record, index) => {
                    const status =
                      record.paymentStatus || record.status || "Generated";

                    return (
                      <tr
                        key={record._id || `${getStaffId(record)}-${index}`}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            {getStaffName(record)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {getStaffId(record)}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {money(getGross(record))}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {money(getDeductions(record))}
                        </td>

                        <td className="px-5 py-4 font-bold text-slate-900">
                          {money(getNet(record))}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {String(status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {summary && (
          <details className="border border-slate-200 bg-white p-5">
            <summary className="cursor-pointer text-sm font-bold text-slate-700">
              View backend generation response
            </summary>
            <pre className="mt-4 overflow-x-auto bg-slate-950 p-4 text-xs text-green-200">
              {JSON.stringify(summary, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </main>
  );
}

function StatCard({ title, value, detail, icon, color }) {
  return (
    <div className="border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 break-words text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center ${color}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function SummaryRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={`text-sm ${
          strong ? "font-bold text-slate-900" : "text-slate-500"
        }`}
      >
        {label}
      </span>

      <span
        className={`text-right ${
          strong
            ? "text-lg font-bold text-emerald-800"
            : "text-sm font-semibold text-slate-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
