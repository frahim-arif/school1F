
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Home,
  Search,
  RefreshCw,
  CheckSquare,
  Square,
  AlertCircle,
  CheckCircle2,
  Trash2,
  UserRound,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/+$/, "");

const API_ROOT = API_BASE.endsWith("/api")
  ? API_BASE
  : `${API_BASE}/api`;

export default function StudentHousesPage() {
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [houseName, setHouseName] = useState("");
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [houseFilter, setHouseFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

      setStudents(Array.isArray(data.students) ? data.students : []);
      setSelectedIds([]);
    } catch (err) {
      setError(err.message || "Unable to load students.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const houses = useMemo(() => {
    return [...new Set(
      students.map((s) => s.houseName?.trim()).filter(Boolean)
    )].sort();
  }, [students]);

  const classes = useMemo(() => {
    return [...new Set(
      students.map((s) => s.className).filter(Boolean)
    )].sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();

    return students.filter((s) => {
      const name = `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase();

      const matchesSearch =
        !q ||
        name.includes(q) ||
        String(s.admissionNo || "").toLowerCase().includes(q) ||
        String(s.rollNo || "").includes(q) ||
        String(s.phone || "").includes(q);

      const matchesClass =
        !classFilter || s.className === classFilter;

      const matchesHouse =
        !houseFilter ||
        (houseFilter === "__unassigned__"
          ? !s.houseName
          : s.houseName === houseFilter);

      return matchesSearch && matchesClass && matchesHouse;
    });
  }, [students, search, classFilter, houseFilter]);

  const assignedCount = students.filter(
    (s) => s.houseName?.trim()
  ).length;

  const unassignedCount = students.length - assignedCount;

  const allVisibleSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedIds.includes(s._id));

  function toggleStudent(id) {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  }

  function toggleAll() {
    if (allVisibleSelected) {
      const visibleIds = filteredStudents.map((s) => s._id);
      setSelectedIds((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      );
    } else {
      setSelectedIds((prev) => [
        ...new Set([
          ...prev,
          ...filteredStudents.map((s) => s._id),
        ]),
      ]);
    }
  }

  async function assignHouse(name = houseName) {
    if (!selectedIds.length) {
      setError("Please select students first.");
      return;
    }

    if (name.trim().length > 40) {
      setError("House name maximum 40 characters ka ho sakta hai.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_ROOT}/students/house/assign`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentIds: selectedIds,
          houseName: name.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "House assignment failed.");
      }

      setMessage(data.message);
      setHouseName("");
      await loadStudents();
    } catch (err) {
      setError(err.message || "Unable to assign house.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen space-y-5 bg-slate-50 p-4 text-slate-800 sm:p-6">

      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <Home size={18} />
            Student Management
          </p>

          <h1 className="text-2xl font-bold sm:text-3xl">
            Student House / Groups
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Students ko houses aur groups mein assign karein.
          </p>
        </div>

        <button
          onClick={loadStudents}
          disabled={loading || saving}
          className="inline-flex items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {message && (
        <div className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Students" value={students.length} icon={<Users size={20} />} />
        <Stat label="Total Houses" value={houses.length} icon={<Home size={20} />} />
        <Stat label="Assigned Students" value={assignedCount} icon={<CheckCircle2 size={20} />} />
        <Stat label="Not Assigned" value={unassignedCount} icon={<UserRound size={20} />} />
      </div>

      {/* Existing Houses */}
      <section>
        <h2 className="mb-3 text-lg font-bold">House Overview</h2>

        {houses.length === 0 ? (
          <div className="border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            Abhi koi house create nahi hua. Students select karke house name assign karein.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {houses.map((house) => {
              const count = students.filter(
                (s) => s.houseName === house
              ).length;

              return (
                <button
                  key={house}
                  onClick={() => setHouseFilter(
                    houseFilter === house ? "" : house
                  )}
                  className={`border bg-white p-4 text-left shadow-sm transition ${
                    houseFilter === house
                      ? "border-emerald-700 bg-emerald-50"
                      : "border-slate-200 hover:border-emerald-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Home size={22} className="text-emerald-700" />
                    <span className="text-sm font-bold">{count}</span>
                  </div>
                  <h3 className="mt-3 font-bold">{house}</h3>
                  <p className="mt-1 text-xs text-slate-500">Students</p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Assignment */}
      <section className="border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <h2 className="font-bold">Assign Students to House</h2>
          <p className="mt-1 text-sm text-slate-500">
            Students select karein aur house name enter karein.
          </p>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-[1fr_auto]">
          <input
            value={houseName}
            onChange={(e) => setHouseName(e.target.value)}
            maxLength={40}
            placeholder="Enter house name (e.g. Red House)"
            className="w-full border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
          />

          <button
            onClick={() => assignHouse()}
            disabled={saving || loading || !selectedIds.length || !houseName.trim()}
            className="bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : `Assign Selected (${selectedIds.length})`}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-100 px-4 py-3">
          <button
            onClick={() => assignHouse("")}
            disabled={saving || !selectedIds.length}
            className="inline-flex items-center gap-2 border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 size={14} />
            Remove House from Selected
          </button>

          <span className="self-center text-xs text-slate-500">
            House remove karne se student record delete nahi hoga.
          </span>
        </div>
      </section>

      {/* Students */}
      <section className="border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-3 border-b border-slate-200 p-4 sm:grid-cols-3">
          <div className="relative sm:col-span-1">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student..."
              className="w-full border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600"
            />
          </div>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="border border-slate-200 px-3 py-2.5 text-sm outline-none"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={houseFilter}
            onChange={(e) => setHouseFilter(e.target.value)}
            className="border border-slate-200 px-3 py-2.5 text-sm outline-none"
          >
            <option value="">All Houses</option>
            <option value="__unassigned__">Not Assigned</option>
            {houses.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 p-4">
          <p className="text-sm text-slate-500">
            Showing {filteredStudents.length} students
          </p>

          <button
            onClick={toggleAll}
            disabled={!filteredStudents.length}
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 disabled:opacity-40"
          >
            {allVisibleSelected ? <CheckSquare size={17} /> : <Square size={17} />}
            {allVisibleSelected ? "Unselect Visible" : "Select Visible"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="w-12 px-4 py-3">Select</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Admission No.</th>
                <th className="px-4 py-3">Class / Section</th>
                <th className="px-4 py-3">Current House</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr key={student._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(student._id)}
                      onChange={() => toggleStudent(student._id)}
                      className="h-4 w-4 accent-emerald-700"
                    />
                  </td>

                  <td className="px-4 py-3 font-semibold">
                    {student.firstName} {student.lastName}
                  </td>

                  <td className="px-4 py-3">{student.admissionNo || "-"}</td>

                  <td className="px-4 py-3">
                    {student.className || "-"} / {student.section || "-"}
                  </td>

                  <td className="px-4 py-3">
                    {student.houseName || (
                      <span className="text-slate-400">Not assigned</span>
                    )}
                  </td>

                  <td className="px-4 py-3">{student.status || "-"}</td>
                </tr>
              ))}

              {!loading && filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    No students found.
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    Loading students...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
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
      <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}
