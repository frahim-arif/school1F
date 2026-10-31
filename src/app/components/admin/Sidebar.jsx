"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineClipboardDocumentList,
  HiOutlineCurrencyDollar,
  HiOutlineAcademicCap,
  HiOutlineBookOpen,
  HiOutlinePhoto,
  HiOutlineBell,
  HiOutlineCog6Tooth,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineBuildingLibrary,
  HiOutlineRectangleStack,
  HiChevronDown,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlineDocumentCheck,
} from "react-icons/hi2";

// Logo is stored at: src/images/logo.png
// "@" is the default alias for "src" in Next.js. If your project does not use it,
// replace with a relative path (for example "../../../images/logo.png").
import logo from "@/images/logo.png";

const menuItems = [
  { title: "Dashboard", icon: HiOutlineHome, href: "/admin/dashboard" },

  {
    title: "Front Office", icon: HiOutlineBuildingLibrary,
    children: [
      { title: "Dashboard", href: "/admin/front-office" },
      { title: "Admission Enquiry", href: "/admin/front-office/admission-enquiry" },
      { title: "Visitor Book", href: "/admin/front-office/visitors" },
      { title: "Phone Call Log", href: "/admin/front-office/calls" },
      { title: "Postal / Dispatch Records", href: "/admin/front-office/postal-records" },
      { title: "Complaints", href: "/admin/front-office/complaints" },
      { title: "Front Office Settings", href: "/admin/front-office/settings" },
    ],
  },
  {
    title: "Students", icon: HiOutlineUsers,
    children: [
      { title: "Dashboard", href: "/admin/students" },
      { title: "All Students", href: "/admin/students" },
      { title: "Add Student", href: "/admin/students/create" },
      { title: "Student Details", href: "/admin/students/details" },
      { title: "Student Categories", href: "/admin/students/categories" },
      { title: "Student House / Groups", href: "/admin/students/houses" },
      { title: "Promotion", href: "/admin/students/promotion" },
      { title: "Student ID Cards", href: "/admin/students/id-cards" },
      { title: "Student Attendance", href: "/admin/attendance/student" },
      { title: "Student Reports", href: "/admin/students/reports" },
    ],
  },
  {
    title: "Academics", icon: HiOutlineAcademicCap,
    children: [
      { title: "Academic Overview", href: "/admin/academic-setup" },
      { title: "Classes", href: "/admin/academic-setup/classes", icon: HiOutlineRectangleStack },
      { title: "Sections", href: "/admin/academic-setup/sections", icon: HiOutlineUserGroup },
      { title: "Subjects", href: "/admin/academic-setup/subjects", icon: HiOutlineBookOpen },
      { title: "Class–Subject Assignment", href: "/admin/academic-setup/class-subjects", icon: HiOutlineBookOpen },
      { title: "Timetable", href: "/admin/academic-setup/timetable" },
      { title: "Class Timetable", href: "/admin/academic-setup/class-timetable" },
      { title: "Teacher Timetable", href: "/admin/academic-setup/teacher-timetable" },
      { title: "Academic Calendar", href: "/admin/academic-setup/calendar" },
      { title: "Syllabus", href: "/admin/academic-setup/syllabus" },
      { title: "Academic Settings", href: "/admin/academic-setup/settings" },
    ],
  },
  {
    title: "Attendance", icon: HiOutlineClipboardDocumentList,
    children: [
      { title: "Dashboard", href: "/admin/attendance" },
      { title: "Take Attendance", href: "/admin/attendance/take" },
      { title: "Today", href: "/admin/attendance/today" },
      { title: "Student Attendance", href: "/admin/attendance/student" },
      { title: "Teacher Attendance", href: "/admin/attendance/teacher" },
      { title: "Staff Attendance", href: "/admin/attendance/staff" },
      { title: "Attendance History", href: "/admin/attendance/history" },
      { title: "Leave Management", href: "/admin/attendance/leave" },
      { title: "Holidays", href: "/admin/attendance/holidays" },
      { title: "Biometric Attendance", href: "/admin/attendance/biometric" },
      { title: "Attendance Reports", href: "/admin/attendance/reports" },
      { title: "Attendance Settings", href: "/admin/attendance/settings" },
    ],
  },
  {
    title: "Finance", icon: HiOutlineCurrencyDollar,
    children: [
      { title: "Finance Dashboard", href: "/admin/fees" },
      { title: "Fee Structure", href: "/admin/fees/structure" },
      { title: "Collect Fees", href: "/admin/fees/collect" },
      { title: "Fee Discounts", href: "/admin/fees/discounts" },
      { title: "Fee Due / Defaulters", href: "/admin/fees/defaulters" },
      { title: "Fee History", href: "/admin/fees/history" },
      { title: "Payment Transactions", href: "/admin/fees/transactions" },
      { title: "Expenses", href: "/admin/finance/expenses" },
      { title: "Income", href: "/admin/finance/income" },
      { title: "Financial Reports", href: "/admin/fees/reports" },
      { title: "Finance Settings", href: "/admin/finance/settings" },
    ],
  },
  {
    title: "Human Resource", icon: HiOutlineUserGroup,
    children: [
      { title: "HR Dashboard", href: "/admin/hr" },
      { title: "All Teachers", href: "/admin/teachers" },
      { title: "Add Teacher", href: "/admin/teachers/create" },
      { title: "Departments", href: "/admin/teachers/departments" },
      { title: "All Staff", href: "/admin/staff" },
      { title: "Add Staff", href: "/admin/staff/create" },
      { title: "Staff Attendance", href: "/admin/staff/attendance" },
      { title: "Leave Applications", href: "/admin/hr/leaves" },
      { title: "Staff ID Cards", href: "/admin/certificates/staff-id-cards" },
      { title: "HR Reports", href: "/admin/hr/reports" },
      { title: "HR Settings", href: "/admin/hr/settings" },
    ],
  },
  {
    title: "Payroll", icon: HiOutlineCurrencyDollar,
    children: [
      { title: "Payroll Dashboard", href: "/admin/payroll" },
      { title: "Salary Structure", href: "/admin/payroll/structure" },
      { title: "Generate Salary", href: "/admin/payroll/generate" },
      { title: "Salary Payments", href: "/admin/payroll/payments" },
      { title: "Salary Slips", href: "/admin/payroll/slips" },
      { title: "Deductions & Allowances", href: "/admin/payroll/deductions" },
      { title: "Payroll Reports", href: "/admin/payroll/reports" },
      { title: "Payroll Settings", href: "/admin/payroll/settings" },
    ],
  },
  {
    title: "Examinations", icon: HiOutlineAcademicCap,
    children: [
      { title: "Exam Dashboard", href: "/admin/exams" },
      { title: "Create Exam", href: "/admin/exams/create" },
      { title: "Exam List", href: "/admin/exams/list" },
      { title: "Exam Schedule", href: "/admin/exams/schedule" },
      { title: "Marks Entry", href: "/admin/exams/marks" },
      { title: "Results", href: "/admin/exams/results" },
      { title: "Admit Cards", href: "/admin/exams/admit-cards" },
      { title: "Grade Settings", href: "/admin/exams/grades" },
      { title: "Exam Reports", href: "/admin/exams/reports" },
      { title: "Exam Settings", href: "/admin/exams/settings" },
    ],
  },
  {
    title: "Communication", icon: HiOutlineBell,
    children: [
      { title: "Notice Dashboard", href: "/admin/notices" },
      { title: "All Notices", href: "/admin/notices" },
      { title: "Create Notice", href: "/admin/notices/create" },
      { title: "Notice Settings", href: "/admin/notices/settings" },
      { title: "Events & Calendar", href: "/admin/communication/events" },
      { title: "SMS / Notifications", href: "/admin/communication/notifications" },
      { title: "Email Messages", href: "/admin/communication/email" },
      { title: "Message Templates", href: "/admin/communication/templates" },
      { title: "Communication Reports", href: "/admin/communication/reports" },
    ],
  },
  {
    title: "Transportation", icon: HiOutlineRectangleStack,
    children: [
      { title: "Transport Dashboard", href: "/admin/transportation" },
      { title: "Routes", href: "/admin/transportation/routes" },
      { title: "Vehicles", href: "/admin/transportation/vehicles" },
      { title: "Drivers & Attendants", href: "/admin/transportation/staff" },
      { title: "Assign Students", href: "/admin/transportation/assignments" },
      { title: "Transport Fees", href: "/admin/transportation/fees" },
      { title: "Fuel & Maintenance", href: "/admin/transportation/maintenance" },
      { title: "Transport Reports", href: "/admin/transportation/reports" },
      { title: "Transport Settings", href: "/admin/transportation/settings" },
    ],
  },
  {
    title: "Certificates", icon: HiOutlineDocumentCheck,
    children: [
      { title: "Certificate Dashboard", href: "/admin/certificates" },
      { title: "Create Certificate", href: "/admin/certificates/create" },
      { title: "Issued Certificates", href: "/admin/certificates/issued" },
      { title: "Student ID Cards", href: "/admin/students/id-cards" },
      { title: "Staff ID Cards", href: "/admin/certificates/staff-id-cards" },
      { title: "Certificate Templates", href: "/admin/certificates/templates" },
      { title: "Certificate Settings", href: "/admin/certificates/settings" },
    ],
  },
  {
    title: "Hostels", icon: HiOutlineBuildingLibrary,
    children: [
      { title: "Hostel Dashboard", href: "/admin/hostels" },
      { title: "Hostel List", href: "/admin/hostels/list" },
      { title: "Rooms", href: "/admin/hostels/rooms" },
      { title: "Room Allocation", href: "/admin/hostels/allocation" },
      { title: "Hostel Attendance", href: "/admin/hostels/attendance" },
      { title: "Hostel Fees", href: "/admin/hostels/fees" },
      { title: "Visitors & Complaints", href: "/admin/hostels/visitors" },
      { title: "Hostel Reports", href: "/admin/hostels/reports" },
      { title: "Hostel Settings", href: "/admin/hostels/settings" },
    ],
  },
  {
    title: "Online Admission", icon: HiOutlineDocumentText,
    children: [
      { title: "Admission Dashboard", href: "/admin/online-admission" },
      { title: "Admission Applications", href: "/admin/online-admission/applications" },
      { title: "Review Applications", href: "/admin/online-admission/review" },
      { title: "Approved Applications", href: "/admin/online-admission/approved" },
      { title: "Rejected Applications", href: "/admin/online-admission/rejected" },
      { title: "Admission Form Settings", href: "/admin/online-admission/settings" },
      { title: "Admission Reports", href: "/admin/online-admission/reports" },
    ],
  },
  {
    title: "Library", icon: HiOutlineBuildingLibrary,
    children: [
      { title: "Library Dashboard", href: "/admin/library" },
      { title: "Books", href: "/admin/library/books" },
      { title: "Add Book", href: "/admin/library/create" },
      { title: "Issue Books", href: "/admin/library/issue" },
      { title: "Return Books", href: "/admin/library/return" },
      { title: "Overdue Books", href: "/admin/library/overdue" },
      { title: "Members", href: "/admin/library/members" },
      { title: "Library Reports", href: "/admin/library/reports" },
      { title: "Library Settings", href: "/admin/library/settings" },
    ],
  },
  {
    title: "Homework", icon: HiOutlineBookOpen,
    children: [
      { title: "Homework Dashboard", href: "/admin/homework" },
      { title: "Create Homework", href: "/admin/homework/create", icon: HiOutlineDocumentText },
      { title: "All Homework", href: "/admin/homework/all" },
      { title: "Submitted Homework", href: "/admin/homework/submitted", icon: HiOutlineDocumentCheck },
      { title: "Homework Reports", href: "/admin/homework/reports", icon: HiOutlineChartBar },
      { title: "Homework Settings", href: "/admin/homework/settings", icon: HiOutlineCog6Tooth },
    ],
  },
  {
  title: "Gallery",
  icon: HiOutlinePhoto,
  children: [
    { title: "Gallery Dashboard", href: "/admin/gallery" },
    { title: "All Photos & Videos", href: "/admin/gallery/photos" },
    { title: "Add Gallery Item", href: "/admin/gallery/create" },
    { title: "Albums", href: "/admin/gallery/albums" },
    { title: "Gallery Settings", href: "/admin/gallery/settings" },
  ],
},
  {
    title: "Settings", icon: HiOutlineCog6Tooth,
    children: [
      { title: "General Settings", href: "/admin/settings" },
      { title: "School Profile", href: "/admin/settings/profile" },
      { title: "Academic Settings", href: "/admin/settings/academic" },
      { title: "Users & Roles", href: "/admin/settings/roles" },
      { title: "Permissions", href: "/admin/settings/permissions" },
      { title: "Notifications", href: "/admin/settings/notifications" },
      { title: "Backup & Restore", href: "/admin/settings/backup" },
    ],
  },
];

