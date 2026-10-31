"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function EditScholarshipPage() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    // Dummy API Data
    const scholarship = {
      id,
      name: "Merit Scholarship",
      type: "Percentage",
      value: "50",
      classes: ["Class 9", "Class 10"],
      startDate: "2026-04-01",
      endDate: "2027-03-31",
      maxStudents: "100",
      description:
        "Scholarship for meritorious students.",
      status: "Active",
    };

    setForm(scholarship);
    setLoading(false);

    // Backend Example
    // axios.get(`/api/scholarships/${id}`)
    // .then(res=>{
    //   setForm(res.data)
    //   setLoading(false)
    // })

  }, [id]);

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
        classes: form.classes.filter(
          (item) => item !== cls
        ),
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

    alert("Scholarship Updated Successfully");

    // axios.put(`/api/scholarships/${id}`,form)
  };

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center">

        <div className="text-xl font-bold">
          Loading...
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-black">
            Edit Scholarship
          </h1>

          <p className="mt-2 text-slate-500">
            Update scholarship information
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

      {/* Form */}

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
              className="w-full rounded-xl border p-3"
            />

          </div>

          <div>

            <label className="mb-2 block font-semibold">
              Type
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
              Value
            </label>

            <input
              type="number"
              name="value"
              value={form.value}
              onChange={handleChange}
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

        {/* Classes */}

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
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "hover:border-emerald-600"
                }`}
              >
                {cls}
              </button>

            ))}

          </div>

        </div>

        {/* Description */}

        <div className="mt-8">

          <label className="mb-2 block font-semibold">
            Description
          </label>

          <textarea
            rows={5}
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
          />

        </div>

        {/* Status */}

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

        {/* Buttons */}

        <div className="mt-10 flex gap-4">

          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700"
          >

            <Save size={18} />

            Update Scholarship

          </button>

          <Link
            href="/admin/fees/scholarship"
            className="rounded-xl border px-6 py-3 font-semibold hover:bg-slate-100"
          >
            Cancel
          </Link>

        </div>

      </form>

    </div>
  );
}