"use client";

import { useState } from "react";
import {
  Search,
  Download,
  Eye,
  Printer,
  Calendar,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

const payments = [
  {
    id: 1,
    receipt: "RCPT-1001",
    student: "Mohammad Ali",
    admissionNo: "SCH001",
    class: "Class 10",
    amount: 2500,
    paymentMode: "Cash",
    transactionId: "TXN001254",
    status: "Success",
    date: "22 Jul 2026",
  },
  {
    id: 2,
    receipt: "RCPT-1002",
    student: "Rahul Sharma",
    admissionNo: "SCH002",
    class: "Class 9",
    amount: 3000,
    paymentMode: "UPI",
    transactionId: "TXN001255",
    status: "Success",
    date: "22 Jul 2026",
  },
  {
    id: 3,
    receipt: "RCPT-1003",
    student: "Fatima Begum",
    admissionNo: "SCH003",
    class: "Class 8",
    amount: 1500,
    paymentMode: "Card",
    transactionId: "TXN001256",
    status: "Pending",
    date: "21 Jul 2026",
  },
];

export default function PaymentHistoryPage() {
  const [data] = useState(payments);

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-3xl font-black">
            Payment History
          </h1>

          <p className="mt-2 text-slate-500">
            View all fee payment transactions
          </p>

        </div>

        <button className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-white">

          <Download size={18} />

          Export Excel

        </button>

      </div>

      {/* Summary */}

      <div className="grid gap-5 md:grid-cols-4">

        <Card title="Today's Collection" value="₹48,500" />

        <Card title="Transactions" value="56" />

        <Card title="Success" value="53" />

        <Card title="Pending" value="3" />

      </div>

      {/* Filters */}

      <div className="rounded-3xl border bg-white p-5 shadow-sm">

        <div className="grid gap-4 lg:grid-cols-5">

          <div className="relative">

            <Search
              className="absolute left-3 top-3.5 text-gray-400"
              size={18}
            />

            <input
              placeholder="Search Student..."
              className="w-full rounded-xl border py-3 pl-10 pr-4"
            />

          </div>

          <input
            type="date"
            className="rounded-xl border p-3"
          />

          <select className="rounded-xl border p-3">

            <option>All Status</option>

            <option>Success</option>

            <option>Pending</option>

            <option>Failed</option>

          </select>

          <select className="rounded-xl border p-3">

            <option>Payment Mode</option>

            <option>Cash</option>

            <option>UPI</option>

            <option>Card</option>

            <option>Bank</option>

          </select>

          <button className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white">

            <Filter size={18} />

            Filter

          </button>

        </div>

      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="px-5 py-4 text-left">Receipt</th>

                <th className="px-5 py-4 text-left">Student</th>

                <th className="px-5 py-4">Class</th>

                <th className="px-5 py-4">Amount</th>

                <th className="px-5 py-4">Mode</th>

                <th className="px-5 py-4">Transaction</th>

                <th className="px-5 py-4">Date</th>

                <th className="px-5 py-4">Status</th>

                <th className="px-5 py-4">Action</th>

              </tr>

            </thead>

            <tbody>

              {data.map((item) => (

                <tr
                  key={item.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="px-5 py-4 font-bold">
                    {item.receipt}
                  </td>

                  <td className="px-5 py-4">

                    <div>

                      <h3 className="font-semibold">
                        {item.student}
                      </h3>

                      <p className="text-xs text-slate-500">
                        {item.admissionNo}
                      </p>

                    </div>

                  </td>

                  <td className="text-center">
                    {item.class}
                  </td>

                  <td className="text-center font-bold text-emerald-600">
                    ₹{item.amount}
                  </td>

                  <td className="text-center">
                    {item.paymentMode}
                  </td>

                  <td className="text-center">
                    {item.transactionId}
                  </td>

                  <td className="text-center">
                    {item.date}
                  </td>

                  <td className="text-center">

                    <Status status={item.status} />

                  </td>

                  <td>

                    <div className="flex justify-center gap-2">

                      <button className="rounded-lg bg-blue-100 p-2 text-blue-600">
                        <Eye size={18} />
                      </button>

                      <button className="rounded-lg bg-green-100 p-2 text-green-600">
                        <Printer size={18} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <p className="text-slate-500">{title}</p>
      <h2 className="mt-3 text-3xl font-black">{value}</h2>
    </div>
  );
}

function Status({ status }) {
  if (status === "Success")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
        <CheckCircle size={14} />
        Success
      </span>
    );

  if (status === "Pending")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
        <Clock size={14} />
        Pending
      </span>
    );

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
      <XCircle size={14} />
      Failed
    </span>
  );
}