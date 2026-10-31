
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3, IndianRupee, RefreshCw, Download,
  TrendingUp, Wallet, AlertCircle, CheckCircle2
} from "lucide-react";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const money = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export default function FeeReportsPage() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [classFilter, setClassFilter] = useState("All");

  const loadFees = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/fees`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Reports load nahi hui");
      setFees(Array.isArray(data) ? data : data.fees || data.records || data.data || []);
    } catch (e) {
      setError(e.message || "Backend se connection nahi hua");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFees(); }, [loadFees]);

  const classes = useMemo(() =>
    [...new Set(fees.map(f => f.className).filter(Boolean))].sort(), [fees]);

  const filtered = useMemo(() => fees.filter(f => {
    const d = f.paymentDate ? new Date(f.paymentDate) : null;
    const start = from ? new Date(`${from}T00:00:00`) : null;
    const end = to ? new Date(`${to}T23:59:59.999`) : null;
    return (!start || (d && d >= start))
      && (!end || (d && d <= end))
      && (classFilter === "All" || f.className === classFilter);
  }), [fees, from, to, classFilter]);

  const stats = useMemo(() => filtered.reduce((s, f) => {
    s.totalFee += Number(f.amount || 0);
    s.collected += Number(f.paid || 0);
    s.due += Number(f.due || 0);
    s.transactions += 1;
    if (f.status === "Paid") s.paidCount += 1;
    else if (f.status === "Partial") s.partialCount += 1;
    else s.pendingCount += 1;
    return s;
  }, { totalFee: 0, collected: 0, due: 0, transactions: 0, paidCount: 0, partialCount: 0, pendingCount: 0 }), [filtered]);

  const paymentMethods = useMemo(() => {
    const map = {};
    filtered.forEach(f => {
      const method = f.paymentMethod || "Not specified";
      map[method] = (map[method] || 0) + Number(f.paid || 0);
    });
    return Object.entries(map).sort((a,b) => b[1] - a[1]);
  }, [filtered]);

  const classReports = useMemo(() => {
    const map = {};
    filtered.forEach(f => {
      const name = f.className || "Not specified";
      if (!map[name]) map[name] = { name, students: 0, fee: 0, paid: 0, due: 0 };
      map[name].students += 1;
      map[name].fee += Number(f.amount || 0);
      map[name].paid += Number(f.paid || 0);
      map[name].due += Number(f.due || 0);
    });
    return Object.values(map).sort((a,b) => a.name.localeCompare(b.name));
  }, [filtered]);

  function exportCSV() {
    const rows = [
      ["Class", "Transactions", "Total Fee", "Collected", "Due"],
      ...classReports.map(r => [r.name, r.students, r.fee, r.paid, r.due]),
      [],
      ["Payment Method", "Collected"],
      ...paymentMethods
    ];
    const csv = rows.map(row => row.map(v =>
      `"${String(v ?? "").replace(/"/g, '""')}"`
    ).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "fee-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const maxMethod = Math.max(1, ...paymentMethods.map(x => x[1]));

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 text-slate-800 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700">
            <BarChart3 size={26}/>
            <h1 className="text-2xl font-bold">Fee Reports</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">Collection, outstanding dues and payment analysis</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold shadow-sm ring-1 ring-slate-200">
            <Download size={17}/> Export CSV
          </button>
          <button onClick={loadFees} className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white">
            <RefreshCw size={17}/> Refresh
          </button>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={<Wallet/>} label="Total Fee Amount" value={money(stats.totalFee)} color="blue"/>
        <Stat icon={<TrendingUp/>} label="Total Collected" value={money(stats.collected)} color="green"/>
        <Stat icon={<AlertCircle/>} label="Outstanding Due" value={money(stats.due)} color="red"/>
        <Stat icon={<ReceiptIcon/>} label="Transactions" value={stats.transactions} color="amber"/>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <label className="text-xs font-medium text-slate-500">From date
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="mt-1 block rounded-lg border border-slate-200 px-3 py-2 text-sm"/>
        </label>
        <label className="text-xs font-medium text-slate-500">To date
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="mt-1 block rounded-lg border border-slate-200 px-3 py-2 text-sm"/>
        </label>
        <label className="text-xs font-medium text-slate-500">Class
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
            className="mt-1 block min-w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="All">All Classes</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <button onClick={() => { setFrom(""); setTo(""); setClassFilter("All"); }}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">
          Clear Filters
        </button>
        <p className="ml-auto text-sm text-slate-500">{loading ? "Loading..." : `${filtered.length} records included`}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-bold">Payment Status Summary</h2>
          <div className="space-y-5">
            <Progress label="Paid" count={stats.paidCount} total={stats.transactions} color="bg-emerald-600"/>
            <Progress label="Partial" count={stats.partialCount} total={stats.transactions} color="bg-amber-500"/>
            <Progress label="Pending / Other" count={stats.pendingCount} total={stats.transactions} color="bg-red-500"/>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-emerald-50 p-4">
              <CheckCircle2 className="mb-2 text-emerald-700"/>
              <p className="text-sm text-slate-600">Collection rate</p>
              <p className="mt-1 text-xl font-bold text-emerald-800">
                {stats.totalFee > 0 ? `${Math.min(100, (stats.collected / stats.totalFee) * 100).toFixed(1)}%` : "0%"}
              </p>
            </div>
            <div className="rounded-lg bg-red-50 p-4">
              <AlertCircle className="mb-2 text-red-600"/>
              <p className="text-sm text-slate-600">Remaining amount</p>
              <p className="mt-1 text-xl font-bold text-red-700">{money(stats.due)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-1 text-lg font-bold">Collection by Payment Method</h2>
          <p className="mb-5 text-sm text-slate-500">Collected amount for each method</p>
          {paymentMethods.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No payment data available.</p>
          : <div className="space-y-5">{paymentMethods.map(([method, amount]) =>
            <div key={method}>
              <div className="mb-2 flex justify-between gap-3 text-sm">
                <span className="font-medium">{method}</span><b>{money(amount)}</b>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.max(0, Math.min(100, amount / maxMethod * 100))}%` }}/>
              </div>
            </div>)}</div>}
        </section>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold">Class-wise Fee Report</h2>
          <p className="mt-1 text-sm text-slate-500">Based on the fee records matching your filters</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-600">
              <tr>{["Class", "Records", "Total Fee", "Collected", "Due", "Collection %"].map(x =>
                <th key={x} className="px-5 py-4">{x}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? <tr><td colSpan="6" className="p-8 text-center">Loading reports...</td></tr>
              : classReports.length === 0 ? <tr><td colSpan="6" className="p-8 text-center text-slate-500">No fee records found.</td></tr>
              : classReports.map(r => <tr key={r.name} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-semibold">{r.name}</td>
                <td className="px-5 py-4">{r.students}</td>
                <td className="px-5 py-4">{money(r.fee)}</td>
                <td className="px-5 py-4 font-semibold text-emerald-700">{money(r.paid)}</td>
                <td className="px-5 py-4 font-semibold text-red-600">{money(r.due)}</td>
                <td className="px-5 py-4">{r.fee > 0 ? `${Math.min(100, r.paid / r.fee * 100).toFixed(1)}%` : "0%"}</td>
              </tr>)}
            </tbody>
            {classReports.length > 0 && <tfoot className="bg-slate-50 font-bold">
              <tr><td className="px-5 py-4">Total</td><td className="px-5 py-4">{stats.transactions}</td>
                <td className="px-5 py-4">{money(stats.totalFee)}</td>
                <td className="px-5 py-4 text-emerald-700">{money(stats.collected)}</td>
                <td className="px-5 py-4 text-red-600">{money(stats.due)}</td>
                <td className="px-5 py-4">{stats.totalFee > 0 ? `${Math.min(100, stats.collected / stats.totalFee * 100).toFixed(1)}%` : "0%"}</td>
              </tr>
            </tfoot>}
          </table>
        </div>
      </section>
    </div>
  );
}

function ReceiptIcon() {
  return <IndianRupee/>;
}

function Stat({ icon, label, value, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
    <div className={`rounded-xl p-3 ${colors[color]}`}>{icon}</div>
    <div className="min-w-0"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 break-words text-xl font-bold">{value}</p></div>
  </div>;
}

function Progress({ label, count, total, color }) {
  const percent = total > 0 ? count / total * 100 : 0;
  return <div>
    <div className="mb-2 flex justify-between text-sm">
      <span>{label}</span><span className="font-semibold">{count} ({percent.toFixed(1)}%)</span>
    </div>
    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }}/>
    </div>
  </div>;
}
