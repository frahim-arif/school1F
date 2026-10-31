
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  FileCheck2,
  Clock3,
  CheckCircle2,
  Eye,
  Star,
  RefreshCw,
  X,
  ClipboardList,
  CalendarDays,
  BookOpen,
  UserRound,
  Paperclip,
  AlertCircle,
  Save,
  MessageSquare,
} from "lucide-react";

import { homeworkApi } from "@/lib/homeworkApi";

const STATUS_OPTIONS = ["All", "Pending", "Submitted", "Late", "Checked"];

function getObjectName(value, fallback = "—") {
  if (!value) return fallback;

  if (typeof value === "string") return value;

  return (
    value.name ||
    value.fullName ||
    value.studentName ||
    value.title ||
    value.subjectName ||
    value.className ||
    value.sectionName ||
    value.username ||
    value.email ||
    fallback
  );
}

function getStudentName(student) {
  if (!student || typeof student !== "object") {
    return getObjectName(student, "Student");
  }

  const fullName =
    student.fullName ||
    student.name ||
    student.studentName ||
    [student.firstName, student.middleName, student.lastName]
      .filter(Boolean)
      .join(" ");

  return fullName || student.email || student.admissionNumber || "Student";
}

function getClassName(homework) {
  return getObjectName(homework?.classId, "—");
}

function getSectionName(homework) {
  return getObjectName(homework?.sectionId, "—");
}

