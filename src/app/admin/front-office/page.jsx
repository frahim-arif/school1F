
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  PhoneCall,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ArrowRight,
  UserRoundSearch,
  CalendarDays,
  AlertCircle,
  LoaderCircle,
  ClipboardList,
  Building2,
  UserRound,
  Mail,
  MessageSquareWarning,
  Settings2,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const ENQUIRY_URL = "/admin/front-office/admission-enquiry";

const statsConfig = [
  {
    key: "total",
    label: "Total Enquiries",
    icon: Users,
    color: "bg-blue-50 text-blue-700",
  },
  {
    key: "new",
    label: "New Enquiries",
    icon: UserPlus,
    color: "bg-violet-50 text-violet-700",
  },
  {
    key: "dueFollowUps",
    label: "Due Follow-ups",
    icon: Clock3,
    color: "bg-amber-50 text-amber-700",
  },
  {
    key: "admitted",
    label: "Admissions",
    icon: CheckCircle2,
    color: "bg-emerald-50 text-emerald-700",
  },
];

const moduleCards = [
  {
    title: "Visitor Book",
    description: "Register visitors and manage check-in/check-out.",
    href: "/admin/front-office/visitors",
    icon: UserRound,
    color: "bg-blue-50 text-blue-700",
    border: "hover:border-blue-300",
  },
  {
    title: "Phone Call Log",
    description: "Track incoming calls, outgoing calls and callbacks.",
    href: "/admin/front-office/calls",
    icon: PhoneCall,
    color: "bg-violet-50 text-violet-700",
    border: "hover:border-violet-300",
  },
  {
    title: "Postal / Dispatch Records",
    description: "Manage inward and outward postal records.",
    href: "/admin/front-office/postal-records",
    icon: Mail,
    color: "bg-amber-50 text-amber-700",
    border: "hover:border-amber-300",
  },
  {
    title: "Complaints",
    description: "Record complaints and track their resolution.",
    href: "/admin/front-office/complaints",
    icon: MessageSquareWarning,
    color: "bg-rose-50 text-rose-700",
    border: "hover:border-rose-300",
  },
  {
    title: "Front Office Settings",
    description: "Configure front office details and categories.",
    href: "/admin/front-office/settings",
    icon: Settings2,
    color: "bg-emerald-50 text-emerald-700",
    border: "hover:border-emerald-300",
  },
];

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

function statusClass(status) {
  const styles = {
    New: "bg-blue-50 text-blue-700",
    Contacted: "bg-violet-50 text-violet-700",
    "Follow-up": "bg-amber-50 text-amber-700",
    Admitted: "bg-emerald-50 text-emerald-700",
    Rejected: "bg-red-50 text-red-700",
  };

  return styles[status] || "bg-slate-100 text-slate-700";
}

