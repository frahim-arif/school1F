
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, BookOpen, Save, Settings } from "lucide-react";
import { libraryApi } from "@/lib/libraryApi";

const defaults = {
  maxBooksPerStudent: 3,
  returnDuration: 15,
  finePerLateDay: 5,
  issueNotifications: true,
  returnReminders: true,
};

export default function LibrarySettingsPage() {
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        setError("");
        const data = await libraryApi.getSettings();
        setForm({ ...defaults, ...(data.settings || {}) });
      } catch (err) {
        setError(err.message || "Settings load nahi hui.");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function updateField(e) {
    const { name, value, type, checked } = e.target;
    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        maxBooksPerStudent: Number(form.maxBooksPerStudent),
        returnDuration: Number(form.returnDuration),
        finePerLateDay: Number(form.finePerLateDay),
        issueNotifications: form.issueNotifications,
        returnReminders: form.returnReminders,
      };

      const data = await libraryApi.updateSettings(payload);
      setForm({ ...defaults, ...(data.settings || payload) });
      setMessage("Library settings successfully save ho gayi.");
    } catch (err) {
      setError(err.message || "Settings save nahi hui.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "mt-1 w-full border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-emerald-700";
  const labelClass = "block text-sm font-medium text-slate-700";

  if (loading) {
    return <main className="min-h-screen bg-slate-50 p-8 text-slate-600">Loading settings...</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/library" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-800 hover:underline">
          <ArrowLeft size={17} /> Back to Library
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <div className="bg-emerald-100 p-3 text-emerald-800"><Settings size={25} /></div>
          <div>
            <h1 className="text-2xl font-bold">Library Settings</h1>
            <p className="text-sm text-slate-500">Configure book issue and return rules</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          {error && <p role="alert" className="bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {message && <p className="bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}

          <section className="space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookOpen size={20} className="text-emerald-700" />
              <h2 className="font-bold">Book Issue Rules</h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className={labelClass}>
                Maximum Books per Student
                <input
                  name="maxBooksPerStudent"
                  type="number"
                  min="1"
                  step="1"
                  value={form.maxBooksPerStudent}
                  onChange={updateField}
                  className={inputClass}
                  required
                />
              </label>

              <label className={labelClass}>
                Return Duration (Days)
                <input
                  name="returnDuration"
                  type="number"
                  min="1"
                  step="1"
                  value={form.returnDuration}
                  onChange={updateField}
                  className={inputClass}
                  required
                />
              </label>

              <label className={labelClass}>
                Fine per Late Day (₹)
                <input
                  name="finePerLateDay"
                  type="number"
                  min="0"
                  step="1"
                  value={form.finePerLateDay}
                  onChange={updateField}
                  className={inputClass}
                  required
                />
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Bell size={20} className="text-emerald-700" />
              <h2 className="font-bold">Notifications</h2>
            </div>

            <label className="flex cursor-pointer items-start justify-between gap-4 border border-slate-200 p-4">
              <div>
                <p className="text-sm font-semibold">Issue Notifications</p>
                <p className="mt-1 text-xs text-slate-500">Enable the issue notification preference.</p>
              </div>
              <input
                type="checkbox"
                name="issueNotifications"
                checked={Boolean(form.issueNotifications)}
                onChange={updateField}
                className="mt-1 h-4 w-4 accent-emerald-700"
              />
            </label>

            <label className="flex cursor-pointer items-start justify-between gap-4 border border-slate-200 p-4">
              <div>
                <p className="text-sm font-semibold">Return Reminders</p>
                <p className="mt-1 text-xs text-slate-500">Enable the return reminder preference.</p>
              </div>
              <input
                type="checkbox"
                name="returnReminders"
                checked={Boolean(form.returnReminders)}
                onChange={updateField}
                className="mt-1 h-4 w-4 accent-emerald-700"
              />
            </label>
          </section>

          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              <Save size={17} /> {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
