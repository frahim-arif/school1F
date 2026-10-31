"use client";

import Link from "next/link";
import { Search, IndianRupee, Eye, Bell, Filter } from "lucide-react";

const pendingFees = [
  {
    id: 1,
    admissionNo: "SCH001",
    student: "Mohammad Ali",
    class: "Class 10",
    guardian: "Abdul Karim",
    mobile: "9876543210",
    totalFee: 30000,
    paid: 25000,
    due: 5000,
    lastDate: "15 Jul 2026",
  },
  {
    id: 2,
    admissionNo: "SCH002",
    student: "Rahul Sharma",
    class: "Class 9",
    guardian: "Rajesh Sharma",
    mobile: "9988776655",
    totalFee: 28000,
    paid: 18000,
    due: 10000,
    lastDate: "20 Jul 2026",
  },
  {
    id: 3,
    admissionNo: "SCH003",
    student: "Fatima Begum",
    class: "Class 8",
    guardian: "Nur Islam",
    mobile: "9123456789",
    totalFee: 25000,
    paid: 5000,
    due: 20000,
    lastDate: "10 Jul 2026",
  },
];

export default function PendingFeesPage() {
  const totalDue = pendingFees.reduce((sum, item) => sum + item.due, 0);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Pending Fees
          </h1>

          <p className="mt-2 text-slate-500">
            Students with outstanding fee balance
          </p>
        </div>

        <Link
          href="/admin/fees"
          className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          Fee Dashboard
        </Link>

      </div>

      {/* Summary */}

      <div className="grid gap-6 md:grid-cols-3">

        <SummaryCard
          title="Students Due"
          value={pendingFees.length}
          color="bg-red-500"
        />

        <SummaryCard
          title="Total Pending"
          value={`₹${totalDue.toLocaleString()}`}
          color="bg-amber-500"
        />

        <SummaryCard
          title="Collection Target"
          value="₹2,50,000"
          color="bg-emerald-500"
        />

      </div>

      {/* Filters */}

      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <div className="grid gap-4 md:grid-cols-4">

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-3.5 text-slate-400"
            />

            <input
              placeholder="Search Student"
              className="w-full rounded-xl border py-3 pl-10 pr-4 outline-none focus:border-emerald-500"
            />

          </div>

          <select className="rounded-xl border p-3">
            <option>All Classes</option>
            <option>Class 1</option>
            <option>Class 2</option>
            <option>Class 10</option>
          </select>

          <select className="rounded-xl border p-3">
            <option>All Months</option>
            <option>January</option>
            <option>February</option>
            <option>March</option>
          </select>

          <button className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-white">
            <Filter size={18} />
            Apply Filter
          </button>

        </div>

      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="px-5 py-4 text-left">Student</th>
                <th className="px-5 py-4 text-left">Class</th>
                <th className="px-5 py-4 text-left">Guardian</th>
                <th className="px-5 py-4 text-left">Total Fee</th>
                <th className="px-5 py-4 text-left">Paid</th>
                <th className="px-5 py-4 text-left">Due</th>
                <th className="px-5 py-4 text-left">Last Date</th>
                <th className="px-5 py-4 text-center">Actions</th>

              </tr>

            </thead>

            <tbody>

              {pendingFees.map((student) => (

                <tr
                  key={student.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="px-5 py-4">

                    <h4 className="font-bold">
                      {student.student}
                    </h4>

                    <p className="text-xs text-slate-500">
                      {student.admissionNo}
                    </p>

                  </td>

                  <td className="px-5 py-4">
                    {student.class}
                  </td>

                  <td className="px-5 py-4">

                    <div>

                      <h4>{student.guardian}</h4>

                      <p className="text-xs text-slate-500">
                        {student.mobile}
                      </p>

                    </div>

                  </td>

                  <td className="px-5 py-4 font-semibold">
                    ₹{student.totalFee.toLocaleString()}
                  </td>

                  <td className="px-5 py-4 text-green-600 font-bold">
                    ₹{student.paid.toLocaleString()}
                  </td>

                  <td className="px-5 py-4 text-red-600 font-black">
                    ₹{student.due.toLocaleString()}
                  </td>

                  <td className="px-5 py-4">
                    {student.lastDate}
                  </td>

                  <td className="px-5 py-4">

                    <div className="flex justify-center gap-2">

                      <Link
                        href={`/admin/fees/ledger/${student.id}`}
                        className="rounded-lg bg-blue-100 p-2 text-blue-600"
                      >
                        <Eye size={18} />
                      </Link>

                      <Link
                        href={`/admin/fees/collect?id=${student.id}`}
                        className="rounded-lg bg-emerald-100 p-2 text-emerald-600"
                      >
                        <IndianRupee size={18} />
                      </Link>

                      <button className="rounded-lg bg-amber-100 p-2 text-amber-600">
                        <Bell size={18} />
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

function SummaryCard({ title, value, color }) {
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

        <div className={`${color} rounded-2xl p-4`} />

      </div>

    </div>
  );
}