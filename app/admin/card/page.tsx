"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useSearchParams } from "next/navigation";

function Card() {
  const params = useSearchParams();
  const id = params.get("id");

  const [a, setA] = useState<any>(null);
  const [qr, setQr] = useState("");
  const [locked, setLocked] = useState(false);

  const front = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadMember() {
      if (!id) return;

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setA(data);

      if (data) {
        const publicPageUrl =
          `${window.location.origin}/public-page?id=${data.id}`;

        const qrImage = await QRCode.toDataURL(publicPageUrl, {
          width: 300,
          margin: 2,
        });

        setQr(qrImage);
      }
    }

    loadMember();
  }, [id]);

  async function generatePDF() {
    if (!front.current || !a) return;

    const canvas = await html2canvas(front.current, {
      scale: 4,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [85.6, 53.9],
    });

    pdf.addImage(
      img,
      "PNG",
      0,
      0,
      85.6,
      53.9
    );

    pdf.save(
      `${a.membership_no || "member"}-PVC.pdf`
    );
  }

  if (!a) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-10">
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <h1 className="text-xl font-bold">
            Member loading...
          </h1>

          <p className="text-slate-500 mt-2">
            Approved member information loading.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-5">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
          <h1 className="text-2xl font-bold">
            PVC Card Designer
          </h1>

          <div className="flex gap-2">

            <button
              onClick={() => setLocked(!locked)}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white"
            >
              {locked
                ? "Unlock Design"
                : "Lock Design"}
            </button>

            <button
              onClick={generatePDF}
              className="px-4 py-2 rounded-xl bg-green-600 text-white"
            >
              Generate PDF
            </button>

          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* CARD */}
          <div>

            <p className="mb-2 font-semibold">
              Front — 85.6 × 53.9 mm
            </p>

            <div
              ref={front}
              className="pvc bg-white rounded-xl overflow-hidden border relative"
              style={{
                background:
                  "linear-gradient(135deg,#ffffff 35%,#dcfce7)",
              }}
            >

              {/* CARD HEADER */}
              <div className="h-12 bg-gradient-to-r from-green-700 to-blue-700 text-white px-4 flex items-center font-bold">
                ಸಂಸ್ಥೆ ಸದಸ್ಯತ್ವ ಕಾರ್ಡ್
              </div>

              {/* CARD BODY */}
              <div className="p-4 flex gap-4">

                {/* PHOTO */}
                <div className="w-20 h-24 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">

                  {a.photo_url ? (
                    <img
                      src={a.photo_url}
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                      alt="Member"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-xs text-slate-400">
                      Photo
                    </div>
                  )}

                </div>

                {/* DETAILS */}
                <div className="text-xs leading-5">

                  <div>
                    <b>ಹೆಸರು:</b>{" "}
                    {a.name || "-"}
                  </div>

                  <div>
                    <b>ಹುದ್ದೆ:</b>{" "}
                    {a.designation || "-"}
                  </div>

                  <div>
                    <b>ಗ್ರಾಮ:</b>{" "}
                    {a.village || "-"}
                  </div>

                  <div>
                    <b>ಮೊಬೈಲ್:</b>{" "}
                    {a.mobile || "-"}
                  </div>

                  <div>
                    <b>Member ID:</b>{" "}
                    {a.membership_no || "-"}
                  </div>

                </div>

                {/* QR */}
                {qr && (
                  <div className="ml-auto flex-shrink-0">

                    <img
                      src={qr}
                      className="w-16 h-16"
                      alt="Public Page QR Code"
                    />

                    <div className="text-[8px] text-center mt-1 text-slate-500">
                      Scan
                    </div>

                  </div>
                )}

              </div>

            </div>
          </div>

          {/* CONTROLS */}
          <div className="bg-white rounded-2xl p-5 shadow">

            <h2 className="font-bold text-lg">
              Template Controls
            </h2>

            <p className="text-slate-500 mt-2">
              {locked
                ? "🔒 Design locked — master template active."
                : "✏️ Editing enabled."}
            </p>

            <div className="grid gap-3 mt-5">

              <input
                placeholder="Card title"
                defaultValue="ಸಂಸ್ಥೆ ಸದಸ್ಯತ್ವ ಕಾರ್ಡ್"
                disabled={locked}
                className="border rounded-xl p-3"
              />

              <select
                disabled={locked}
                className="border rounded-xl p-3"
              >
                <option>
                  85.6 × 53.9 mm
                </option>

                <option>
                  Custom size
                </option>
              </select>

              <button
                disabled={locked}
                className="border rounded-xl p-3"
              >
                + Add Text / Logo
              </button>

            </div>

            {/* BACK PREVIEW */}
            <div className="mt-6">

              <p className="font-semibold">
                Back Preview
              </p>

              <div className="pvc mt-2 rounded-xl border bg-white min-h-40 grid place-items-center text-center p-5">

                <div>

                  <b>
                    ನಮ್ಮ ಸಂಘಟನೆ — ನಮ್ಮ ಬಲ
                  </b>

                  <p className="text-xs mt-2">
                    QR / Contact / Terms
                  </p>

                </div>

              </div>

            </div>

            {/* QR INFORMATION */}
            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">

              <h3 className="font-bold text-green-800">
                QR Code
              </h3>

              <p className="text-sm text-green-700 mt-1">
                ಈ QR Code scan ಮಾಡಿದಾಗ
                memberನ separate Public Page open ಆಗುತ್ತದೆ.
              </p>

            </div>

          </div>

        </div>
      </div>
    </main>
  );
}

export default function CardPage() {
  return (
    <Suspense
      fallback={
        <main className="p-10">
          Loading card designer...
        </main>
      }
    >
      <Card />
    </Suspense>
  );
}
