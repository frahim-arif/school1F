"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Tag,
  IndianRupee,
} from "lucide-react";

const categoriesData = [
  {
    id: 1,
    name: "Admission Fee",
    code: "ADM",
    amount: 10000,
    frequency: "One Time",
    status: "Active",
  },
  {
    id: 2,
    name: "Monthly Tuition Fee",
    code: "TUI",
    amount: 2500,
    frequency: "Monthly",
    status: "Active",
  },
  {
    id: 3,
    name: "Exam Fee",
    code: "EXM",
    amount: 1200,
    frequency: "Quarterly",
    status: "Active",
  },
  {
    id: 4,
    name: "Transport Fee",
    code: "TRN",
    amount: 1500,
    frequency: "Monthly",
    status: "Active",
  },
  {
    id: 5,
    name: "Library Fee",
    code: "LIB",
    amount: 300,
    frequency: "Yearly",
    status: "Inactive",
  },
];

export default function FeeCategoriesPage() {
  const [categories] = useState(categoriesData);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Fee Categories
          </h1>

          <p className="mt-2 text-slate-500">
            Create and manage fee heads
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700">
          <Plus size={18} />
          Add Category
        </button>

      </div>

      {/* Summary */}
      <div className="grid gap-6 md:grid-cols-4">

        <Card title="Total Categories" value="5" />

        <Card title="Active" value="4" />

        <Card title="Inactive" value="1" />

        <Card title="Monthly Heads" value="2" />

      </div>

      {/* Search */}

      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <div className="relative max-w-md">

          <Search
            size={18}
            className="absolute left-3 top-3.5 text-slate-400"
          />

          <input
            placeholder="Search Category..."
            className="w-full rounded-xl border py-3 pl-10 pr-4 outline-none focus:border-emerald-500"
          />

        </div>

      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="px-5 py-4 text-left">
                  Category
                </th>

                <th className="px-5 py-4 text-center">
                  Code
                </th>

                <th className="px-5 py-4 text-center">
                  Amount
                </th>

                <th className="px-5 py-4 text-center">
                  Frequency
                </th>

                <th className="px-5 py-4 text-center">
                  Status
                </th>

                <th className="px-5 py-4 text-center">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {categories.map((item) => (

                <tr
                  key={item.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="rounded-xl bg-emerald-100 p-3">

                        <Tag
                          size={20}
                          className="text-emerald-600"
                        />

                      </div>

                      <div>

                        <h3 className="font-bold">
                          {item.name}
                        </h3>

                      </div>

                    </div>

                  </td>

                  <td className="text-center font-semibold">
                    {item.code}
                  </td>

                  <td className="text-center font-bold text-emerald-600">
                    ₹{item.amount}
                  </td>

                  <td className="text-center">
                    {item.frequency}
                  </td>

                  <td className="text-center">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        item.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status}
                    </span>

                  </td>

                  <td>

                    <div className="flex justify-center gap-2">

                      <button className="rounded-lg bg-blue-100 p-2 text-blue-600">
                        <Pencil size={18} />
                      </button>

                      <button className="rounded-lg bg-red-100 p-2 text-red-600">
                        <Trash2 size={18} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-slate-500">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-black">
            {value}
          </h2>

        </div>

        <div className="rounded-2xl bg-emerald-500 p-4 text-white">

          <IndianRupee size={28} />

        </div>

      </div>

    </div>
  );
}