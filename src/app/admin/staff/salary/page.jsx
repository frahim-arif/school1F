
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  WalletCards,
  IndianRupee,
  CheckCircle2,
  Clock3,
  Search,
  FileText,
  RefreshCw,
  Download,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const currentDate = new Date();

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const getName = (staff) =>
  staff?.name ||
  [staff?.firstName, staff?.lastName].filter(Boolean).join(" ") ||
  "Unknown Staff";

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false || data._status === false) {
    throw new Error(
      data.message ||
        data._message ||
        `Request failed (${response.status})`
    );
  }

  return data;
}

function getTokenHeaders(json = false) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function StaffSalaryPage() {
  const [search, setSearch] = useState("");
  const [salaries, setSalaries] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    employees: 0,
  });

  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadSalaries = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_BASE}/api/staff-salaries?month=${month}&year=${year}`,
        {
          method: "GET",
          headers: getTokenHeaders(),
          cache: "no-store",
        }
      );

      const data = await readResponse(response);
      const records = Array.isArray(data)
        ? data
        : data.salaries || data.records || [];

      setSalaries(records);

      if (data.stats) {
        setStats(data.stats);
      } else {
        const total = records.reduce(
          (sum, item) => sum + (Number(item.amount) || 0),
          0
        );
        const paid = records
          .filter((item) => item.status === "Paid")
          .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

        setStats({
          total,
          paid,
          pending: total - paid,
          employees: records.length,
        });
      }
    } catch (err) {
      setError(
        `${err.message || "Salary records load nahi ho sake."} API: ${API_BASE}/api/staff-salaries`
      );
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadSalaries();
  }, [loadSalaries]);

  const filteredSalary = salaries.filter((item) => {
    const text = [
      getName(item.staff),
      item.staff?.staffId,
      item.staff?.designation,
      item.staff?.department,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes(search.toLowerCase().trim());
  });

  async function markPaid(item) {
    const staffId =
      typeof item.staff === "string" ? item.staff : item.staff?._id;

    if (!staffId) {
      setError("Staff ID nahi mili. Staff record check karein.");
      return;
    }

    if (
      !window.confirm(
        `${getName(item.staff)} ki salary Paid mark karein?`
      )
    ) {
      return;
    }

    setSavingId(staffId);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_BASE}/api/staff-salaries`, {
        method: "POST",
        headers: getTokenHeaders(true),
        body: JSON.stringify({
          staffId,
          month,
          year,
          amount: Number(item.amount) || 0,
          status: "Paid",
          notes: item.notes || "",
        }),
      });

      const data = await readResponse(response);

      setNotice(
        data.message || `${getName(item.staff)} ki salary Paid mark ho gayi.`
      );

      await loadSalaries();
    } catch (err) {
      setError(err.message || "Salary update nahi ho saki.");
    } finally {
      setSavingId("");
    }
  }

  function downloadSlip(item) {
    const content = [
      "STAFF SALARY SLIP",
      "------------------------------",
      `Staff: ${getName(item.staff)}`,
      `Staff ID: ${item.staff?.staffId || "-"}`,
      `Designation: ${item.staff?.designation || "-"}`,
      `Department: ${item.staff?.department || "-"}`,
      `Month: ${month}/${year}`,
      `Salary: ${formatMoney(item.amount)}`,
      `Status: ${item.status || "Pending"}`,
      `Payment Date: ${
        item.paymentDate
          ? new Date(item.paymentDate).toLocaleDateString("en-IN")
          : "-"
      }`,
    ].join("\n");

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `salary-slip-${
      item.staff?.staffId || item.staff?._id || "staff"
    }-${month}-${year}.txt`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  const monthOptions = [
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Staff Salary Management
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage employee salary and payment records
          </p>
        </div>

        <button
          type="button"
          onClick={loadSalaries}
          disabled={loading}
          className="flex items-center justify-center gap-2 self-start rounded-xl border bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border bg-white p-4">
        <label className="flex flex-col gap-1 text-xs font-bold text-slate-500">
          Month
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-lg border px-3 py-2 text-sm text-slate-800"
          >
            {monthOptions.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-bold text-slate-500">
          Year
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border px-3 py-2 text-sm text-slate-800"
          >
            {[year - 1, year, year + 1]
              .filter((value) => value >= 2000)
              .map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
          </select>
        </label>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p className="break-words">{error}</p>
          <button
            type="button"
            onClick={loadSalaries}
            className="mt-2 font-bold underline"
          >
            Retry
          </button>
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          {notice}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Salary"
          value={formatMoney(stats.total)}
          icon={WalletCards}
        />
        <StatCard
          title="Paid"
          value={formatMoney(stats.paid)}
          icon={CheckCircle2}
          color="text-green-600"
        />
        <StatCard
          title="Pending"
          value={formatMoney(stats.pending)}
          icon={Clock3}
          color="text-orange-500"
        />
        <StatCard
          title="Employees"
          value={stats.employees}
          icon={IndianRupee}
          color="text-purple-600"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-black">Salary Records</h2>
            <p className="mt-1 text-sm text-slate-500">
              {monthOptions[month - 1]} {year}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border px-4 py-2">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff..."
              className="min-w-0 text-sm outline-none"
              aria-label="Search salary records"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="px-6 py-4">Staff Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Salary</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    Loading salary records...
                  </td>
                </tr>
              ) : filteredSalary.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    {search
                      ? "No matching staff found."
                      : "No salary records found for this month."}
                  </td>
                </tr>
              ) : (
                filteredSalary.map((item) => {
                  const staffId =
                    typeof item.staff === "string"
                      ? item.staff
                      : item.staff?._id;

                  return (
                    <tr
                      key={staffId || item._id}
                      className="border-t hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {getName(item.staff)}
                        {item.staff?.staffId && (
                          <p className="mt-1 text-xs font-normal text-slate-400">
                            ID: {item.staff.staffId}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {item.staff?.designation || "—"}
                      </td>

                      <td className="px-6 py-4 font-bold text-indigo-600">
                        {formatMoney(item.amount)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            item.status === "Paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {item.status || "Pending"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => downloadSlip(item)}
                            className="flex items-center gap-2 rounded-lg bg-indigo-100 px-3 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-200"
                          >
                            <FileText size={15} />
                            Slip
                            <Download size={14} />
                          </button>

                          {item.status !== "Paid" && (
                            <button
                              type="button"
                              onClick={() => markPaid(item)}
                              disabled={!staffId || savingId === staffId}
                              className="rounded-lg bg-green-600 px-3 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
                            >
                              {savingId === staffId
                                ? "Saving..."
                                : "Mark Paid"}
                            </button>
                          )}
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
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color = "text-indigo-600",
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-slate-500">{title}</p>
        <Icon size={22} className={color} />
      </div>
      <h2 className={`mt-3 break-words text-2xl font-black sm:text-3xl ${color}`}>
        {value}
      </h2>
    </div>
  );
}