function getSubjectName(homework) {
  return getObjectName(homework?.subjectId, "—");
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusClass(status) {
  switch (status) {
    case "Checked":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Submitted":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Late":
      return "bg-orange-50 text-orange-700 border-orange-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className={`rounded-lg p-3 ${color}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

export default function HomeworkSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({
    totalHomework: 0,
    activeHomework: 0,
    archivedHomework: 0,
    totalSubmissions: 0,
    pendingSubmissions: 0,
    checkedSubmissions: 0,
    averageMarks: 0,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const [reviewForm, setReviewForm] = useState({
    marks: "",
    totalMarks: "10",
    feedback: "",
  });

  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const [submissionResult, statsResult] = await Promise.all([
        homeworkApi.submissions(),
        homeworkApi.stats(),
      ]);

      const submissionData = Array.isArray(submissionResult)
        ? submissionResult
        : submissionResult.data ?? submissionResult.items ?? [];

      const statsData = statsResult.data ?? statsResult;

      setSubmissions(submissionData);
      setStats((previous) => ({ ...previous, ...statsData }));
    } catch (err) {
      setError(
        err.message ||
          "Submissions load nahi ho sakin. Backend API check karein."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredSubmissions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return submissions.filter((item) => {
      const student = getStudentName(item.studentId);
      const homework = getObjectName(item.homeworkId, "Homework");
      const subject = getSubjectName(item.homeworkId);

      const matchesSearch =
        !query ||
        [
          student,
          homework,
          subject,
          getClassName(item.homeworkId),
          getSectionName(item.homeworkId),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [submissions, search, statusFilter]);

  function openDetails(item) {
    setSelectedSubmission(item);
    setReviewError("");
    setReviewSuccess("");
    setReviewOpen(false);

    setReviewForm({
      marks: item.marks ?? "",
      totalMarks: String(item.totalMarks ?? 10),
      feedback: item.feedback ?? "",
    });
  }

  function openReview(item) {
    setSelectedSubmission(item);
    setReviewError("");
    setReviewSuccess("");
    setReviewForm({
      marks: item.marks ?? "",
      totalMarks: String(item.totalMarks ?? 10),
      feedback: item.feedback ?? "",
    });
    setReviewOpen(true);
  }

  async function handleReview(event) {
    event.preventDefault();
    setReviewError("");
    setReviewSuccess("");

    if (!selectedSubmission?._id) {
      setReviewError("Submission ID nahi mila.");
      return;
    }

    const marks = Number(reviewForm.marks);
    const totalMarks = Number(reviewForm.totalMarks);

    if (
      reviewForm.marks === "" ||
      !Number.isFinite(marks) ||
      !Number.isFinite(totalMarks) ||
      totalMarks <= 0 ||
      marks < 0 ||
      marks > totalMarks
    ) {
      setReviewError(
        "Valid marks enter karein. Marks total marks se zyada nahi ho sakte."
      );
      return;
    }

    setSavingReview(true);

    try {
      await homeworkApi.review(selectedSubmission._id, {
        marks,
        totalMarks,
        feedback: reviewForm.feedback.trim(),
      });

      setReviewSuccess("Submission successfully check ho gayi.");

      await loadData(true);

      setSelectedSubmission((previous) =>
        previous
          ? {
              ...previous,
              marks,
              totalMarks,
              feedback: reviewForm.feedback.trim(),
              status: "Checked",
              checkedAt: new Date().toISOString(),
            }
          : previous
      );

      setReviewOpen(false);
    } catch (err) {
      setReviewError(err.message || "Review save nahi ho saka.");
    } finally {
      setSavingReview(false);
    }
  }

  const pendingCount = stats.pendingSubmissions ?? 0;
  const checkedCount = stats.checkedSubmissions ?? 0;
  const averageMarks = Number(stats.averageMarks ?? 0);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
                <FileCheck2 size={23} />
              </div>

              <h1 className="text-2xl font-bold text-slate-900">
                Homework Submissions
              </h1>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Student submissions dekhein, answers check karein aur marks
              assign karein.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <div className="flex-1">{error}</div>
            <button
              type="button"
              onClick={() => loadData()}
              className="font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Homework"
            value={stats.totalHomework ?? 0}
            icon={BookOpen}
            color="bg-indigo-50 text-indigo-700"
          />

          <StatCard
            title="Total Submissions"
            value={stats.totalSubmissions ?? 0}
            icon={ClipboardList}
            color="bg-blue-50 text-blue-700"
          />

          <StatCard
            title="Pending Review"
            value={pendingCount}
            icon={Clock3}
            color="bg-amber-50 text-amber-700"
          />

          <StatCard
            title="Checked Submissions"
            value={checkedCount}
            icon={CheckCircle2}
            color="bg-emerald-50 text-emerald-700"
          />
        </div>

        {/* Average marks */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Star size={22} />
            </div>

            <div>
              <p className="font-semibold text-slate-800">
                Average Marks
              </p>
              <p className="text-sm text-slate-500">
                Checked submissions ka average
              </p>
            </div>
          </div>

          <p className="text-2xl font-bold text-slate-900">
            {averageMarks.toFixed(2)}
          </p>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search student, homework, subject..."
                className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    statusFilter === status
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submissions table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
            <div>
              <h2 className="font-bold text-slate-900">
                Student Submission Records
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredSubmissions.length} record(s) displayed
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-52 items-center justify-center gap-3 text-sm text-slate-500">
              <RefreshCw size={20} className="animate-spin" />
              Loading submissions...
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
              <div className="rounded-full bg-slate-100 p-4 text-slate-400">
                <FileCheck2 size={30} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No submissions found
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Is filter ke liye koi submission nahi mili. Search ya status
                filter change karke dekhein.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Student</th>
                    <th className="px-5 py-4 font-semibold">Homework</th>
                    <th className="px-5 py-4 font-semibold">Class</th>
                    <th className="px-5 py-4 font-semibold">Subject</th>
                    <th className="px-5 py-4 font-semibold">Submitted</th>
                    <th className="px-5 py-4 font-semibold">Marks</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredSubmissions.map((item) => {
                    const homework = item.homeworkId;
                    const student = item.studentId;

                    return (
                      <tr
                        key={item._id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-semibold text-indigo-700">
                              {getStudentName(student)
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-800">
                                {getStudentName(student)}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {student?.admissionNumber ||
                                  student?.rollNumber ||
                                  student?.studentId ||
                                  ""}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            {getObjectName(homework, "Homework")}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Due: {formatDate(homework?.dueDate)}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          <div>{getClassName(homework)}</div>
                          <div className="mt-1 text-xs text-slate-400">
                            Section: {getSectionName(homework)}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {getSubjectName(homework)}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(item.submittedAt)}
                        </td>

                        <td className="px-5 py-4">
                          {item.marks !== null &&
                          item.marks !== undefined ? (
                            <span className="font-semibold text-slate-800">
                              {item.marks}/{item.totalMarks ?? 10}
                            </span>
                          ) : (
                            <span className="text-slate-400">Not graded</span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                              item.status
                            )}`}
                          >
                            {item.status || "Pending"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openDetails(item)}
                              title="View submission"
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() => openReview(item)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                            >
                              <Star size={14} />
                              {item.status === "Checked" ? "Edit Marks" : "Review"}
                            </button>
                          </div>
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

      {/* Submission details modal */}
      {selectedSubmission && !reviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Submission Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {getStudentName(selectedSubmission.studentId)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Homework
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {getObjectName(
                      selectedSubmission.homeworkId,
                      "Homework"
                    )}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Class / Section
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {getClassName(selectedSubmission.homeworkId)} /{" "}
                    {getSectionName(selectedSubmission.homeworkId)}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Subject
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {getSubjectName(selectedSubmission.homeworkId)}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Submitted At
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDate(selectedSubmission.submittedAt)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="flex items-center gap-2 font-semibold text-slate-800">
                  <MessageSquare size={17} />
                  Student Answer
                </h3>

                <div className="mt-2 min-h-20 whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
                  {selectedSubmission.answer || "Student ne text answer nahi diya."}
                </div>
              </div>

              {selectedSubmission.attachment?.url && (
                <div>
                  <h3 className="font-semibold text-slate-800">
                    Attachment
                  </h3>

                  <a
                    href={selectedSubmission.attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
                  >
                    <Paperclip size={17} />
                    {selectedSubmission.attachment.name || "Open attachment"}
                  </a>
                </div>
              )}

              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">Current status</p>
                    <span
                      className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                        selectedSubmission.status
                      )}`}
                    >
                      {selectedSubmission.status || "Pending"}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-slate-500">Marks</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {selectedSubmission.marks ?? "—"}/
                      {selectedSubmission.totalMarks ?? 10}
                    </p>
                  </div>
                </div>

                {selectedSubmission.feedback && (
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="text-xs font-medium text-slate-500">
                      Teacher Feedback
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                      {selectedSubmission.feedback}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => openReview(selectedSubmission)}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <Star size={16} />
                  Review Submission
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review modal */}
      {selectedSubmission && reviewOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Review Submission
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {getStudentName(selectedSubmission.studentId)}
                </p>
              </div>

              <button
                type="button"
                disabled={savingReview}
                onClick={() => setReviewOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReview} className="space-y-5 p-5">
              {reviewError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {reviewError}
                </div>
              )}

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Homework</p>
                <p className="mt-1 font-semibold text-slate-800">
                  {getObjectName(selectedSubmission.homeworkId, "Homework")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Marks Obtained *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    max={reviewForm.totalMarks || undefined}
                    value={reviewForm.marks}
                    onChange={(event) =>
                      setReviewForm((previous) => ({
                        ...previous,
                        marks: event.target.value,
                      }))
                    }
                    placeholder="Enter marks"
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Total Marks *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={reviewForm.totalMarks}
                    onChange={(event) =>
                      setReviewForm((previous) => ({
                        ...previous,
                        totalMarks: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Teacher Feedback
                </label>
                <textarea
                  rows={4}
                  value={reviewForm.feedback}
                  onChange={(event) =>
                    setReviewForm((previous) => ({
                      ...previous,
                      feedback: event.target.value,
                    }))
                  }
                  placeholder="Write feedback for the student..."
                  className="mt-2 w-full resize-y rounded-lg border border-slate-200 px-3 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  disabled={savingReview}
                  onClick={() => setReviewOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingReview}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingReview ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {savingReview ? "Saving..." : "Save Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
