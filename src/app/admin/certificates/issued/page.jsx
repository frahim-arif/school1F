
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowPath,
  HiOutlineMagnifyingGlass,
  HiOutlineDocumentPlus,
  HiOutlineEye,
  HiOutlineNoSymbol,
  HiOutlineXMark,
  HiOutlineExclamationCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com/api";

const inputClass =
  "w-full border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600";

const certificateLabels = {
  bonafide: "Bonafide",
  transfer: "Transfer",
  character: "Character",
  study: "Study",
  birth: "Birth",
  achievement: "Achievement",
  other: "Other",
};

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

export default function IssuedCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");
  const [certificateType, setCertificateType] = useState("");
  const [recipientType, setRecipientType] = useState("");
  const [status, setStatus] = useState("");
  const [session, setSession] = useState("");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("adminToken")
          : null;

      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });

      if (search.trim()) params.set("search", search.trim());
      if (certificateType) params.set("certificateType", certificateType);
      if (recipientType) params.set("recipientType", recipientType);
      if (status) params.set("status", status);
      if (session.trim()) params.set("session", session.trim());

      const response = await fetch(
        `${API_BASE}/certificates?${params.toString()}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || result._status === false) {
        throw new Error(result._message || "Unable to load certificates.");
      }

      const data = result._data;
      setCertificates(
        Array.isArray(data) ? data : data?.certificates || []
      );

      setPagination(
        data?.pagination || {
          total: Array.isArray(data) ? data.length : 0,
          page,
          limit: 10,
          totalPages: 1,
        }
      );
    } catch (err) {
      setError(err.message || "Certificates load nahi ho paaye.");
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, certificateType, recipientType, status, session]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const resetFilters = () => {
    setSearch("");
    setCertificateType("");
    setRecipientType("");
    setStatus("");
    setSession("");
    setPage(1);
    setNotice("");
  };

  const openDetails = async (item) => {
    setSelected(item);

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${API_BASE}/certificates/single/${item._id}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || result._status === false) {
        throw new Error(result._message || "Could not load certificate details.");
      }

      setSelected(result._data || item);
    } catch (err) {
      setNotice(err.message || "Details load nahi ho paaye.");
    }
  };

  const revokeCertificate = async (event) => {
    event.preventDefault();

    if (!revokeTarget || !revokeReason.trim()) {
      setNotice("Revocation reason enter karein.");
      return;
    }

    setActionLoading(true);
    setNotice("");

    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `${API_BASE}/certificates/${revokeTarget._id}/revoke`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            revokedReason: revokeReason.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || result._status === false) {
        throw new Error(result._message || "Certificate revoke nahi hua.");
      }

      setRevokeTarget(null);
      setRevokeReason("");
      setSelected(null);
      setNotice("Certificate successfully revoked.");
      await fetchCertificates();
    } catch (err) {
      setNotice(err.message || "Certificate revoke nahi ho paaya.");
    } finally {
      setActionLoading(false);
    }
  };

  const issuedCount = certificates.filter(
    (item) => item.status === "issued"
  ).length;

  const revokedCount = certificates.filter(
    (item) => item.status === "revoked"
  ).length;

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 text-slate-800 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/admin/certificates"
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
          >
            <HiOutlineArrowLeft className="h-4 w-4" />
            Certificates Dashboard
          </Link>

          <p className="text-sm font-medium text-emerald-700">
            SCHOOL ERP / CERTIFICATES
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            Issued Certificates
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Search, review and manage certificate records.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchCertificates}
            disabled={loading}
            className="inline-flex items-center gap-2 border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 disabled:opacity-60"
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

      {notice && (
        <div className="flex items-start justify-between gap-3 border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p>{notice}</p>
          <button
            onClick={() => setNotice("")}
            aria-label="Dismiss message"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <HiOutlineExclamationCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Unable to load certificates</p>
            <p className="mt-1">{error}</p>
            <button
              onClick={fetchCertificates}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            title: "Matching Records",
            value: pagination.total,
            color: "text-slate-900",
          },
          {
            title: "Issued on This Page",
            value: issuedCount,
            color: "text-emerald-700",
          },
          {
            title: "Revoked on This Page",
            value: revokedCount,
            color: "text-red-700",
          },
        ].map((stat) => (
          <div
            key={stat.title}
            className="border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{stat.title}</p>
            <p className={`mt-3 text-3xl font-bold ${stat.color}`}>
              {loading ? "—" : stat.value}
            </p>
          </div>
        ))}
      </div>

      <section className="border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-bold text-slate-900">Search & Filters</h2>
          <p className="mt-1 text-sm text-slate-500">
            Filters are applied to the backend query.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Search
            </label>
            <div className="relative">
              <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Name, number, admission no."
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Certificate Type
            </label>
            <select
              value={certificateType}
              onChange={(e) => {
                setCertificateType(e.target.value);
                setPage(1);
              }}
              className={inputClass}
            >
              <option value="">All certificate types</option>
              {Object.entries(certificateLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Recipient
            </label>
            <select
              value={recipientType}
              onChange={(e) => {
                setRecipientType(e.target.value);
                setPage(1);
              }}
              className={inputClass}
            >
              <option value="">Students & staff</option>
              <option value="student">Students</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className={inputClass}
            >
              <option value="">All statuses</option>
              <option value="issued">Issued</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Academic Session
            </label>
            <input
              value={session}
              onChange={(e) => {
                setSession(e.target.value);
                setPage(1);
              }}
              placeholder="e.g. 2026-2027"
              className={inputClass}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              type="button"
              className="w-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      <section className="border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-slate-900">Certificate Records</h2>
            <p className="mt-1 text-sm text-slate-500">
              {pagination.total} matching record(s)
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Page {pagination.page || page} of {pagination.totalPages || 1}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Certificate No.</th>
                <th className="px-5 py-4 font-semibold">Recipient</th>
                <th className="px-5 py-4 font-semibold">Type</th>
                <th className="px-5 py-4 font-semibold">Session</th>
                <th className="px-5 py-4 font-semibold">Issue Date</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    Loading certificate records...
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <p className="font-semibold text-slate-700">
                      No certificates found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Change your filters or create a new certificate.
                    </p>
                  </td>
                </tr>
              ) : (
                certificates.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {item.certificateNumber || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {item.recipientName || "—"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.recipientType === "staff" ? "Staff" : "Student"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {certificateLabels[item.certificateType] || "Other"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {item.session || "—"}
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

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openDetails(item)}
                          className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
                        >
                          <HiOutlineEye className="h-4 w-4" />
                          Details
                        </button>

                        {item.status === "issued" && (
                          <button
                            onClick={() => {
                              setRevokeTarget(item);
                              setRevokeReason("");
                              setNotice("");
                            }}
                            className="inline-flex items-center gap-1 font-semibold text-red-700 hover:underline"
                          >
                            <HiOutlineNoSymbol className="h-4 w-4" />
                            Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-500">
            Page {pagination.page || page} of {Math.max(1, pagination.totalPages || 1)}
          </p>

          <div className="flex gap-2">
            <button
              disabled={loading || page <= 1}
              onClick={() => setPage((previous) => Math.max(1, previous - 1))}
              className="inline-flex items-center gap-1 border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-40"
            >
              <HiOutlineChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <button
              disabled={
                loading ||
                page >= Math.max(1, pagination.totalPages || 1)
              }
              onClick={() => setPage((previous) => previous + 1)}
              className="inline-flex items-center gap-1 border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-40"
            >
              Next
              <HiOutlineChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-slate-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Certificate Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selected.certificateNumber}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close details"
                className="p-2 hover:bg-slate-100"
              >
                <HiOutlineXMark className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              {[
                ["Recipient", selected.recipientName],
                ["Recipient Type", selected.recipientType],
                ["Certificate Type", certificateLabels[selected.certificateType]],
                ["Admission Number", selected.admissionNumber],
                ["Class", selected.className],
                ["Session", selected.session],
                ["Issue Date", formatDate(selected.issueDate)],
                ["Status", selected.status],
                ["Purpose", selected.purpose],
                ["Remarks", selected.remarks],
                ["Template", selected.templateName],
                ["Revocation Reason", selected.revokedReason],
              ].map(([label, value]) => (
                <div key={label} className="border border-slate-200 p-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    {label}
                  </p>
                  <p className="mt-1 break-words text-sm font-medium text-slate-800">
                    {value || "—"}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end border-t border-slate-200 p-5">
              <button
                onClick={() => setSelected(null)}
                className="border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {revokeTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => {
            if (!actionLoading) setRevokeTarget(null);
          }}
        >
          <form
            onSubmit={revokeCertificate}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg border border-slate-200 bg-white shadow-xl"
          >
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-bold text-slate-900">
                Revoke Certificate
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Certificate: {revokeTarget.certificateNumber}
              </p>
            </div>

            <div className="space-y-3 p-5">
              <p className="text-sm text-slate-700">
                Revoking this certificate marks it as no longer valid.
              </p>

              <label className="block text-sm font-semibold text-slate-700">
                Reason for revocation *
              </label>
              <textarea
                required
                minLength={3}
                maxLength={1000}
                rows={4}
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="Enter the reason..."
                className={inputClass}
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 p-5">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setRevokeTarget(null)}
                className="border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={actionLoading || !revokeReason.trim()}
                className="bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
              >
                {actionLoading ? "Revoking..." : "Confirm Revoke"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
