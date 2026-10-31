
"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  BellRing,
  Save,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  Settings2,
  CalendarClock,
  Users,
  GraduationCap,
  RotateCcw,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const DEFAULT_SETTINGS = {
  defaultCategory: "General",
  autoExpire: true,
  notifications: true,
  studentView: true,
  staffView: true,
};

const categories = ["General", "Exam", "Holiday", "Fee", "Event"];

export default function NoticeSettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  async function loadSettings() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE}/api/notice-settings`, {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || result?._status === false) {
        throw new Error(
          result?._message || "Notice settings load nahi hui."
        );
      }

      const data = result?._data || result;

      setSettings({
        ...DEFAULT_SETTINGS,
        ...data,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.message === "Failed to fetch"
            ? "Backend connection nahi ho raha. Backend server aur CORS check karein."
            : error.message || "Settings load karne mein error aaya.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function updateSetting(name, value) {
    setSettings((previous) => ({
      ...previous,
      [name]: value,
    }));
    setMessage(null);
  }

  async function saveSettings(event) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE}/api/notice-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          defaultCategory: settings.defaultCategory,
          autoExpire: settings.autoExpire,
          notifications: settings.notifications,
          studentView: settings.studentView,
          staffView: settings.staffView,
        }),
      });

      const result = await response.json();

      if (!response.ok || result?._status === false) {
        throw new Error(
          result?._message || result?.message || "Settings save nahi hui."
        );
      }

      const data = result?._data || result;

      setSettings((previous) => ({
        ...previous,
        ...data,
      }));

      setMessage({
        type: "success",
        text: result?._message || "Notice settings successfully save ho gayi!",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.message === "Failed to fetch"
            ? "Backend se connection nahi ho raha. Server aur CORS settings check karein."
            : error.message || "Settings save karte waqt error aaya.",
      });
    } finally {
      setSaving(false);
    }
  }

  const toggleItems = [
    {
      key: "autoExpire",
      title: "Automatic Notice Expiry",
      description:
        "Expiry date guzarne par notice ko automatically expired mark karein.",
      icon: CalendarClock,
    },
    {
      key: "notifications",
      title: "Notice Notifications",
      description:
        "Notice publish hone par notification feature enable rakhein.",
      icon: BellRing,
    },
    {
      key: "studentView",
      title: "Student Visibility",
      description: "Students ko notices dekhne ki permission dein.",
      icon: GraduationCap,
    },
    {
      key: "staffView",
      title: "Staff Visibility",
      description: "Teachers aur staff ko notices dekhne ki permission dein.",
      icon: Users,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      {/* Page header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#5a3425] via-[#713f30] to-[#9a5260] p-6 text-white shadow-lg sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
            <Settings2 size={28} />
          </div>

          <div>
            <h1 className="text-2xl font-black sm:text-3xl">
              Notice Settings
            </h1>
            <p className="mt-2 text-sm text-white/80">
              Manage notice categories, expiry, notifications and visibility.
            </p>
          </div>
        </div>
      </div>

      {/* Status message */}
      {message && (
        <div
          role="alert"
          className={`flex items-start gap-3 rounded-xl border p-4 ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
          )}
          <p className="flex-1 text-sm font-medium">{message.text}</p>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white">
          <LoaderCircle size={32} className="animate-spin text-[#9a5260]" />
          <p className="text-sm text-slate-500">Loading notice settings...</p>
        </div>
      ) : (
        <form onSubmit={saveSettings} className="space-y-6">
          {/* Default category */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
              <div className="rounded-xl bg-pink-50 p-2.5 text-[#9a5260]">
                <Bell size={21} />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">
                  General Preferences
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Set the default category for new notices.
                </p>
              </div>
            </div>

            <div className="p-6">
              <label
                htmlFor="defaultCategory"
                className="text-sm font-bold text-slate-700"
              >
                Default Notice Category
              </label>

              <select
                id="defaultCategory"
                value={settings.defaultCategory}
                onChange={(event) =>
                  updateSetting("defaultCategory", event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a5260] focus:ring-2 focus:ring-pink-100 sm:max-w-md"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs text-slate-500">
                This preference is saved for future use. The Create Notice
                form must read this setting to apply it automatically.
              </p>
            </div>
          </section>

          {/* Toggle settings */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="font-bold text-slate-800">
                Notice Controls
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enable or disable notice-related features.
              </p>
            </div>

            <div className="divide-y divide-slate-100 px-6">
              {toggleItems.map((item) => {
                const Icon = item.icon;
                const enabled = Boolean(settings[item.key]);

                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-4 py-5"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="mt-0.5 rounded-xl bg-pink-50 p-2.5 text-[#9a5260]">
                        <Icon size={20} />
                      </div>

                      <div>
                        <p className="font-semibold text-slate-800">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          {item.description}
                        </p>
                        <span
                          className={`mt-2 inline-block text-xs font-bold ${
                            enabled ? "text-green-700" : "text-slate-500"
                          }`}
                        >
                          {enabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      aria-label={item.title}
                      onClick={() => updateSetting(item.key, !enabled)}
                      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 ${
                        enabled ? "bg-[#9a5260]" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                          enabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={loadSettings}
              disabled={saving || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RotateCcw size={17} />
              Reload Settings
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#713f30] to-[#9a5260] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-900/10 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
