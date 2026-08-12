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

type ElementType =
  | "text"
  | "image"
  | "member-photo"
  | "name"
  | "designation"
  | "village"
  | "mobile"
  | "member-id"
  | "qr";

type DesignElement = {
  id: string;
  type: ElementType;
  side: Side;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  src?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  align?: "left" | "center" | "right";
};

const DEFAULT_WIDTH = 85.6;
const DEFAULT_HEIGHT = 53.9;

const DESIGN_WIDTH = 430;
const DESIGN_HEIGHT = 270;

const defaultElements: DesignElement[] = [
  {
    id: "member-photo",
    type: "member-photo",
    side: "front",
    x: 18,
    y: 65,
    width: 80,
    height: 95,
  },
  {
    id: "name",
    type: "name",
    side: "front",
    x: 115,
    y: 70,
    width: 190,
    height: 28,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    align: "left",
  },
  {
    id: "designation",
    type: "designation",
    side: "front",
    x: 115,
    y: 105,
    width: 190,
    height: 25,
    fontSize: 11,
    color: "#374151",
    align: "left",
  },
  {
    id: "village",
    type: "village",
    side: "front",
    x: 115,
    y: 135,
    width: 190,
    height: 25,
    fontSize: 11,
    color: "#374151",
    align: "left",
  },
  {
    id: "mobile",
    type: "mobile",
    side: "front",
    x: 115,
    y: 165,
    width: 190,
    height: 25,
    fontSize: 11,
    color: "#374151",
    align: "left",
  },
  {
    id: "member-id",
    type: "member-id",
    side: "front",
    x: 115,
    y: 195,
    width: 190,
    height: 25,
    fontSize: 11,
    fontWeight: "700",
    color: "#111827",
    align: "left",
  },
  {
    id: "front-qr",
    type: "qr",
    side: "front",
    x: 335,
    y: 155,
    width: 65,
    height: 65,
  },
  {
    id: "back-title",
    type: "text",
    side: "back",
    x: 55,
    y: 70,
    width: 320,
    height: 35,
    text: "ಅಧಿಕೃತ ಸದಸ್ಯತ್ವ ಕಾರ್ಡ್",
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    align: "center",
  },
  {
    id: "back-description",
    type: "text",
    side: "back",
    x: 55,
    y: 120,
    width: 320,
    height: 65,
    text:
      "ಈ ಕಾರ್ಡ್ ಸಂಸ್ಥೆಯ ಅಧಿಕೃತ ಸದಸ್ಯತ್ವದ ಗುರುತಿಗಾಗಿ ಬಳಸಲಾಗುತ್ತದೆ.",
    fontSize: 12,
    color: "#475569",
    align: "center",
  },
  {
    id: "back-contact",
    type: "text",
    side: "back",
    x: 55,
    y: 195,
    width: 320,
    height: 30,
    text: "Scan QR Code to verify member information",
    fontSize: 9,
    color: "#64748b",
    align: "center",
  },
  {
    id: "back-qr",
    type: "qr",
    side: "back",
    x: 180,
    y: 225,
    width: 60,
    height: 60,
  },
];

