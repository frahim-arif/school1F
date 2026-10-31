
const API = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/+$/, "");

export async function examRequest(path, options = {}) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  const response = await fetch(`${API}/api/exams${cleanPath}`, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || `Exam request failed (${response.status}).`
    );
  }

  return data;
}

export async function schoolRequest(path, options = {}) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  let response;

  try {
    response = await fetch(`${API}/api${cleanPath}`, {
      ...options,
      cache: "no-store",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    throw new Error(
      `Backend se connection nahi ho raha (${API}). Backend server aur CORS check karein.`
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || `Unable to load ${path} (${response.status}).`
    );
  }

  return data;
}

export function extractList(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (key && Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  if (Array.isArray(data?.data)) return data.data;

  return [];
}
