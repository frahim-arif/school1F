
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRightLeft,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  Search,
  Users,
  GraduationCap,
  AlertCircle,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/+$/, "");

const API_ROOT = API_BASE.endsWith("/api")
  ? API_BASE
  : `${API_BASE}/api`;

const getList = (data, key) =>
  Array.isArray(data) ? data : Array.isArray(data?.[key]) ? data[key] : [];

export default function StudentPromotionPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [sourceClass, setSourceClass] = useState("");
  const [sourceSection, setSourceSection] = useState("");
  const [sourceSession, setSourceSession] = useState("");
  const [targetClass, setTargetClass] = useState("");
  const [targetSection, setTargetSection] = useState("");
  const [targetSession, setTargetSession] = useState("");

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [studentRes, classRes, sessionRes] = await Promise.all([
        fetch(`${API_ROOT}/students`, { cache: "no-store" }),
        fetch(`${API_ROOT}/classes`, { cache: "no-store" }),
        fetch(`${API_ROOT}/sessions`, { cache: "no-store" }),
      ]);

      if (!studentRes.ok) throw new Error("Students load nahi hue.");
      if (!classRes.ok) throw new Error("Classes load nahi hui.");
      if (!sessionRes.ok) throw new Error("Sessions load nahi hue.");

      const [studentData, classData, sessionData] = await Promise.all([
        studentRes.json(),
        classRes.json(),
        sessionRes.json(),
      ]);

      const studentList = getList(studentData, "students");
      const classList = getList(classData, "classes");
      const sessionList = getList(sessionData, "sessions");

      setStudents(studentList);
      setClasses(classList);
      setSessions(sessionList);

      const current = sessionList.find((s) => s.isCurrent);
      if (current) {
        setSourceSession((old) => old || current.name);
        setTargetSession((old) => old || current.name);
      }
    } catch (err) {
      setError(err.message || "Data load karne mein problem hui.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const classNameOf = (item) =>
    typeof item === "string"
      ? item
      : item?.name || item?.className || item?.title || "";

  const classOptions = useMemo(
    () => [...new Set(classes.map(classNameOf).filter(Boolean))],
    [classes]
  );

  const sectionOptions = useMemo(() => {
    const sections = new Set();

    students.forEach((student) => {
      if (!sourceClass || student.className === sourceClass) {
        if (student.section) sections.add(student.section);
      }
    });

    return [...sections];
  }, [students, sourceClass]);

  const targetSectionOptions = useMemo(() => {
    const sections = new Set();

    students.forEach((student) => {
      if (!targetClass || student.className === targetClass) {
        if (student.section) sections.add(student.section);
      }
    });

    return [...sections];
  }, [students, targetClass]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesClass =
        !sourceClass || student.className === sourceClass;
      const matchesSection =
        !sourceSection || student.section === sourceSection;
      const matchesSession =
        !sourceSession || student.session === sourceSession;
      const matchesSearch =
        !query ||
        `${student.firstName || ""} ${student.lastName || ""}`
          .toLowerCase()
          .includes(query) ||
        String(student.admissionNo || "").toLowerCase().includes(query) ||
        String(student.rollNo || "").toLowerCase().includes(query);

      return (
        matchesClass &&
        matchesSection &&
        matchesSession &&
        matchesSearch
      );
    });
  }, [
    students,
    sourceClass,
    sourceSection,
    sourceSession,
    search,
  ]);

  const toggleStudent = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    const visibleIds = filteredStudents.map((student) => student._id);
    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selected.includes(id));

    setSelected((prev) =>
      allSelected
        ? prev.filter((id) => !visibleIds.includes(id))
        : [...new Set([...prev, ...visibleIds])]
    );
  };

  
