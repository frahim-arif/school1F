
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Save,
  ClipboardList,
  BookOpen,
  GraduationCap,
  RefreshCw,
  Search,
} from "lucide-react";

import {
  examRequest,
  schoolRequest,
  extractList,
} from "@/lib/examApi";

export default function MarksEntryPage() {
  const [exams, setExams] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);

  const [examId, setExamId] = useState("");
  const [scheduleId, setScheduleId] = useState("");
  const [marks, setMarks] = useState({});
  const [remarks, setRemarks] = useState({});
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedSchedule = useMemo(
    () => schedules.find(item => item._id === scheduleId),
    [schedules, scheduleId]
  );

  const classId =
    selectedSchedule?.classId?._id || selectedSchedule?.classId || "";

  const subjectId =
    selectedSchedule?.subjectId?._id ||
    selectedSchedule?.subjectId ||
    "";

  const totalMarks = Number(selectedSchedule?.totalMarks) || 100;
  const passingMarks = Number(selectedSchedule?.passingMarks) || 33;

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await examRequest("/");
      const list = extractList(data, ["exams"]);

      setExams(list);

      setExamId(current =>
        list.some(item => item._id === current)
          ? current
          : list[0]?._id || ""
      );
    } catch (e) {
      setError(e.message || "Exams load nahi hue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load schedules for the selected exam.
  useEffect(() => {
    let active = true;

    async function loadSchedules() {
      setSchedules([]);
      setScheduleId("");
      setStudents([]);
      setMarks({});
      setRemarks({});

      if (!examId) return;

      setLoading(true);
      setError("");

      try {
        const data = await examRequest(`/${examId}/schedule`);
        if (!active) return;

        const list = extractList(data, ["schedules"]);
        setSchedules(list);

        setScheduleId(list[0]?._id || "");
      } catch (e) {
        if (active) {
          setError(e.message || "Exam schedules load nahi hue.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSchedules();

    return () => {
      active = false;
    };
  }, [examId]);

  // Load students for the class selected through the schedule.
  useEffect(() => {
    let active = true;

    async function loadStudents() {
      setStudents([]);
      setMarks({});
      setRemarks({});

      if (!classId || !scheduleId) return;

      setLoading(true);
      setError("");

      try {
        const query = new URLSearchParams({ classId });

        const data = await schoolRequest(
          `students?${query.toString()}`
        );

        if (!active) return;

        let list = extractList(data, ["students"]);

        // If the API returns section information, restrict the list
        // to the selected schedule's section.
        const sectionId =
          selectedSchedule?.sectionId?._id ||
          selectedSchedule?.sectionId ||
          "";

        if (sectionId) {
          list = list.filter(student => {
            const studentSection =
              student.sectionId?._id ||
              student.sectionId ||
              student.section?._id ||
              student.section ||
              "";

            // Keep records without section data because some APIs
            // do not populate the section field in the student list.
            return !studentSection || String(studentSection) === String(sectionId);
          });
        }

        setStudents(list);
      } catch (e) {
        if (active) {
          setError(e.message || "Students load nahi hue.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStudents();

    return () => {
      active = false;
    };
  }, [classId, scheduleId, selectedSchedule]);

  // Load previously saved marks for this schedule.
  useEffect(() => {
    let active = true;

    async function loadExistingMarks() {
      setMarks({});
      setRemarks({});

      if (!examId || !scheduleId) return;

      try {
        const query = new URLSearchParams({ scheduleId });

        const data = await examRequest(
          `/${examId}/marks?${query.toString()}`
        );

        if (!active) return;

        const existing = extractList(data, ["results", "marks"]);
        const nextMarks = {};
        const nextRemarks = {};

        existing.forEach(item => {
          const studentId =
            item.studentId?._id ||
            item.studentId ||
            item.student?._id ||
            item.student;

          if (studentId) {
            nextMarks[String(studentId)] =
              item.marksObtained ?? "";

            nextRemarks[String(studentId)] =
              item.remarks || "";
          }
        });

        setMarks(nextMarks);
        setRemarks(nextRemarks);
      } catch (e) {
        if (active) {
          setError(
            e.message ||
              "Existing marks load nahi hue. Marks GET route check karein."
          );
        }
      }
    }

    loadExistingMarks();

    return () => {
      active = false;
    };
  }, [examId, scheduleId]);

  function getStudentId(student) {
    return student._id || student.id;
  }

  function getStudentName(student) {
    return (
      student.name ||
      [student.firstName, student.lastName].filter(Boolean).join(" ") ||
      student.fullName ||
      "Unnamed Student"
    );
  }

  function getRollNumber(student) {
    return (
      student.rollNumber ||
      student.rollNo ||
      student.admissionNumber ||
      student.admissionNo ||
      "—"
    );
  }

  function getGrade(value) {
    if (value === "" || value === undefined || value === null) {
      return "—";
    }

    const mark = Number(value);

    if (!Number.isFinite(mark) || totalMarks <= 0) return "—";
    if (mark < passingMarks) return "F";

    const percentage = (mark / totalMarks) * 100;

    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    return "C";
  }

  const filteredStudents = students.filter(student => {
    const query = search.trim().toLowerCase();

    return (
      getStudentName(student).toLowerCase().includes(query) ||
      String(getRollNumber(student)).toLowerCase().includes(query)
    );
  });

  const enteredCount = students.filter(student => {
    const id = String(getStudentId(student));
    return marks[id] !== undefined && marks[id] !== "";
  }).length;

  async function saveMarks() {
    setError("");
    setSuccess("");

    if (!examId || !scheduleId || !selectedSchedule) {
      setError("Exam aur exam schedule select karein.");
      return;
    }

    if (students.length === 0) {
      setError("Is schedule ke liye koi student nahi mila.");
      return;
    }

    const invalidStudent = students.find(student => {
      const id = String(getStudentId(student));
      const value = marks[id];

      return (
        value !== undefined &&
        value !== "" &&
        (
          !Number.isFinite(Number(value)) ||
          Number(value) < 0 ||
          Number(value) > totalMarks
        )
      );
    });

    if (invalidStudent) {
      setError(`Marks 0 se ${totalMarks} ke beech hone chahiye.`);
      return;
    }

    const entries = students
      .filter(student => {
        const id = String(getStudentId(student));
        return marks[id] !== undefined && marks[id] !== "";
      })
      .map(student => {
        const id = String(getStudentId(student));

        return {
          studentId: getStudentId(student),
          marksObtained: Number(marks[id]),
          remarks: remarks[id] || "",
        };
      });

    if (entries.length === 0) {
      setError("Save karne se pehle marks enter karein.");
      return;
    }

    setSaving(true);

    try {
      const result = await examRequest(`/${examId}/marks`, {
        method: "POST",
        body: JSON.stringify({
          scheduleId,
          marks: entries,
        }),
      });

      setSuccess(
        result.message ||
          `${entries.length} students ke marks save ho gaye.`
      );
    } catch (e) {
      setError(e.message || "Marks save nahi hue.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Marks Entry
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Select an exam schedule and enter student marks.
          </p>
        </div>

        <button
          type="button"
          onClick={loadInitialData}
          disabled={loading || saving}
          className="flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-bold text-slate-700 disabled:opacity-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-slate-600">
              Select Exam
            </label>

            <div className="mt-2 flex items-center gap-2 rounded-xl border px-3">
              <ClipboardList size={18} className="shrink-0 text-indigo-600" />
              <select
                value={examId}
                onChange={e => setExamId(e.target.value)}
                className="w-full py-3 text-sm outline-none"
              >
                <option value="">Select Exam</option>
                {exams.map(exam => (
                  <option key={exam._id} value={exam._id}>
                    {exam.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-600">
              Select Exam Schedule
            </label>

            <div className="mt-2 flex items-center gap-2 rounded-xl border px-3">
              <BookOpen size={18} className="shrink-0 text-purple-600" />
              <select
                value={scheduleId}
                onChange={e => setScheduleId(e.target.value)}
                className="w-full py-3 text-sm outline-none"
                disabled={!schedules.length}
              >
                <option value="">Select Schedule</option>
                {schedules.map(item => {
                  const subject =
                    item.subjectId?.name || "Subject";

                  const className =
                    item.classId?.name || "Class";

                  const date = item.examDate
                    ? new Date(item.examDate).toLocaleDateString()
                    : "";

                  return (
                    <option key={item._id} value={item._id}>
                      {subject} — {className}{date ? ` — ${date}` : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {selectedSchedule && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Class</p>
              <p className="mt-1 font-black text-slate-800">
                {selectedSchedule.classId?.name || "Selected class"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Subject</p>
              <p className="mt-1 font-black text-slate-800">
                {selectedSchedule.subjectId?.name || "Selected subject"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Total Marks</p>
              <p className="mt-1 text-xl font-black text-slate-800">
                {totalMarks}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">
                Passing Marks
              </p>
              <p className="mt-1 text-xl font-black text-slate-800">
                {passingMarks}
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 rounded-xl bg-indigo-50 p-4">
          <p className="text-xs font-semibold text-indigo-600">
            Marks Entered
          </p>
          <p className="mt-1 text-xl font-black text-indigo-700">
            {enteredCount}/{students.length}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-black text-slate-800">
              Student Marks List
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Marks and remarks are saved against the selected schedule.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border px-3">
            <Search size={17} className="text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search student..."
              className="w-full py-3 text-sm outline-none sm:w-48"
            />
          </div>
        </div>

        {loading ? (
          <p className="p-8 text-center text-slate-500">
            Loading data...
          </p>
        ) : !examId || !scheduleId ? (
          <p className="p-8 text-center text-slate-500">
            Select an exam and schedule to load students.
          </p>
        ) : filteredStudents.length === 0 ? (
          <p className="p-8 text-center text-slate-500">
            No students found for this schedule.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-5 py-4">Student Name</th>
                  <th className="px-5 py-4">Roll / Admission No.</th>
                  <th className="px-5 py-4">Marks ({totalMarks})</th>
                  <th className="px-5 py-4">Grade</th>
                  <th className="px-5 py-4">Remarks</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map(student => {
                  const id = String(getStudentId(student));
                  const value = marks[id] ?? "";

                  return (
                    <tr key={id} className="border-t hover:bg-slate-50">
                      <td className="px-5 py-4 font-bold text-slate-800">
                        {getStudentName(student)}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {getRollNumber(student)}
                      </td>

                      <td className="px-5 py-4">
                        <input
                          type="number"
                          min="0"
                          max={totalMarks}
                          step="0.5"
                          value={value}
                          onChange={e => {
                            setMarks(old => ({
                              ...old,
                              [id]: e.target.value,
                            }));
                            setSuccess("");
                          }}
                          placeholder="Marks"
                          className="w-28 rounded-xl border px-3 py-2 outline-none focus:border-indigo-500"
                        />
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                          {getGrade(value)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <input
                          type="text"
                          value={remarks[id] ?? ""}
                          onChange={e => {
                            setRemarks(old => ({
                              ...old,
                              [id]: e.target.value,
                            }));
                            setSuccess("");
                          }}
                          placeholder="Optional"
                          className="w-36 rounded-xl border px-3 py-2 text-sm outline-none focus:border-indigo-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={saveMarks}
          disabled={saving || loading || students.length === 0 || !scheduleId}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? "Saving Marks..." : "Save Marks"}
        </button>
      </div>
    </div>
  );
}
