
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Receipt,
  IndianRupee,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  Search,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/+$/, "");

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const initialForm = {
  studentId: "",
  admissionNo: "",
  student: "",
  className: "",
  section: "",
  rollNo: "",
  session: "",
  amount: "",
  paid: "",
  paymentMethod: "Cash",
  paymentDate: today(),
  remarks: "",
};

const initialFilters = {
  name: "",
  className: "",
  section: "",
  rollNo: "",
};

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN");
};

export default function CollectFeePage() {
  const [form, setForm] = useState(initialForm);
  const [filters, setFilters] = useState(initialFilters);

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingUrlStudent, setLoadingUrlStudent] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState("");
  const [feeStructures, setFeeStructures] = useState([]);

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [settingsError, setSettingsError] = useState("");

  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);

  const [existingFees, setExistingFees] = useState([]);
  const [loadingExistingFees, setLoadingExistingFees] = useState(false);
  const [existingFeeError, setExistingFeeError] = useState("");
  const [showPreviousFees, setShowPreviousFees] = useState(false);

  // Load admission sessions and class fee structures.
  useEffect(() => {
    const loadSettings = async () => {
      setLoadingSettings(true);
      setSettingsError("");

      try {
        const [sessionResponse, currentResponse, structureResponse] =
          await Promise.all([
            fetch(`${API_BASE}/api/sessions`),
            fetch(`${API_BASE}/api/sessions/current`),
            fetch(`${API_BASE}/api/fee-structures`),
          ]);

        const [sessionData, currentData, structureData] =
          await Promise.all([
            sessionResponse.json(),
            currentResponse.json(),
            structureResponse.json(),
          ]);

        if (!sessionResponse.ok || sessionData.success === false) {
          throw new Error(
            sessionData.message || "Admission sessions load nahi hue."
          );
        }

        if (!structureResponse.ok || structureData.success === false) {
          throw new Error(
            structureData.message || "Fee structures load nahi hue."
          );
        }

        const sessionList = Array.isArray(sessionData.sessions)
          ? sessionData.sessions
          : [];

        const structureList = Array.isArray(structureData.structures)
          ? structureData.structures
          : [];

        setSessions(sessionList);
        setFeeStructures(structureList);

        const currentName =
          currentData?.session?.name ||
          sessionList.find((item) => item.isCurrent)?.name ||
          "";

        setCurrentSession(currentName);
      } catch (err) {
        setSettingsError(
          err.message || "Fee settings load nahi ho sake."
        );
      } finally {
        setLoadingSettings(false);
      }
    };

    loadSettings();
  }, []);

  // Automatically select student when opened from All Students page.
