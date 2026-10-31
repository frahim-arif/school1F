
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Search,
  Clock3,
  BookOpen,
  Plus,
  X,
  RefreshCw,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";
import {
  examRequest,
  schoolRequest,
  extractList,
} from "@/lib/examApi";

const EMPTY_FORM = {
  subjectId: "",
  date: "",
  startTime: "09:00",
  endTime: "12:00",
  room: "",
  totalMarks: "100",
  passingMarks: "33",
};

export default function ExamSchedulePage() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const [initialLoading, setInitialLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const field =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  const selectedExam = exams.find((exam) => exam._id === examId);

  const loadInitial = useCallback(async () => {
    setInitialLoading(true);
    setError("");

    try {
      const [examData, classData] = await Promise.all([
        examRequest("/"),
        schoolRequest("classes"),
      ]);

      const examList = extractList(examData, ["exams"]);
      const classList = extractList(classData, ["classes"]);

      setExams(examList);
      setClasses(classList);

      setExamId((current) =>
        current && examList.some((exam) => exam._id === current)
          ? current
          : examList[0]?._id || ""
      );

      setClassId((current) =>
        current && classList.some((item) => item._id === current)
          ? current
          : classList[0]?._id || ""
      );
    } catch (e) {
      setError(e.message || "Exams aur classes load nahi huin.");
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    if (!classId) {
      setSubjects([]);
      setForm((current) => ({ ...current, subjectId: "" }));
      return;
    }

    let active = true;

    schoolRequest(`subjects?classId=${encodeURIComponent(classId)}`)
      .then((data) => {
        if (!active) return;

        const list = extractList(data, ["subjects"]);
        setSubjects(list);

        setForm((current) => ({
          ...current,
          subjectId: list.some(
            (subject) => subject._id === current.subjectId
          )
            ? current.subjectId
            : list[0]?._id || "",
        }));
      })
      .catch((e) => {
        if (active) {
          setSubjects([]);
          setError(e.message || "Subjects load nahi hue.");
        }
      });

    return () => {
      active = false;
    };
  }, [classId]);

  const loadSchedules = useCallback(async () => {
    if (!examId) {
      setSchedules([]);
      return;
    }

    setScheduleLoading(true);
    setError("");

    try {
      const data = await examRequest(`/${examId}/schedule`);
      const list = extractList(data, ["schedules", "schedule"]);

      // The backend schedule endpoint returns schedules for this exam.
      // Filter by selected class in the UI.
      setSchedules(list);
    } catch (e) {
      setSchedules([]);
      setError(e.message || "Schedule load nahi hua.");
    } finally {
      setScheduleLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const classSchedules = schedules.filter((item) => {
    const scheduleClassId =
      item.classId?._id || item.classId || "";

    return !classId || String(scheduleClassId) === String(classId);
  });

  const filtered = classSchedules.filter((item) => {
    const subjectName =
      item.subjectId?.name || item.subject?.name || "";
    const className = item.classId?.name || "";
    const q = search.trim().toLowerCase();

    return (
      subjectName.toLowerCase().includes(q) ||
      className.toLowerCase().includes(q) ||
      String(item.room || "").toLowerCase().includes(q)
    );
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingSchedules = classSchedules.filter((item) => {
    const date = new Date(item.examDate);
    return !Number.isNaN(date.getTime()) && date >= today;
  }).length;

  const completedSchedules = classSchedules.filter((item) => {
    const date = new Date(item.examDate);
    return !Number.isNaN(date.getTime()) && date < today;
  }).length;

  function openCreate() {
    setForm({
      ...EMPTY_FORM,
      subjectId: subjects[0]?._id || "",
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function closeForm() {
    setShowForm(false);
    setForm({
      ...EMPTY_FORM,
      subjectId: subjects[0]?._id || "",
    });
  }

  async function saveSchedule(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!examId || !classId || !form.subjectId) {
      setError("Exam, class aur subject select karein.");
      return;
    }

    if (!form.date || !form.startTime || !form.endTime) {
      setError("Exam date, start time aur end time required hain.");
      return;
    }

    if (form.endTime <= form.startTime) {
      setError("End time, start time ke baad hona chahiye.");
      return;
    }

    const total = Number(form.totalMarks);
    const passing = Number(form.passingMarks);

    if (
      form.totalMarks === "" ||
      form.passingMarks === "" ||
      !Number.isFinite(total) ||
      !Number.isFinite(passing) ||
      total < 1 ||
      passing < 0 ||
      passing > total
    ) {
      setError(
        "Total Marks kam se kam 1 hon aur Passing Marks 0 se Total Marks ke beech hon."
      );
      return;
    }

    if (selectedExam?.startDate && selectedExam?.endDate) {
      const scheduleDate = new Date(`${form.date}T00:00:00`);
      const startDate = new Date(selectedExam.startDate);
      const endDate = new Date(selectedExam.endDate);

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      if (scheduleDate < startDate || scheduleDate > endDate) {
        setError(
          "Exam date selected exam ki start date aur end date ke beech honi chahiye."
        );
        return;
      }
    }

    setSaving(true);

    try {
      const payload = {
        subjectId: form.subjectId,
        examDate: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        room: form.room.trim(),
        totalMarks: total,
        passingMarks: passing,
      };

      const data = await examRequest(`/${examId}/schedule`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccess(data.message || "Exam schedule successfully save ho gaya.");
      closeForm();
      await loadSchedules();
    } catch (e) {
      setError(e.message || "Schedule save nahi hua.");
    } finally {
      setSaving(false);
    }
  }

  const dateText = (value) => {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Exam Schedule
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage examination timetable and subject schedule
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              loadInitial();
              loadSchedules();
            }}
            disabled={initialLoading || scheduleLoading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                initialLoading || scheduleLoading ? "animate-spin" : ""
              }
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreate}
            disabled={!examId || !classId || !subjects.length}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={18} />
            Add Schedule
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Scheduled Entries", classSchedules.length, "text-indigo-600"],
          ["Upcoming Exams", upcomingSchedules, "text-orange-500"],
          ["Completed Exams", completedSchedules, "text-green-600"],
          ["Classes", classes.length, "text-purple-600"],
        ].map(([label, value, color]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <h2 className={`mt-3 text-3xl font-black ${color}`}>
              {value}
            </h2>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-slate-600">
              Select Exam
            </label>
            <select
              value={examId}
              onChange={(event) => {
                setExamId(event.target.value);
                setError("");
                setSuccess("");
              }}
              className={field}
            >
              <option value="">Select exam</option>
              {exams.map((exam) => (
                <option key={exam._id} value={exam._id}>
                  {exam.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-600">
              Select Class
            </label>
            <select
              value={classId}
              onChange={(event) => {
                setClassId(event.target.value);
                setError("");
                setSuccess("");
              }}
              className={field}
            >
              <option value="">Select class</option>
              {classes.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={saveSchedule}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-800">
                Add Schedule
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter subject, timing and marks details.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close form"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm font-bold text-slate-600">
              Subject *
              <select
                required
                value={form.subjectId}
                onChange={(event) =>
                  setForm({ ...form, subjectId: event.target.value })
                }
                className={field}
              >
                <option value="">Select subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                    {subject.code ? ` (${subject.code})` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-bold text-slate-600">
              Exam Date *
              <input
                required
                type="date"
                min={
                  selectedExam?.startDate
                    ? new Date(selectedExam.startDate)
                        .toISOString()
                        .slice(0, 10)
                    : undefined
                }
                max={
                  selectedExam?.endDate
                    ? new Date(selectedExam.endDate)
                        .toISOString()
                        .slice(0, 10)
                    : undefined
                }
                value={form.date}
                onChange={(event) =>
                  setForm({ ...form, date: event.target.value })
                }
                className={field}
              />
            </label>

            <label className="text-sm font-bold text-slate-600">
              Room / Hall
              <input
                value={form.room}
                onChange={(event) =>
                  setForm({ ...form, room: event.target.value })
                }
                placeholder="Room 101"
                className={field}
              />
            </label>

            <label className="text-sm font-bold text-slate-600">
              Start Time *
              <input
                required
                type="time"
                value={form.startTime}
                onChange={(event) =>
                  setForm({ ...form, startTime: event.target.value })
                }
                className={field}
              />
            </label>

            <label className="text-sm font-bold text-slate-600">
              End Time *
              <input
                required
                type="time"
                value={form.endTime}
                onChange={(event) =>
                  setForm({ ...form, endTime: event.target.value })
                }
                className={field}
              />
            </label>

            <label className="text-sm font-bold text-slate-600">
              Total Marks *
              <input
                required
                type="number"
                min="1"
                step="any"
                value={form.totalMarks}
                onChange={(event) =>
                  setForm({ ...form, totalMarks: event.target.value })
                }
                placeholder="100"
                className={field}
              />
            </label>

            <label className="text-sm font-bold text-slate-600">
              Passing Marks *
              <input
                required
                type="number"
                min="0"
                step="any"
                value={form.passingMarks}
                onChange={(event) =>
                  setForm({ ...form, passingMarks: event.target.value })
                }
                placeholder="33"
                className={field}
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CalendarDays size={18} />
              {saving ? "Saving..." : "Save Schedule"}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <ClipboardList size={21} className="text-indigo-600" />
            <h2 className="text-lg font-black text-slate-800">
              Timetable
            </h2>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search subject, class or room..."
              className="w-full text-sm outline-none sm:w-64"
            />
          </div>
        </div>

        {initialLoading || scheduleLoading ? (
          <p className="p-8 text-center text-slate-500">
            Loading timetable...
          </p>
        ) : !examId ? (
          <p className="p-10 text-center text-slate-500">
            Pehle exam create karein aur Select Exam se choose karein.
          </p>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <BookOpen className="mx-auto mb-3 text-slate-300" size={36} />
            <p className="font-semibold text-slate-600">
              No schedules found for this exam and class.
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Add Schedule par click karke pehla timetable entry banayein.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  {[
                    "Subject",
                    "Class",
                    "Date",
                    "Time",
                    "Marks",
                    "Room",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-5 py-4"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => {
                  const subjectName = item.subjectId?.name || "—";
                  const className = item.classId?.name || "—";

                  return (
                    <tr
                      key={item._id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <BookOpen
                            size={17}
                            className="text-indigo-600"
                          />
                          {subjectName}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {className}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {dateText(item.examDate)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock3 size={16} />
                          {item.startTime || "—"} – {item.endTime || "—"}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        <span className="font-semibold">
                          {item.totalMarks ?? "—"}
                        </span>
                        <span className="text-slate-400">
                          {" "}/{" "}
                          {item.passingMarks ?? "—"} pass
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {item.room || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
