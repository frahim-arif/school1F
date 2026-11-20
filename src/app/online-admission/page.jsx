
"use client";

import { useEffect, useState } from "react";
import {
  GraduationCap,
  User,
  Users,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  FileText,
} from "lucide-react";

const API_BASE = (() => {
  const base = (
    process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
  ).replace(/\/+$/, "");

  return base.endsWith("/api") ? base : `${base}/api`;
})();

const initialForm = {
  student: {
    fullName: "",
    dateOfBirth: "",
    gender: "",
    nationality: "Indian",
  },
  admission: {
    className: "",
    academicSession: "",
  },
  parents: {
    fatherName: "",
    motherName: "",
    mobile: "",
    email: "",
    guardianName: "",
  },
  address: {
    fullAddress: "",
    city: "",
    state: "",
    pinCode: "",
  },
};

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

function FormField({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function Section({ title, description, icon: Icon, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-7">
        <div className="rounded-lg bg-blue-50 p-2.5 text-blue-700">
          <Icon size={21} />
        </div>
        <div>
          <h2 className="font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
        {children}
      </div>
    </section>
  );
}

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (
    !response.ok ||
    data.success === false ||
    data._status === false
  ) {
    throw new Error(
      data.message ||
        data._message ||
        "Request complete nahi ho saki. Please try again."
    );
  }

  return data._data ?? data.data ?? data;
}

function splitFullName(fullName) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] || "",
    middleName: parts.length > 2 ? parts.slice(1, -1).join(" ") : "",
    lastName: parts.length > 1 ? parts[parts.length - 1] : "",
  };
}

