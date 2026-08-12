"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Application } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

export default function Admin() {
  const router = useRouter();

  const [apps, setApps] = useState<Application[]>([]);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [showRecycleBin, setShowRecycleBin] =
    useState(false);

  // Membership number setting
  const [membershipStartNo, setMembershipStartNo] =
    useState("1");

  const [savingMembershipStart, setSavingMembershipStart] =
    useState(false);

  // =====================================================
  // LOAD ALL APPLICATIONS
  // =====================================================

  async function load() {
    setLoading(true);

    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      alert(error.message);
      setApps([]);
    } else {
      setApps((data || []) as Application[]);
    }

    setLoading(false);
  }

  // =====================================================
  // LOAD MEMBERSHIP START NUMBER
  // =====================================================

  async function loadMembershipStartNumber() {
    const { data, error } = await supabase
      .from("site_settings")
      .select("membership_start_no")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error(
        "Membership setting load error:",
        error
      );
      return;
    }

    if (
      data &&
      data.membership_start_no !== null &&
      data.membership_start_no !== undefined
    ) {
      setMembershipStartNo(
        String(data.membership_start_no)
      );
    }
  }

  // =====================================================
  // AUTH
  // =====================================================

  useEffect(() => {
    async function init() {
      const { data } =
        await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/admin/login");
        return;
      }

      await Promise.all([
        load(),
        loadMembershipStartNumber(),
      ]);
    }

    init();
  }, [router]);

  // =====================================================
  // SAVE MEMBERSHIP START NUMBER
  // =====================================================

  async function saveMembershipStartNumber() {
    const value =
      membershipStartNo.trim();

    const number = Number(value);

    if (
      !value ||
      !Number.isInteger(number) ||
      number < 1
    ) {
      alert(
        "ದಯವಿಟ್ಟು 1 ಅಥವಾ ಅದಕ್ಕಿಂತ ದೊಡ್ಡ ಪೂರ್ಣ ಸಂಖ್ಯೆ ಹಾಕಿ."
      );
      return;
    }

    setSavingMembershipStart(true);

    try {
      const { error } =
        await supabase
          .from("site_settings")
          .update({
            membership_start_no: number,
          })
          .eq("id", 1);

      if (error) {
        alert(
          "Starting Membership Number save ಆಗಲಿಲ್ಲ:\n\n" +
            error.message
        );
        return;
      }

      alert(
        `Membership Number starting number ${number} ಆಗಿ save ಆಯಿತು ✅`
      );
    } finally {
      setSavingMembershipStart(false);
    }
  }

  // =====================================================
  // UPDATE APPLICATION
  // =====================================================

  async function update(
    id: string,
    patch: any
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

  // =====================================================
  // CREATE / RESTORE PUBLIC PAGE
  // =====================================================

  async function createPublicPage(
    a: any
  ) {
    const {
      data: existing,
      error: findError,
    } = await supabase
      .from("member_info_page")
      .select("id")
      .eq("member_id", a.id)
      .maybeSingle();

    if (findError) {
      alert(
        "Public Page check error:\n\n" +
          findError.message
      );

      return false;
    }

    // Existing page → simply activate
    if (existing) {
      const {
        error: updateError,
      } = await supabase
        .from("member_info_page")
        .update({
          is_active: true,
        })
        .eq("member_id", a.id);

      if (updateError) {
        alert(
          "Public Page active ಮಾಡಲಾಗಲಿಲ್ಲ:\n\n" +
            updateError.message
        );

        return false;
      }

      return true;
    }

    // Create new page
    const address =
      `${a.village || ""}, ${
        a.taluk || ""
      }, ${a.district || ""}`
        .replace(
          /^,\s*/,
          ""
        )
        .replace(
          /,\s*$/,
          ""
        );

    const { error } =
      await supabase
        .from("member_info_page")
        .insert({
          member_id: a.id,
          title: "ಸದಸ್ಯರ ಮಾಹಿತಿ",
          description: "",
          image_url:
            a.photo_url || "",
          phone:
            a.mobile || "",
          address,
          website: "",
          is_active: true,
        });

    if (error) {
      alert(
        "Public Page create ಆಗಲಿಲ್ಲ:\n\n" +
          error.message
      );

      return false;
    }

    return true;
  }

  // =====================================================
  // GET NEXT MEMBERSHIP NUMBER
  // =====================================================

  async function getNextMembershipNumber() {
    const startNumber =
      Number(
        membershipStartNo
      ) || 1;

    const { data, error } =
      await supabase
        .from("applications")
        .select(
          "membership_no"
        );

    if (error) {
      console.error(
        "Membership number error:",
        error
      );

      return String(
        startNumber
      );
    }

    let highest = startNumber - 1;

    (data || []).forEach(
      (row: any) => {
        const value =
          String(
            row.membership_no ||
              ""
          ).trim();

        if (!value) {
          return;
        }

        const number =
          Number(value);

        if (
          Number.isInteger(
            number
          ) &&
          number > highest
        ) {
          highest = number;
        }
      }
    );

    return String(
      Math.max(
        startNumber,
        highest + 1
      )
    );
  }

  // =====================================================
  // APPROVE MEMBER
  // =====================================================

  async function approve(
    a: any
  ) {
    const automaticNext =
      await getNextMembershipNumber();

    const input =
      prompt(
        `Membership Number ಹಾಕಿ.\n\nAutomatic next number: ${automaticNext}\n\nಖಾಲಿ ಬಿಟ್ಟರೆ ${automaticNext} ಬಳಸಲಾಗುತ್ತದೆ.`,
        automaticNext
      );

    if (input === null) {
      return;
    }

    const membershipNumber =
      input.trim() ||
      automaticNext;

    if (
      !/^\d+$/.test(
        membershipNumber
      )
    ) {
      alert(
        "Membership Number numeric ಆಗಿರಬೇಕು."
      );
      return;
    }

    // Check duplicate
    const duplicate =
      apps.find(
        (item: any) =>
          item.id !== a.id &&
          item.membership_no &&
          String(
            item.membership_no
          ).trim() ===
            membershipNumber
      );

    if (duplicate) {
      alert(
        `Membership Number ${membershipNumber} ಈಗಾಗಲೇ ಬಳಕೆಯಲ್ಲಿದೆ.\n\nMember: ${duplicate.name}`
      );

      return;
    }

    // Approve application
    const { error } =
      await supabase.rpc(
        "approve_application",
        {
          p_id: a.id,
          p_membership_no:
            membershipNumber,
        }
      );

    if (error) {
      alert(
        "Approve ಆಗಲಿಲ್ಲ:\n\n" +
          error.message
      );
      return;
    }

    // Create public page
    const publicPageCreated =
      await createPublicPage({
        ...a,
        status: "approved",
        membership_no:
          membershipNumber,
      });

    if (!publicPageCreated) {
      return;
    }

    // Make sure member is active
    const {
      error: clearDeleteError,
    } = await supabase
      .from("applications")
      .update({
        is_deleted: false,
        deleted_at: null,
        deleted_by: null,
      })
      .eq("id", a.id);

    if (clearDeleteError) {
      alert(
        clearDeleteError.message
      );
      return;
    }

    await load();

    alert(
      `Member Approved ✅\n\nMembership Number: ${membershipNumber}\n\nPublic Page ready.`
    );
  }

  // =====================================================
  // REJECT
  // =====================================================

  async function reject(
    a: any
  ) {
    const ok =
      confirm(
        `${a.name} ಅವರ application ಅನ್ನು Reject ಮಾಡಬೇಕೇ?`
      );

    if (!ok) {
      return;
    }

    await update(a.id, {
      status: "rejected",
    });
  }

  // =====================================================
  // MOVE TO RECYCLE BIN
  // =====================================================

  async function moveToRecycleBin(
    a: any
  ) {
    if (
      a.status !== "approved"
    ) {
      alert(
        "Approved member ಮಾತ್ರ Recycle Binಗೆ move ಮಾಡಬಹುದು."
      );
      return;
    }

    const ok =
      confirm(
        `🗑️ ${a.name}\n\nMembership No: ${
          a.membership_no || "—"
        }\n\nಈ member ಅನ್ನು Recycle Binಗೆ move ಮಾಡಬೇಕೇ?\n\nಇದು permanent delete ಅಲ್ಲ. ನಂತರ Recover ಮಾಡಬಹುದು.`
      );

    if (!ok) {
      return;
    }

    const {
      data: userData,
    } = await supabase.auth.getUser();

    // Soft delete application
    const {
      error,
    } = await supabase
      .from("applications")
      .update({
        is_deleted: true,
        deleted_at:
          new Date().toISOString(),
        deleted_by:
          userData.user?.id ||
          null,
      })
      .eq("id", a.id);

    if (error) {
      alert(
        "Recycle Binಗೆ move ಆಗಲಿಲ್ಲ:\n\n" +
          error.message
      );

      return;
    }

    // Deactivate public page
    const {
      error: publicError,
    } = await supabase
      .from("member_info_page")
      .update({
        is_active: false,
      })
      .eq("member_id", a.id);

    if (publicError) {
      alert(
        "Public Page inactive ಮಾಡಲಾಗಲಿಲ್ಲ:\n\n" +
          publicError.message
      );

      return;
    }

    await load();

    alert(
      "Member Recycle Binಗೆ move ಆಯಿತು ♻️"
    );
  }

  // =====================================================
  // RECOVER
  // =====================================================

  async function recoverMember(
    a: any
  ) {
    const ok =
      confirm(
        `♻️ ${a.name}\n\nMembership No: ${
          a.membership_no || "—"
        }\n\nಈ member ಅನ್ನು ಮತ್ತೆ Approved Membersಗೆ ತರಬೇಕೇ?`
      );

    if (!ok) {
      return;
    }

    // Restore application
    const {
      error,
    } = await supabase
      .from("applications")
      .update({
        is_deleted: false,
        deleted_at: null,
        deleted_by: null,
        status: "approved",
      })
      .eq("id", a.id);

    if (error) {
      alert(
        "Recover ಆಗಲಿಲ್ಲ:\n\n" +
          error.message
      );

      return;
    }

    // Restore public page
    const publicPage =
      await createPublicPage(
        a
      );

    if (!publicPage) {
      return;
    }

    await load();

    alert(
      `Member Recovered Successfully ✅\n\nMembership Number: ${
        a.membership_no ||
        "—"
      }`
    );
  }

  // =====================================================
  // PERMANENT DELETE
  // =====================================================

  async function permanentDelete(
    a: any
  ) {
    const ok =
      confirm(
        `⚠️ PERMANENT DELETE\n\n${a.name}\nMembership No: ${
          a.membership_no || "—"
        }\n\nಈ member ಅನ್ನು databaseನಿಂದ ಸಂಪೂರ್ಣವಾಗಿ delete ಮಾಡಲಾಗುತ್ತದೆ.\n\nಇದನ್ನು Recover ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ.\n\nಮುಂದುವರಿಸಬೇಕೇ?`
      );

    if (!ok) {
      return;
    }

    // Delete public page first
    const {
      error: publicPageError,
    } = await supabase
      .from("member_info_page")
      .delete()
      .eq("member_id", a.id);

    if (publicPageError) {
      alert(
        "Public Page delete ಆಗಲಿಲ್ಲ:\n\n" +
          publicPageError.message
      );

      return;
    }

    // Delete application
    const {
      error: applicationError,
    } = await supabase
      .from("applications")
      .delete()
      .eq("id", a.id);

    if (applicationError) {
      alert(
        "Member permanent delete ಆಗಲಿಲ್ಲ:\n\n" +
          applicationError.message
      );

      return;
    }

    await load();

    alert(
      "Member permanently deleted."
    );
  }

  // =====================================================
  // EXCEL DOWNLOAD
  // =====================================================

  async function downloadApprovedExcel() {
    try {
      setExporting(true);

      const {
        data,
        error,
      } = await supabase
        .from("applications")
        .select("*")
        .eq("status", "approved")
        .eq("is_deleted", false)
        .order(
          "membership_no",
          {
            ascending: true,
          }
        );

      if (error) {
        alert(error.message);
        return;
      }

      if (
        !data ||
        data.length === 0
      ) {
        alert(
          "Approved Members ಯಾರೂ ಇಲ್ಲ."
        );

        return;
      }

      const rows =
        data.map(
          (
            a: any,
            index: number
          ) => ({
            "Sl No":
              index + 1,

            "Membership Number":
              a.membership_no ||
              "",

            "Name":
              a.name || "",

            "Designation":
              a.designation ||
              "",

            "Village":
              a.village || "",

            "Taluk":
              a.taluk || "",

            "District":
              a.district ||
              "",

            "Mobile":
              a.mobile || "",

            "Aadhaar":
              a.aadhaar || "",

            "Status":
              a.status || "",

            "Application ID":
              a.id || "",

            "Created At":
              a.created_at
                ? new Date(
                    a.created_at
                  ).toLocaleString(
                    "en-IN"
                  )
                : "",
          })
        );

      const worksheet =
        XLSX.utils.json_to_sheet(
          rows
        );

      worksheet["!cols"] = [
        { wch: 8 },
        { wch: 20 },
        { wch: 25 },
        { wch: 20 },
        { wch: 20 },
        { wch: 18 },
        { wch: 18 },
        { wch: 16 },
        { wch: 18 },
        { wch: 14 },
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
        "Excel generate ಆಗಲಿಲ್ಲ:\n\n" +
          (error?.message ||
            "Unknown error")
      );
    } finally {
      setExporting(false);
    }
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  async function logout() {
    await supabase.auth.signOut();

    router.push(
      "/admin/login"
    );
  }

  // =====================================================
  // ACTIVE / DELETED
  // =====================================================

  const activeApps =
    apps.filter(
      (a: any) =>
        a.is_deleted !== true
    );

  const recycleApps =
    apps.filter(
      (a: any) =>
        a.is_deleted === true
    );

  // =====================================================
  // SEARCH + FILTER
  // =====================================================

  const shown =
    activeApps.filter(
      (a: any) => {
        const matchesStatus =
          status === "all" ||
          a.status === status;

        const searchText =
          Object.values(a)
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
      }
    );

  // =====================================================
  // COUNTS
  // =====================================================

  const counts = {
    all: activeApps.length,

    pending:
      activeApps.filter(
        (a: any) =>
          a.status ===
          "pending"
      ).length,

    approved:
      activeApps.filter(
        (a: any) =>
          a.status ===
          "approved"
      ).length,

    rejected:
      activeApps.filter(
        (a: any) =>
          a.status ===
          "rejected"
      ).length,
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-100">

      {/* ==========================================
          HEADER
      ========================================== */}

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
              disabled={
                exporting
              }
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 px-3 py-2 rounded-lg font-semibold"
            >
              {exporting
                ? "Preparing Excel..."
                : "📊 Approved Excel"}
            </button>

            <button
              onClick={() =>
                setShowRecycleBin(
                  !showRecycleBin
                )
              }
              className="bg-orange-500 hover:bg-orange-600 px-3 py-2 rounded-lg font-semibold"
            >
              ♻️ Recycle Bin
              {recycleApps.length >
                0 &&
                ` (${recycleApps.length})`}
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

      {/* ==========================================
          CONTENT
      ========================================== */}

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ========================================
            MEMBERSHIP NUMBER SETTINGS
        ======================================== */}

        <section className="bg-white rounded-2xl shadow-sm p-5 mb-6">

          <div className="flex flex-wrap items-end justify-between gap-5">

            <div>

              <h2 className="text-xl font-bold">
                🔢 Membership Number Settings
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                ಹೊಸ memberಗೆ Membership Number ಯಾವ numberನಿಂದ ಆರಂಭವಾಗಬೇಕು ಎಂದು ಇಲ್ಲಿ set ಮಾಡಿ.
              </p>

            </div>

            <div className="flex flex-wrap items-end gap-3">

              <div>

                <label className="block text-sm font-semibold mb-2">
                  Starting Number
                </label>

                <input
                  type="number"
                  min="1"
                  value={
                    membershipStartNo
                  }
                  onChange={(e) =>
                    setMembershipStartNo(
                      e.target.value
                    )
                  }
                  className="border border-slate-300 rounded-xl px-4 py-3 w-44 outline-none focus:ring-2 focus:ring-green-500"
                />

              </div>

              <button
                onClick={
                  saveMembershipStartNumber
                }
                disabled={
                  savingMembershipStart
                }
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-bold"
              >
                {savingMembershipStart
                  ? "Saving..."
                  : "💾 Save Number"}
              </button>

            </div>

          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">

            <b>Example:</b>{" "}
            Starting Number ={" "}
            <b>
              {membershipStartNo ||
                "1"}
            </b>

            <br />

            ಹೊಸ members:
            {" "}
            {membershipStartNo ||
              "1"}
            {" → "}
            {(
              Number(
                membershipStartNo ||
                  1
              ) + 1
            )}
            {" → "}
            {(
              Number(
                membershipStartNo ||
                  1
              ) + 2
            )}
            ...

            <br />

            Existing Membership Numbers
            <b> ಬದಲಾಗುವುದಿಲ್ಲ.</b>

          </div>

        </section>

        {/* ========================================
            RECYCLE BIN
        ======================================== */}

        {showRecycleBin && (

          <section className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-6">

            <div className="flex flex-wrap justify-between items-center gap-3">

              <div>

                <h2 className="text-xl font-bold text-orange-800">
                  ♻️ Recycle Bin
                </h2>

                <p className="text-sm text-orange-700 mt-1">
                  Delete ಮಾಡಿದ members ಇಲ್ಲಿ ಇರುತ್ತಾರೆ.
                </p>

              </div>

              <div className="bg-orange-200 text-orange-900 px-4 py-2 rounded-xl font-bold">
                {recycleApps.length} Deleted
              </div>

            </div>

            {recycleApps.length ===
            0 ? (

              <div className="bg-white rounded-xl p-6 mt-4 text-center text-slate-500">
                Recycle Bin ಖಾಲಿಯಾಗಿದೆ.
              </div>

            ) : (

              <div className="overflow-x-auto mt-4">

                <table className="w-full bg-white rounded-xl overflow-hidden">

                  <thead className="bg-orange-100">

                    <tr>

                      <th className="text-left p-3">
                        Name
                      </th>

                      <th className="text-left p-3">
                        Membership No
                      </th>

                      <th className="text-left p-3">
                        Deleted Date
                      </th>

                      <th className="text-left p-3">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {recycleApps.map(
                      (a: any) => (

                        <tr
                          key={a.id}
                          className="border-t"
                        >

                          <td className="p-3 font-semibold">
                            {a.name}
                          </td>

                          <td className="p-3 font-bold">
                            {a.membership_no ||
                              "—"}
                          </td>

                          <td className="p-3">
                            {a.deleted_at
                              ? new Date(
                                  a.deleted_at
                                ).toLocaleString(
                                  "en-IN"
                                )
                              : "—"}
                          </td>

                          <td className="p-3">

                            <div className="flex flex-wrap gap-2">

                              <button
                                onClick={() =>
                                  recoverMember(
                                    a
                                  )
                                }
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                              >
                                ♻️ Recover
                              </button>

                              <button
                                onClick={() =>
                                  permanentDelete(
                                    a
                                  )
                                }
                                className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg font-semibold"
                              >
                                🔴 Permanent Delete
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>

        )}

        {/* ========================================
            COUNTS
        ======================================== */}

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

        {/* ========================================
            EXCEL
        ======================================== */}

        <div className="bg-white rounded-2xl mt-6 p-5 shadow-sm flex flex-wrap gap-3 items-center justify-between">

          <div>

            <h2 className="font-bold text-lg">
              Approved Members
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Active approved members ಮಾತ್ರ Excelಗೆ ಬರುತ್ತಾರೆ.
            </p>

          </div>

          <button
            onClick={
              downloadApprovedExcel
            }
            disabled={
              exporting
            }
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-bold"
          >
            {exporting
              ? "Generating..."
              : "📥 Download Approved Excel"}
          </button>

        </div>

        {/* ========================================
            SEARCH
        ======================================== */}

        <div className="bg-white rounded-2xl mt-6 shadow-sm overflow-hidden">

          <div className="p-4">

            <input
              placeholder="ಹೆಸರು / Mobile / District / Membership Number ಹುಡುಕಿ..."
              value={q}
              onChange={(e) =>
                setQ(
                  e.target.value
                )
              }
              className="border rounded-xl px-4 py-3 w-full outline-none focus:ring-2 focus:ring-green-500"
            />

          </div>

          {/* ======================================
              TABLE
          ====================================== */}

          {loading ? (

            <p className="p-6">
              Loading...
            </p>

          ) : shown.length ===
            0 ? (

            <div className="p-10 text-center text-slate-500">
              No applications found.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="text-left p-3">
                      ಹೆಸರು
                    </th>

                    <th className="text-left p-3">
                      ಮೊಬೈಲ್
                    </th>

                    <th className="text-left p-3">
                      ಜಿಲ್ಲೆ
                    </th>

                    <th className="text-left p-3">
                      Status
                    </th>

                    <th className="text-left p-3">
                      Membership No
                    </th>

                    <th className="text-left p-3">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {shown.map(
                    (a: any) => (

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

                            <Link
                              href={`/admin/application?id=${a.id}`}
                              className="border border-slate-300 px-3 py-2 rounded-lg hover:bg-slate-100"
                            >
                              Edit
                            </Link>

                            {a.status ===
                              "pending" && (

                              <button
                                onClick={() =>
                                  approve(
                                    a
                                  )
                                }
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg"
                              >
                                Approve
                              </button>

                            )}

                            {a.status ===
                              "pending" && (

                              <button
                                onClick={() =>
                                  reject(
                                    a
                                  )
                                }
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg"
                              >
                                Reject
                              </button>

                            )}

                            {a.status ===
                              "approved" && (

                              <Link
                                href={`/admin/card?id=${a.id}`}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg"
                              >
                                Card
                              </Link>

                            )}

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

                            {a.status ===
                              "approved" && (

                              <button
                                onClick={() =>
                                  moveToRecycleBin(
                                    a
                                  )
                                }
                                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg"
                              >
                                🗑️ Delete
                              </button>

                            )}

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}
