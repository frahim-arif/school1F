
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { schoolRequest, extractList } from "@/lib/examApi";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  GraduationCap,
  BookOpen,
  Users,
  Link2,
} from "lucide-react";

const iconMap = {
  classes: GraduationCap,
  sections: Users,
  subjects: BookOpen,
  "class-subjects": Link2,
};

function getId(item) {
  return item?._id || item?.id || "";
}

function getError(error) {
  return (
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

function getOptionLabel(option, field = {}) {
  if (option === null || option === undefined) return "";

  if (typeof option !== "object") {
    return String(option);
  }

  return (
    option[field.labelKey || "name"] ||
    option.name ||
    option.className ||
    option.subjectName ||
    option.title ||
    option.code ||
    getId(option) ||
    ""
  );
}

export default function AcademicCrud({
  title,
  description,
  resource,
  fields = [],
  listKeys = [],
}) {
  const [items, setItems] = useState([]);
  const [options, setOptions] = useState({});
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const Icon = iconMap[resource] || BookOpen;

  // Load dropdown options without blocking the main list if one fails.
  const loadOptions = useCallback(async () => {
    const next = {};

    await Promise.all(
      fields.map(async (field) => {
        if (!field.optionsFrom) return;

        try {
          const result = await schoolRequest(field.optionsFrom);

          next[field.name] = extractList(result, [
            field.optionsKey || "",
            "items",
            "results",
            field.optionsFrom,
          ]);
        } catch (err) {
          console.error(
            `Failed to load dropdown "${field.label}":`,
            err
          );

          next[field.name] = [];
        }
      })
    );

    setOptions(next);
  }, [fields]);

  // Load records and dropdowns.
  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await schoolRequest(resource);

      const records = extractList(result, [
        ...listKeys,
        "items",
        "results",
        resource,
      ]);

      setItems(Array.isArray(records) ? records : []);

      // Dropdown failure should not prevent the list from loading.
      await loadOptions();
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }, [resource, listKeys, loadOptions]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  function resetForm() {
    setForm({});
    setEditing(null);
    setError("");
    setNotice("");
  }

  function startEdit(item) {
    const values = {};

    fields.forEach((field) => {
      const value = item[field.name];

      if (value && typeof value === "object") {
        values[field.name] = getId(value);
      } else {
        values[field.name] = value ?? "";
      }
    });

    setForm(values);
    setEditing(getId(item));
    setError("");
    setNotice("");

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = {};

      fields.forEach((field) => {
        const value = form[field.name];

        if (field.type === "number") {
          payload[field.name] =
            value === "" || value === undefined
              ? ""
              : Number(value);
        } else if (typeof value === "string") {
          payload[field.name] = value.trim();
        } else {
          payload[field.name] = value ?? "";
        }
      });

      await schoolRequest(
        editing ? `${resource}/${editing}` : resource,
        {
          method: editing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      setNotice(
        editing
          ? "Record updated successfully."
          : "Record added successfully."
      );

      setForm({});
      setEditing(null);

      await loadItems();
    } catch (err) {
      setError(getError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    const id = getId(item);

    if (!id) {
      setError("Record ID nahi mila.");
      return;
    }

    if (deleting) return;

    if (!window.confirm("Kya aap is record ko delete karna chahte hain?")) {
      return;
    }

    setDeleting(id);
    setError("");
    setNotice("");

    try {
      await schoolRequest(`${resource}/${id}`, {
        method: "DELETE",
      });

      if (editing === id) {
        setForm({});
        setEditing(null);
      }

      setNotice("Record deleted successfully.");
      await loadItems();
    } catch (err) {
      setError(getError(err));
    } finally {
      setDeleting(null);
    }
  }

  function displayValue(item, field) {
    const value = item?.[field.name];

    if (value === undefined || value === null || value === "") {
      return "—";
    }

    if (typeof value === "object") {
      return getOptionLabel(value, field) || "—";
    }

    if (field.type === "select") {
      const fieldOptions = field.options || options[field.name] || [];

      const match = fieldOptions.find(
        (option) => String(getId(option)) === String(value)
      );

      if (match) {
        return getOptionLabel(match, field);
      }
    }

    return String(value);
  }

  const filtered = items.filter((item) => {
    const term = search.trim().toLowerCase();

    if (!term) return true;

    return fields.some((field) =>
      displayValue(item, field).toLowerCase().includes(term)
    );
  });

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/admin/academic-setup"
              className="mb-3 inline-block text-sm font-medium text-emerald-700 hover:underline"
            >
              ← Academic Setup
            </Link>

            <h1 className="flex items-center gap-3 text-2xl font-bold md:text-3xl">
              <span className="rounded-xl bg-emerald-100 p-3 text-emerald-800">
                <Icon size={25} />
              </span>
              {title}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={loadItems}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Close error"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Success */}
        {notice && (
          <div
            role="status"
            className="flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <span>{notice}</span>

            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Close message"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Create / Edit Form */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">
            {editing ? "Edit Record" : "Add New Record"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {fields.map((field) => (
              <label key={field.name} className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                  {field.label}

                  {field.required && (
                    <span className="text-red-500"> *</span>
                  )}
                </span>

                {field.type === "select" ? (
                  <select
                    required={field.required}
                    value={form[field.name] ?? ""}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        [field.name]: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-emerald-600"
                  >
                    <option value="">
                      Select {field.label}
                    </option>

                    {(
                      field.options ||
                      options[field.name] ||
                      []
                    ).map((option, index) => (
                      <option
                        key={getId(option) || `${field.name}-${index}`}
                        value={getId(option)}
                      >
                        {getOptionLabel(option, field)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || "text"}
                    required={field.required}
                    min={field.min}
                    max={field.max}
                    placeholder={
                      field.placeholder || `Enter ${field.label}`
                    }
                    value={form[field.name] ?? ""}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        [field.name]: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-600"
                  />
                )}
              </label>
            ))}

            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={18} />

                {saving
                  ? "Saving..."
                  : editing
                    ? "Update"
                    : "Save"}
              </button>

              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-lg border px-4 py-2.5 font-semibold hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Records Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
            <div>
              <h2 className="text-lg font-bold">
                {title} List
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Total records: {items.length}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border px-3">
              <Search size={17} className="text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search records..."
                aria-label="Search records"
                className="w-44 py-2.5 text-sm outline-none"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <p className="p-8 text-center text-slate-500">
              Loading records...
            </p>
          ) : filtered.length === 0 ? (
            <p className="p-8 text-center text-slate-500">
              {search
                ? "No matching records found."
                : "No records found."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">#</th>

                    {fields.map((field) => (
                      <th key={field.name} className="px-5 py-4">
                        {field.label}
                      </th>
                    ))}

                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item, index) => {
                    const id = getId(item);

                    return (
                      <tr
                        key={id || index}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          {index + 1}
                        </td>

                        {fields.map((field) => (
                          <td
                            key={field.name}
                            className="px-5 py-4"
                          >
                            {displayValue(item, field)}
                          </td>
                        ))}

                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(item)}
                              disabled={!id || saving || deleting !== null}
                              className="rounded-md border p-2 text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Edit"
                              aria-label={`Edit record ${index + 1}`}
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              disabled={!id || deleting !== null || saving}
                              className="rounded-md border p-2 text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Delete"
                              aria-label={`Delete record ${index + 1}`}
                            >
                              {deleting === id ? (
                                <RefreshCw
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
