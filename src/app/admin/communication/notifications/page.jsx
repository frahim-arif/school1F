"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  Search,
  Send,
  MessageSquare,
  Smartphone,
  Users,
  CheckCircle2,
  Clock3,
  XCircle,
  Eye,
  Trash2,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";

const STORAGE_KEY = "school1_communication_notifications";

const initialNotifications = [
  {
    id: "demo-1",
    title: "Parent Teacher Meeting",
    message: "Dear parents, Parent Teacher Meeting will be held on Saturday at 10 AM. Please attend.",
    channel: "SMS",
    audience: "Parents",
    recipients: 120,
    status: "Sent",
    createdAt: "2026-10-20T10:30:00.000Z",
  },
  {
    id: "demo-2",
    title: "Holiday Notice",
    message: "School will remain closed tomorrow due to a scheduled holiday.",
    channel: "Push Notification",
    audience: "All Students",
    recipients: 350,
    status: "Sent",
    createdAt: "2026-10-21T08:15:00.000Z",
  },
  {
    id: "demo-3",
    title: "Fee Reminder",
    message: "Please clear the pending school fees before the due date.",
    channel: "SMS",
    audience: "Parents",
    recipients: 45,
    status: "Draft",
    createdAt: "2026-10-22T07:00:00.000Z",
  },
];

const emptyForm = {
  title: "",
  message: "",
  channel: "SMS",
  audience: "Parents",
};

const audiences = [
  "All Students",
  "Parents",
  "All Teachers",
  "All Staff",
];

const channels = ["SMS", "Push Notification"];

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusStyle(status) {
  if (status === "Sent") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "Failed") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (status === "Scheduled") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