export default function OnlineAdmissionPage() {
  const [form, setForm] = useState(initialForm);
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const response = await fetch(
          `${API_BASE}/online-admission/public/settings`,
          { cache: "no-store" }
        );

        const data = await readResponse(response);

        // Backend response:
        // { success: true, admissionOpen: true, settings: {...} }
        const value =
          data.settings ??
          data._data?.settings ??
          data.data?.settings ??
          null;

        if (!active) return;

        if (data.admissionOpen !== true || !value) {
          setSettings({
            admissionOpen: false,
            academicSession: value?.academicSession || "",
            allowedClasses: value?.allowedClasses || [],
            instructions: value?.instructions || "",
            startDate: value?.startDate || null,
            endDate: value?.endDate || null,
          });
          return;
        }

        setSettings({
          ...value,
          admissionOpen: true,
          allowedClasses: Array.isArray(value.allowedClasses)
            ? value.allowedClasses
            : [],
        });

        setForm((current) => ({
          ...current,
          admission: {
            ...current.admission,
            academicSession:
              value.academicSession ||
              current.admission.academicSession,
          },
        }));
      } catch (err) {
        if (!active) return;

        setSettingsError(
          err.message || "Admission details load nahi ho sakin."
        );

        setSettings({
          admissionOpen: false,
          allowedClasses: [],
          academicSession: "",
          instructions: "",
        });
      } finally {
        if (active) setSettingsLoading(false);
      }
    }

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  function updateField(section, field, value) {
    setForm((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setResult(null);

    const fullName = form.student.fullName.trim();
    const nameParts = splitFullName(fullName);

    if (!nameParts.firstName) {
      setError("Please enter the student's full name.");
      return;
    }

    if (!form.student.dateOfBirth || !form.student.gender) {
      setError("Please complete all required student details.");
      return;
    }

    if (!form.admission.className) {
      setError("Please select the class for admission.");
      return;
    }

    if (!form.parents.fatherName.trim()) {
      setError("Please enter the father's name.");
      return;
    }

    if (!form.parents.motherName.trim()) {
      setError("Please enter the mother's name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.parents.mobile)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (
      !form.address.fullAddress.trim() ||
      !form.address.city.trim() ||
      !form.address.state.trim() ||
      !/^\d{6}$/.test(form.address.pinCode)
    ) {
      setError("Please enter a valid address and 6-digit PIN code.");
      return;
    }

    if (
      !settings?.admissionOpen ||
      !settings.allowedClasses?.includes(form.admission.className)
    ) {
      setError(
        "Admission is closed or the selected class is unavailable. Please refresh the page."
      );
      return;
    }

    const payload = {
      student: {
        ...nameParts,
        dateOfBirth: form.student.dateOfBirth,
        gender: form.student.gender,
        nationality: form.student.nationality || "Indian",
      },
      admission: {
        classApplyingFor: form.admission.className,
        academicSession: form.admission.academicSession,
      },
      parents: {
        fatherName: form.parents.fatherName.trim(),
        motherName: form.parents.motherName.trim(),
        phone: form.parents.mobile.trim(),
        email: form.parents.email.trim(),
        guardianName: form.parents.guardianName.trim(),
      },
      address: {
        addressLine: form.address.fullAddress.trim(),
        city: form.address.city.trim(),
        state: form.address.state.trim(),
        postalCode: form.address.pinCode.trim(),
      },
    };

    setSubmitting(true);

    try {
      const response = await fetch(
        `${API_BASE}/online-admission/public/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await readResponse(response);
      const application = data.application ?? data;

      if (!application.applicationNumber) {
        throw new Error(
          "Application response mein application number nahi mila. Backend response check karein."
        );
      }

      setResult(application);

      setForm({
        ...initialForm,
        admission: {
          ...initialForm.admission,
          academicSession: settings?.academicSession || "",
        },
      });
    } catch (err) {
      setError(
        err.message || "Application submit nahi ho saki. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const allowedClasses = settings?.allowedClasses || [];

  const now = new Date();

  const startDate = settings?.startDate
    ? new Date(settings.startDate)
    : null;

  const endDate = settings?.endDate
    ? new Date(settings.endDate)
    : null;

  // End date ko poore din ke liye valid rakhein.
  if (endDate && !Number.isNaN(endDate.getTime())) {
    endDate.setHours(23, 59, 59, 999);
  }

  const datesValid =
    (!startDate ||
      (!Number.isNaN(startDate.getTime()) && startDate <= now)) &&
    (!endDate ||
      (!Number.isNaN(endDate.getTime()) && endDate >= now));

  const isOpen = settings?.admissionOpen === true && datesValid;
  
console.log("Admission debug:", {
  settings,
  datesValid,
  isOpen,
});
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-white/10 p-3">
              <GraduationCap size={34} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">
                School Admission Portal
              </p>

              <h1 className="mt-2 text-2xl font-bold sm:text-4xl">
                Online Admission Form
              </h1>

              <p className="mt-2 text-sm text-slate-300">
                Apply for admission by completing the form below.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {settingsLoading ? (
          <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-10 text-slate-600">
            <LoaderCircle className="animate-spin" size={22} />
            Loading admission details...
          </div>
        ) : result ? (
          <div className="rounded-xl border border-emerald-200 bg-white p-7 text-center shadow-sm sm:p-12">
            <CheckCircle2
              className="mx-auto mb-4 text-emerald-600"
              size={58}
            />

            <h2 className="text-2xl font-bold text-slate-900">
              Application Submitted!
            </h2>

            <p className="mt-3 text-slate-600">
              Your admission application has been received.
            </p>

            <div className="mx-auto mt-6 max-w-md rounded-lg bg-emerald-50 p-5">
              <p className="text-sm text-emerald-700">
                Your Application Number
              </p>

              <p className="mt-2 break-all text-xl font-bold text-emerald-900">
                {result.applicationNumber}
              </p>

              <p className="mt-2 text-xs text-emerald-700">
                Please save this number for future reference.
              </p>

              {result.status && (
                <p className="mt-2 text-sm font-semibold text-emerald-800">
                  Status: {result.status}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setResult(null);
                setError("");
              }}
              className="mt-7 rounded-md bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Submit Another Application
            </button>
          </div>
        ) : settingsError ? (
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <AlertCircle
              className="mx-auto mb-4 text-red-600"
              size={42}
            />

            <h2 className="text-xl font-bold text-slate-900">
              Unable to Load Admission Details
            </h2>

            <p className="mt-3 text-sm leading-6 text-red-700">
              {settingsError}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-md bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Try Again
            </button>
          </div>
        ) : !isOpen ? (
          <div className="rounded-xl border border-amber-200 bg-white p-8 text-center shadow-sm">
            <FileText
              className="mx-auto mb-4 text-amber-600"
              size={42}
            />

            <h2 className="text-xl font-bold text-slate-900">
              Online Admissions Are Currently Closed
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
              Online admission is not currently available. Please contact
              the school administration for further information.
            </p>

            {settings?.instructions && (
              <p className="mt-4 text-sm text-slate-700">
                {settings.instructions}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
              <p className="font-bold">Before you begin</p>

              <p className="mt-1">
                Fields marked with * are required. Please provide correct
                student and parent information.
              </p>

              {settings?.instructions && (
                <p className="mt-2">{settings.instructions}</p>
              )}

              <p className="mt-2 font-semibold">
                Academic Session:{" "}
                {settings?.academicSession || "Not specified"}
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 shrink-0" size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Section
                title="Student Information"
                description="Enter the student's personal details."
                icon={User}
              >
                <FormField label="Full Name" required>
                  <input
                    required
                    autoComplete="name"
                    value={form.student.fullName}
                    onChange={(e) =>
                      updateField("student", "fullName", e.target.value)
                    }
                    placeholder="Student's full name"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Date of Birth" required>
                  <input
                    required
                    type="date"
                    max={new Date().toISOString().slice(0, 10)}
                    value={form.student.dateOfBirth}
                    onChange={(e) =>
                      updateField("student", "dateOfBirth", e.target.value)
                    }
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Gender" required>
                  <select
                    required
                    value={form.student.gender}
                    onChange={(e) =>
                      updateField("student", "gender", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </FormField>

                <FormField label="Nationality" required>
                  <input
                    required
                    value={form.student.nationality}
                    onChange={(e) =>
                      updateField("student", "nationality", e.target.value)
                    }
                    className={inputClass}
                  />
                </FormField>
              </Section>

              <Section
                title="Admission Details"
                description="Select the class for which admission is requested."
                icon={GraduationCap}
              >
                <FormField label="Academic Session">
                  <input
                    readOnly
                    value={form.admission.academicSession}
                    className={`${inputClass} bg-slate-50`}
                  />
                </FormField>

                <FormField label="Applying for Class" required>
                  <select
                    required
                    value={form.admission.className}
                    onChange={(e) =>
                      updateField("admission", "className", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select class</option>

                    {allowedClasses.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </FormField>
              </Section>

              <Section
                title="Parent / Guardian Details"
                description="Provide a contact person for admission communication."
                icon={Users}
              >
                <FormField label="Father's Name" required>
                  <input
                    required
                    value={form.parents.fatherName}
                    onChange={(e) =>
                      updateField("parents", "fatherName", e.target.value)
                    }
                    placeholder="Father's full name"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Mother's Name" required>
                  <input
                    required
                    value={form.parents.motherName}
                    onChange={(e) =>
                      updateField("parents", "motherName", e.target.value)
                    }
                    placeholder="Mother's full name"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Mobile Number" required>
                  <input
                    required
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={10}
                    pattern="[6-9][0-9]{9}"
                    value={form.parents.mobile}
                    onChange={(e) =>
                      updateField(
                        "parents",
                        "mobile",
                        e.target.value.replace(/\D/g, "").slice(0, 10)
                      )
                    }
                    placeholder="10-digit mobile number"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Email Address">
                  <input
                    type="email"
                    autoComplete="email"
                    value={form.parents.email}
                    onChange={(e) =>
                      updateField("parents", "email", e.target.value)
                    }
                    placeholder="parent@example.com"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Guardian Name (if applicable)">
                  <input
                    value={form.parents.guardianName}
                    onChange={(e) =>
                      updateField("parents", "guardianName", e.target.value)
                    }
                    placeholder="Guardian's name"
                    className={inputClass}
                  />
                </FormField>
              </Section>

              <Section
                title="Residential Address"
                description="Enter the student's current address."
                icon={MapPin}
              >
                <div className="sm:col-span-2">
                  <FormField label="Full Address" required>
                    <textarea
                      required
                      rows={3}
                      value={form.address.fullAddress}
                      onChange={(e) =>
                        updateField("address", "fullAddress", e.target.value)
                      }
                      placeholder="House number, street, locality..."
                      className={inputClass}
                    />
                  </FormField>
                </div>

                <FormField label="City / Town" required>
                  <input
                    required
                    value={form.address.city}
                    onChange={(e) =>
                      updateField("address", "city", e.target.value)
                    }
                    className={inputClass}
                  />
                </FormField>

                <FormField label="State" required>
                  <input
                    required
                    value={form.address.state}
                    onChange={(e) =>
                      updateField("address", "state", e.target.value)
                    }
                    className={inputClass}
                  />
                </FormField>

                <FormField label="PIN Code" required>
                  <input
                    required
                    inputMode="numeric"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    value={form.address.pinCode}
                    onChange={(e) =>
                      updateField(
                        "address",
                        "pinCode",
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    className={inputClass}
                  />
                </FormField>
              </Section>

              <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
                <p className="max-w-xl text-xs leading-5 text-slate-500">
                  Please check all information before submitting. Your
                  application will be sent to the school administration
                  for review.
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-md bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {submitting ? (
                    <LoaderCircle className="animate-spin" size={18} />
                  ) : (
                    <Send size={17} />
                  )}

                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        Online Admission Portal
      </footer>
    </main>
  );
}
