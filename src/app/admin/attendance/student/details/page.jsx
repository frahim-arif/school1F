
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search, RefreshCw, UserRound, Eye, Phone, Mail,
  GraduationCap, Users, AlertCircle
} from "lucide-react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com").replace(/\/+$/, "");
const API_ROOT = API_BASE.endsWith("/api") ? API_BASE : `${API_BASE}/api`;

export default function StudentDetailsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadStudents() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_ROOT}/students`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Students load nahi hue.");
      setStudents(Array.isArray(data.students) ? data.students : []);
    } catch (err) {
      setError(err.message || "Error loading students.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadStudents(); }, []);

  const classes = useMemo(
    () => [...new Set(students.map(s => s.className).filter(Boolean))].sort(),
    [students]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter(s => {
      const name = `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase();
      const matchesSearch = !q ||
        name.includes(q) ||
        String(s.admissionNo || "").toLowerCase().includes(q) ||
        String(s.phone || "").includes(q);
      return matchesSearch && (!classFilter || s.className === classFilter);
    });
  }, [students, search, classFilter]);

  return (
    <div className="min-h-screen space-y-5 bg-slate-50 p-4 text-slate-800 sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <GraduationCap size={18} /> Student Management
          </p>
          <h1 className="text-2xl font-bold sm:text-3xl">Student Details</h1>
          <p className="mt-1 text-sm text-slate-500">Student records aur personal details dekhein.</p>
        </div>
        <button onClick={loadStudents} disabled={loading}
          className="inline-flex items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""}/> Refresh
        </button>
      </div>

      {error && <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="mr-2 inline" size={17}/>{error}</div>}

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Total Students" value={students.length} icon={<Users size={20}/>}/>
        <Stat label="Active Students" value={students.filter(s => s.status === "Active").length} icon={<UserRound size={20}/>}/>
        <Stat label="Classes" value={classes.length} icon={<GraduationCap size={20}/>}/>
      </div>

      <section className="border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-3 border-b border-slate-200 p-4 sm:grid-cols-2">
          <div className="relative">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, admission no. or phone"
              className="w-full border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600"/>
          </div>
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
            className="border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600">
            <option value="">All Classes</option>
            {classes.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Admission No.</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(s => (
                <tr key={s._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold">{s.firstName} {s.lastName}</td>
                  <td className="px-4 py-3">{s.admissionNo || "-"}</td>
                  <td className="px-4 py-3">{s.className} / {s.section}</td>
                  <td className="px-4 py-3">{s.phone || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold ${s.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{s.status || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(s)}
                      className="inline-flex items-center gap-1 border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-100">
                      <Eye size={14}/> View
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">No students found.</td></tr>}
              {loading && <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">Loading students...</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold">{selected.firstName} {selected.lastName}</h2>
                <p className="text-sm text-slate-500">Admission No: {selected.admissionNo}</p>
              </div>
              <button onClick={() => setSelected(null)} className="border px-3 py-1.5 text-sm">Close</button>
            </div>

            {selected.photo && <img src={selected.photo} alt="Student" className="mt-4 h-24 w-24 border object-cover"/>}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Detail label="Roll Number" value={selected.rollNo}/>
              <Detail label="Class / Section" value={`${selected.className || "-"} / ${selected.section || "-"}`}/>
              <Detail label="Session" value={selected.session}/>
              <Detail label="Date of Birth" value={selected.dob ? new Date(selected.dob).toLocaleDateString() : "-"}/>
              <Detail label="Gender" value={selected.gender}/>
              <Detail label="Blood Group" value={selected.bloodGroup}/>
              <Detail label="Father Name" value={selected.fatherName}/>
              <Detail label="Mother Name" value={selected.motherName}/>
              <Detail label="Phone" value={selected.phone}/>
              <Detail label="Email" value={selected.email}/>
              <Detail label="Aadhaar" value={selected.aadhaar}/>
              <Detail label="Status" value={selected.status}/>
              <div className="sm:col-span-2"><Detail label="Address" value={selected.address}/></div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={`/admin/attendance/student/${selected._id}`} className="bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white">Attendance History</Link>
              <Link href={`/admin/students/edit/${selected._id}`} className="border border-slate-200 px-4 py-2.5 text-sm font-semibold">Edit Student</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

