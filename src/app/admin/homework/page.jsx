
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus, Search, BookOpen, Clock3, CheckCircle2,
  FileText, Trash2, RefreshCw, AlertCircle
} from "lucide-react";
import { homeworkApi } from "@/lib/homeworkApi";

export default function HomeworkPage() {
  const [search, setSearch] = useState("");
  const [homework, setHomework] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [listResult, statsResult] = await Promise.all([
        homeworkApi.list({ status: "all", limit: 100 }),
        homeworkApi.stats(),
      ]);

      setHomework(listResult.data || []);
      setStats(statsResult.data || {});
    } catch (err) {
      setError(err.message || "Homework load nahi hua.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = homework.filter((item) => {
    const text = [
      item.title,
      item.description,
      item.subjectName,
      item.className,
    ].filter(Boolean).join(" ").toLowerCase();

    return text.includes(search.toLowerCase());
  });

  async function handleDelete(item) {
    if (!window.confirm(`"${item.title}" delete karna hai?`)) return;

    try {
      await homeworkApi.remove(item._id);
      setNotice("Homework delete ho gaya.");
      await loadData();
    } catch (err) {
      setError(err.message || "Delete nahi hua.");
    }
  }

  const cards = [
    {
      label: "Total Homework",
      value: stats.totalHomework ?? 0,
      icon: BookOpen,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Active Homework",
      value: stats.activeHomework ?? 0,
      icon: FileText,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Pending Submissions",
      value: stats.pendingSubmissions ?? 0,
      icon: Clock3,
      color: "text-orange-600 bg-orange-50",
    },
    {
      label: "Checked Submissions",
      value: stats.checkedSubmissions ?? 0,
      icon: CheckCircle2,
      color: "text-green-600 bg-green-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Homework Management
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Assign homework and manage student submissions.
          </p>
        </div>

        <Link
          href="/admin/homework/create"
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-lg hover:bg-indigo-700"
        >
          <Plus size={18} />
          Create Homework
        </Link>
      </div>

      {notice && (
        <div className="rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700">
          {notice}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
          <button onClick={loadData} className="ml-auto font-bold underline">
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">{label}</p>
              <div className={`rounded-xl p-3 ${color}`}>
                <Icon size={22} />
              </div>
            </div>
            <h2 className="mt-4 text-3xl font-black text-slate-800">
              {loading ? "—" : value}
            </h2>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-black text-slate-800">
            All Homework
          </h2>

          <div className="flex items-center gap-2 rounded-xl border px-4 py-2">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search homework..."
              className="min-w-0 outline-none"
            />
            <button onClick={loadData} title="Refresh">
              <RefreshCw size={17} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                {["Homework", "Class ID", "Subject ID", "Due Date", "Status", "Action"].map((heading) => (
                  <th key={heading} className="whitespace-nowrap px-5 py-4">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    Koi homework nahi mila. Create Homework par click karein.
                  </td>
                </tr>
              )}

              {filtered.map((item) => (
                <tr key={item._id} className="border-t hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-800">{item.title}</p>
                    <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                      {item.description || "No description"}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {item.className || item.classId}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {item.subjectName || item.subjectId}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                    {item.dueDate
                      ? new Date(item.dueDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      item.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleDelete(item)}
                      className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                      title="Delete homework"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    Homework load ho raha hai...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