export default function FrontOfficeDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    followUp: 0,
    dueFollowUps: 0,
    admitted: 0,
    rejected: 0,
  });

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [statsResponse, enquiriesResponse] = await Promise.all([
        fetch(`${API_BASE}/api/front-office/enquiries/stats`, {
          cache: "no-store",
        }),
        fetch(`${API_BASE}/api/front-office/enquiries?page=1&limit=6`, {
          cache: "no-store",
        }),
      ]);

      const statsResult = await statsResponse.json();
      const enquiriesResult = await enquiriesResponse.json();

      if (!statsResponse.ok || statsResult?._status === false) {
        throw new Error(
          statsResult?._message || "Dashboard statistics load nahi hui."
        );
      }

      if (!enquiriesResponse.ok || enquiriesResult?._status === false) {
        throw new Error(
          enquiriesResult?._message || "Enquiries load nahi hui."
        );
      }

      setStats((previous) => ({
        ...previous,
        ...(statsResult?._data || {}),
      }));

      const data = enquiriesResult?._data;
      setEnquiries(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Backend se connection nahi ho raha. Backend server aur CORS check karein."
          : err.message || "Dashboard load nahi hua."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <main className="space-y-7 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#9a5260]">
            <Building2 size={17} />
            School Administration
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
            Front Office
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage admission enquiries and all front desk activities.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 sm:self-auto"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />

          <div className="flex-1">{error}</div>

          <button
            type="button"
            onClick={loadDashboard}
            className="font-bold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Existing Admission Enquiry Statistics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsConfig.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.key}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {item.label}
                  </p>

                  <p className="mt-3 text-3xl font-black text-slate-800">
                    {loading ? (
                      <span className="inline-block h-9 w-12 animate-pulse rounded bg-slate-100" />
                    ) : (
                      stats[item.key] ?? 0
                    )}
                  </p>
                </div>

                <div className={`rounded-xl p-3 ${item.color}`}>
                  <Icon size={23} />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Quick Actions */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-extrabold text-slate-800">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Frequently used front office tasks.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Link
            href={`${ENQUIRY_URL}/create`}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#9a5260] hover:shadow-md"
          >
            <div className="rounded-xl bg-pink-50 p-3 text-[#9a5260]">
              <UserPlus size={23} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-slate-800">New Enquiry</h3>
              <p className="mt-1 text-sm text-slate-500">
                Register a new admission enquiry.
              </p>
            </div>

            <ArrowRight
              size={19}
              className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#9a5260]"
            />
          </Link>

          <Link
            href={ENQUIRY_URL}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <ClipboardList size={23} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-slate-800">All Enquiries</h3>
              <p className="mt-1 text-sm text-slate-500">
                Search and manage admission enquiries.
              </p>
            </div>

            <ArrowRight
              size={19}
              className="text-slate-400 transition group-hover:translate-x-1"
            />
          </Link>

          <Link
            href={ENQUIRY_URL}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-300 hover:shadow-md"
          >
            <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
              <CalendarDays size={23} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-slate-800">Follow-ups</h3>
              <p className="mt-1 text-sm text-slate-500">
                Review enquiries and follow-up dates.
              </p>
            </div>

            <ArrowRight
              size={19}
              className="text-slate-400 transition group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>

      {/* New Front Office Modules */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-extrabold text-slate-800">
            Front Office Modules
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Open and manage the different front desk sections.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {moduleCards.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                href={item.href}
                key={item.href}
                className={`group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${item.border}`}
              >
                <div className={`rounded-xl p-3 ${item.color}`}>
                  <Icon size={23} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-800">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.description}
                  </p>
                </div>

                <ArrowRight
                  size={19}
                  className="shrink-0 text-slate-400 transition group-hover:translate-x-1"
                />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Existing Recent Admission Enquiries */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">
              Recent Admission Enquiries
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest enquiries received by the school.
            </p>
          </div>

          <Link
            href={ENQUIRY_URL}
            className="inline-flex items-center gap-2 self-start text-sm font-bold text-[#9a5260] hover:underline"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 p-12 text-sm text-slate-500">
            <LoaderCircle size={20} className="animate-spin" />
            Loading enquiries...
          </div>
        ) : enquiries.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-12 text-center">
            <div className="rounded-2xl bg-slate-50 p-4 text-slate-400">
              <UserRoundSearch size={32} />
            </div>

            <h3 className="mt-4 font-bold text-slate-700">
              No enquiries yet
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              New admission enquiries will appear here when they are added.
            </p>

            <Link
              href={`${ENQUIRY_URL}/create`}
              className="mt-4 rounded-xl bg-[#713f30] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#5a3425]"
            >
              Add First Enquiry
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-bold">Student</th>
                  <th className="px-6 py-4 font-bold">Guardian</th>
                  <th className="px-6 py-4 font-bold">Phone</th>
                  <th className="px-6 py-4 font-bold">Class</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {enquiries.map((item) => (
                  <tr key={item._id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {item.studentName}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {item.guardianName}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {item.phone}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {item.classApplying}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClass(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Existing Enquiry Status Overview */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-extrabold text-slate-800">
          Enquiry Status Overview
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Current distribution of admission enquiries.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Contacted",
              value: stats.contacted,
              color: "text-violet-700",
            },
            {
              label: "Follow-up",
              value: stats.followUp,
              color: "text-amber-700",
            },
            {
              label: "Admitted",
              value: stats.admitted,
              color: "text-emerald-700",
            },
            {
              label: "Rejected",
              value: stats.rejected,
              color: "text-red-700",
            },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">{item.label}</p>

              <p className={`mt-2 text-2xl font-black ${item.color}`}>
                {loading ? "—" : item.value ?? 0}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