function isChildActive(pathname, href) {
  if (!pathname || !href) return false;

  // Exact match for parent dashboard routes.
  // Prevents /admin/attendance/take from marking the
  // Attendance Dashboard link as active.
  if (
    href === "/admin/attendance" ||
    href === "/admin/homework" ||
    href === "/admin/dashboard" ||
    href === "/admin/academic-setup"
  ) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({ onLogout }) {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState({});

  // Automatically expand the section containing the current page.
  useEffect(() => {
    const activeMenus = {};

    menuItems.forEach((menu) => {
      if (
        menu.children?.some((child) =>
          isChildActive(pathname, child.href)
        )
      ) {
        activeMenus[menu.title] = true;
      }
    });

    setExpanded((previous) => ({
      ...previous,
      ...activeMenus,
    }));
  }, [pathname]);

  // Close mobile sidebar after route navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scrolling while mobile sidebar is open.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const toggle = (title) => {
    setExpanded((previous) => ({
      ...previous,
      [title]: !previous[title],
    }));
  };

  return (
    <>
      {/* MOBILE MENU BUTTON */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        className="fixed left-4 top-4 z-40 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 p-2 text-white shadow-lg shadow-pink-500/30 transition hover:from-pink-500 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-pink-300 lg:hidden"
      >
        <HiOutlineBars3 size={25} />
      </button>

      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {open && (
          <motion.button
            type="button"
            aria-label="Close navigation overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-[#1a0d08]/60 backdrop-blur-[2px] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside
        aria-label="Admin sidebar"
        className={`
          fixed left-0 top-0 z-50 flex h-dvh w-72 max-w-[85vw]
          flex-col overflow-hidden
          bg-gradient-to-b from-[#5a3425] via-[#3e2218] to-[#22110b]
          text-white shadow-2xl shadow-black/40
          border-r border-pink-300/10
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Soft pink glow decorations */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-pink-500/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-rose-400/15 blur-3xl"
        />

        {/* LOGO */}
        <div className="relative flex h-20 shrink-0 items-center justify-between border-b border-pink-200/10 px-5">
          <Link
            href="/admin/dashboard"
            onClick={() => setOpen(false)}
            className="flex min-w-0 items-center gap-3"
          >
            <Image
              src={logo}
              alt="Adarsha Markaz Academy logo"
              className="h-12 w-auto shrink-0 drop-shadow-[0_2px_8px_rgba(244,114,182,0.45)]"
            />
            <span className="min-w-0">
              <h2 className="text-[15px] font-black leading-tight tracking-tight text-pink-50">
                Adarsha Markaz Academy
              </h2>
              <p className="mt-0.5 text-xs text-pink-200/80">
                Administration Panel
              </p>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
            className="ml-2 rounded-lg p-1 text-pink-100 transition hover:bg-pink-300/15 focus:outline-none focus:ring-2 focus:ring-pink-300/60 lg:hidden"
          >
            <HiOutlineXMark size={26} />
          </button>
        </div>

        {/* MENU */}
        <nav
          aria-label="Admin navigation"
          className="relative min-h-0 flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:thin] [scrollbar-color:rgba(244,114,182,0.4)_transparent]"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;

            const hasActiveChild = item.children?.some((child) =>
              isChildActive(pathname, child.href)
            );

            if (item.children) {
              const isExpanded = !!expanded[item.title];

              return (
                <div key={item.title} className="mb-1.5">
                  <button
                    type="button"
                    onClick={() => toggle(item.title)}
                    aria-expanded={isExpanded}
                    className={`
                      group relative flex w-full items-center justify-between rounded-xl
                      px-3.5 py-3 transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-pink-300/50
                      ${
                        hasActiveChild
                          ? "bg-pink-300/15 text-pink-50"
                          : "text-pink-100/80 hover:bg-pink-300/10 hover:text-pink-50"
                      }
                    `}
                  >
                    {hasActiveChild && (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-pink-300 to-rose-500"
                      />
                    )}

                    <span className="flex min-w-0 items-center gap-3">
                      <Icon
                        size={21}
                        className={`shrink-0 transition-colors ${
                          hasActiveChild
                            ? "text-pink-300"
                            : "text-pink-200/70 group-hover:text-pink-300"
                        }`}
                      />
                      <span className="truncate text-left text-sm font-semibold">
                        {item.title}
                      </span>
                    </span>

                    <HiChevronDown
                      size={18}
                      className={`shrink-0 text-pink-200/70 transition-transform duration-300 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-4 mt-1.5 space-y-1 overflow-hidden border-l border-pink-300/25 pl-3"
                      >
                        {item.children.map((child) => {
                          const active = isChildActive(
                            pathname,
                            child.href
                          );
                          const ChildIcon = child.icon;

                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setOpen(false)}
                              aria-current={active ? "page" : undefined}
                              className={`
                                flex min-w-0 items-center gap-2 rounded-lg
                                px-3 py-2.5 text-sm transition-all duration-200
                                focus:outline-none focus:ring-2 focus:ring-pink-300/50
                                ${
                                  active
                                    ? "translate-x-0.5 bg-gradient-to-r from-pink-300 to-rose-400 font-bold text-[#3e2218] shadow-lg shadow-pink-500/30"
                                    : "text-pink-100/80 hover:translate-x-0.5 hover:bg-pink-300/10 hover:text-pink-50"
                                }
                              `}
                            >
                              {ChildIcon && (
                                <ChildIcon size={16} className="shrink-0" />
                              )}
                              <span className="min-w-0 truncate">
                                {child.title}
                              </span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            const active = isChildActive(pathname, item.href);

            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`
                  mb-1.5 flex items-center gap-3 rounded-xl px-3.5 py-3
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-pink-300/50
                  ${
                    active
                      ? "bg-gradient-to-r from-pink-300 to-rose-400 font-bold text-[#3e2218] shadow-lg shadow-pink-500/30"
                      : "text-pink-100/80 hover:bg-pink-300/10 hover:text-pink-50"
                  }
                `}
              >
                <Icon size={21} className="shrink-0" />
                <span className="truncate text-sm font-semibold">
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className="relative shrink-0 border-t border-pink-200/10 bg-[#22110b]/70 p-4 backdrop-blur">
          <button
            type="button"
            onClick={() => {
              if (typeof onLogout === "function") {
                onLogout();
              } else {
                // Connect your existing logout function here.
                console.warn("Please connect the existing logout function.");
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-pink-300/40 bg-pink-400/15 py-3 font-semibold text-pink-100 transition hover:border-transparent hover:bg-gradient-to-r hover:from-pink-400 hover:to-rose-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-pink-300/60"
          >
            <HiOutlineArrowLeftOnRectangle size={22} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}