
"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Search, X, Wallet } from "lucide-react";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const API = API_ORIGIN.endsWith("/api") ? API_ORIGIN : `${API_ORIGIN}/api`;
const money = (v) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 2,
}).format(Number(v) || 0);

export default function DeductionsPage() {
  const [staff, setStaff] = useState([]);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    staffId: "", type: "Allowance", title: "", amount: "", month: "", description: "",
  });

  useEffect(() => {
    async function loadStaff() {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${API}/payroll/staff`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Staff list load nahi hui.");
        const list = Array.isArray(data) ? data : data.staff ?? data.data?.staff ?? data.data ?? [];
        setStaff(Array.isArray(list) ? list : []);
      } catch (e) {
        setError(e.message || "Staff load nahi hua.");
      }
    }
    loadStaff();
  }, []);

  function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.title.trim() || Number(form.amount) <= 0) {
      setError("Title aur valid amount enter karein.");
      return;
    }
    const person = staff.find((s) => s._id === form.staffId);
    setItems((old) => [{
      ...form,
      id: `${Date.now()}-${Math.random()}`,
      staffName: person?.name || person?.fullName || person?.employeeName || "All Staff",
      amount: Number(form.amount),
      createdAt: new Date().toISOString(),
    }, ...old]);
    setForm({ staffId: "", type: "Allowance", title: "", amount: "", month: "", description: "" });
    setShowForm(false);
  }

  const visible = items.filter((x) =>
    `${x.staffName} ${x.title} ${x.type} ${x.month}`.toLowerCase().includes(search.toLowerCase())
  );
  const allowances = visible.filter((x) => x.type === "Allowance").reduce((s, x) => s + x.amount, 0);
  const deductions = visible.filter((x) => x.type === "Deduction").reduce((s, x) => s + x.amount, 0);

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Admin / Payroll / Deductions & Allowances</p>
            <h1 className="mt-2 text-3xl font-bold">Deductions & Allowances</h1>
            <p className="mt-1 text-sm text-slate-500">Manage salary adjustments and additional payments.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white">
            <Plus size={17} /> Add Entry
          </button>
        </header>

        {error && <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <div className="grid gap-4 sm:grid-cols-3">
          <Summary title="Total Entries" value={visible.length} />
          <Summary title="Allowances" value={money(allowances)} />
          <Summary title="Deductions" value={money(deductions)} />
        </div>

        <section className="border bg-white">
          <div className="border-b p-4">
            <div className="relative max-w-lg">
              <Search size={17} className="absolute left-3 top-3 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search staff or entry..."
                className="w-full border py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-600" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr><th className="p-4">Staff</th><th className="p-4">Type</th><th className="p-4">Title</th><th className="p-4">Month</th><th className="p-4">Amount</th><th className="p-4">Action</th></tr>
              </thead>
              <tbody className="divide-y">
                {visible.length === 0 ? (
                  <tr><td colSpan={6} className="p-10 text-center text-slate-500"><Wallet className="mx-auto mb-2" />No entries added yet.</td></tr>
                ) : visible.map((x) => (
                  <tr key={x.id} className="hover:bg-slate-50">
                    <td className="p-4">{x.staffName}</td>
                    <td className="p-4"><span className={`px-2 py-1 text-xs ${x.type === "Allowance" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{x.type}</span></td>
                    <td className="p-4">{x.title}</td><td className="p-4">{x.month || "—"}</td>
                    <td className="p-4 font-semibold">{money(x.amount)}</td>
                    <td className="p-4"><button onClick={() => setItems((old) => old.filter((y) => y.id !== x.id))} className="text-red-600 hover:text-red-800" aria-label="Delete entry"><Trash2 size={17} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t bg-amber-50 p-3 text-xs text-amber-800">
            Note: These entries are temporary frontend entries. They reset on page refresh until a matching backend save endpoint is connected.
          </p>
        </section>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <form onSubmit={submit} className="my-auto w-full max-w-lg space-y-4 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Add Salary Entry</h2><button type="button" onClick={() => setShowForm(false)}><X /></button></div>
            <label className="block text-sm font-medium">Staff
              <select value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })} className="mt-1 w-full border p-2.5">
                <option value="">All Staff / Not specified</option>
                {staff.map((s) => <option key={s._id} value={s._id}>{s.name || s.fullName || s.employeeName || s._id}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium">Entry Type
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 w-full border p-2.5"><option>Allowance</option><option>Deduction</option></select>
            </label>
            <label className="block text-sm font-medium">Title
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Transport Allowance, PF" className="mt-1 w-full border p-2.5" />
            </label>
            <label className="block text-sm font-medium">Amount (₹)
              <input required min="0.01" step="0.01" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="mt-1 w-full border p-2.5" />
            </label>
            <label className="block text-sm font-medium">Month
              <input type="month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} className="mt-1 w-full border p-2.5" />
            </label>
            <label className="block text-sm font-medium">Description (optional)
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full border p-2.5" rows={2} />
            </label>
            <button type="submit" className="w-full bg-emerald-700 p-3 font-semibold text-white">Add Entry</button>
          </form>
        </div>
      )}
    </main>
  );
}

function Summary({ title, value }) {
  return <div className="border bg-white p-5"><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>;
}
