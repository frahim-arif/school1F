
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Bell,
  Megaphone,
  CheckCircle2,
  Clock3,
  Trash2,
  RefreshCw,
  Eye,
  AlertCircle,
} from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function NoticesPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [notices, setNotices] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    drafts: 0,
    views: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [noticeResponse, statsResponse] = await Promise.all([
        fetch(
          `${API_BASE}/api/notices?search=${encodeURIComponent(search)}`
        ),
        fetch(`${API_BASE}/api/notices/stats`),
      ]);

      const noticeData = await noticeResponse.json();
      const statsData = await statsResponse.json();

      if (!noticeResponse.ok || !noticeData.success) {
        throw new Error(
          noticeData.message || "Unable to load notices."
        );
      }

      setNotices(noticeData.notices || []);

      if (statsResponse.ok && statsData.success) {
        setStats({
          total: statsData.stats.total ?? 0,
          active: statsData.stats.active ?? 0,
          expired: statsData.stats.expired ?? 0,
          drafts: statsData.stats.drafts ?? 0,
          views: statsData.stats.views ?? 0,
        });
      }
    } catch (err) {
      console.error("Notice loading error:", err);
      setError(
        err.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotices();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchNotices]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notice?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/notices/${id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete notice.");
      }

      await fetchNotices();
    } catch (err) {
      setError(err.message || "Unable to delete notice.");
    } finally {
      setDeletingId(null);
    }
  };

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

  const formatViews = (views) =>
    new Intl.NumberFormat("en-IN", {
      notation: views >= 1000 ? "compact" : "standard",
      maximumFractionDigits: 1,
    }).format(views);

  const getStatusClass = (status) => {
    if (status === "Active") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Draft") {
      return "bg-amber-100 text-amber-700";
    }

    return "bg-red-100 text-red-700";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="
        flex flex-col gap-4
        md:flex-row md:items-center md:justify-between
        "
      >
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Notice Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage school announcements and notifications
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={fetchNotices}
            disabled={loading}
            className="
              flex items-center gap-2 rounded-xl border
              bg-white px-4 py-3 font-bold text-slate-700
              hover:bg-slate-50 disabled:opacity-50
            "
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/notices/create")}
            className="
              flex items-center gap-2 rounded-xl
              bg-indigo-600 px-5 py-3 font-bold text-white
              shadow-lg shadow-indigo-200 hover:bg-indigo-700
            "
          >
            <Plus size={18} />
            Create Notice
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button
            type="button"
            onClick={fetchNotices}
            className="font-bold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-slate-500">
              Total Notices
            </p>
            <Megaphone size={22} className="text-indigo-600" />
          </div>

          <h2 className="mt-3 text-3xl font-black text-slate-800">
            {loading ? "—" : stats.total.toLocaleString("en-IN")}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-slate-500">
              Active
            </p>
            <CheckCircle2 size={22} className="text-green-600" />
          </div>

          <h2 className="mt-3 text-3xl font-black text-green-600">
            {loading ? "—" : stats.active.toLocaleString("en-IN")}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-slate-500">
              Expired
            </p>
            <Clock3 size={22} className="text-orange-500" />
          </div>

          <h2 className="mt-3 text-3xl font-black text-orange-500">
            {loading ? "—" : stats.expired.toLocaleString("en-IN")}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-slate-500">
              Views
            </p>
            <Bell size={22} className="text-purple-600" />
          </div>

          <h2 className="mt-3 text-3xl font-black text-purple-600">
            {loading ? "—" : formatViews(stats.views)}
          </h2>
        </div>
      </div>

      {/* Notice Table */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div
          className="
          flex flex-col gap-3 border-b p-5
          md:flex-row md:items-center md:justify-between
          "
        >
          <div>
            <h2 className="text-lg font-black text-slate-800">
              Notice List
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {notices.length} notice
              {notices.length === 1 ? "" : "s"} loaded
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border px-4 py-2">
            <Search size={18} className="shrink-0 text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notice..."
              className="w-full min-w-0 bg-transparent text-sm outline-none md:w-56"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="px-6 py-4">Notice Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Views</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && notices.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    <RefreshCw
                      size={22}
                      className="mx-auto mb-3 animate-spin"
                    />
                    Loading notices...
                  </td>
                </tr>
              )}

              {!loading && notices.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center"
                  >
                    <Megaphone
                      size={32}
                      className="mx-auto mb-3 text-slate-300"
                    />
                    <p className="font-bold text-slate-700">
                      No notices found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Create a notice or try another search.
                    </p>
                  </td>
                </tr>
              )}

              {notices.map((item) => (
                <tr
                  key={item._id}
                  className="border-t hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">
                      {item.title}
                    </p>

                    {item.audience && (
                      <p className="mt-1 text-xs text-slate-500">
                        Audience: {item.audience}
                      </p>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                      {item.category || "General"}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    {formatDate(item.publishDate)}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(item.status)}`}
                    >
                      {item.status || "Active"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Eye size={15} />
                      {formatViews(item.views || 0)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        title="View notice"
                        onClick={() =>
                          router.push(`/admin/notices/${item._id}`)
                        }
                        className="rounded-lg border p-2 text-slate-600 hover:bg-slate-100"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        type="button"
                        title="Delete notice"
                        disabled={deletingId === item._id}
                        onClick={() => handleDelete(item._id)}
                        className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
