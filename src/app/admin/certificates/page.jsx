
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HiOutlineDocumentCheck,
  HiOutlineDocumentPlus,
  HiOutlineUsers,
  HiOutlineIdentification,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowRight,
  HiOutlineArrowPath,
  HiOutlineExclamationCircle,
} from "react-icons/hi2";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const menuItems = [
  {
    title: "Create Certificate",
    description: "Issue a new certificate to a student or staff member.",
    href: "/admin/certificates/create",
    icon: HiOutlineDocumentPlus,
  },
  {
    title: "Issued Certificates",
    description: "Search and manage all issued certificates.",
    href: "/admin/certificates/issued",
    icon: HiOutlineDocumentCheck,
  },
  {
    title: "Student ID Cards",
    description: "Manage student identity cards.",
    href: "/admin/students/id-cards",
    icon: HiOutlineIdentification,
  },
  {
    title: "Staff ID Cards",
    description: "Manage staff identity cards.",
    href: "/admin/certificates/staff-id-cards",
    icon: HiOutlineUsers,
  },
  {
    title: "Certificate Templates",
    description: "Manage certificate layouts and templates.",
    href: "/admin/certificates/templates",
    icon: HiOutlineDocumentCheck,
  },
  {
    title: "Certificate Settings",
    description: "Configure school details and certificate numbering.",
    href: "/admin/certificates/settings",
    icon: HiOutlineIdentification,
  },
];

export default function CertificateDashboardPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchCertificates = async () => {
    setLoading(true);
    setError("");

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("adminToken")
          : null;

      const response = await fetch(
        `${API_BASE}/certificates?page=1&limit=100`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || result._status === false) {
        throw new Error(
          result._message || "Unable to load certificates."
        );
      }

      const data = result._data;
      const rows = Array.isArray(data)
        ? data
        : data?.certificates || [];

      setCertificates(rows);
    } catch (err) {
      setError(
        err.message ||
          "Certificates load nahi ho paaye. Backend connection check karo."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const issuedCount = certificates.filter(
    (item) => item.status === "issued"
  ).length;

  const revokedCount = certificates.filter(
    (item) => item.status === "revoked"
  ).length;

  const studentCount = certificates.filter(
    (item) => item.recipientType === "student"
  ).length;

  const staffCount = certificates.filter(
    (item) => item.recipientType === "staff"
  ).length;

  const filteredCertificates = certificates.filter((item) => {
    const query = search.toLowerCase();

    return (
      (item.recipientName || "").toLowerCase().includes(query) ||
      (item.certificateNumber || "").toLowerCase().includes(query) ||
      (item.certificateType || "").toLowerCase().includes(query) ||
      (item.admissionNumber || "").toLowerCase().includes(query)
    );
  });

  const stats = [
    {
      title: "Total Certificates",
      value: certificates.length,
      icon: HiOutlineDocumentCheck,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Issued Certificates",
      value: issuedCount,
      icon: HiOutlineDocumentPlus,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Student Certificates",
      value: studentCount,
      icon: HiOutlineIdentification,
      color: "bg-violet-50 text-violet-700",
    },
    {
      title: "Staff Certificates",
      value: staffCount,
      icon: HiOutlineUsers,
      color: "bg-amber-50 text-amber-700",
    },
  ];

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 text-slate-800 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-sm font-medium text-emerald-700">
            SCHOOL ERP / ADMINISTRATION
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Certificates Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Issue, track and manage school certificates and identity cards.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchCertificates}
            disabled={loading}
            className="inline-flex items-center gap-2 border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
          >
            <HiOutlineArrowPath
              className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          <Link
            href="/admin/certificates/create"
            className="inline-flex items-center gap-2 bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            <HiOutlineDocumentPlus className="h-5 w-5" />
            Create Certificate
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col gap-3 border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <HiOutlineExclamationCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div>
              <p className="font-semibold text-red-800">
                Could not load certificates
              </p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>

          <button
            onClick={fetchCertificates}
            className="self-start border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 sm:self-auto"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {loading ? "—" : stat.value}
                  </p>
                </div>

                <div className={`p-3 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revoked summary */}
      <div className="flex flex-col gap-3 border border-orange-200 bg-orange-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-orange-900">
            Revoked Certificates
          </p>
          <p className="mt-1 text-sm text-orange-800">
            Certificates that are no longer valid.
          </p>
        </div>

        <p className="text-2xl font-bold text-orange-900">
          {loading ? "—" : revokedCount}
        </p>
      </div>

      {/* Management shortcuts */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Certificate Management
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Open a section to manage its records.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex min-h-36 items-start gap-4 border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-500 hover:shadow-md"
              >
                <div className="bg-emerald-50 p-3 text-emerald-700">
                  <Icon className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>

                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                    Open section
                    <HiOutlineArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent certificates */}
      <section className="border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-slate-900">
              Recent Certificates
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Recently created certificate records.
            </p>
          </div>

          <Link
            href="/admin/certificates/issued"
            className="inline-flex items-center gap-2 self-start text-sm font-semibold text-emerald-700 hover:text-emerald-900"
          >
            View all
            <HiOutlineArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="border-b border-slate-200 p-4">
          <div className="relative max-w-md">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, certificate number..."
              className="w-full border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">
                  Certificate No.
                </th>
                <th className="px-5 py-4 font-semibold">Recipient</th>
                <th className="px-5 py-4 font-semibold">Type</th>
                <th className="px-5 py-4 font-semibold">Issue Date</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 text-right font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    Loading certificates...
                  </td>
                </tr>
              ) : filteredCertificates.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center"
                  >
                    <HiOutlineDocumentCheck className="mx-auto h-9 w-9 text-slate-300" />

                    <p className="mt-3 font-semibold text-slate-700">
                      No certificates found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Create a certificate or try a different search.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCertificates.slice(0, 10).map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {item.certificateNumber || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {item.recipientName || "—"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.recipientType === "staff"
                          ? "Staff"
                          : "Student"}
                      </p>
                    </td>

                    <td className="px-5 py-4 capitalize text-slate-600">
                      {(item.certificateType || "other").replace(
                        /-/g,
                        " "
                      )}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(item.issueDate)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-semibold ${
                          item.status === "issued"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {item.status === "issued" ? "Issued" : "Revoked"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href="/admin/certificates/issued"
                        className="font-semibold text-emerald-700 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredCertificates.length > 0 && (
          <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
            Showing {Math.min(filteredCertificates.length, 10)} of{" "}
            {filteredCertificates.length} matching records from the loaded page.
          </div>
        )}
      </section>
    </div>
  );
}
