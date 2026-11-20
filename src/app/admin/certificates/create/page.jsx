
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HiOutlineArrowLeft,
  HiOutlineDocumentPlus,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
} from "react-icons/hi2";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com/api";

const initialForm = {
  recipientType: "student",
  certificateType: "bonafide",
  recipientName: "",
  student: "",
  staff: "",
  admissionNumber: "",
  className: "",
  session: "",
  issueDate: new Date().toISOString().slice(0, 10),
  purpose: "",
  remarks: "",
};

const certificateTypes = [
  { value: "bonafide", label: "Bonafide Certificate" },
  { value: "transfer", label: "Transfer Certificate" },
  { value: "character", label: "Character Certificate" },
  { value: "study", label: "Study Certificate" },
  { value: "birth", label: "Birth Certificate" },
  { value: "achievement", label: "Achievement Certificate" },
  { value: "other", label: "Other Certificate" },
];

const inputClass =
  "w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600";

const labelClass =
  "mb-1.5 block text-sm font-semibold text-slate-700";

export default function CreateCertificatePage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const updateField = (name, value) => {
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
    setSuccess(null);
  };

  const handleRecipientChange = (recipientType) => {
    setForm((previous) => ({
      ...previous,
      recipientType,
      student: "",
      staff: "",
    }));
    setError("");
    setSuccess(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(null);

    if (!form.recipientName.trim()) {
      setError("Recipient name is required.");
      return;
    }

    if (
      form.recipientType === "student" &&
      form.student.trim() &&
      !/^[a-f\d]{24}$/i.test(form.student.trim())
    ) {
      setError("Student ID must be a valid MongoDB ObjectId.");
      return;
    }

    if (
      form.recipientType === "staff" &&
      form.staff.trim() &&
      !/^[a-f\d]{24}$/i.test(form.staff.trim())
    ) {
      setError("Staff ID must be a valid MongoDB ObjectId.");
      return;
    }

    setLoading(true);

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("adminToken")
          : null;

      const payload = {
        recipientType: form.recipientType,
        certificateType: form.certificateType,
        recipientName: form.recipientName.trim(),
        admissionNumber: form.admissionNumber.trim(),
        className: form.className.trim(),
        session: form.session.trim(),
        issueDate: form.issueDate,
        purpose: form.purpose.trim(),
        remarks: form.remarks.trim(),
      };

      if (form.recipientType === "student" && form.student.trim()) {
        payload.student = form.student.trim();
      }

      if (form.recipientType === "staff" && form.staff.trim()) {
        payload.staff = form.staff.trim();
      }

      const response = await fetch(`${API_BASE}/certificates/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || result._status === false) {
        throw new Error(
          result._message || "Certificate could not be created."
        );
      }

      setSuccess(result._data || {});
      setForm({
        ...initialForm,
        issueDate: new Date().toISOString().slice(0, 10),
      });
    } catch (err) {
      setError(
        err.message ||
          "Backend se connection nahi ho paaya. API URL check karein."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 text-slate-800 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/admin/certificates"
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
          >
            <HiOutlineArrowLeft className="h-4 w-4" />
            Certificates Dashboard
          </Link>

          <p className="text-sm font-medium text-emerald-700">
            SCHOOL ERP / CERTIFICATES
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            Create Certificate
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Enter recipient details and issue a new certificate.
          </p>
        </div>

        <Link
          href="/admin/certificates/issued"
          className="inline-flex items-center justify-center border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100"
        >
          View Issued Certificates
        </Link>
      </div>

      {error && (
        <div className="flex items-start gap-3 border border-red-200 bg-red-50 p-4 text-red-800">
          <HiOutlineExclamationCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Certificate not created</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <HiOutlineCheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700" />
            <div className="min-w-0">
              <p className="font-bold text-emerald-900">
                Certificate issued successfully
              </p>
              <p className="mt-1 text-sm text-emerald-800">
                Certificate number:{" "}
                <strong>{success.certificateNumber || "Created"}</strong>
              </p>
              <Link
                href="/admin/certificates/issued"
                className="mt-3 inline-block text-sm font-semibold text-emerald-800 underline"
              >
                View issued certificates
              </Link>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-bold text-slate-900">
              Recipient Information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select whether this certificate is for a student or staff member.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>Recipient Type *</label>
              <select
                value={form.recipientType}
                onChange={(e) => handleRecipientChange(e.target.value)}
                className={inputClass}
              >
                <option value="student">Student</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Recipient Full Name *</label>
              <input
                required
                value={form.recipientName}
                onChange={(e) =>
                  updateField("recipientName", e.target.value)
                }
                placeholder="Enter full name"
                className={inputClass}
                maxLength={150}
              />
            </div>

            {form.recipientType === "student" ? (
              <>
                <div>
                  <label className={labelClass}>
                    Student MongoDB ID (optional)
                  </label>
                  <input
                    value={form.student}
                    onChange={(e) => updateField("student", e.target.value)}
                    placeholder="24-character student ID"
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Student selection API connect hone ke baad dropdown add
                    kar sakte hain.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Admission Number</label>
                  <input
                    value={form.admissionNumber}
                    onChange={(e) =>
                      updateField("admissionNumber", e.target.value)
                    }
                    placeholder="e.g. ADM-2026-001"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Class / Grade</label>
                  <input
                    value={form.className}
                    onChange={(e) =>
                      updateField("className", e.target.value)
                    }
                    placeholder="e.g. Class 8 - A"
                    className={inputClass}
                  />
                </div>
              </>
            ) : (
              <div>
                <label className={labelClass}>
                  Staff MongoDB ID (optional)
                </label>
                <input
                  value={form.staff}
                  onChange={(e) => updateField("staff", e.target.value)}
                  placeholder="24-character staff ID"
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Staff selection API available hone par dropdown connect
                  karenge.
                </p>
              </div>
            )}

            <div>
              <label className={labelClass}>Academic Session</label>
              <input
                value={form.session}
                onChange={(e) => updateField("session", e.target.value)}
                placeholder="e.g. 2026-2027"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        <section className="border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-bold text-slate-900">
              Certificate Details
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose the certificate type and provide its purpose.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>Certificate Type *</label>
              <select
                required
                value={form.certificateType}
                onChange={(e) =>
                  updateField("certificateType", e.target.value)
                }
                className={inputClass}
              >
                {certificateTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Issue Date *</label>
              <input
                type="date"
                required
                value={form.issueDate}
                onChange={(e) => updateField("issueDate", e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Purpose</label>
              <input
                value={form.purpose}
                onChange={(e) => updateField("purpose", e.target.value)}
                placeholder="Reason for issuing the certificate"
                className={inputClass}
                maxLength={500}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Remarks</label>
              <textarea
                rows={4}
                value={form.remarks}
                onChange={(e) => updateField("remarks", e.target.value)}
                placeholder="Additional notes (optional)"
                className={inputClass}
                maxLength={2000}
              />
            </div>
          </div>
        </section>

        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <Link
            href="/admin/certificates"
            className="border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold hover:bg-slate-100"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <HiOutlineDocumentPlus className="h-5 w-5" />
            {loading ? "Issuing Certificate..." : "Issue Certificate"}
          </button>
        </div>
      </form>
    </div>
  );
}
