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

type BackText = {
  text: string;
  x: number;
  y: number;
  size: number;
};

type BackImage = {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type DragType =
  | "qr"
  | "back-text"
  | "back-image"
  | null;

function Card() {
  const params = useSearchParams();
  const id = params.get("id");

  const [a, setA] = useState<any>(null);
  const [qr, setQr] = useState("");
  const [locked, setLocked] = useState(false);

  const [side, setSide] = useState<"front" | "back">(
    "front"
  );

  const [qrPosition, setQrPosition] =
    useState<QRPosition>({
      x: 0,
      y: 0,
      size: 64,
    });

  const [backText, setBackText] =
    useState<BackText>({
      text: "ನಮ್ಮ ಸಂಘಟನೆ — ನಮ್ಮ ಬಲ",
      x: 120,
      y: 75,
      size: 18,
    });

  const [backImage, setBackImage] =
    useState<BackImage>({
      url: "",
      x: 20,
      y: 20,
      width: 100,
      height: 70,
    });

  const [dragging, setDragging] =
    useState<DragType>(null);

  const cardRef =
    useRef<HTMLDivElement>(null);

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

        const qrImage =
          await QRCode.toDataURL(
            publicPageUrl,
            {
              width: 300,
              margin: 2,
            }
          );

        setQr(qrImage);

        /*
         * LOAD SAVED DESIGN
         */
        try {
          const saved =
            localStorage.getItem(
              `pvc-design-${data.id}`
            );

          if (saved) {
            const design =
              JSON.parse(saved);

            if (design.qrPosition) {
              setQrPosition(
                design.qrPosition
              );
            }

            if (design.backText) {
              setBackText(
                design.backText
              );
            }

            if (design.backImage) {
              setBackImage(
                design.backImage
              );
            }
          }
        } catch (error) {
          console.error(
            "Design loading error:",
            error
          );
        }
      }
    }

    loadMember();
  }, [id]);

  /*
   * SAVE DESIGN
   */
  useEffect(() => {
    if (!a?.id) return;

    localStorage.setItem(
      `pvc-design-${a.id}`,
      JSON.stringify({
        qrPosition,
        backText,
        backImage,
      })
    );
  }, [
    qrPosition,
    backText,
    backImage,
    a?.id,
  ]);

  /*
   * START DRAG
   */
  function startDrag(
    e: React.PointerEvent<HTMLDivElement>,
    type: DragType,
    x: number,
    y: number
  ) {
    if (locked) return;

    e.preventDefault();
    e.stopPropagation();

    setDragging(type);

    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: x,
      startY: y,
    };

    e.currentTarget.setPointerCapture(
      e.pointerId
    );
  }

  /*
   * MOVE ELEMENT
   */
  function moveElement(
    e: React.PointerEvent<HTMLDivElement>
  ) {
    if (!dragging || locked) return;

    const dx =
      e.clientX -
      dragStart.current.mouseX;

    const dy =
      e.clientY -
      dragStart.current.mouseY;

    let newX =
      dragStart.current.startX + dx;

    let newY =
      dragStart.current.startY + dy;

    const cardWidth =
      cardRef.current?.clientWidth || 400;

    const cardHeight =
      cardRef.current?.clientHeight || 250;

    /*
     * QR
     */
    if (dragging === "qr") {
      const maxX = Math.max(
        0,
        cardWidth - qrPosition.size
      );

      const maxY = Math.max(
        0,
        cardHeight - qrPosition.size
      );

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
     * BACK TEXT
     */
    if (dragging === "back-text") {
      newX = Math.max(
        0,
        Math.min(newX, cardWidth - 30)
      );

      newY = Math.max(
        0,
        Math.min(newY, cardHeight - 30)
      );

      setBackText((old) => ({
        ...old,
        x: newX,
        y: newY,
      }));
    }

    /*
     * BACK IMAGE
     */
    if (dragging === "back-image") {
      const maxX = Math.max(
        0,
        cardWidth - backImage.width
      );

      const maxY = Math.max(
        0,
        cardHeight - backImage.height
      );

      newX = Math.max(
        0,
        Math.min(newX, maxX)
      );

      newY = Math.max(
        0,
        Math.min(newY, maxY)
      );

      setBackImage((old) => ({
        ...old,
        x: newX,
        y: newY,
      }));
    }
  }

  /*
   * STOP DRAG
   */
  function stopDrag(
    e: React.PointerEvent<HTMLDivElement>
  ) {
    setDragging(null);

    try {
      e.currentTarget.releasePointerCapture(
        e.pointerId
      );
    } catch {}
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
   * BACK TEXT SIZE
   */
  function changeBackTextSize(
    value: number
  ) {
    if (locked) return;

    setBackText((old) => ({
      ...old,
      size: value,
    }));
  }

  /*
   * BACK IMAGE SIZE
   */
  function changeBackImageSize(
    value: number
  ) {
    if (locked) return;

    const ratio =
      backImage.height /
      Math.max(backImage.width, 1);

    setBackImage((old) => ({
      ...old,
      width: value,
      height: Math.round(
        value * ratio
      ),
    }));
  }

  /*
   * RESET BACK
   */
  function resetBack() {
    if (locked) return;

    setBackText({
      text: "ನಮ್ಮ ಸಂಘಟನೆ — ನಮ್ಮ ಬಲ",
      x: 120,
      y: 75,
      size: 18,
    });

    setBackImage({
      url: "",
      x: 20,
      y: 20,
      width: 100,
      height: 70,
    });
  }

  /*
   * ADD IMAGE
   */
  function addBackImage() {
    if (locked) return;

    const url =
      window.prompt(
        "Back side image URL paste ಮಾಡಿ:"
      );

    if (!url) return;

    setBackImage({
      url,
      x: 20,
      y: 20,
      width: 100,
      height: 70,
    });
  }

  /*
   * PDF
   */
  async function generatePDF() {
    if (!cardRef.current || !a)
      return;

    const canvas =
      await html2canvas(
        cardRef.current,
        {
          scale: 4,
          useCORS: true,
          backgroundColor: "#ffffff",
        }
      );

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

  /*
   * LOADING
   */
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

      <div className="max-w-7xl mx-auto">

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

        {/* FRONT / BACK */}

        <div className="flex gap-2 mb-5">

          <button
            onClick={() =>
              setSide("front")
            }
            className={`px-5 py-2 rounded-xl ${
              side === "front"
                ? "bg-blue-600 text-white"
                : "bg-white border"
            }`}
          >
            Front
          </button>

          <button
            onClick={() =>
              setSide("back")
            }
            className={`px-5 py-2 rounded-xl ${
              side === "back"
                ? "bg-blue-600 text-white"
                : "bg-white border"
            }`}
          >
            Back
          </button>

        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* ================= CARD ================= */}

          <div>

            <p className="mb-2 font-semibold">
              {side === "front"
                ? "Front"
                : "Back"}{" "}
              — 85.6 × 53.9 mm
            </p>

            <div
              ref={cardRef}
              className="pvc bg-white rounded-xl overflow-hidden border relative select-none"
              style={{
                background:
                  "linear-gradient(135deg,#ffffff 35%,#dcfce7)",
                minHeight: "250px",
                touchAction: "none",
              }}
            >

              {/* ================= FRONT ================= */}

              {side === "front" && (
                <>
                  <div className="h-12 bg-gradient-to-r from-green-700 to-blue-700 text-white px-4 flex items-center font-bold">

                    ಸಂಸ್ಥೆ ಸದಸ್ಯತ್ವ ಕಾರ್ಡ್

                  </div>

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

                  {/* QR */}

                  {qr && (

                    <div
                      onPointerDown={(e) =>
                        startDrag(
                          e,
                          "qr",
                          qrPosition.x,
                          qrPosition.y
                        )
                      }
                      onPointerMove={moveElement}
                      onPointerUp={stopDrag}
                      onPointerCancel={stopDrag}
                      className={`absolute ${
                        locked
                          ? "cursor-default"
                          : "cursor-move"
                      }`}
                      style={{
                        left:
                          qrPosition.x,
                        top:
                          qrPosition.y,
                        width:
                          qrPosition.size,
                        touchAction:
                          "none",
                        zIndex: 20,
                      }}
                    >

                      <div
                        className={
                          !locked
                            ? "ring-2 ring-blue-500 ring-offset-1"
                            : ""
                        }
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
                          alt="QR"
                        />

                      </div>

                      <div className="text-[8px] text-center mt-1 text-slate-500">
                        Scan
                      </div>

                    </div>

                  )}

                </>
              )}

              {/* ================= BACK ================= */}

              {side === "back" && (
                <>

                  {/* BACK TEXT */}

                  <div
                    onPointerDown={(e) =>
                      startDrag(
                        e,
                        "back-text",
                        backText.x,
                        backText.y
                      )
                    }
                    onPointerMove={moveElement}
                    onPointerUp={stopDrag}
                    onPointerCancel={stopDrag}
                    className={`absolute font-bold ${
                      locked
                        ? "cursor-default"
                        : "cursor-move ring-2 ring-blue-500 ring-offset-2"
                    }`}
                    style={{
                      left:
                        backText.x,
                      top:
                        backText.y,
                      fontSize:
                        backText.size,
                      touchAction:
                        "none",
                      zIndex: 10,
                    }}
                  >
                    {backText.text}
                  </div>

                  {/* BACK IMAGE */}

                  {backImage.url && (

                    <div
                      onPointerDown={(e) =>
                        startDrag(
                          e,
                          "back-image",
                          backImage.x,
                          backImage.y
                        )
                      }
                      onPointerMove={moveElement}
                      onPointerUp={stopDrag}
                      onPointerCancel={stopDrag}
                      className={`absolute ${
                        locked
                          ? "cursor-default"
                          : "cursor-move ring-2 ring-blue-500 ring-offset-2"
                      }`}
                      style={{
                        left:
                          backImage.x,
                        top:
                          backImage.y,
                        width:
                          backImage.width,
                        height:
                          backImage.height,
                        touchAction:
                          "none",
                        zIndex: 5,
                      }}
                    >

                      <img
                        src={backImage.url}
                        draggable={false}
                        className="w-full h-full object-contain"
                        alt="Back design"
                      />

                    </div>

                  )}

                  {/* TERMS */}

                  <div className="absolute bottom-4 left-4 right-4 text-center text-[9px] text-slate-500">
                    QR / Contact / Terms
                  </div>

                </>
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
                : "✏️ Editing enabled."}
            </p>

            {/* FRONT CONTROLS */}

            {side === "front" && (

              <div className="mt-5">

                <h3 className="font-bold">
                  QR Code
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  QR Code ಅನ್ನು cardನಲ್ಲಿ drag ಮಾಡಿ
                  ಬೇಕಾದ ಜಾಗದಲ್ಲಿ ಇಡಿ.
                </p>

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
                    value={
                      qrPosition.size
                    }
                    disabled={locked}
                    onChange={(e) =>
                      changeQRSize(
                        Number(
                          e.target.value
                        )
                      )
                    }
                    className="w-full"
                  />

                </div>

              </div>

            )}

            {/* BACK CONTROLS */}

            {side === "back" && (

              <div className="mt-5 space-y-5">

                {/* TEXT */}

                <div className="border rounded-2xl p-4">

                  <h3 className="font-bold">
                    Back Text
                  </h3>

                  <textarea
                    value={backText.text}
                    disabled={locked}
                    onChange={(e) =>
                      setBackText(
                        (old) => ({
                          ...old,
                          text: e.target.value,
                        })
                      )
                    }
                    className="border rounded-xl p-3 w-full mt-3 min-h-24"
                    placeholder="Back side text..."
                  />

                  <div className="flex justify-between text-sm mt-4">

                    <span>
                      Text Size
                    </span>

                    <b>
                      {backText.size}px
                    </b>

                  </div>

                  <input
                    type="range"
                    min="8"
                    max="32"
                    value={
                      backText.size
                    }
                    disabled={locked}
                    onChange={(e) =>
                      changeBackTextSize(
                        Number(
                          e.target.value
                        )
                      )
                    }
                    className="w-full mt-2"
                  />

                  <p className="text-xs text-slate-500 mt-3">
                    Card ಮೇಲಿನ text ಅನ್ನು drag ಮಾಡಿ
                    ಬೇಕಾದ ಜಾಗದಲ್ಲಿ ಇಡಬಹುದು.
                  </p>

                </div>

                {/* IMAGE */}

                <div className="border rounded-2xl p-4">

                  <h3 className="font-bold">
                    Back Image / Logo
                  </h3>

                  <button
                    onClick={addBackImage}
                    disabled={locked}
                    className="w-full mt-3 border rounded-xl p-3 hover:bg-slate-50 disabled:opacity-50"
                  >
                    + Add Image / Logo
                  </button>

                  {backImage.url && (

                    <>
                      <p className="text-xs text-slate-500 mt-3">
                        Image ಅನ್ನು drag ಮಾಡಿ
                        ಬೇಕಾದ ಜಾಗದಲ್ಲಿ ಇಡಿ.
                      </p>

                      <div className="flex justify-between text-sm mt-4">

                        <span>
                          Image Width
                        </span>

                        <b>
                          {backImage.width}px
                        </b>

                      </div>

                      <input
                        type="range"
                        min="30"
                        max="220"
                        value={
                          backImage.width
                        }
                        disabled={locked}
                        onChange={(e) =>
                          changeBackImageSize(
                            Number(
                              e.target.value
                            )
                          )
                        }
                        className="w-full mt-2"
                      />

                    </>

                  )}

                </div>

                {/* RESET */}

                <button
                  onClick={resetBack}
                  disabled={locked}
                  className="w-full border border-red-200 text-red-600 rounded-xl p-3 disabled:opacity-50"
                >
                  Reset Back Design
                </button>

              </div>

            )}

            {/* LOCK INFO */}

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">

              <h3 className="font-bold text-blue-800">
                Design Control
              </h3>

              <p className="text-sm text-blue-700 mt-1">
                {locked
                  ? "Design locked. Unlock ಮಾಡಿ ಮತ್ತೆ edit ಮಾಡಬಹುದು."
                  : "Editing enabled. Text ಮತ್ತು image ಅನ್ನು drag ಮಾಡಬಹುದು."}
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
