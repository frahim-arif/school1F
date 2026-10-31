"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";

const fineRules = [
  {
    id: 1,
    title: "Late Fee (1-7 Days)",
    type: "Daily",
    amount: 20,
    maxFine: 200,
    status: "Active",
  },
  {
    id: 2,
    title: "Late Fee (8-15 Days)",
    type: "Daily",
    amount: 40,
    maxFine: 500,
    status: "Active",
  },
  {
    id: 3,
    title: "Lost Library Book",
    type: "Fixed",
    amount: 500,
    maxFine: 500,
    status: "Active",
  },
];

export default function FineManagementPage() {
  const [rules] = useState(fineRules);

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Fine Management
          </h1>

          <p className="mt-2 text-slate-500">
            Configure late fees and penalties
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700">
          <Plus size={18} />
          Add Fine Rule
        </button>

      </div>

      {/* Summary */}

      <div className="grid gap-5 md:grid-cols-4">

        <Summary title="Rules" value="3" />
        <Summary title="Active" value="3" />
        <Summary title="Collected" value="₹18,500" />
        <Summary title="Waived" value="₹2,300" />

      </div>

      {/* Search */}

      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <div className="relative max-w-md">

          <Search
            size={18}
            className="absolute left-3 top-3.5 text-gray-400"
          />

          <input
            placeholder="Search Fine Rule..."
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

                <th className="px-5 py-4 text-left">Rule</th>
                <th className="px-5 py-4 text-center">Type</th>
                <th className="px-5 py-4 text-center">Fine</th>
                <th className="px-5 py-4 text-center">Maximum</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-center">Action</th>

              </tr>

            </thead>

            <tbody>

              {rules.map((item) => (

                <tr
                  key={item.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="rounded-xl bg-red-100 p-3">

                        <AlertTriangle className="text-red-600" />

                      </div>

                      <span className="font-bold">
                        {item.title}
                      </span>

                    </div>

                  </td>

                  <td className="text-center">
                    {item.type}
                  </td>

                  <td className="text-center font-bold">
                    ₹{item.amount}
                  </td>

                  <td className="text-center">
                    ₹{item.maxFine}
                  </td>

                  <td className="text-center">

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
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

      <p className="text-slate-500">
        {title}
      </p>

      <h2 className="mt-3 text-3xl font-black">
        {value}
      </h2>

    </div>
  );
}