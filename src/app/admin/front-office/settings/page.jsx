
"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Save, LoaderCircle, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/+$/, "");

const defaultSettings = {
  schoolName: "",
  contactPhone: "",
  contactEmail: "",
  address: "",
  visitorPurposes: ["Admission", "Meeting", "Fee", "Other"],
  complaintCategories: ["Academic", "Transport", "Fees", "Staff", "Facilities", "Other"],
};

export default function FrontOfficeSettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const response = await fetch(`${API_BASE}/api/front-office/settings`);
        const result = await response.json();

        if (!response.ok || result._status === false) {
          throw new Error(result._message || "Unable to load settings");
        }

        if (active && result._data) {
          setForm({ ...defaultSettings, ...result._data });
        }
      } catch (err) {
        if (active) setError(err.message || "Unable to load settings");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSettings();
    return () => { active = false; };
  }, []);

  const update = (key, value) => {
    setForm((old) => ({ ...old, [key]: value }));
  };

  const updateList = (key, value) => {
    update(key, value.split("\n").map((item) => item.trim()).filter(Boolean));
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/front-office/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok || result._status === false) {
        throw new Error(result._message || "Unable to save settings");
      }

      setForm({ ...defaultSettings, ...result._data });
      setMessage("Front Office settings saved successfully.");
    } catch (err) {
      setError(err.message || "Unable to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-2 text-slate-500">
        <LoaderCircle className="animate-spin" /> Loading settings...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] p-4 text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <button
          onClick={() => router.push("/admin/front-office")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:underline"
        >
          <ArrowLeft size={16} /> Front Office
        </button>

        <div>
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-3 text-emerald-800"><Settings2 size={24} /></div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Front Office Settings</h1>
              <p className="mt-1 text-sm text-slate-500">Configure school contact details and record categories.</p>
            </div>
          </div>
        </div>

        {error && <div className="border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
        {message && <div className="border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{message}</div>}

        <form onSubmit={save} className="space-y-6">
          <section className="border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-bold">School Information</h2>
              <p className="mt-1 text-sm text-slate-500">Contact information used by the front office.</p>
            </div>
            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
              {[
                ["schoolName", "School Name", "text"],
                ["contactPhone", "Contact Phone", "tel"],
                ["contactEmail", "Contact Email", "email"],
              ].map(([key, label, type]) => (
                <label key={key} className="block">
                  <span className="mb-1.5 block text-sm font-semibold">{label}</span>
                  <input
                    type={type}
                    value={form[key] || ""}
                    onChange={(event) => update(key, event.target.value)}
                    className="w-full border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-700"
                  />
                </label>
              ))}
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-semibold">School Address</span>
                <textarea
                  rows={3}
                  value={form.address || ""}
                  onChange={(event) => update("address", event.target.value)}
                  className="w-full border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-700"
                />
              </label>
            </div>
          </section>

          <section className="border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-bold">Configurable Categories</h2>
              <p className="mt-1 text-sm text-slate-500">Enter one option per line.</p>
            </div>
            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Visitor Purposes</span>
                <textarea
                  rows={7}
                  value={(form.visitorPurposes || []).join("\n")}
                  onChange={(event) => updateList("visitorPurposes", event.target.value)}
                  className="w-full border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-700"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Complaint Categories</span>
                <textarea
                  rows={7}
                  value={(form.complaintCategories || []).join("\n")}
                  onChange={(event) => updateList("complaintCategories", event.target.value)}
                  className="w-full border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-700"
                />
              </label>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              disabled={saving}
              className="inline-flex items-center gap-2 bg-emerald-800 px-5 py-3 font-semibold text-white hover:bg-emerald-900 disabled:opacity-60"
            >
              {saving ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />}
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