useEffect(() => {
  if (loadingSettings) return;

  const params = new URLSearchParams(window.location.search);
  const studentId = params.get("studentId")?.trim() || "";
  const admissionNo = params.get("admissionNo")?.trim() || "";

  // No student ID means normal manual search.
  if (!studentId) return;

  let cancelled = false;

  const loadSelectedStudent = async () => {
    setLoadingUrlStudent(true);
    setError("");
    setMessage("");
    setReceipt(null);

    try {
      const response = await fetch(
        `${API_BASE}/api/students/${encodeURIComponent(studentId)}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Selected student load nahi ho saka."
        );
      }

      const student =
        data.student ||
        data.data?.student ||
        data.data ||
        null;

      if (!student || !student._id) {
        throw new Error("Student record nahi mila.");
      }

      if (
        admissionNo &&
        String(student.admissionNo || "").trim().toLowerCase() !==
          admissionNo.toLowerCase()
      ) {
        throw new Error(
          "Student ID aur Admission Number match nahi kar rahe."
        );
      }

      if (!cancelled) {
        chooseStudent(student);
      }
    } catch (err) {
      if (!cancelled) {
        setError(
          err.message || "Student details load nahi ho sakin."
        );
      }
    } finally {
      if (!cancelled) {
        setLoadingUrlStudent(false);
      }
    }
  };

  loadSelectedStudent();

  return () => {
    cancelled = true;
  };
}, [loadingSettings]);
  // Automatically find fee structure using selected class.
  const selectedStructure = feeStructures.find(
    (item) =>
      String(item.className || "").trim().toLowerCase() ===
      String(form.className || "").trim().toLowerCase()
  );

  const calculatedTotal = selectedStructure
    ? ["tuition", "admission", "exam", "computer", "library", "transport"]
        .reduce(
          (sum, field) => sum + (Number(selectedStructure[field]) || 0),
          0
        )
    : 0;

  // Total Fee always comes from the selected class Fee Structure.
const total = Number(calculatedTotal) || 0;
const paid = Number(form.paid) || 0;
const due = Math.max(0, total - paid);

  const status =
    total > 0 && due === 0
      ? "Paid"
      : paid > 0
      ? "Partial"
      : "Pending";

  const existingTotal = existingFees.reduce(
    (sum, fee) => sum + (Number(fee.amount) || 0),
    0
  );

  const existingPaid = existingFees.reduce(
    (sum, fee) => sum + (Number(fee.paid) || 0),
    0
  );

  const existingDue = existingFees.reduce(
    (sum, fee) => sum + (Number(fee.due) || 0),
    0
  );

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
    setReceipt(null);
  };

  const updateFilter = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // Load previous fee records for selected student.
  const loadExistingFees = async (student) => {
    setLoadingExistingFees(true);
    setExistingFees([]);
    setExistingFeeError("");

    try {
      const admissionNo = String(student.admissionNo || "").trim();

      if (!admissionNo) {
        throw new Error("Student admission number nahi mila.");
      }

      const response = await fetch(
        `${API_BASE}/api/fees?search=${encodeURIComponent(admissionNo)}`
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Previous fee records load nahi hue."
        );
      }

      const allFees = Array.isArray(data.fees) ? data.fees : [];
      const selectedId = String(student._id || "");

      const matchedFees = allFees.filter((fee) => {
        const feeStudentId =
          typeof fee.studentId === "object"
            ? String(fee.studentId?._id || "")
            : String(fee.studentId || "");

        if (feeStudentId && selectedId) {
          return feeStudentId === selectedId;
        }

        return (
          String(fee.admissionNo || "").trim().toLowerCase() ===
          admissionNo.toLowerCase()
        );
      });

      matchedFees.sort(
        (a, b) =>
          new Date(b.paymentDate || b.createdAt || 0).getTime() -
          new Date(a.paymentDate || a.createdAt || 0).getTime()
      );

      setExistingFees(matchedFees);
    } catch (err) {
      setExistingFeeError(
        err.message || "Previous fee records load nahi ho sake."
      );
    } finally {
      setLoadingExistingFees(false);
    }
  };

  // Search students.
  const searchStudents = async (event) => {
    event?.preventDefault();

    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (String(value).trim()) {
        params.set(key, String(value).trim());
      }
    });

    if (!params.toString()) {
      setError(
        "Name, Class, Section ya Roll Number mein se kam se kam ek field bharein."
      );
      return;
    }

    setSearching(true);
    setHasSearched(true);
    setStudents([]);
    setSelectedStudent(null);
    setExistingFees([]);
    setExistingFeeError("");
    setShowPreviousFees(false);

    setForm((previous) => ({
      ...previous,
      ...initialForm,
      paymentDate: today(),
    }));

    setError("");
    setMessage("");
    setReceipt(null);

    try {
      const response = await fetch(
        `${API_BASE}/api/fees/students/search?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Students search nahi ho sake.");
      }

      setStudents(Array.isArray(data.students) ? data.students : []);
    } catch (err) {
      setError(
        err.message || "Student search ke liye server connection nahi ho raha."
      );
    } finally {
      setSearching(false);
    }
  };

  // Select student.
  const chooseStudent = (student) => {
    const studentSession =
      student.session ||
      currentSession ||
      "";

    setSelectedStudent(student);

    setForm((previous) => ({
      ...previous,
      studentId: student._id,
      admissionNo: student.admissionNo || "",
      student:
        student.student ||
        [student.firstName, student.houseName, student.lastName]
          .filter(Boolean)
          .join(" "),
      className: student.className || "",
      section: student.section || "",
      rollNo: student.rollNo ?? "",
      session: studentSession,
      amount: "",
      paid: "",
      remarks: "",
      paymentDate: today(),
    }));

    setStudents([]);
    setHasSearched(false);
    setShowPreviousFees(false);

    setError("");
    setMessage("");
    setReceipt(null);

    loadExistingFees(student);
  };

  const clearSelectedStudent = () => {
    setSelectedStudent(null);
    setFilters(initialFilters);
    setStudents([]);
    setHasSearched(false);

    setExistingFees([]);
    setExistingFeeError("");
    setLoadingExistingFees(false);
    setShowPreviousFees(false);

    setForm({
      ...initialForm,
      paymentDate: today(),
    });

    setReceipt(null);
    setMessage("");
    setError("");
  };

  // Save new fee receipt.
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setReceipt(null);

    if (!selectedStudent || !form.studentId) {
      setError("Pehle student select karein.");
      return;
    }

    if (!form.session) {
      setError("Admission Session select karein.");
      return;
    }

    if (!selectedStructure || calculatedTotal <= 0) {
      setError(
        `Class ${form.className} ke liye Fee Structure nahi mila. Pehle Fee Structure page par is class ki fee set karein.`
      );
      return;
    }

    if (!Number.isFinite(total) || total <= 0) {
      setError("Total fee zero se zyada honi chahiye.");
      return;
    }

    if (!Number.isFinite(paid) || paid < 0 || paid > total) {
      setError("Paid amount zero aur total fee ke beech honi chahiye.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/fees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: form.studentId,
          admissionNo: form.admissionNo,
          student: form.student,
          className: form.className,
          section: form.section,
          rollNo: form.rollNo,
          session: form.session,
          amount: total,
          paid,
          paymentMethod: form.paymentMethod,
          paymentDate: paid > 0 ? form.paymentDate : null,
          remarks: form.remarks.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || data.error || "Fee save nahi ho saki."
        );
      }

      const savedFee = data.fee || data.data || data;

      setReceipt(savedFee);

      setMessage(
        `Fee successfully save ho gayi. Receipt: ${
          savedFee.receipt || "Generated"
        }`
      );

      await loadExistingFees(selectedStudent);
    } catch (err) {
      setError(
        err.message ||
          "Backend se connection nahi ho raha. Server check karein."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Print receipt.
  const printReceipt = () => {
    if (!receipt) return;

    const printWindow = window.open("", "_blank", "width=800,height=700");

    if (!printWindow) {
      setError("Receipt print karne ke liye browser pop-ups allow karein.");
      return;
    }

    const escapeHtml = (value) =>
      String(value ?? "").replace(/[&<>"']/g, (character) => {
        const entities = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        };

        return entities[character];
      });

    const rows = [
      ["Receipt Number", receipt.receipt || "-"],
      ["Student", receipt.student || form.student],
      ["Admission Number", receipt.admissionNo || form.admissionNo],
      ["Class", receipt.className || form.className],
      ["Admission Session", receipt.session || form.session],
      ["Section", receipt.section || form.section || "-"],
      ["Roll Number", receipt.rollNo ?? form.rollNo ?? "-"],
      ["Total Fee", money(receipt.amount ?? total)],
      ["Paid Amount", money(receipt.paid ?? paid)],
      ["Balance Due", money(receipt.due ?? due)],
      ["Payment Date", form.paymentDate || "-"],
      ["Payment Method", receipt.paymentMethod || form.paymentMethod],
      ["Status", receipt.status || status],
      ["Remarks", receipt.remarks || form.remarks || "-"],
    ];

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fee Receipt</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 35px;
            color: #172033;
          }
          h1, .subtitle { text-align: center; }
          .subtitle { color: #64748b; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 28px;
          }
          td {
            padding: 12px;
            border: 1px solid #ddd;
          }
          td:first-child {
            width: 40%;
            font-weight: bold;
            background: #f8fafc;
          }
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 55px;
          }
        </style>
      </head>
      <body>
        <h1>School Fee Receipt</h1>
        <p class="subtitle">Official Payment Receipt</p>
        <table>
          ${rows
            .map(
              ([label, value]) =>
                `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`
            )
            .join("")}
        </table>
        <div class="signatures">
          <span>Parent/Guardian Signature</span>
          <span>Authorized Signature</span>
        </div>
        <script>
          window.onload = () => window.print();
        <\/script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/fees"
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-700"
          >
            <ArrowLeft size={17} />
            Back to Fee Collection
          </Link>

          <h1 className="text-3xl font-black text-slate-800">
            Collect Student Fee
          </h1>

          <p className="mt-2 text-slate-500">
            Search student details and record a fee payment.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
          <Receipt size={20} />
          <span className="font-semibold">New Fee Receipt</span>
        </div>
      </div>

      {/* Settings Loading / Error */}
      {loadingSettings && (
        <div className="flex items-center gap-2 rounded-xl border bg-white p-4 text-slate-600">
          <LoaderCircle size={19} className="animate-spin" />
          Loading admission sessions and fee structures...
        </div>
      )}

      {settingsError && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <AlertCircle size={20} className="shrink-0" />
          <p>{settingsError}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
        >
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Success */}
      {message && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
        >
          <CheckCircle2 size={20} className="mt-0.5 shrink-0" />

          <div className="min-w-0 flex-1">
            <p className="font-semibold">{message}</p>
            <p className="mt-1 text-sm">
              Receipt number: {receipt?.receipt || "-"}
            </p>

            {receipt && (
              <button
                type="button"
                onClick={printReceipt}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                <Receipt size={16} />
                Print Saved Receipt
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading Student From All Students Page */}
{loadingUrlStudent && (
  <div className="flex items-center gap-3 rounded-xl border bg-white p-5 shadow-sm">
    <LoaderCircle
      size={22}
      className="animate-spin text-emerald-600"
    />

    <div>
      <p className="font-semibold text-slate-800">
        Loading Selected Student...
      </p>

      <p className="text-sm text-slate-500">
        Student details automatically load ho rahi hain.
      </p>
    </div>
  </div>
)}

      {/* Find Student */}
      {!selectedStudent && !loadingUrlStudent && (
        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-800">
              Find Student
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Name, Class, Roll Number ya Section se student search karein.
            </p>
          </div>

          <form
            onSubmit={searchStudents}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <Field label="Student Name">
              <input
                name="name"
                value={filters.name}
                onChange={updateFilter}
                placeholder="Student name"
                className={inputClass}
              />
            </Field>

            <Field label="Class">
              <input
                name="className"
                value={filters.className}
                onChange={updateFilter}
                placeholder="Class"
                className={inputClass}
              />
            </Field>

            <Field label="Roll Number">
              <input
                name="rollNo"
                type="number"
                min="0"
                value={filters.rollNo}
                onChange={updateFilter}
                placeholder="Roll number"
                className={inputClass}
              />
            </Field>

            <Field label="Section">
              <input
                name="section"
                value={filters.section}
                onChange={updateFilter}
                placeholder="Section"
                className={inputClass}
              />
            </Field>

            <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
              <button
                type="submit"
                disabled={searching}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {searching ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <Search size={18} />
                )}
                {searching ? "Searching..." : "Search"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFilters(initialFilters);
                  setStudents([]);
                  setHasSearched(false);
                  setError("");
                }}
                className="rounded-lg border px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </form>

          {hasSearched && !searching && (
            <div className="mt-5 space-y-3 border-t pt-4">
              <p className="text-sm font-semibold text-slate-600">
                {students.length} student(s) found
              </p>

              {students.length === 0 ? (
                <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  Koi student nahi mila. Search details check karein.
                </p>
              ) : (
                students.map((student) => (
                  <div
                    key={student._id}
                    className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-800">
                        {student.student ||
                          [student.firstName, student.houseName, student.lastName]
                            .filter(Boolean)
                            .join(" ")}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Admission: {student.admissionNo}
                        {" · "}Class: {student.className}
                        {" · "}Roll: {student.rollNo}
                        {" · "}Section: {student.section}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => chooseStudent(student)}
                      className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Select Student
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      )}

      {/* Selected Student */}
      {selectedStudent && (
        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-3"
        >
          <div className="space-y-6 lg:col-span-2">
           

            {/* Previous Fee Details - Collapsible */}
            <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
              <button
                type="button"
                onClick={() => setShowPreviousFees((previous) => !previous)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-100 p-3 text-amber-700">
                    <Receipt size={22} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Previous Fee Details
                    </h2>
                    <p className="text-sm text-slate-500">
                      Click to view previous fee records
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {existingFees.length} Records
                  </span>
                  {showPreviousFees ? (
                    <ChevronUp size={21} className="text-slate-500" />
                  ) : (
                    <ChevronDown size={21} className="text-slate-500" />
                  )}
                </div>
              </button>

              {showPreviousFees && (
                <div className="mt-5 border-t pt-5">
                  {loadingExistingFees ? (
                    <div className="flex items-center gap-2 py-5 text-slate-500">
                      <LoaderCircle size={19} className="animate-spin" />
                      Loading previous fee records...
                    </div>
                  ) : existingFeeError ? (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      {existingFeeError}
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl bg-slate-50 p-4">
                          <p className="text-sm text-slate-500">
                            Previous Total Fee
                          </p>
                          <p className="mt-1 text-xl font-bold text-slate-800">
                            {money(existingTotal)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-emerald-50 p-4">
                          <p className="text-sm text-emerald-700">
                            Previous Total Paid
                          </p>
                          <p className="mt-1 text-xl font-bold text-emerald-700">
                            {money(existingPaid)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-red-50 p-4">
                          <p className="text-sm text-red-700">
                            Previous Remaining Due
                          </p>
                          <p className="mt-1 text-xl font-bold text-red-700">
                            {money(existingDue)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <h3 className="mb-3 font-bold text-slate-800">
                          Previous Fee Receipts ({existingFees.length})
                        </h3>

                        {existingFees.length === 0 ? (
                          <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                            Is student ke liye abhi koi previous fee record
                            nahi mila.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {existingFees.map((fee) => (
                              <div
                                key={fee._id}
                                className="rounded-xl border border-slate-200 p-4"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div>
                                    <p className="font-bold text-slate-800">
                                      {fee.receipt || "Fee Receipt"}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      Date: {formatDate(
                                        fee.paymentDate || fee.createdAt
                                      )}
                                      {fee.session
                                        ? ` · Session: ${fee.session}`
                                        : ""}
                                    </p>
                                  </div>

                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                                      fee.status === "Paid"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : fee.status === "Partial"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {fee.status || "Pending"}
                                  </span>
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3">
                                  <div>
                                    <p className="text-xs text-slate-500">
                                      Total
                                    </p>
                                    <p className="mt-1 font-bold text-slate-800">
                                      {money(fee.amount)}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-xs text-slate-500">
                                      Paid
                                    </p>
                                    <p className="mt-1 font-bold text-emerald-600">
                                      {money(fee.paid)}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-xs text-slate-500">
                                      Due
                                    </p>
                                    <p className="mt-1 font-bold text-red-600">
                                      {money(fee.due)}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-3 text-xs text-slate-500">
                                  Payment Method: {fee.paymentMethod || "-"}
                                  {fee.remarks
                                    ? ` · Remarks: ${fee.remarks}`
                                    : ""}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </section>

            {/* New Payment Details */}
            <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
  <div className="flex items-center gap-3">
    <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
      <CreditCard size={22} />
    </div>

    <div>
      <h2 className="text-lg font-bold text-slate-800">
        Payment Details
      </h2>
      <p className="text-sm text-slate-500">
        Total fee automatically loaded from class fee structure.
      </p>
    </div>
  </div>

  <button
    type="button"
    onClick={clearSelectedStudent}
    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
  >
    <X size={16} />
    Change Student
  </button>
</div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Admission Session" required>
  <select
    name="session"
    value={form.session}
    onChange={updateField}
    className={inputClass}
    required
  >
    <option value="">Select Admission Session</option>

    {form.session &&
      !sessions.some((item) => item.name === form.session) && (
        <option value={form.session}>{form.session}</option>
      )}

    {sessions.map((item) => (
      <option key={item._id} value={item.name}>
        {item.name}
        {item.isCurrent ? " (Current)" : ""}
      </option>
    ))}
  </select>
</Field>

                <Field label="Amount Received (₹)" required>
                  <input
                    name="paid"
                    type="number"
                    min="0"
                    max={calculatedTotal || undefined}
                    step="0.01"
                    value={form.paid}
                    onChange={updateField}
                    placeholder="Enter amount received"
                    required
                    className={inputClass}
                  />
                </Field>

                <Field label="Payment Method" required>
                  <select
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={updateField}
                    className={inputClass}
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>

                <Field label="Payment Date">
                  <div className="relative">
                    <CalendarDays
                      size={18}
                      className="pointer-events-none absolute left-3 top-3.5 text-slate-400"
                    />
                    <input
                      name="paymentDate"
                      type="date"
                      value={form.paymentDate}
                      onChange={updateField}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Remarks (Optional)">
                    <textarea
                      name="remarks"
                      value={form.remarks}
                      onChange={updateField}
                      placeholder="Installment details or other notes..."
                      rows={3}
                      maxLength={1000}
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/admin/fees"
                className="rounded-xl border bg-white px-6 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={
                  submitting ||
                  !selectedStudent ||
                  !selectedStructure ||
                  calculatedTotal <= 0 ||
                  !form.session
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <LoaderCircle size={19} className="animate-spin" />
                    Saving Fee...
                  </>
                ) : (
                  <>
                    <IndianRupee size={19} />
                    Save Fee & Generate Receipt
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Payment Summary */}
          <aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-6">
            <h2 className="text-lg font-bold text-slate-800">
              Payment Summary
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              New fee receipt amounts update automatically.
            </p>

            <div className="mt-6 space-y-4">
              <SummaryRow label="Total Fee" value={money(total)} />

              <SummaryRow
                label="Amount Received"
                value={money(paid)}
                valueClass="text-emerald-600"
              />

              <div className="border-t pt-4">
                <SummaryRow
                  label="Remaining Due"
                  value={money(due)}
                  valueClass={
                    due > 0 ? "text-red-600" : "text-emerald-600"
                  }
                  large
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <span className="text-sm text-slate-600">
                Payment Status
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  status === "Paid"
                    ? "bg-emerald-100 text-emerald-700"
                    : status === "Partial"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {status}
              </span>
            </div>

            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
              {paid === 0
                ? "No payment received yet. This new record will be marked Pending."
                : due === 0
                ? "Full payment received. This new record will be marked Paid."
                : "Partial payment received. The remaining balance will be marked Due."}
            </div>

            {receipt && (
              <button
                type="button"
                onClick={printReceipt}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                <Receipt size={18} />
                Print Saved Receipt
              </button>
            )}
          </aside>
        </form>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function SummaryRow({
  label,
  value,
  valueClass = "",
  large = false,
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span
        className={`font-bold ${
          large ? "text-xl" : "text-base"
        } ${valueClass || "text-slate-800"}`}
      >
        {value}
      </span>
    </div>
  );
}
