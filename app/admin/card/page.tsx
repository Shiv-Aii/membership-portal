"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useSearchParams } from "next/navigation";

type QRPosition = {
  x: number;
  y: number;
  size: number;
};

function Card() {
  const params = useSearchParams();
  const id = params.get("id");

  const [a, setA] = useState<any>(null);
  const [qr, setQr] = useState("");
  const [locked, setLocked] = useState(false);

  const [qrPosition, setQrPosition] = useState<QRPosition>({
    x: 0,
    y: 0,
    size: 64,
  });

  const [draggingQR, setDraggingQR] = useState(false);

  const front = useRef<HTMLDivElement>(null);
  const dragStart = useRef({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  /*
   * LOAD MEMBER
   */
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

        const qrImage = await QRCode.toDataURL(
          publicPageUrl,
          {
            width: 300,
            margin: 2,
          }
        );

        setQr(qrImage);

        /*
         * LOAD SAVED QR POSITION
         */
        try {
          const saved = localStorage.getItem(
            `pvc-qr-position-${data.id}`
          );

          if (saved) {
            const parsed = JSON.parse(saved);

            if (
              typeof parsed.x === "number" &&
              typeof parsed.y === "number" &&
              typeof parsed.size === "number"
            ) {
              setQrPosition(parsed);
            }
          }
        } catch (error) {
          console.error(
            "QR position loading error:",
            error
          );
        }
      }
    }

    loadMember();
  }, [id]);

  /*
   * SAVE QR POSITION
   */
  useEffect(() => {
    if (!a?.id) return;

    localStorage.setItem(
      `pvc-qr-position-${a.id}`,
      JSON.stringify(qrPosition)
    );
  }, [qrPosition, a?.id]);

  /*
   * START QR DRAG
   */
  function startQRDrag(
    e: React.PointerEvent<HTMLDivElement>
  ) {
    if (locked) return;

    e.preventDefault();
    e.stopPropagation();

    setDraggingQR(true);

    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: qrPosition.x,
      startY: qrPosition.y,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  }

  /*
   * QR DRAGGING
   */
  function moveQR(
    e: React.PointerEvent<HTMLDivElement>
  ) {
    if (!draggingQR || locked) return;

    const dx =
      e.clientX - dragStart.current.mouseX;

    const dy =
      e.clientY - dragStart.current.mouseY;

    let newX =
      dragStart.current.startX + dx;

    let newY =
      dragStart.current.startY + dy;

    /*
     * Keep QR inside card
     */
    const cardWidth =
      front.current?.clientWidth || 400;

    const cardHeight =
      front.current?.clientHeight || 250;

    const maxX =
      Math.max(0, cardWidth - qrPosition.size);

    const maxY =
      Math.max(0, cardHeight - qrPosition.size);

    newX = Math.max(
      0,
      Math.min(newX, maxX)
    );

    newY = Math.max(
      0,
      Math.min(newY, maxY)
    );

    setQrPosition((old) => ({
      ...old,
      x: newX,
      y: newY,
    }));
  }

  /*
   * END QR DRAG
   */
  function stopQRDrag(
    e: React.PointerEvent<HTMLDivElement>
  ) {
    if (!draggingQR) return;

    setDraggingQR(false);

    try {
      e.currentTarget.releasePointerCapture(
        e.pointerId
      );
    } catch {}
  }

  /*
   * RESET QR POSITION
   */
  function resetQRPosition() {
    if (locked) return;

    setQrPosition({
      x: 0,
      y: 0,
      size: 64,
    });
  }

  /*
   * QR SIZE
   */
  function changeQRSize(
    value: number
  ) {
    if (locked) return;

    setQrPosition((old) => ({
      ...old,
      size: value,
    }));
  }

  /*
   * PDF
   */
  async function generatePDF() {
    if (!front.current || !a) return;

    const canvas =
      await html2canvas(front.current, {
        scale: 4,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

    const img =
      canvas.toDataURL("image/png");

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

        {/* HEADER */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-5">

          <h1 className="text-2xl font-bold">
            PVC Card Designer
          </h1>

          <div className="flex gap-2">

            <button
              onClick={() =>
                setLocked(!locked)
              }
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

          {/* ================= CARD ================= */}

          <div>

            <p className="mb-2 font-semibold">
              Front — 85.6 × 53.9 mm
            </p>

            <div
              ref={front}
              className="pvc bg-white rounded-xl overflow-hidden border relative select-none"
              style={{
                background:
                  "linear-gradient(135deg,#ffffff 35%,#dcfce7)",
                minHeight: "250px",
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

              </div>

              {/* ================= DRAGGABLE QR ================= */}

              {qr && (

                <div
                  onPointerDown={startQRDrag}
                  onPointerMove={moveQR}
                  onPointerUp={stopQRDrag}
                  onPointerCancel={stopQRDrag}
                  className={`absolute ${
                    locked
                      ? "cursor-default"
                      : "cursor-move"
                  }`}
                  style={{
                    left: qrPosition.x,
                    top: qrPosition.y,
                    width: qrPosition.size,
                    height:
                      qrPosition.size + 18,
                    touchAction: "none",
                    zIndex: 20,
                  }}
                >

                  <div
                    className={`rounded ${
                      !locked
                        ? "ring-2 ring-blue-500 ring-offset-1"
                        : ""
                    }`}
                    style={{
                      width:
                        qrPosition.size,
                      height:
                        qrPosition.size,
                    }}
                  >

                    <img
                      src={qr}
                      draggable={false}
                      className="w-full h-full"
                      alt="Public Page QR Code"
                    />

                  </div>

                  <div className="text-[8px] text-center mt-1 text-slate-500">
                    Scan
                  </div>

                </div>

              )}

            </div>
          </div>

          {/* ================= CONTROLS ================= */}

          <div className="bg-white rounded-2xl p-5 shadow">

            <h2 className="font-bold text-lg">
              Template Controls
            </h2>

            <p className="text-slate-500 mt-2">

              {locked
                ? "🔒 Design locked — master template active."
                : "✏️ Editing enabled — QR can be dragged."}

            </p>

            {/* CARD TITLE */}

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

            {/* ================= QR CONTROLS ================= */}

            <div className="mt-6 border rounded-2xl p-4">

              <h3 className="font-bold text-lg">
                QR Code Position
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Card ಮೇಲಿರುವ QR Code ಅನ್ನು mouse ಮೂಲಕ drag ಮಾಡಿ ಬೇಕಾದ ಜಾಗದಲ್ಲಿ ಇಡಿ.
              </p>

              {/* SIZE */}

              <div className="mt-4">

                <div className="flex justify-between text-sm mb-2">

                  <span>
                    QR Size
                  </span>

                  <b>
                    {qrPosition.size}px
                  </b>

                </div>

                <input
                  type="range"
                  min="40"
                  max="110"
                  value={qrPosition.size}
                  disabled={locked}
                  onChange={(e) =>
                    changeQRSize(
                      Number(e.target.value)
                    )
                  }
                  className="w-full"
                />

              </div>

              {/* POSITION */}

              <div className="grid grid-cols-2 gap-3 mt-4">

                <div className="border rounded-xl p-3">

                  <div className="text-xs text-slate-500">
                    X Position
                  </div>

                  <div className="font-bold">
                    {Math.round(qrPosition.x)} px
                  </div>

                </div>

                <div className="border rounded-xl p-3">

                  <div className="text-xs text-slate-500">
                    Y Position
                  </div>

                  <div className="font-bold">
                    {Math.round(qrPosition.y)} px
                  </div>

                </div>

              </div>

              {/* RESET */}

              <button
                onClick={resetQRPosition}
                disabled={locked}
                className="w-full mt-4 border border-red-200 text-red-600 rounded-xl p-3 disabled:opacity-50"
              >
                Reset QR Position
              </button>

            </div>

            {/* ================= BACK PREVIEW ================= */}

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

            {/* ================= QR INFORMATION ================= */}

            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">

              <h3 className="font-bold text-green-800">
                QR Code
              </h3>

              <p className="text-sm text-green-700 mt-1">
                ಈ QR Code scan ಮಾಡಿದಾಗ
                memberನ separate Public Page open ಆಗುತ್ತದೆ.
              </p>

              <p className="text-xs text-green-700 mt-2">
                QR ಅನ್ನು drag ಮಾಡಿ ಬೇಕಾದ ಜಾಗಕ್ಕೆ
                ಇಡಬಹುದು. Size ಕೂಡ ಬದಲಾಯಿಸಬಹುದು.
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
