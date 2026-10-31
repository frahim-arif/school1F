
"use client";

import { useEffect, useState } from "react";
import {
  Settings, Save, Clock3, UploadCloud, CheckCircle2, AlertCircle
} from "lucide-react";
import { homeworkApi } from "@/lib/homeworkApi";

export default function HomeworkSettingsPage() {
  const [settings, setSettings] = useState({
    maxFileSizeMB: 10,
    allowedFileTypes: ["pdf", "jpg", "jpeg", "png"],
    allowLateSubmission: true,
    submissionNotification: true,
    autoReminder: false,
    reminderTiming: "1 Day Before",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    homeworkApi.getSettings()
      .then((result) => {
        const data = result.data || {};
        setSettings((prev) => ({ ...prev, ...data }));
      })
      .catch((err) => setError(err.message || "Settings load nahi hui."))
      .finally(() => setLoading(false));
  }, []);

  function update(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const result = await homeworkApi.saveSettings(settings);
      setSettings((prev) => ({ ...prev, ...result.data }));
      setSuccess("Homework settings save ho gayi.");
    } catch (err) {
      setError(err.message || "Settings save nahi hui.");
    } finally {
      setSaving(false);
    }
  }

  function toggle(key) {
    update(key, !settings[key]);
  }

  function ToggleRow({ title, description, setting, color }) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
        <div>
          <h3 className="font-bold text-slate-800">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(settings[setting])}
          onClick={() => toggle(setting)}
          className={`h-7 w-14 shrink-0 rounded-full transition ${
            settings[setting] ? color : "bg-slate-300"
          }`}
        >
          <span className={`block h-5 w-5 rounded-full bg-white transition ${
            settings[setting] ? "translate-x-8" : "translate-x-1"
          }`} />
        </button>
      </div>
    );
  }

  const inputClass =
    "mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-indigo-500";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-800">Homework Settings</h1>
        <p className="mt-2 text-sm text-slate-500">
          Configure homework submission rules and preferences.
        </p>
      </div>

      {error && (
        <div className="flex gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} /> {error}
        </div>
      )}
      {success && (
        <div className="flex gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 size={18} /> {success}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border bg-white p-8 text-slate-500">
          Settings load ho rahi hain...
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
                  <Settings size={22} />
                </div>
                <h2 className="text-lg font-black text-slate-800">
                  Submission Rules
                </h2>
              </div>

              <label className="mt-6 block text-sm font-bold text-slate-600">
                Maximum File Size (MB)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={settings.maxFileSizeMB}
                onChange={(e) => update("maxFileSizeMB", Number(e.target.value))}
                className={inputClass}
              />

              <label className="mt-5 block text-sm font-bold text-slate-600">
                Allowed File Types
              </label>
              <input
                value={(settings.allowedFileTypes || []).join(", ")}
                onChange={(e) => update(
                  "allowedFileTypes",
                  e.target.value.split(",").map((type) =>
                    type.trim().toLowerCase().replace(/^\./, "")
                  ).filter(Boolean)
                )}
                className={inputClass}
                placeholder="PDF, JPG, PNG"
              />
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-green-600" size={24} />
                <h2 className="text-lg font-black text-slate-800">
                  Control Settings
                </h2>
              </div>

              <div className="mt-6 space-y-4">
                <ToggleRow
                  title="Allow Late Submission"
                  description="Students can submit after due date"
                  setting="allowLateSubmission"
                  color="bg-green-600"
                />
                <ToggleRow
                  title="Submission Notification"
                  description="Notify teachers about submissions"
                  setting="submissionNotification"
                  color="bg-indigo-600"
                />
                <ToggleRow
                  title="Auto Reminder"
                  description="Enable deadline reminders"
                  setting="autoReminder"
                  color="bg-purple-600"
                />
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Clock3 className="text-orange-600" size={24} />
                <h2 className="text-lg font-black text-slate-800">
                  Reminder Timing
                </h2>
              </div>
              <select
                value={settings.reminderTiming}
                onChange={(e) => update("reminderTiming", e.target.value)}
                className={inputClass}
              >
                <option>1 Day Before</option>
                <option>2 Days Before</option>
                <option>3 Days Before</option>
                <option>On Due Date</option>
              </select>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <UploadCloud className="text-purple-600" size={24} />
                <h2 className="text-lg font-black text-slate-800">
                  Upload Settings
                </h2>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-500">
                These settings store the allowed file size and types.
                Actual upload enforcement must also be configured in the backend upload endpoint.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg hover:bg-indigo-700 disabled:opacity-60"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
