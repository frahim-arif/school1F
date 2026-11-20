
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../components/home/Navbar";
import Footer from "../components/home/Footer";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

function getList(payload, keys = []) {
  if (Array.isArray(payload)) return payload;

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
    if (Array.isArray(payload?.data?.[key])) {
      return payload.data[key];
    }
  }

  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;

  return [];
}

function getId(value) {
  if (value && typeof value === "object") {
    return String(value._id ?? value.id ?? "");
  }

  return String(value ?? "");
}

function getClassId(item) {
  return getId(item?.classId ?? item?.class);
}

function getSubjectId(item) {
  return getId(item?.subjectId ?? item?.subject);
}

function getClassName(item, classMap) {
  const direct =
    item?.className ??
    item?.classLevel ??
    item?.class?.name ??
    item?.class?.className ??
    item?.class?.title ??
    item?.classId?.name ??
    item?.classId?.className ??
    "";

  if (typeof direct === "string" && direct.trim()) {
    if (classMap.has(direct)) return classMap.get(direct);

    if (!/^[a-f\d]{24}$/i.test(direct)) {
      return direct.trim();
    }
  }

  return classMap.get(getClassId(item)) || "";
}

function getSubjectName(item, subjectMap) {
  const direct =
    item?.subjectName ??
    item?.subjectTitle ??
    item?.subject?.name ??
    item?.subject?.subjectName ??
    item?.subject?.title ??
    item?.subjectId?.name ??
    item?.subjectId?.subjectName ??
    "";

  if (typeof direct === "string" && direct.trim()) {
    if (subjectMap.has(direct)) return subjectMap.get(direct);

    if (!/^[a-f\d]{24}$/i.test(direct)) {
      return direct.trim();
    }
  }

  return subjectMap.get(getSubjectId(item)) || "";
}

function getAttachment(item) {
  const raw =
    item?.attachment ??
    (Array.isArray(item?.attachments)
      ? item.attachments[0]
      : item?.attachments) ??
    item?.file ??
    null;

  if (typeof raw === "string") {
    return {
      url: raw,
      fileName: raw.split("/").pop() || "Attachment",
      mimeType: "",
    };
  }

  if (raw && typeof raw === "object") {
    const url =
      raw.url ||
      raw.fileUrl ||
      raw.attachmentUrl ||
      raw.path ||
      "";

    return {
      url,
      fileName:
        raw.fileName ||
        raw.originalName ||
        raw.name ||
        url.split("/").pop() ||
        "Attachment",
      mimeType: raw.mimeType || raw.type || "",
    };
  }

  const url =
    item?.fileUrl ||
    item?.attachmentUrl ||
    item?.documentUrl ||
    "";

  return url
    ? {
        url,
        fileName: item?.fileName || url.split("/").pop() || "Attachment",
        mimeType: item?.mimeType || "",
      }
    : null;
}

