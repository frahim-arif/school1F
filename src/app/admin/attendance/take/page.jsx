"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Calendar,
  Save,
  CheckCircle2,
  XCircle,
  Clock3,
  Plane,
  RotateCcw,
  Printer,
  Download,
  Users,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const STATUSES = ["Present", "Absent", "Late", "Leave"];

const STATUS_STYLES = {
  Present: "bg-emerald-600 text-white border-emerald-600",
  Absent: "bg-red-600 text-white border-red-600",
  Late: "bg-amber-500 text-white border-amber-500",
  Leave: "bg-blue-600 text-white border-blue-600",
};

const INACTIVE_STYLES = {
  Present: "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
  Absent: "border-red-200 text-red-700 hover:bg-red-50",
  Late: "border-amber-200 text-amber-700 hover:bg-amber-50",
  Leave: "border-blue-200 text-blue-700 hover:bg-blue-50",
};

const STATUS_LABELS = {
  Present: "P",
  Absent: "A",
  Late: "L",
  Leave: "LV",
};

function getLocalDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;
}

function unwrapList(json) {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.data?.students)) return json.data.students;
  if (Array.isArray(json?.students)) return json.students;
  if (Array.isArray(json?.data?.records)) return json.data.records;
  if (Array.isArray(json?.records)) return json.records;
  return [];
}

function getId(student) {
  return String(student?._id || student?.id || student?.studentId || "");
}

function getStudentClass(student) {
  const value =
    student?.className ??
    student?.class?.name ??
    student?.class?.className ??
    student?.class ??
    student?.classId?.name ??
    student?.classId?.className ??
    "";

  if (value && typeof value === "object") {
    return String(value.name || value.className || value._id || "");
  }

  return String(value);
}

function getStudentSection(student) {
  const value =
    student?.sectionName ??
    student?.section?.name ??
    student?.section?.sectionName ??
    student?.section ??
    student?.sectionId?.name ??
    student?.sectionId?.sectionName ??
    "";

  if (value && typeof value === "object") {
    return String(value.name || value.sectionName || value._id || "");
  }

  return String(value);
}

