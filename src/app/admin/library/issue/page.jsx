
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, RotateCcw } from "lucide-react";
import { libraryApi } from "@/lib/libraryApi";

export default function LibraryReturnPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [returningId, setReturningId] = useState("");

  const loadIssues = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await libraryApi.getIssues();
      setIssues(
        (data.issues || []).filter((issue) => issue.status !== "Returned")
      );
    } catch (err) {
      setError(err.message || "Issue records load nahi hue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  async function handleReturn(issueId) {
    if (!window.confirm("Kya aap is book ko returned mark karna chahte hain?")) {
      return;
    }

    setError("");
    setMessage("");
    setReturningId(issueId);

    try {
      const data = await libraryApi.returnBook(issueId);
      setMessage(`Book return ho gayi. Fine: ₹${data.issue?.fine ?? 0}`);
      await loadIssues();
    } catch (err) {
      setError(err.message || "Book return nahi hui.");
    } finally {
      setReturningId("");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link
          href="/admin/library"
          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-800 hover:underline"
        >
          <ArrowLeft size={17} />
          Library Dashboard
        </Link>

        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Return Books</h1>
            <p className="mt-1 text-sm text-slate-500">
              Review pending returns and record returned books.
            </p>
          </div>

          <button
            type="button"
            onClick={loadIssues}
            className="inline-flex items-center justify-center gap-2 border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {error && (
          <p role="alert" className="bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {message && (
          <p className="bg-emerald-50 p-3 text-sm text-emerald-700">
            {message}
          </p>
        )}

        <section className="border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <h2 className="font-semibold">Pending Returns ({issues.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Book</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Fine</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Loading return records...
                    </td>
                  </tr>
                ) : issues.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No pending returns found.
                    </td>
                  </tr>
                ) : (
                  issues.map((issue) => (
                    <tr key={issue._id}>
                      <td className="px-4 py-4 font-medium">{issue.studentName}</td>
                      <td className="px-4 py-4">{issue.bookName}</td>
                      <td className="px-4 py-4">
                        {new Date(issue.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        ₹{issue.calculatedFine ?? issue.fine ?? 0}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold ${
                            issue.status === "Late"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {issue.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          disabled={returningId === issue._id}
                          onClick={() => handleReturn(issue._id)}
                          className="inline-flex items-center gap-1 border border-emerald-700 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-50"
                        >
                          <RotateCcw size={14} />
                          {returningId === issue._id ? "Processing..." : "Return"}
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
