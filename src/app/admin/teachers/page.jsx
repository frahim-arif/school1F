"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Phone,
  Mail,
  User,
  RefreshCw,
  AlertCircle,
  GraduationCap,
  Users,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_URL = API_BASE.endsWith("/api")
  ? `${API_BASE}/teachers`
  : `${API_BASE}/api/teachers`;

export default function TeachersPage() {
  const router = useRouter();

  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Teachers load nahi ho sake.");
      }

      const list = Array.isArray(data)
        ? data
        : data.teachers || data.data?.teachers || data.data || [];

      if (!Array.isArray(list)) {
        throw new Error("Backend se teachers ka valid data nahi mila.");
      }

      setTeachers(list);
    } catch (err) {
      setError(
        err.message ||
          "Backend se connect nahi ho saka. Server check karein."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const filteredTeachers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return teachers;

    return teachers.filter((teacher) => {
      const searchableValues = [
        teacher.name,
        teacher.employeeId,
        teacher.email,
        teacher.phone,
        teacher.qualification,
        teacher.gender,
        ...(teacher.classIds || []).map((item) =>
          typeof item === "string" ? item : item?.name
        ),
        ...(teacher.subjectIds || []).map((item) =>
          typeof item === "string" ? item : item?.name
        ),
      ];

      return searchableValues.some((value) =>
        String(value || "").toLowerCase().includes(query)
      );
    });
  }, [teachers, search]);

  const handleDelete = async (teacher) => {
    const confirmed = window.confirm(
      `Kya aap "${teacher.name}" ko permanently delete karna chahte hain?`
    );

    if (!confirmed) return;

    setDeletingId(teacher._id);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(teacher._id)}`,
        { method: "DELETE" }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
            "Teacher delete nahi hua. Backend DELETE route check karein."
        );
      }

      setTeachers((previous) =>
        previous.filter((item) => item._id !== teacher._id)
      );
    } catch (err) {
      setError(err.message || "Teacher delete karte waqt error aaya.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Teacher Management
          </h1>

          <p className="mt-2 text-slate-500">
            Manage all teachers in your school
          </p>
        </div>

        <Link
          href="/admin/teachers/create"
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
        >
          <Plus size={18} />
          Add Teacher
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Users}
          label="Total Teachers"
          value={teachers.length}
        />

        <StatCard
          icon={GraduationCap}
          label="Active Teachers"
          value={
            teachers.filter((teacher) => teacher.status === "Active").length
          }
        />

        <StatCard
          icon={User}
          label="Inactive Teachers"
          value={
            teachers.filter((teacher) => teacher.status === "Inactive").length
          }
        />
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-4 top-3.5 text-gray-400"
          />

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, teacher ID, email or phone..."
            className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {!loading && (
          <p className="mt-3 text-sm text-slate-500">
            Showing {filteredTeachers.length} of {teachers.length} teachers
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>

          <button
            type="button"
            onClick={loadTeachers}
            className="shrink-0 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
          <RefreshCw
            size={32}
            className="mx-auto animate-spin text-emerald-600"
          />

          <p className="mt-4 font-medium text-slate-600">
            Loading teachers...
          </p>
        </div>
      ) : filteredTeachers.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            {search ? <Search size={30} /> : <Users size={30} />}
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-800">
            {search ? "No teachers found" : "No teachers added yet"}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {search
              ? "Try another name, teacher ID, email or phone number."
              : "Add your first teacher to start managing your staff."}
          </p>

          {!search && (
            <Link
              href="/admin/teachers/create"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              <Plus size={18} />
              Add First Teacher
            </Link>
          )}
        </div>
      ) : (
        /* Teacher Cards */
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredTeachers.map((teacher) => {
            const isActive = teacher.status === "Active";

            return (
              <div
                key={teacher._id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                {/* Profile */}
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-emerald-100 bg-emerald-50">
                    {teacher.photo ? (
                      <img
                        src={teacher.photo}
                        alt={teacher.name || "Teacher"}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <User size={44} className="text-emerald-700" />
                    )}
                  </div>

                  <h3 className="mt-4 break-words text-xl font-bold text-slate-800">
                    {teacher.name || "Unnamed Teacher"}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    ID: {teacher.employeeId || "Not assigned"}
                  </p>

                  <span className="mt-3 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {teacher.qualification || "Qualification not provided"}
                  </span>
                </div>

                {/* Contact */}
                <div className="mt-6 space-y-3 text-sm text-slate-600">
                  <div className="flex min-w-0 items-start gap-3">
                    <Phone
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />

                    <span className="break-words">
                      {teacher.phone || "Phone not provided"}
                    </span>
                  </div>

                  <div className="flex min-w-0 items-start gap-3">
                    <Mail
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />

                    <span className="break-all">
                      {teacher.email || "Email not provided"}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <GraduationCap
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />

                    <span>
                      {Array.isArray(teacher.subjectIds) &&
                      teacher.subjectIds.length
                        ? teacher.subjectIds
                            .map((subject) =>
                              typeof subject === "string"
                                ? subject
                                : subject?.name
                            )
                            .filter(Boolean)
                            .join(", ")
                        : "No subjects assigned"}
                    </span>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {teacher.status || "Unknown"}
                  </span>

                  <div className="flex gap-2">
                    <ActionButton
                      label="View teacher"
                      color="blue"
                      onClick={() =>
                        router.push(`/admin/teachers/${teacher._id}`)
                      }
                    >
                      <Eye size={18} />
                    </ActionButton>

                    <ActionButton
                      label="Edit teacher"
                      color="amber"
                      onClick={() =>
                        router.push(
                          `/admin/teachers/${teacher._id}/edit`
                        )
                      }
                    >
                      <Pencil size={18} />
                    </ActionButton>

                    <ActionButton
                      label="Delete teacher"
                      color="red"
                      disabled={deletingId === teacher._id}
                      onClick={() => handleDelete(teacher)}
                    >
                      {deletingId === teacher._id ? (
                        <RefreshCw size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </ActionButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        <Icon size={23} />
      </div>

      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function ActionButton({ label, color, onClick, disabled, children }) {
  const colors = {
    blue: "bg-blue-100 text-blue-600 hover:bg-blue-200",
    amber: "bg-amber-100 text-amber-700 hover:bg-amber-200",
    red: "bg-red-100 text-red-600 hover:bg-red-200",
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${colors[color]}`}
    >
      {children}
    </button>
  );
}