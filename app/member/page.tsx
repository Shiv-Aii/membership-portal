"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function MemberPageContent() {
  const params = useSearchParams();
  const id = params.get("id");

  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMember() {
      if (!id) {
        setError("Member ID not found.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("applications")
        .select(
          "id,name,designation,village,taluk,district,mobile,aadhaar,photo_url,membership_no,status"
        )
        .eq("id", id)
        .eq("status", "approved")
        .single();

      if (error || !data) {
        setError(
          "Approved member details not found."
        );
      } else {
        setMember(data);
      }

      setLoading(false);
    }

    loadMember();
  }, [id]);

  function maskedAadhaar(value: string) {
    if (!value) return "Not available";

    if (value.length < 4) {
      return "****";
    }

    return "XXXX XXXX " + value.slice(-4);
  }

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center">
        <p>Loading member details...</p>
      </main>
    );
  }

  if (error || !member) {
    return (
      <main className="min-h-screen bg-slate-100 grid place-items-center p-5">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600">
            Member Not Found
          </h1>

          <p className="mt-3 text-slate-500">
            {error}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 py-8 px-4">

      <div className="max-w-2xl mx-auto">

        {/* HEADER */}

        <div className="bg-gradient-to-r from-green-700 to-blue-700 text-white rounded-t-3xl p-6 text-center">

          <h1 className="text-2xl font-bold">
            Organization Membership Portal
          </h1>

          <p className="mt-1">
            ಸದಸ್ಯತ್ವ ವಿವರ / Member Details
          </p>

        </div>

        {/* MEMBER PROFILE */}

        <div className="bg-white rounded-b-3xl shadow-xl p-6">

          <div className="flex flex-col items-center">

            {member.photo_url ? (
              <img
                src={member.photo_url}
                alt="Member"
                className="w-32 h-40 object-cover rounded-2xl border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-32 h-40 bg-slate-200 rounded-2xl grid place-items-center">
                No Photo
              </div>
            )}

            <h2 className="text-2xl font-bold mt-4">
              {member.name}
            </h2>

            <p className="text-green-700 font-semibold">
              {member.designation}
            </p>

            <div className="mt-2 bg-slate-100 rounded-full px-4 py-2 font-bold">
              Member ID:{" "}
              {member.membership_no}
            </div>

          </div>

          {/* SEPARATE DETAILS SECTION */}

          <section className="mt-8">

            <h3 className="text-xl font-bold border-b pb-3">
              ಸದಸ್ಯರ ವಿವರಗಳು
              <span className="text-slate-400 text-base ml-2">
                Member Information
              </span>
            </h3>

            <div className="grid gap-3 mt-4">

              <Detail
                label="ಹೆಸರು / Name"
                value={member.name}
              />

              <Detail
                label="ಹುದ್ದೆ / Designation"
                value={member.designation}
              />

              <Detail
                label="ಗ್ರಾಮ / Village"
                value={member.village}
              />

              <Detail
                label="ತಾಲೂಕು / Taluk"
                value={member.taluk}
              />

              <Detail
                label="ಜಿಲ್ಲೆ / District"
                value={member.district}
              />

              <Detail
                label="ಮೊಬೈಲ್ / Mobile"
                value={member.mobile}
              />

              <Detail
                label="ಆಧಾರ್ / Aadhaar"
                value={maskedAadhaar(
                  member.aadhaar
                )}
              />

              <Detail
                label="ಸದಸ್ಯತ್ವ ಸಂಖ್ಯೆ / Membership No."
                value={member.membership_no}
              />

              <Detail
                label="Status"
                value="Approved"
              />

            </div>

          </section>

          {/* VERIFICATION */}

          <div className="mt-7 bg-green-50 border border-green-200 rounded-2xl p-4 text-center">

            <p className="font-bold text-green-700">
              ✓ Verified Member
            </p>

            <p className="text-sm text-slate-500 mt-1">
              This membership has been approved by the organization.
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[190px_1fr] gap-2 border rounded-xl p-3">

      <div className="font-semibold text-slate-600">
        {label}
      </div>

      <div className="font-medium">
        {value || "-"}
      </div>

    </div>
  );
}

export default function MemberPage() {
  return (
    <MemberPageContent />
  );
}
