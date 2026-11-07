
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  GraduationCap,
  Users,
  UserCheck,
  UserX,
  Eye,
  X,
  AlertCircle,
  BookOpen,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/+$/, "");

const API_ROOT = API_BASE.endsWith("/api")
  ? API_BASE
  : `${API_BASE}/api`;

export default function StudentCategoriesPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadStudents() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_ROOT}/students`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Students load nahi hue.");
      }

      setStudents(
        Array.isArray(data.students) ? data.students : []
      );
    } catch (err) {
      setError(err.message || "Error loading students.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  // Create class-wise categories from actual student records.
  const categories = useMemo(() => {
    const grouped = {};

    students.forEach((student) => {
      const className = student.className || "Unassigned";

      if (!grouped[className]) {
        grouped[className] = {
          name: className,
          students: [],
        };
      }

      grouped[className].students.push(student);
    });

    return Object.values(grouped).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        numeric: true,
      })
    );
  }, [students]);

  const activeCount = students.filter(
    (student) => student.status === "Active"
  ).length;

  const inactiveCount = students.filter(
    (student) => student.status !== "Active"
  ).length;

  const currentCategory = categories.find(
    (category) => category.name === selectedClass
  );

  const filteredStudents = useMemo(() => {
    if (!currentCategory) return [];

    const q = search.trim().toLowerCase();

    return currentCategory.students.filter((student) => {
      const name = `${student.firstName || ""} ${
        student.lastName || ""
      }`.toLowerCase();

      return (
        !q ||
        name.includes(q) ||
        String(student.admissionNo || "").toLowerCase().includes(q) ||
        String(student.rollNo || "").toLowerCase().includes(q) ||
        String(student.phone || "").includes(q)
      );
    });
  }, [currentCategory, search]);

  return (
    <div className="min-h-screen space-y-5 bg-slate-50 p-4 text-slate-800 sm:p-6">

      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <GraduationCap size={18} />
            Student Management
          </p>

          <h1 className="text-2xl font-bold sm:text-3xl">
            Student Categories
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Class-wise student grouping aur records dekhein.
          </p>
        </div>

        <button
          onClick={loadStudents}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Total Students"
          value={students.length}
          icon={<Users size={20} />}
        />

        <Stat
          label="Total Categories"
          value={categories.length}
          icon={<BookOpen size={20} />}
        />

        <Stat
          label="Active Students"
          value={activeCount}
          icon={<UserCheck size={20} />}
        />

        <Stat
          label="Inactive Students"
          value={inactiveCount}
          icon={<UserX size={20} />}
        />
      </div>

      {/* Categories */}
      <section>
        <div className="mb-3">
          <h2 className="text-lg font-bold">Available Categories</h2>
          <p className="text-sm text-slate-500">
            Select a class to view its students.
          </p>
        </div>

        {loading ? (
          <div className="border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="border border-slate-200 bg-white p-10 text-center">
            <GraduationCap
              size={35}
              className="mx-auto mb-3 text-slate-400"
            />
            <p className="font-semibold">No categories found</p>
            <p className="mt-1 text-sm text-slate-500">
              Student records add karne ke baad categories yahan dikhenge.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const active = category.students.filter(
                (s) => s.status === "Active"
              ).length;

              const isSelected = selectedClass === category.name;

              return (
                <button
                  key={category.name}
                  onClick={() => {
                    setSelectedClass(
                      isSelected ? "" : category.name
                    );
                    setSearch("");
                  }}
                  className={`border p-4 text-left shadow-sm transition ${
                    isSelected
                      ? "border-emerald-700 bg-emerald-50"
                      : "border-slate-200 bg-white hover:border-emerald-500"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center bg-emerald-100 text-emerald-700">
                      <GraduationCap size={23} />
                    </div>

                    <span className="bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                      {category.students.length} Students
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold">
                    {category.name}
                  </h3>

                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>{active} Active</span>
                    <span>
                      {category.students.length - active} Inactive
                    </span>
                  </div>

                  <div className="mt-3 h-1.5 bg-slate-100">
                    <div
                      className="h-full bg-emerald-600"
                      style={{
                        width: `${
                          category.students.length
                            ? (active / category.students.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <Eye size={14} />
                    {isSelected ? "Hide Students" : "View Students"}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Selected Category Students */}
      {currentCategory && (
        <section className="border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold">
                {currentCategory.name} - Students
              </h2>
              <p className="text-sm text-slate-500">
                {currentCategory.students.length} students in this category
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedClass("");
                setSearch("");
              }}
              className="inline-flex items-center gap-2 border border-slate-200 px-3 py-2 text-sm hover:bg-slate-100"
            >
              <X size={15} />
              Close
            </button>
          </div>

          <div className="border-b border-slate-200 p-4">
            <div className="relative max-w-md">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student..."
                className="w-full border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Admission No.</th>
                  <th className="px-4 py-3">Roll No.</th>
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold">
                      {student.firstName} {student.lastName}
                    </td>

                    <td className="px-4 py-3">
                      {student.admissionNo || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {student.rollNo ?? "-"}
                    </td>

                    <td className="px-4 py-3">
                      {student.section || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {student.phone || "-"}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-semibold ${
                          student.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {student.status || "Unknown"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-100"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Student Quick View */}
      {selectedStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="w-full max-w-lg bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-lg font-bold">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h2>
                <p className="text-sm text-slate-500">
                  Admission No: {selectedStudent.admissionNo || "-"}
                </p>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="border border-slate-200 p-2 hover:bg-slate-100"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <Info label="Roll Number" value={selectedStudent.rollNo} />
              <Info label="Class" value={selectedStudent.className} />
              <Info label="Section" value={selectedStudent.section} />
              <Info label="Session" value={selectedStudent.session} />
              <Info label="Father Name" value={selectedStudent.fatherName} />
              <Info label="Phone" value={selectedStudent.phone} />
              <Info label="Gender" value={selectedStudent.gender} />
              <Info label="Status" value={selectedStudent.status} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={`/admin/attendance/student/${selectedStudent._id}`}
                className="bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Attendance History
              </a>

              <button
                onClick={() => setSelectedStudent(null)}
                className="border border-slate-200 px-4 py-2.5 text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div className="border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-sm">{label}</span>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-slate-800">
        {value !== undefined && value !== null && value !== ""
          ? String(value)
          : "-"}
      </p>
    </div>
  );
}
