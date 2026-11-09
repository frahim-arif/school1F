
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  UserRound,
  CalendarCheck,
  Wallet,
  ClipboardList,
  Clock,
  BookOpen,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Loader2,
  School,
} from "lucide-react";

const API_ROOT = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/+$/, "").replace(/\/api$/, "");

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "My Profile", icon: UserRound },
  { label: "Attendance", icon: CalendarCheck },
  { label: "Fees & Payments", icon: Wallet },
  { label: "Results", icon: ClipboardList },
  { label: "Timetable", icon: Clock },
  { label: "Homework", icon: BookOpen },
  { label: "Notices", icon: Bell },
];

export default function StudentDashboard() {
  const router = useRouter();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStudent = async () => {
      const token = localStorage.getItem("studentToken");

      if (!token) {
        router.replace("/student/login");
        return;
      }

      try {
        const response = await fetch(
          `${API_ROOT}/api/student-auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          localStorage.removeItem("studentToken");
          localStorage.removeItem("studentUser");
          router.replace("/student/login");
          return;
        }

        setStudent(data.student);
        localStorage.setItem(
          "studentUser",
          JSON.stringify(data.student)
        );
      } catch (err) {
        console.error("Student profile error:", err);
        setError("Unable to connect to server. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentUser");
    router.replace("/student/login");
  };

  const fullName = student
    ? `${student.firstName || ""} ${student.lastName || ""}`.trim()
    : "Student";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7f2]">
        <div className="text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-[#174b38]" />
          <p className="mt-3 text-sm font-medium text-gray-500">
            Loading student dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7f2] px-5">
        <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="font-semibold text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 bg-[#174b38] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f2] text-[#172d27]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col bg-[#102d24] text-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[78px] items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-10 w-10 items-center justify-center bg-[#d1b56d] text-[#102d24]">
            <GraduationCap size={25} />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-wide">STUDENT</h2>
            <p className="text-[10px] tracking-[2px] text-[#d1b56d]">
              PORTAL
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        <div className="border-b border-white/10 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center bg-[#d1b56d] text-lg font-bold text-[#102d24]">
              {initials || "S"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{fullName}</p>
              <p className="mt-1 text-xs text-gray-400">
                {student?.admissionNo || "Student"}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
          <p className="mb-3 px-3 text-[10px] font-bold tracking-[2px] text-gray-400">
            STUDENT MENU
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = activeMenu === item.label;

            return (
              <button
                key={item.label}
                onClick={() => {
                  setActiveMenu(item.label);
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-3 py-3 text-left text-sm transition ${
                  active
                    ? "bg-[#d1b56d] font-semibold text-[#102d24]"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
                {active && <ChevronRight size={16} className="ml-auto" />}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-3 text-sm text-red-300 transition hover:bg-white/10"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen lg:ml-[270px]">
        <header className="sticky top-0 z-30 flex h-[78px] items-center justify-between border-b border-gray-200 bg-white px-5 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu size={23} />
            </button>
            <div>
              <h1 className="text-lg font-bold">
                {activeMenu}
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Adarsha Markaz Academy Laharighat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{fullName}</p>
              <p className="text-xs text-gray-500">Student Account</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center bg-[#174b38] font-bold text-white">
              {initials || "S"}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1400px] p-5 md:p-8">
          {activeMenu === "Dashboard" ? (
            <>
              <div className="mb-7 bg-[#174b38] p-6 text-white md:p-9">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                  <div>
                    <p className="mb-2 text-xs font-semibold tracking-[2px] text-[#d1b56d]">
                      STUDENT PORTAL
                    </p>
                    <h2 className="text-2xl font-bold md:text-3xl">
                      Welcome, {student?.firstName || "Student"}!
                    </h2>
                    <p className="mt-2 max-w-lg text-sm text-gray-200">
                      Welcome to your student dashboard. Access your
                      academic information and school updates here.
                    </p>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center border border-[#d1b56d]/50 bg-white/10 text-[#d1b56d]">
                    <School size={35} />
                  </div>
                </div>
              </div>

              <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "Admission Number",
                    value: student?.admissionNo || "—",
                    icon: GraduationCap,
                  },
                  {
                    label: "Class",
                    value: student?.className || "—",
                    icon: BookOpen,
                  },
                  {
                    label: "Section",
                    value: student?.section || "—",
                    icon: ClipboardList,
                  },
                  {
                    label: "Session",
                    value: student?.session || "—",
                    icon: CalendarCheck,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="border border-gray-200 bg-white p-5"
                    >
                      <div className="mb-4 flex h-10 w-10 items-center justify-center bg-[#eaf1eb] text-[#174b38]">
                        <Icon size={21} />
                      </div>
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <h3 className="mt-1 break-words text-lg font-bold">
                        {item.value}
                      </h3>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="border border-gray-200 bg-white p-6 xl:col-span-2">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-bold">Student Information</h3>
                    <UserRound className="text-[#174b38]" size={20} />
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {[
                      ["Full Name", fullName],
                      ["Admission No.", student?.admissionNo],
                      ["Roll Number", student?.rollNo],
                      ["Father's Name", student?.fatherName],
                      ["Mother's Name", student?.motherName],
                      ["Date of Birth", student?.dob ? new Date(student.dob).toLocaleDateString("en-IN") : ""],
                      ["Gender", student?.gender],
                      ["Phone", student?.phone],
                      ["Email", student?.email],
                      ["Blood Group", student?.bloodGroup],
                    ].map(([label, value]) => (
                      <div key={label} className="border-b border-gray-100 pb-3">
                        <p className="text-xs text-gray-500">{label}</p>
                        <p className="mt-1 break-words text-sm font-semibold">
                          {value || "Not provided"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="border border-gray-200 bg-white p-6">
                    <h3 className="mb-4 font-bold">Academic Details</h3>
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Class</p>
                        <p className="mt-1 font-semibold">{student?.className || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Section</p>
                        <p className="mt-1 font-semibold">{student?.section || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Academic Session</p>
                        <p className="mt-1 font-semibold">{student?.session || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Account Status</p>
                        <span className="mt-1 inline-block bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          {student?.status || "Active"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 bg-white p-6">
                    <h3 className="mb-2 font-bold">School</h3>
                    <p className="text-sm font-semibold">
                      Adarsha Markaz Academy Laharighat
                    </p>
                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      Laharighat, Morigaon, Assam
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="border border-gray-200 bg-white p-8 md:p-12">
              <div className="mb-5 flex h-14 w-14 items-center justify-center bg-[#eaf1eb] text-[#174b38]">
                {(() => {
                  const ItemIcon = menuItems.find(
                    (item) => item.label === activeMenu
                  )?.icon || BookOpen;
                  return <ItemIcon size={28} />;
                })()}
              </div>
              <h2 className="text-xl font-bold">{activeMenu}</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
                This section is ready for integration. The relevant school
                records and APIs need to be connected before information
                can be displayed here.
              </p>
              <button
                onClick={() => setActiveMenu("Dashboard")}
                className="mt-6 bg-[#174b38] px-5 py-3 text-sm font-semibold text-white hover:bg-[#102d24]"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>

        <footer className="border-t border-gray-200 bg-white px-6 py-5 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Adarsha Markaz Academy Laharighat.
          Student Portal.
        </footer>
      </main>
    </div>
  );
}
