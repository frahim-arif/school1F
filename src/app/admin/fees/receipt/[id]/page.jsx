"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  Download,
  CheckCircle2,
  School,
} from "lucide-react";

export default function FeeReceiptPage() {
  const receipt = {
    receiptNo: "RCPT-1001",
    date: "22 Jul 2026",
    paymentMode: "Cash",

    student: {
      admissionNo: "SCH001",
      name: "Mohammad Ali",
      class: "Class 10",
      section: "A",
      guardian: "Abdul Karim",
      mobile: "9876543210",
    },

    items: [
      {
        title: "Monthly Tuition Fee",
        amount: 2000,
      },
      {
        title: "Computer Fee",
        amount: 300,
      },
      {
        title: "Library Fee",
        amount: 200,
      },
    ],

    discount: 0,
    fine: 0,
  };

  const subtotal = receipt.items.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const total =
    subtotal -
    receipt.discount +
    receipt.fine;

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-3xl font-black">
            Fee Receipt
          </h1>

          <p className="mt-2 text-slate-500">
            Printable payment receipt
          </p>

        </div>

        <div className="flex gap-3">

          <Link
            href="/admin/fees"
            className="flex items-center gap-2 rounded-xl border px-5 py-3 hover:bg-slate-100"
          >
            <ArrowLeft size={18} />
            Back
          </Link>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            <Printer size={18} />
            Print
          </button>

          <button
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            <Download size={18} />
            Download PDF
          </button>

        </div>

      </div>

      {/* Receipt */}

      <div
        id="receipt"
        className="mx-auto max-w-4xl rounded-3xl border bg-white p-10 shadow-lg"
      >

        {/* School */}

        <div className="flex items-center justify-between border-b pb-8">

          <div className="flex items-center gap-4">

            <div className="rounded-2xl bg-emerald-100 p-5">

              <School
                size={42}
                className="text-emerald-700"
              />

            </div>

            <div>

              <h2 className="text-3xl font-black">
                ABC Public School
              </h2>

              <p className="text-slate-500">
                Nagaon, Assam
              </p>

            </div>

          </div>

          <div className="text-right">

            <h3 className="text-xl font-bold">
              FEE RECEIPT
            </h3>

            <p className="mt-2">
              Receipt :
              <span className="font-bold">
                {" "}
                {receipt.receiptNo}
              </span>
            </p>

            <p>
              Date :
              <span className="font-bold">
                {" "}
                {receipt.date}
              </span>
            </p>

          </div>

        </div>

        {/* Student */}

        <div className="mt-8 grid gap-6 md:grid-cols-2">

          <Info
            title="Student Name"
            value={receipt.student.name}
          />

          <Info
            title="Admission No"
            value={receipt.student.admissionNo}
          />

          <Info
            title="Class"
            value={`${receipt.student.class} (${receipt.student.section})`}
          />

          <Info
            title="Guardian"
            value={receipt.student.guardian}
          />

          <Info
            title="Mobile"
            value={receipt.student.mobile}
          />

          <Info
            title="Payment Mode"
            value={receipt.paymentMode}
          />

        </div>

        {/* Table */}

        <div className="mt-10 overflow-hidden rounded-2xl border">

          <table className="min-w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="px-5 py-4 text-left">
                  Particular
                </th>

                <th className="px-5 py-4 text-right">
                  Amount
                </th>

              </tr>

            </thead>

            <tbody>

              {receipt.items.map((item) => (

                <tr
                  key={item.title}
                  className="border-t"
                >

                  <td className="px-5 py-4">
                    {item.title}
                  </td>

                  <td className="px-5 py-4 text-right font-semibold">
                    ₹{item.amount}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* Summary */}

        <div className="mt-8 ml-auto w-full max-w-sm space-y-3">

          <Row
            title="Subtotal"
            value={subtotal}
          />

          <Row
            title="Discount"
            value={receipt.discount}
          />

          <Row
            title="Fine"
            value={receipt.fine}
          />

          <div className="flex justify-between border-t pt-4 text-xl font-black">

            <span>Total</span>

            <span>
              ₹{total}
            </span>

          </div>

        </div>

        {/* Footer */}

        <div className="mt-12 flex flex-col items-center border-t pt-8">

          <CheckCircle2
            className="text-green-600"
            size={48}
          />

          <h3 className="mt-3 text-xl font-bold text-green-700">
            Payment Successful
          </h3>

          <p className="mt-2 text-center text-slate-500">
            Thank you for your payment.
            <br />
            This is a computer generated receipt.
          </p>

        </div>

      </div>

    </div>
  );
}

function Info({ title, value }) {
  return (
    <div>

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h4 className="mt-1 text-lg font-bold">
        {value}
      </h4>

    </div>
  );
}

function Row({ title, value }) {
  return (
    <div className="flex justify-between">

      <span className="text-slate-500">
        {title}
      </span>

      <span className="font-bold">
        ₹{value}
      </span>

    </div>
  );
}