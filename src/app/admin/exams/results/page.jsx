
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Award,
  Users,
  CheckCircle2,
  Clock3,
  Upload,
  RefreshCw,
} from "lucide-react";

import {
  examRequest,
  schoolRequest,
  extractList,
} from "@/lib/examApi";

export default function ResultsPage() {
  const [exams, setExams] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [savedMarks, setSavedMarks] = useState([]);

  const [examId, setExamId] = useState("");
  const [scheduleId, setScheduleId] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedSchedule = useMemo(
    () => schedules.find(item => item._id === scheduleId),
    [schedules, scheduleId]
  );

  const classId =
    selectedSchedule?.classId?._id ||
    selectedSchedule?.classId ||
    "";

  const totalMarks = Number(selectedSchedule?.totalMarks) || 100;
  const passingMarks = Number(selectedSchedule?.passingMarks) || 33;

  const isPublished = Boolean(
    selectedSchedule?.isPublished ||
    selectedSchedule?.published ||
    selectedSchedule?.resultStatus === "Published"
  );

  const loadExams = useCallback(async () => {
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
    loadExams();
  }, [loadExams]);

  // Load schedules for selected exam.
  useEffect(() => {
    let active = true;

    async function loadSchedules() {
      setSchedules([]);
      setScheduleId("");
      setStudents([]);
      setSavedMarks([]);

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

  // Load students and saved marks for selected schedule.
  useEffect(() => {
    let active = true;

    async function loadResults() {
      setStudents([]);
      setSavedMarks([]);

      if (!examId || !scheduleId || !classId) return;

      setLoading(true);
      setError("");

      try {
        const query = new URLSearchParams({ classId });
        const marksQuery = new URLSearchParams({ scheduleId });

        const [studentData, marksData] = await Promise.all([
          schoolRequest(`students?${query.toString()}`),
          examRequest(
            `/${examId}/marks?${marksQuery.toString()}`
          ),
        ]);

        if (!active) return;

        setStudents(extractList(studentData, ["students"]));
        setSavedMarks(
          extractList(marksData, ["results", "marks"])
        );
      } catch (e) {
        if (active) {
          setError(
            e.message ||
              "Results load nahi hue. Students aur marks API check karein."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadResults();

    return () => {
      active = false;
    };
  }, [examId, scheduleId, classId]);

  function getStudentId(student) {
    return String(student?._id || student?.id || "");
  }

  function getStudentName(student) {
    return (
      student?.name ||
      [student?.firstName, student?.lastName]
        .filter(Boolean)
        .join(" ") ||
      student?.fullName ||
      "Unnamed Student"
    );
  }

  function getRollNumber(student) {
    return (
      student?.rollNumber ||
      student?.rollNo ||
      student?.admissionNumber ||
      student?.admissionNo ||
      "—"
    );
  }

  function getGrade(obtained, total) {
    if (obtained === null || obtained === undefined || obtained === "") {
      return "—";
    }

    const mark = Number(obtained);
    const max = Number(total);

    if (!Number.isFinite(mark) || max <= 0) return "—";
    if ((mark / max) * 100 < (passingMarks / max) * 100) return "F";

    const percentage = (mark / max) * 100;

    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    return "C";
  }

  const results = useMemo(() => {
    const markMap = new Map();

    savedMarks.forEach(item => {
      const id = String(
        item.studentId?._id ||
        item.studentId ||
        item.student?._id ||
        item.student ||
        ""
      );

      if (id) markMap.set(id, item);
    });

    return students.map(student => {
      const id = getStudentId(student);
      const record = markMap.get(id);

      const obtained =
        record?.marksObtained ??
        record?.obtainedMarks ??
        record?.marks ??
        null;

      const hasMarks =
        obtained !== null &&
        obtained !== undefined &&
        obtained !== "";

      const percentage = hasMarks && totalMarks > 0
        ? (Number(obtained) / totalMarks) * 100
        : null;

      return {
        id,
        name: getStudentName(student),
        className:
          selectedSchedule?.classId?.name ||
          "Selected class",
        roll: getRollNumber(student),
        obtained: hasMarks ? Number(obtained) : null,
        total: totalMarks,
        percentage,
        grade: hasMarks
          ? getGrade(obtained, totalMarks)
          : "—",
        remarks: record?.remarks || "",
        status: hasMarks && isPublished
          ? "Published"
          : "Pending",
      };
    });
  }, [students, savedMarks, totalMarks, passingMarks, selectedSchedule, isPublished]);

  const filteredResults = results.filter(item => {
    const query = search.trim().toLowerCase();

    return (
      item.name.toLowerCase().includes(query) ||
      String(item.roll).toLowerCase().includes(query)
    );
  });

  const publishedCount = results.filter(
    item => item.status === "Published"
  ).length;

  const pendingCount = results.length - publishedCount;

  const topGrade = results.some(item => item.grade === "A+")
    ? "A+"
    : results.some(item => item.grade === "A")
      ? "A"
      : "—";

  // The publish endpoint must exist in your backend.
  // This assumes PATCH /api/exams/:examId/publish
  // accepts { scheduleId } and returns the updated schedule.
  async function publishResults() {
    if (!examId || !scheduleId) {
      setError("Exam aur schedule select karein.");
      return;
    }

    if (!results.length || !savedMarks.length) {
      setError("Publish karne se pehle marks save karein.");
      return;
    }

    if (isPublished) {
      setError("Is schedule ke results pehle se published hain.");
      return;
    }

    setError("");
    setSuccess("");
    setPublishing(true);

    try {
      const response = await examRequest(`/${examId}/publish`, {
        method: "PATCH",
        body: JSON.stringify({ scheduleId }),
      });

      setSchedules(current =>
        current.map(item =>
          item._id === scheduleId
            ? {
                ...item,
                isPublished: true,
                published: true,
                resultStatus: "Published",
              }
            : item
        )
      );

      setSuccess(response.message || "Results publish ho gaye.");
    } catch (e) {
      setError(
        e.message ||
          "Results publish nahi hue. Backend publish route verify karein."
      );
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Exam Results
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review marks and manage examination result publication.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadExams}
            disabled={loading || publishing}
            className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-bold text-slate-700 disabled:opacity-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            type="button"
            onClick={publishResults}
            disabled={
              loading ||
              publishing ||
              !scheduleId ||
              !savedMarks.length ||
              isPublished
            }
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPublished ? (
              <CheckCircle2 size={18} />
            ) : (
              <Upload size={18} />
            )}
            {publishing
              ? "Publishing..."
              : isPublished
                ? "Published"
                : "Publish Result"}
          </button>
        </div>
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

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-slate-600">
              Select Exam
            </label>
            <select
              value={examId}
              onChange={e => setExamId(e.target.value)}
              className="mt-2 w-full rounded-xl border bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">Select Exam</option>
              {exams.map(exam => (
                <option key={exam._id} value={exam._id}>
                  {exam.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-600">
              Select Schedule
            </label>
            <select
              value={scheduleId}
              onChange={e => setScheduleId(e.target.value)}
              disabled={!schedules.length}
              className="mt-2 w-full rounded-xl border bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500 disabled:bg-slate-50"
            >
              <option value="">Select Schedule</option>
              {schedules.map(item => (
                <option key={item._id} value={item._id}>
                  {(item.subjectId?.name || "Subject") +
                    " — " +
                    (item.classId?.name || "Class")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex justify-between">
            <p className="text-sm font-semibold text-slate-500">
              Students
            </p>
            <Users size={22} className="text-indigo-600" />
          </div>
          <h2 className="mt-3 text-3xl font-black text-slate-800">
            {results.length}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex justify-between">
            <p className="text-sm font-semibold text-slate-500">
              Published
            </p>
            <CheckCircle2 size={22} className="text-green-600" />
          </div>
          <h2 className="mt-3 text-3xl font-black text-green-600">
            {publishedCount}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex justify-between">
            <p className="text-sm font-semibold text-slate-500">
              Pending
            </p>
            <Clock3 size={22} className="text-orange-500" />
          </div>
          <h2 className="mt-3 text-3xl font-black text-orange-500">
            {pendingCount}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex justify-between">
            <p className="text-sm font-semibold text-slate-500">
              Top Grade
            </p>
            <Award size={22} className="text-purple-600" />
          </div>
          <h2 className="mt-3 text-3xl font-black text-purple-600">
            {topGrade}
          </h2>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-800">
              Student Results
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Results for the selected exam schedule.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border px-4 py-2">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search student..."
              className="w-full text-sm outline-none sm:w-48"
            />
          </div>
        </div>

        {loading ? (
          <p className="p-8 text-center text-slate-500">
            Loading results...
          </p>
        ) : !scheduleId ? (
          <p className="p-8 text-center text-slate-500">
            Select an exam and schedule to view results.
          </p>
        ) : filteredResults.length === 0 ? (
          <p className="p-8 text-center text-slate-500">
            No students found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Roll No</th>
                  <th className="px-6 py-4">Marks</th>
                  <th className="px-6 py-4">Percentage</th>
                  <th className="px-6 py-4">Grade</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredResults.map(student => (
                  <tr
                    key={student.id}
                    className="border-t hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {student.className}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {student.roll}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {student.obtained === null
                        ? "—"
                        : `${student.obtained}/${student.total}`}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {student.percentage === null
                        ? "—"
                        : `${student.percentage.toFixed(1)}%`}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
                        {student.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          student.status === "Published"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
