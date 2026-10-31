
"use client";

import { useMemo, useState } from "react";
import {
  HiOutlineChartBarSquare,
  HiOutlineMagnifyingGlass,
  HiOutlineEnvelope,
  HiOutlineDevicePhoneMobile,
  HiOutlineBell,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineArrowDownTray,
  HiOutlineCalendarDays,
} from "react-icons/hi2";

const sampleReports = [
  {
    id: 1,
    title: "Monthly Fee Reminder",
    channel: "SMS",
    audience: "Parents",
    total: 250,
    delivered: 238,
    failed: 12,
    status: "Completed",
    date: "2026-10-05",
  },
  {
    id: 2,
    title: "Holiday Announcement",
    channel: "Email",
    audience: "Parents",
    total: 320,
    delivered: 315,
    failed: 5,
    status: "Completed",
    date: "2026-10-08",
  },
  {
    id: 3,
    title: "Attendance Notification",
    channel: "Notification",
    audience: "Parents",
    total: 180,
    delivered: 165,
    failed: 15,
    status: "Completed",
    date: "2026-10-12",
  },
  {
    id: 4,
    title: "Examination Schedule",
    channel: "Email",
    audience: "Students",
    total: 400,
    delivered: 390,
    failed: 10,
    status: "Completed",
    date: "2026-10-15",
  },
  {
    id: 5,
    title: "Parent Meeting Reminder",
    channel: "SMS",
    audience: "Parents",
    total: 200,
    delivered: 0,
    failed: 0,
    status: "Pending",
    date: "2026-10-28",
  },
];

export default function CommunicationReportsPage() {
  const [reports] = useState(sampleReports);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        report.title.toLowerCase().includes(search.toLowerCase()) ||
        report.audience.toLowerCase().includes(search.toLowerCase());

      const matchesChannel =
        channelFilter === "All" || report.channel === channelFilter;

      const matchesStatus =
        statusFilter === "All" || report.status === statusFilter;

      const matchesFrom = !dateFrom || report.date >= dateFrom;
      const matchesTo = !dateTo || report.date <= dateTo;

      return (
        matchesSearch &&
        matchesChannel &&
        matchesStatus &&
        matchesFrom &&
        matchesTo
      );
    });
  }, [reports, search, channelFilter, statusFilter, dateFrom, dateTo]);

  const totalSent = filteredReports.reduce(
    (sum, report) => sum + report.total,
    0
  );

  const totalDelivered = filteredReports.reduce(
    (sum, report) => sum + report.delivered,
    0
  );

  const totalFailed = filteredReports.reduce(
    (sum, report) => sum + report.failed,
    0
  );

  const deliveryRate =
    totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : "0.0";

  const exportCSV = () => {
    const headers = [
      "Title",
      "Channel",
      "Audience",
      "Total",
      "Delivered",
      "Failed",
      "Status",
      "Date",
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = filteredReports.map((report) =>
      [
        report.title,
        report.channel,
        report.audience,
        report.total,
        report.delivered,
        report.failed,
        report.status,
        report.date,
      ]
        .map(escapeCSV)
        .join(",")
    );

    const csv = [headers.map(escapeCSV).join(","), ...rows].join("\r\n");
    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "communication-reports.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const stats = [
    {
      label: "Total Recipients",
      value: totalSent.toLocaleString(),
      icon: HiOutlineChartBarSquare,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Delivered",
      value: totalDelivered.toLocaleString(),
      icon: HiOutlineCheckCircle,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Failed",
      value: totalFailed.toLocaleString(),
      icon: HiOutlineExclamationCircle,
      color: "bg-red-50 text-red-700",
    },
    {
      label: "Delivery Rate",
      value: `${deliveryRate}%`,
      icon: HiOutlineChartBarSquare,
      color: "bg-purple-50 text-purple-700",
    },
  ];

  const channelIcon = (channel) => {
    if (channel === "SMS") return HiOutlineDevicePhoneMobile;
    if (channel === "Email") return HiOutlineEnvelope;
    return HiOutlineBell;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm text-slate-500">
              Communication / Reports
            </p>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Communication Reports
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Review communication activity and delivery summaries.
            </p>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center justify-center gap-2 bg-emerald-800 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900"
          >
            <HiOutlineArrowDownTray className="h-5 w-5" />
            Export CSV
          </button>
        </div>

        <div className="border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          These are sample report records for the page UI. Delivery counts and
          rates are not live provider data. Connect the backend and SMS/email
          provider reports before using these figures operationally.
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <section className="border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-lg font-bold text-slate-900">
              Filter Reports
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <div className="relative xl:col-span-2">
                <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title or audience"
                  className="w-full border border-slate-300 py-3 pl-10 pr-3 text-sm outline-none focus:border-emerald-700"
                />
              </div>

              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-700"
              >
                <option value="All">All Channels</option>
                <option value="SMS">SMS</option>
                <option value="Email">Email</option>
                <option value="Notification">Notification</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-700"
              >
                <option value="All">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>

              <button
                onClick={() => {
                  setSearch("");
                  setChannelFilter("All");
                  setStatusFilter("All");
                  setDateFrom("");
                  setDateTo("");
                }}
                className="border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Clear Filters
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 border border-slate-200 px-3 py-2">
                <HiOutlineCalendarDays className="h-5 w-5 text-slate-400" />
                <span className="whitespace-nowrap text-sm text-slate-500">
                  From
                </span>
                <input
                  type="date"
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="min-w-0 flex-1 text-sm outline-none"
                />
              </label>

              <label className="flex items-center gap-3 border border-slate-200 px-3 py-2">
                <HiOutlineCalendarDays className="h-5 w-5 text-slate-400" />
                <span className="whitespace-nowrap text-sm text-slate-500">
                  To
                </span>
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="min-w-0 flex-1 text-sm outline-none"
                />
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4 font-semibold">Campaign</th>
                  <th className="px-5 py-4 font-semibold">Channel</th>
                  <th className="px-5 py-4 font-semibold">Recipients</th>
                  <th className="px-5 py-4 font-semibold">Delivered</th>
                  <th className="px-5 py-4 font-semibold">Failed</th>
                  <th className="px-5 py-4 font-semibold">Delivery Rate</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => {
                  const Icon = channelIcon(report.channel);
                  const rate =
                    report.total > 0
                      ? ((report.delivered / report.total) * 100).toFixed(1)
                      : "0.0";

                  return (
                    <tr key={report.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {report.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {report.audience}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-2 text-sm text-slate-600">
                          <Icon className="h-5 w-5 text-emerald-800" />
                          {report.channel}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {report.total}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-emerald-700">
                        {report.delivered}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-red-600">
                        {report.failed}
                      </td>
                      <td className="px-5 py-4">
                        <div className="w-28">
                          <p className="mb-2 text-sm font-semibold text-slate-700">
                            {rate}%
                          </p>
                          <div className="h-1.5 bg-slate-100">
                            <div
                              className="h-1.5 bg-emerald-600"
                              style={{
                                width: `${Math.min(Number(rate), 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {report.date}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-semibold ${
                            report.status === "Completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {filteredReports.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-14 text-center text-sm text-slate-500"
                    >
                      No reports match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
            Showing {filteredReports.length} of {reports.length} sample reports
          </div>
        </section>
      </div>
    </div>
  );
}
