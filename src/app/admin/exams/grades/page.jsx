
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  RefreshCw,
  Save,
  Trash2,
  GraduationCap,
  Award,
  CheckCircle2,
  AlertCircle,
  Pencil,
  X,
} from "lucide-react";

const defaultGrades = [
  { id: 1, grade: "A+", min: 90, max: 100, points: 10, remark: "Outstanding" },
  { id: 2, grade: "A", min: 80, max: 89, points: 9, remark: "Excellent" },
  { id: 3, grade: "B+", min: 70, max: 79, points: 8, remark: "Very Good" },
  { id: 4, grade: "B", min: 60, max: 69, points: 7, remark: "Good" },
  { id: 5, grade: "C", min: 50, max: 59, points: 6, remark: "Average" },
  { id: 6, grade: "D", min: 40, max: 49, points: 5, remark: "Pass" },
  { id: 7, grade: "F", min: 0, max: 39, points: 0, remark: "Needs Improvement" },
];

const emptyForm = {
  grade: "",
  min: "",
  max: "",
  points: "",
  remark: "",
};

export default function GradeSettingsPage() {
  const [grades, setGrades] = useState(defaultGrades);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const filteredGrades = grades.filter((item) =>
    `${item.grade} ${item.remark}`.toLowerCase().includes(search.toLowerCase())
  );

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    const grade = form.grade.trim().toUpperCase();
    const min = Number(form.min);
    const max = Number(form.max);
    const points = Number(form.points);

    if (!grade || form.min === "" || form.max === "" || form.points === "") {
      setError("Please fill all required fields.");
      return;
    }

    if (
      !Number.isFinite(min) ||
      !Number.isFinite(max) ||
      min < 0 ||
      max > 100 ||
      min > max
    ) {
      setError("Percentage 0–100 ke beech honi chahiye, aur minimum maximum se zyada nahi ho sakta.");
      return;
    }

    if (!Number.isFinite(points) || points < 0 || points > 10) {
      setError("Grade points 0 se 10 ke beech rakhein.");
      return;
    }

    const duplicate = grades.some(
      (item) =>
        item.grade.toLowerCase() === grade.toLowerCase() &&
        item.id !== editingId
    );

    if (duplicate) {
      setError("This grade already exists.");
      return;
    }

    const overlap = grades.some(
      (item) =>
        item.id !== editingId &&
        min <= item.max &&
        max >= item.min
    );

    if (overlap) {
      setError("Is percentage range ka kisi existing grade se overlap ho raha hai.");
      return;
    }

    const newGrade = {
      id: editingId ?? Date.now(),
      grade,
      min,
      max,
      points,
      remark: form.remark.trim() || "—",
    };

    if (editingId !== null) {
      setGrades((current) =>
        current.map((item) => item.id === editingId ? newGrade : item)
      );
      setMessage("Grade updated successfully.");
    } else {
      setGrades((current) => [...current, newGrade].sort((a, b) => b.min - a.min));
      setMessage("Grade added successfully.");
    }

    resetForm();
  }

  function editGrade(item) {
    setEditingId(item.id);
    setForm({
      grade: item.grade,
      min: String(item.min),
      max: String(item.max),
      points: String(item.points),
      remark: item.remark === "—" ? "" : item.remark,
    });
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteGrade(id) {
    const item = grades.find((grade) => grade.id === id);
    if (!item) return;

    if (!window.confirm(`Delete grade "${item.grade}"?`)) return;

    setGrades((current) => current.filter((grade) => grade.id !== id));
    if (editingId === id) resetForm();
    setMessage("Grade deleted.");
    setError("");
  }

  function restoreDefaults() {
    if (!window.confirm("Restore the default grading scale? Your current changes will be lost.")) {
      return;
    }

    setGrades(defaultGrades);
    resetForm();
    setSearch("");
    setMessage("Default grading scale restored.");
  }

  const averagePoints = grades.length
    ? (grades.reduce((sum, item) => sum + item.points, 0) / grades.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Link
            href="/admin/exams"
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft size={16} />
            Back to Exams
          </Link>

          <h1 className="text-3xl font-black text-slate-800">
            Grade Settings
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Configure percentage ranges, grade points and performance remarks.
          </p>
        </div>

        <button
          type="button"
          onClick={restoreDefaults}
          className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-3 font-bold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={17} />
          Restore Defaults
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">Total Grades</p>
            <GraduationCap size={23} className="text-indigo-600" />
          </div>
          <h2 className="mt-3 text-3xl font-black text-indigo-600">
            {grades.length}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">Highest Grade</p>
            <Award size={23} className="text-amber-500" />
          </div>
          <h2 className="mt-3 text-3xl font-black text-amber-500">
            {grades.length ? grades.reduce((best, item) => item.min > best.min ? item : best).grade : "—"}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">Average Grade Points</p>
            <CheckCircle2 size={23} className="text-green-600" />
          </div>
          <h2 className="mt-3 text-3xl font-black text-green-600">
            {averagePoints}
          </h2>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {message && (
        <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          {message}
        </div>
      )}

      {/* Add / Edit form */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-800">
              {editingId !== null ? "Edit Grade" : "Add New Grade"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Define the percentage range and corresponding grade points.
            </p>
          </div>
          {editingId !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-bold text-slate-600"
            >
              <X size={16} /> Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Grade *
              </label>
              <input
                required
                maxLength={5}
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                placeholder="e.g. A+"
                className="w-full rounded-xl border px-3 py-3 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Minimum % *
              </label>
              <input
                required
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.min}
                onChange={(e) => setForm({ ...form, min: e.target.value })}
                placeholder="90"
                className="w-full rounded-xl border px-3 py-3 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Maximum % *
              </label>
              <input
                required
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.max}
                onChange={(e) => setForm({ ...form, max: e.target.value })}
                placeholder="100"
                className="w-full rounded-xl border px-3 py-3 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Grade Points *
              </label>
              <input
                required
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={form.points}
                onChange={(e) => setForm({ ...form, points: e.target.value })}
                placeholder="10"
                className="w-full rounded-xl border px-3 py-3 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Remark
              </label>
              <input
                value={form.remark}
                maxLength={100}
                onChange={(e) => setForm({ ...form, remark: e.target.value })}
                placeholder="Outstanding"
                className="w-full rounded-xl border px-3 py-3 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700"
            >
              {editingId !== null ? <Save size={17} /> : <Plus size={18} />}
              {editingId !== null ? "Update Grade" : "Add Grade"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border px-5 py-3 font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Grades table */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b p-5 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-black text-slate-800">
              Grading Scale
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {grades.length} grade levels configured
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border px-3">
            <Search size={17} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search grades..."
              className="min-w-0 py-3 text-sm outline-none"
            />
          </div>
        </div>

        {filteredGrades.length === 0 ? (
          <div className="p-10 text-center">
            <GraduationCap size={36} className="mx-auto mb-3 text-slate-300" />
            <p className="font-bold text-slate-700">No grades found</p>
            <p className="mt-1 text-sm text-slate-500">
              Add a new grade or change your search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  {["Grade", "Minimum %", "Maximum %", "Grade Points", "Remark", "Actions"].map((title) => (
                    <th key={title} className="whitespace-nowrap px-5 py-4">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <span className={`inline-flex min-w-12 justify-center rounded-lg px-3 py-2 font-black ${
                        item.grade === "F"
                          ? "bg-red-100 text-red-700"
                          : item.grade === "A+" || item.grade === "A"
                          ? "bg-green-100 text-green-700"
                          : "bg-indigo-100 text-indigo-700"
                      }`}>
                        {item.grade}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                      {item.min}%
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                      {item.max}%
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-800">
                      {item.points.toFixed(1)}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {item.remark}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => editGrade(item)}
                          title="Edit grade"
                          className="rounded-lg bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-100"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteGrade(item.id)}
                          title="Delete grade"
                          className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs leading-5 text-slate-500">
        Note: This is a frontend preview using sample grading data. Changes are
        temporary until a backend API and database persistence are connected.
        Confirm your school's official grading policy before using grades for
        student results.
      </p>
    </div>
  );
}
