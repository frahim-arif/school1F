
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  Users,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const LIST_URL = "/admin/front-office/admission-enquiry";
const API_URL = `${API_BASE}/api/front-office/enquiries`;

const STATUS_OPTIONS = [
  "New",
  "Contacted",
  "Follow-up",
  "Admitted",
  "Rejected",
];

const SOURCE_OPTIONS = [
  "Walk-in",
  "Phone",
  "Website",
  "Referral",
  "Other",
];

const STATUS_STYLES = {
  New: "bg-blue-50 text-blue-700",
  Contacted: "bg-cyan-50 text-cyan-700",
  "Follow-up": "bg-amber-50 text-amber-700",
  Admitted: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-rose-50 text-rose-700",
};

export default function AdmissionEnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });

      if (search.trim()) params.set("search", search.trim());
      if (status) params.set("status", status);
      if (source) params.set("source", source);

      const response = await fetch(`${API_URL}?${params.toString()}`);
      const result = await response.json();

      if (!response.ok || result._status === false) {
        throw new Error(
          result._message || "Admission enquiries load nahi ho sakin."
        );
      }

      const data = result._data;
      const items = Array.isArray(data)
        ? data
        : data?.items || data?.enquiries || [];

      const meta = Array.isArray(data)
        ? { page, totalPages: 1, total: items.length }
        : data?.pagination || data?.meta || {};

      setEnquiries(items);
      setPagination({
        page: Number(meta.page || page),
        totalPages: Math.max(1, Number(meta.totalPages || 1)),
        total: Number(meta.total ?? items.length),
      });
    } catch (err) {
      setEnquiries([]);
      setError(err.message || "Backend server se connection nahi ho saka.");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, source]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Kya aap "${item.studentName || "is student"}" ki admission enquiry delete karna chahte hain?`
    );

    if (!confirmed) return;

    setDeletingId(item._id);
    setError("");

    try {
      const response = await fetch(`${API_URL}/${item._id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || result._status === false) {
        throw new Error(result._message || "Enquiry delete nahi ho saki.");
      }

      // Last record delete hone par previous page par chalein.
      if (enquiries.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await fetchEnquiries();
      }
    } catch (err) {
      window.alert(err.message || "Delete karte waqt error aaya.");
    } finally {
      setDeletingId("");
    }
  };

  const currentPage = Number(pagination.page || page);
  const totalPages = Math.max(1, Number(pagination.totalPages || 1));
  const total = Number(pagination.total ?? enquiries.length);

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-700">
              Front Office / Admissions
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Admission Enquiries
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Student admission enquiries ko manage karein.
            </p>
          </div>

          <Link
            href={`${LIST_URL}/create`}
            className="inline-flex items-center justify-center gap-2 bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800"
          >
            <Plus size={18} />
            Add Enquiry
          </Link>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 border border-slate-200 bg-white p-5">
            <div className="bg-cyan-50 p-3 text-cyan-700">
              <Users size={23} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Loaded Enquiries</p>
              <p className="text-2xl font-bold">{enquiries.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 border border-slate-200 bg-white p-5">
            <div className="bg-blue-50 p-3 text-blue-700">
              <Search size={23} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Matching Records</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <section className="border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="relative md:col-span-2">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search student, guardian, phone..."
                  className="w-full border border-slate-300 py-3 pl-10 pr-3 text-sm outline-none focus:border-cyan-600"
                />
              </div>

              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-cyan-600"
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                value={source}
                onChange={(e) => {
                  setSource(e.target.value);
                  setPage(1);
                }}
                className="border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-cyan-600"
              >
                <option value="">All Sources</option>
                {SOURCE_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={fetchEnquiries}
                disabled={loading}
                className="inline-flex items-center gap-2 border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="m-4 flex items-start gap-3 border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Data load nahi hua</p>
                <p className="mt-1">{error}</p>
                <p className="mt-1">
                  Backend server, API route aur CORS settings check karein.
                </p>
              </div>
            </div>
          )}

          {/* Enquiries table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-5 py-4">Student</th>
                  <th className="px-5 py-4">Guardian</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Class</th>
                  <th className="px-5 py-4">Source</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      Loading enquiries...
                    </td>
                  </tr>
                ) : enquiries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center">
                      <Users
                        size={32}
                        className="mx-auto mb-3 text-slate-300"
                      />
                      <p className="font-semibold text-slate-700">
                        Koi enquiry nahi mili
                      </p>
                      <p className="mt-1 text-slate-500">
                        Search/filter badlein ya nayi enquiry add karein.
                      </p>
                    </td>
                  </tr>
                ) : (
                  enquiries.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {item.studentName || "—"}
                      </td>
                      <td className="px-5 py-4">
                        {item.guardianName || "—"}
                      </td>
                      <td className="px-5 py-4">{item.phone || "—"}</td>
                      <td className="px-5 py-4">
                        {item.classApplying || "—"}
                      </td>
                      <td className="px-5 py-4">{item.source || "—"}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-semibold ${
                            STATUS_STYLES[item.status] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item.status || "New"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString(
                              "en-IN"
                            )
                          : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`${LIST_URL}/${item._id}`}
                            title="View enquiry"
                            aria-label={`View ${item.studentName || "enquiry"}`}
                            className="border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                          >
                            <Eye size={16} />
                          </Link>

                          <Link
                            href={`${LIST_URL}/${item._id}/edit`}
                            title="Edit enquiry"
                            aria-label={`Edit ${item.studentName || "enquiry"}`}
                            className="border border-slate-200 p-2 text-cyan-700 hover:bg-cyan-50"
                          >
                            <Pencil size={16} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={deletingId === item._id}
                            title="Delete enquiry"
                            aria-label={`Delete ${item.studentName || "enquiry"}`}
                            className="border border-slate-200 p-2 text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === item._id ? (
                              <RefreshCw size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Page {currentPage} of {totalPages} · {total} records
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="inline-flex items-center gap-1 border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((value) => value + 1)}
                className="inline-flex items-center gap-1 border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
