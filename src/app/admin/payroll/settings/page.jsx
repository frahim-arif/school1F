
"use client";

import { useEffect, useState } from "react";
import { Save, RefreshCw, Settings, AlertCircle, CheckCircle2 } from "lucide-react";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const API = API_ORIGIN.endsWith("/api") ? API_ORIGIN : `${API_ORIGIN}/api`;

const initialSettings = {
  currency: "INR",
  currencySymbol: "₹",
  payDay: "1",
  financialYearStart: "4",
  workingDays: "26",
  defaultPaymentMethod: "Bank Transfer",
  allowNegativeSalary: false,
  autoGenerate: false,
};

export default function PayrollSettingsPage() {
  const [form, setForm] = useState(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadSettings() {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API}/payroll/settings`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || data.success === false || data._status === false) {
        throw new Error(data.message || data._message || "Settings load nahi hui.");
      }
      const settings = data.settings ?? data.data?.settings ?? data.data ?? data;
      setForm({ ...initialSettings, ...(settings || {}) });
    } catch (e) {
      setError(e.message || "Settings load nahi hui. Default values dikhayi ja rahi hain.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadSettings(); }, []);

  async function saveSettings(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API}/payroll/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...form,
          payDay: Number(form.payDay),
          financialYearStart: Number(form.financialYearStart),
          workingDays: Number(form.workingDays),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false || data._status === false) {
        throw new Error(data.message || data._message || "Settings save nahi hui.");
      }
      setMessage("Settings successfully save ho gayi.");
    } catch (e) {
      setError(e.message || "Settings save nahi hui. Backend schema check karein.");
    } finally {
      setSaving(false);
    }
  }

  function update(key, value) {
    setForm((old) => ({ ...old, [key]: value }));
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Admin / Payroll / Settings</p>
            <h1 className="mt-2 text-3xl font-bold">Payroll Settings</h1>
            <p className="mt-1 text-sm text-slate-500">Configure payroll defaults and payment preferences.</p>
          </div>
          <button type="button" onClick={loadSettings} className="flex items-center gap-2 border bg-white px-4 py-2.5 text-sm"><RefreshCw size={16} /> Reload</button>
        </header>

        {error && <div className="flex gap-2 border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={18} />{error}</div>}
        {message && <div className="flex gap-2 border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 size={18} />{message}</div>}

        <form onSubmit={saveSettings} className="space-y-6">
          <section className="border bg-white">
            <div className="flex items-center gap-3 border-b p-5"><Settings className="text-emerald-700" /><div><h2 className="font-bold">General Settings</h2><p className="text-sm text-slate-500">Currency and salary cycle configuration</p></div></div>
            <div className="grid gap-5 p-5 sm:grid-cols-2">
              <Field label="Currency">
                <select value={form.currency} onChange={(e) => update("currency", e.target.value)} className="w-full border p-2.5">
                  <option value="INR">Indian Rupee (INR)</option><option value="USD">US Dollar (USD)</option><option value="GBP">British Pound (GBP)</option>
                </select>
              </Field>
              <Field label="Currency Symbol">
                <input value={form.currencySymbol} onChange={(e) => update("currencySymbol", e.target.value)} className="w-full border p-2.5" />
              </Field>
              <Field label="Salary Payment Day (1–28)">
                <input type="number" min="1" max="28" required value={form.payDay} onChange={(e) => update("payDay", e.target.value)} className="w-full border p-2.5" />
              </Field>
              <Field label="Working Days per Month">
                <input type="number" min="1" max="31" required value={form.workingDays} onChange={(e) => update("workingDays", e.target.value)} className="w-full border p-2.5" />
              </Field>
              <Field label="Financial Year Starts">
                <select value={form.financialYearStart} onChange={(e) => update("financialYearStart", e.target.value)} className="w-full border p-2.5">
                  {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(2026, i, 1).toLocaleString("en-IN", { month: "long" })}</option>)}
                </select>
              </Field>
              <Field label="Default Payment Method">
                <select value={form.defaultPaymentMethod} onChange={(e) => update("defaultPaymentMethod", e.target.value)} className="w-full border p-2.5">
                  <option>Bank Transfer</option><option>UPI</option><option>Cash</option><option>Cheque</option>
                </select>
              </Field>
            </div>
          </section>

          <section className="space-y-4 border bg-white p-5">
            <h2 className="font-bold">Payroll Controls</h2>
            <Toggle label="Allow negative net salary" description="Allow deductions to exceed calculated earnings." checked={Boolean(form.allowNegativeSalary)} onChange={(v) => update("allowNegativeSalary", v)} />
            <Toggle label="Automatic salary generation" description="Setting only; automatic generation needs backend scheduler support." checked={Boolean(form.autoGenerate)} onChange={(v) => update("autoGenerate", v)} />
          </section>

          <div className="flex justify-end">
            <button type="submit" disabled={saving || loading} className="flex items-center gap-2 bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
              {saving ? <RefreshCw size={17} className="animate-spin" /> : <Save size={17} />}
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
          {loading && <p className="text-sm text-slate-500">Settings load ho rahi hain...</p>}
        </form>
      </div>
    </main>
  );
}

function Field({ label, children }) {
  return <label className="block text-sm font-medium text-slate-700">{label}<div className="mt-1.5">{children}</div></label>;
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 border-b pb-4 last:border-0 last:pb-0">
      <span><span className="block text-sm font-semibold">{label}</span><span className="mt-1 block text-xs text-slate-500">{description}</span></span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 accent-emerald-700" />
    </label>
  );
}
