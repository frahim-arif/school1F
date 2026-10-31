
"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, RefreshCw, Printer, FileText, X } from "lucide-react";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const API = API_ORIGIN.endsWith("/api") ? API_ORIGIN : `${API_ORIGIN}/api`;

const money = (v) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 2,
}).format(Number(v) || 0);

const staffName = (r) => {
  const s = r.staff || r.employee || r.user;
  if (typeof s === "string") return s;
  return s?.name || s?.fullName || r.staffName || r.employeeName || "Staff";
};

const amount = (r) => Number(
  r.netSalary ?? r.netPay ?? r.netAmount ?? r.payableAmount ?? r.amount ?? 0
);

export default function SalarySlipsPage() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [slip, setSlip] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API}/payroll/records`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || data.success === false || data._status === false) {
        throw new Error(data.message || data._message || "Records load nahi hue.");
      }
      const list = Array.isArray(data) ? data :
        data.records ?? data.data?.records ?? data.data ?? [];
      setRecords(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e.message || "Salary records load nahi hue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return records.filter((r) =>
      `${staffName(r)} ${r.month || r.salaryMonth || ""} ${r.year || ""} ${r._id || ""}`
        .toLowerCase().includes(q)
    );
  }, [records, search]);

  async function openSlip(record) {
    setSelected(record);
    setSlip(record);
    setError("");

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API}/payroll/slips/${record._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok && data.success !== false && data._status !== false) {
        setSlip(data.slip ?? data.data?.slip ?? data.data ?? data);
      }
    } catch {
      // Record details are still available for a basic printable slip.
    }
  }

  const detail = slip || selected || {};

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Admin / Payroll / Salary Slips</p>
            <h1 className="mt-2 text-3xl font-bold">Salary Slips</h1>
            <p className="mt-1 text-sm text-slate-500">View and print generated salary slips.</p>
          </div>
          <button onClick={load} className="flex items-center gap-2 border bg-white px-4 py-2.5 text-sm">
            <RefreshCw size={16} /> Refresh
          </button>
        </header>

        {error && <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <section className="border bg-white">
          <div className="border-b p-4">
            <div className="relative max-w-lg">
              <Search size={18} className="absolute left-3 top-3 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search staff, month or record ID"
                className="w-full border py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-600" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-4">Staff</th>
                  <th className="p-4">Salary Period</th>
                  <th className="p-4">Net Salary</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={5} className="p-10 text-center">Loading salary slips...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="p-10 text-center text-slate-500">No salary records found.</td></tr>
                ) : filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="p-4 font-medium">{staffName(r)}</td>
                    <td className="p-4">{[r.month || r.salaryMonth, r.year].filter(Boolean).join(" ") || "—"}</td>
                    <td className="p-4 font-semibold">{money(amount(r))}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs ${["paid","completed","success"].includes(String(r.paymentStatus || r.status).toLowerCase()) ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {r.paymentStatus || r.status || "Pending"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => openSlip(r)} className="inline-flex items-center gap-2 bg-emerald-700 px-3 py-2 text-xs font-semibold text-white">
                        <FileText size={14} /> View Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
          <div className="mx-auto my-8 max-w-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between print:hidden">
              <h2 className="text-xl font-bold">Salary Slip</h2>
              <button onClick={() => { setSelected(null); setSlip(null); }}><X /></button>
            </div>
            <div id="salary-slip" className="space-y-5 border p-5">
              <div className="border-b pb-4 text-center">
                <h2 className="text-2xl font-bold">Salary Slip</h2>
                <p className="text-sm text-slate-500">Payroll Statement</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p><span className="text-slate-500">Staff Name:</span><br /><strong>{staffName(detail)}</strong></p>
                <p><span className="text-slate-500">Employee ID:</span><br /><strong>{detail.employeeId || detail.staffId || detail.staff?._id || "—"}</strong></p>
                <p><span className="text-slate-500">Salary Period:</span><br /><strong>{[detail.month || detail.salaryMonth, detail.year].filter(Boolean).join(" ") || "—"}</strong></p>
                <p><span className="text-slate-500">Payment Status:</span><br /><strong>{detail.paymentStatus || detail.status || "Pending"}</strong></p>
              </div>
              <div className="space-y-3 border-t pt-4 text-sm">
                <p className="flex justify-between"><span>Basic Salary</span><strong>{money(detail.basicSalary ?? detail.basic ?? 0)}</strong></p>
                <p className="flex justify-between"><span>Allowances</span><strong>{money(detail.totalAllowances ?? detail.allowances ?? 0)}</strong></p>
                <p className="flex justify-between"><span>Deductions</span><strong>{money(detail.totalDeductions ?? detail.deductions ?? 0)}</strong></p>
                <p className="flex justify-between border-t pt-3 text-lg"><span>Net Salary</span><strong>{money(amount(detail))}</strong></p>
              </div>
              <p className="border-t pt-4 text-xs text-slate-500">Generated from the payroll records available in the system.</p>
            </div>
            <button onClick={() => window.print()} className="mt-5 flex items-center gap-2 bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white print:hidden">
              <Printer size={16} /> Print Salary Slip
            </button>
          </div>
        </div>
      )}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          #salary-slip, #salary-slip * { visibility: visible !important; }
          #salary-slip { position: absolute; left: 0; top: 0; width: 100%; border: 0 !important; }
        }
      `}</style>
    </main>
  );
}
