
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserRound,
  Phone,
  Mail,
  GraduationCap,
  CalendarDays,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const initialForm = {
  studentName: "",
  guardianName: "",
  phone: "",
  email: "",
  classApplying: "",
  source: "Walk-in",
  status: "New",
  followUpDate: "",
  assignedTo: "",
  notes: "",
};

const inputClass =
  "mt-1.5 w-full border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100";

const labelClass = "text-sm font-semibold text-slate-700";

export default function CreateAdmissionEnquiryPage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!/^[0-9]{10}$/.test(form.phone)) {
      setError("Phone number exactly 10 digits ka hona chahiye.");
      return;
    }

    if (!form.studentName.trim() || !form.guardianName.trim()) {
      setError("Student aur guardian ka naam bharna zaroori hai.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        studentName: form.studentName.trim(),
        guardianName: form.guardianName.trim(),
        phone: form.phone,
        email: form.email.trim(),
        classApplying: form.classApplying.trim(),
        assignedTo: form.assignedTo.trim(),
        notes: form.notes.trim(),
        followUpDate: form.followUpDate
          ? new Date(`${form.followUpDate}T12:00:00`).toISOString()
          : null,
      };

      const response = await fetch(
        `${API_BASE}/api/front-office/enquiries`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok || result._status === false) {
        throw new Error(
          result._message || "Admission enquiry save nahi ho saki."
        );
      }

      setSuccess("Admission enquiry successfully save ho gayi.");

      const savedId = result._data?._id;

      setTimeout(() => {
        if (savedId) {
          router.push("/admin/front-office/admission-enquiry");
        } else {
          router.push("/admin/front-office/admission-enquiry");
        }

        router.refresh();
      }, 700);
    } catch (err) {
      setError(
        err.message ||
          "Server se connection nahi ho saka. Backend check karein."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setError("");
    setSuccess("");
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href="/admin/front-office/admission-enquiry"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-cyan-700"
        >
          <ArrowLeft size={17} />
          Back to Admission Enquiries
        </Link>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-700">
            Front Office / Admission Enquiry
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            Add Admission Enquiry
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Naye student ki admission enquiry register karein.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Enquiry save nahi hui</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 size={19} />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="border border-slate-200 bg-white">
            <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
              <div className="bg-cyan-50 p-2.5 text-cyan-700">
                <UserRound size={20} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">
                  Student & Guardian Details
                </h2>
                <p className="text-xs text-slate-500">
                  Student aur parent ki basic information
                </p>
              </div>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Student Name <span className="text-rose-600">*</span>
                </label>
                <input
                  name="studentName"
                  value={form.studentName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter student name"
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  Guardian / Parent Name{" "}
                  <span className="text-rose-600">*</span>
                </label>
                <input
                  name="guardianName"
                  value={form.guardianName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter parent or guardian name"
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  <Phone size={14} className="mr-1 inline" />
                  Phone Number <span className="text-rose-600">*</span>
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={(event) => {
                    const value = event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);

                    setForm((previous) => ({
                      ...previous,
                      phone: value,
                    }));
                  }}
                  className={inputClass}
                  placeholder="10-digit mobile number"
                  inputMode="numeric"
                  maxLength={10}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  <Mail size={14} className="mr-1 inline" />
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="parent@example.com"
                  maxLength={150}
                />
              </div>
            </div>
          </section>

          <section className="border border-slate-200 bg-white">
            <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
              <div className="bg-blue-50 p-2.5 text-blue-700">
                <GraduationCap size={20} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">
                  Admission Details
                </h2>
                <p className="text-xs text-slate-500">
                  Class, enquiry source aur current status
                </p>
              </div>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Applying for Class <span className="text-rose-600">*</span>
                </label>
                <select
                  name="classApplying"
                  value={form.classApplying}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">Select class</option>
                  {[
                    "Nursery",
                    "LKG",
                    "UKG",
                    "Class 1",
                    "Class 2",
                    "Class 3",
                    "Class 4",
                    "Class 5",
                    "Class 6",
                    "Class 7",
                    "Class 8",
                    "Class 9",
                    "Class 10",
                    "Class 11",
                    "Class 12",
                  ].map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Enquiry Source</label>
                <select
                  name="source"
                  value={form.source}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {["Walk-in", "Phone", "Website", "Referral", "Other"].map(
                    (source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className={labelClass}>Enquiry Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {[
                    "New",
                    "Contacted",
                    "Follow-up",
                    "Admitted",
                    "Rejected",
                  ].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  <CalendarDays size={14} className="mr-1 inline" />
                  Follow-up Date
                </label>
                <input
                  type="date"
                  name="followUpDate"
                  value={form.followUpDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Assigned Staff</label>
                <input
                  name="assignedTo"
                  value={form.assignedTo}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Staff member name (optional)"
                  maxLength={100}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Notes / Remarks</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Additional information about this enquiry..."
                  rows={4}
                  maxLength={2000}
                />
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              <RotateCcw size={17} />
              Reset Form
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 bg-cyan-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />
              {saving ? "Saving..." : "Save Admission Enquiry"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
