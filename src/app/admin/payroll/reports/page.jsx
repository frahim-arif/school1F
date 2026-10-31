
"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, RefreshCw, Search, ChartNoAxesCombined } from "lucide-react";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const API = API_ORIGIN.endsWith("/api") ? API_ORIGIN : `${API_ORIGIN}/api`;
const money = (v) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 2,
}).format(Number(v) || 0);

const nameOf = (r) => {
  const s = r.staff || r.employee || r.user;
  return (typeof s === "object" && s ? s.name || s.fullName : s) ||
    r.staffName || r.employeeName || "Unknown Staff";
};
const amountOf = (r) => Number(r.netSalary ?? r.netPay ?? r.netAmount ?? r.payableAmount ?? r.amount ?? 0);
const paidOf = (r) => ["paid", "completed", "success", "successful"].includes(
  String(r.paymentStatus || r.status || "").toLowerCase()
) || r.isPaid === true;

export default function PayrollReportsPage() {
  const [records, setRecords] = useState([]);
  const [backendReport, setBackendReport] = useState(null);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("adminToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const [recordsRes, reportRes] = await Promise.all([
        fetch(`${API}/payroll/records`, { headers, cache: "no-store" }),
        fetch(`${API}/payroll/reports`, { headers, cache: "no-store" }),
      ]);
      const recordsData = await recordsRes.json();
      const reportData = await reportRes.json().catch(() => ({}));
      if (!recordsRes.ok) throw new Error(recordsData.message || "Salary records load nahi hue.");
      const list = Array.isArray(recordsData) ? recordsData :
        recordsData.records ?? recordsData.data?.records ?? recordsData.data ?? [];
      setRecords(Array.isArray(list) ? list : []);
      if (reportRes.ok && reportData.success !== false && reportData._status !== false) {
        setBackendReport(reportData.report ?? reportData.data ?? reportData);
      } else {
        setBackendReport(null);
      }
    } catch (e) {
      setError(e.message || "Reports load nahi hue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => records.filter((r) => {
    const period = `${r.month || r.salaryMonth || ""} ${r.year || ""}`.trim();
    const query = `${nameOf(r)} ${period} ${r._id || ""}`.toLowerCase();
    const monthKey = `${r.year || ""}-${String(r.monthNumber || r.month || "").padStart(2, "0")}`;
    const matchesMonth = !month || period.toLowerCase().includes(month.toLowerCase()) || monthKey === month;
    return query.includes(search.toLowerCase()) && matchesMonth;
  }), [records, search, month]);

  const summary = useMemo(() => ({
    count: filtered.length,
    paid: filtered.filter(paidOf).length,
    pending: filtered.filter((r) => !paidOf(r)).length,
    total: filtered.reduce((sum, r) => sum + amountOf(r), 0),
    paidAmount: filtered.filter(paidOf).reduce((sum, r) => sum + amountOf(r), 0),
    pendingAmount: filtered.filter((r) => !paidOf(r)).reduce((sum, r) => sum + amountOf(r), 0),
  }), [filtered]);

  function exportCSV() {
    const rows = [
      ["Staff", "Month", "Year", "Net Salary", "Payment Status"],
      ...filtered.map((r) => [
        nameOf(r), r.month || r.salaryMonth || "", r.year || "",
        amountOf(r), paidOf(r) ? "Paid" : "Pending",
      ]),
    ];
    const csv = rows.map((row) => row.map((v) =>
      `"${String(v ?? "").replace(/"/g, '""')}"`
    ).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "payroll-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Admin / Payroll / Reports</p>
            <h1 className="mt-2 text-3xl font-bold">Payroll Reports</h1>
            <p className="mt-1 text-sm text-slate-500">Review payroll totals and export salary records.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="flex items-center gap-2 border bg-white px-3 py-2.5 text-sm"><RefreshCw size={16} /> Refresh</button>
            <button onClick={exportCSV} disabled={!filtered.length} className="flex items-center gap-2 bg-emerald-700 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Download size={16} /> Export CSV</button>
          </div>
        </header>

        {error && <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card title="Salary Records" value={summary.count} />
          <Card title="Total Net Salary" value={money(summary.total)} />
          <Card title="Paid Amount" value={money(summary.paidAmount)} subtitle={`${summary.paid} records`} />
          <Card title="Pending Amount" value={money(summary.pendingAmount)} subtitle={`${summary.pending} records`} />
        </section>

        <section className="border bg-white p-4">
          <h2 className="mb-4 flex items-center gap-2 font-bold"><ChartNoAxesCombined size={19} /> Report Filters</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="relative">
              <Search size={17} className="absolute left-3 top-3 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search staff or salary period" className="w-full border py-2.5 pl-10 pr-3 text-sm" />
            </div>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="border px-3 py-2.5 text-sm" />
          </div>
        </section>

        {backendReport && (
          <section className="border bg-white p-5">
            <h2 className="font-bold">Backend Report Summary</h2>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-sm text-slate-600">{JSON.stringify(backendReport, null, 2)}</pre>
          </section>
        )}

        <section className="overflow-hidden border bg-white">
          <div className="border-b p-4 font-bold">Salary Report</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Staff</th><th className="p-4">Period</th><th className="p-4">Net Salary</th><th className="p-4">Status</th></tr></thead>
              <tbody className="divide-y">
                {loading ? <tr><td colSpan={4} className="p-10 text-center">Loading report...</td></tr> :
                  filtered.length === 0 ? <tr><td colSpan={4} className="p-10 text-center text-slate-500">No records found.</td></tr> :
                  filtered.map((r) => <tr key={r._id} className="hover:bg-slate-50">
                    <td className="p-4 font-medium">{nameOf(r)}</td>
                    <td className="p-4">{[r.month || r.salaryMonth, r.year].filter(Boolean).join(" ") || "—"}</td>
                    <td className="p-4 font-semibold">{money(amountOf(r))}</td>
                    <td className="p-4"><span className={`px-2 py-1 text-xs ${paidOf(r) ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{paidOf(r) ? "Paid" : "Pending"}</span></td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({ title, value, subtitle }) {
  return <div className="border bg-white p-5"><p className="text-sm text-slate-500">{title}</p><p className="mt-3 break-words text-2xl font-bold">{value}</p>{subtitle && <p className="mt-2 text-xs text-slate-500">{subtitle}</p>}</div>;
}
