"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Application } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Admin() {
  const [apps, setApps] = useState<Application[]>([]);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const router = useRouter();

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

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/admin/login");
        return;
      }

      load();
    }

    checkUser();
  }, [router]);

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
      return;
    }

    await load();
  }

  async function approve(a: Application) {
    const next = prompt(
      "Membership Number ಹಾಕಿ.\nಖಾಲಿ ಬಿಟ್ಟರೆ automatic number ಬರುತ್ತದೆ.",
      ""
    );

    if (next === null) {
      return;
    }

    const { error } = await supabase.rpc(
      "approve_application",
      {
        p_id: a.id,
        p_membership_no: next.trim() || null,
      }
    );

    if (error) {
      alert(error.message);
      return;
    }

    await load();
  }

  async function reject(a: Application) {
    const ok = confirm(
      `${a.name} ಅವರ application ಅನ್ನು Reject ಮಾಡಬೇಕೇ?`
    );

    if (!ok) return;

    await update(a.id, {
      status: "rejected",
    });
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  const shown = apps.filter((a) => {
    const matchesStatus =
      status === "all" || a.status === status;

    const searchText = Object.values(a)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchText.includes(
      q.toLowerCase()
    );

    return matchesStatus && matchesSearch;
  });

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
              onClick={() => setStatus(s)}
              className={`
                bg-white rounded-2xl p-5 text-left
                shadow-sm
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

        {/* APPLICATION TABLE */}
        <div className="bg-white rounded-2xl mt-6 shadow-sm overflow-hidden">

          {/* SEARCH */}
          <div className="p-4">
            <input
              placeholder="ಹೆಸರು / Mobile / District ಹುಡುಕಿ..."
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
                      "Member ID",
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

                      {/* NAME */}
                      <td className="p-3 font-semibold">
                        {a.name}
                      </td>

                      {/* MOBILE */}
                      <td className="p-3">
                        {a.mobile}
                      </td>

                      {/* DISTRICT */}
                      <td className="p-3">
                        {a.district}
                      </td>

                      {/* STATUS */}
                      <td className="p-3">
                        <span
                          className={`
                            px-3 py-1 rounded-full text-xs font-medium
                            ${
                              a.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : a.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }
                          `}
                        >
                          {a.status}
                        </span>
                      </td>

                      {/* MEMBER ID */}
                      <td className="p-3">
                        {a.membership_no || "—"}
                      </td>

                      {/* ACTIONS */}
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
                          {a.status === "pending" && (
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
                          {a.status === "pending" && (
                            <button
                              onClick={() =>
                                reject(a)
                              }
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg"
                            >
                              Reject
                            </button>
                          )}

                          {/* PVC CARD */}
                          {a.status === "approved" && (
                            <Link
                              href={`/admin/card?id=${a.id}`}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg"
                            >
                              Card
                            </Link>
                          )}

                          {/* PUBLIC PAGE */}
                          {a.status === "approved" && (
                            <Link
                              href={`/public-page?id=${a.id}`}
                              target="_blank"
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg"
                            >
                              Public Page
                            </Link>
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
