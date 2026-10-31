"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Save,
  GraduationCap,
} from "lucide-react";

export default function AddScholarshipPage() {
  const [form, setForm] = useState({
    name: "",
    type: "Percentage",
    value: "",
    classes: [],
    startDate: "",
    endDate: "",
    maxStudents: "",
    description: "",
    status: "Active",
  });

  const classList = [
    "Nursery",
    "LKG",
    "UKG",
    "Class 1",
    "Class 2",
    "Class 3",
    "Class 4",
    "Class 5",
    "Class 6",
    "Class 7",
    "Class 8",
    "Class 9",
    "Class 10",
    "Class 11",
    "Class 12",
  ];

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const toggleClass = (cls) => {
    if (form.classes.includes(cls)) {
      setForm({
        ...form,
        classes: form.classes.filter((c) => c !== cls),
      });
    } else {
      setForm({
        ...form,
        classes: [...form.classes, cls],
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(form);

    alert("Scholarship Saved");
  };

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-black">
            Add Scholarship
          </h1>

          <p className="mt-2 text-slate-500">
            Create a new scholarship scheme
          </p>

        </div>

        <Link
          href="/admin/fees/scholarship"
          className="flex items-center gap-2 rounded-xl border px-5 py-3 hover:bg-slate-100"
        >
          <ArrowLeft size={18} />
          Back
        </Link>

      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border bg-white p-8 shadow-sm"
      >

        <div className="grid gap-6 md:grid-cols-2">

          <div>

            <label className="mb-2 block font-semibold">
              Scholarship Name
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Merit Scholarship"
              className="w-full rounded-xl border p-3"
            />

          </div>

          <div>

            <label className="mb-2 block font-semibold">
              Scholarship Type
            </label>

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full rounded-xl border p-3"
            >

              <option>Percentage</option>

              <option>Fixed</option>

            </select>

          </div>

          <div>

            <label className="mb-2 block font-semibold">
              Discount Value
            </label>

            <input
              type="number"
              name="value"
              value={form.value}
              onChange={handleChange}
              placeholder="25"
              className="w-full rounded-xl border p-3"
            />

          </div>

          <div>

            <label className="mb-2 block font-semibold">
              Maximum Students
            </label>

            <input
              type="number"
              name="maxStudents"
              value={form.maxStudents}
              onChange={handleChange}
              placeholder="100"
              className="w-full rounded-xl border p-3"
            />

          </div>

          <div>

            <label className="mb-2 block font-semibold">
              Start Date
            </label>

            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="w-full rounded-xl border p-3"
            />

          </div>

          <div>

            <label className="mb-2 block font-semibold">
              End Date
            </label>

            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className="w-full rounded-xl border p-3"
            />

          </div>

        </div>

        <div className="mt-8">

          <label className="mb-3 block font-semibold">
            Applicable Classes
          </label>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">

            {classList.map((cls) => (

              <button
                key={cls}
                type="button"
                onClick={() => toggleClass(cls)}
                className={`rounded-xl border px-4 py-3 font-semibold transition ${
                  form.classes.includes(cls)
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "hover:border-emerald-500"
                }`}
              >
                {cls}
              </button>

            ))}

          </div>

        </div>

        <div className="mt-8">

          <label className="mb-2 block font-semibold">
            Description
          </label>

          <textarea
            rows="5"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Write scholarship details..."
            className="w-full rounded-xl border p-3"
          />

        </div>

        <div className="mt-8">

          <label className="mb-2 block font-semibold">
            Status
          </label>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
          >

            <option>Active</option>

            <option>Inactive</option>

          </select>

        </div>

        <div className="mt-10 flex gap-4">

          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700"
          >
            <Save size={18} />
            Save Scholarship
          </button>

          <button
            type="reset"
            className="rounded-xl border px-6 py-3 font-semibold hover:bg-slate-100"
          >
            Reset
          </button>

        </div>

      </form>
    </div>
  );
}