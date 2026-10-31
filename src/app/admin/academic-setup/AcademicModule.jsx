
"use client";

import { useState } from "react";
import { Plus, Search, Pencil, Trash2, X, Download } from "lucide-react";

const modules = {
  classTimetable: {
    title: "Class Timetable",
    subtitle: "View and manage weekly schedules by class and section.",
    fields: [
      ["className", "Class", "Class 10"],
      ["section", "Section", "A"],
      ["day", "Day", "Monday"],
      ["startTime", "Start time", "09:00"],
      ["endTime", "End time", "09:45"],
      ["subject", "Subject", "Mathematics"],
      ["teacher", "Teacher", "Teacher name"],
      ["room", "Room", "Room 101"],
    ],
    columns: ["className", "section", "day", "startTime", "endTime", "subject", "teacher", "room"],
  },
  teacherTimetable: {
    title: "Teacher Timetable",
    subtitle: "Manage teacher schedules and period assignments.",
    fields: [
      ["teacher", "Teacher", "Teacher name"],
      ["day", "Day", "Monday"],
      ["startTime", "Start time", "09:00"],
      ["endTime", "End time", "09:45"],
      ["className", "Class", "Class 10"],
      ["section", "Section", "A"],
      ["subject", "Subject", "Mathematics"],
      ["room", "Room", "Room 101"],
    ],
    columns: ["teacher", "day", "startTime", "endTime", "className", "section", "subject", "room"],
  },
  calendar: {
    title: "Academic Calendar",
    subtitle: "Manage holidays, examinations, events and school activities.",
    fields: [
      ["title", "Event title", "Annual examination"],
      ["date", "Date", "2026-11-15"],
      ["type", "Event type", "Exam / Holiday / Event"],
      ["description", "Description", "Event details"],
    ],
    columns: ["title", "date", "type", "description"],
  },
  syllabus: {
    title: "Syllabus Management",
    subtitle: "Track subject chapters and syllabus completion.",
    fields: [
      ["className", "Class", "Class 10"],
      ["subject", "Subject", "Mathematics"],
      ["chapter", "Chapter / Unit", "Chapter 1"],
      ["teacher", "Assigned teacher", "Teacher name"],
      ["status", "Status", "Not Started / In Progress / Completed"],
      ["completionDate", "Completion date", "2026-11-15"],
    ],
    columns: ["className", "subject", "chapter", "teacher", "status", "completionDate"],
  },
};

const initialData = {
  classTimetable: [],
  teacherTimetable: [],
  calendar: [],
  syllabus: [],
};

export default function AcademicModule({ type }) {
  const config = modules[type];
  const [records, setRecords] = useState(initialData[type] || []);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(-1);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  if (!config) return <div className="p-8">Module not found.</div>;

  const filtered = records.filter((record) =>
    Object.values(record).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setForm({});
    setEditing(-1);
    setShowForm(true);
  }

  function openEdit(record, index) {
    setForm({ ...record });
    setEditing(index);
    setShowForm(true);
  }

  function save(event) {
    event.preventDefault();
    if (editing >= 0) {
      setRecords((old) => old.map((item, index) => index === editing ? form : item));
    } else {
      setRecords((old) => [...old, { ...form, _key: Date.now() }]);
    }
    setShowForm(false);
    setForm({});
  }

  function remove(index) {
    if (window.confirm("Delete this record?")) {
      setRecords((old) => old.filter((_, i) => i !== index));
    }
  }

  function exportCSV() {
    const csv = [
      config.columns.join(","),
      ...filtered.map((record) =>
        config.columns.map((key) =>
          `"${String(record[key] || "").replace(/"/g, '""')}"`
        ).join(",")
      ),
    ].join("\n");

    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${type}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-cyan-600";

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-7">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-medium text-cyan-700">Academics / Management</p>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{config.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{config.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={exportCSV} className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold">
              <Download size={16} /> Export CSV
            </button>
            <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white">
              <Plus size={18} /> Add Record
            </button>
          </div>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold text-slate-800">All Records</h2>
              <p className="mt-1 text-xs text-slate-500">{filtered.length} records</p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search size={17} className="absolute left-3 top-3 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search records..."
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  {config.columns.map((key) => (
                    <th key={key} className="px-4 py-3">{key.replace(/([A-Z])/g, " $1")}</th>
                  ))}
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={config.columns.length + 1} className="px-4 py-12 text-center text-slate-500">No records yet. Click Add Record to get started.</td></tr>
                ) : filtered.map((record) => {
                  const index = records.indexOf(record);
                  return (
                    <tr key={record._key || index} className="hover:bg-slate-50">
                      {config.columns.map((key) => (
                        <td key={key} className="px-4 py-3 text-slate-700">{record[key] || "—"}</td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(record, index)} className="rounded-md border p-2 text-cyan-700" title="Edit"><Pencil size={15} /></button>
                          <button onClick={() => remove(index)} className="rounded-md border p-2 text-red-600" title="Delete"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
            <div className="my-auto w-full max-w-2xl rounded-xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b p-5">
                <h2 className="font-bold">{editing >= 0 ? "Edit Record" : "Add Record"}</h2>
                <button onClick={() => setShowForm(false)} className="rounded-md p-2 hover:bg-slate-100"><X size={19} /></button>
              </div>
              <form onSubmit={save} className="space-y-4 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  {config.fields.map(([key, label, placeholder]) => (
                    <label key={key} className="space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">{label} *</span>
                      {key === "day" ? (
                        <select required value={form[key] || "Monday"} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={inputClass}>
                          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => <option key={day}>{day}</option>)}
                        </select>
                      ) : key === "type" ? (
                        <select required value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={inputClass}>
                          <option value="">Select type</option>
                          {["Exam", "Holiday", "Event", "Meeting", "Activity"].map((item) => <option key={item}>{item}</option>)}
                        </select>
                      ) : key === "status" ? (
                        <select required value={form[key] || "Not Started"} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={inputClass}>
                          {["Not Started", "In Progress", "Completed"].map((item) => <option key={item}>{item}</option>)}
                        </select>
                      ) : key.toLowerCase().includes("date") ? (
                        <input required type="date" value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={inputClass} />
                      ) : key.toLowerCase().includes("time") ? (
                        <input required type="time" value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={inputClass} />
                      ) : key === "description" ? (
                        <textarea required rows={3} value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} className={inputClass} />
                      ) : (
                        <input required value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} className={inputClass} />
                      )}
                    </label>
                  ))}
                </div>
                <div className="flex justify-end gap-3 border-t pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2.5 text-sm font-semibold">Cancel</button>
                  <button type="submit" className="rounded-lg bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white">{editing >= 0 ? "Update Record" : "Save Record"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
