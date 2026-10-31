
const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const LIBRARY_API = `${API_BASE}/api/library`;

async function request(path, options = {}) {
  const response = await fetch(`${LIBRARY_API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Library API request failed");
  }

  return data;
}

export const libraryApi = {
  getBooks: (search = "") =>
    request(`/books${search ? `?search=${encodeURIComponent(search)}` : ""}`),

  createBook: (book) =>
    request("/books", {
      method: "POST",
      body: JSON.stringify(book),
    }),

  updateBook: (id, book) =>
    request(`/books/${id}`, {
      method: "PUT",
      body: JSON.stringify(book),
    }),

  deleteBook: (id) =>
    request(`/books/${id}`, { method: "DELETE" }),

  getIssues: (search = "") =>
    request(`/issues${search ? `?search=${encodeURIComponent(search)}` : ""}`),

  issueBook: (issue) =>
    request("/issues", {
      method: "POST",
      body: JSON.stringify(issue),
    }),

  returnBook: (id) =>
    request(`/issues/${id}/return`, { method: "PATCH" }),

  getSettings: () => request("/settings"),

  updateSettings: (settings) =>
    request("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    }),
};
