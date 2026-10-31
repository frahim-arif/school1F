
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Search,
  RotateCcw,
  CheckCircle,
} from "lucide-react";
import { libraryApi } from "@/lib/libraryApi";

export default function ReturnBooksPage() {
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [returningId, setReturningId] = useState("");

  const loadIssues = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await libraryApi.getIssues(search);
      const allIssues = data.issues || [];

      setIssues(
        allIssues.filter(
          (issue) =>
            !issue.returned &&
            issue.status !== "Returned" &&
            !issue.returnDate
        )
      );
    } catch (err) {
      setError(err.message || "Issue records load nahi ho sake.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const handleReturn = async (issueId) => {
    const confirmed = window.confirm(
      "Kya aap is book ko returned mark karna chahte hain?"
    );

    if (!confirmed) return;

    try {
      setReturningId(issueId);
      setError("");
      setMessage("");

      await libraryApi.returnBook(issueId);

      setMessage("Book successfully return ho gayi.");
      await loadIssues();
    } catch (err) {
      setError(err.message || "Book return nahi ho saki.");
    } finally {
      setReturningId("");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/admin/library"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-900"
            >
              <ArrowLeft size={17} />
              Back to Library
            </Link>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Return Books
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage issued books and record their return.
            </p>
          </div>

          <Link
            href="/admin/library/issue"
            className="inline-flex items-center justify-center gap-2 border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100"
          >
            Issue a Book
          </Link>
        </div>

        {error && (
          <div
            role="alert"
            className="border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
          >
            <CheckCircle size={18} />
            {message}
          </div>
        )}

        <section className="border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold">Currently Issued Books</h2>
              <p className="mt-1 text-xs text-slate-500">
                Books awaiting return
              </p>
            </div>

            <div className="flex gap-2">
              <div className="flex items-center gap-2 border border-slate-300 px-3">
                <Search size={17} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search student or book..."
                  aria-label="Search issued books"
                  className="w-full py-2 text-sm outline-none sm:w-56"
                />
              </div>

              <button
                type="button"
                onClick={loadIssues}
                disabled={loading}
                title="Refresh"
                aria-label="Refresh issued books"
                className="border border-slate-300 px-3 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={loading ? "animate-spin" : ""}
                />
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
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-slate-500"
                    >
                      Loading issued books...
                    </td>
                  </tr>
                ) : issues.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-slate-500"
                    >
                      No pending book returns found.
                    </td>
                  </tr>
                ) : (
                  issues.map((issue) => (
                    <tr key={issue._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold">
                        {issue.book?.bookName ||
                          issue.bookName ||
                          "Book"}
                      </td>

                      <td className="px-5 py-4">
                        {issue.studentName || issue.student?.name || "—"}
                      </td>

                      <td className="px-5 py-4">
                        {issue.issueDate
                          ? new Date(issue.issueDate).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        {issue.dueDate
                          ? new Date(issue.dueDate).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleReturn(issue._id)}
                          disabled={returningId === issue._id}
                          className="inline-flex items-center gap-2 bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                        >
                          <RotateCcw size={15} />
                          {returningId === issue._id
                            ? "Returning..."
                            : "Return Book"}
                        </button>
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
