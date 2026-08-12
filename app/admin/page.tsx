"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Application } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

export default function Admin() {
  const [apps, setApps] = useState<Application[]>([]);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const router = useRouter();

  // =========================
  // LOAD APPLICATIONS
  // =========================
  async function load() {
    setLoading(true);

    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setApps([]);
    } else {
      setApps((data || []) as Application[]);
    }

    setLoading(false);
  }

  // =========================
  // AUTH CHECK
  // =========================
  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/admin/login");
        return;
      }

      await load();
    }

    checkUser();
  }, [router]);

  // =========================
  // UPDATE APPLICATION
  // =========================
  async function update(
    id: string,
    patch: Partial<Application>
  ) {
    const { error } = await supabase
      .from("applications")
      .update(patch)
      .eq("id", id);

    if (error) {
      alert(error.message);
      return false;
    }

    await load();
    return true;
  }

  // =========================
  // CREATE PUBLIC PAGE
  // =========================
  async function createPublicPage(a: Application) {
    const { data: existing, error: findError } =
      await supabase
        .from("member_info_page")
        .select("id")
        .eq("member_id", a.id)
        .maybeSingle();

    if (findError) {
      alert(
        "Public Page check error:\n" +
          findError.message
      );

      return false;
    }

    if (existing) {
      return true;
    }

    const { error } = await supabase
      .from("member_info_page")
      .insert({
        member_id: a.id,
        title: "ಸದಸ್ಯರ ಮಾಹಿತಿ",
        description: "",
        image_url: a.photo_url || "",
        phone: a.mobile || "",
        address:
          `${a.village || ""}, ${a.taluk || ""}, ${a.district || ""}`.replace(
            /^,\s*|,\s*$/g,
            ""
          ),
        website: "",
        is_active: true,
      });

    if (error) {
      alert(
        "Public Page create ಆಗಲಿಲ್ಲ:\n" +
          error.message
      );

      return false;
    }

    return true;
  }

  // =========================
  // GET NEXT MEMBERSHIP NUMBER
  // =========================
  async function getNextMembershipNumber() {
    const { data, error } = await supabase
      .from("applications")
      .select("membership_no")
      .not("membership_no", "is", null);

    if (error) {
      console.error(error);
      return "1";
    }

    let maxNumber = 0;

    (data || []).forEach((row: any) => {
      const value = String(row.membership_no || "").trim();

      // Only numeric membership numbers
      const number = Number(value);

      if (
        value !== "" &&
        Number.isFinite(number) &&
        number > maxNumber
      ) {
        maxNumber = number;
      }
    });

    return String(maxNumber + 1);
  }

  // =========================
  // APPROVE MEMBER
  // =========================
  async function approve(a: Application) {
    const automaticNext =
      await getNextMembershipNumber();

    const next = prompt(
      `Membership Number ಹಾಕಿ.\n\nಮುಂದಿನ automatic number: ${automaticNext}\n\nಖಾಲಿ ಬಿಟ್ಟರೆ ${automaticNext} ಬಳಸಲಾಗುತ್ತದೆ.`,
      automaticNext
    );

    if (next === null) {
      return;
    }

    const membershipNumber =
      next.trim() || automaticNext;

    // Check duplicate membership number
    const duplicate = apps.find(
      (item) =>
        item.id !== a.id &&
        item.membership_no &&
        String(item.membership_no).trim() ===
          membershipNumber
    );

    if (duplicate) {
      alert(
        `Membership Number ${membershipNumber} ಈಗಾಗಲೇ ಬಳಕೆಯಲ್ಲಿದೆ.\n\nಹಳೆಯ Member: ${duplicate.name}`
      );
      return;
    }

    // Approve using existing RPC
    const { error } = await supabase.rpc(
      "approve_application",
      {
        p_id: a.id,
        p_membership_no: membershipNumber,
      }
    );

    if (error) {
      alert(error.message);
      return;
    }

    // Create Public Page automatically
    const publicPageCreated =
      await createPublicPage({
        ...a,
        status: "approved",
        membership_no: membershipNumber,
      } as Application);

    if (!publicPageCreated) {
      return;
    }

    await load();

    alert(
      `Member Approved ✅\n\nMembership Number: ${membershipNumber}\n\nPublic Page ಕೂಡ automatic ಆಗಿ create ಆಗಿದೆ.`
    );
  }

  // =========================
  // REJECT
  // =========================
  async function reject(a: Application) {
    const ok = confirm(
      `${a.name} ಅವರ application ಅನ್ನು Reject ಮಾಡಬೇಕೇ?`
    );

    if (!ok) return;

    await update(a.id, {
      status: "rejected",
    });
  }

  // =========================
  // DELETE APPROVED MEMBER
  // =========================
  async function deleteApprovedMember(
    a: Application
  ) {
    if (a.status !== "approved") {
      alert(
        "Approved members ಮಾತ್ರ delete ಮಾಡಬಹುದು."
      );
      return;
    }

    const ok = confirm(
      `${a.name}\nMembership No: ${
        a.membership_no || "—"
      }\n\nಈ approved member ಅನ್ನು ಸಂಪೂರ್ಣವಾಗಿ delete ಮಾಡಬೇಕೇ?\n\nಈ action ಅನ್ನು undo ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ.`
    );

    if (!ok) return;

    // First delete public page
    const { error: publicPageError } =
      await supabase
        .from("member_info_page")
        .delete()
        .eq("member_id", a.id);

    if (publicPageError) {
      alert(
        "Public Page delete ಆಗಲಿಲ್ಲ:\n" +
          publicPageError.message
      );
      return;
    }

    // Then delete application
    const { error: applicationError } =
      await supabase
        .from("applications")
        .delete()
        .eq("id", a.id);

    if (applicationError) {
      alert(
        "Member delete ಆಗಲಿಲ್ಲ:\n" +
          applicationError.message
      );
      return;
    }

    await load();

    alert(
      "Approved Member successfully deleted ✅"
    );
  }

  // =========================
  // EXPORT APPROVED MEMBERS TO EXCEL
  // =========================
  async function downloadApprovedExcel() {
    try {
      setExporting(true);

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("status", "approved")
        .order("membership_no", {
          ascending: true,
        });

      if (error) {
        alert(error.message);
        return;
      }

      if (!data || data.length === 0) {
        alert(
          "Approved Members ಯಾರೂ ಇಲ್ಲ."
        );
        return;
      }

      const rows = data.map(
        (a: any, index: number) => ({
          "Sl No": index + 1,
          "Membership Number":
            a.membership_no || "",
          "Name": a.name || "",
          "Designation": a.designation || "",
          "Village": a.village || "",
          "Taluk": a.taluk || "",
          "District": a.district || "",
          "Mobile": a.mobile || "",
          "Aadhaar": a.aadhaar || "",
          "Status": a.status || "",
          "Photo URL": a.photo_url || "",
          "Application ID": a.id || "",
          "Created At": a.created_at
            ? new Date(
                a.created_at
              ).toLocaleString("en-IN")
            : "",
        })
      );

      const worksheet =
        XLSX.utils.json_to_sheet(rows);

      // Column widths
      worksheet["!cols"] = [
        { wch: 8 },
        { wch: 20 },
        { wch: 25 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 16 },
        { wch: 18 },
        { wch: 14 },
        { wch: 45 },
        { wch: 40 },
        { wch: 24 },
      ];

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Approved Members"
      );

      const date =
        new Date()
          .toISOString()
          .slice(0, 10);

      XLSX.writeFile(
        workbook,
        `Approved-Members-${date}.xlsx`
      );

      alert(
        `${data.length} Approved Members Excel download ಆಯಿತು ✅`
      );
    } catch (error: any) {
      console.error(error);

      alert(
        "Excel generate ಆಗಲಿಲ್ಲ:\n" +
          (error?.message || "Unknown error")
      );
    } finally {
      setExporting(false);
    }
  }

  // =========================
  // LOGOUT
  // =========================
  async function logout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  // =========================
  // FILTER
  // =========================
  const shown = apps.filter((a) => {
    const matchesStatus =
      status === "all" ||
      a.status === status;

    const searchText = Object.values(a)
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      searchText.includes(
        q.toLowerCase()
      );

    return (
      matchesStatus &&
      matchesSearch
    );
  });

  // =========================
  // COUNTS
  // =========================
  const counts = {
    all: apps.length,

    pending: apps.filter(
      (a) => a.status === "pending"
    ).length,

    approved: apps.filter(
      (a) => a.status === "approved"
    ).length,

    rejected: apps.filter(
      (a) => a.status === "rejected"
    ).length,
  };

  // =========================
  // UI
  // =========================
  return (
    <main className="min-h-screen bg-slate-100">

      {/* HEADER */}
      <header className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-wrap gap-4 justify-between items-center">

          <div>
            <h1 className="text-xl font-bold">
              Admin Dashboard
            </h1>

            <p className="text-xs text-slate-400 mt-1">
              Membership Management System
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            <Link
              href="/admin/editor"
              className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg"
            >
              Website Editor
            </Link>

            <Link
              href="/admin/card"
              className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg"
            >
              PVC Designer
            </Link>

            <button
              onClick={
                downloadApprovedExcel
              }
              disabled={exporting}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 px-3 py-2 rounded-lg font-semibold"
            >
              {exporting
                ? "Preparing Excel..."
                : "📊 Approved Excel"}
            </button>

            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg"
            >
              Logout
            </button>

          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* COUNTS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {(
            [
              "all",
              "pending",
              "approved",
              "rejected",
            ] as const
          ).map((s) => (

            <button
              key={s}
              onClick={() =>
                setStatus(s)
              }
              className={`
                bg-white rounded-2xl p-5
                text-left shadow-sm
                ${
                  status === s
                    ? "ring-2 ring-green-500"
                    : ""
                }
              `}
            >

              <div className="text-sm text-slate-500">
                {s.toUpperCase()}
              </div>

              <div className="text-3xl font-bold mt-1">
                {counts[s]}
              </div>

            </button>

          ))}

        </div>

        {/* APPROVED EXPORT AREA */}
        <div className="bg-white rounded-2xl mt-6 p-5 shadow-sm flex flex-wrap gap-3 items-center justify-between">

          <div>
            <h2 className="font-bold text-lg">
              Approved Members
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Approved members details ಅನ್ನು Excel sheet ಆಗಿ download ಮಾಡಬಹುದು.
            </p>
          </div>

          <button
            onClick={
              downloadApprovedExcel
            }
            disabled={exporting}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-bold"
          >
            {exporting
              ? "Generating..."
              : "📥 Download Approved Excel"}
          </button>

        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl mt-6 shadow-sm overflow-hidden">

          {/* SEARCH */}
          <div className="p-4">

            <input
              placeholder="ಹೆಸರು / Mobile / District / Membership Number ಹುಡುಕಿ..."
              value={q}
              onChange={(e) =>
                setQ(e.target.value)
              }
              className="border rounded-xl px-4 py-3 w-full outline-none focus:ring-2 focus:ring-green-500"
            />

          </div>

          {loading ? (

            <p className="p-6">
              Loading...
            </p>

          ) : shown.length === 0 ? (

            <div className="p-10 text-center text-slate-500">
              No applications found.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-slate-50">

                  <tr>

                    {[
                      "ಹೆಸರು",
                      "ಮೊಬೈಲ್",
                      "ಜಿಲ್ಲೆ",
                      "Status",
                      "Membership No",
                      "Action",
                    ].map((x) => (

                      <th
                        key={x}
                        className="text-left p-3 whitespace-nowrap"
                      >
                        {x}
                      </th>

                    ))}

                  </tr>

                </thead>

                <tbody>

                  {shown.map((a) => (

                    <tr
                      key={a.id}
                      className="border-t hover:bg-slate-50"
                    >

                      <td className="p-3 font-semibold">
                        {a.name}
                      </td>

                      <td className="p-3">
                        {a.mobile}
                      </td>

                      <td className="p-3">
                        {a.district}
                      </td>

                      <td className="p-3">

                        <span
                          className={`
                            px-3 py-1 rounded-full
                            text-xs font-medium
                            ${
                              a.status ===
                              "approved"
                                ? "bg-green-100 text-green-700"
                                : a.status ===
                                  "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }
                          `}
                        >
                          {a.status}
                        </span>

                      </td>

                      <td className="p-3 font-bold">
                        {a.membership_no ||
                          "—"}
                      </td>

                      <td className="p-3">

                        <div className="flex flex-wrap gap-2">

                          {/* EDIT */}
                          <Link
                            href={`/admin/application?id=${a.id}`}
                            className="border border-slate-300 px-3 py-2 rounded-lg hover:bg-slate-100"
                          >
                            Edit
                          </Link>

                          {/* APPROVE */}
                          {a.status ===
                            "pending" && (
                            <button
                              onClick={() =>
                                approve(a)
                              }
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg"
                            >
                              Approve
                            </button>
                          )}

                          {/* REJECT */}
                          {a.status ===
                            "pending" && (
                            <button
                              onClick={() =>
                                reject(a)
                              }
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg"
                            >
                              Reject
                            </button>
                          )}

                          {/* CARD */}
                          {a.status ===
                            "approved" && (
                            <Link
                              href={`/admin/card?id=${a.id}`}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg"
                            >
                              Card
                            </Link>
                          )}

                          {/* PUBLIC PAGE */}
                          {a.status ===
                            "approved" && (
                            <Link
                              href={`/public-page?id=${a.id}`}
                              target="_blank"
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg"
                            >
                              Public Page
                            </Link>
                          )}

                          {/* DELETE */}
                          {a.status ===
                            "approved" && (
                            <button
                              onClick={() =>
                                deleteApprovedMember(
                                  a
                                )
                              }
                              className="bg-red-700 hover:bg-red-800 text-white px-3 py-2 rounded-lg"
                            >
                              🗑 Delete
                            </button>
                          )}

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
    </main>
  );
}
