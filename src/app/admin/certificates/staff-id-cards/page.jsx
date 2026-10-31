
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Search,
  Printer,
  Users,
  UserRound,
  CheckSquare,
  Square,
  AlertCircle,
} from "lucide-react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_BASE = API_URL.endsWith("/api")
  ? API_URL
  : `${API_URL}/api`;

const SCHOOL_NAME = "ADARSHA MARKAZ ACADEMY";
const SCHOOL_ADDRESS = "Laharighat, Morigaon, Assam 782127";

function getStaffName(staff) {
  return (
    staff.name ||
    [staff.firstName, staff.middleName, staff.lastName]
      .filter(Boolean)
      .join(" ") ||
    staff.fullName ||
    "Staff Member"
  );
}

function getStaffId(staff) {
  return (
    staff.employeeId ||
    staff.staffId ||
    staff.staffCode ||
    staff.employeeCode ||
    staff.empId ||
    "Not assigned"
  );
}

function getDesignation(staff) {
  return (
    staff.designation ||
    staff.position ||
    staff.jobTitle ||
    staff.role ||
    "Staff"
  );
}

function getDepartment(staff) {
  return staff.department || staff.subject || staff.section || "";
}

function getPhoto(staff) {
  const photo =
    staff.photo ||
    staff.profilePhoto ||
    staff.image ||
    staff.avatar ||
    "";

  if (!photo) return "";

  if (/^https?:\/\//i.test(photo) || photo.startsWith("data:")) {
    return photo;
  }

  if (photo.startsWith("/")) {
    return `${API_URL}${photo}`;
  }

  return `${API_URL}/${photo}`;
}

function getStaffList(result) {
  const data = result?._data ?? result?.data ?? result;

  if (Array.isArray(data)) return data;

  return (
    data?.staff ||
    data?.staffMembers ||
    data?.employees ||
    data?.items ||
    data?.docs ||
    []
  );
}