function resolveFileUrl(url) {
  if (!url) return "";

  if (/^(https?:|data:|blob:)/i.test(url)) {
    return url;
  }

  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function isImage(file) {
  const value = `${file?.mimeType || ""} ${file?.fileName || ""} ${file?.url || ""}`;

  return (
    /image\//i.test(value) ||
    /\.(png|jpe?g|gif|webp|avif|bmp)(\?|#|$)/i.test(value)
  );
}

function isPdf(file) {
  const value = `${file?.mimeType || ""} ${file?.fileName || ""} ${file?.url || ""}`;

  return (
    /application\/pdf/i.test(value) ||
    /\.pdf(\?|#|$)/i.test(value)
  );
}

function formatDate(value) {
  if (!value) return "Not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getOptionName(item, type) {
  if (type === "class") {
    return String(
      item?.name ??
      item?.className ??
      item?.title ??
      ""
    ).trim();
  }

  return String(
    item?.name ??
    item?.subjectName ??
    item?.title ??
    ""
  ).trim();
}

export default function PublicHomeworkPage() {
  const [homework, setHomework] = useState([]);
  const [classesData, setClassesData] = useState([]);
  const [subjectsData, setSubjectsData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");

  const fetchHomework = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const endpoints = [
        `${API_BASE}/api/homework`,
        `${API_BASE}/api/classes`,
        `${API_BASE}/api/subjects`,
      ];

      const responses = await Promise.all(
        endpoints.map((url) =>
          fetch(url, { cache: "no-store" })
        )
      );

      const [
        homeworkResponse,
        classesResponse,
        subjectsResponse,
      ] = responses;

      if (!homeworkResponse.ok) {
        throw new Error(
          `Homework load nahi hua (HTTP ${homeworkResponse.status}).`
        );
      }

      if (!classesResponse.ok) {
        throw new Error(
          `Classes load nahi hui (HTTP ${classesResponse.status}).`
        );
      }

      if (!subjectsResponse.ok) {
        throw new Error(
          `Subjects load nahi hue (HTTP ${subjectsResponse.status}).`
        );
      }

      const [
        homeworkPayload,
        classesPayload,
        subjectsPayload,
      ] = await Promise.all(
        responses.map((response) => response.json())
      );

      if (homeworkPayload?.success === false) {
        throw new Error(
          homeworkPayload?.message || "Homework load nahi ho saka."
        );
      }

      if (classesPayload?.success === false) {
        throw new Error(
          classesPayload?.message || "Classes load nahi hui."
        );
      }

      if (subjectsPayload?.success === false) {
        throw new Error(
          subjectsPayload?.message || "Subjects load nahi hue."
        );
      }

      setHomework(
        getList(homeworkPayload, ["homework"])
      );

      setClassesData(
        getList(classesPayload, ["classes", "items"])
      );

      setSubjectsData(
        getList(subjectsPayload, ["subjects", "items"])
      );
    } catch (err) {
      setError(
        err?.message ||
          "Data load nahi ho saka. Backend/API connection check karein."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomework();
  }, [fetchHomework]);

  // Class ID -> Class name
  const classMap = useMemo(() => {
    return new Map(
      classesData
        .map((item) => {
          const id = getId(item);
          const name = getOptionName(item, "class");

          return id && name ? [id, name] : null;
        })
        .filter(Boolean)
    );
  }, [classesData]);

  // Subject ID -> Subject name
  const subjectMap = useMemo(() => {
    return new Map(
      subjectsData
        .map((item) => {
          const id = getId(item);
          const name = getOptionName(item, "subject");

          return id && name ? [id, name] : null;
        })
        .filter(Boolean)
    );
  }, [subjectsData]);

  // Dropdown classes
  const classes = useMemo(() => {
    const options = new Map();

    classesData.forEach((item) => {
      const id = getId(item);
      const name = getOptionName(item, "class");

      if (id && name) options.set(id, name);
    });

    // Include classes found in homework if the class API omits them.
    homework.forEach((item) => {
      const id = getClassId(item);
      const name = getClassName(item, classMap);

      if (id && name && !options.has(id)) {
        options.set(id, name);
      }
    });

    return [...options.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
  }, [classesData, homework, classMap]);

  // Dropdown subjects
  const subjects = useMemo(() => {
    const options = new Map();

    subjectsData.forEach((item) => {
      const id = getId(item);
      const name = getOptionName(item, "subject");

      if (id && name) options.set(id, name);
    });

    // Include subjects found in homework if available.
    homework.forEach((item) => {
      const id = getSubjectId(item);
      const name = getSubjectName(item, subjectMap);

      if (id && name && !options.has(id)) {
        options.set(id, name);
      }
    });

    return [...options.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          sensitivity: "base",
        })
      );
  }, [subjectsData, homework, subjectMap]);

  // Class + Subject + Search filters
  const filteredHomework = useMemo(() => {
    const query = search.trim().toLowerCase();

    return homework.filter((item) => {
      const className = getClassName(item, classMap);
      const subjectName = getSubjectName(item, subjectMap);
      const attachment = getAttachment(item);

      const matchesClass =
        selectedClass === "all" ||
        getClassId(item) === selectedClass;

      const matchesSubject =
        selectedSubject === "all" ||
        getSubjectId(item) === selectedSubject;

      const searchable = [
        item?.title,
        item?.name,
        item?.description,
        item?.instructions,
        item?.details,
        className,
        item?.section,
        subjectName,
        attachment?.fileName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchable.includes(query);

      return (
        matchesClass &&
        matchesSubject &&
        matchesSearch
      );
    });
  }, [
    homework,
    search,
    selectedClass,
    selectedSubject,
    classMap,
    subjectMap,
  ]);

  function clearFilters() {
    setSearch("");
    setSelectedClass("all");
    setSelectedSubject("all");
  }

  return (
    <main className="min-h-screen bg-[#faf8ef] text-[#172d27]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071c19] via-[#0b302a] to-[#123d32] px-4 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#d7c17f]">
            Student Learning Centre
          </p>

          <h1 className="text-3xl font-black sm:text-5xl">
            Public Homework{" "}
            <span className="text-[#d7c17f]">Board</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
            Class aur subject ke hisaab se homework dekhein aur study
            material open ya download karein.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        {/* Filters */}
        <div className="mb-7 border border-[#dce4d9] bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-extrabold">
                Find Homework
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Class, subject ya homework title se filter karein.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchHomework}
              disabled={loading}
              className="border border-[#0b302a] px-4 py-2 text-sm font-bold text-[#0b302a] hover:bg-[#0b302a] hover:text-white disabled:opacity-50"
            >
              {loading ? "Loading..." : "↻ Refresh"}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Class filter */}
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-600">
                Select Class
              </span>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full border border-gray-300 bg-[#fffefa] px-3 py-3 text-sm outline-none focus:border-[#0b6653]"
              >
                <option value="all">All Classes</option>

                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Subject filter */}
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-600">
                Select Subject
              </span>

              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full border border-gray-300 bg-[#fffefa] px-3 py-3 text-sm outline-none focus:border-[#0b6653]"
              >
                <option value="all">All Subjects</option>

                {subjects.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Search */}
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-600">
                Search Homework
              </span>

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Title, class, subject..."
                className="w-full border border-gray-300 bg-[#fffefa] px-3 py-3 text-sm outline-none focus:border-[#0b6653]"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-col justify-between gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <strong className="text-[#0b302a]">
                {filteredHomework.length}
              </strong>{" "}
              of{" "}
              <strong className="text-[#0b302a]">
                {homework.length}
              </strong>{" "}
              homework
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="self-start text-sm font-bold text-[#0b6653] underline underline-offset-4 sm:self-auto"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && homework.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            Loading homework...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-bold text-red-800">
              Homework load nahi ho saka
            </p>

            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchHomework}
              className="mt-4 bg-[#0b302a] px-5 py-2.5 text-sm font-bold text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Homework cards */}
        {!loading && !error && filteredHomework.length > 0 && (
          <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredHomework.map((item, index) => {
              const id =
                item?._id ||
                item?.id ||
                `${item?.title || "homework"}-${index}`;

              const className = getClassName(item, classMap);
              const subjectName = getSubjectName(item, subjectMap);
              const attachment = getAttachment(item);
              const attachmentUrl = resolveFileUrl(attachment?.url);

              const title = item?.title || item?.name || "Homework";

              const description =
                item?.description ||
                item?.instructions ||
                item?.details ||
                "";

              const dueDate =
                item?.dueDate ||
                item?.submissionDate ||
                item?.lastDate;

              return (
                <article
                  key={id}
                  className="flex min-w-0 flex-col border border-[#dce4d9] bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="h-1.5 bg-gradient-to-r from-[#0b302a] via-[#16816b] to-[#d7b96c]" />

                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {className && (
                        <span className="bg-[#e8f1e8] px-2.5 py-1 text-xs font-bold text-[#15543f]">
                          Class: {className}
                        </span>
                      )}

                      {subjectName && (
                        <span className="bg-[#fbf1d8] px-2.5 py-1 text-xs font-bold text-[#795a17]">
                          {subjectName}
                        </span>
                      )}
                    </div>

                    <h3 className="break-words text-lg font-extrabold leading-snug">
                      {title}
                    </h3>

                    {description && (
                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
                        {description}
                      </p>
                    )}

                    <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
                      {item?.section && (
                        <p className="text-gray-600">
                          <strong className="text-gray-800">
                            Section:
                          </strong>{" "}
                          {typeof item.section === "object"
                            ? item.section.name || item.section.title || ""
                            : item.section}
                        </p>
                      )}

                      <p className="text-gray-600">
                        <strong className="text-gray-800">
                          Due date:
                        </strong>{" "}
                        {formatDate(dueDate)}
                      </p>

                      {item?.createdAt && (
                        <p className="text-gray-600">
                          <strong className="text-gray-800">
                            Posted:
                          </strong>{" "}
                          {formatDate(item.createdAt)}
                        </p>
                      )}
                    </div>

                    {attachmentUrl && (
                      <div className="mt-5">
                        {isImage(attachment) ? (
                          <a
                            href={attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block border border-gray-200 bg-gray-50"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={attachmentUrl}
                              alt={attachment?.fileName || title}
                              loading="lazy"
                              className="h-44 w-full object-contain"
                            />
                          </a>
                        ) : (
                          <div className="flex items-center gap-3 border border-[#e2e8df] bg-[#f8faf6] p-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#e8f1e8] text-xl">
                              {isPdf(attachment) ? "📄" : "📎"}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold">
                                {attachment?.fileName || "Study material"}
                              </p>

                              <p className="text-xs text-gray-500">
                                {isPdf(attachment)
                                  ? "PDF document"
                                  : "Attached file"}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="mt-3 flex gap-2">
                          <a
                            href={attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 border border-[#0b302a] px-3 py-2.5 text-center text-sm font-bold text-[#0b302a] hover:bg-[#0b302a] hover:text-white"
                          >
                            {isPdf(attachment) ? "View PDF" : "Open File"}
                          </a>

                          <a
                            href={attachmentUrl}
                            download={attachment?.fileName || true}
                            className="flex-1 bg-[#0b302a] px-3 py-2.5 text-center text-sm font-bold text-white hover:bg-[#123d32]"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredHomework.length === 0 && (
          <div className="border border-dashed border-[#cbd8cb] bg-white px-5 py-14 text-center">
            <div className="mb-4 text-4xl">📚</div>

            <h3 className="text-lg font-extrabold">
              No homework found
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Is class ya subject ke liye homework nahi mila.
              Filters clear karke dobara check karein.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 bg-[#0b302a] px-5 py-2.5 text-sm font-bold text-white"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