export default function CommunicationNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [audienceFilter, setAudienceFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setNotifications(saved ? JSON.parse(saved) : initialNotifications);
    } catch {
      setNotifications(initialNotifications);
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    }
  }, [notifications, ready]);

  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notifications
      .filter((item) => {
        const matchesSearch =
          !query ||
          item.title.toLowerCase().includes(query) ||
          item.message.toLowerCase().includes(query) ||
          item.audience.toLowerCase().includes(query);

        const matchesChannel =
          channelFilter === "All" || item.channel === channelFilter;

        const matchesStatus =
          statusFilter === "All" || item.status === statusFilter;

        const matchesAudience =
          audienceFilter === "All" || item.audience === audienceFilter;

        return (
          matchesSearch &&
          matchesChannel &&
          matchesStatus &&
          matchesAudience
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  }, [
    notifications,
    search,
    channelFilter,
    statusFilter,
    audienceFilter,
  ]);

  const sentCount = notifications.filter(
    (item) => item.status === "Sent"
  ).length;

  const draftCount = notifications.filter(
    (item) => item.status === "Draft"
  ).length;

  const failedCount = notifications.filter(
    (item) => item.status === "Failed"
  ).length;

  const recipientsReached = notifications
    .filter((item) => item.status === "Sent")
    .reduce((total, item) => total + Number(item.recipients || 0), 0);

  function openCreate() {
    setForm(emptyForm);
    setError("");
    setNotice("");
    setModalOpen(true);
  }

  function saveDraft(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!form.title.trim() || !form.message.trim()) {
      setError("Title aur message dono required hain.");
      return;
    }

    const newNotification = {
      ...form,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      recipients: 0,
      status: "Draft",
      createdAt: new Date().toISOString(),
    };

    setNotifications((previous) => [newNotification, ...previous]);
    setModalOpen(false);
    setForm(emptyForm);
    setNotice("Draft save ho gaya. Abhi koi SMS ya push notification send nahi hua.");
  }

  function deleteNotification(id) {
    if (!window.confirm("Kya aap is notification record ko delete karna chahte hain?")) {
      return;
    }

    setNotifications((previous) =>
      previous.filter((item) => item.id !== id)
    );

    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
    }
  }

  function exportCSV() {
    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = [
      [
        "Title",
        "Message",
        "Channel",
        "Audience",
        "Recipients",
        "Status",
        "Created At",
      ],
      ...filteredNotifications.map((item) => [
        item.title,
        item.message,
        item.channel,
        item.audience,
        item.recipients,
        item.status,
        formatDate(item.createdAt),
      ]),
    ];

    const csv = rows.map((row) => row.map(escapeCSV).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "school-notification-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  function resetFilters() {
    setSearch("");
    setChannelFilter("All");
    setStatusFilter("All");
    setAudienceFilter("All");
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] p-4 text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <BellRing size={16} />
              Communication / SMS / Notifications
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              SMS / Notifications
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              School notifications aur message history manage karein.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 bg-[#123c70] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b2d57]"
          >
            <Plus size={18} />
            Create Notification
          </button>
        </header>

        {notice && (
          <div className="flex items-start justify-between gap-3 border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <p>{notice}</p>
            <button onClick={() => setNotice("")} aria-label="Dismiss message">
              <X size={17} />
            </button>
          </div>
        )}

        <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Demo mode:</strong> Is page par abhi notification drafts aur
          history browser mein save hoti hai. SMS ya push notifications
          recipients ko actually send nahi hote.
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Notifications",
              value: notifications.length,
              icon: BellRing,
              iconStyle: "bg-blue-50 text-blue-700",
            },
            {
              label: "Sent Records",
              value: sentCount,
              icon: CheckCircle2,
              iconStyle: "bg-emerald-50 text-emerald-700",
            },
            {
              label: "Drafts",
              value: draftCount,
              icon: Clock3,
              iconStyle: "bg-amber-50 text-amber-700",
            },
            {
              label: "Failed Records",
              value: failedCount,
              icon: XCircle,
              iconStyle: "bg-red-50 text-red-700",
            },
          ].map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">{card.label}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {card.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center ${card.iconStyle}`}
                  >
                    <Icon size={23} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex items-center gap-4 border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center bg-violet-50 text-violet-700">
              <Users size={23} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Recipients in sent records
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {recipientsReached.toLocaleString("en-IN")}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Demo records ka total; unique recipients nahi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center bg-emerald-50 text-emerald-700">
              <Smartphone size={23} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Available channels</p>
              <p className="mt-1 font-bold text-slate-900">SMS & Push</p>
              <p className="mt-1 text-xs text-slate-400">
                Sending ke liye backend provider integration zaroori hai.
              </p>
            </div>
          </div>
        </section>

        <section className="border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-bold text-slate-900">
                  Notification History
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Search aur filters se notification records dekhein.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                >
                  <RefreshCw size={15} />
                  Reset Filters
                </button>

                <button
                  onClick={exportCSV}
                  className="inline-flex items-center gap-2 border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                >
                  Export CSV
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={17}
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search title or message..."
                  className="w-full border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={channelFilter}
                onChange={(event) => setChannelFilter(event.target.value)}
                className="border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="All">All channels</option>
                {channels.map((channel) => (
                  <option key={channel}>{channel}</option>
                ))}
              </select>

              <select
                value={audienceFilter}
                onChange={(event) => setAudienceFilter(event.target.value)}
                className="border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="All">All audiences</option>
                {audiences.map((audience) => (
                  <option key={audience}>{audience}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="All">All statuses</option>
                {["Sent", "Draft", "Scheduled", "Failed"].map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Notification</th>
                  <th className="px-5 py-4 font-semibold">Channel</th>
                  <th className="px-5 py-4 font-semibold">Audience</th>
                  <th className="px-5 py-4 font-semibold">Recipients</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Created</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredNotifications.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="max-w-sm px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                        {item.message}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        {item.channel === "SMS" ? (
                          <MessageSquare size={15} />
                        ) : (
                          <BellRing size={15} />
                        )}
                        {item.channel}
                      </span>
                    </td>

                    <td className="px-5 py-4">{item.audience}</td>

                    <td className="px-5 py-4">{item.recipients}</td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex border px-2 py-1 text-xs font-semibold ${statusStyle(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                      {formatDate(item.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setSelectedNotification(item)}
                          className="p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                          aria-label="View notification"
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => deleteNotification(item.id)}
                          className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
                          aria-label="Delete notification record"
                          title="Delete record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredNotifications.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      <BellRing
                        className="mx-auto mb-3 text-slate-300"
                        size={34}
                      />
                      No notification records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
            Showing {filteredNotifications.length} of {notifications.length} records
          </div>
        </section>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Create Notification
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Notification draft prepare karein.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveDraft} className="space-y-5 p-5 sm:p-6">
              {error && (
                <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Notification Title *
                </label>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  maxLength={120}
                  required
                  placeholder="e.g. Parent Teacher Meeting"
                  className="w-full border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Channel *
                  </label>
                  <select
                    value={form.channel}
                    onChange={(event) =>
                      setForm({ ...form, channel: event.target.value })
                    }
                    className="w-full border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    {channels.map((channel) => (
                      <option key={channel}>{channel}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Recipient Group *
                  </label>
                  <select
                    value={form.audience}
                    onChange={(event) =>
                      setForm({ ...form, audience: event.target.value })
                    }
                    className="w-full border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    {audiences.map((audience) => (
                      <option key={audience}>{audience}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label className="text-sm font-semibold text-slate-700">
                    Message *
                  </label>
                  <span className="text-xs text-slate-400">
                    {form.message.length} characters
                  </span>
                </div>

                <textarea
                  value={form.message}
                  onChange={(event) =>
                    setForm({ ...form, message: event.target.value })
                  }
                  rows={5}
                  maxLength={2000}
                  required
                  placeholder="Write your notification message..."
                  className="w-full resize-y border border-slate-200 px-3 py-2.5 text-sm leading-6 outline-none focus:border-blue-500"
                />

                {form.channel === "SMS" && (
                  <p className="mt-2 text-xs leading-5 text-amber-700">
                    SMS character limits, segment counts aur delivery charges
                    provider ke hisaab se alag ho sakte hain.
                  </p>
                )}
              </div>

              <div className="border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">
                  Before sending
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Abhi recipients ki actual list ya delivery provider connected
                  nahi hai. Save Draft sirf local record save karega; kisi ko
                  message nahi bhejega.
                </p>
              </div>

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 bg-[#123c70] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0b2d57]"
                >
                  <Send size={16} />
                  Save Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <h2 className="text-lg font-bold text-slate-900">
                Notification Details
              </h2>
              <button
                onClick={() => setSelectedNotification(null)}
                className="p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Title
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {selectedNotification.title}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Message
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {selectedNotification.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Channel
                  </p>
                  <p className="mt-1 text-sm">{selectedNotification.channel}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Audience
                  </p>
                  <p className="mt-1 text-sm">{selectedNotification.audience}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Status
                  </p>
                  <span
                    className={`mt-1 inline-flex border px-2 py-1 text-xs font-semibold ${statusStyle(selectedNotification.status)}`}
                  >
                    {selectedNotification.status}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Recipients
                  </p>
                  <p className="mt-1 text-sm">
                    {selectedNotification.recipients}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Created At
                </p>
                <p className="mt-1 text-sm">
                  {formatDate(selectedNotification.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 p-5">
              <button
                onClick={() => setSelectedNotification(null)}
                className="bg-[#123c70] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0b2d57]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}