function Card() {
  const params = useSearchParams();
  const id = params.get("id");

  const [member, setMember] =
    useState<any>(null);

  const [qr, setQr] = useState("");

  const [elements, setElements] =
    useState<DesignElement[]>(
      defaultElements
    );

  const [selectedId, setSelectedId] =
    useState("front-qr");

  const [side, setSide] =
    useState<Side>("front");

  const [locked, setLocked] =
    useState(false);

  const [cardWidth, setCardWidth] =
    useState(DEFAULT_WIDTH);

  const [cardHeight, setCardHeight] =
    useState(DEFAULT_HEIGHT);

  const [draggingId, setDraggingId] =
    useState<string | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const frontPdfRef =
    useRef<HTMLDivElement>(null);

  const backPdfRef =
    useRef<HTMLDivElement>(null);

  const dragStart = useRef({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  const previewScale =
    Math.min(
      1,
      DESIGN_WIDTH /
        Math.max(
          DESIGN_WIDTH,
          DESIGN_WIDTH
        )
    );

  /*
   * LOAD MEMBER
   */

  useEffect(() => {
    async function load() {
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

      setMember(data);

      if (!data) return;

      const publicPageUrl =
        `${window.location.origin}/public-page?id=${data.id}`;

      try {
        const qrData =
          await QRCode.toDataURL(
            publicPageUrl,
            {
              width: 500,
              margin: 2,
            }
          );

        setQr(qrData);
      } catch (error) {
        console.error(
          "QR error",
          error
        );
      }

      try {
        const saved =
          localStorage.getItem(
            `pvc-complete-design-${data.id}`
          );

        if (saved) {
          const parsed =
            JSON.parse(saved);

          if (
            Array.isArray(
              parsed.elements
            )
          ) {
            setElements(
              parsed.elements
            );
          }

          if (
            typeof parsed.width ===
            "number"
          ) {
            setCardWidth(
              parsed.width
            );
          }

          if (
            typeof parsed.height ===
            "number"
          ) {
            setCardHeight(
              parsed.height
            );
          }
        }
      } catch (error) {
        console.error(
          "Saved design error",
          error
        );
      }
    }

    load();
  }, [id]);

  /*
   * SELECTED ELEMENT
   */

  const selected =
    elements.find(
      (e) => e.id === selectedId
    ) || null;

  /*
   * SAVE
   */

  function saveMaster() {
    if (!member?.id) return;

    localStorage.setItem(
      `pvc-complete-design-${member.id}`,
      JSON.stringify({
        elements,
        width: cardWidth,
        height: cardHeight,
      })
    );

    alert(
      "Master Design saved successfully."
    );
  }

  /*
   * RESET
   */

  function resetDesign() {
    if (locked) return;

    setElements(
      defaultElements.map(
        (e) => ({ ...e })
      )
    );

    setCardWidth(
      DEFAULT_WIDTH
    );

    setCardHeight(
      DEFAULT_HEIGHT
    );

    setSelectedId("front-qr");
    setSide("front");
  }

  /*
   * SELECT
   */

  function selectElement(
    element: DesignElement
  ) {
    setSelectedId(
      element.id
    );

    setSide(
      element.side
    );
  }

  /*
   * DRAG START
   */

  function startDrag(
    element: DesignElement,
    e: React.PointerEvent<HTMLDivElement>
  ) {
    if (locked) return;

    e.preventDefault();
    e.stopPropagation();

    setSelectedId(
      element.id
    );

    setDraggingId(
      element.id
    );

    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: element.x,
      startY: element.y,
    };

    e.currentTarget.setPointerCapture(
      e.pointerId
    );
  }

  /*
   * DRAG MOVE
   */

  function moveDrag(
    element: DesignElement,
    e: React.PointerEvent<HTMLDivElement>
  ) {
    if (
      locked ||
      draggingId !== element.id
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
      dragStart.current.startX +
      dx;

    let y =
      dragStart.current.startY +
      dy;

    x = Math.max(
      0,
      Math.min(
        x,
        DESIGN_WIDTH -
          element.width
      )
    );

    y = Math.max(
      0,
      Math.min(
        y,
        DESIGN_HEIGHT -
          element.height
      )
    );

    setElements((old) =>
      old.map((item) =>
        item.id === element.id
          ? {
              ...item,
              x,
              y,
            }
          : item
      )
    );
  }

  /*
   * DRAG END
   */

  function stopDrag(
    e: React.PointerEvent<HTMLDivElement>
  ) {
    setDraggingId(null);

    try {
      e.currentTarget.releasePointerCapture(
        e.pointerId
      );
    } catch {}
  }

  /*
   * UPDATE ELEMENT
   */

  function updateSelected(
    patch: Partial<DesignElement>
  ) {
    if (
      locked ||
      !selected
    ) {
      return;
    }

    setElements((old) =>
      old.map((item) =>
        item.id === selected.id
          ? {
              ...item,
              ...patch,
            }
          : item
      )
    );
  }

  /*
   * DELETE
   */

  function deleteSelected() {
    if (
      locked ||
      !selected
    ) {
      return;
    }

    setElements((old) =>
      old.filter(
        (item) =>
          item.id !==
          selected.id
      )
    );

    const remaining =
      elements.filter(
        (item) =>
          item.id !==
          selected.id
      );

    setSelectedId(
      remaining[0]?.id ||
        ""
    );
  }

  /*
   * ADD TEXT
   */

  function addText() {
    if (locked) return;

    const id =
      `text-${Date.now()}`;

    const newElement:
      DesignElement = {
      id,
      type: "text",
      side,
      x: 70,
      y: 75,
      width: 280,
      height: 45,
      text: "ಹೊಸ Text",
      fontSize: 14,
      fontWeight: "400",
      color: "#111827",
      align: "center",
    };

    setElements((old) => [
      ...old,
      newElement,
    ]);

    setSelectedId(id);
  }

  /*
   * ADD IMAGE
   */

  async function addImage(
    file: File
  ) {
    if (locked) return;

    setUploading(true);

    try {
      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        alert(
          "Image file ಮಾತ್ರ select ಮಾಡಿ."
        );

        return;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        alert(
          "Image 5MBಗಿಂತ ಕಡಿಮೆ ಇರಬೇಕು."
        );

        return;
      }

      const reader =
        new FileReader();

      reader.onload = () => {
        const src =
          reader.result as string;

        const id =
          `image-${Date.now()}`;

        const newElement:
          DesignElement = {
          id,
          type: "image",
          side,
          x: 120,
          y: 80,
          width: 100,
          height: 80,
          src,
        };

        setElements(
          (old) => [
            ...old,
            newElement,
          ]
        );

        setSelectedId(id);
      };

      reader.readAsDataURL(
        file
      );
    } finally {
      setUploading(false);
    }
  }

  /*
   * ADD QR
   */

  function addQR() {
    if (
      locked ||
      !qr
    ) {
      return;
    }

    const id =
      `qr-${side}-${Date.now()}`;

    const newElement:
      DesignElement = {
      id,
      type: "qr",
      side,
      x: 170,
      y: 170,
      width: 65,
      height: 65,
    };

    setElements((old) => [
      ...old,
      newElement,
    ]);

    setSelectedId(id);
  }

  /*
   * CARD SIZE
   */

  function applySize() {
    if (locked) return;

    if (
      cardWidth < 20 ||
      cardHeight < 20 ||
      cardWidth > 300 ||
      cardHeight > 300
    ) {
      alert(
        "Width / Height 20mm ರಿಂದ 300mm ಒಳಗೆ ಇರಬೇಕು."
      );

      return;
    }

    setCardWidth(
      Number(
        cardWidth.toFixed(1)
      )
    );

    setCardHeight(
      Number(
        cardHeight.toFixed(1)
      )
    );
  }

  function standardPVC() {
    if (locked) return;

    setCardWidth(
      DEFAULT_WIDTH
    );

    setCardHeight(
      DEFAULT_HEIGHT
    );
  }

  /*
   * PDF
   */

  async function generatePDF() {
    if (
      !frontPdfRef.current ||
      !backPdfRef.current ||
      !member
    ) {
      alert(
        "Card preview ಇನ್ನೂ ready ಆಗಿಲ್ಲ."
      );

      return;
    }

    try {
      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            500
          )
      );

      const frontCanvas =
        await html2canvas(
          frontPdfRef.current,
          {
            scale: 3,
            useCORS: true,
            allowTaint: true,
            backgroundColor:
              "#ffffff",
            logging: false,
            imageTimeout: 20000,
          }
        );

      const backCanvas =
        await html2canvas(
          backPdfRef.current,
          {
            scale: 3,
            useCORS: true,
            allowTaint: true,
            backgroundColor:
              "#ffffff",
            logging: false,
            imageTimeout: 20000,
          }
        );

      const frontImage =
        frontCanvas.toDataURL(
          "image/png"
        );

      const backImage =
        backCanvas.toDataURL(
          "image/png"
        );

      const pdf =
        new jsPDF({
          orientation:
            cardWidth >=
            cardHeight
              ? "landscape"
              : "portrait",

          unit: "mm",

          format: [
            cardWidth,
            cardHeight,
          ],

          compress: true,
        });

      pdf.addImage(
        frontImage,
        "PNG",
        0,
        0,
        cardWidth,
        cardHeight
      );

      pdf.addPage(
        [
          cardWidth,
          cardHeight,
        ],
        cardWidth >=
        cardHeight
          ? "landscape"
          : "portrait"
      );

      pdf.addImage(
        backImage,
        "PNG",
        0,
        0,
        cardWidth,
        cardHeight
      );

      pdf.save(
        `${member.membership_no || "member"}-PVC.pdf`
      );

    } catch (error) {
      console.error(
        "PDF ERROR",
        error
      );

      alert(
        "PDF generate ಆಗಲಿಲ್ಲ. Consoleನಲ್ಲಿ PDF ERROR check ಮಾಡಿ."
      );
    }
  }

  /*
   * RENDER ELEMENT
   */

  function renderElement(
    element: DesignElement,
    pdfMode = false
  ) {
    const isSelected =
      selectedId ===
      element.id &&
      !pdfMode;

    const commonStyle = {
      position:
        "absolute" as const,
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      zIndex:
        isSelected
          ? 100
          : 10,
      touchAction:
        "none" as const,
      border:
        isSelected
          ? "2px solid #2563eb"
          : "none",
      overflow: "hidden" as const,
    };

    const contentStyle = {
      width: "100%",
      height: "100%",
      fontSize:
        element.fontSize ||
        12,
      fontWeight:
        element.fontWeight ||
        "400",
      color:
        element.color ||
        "#111827",
      textAlign:
        element.align ||
        "left",
      display:
        "flex",
      alignItems:
        "center",
      justifyContent:
        element.align ===
        "right"
          ? "flex-end"
          : element.align ===
            "center"
          ? "center"
          : "flex-start",
      whiteSpace:
        "pre-wrap" as const,
    };

    function content() {
      if (
        element.type ===
        "member-photo"
      ) {
        return member?.photo_url ? (
          <img
            src={
              member.photo_url
            }
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
            alt="Member"
          />
        ) : (
          <div className="w-full h-full grid place-items-center bg-slate-200 text-slate-400">
            Photo
          </div>
        );
      }

      if (
        element.type ===
        "image"
      ) {
        return element.src ? (
          <img
            src={element.src}
            className="w-full h-full object-contain"
            alt=""
          />
        ) : null;
      }

      if (
        element.type ===
        "qr"
      ) {
        return qr ? (
          <img
            src={qr}
            className="w-full h-full object-contain"
            alt="QR"
          />
        ) : null;
      }

      if (
        element.type ===
        "name"
      ) {
        return (
          <div
            style={
              contentStyle
            }
          >
            ಹೆಸರು:{" "}
            {member?.name ||
              "-"}
          </div>
        );
      }

      if (
        element.type ===
        "designation"
      ) {
        return (
          <div
            style={
              contentStyle
            }
          >
            ಹುದ್ದೆ:{" "}
            {member?.designation ||
              "-"}
          </div>
        );
      }

      if (
        element.type ===
        "village"
      ) {
        return (
          <div
            style={
              contentStyle
            }
          >
            ಗ್ರಾಮ:{" "}
            {member?.village ||
              "-"}
          </div>
        );
      }

      if (
        element.type ===
        "mobile"
      ) {
        return (
          <div
            style={
              contentStyle
            }
          >
            ಮೊಬೈಲ್:{" "}
            {member?.mobile ||
              "-"}
          </div>
        );
      }

      if (
        element.type ===
        "member-id"
      ) {
        return (
          <div
            style={
              contentStyle
            }
          >
            Member ID:{" "}
            {member?.membership_no ||
              "-"}
          </div>
        );
      }

      return (
        <div
          style={
            contentStyle
          }
        >
          {element.text ||
            ""}
        </div>
      );
    }

    return (
      <div
        key={element.id}
        style={commonStyle}
        onPointerDown={(e) =>
          !pdfMode &&
          startDrag(
            element,
            e
          )
        }
        onPointerMove={(e) =>
          !pdfMode &&
          moveDrag(
            element,
            e
          )
        }
        onPointerUp={(e) =>
          !pdfMode &&
          stopDrag(e)
        }
        onPointerCancel={(e) =>
          !pdfMode &&
          stopDrag(e)
        }
        onClick={(e) => {
          if (pdfMode)
            return;

          e.stopPropagation();

          selectElement(
            element
          );
        }}
        className={
          !pdfMode
            ? "cursor-move"
            : ""
        }
      >
        {content()}
      </div>
    );
  }

  /*
   * CARD RENDER
   */

  function renderCard(
    cardSide: Side,
    pdfMode = false
  ) {
    const sideElements =
      elements.filter(
        (element) =>
          element.side ===
          cardSide
      );

    return (
      <div
        className="relative overflow-hidden border bg-white"
        style={{
          width:
            DESIGN_WIDTH,
          height:
            DESIGN_HEIGHT,
          background:
            cardSide ===
            "front"
              ? "linear-gradient(135deg,#ffffff 35%,#dcfce7)"
              : "linear-gradient(135deg,#ffffff,#dbeafe)",
          borderRadius:
            pdfMode
              ? 0
              : 12,
        }}
      >
        {/* HEADER */}

        <div
          className={`absolute top-0 left-0 right-0 h-12 flex items-center justify-center font-bold text-white ${
            cardSide ===
            "front"
              ? "bg-gradient-to-r from-green-700 to-blue-700"
              : "bg-gradient-to-r from-blue-700 to-green-700"
          }`}
        >
          {cardSide ===
          "front"
            ? "ಸಂಸ್ಥೆ ಸದಸ್ಯತ್ವ ಕಾರ್ಡ್"
            : "ನಮ್ಮ ಸಂಘಟನೆ — ನಮ್ಮ ಬಲ"}
        </div>

        {/* ELEMENTS */}

        {sideElements.map(
          (element) =>
            renderElement(
              element,
              pdfMode
            )
        )}
      </div>
    );
  }

  if (!member) {
    return (
      <main className="min-h-screen bg-slate-100 grid place-items-center p-10">
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <h1 className="text-xl font-bold">
            Member loading...
          </h1>
        </div>
      </main>
    );
  }

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
              Canva-style Front & Back Designer
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            <button
              onClick={() =>
                setLocked(
                  !locked
                )
              }
              className="px-4 py-2 rounded-xl bg-slate-900 text-white"
            >
              {locked
                ? "🔓 Unlock Design"
                : "🔒 Lock Design"}
            </button>

            <button
              onClick={
                saveMaster
              }
              disabled={locked}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white disabled:opacity-50"
            >
              💾 Save Master
            </button>

            <button
              onClick={
                generatePDF
              }
              className="px-4 py-2 rounded-xl bg-green-600 text-white"
            >
              📄 Generate PDF
            </button>

          </div>

        </div>

        {/* MAIN */}

        <div className="grid xl:grid-cols-[1fr_390px] gap-6 items-start">

          {/* PREVIEW */}

          <section className="bg-white rounded-3xl shadow p-5">

            <div className="flex gap-2 mb-5">

              <button
                onClick={() =>
                  setSide("front")
                }
                className={`px-5 py-2 rounded-xl font-semibold ${
                  side ===
                  "front"
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
                  side ===
                  "back"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100"
                }`}
              >
                Back
              </button>

            </div>

            <div className="overflow-x-auto pb-4">

              {renderCard(
                side
              )}

            </div>

            <p className="text-sm text-slate-500 mt-2">
              Card element click ಮಾಡಿ drag
              ಮಾಡಿ position ಬದಲಾಯಿಸಿ.
            </p>

          </section>

          {/* EDIT PANEL */}

          <aside className="bg-white rounded-3xl shadow p-5 xl:h-[calc(100vh-130px)] xl:overflow-y-auto">

            <h2 className="text-xl font-bold">
              🎨 Edit Section
            </h2>

            {/* SIDE */}

            <div className="mt-5 grid grid-cols-2 gap-2">

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

            {/* CARD SIZE */}

            <div className="mt-5 border rounded-2xl p-4">

              <h3 className="font-bold">
                📐 PVC Card Size
              </h3>

              <div className="grid grid-cols-2 gap-3 mt-3">

                <div>
                  <label className="text-xs font-semibold">
                    Width (mm)
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    value={
                      cardWidth
                    }
                    disabled={
                      locked
                    }
                    onChange={(e) =>
                      setCardWidth(
                        Number(
                          e.target
                            .value
                        )
                      )
                    }
                    className="border rounded-xl p-3 w-full mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold">
                    Height (mm)
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    value={
                      cardHeight
                    }
                    disabled={
                      locked
                    }
                    onChange={(e) =>
                      setCardHeight(
                        Number(
                          e.target
                            .value
                        )
                      )
                    }
                    className="border rounded-xl p-3 w-full mt-1"
                  />
                </div>

              </div>

              <button
                onClick={
                  standardPVC
                }
                disabled={
                  locked
                }
                className="w-full border rounded-xl p-3 mt-3"
              >
                Standard PVC
                <br />
                <span className="text-xs">
                  85.6 × 53.9 mm
                </span>
              </button>

              <button
                onClick={
                  () => {
                    if (
                      cardWidth <
                        20 ||
                      cardHeight <
                        20
                    ) {
                      alert(
                        "Invalid size"
                      );
                      return;
                    }

                    alert(
                      `Card size: ${cardWidth} × ${cardHeight} mm`
                    );
                  }
                }
                disabled={
                  locked
                }
                className="w-full bg-blue-600 text-white rounded-xl p-3 mt-3"
              >
                Apply Size
              </button>

            </div>

            {/* ADD ELEMENTS */}

            <div className="mt-5 border rounded-2xl p-4">

              <h3 className="font-bold">
                ➕ Add Elements
              </h3>

              <button
                onClick={
                  addText
                }
                disabled={
                  locked
                }
                className="w-full border rounded-xl p-3 mt-3 text-left"
              >
                ✏️ Add Text
              </button>

              <label className="block w-full border rounded-xl p-3 mt-2 cursor-pointer">

                🖼️{" "}
                {uploading
                  ? "Adding..."
                  : "Add Image"}

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={
                    locked
                  }
                  onChange={(e) => {
                    const file =
                      e.target
                        .files?.[0];

                    if (file) {
                      addImage(
                        file
                      );
                    }

                    e.currentTarget.value =
                      "";
                  }}
                />

              </label>

              <button
                onClick={
                  addQR
                }
                disabled={
                  locked ||
                  !qr
                }
                className="w-full border rounded-xl p-3 mt-2 text-left"
              >
                🔳 Add QR Code
              </button>

            </div>

            {/* SELECTED ELEMENT */}

            {selected && (
              <div className="mt-5 border rounded-2xl p-4">

                <div className="flex justify-between items-center">

                  <div>
                    <h3 className="font-bold">
                      Selected Element
                    </h3>

                    <p className="text-sm text-blue-600">
                      {selected.type}
                    </p>
                  </div>

                  <button
                    onClick={
                      deleteSelected
                    }
                    disabled={
                      locked
                    }
                    className="bg-red-600 text-white px-3 py-2 rounded-lg disabled:opacity-50"
                  >
                    🗑️ Delete
                  </button>

                </div>

                {/* TEXT EDIT */}

                {selected.type ===
                  "text" && (
                  <div className="mt-4">

                    <label className="text-sm font-semibold">
                      Text
                    </label>

                    <textarea
                      value={
                        selected.text ||
                        ""
                      }
                      disabled={
                        locked
                      }
                      onChange={(e) =>
                        updateSelected({
                          text:
                            e.target
                              .value,
                        })
                      }
                      className="border rounded-xl p-3 w-full mt-2 min-h-24"
                    />

                  </div>
                )}

                {/* IMAGE */}

                {selected.type ===
                  "image" && (
                  <p className="text-sm text-slate-500 mt-4">
                    ಈ image ಅನ್ನು drag ಮಾಡಿ
                    position ಬದಲಾಯಿಸಬಹುದು.
                  </p>
                )}

                {/* SIZE */}

                <div className="grid grid-cols-2 gap-3 mt-4">

                  <div>

                    <label className="text-xs font-semibold">
                      Width
                    </label>

                    <input
                      type="number"
                      value={Math.round(
                        selected.width
                      )}
                      disabled={
                        locked
                      }
                      onChange={(e) =>
                        updateSelected({
                          width:
                            Number(
                              e.target
                                .value
                            ),
                        })
                      }
                      className="border rounded-xl p-3 w-full mt-1"
                    />

                  </div>

                  <div>

                    <label className="text-xs font-semibold">
                      Height
                    </label>

                    <input
                      type="number"
                      value={Math.round(
                        selected.height
                      )}
                      disabled={
                        locked
                      }
                      onChange={(e) =>
                        updateSelected({
                          height:
                            Number(
                              e.target
                                .value
                            ),
                        })
                      }
                      className="border rounded-xl p-3 w-full mt-1"
                    />

                  </div>

                </div>

                {/* FONT */}

                {(selected.type ===
                  "text" ||
                  selected.type ===
                    "name" ||
                  selected.type ===
                    "designation" ||
                  selected.type ===
                    "village" ||
                  selected.type ===
                    "mobile" ||
                  selected.type ===
                    "member-id") && (
                  <>

                    <div className="mt-4">

                      <label className="text-xs font-semibold">
                        Font Size
                      </label>

                      <input
                        type="number"
                        min="6"
                        max="60"
                        value={
                          selected.fontSize ||
                          12
                        }
                        disabled={
                          locked
                        }
                        onChange={(e) =>
                          updateSelected({
                            fontSize:
                              Number(
                                e.target
                                  .value
                              ),
                          })
                        }
                        className="border rounded-xl p-3 w-full mt-1"
                      />

                    </div>

                    <div className="mt-4">

                      <label className="text-xs font-semibold">
                        Text Color
                      </label>

                      <input
                        type="color"
                        value={
                          selected.color ||
                          "#111827"
                        }
                        disabled={
                          locked
                        }
                        onChange={(e) =>
                          updateSelected({
                            color:
                              e.target
                                .value,
                          })
                        }
                        className="w-full h-12 mt-1"
                      />

                    </div>

                    <div className="mt-4">

                      <label className="text-xs font-semibold">
                        Alignment
                      </label>

                      <select
                        value={
                          selected.align ||
                          "left"
                        }
                        disabled={
                          locked
                        }
                        onChange={(e) =>
                          updateSelected({
                            align:
                              e.target
                                .value as
                                | "left"
                                | "center"
                                | "right",
                          })
                        }
                        className="border rounded-xl p-3 w-full mt-1"
                      >
                        <option value="left">
                          Left
                        </option>

                        <option value="center">
                          Center
                        </option>

                        <option value="right">
                          Right
                        </option>
                      </select>

                    </div>

                  </>
                )}

              </div>
            )}

            {/* EXISTING ELEMENTS */}

            <div className="mt-5">

              <h3 className="font-bold">
                📋 {side === "front"
                  ? "Front"
                  : "Back"} Elements
              </h3>

              <div className="grid gap-2 mt-3">

                {elements
                  .filter(
                    (e) =>
                      e.side ===
                      side
                  )
                  .map(
                    (element) => (

                      <button
                        key={
                          element.id
                        }
                        onClick={() =>
                          selectElement(
                            element
                          )
                        }
                        className={`border rounded-xl p-3 text-left ${
                          selectedId ===
                          element.id
                            ? "border-blue-500 bg-blue-50"
                            : ""
                        }`}
                      >

                        {element.type ===
                          "text" &&
                          "✏️ "}

                        {element.type ===
                          "image" &&
                          "🖼️ "}

                        {element.type ===
                          "member-photo" &&
                          "👤 "}

                        {element.type ===
                          "qr" &&
                          "🔳 "}

                        {element.type ===
                          "name" &&
                          "Name"}

                        {element.type ===
                          "designation" &&
                          "Designation"}

                        {element.type ===
                          "village" &&
                          "Village"}

                        {element.type ===
                          "mobile" &&
                          "Mobile"}

                        {element.type ===
                          "member-id" &&
                          "Member ID"}

                        {element.text ||
                          ""}

                      </button>

                    )
                  )}

              </div>

            </div>

            {/* ACTIONS */}

            <div className="mt-6 grid gap-3">

              <button
                onClick={
                  saveMaster
                }
                disabled={
                  locked
                }
                className="bg-purple-600 text-white rounded-xl p-3 disabled:opacity-50"
              >
                💾 Save Master Template
              </button>

              <button
                onClick={
                  resetDesign
                }
                disabled={
                  locked
                }
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

            <div className="mt-5 bg-blue-50 border border-blue-200 rounded-2xl p-4">

              <h3 className="font-bold text-blue-800">
                💡 Designer
              </h3>

              <p className="text-sm text-blue-700 mt-1">
                Cardನಲ್ಲಿ element select ಮಾಡಿ
                drag ಮಾಡಿ. Text element select
                ಮಾಡಿದ ನಂತರ Edit Sectionನಲ್ಲಿ
                text ಬದಲಾಯಿಸಬಹುದು.
              </p>

            </div>

          </aside>

        </div>

        {/* PDF RENDER AREA
            ALWAYS MOUNTED
            IMPORTANT FOR PDF
        */}

        <div
          style={{
            position:
              "fixed",
            left:
              "-10000px",
            top:
              "0",
            width:
              DESIGN_WIDTH,
            pointerEvents:
              "none",
          }}
          aria-hidden="true"
        >

          <div
            ref={frontPdfRef}
            style={{
              width:
                DESIGN_WIDTH,
              height:
                DESIGN_HEIGHT,
            }}
          >
            {renderCard(
              "front",
              true
            )}
          </div>

          <div
            ref={backPdfRef}
            style={{
              width:
                DESIGN_WIDTH,
              height:
                DESIGN_HEIGHT,
              marginTop:
                20,
            }}
          >
            {renderCard(
              "back",
              true
            )}
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
