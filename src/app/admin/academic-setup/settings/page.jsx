
"use client";

import { useState } from "react";
import { Settings, Save, Clock, CalendarDays } from "lucide-react";

const DEFAULTS = {
  academicYear: "2026-2027",
  startDate: "",
  endDate: "",
  workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  schoolStart: "08:30",
  schoolEnd: "14:30",
  periodDuration: 45,
  shortBreak: 15,
  lunchBreak: 30,
  periodsPerDay: 8,
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function AcademicSettingsPage() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [message, setMessage] = useState("");

  function update(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setMessage("");
  }

  function toggleDay(day) {
    const exists = settings.workingDays.includes(day);
    update(
      "workingDays",
      exists
        ? settings.workingDays.filter((item) => item !== day)
        : [...settings.workingDays, day]
    );
  }

  function save(event) {
    event.preventDefault();

    // Temporary frontend save. Backend integration will be added next.
    setMessage("Settings form validated. Backend save will be connected next.");
  }

  const inputClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-cyan-600";

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-7">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <div className="mb-2 flex items-center gap-2 text-sm text-cyan-700">
            <Settings size={18} /> Academics / Settings
          </div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Academic Settings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure academic year, working days and school timings.
          </p>
        </header>

        {message && <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3 text-sm text-cyan-800">{message}</div>}

        <form onSubmit={save} className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="mb-5 flex items-center gap-2 font-bold text-slate-800">
              <CalendarDays size={19} className="text-cyan-700" /> Academic Year
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-1.5">
                <span className="text-sm font-medium">Academic year</span>
                <input required value={settings.academicYear} onChange={(e) => update("academicYear", e.target.value)} className={inputClass} placeholder="2026-2027" />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-medium">Start date</span>
                <input type="date" value={settings.startDate} onChange={(e) => update("startDate", e.target.value)} className={inputClass} />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-medium">End date</span>
                <input type="date" value={settings.endDate} onChange={(e) => update("endDate", e.target.value)} className={inputClass} />
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="mb-5 font-bold text-slate-800">Working Days</h2>
            <div className="flex flex-wrap gap-3">
              {DAYS.map((day) => (
                <label key={day} className={`cursor-pointer rounded-lg border px-4 py-2.5 text-sm ${settings.workingDays.includes(day) ? "border-cyan-700 bg-cyan-50 font-semibold text-cyan-800" : "border-slate-200 text-slate-600"}`}>
                  <input type="checkbox" className="mr-2 accent-cyan-700" checked={settings.workingDays.includes(day)} onChange={() => toggleDay(day)} />
                  {day}
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="mb-5 flex items-center gap-2 font-bold text-slate-800">
              <Clock size={19} className="text-cyan-700" /> School & Period Timings
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="space-y-1.5">
                <span className="text-sm font-medium">School start</span>
                <input type="time" required value={settings.schoolStart} onChange={(e) => update("schoolStart", e.target.value)} className={inputClass} />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-medium">School end</span>
                <input type="time" required value={settings.schoolEnd} onChange={(e) => update("schoolEnd", e.target.value)} className={inputClass} />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-medium">Period duration (minutes)</span>
                <input type="number" min="1" required value={settings.periodDuration} onChange={(e) => update("periodDuration", Number(e.target.value))} className={inputClass} />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-medium">Short break (minutes)</span>
                <input type="number" min="0" required value={settings.shortBreak} onChange={(e) => update("shortBreak", Number(e.target.value))} className={inputClass} />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-medium">Lunch break (minutes)</span>
                <input type="number" min="0" required value={settings.lunchBreak} onChange={(e) => update("lunchBreak", Number(e.target.value))} className={inputClass} />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-medium">Periods per day</span>
                <input type="number" min="1" max="15" required value={settings.periodsPerDay} onChange={(e) => update("periodsPerDay", Number(e.target.value))} className={inputClass} />
              </label>
            </div>
          </section>

          <div className="flex justify-end">
            <button type="submit" className="flex items-center gap-2 rounded-lg bg-cyan-700 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-800">
              <Save size={17} /> Save Settings
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
