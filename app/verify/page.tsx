"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";
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
  phone?: string;
  image_url?: string;
  is_active?: boolean;
};

function VerifyMemberContent() {
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
    const number = (
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
      /*
       * IMPORTANT:
       * Public Verification ಈಗ
       * member_info_page tableನಿಂದ
       * data ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ.
       */

      const {
        data,
        error,
      } = await supabase
        .from("member_info_page")
        .select(`
          id,
          name,
          membership_no,
          designation,
          village,
          taluk,
          district,
          phone,
          image_url,
          is_active
        `)
        .eq(
          "membership_no",
          number
        )
        .eq(
          "is_active",
          true
        )
        .maybeSingle();

      if (error) {
        console.error(
          "Verification error:",
          error
        );

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
   * QR Scan ಮಾಡಿದಾಗ:
   *
   * /verify?membership=11
   *
   * 11 automatic ಆಗಿ ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ.
   */

  useEffect(() => {
    const number =
      searchParams.get(
        "membership"
      );

    if (number) {
      setMembershipNo(number);

      verifyMember(number);
    }
  }, [searchParams]);

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Enter") {
      verifyMember();
    }
  }

  const address = [
    member?.village,
    member?.taluk,
    member?.district,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="min-h-screen bg-slate-100">

      {/* HEADER */}

      <header className="bg-slate-950 text-white">

        <div className="max-w-4xl mx-auto px-4 py-7 text-center">

          <h1 className="text-3xl sm:text-4xl font-bold">
            Member Verification
          </h1>

          <p className="text-slate-400 mt-3 text-lg">
            Membership Number ಮೂಲಕ ಸದಸ್ಯರ
            ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ
          </p>

        </div>

      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* SEARCH */}

        <section className="bg-white rounded-2xl shadow-sm p-5 sm:p-7">

          <h2 className="text-2xl font-bold text-center">
            🔎 Verify Membership
          </h2>

          <p className="text-slate-500 text-center mt-3">
            Membership Number ನಮೂದಿಸಿ
            ಅಥವಾ PVC Card QR scan ಮಾಡಿ
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">

            <input
              type="text"
              inputMode="numeric"
              value={membershipNo}
              onChange={(e) =>
                setMembershipNo(
                  e.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
              placeholder="Membership Number"
              className="flex-1 border border-slate-300 rounded-xl px-4 py-4 text-lg outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={() =>
                verifyMember()
              }
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-7 py-4 rounded-xl font-bold text-lg"
            >
              {loading
                ? "Checking..."
                : "🔍 Verify"}
            </button>

          </div>

          {searchParams.get(
            "membership"
          ) && (
            <div className="mt-5 text-center text-blue-600">

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

        {/* NOT FOUND */}

        {searched &&
          !loading &&
          !member && (

            <section className="bg-white rounded-2xl shadow-sm p-8 mt-5 text-center">

              <div className="text-6xl">
                ❌
              </div>

              <h2 className="text-2xl font-bold mt-5">
                Member Not Found
              </h2>

              <p className="text-slate-500 mt-3 text-lg">
                ಈ Membership Numberಗೆ
                active member ಸಿಗಲಿಲ್ಲ.
              </p>

            </section>

          )}

        {/* VERIFIED MEMBER */}

        {member && (

          <section className="bg-white rounded-2xl shadow-sm mt-5 overflow-hidden">

            {/* VERIFIED HEADER */}

            <div className="bg-green-600 text-white p-6 text-center">

              <div className="text-5xl">
                ✓
              </div>

              <h2 className="text-2xl font-bold mt-2">
                ACTIVE / VERIFIED
              </h2>

              <p className="text-green-100 mt-1">
                This membership is active
              </p>

            </div>

            {/* MEMBER DETAILS */}

            <div className="p-5 sm:p-8">

              <div className="flex flex-col items-center">

                {member.image_url ? (

                  <img
                    src={
                      member.image_url
                    }
                    alt={
                      member.name ||
                      "Member"
                    }
                    className="w-32 h-36 sm:w-36 sm:h-40 object-cover rounded-xl shadow-md border-4 border-white"
                  />

                ) : (

                  <div className="w-32 h-36 sm:w-36 sm:h-40 bg-slate-200 rounded-xl flex items-center justify-center text-5xl">
                    👤
                  </div>

                )}

                <h2 className="text-2xl font-bold mt-5 text-center">
                  {member.name ||
                    "Member"}
                </h2>

                <div className="mt-3 bg-blue-50 text-blue-700 px-5 py-2 rounded-full font-bold">

                  Membership No:{" "}

                  {
                    member.membership_no
                  }

                </div>

              </div>

              {/* DETAILS */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">

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

              {/* ADDRESS */}

              {address && (

                <div className="mt-5 bg-slate-50 rounded-xl p-4">

                  <div className="text-sm text-slate-500">
                    Address
                  </div>

                  <div className="font-semibold mt-1">
                    {address}
                  </div>

                </div>

              )}

              {/* PHONE */}

              {member.phone && (

                <div className="mt-4 bg-slate-50 rounded-xl p-4">

                  <div className="text-sm text-slate-500">
                    Mobile
                  </div>

                  <div className="font-semibold mt-1">
                    {member.phone}
                  </div>

                </div>

              )}

              {/* VERIFIED BOX */}

              <div className="mt-7 border border-green-200 bg-green-50 rounded-xl p-5 text-center">

                <div className="text-green-700 font-bold text-lg">
                  ✓ VERIFIED MEMBER
                </div>

                <div className="text-sm text-green-600 mt-2">
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


/* INFO BOX */

function Info({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">

      <div className="text-sm text-slate-500">
        {label}
      </div>

      <div className="font-semibold mt-1">
        {value || "—"}
      </div>

    </div>
  );
}


/*
 * Next.js build fix:
 * useSearchParams() ಅನ್ನು Suspense ಒಳಗೆ ಇಡಲಾಗಿದೆ.
 */

export default function VerifyMemberPage() {

  return (

    <Suspense
      fallback={

        <main className="min-h-screen bg-slate-100 flex items-center justify-center">

          <div className="bg-white rounded-2xl shadow-sm px-7 py-6 text-center">

            <div className="text-xl font-bold">
              Loading Verification...
            </div>

            <div className="text-slate-500 mt-2">
              Please wait...
            </div>

          </div>

        </main>

      }
    >

      <VerifyMemberContent />

    </Suspense>

  );
}
