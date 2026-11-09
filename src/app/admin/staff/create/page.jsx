
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  BriefcaseBusiness,
  Save,
  ArrowLeft,
  MapPin,
  Hash,
  IndianRupee,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com/api"
).replace(/\/+$/, "");

const initialForm = {
  name: "",
  staffId: "",
  role: "Teacher",
  department: "Mathematics",
  phone: "",
  email: "",
  joiningDate: "",
  salary: "",
  address: "",
};

const roles = [
  "Teacher",
  "Principal",
  "Vice Principal",
  "Accountant",
  "Librarian",
  "Receptionist",
];

const departments = [
  "Mathematics",
  "Science",
  "English",
  "Assamese",
  "Social Science",
  "Computer Science",
  "Administration",
  "Accounts",
  "Library",
  "Other",
];

export default function CreateStaffPage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Admin login session not found. Please login again.");
      setMessageType("error");
      return;
    }

    if (!form.name.trim() || !form.staffId.trim()) {
      setMessage("Full Name and Employee ID are required.");
      setMessageType("error");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.phone)) {
      setMessage("Please enter a valid 10-digit phone number.");
      setMessageType("error");
      return;
    }

    if (form.salary !== "" && Number(form.salary) < 0) {
      setMessage("Salary cannot be negative.");
      setMessageType("error");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_BASE}/staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          staffId: form.staffId.trim(),
          name: form.name.trim(),
          role: form.role,
          department: form.department,
          phone: form.phone.trim(),
          email: form.email.trim(),
          joiningDate: form.joiningDate || null,
          salary: Number(form.salary || 0),
          address: form.address.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to create staff profile.");
      }

      setMessage("Staff profile created successfully!");
      setMessageType("success");

      setForm(initialForm);

      setTimeout(() => {
        router.push("/admin/staff");
      }, 1200);
    } catch (error) {
      console.error("Create Staff Error:", error);
      setMessage(error.message || "Something went wrong.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full min-w-0 bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400";

  const fieldClass =
    "mt-2 flex items-center gap-3 border border-slate-200 bg-white px-4 transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100";

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Staff Management</span>
            <span>/</span>
            <span className="font-semibold text-indigo-600">
              Add New Staff
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-black text-slate-800 sm:text-3xl">
            Add New Staff
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create staff profile and manage employee details.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/admin/staff")}
          className="flex w-fit items-center gap-2 border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
        >
          <ArrowLeft size={17} />
          Back to Staff
        </button>
      </div>

      {/* Alert */}
      {message && (
        <div
          className={`flex items-center gap-3 border p-4 text-sm font-medium ${
            messageType === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {messageType === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Personal Information */}
        <section className="border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:px-7">
            <div className="flex h-10 w-10 items-center justify-center bg-indigo-50 text-indigo-600">
              <UserRound size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                Personal Information
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Enter employee's basic information.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">

            {/* Full Name */}
            <div>
              <label className="text-sm font-bold text-slate-600">
                Full Name <span className="text-red-500">*</span>
              </label>

              <div className={fieldClass}>
                <UserRound size={18} className="shrink-0 text-indigo-500" />
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Employee ID */}
            <div>
              <label className="text-sm font-bold text-slate-600">
                Employee ID <span className="text-red-500">*</span>
              </label>

              <div className={fieldClass}>
                <Hash size={18} className="shrink-0 text-green-600" />
                <input
                  name="staffId"
                  value={form.staffId}
                  onChange={handleChange}
                  placeholder="EMP-001"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-bold text-slate-600">
                Phone Number <span className="text-red-500">*</span>
              </label>

              <div className={fieldClass}>
                <Phone size={18} className="shrink-0 text-orange-500" />
                <input
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                    }))
                  }
                  placeholder="9876543210"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-bold text-slate-600">
                Email Address
              </label>

              <div className={fieldClass}>
                <Mail size={18} className="shrink-0 text-red-500" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="text-sm font-bold text-slate-600">
                Address
              </label>

              <div className={fieldClass}>
                <MapPin
                  size={18}
                  className="mt-1 shrink-0 self-start text-purple-500"
                />
                <textarea
                  name="address"
                  rows={3}
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                  className="w-full resize-y py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Employment Information */}
        <section className="border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:px-7">
            <div className="flex h-10 w-10 items-center justify-center bg-purple-50 text-purple-600">
              <BriefcaseBusiness size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                Employment Information
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Set employee designation and department.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">

            {/* Role */}
            <div>
              <label className="text-sm font-bold text-slate-600">
                Role / Designation <span className="text-red-500">*</span>
              </label>

              <div className={fieldClass}>
                <BriefcaseBusiness
                  size={18}
                  className="shrink-0 text-purple-600"
                />

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="text-sm font-bold text-slate-600">
                Department <span className="text-red-500">*</span>
              </label>

              <div className={fieldClass}>
                <BriefcaseBusiness
                  size={18}
                  className="shrink-0 text-blue-600"
                />

                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Joining Date */}
            <div>
              <label className="text-sm font-bold text-slate-600">
                Joining Date
              </label>

              <div className={fieldClass}>
                <CalendarDays
                  size={18}
                  className="shrink-0 text-blue-600"
                />
                <input
                  name="joiningDate"
                  type="date"
                  value={form.joiningDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Salary */}
            <div>
              <label className="text-sm font-bold text-slate-600">
                Monthly Salary (₹)
              </label>

              <div className={fieldClass}>
                <IndianRupee
                  size={18}
                  className="shrink-0 text-green-600"
                />
                <input
                  name="salary"
                  type="number"
                  min="0"
                  value={form.salary}
                  onChange={handleChange}
                  placeholder="25000"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => router.push("/admin/staff")}
            disabled={saving}
            className="border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Staff
              </>
            )}
          </button>
        </div>
      </form>

      <p className="pb-3 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} School ERP. All rights reserved.
      </p>
    </div>
  );
}
