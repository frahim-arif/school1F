"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Search,
  Check,
  Users,
} from "lucide-react";

const studentsData = [
  {
    id: 1,
    admissionNo: "SCH001",
    name: "Mohammad Ali",
    class: "Class 10",
    section: "A",
  },
  {
    id: 2,
    admissionNo: "SCH002",
    name: "Rahul Sharma",
    class: "Class 10",
    section: "A",
  },
  {
    id: 3,
    admissionNo: "SCH003",
    name: "Fatima Begum",
    class: "Class 9",
    section: "B",
  },
  {
    id: 4,
    admissionNo: "SCH004",
    name: "Imran Hussain",
    class: "Class 8",
    section: "A",
  },
  {
    id: 5,
    admissionNo: "SCH005",
    name: "Amina Khatun",
    class: "Class 10",
    section: "C",
  },
];

export default function AssignScholarshipPage() {
  const { id } = useParams();

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);

  const filtered = useMemo(() => {
    return studentsData.filter((student) =>
      `${student.name} ${student.admissionNo} ${student.class}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  const toggleStudent = (studentId) => {
    if (selected.includes(studentId)) {
      setSelected(selected.filter((id) => id !== studentId));
    } else {
      setSelected([...selected, studentId]);
    }
  };

  const selectAll = () => {
    setSelected(filtered.map((item) => item.id));
  };

  const clearAll = () => {
    setSelected([]);
  };

  const handleSave = () => {
    console.log({
      scholarshipId: id,
      students: selected,
    });

    alert("Scholarship Assigned Successfully");
  };

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-3xl font-black">
            Assign Scholarship
          </h1>

          <p className="mt-2 text-slate-500">
            Scholarship ID : {id}
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

      {/* Summary */}

      <div className="grid gap-5 md:grid-cols-3">

        <div className="rounded-3xl border bg-white p-6">

          <p className="text-slate-500">
            Total Students
          </p>

          <h2 className="mt-3 text-3xl font-black">
            {studentsData.length}
          </h2>

        </div>

        <div className="rounded-3xl border bg-white p-6">

          <p className="text-slate-500">
            Selected
          </p>

          <h2 className="mt-3 text-3xl font-black text-emerald-600">
            {selected.length}
          </h2>

        </div>

        <div className="rounded-3xl border bg-white p-6">

          <p className="text-slate-500">
            Scholarship
          </p>

          <h2 className="mt-3 text-2xl font-black">
            Merit Scholarship
          </h2>

        </div>

      </div>

      {/* Search */}

      <div className="rounded-3xl border bg-white p-5">

        <div className="flex flex-col gap-4 lg:flex-row">

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-3 top-3.5 text-slate-400"
            />

            <input
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              placeholder="Search Student..."
              className="w-full rounded-xl border py-3 pl-10 pr-4"
            />

          </div>

          <button
            onClick={selectAll}
            className="rounded-xl bg-blue-600 px-5 py-3 text-white"
          >
            Select All
          </button>

          <button
            onClick={clearAll}
            className="rounded-xl bg-red-600 px-5 py-3 text-white"
          >
            Clear
          </button>

        </div>

      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-3xl border bg-white">

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="px-5 py-4"></th>

                <th className="px-5 py-4 text-left">
                  Admission No
                </th>

                <th className="px-5 py-4 text-left">
                  Student
                </th>

                <th className="px-5 py-4">
                  Class
                </th>

                <th className="px-5 py-4">
                  Section
                </th>

              </tr>

            </thead>

            <tbody>

              {filtered.map((student)=>(

                <tr
                  key={student.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="px-5 py-4 text-center">

                    <input
                      type="checkbox"
                      checked={selected.includes(student.id)}
                      onChange={()=>toggleStudent(student.id)}
                      className="h-5 w-5"
                    />

                  </td>

                  <td className="font-bold">
                    {student.admissionNo}
                  </td>

                  <td>
                    {student.name}
                  </td>

                  <td className="text-center">
                    {student.class}
                  </td>

                  <td className="text-center">
                    {student.section}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* Save */}

      <div className="flex justify-end">

        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 font-bold text-white hover:bg-emerald-700"
        >

          <Save size={18}/>

          Assign Scholarship

        </button>

      </div>

    </div>
  );
}