
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Search } from "lucide-react";
import { libraryApi } from "@/lib/libraryApi";

export default function OverdueBooksPage() {
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadIssues = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await libraryApi.getIssues(search);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      setIssues(
        (data.issues || []).filter((issue) => {
          if (
            issue.returned ||
            issue.status === "Returned" ||
            issue.returnDate ||
            !issue.dueDate
          ) {
            return false;
          }

          const due = new Date(issue.dueDate);
          if (Number.isNaN(due.getTime())) return false;
          due.setHours(0, 0, 0, 0);

          return due < today;
        })
      );
    } catch (err) {
      setError(err.message || "Overdue books load nahi ho sakin.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const daysOverdue = (date) => {
    const due = new Date(date);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return Math.floor((today - due) / 86400000);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <Link href="/admin/library"
            className="mb-3 inline-flex items-center gap-2 text-sm text-emerald-700">
            <ArrowLeft size={17} /> Back to Library
          </Link>
          <h1 className="text-2xl font-bold sm:text-3xl">Overdue Books</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track books that have passed their due date and remain unreturned.
          </p>
        </div>

        {error && (
          <div role="alert" className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="border border-slate-200 bg-white">
          <div className="flex flex-col justify-between gap-3 border-b p-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold">Overdue Records</h2>
              <p className="mt-1 text-sm text-slate-500">
                {loading ? "Loading..." : `${issues.length} overdue books`}
              </p>
            </div>

            <div className="flex gap-2">
              <div className="flex items-center gap-2 border px-3">
                <Search size={17} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search book or student..."
                  className="w-full py-2 text-sm outline-none sm:w-56"
                />
              </div>
              <button
                onClick={loadIssues}
                disabled={loading}
                aria-label="Refresh overdue books"
                className="border px-3 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Book</th>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Issue Date</th>
                  <th className="px-5 py-3">Due Date</th>
                  <th className="px-5 py-3">Days Overdue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center">Loading overdue books...</td></tr>
                ) : issues.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">No overdue books found.</td></tr>
                ) : (
                  issues.map((issue) => (
                    <tr key={issue._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold">
                        {issue.book?.bookName || issue.bookName || "Book"}
                      </td>
                      <td className="px-5 py-4">
                        {issue.studentName || issue.student?.name || "—"}
                      </td>
                      <td className="px-5 py-4">
                        {issue.issueDate ? new Date(issue.issueDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-4">
                        {new Date(issue.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <span className="bg-red-50 px-3 py-1 font-semibold text-red-700">
                          {daysOverdue(issue.dueDate)} days
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
