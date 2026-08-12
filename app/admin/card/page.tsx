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

type Side = "front" | "back";

type ElementKey =
  | "photo"
  | "name"
  | "designation"
  | "village"
  | "mobile"
  | "memberId"
  | "frontQr"
  | "backTitle"
  | "backText"
  | "backContact"
  | "backQr";

type CardElement = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Layout = Record<ElementKey, CardElement>;

const DEFAULT_WIDTH = 85.6;
const DEFAULT_HEIGHT = 53.9;

const SCALE = 5;

const defaultLayout: Layout = {
  photo: {
    x: 18,
    y: 70,
    width: 80,
    height: 95,
  },

  name: {
    x: 115,
    y: 72,
    width: 190,
    height: 28,
  },

  designation: {
    x: 115,
    y: 105,
    width: 190,
    height: 25,
  },

  village: {
    x: 115,
    y: 135,
    width: 190,
    height: 25,
  },

  mobile: {
    x: 115,
    y: 165,
    width: 190,
    height: 25,
  },

  memberId: {
    x: 115,
    y: 195,
    width: 190,
    height: 25,
  },

  frontQr: {
    x: 335,
    y: 155,
    width: 65,
    height: 65,
  },

  backTitle: {
    x: 55,
    y: 70,
    width: 320,
    height: 35,
  },

  backText: {
    x: 55,
    y: 120,
    width: 320,
    height: 70,
  },

  backContact: {
    x: 55,
    y: 205,
    width: 320,
    height: 30,
  },

  backQr: {
    x: 175,
    y: 225,
    width: 70,
    height: 70,
  },
};

const elementLabels: Record<ElementKey, string> = {
  photo: "Photo",
  name: "Name",
  designation: "Designation",
  village: "Village",
  mobile: "Mobile",
  memberId: "Member ID",
  frontQr: "Front QR",
  backTitle: "Back Title",
  backText: "Back Text",
  backContact: "Back Contact",
  backQr: "Back QR",
};