function getStudentName(student) {
  if (typeof student?.name === "string" && student.name.trim()) {
    return student.name.trim();
  }

  return [
    student?.firstName,
    student?.middleName,
    student?.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() || "Unnamed Student";
}

function normalizeStudent(student, index) {
  return {
    id: getId(student) || `student-${index}`,
    studentId: getId(student),
    roll:
      student?.rollNumber ??
      student?.rollNo ??
      student?.roll ??
      student?.studentRoll ??
      index + 1,
    admissionNo:
      student?.admissionNo ??
      student?.admissionNumber ??
      student?.registrationNumber ??
      student?.studentIdNumber ??
      "—",
    name: getStudentName(student),
    class: getStudentClass(student),
    section: getStudentSection(student),
    status: "Present",
    remark: "",
  };
}

async function readResponse(response) {
  const json = await response.json().catch(() => ({}));

  if (!response.ok || json?._status === false || json?.success === false) {
    throw new Error(
      json?._message ||
        json?.message ||
        `Request failed (${response.status})`
    );
  }

  return json;
}

export default function TakeAttendancePage() {
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(getLocalDate);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("info");

  const showNotice = (message, type = "info") => {
    setNotice(message);
    setNoticeType(type);
  };

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setNotice("");

    try {
      const response = await fetch(`${API_BASE}/api/students`, {
        cache: "no-store",
      });
      const json = await readResponse(response);
      const list = unwrapList(json);

      const normalized = list.map(normalizeStudent).filter((student) => {
        return student.id && !student.id.startsWith("student-");
      });

      setStudents((previous) => {
        // Preserve changes already made on the page when refreshing.
        const previousById = new Map(
          previous.map((student) => [student.id, student])
        );

        return normalized.map((student) => {
          const old = previousById.get(student.id);

          return old
            ? {
                ...student,
                status: old.status,
                remark: old.remark,
              }
            : student;
        });
      });

      if (!normalized.length) {
        showNotice(
          "Students API returned no students. Check the student records and API response.",
          "info"
        );
      }
    } catch (error) {
      console.error("Load students error:", error);
      showNotice(
        `Students load nahi hue: ${error.message}. Backend aur /api/students endpoint check karein.`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const classes = useMemo(() => {
    return [...new Set(students.map((student) => student.class).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [students]);

  const sections = useMemo(() => {
    return [
      ...new Set(
        students
          .filter((student) => !selectedClass || student.class === selectedClass)
          .map((student) => student.section)
          .filter(Boolean)
      ),
    ].sort();
  }, [students, selectedClass]);

  useEffect(() => {
    if (!classes.length) {
      setSelectedClass("");
      setSelectedSection("");
      return;
    }

    if (!classes.includes(selectedClass)) {
      setSelectedClass(classes[0]);
      setSelectedSection("");
    }
  }, [classes, selectedClass]);

  useEffect(() => {
    if (!sections.length) {
      setSelectedSection("");
      return;
    }

    if (!sections.includes(selectedSection)) {
      setSelectedSection(sections[0]);
    }
  }, [sections, selectedSection]);

  const classStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          student.class === selectedClass &&
          student.section === selectedSection
      ),
    [students, selectedClass, selectedSection]
  );

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return classStudents;

    return classStudents.filter((student) =>
      `${student.name} ${student.admissionNo} ${student.roll}`
        .toLowerCase()
        .includes(query)
    );
  }, [classStudents, search]);

  const counts = useMemo(() => {
    const result = {
      Present: 0,
      Absent: 0,
      Late: 0,
      Leave: 0,
    };

    classStudents.forEach((student) => {
      if (result[student.status] !== undefined) {
        result[student.status] += 1;
      }
    });

    return result;
  }, [classStudents]);

  const changeStatus = (studentId, status) => {
    setStudents((previous) =>
      previous.map((student) =>
        student.id === studentId ? { ...student, status } : student
      )
    );
    setNotice("");
  };

  const updateRemark = (studentId, remark) => {
    setStudents((previous) =>
      previous.map((student) =>
        student.id === studentId ? { ...student, remark } : student
      )
    );
  };

  const markAll = (status) => {
    const ids = new Set(classStudents.map((student) => student.id));

    setStudents((previous) =>
      previous.map((student) =>
        ids.has(student.id) ? { ...student, status } : student
      )
    );

    showNotice(`All students marked ${status.toLowerCase()}.`, "success");
  };

  const resetAttendance = () => {
    setStudents((previous) =>
      previous.map((student) =>
        student.class === selectedClass &&
        student.section === selectedSection
          ? { ...student, status: "Present", remark: "" }
          : student
      )
    );

    showNotice(
      "Current class attendance has been reset to Present. Database records were not changed.",
      "info"
    );
  };

  const saveAttendance = async () => {
    if (!classStudents.length) {
      showNotice("Is class aur section mein koi student nahi hai.", "error");
      return;
    }

    if (classStudents.some((student) => !student.studentId)) {
      showNotice(
        "Kuch students ke database IDs missing hain. Student API response check karein.",
        "error"
      );
      return;
    }

    setSaving(true);
    setNotice("");

    const payload = {
      date,
      className: selectedClass,
      section: selectedSection,
      attendance: classStudents.map((student) => ({
        studentId: student.studentId,
        admissionNo: student.admissionNo,
        status: student.status,
        remark: student.remark,
      })),
    };

    try {
      /*
       * IMPORTANT:
       * This request assumes POST /api/attendance accepts the payload above.
       * Confirm the actual route and request format in attendance.routes.js
       * and attendance.controller.js before relying on database saving.
       */
      const response = await fetch(`${API_BASE}/api/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await readResponse(response);
      showNotice("Attendance successfully saved.", "success");
    } catch (error) {
      console.error("Save attendance error:", error);
      showNotice(
        `Attendance save nahi hui: ${error.message}. Backend attendance route aur controller verify karein.`,
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = () => {
    const rows = [
      [
        "Roll",
        "Admission No",
        "Student",
        "Class",
        "Section",
        "Date",
        "Status",
        "Remark",
      ],
      ...filteredStudents.map((student) => [
        student.roll,
        student.admissionNo,
        student.name,
        student.class,
        student.section,
        date,
        student.status,
        student.remark,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `attendance-${selectedClass.replace(/\s+/g, "-")}-${selectedSection}-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between print:hidden">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-emerald-700">
            Adarsha Markaz Academy, Laharighat
          </p>
          <h1 className="text-3xl font-black text-slate-800">
            Take Attendance
          </h1>
          <p className="mt-2 text-slate-500">
            Mark student attendance by class, section and date.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => markAll("Present")}
            disabled={!classStudents.length || loading || saving}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            <CheckCircle2 size={18} />
            All Present
          </button>

          <button
            type="button"
            onClick={() => markAll("Absent")}
            disabled={!classStudents.length || loading || saving}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            <XCircle size={18} />
            All Absent
          </button>

          <button
            type="button"
            onClick={resetAttendance}
            disabled={!classStudents.length || loading || saving}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RotateCcw size={18} />
            Reset
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Printer size={18} />
            Print
          </button>

          <button
            type="button"
            onClick={exportCSV}
            disabled={!filteredStudents.length}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <Download size={18} />
            Export CSV
          </button>

          <button
            type="button"
            onClick={saveAttendance}
            disabled={saving || loading || !classStudents.length}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Attendance"}
          </button>
        </div>
      </div>

      {notice && (
        <div
          role="status"
          className={`flex items-start gap-3 rounded-xl border p-4 ${
            noticeType === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : noticeType === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-blue-200 bg-blue-50 text-blue-800"
          }`}
        >
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <p>{notice}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Present" value={counts.Present} color="emerald" icon={<CheckCircle2 size={22} />} />
        <Card title="Absent" value={counts.Absent} color="red" icon={<XCircle size={22} />} />
        <Card title="Late" value={counts.Late} color="amber" icon={<Clock3 size={22} />} />
        <Card title="Leave" value={counts.Leave} color="blue" icon={<Plane size={22} />} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 print:hidden">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-emerald-700" />
            <h2 className="font-bold text-slate-800">Attendance Filters</h2>
          </div>

          <button
            type="button"
            onClick={loadStudents}
            disabled={loading || saving}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh Students
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-600">Class</span>
            <select
              value={selectedClass}
              onChange={(event) => {
                setSelectedClass(event.target.value);
                setSelectedSection("");
              }}
              disabled={loading || !classes.length}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            >
              {classes.length ? (
                classes.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))
              ) : (
                <option value="">No classes available</option>
              )}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-600">Section</span>
            <select
              value={selectedSection}
              onChange={(event) => setSelectedSection(event.target.value)}
              disabled={loading || !sections.length}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            >
              {sections.length ? (
                sections.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))
              ) : (
                <option value="">No sections available</option>
              )}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-600">Date</span>
            <span className="relative block">
              <Calendar size={18} className="absolute left-3 top-3.5 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </span>
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-600">Search Student</span>
            <span className="relative block">
              <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, roll or admission no."
                className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </span>
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-slate-800">
              {selectedClass || "Select a class"}
              {selectedSection ? ` — Section ${selectedSection}` : ""}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {date} · {filteredStudents.length} students shown
            </p>
          </div>
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
            {classStudents.length} total students
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1050px] w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-4 text-left">Roll</th>
                <th className="px-4 py-4 text-left">Admission No.</th>
                <th className="px-4 py-4 text-left">Student</th>
                <th className="px-4 py-4 text-center">Present</th>
                <th className="px-4 py-4 text-center">Absent</th>
                <th className="px-4 py-4 text-center">Late</th>
                <th className="px-4 py-4 text-center">Leave</th>
                <th className="min-w-[190px] px-4 py-4 text-left">Remark</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center text-slate-500">
                    Loading students...
                  </td>
                </tr>
              ) : (
                <>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-4 font-bold text-slate-700">
                        {student.roll}
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-600">
                        {student.admissionNo}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{student.name}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {student.class} · Section {student.section}
                            </p>
                          </div>
                        </div>
                      </td>

                      {STATUSES.map((status) => (
                        <td key={status} className="px-4 py-4 text-center">
                          <button
                            type="button"
                            title={`Mark ${status}`}
                            aria-label={`${student.name}: mark ${status}`}
                            aria-pressed={student.status === status}
                            disabled={saving}
                            onClick={() => changeStatus(student.id, status)}
                            className={`min-w-11 rounded-lg border px-3 py-2 font-bold transition disabled:opacity-50 ${
                              student.status === status
                                ? STATUS_STYLES[status]
                                : `bg-white ${INACTIVE_STYLES[status]}`
                            }`}
                          >
                            {STATUS_LABELS[status]}
                          </button>
                        </td>
                      ))}

                      <td className="px-4 py-4">
                        <input
                          value={student.remark}
                          onChange={(event) =>
                            updateRemark(student.id, event.target.value)
                          }
                          disabled={saving}
                          placeholder="Add remark..."
                          aria-label={`Remark for ${student.name}`}
                          className="w-full min-w-[160px] rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
                        />
                      </td>
                    </tr>
                  ))}

                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-14 text-center">
                        <Users size={34} className="mx-auto text-slate-300" />
                        <p className="mt-3 font-bold text-slate-700">
                          {students.length
                            ? "No students found"
                            : "No student records available"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Student records, class and section filters check karein.
                        </p>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <SummaryBox title="Total" value={classStudents.length} color="slate" />
        <SummaryBox title="Present" value={counts.Present} color="emerald" />
        <SummaryBox title="Absent" value={counts.Absent} color="red" />
        <SummaryBox title="Late" value={counts.Late} color="amber" />
        <SummaryBox title="Leave" value={counts.Leave} color="blue" />
      </div>

      <p className="text-xs text-slate-500">
        Changes page memory mein rehte hain jab tak Save Attendance successful na ho.
        Date select karna apne aap purani saved attendance load nahi karta.
      </p>
    </div>
  );
}

function Card({ title, value, icon, color }) {
  const colors = {
    emerald: "bg-emerald-500",
    red: "bg-red-500",
    amber: "bg-amber-500",
    blue: "bg-blue-500",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h2 className="mt-2 text-3xl font-black text-slate-800">{value}</h2>
        </div>
        <div className={`rounded-xl p-3 text-white ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function SummaryBox({ title, value, color }) {
  const colors = {
    slate: "text-slate-700",
    emerald: "text-emerald-600",
    red: "text-red-600",
    amber: "text-amber-600",
    blue: "text-blue-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <h2 className={`mt-2 text-2xl font-black ${colors[color]}`}>{value}</h2>
    </div>
  );
}