export default function StaffIdCardsPage() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("adminToken")
          : null;

      const response = await fetch(`${API_BASE}/staff`, {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
        cache: "no-store",
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || result?._status === false) {
        throw new Error(
          result?._message ||
            `Staff API request failed (${response.status})`
        );
      }

      const list = getStaffList(result);

      if (!Array.isArray(list)) {
        throw new Error("Staff API ne valid list return nahi ki.");
      }

      setStaffList(list);
      setSelectedIds([]);
    } catch (err) {
      setError(err.message || "Staff records load nahi ho paaye.");
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const designations = useMemo(() => {
    return [
      ...new Set(
        staffList
          .map((staff) => getDesignation(staff))
          .filter((designation) => designation !== "Staff")
      ),
    ].sort();
  }, [staffList]);

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();

    return staffList.filter((staff) => {
      const name = getStaffName(staff);
      const staffId = getStaffId(staff);
      const designation = getDesignation(staff);
      const department = getDepartment(staff);
      const phone = staff.phone || staff.mobile || staff.mobileNumber || "";
      const email = staff.email || "";

      const matchesSearch =
        !query ||
        [
          name,
          staffId,
          designation,
          department,
          phone,
          email,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );

      const matchesDesignation =
        !designationFilter || designation === designationFilter;

      return matchesSearch && matchesDesignation;
    });
  }, [staffList, search, designationFilter]);

  const allFilteredSelected =
    filteredStaff.length > 0 &&
    filteredStaff.every((staff) => selectedIds.includes(staff._id));

  const toggleSelect = (id) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds((previous) =>
        previous.filter(
          (id) => !filteredStaff.some((staff) => staff._id === id)
        )
      );
    } else {
      setSelectedIds((previous) => [
        ...new Set([
          ...previous,
          ...filteredStaff.map((staff) => staff._id),
        ]),
      ]);
    }
  };

  const selectedStaff = staffList.filter((staff) =>
    selectedIds.includes(staff._id)
  );

  const handlePrint = () => {
    if (!selectedStaff.length) {
      window.alert("Print karne ke liye pehle staff select karein.");
      return;
    }

    window.print();
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6 lg:p-8">
      <div className="no-print mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/admin/certificates"
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
            >
              <ArrowLeft size={17} />
              Certificates Dashboard
            </Link>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              School ERP / Staff Management
            </p>

            <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Staff ID Cards
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Staff identity cards manage karein aur selected cards print karein.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={fetchStaff}
              disabled={loading}
              className="inline-flex items-center gap-2 border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={selectedIds.length === 0}
              className="inline-flex items-center gap-2 bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Printer size={18} />
              Print Cards ({selectedIds.length})
            </button>
          </div>
        </header>

        {error && (
          <div className="flex items-start gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle size={20} className="shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-bold">Staff records load nahi hue</p>
              <p className="mt-1 break-words">{error}</p>
              <p className="mt-2">
                Check karein ki backend mein GET /api/staff route working hai.
              </p>
            </div>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Total Staff</p>
              <Users size={20} className="text-emerald-700" />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-slate-900">
              {loading ? "—" : staffList.length}
            </p>
          </div>

          <div className="border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Filtered Staff</p>
              <UserRound size={20} className="text-blue-700" />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-slate-900">
              {loading ? "—" : filteredStaff.length}
            </p>
          </div>

          <div className="border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Selected for Printing</p>
              <CheckSquare size={20} className="text-amber-700" />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-slate-900">
              {selectedIds.length}
            </p>
          </div>
        </section>

        <section className="border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, staff ID, phone..."
                className="w-full border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-600"
              />
            </div>

            <select
              value={designationFilter}
              onChange={(event) =>
                setDesignationFilter(event.target.value)
              }
              className="w-full border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
            >
              <option value="">All designations</option>
              {designations.map((designation) => (
                <option key={designation} value={designation}>
                  {designation}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={toggleSelectAll}
              disabled={filteredStaff.length === 0}
              className="inline-flex items-center justify-center gap-2 border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
            >
              {allFilteredSelected ? (
                <CheckSquare size={18} />
              ) : (
                <Square size={18} />
              )}
              {allFilteredSelected ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Select</th>
                  <th className="px-5 py-4">Staff Member</th>
                  <th className="px-5 py-4">Staff ID</th>
                  <th className="px-5 py-4">Designation</th>
                  <th className="px-5 py-4">Department</th>
                  <th className="px-5 py-4">Phone</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      <RefreshCw
                        size={22}
                        className="mx-auto mb-2 animate-spin"
                      />
                      Loading staff records...
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      <Users
                        size={32}
                        className="mx-auto mb-3 text-slate-300"
                      />
                      <p className="font-semibold text-slate-700">
                        No staff records found
                      </p>
                      <p className="mt-1 text-xs">
                        Search change karein ya backend mein staff records check karein.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staff) => {
                    const selected = selectedIds.includes(staff._id);

                    return (
                      <tr
                        key={staff._id}
                        className={selected ? "bg-emerald-50/60" : "hover:bg-slate-50"}
                      >
                        <td className="px-5 py-4">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleSelect(staff._id)}
                            aria-label={`Select ${getStaffName(staff)}`}
                            className="h-4 w-4 accent-emerald-700"
                          />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {getPhoto(staff) ? (
                              <img
                                src={getPhoto(staff)}
                                alt=""
                                className="h-10 w-10 border border-slate-200 object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center bg-slate-100 text-slate-400">
                                <UserRound size={21} />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-slate-800">
                                {getStaffName(staff)}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {staff.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 font-medium text-slate-700">
                          {getStaffId(staff)}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {getDesignation(staff)}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {getDepartment(staff) || "—"}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {staff.phone ||
                            staff.mobile ||
                            staff.mobileNumber ||
                            "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
            Showing {filteredStaff.length} of {staffList.length} staff members
          </div>
        </section>
      </div>

      <section className="print-area hidden">
        <div className="print-grid">
          {selectedStaff.map((staff) => (
            <article className="staff-card" key={staff._id}>
              <div className="staff-card-header">
                <div className="school-monogram">AMA</div>
                <div className="school-heading">
                  <h2>{SCHOOL_NAME}</h2>
                  <p>{SCHOOL_ADDRESS}</p>
                  <strong>STAFF IDENTITY CARD</strong>
                </div>
              </div>

              <div className="staff-card-content">
                <div className="staff-photo">
                  {getPhoto(staff) ? (
                    <img
                      src={getPhoto(staff)}
                      alt={getStaffName(staff)}
                    />
                  ) : (
                    <div className="photo-placeholder">
                      <UserRound size={42} />
                    </div>
                  )}
                </div>

                <div className="staff-details">
                  <h3>{getStaffName(staff)}</h3>
                  <p>
                    <b>Staff ID:</b> {getStaffId(staff)}
                  </p>
                  <p>
                    <b>Designation:</b> {getDesignation(staff)}
                  </p>
                  {getDepartment(staff) && (
                    <p>
                      <b>Department:</b> {getDepartment(staff)}
                    </p>
                  )}
                  {(staff.phone || staff.mobile || staff.mobileNumber) && (
                    <p>
                      <b>Phone:</b>{" "}
                      {staff.phone || staff.mobile || staff.mobileNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="staff-card-footer">
                <span>Authorized Signature</span>
                <span>School Seal</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <style jsx global>{`
        @media screen {
          .print-area {
            display: none !important;
          }
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden !important;
          }

          .print-area,
          .print-area * {
            visibility: visible !important;
          }

          .no-print {
            display: none !important;
          }

          .print-area {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #fff !important;
          }

          .print-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8mm 6mm;
            align-items: start;
          }

          .staff-card {
            width: 100%;
            min-height: 53mm;
            box-sizing: border-box;
            border: 1px solid #1e3a5f;
            background: #fff;
            color: #172033;
            break-inside: avoid;
            page-break-inside: avoid;
            font-family: Arial, sans-serif;
          }

          .staff-card-header {
            display: flex;
            align-items: center;
            gap: 7px;
            padding: 7px;
            background: #0b302a !important;
            color: white !important;
            border-bottom: 3px solid #c8ae6a;
          }

          .school-monogram {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: 36px;
            height: 36px;
            border: 1px solid #c8ae6a;
            border-radius: 50%;
            font-size: 10px;
            font-weight: 800;
            color: #fff;
          }

          .school-heading {
            min-width: 0;
            text-align: center;
            flex: 1;
          }

          .school-heading h2 {
            font-size: 10px;
            line-height: 1.3;
            font-weight: 800;
          }

          .school-heading p {
            margin-top: 2px;
            font-size: 6px;
            line-height: 1.3;
          }

          .school-heading strong {
            display: block;
            margin-top: 4px;
            font-size: 8px;
            letter-spacing: 0.7px;
          }

          .staff-card-content {
            display: flex;
            align-items: center;
            gap: 9px;
            padding: 9px;
          }

          .staff-photo {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: 25mm;
            height: 30mm;
            overflow: hidden;
            border: 1px solid #cbd5e1;
            background: #f1f5f9;
          }

          .staff-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .photo-placeholder {
            color: #64748b;
          }

          .staff-details {
            min-width: 0;
            flex: 1;
            overflow-wrap: anywhere;
          }

          .staff-details h3 {
            margin-bottom: 5px;
            font-size: 10px;
            line-height: 1.3;
            font-weight: 800;
            text-transform: uppercase;
          }

          .staff-details p {
            margin-top: 3px;
            font-size: 7px;
            line-height: 1.35;
          }

          .staff-card-footer {
            display: flex;
            justify-content: space-between;
            gap: 8px;
            margin: 0 9px;
            padding: 6px 0;
            border-top: 1px solid #cbd5e1;
            font-size: 6px;
            color: #334155;
          }

          .staff-card-footer span {
            min-width: 60px;
            padding-top: 4px;
            border-top: 1px solid #64748b;
            text-align: center;
          }
        }
      `}</style>
    </main>
  );
}
