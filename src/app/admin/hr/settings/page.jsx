
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Settings2, CalendarDays, Clock3, Bell,
  ShieldCheck, Save, RotateCcw
} from "lucide-react";

const defaults = {
  annualLeave: "12",
  sickLeave: "10",
  casualLeave: "7",
  noticeDays: "3",
  workStart: "08:00",
  workEnd: "14:00",
  lateAfter: "08:15",
  emailNotifications: true,
  leaveNotifications: true,
  attendanceNotifications: true,
};

export default function HRSettingsPage() {
  const [settings, setSettings] = useState(defaults);
  const [message, setMessage] = useState("");

  function update(field, value) {
    setSettings((current) => ({ ...current, [field]: value }));
    setMessage("");
  }

  function resetSettings() {
    setSettings(defaults);
    setMessage("Default values restored on this page. Save them through your backend when connected.");
  }

  function handleSave(event) {
    event.preventDefault();
    setMessage("Settings are currently only held on this page. Connect your HR settings API before saving permanently.");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-7 lg:p-9">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin/hr" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-800">
          <ArrowLeft size={17} /> HR Dashboard
        </Link>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Human Resources</p>
          <h1 className="mt-2 text-3xl font-extrabold">HR Settings</h1>
          <p className="mt-2 text-sm text-slate-500">Configure leave rules, working hours and HR notifications.</p>
        </div>

        <form onSubmit={handleSave} className="mt-7 space-y-6">
          <section className="border border-slate-200 bg-white">
            <div className="flex items-center gap-3 border-b border-slate-200 p-5">
              <span className="flex h-10 w-10 items-center justify-center bg-emerald-50 text-emerald-800"><CalendarDays size={21} /></span>
              <div>
                <h2 className="font-bold">Leave Policy</h2>
                <p className="text-sm text-slate-500">Default annual leave allowance in days.</p>
              </div>
            </div>
            <div className="grid gap-5 p-5 sm:grid-cols-3">
              {[
                ["annualLeave", "Annual Leave"],
                ["sickLeave", "Sick Leave"],
                ["casualLeave", "Casual Leave"],
              ].map(([field, label]) => (
                <label key={field} className="text-sm font-semibold text-slate-600">
                  {label}
                  <input type="number" min="0" value={settings[field]} onChange={(e) => update(field, e.target.value)} className="mt-2 block w-full border border-slate-200 px-3 py-3 text-slate-800 outline-none focus:border-emerald-700" />
                </label>
              ))}
              <label className="text-sm font-semibold text-slate-600 sm:col-span-3">
                Advance Notice (days)
                <input type="number" min="0" value={settings.noticeDays} onChange={(e) => update("noticeDays", e.target.value)} className="mt-2 block w-full border border-slate-200 px-3 py-3 text-slate-800 outline-none focus:border-emerald-700 sm:max-w-xs" />
              </label>
            </div>
          </section>

          <section className="border border-slate-200 bg-white">
            <div className="flex items-center gap-3 border-b border-slate-200 p-5">
              <span className="flex h-10 w-10 items-center justify-center bg-blue-50 text-blue-700"><Clock3 size={21} /></span>
              <div>
                <h2 className="font-bold">Working Hours & Attendance</h2>
                <p className="text-sm text-slate-500">Configure school staff timing rules.</p>
              </div>
            </div>
            <div className="grid gap-5 p-5 sm:grid-cols-3">
              {[
                ["workStart", "Work Start"],
                ["workEnd", "Work End"],
                ["lateAfter", "Late After"],
              ].map(([field, label]) => (
                <label key={field} className="text-sm font-semibold text-slate-600">
                  {label}
                  <input type="time" value={settings[field]} onChange={(e) => update(field, e.target.value)} className="mt-2 block w-full border border-slate-200 px-3 py-3 text-slate-800 outline-none focus:border-emerald-700" />
                </label>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 bg-white">
            <div className="flex items-center gap-3 border-b border-slate-200 p-5">
              <span className="flex h-10 w-10 items-center justify-center bg-amber-50 text-amber-700"><Bell size={21} /></span>
              <div>
                <h2 className="font-bold">Notifications</h2>
                <p className="text-sm text-slate-500">Choose which HR notifications should be enabled.</p>
              </div>
            </div>
            <div className="divide-y divide-slate-100 px-5">
              {[
                ["emailNotifications", "Email Notifications", "General HR notifications"],
                ["leaveNotifications", "Leave Notifications", "Leave application and decision alerts"],
                ["attendanceNotifications", "Attendance Notifications", "Attendance and late-arrival alerts"],
              ].map(([field, title, description]) => (
                <label key={field} className="flex cursor-pointer items-center justify-between gap-4 py-4">
                  <span>
                    <span className="block text-sm font-semibold">{title}</span>
                    <span className="mt-1 block text-xs text-slate-500">{description}</span>
                  </span>
                  <input type="checkbox" checked={settings[field]} onChange={(e) => update(field, e.target.checked)} className="h-5 w-5 accent-emerald-800" />
                </label>
              ))}
            </div>
          </section>

          <div className="flex flex-col justify-between gap-4 border border-slate-200 bg-white p-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-2 text-xs leading-5 text-slate-500">
              <ShieldCheck size={18} className="shrink-0 text-emerald-700" />
              Changes are not stored permanently until the HR settings API is connected.
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={resetSettings} className="inline-flex items-center justify-center gap-2 border border-slate-200 px-4 py-3 text-sm font-bold hover:bg-slate-50">
                <RotateCcw size={16} /> Reset
              </button>
              <button type="submit" className="inline-flex items-center justify-center gap-2 bg-[#0b302a] px-5 py-3 text-sm font-bold text-white hover:bg-[#16483b]">
                <Save size={16} /> Save Settings
              </button>
            </div>
          </div>

          {message && <p role="status" className="border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{message}</p>}
        </form>
      </div>
    </main>
  );
}
