"use client";

import { useState } from "react";
import {
  Search,
  Download,
  Printer,
  Filter,
  GraduationCap,
  IndianRupee,
  Users,
  BadgePercent,
} from "lucide-react";

const reportData = [
  {
    id: 1,
    student: "Mohammad Ali",
    admissionNo: "SCH001",
    class: "Class 10",
    scholarship: "Merit Scholarship",
    type: "50%",
    amount: 15000,
    status: "Active",
  },
  {
    id: 2,
    student: "Rahul Sharma",
    admissionNo: "SCH002",
    class: "Class 9",
    scholarship: "Poor Fund",
    type: "₹1000",
    amount: 1000,
    status: "Active",
  },
  {
    id: 3,
    student: "Fatima Begum",
    admissionNo: "SCH003",
    class: "Class 8",
    scholarship: "Sports Scholarship",
    type: "30%",
    amount: 7500,
    status: "Expired",
  },
];

export default function ScholarshipReportsPage() {
  const [search, setSearch] = useState("");

  const filtered = reportData.filter((item) =>
    `${item.student} ${item.admissionNo} ${item.scholarship}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-3xl font-black">
            Scholarship Reports
          </h1>

          <p className="mt-2 text-slate-500">
            Scholarship summary & student reports
          </p>

        </div>

        <div className="flex gap-3">

          <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">

            <Printer size={18} />

            Print

          </button>

          <button className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white">

            <Download size={18} />

            Export Excel

          </button>

        </div>

      </div>

      {/* Summary */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <Card
          title="Scholarships"
          value="4"
          icon={<GraduationCap size={28} />}
          color="emerald"
        />

        <Card
          title="Students"
          value="74"
          icon={<Users size={28} />}
          color="blue"
        />

        <Card
          title="Amount Given"
          value="₹5.82L"
          icon={<IndianRupee size={28} />}
          color="amber"
        />

        <Card
          title="Average"
          value="28%"
          icon={<BadgePercent size={28} />}
          color="red"
        />

      </div>

      {/* Filters */}

      <div className="rounded-3xl border bg-white p-5">

        <div className="grid gap-4 lg:grid-cols-5">

          <div className="relative lg:col-span-2">

            <Search
              className="absolute left-3 top-3.5 text-slate-400"
              size={18}
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Student..."
              className="w-full rounded-xl border py-3 pl-10 pr-4"
            />

          </div>

          <select className="rounded-xl border p-3">
            <option>All Classes</option>
            <option>Class 8</option>
            <option>Class 9</option>
            <option>Class 10</option>
          </select>

          <select className="rounded-xl border p-3">
            <option>All Status</option>
            <option>Active</option>
            <option>Expired</option>
          </select>

          <button className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white">

            <Filter size={18} />

            Filter

          </button>

        </div>

      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="px-5 py-4 text-left">
                  Student
                </th>

                <th className="px-5 py-4">
                  Admission
                </th>

                <th className="px-5 py-4">
                  Class
                </th>

                <th className="px-5 py-4">
                  Scholarship
                </th>

                <th className="px-5 py-4">
                  Type
                </th>

                <th className="px-5 py-4">
                  Amount
                </th>

                <th className="px-5 py-4">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {filtered.map((item) => (

                <tr
                  key={item.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="px-5 py-4 font-semibold">
                    {item.student}
                  </td>

                  <td className="text-center">
                    {item.admissionNo}
                  </td>

                  <td className="text-center">
                    {item.class}
                  </td>

                  <td className="text-center">
                    {item.scholarship}
                  </td>

                  <td className="text-center font-bold text-blue-600">
                    {item.type}
                  </td>

                  <td className="text-center font-bold text-emerald-600">
                    ₹{item.amount.toLocaleString()}
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

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

function Card({ title, value, icon, color }) {

  const colors = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };

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

        <div className={`${colors[color]} rounded-2xl p-4 text-white`}>
          {icon}
        </div>

      </div>

    </div>
  );
}