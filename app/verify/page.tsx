 "use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Member = {
  id: string;
  name?: string;
  membership_no?: string | number;
  designation?: string;
  village?: string;
  taluk?: string;
  district?: string;
  mobile?: string;
  photo_url?: string;
  status?: string;
  is_deleted?: boolean;
};

export default function VerifyMemberPage() {
  const searchParams = useSearchParams();

  const [membershipNo, setMembershipNo] =
    useState("");

  const [member, setMember] =
    useState<Member | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [searched, setSearched] =
    useState(false);

  async function verifyMember(
    numberFromUrl?: string
  ) {
    const number =
      (
        numberFromUrl ??
        membershipNo
      ).trim();

    if (!number) {
      if (!numberFromUrl) {
        alert(
          "Membership Number ಹಾಕಿ."
        );
      }

      return;
    }

    setMembershipNo(number);
    setLoading(true);
    setMember(null);
    setSearched(true);

    try {
      const {
        data,
        error,
      } = await supabase
        .from("applications")
        .select(
          `
          id,
          name,
          membership_no,
          designation,
          village,
          taluk,
          district,
          mobile,
          photo_url,
          status,
          is_deleted
          `
        )
        .eq(
          "membership_no",
          number
        )
        .eq(
          "status",
          "approved"
        )
        .eq(
          "is_deleted",
          false
        )
        .maybeSingle();

      if (error) {
        console.error(error);

        alert(
          "Verification error:\n\n" +
            error.message
        );

        return;
      }

      if (!data) {
        setMember(null);
        return;
      }

      setMember(
        data as Member
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * QR scan ಮಾಡಿದಾಗ:
   *
   * /verify?membership=10
   *
   * URLನ membership number automatic ಆಗಿ ತೆಗೆದುಕೊಂಡು
   * member verification ಮಾಡುತ್ತದೆ.
   */
  useEffect(() => {
    const number =
      searchParams.get(
        "membership"
      );

    if (number) {
      setMembershipNo(
        number
      );

      verifyMember(
        number
      );
    }
  }, [searchParams]);

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (
      e.key ===
      "Enter"
    ) {
      verifyMember();
    }
  }

  const address =
    [
      member?.village,
      member?.taluk,
      member?.district,
    ]
      .filter(Boolean)
      .join(", ");

  return (
    <main className="min-h-screen bg-slate-100">

      <header className="bg-slate-950 text-white">

        <div className="max-w-4xl mx-auto px-4 py-6 text-center">

          <h1 className="text-2xl sm:text-3xl font-bold">
            Member Verification
          </h1>

          <p className="text-slate-400 mt-2">
            Membership Number ಮೂಲಕ ಸದಸ್ಯರ
            ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ
          </p>

        </div>

      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">

        <section className="bg-white rounded-2xl shadow-sm p-5 sm:p-7">

          <h2 className="text-xl font-bold text-center">
            🔎 Verify Membership
          </h2>

          <p className="text-sm text-slate-500 text-center mt-2">
            Membership Number ನಮೂದಿಸಿ
            ಅಥವಾ PVC Card QR scan ಮಾಡಿ
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">

            <input
              type="text"
              inputMode="numeric"
              value={
                membershipNo
              }
              onChange={(e) =>
                setMembershipNo(
                  e.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
              placeholder="Membership Number"
              className="flex-1 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={() =>
                verifyMember()
              }
              disabled={
                loading
              }
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold"
            >
              {loading
                ? "Checking..."
                : "🔍 Verify"}
            </button>

          </div>

          {searchParams.get(
            "membership"
          ) && (
            <div className="mt-4 text-center text-sm text-blue-600">
              QR Verification Number:{" "}
              <b>
                {
                  searchParams.get(
                    "membership"
                  )
                }
              </b>
            </div>
          )}

        </section>

        {searched &&
          !loading &&
          !member && (
            <section className="bg-white rounded-2xl shadow-sm p-8 mt-5 text-center">

              <div className="text-5xl">
                ❌
              </div>

              <h2 className="text-xl font-bold mt-4">
                Member Not Found
              </h2>

              <p className="text-slate-500 mt-2">
                ಈ Membership Numberಗೆ
                approved active member
                ಸಿಗಲಿಲ್ಲ.
              </p>

            </section>
          )}

        {member && (
          <section className="bg-white rounded-2xl shadow-sm mt-5 overflow-hidden">

            <div className="bg-green-600 text-white p-5 text-center">

              <div className="text-4xl">
                ✓
              </div>

              <h2 className="text-xl font-bold mt-2">
                ACTIVE / VERIFIED
              </h2>

              <p className="text-green-100 text-sm mt-1">
                This membership is active
              </p>

            </div>

            <div className="p-5 sm:p-7">

              <div className="flex flex-col items-center">

                {member.photo_url ? (
                  <img
                    src={
                      member.photo_url
                    }
                    alt={
                      member.name ||
                      "Member"
                    }
                    className="w-32 h-36 sm:w-36 sm:h-40 object-cover rounded-xl border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-32 h-36 sm:w-36 sm:h-40 bg-slate-200 rounded-xl flex items-center justify-center text-5xl">
                    👤
                  </div>
                )}

                <h2 className="text-2xl font-bold mt-4 text-center">
                  {member.name ||
                    "Member"}
                </h2>

                <div className="mt-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-bold">
                  Membership No:{" "}
                  {
                    member.membership_no
                  }
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-7">

                <Info
                  label="Designation"
                  value={
                    member.designation
                  }
                />

                <Info
                  label="District"
                  value={
                    member.district
                  }
                />

                <Info
                  label="Taluk"
                  value={
                    member.taluk
                  }
                />

                <Info
                  label="Village"
                  value={
                    member.village
                  }
                />

              </div>

              {address && (
                <div className="mt-4 bg-slate-50 rounded-xl p-4">

                  <div className="text-xs text-slate-500">
                    Address
                  </div>

                  <div className="font-semibold mt-1">
                    {address}
                  </div>

                </div>
              )}

              <div className="mt-6 border border-green-200 bg-green-50 rounded-xl p-4 text-center">

                <div className="text-green-700 font-bold">
                  ✓ VERIFIED MEMBER
                </div>

                <div className="text-xs text-green-600 mt-1">
                  Membership status: ACTIVE
                </div>

              </div>

            </div>

          </section>
        )}

      </div>

    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">

      <div className="text-xs text-slate-500">
        {label}
      </div>

      <div className="font-semibold mt-1">
        {value || "—"}
      </div>

    </div>
  );
}
