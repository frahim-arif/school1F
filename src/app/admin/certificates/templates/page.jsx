
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowPath,
  HiOutlineMagnifyingGlass,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineDocumentCheck,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
} from "react-icons/hi2";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_BASE = API_URL.endsWith("/api")
  ? API_URL
  : `${API_URL}/api`;

const TYPES = [
  { value: "bonafide", label: "Bonafide Certificate" },
  { value: "transfer", label: "Transfer Certificate" },
  { value: "character", label: "Character Certificate" },
  { value: "study", label: "Study Certificate" },
  { value: "birth", label: "Birth Certificate" },
  { value: "achievement", label: "Achievement Certificate" },
  { value: "other", label: "Other Certificate" },
];

const EMPTY_FORM = {
  name: "",
  certificateType: "bonafide",
  recipientType: "student",
  title: "",
  body: "",
  headerText: "",
  footerText: "",
  signatureName: "",
  signatureDesignation: "Principal",
  isDefault: false,
  isActive: true,
};

const inputClass =
  "w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600";

const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

function normalizeTemplate(template = {}) {
  return {
    ...EMPTY_FORM,
    ...template,
    name: template.name ?? "",
    certificateType: template.certificateType ?? "bonafide",
    recipientType: template.recipientType ?? "student",
    title: template.title ?? "",
    body: template.body ?? "",
    headerText: template.headerText ?? "",
    footerText: template.footerText ?? "",
    signatureName: template.signatureName ?? "",
    signatureDesignation: template.signatureDesignation ?? "Principal",
    isDefault: Boolean(template.isDefault),
    isActive: template.isActive !== false,
  };
}

async function readResponse(response) {
  const result = await response.json().catch(() => null);

  if (!response.ok || result?._status === false) {
    throw new Error(
      result?._message ||
        `Request failed with status ${response.status}`
    );
  }

  return result;
}

