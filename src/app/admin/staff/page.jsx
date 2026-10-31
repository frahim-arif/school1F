
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Users,
  GraduationCap,
  UserRoundCog,
  CheckCircle2,
  RefreshCw,
  UserX,
} from "lucide-react";

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(
    /\/$/,
    ""
  );

function getStaffName(staff) {
  return (
    staff.name ||
    [staff.firstName, staff.lastName].filter(Boolean).join(" ") ||
    "Unnamed Staff"
  );
}

function isTeacher(staff) {
  const designation = String(staff.designation || staff.role || "").toLowerCase();
  const department = String(staff.department || "").toLowerCase();

  return (
    designation.includes("teacher") ||
    designation.includes("tutor") ||
    department.includes("teaching")
  );
}

function getStaffType(staff) {
  return isTeacher(staff) ? "Teacher" : "Non Teaching";
}

export default function StaffPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState("");

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/staff`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Staff list load nahi ho saki.");
      }

      setStaff(Array.isArray(data.staff) ? data.staff : []);
    } catch (err) {
      setError(
        err.message ||
          "Backend se connection nahi ho saka. API URL aur server check karein."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const filteredStaff = staff.filter((item) => {
    const searchText = search.toLowerCase().trim();

    const searchableText = [
      getStaffName(item),
      item.staffId,
      item.designation,
      item.role,
      item.department,
      item.phone,
      item.email,
      item.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(searchText);
  });

  const totalStaff = staff.length;
  const teachers = staff.filter(isTeacher).length;
  const nonTeaching = totalStaff - teachers;
  const activeStaff = staff.filter((item) => item.status === "Active").length;

  async function deactivateStaff(item) {
    const staffName = getStaffName(item);

    if (
      !window.confirm(
        `Kya aap ${staffName} ko inactive karna chahte hain?`
      )
    ) {
      return;
    }

    setActionId(item._id);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/staff/${item._id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Staff inactive nahi ho saka.");
      }

      await loadStaff();
    } catch (err) {
      setError(err.message || "Staff update nahi ho saka.");
    } finally {
      setActionId("");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Staff Management
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage teachers and school staff records
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadStaff}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/staff/create")}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700"
          >
            <Plus size={18} />
            Add Staff
          </button>
        </div>
      </div>

      {/* API Error */}
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={loadStaff}
            className="shrink-0 font-bold underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Staff"
          value={totalStaff}
          icon={Users}
          iconClass="text-indigo-600"
        />

        <StatCard
          title="Teachers"
          value={teachers}
          icon={GraduationCap}
          iconClass="text-green-600"
          valueClass="text-green-600"
        />

        <StatCard
          title="Non Teaching"
          value={nonTeaching}
          icon={UserRoundCog}
          iconClass="text-orange-500"
          valueClass="text-orange-500"
        />

        <StatCard
          title="Active Staff"
          value={activeStaff}
          icon={CheckCircle2}
          iconClass="text-purple-600"
          valueClass="text-purple-600"
        />
      </div>

      {/* Staff Table */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-800">Staff List</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredStaff.length} staff record(s)
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border px-4 py-2">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff..."
              aria-label="Search staff"
              className="w-full min-w-0 text-sm outline-none md:w-56"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Loading staff records...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users className="mx-auto mb-3 text-slate-300" size={32} />
                    <p className="font-bold text-slate-700">
                      {search ? "No matching staff found" : "No staff records yet"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {search
                        ? "Search ka naam ya phone number check karein."
                        : "Add Staff button se pehla staff record banayein."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">
                        {getStaffName(item)}
                      </p>
                      {item.staffId && (
                        <p className="mt-1 text-xs text-slate-400">
                          ID: {item.staffId}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {item.designation || item.role || "—"}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {getStaffType(item)}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {item.phone || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          item.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.status || "Active"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {item.status === "Inactive" ? (
                        <span className="text-xs text-slate-400">
                          Inactive
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => deactivateStaff(item)}
                          disabled={actionId === item._id}
                          title="Deactivate staff"
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <UserX size={14} />
                          {actionId === item._id ? "Please wait..." : "Deactivate"}
                        </button>
                      )}
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

function StatCard({ title, value, icon: Icon, iconClass, valueClass = "" }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <Icon size={22} className={iconClass} />
      </div>
      <h2 className={`mt-3 text-3xl font-black ${valueClass}`}>{value}</h2>
    </div>
  );
}
