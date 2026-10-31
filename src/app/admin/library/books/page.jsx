
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Search, RefreshCw } from "lucide-react";
import { libraryApi } from "@/lib/libraryApi";

export default function LibraryBooksPage() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await libraryApi.getBooks(search);
      setBooks(data.books || []);
    } catch (err) {
      setError(err.message || "Books load nahi ho sakin.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

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

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">All Books</h1>
            <p className="mt-1 text-sm text-slate-500">
              View and search your library inventory.
            </p>
          </div>

          <Link
            href="/admin/library/create"
            className="inline-flex items-center justify-center gap-2 bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            <Plus size={18} />
            Add Book
          </Link>
        </div>

        {error && (
          <p role="alert" className="bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <section className="border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold">Book Inventory ({books.length})</p>

            <div className="flex gap-2">
              <div className="flex items-center gap-2 border border-slate-300 px-3">
                <Search size={17} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search books..."
                  className="w-full py-2 text-sm outline-none sm:w-64"
                />
              </div>

              <button
                type="button"
                onClick={loadBooks}
                title="Refresh books"
                className="border border-slate-300 px-3 hover:bg-slate-50"
              >
                <RefreshCw size={17} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Book Name</th>
                  <th className="px-5 py-3">Author</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Available / Total</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      Loading books...
                    </td>
                  </tr>
                ) : books.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No books found.
                    </td>
                  </tr>
                ) : (
                  books.map((book) => (
                    <tr key={book._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold">{book.bookName}</td>
                      <td className="px-5 py-4">{book.author}</td>
                      <td className="px-5 py-4">{book.category}</td>
                      <td className="px-5 py-4">
                        {book.availableQuantity} / {book.quantity}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold ${
                            book.availableQuantity > 0
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {book.availableQuantity > 0 ? "Available" : "All Issued"}
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
