
"use client";

import { useState } from "react";
import { Settings, Save } from "lucide-react";

export default function FinanceSettingsPage() {
  const [form, setForm] = useState({
    schoolName: "",
    currency: "INR",
    receiptPrefix: "FIN",
    methods: ["Cash", "UPI", "Bank Transfer", "Card"],
  });
  const [message, setMessage] = useState("");

  function saveSettings(event) {
    event.preventDefault();
    setMessage("Settings preview updated in this page only. Backend save is not connected yet.");
  }

  function toggleMethod(method) {
    setForm((current) => ({
      ...current,
      methods: current.methods.includes(method)
        ? current.methods.filter((item) => item !== method)
        : [...current.methods, method],
    }));
  }

  return (
    <main className="space-y-6 bg-slate-50/50 p-4 sm:p-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Finance</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Finance Settings</h1>
        <p className="mt-2 text-sm text-slate-500">Configure receipt and payment preferences.</p>
      </header>

      <form onSubmit={saveSettings} className="max-w-3xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><Settings size={24} /></div>
          <div>
            <h2 className="font-extrabold text-slate-900">General Settings</h2>
            <p className="text-sm text-slate-500">School finance preferences</p>
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">School Name</span>
          <input value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} placeholder="Enter school name" className="w-full rounded-xl border border-slate-200 p-3" />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-bold text-slate-700">Currency</span>
            <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white p-3">
              <option value="INR">INR - Indian Rupee (₹)</option>
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold text-slate-700">Receipt Prefix</span>
            <input required value={form.receiptPrefix} onChange={(e) => setForm({ ...form, receiptPrefix: e.target.value })} className="w-full rounded-xl border border-slate-200 p-3" />
          </label>
        </div>

        <fieldset>
          <legend className="mb-3 text-sm font-bold text-slate-700">Enabled Payment Methods</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Cash", "UPI", "Bank Transfer", "Card", "Cheque", "Other"].map((method) => (
              <label key={method} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                <input type="checkbox" checked={form.methods.includes(method)} onChange={() => toggleMethod(method)} className="h-4 w-4 accent-emerald-700" />
                <span className="text-sm font-semibold text-slate-700">{method}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {message && <p role="status" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{message}</p>}

        <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800">
          <Save size={18} /> Save Settings
        </button>
      </form>
    </main>
  );
}
