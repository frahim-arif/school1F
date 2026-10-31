"use client";

import { useState } from "react";

import {
  Calendar,
  Download,
  Printer,
  FileSpreadsheet,
  Users,
  CheckCircle2,
  XCircle,
  Clock3,
  TrendingUp,
} from "lucide-react";

export default function AttendanceReportsPage() {

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  const [className, setClassName] =
    useState("All Classes");

  const summary = {
    totalStudents: 700,
    present: 662,
    absent: 21,
    late: 17,
    percentage: 94.5,
  };
    return (

    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-3xl font-black text-slate-800">
            Attendance Reports
          </h1>

          <p className="mt-2 text-slate-500">
            Attendance analytics and reports
          </p>

        </div>

        <div className="flex flex-wrap gap-3">

          <button className="flex items-center gap-2 rounded-xl border px-5 py-3 hover:bg-slate-100">

            <Printer size={18} />

            Print

          </button>

          <button className="flex items-center gap-2 rounded-xl border px-5 py-3 hover:bg-slate-100">

            <Download size={18} />

            Export PDF

          </button>

          <button className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-white hover:bg-emerald-700">

            <FileSpreadsheet size={18} />

            Export Excel

          </button>

        </div>

      </div>
            <div className="rounded-3xl border bg-white p-6 shadow-sm">

        <div className="grid gap-4 lg:grid-cols-4">

          <input
            type="date"
            value={fromDate}
            onChange={(e)=>setFromDate(e.target.value)}
            className="rounded-xl border p-3"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e)=>setToDate(e.target.value)}
            className="rounded-xl border p-3"
          />

          <select
            value={className}
            onChange={(e)=>setClassName(e.target.value)}
            className="rounded-xl border p-3"
          >

            <option>All Classes</option>
            <option>Class 10</option>
            <option>Class 9</option>
            <option>Class 8</option>

          </select>

          <button className="rounded-xl bg-blue-600 py-3 font-bold text-white">

            Generate Report

          </button>

        </div>

      </div>
            {/* Summary Cards */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">

        <ReportCard
          title="Total Students"
          value={summary.totalStudents}
          color="blue"
          icon={<Users size={24} />}
        />

        <ReportCard
          title="Present"
          value={summary.present}
          color="emerald"
          icon={<CheckCircle2 size={24} />}
        />

        <ReportCard
          title="Absent"
          value={summary.absent}
          color="red"
          icon={<XCircle size={24} />}
        />

        <ReportCard
          title="Late"
          value={summary.late}
          color="amber"
          icon={<Clock3 size={24} />}
        />

        <ReportCard
          title="Attendance %"
          value={`${summary.percentage}%`}
          color="purple"
          icon={<TrendingUp size={24} />}
        />
        

      </div>
      

      {/* Monthly Overview */}

      <div className="rounded-3xl border bg-white p-8 shadow-sm">

        <h2 className="mb-6 text-2xl font-black text-slate-800">
          Monthly Attendance Overview
        </h2>

        <div className="grid gap-6 md:grid-cols-4">

          <div className="rounded-2xl bg-emerald-50 p-6">

            <p className="text-slate-500">
              Working Days
            </p>

            <h3 className="mt-3 text-4xl font-black text-emerald-600">
              26
            </h3>

          </div>

          <div className="rounded-2xl bg-blue-50 p-6">

            <p className="text-slate-500">
              Average Attendance
            </p>

            <h3 className="mt-3 text-4xl font-black text-blue-600">
              94.5%
            </h3>

          </div>

          <div className="rounded-2xl bg-red-50 p-6">

            <p className="text-slate-500">
              Total Absent
            </p>

            <h3 className="mt-3 text-4xl font-black text-red-600">
              128
            </h3>

          </div>

          <div className="rounded-2xl bg-yellow-50 p-6">

            <p className="text-slate-500">
              Total Late
            </p>

            <h3 className="mt-3 text-4xl font-black text-yellow-600">
              43
            </h3>

          </div>

        </div>

      </div>
            {/* Class-wise Attendance Report */}

      <div className="rounded-3xl border bg-white shadow-sm">

        <div className="border-b p-6">

          <h2 className="text-2xl font-black text-slate-800">
            Class-wise Attendance Report
          </h2>

          <p className="mt-1 text-slate-500">
            Attendance summary of all classes
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="px-4 py-4 text-left">
                  Class
                </th>

                <th className="px-4 py-4 text-center">
                  Students
                </th>

                <th className="px-4 py-4 text-center">
                  Present
                </th>

                <th className="px-4 py-4 text-center">
                  Absent
                </th>

                <th className="px-4 py-4 text-center">
                  Late
                </th>

                <th className="px-4 py-4 text-center">
                  Attendance %
                </th>

              </tr>

            </thead>

            <tbody>

              {[
                {
                  class: "Class 10",
                  total: 120,
                  present: 116,
                  absent: 2,
                  late: 2,
                  percent: "96.6%",
                },
                {
                  class: "Class 9",
                  total: 110,
                  present: 104,
                  absent: 4,
                  late: 2,
                  percent: "94.5%",
                },
                {
                  class: "Class 8",
                  total: 98,
                  present: 90,
                  absent: 6,
                  late: 2,
                  percent: "91.8%",
                },
                {
                  class: "Class 7",
                  total: 102,
                  present: 98,
                  absent: 2,
                  late: 2,
                  percent: "96.1%",
                },
              ].map((item, index) => (

                <tr
                  key={index}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="px-4 py-4 font-semibold">
                    {item.class}
                  </td>

                  <td className="px-4 py-4 text-center">
                    {item.total}
                  </td>

                  <td className="px-4 py-4 text-center text-emerald-600 font-bold">
                    {item.present}
                  </td>

                  <td className="px-4 py-4 text-center text-red-600 font-bold">
                    {item.absent}
                  </td>

                  <td className="px-4 py-4 text-center text-yellow-600 font-bold">
                    {item.late}
                  </td>

                  <td className="px-4 py-4 text-center">

                    <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">

                      {item.percent}

                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>
            {/* Performance Summary */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Best Performing Classes */}

        <div className="rounded-3xl border bg-white p-6 shadow-sm">

          <h2 className="text-2xl font-black text-slate-800">
            🏆 Best Performing Classes
          </h2>

          <div className="mt-6 space-y-4">

            {[
              {
                class: "Class 10",
                percent: "96.6%",
              },
              {
                class: "Class 7",
                percent: "96.1%",
              },
              {
                class: "Class 9",
                percent: "94.5%",
              },
            ].map((item) => (

              <div
                key={item.class}
                className="flex items-center justify-between rounded-2xl border p-4"
              >

                <span className="font-semibold">
                  {item.class}
                </span>

                <span className="rounded-full bg-emerald-100 px-4 py-2 font-bold text-emerald-700">
                  {item.percent}
                </span>

              </div>

            ))}

          </div>

        </div>

        {/* Low Attendance */}

        <div className="rounded-3xl border bg-white p-6 shadow-sm">

          <h2 className="text-2xl font-black text-slate-800">
            ⚠ Low Attendance Alert
          </h2>

          <div className="mt-6 space-y-4">

            {[
              {
                class: "Class 8",
                percent: "91.8%",
              },
              {
                class: "Class 6",
                percent: "90.4%",
              },
              {
                class: "Class 5",
                percent: "89.9%",
              },
            ].map((item) => (

              <div
                key={item.class}
                className="flex items-center justify-between rounded-2xl border p-4"
              >

                <span className="font-semibold">
                  {item.class}
                </span>

                <span className="rounded-full bg-red-100 px-4 py-2 font-bold text-red-700">
                  {item.percent}
                </span>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* Quick Statistics */}

      <div className="rounded-3xl border bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white shadow-lg">

        <h2 className="text-2xl font-black">
          Attendance Insights
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-4">

          <div>

            <p className="text-white/80">
              Overall Attendance
            </p>

            <h3 className="mt-2 text-4xl font-black">
              94.5%
            </h3>

          </div>

          <div>

            <p className="text-white/80">
              Best Class
            </p>

            <h3 className="mt-2 text-4xl font-black">
              X-A
            </h3>

          </div>

          <div>

            <p className="text-white/80">
              Total Working Days
            </p>

            <h3 className="mt-2 text-4xl font-black">
              26
            </h3>

          </div>

          <div>

            <p className="text-white/80">
              Students
            </p>

            <h3 className="mt-2 text-4xl font-black">
              700
            </h3>

          </div>

        </div>

      </div>

    </div>

  );

  function ReportCard({
  title,
  value,
  icon,
  color,
}) {

  const colors = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    red: "bg-red-500",
    amber: "bg-yellow-500",
    purple: "bg-purple-500",
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

        <div
          className={`${colors[color]} rounded-2xl p-4 text-white`}
        >
          {icon}
        </div>

      </div>

    </div>

  );

}

}
      