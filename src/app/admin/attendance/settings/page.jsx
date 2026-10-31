
"use client";

import { useEffect, useState } from "react";
import {
  Clock3,
  Timer,
  CalendarDays,
  Save,
  RefreshCw,
  Settings2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_URL = API_BASE.endsWith("/api")
  ? `${API_BASE}/attendance-settings`
  : `${API_BASE}/api/attendance-settings`;

const DEFAULT_SETTINGS = {
  minimumWorkingHours: 6,
  allowedLateMinutes: 15,
  startTime: "08:00",
  endTime: "14:00",
  autoAttendance: false,
  weekends: ["Sunday"],
};

const WEEKDAYS = ["Friday", "Saturday", "Sunday"];

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50";

export default function AttendanceSettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function requestSettings(method = "GET", body) {
    const response = await fetch(API_URL, {
      method,
      cache: "no-store",
      headers: body
        ? { "Content-Type": "application/json" }
        : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || `Request failed (${response.status})`
      );
    }

    return result;
  }

  async function loadSettings() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await requestSettings();

      setSettings({
        ...DEFAULT_SETTINGS,
        ...(result.settings || {}),
        weekends: Array.isArray(result.settings?.weekends)
          ? result.settings.weekends
          : DEFAULT_SETTINGS.weekends,
      });
    } catch (err) {
      setError(err.message || "Unable to load attendance settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function updateField(field, value) {
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));
    setMessage("");
  }

  function toggleWeekend(day) {
    setSettings((previous) => ({
      ...previous,
      weekends: previous.weekends.includes(day)
        ? previous.weekends.filter((item) => item !== day)
        : [...previous.weekends, day],
    }));
    setMessage("");
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const hours = Number(settings.minimumWorkingHours);
    const lateMinutes = Number(settings.allowedLateMinutes);

    if (!Number.isFinite(hours) || hours < 0 || hours > 24) {
      setError("Minimum working hours must be between 0 and 24.");
      setSaving(false);
      return;
    }

    if (
      !Number.isInteger(lateMinutes) ||
      lateMinutes < 0 ||
      lateMinutes > 1440
    ) {
      setError("Allowed late minutes must be between 0 and 1440.");
      setSaving(false);
      return;
    }

    if (settings.startTime >= settings.endTime) {
      setError("End time must be later than start time.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        minimumWorkingHours: hours,
        allowedLateMinutes: lateMinutes,
        startTime: settings.startTime,
        endTime: settings.endTime,
        autoAttendance: Boolean(settings.autoAttendance),
        weekends: settings.weekends,
      };

      const result = await requestSettings("PUT", payload);

      setSettings({
        ...DEFAULT_SETTINGS,
        ...(result.settings || payload),
        weekends: Array.isArray(result.settings?.weekends)
          ? result.settings.weekends
          : payload.weekends,
      });

      setMessage("Attendance settings saved successfully.");
    } catch (err) {
      setError(err.message || "Unable to save attendance settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-slate-500">
        <RefreshCw size={20} className="animate-spin" />
        Loading attendance settings...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      <header className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
          <Settings2 size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 sm:text-3xl">
            Attendance Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure attendance rules and system preferences
          </p>
        </div>
      </header>

      {message && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700"
        >
          <CheckCircle2 size={19} />
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p>{error}</p>
            <button
              type="button"
              onClick={loadSettings}
              className="mt-2 font-bold underline"
            >
              Reload settings
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
              <Timer size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">
                Attendance Rules
              </h2>
              <p className="text-sm text-slate-500">
                Set minimum working hours and late allowance
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-bold text-slate-600">
              Minimum Working Hours
              <input
                type="number"
                min="0"
                max="24"
                step="0.5"
                required
                className={inputClass}
                value={settings.minimumWorkingHours}
                onChange={(e) =>
                  updateField("minimumWorkingHours", e.target.value)
                }
              />
              <span className="mt-1 block text-xs font-normal text-slate-400">
                Hours required for a full attendance day
              </span>
            </label>

            <label className="text-sm font-bold text-slate-600">
              Allowed Late Minutes
              <input
                type="number"
                min="0"
                max="1440"
                step="1"
                required
                className={inputClass}
                value={settings.allowedLateMinutes}
                onChange={(e) =>
                  updateField("allowedLateMinutes", e.target.value)
                }
              />
              <span className="mt-1 block text-xs font-normal text-slate-400">
                Grace period for late arrival
              </span>
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
              <Clock3 size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">
                Working Hours
              </h2>
              <p className="text-sm text-slate-500">
                Configure the school attendance schedule
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-bold text-slate-600">
              Start Time
              <input
                type="time"
                required
                className={inputClass}
                value={settings.startTime}
                onChange={(e) => updateField("startTime", e.target.value)}
              />
            </label>

            <label className="text-sm font-bold text-slate-600">
              End Time
              <input
                type="time"
                required
                className={inputClass}
                value={settings.endTime}
                onChange={(e) => updateField("endTime", e.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-green-100 p-3 text-green-600">
                <Settings2 size={22} />
              </div>
              <div>
                <h2 className="font-black text-slate-800">
                  Auto Attendance
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enable automatic attendance marking
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-label="Enable automatic attendance"
              aria-checked={settings.autoAttendance}
              onClick={() =>
                updateField("autoAttendance", !settings.autoAttendance)
              }
              className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                settings.autoAttendance ? "bg-indigo-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  settings.autoAttendance ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          <p className="mt-4 text-xs leading-5 text-amber-700">
            Enabling this option saves the preference only. Actual automatic
            marking requires a scheduler or background job in the backend.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
              <CalendarDays size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">
                Weekend Settings
              </h2>
              <p className="text-sm text-slate-500">
                Select the days treated as school weekends
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {WEEKDAYS.map((day) => {
              const selected = settings.weekends.includes(day);

              return (
                <label
                  key={day}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                    selected
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleWeekend(day)}
                    className="h-4 w-4 accent-indigo-600"
                  />
                  <span className="font-bold text-slate-700">{day}</span>
                  <span className="ml-auto text-xs text-slate-400">
                    {selected ? "Weekend" : "Working day"}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {saving ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
