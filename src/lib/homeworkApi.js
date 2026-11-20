
const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/+$/, "");

async function parseResponse(response) {
  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Request failed (${response.status})`);
  }

  return result;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}/api/homework${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  return parseResponse(response);
}

export const homeworkApi = {
  // Get homework list with optional filters
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/${query ? `?${query}` : ""}`);
  },

  // Dashboard statistics
  stats: () => request("/stats"),

  // Create homework
  create: (data) =>
    request("/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Update homework
  update: (id, data) =>
    request(`/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Delete homework
  remove: (id) =>
    request(`/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),

  // Upload homework attachment (PDF/images, max 10 MB)
  upload: async (file) => {
    if (!file) {
      throw new Error("Please select a file to upload.");
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const allowedExtensions = /\.(pdf|jpe?g|png|webp)$/i;

    if (
      !allowedTypes.includes(file.type) ||
      !allowedExtensions.test(file.name)
    ) {
      throw new Error(
        "Only PDF, JPG, JPEG, PNG and WEBP files are allowed."
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File size must not exceed 10 MB.");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/api/homework/upload`, {
      method: "POST",
      body: formData,
      cache: "no-store",
    });

    return parseResponse(response);
  },

  // Get homework submissions
  submissions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/submissions${query ? `?${query}` : ""}`);
  },

  // Review a submission
  review: (id, data) =>
    request(`/submissions/${encodeURIComponent(id)}/review`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Get homework settings
  getSettings: () => request("/settings"),

  // Save homework settings
  saveSettings: (data) =>
    request("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// Load classes, sections, subjects or other API options
export async function fetchOptions(endpoint) {
  const response = await fetch(
    `${API_BASE}/api/${endpoint.replace(/^\/+/, "")}`,
    { cache: "no-store" }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Could not load ${endpoint}`);
  }

  const data = Array.isArray(result)
    ? result
    : result.data ??
      result.items ??
      result.classes ??
      result.sections ??
      result.subjects ??
      [];

  return Array.isArray(data) ? data : [];
}
