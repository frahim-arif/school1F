"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  Download,
  User,
  GraduationCap,
  Phone,
  IndianRupee,
} from "lucide-react";

const student = {
  id: "SCH001",
  name: "Mohammad Ali",
  image: "https://i.pravatar.cc/300?img=15",
  class: "Class 10",
  section: "A",
  guardian: "Abdul Karim",
  phone: "9876543210",
};

const summary = {
  total: 30000,
  paid: 25000,
  due: 5000,
};

const payments = [
  {
    month: "April",
    fee: 2500,
    paid: 2500,
    status: "Paid",
    receipt: "RCPT1001",
  },
  {
    month: "May",
    fee: 2500,
    paid: 2500,
    status: "Paid",
    receipt: "RCPT1012",
  },
  {
    month: "June",
    fee: 2500,
    paid: 1000,
    status: "Partial",
    receipt: "RCPT1020",
  },
  {
    month: "July",
    fee: 2500,
    paid: 0,
    status: "Pending",
    receipt: "-",
  },
];

export default function StudentLedgerPage() {
  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-3xl font-black">
            Student Fee Ledger
          </h1>

          <p className="mt-2 text-slate-500">
            Complete payment history
          </p>

        </div>

        <div className="flex gap-3">

          <Link
            href="/admin/fees/pending"
            className="flex items-center gap-2 rounded-xl border px-5 py-3"
          >
            <ArrowLeft size={18}/>
            Back
          </Link>

          <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white">
            <Printer size={18}/>
            Print
          </button>

          <button className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-white">
            <Download size={18}/>
            PDF
          </button>

        </div>

      </div>

      {/* Student */}

      <div className="grid gap-6 lg:grid-cols-3">

        <div className="rounded-3xl border bg-white p-8 shadow-sm">

          <div className="flex flex-col items-center">

            <img
              src={student.image}
              className="h-32 w-32 rounded-full object-cover border-4 border-emerald-100"
            />

            <h2 className="mt-5 text-2xl font-bold">
              {student.name}
            </h2>

            <p className="text-slate-500">
              {student.id}
            </p>

          </div>

          <div className="mt-8 space-y-5">

            <Item
              icon={GraduationCap}
              title="Class"
              value={`${student.class} (${student.section})`}
            />

            <Item
              icon={User}
              title="Guardian"
              value={student.guardian}
            />

            <Item
              icon={Phone}
              title="Phone"
              value={student.phone}
            />

          </div>

        </div>

        {/* Summary */}

        <div className="lg:col-span-2 grid gap-6 md:grid-cols-3">

          <Card
            title="Total Fees"
            value={summary.total}
            color="emerald"
          />

          <Card
            title="Paid"
            value={summary.paid}
            color="blue"
          />

          <Card
            title="Due"
            value={summary.due}
            color="red"
          />

        </div>

      </div>

      {/* Payment Table */}

      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">

        <table className="min-w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="px-5 py-4 text-left">
                Month
              </th>

              <th className="px-5 py-4 text-left">
                Fee
              </th>

              <th className="px-5 py-4 text-left">
                Paid
              </th>

              <th className="px-5 py-4 text-left">
                Receipt
              </th>

              <th className="px-5 py-4 text-left">
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {payments.map((item)=>(
              <tr
                key={item.month}
                className="border-t hover:bg-slate-50"
              >

                <td className="px-5 py-4">
                  {item.month}
                </td>

                <td className="px-5 py-4">
                  ₹{item.fee}
                </td>

                <td className="px-5 py-4">
                  ₹{item.paid}
                </td>

                <td className="px-5 py-4">
                  {item.receipt}
                </td>

                <td className="px-5 py-4">

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold
                    ${
                      item.status==="Paid"
                      ?"bg-green-100 text-green-700"
                      :item.status==="Partial"
                      ?"bg-yellow-100 text-yellow-700"
                      :"bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status}
                  </span>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

function Card({title,value,color}){

const map={
emerald:"bg-emerald-500",
blue:"bg-blue-500",
red:"bg-red-500"
}

return(

<div className="rounded-3xl border bg-white p-6 shadow-sm">

<div className="flex items-center justify-between">

<div>

<p className="text-slate-500">{title}</p>

<h2 className="mt-3 text-3xl font-black">
₹{value.toLocaleString()}
</h2>

</div>

<div className={`${map[color]} rounded-2xl p-4 text-white`}>

<IndianRupee/>

</div>

</div>

</div>

)

}

function Item({icon:Icon,title,value}){

return(

<div className="flex items-center gap-4">

<div className="rounded-xl bg-emerald-100 p-3">

<Icon className="text-emerald-700"/>

</div>

<div>

<p className="text-sm text-slate-500">
{title}
</p>

<h4 className="font-semibold">
{value}
</h4>

</div>

</div>

)

}