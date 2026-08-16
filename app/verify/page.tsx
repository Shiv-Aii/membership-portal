"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";

import { useSearchParams } from "next/navigation";

import { supabase } from "@/lib/supabase";

type Member = {
  id?: string;
  member_id?: string;

  name?: string;
  membership_no?: string | number;
  membership_number?: string | number;
  status?: string;

  designation?: string;
  village?: string;
  taluk?: string;
  district?: string;

  mobile?: string;
  phone?: string;

  image_url?: string;
  photo_url?: string;

  address?: string;
  website?: string;

  is_active?: boolean;

  title?: string;
  description?: string;
};

/* =====================================================
   VERIFY PAGE CONTENT
===================================================== */

function VerifyPageContent() {
  const searchParams = useSearchParams();

  const [number, setNumber] = useState("");

  const [member, setMember] =
    useState<Member | null>(null);

  const [searched, setSearched] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [verifiedAt, setVerifiedAt] =
    useState<Date | null>(null);

  /* ===================================================
     GET UNIQUE MEMBER ID FROM QR URL

     QR format created by Card Page:
     /verify?id=<unique-member-id>
  =================================================== */

  useEffect(() => {
    const qrId =
      searchParams.get("id") ||
      searchParams.get("member_id") ||
      searchParams.get("application_id");

    if (qrId) {
      verifyMember(qrId);
    }
  }, [searchParams]);

  /* ===================================================
     VERIFY MEMBER
     QR verification uses the unique member/application ID only.
     Membership Number is NOT used for QR verification.
  =================================================== */

  async function verifyMember(inputId?: string | null) {
    const cleanId = (inputId ?? "").trim();

    if (!cleanId) {
      alert("QR Code valid member ID ಹೊಂದಿಲ್ಲ.");
      return;
    }

    setLoading(true);
    setSearched(true);
    setMember(null);
    setVerifiedAt(null);

    try {
      let found: any = null;
      let lastError: any = null;

      const tables = [
        "applications",
        "members",
        "membership_applications",
        "member_applications",
        "member_profiles",
      ];

      function isApproved(row: any): boolean {
        if (!row) return false;

        if (row.status !== undefined && row.status !== null) {
          return String(row.status).toLowerCase() === "approved";
        }

        return false;
      }

      // QR verification:
      // The unique ID inside the QR is the ONLY identifier used.
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select("*")
            .eq("id", cleanId)
            .maybeSingle();

          if (error) {
            lastError = error;
            continue;
          }

          if (data && isApproved(data)) {
            found = data;
            break;
          }
        } catch (tableError) {
          lastError = tableError;
        }
      }

      console.log("QR VERIFY ID:", cleanId);
      console.log("VERIFY RESULT:", found);
      console.log("VERIFY ERROR:", lastError);

      if (!found) {
        setMember(null);
        setVerifiedAt(null);
        return;
      }

      setMember(found as Member);
      setVerifiedAt(new Date());
    } catch (error: any) {
      console.error("QR VERIFY ERROR:", error);

      alert(
        "QR Verification failed\n\n" +
          (error?.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  }

  /* ===================================================
     ENTER KEY
  =================================================== */

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Enter") {
      const qrId =
        searchParams.get("id") ||
        searchParams.get("member_id") ||
        searchParams.get("application_id");

      if (qrId) {
        verifyMember(qrId);
      }
    }
  }

  /* ===================================================
     VERIFIED DATE
  =================================================== */

  const verifiedDateTime =
    verifiedAt
      ? verifiedAt.toLocaleString(
          "en-IN",
          {
            dateStyle: "medium",
            timeStyle: "short",
          }
        )
      : "";

  /* ===================================================
     MEMBER VALUES
  =================================================== */

  const memberName =
    member?.name ||
    member?.title ||
    "Member";

  const membershipNumber =
    member?.membership_no ??
    number;

  const designation =
    member?.designation ||
    "";

  const village =
    member?.village ||
    "";

  const taluk =
    member?.taluk ||
    "";

  const district =
    member?.district ||
    "";

  const mobile =
    member?.mobile ||
    member?.phone ||
    "";

  const imageUrl =
    member?.image_url ||
    member?.photo_url ||
    "";

  const address =
    member?.address ||
    [
      village,
      taluk,
      district,
    ]
      .filter(Boolean)
      .join(", ");

  /* ===================================================
     PAGE
  =================================================== */

  return (
    <main className="min-h-screen bg-slate-100">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="bg-slate-950 text-white px-5 py-10 text-center">

        <h1 className="
          text-4xl
          md:text-5xl
          font-extrabold
        ">
          Member Verification
        </h1>

        <p className="
          text-slate-400
          text-lg
          md:text-xl
          mt-4
        ">
          Membership Number ಮೂಲಕ ಸದಸ್ಯರನ್ನು ಪರಿಶೀಲಿಸಿ
        </p>

      </header>


      {/* =================================================
          MAIN CONTAINER
      ================================================= */}

      <div className="
        max-w-3xl
        mx-auto
        px-4
        py-8
      ">


        {/* =================================================
            VERIFY BOX
        ================================================= */}

        <section className="
          bg-white
          rounded-3xl
          shadow-md
          p-6
          md:p-10
        ">

          <div className="text-center">

            <h2 className="
              text-3xl
              md:text-4xl
              font-extrabold
              text-slate-900
            ">
              🔎 Verify Membership
            </h2>

            <p className="
              text-slate-500
              text-lg
              mt-4
            ">
              Membership Number ಮೂಲಕ ಅಥವಾ PVC Card QR scan ಮಾಡಿ
            </p>

          </div>


          {/* MEMBERSHIP INPUT */}

          <input
            type="text"
            inputMode="numeric"
            value={number}
            onChange={(e) =>
              setNumber(
                e.target.value
              )
            }
            onKeyDown={
              handleKeyDown
            }
            placeholder="Membership Number ಹಾಕಿ"
            className="
              w-full
              mt-8
              border-2
              border-slate-300
              focus:border-blue-600
              outline-none
              rounded-2xl
              px-6
              py-5
              text-2xl
              font-semibold
              text-slate-900
            "
          />


          {/* VERIFY BUTTON */}

          <button
            type="button"
            onClick={() => {
              const qrId =
                searchParams.get("id") ||
                searchParams.get("member_id") ||
                searchParams.get("application_id");

              if (qrId) {
                verifyMember(qrId);
              } else {
                alert("QR Code ಮೂಲಕ ಮಾತ್ರ Member Verification ಮಾಡಬಹುದು.");
              }
            }}
            disabled={loading}
            className="
              w-full
              mt-5
              bg-blue-600
              hover:bg-blue-700
              disabled:bg-blue-400
              text-white
              rounded-2xl
              px-6
              py-5
              text-xl
              font-bold
            "
          >

            {loading
              ? "⏳ Verifying..."
              : "🔎 Verify"}

          </button>


          {/* QR NUMBER */}

          {number && (
            <div className="
              text-center
              mt-6
              text-blue-600
              text-lg
              font-semibold
            ">

              QR Verification Number:{" "}
              {number}

            </div>
          )}

        </section>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <section className="
            bg-white
            rounded-3xl
            shadow-md
            p-10
            mt-6
            text-center
          ">

            <div className="text-6xl">
              ⏳
            </div>

            <h3 className="
              text-2xl
              font-bold
              mt-4
            ">
              Verifying Member...
            </h3>

            <p className="
              text-slate-500
              mt-2
            ">
              Databaseನಲ್ಲಿ Membership Number ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ.
            </p>

          </section>

        )}


        {/* =================================================
            VERIFIED MEMBER
        ================================================= */}

        {!loading &&
          searched &&
          member && (

          <section className="
            bg-white
            rounded-3xl
            shadow-md
            p-6
            md:p-10
            mt-6
          ">


            {/* OFFICIAL VERIFICATION */}

            <div className="text-center">

              <div className="
                inline-flex
                items-center
                gap-2
                bg-green-600
                text-white
                px-6
                py-3
                rounded-full
                font-bold
                text-lg
              ">

                ✓ OFFICIAL VERIFICATION

              </div>


              {/* MEMBER PHOTO */}

              {imageUrl && (

                <div className="
                  mt-6
                  flex
                  justify-center
                ">

                  <img
                    src={imageUrl}
                    alt={
                      memberName
                    }
                    className="
                      w-32
                      h-32
                      rounded-full
                      object-cover
                      border-4
                      border-green-500
                      shadow-md
                    "
                  />

                </div>

              )}


              {/* NAME */}

              <h2 className="
                text-3xl
                md:text-4xl
                font-extrabold
                text-slate-900
                mt-6
              ">

                {memberName}

              </h2>

            </div>


            {/* =================================================
                MEMBER DETAILS
            ================================================= */}

            <div className="
              mt-8
              grid
              gap-4
            ">


              {/* MEMBERSHIP NUMBER */}

              <div className="
                bg-slate-50
                rounded-xl
                p-5
              ">

                <div className="
                  text-sm
                  text-slate-500
                ">
                  Membership Number
                </div>

                <div className="
                  text-2xl
                  font-bold
                  text-slate-900
                  mt-1
                ">
                  {membershipNumber}
                </div>

              </div>


              {/* DESIGNATION */}

              {designation && (

                <div className="
                  bg-slate-50
                  rounded-xl
                  p-5
                ">

                  <div className="
                    text-sm
                    text-slate-500
                  ">
                    Designation
                  </div>

                  <div className="
                    text-xl
                    font-semibold
                    mt-1
                  ">
                    {designation}
                  </div>

                </div>

              )}


              {/* ADDRESS */}

              {address && (

                <div className="
                  bg-slate-50
                  rounded-xl
                  p-5
                ">

                  <div className="
                    text-sm
                    text-slate-500
                  ">
                    Address
                  </div>

                  <div className="
                    text-lg
                    font-semibold
                    mt-1
                  ">
                    {address}
                  </div>

                </div>

              )}


              {/* MOBILE */}

              {mobile && (

                <div className="
                  bg-slate-50
                  rounded-xl
                  p-5
                ">

                  <div className="
                    text-sm
                    text-slate-500
                  ">
                    Mobile
                  </div>

                  <div className="
                    text-lg
                    font-semibold
                    mt-1
                  ">
                    {mobile}
                  </div>

                </div>

              )}

            </div>


            {/* =================================================
                ACTIVE STATUS
            ================================================= */}

            <div className="
              mt-7
              border-2
              border-green-200
              bg-green-50
              rounded-2xl
              p-6
              text-center
            ">

              <div className="
                text-green-700
                text-2xl
                font-extrabold
              ">

                ✓ VERIFIED MEMBER

              </div>

              <div className="
                text-green-700
                mt-2
                font-semibold
              ">

                Membership Status: ACTIVE

              </div>


              {/* VERIFIED DATE */}

              {verifiedDateTime && (

                <div className="
                  text-green-700
                  text-sm
                  mt-4
                ">

                  Verified on:{" "}
                  
                    {verifiedDateTime}
                  

                </div>

              )}

            </div>

          </section>

        )}


        {/* =================================================
            MEMBER NOT FOUND
        ================================================= */}

        {!loading &&
          searched &&
          !member && (

          <section className="
            bg-white
            rounded-3xl
            shadow-md
            p-10
            mt-6
            text-center
          ">

            <div className="text-7xl">
              ❌
            </div>

            <h2 className="
              text-3xl
              md:text-4xl
              font-extrabold
              text-slate-900
              mt-6
            ">
              Member Not Found
            </h2>

            <p className="
              text-slate-500
              text-lg
              mt-4
            ">
              ಈ Membership Numberಗೆ
              approved active member
              ಸಿಗಲಿಲ್ಲ.
            </p>

            <p className="
              text-slate-400
              mt-3
            ">
              Membership Number:{" "}
              
                {number}
              
            </p>

          </section>

        )}


        {/* =================================================
            BACK HOME
        ================================================= */}

        <div className="
          text-center
          mt-8
          mb-6
        ">

          <a
            href="/"
            className="
              inline-block
              bg-slate-950
              hover:bg-slate-800
              text-white
              px-8
              py-4
              rounded-2xl
              text-xl
              font-bold
            "
          >

            🏠 Back to Home

          </a>

        </div>

      </div>

    </main>
  );
}


/* =========================================================
   PAGE WRAPPER

   IMPORTANT:
   useSearchParams() ಇರುವ component ಅನ್ನು
   Suspense ಒಳಗೆ ಇಟ್ಟಿದ್ದೇವೆ.

   ಇದರಿಂದ Vercel build error:
   "useSearchParams() should be wrapped in
   a suspense boundary"

   fix ಆಗುತ್ತದೆ.
========================================================= */

export default function VerifyPage() {

  return (

    <Suspense
      fallback={

        <main className="
          min-h-screen
          bg-slate-100
          flex
          items-center
          justify-center
        ">

          <div className="
            bg-white
            rounded-2xl
            shadow-md
            p-8
            text-center
          ">

            <div className="text-5xl">
              ⏳
            </div>

            <h1 className="
              text-xl
              font-bold
              mt-4
            ">
              Loading Verification...
            </h1>

            <p className="
              text-slate-500
              mt-2
            ">
              Please wait...
            </p>

          </div>

        </main>

      }
    >

      <VerifyPageContent />

    </Suspense>

  );
}