const handlePromotion = async () => {
  setMessage("");
  setError("");

  if (!selected.length) {
    setError("Promotion ke liye kam se kam ek student select karein.");
    return;
  }

  if (!sourceClass || !sourceSession) {
    setError("Current class aur current session select karein.");
    return;
  }

  if (!targetClass || !targetSession) {
    setError("Target class aur target session select karein.");
    return;
  }

  if (
    sourceClass === targetClass &&
    sourceSection === targetSection &&
    sourceSession === targetSession
  ) {
    setError("Source aur target details same hain.");
    return;
  }

  const selectedStudents = students.filter((student) =>
    selected.includes(student._id)
  );

  const invalidStudent = selectedStudents.find(
    (student) =>
      student.className !== sourceClass ||
      student.session !== sourceSession ||
      (sourceSection && student.section !== sourceSection)
  );

  if (invalidStudent) {
    setError(
      `${invalidStudent.firstName} ${invalidStudent.lastName || ""} ki current class, section ya session selection se match nahi karti.`
    );
    return;
  }

  const confirmed = window.confirm(
    `${selected.length} students ko ${targetClass}, Section ${
      targetSection || "-"
    }, Session ${targetSession} mein promote karna hai?`
  );

  if (!confirmed) return;

  setSaving(true);

  try {
    const response = await fetch(`${API_ROOT}/student-promotions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentIds: selected,
        fromClass: sourceClass,
        fromSection: sourceSection,
        fromSession: sourceSession,
        toClass: targetClass,
        toSection: targetSection,
        toSession: targetSession,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Student promotion failed.");
    }

    setMessage(
      data.message || `${data.promotedCount || selected.length} students promoted successfully.`
    );

    setSelected([]);
    await loadData();
  } catch (err) {
    setError(err.message || "Promotion ke waqt error aaya.");
  } finally {
    setSaving(false);
  }
};


  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 text-slate-800 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
            <GraduationCap size={18} />
            Student Management
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Student Promotion
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Students ko next class aur academic session mein promote karein.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Users size={20} />}
          label="Total Students"
          value={students.length}
        />
        <StatCard
          icon={<BookOpen size={20} />}
          label="Available Classes"
          value={classOptions.length}
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Selected Students"
          value={selected.length}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {message && (
        <div className="border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <section className="border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-base font-bold">Promotion Details</h2>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4 border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-700">Current Details</h3>

            <Field label="Current Class">
              <select
                value={sourceClass}
                onChange={(e) => {
                  setSourceClass(e.target.value);
                  setSourceSection("");
                  setSelected([]);
                }}
                className="field"
              >
                <option value="">All Classes</option>
                {classOptions.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </Field>

            <Field label="Current Section">
              <select
                value={sourceSection}
                onChange={(e) => {
                  setSourceSection(e.target.value);
                  setSelected([]);
                }}
                className="field"
              >
                <option value="">All Sections</option>
                {sectionOptions.map((section) => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </Field>

            <Field label="Current Session">
              <select
                value={sourceSession}
                onChange={(e) => {
                  setSourceSession(e.target.value);
                  setSelected([]);
                }}
                className="field"
              >
                <option value="">All Sessions</option>
                {sessions.map((session) => (
                  <option key={session._id} value={session.name}>
                    {session.name}{session.isCurrent ? " (Current)" : ""}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="space-y-4 border border-emerald-100 bg-emerald-50/40 p-4">
            <h3 className="font-semibold text-emerald-800">Promote To</h3>

            <Field label="Target Class">
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="field"
              >
                <option value="">Select Target Class</option>
                {classOptions.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </Field>

            <Field label="Target Section">
              <select
                value={targetSection}
                onChange={(e) => setTargetSection(e.target.value)}
                className="field"
              >
                <option value="">Select Section</option>
                {targetSectionOptions.map((section) => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </Field>

            <Field label="Target Session">
              <select
                value={targetSession}
                onChange={(e) => setTargetSession(e.target.value)}
                className="field"
              >
                <option value="">Select Target Session</option>
                {sessions.map((session) => (
                  <option key={session._id} value={session.name}>
                    {session.name}{session.isCurrent ? " (Current)" : ""}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </section>

      <section className="border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold">Select Students</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredStudents.length} students found
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, admission no. or roll no."
              className="w-full border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      filteredStudents.length > 0 &&
                      filteredStudents.every((s) => selected.includes(s._id))
                    }
                    onChange={toggleAll}
                    aria-label="Select all visible students"
                  />
                </th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Admission No.</th>
                <th className="px-4 py-3">Roll No.</th>
                <th className="px-4 py-3">Current Class</th>
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3">Session</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {!loading && filteredStudents.map((student) => (
                <tr key={student._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(student._id)}
                      onChange={() => toggleStudent(student._id)}
                      aria-label={`Select ${student.firstName}`}
                    />
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="px-4 py-3">{student.admissionNo}</td>
                  <td className="px-4 py-3">{student.rollNo}</td>
                  <td className="px-4 py-3">{student.className}</td>
                  <td className="px-4 py-3">{student.section}</td>
                  <td className="px-4 py-3">{student.session}</td>
                </tr>
              ))}

              {!loading && filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    Koi student nahi mila.
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    Students load ho rahe hain...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-slate-500">
            {selected.length} student(s) selected
          </span>

          <button
            onClick={handlePromotion}
            disabled={saving || loading || selected.length === 0}
            className="inline-flex items-center justify-center gap-2 bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowRightLeft size={17} />
            {saving ? "Processing..." : "Promote Selected Students"}
          </button>
        </div>
      </section>

      <style jsx>{`
        .field {
          width: 100%;
          border: 1px solid #e2e8f0;
          background: white;
          padding: 10px 12px;
          font-size: 14px;
          outline: none;
        }
        .field:focus {
          border-color: #047857;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="block text-sm font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center bg-emerald-50 text-emerald-700">
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
