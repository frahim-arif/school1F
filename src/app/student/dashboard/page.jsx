
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UserRound,
  Wallet,
  ReceiptText,
  GraduationCap,
  CalendarDays,
  ClipboardList,
  Bell,
  Menu,
  X,
  LogOut,
  Loader2,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  School,
  BookOpen,
} from "lucide-react";

const API_ROOT = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const MENU_ITEMS = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "profile", label: "My Profile", icon: UserRound },
  { id: "fees", label: "Fee Records", icon: Wallet },
  { id: "attendance", label: "Attendance", icon: CalendarDays },
  { id: "results", label: "Results", icon: GraduationCap },
  { id: "timetable", label: "Timetable", icon: BookOpen },
  { id: "homework", label: "Homework", icon: ClipboardList },
  { id: "notices", label: "Notices", icon: Bell },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function StudentDashboard() {
  const router = useRouter();

  const [student, setStudent] = useState(null);
  const [activeMenu, setActiveMenu] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [feeLoading, setFeeLoading] = useState(false);

  const [fees, setFees] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalFee: 0,
    paid: 0,
    due: 0,
  });

  const [error, setError] = useState("");
  const [feeError, setFeeError] = useState("");

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("studentToken");
  };

  const logout = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentUser");
    router.replace("/student/login");
  };

  const handleUnauthorized = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentUser");
    router.replace("/student/login");
  };

  // Fetch logged-in student profile
  const fetchProfile = useCallback(async () => {
    const token = getToken();

    if (!token) {
      router.replace("/student/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_ROOT}/api/student-auth/profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to load student profile");
      }

      const profile =
        data.student || data.user || data.profile || data.data || data;

      setStudent(profile);
    } catch (err) {
      console.error("Student Profile Error:", err);
      setError(err.message || "Unable to load your profile");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Fetch student's own fee records
  const fetchFees = useCallback(async () => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      setFeeLoading(true);
      setFeeError("");

      const response = await fetch(
        `${API_ROOT}/api/student-auth/fees`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to load fee records");
      }

      setFees(Array.isArray(data.fees) ? data.fees : []);
      setTransactions(
        Array.isArray(data.transactions) ? data.transactions : []
      );

      setSummary({
        totalFee: Number(data.summary?.totalFee || 0),
        paid: Number(data.summary?.paid || 0),
        due: Number(data.summary?.due || 0),
      });
    } catch (err) {
      console.error("Student Fees Error:", err);
      setFeeError(err.message || "Unable to load fee records");
    } finally {
      setFeeLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (activeMenu === "fees") {
      fetchFees();
    }
  }, [activeMenu, fetchFees]);

  const changeMenu = (menu) => {
    setActiveMenu(menu);
    setSidebarOpen(false);
  };

  const studentName = student
    ? [student.firstName, student.lastName].filter(Boolean).join(" ") ||
      student.name ||
      "Student"
    : "Student";

  const initials = studentName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const statusBadge = (status) => {
    const value = String(status || "Pending").toLowerCase();

    if (value === "paid") {
      return "bg-green-100 text-green-700";
    }

    if (value === "partial") {
      return "bg-amber-100 text-amber-700";
    }

    return "bg-red-100 text-red-700";
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[#123d32] p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-green-100">Welcome back,</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              {studentName}
            </h2>
            <p className="mt-2 text-sm text-green-100">
              Welcome to your student portal.
            </p>
            <p className="mt-4 text-sm text-green-100">
              Admission No: {student?.admissionNo || "—"}
            </p>
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 text-2xl font-bold">
            {initials || "S"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          title="Total Fee"
          value={formatCurrency(summary.totalFee)}
          icon={IndianRupee}
          color="blue"
        />
        <SummaryCard
          title="Total Paid"
          value={formatCurrency(summary.paid)}
          icon={CheckCircle2}
          color="green"
        />
        <SummaryCard
          title="Remaining Due"
          value={formatCurrency(summary.due)}
          icon={Clock}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-4 font-bold text-gray-800">Student Information</h3>
          <InfoRow label="Student Name" value={studentName} />
          <InfoRow label="Admission No." value={student?.admissionNo} />
          <InfoRow label="Class" value={student?.className} />
          <InfoRow label="Section" value={student?.section} />
          <InfoRow label="Session" value={student?.session} />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-4 font-bold text-gray-800">Quick Access</h3>

          <div className="grid grid-cols-2 gap-3">
            <QuickButton
              icon={UserRound}
              label="My Profile"
              onClick={() => changeMenu("profile")}
            />
            <QuickButton
              icon={Wallet}
              label="Fee Records"
              onClick={() => changeMenu("fees")}
            />
            <QuickButton
              icon={CalendarDays}
              label="Attendance"
              onClick={() => changeMenu("attendance")}
            />
            <QuickButton
              icon={GraduationCap}
              label="Results"
              onClick={() => changeMenu("results")}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold text-gray-800">Fee Overview</h3>
          <button
            onClick={() => changeMenu("fees")}
            className="text-sm font-semibold text-[#176b50] hover:underline"
          >
            View Fee Records →
          </button>
        </div>

        <p className="mt-3 text-sm text-gray-500">
          Open Fee Records to view your receipts and complete payment history.
        </p>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-7">
      <h2 className="mb-6 text-xl font-bold text-gray-800">My Profile</h2>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#123d32] text-xl font-bold text-white">
          {initials || "S"}
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">{studentName}</h3>
          <p className="text-sm text-gray-500">
            Admission No: {student?.admissionNo || "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
        <InfoRow label="First Name" value={student?.firstName} />
        <InfoRow label="Last Name" value={student?.lastName} />
        <InfoRow label="Admission No." value={student?.admissionNo} />
        <InfoRow label="Roll No." value={student?.rollNo} />
        <InfoRow label="Class" value={student?.className} />
        <InfoRow label="Section" value={student?.section} />
        <InfoRow label="Session" value={student?.session} />
        <InfoRow label="Gender" value={student?.gender} />
        <InfoRow label="Date of Birth" value={formatDate(student?.dob)} />
        <InfoRow label="Father's Name" value={student?.fatherName} />
        <InfoRow label="Mother's Name" value={student?.motherName} />
        <InfoRow label="Phone" value={student?.phone} />
        <InfoRow label="Email" value={student?.email} />
        <InfoRow label="Address" value={student?.address} />
      </div>
    </div>
  );

  const renderFees = () => (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Fee Records</h2>
          <p className="mt-1 text-sm text-gray-500">
            View your fee details and payment history.
          </p>
        </div>

        <button
          onClick={fetchFees}
          disabled={feeLoading}
          className="flex items-center gap-2 border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={feeLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {feeError && (
        <div className="flex items-center gap-2 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          {feeError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total Fee"
          value={formatCurrency(summary.totalFee)}
          icon={IndianRupee}
          color="blue"
        />
        <SummaryCard
          title="Paid Amount"
          value={formatCurrency(summary.paid)}
          icon={CheckCircle2}
          color="green"
        />
        <SummaryCard
          title="Due Amount"
          value={formatCurrency(summary.due)}
          icon={Clock}
          color="orange"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-5">
          <h3 className="font-bold text-gray-800">Fee Receipts</h3>
        </div>

        {feeLoading ? (
          <LoadingBlock message="Loading fee records..." />
        ) : fees.length === 0 ? (
          <EmptyBlock message="No fee records found." />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-5 py-4">Receipt</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4">Paid</th>
                    <th className="px-5 py-4">Due</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {fees.map((fee) => (
                    <tr key={fee._id}>
                      <td className="px-5 py-4 font-semibold text-gray-800">
                        {fee.receipt || "—"}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {formatDate(fee.paymentDate || fee.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        {formatCurrency(fee.amount)}
                      </td>
                      <td className="px-5 py-4 text-green-700">
                        {formatCurrency(fee.paid)}
                      </td>
                      <td className="px-5 py-4 text-red-600">
                        {formatCurrency(fee.due)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-bold ${statusBadge(fee.status)}`}
                        >
                          {fee.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile fee cards */}
            <div className="space-y-3 p-4 md:hidden">
              {fees.map((fee) => (
                <div
                  key={fee._id}
                  className="border border-gray-200 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Receipt Number</p>
                      <p className="mt-1 font-bold text-gray-800">
                        {fee.receipt || "—"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-bold ${statusBadge(fee.status)}`}
                    >
                      {fee.status || "Pending"}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    {formatDate(fee.paymentDate || fee.createdAt)}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <MobileAmount label="Total" value={fee.amount} />
                    <MobileAmount label="Paid" value={fee.paid} />
                    <MobileAmount label="Due" value={fee.due} />
                    <div>
                      <p className="text-xs text-gray-500">Payment Method</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {fee.paymentMethod || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-5">
          <h3 className="font-bold text-gray-800">Payment History</h3>
          <p className="mt-1 text-sm text-gray-500">
            All payments received against your fee receipts.
          </p>
        </div>

        {feeLoading ? (
          <LoadingBlock message="Loading payment history..." />
        ) : transactions.length === 0 ? (
          <EmptyBlock message="No payment transactions found." />
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((transaction) => (
              <div
                key={transaction._id}
                className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:px-5"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {transaction.receipt || "Fee Payment"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatDate(
                      transaction.paymentDate || transaction.createdAt
                    )}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Method: {transaction.paymentMethod || "—"}
                  </p>
                </div>

                <div className="font-bold text-green-700">
                  + {formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPlaceholder = (title) => (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-16 text-center">
      <School size={42} className="mx-auto text-[#176b50]" />
      <h2 className="mt-4 text-xl font-bold text-gray-800">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
        This section will be available when the school connects its
        {` ${title.toLowerCase()} `}records to the student portal.
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7f5]">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-[#176b50]" size={38} />
          <p className="mt-3 text-sm text-gray-600">
            Loading student dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7f5] p-5">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-7 text-center">
          <AlertCircle className="mx-auto text-red-500" size={38} />
          <h2 className="mt-4 text-xl font-bold text-gray-800">
            Unable to load dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <button
            onClick={fetchProfile}
            className="mt-5 bg-[#123d32] px-5 py-3 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f5] text-gray-800">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col bg-[#123d32] text-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div>
            <h1 className="text-xl font-bold tracking-wide">STUDENT PORTAL</h1>
            <p className="mt-1 text-xs text-green-100">
              Adarsha Markaz Academy
            </p>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 lg:hidden"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 font-bold">
              {initials || "S"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{studentName}</p>
              <p className="mt-1 text-xs text-green-100">
                {student?.admissionNo || "Student"}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-green-200">
            Main Menu
          </p>

          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeMenu === item.id;

            return (
              <button
                key={item.id}
                onClick={() => changeMenu(item.id)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium transition ${
                  active
                    ? "bg-[#c8ae6a] text-[#172d27]"
                    : "text-green-50 hover:bg-white/10"
                }`}
              >
                <Icon size={19} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <main className="min-h-screen lg:ml-[270px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={23} />
            </button>

            <div>
              <h2 className="text-base font-bold text-gray-800 sm:text-lg">
                {MENU_ITEMS.find((item) => item.id === activeMenu)?.label}
              </h2>
              <p className="hidden text-xs text-gray-500 sm:block">
                Adarsha Markaz Academy Laharighat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-gray-600 sm:block">
              {studentName}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#123d32] text-sm font-bold text-white">
              {initials || "S"}
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {activeMenu === "overview" && renderOverview()}
          {activeMenu === "profile" && renderProfile()}
          {activeMenu === "fees" && renderFees()}
          {activeMenu === "attendance" && renderPlaceholder("Attendance")}
          {activeMenu === "results" && renderPlaceholder("Results")}
          {activeMenu === "timetable" && renderPlaceholder("Timetable")}
          {activeMenu === "homework" && renderPlaceholder("Homework")}
          {activeMenu === "notices" && renderPlaceholder("Notices")}
        </div>

        <footer className="border-t border-gray-200 bg-white px-5 py-5 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Adarsha Markaz Academy Laharighat.
          All rights reserved.
        </footer>
      </main>
    </div>
  );
}

// Summary card
function SummaryCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    orange: "bg-orange-50 text-orange-700",
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-5">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="mt-2 text-xl font-bold text-gray-800">{value}</h3>
      </div>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center ${colors[color]}`}>
        <Icon size={23} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="border-b border-gray-100 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-gray-800">
        {value || "—"}
      </p>
    </div>
  );
}

function QuickButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700 hover:border-[#176b50] hover:bg-green-50"
    >
      <Icon size={18} className="shrink-0 text-[#176b50]" />
      {label}
    </button>
  );
}

function MobileAmount({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-800">
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function LoadingBlock({ message }) {
  return (
    <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-500">
      <Loader2 size={20} className="animate-spin" />
      {message}
    </div>
  );
}

function EmptyBlock({ message }) {
  return (
    <div className="p-10 text-center text-sm text-gray-500">{message}</div>
  );
}
