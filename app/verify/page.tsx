"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { supabase } from "@/lib/supabase";

type Member = {
  id?: string;
  member_id?: string;

  name?: string;
  membership_no?: string | number;

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

  /*
   * =====================================================
   * QR / URL NUMBER
   * =====================================================
   */

  useEffect(() => {
    const qrNumber =
      searchParams.get("membership") ||
      searchParams.get("membership_no") ||
      searchParams.get("number") ||
      searchParams.get("member");

    if (qrNumber) {
      setNumber(qrNumber);
    }
  }, [searchParams]);

  /*
   * =====================================================
   * VERIFY MEMBER
   * =====================================================
   */

  async function verifyMember() {
    const cleanNumber =
      number.trim();

    if (!cleanNumber) {
      alert(
        "Membership Number ಹಾಕಿ."
      );

      return;
    }

    setLoading(true);
    setSearched(true);

    setMember(null);
    setVerifiedAt(null);

    try {
      /*
       * RPC CALL
       *
       * Supabase SQL function:
       * verify_member(text)
       */

      const {
        data,
        error,
      } = await supabase.rpc(
        "verify_member",
        {
          p_membership_no:
            cleanNumber,
        }
      );

      console.log(
        "VERIFY RESULT:",
        data
      );

      console.log(
        "VERIFY ERROR:",
        error
      );

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

      /*
       * RPC JSON result
       */

      let result: any = data;

      /*
       * ಕೆಲವೊಮ್ಮೆ RPC table result
       * array ಆಗಿ ಬರುತ್ತದೆ.
       */

      if (Array.isArray(result)) {
        result =
          result.length > 0
            ? result[0]
            : null;
      }

      /*
       * Member ಸಿಗಲಿಲ್ಲ
       */

      if (!result) {
        setMember(null);
        setVerifiedAt(null);

        return;
      }

      /*
       * Member ಸಿಕ್ಕಿದೆ
       */

      setMember(
        result as Member
      );

      setVerifiedAt(
        new Date()
      );

    } catch (error: any) {
      console.error(
        "VERIFY ERROR:",
        error
      );

      alert(
        "Verification failed.\n\n" +
          (
            error?.message ||
            "Unknown error"
          )
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * =====================================================
   * ENTER KEY
   * =====================================================
   */

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Enter") {
      verifyMember();
    }
  }

  /*
   * =====================================================
   * VERIFIED DATE
   * =====================================================
   */

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

  /*
   * =====================================================
   * MEMBER VALUES
   * =====================================================
   */

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

  /*
   * =====================================================
   * PAGE
   * =====================================================
   */

  return (
    <main className="min-h-screen bg-slate-100">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="bg-slate-950 text-white px-5 py-10 text-center">

        <h1 className="text-4xl md:text-5xl font-extrabold">
          Member Verification
        </h1>

        <p className="text-slate-400 text-lg md:text-2xl mt-4">
          Membership Number ಮೂಲಕ ಸದಸ್ಯರನ್ನು ಪರಿಶೀಲಿಸಿ
        </p>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <div className="max-w-3xl mx-auto px-4 py-8">


        {/* =================================================
            VERIFY BOX
        ================================================= */}

        <section className="bg-white rounded-3xl shadow-md p-6 md:p-10">

          <div className="text-center">

            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">

              🔎 Verify Membership

            </h2>

            <p className="text-slate-500 text-lg md:text-xl mt-4">

              Membership Number ಮೂಲಕ ಅಥವಾ PVC Card QR scan ಮಾಡಿ

            </p>

          </div>


          {/* INPUT */}

          <div className="mt-8">

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
                border-2
                border-slate-300
                focus:border-blue-600
                outline-none
                rounded-2xl
                px-6
                py-5
                text-3xl
                font-semibold
                text-slate-900
              "
            />

          </div>


          {/* VERIFY BUTTON */}

          <button
            type="button"
            onClick={
              verifyMember
            }
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
              text-2xl
              font-bold
              transition
            "
          >

            {loading
              ? "⏳ Verifying..."
              : "🔎 Verify"}

          </button>


          {/* QR NUMBER */}

          {number && (
            <div className="text-center mt-6">

              <p className="text-blue-600 text-xl font-semibold">

                QR Verification Number:{" "}
                {number}

              </p>

            </div>
          )}

        </section>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <section className="bg-white rounded-3xl shadow-md p-10 mt-6 text-center">

            <div className="text-5xl">
              ⏳
            </div>

            <h3 className="text-2xl font-bold mt-4">
              Verifying Member...
            </h3>

            <p className="text-slate-500 mt-2">
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

            {/* VERIFIED HEADER */}

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

              {/* PHOTO */}

              {imageUrl && (

                <div className="mt-6 flex justify-center">

                  <img
                    src={imageUrl}
                    alt="Member"
                    className="
                      w-32
                      h-32
                      rounded-full
                      object-cover
                      border-4
                      border-green-500
                      shadow
                    "
                  />

                </div>

              )}


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


            {/* MEMBER DETAILS */}

            <div className="
              mt-8
              grid
              gap-3
            ">

              <div className="
                bg-slate-50
                rounded-xl
                p-4
              ">

                <div className="text-sm text-slate-500">
                  Membership Number
                </div>

                <div className="text-2xl font-bold text-slate-900">
                  {membershipNumber}
                </div>

              </div>


              {designation && (

                <div className="
                  bg-slate-50
                  rounded-xl
                  p-4
                ">

                  <div className="text-sm text-slate-500">
                    Designation
                  </div>

                  <div className="text-xl font-semibold">
                    {designation}
                  </div>

                </div>

              )}


              {address && (

                <div className="
                  bg-slate-50
                  rounded-xl
                  p-4
                ">

                  <div className="text-sm text-slate-500">
                    Address
                  </div>

                  <div className="text-lg font-semibold">
                    {address}
                  </div>

                </div>

              )}


              {mobile && (

                <div className="
                  bg-slate-50
                  rounded-xl
                  p-4
                ">

                  <div className="text-sm text-slate-500">
                    Mobile
                  </div>

                  <div className="text-lg font-semibold">
                    {mobile}
                  </div>

                </div>

              )}

            </div>


            {/* ACTIVE STATUS */}

            <div className="
              mt-6
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


              {verifiedDateTime && (

                <div className="
                  text-green-700
                  text-sm
                  mt-4
                ">

                  Verified on:{" "}
                  <b>
                    {verifiedDateTime}
                  </b>

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
            p-8
            md:p-12
            mt-6
            text-center
          ">

            <div className="text-8xl">
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
              md:text-xl
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
              <b>{number}</b>

            </p>

          </section>

        )}


        {/* =================================================
            BACK HOME
        ================================================= */}

        <div className="text-center mt-8 mb-6">

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


/*
 * =========================================================
 * PAGE WRAPPER
 * =========================================================
 */

export default function VerifyPage() {
  return (
    <VerifyPageContent />
  );
}
