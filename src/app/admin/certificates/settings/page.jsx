
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  HiOutlineAcademicCap,
  HiOutlineBuildingOffice2,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlinePhoto,
  HiOutlineUser,
  HiOutlineHashtag,
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineDocumentCheck,
} from "react-icons/hi2";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "hhttps://school1b.onrender.com"
).replace(/\/+$/, "");

const API_ROOT = API_BASE.endsWith("/api")
  ? API_BASE
  : `${API_BASE}/api`;

const initialSettings = {
  schoolName: "",
  schoolAddress: "",
  schoolPhone: "",
  schoolEmail: "",
  schoolLogo: "",
  principalName: "",
  principalSignature: "",
  certificatePrefix: "CERT",
  nextCertificateNumber: 1,
};

const inputClass =
  "mt-2 w-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";

function InputField({
  label,
  name,
  value,
  onChange,
  icon: Icon,
  ...props
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        )}
        <input
          name={name}
          value={value ?? ""}
          onChange={onChange}
          className={`${inputClass} ${Icon ? "pl-10" : ""}`}
          {...props}
        />
      </div>
    </label>
  );
}

function Section({ title, description, icon: Icon, children }) {
  return (
    <section className="border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 flex items-start gap-3 border-b border-slate-100 pb-5">
        <div className="bg-emerald-50 p-3 text-emerald-800">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function CertificateSettingsPage() {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("adminToken")
          : null;

      const response = await fetch(`${API_ROOT}/certificate-settings`, {
        cache: "no-store",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await response.json();

      if (!response.ok || result._status === false) {
        throw new Error(
          result._message || "Certificate settings load nahi hui."
        );
      }

      const data = result._data?.settings ?? result._data;

      if (data && !Array.isArray(data)) {
        setSettings({ ...initialSettings, ...data });
      }
    } catch (err) {
      setError(err.message || "Settings load karne mein error aaya.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  function handleChange(event) {
    const { name, value } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!settings.schoolName.trim()) {
      setError("School name zaroori hai.");
      return;
    }

    if (!/^[A-Za-z0-9-]+$/.test(settings.certificatePrefix.trim())) {
      setError("Certificate prefix mein letters, numbers ya hyphen use karein.");
      return;
    }

    const nextNumber = Number(settings.nextCertificateNumber);

    if (!Number.isInteger(nextNumber) || nextNumber < 1) {
      setError("Next certificate number 1 ya usse zyada hona chahiye.");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(`${API_ROOT}/certificate-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...settings,
          schoolName: settings.schoolName.trim(),
          certificatePrefix: settings.certificatePrefix.trim(),
          nextCertificateNumber: nextNumber,
        }),
      });

      const result = await response.json();

      if (!response.ok || result._status === false) {
        throw new Error(
          result._message || "Settings save nahi ho saki."
        );
      }

      const data = result._data?.settings ?? result._data;

      if (data && !Array.isArray(data)) {
        setSettings((previous) => ({ ...previous, ...data }));
      }

      setSuccess(
        result._message || "Certificate settings successfully save ho gayi."
      );
    } catch (err) {
      setError(err.message || "Settings save karne mein error aaya.");
    } finally {
      setSaving(false);
    }
  }

  const prefix = settings.certificatePrefix.trim() || "CERT";
  const number = Number(settings.nextCertificateNumber) || 1;
  const preview = `${prefix}-${String(number).padStart(5, "0")}`;

  if (loading) {
    return (
      <main className="flex min-h-80 items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <HiOutlineArrowPath className="h-5 w-5 animate-spin" />
          Certificate settings load ho rahi hain...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">
              <HiOutlineDocumentCheck className="h-5 w-5" />
              Certificate Management
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Certificate Settings
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              School details, principal information aur certificate numbering
              manage karein.
            </p>
          </div>

          <button
            type="button"
            onClick={loadSettings}
            disabled={loading || saving}
            className="flex items-center justify-center gap-2 border border-slate-300 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50"
          >
            <HiOutlineArrowPath className="h-4 w-4" />
            Refresh
          </button>
        </header>

        {error && (
          <div className="mb-5 flex gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <HiOutlineExclamationCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 flex gap-3 border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <HiOutlineCheckCircle className="h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section
            title="School Information"
            description="Certificate par print hone wali school details."
            icon={HiOutlineBuildingOffice2}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="School Name *"
                name="schoolName"
                icon={HiOutlineAcademicCap}
                value={settings.schoolName}
                onChange={handleChange}
                placeholder="ADARSHA MARKAZ ACADEMY"
                required
              />

              <InputField
                label="School Phone"
                name="schoolPhone"
                icon={HiOutlinePhone}
                value={settings.schoolPhone}
                onChange={handleChange}
                placeholder="School contact number"
              />

              <InputField
                label="School Email"
                name="schoolEmail"
                icon={HiOutlineEnvelope}
                value={settings.schoolEmail}
                onChange={handleChange}
                type="email"
                placeholder="school@example.com"
              />

              <InputField
                label="School Logo URL"
                name="schoolLogo"
                icon={HiOutlinePhoto}
                value={settings.schoolLogo}
                onChange={handleChange}
                type="url"
                placeholder="https://example.com/logo.png"
              />

              <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                School Address
                <textarea
                  name="schoolAddress"
                  value={settings.schoolAddress}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass}
                  placeholder="School ka complete address"
                />
              </label>
            </div>

            {settings.schoolLogo && (
              <div className="mt-5 border border-dashed border-slate-300 p-4">
                <p className="mb-3 text-xs font-bold uppercase text-slate-500">
                  Logo Preview
                </p>
                <img
                  src={settings.schoolLogo}
                  alt="School logo"
                  className="h-20 max-w-48 object-contain"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </Section>

          <Section
            title="Principal Details"
            description="Principal ka naam aur signature."
            icon={HiOutlineUser}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Principal Name"
                name="principalName"
                icon={HiOutlineUser}
                value={settings.principalName}
                onChange={handleChange}
                placeholder="Principal ka naam"
              />

              <InputField
                label="Principal Signature URL"
                name="principalSignature"
                icon={HiOutlinePhoto}
                value={settings.principalSignature}
                onChange={handleChange}
                type="url"
                placeholder="https://example.com/signature.png"
              />
            </div>

            {settings.principalSignature && (
              <div className="mt-5 border border-dashed border-slate-300 p-4">
                <p className="mb-3 text-xs font-bold uppercase text-slate-500">
                  Signature Preview
                </p>
                <img
                  src={settings.principalSignature}
                  alt="Principal signature"
                  className="h-16 max-w-56 object-contain"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </Section>

          <Section
            title="Certificate Numbering"
            description="Har issued certificate ke liye number format."
            icon={HiOutlineHashtag}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Certificate Prefix *"
                name="certificatePrefix"
                icon={HiOutlineHashtag}
                value={settings.certificatePrefix}
                onChange={handleChange}
                placeholder="CERT"
                required
              />

              <InputField
                label="Next Certificate Number *"
                name="nextCertificateNumber"
                value={settings.nextCertificateNumber}
                onChange={handleChange}
                type="number"
                min="1"
                step="1"
                required
              />
            </div>

            <div className="mt-5 border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Number Preview
              </p>
              <p className="mt-2 break-all text-2xl font-extrabold tracking-wide text-emerald-950">
                {preview}
              </p>
              <p className="mt-2 text-xs text-slate-600">
                Example: CERT-00001, CERT-00002, CERT-00003
              </p>
            </div>
          </Section>

          <div className="flex justify-end border border-slate-200 bg-white p-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-emerald-800 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <HiOutlineArrowPath className="h-5 w-5 animate-spin" />
              ) : (
                <HiOutlineCheckCircle className="h-5 w-5" />
              )}
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
