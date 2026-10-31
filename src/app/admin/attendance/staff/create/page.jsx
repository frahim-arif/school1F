
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  User,
  BriefcaseBusiness,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  IndianRupee,
  Building2,
  Save,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const initialForm = {
  staffId: "",
  firstName: "",
  lastName: "",
  designation: "",
  department: "General",
  phone: "",
  email: "",
  address: "",
  joiningDate: new Date().toLocaleDateString("en-CA"),
  salary: "0",
  status: "Active",
};

export default function CreateStaffPage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }


async function handleSubmit(event) {
  event.preventDefault();
  setError("");
  setSuccess("");

  if (!form.firstName.trim()) {
    setError("Staff ka first name enter karein.");
    return;
  }

  if (!form.designation.trim()) {
    setError("Staff ki designation enter karein.");
    return;
  }

  if (Number(form.salary) < 0) {
    setError("Salary zero ya usse zyada honi chahiye.");
    return;
  }

  setSaving(true);

  try {
    const token = localStorage.getItem("token");

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      designation: form.designation.trim(),
      department: form.department.trim() || "General",
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      joiningDate: form.joiningDate || undefined,
      salary: Number(form.salary || 0),
      status: form.status,
    };

    if (form.staffId.trim()) {
      payload.staffId = form.staffId.trim();
    }

    const response = await fetch(`${API_BASE}/api/staff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const rawResponse = await response.text();
    let data = {};

    try {
      data = rawResponse ? JSON.parse(rawResponse) : {};
    } catch {
      throw new Error(
        `Backend ne JSON response nahi diya. HTTP ${response.status}: ${rawResponse.slice(0, 200)}`
      );
    }

    if (!response.ok || data.success === false) {
      throw new Error(
        data.message || `Staff save failed. HTTP ${response.status}`
      );
    }

    setSuccess("Staff successfully add ho gaya!");
    setForm({
      ...initialForm,
      joiningDate: new Date().toLocaleDateString("en-CA"),
    });
  } catch (err) {
    console.error("Save staff error:", err);
    setError(
      `${err.message || "Staff save nahi ho saka."} API: ${API_BASE}/api/staff`
    );
  } finally {
    setSaving(false);
  }
}


  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

  const labelClass = "text-sm font-semibold text-slate-700";

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/admin/attendance/staff"
            aria-label="Back to staff attendance"
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft size={20} />
          </Link>

          <div>
            <h1 className="text-2xl font-black text-slate-800 sm:text-3xl">
              Add Staff Member
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              School ke staff ki details enter karke save karein.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <UserPlus size={19} />
          New Staff
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span className="font-bold">!</span>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
            <CheckCircle2 size={20} />
            {success}
          </div>

          <button
            type="button"
            onClick={() => router.push("/admin/attendance/staff")}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
          >
            View Staff Attendance
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <User size={22} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">
                Personal Information
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Staff member ka naam aur contact details
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
            <div>
              <label className={labelClass} htmlFor="firstName">
                First Name *
              </label>
              <input
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                className={inputClass}
                required
                autoComplete="given-name"
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className={inputClass}
                autoComplete="family-name"
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="phone">
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  size={17}
                  className="absolute left-3 top-[22px] text-slate-400"
                />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className={`${inputClass} pl-10`}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3 top-[22px] text-slate-400"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="staff@example.com"
                  className={`${inputClass} pl-10`}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="address">
                Address
              </label>
              <div className="relative">
                <MapPin
                  size={17}
                  className="absolute left-3 top-[22px] text-slate-400"
                />
                <textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter full address"
                  rows={3}
                  className={`${inputClass} resize-y pl-10`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Employment Details */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <BriefcaseBusiness size={22} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">
                Employment Details
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Staff ID, designation aur department
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
            <div>
              <label className={labelClass} htmlFor="staffId">
                Staff ID
              </label>
              <input
                id="staffId"
                name="staffId"
                value={form.staffId}
                onChange={handleChange}
                placeholder="e.g. STF-001 (optional)"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-400">
                Khali chhodne par ID dena zaroori nahi hai.
              </p>
            </div>

            <div>
              <label className={labelClass} htmlFor="designation">
                Designation *
              </label>
              <input
                id="designation"
                name="designation"
                value={form.designation}
                onChange={handleChange}
                placeholder="e.g. Teacher, Accountant, Peon"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="department">
                Department
              </label>
              <div className="relative">
                <Building2
                  size={17}
                  className="absolute left-3 top-[22px] text-slate-400"
                />
                <select
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className={`${inputClass} pl-10`}
                >
                  <option value="General">General</option>
                  <option value="Teaching">Teaching</option>
                  <option value="Administration">Administration</option>
                  <option value="Accounts">Accounts</option>
                  <option value="Library">Library</option>
                  <option value="Office">Office</option>
                  <option value="Transport">Transport</option>
                  <option value="Security">Security</option>
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="IT">IT</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="joiningDate">
                Joining Date
              </label>
              <div className="relative">
                <CalendarDays
                  size={17}
                  className="absolute left-3 top-[22px] text-slate-400"
                />
                <input
                  id="joiningDate"
                  name="joiningDate"
                  type="date"
                  value={form.joiningDate}
                  onChange={handleChange}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="salary">
                Monthly Salary (₹)
              </label>
              <div className="relative">
                <IndianRupee
                  size={17}
                  className="absolute left-3 top-[22px] text-slate-400"
                />
                <input
                  id="salary"
                  name="salary"
                  type="number"
                  min="0"
                  value={form.salary}
                  onChange={handleChange}
                  placeholder="Enter monthly salary"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="status">
                Employment Status
              </label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </section>

        {/* Form Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/admin/attendance/staff"
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Saving Staff...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Staff Member
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
