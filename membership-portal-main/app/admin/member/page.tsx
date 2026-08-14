"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabase";

type Member = {
  id: string;
  membership_no: string | null;
  name: string | null;
  designation: string | null;
  village: string | null;
  taluk: string | null;
  district: string | null;
  mobile: string | null;
  photo_url: string | null;
  status: string | null;
};

export default function MemberPage() {
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadMembers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("applications")
      .select(
        "id, membership_no, name, designation, village, taluk, district, mobile, photo_url, status"
      )
      .eq("status", "approved")
      .order("membership_no", {
        ascending: true,
      });

    if (error) {
      console.error(error);

      alert(
        "Approved Members load ಆಗಲಿಲ್ಲ:\n\n" +
          error.message
      );

      setMembers([]);
    } else {
      setMembers((data || []) as Member[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadMembers();
  }, []);

  function openCard(memberId: string) {
    router.push(
      `/admin/card-new?id=${encodeURIComponent(memberId)}`
    );
  }

  const filteredMembers = members.filter((member) => {
    const text = [
      member.membership_no,
      member.name,
      member.designation,
      member.village,
      member.taluk,
      member.district,
      member.mobile,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <AdminGuard>
      <main className="min-h-screen bg-slate-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">

          {/* HEADER */}
          <div className="bg-white rounded-2xl shadow p-5 mb-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold">
                  👨‍🌾 Approved Members
                </h1>

                <p className="text-slate-500 mt-1">
                  Approved ಸದಸ್ಯರ ವಿವರಗಳು
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    router.push("/admin")
                  }
                  className="px-4 py-2 rounded-lg bg-slate-200 font-bold"
                >
                  ← Admin
                </button>

                <button
                  onClick={loadMembers}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-green-700 text-white font-bold disabled:opacity-50"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            {/* SEARCH */}
            <div className="mt-5">
              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="🔎 ಹೆಸರು / Membership No / ಗ್ರಾಮ / ತಾಲ್ಲೂಕು / ಜಿಲ್ಲೆ ಹುಡುಕಿ..."
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div className="mt-3 text-sm font-bold text-slate-600">
              Total Approved Members:{" "}
              <span className="text-green-700">
                {members.length}
              </span>
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="bg-white rounded-2xl shadow p-10 text-center">
              <div className="text-4xl mb-3">
                ⏳
              </div>

              <div className="font-bold text-lg">
                Members Loading...
              </div>
            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            filteredMembers.length === 0 && (
              <div className="bg-white rounded-2xl shadow p-10 text-center">
                <div className="text-5xl mb-3">
                  👨‍🌾
                </div>

                <div className="font-bold text-lg">
                  Approved Members ಸಿಗಲಿಲ್ಲ
                </div>

                <p className="text-slate-500 mt-2">
                  Search ಬದಲಿಸಿ ಅಥವಾ approved members
                  ಇಲ್ಲದಿರಬಹುದು.
                </p>
              </div>
            )}

          {/* MEMBERS */}
          {!loading &&
            filteredMembers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white rounded-2xl shadow overflow-hidden"
                  >

                    {/* TOP */}
                    <div className="bg-green-800 h-3" />

                    <div className="p-5">

                      {/* PHOTO + BASIC */}
                      <div className="flex gap-4 items-center">

                        <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-green-700 bg-slate-100 flex-shrink-0">
                          {member.photo_url ? (
                            <img
                              src={member.photo_url}
                              alt={
                                member.name ||
                                "Member"
                              }
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">
                              👤
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">

                          <div className="text-xs text-slate-500 font-bold">
                            MEMBERSHIP NUMBER
                          </div>

                          <div className="font-extrabold text-green-800 text-lg">
                            {member.membership_no ||
                              "-"}
                          </div>

                          <div className="font-extrabold text-xl mt-1 break-words">
                            {member.name ||
                              "ಹೆಸರು ಇಲ್ಲ"}
                          </div>

                          <div className="text-sm text-slate-500 mt-1">
                            {member.designation ||
                              "ಸದಸ್ಯ"}
                          </div>

                        </div>
                      </div>

                      {/* DETAILS */}
                      <div className="mt-5 space-y-2 text-sm">

                        <div className="flex justify-between gap-3 border-b pb-2">
                          <span className="font-bold text-slate-500">
                            ಗ್ರಾಮ
                          </span>

                          <span className="font-semibold text-right">
                            {member.village ||
                              "-"}
                          </span>
                        </div>

                        <div className="flex justify-between gap-3 border-b pb-2">
                          <span className="font-bold text-slate-500">
                            ತಾಲ್ಲೂಕು
                          </span>

                          <span className="font-semibold text-right">
                            {member.taluk ||
                              "-"}
                          </span>
                        </div>

                        <div className="flex justify-between gap-3 border-b pb-2">
                          <span className="font-bold text-slate-500">
                            ಜಿಲ್ಲೆ
                          </span>

                          <span className="font-semibold text-right">
                            {member.district ||
                              "-"}
                          </span>
                        </div>

                        <div className="flex justify-between gap-3">
                          <span className="font-bold text-slate-500">
                            ಮೊಬೈಲ್
                          </span>

                          <span className="font-semibold text-right">
                            {member.mobile ||
                              "-"}
                          </span>
                        </div>

                      </div>

                      {/* CARD BUTTON */}
                      <button
                        onClick={() =>
                          openCard(member.id)
                        }
                        className="w-full mt-5 py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white font-extrabold"
                      >
                        🪪 Generate / Edit Card
                      </button>

                    </div>
                  </div>
                ))}

              </div>
            )}

        </div>
      </main>
    </AdminGuard>
  );
}
