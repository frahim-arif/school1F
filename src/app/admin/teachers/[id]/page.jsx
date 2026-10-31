"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Calendar,
  IndianRupee,
  User,
  BookOpen,
  Users,
  RefreshCw,
  ShieldCheck,
  Clock,
  AlertCircle,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_URL = API_BASE.endsWith("/api")
  ? `${API_BASE}/teachers`
  : `${API_BASE}/api/teachers`;

function formatDate(date) {
  if (!date) return "Not provided";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "Not provided";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatSalary(salary) {
  if (salary === undefined || salary === null || salary === "") {
    return "Not provided";
  }

  return `₹${Number(salary).toLocaleString("en-IN")} / Month`;
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 break-words font-semibold text-gray-800">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

function NameList({ items, emptyText }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="text-sm text-gray-500">{emptyText}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => {
        const name =
          typeof item === "string" ? item : item?.name;

        return (
          <span
            key={item?._id || `${name}-${index}`}
            className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800"
          >
            {name || "Unnamed"}
          </span>
        );
      })}
    </div>
  );
}

export default function TeacherProfilePage() {
  const params = useParams();
  const teacherId = params?.id;

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTeacher = useCallback(async () => {
    if (!teacherId) {
      setError("Teacher ID nahi mila.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(teacherId)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Teacher profile load nahi ho saka."
        );
      }

      const result = data.teacher || data.data || data;

      if (!result || !result._id) {
        throw new Error("Teacher ka record nahi mila.");
      }

      setTeacher(result);
    } catch (err) {
      setError(
        err.message ||
          "Server se connect nahi ho saka. Backend check karein."
      );
      setTeacher(null);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    loadTeacher();
  }, [loadTeacher]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={34}
            className="mx-auto animate-spin text-emerald-700"
          />
          <p className="mt-4 font-medium text-gray-600">
            Loading teacher profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        <Link
          href="/admin/teachers"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
        >
          <ArrowLeft size={18} />
          Back to Teachers
        </Link>

        <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <AlertCircle
            size={42}
            className="mx-auto text-red-500"
          />

          <h2 className="mt-4 text-xl font-bold text-gray-800">
            Unable to Load Teacher
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error || "Teacher record nahi mila."}
          </p>

          <button
            type="button"
            onClick={loadTeacher}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800"
          >
            <RefreshCw size={17} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isActive = teacher.status === "Active";

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/teachers"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            <ArrowLeft size={18} />
            Back to Teachers
          </Link>

          <span
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              isActive
                ? "bg-emerald-100 text-emerald-800"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isActive ? "bg-emerald-600" : "bg-gray-500"
              }`}
            />
            {teacher.status || "Unknown Status"}
          </span>
        </div>

        {/* Profile Banner */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="h-32 bg-gradient-to-r from-emerald-950 via-emerald-800 to-teal-700 sm:h-40" />

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-emerald-50 shadow-md sm:h-32 sm:w-32">
                {teacher.photo ? (
                  <img
                    src={teacher.photo}
                    alt={teacher.name || "Teacher"}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <User
                    size={54}
                    className="text-emerald-700"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1 pb-1">
                <h1 className="break-words text-2xl font-bold text-gray-900 sm:text-3xl">
                  {teacher.name || "Unnamed Teacher"}
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                  Employee ID:{" "}
                  <span className="font-semibold text-emerald-800">
                    {teacher.employeeId || "Not assigned"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Information */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <User size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Personal Information
                  </h2>
                  <p className="text-sm text-gray-500">
                    Teacher contact and personal details
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Info
                  icon={Mail}
                  label="Email Address"
                  value={teacher.email}
                />

                <Info
                  icon={Phone}
                  label="Phone Number"
                  value={teacher.phone}
                />

                <Info
                  icon={User}
                  label="Gender"
                  value={teacher.gender}
                />

                <Info
                  icon={GraduationCap}
                  label="Qualification"
                  value={teacher.qualification}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Briefcase size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Employment Details
                  </h2>
                  <p className="text-sm text-gray-500">
                    Joining date, experience and salary
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Info
                  icon={Calendar}
                  label="Joining Date"
                  value={formatDate(teacher.joiningDate)}
                />

                <Info
                  icon={Clock}
                  label="Experience"
                  value={
                    teacher.experience !== undefined &&
                    teacher.experience !== null
                      ? `${teacher.experience} Years`
                      : "Not provided"
                  }
                />

                <Info
                  icon={IndianRupee}
                  label="Monthly Salary"
                  value={formatSalary(teacher.salary)}
                />

                <Info
                  icon={ShieldCheck}
                  label="Employment Status"
                  value={teacher.status}
                />
              </div>
            </section>
          </div>

          {/* Classes and Subjects */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Users size={21} />
                </div>

                <div>
                  <h2 className="font-bold text-gray-900">
                    Assigned Classes
                  </h2>
                  <p className="text-sm text-gray-500">
                    Classes assigned to this teacher
                  </p>
                </div>
              </div>

              <NameList
                items={teacher.classIds}
                emptyText="No classes assigned yet."
              />
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <BookOpen size={21} />
                </div>

                <div>
                  <h2 className="font-bold text-gray-900">
                    Assigned Subjects
                  </h2>
                  <p className="text-sm text-gray-500">
                    Subjects taught by this teacher
                  </p>
                </div>
              </div>

              <NameList
                items={teacher.subjectIds}
                emptyText="No subjects assigned yet."
              />
            </section>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-gray-400">
          Teacher profile information is loaded from your school database.
        </p>
      </div>
    </div>
  );
}