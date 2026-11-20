
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  CalendarDays,
  Clock3,
  CheckCircle2,
  XCircle,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Trash2,
  RefreshCw,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/+$/, "");

const API_URL = API_BASE.endsWith("/api")
  ? `${API_BASE}/leaves`
  : `${API_BASE}/api/leaves`;

const initialForm = {
  name: "",
  role: "Teacher",
  leaveType: "Casual Leave",
  fromDate: "",
  toDate: "",
  reason: "",
};

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getErrorMessage = (data, fallback) =>
  data?.message || fallback;

export default function LeavePage() {
  const [leaves, setLeaves] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          getErrorMessage(data, "Failed to fetch leave requests")
        );
      }

      setLeaves(Array.isArray(data.leaves) ? data.leaves : []);
      setSummary(
        data.summary || {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        }
      );
    } catch (err) {
      setError(
        err.message || "Backend se connection nahi ho paya."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const filteredLeaves = leaves.filter((leave) => {
    const searchText = search.trim().toLowerCase();

    return [
      leave.name,
      leave.role,
      leave.leaveType,
      leave.status,
    ].some((value) =>
      String(value || "").toLowerCase().includes(searchText)
    );
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateLeave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.name.trim() ||
      !form.fromDate ||
      !form.toDate
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (form.toDate < form.fromDate) {
      setError("End date cannot be before start date.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          getErrorMessage(data, "Failed to create leave request")
        );
      }

      setForm(initialForm);
      setShowForm(false);
      setSuccess("Leave request added successfully.");

      await fetchLeaves();
    } catch (err) {
      setError(err.message || "Could not create leave request.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (leave, status) => {
    if (leave.status === status) return;

    setError("");
    setSuccess("");
    setUpdatingId(leave._id);

    try {
      const response = await fetch(
        `${API_URL}/${leave._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          getErrorMessage(data, "Failed to update leave status")
        );
      }

      setSuccess(`Leave ${status.toLowerCase()} successfully.`);
      await fetchLeaves();
    } catch (err) {
      setError(err.message || "Could not update leave status.");
    } finally {
      setUpdatingId("");
    }
  };

  const handleDelete = async (leave) => {
    const confirmed = window.confirm(
      `Delete leave request for ${leave.name}?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingId(leave._id);

    try {
      const response = await fetch(`${API_URL}/${leave._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          getErrorMessage(data, "Failed to delete leave request")
        );
      }

      setSuccess("Leave request deleted successfully.");
      await fetchLeaves();
    } catch (err) {
      setError(err.message || "Could not delete leave request.");
    } finally {
      setDeletingId("");
    }
  };

  const statusStyle = (status) => {
    if (status === "Approved") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-orange-100 text-orange-700";
  };

  const statCards = [
    {
      title: "Total Requests",
      count: summary.total,
      icon: Clock3,
      color: "text-indigo-600",
    },
    {
      title: "Pending",
      count: summary.pending,
      icon: Clock3,
      color: "text-orange-500",
    },
    {
      title: "Approved",
      count: summary.approved,
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      title: "Rejected",
      count: summary.rejected,
      icon: XCircle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Leave Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage teacher and staff leave requests
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={fetchLeaves}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => {
              setError("");
              setSuccess("");
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700"
          >
            <Plus size={18} />
            <CalendarDays size={18} />
            Add Leave
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Close error"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 size={20} />
          <span className="flex-1">{success}</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Close success message"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-500">
                  {card.title}
                </p>
                <Icon size={22} className={card.color} />
              </div>

              <h2 className={`mt-3 text-3xl font-black ${card.color}`}>
                {loading ? "—" : card.count}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Add Leave Form */}
      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-800">
                Add Leave Request
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter employee and leave details
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close form"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleCreateLeave} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Employee Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="Enter employee name"
                  required
                  maxLength={100}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Role *
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
                >
                  <option value="Teacher">Teacher</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Staff">Staff</option>
                  <option value="Principal">Principal</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Leave Type *
                </label>
                <select
                  name="leaveType"
                  value={form.leaveType}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
                >
                  <option value="Medical Leave">Medical Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Personal Leave">Personal Leave</option>
                  <option value="Earned Leave">Earned Leave</option>
                  <option value="Maternity Leave">Maternity Leave</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  From Date *
                </label>
                <input
                  type="date"
                  name="fromDate"
                  value={form.fromDate}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  To Date *
                </label>
                <input
                  type="date"
                  name="toDate"
                  value={form.toDate}
                  min={form.fromDate || undefined}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-1">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Reason
                </label>
                <input
                  name="reason"
                  value={form.reason}
                  onChange={handleFormChange}
                  placeholder="Reason for leave"
                  maxLength={1000}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(initialForm);
                }}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <Loader2 size={17} className="animate-spin" />
                )}
                {saving ? "Saving..." : "Save Leave"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leave Requests Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-800">
              Leave Requests
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredLeaves.length} request(s) displayed
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 focus-within:border-indigo-400">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee..."
              className="min-w-0 text-sm outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={16} className="text-slate-400" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="whitespace-nowrap px-6 py-4">Employee</th>
                <th className="whitespace-nowrap px-6 py-4">Role</th>
                <th className="whitespace-nowrap px-6 py-4">Leave Type</th>
                <th className="whitespace-nowrap px-6 py-4">Date</th>
                <th className="whitespace-nowrap px-6 py-4">Days</th>
                <th className="whitespace-nowrap px-6 py-4">Status</th>
                <th className="whitespace-nowrap px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2
                      size={25}
                      className="mx-auto animate-spin text-indigo-600"
                    />
                    <p className="mt-3 text-sm text-slate-500">
                      Loading leave requests...
                    </p>
                  </td>
                </tr>
              ) : filteredLeaves.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    {search
                      ? "No matching leave requests found."
                      : "No leave requests found. Click Add Leave to create one."}
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => (
                  <tr
                    key={leave._id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-bold text-slate-800">
                      {leave.name}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      {leave.role}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      {leave.leaveType}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      {formatDate(leave.fromDate)}
                      <br />
                      <span className="text-xs text-slate-400">
                        to {formatDate(leave.toDate)}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {leave.days}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle(
                          leave.status
                        )}`}
                      >
                        {leave.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {leave.status !== "Approved" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(leave, "Approved")
                            }
                            disabled={
                              updatingId === leave._id ||
                              deletingId === leave._id
                            }
                            className="rounded-lg bg-green-100 px-3 py-2 text-xs font-bold text-green-700 hover:bg-green-200 disabled:opacity-50"
                          >
                            {updatingId === leave._id
                              ? "Saving..."
                              : "Approve"}
                          </button>
                        )}

                        {leave.status !== "Rejected" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(leave, "Rejected")
                            }
                            disabled={
                              updatingId === leave._id ||
                              deletingId === leave._id
                            }
                            className="rounded-lg bg-red-100 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-200 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}

                        <button
                          type="button"
                          title="Delete leave request"
                          onClick={() => handleDelete(leave)}
                          disabled={
                            deletingId === leave._id ||
                            updatingId === leave._id
                          }
                          className="rounded-lg bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 disabled:opacity-50"
                        >
                          {deletingId === leave._id ? (
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
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
      </div>
    </div>
  );
}
