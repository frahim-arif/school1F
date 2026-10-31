
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StudentFormStepper from "../../../components/students/StudentFormStepper";
import {
  Upload,
  Save,
  ArrowLeft,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

const API_ROOT = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/+$/, "").replace(/\/api$/, "");

const initialForm = {
  admissionNo: "",
  admissionDate: new Date().toISOString().slice(0, 10),
  rollNo: "",
  fullName: "",
  dob: "",
  gender: "Male",
  bloodGroup: "",
  phone: "",
  email: "",
  fatherName: "",
  motherName: "",
  className: "",
  section: "",
  session: "",
  address: "",
};

export default function CreateStudentPage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Photo size must be 5 MB or less.");
      return;
    }

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const nameParts = form.fullName.trim().split(/\s+/);
    const firstName = nameParts.shift() || "";
    const lastName = nameParts.join(" ");

    if (
      !form.admissionNo.trim() ||
      !form.rollNo ||
      !firstName ||
      !form.dob ||
      !form.gender ||
      !form.phone.trim() ||
      !form.fatherName.trim() ||
      !form.className.trim() ||
      !form.section.trim() ||
      !form.session.trim()
    ) {
      setError(
        "Please fill Admission No, Roll Number, Full Name, Date of Birth, Gender, Mobile Number, Father Name, Class, Section and Session."
      );
      return;
    }

    if (!Number.isFinite(Number(form.rollNo)) || Number(form.rollNo) < 0) {
      setError("Roll Number must be a valid number.");
      return;
    }

    try {
      setSaving(true);

      // Current backend Student model accepts JSON.
      // Photo preview works locally; actual photo upload needs backend support.
      const payload = {
        admissionNo: form.admissionNo.trim(),
        rollNo: Number(form.rollNo),
        firstName,
        lastName,
        gender: form.gender,
        dob: form.dob,
        fatherName: form.fatherName.trim(),
        motherName: form.motherName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        className: form.className.trim(),
        section: form.section.trim(),
        session: form.session.trim(),
        bloodGroup: form.bloodGroup,
        photo: "",
        status: "Active",
      };

      const response = await fetch(`${API_ROOT}/api/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
            data.error ||
            `Unable to save student (HTTP ${response.status}).`
        );
      }

      setSuccess("Student saved successfully!");
      router.push("/admin/students");
      router.refresh();
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the backend. Check that your backend server is running."
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white p-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

  const labelClass = "mb-2 block font-semibold text-slate-700";

  return (
    <div className="space-y-8">
      <StudentFormStepper currentStep={1} />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            New Student Admission
          </h1>
          <p className="mt-2 text-slate-500">
            Register a new student into school
          </p>
        </div>

        <Link
          href="/admin/students"
          className="flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 hover:bg-slate-100"
        >
          <ArrowLeft size={18} />
          Back
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <h2 className="mb-8 text-2xl font-bold text-slate-800">
          Personal Information
        </h2>

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
            {success}
          </div>
        )}

        <div className="mb-10 flex flex-col items-center">
          <label className="cursor-pointer">
            <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-dashed border-emerald-400 bg-slate-50">
              {preview ? (
                <img
                  src={preview}
                  alt="Student photo preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Upload size={40} className="text-slate-400" />
              )}
            </div>

            <input
              hidden
              type="file"
              accept="image/*"
              onChange={handleImage}
            />
          </label>

          <p className="mt-3 text-sm text-slate-500">
            Upload Student Photo (optional)
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Maximum 5 MB
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <label className={labelClass}>Admission No *</label>
            <input
              name="admissionNo"
              value={form.admissionNo}
              onChange={handleChange}
              placeholder="e.g. SCH2026001"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Admission Date</label>
            <input
              name="admissionDate"
              type="date"
              value={form.admissionDate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Roll Number *</label>
            <input
              name="rollNo"
              type="number"
              min="0"
              value={form.rollNo}
              onChange={handleChange}
              placeholder="Enter roll number"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Full Name *</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Enter student name"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Date of Birth *</label>
            <input
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Gender *</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Blood Group</label>
            <select
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select blood group</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                (group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className={labelClass}>Mobile Number *</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter mobile number"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="student@example.com"
              className={inputClass}
            />
          </div>
        </div>

        <div className="my-10 border-t border-slate-200" />

        <h2 className="mb-6 text-2xl font-bold text-slate-800">
          Parents Information
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className={labelClass}>Father Name *</label>
            <input
              name="fatherName"
              value={form.fatherName}
              onChange={handleChange}
              placeholder="Enter father name"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Mother Name</label>
            <input
              name="motherName"
              value={form.motherName}
              onChange={handleChange}
              placeholder="Enter mother name"
              className={inputClass}
            />
          </div>
        </div>

        <div className="my-10 border-t border-slate-200" />

        <h2 className="mb-6 text-2xl font-bold text-slate-800">
          Academic Information
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <label className={labelClass}>Class *</label>
            <input
              name="className"
              value={form.className}
              onChange={handleChange}
              placeholder="e.g. Class 10"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Section *</label>
            <input
              name="section"
              value={form.section}
              onChange={handleChange}
              placeholder="e.g. A"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Session *</label>
            <input
              name="session"
              value={form.session}
              onChange={handleChange}
              placeholder="e.g. 2026-2027"
              className={inputClass}
              required
            />
          </div>
        </div>

        <div className="my-10 border-t border-slate-200" />

        <h2 className="mb-6 text-2xl font-bold text-slate-800">
          Address Information
        </h2>

        <div>
          <label className={labelClass}>Full Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            placeholder="Enter complete address"
            className={inputClass}
          />
        </div>

        <div className="mt-10 flex flex-wrap justify-end gap-4">
          <Link
            href="/admin/students"
            className="rounded-xl border border-slate-300 px-6 py-3 text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Saving..." : "Save Student"}
          </button>
        </div>
      </form>
    </div>
  );
}
