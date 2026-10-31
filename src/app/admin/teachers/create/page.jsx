
"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_URL = API_BASE.endsWith("/api")
  ? `${API_BASE}/teachers`
  : `${API_BASE}/api/teachers`;

const DEPARTMENT_API_URL = API_BASE.endsWith("/api")
  ? `${API_BASE}/departments`
  : `${API_BASE}/api/departments`;

const initialForm = {
  employeeId: "",
  name: "",
  email: "",
  phone: "",
  qualification: "",
  experience: "0",
  gender: "Male",
  joiningDate: "",
  salary: "0",
  status: "Active",
  departmentId: "",
};

export default function CreateTeacherPage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [departmentError, setDepartmentError] = useState("");

  const [photoFile, setPhotoFile] = useState(null);
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadDepartments = async () => {
      setDepartmentsLoading(true);
      setDepartmentError("");

      try {
        const response = await fetch(DEPARTMENT_API_URL);
        const data = await response.json().catch(() => ({}));

        if (!response.ok || data.success === false) {
          throw new Error(
            data.message || "Unable to load departments."
          );
        }

        const list = Array.isArray(data)
          ? data
          : data.departments || data.data || [];

        if (!cancelled) {
          setDepartments(
            list.filter((department) => department.status === "Active")
          );
        }
      } catch (err) {
        if (!cancelled) {
          setDepartmentError(
            err.message || "Failed to load departments."
          );
        }
      } finally {
        if (!cancelled) {
          setDepartmentsLoading(false);
        }
      }
    };

    loadDepartments();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (image.startsWith("blob:")) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Photo size must be less than 5 MB.");
      e.target.value = "";
      return;
    }

    if (image.startsWith("blob:")) {
      URL.revokeObjectURL(image);
    }

    setPhotoFile(file);
    setImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.employeeId.trim()) {
      setError("Teacher ID is required.");
      return;
    }

    if (!form.name.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Mobile number is required.");
      return;
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!form.joiningDate) {
      setError("Joining date is required.");
      return;
    }

    if (
      form.experience === "" ||
      !Number.isFinite(Number(form.experience)) ||
      Number(form.experience) < 0
    ) {
      setError("Enter a valid experience in years.");
      return;
    }

    if (
      form.salary === "" ||
      !Number.isFinite(Number(form.salary)) ||
      Number(form.salary) < 0
    ) {
      setError("Enter a valid salary.");
      return;
    }

    if (form.departmentId) {
      const departmentExists = departments.some(
        (department) => department._id === form.departmentId
      );

      if (!departmentExists) {
        setError(
          "Selected department is no longer available. Please select again."
        );
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        employeeId: form.employeeId.trim(),
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        gender: form.gender,
        qualification: form.qualification.trim(),
        experience: Number(form.experience),
        joiningDate: form.joiningDate,
        salary: Number(form.salary),
        status: form.status,
        departmentId: form.departmentId || null,
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Unable to create teacher. Please try again."
        );
      }

      setMessage("Teacher created successfully!");

      setTimeout(() => {
        router.push("/admin/teachers");
        router.refresh();
      }, 900);
    } catch (err) {
      setError(
        err.message ||
          "Backend se connect nahi ho saka. Please check your server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Add New Teacher
          </h1>
          <p className="mt-2 text-slate-500">
            Create a new teacher profile
          </p>
        </div>

        <Link
          href="/admin/teachers"
          className="flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 hover:bg-slate-100"
        >
          <ArrowLeft size={18} />
          Back
        </Link>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border bg-white p-5 shadow-sm sm:p-8"
      >
        {/* Photo */}
        <div className="mb-10 flex flex-col items-center">
          <label className="cursor-pointer">
            <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-dashed border-emerald-400 bg-slate-50">
              {image ? (
                <img
                  src={image}
                  alt="Teacher preview"
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
            Upload Teacher Photo (Optional, max 5 MB)
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <CheckCircle size={19} />
            <p>{message}</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Input
            label="Teacher ID"
            name="employeeId"
            value={form.employeeId}
            onChange={handleChange}
            placeholder="e.g. TCH-0001"
            required
          />

          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter full name"
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="teacher@example.com"
            required
          />

          <Input
            label="Mobile Number"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="10-digit mobile number"
            maxLength={10}
            required
          />

          <Input
            label="Qualification"
            name="qualification"
            value={form.qualification}
            onChange={handleChange}
            placeholder="e.g. M.Sc, B.Ed"
          />

          <Input
            label="Experience (Years)"
            name="experience"
            type="number"
            min="0"
            step="0.5"
            value={form.experience}
            onChange={handleChange}
            required
          />

          {/* Department dropdown */}
          <div>
            <label
              htmlFor="departmentId"
              className="mb-2 block font-semibold text-slate-700"
            >
              Department
            </label>

            <select
              id="departmentId"
              name="departmentId"
              value={form.departmentId}
              onChange={handleChange}
              disabled={departmentsLoading || !!departmentError}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">
                {departmentsLoading
                  ? "Loading departments..."
                  : departmentError
                  ? "Departments unavailable"
                  : departments.length === 0
                  ? "No active departments"
                  : "Select Department (Optional)"}
              </option>

              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.name} ({department.code})
                </option>
              ))}
            </select>

            {departmentError ? (
              <p className="mt-2 text-xs text-red-600">
                {departmentError}
              </p>
            ) : departments.length === 0 && !departmentsLoading ? (
              <p className="mt-2 text-xs text-slate-500">
                Pehle Departments page par active department add karein.
              </p>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                Teacher ka department select karein.
              </p>
            )}
          </div>

          <Select
            label="Gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            options={["Male", "Female", "Other"]}
          />

          <Input
            label="Joining Date"
            name="joiningDate"
            type="date"
            value={form.joiningDate}
            onChange={handleChange}
            required
          />

          <Input
            label="Monthly Salary (₹)"
            name="salary"
            type="number"
            min="0"
            value={form.salary}
            onChange={handleChange}
            required
          />

          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={["Active", "Inactive"]}
          />
        </div>

        <div className="mt-10 flex flex-wrap justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/teachers")}
            className="rounded-xl border px-6 py-3 text-slate-700 hover:bg-slate-50"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {loading ? "Saving..." : "Save Teacher"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  min,
  maxLength,
  step,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block font-semibold text-slate-700"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        maxLength={maxLength}
        step={step}
        className="w-full rounded-xl border border-slate-300 p-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
    </div>
  );
}

function Select({ label, name, options, value, onChange }) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block font-semibold text-slate-700"
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-300 bg-white p-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      >
        {options.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}