function Card() {
  const params = useSearchParams();

  const id = params.get("id");

  const [a, setA] = useState<any>(null);

  const [qr, setQr] = useState("");

  const [locked, setLocked] =
    useState(false);

  const [side, setSide] =
    useState<Side>("front");

  const [selected, setSelected] =
    useState<ElementKey>("frontQr");

  const [dragging, setDragging] =
    useState<ElementKey | null>(null);

  const [width, setWidth] =
    useState(DEFAULT_WIDTH);

  const [height, setHeight] =
    useState(DEFAULT_HEIGHT);

  const frontRef =
    useRef<HTMLDivElement>(null);

  const backRef =
    useRef<HTMLDivElement>(null);

  const dragStart = useRef({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  /*
   * CURRENT CARD PIXEL SIZE
   */

  const cardWidth =
    width * SCALE;

  const cardHeight =
    height * SCALE;

  /*
   * LOAD MEMBER
   */

  useEffect(() => {
    async function loadMember() {
      if (!id) return;

      const { data, error } =
        await supabase
          .from("applications")
          .select("*")
          .eq("id", id)
          .single();

      if (error) {
        console.error(error);
        return;
      }

      setA(data);

      if (!data) return;

      /*
       * EXISTING QR URL
       */

      const publicPageUrl =
        `${window.location.origin}/public-page?id=${data.id}`;

      try {
        const qrImage =
          await QRCode.toDataURL(
            publicPageUrl,
            {
              width: 400,
              margin: 2,
            }
          );

        setQr(qrImage);
      } catch (error) {
        console.error(
          "QR generation error",
          error
        );
      }

      /*
       * LOAD SAVED DESIGN
       */

      try {
        const saved =
          localStorage.getItem(
            `pvc-master-design-${data.id}`
          );

        if (saved) {
          const parsed =
            JSON.parse(saved);

          if (parsed.layout) {
            setLayout({
              ...defaultLayout,
              ...parsed.layout,
            });
          }

          if (
            typeof parsed.width ===
            "number"
          ) {
            setWidth(parsed.width);
          }

          if (
            typeof parsed.height ===
            "number"
          ) {
            setHeight(parsed.height);
          }
        }
      } catch (error) {
        console.error(
          "Design loading error",
          error
        );
      }
    }

    loadMember();
  }, [id]);

  const [layout, setLayout] =
    useState<Layout>(defaultLayout);

  /*
   * ELEMENT SIDE
   */

  function elementSide(
    key: ElementKey
  ): Side {
    if (
      key === "backTitle" ||
      key === "backText" ||
      key === "backContact" ||
      key === "backQr"
    ) {
      return "back";
    }

    return "front";
  }

  /*
   * START DRAG
   */

  function startDrag(
    key: ElementKey,
    e: React.PointerEvent<HTMLDivElement>
  ) {
    if (locked) return;

    e.preventDefault();
    e.stopPropagation();

    setSelected(key);

    setDragging(key);

    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: layout[key].x,
      startY: layout[key].y,
    };

    e.currentTarget.setPointerCapture(
      e.pointerId
    );
  }

  /*
   * MOVE
   */

  function moveElement(
    key: ElementKey,
    e: React.PointerEvent<HTMLDivElement>
  ) {
    if (
      locked ||
      dragging !== key
    ) {
      return;
    }

    const dx =
      e.clientX -
      dragStart.current.mouseX;

    const dy =
      e.clientY -
      dragStart.current.mouseY;

    let x =
      dragStart.current.startX + dx;

    let y =
      dragStart.current.startY + dy;

    const item =
      layout[key];

    x = Math.max(
      0,
      Math.min(
        x,
        cardWidth - item.width
      )
    );

    y = Math.max(
      0,
      Math.min(
        y,
        cardHeight - item.height
      )
    );

    setLayout((old) => ({
      ...old,
      [key]: {
        ...old[key],
        x,
        y,
      },
    }));
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
   * SIZE
   */

  function changeElementWidth(
    key: ElementKey,
    value: number
  ) {
    if (locked) return;

    setLayout((old) => ({
      ...old,
      [key]: {
        ...old[key],
        width: value,
      },
    }));
  }

  function changeElementHeight(
    key: ElementKey,
    value: number
  ) {
    if (locked) return;

    setLayout((old) => ({
      ...old,
      [key]: {
        ...old[key],
        height: value,
      },
    }));
  }

  /*
   * CARD SIZE
   */

  function applyCardSize() {
    if (locked) return;

    if (
      !width ||
      !height ||
      width < 20 ||
      height < 20
    ) {
      alert(
        "Width ಮತ್ತು Height ಸರಿಯಾದ value ಹಾಕಿ."
      );

      return;
    }

    setWidth(
      Number(width.toFixed(1))
    );

    setHeight(
      Number(height.toFixed(1))
    );
  }

  function standardPVC() {
    if (locked) return;

    setWidth(85.6);
    setHeight(53.9);
  }

  /*
   * SAVE MASTER
   */

  function saveMaster() {
    if (!a?.id) return;

    try {
      localStorage.setItem(
        `pvc-master-design-${a.id}`,
        JSON.stringify({
          width,
          height,
          layout,
        })
      );

      alert(
        "Master Design saved successfully."
      );
    } catch (error) {
      console.error(error);

      alert(
        "Design save ಆಗಲಿಲ್ಲ."
      );
    }
  }

  /*
   * RESET
   */

  function resetDesign() {
    if (locked) return;

    setWidth(DEFAULT_WIDTH);
    setHeight(DEFAULT_HEIGHT);

    setLayout({
      ...defaultLayout,
    });

    setSelected("frontQr");
  }

  /*
   * PDF CAPTURE
   */

  async function captureCard(
    element: HTMLDivElement
  ) {
    return html2canvas(element, {
      scale: 3,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      imageTimeout: 20000,
      removeContainer: true,
    });
  }

  /*
   * PDF
   */

  async function generatePDF() {
    if (
      !frontRef.current ||
      !backRef.current ||
      !a
    ) {
      alert(
        "Card preview ಇನ್ನೂ ready ಆಗಿಲ್ಲ."
      );

      return;
    }

    try {
      /*
       * Wait for browser rendering
       */

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 300)
      );

      const frontCanvas =
        await captureCard(
          frontRef.current
        );

      const backCanvas =
        await captureCard(
          backRef.current
        );

      const frontImage =
        frontCanvas.toDataURL(
          "image/png"
        );

      const backImage =
        backCanvas.toDataURL(
          "image/png"
        );

      const pdf = new jsPDF({
        orientation:
          width >= height
            ? "landscape"
            : "portrait",

        unit: "mm",

        format: [
          width,
          height,
        ],

        compress: true,
      });

      /*
       * FRONT
       */

      pdf.addImage(
        frontImage,
        "PNG",
        0,
        0,
        width,
        height
      );

      /*
       * BACK
       */

      pdf.addPage(
        [width, height],
        width >= height
          ? "landscape"
          : "portrait"
      );

      pdf.addImage(
        backImage,
        "PNG",
        0,
        0,
        width,
        height
      );

      pdf.save(
        `${a.membership_no || "member"}-PVC.pdf`
      );

    } catch (error) {
      console.error(
        "PDF GENERATION ERROR:",
        error
      );

      alert(
        "PDF generation failed. Browser consoleನಲ್ಲಿ PDF GENERATION ERROR ನೋಡಿ."
      );
    }
  }

  /*
   * COMMON ELEMENT STYLE
   */

  function styleFor(
    key: ElementKey
  ) {
    const item =
      layout[key];

    return {
      position: "absolute" as const,
      left: item.x,
      top: item.y,
      width: item.width,
      height: item.height,
      touchAction:
        "none" as const,

      zIndex:
        selected === key
          ? 50
          : 10,
    };
  }

  /*
   * SELECT ELEMENT
   */

  function selectElement(
    key: ElementKey
  ) {
    setSelected(key);

    setSide(
      elementSide(key)
    );
  }

  /*
   * LOADING
   */

  if (!a) {
    return (
      <main className="min-h-screen bg-slate-100 grid place-items-center p-10">

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

  /*
   * RENDER
   */

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-5">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-wrap justify-between items-center gap-3 mb-5">

          <div>
            <h1 className="text-2xl font-bold">
              PVC Card Designer
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Front + Back visual designer
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            <button
              onClick={() =>
                setLocked(!locked)
              }
              className="px-4 py-2 rounded-xl bg-slate-900 text-white"
            >
              {locked
                ? "🔓 Unlock Design"
                : "🔒 Lock Design"}
            </button>

            <button
              onClick={saveMaster}
              disabled={locked}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white disabled:opacity-50"
            >
              💾 Save Master
            </button>

            <button
              onClick={generatePDF}
              className="px-4 py-2 rounded-xl bg-green-600 text-white"
            >
              📄 Generate PDF
            </button>

          </div>

        </div>

        {/* MAIN GRID */}

        <div className="grid xl:grid-cols-[1fr_390px] gap-6 items-start">

          {/* PREVIEW */}

          <div className="bg-white rounded-3xl shadow p-5">

            {/* TABS */}

            <div className="flex gap-2 mb-5">

              <button
                onClick={() =>
                  setSide("front")
                }
                className={`px-5 py-2 rounded-xl font-semibold ${
                  side === "front"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100"
                }`}
              >
                Front
              </button>

              <button
                onClick={() =>
                  setSide("back")
                }
                className={`px-5 py-2 rounded-xl font-semibold ${
                  side === "back"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100"
                }`}
              >
                Back
              </button>

            </div>

            {/* FRONT */}

            {side === "front" && (
              <div>

                <p className="font-semibold mb-2">
                  Front — {width} × {height} mm
                </p>

                <div className="overflow-x-auto pb-4">

                  <div
                    ref={frontRef}
                    className="relative overflow-hidden border rounded-xl bg-white select-none"
                    style={{
                      width: cardWidth,
                      height: cardHeight,
                      background:
                        "linear-gradient(135deg,#ffffff 35%,#dcfce7)",
                    }}
                  >

                    {/* HEADER */}

                    <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-green-700 to-blue-700 text-white flex items-center justify-center font-bold">
                      ಸಂಸ್ಥೆ ಸದಸ್ಯತ್ವ ಕಾರ್ಡ್
                    </div>

                    {/* PHOTO */}

                    <div
                      onPointerDown={(e) =>
                        startDrag(
                          "photo",
                          e
                        )
                      }
                      onPointerMove={(e) =>
                        moveElement(
                          "photo",
                          e
                        )
                      }
                      onPointerUp={
                        stopDrag
                      }
                      onPointerCancel={
                        stopDrag
                      }
                      onClick={() =>
                        selectElement(
                          "photo"
                        )
                      }
                      style={styleFor(
                        "photo"
                      )}
                      className={`rounded-lg overflow-hidden bg-slate-200 cursor-move ${
                        selected ===
                        "photo"
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                    >

                      {a.photo_url ? (
                        <img
                          src={
                            a.photo_url
                          }
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover pointer-events-none"
                          alt="Member"
                        />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-xs text-slate-400">
                          Photo
                        </div>
                      )}

                    </div>

                    {/* NAME */}

                    <div
                      onPointerDown={(e) =>
                        startDrag(
                          "name",
                          e
                        )
                      }
                      onPointerMove={(e) =>
                        moveElement(
                          "name",
                          e
                        )
                      }
                      onPointerUp={
                        stopDrag
                      }
                      onPointerCancel={
                        stopDrag
                      }
                      onClick={() =>
                        selectElement(
                          "name"
                        )
                      }
                      style={styleFor(
                        "name"
                      )}
                      className={`flex items-center font-bold text-sm cursor-move ${
                        selected ===
                        "name"
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                    >
                      ಹೆಸರು:{" "}
                      {a.name ||
                        "-"}
                    </div>

                    {/* DESIGNATION */}

                    <div
                      onPointerDown={(e) =>
                        startDrag(
                          "designation",
                          e
                        )
                      }
                      onPointerMove={(e) =>
                        moveElement(
                          "designation",
                          e
                        )
                      }
                      onPointerUp={
                        stopDrag
                      }
                      onPointerCancel={
                        stopDrag
                      }
                      onClick={() =>
                        selectElement(
                          "designation"
                        )
                      }
                      style={styleFor(
                        "designation"
                      )}
                      className={`flex items-center text-xs cursor-move ${
                        selected ===
                        "designation"
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                    >
                      ಹುದ್ದೆ:{" "}
                      {a.designation ||
                        "-"}
                    </div>

                    {/* VILLAGE */}

                    <div
                      onPointerDown={(e) =>
                        startDrag(
                          "village",
                          e
                        )
                      }
                      onPointerMove={(e) =>
                        moveElement(
                          "village",
                          e
                        )
                      }
                      onPointerUp={
                        stopDrag
                      }
                      onPointerCancel={
                        stopDrag
                      }
                      onClick={() =>
                        selectElement(
                          "village"
                        )
                      }
                      style={styleFor(
                        "village"
                      )}
                      className={`flex items-center text-xs cursor-move ${
                        selected ===
                        "village"
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                    >
                      ಗ್ರಾಮ:{" "}
                      {a.village ||
                        "-"}
                    </div>

                    {/* MOBILE */}

                    <div
                      onPointerDown={(e) =>
                        startDrag(
                          "mobile",
                          e
                        )
                      }
                      onPointerMove={(e) =>
                        moveElement(
                          "mobile",
                          e
                        )
                      }
                      onPointerUp={
                        stopDrag
                      }
                      onPointerCancel={
                        stopDrag
                      }
                      onClick={() =>
                        selectElement(
                          "mobile"
                        )
                      }
                      style={styleFor(
                        "mobile"
                      )}
                      className={`flex items-center text-xs cursor-move ${
                        selected ===
                        "mobile"
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                    >
                      ಮೊಬೈಲ್:{" "}
                      {a.mobile ||
                        "-"}
                    </div>

                    {/* MEMBER ID */}

                    <div
                      onPointerDown={(e) =>
                        startDrag(
                          "memberId",
                          e
                        )
                      }
                      onPointerMove={(e) =>
                        moveElement(
                          "memberId",
                          e
                        )
                      }
                      onPointerUp={
                        stopDrag
                      }
                      onPointerCancel={
                        stopDrag
                      }
                      onClick={() =>
                        selectElement(
                          "memberId"
                        )
                      }
                      style={styleFor(
                        "memberId"
                      )}
                      className={`flex items-center font-semibold text-xs cursor-move ${
                        selected ===
                        "memberId"
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                    >
                      Member ID:{" "}
                      {a.membership_no ||
                        "-"}
                    </div>

                    {/* FRONT QR */}

                    {qr && (
                      <div
                        onPointerDown={(e) =>
                          startDrag(
                            "frontQr",
                            e
                          )
                        }
                        onPointerMove={(e) =>
                          moveElement(
                            "frontQr",
                            e
                          )
                        }
                        onPointerUp={
                          stopDrag
                        }
                        onPointerCancel={
                          stopDrag
                        }
                        onClick={() =>
                          selectElement(
                            "frontQr"
                          )
                        }
                        style={styleFor(
                          "frontQr"
                        )}
                        className={`cursor-move ${
                          selected ===
                          "frontQr"
                            ? "ring-2 ring-blue-500 ring-offset-1"
                            : ""
                        }`}
                      >

                        <img
                          src={qr}
                          draggable={
                            false
                          }
                          className="w-full h-full pointer-events-none"
                          alt="QR"
                        />

                      </div>
                    )}

                  </div>

                </div>

              </div>
            )}

            {/* BACK */}

            {side === "back" && (
              <div>

                <p className="font-semibold mb-2">
                  Back — {width} × {height} mm
                </p>

                <div className="overflow-x-auto pb-4">

                  <div
                    ref={backRef}
                    className="relative overflow-hidden border rounded-xl select-none"
                    style={{
                      width: cardWidth,
                      height: cardHeight,
                      background:
                        "linear-gradient(135deg,#ffffff,#dbeafe)",
                    }}
                  >

                    {/* BACK HEADER */}

                    <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-blue-700 to-green-700 text-white flex items-center justify-center font-bold">
                      ನಮ್ಮ ಸಂಘಟನೆ — ನಮ್ಮ ಬಲ
                    </div>

                    {/* BACK TITLE */}

                    <div
                      onPointerDown={(e) =>
                        startDrag(
                          "backTitle",
                          e
                        )
                      }
                      onPointerMove={(e) =>
                        moveElement(
                          "backTitle",
                          e
                        )
                      }
                      onPointerUp={
                        stopDrag
                      }
                      onPointerCancel={
                        stopDrag
                      }
                      onClick={() =>
                        selectElement(
                          "backTitle"
                        )
                      }
                      style={styleFor(
                        "backTitle"
                      )}
                      className={`flex items-center justify-center text-center font-bold text-xl cursor-move ${
                        selected ===
                        "backTitle"
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                    >
                      ಅಧಿಕೃತ ಸದಸ್ಯತ್ವ ಕಾರ್ಡ್
                    </div>

                    {/* BACK TEXT */}

                    <div
                      onPointerDown={(e) =>
                        startDrag(
                          "backText",
                          e
                        )
                      }
                      onPointerMove={(e) =>
                        moveElement(
                          "backText",
                          e
                        )
                      }
                      onPointerUp={
                        stopDrag
                      }
                      onPointerCancel={
                        stopDrag
                      }
                      onClick={() =>
                        selectElement(
                          "backText"
                        )
                      }
                      style={styleFor(
                        "backText"
                      )}
                      className={`flex items-center justify-center text-center text-sm text-slate-600 leading-6 cursor-move ${
                        selected ===
                        "backText"
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                    >
                      ಈ ಕಾರ್ಡ್ ಸಂಸ್ಥೆಯ ಅಧಿಕೃತ
                      ಸದಸ್ಯತ್ವದ ಗುರುತಿಗಾಗಿ
                      ಬಳಸಲಾಗುತ್ತದೆ.
                    </div>

                    {/* BACK CONTACT */}

                    <div
                      onPointerDown={(e) =>
                        startDrag(
                          "backContact",
                          e
                        )
                      }
                      onPointerMove={(e) =>
                        moveElement(
                          "backContact",
                          e
                        )
                      }
                      onPointerUp={
                        stopDrag
                      }
                      onPointerCancel={
                        stopDrag
                      }
                      onClick={() =>
                        selectElement(
                          "backContact"
                        )
                      }
                      style={styleFor(
                        "backContact"
                      )}
                      className={`flex items-center justify-center text-center text-xs text-slate-500 cursor-move ${
                        selected ===
                        "backContact"
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                    >
                      Scan QR Code to verify
                      member information
                    </div>

                    {/* BACK QR */}

                    {qr && (
                      <div
                        onPointerDown={(e) =>
                          startDrag(
                            "backQr",
                            e
                          )
                        }
                        onPointerMove={(e) =>
                          moveElement(
                            "backQr",
                            e
                          )
                        }
                        onPointerUp={
                          stopDrag
                        }
                        onPointerCancel={
                          stopDrag
                        }
                        onClick={() =>
                          selectElement(
                            "backQr"
                          )
                        }
                        style={styleFor(
                          "backQr"
                        )}
                        className={`cursor-move ${
                          selected ===
                          "backQr"
                            ? "ring-2 ring-blue-500 ring-offset-1"
                            : ""
                        }`}
                      >

                        <img
                          src={qr}
                          draggable={
                            false
                          }
                          className="w-full h-full pointer-events-none"
                          alt="Back QR"
                        />

                      </div>
                    )}

                  </div>

                </div>

              </div>
            )}

          </div>

          {/* EDIT SECTION */}

          <aside className="bg-white rounded-3xl shadow p-5 xl:h-[calc(100vh-130px)] xl:overflow-y-auto">

            <h2 className="text-xl font-bold">
              🎨 Edit Section
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              ಈ section ಮಾತ್ರ scroll ಆಗುತ್ತದೆ.
            </p>

            {/* SIDE */}

            <div className="mt-5">

              <label className="text-sm font-semibold">
                Card Side
              </label>

              <div className="grid grid-cols-2 gap-2 mt-2">

                <button
                  onClick={() =>
                    setSide("front")
                  }
                  className={`p-3 rounded-xl ${
                    side === "front"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100"
                  }`}
                >
                  Front
                </button>

                <button
                  onClick={() =>
                    setSide("back")
                  }
                  className={`p-3 rounded-xl ${
                    side === "back"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100"
                  }`}
                >
                  Back
                </button>

              </div>

            </div>

            {/* CARD SIZE */}

            <div className="mt-6 border rounded-2xl p-4">

              <h3 className="font-bold">
                📐 Card Size
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                Width ಮತ್ತು Height manually ಹಾಕಬಹುದು.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-4">

                <div>

                  <label className="text-sm font-semibold">
                    Width (mm)
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="300"
                    value={width}
                    disabled={locked}
                    onChange={(e) =>
                      setWidth(
                        Number(
                          e.target.value
                        )
                      )
                    }
                    className="border rounded-xl p-3 w-full mt-2"
                  />

                </div>

                <div>

                  <label className="text-sm font-semibold">
                    Height (mm)
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="300"
                    value={height}
                    disabled={locked}
                    onChange={(e) =>
                      setHeight(
                        Number(
                          e.target.value
                        )
                      )
                    }
                    className="border rounded-xl p-3 w-full mt-2"
                  />

                </div>

              </div>

              <button
                onClick={
                  standardPVC
                }
                disabled={locked}
                className="w-full border rounded-xl p-3 mt-3"
              >
                Standard PVC
                <br />
                <span className="text-xs text-slate-500">
                  85.6 × 53.9 mm
                </span>
              </button>

              <button
                onClick={
                  applyCardSize
                }
                disabled={locked}
                className="w-full bg-blue-600 text-white rounded-xl p-3 mt-3 disabled:opacity-50"
              >
                Apply Card Size
              </button>

            </div>

            {/* ELEMENTS */}

            <div className="mt-6">

              <h3 className="font-bold">
                Elements
              </h3>

              <div className="grid grid-cols-2 gap-2 mt-3">

                {(Object.keys(
                  elementLabels
                ) as ElementKey[]).map(
                  (key) => (

                    <button
                      key={key}
                      onClick={() =>
                        selectElement(
                          key
                        )
                      }
                      className={`border rounded-xl p-3 text-left ${
                        selected ===
                        key
                          ? "border-blue-500 bg-blue-50"
                          : ""
                      }`}
                    >
                      {elementLabels[key]}
                    </button>

                  )
                )}

              </div>

            </div>

            {/* ELEMENT SIZE */}

            <div className="mt-6 border rounded-2xl p-4">

              <h3 className="font-bold">
                Selected Element
              </h3>

              <p className="text-sm text-blue-600 mt-1">
                {elementLabels[selected]}
              </p>

              <div className="grid grid-cols-2 gap-3 mt-4">

                <div>

                  <label className="text-xs text-slate-500">
                    Width (px)
                  </label>

                  <input
                    type="number"
                    value={Math.round(
                      layout[
                        selected
                      ].width
                    )}
                    disabled={locked}
                    onChange={(e) =>
                      changeElementWidth(
                        selected,
                        Number(
                          e.target.value
                        )
                      )
                    }
                    className="border rounded-xl p-3 w-full mt-1"
                  />

                </div>

                <div>

                  <label className="text-xs text-slate-500">
                    Height (px)
                  </label>

                  <input
                    type="number"
                    value={Math.round(
                      layout[
                        selected
                      ].height
                    )}
                    disabled={locked}
                    onChange={(e) =>
                      changeElementHeight(
                        selected,
                        Number(
                          e.target.value
                        )
                      )
                    }
                    className="border rounded-xl p-3 w-full mt-1"
                  />

                </div>

              </div>

              <div className="mt-4 text-xs text-slate-500">
                X:{" "}
                {Math.round(
                  layout[selected].x
                )}{" "}
                px
                {" • "}
                Y:{" "}
                {Math.round(
                  layout[selected].y
                )}{" "}
                px
              </div>

            </div>

            {/* ACTIONS */}

            <div className="mt-6 grid gap-3">

              <button
                onClick={
                  saveMaster
                }
                disabled={locked}
                className="bg-purple-600 text-white rounded-xl p-3 disabled:opacity-50"
              >
                💾 Save Master Template
              </button>

              <button
                onClick={
                  resetDesign
                }
                disabled={locked}
                className="border border-red-200 text-red-600 rounded-xl p-3 disabled:opacity-50"
              >
                ♻️ Reset Design
              </button>

              <button
                onClick={
                  generatePDF
                }
                className="bg-green-600 text-white rounded-xl p-3"
              >
                📄 Generate Front + Back PDF
              </button>

            </div>

            {/* STATUS */}

            <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-4">

              <h3 className="font-bold text-green-800">
                {locked
                  ? "🔒 Design Locked"
                  : "✏️ Editing Enabled"}
              </h3>

              <p className="text-sm text-green-700 mt-1">
                {locked
                  ? "Unlock ಮಾಡಿ ಮತ್ತೆ edit ಮಾಡಬಹುದು."
                  : "Front ಮತ್ತು Back ಎರಡರ elements drag ಮಾಡಬಹುದು."}
              </p>

            </div>

          </aside>

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
