
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarClock,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  X,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const EMPTY_FORM = {
  classId: "",
  sectionId: "",
  subjectId: "",
  teacherId: "",
  day: "Monday",
  startTime: "09:00",
  endTime: "09:45",
  room: "",
};

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-cyan-600";

function getId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
}

function getName(value) {
  if (!value) return "—";
  if (typeof value === "string") return value;
  return (
    value.name ||
    value.className ||
    value.class_name ||
    value.subjectName ||
    value.subject_name ||
    value.fullName ||
    value.firstName ||
    value.title ||
    "—"
  );
}

function getList(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data?.data)) return data.data;

  return [];
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Request failed (${response.status})`);
  }

  return result;
}

export default function TimetablePage() {
  const [records, setRecords] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await apiRequest("/api/timetables");
      setRecords(
        getList(result, ["timetables", "data", "items"])
      );
    } catch (err) {
      setError(err.message || "Timetable load nahi hua.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOptions = useCallback(async () => {
    const endpoints = [
      ["/api/classes", setClasses, ["classes"]],
      ["/api/sections", setSections, ["sections"]],
      ["/api/subjects", setSubjects, ["subjects"]],
      ["/api/teachers", setTeachers, ["teachers"]],
    ];

    const results = await Promise.allSettled(
      endpoints.map(([url]) => apiRequest(url))
    );

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const [, setter, keys] = endpoints[index];
        setter(getList(result.value, keys));
      } else {
        console.error(
          `Dropdown load failed: ${endpoints[index][0]}`,
          result.reason
        );
      }
    });
  }, []);

  useEffect(() => {
    loadRecords();
    loadOptions();
  }, [loadRecords, loadOptions]);

  const filteredRecords = records.filter((item) => {
    const text = [
      getName(item.classId),
      getName(item.sectionId),
      getName(item.subjectId),
      getName(item.teacherId),
      item.day,
      item.room,
      item.startTime,
      item.endTime,
    ]
      .join(" ")
      .toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const availableSections = sections.filter((section) => {
    if (!form.classId) return true;

    const sectionClassId = getId(
      section.classId || section.class || section.class_id
    );

    return !sectionClassId || sectionClassId === form.classId;
  });

  function openAddForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setNotice("");
    setShowForm(true);
  }

  function openEditForm(item) {
    setEditingId(item._id || item.id);

    setForm({
      classId: getId(item.classId),
      sectionId: getId(item.sectionId),
      subjectId: getId(item.subjectId),
      teacherId: getId(item.teacherId),
      day: item.day || "Monday",
      startTime: item.startTime || "09:00",
      endTime: item.endTime || "09:45",
      room: item.room || "",
    });

    setError("");
    setNotice("");
    setShowForm(true);
  }

  function updateField(key, value) {
    setForm((previous) => {
      const next = { ...previous, [key]: value };

      if (key === "classId") {
        const selectedSection = sections.find(
          (section) => getId(section) === previous.sectionId
        );

        const selectedSectionClassId = getId(
          selectedSection?.classId ||
            selectedSection?.class ||
            selectedSection?.class_id
        );

        if (
          selectedSectionClassId &&
          selectedSectionClassId !== value
        ) {
          next.sectionId = "";
        }
      }

      return next;
    });
  }

  async function saveRecord(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    if (form.endTime <= form.startTime) {
      setError("End time, start time se baad hona chahiye.");
      setSaving(false);
      return;
    }

    const payload = {
      classId: form.classId,
      sectionId: form.sectionId,
      subjectId: form.subjectId,
      teacherId: form.teacherId,
      day: form.day,
      startTime: form.startTime,
      endTime: form.endTime,
      room: form.room.trim(),
    };

    try {
      const url = editingId
        ? `/api/timetables/${editingId}`
        : "/api/timetables";

      await apiRequest(url, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      setNotice(
        editingId
          ? "Timetable successfully updated."
          : "Timetable successfully created."
      );

      await loadRecords();
    } catch (err) {
      setError(err.message || "Timetable save nahi hua.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(id) {
    if (!window.confirm("Kya aap ye timetable entry delete karna chahte hain?")) {
      return;
    }

    setError("");
    setNotice("");

    try {
      await apiRequest(`/api/timetables/${id}`, {
        method: "DELETE",
      });

      setNotice("Timetable successfully deleted.");
      await loadRecords();
    } catch (err) {
      setError(err.message || "Timetable delete nahi hua.");
    }
  }

  function renderOptions(items, placeholder) {
    return (
      <>
        <option value="">{placeholder}</option>
        {items.map((item) => {
          const id = getId(item);

          if (!id) return null;

          return (
            <option key={id} value={id}>
              {getName(item)}
            </option>
          );
        })}
      </>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-7">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-cyan-700">
              <CalendarClock size={18} />
              Academics / Timetable
            </div>

            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Timetable Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Classes, subjects, teachers aur periods ka schedule manage karein.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                loadRecords();
                loadOptions();
              }}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              type="button"
              onClick={openAddForm}
              className="flex items-center gap-2 rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-800"
            >
              <Plus size={18} />
              Add Period
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {notice && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {notice}
          </div>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-800">
                Schedule Entries
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Total records: {filteredRecords.length}
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={17}
                className="absolute left-3 top-3 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search class, subject, teacher..."
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  {[
                    "Day",
                    "Class",
                    "Section",
                    "Subject",
                    "Teacher",
                    "Start",
                    "End",
                    "Room",
                    "Actions",
                  ].map((heading) => (
                    <th key={heading} className="px-4 py-3 font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                      Loading timetable...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                      Koi timetable entry nahi mili.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((item) => {
                    const id = item._id || item.id;

                    return (
                      <tr key={id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium">{item.day}</td>
                        <td className="px-4 py-3">{getName(item.classId)}</td>
                        <td className="px-4 py-3">{getName(item.sectionId)}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {getName(item.subjectId)}
                        </td>
                        <td className="px-4 py-3">{getName(item.teacherId)}</td>
                        <td className="px-4 py-3">{item.startTime}</td>
                        <td className="px-4 py-3">{item.endTime}</td>
                        <td className="px-4 py-3">{item.room || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => openEditForm(item)}
                              title="Edit"
                              className="rounded-md border border-slate-200 p-2 text-cyan-700"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteRecord(id)}
                              title="Delete"
                              className="rounded-md border border-red-200 p-2 text-red-600"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
            <div className="my-auto w-full max-w-2xl rounded-xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId ? "Edit Timetable Entry" : "Add Timetable Entry"}
                </h2>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={19} />
                </button>
              </div>

              <form onSubmit={saveRecord} className="space-y-4 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-sm font-medium text-slate-700">Class *</span>
                    <select
                      required
                      value={form.classId}
                      onChange={(event) => updateField("classId", event.target.value)}
                      className={inputClass}
                    >
                      {renderOptions(classes, "Select class")}
                    </select>
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-sm font-medium text-slate-700">Section *</span>
                    <select
                      required
                      value={form.sectionId}
                      onChange={(event) => updateField("sectionId", event.target.value)}
                      className={inputClass}
                    >
                      {renderOptions(availableSections, "Select section")}
                    </select>
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-sm font-medium text-slate-700">Subject *</span>
                    <select
                      required
                      value={form.subjectId}
                      onChange={(event) => updateField("subjectId", event.target.value)}
                      className={inputClass}
                    >
                      {renderOptions(subjects, "Select subject")}
                    </select>
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-sm font-medium text-slate-700">Teacher *</span>
                    <select
                      required
                      value={form.teacherId}
                      onChange={(event) => updateField("teacherId", event.target.value)}
                      className={inputClass}
                    >
                      {renderOptions(teachers, "Select teacher")}
                    </select>
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-sm font-medium text-slate-700">Day *</span>
                    <select
                      required
                      value={form.day}
                      onChange={(event) => updateField("day", event.target.value)}
                      className={inputClass}
                    >
                      {DAYS.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-sm font-medium text-slate-700">Room</span>
                    <input
                      value={form.room}
                      onChange={(event) => updateField("room", event.target.value)}
                      placeholder="e.g. Room 101"
                      className={inputClass}
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-sm font-medium text-slate-700">Start Time *</span>
                    <input
                      required
                      type="time"
                      value={form.startTime}
                      onChange={(event) => updateField("startTime", event.target.value)}
                      className={inputClass}
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-sm font-medium text-slate-700">End Time *</span>
                    <input
                      required
                      type="time"
                      min={form.startTime}
                      value={form.endTime}
                      onChange={(event) => updateField("endTime", event.target.value)}
                      className={inputClass}
                    />
                  </label>
                </div>

                {error && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Update Entry"
                        : "Save Entry"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
