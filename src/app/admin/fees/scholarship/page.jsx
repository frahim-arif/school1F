"use client";

import Link from "next/link";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  GraduationCap,
  IndianRupee,
  Percent,
} from "lucide-react";

const scholarships = [
  {
    id: 1,
    name: "Merit Scholarship",
    type: "Percentage",
    value: "50%",
    students: 35,
    status: "Active",
  },
  {
    id: 2,
    name: "Poor Fund",
    type: "Fixed",
    value: "₹1000",
    students: 18,
    status: "Active",
  },
  {
    id: 3,
    name: "Staff Child",
    type: "Percentage",
    value: "25%",
    students: 12,
    status: "Active",
  },
  {
    id: 4,
    name: "Sports Scholarship",
    type: "Percentage",
    value: "30%",
    students: 9,
    status: "Inactive",
  },
];

export default function ScholarshipPage() {
  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-3xl font-black">
            Scholarship Management
          </h1>

          <p className="mt-2 text-slate-500">
            Manage all scholarships and fee concessions
          </p>

        </div>

        <Link
          href="/admin/fees/scholarship/add"
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          <Plus size={18}/>
          Add Scholarship
        </Link>

      </div>

      {/* Cards */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <Card
          title="Scholarships"
          value="4"
          icon={<GraduationCap size={28}/>}
          color="emerald"
        />

        <Card
          title="Students"
          value="74"
          icon={<GraduationCap size={28}/>}
          color="blue"
        />

        <Card
          title="Discount Given"
          value="₹2.8L"
          icon={<IndianRupee size={28}/>}
          color="amber"
        />

        <Card
          title="Average"
          value="32%"
          icon={<Percent size={28}/>}
          color="red"
        />

      </div>

      {/* Search */}

      <div className="rounded-3xl border bg-white p-5">

        <div className="relative max-w-md">

          <Search
            size={18}
            className="absolute left-4 top-3.5 text-slate-400"
          />

          <input
            placeholder="Search Scholarship..."
            className="w-full rounded-xl border py-3 pl-11 pr-4 outline-none focus:border-emerald-500"
          />

        </div>

      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-3xl border bg-white">

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="px-5 py-4 text-left">
                  Scholarship
                </th>

                <th className="px-5 py-4 text-center">
                  Type
                </th>

                <th className="px-5 py-4 text-center">
                  Value
                </th>

                <th className="px-5 py-4 text-center">
                  Students
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

              {scholarships.map((item)=>(
                <tr
                  key={item.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="px-5 py-4 font-bold">
                    {item.name}
                  </td>

                  <td className="text-center">
                    {item.type}
                  </td>

                  <td className="text-center font-bold text-emerald-600">
                    {item.value}
                  </td>

                  <td className="text-center">
                    {item.students}
                  </td>

                  <td className="text-center">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        item.status==="Active"
                        ?"bg-green-100 text-green-700"
                        :"bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status}
                    </span>

                  </td>

                  <td>

                    <div className="flex justify-center gap-2">

                      <Link
                        href={`/admin/fees/scholarship/assign/${item.id}`}
                        className="rounded-lg bg-green-100 p-2 text-green-600"
                      >
                        <Eye size={18}/>
                      </Link>

                      <Link
                        href={`/admin/fees/scholarship/edit/${item.id}`}
                        className="rounded-lg bg-blue-100 p-2 text-blue-600"
                      >
                        <Pencil size={18}/>
                      </Link>

                      <button className="rounded-lg bg-red-100 p-2 text-red-600">
                        <Trash2 size={18}/>
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

function Card({title,value,icon,color}){

const colors={
emerald:"bg-emerald-500",
blue:"bg-blue-500",
amber:"bg-amber-500",
red:"bg-red-500"
}

return(

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

)

}