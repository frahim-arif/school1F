
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/+$/, "");

const API_ROOT = API_BASE.endsWith("/api")
  ? API_BASE
  : `${API_BASE}/api`;

export default function StudentsPage() {
  const router = useRouter();

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_ROOT}/students`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Students load nahi hue.");
      }

      setStudents(Array.isArray(data.students) ? data.students : []);
    } catch (err) {
      setError(
        err.message || "Backend se connection nahi ho raha."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const classes = useMemo(
    () => [
      ...new Set(
        students
          .map((student) => student.className)
          .filter(Boolean)
      ),
    ].sort(),
    [students]
  );

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return students.filter((student) => {
      const name =
        `${student.firstName || ""} ${student.lastName || ""}`
          .trim()
          .toLowerCase();

      const matchesSearch =
        !term ||
        name.includes(term) ||
        (student.admissionNo || "").toLowerCase().includes(term) ||
        (student.phone || "").toLowerCase().includes(term);

      const matchesClass =
        selectedClass === "All Classes" ||
        student.className === selectedClass;

      return matchesSearch && matchesClass;
    });
  }, [students, search, selectedClass]);

  const deleteStudent = async (student) => {
    const name =
      `${student.firstName || ""} ${student.lastName || ""}`.trim();

    const confirmed = window.confirm(
      `Kya aap ${name || student.admissionNo} ka student record delete karna chahte hain?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_ROOT}/students/${student._id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Student delete nahi hua.");
      }

      setStudents((current) =>
        current.filter((item) => item._id !== student._id)
      );
    } catch (err) {
      window.alert(err.message || "Student delete nahi hua.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Student Management
          </h1>

          <p className="mt-1 text-slate-500">
            Manage all student records
          </p>
        </div>

        <Link
          href="/admin/students/create"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          <Plus size={18} />
          Add Student
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Search
              className="absolute left-4 top-3.5 text-slate-400"
              size={18}
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search student, admission no. or phone..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={selectedClass}
            onChange={(event) => setSelectedClass(event.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
          >
            <option value="All Classes">All Classes</option>

            {classes.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={loadStudents}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 font-semibold text-white hover:bg-slate-700"
          >
            <Filter size={18} />
            Refresh Students
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-red-700">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />

          <div>
            <p className="font-semibold">Students load nahi hue</p>
            <p className="mt-1 text-sm">{error}</p>

            <button
              onClick={loadStudents}
              className="mt-3 inline-flex items-center gap-2 font-semibold underline"
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b px-6 py-4">
          <p className="font-semibold text-slate-700">
            {loading
              ? "Loading students..."
              : `${filteredStudents.length} student(s) found`}
          </p>

          {loading && (
            <RefreshCw
              size={18}
              className="animate-spin text-emerald-600"
            />
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-4 text-left">Admission No</th>
                <th className="px-6 py-4 text-left">Student Name</th>
                <th className="px-6 py-4 text-left">Class</th>
                <th className="px-6 py-4 text-left">Section</th>
                <th className="px-6 py-4 text-left">Phone</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {!loading && !error && filteredStudents.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    {students.length === 0
                      ? "Backend mein abhi koi student saved nahi hai. Add Student par click karke student add karein."
                      : "Search ya selected class se matching student nahi mila."}
                  </td>
                </tr>
              )}

              {filteredStudents.map((student) => {
                const name =
                  `${student.firstName || ""} ${student.lastName || ""}`.trim();

                return (
                  <tr
                    key={student._id}
                    className="border-t hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-semibold">
                      {student.admissionNo}
                    </td>

                    <td className="px-6 py-4">
                      {name || "--"}
                    </td>

                    <td className="px-6 py-4">
                      {student.className || "--"}
                    </td>

                    <td className="px-6 py-4">
                      {student.section || "--"}
                    </td>

                    <td className="px-6 py-4">
                      {student.phone || "--"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          student.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {student.status || "Unknown"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          title="View Attendance"
                         onClick={() =>
  router.push(
    `/admin/attendance/student/${student._id}`
  )
}
                          className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          type="button"
                          title="Edit Student"
                          onClick={() =>
                            router.push(
                              `/admin/students/edit/${student._id}`
                            )
                          }
                          className="rounded-lg bg-amber-100 p-2 text-amber-600 hover:bg-amber-200"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          type="button"
                          title="Delete Student"
                          onClick={() => deleteStudent(student)}
                          className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