export default function CertificateTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const getHeaders = useCallback((json = false) => {
    const token = localStorage.getItem("adminToken");

    return {
      ...(json ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/certificate-templates`,
        {
          method: "GET",
          headers: getHeaders(),
          cache: "no-store",
        }
      );

      const result = await readResponse(response);
      const data = result?._data;

      const list = Array.isArray(data)
        ? data
        : data?.templates ?? data?.items ?? [];

      setTemplates(list.map(normalizeTemplate));
    } catch (err) {
      setError(err.message || "Templates load nahi ho paaye.");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const updateField = (name, value) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setNotice("");
    setModalOpen(true);
  };

  const openEdit = (template) => {
    setEditingId(template._id);
    setForm(normalizeTemplate(template));
    setError("");
    setNotice("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (!saving) {
      setModalOpen(false);
      setEditingId(null);
    }
  };

  const saveTemplate = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Template name required hai.");
      return;
    }

    if (!form.title.trim()) {
      setError("Certificate title required hai.");
      return;
    }

    if (!form.body.trim()) {
      setError("Certificate body required hai.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const url = editingId
        ? `${API_BASE}/certificate-templates/${editingId}`
        : `${API_BASE}/certificate-templates`;

      const payload = {
        ...form,
        name: form.name.trim(),
        title: form.title.trim(),
        body: form.body.trim(),
        headerText: form.headerText.trim(),
        footerText: form.footerText.trim(),
        signatureName: form.signatureName.trim(),
        signatureDesignation: form.signatureDesignation.trim(),
      };

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: getHeaders(true),
        body: JSON.stringify(payload),
      });

      await readResponse(response);

      setModalOpen(false);
      setEditingId(null);
      setNotice(
        editingId
          ? "Template successfully update ho gaya."
          : "Template successfully create ho gaya."
      );

      await fetchTemplates();
    } catch (err) {
      setError(err.message || "Template save nahi ho paaya.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (template) => {
    setUpdatingId(template._id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_BASE}/certificate-templates/${template._id}`,
        {
          method: "PATCH",
          headers: getHeaders(true),
          body: JSON.stringify({
            isActive: !template.isActive,
          }),
        }
      );

      await readResponse(response);

      setNotice(
        `Template ${template.isActive ? "deactivate" : "activate"} ho gaya.`
      );

      await fetchTemplates();
    } catch (err) {
      setError(err.message || "Template status update nahi hua.");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteTemplate = async (template) => {
    const confirmed = window.confirm(
      `Kya aap "${template.name}" template delete karna chahte hain?`
    );

    if (!confirmed) return;

    setDeletingId(template._id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_BASE}/certificate-templates/${template._id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      await readResponse(response);

      setTemplates((previous) =>
        previous.filter((item) => item._id !== template._id)
      );

      setNotice("Template successfully delete ho gaya.");
    } catch (err) {
      setError(err.message || "Template delete nahi hua.");
    } finally {
      setDeletingId(null);
    }
  };

  const query = search.trim().toLowerCase();

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      !query ||
      [template.name, template.title, template.certificateType]
        .some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );

    const matchesType =
      !typeFilter || template.certificateType === typeFilter;

    const matchesActive =
      activeFilter === "" ||
      String(Boolean(template.isActive)) === activeFilter;

    return matchesSearch && matchesType && matchesActive;
  });

  const activeCount = templates.filter((item) => item.isActive).length;
  const defaultCount = templates.filter((item) => item.isDefault).length;

  return (
    <main className="min-h-screen space-y-6 bg-slate-50 p-4 text-slate-800 sm:p-6 lg:p-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/admin/certificates"
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
          >
            <HiOutlineArrowLeft className="h-4 w-4" />
            Certificates Dashboard
          </Link>

          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            School ERP / Certificates
          </p>

          <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Certificate Templates
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Certificate formats create, edit aur manage karein.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={fetchTemplates}
            disabled={loading}
            className="inline-flex items-center gap-2 border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 disabled:opacity-60"
          >
            <HiOutlineArrowPath
              className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            <HiOutlinePlus className="h-5 w-5" />
            Add Template
          </button>
        </div>
      </header>

      {notice && (
        <div className="flex items-center justify-between gap-3 border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <div className="flex items-center gap-2">
            <HiOutlineCheckCircle className="h-5 w-5 shrink-0" />
            <p>{notice}</p>
          </div>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss message"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <HiOutlineExclamationCircle className="h-5 w-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Operation failed</p>
            <p className="mt-1 break-words">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { title: "Total Templates", value: templates.length },
          { title: "Active Templates", value: activeCount },
          { title: "Default Templates", value: defaultCount },
        ].map((item) => (
          <div
            key={item.title}
            className="border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.title}</p>
            <p className="mt-3 text-3xl font-extrabold text-slate-900">
              {loading ? "—" : item.value}
            </p>
          </div>
        ))}
      </section>

      <section className="border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
          <div className="relative">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search templates..."
              className={`${inputClass} pl-10`}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className={inputClass}
          >
            <option value="">All certificate types</option>
            {TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={activeFilter}
            onChange={(event) => setActiveFilter(event.target.value)}
            className={inputClass}
          >
            <option value="">Active and inactive</option>
            <option value="true">Active only</option>
            <option value="false">Inactive only</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Template</th>
                <th className="px-5 py-4">Certificate Type</th>
                <th className="px-5 py-4">Recipient</th>
                <th className="px-5 py-4">Default</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <HiOutlineArrowPath className="mx-auto mb-2 h-6 w-6 animate-spin" />
                    Loading templates...
                  </td>
                </tr>
              ) : filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <HiOutlineDocumentCheck className="mx-auto h-9 w-9 text-slate-300" />
                    <p className="mt-3 font-semibold text-slate-700">
                      No templates found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Search/filter change karein ya Add Template par click karein.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((template) => (
                  <tr key={template._id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {template.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {template.title}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {TYPES.find(
                        (type) => type.value === template.certificateType
                      )?.label || template.certificateType}
                    </td>

                    <td className="px-5 py-4 capitalize text-slate-600">
                      {template.recipientType}
                    </td>

                    <td className="px-5 py-4">
                      {template.isDefault ? (
                        <span className="bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
                          Default
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold ${
                          template.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {template.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => openEdit(template)}
                          className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
                        >
                          <HiOutlinePencilSquare className="h-4 w-4" />
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={updatingId === template._id}
                          onClick={() => toggleActive(template)}
                          className="font-semibold text-slate-700 hover:underline disabled:opacity-50"
                        >
                          {updatingId === template._id
                            ? "Updating..."
                            : template.isActive
                              ? "Deactivate"
                              : "Activate"}
                        </button>

                        <button
                          type="button"
                          disabled={deletingId === template._id}
                          onClick={() => deleteTemplate(template)}
                          className="inline-flex items-center gap-1 font-semibold text-red-700 hover:underline disabled:opacity-50"
                        >
                          <HiOutlineTrash className="h-4 w-4" />
                          {deletingId === template._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          Showing {filteredTemplates.length} of {templates.length} templates
        </div>
      </section>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <form
            onSubmit={saveTemplate}
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto border border-slate-200 bg-white shadow-xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId ? "Edit Template" : "Create Template"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Certificate content aur layout details enter karein.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close form"
                className="p-2 hover:bg-slate-100 disabled:opacity-50"
              >
                <HiOutlineXMark className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Template Name *</label>
                <input
                  required
                  maxLength={120}
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  className={inputClass}
                  placeholder="Standard Bonafide"
                />
              </div>

              <div>
                <label className={labelClass}>Certificate Type *</label>
                <select
                  required
                  value={form.certificateType}
                  onChange={(event) =>
                    updateField("certificateType", event.target.value)
                  }
                  className={inputClass}
                >
                  {TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Recipient Type *</label>
                <select
                  required
                  value={form.recipientType}
                  onChange={(event) =>
                    updateField("recipientType", event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Certificate Title *</label>
                <input
                  required
                  maxLength={200}
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  className={inputClass}
                  placeholder="BONAFIDE CERTIFICATE"
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Header Text</label>
                <input
                  value={form.headerText}
                  onChange={(event) =>
                    updateField("headerText", event.target.value)
                  }
                  className={inputClass}
                  placeholder="Optional header text"
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Certificate Body *</label>
                <textarea
                  required
                  rows={7}
                  value={form.body}
                  onChange={(event) => updateField("body", event.target.value)}
                  className={inputClass}
                  placeholder="Write the certificate body here..."
                />
                <p className="mt-1 text-xs text-slate-500">
                  Certificate generate karte waqt placeholders replace karne
                  ke liye backend support alag se implement karna hoga.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Footer Text</label>
                <input
                  value={form.footerText}
                  onChange={(event) =>
                    updateField("footerText", event.target.value)
                  }
                  className={inputClass}
                  placeholder="Optional footer text"
                />
              </div>

              <div>
                <label className={labelClass}>Signature Name</label>
                <input
                  value={form.signatureName}
                  onChange={(event) =>
                    updateField("signatureName", event.target.value)
                  }
                  className={inputClass}
                  placeholder="Principal name"
                />
              </div>

              <div>
                <label className={labelClass}>Signature Designation</label>
                <input
                  value={form.signatureDesignation}
                  onChange={(event) =>
                    updateField("signatureDesignation", event.target.value)
                  }
                  className={inputClass}
                  placeholder="Principal"
                />
              </div>

              <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={Boolean(form.isDefault)}
                    onChange={(event) =>
                      updateField("isDefault", event.target.checked)
                    }
                    className="h-4 w-4 accent-emerald-700"
                  />
                  Set as default template
                </label>

                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={Boolean(form.isActive)}
                    onChange={(event) =>
                      updateField("isActive", event.target.checked)
                    }
                    className="h-4 w-4 accent-emerald-700"
                  />
                  Active template
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white p-5">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Template"
                    : "Create Template"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
