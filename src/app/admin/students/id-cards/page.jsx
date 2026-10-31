"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Printer,
  Users,
  CheckSquare,
  Square,
  CreditCard,
  RefreshCw,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/+$/, "");

const API_ROOT = API_BASE.endsWith("/api")
  ? API_BASE
  : `${API_BASE}/api`;

const SCHOOL = {
  name: "ADARSHA MARKAZ ACADEMY",
  address: "Laharighat, Morigaon, Assam - 782127",
  established: "Estd. 2014",
  affiliation: "Affiliated to Markazul Ma'arif, Hojai",
};

export default function StudentIDCardsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [sessionFilter, setSessionFilter] = useState("All");
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStudents = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_ROOT}/students`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Students load nahi hue.");
      }

      const list = Array.isArray(data)
        ? data
        : data.students || data.data?.students || data.data || [];

      if (!Array.isArray(list)) {
        throw new Error("Students API ka response format sahi nahi hai.");
      }

      setStudents(list);
    } catch (err) {
      setError(err.message || "Students load karne mein error aaya.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const classes = useMemo(
    () => [
      ...new Set(
        students.map((s) => s.className).filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    [students]
  );

  const sessions = useMemo(
    () => [...new Set(students.map((s) => s.session).filter(Boolean))].sort(),
    [students]
  );

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return students.filter((student) => {
      const fullName =
        `${student.firstName || ""} ${student.lastName || ""}`.trim();

      const matchesSearch =
        !term ||
        fullName.toLowerCase().includes(term) ||
        String(student.admissionNo || "").toLowerCase().includes(term) ||
        String(student.rollNo ?? "").toLowerCase().includes(term) ||
        String(student.fatherName || "").toLowerCase().includes(term);

      const matchesClass =
        classFilter === "All" || student.className === classFilter;

      const matchesSession =
        sessionFilter === "All" || student.session === sessionFilter;

      return matchesSearch && matchesClass && matchesSession;
    });
  }, [students, search, classFilter, sessionFilter]);

  const toggleStudent = (id) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const toggleAll = () => {
    const visibleIds = filteredStudents.map((s) => s._id);
    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selected.includes(id));

    setSelected((current) =>
      allSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : [...new Set([...current, ...visibleIds])]
    );
  };

  const selectedStudents = students.filter((student) =>
    selected.includes(student._id)
  );

  const printCards = () => {
    if (!selectedStudents.length) {
      setError("Print karne ke liye kam se kam ek student select karein.");
      return;
    }

    setError("");
    window.print();
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6">
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 8mm;
        }

        @media print {
          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden;
          }

          #student-id-print,
          #student-id-print * {
            visibility: visible;
          }

          #student-id-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .id-card-grid {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8mm 6mm !important;
          }

          .student-id-card {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <section className="no-print mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
            Student Management
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Student ID Cards
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Students select karein aur unke ID cards print karein.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadStudents}
            disabled={loading}
            className="flex items-center justify-center gap-2 border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={printCards}
            disabled={!selectedStudents.length}
            className="flex items-center justify-center gap-2 bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Printer size={17} />
            Print ({selectedStudents.length})
          </button>
        </div>
      </section>

      <section className="no-print mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={<Users size={20} />}
          label="Total Students"
          value={students.length}
        />
        <StatCard
          icon={<CreditCard size={20} />}
          label="Filtered Students"
          value={filteredStudents.length}
        />
        <StatCard
          icon={<CheckSquare size={20} />}
          label="Selected for Print"
          value={selectedStudents.length}
        />
      </section>

      <section className="no-print mb-5 border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, admission no., roll no. search..."
              className="w-full border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-700"
            />
          </div>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
          >
            <option value="All">All Classes</option>
            {classes.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
            className="border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
          >
            <option value="All">All Sessions</option>
            {sessions.map((session) => (
              <option key={session} value={session}>
                {session}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={toggleAll}
            disabled={!filteredStudents.length}
            className="flex items-center gap-2 text-sm font-semibold text-emerald-800 disabled:opacity-40"
          >
            {filteredStudents.length > 0 &&
            filteredStudents.every((s) => selected.includes(s._id)) ? (
              <CheckSquare size={18} />
            ) : (
              <Square size={18} />
            )}
            Select all filtered students
          </button>

          <button
            type="button"
            onClick={() => setSelected([])}
            className="text-sm font-semibold text-slate-500 hover:text-slate-900"
          >
            Clear selection
          </button>
        </div>
      </section>

      {error && (
        <div className="no-print mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="no-print border border-slate-200 bg-white p-10 text-center text-slate-500">
          Students load ho rahe hain...
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="no-print border border-slate-200 bg-white p-10 text-center text-slate-500">
          Koi student nahi mila.
        </div>
      ) : (
        <section className="no-print overflow-hidden border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3">Select</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Admission No.</th>
                  <th className="px-4 py-3">Class / Section</th>
                  <th className="px-4 py-3">Roll No.</th>
                  <th className="px-4 py-3">Session</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const isSelected = selected.includes(student._id);

                  return (
                    <tr
                      key={student._id}
                      className={isSelected ? "bg-emerald-50/60" : "hover:bg-slate-50"}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleStudent(student._id)}
                          aria-label={`Select ${student.firstName || "student"}`}
                          className="h-4 w-4 accent-emerald-800"
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {student.firstName} {student.lastName || ""}
                      </td>
                      <td className="px-4 py-3">{student.admissionNo || "-"}</td>
                      <td className="px-4 py-3">
                        {student.className || "-"} / {student.section || "-"}
                      </td>
                      <td className="px-4 py-3">{student.rollNo ?? "-"}</td>
                      <td className="px-4 py-3">{student.session || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section id="student-id-print" className="mt-6">
        <div className="id-card-grid grid grid-cols-1 gap-5 sm:grid-cols-2">
          {selectedStudents.map((student) => (
            <article
              key={student._id}
              className="student-id-card relative mx-auto w-full max-w-[360px] overflow-hidden border-2 border-emerald-900 bg-white shadow-md"
            >
              <header className="bg-emerald-950 px-3 py-3 text-center text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">
                  {SCHOOL.established}
                </p>
                <h2 className="mt-1 text-sm font-extrabold leading-tight">
                  {SCHOOL.name}
                </h2>
                <p className="mt-1 text-[9px]">{SCHOOL.address}</p>
                <p className="mt-1 text-[9px] text-amber-200">
                  {SCHOOL.affiliation}
                </p>
              </header>

              <div className="border-b-2 border-amber-500 bg-amber-50 py-1 text-center text-[10px] font-extrabold uppercase tracking-[0.22em] text-emerald-950">
                Student Identity Card
              </div>

              <div className="flex gap-3 p-3">
                <div className="flex h-[100px] w-[78px] shrink-0 items-center justify-center overflow-hidden border border-slate-300 bg-slate-100 text-center text-[10px] text-slate-500">
                  {student.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={student.photo}
                      alt={`${student.firstName || "Student"} photo`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "Student Photo"
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1.5 text-[10px] leading-snug">
                  <InfoRow
                    label="Name"
                    value={`${student.firstName || ""} ${student.lastName || ""}`.trim()}
                  />
                  <InfoRow label="Admission No." value={student.admissionNo} />
                  <InfoRow label="Class" value={student.className} />
                  <InfoRow label="Section" value={student.section} />
                  <InfoRow label="Roll No." value={student.rollNo} />
                  <InfoRow label="Session" value={student.session} />
                  <InfoRow label="Father" value={student.fatherName} />
                  <InfoRow label="Phone" value={student.phone} />
                </div>
              </div>

              <footer className="flex items-end justify-between border-t border-dashed border-slate-300 px-3 py-2">
                <div className="text-[9px] text-slate-500">
                  <p>Keep this card with you.</p>
                  <p>Return if found.</p>
                </div>
                <div className="border-t border-slate-500 px-2 pt-1 text-center text-[9px] font-semibold">
                  Principal&apos;s Signature
                </div>
              </footer>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 border border-slate-200 bg-white p-4">
      <div className="flex h-10 w-10 items-center justify-center bg-emerald-50 text-emerald-800">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-xl font-extrabold">{value}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <p className="flex gap-1">
      <span className="w-[76px] shrink-0 font-bold text-slate-700">
        {label}
      </span>
      <span className="min-w-0 break-words text-slate-600">
        {value === undefined || value === null || value === "" ? "-" : value}
      </span>
    </p>
  );
}
