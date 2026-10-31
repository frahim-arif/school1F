"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Percent,
  User,
} from "lucide-react";

const discounts = [
  {
    id: 1,
    name: "Sibling Discount",
    type: "Percentage",
    value: 10,
    appliesTo: "All Classes",
    validTill: "31 Mar 2027",
    status: "Active",
  },
  {
    id: 2,
    name: "Merit Scholarship",
    type: "Percentage",
    value: 25,
    appliesTo: "Class 9-10",
    validTill: "31 Mar 2027",
    status: "Active",
  },
  {
    id: 3,
    name: "Staff Child",
    type: "Fixed",
    value: 500,
    appliesTo: "All Classes",
    validTill: "31 Mar 2027",
    status: "Active",
  },
  {
    id: 4,
    name: "Special Case",
    type: "Fixed",
    value: 1000,
    appliesTo: "Student Specific",
    validTill: "30 Sep 2026",
    status: "Inactive",
  },
];

export default function DiscountPage() {
  const [data] = useState(discounts);

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <h1 className="text-3xl font-black">
            Discount Management
          </h1>

          <p className="mt-2 text-slate-500">
            Manage fee discounts & scholarships
          </p>

        </div>

        <button className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700">

          <Plus size={18} />

          Add Discount

        </button>

      </div>

      {/* Summary */}

      <div className="grid gap-5 md:grid-cols-4">

        <Summary title="Total Discounts" value="4" />

        <Summary title="Active" value="3" />

        <Summary title="Percentage" value="2" />

        <Summary title="Fixed" value="2" />

      </div>

      {/* Search */}

      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <div className="relative max-w-md">

          <Search
            size={18}
            className="absolute left-3 top-3.5 text-gray-400"
          />

          <input
            placeholder="Search Discount..."
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
                  Name
                </th>

                <th className="px-5 py-4 text-center">
                  Type
                </th>

                <th className="px-5 py-4 text-center">
                  Value
                </th>

                <th className="px-5 py-4 text-center">
                  Applies To
                </th>

                <th className="px-5 py-4 text-center">
                  Valid Till
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

              {data.map((item) => (

                <tr
                  key={item.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="rounded-xl bg-emerald-100 p-3">

                        <Percent className="text-emerald-700" />

                      </div>

                      <span className="font-bold">
                        {item.name}
                      </span>

                    </div>

                  </td>

                  <td className="text-center">
                    {item.type}
                  </td>

                  <td className="text-center font-bold">

                    {item.type === "Percentage"
                      ? `${item.value}%`
                      : `₹${item.value}`}

                  </td>

                  <td className="text-center">
                    {item.appliesTo}
                  </td>

                  <td className="text-center">
                    {item.validTill}
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

function Summary({ title, value }) {
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

          <User size={28} />

        </div>

      </div>

    </div>
  );
}