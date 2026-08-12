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

type ElementType = "text" | "image";

type CardElement = {
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
  background?: string;
  textAlign?: "left" | "center" | "right";
  radius?: number;
};

type DragState = {
  id: string;
  mouseX: number;
  mouseY: number;
  startX: number;
  startY: number;
};

function CardDesigner() {
  const params = useSearchParams();
  const id = params.get("id");

  const [member, setMember] =
    useState<any>(null);

  const [qr, setQr] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [locked, setLocked] =
    useState(false);

  const [side, setSide] =
    useState<Side>("front");

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [draggingId, setDraggingId] =
    useState<string | null>(null);

  const [cardWidth, setCardWidth] =
    useState(85.6);

  const [cardHeight, setCardHeight] =
    useState(53.9);

  const [widthInput, setWidthInput] =
    useState("85.6");

  const [heightInput, setHeightInput] =
    useState("53.9");

  const [elements, setElements] =
    useState<CardElement[]>([]);

  const [message, setMessage] =
    useState("");

  const [generating, setGenerating] =
    useState(false);

  const frontPreviewRef =
    useRef<HTMLDivElement>(null);

  const backPreviewRef =
    useRef<HTMLDivElement>(null);

  const frontPdfRef =
    useRef<HTMLDivElement>(null);

  const backPdfRef =
    useRef<HTMLDivElement>(null);

  const dragRef =
    useRef<DragState | null>(null);

  /*
   * Display size.
   * 85.6mm card => 430px approximately.
   */
  const PX_PER_MM = 5;

  const displayWidth =
    cardWidth * PX_PER_MM;

  const displayHeight =
    cardHeight * PX_PER_MM;

  /* --------------------------------
     DEFAULT ELEMENTS
  -------------------------------- */

  function createDefaultElements(
    data: any
  ): CardElement[] {
    return [
      {
        id: "front-heading",
        type: "text",
        side: "front",
        x: 0,
        y: 0,
        width: displayWidth,
        height: 55,
        text: "ಸಂಸ್ಥೆ ಸದಸ್ಯತ್ವ ಕಾರ್ಡ್",
        fontSize: 20,
        fontWeight: "700",
        color: "#ffffff",
        background:
          "linear-gradient(90deg,#15803d,#2563eb)",
        textAlign: "center",
        radius: 0,
      },

      {
        id: "front-name",
        type: "text",
        side: "front",
        x: 110,
        y: 75,
        width: 180,
        height: 30,
        text: `ಹೆಸರು: ${
          data?.name || "-"
        }`,
        fontSize: 13,
        fontWeight: "600",
        color: "#111827",
        textAlign: "left",
      },

      {
        id: "front-designation",
        type: "text",
        side: "front",
        x: 110,
        y: 108,
        width: 180,
        height: 30,
        text: `ಹುದ್ದೆ: ${
          data?.designation || "-"
        }`,
        fontSize: 13,
        fontWeight: "500",
        color: "#111827",
        textAlign: "left",
      },

      {
        id: "front-village",
        type: "text",
        side: "front",
        x: 110,
        y: 141,
        width: 180,
        height: 30,
        text: `ಗ್ರಾಮ: ${
          data?.village || "-"
        }`,
        fontSize: 13,
        fontWeight: "500",
        color: "#111827",
        textAlign: "left",
      },

      {
        id: "front-mobile",
        type: "text",
        side: "front",
        x: 110,
        y: 174,
        width: 180,
        height: 30,
        text: `ಮೊಬೈಲ್: ${
          data?.mobile || "-"
        }`,
        fontSize: 13,
        fontWeight: "500",
        color: "#111827",
        textAlign: "left",
      },

      {
        id: "front-member-id",
        type: "text",
        side: "front",
        x: 110,
        y: 207,
        width: 180,
        height: 30,
        text: `Member ID: ${
          data?.membership_no || "-"
        }`,
        fontSize: 13,
        fontWeight: "700",
        color: "#111827",
        textAlign: "left",
      },

      {
        id: "front-photo",
        type: "image",
        side: "front",
        x: 20,
        y: 75,
        width: 75,
        height: 110,
        src:
          data?.photo_url || "",
        radius: 10,
      },

      {
        id: "back-heading",
        type: "text",
        side: "back",
        x: 0,
        y: 0,
        width: displayWidth,
        height: 55,
        text: "ನಮ್ಮ ಸಂಘಟನೆ — ನಮ್ಮ ಬಲ",
        fontSize: 20,
        fontWeight: "700",
        color: "#ffffff",
        background:
          "linear-gradient(90deg,#2563eb,#15803d)",
        textAlign: "center",
        radius: 0,
      },

      {
        id: "back-info",
        type: "text",
        side: "back",
        x: 35,
        y: 90,
        width: displayWidth - 70,
        height: 70,
        text:
          "ಈ ಸದಸ್ಯತ್ವ ಕಾರ್ಡ್ ಅಧಿಕೃತ ಸದಸ್ಯತ್ವದ ಗುರುತಾಗಿದೆ.",
        fontSize: 14,
        fontWeight: "500",
        color: "#111827",
        textAlign: "center",
      },

      {
        id: "back-contact",
        type: "text",
        side: "back",
        x: 35,
        y: 175,
        width: displayWidth - 70,
        height: 50,
        text:
          "ಸಂಪರ್ಕಕ್ಕಾಗಿ ಸಂಸ್ಥೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ.",
        fontSize: 12,
        fontWeight: "500",
        color: "#475569",
        textAlign: "center",
      },
    ];
  }

  /* --------------------------------
     LOAD MEMBER
  -------------------------------- */

  useEffect(() => {
    async function loadMember() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const {
          data,
          error,
        } = await supabase
          .from("applications")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error(error);
          setMessage(
            "Member information load ಆಗಲಿಲ್ಲ."
          );
          setLoading(false);
          return;
        }

        setMember(data);

        /*
         * QR points to public member page.
         */
        const publicPageUrl =
          `${window.location.origin}/public-page?id=${data.id}`;

        const qrImage =
          await QRCode.toDataURL(
            publicPageUrl,
            {
              width: 500,
              margin: 2,
            }
          );

        setQr(qrImage);

        /*
         * Load saved designer data.
         */
        try {
          const saved =
            localStorage.getItem(
              `pvc-designer-${data.id}`
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
            } else {
              setElements(
                createDefaultElements(
                  data
                )
              );
            }

            if (
              typeof parsed.width ===
              "number"
            ) {
              setCardWidth(
                parsed.width
              );
              setWidthInput(
                String(parsed.width)
              );
            }

            if (
              typeof parsed.height ===
              "number"
            ) {
              setCardHeight(
                parsed.height
              );
              setHeightInput(
                String(parsed.height)
              );
            }
          } else {
            setElements(
              createDefaultElements(
                data
              )
            );
          }
        } catch {
          setElements(
            createDefaultElements(
              data
            )
          );
        }
      } catch (error) {
        console.error(error);
        setMessage(
          "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMember();
  }, [id]);

  /* --------------------------------
     SAVE DESIGN LOCALLY
  -------------------------------- */

  useEffect(() => {
    if (!member?.id) return;
    if (!elements.length) return;

    localStorage.setItem(
      `pvc-designer-${member.id}`,
      JSON.stringify({
        elements,
        width: cardWidth,
        height: cardHeight,
      })
    );
  }, [
    elements,
    cardWidth,
    cardHeight,
    member?.id,
  ]);

  /* --------------------------------
     UPDATE ELEMENT
  -------------------------------- */

  function updateElement(
    elementId: string,
    patch: Partial<CardElement>
  ) {
    if (locked) return;

    setElements((old) =>
      old.map((el) =>
        el.id === elementId
          ? {
              ...el,
              ...patch,
            }
          : el
      )
    );
  }

  /* --------------------------------
     DELETE ELEMENT
  -------------------------------- */

  function deleteElement(
    elementId: string
  ) {
    if (locked) return;

    setElements((old) =>
      old.filter(
        (el) =>
          el.id !== elementId
      )
    );

    setSelectedId(null);
  }

  /* --------------------------------
     ADD TEXT
  -------------------------------- */

  function addText() {
    if (locked) return;

    const newElement: CardElement = {
      id:
        "text-" +
        Date.now(),

      type: "text",
      side,

      x: 60,
      y: 100,

      width: 220,
      height: 45,

      text: "ಹೊಸ Text",

      fontSize: 16,
      fontWeight: "500",

      color: "#111827",

      textAlign: "center",

      radius: 6,
    };

    setElements((old) => [
      ...old,
      newElement,
    ]);

    setSelectedId(
      newElement.id
    );
  }

  /* --------------------------------
     ADD IMAGE
  -------------------------------- */

  function addImage(
    file: File
  ) {
    if (locked) return;

    const reader =
      new FileReader();

    reader.onload = () => {
      const newElement: CardElement =
        {
          id:
            "image-" +
            Date.now(),

          type: "image",

          side,

          x: 80,
          y: 100,

          width: 120,
          height: 100,

          src:
            String(
              reader.result
            ),

          radius: 8,
        };

      setElements(
        (old) => [
          ...old,
          newElement,
        ]
      );

      setSelectedId(
        newElement.id
      );
    };

    reader.readAsDataURL(file);
  }

  /* --------------------------------
     DRAG ELEMENT
  -------------------------------- */

  function startDrag(
    e: React.PointerEvent<HTMLDivElement>,
    element: CardElement
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

    dragRef.current = {
      id: element.id,

      mouseX:
        e.clientX,

      mouseY:
        e.clientY,

      startX:
        element.x,

      startY:
        element.y,
    };

    e.currentTarget.setPointerCapture(
      e.pointerId
    );
  }

  function moveDrag(
    e: React.PointerEvent<HTMLDivElement>
  ) {
    if (
      locked ||
      !dragRef.current
    ) {
      return;
    }

    const drag =
      dragRef.current;

    const dx =
      e.clientX -
      drag.mouseX;

    const dy =
      e.clientY -
      drag.mouseY;

    const element =
      elements.find(
        (el) =>
          el.id === drag.id
      );

    if (!element) return;

    const maxX =
      Math.max(
        0,
        displayWidth -
          element.width
      );

    const maxY =
      Math.max(
        0,
        displayHeight -
          element.height
      );

    const newX =
      Math.max(
        0,
        Math.min(
          drag.startX + dx,
          maxX
        )
      );

    const newY =
      Math.max(
        0,
        Math.min(
          drag.startY + dy,
          maxY
        )
      );

    updateElement(
      drag.id,
      {
        x: newX,
        y: newY,
      }
    );
  }

  function stopDrag(
    e: React.PointerEvent<HTMLDivElement>
  ) {
    setDraggingId(null);
    dragRef.current = null;

    try {
      e.currentTarget.releasePointerCapture(
        e.pointerId
      );
    } catch {}
  }

  /* --------------------------------
     SIZE
  -------------------------------- */

  function applySize() {
    if (locked) return;

    const w =
      Number(widthInput);

    const h =
      Number(heightInput);

    if (
      !Number.isFinite(w) ||
      !Number.isFinite(h) ||
      w < 20 ||
      h < 20 ||
      w > 300 ||
      h > 300
    ) {
      alert(
        "Width ಮತ್ತು Height 20–300 mm ನಡುವೆ ಇರಬೇಕು."
      );
      return;
    }

    setCardWidth(w);
    setCardHeight(h);
  }

  function standardPVC() {
    if (locked) return;

    setCardWidth(85.6);
    setCardHeight(53.9);

    setWidthInput("85.6");
    setHeightInput("53.9");
  }

  /* --------------------------------
     SELECTED ELEMENT
  -------------------------------- */

  const selected =
    elements.find(
      (el) =>
        el.id === selectedId
    ) || null;

  /* --------------------------------
     RENDER ELEMENT
  -------------------------------- */

  function renderElement(
    element: CardElement,
    isPdf = false
  ) {
    if (
      element.side !== side &&
      !isPdf
    ) {
      return null;
    }

    if (
      isPdf &&
      element.side !== side
    ) {
      return null;
    }

    const isSelected =
      selectedId ===
      element.id &&
      !isPdf;

    const isDragging =
      draggingId ===
      element.id;

    const style: React.CSSProperties =
      {
        position: "absolute",

        left: element.x,
        top: element.y,

        width: element.width,
        height: element.height,

        zIndex:
          isSelected
            ? 100
            : 10,

        border:
          isSelected
            ? "2px solid #2563eb"
            : "none",

        boxSizing:
          "border-box",

        userSelect:
          "none",

        touchAction:
          "none",

        cursor:
          locked || isPdf
            ? "default"
            : isDragging
            ? "grabbing"
            : "move",

        background:
          element.background ||
          "transparent",

        borderRadius:
          element.radius || 0,

        overflow:
          "hidden",
      };

    if (
      element.type ===
      "text"
    ) {
      return (
        <div
          key={element.id}
          onPointerDown={(e) =>
            startDrag(
              e,
              element
            )
          }
          onPointerMove={
            moveDrag
          }
          onPointerUp={
            stopDrag
          }
          onPointerCancel={
            stopDrag
          }
          onClick={(e) => {
            e.stopPropagation();

            if (!isPdf) {
              setSelectedId(
                element.id
              );
            }
          }}
          style={style}
        >
          <div
            style={{
              width:
                "100%",
              height:
                "100%",

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                element.textAlign ===
                "left"
                  ? "flex-start"
                  : element.textAlign ===
                    "right"
                  ? "flex-end"
                  : "center",

              padding:
                6,

              fontSize:
                element.fontSize ||
                16,

              fontWeight:
                element.fontWeight ||
                "500",

              color:
                element.color ||
                "#111827",

              textAlign:
                element.textAlign ||
                "center",

              lineHeight:
                1.2,

              whiteSpace:
                "pre-wrap",

              wordBreak:
                "break-word",
            }}
          >
            {element.text}
          </div>
        </div>
      );
    }

    return (
      <div
        key={element.id}
        onPointerDown={(e) =>
          startDrag(
            e,
            element
          )
        }
        onPointerMove={
          moveDrag
        }
        onPointerUp={
          stopDrag
        }
        onPointerCancel={
          stopDrag
        }
        onClick={(e) => {
          e.stopPropagation();

          if (!isPdf) {
            setSelectedId(
              element.id
            );
          }
        }}
        style={style}
      >
        {element.src ? (
          <img
            src={element.src}
            alt=""
            draggable={false}
            crossOrigin="anonymous"
            style={{
              width:
                "100%",
              height:
                "100%",
              objectFit:
                "cover",
              display:
                "block",
            }}
          />
        ) : (
          <div className="w-full h-full bg-slate-200 grid place-items-center text-xs text-slate-500">
            Image
          </div>
        )}
      </div>
    );
  }

  /* --------------------------------
     CARD PREVIEW
  -------------------------------- */

  function CardPreview({
    pdf = false,
  }: {
    pdf?: boolean;
  }) {
    const visibleElements =
      elements.filter(
        (el) =>
          el.side === side
      );

    return (
      <div
        className="relative overflow-hidden bg-white"
        style={{
          width:
            displayWidth,

          height:
            displayHeight,

          background:
            "linear-gradient(135deg,#ffffff 35%,#dcfce7)",

          borderRadius:
            pdf ? 0 : 14,

          border:
            pdf
              ? "none"
              : "1px solid #cbd5e1",

          boxShadow:
            pdf
              ? "none"
              : "0 10px 30px rgba(0,0,0,.12)",

          flexShrink: 0,
        }}
        onClick={() => {
          if (!pdf) {
            setSelectedId(
              null
            );
          }
        }}
      >
        {visibleElements.map(
          (element) =>
            renderElement(
              element,
              pdf
            )
        )}

        {qr &&
          side === "front" && (
            <div
              style={{
                position:
                  "absolute",

                right: 15,
                bottom: 15,

                width: 70,
                height: 70,

                zIndex: 50,
              }}
            >
              <img
                src={qr}
                alt="QR"
                draggable={false}
                style={{
                  width:
                    "100%",
                  height:
                    "100%",
                  display:
                    "block",
                }}
              />
            </div>
          )}
      </div>
    );
  }

  /* --------------------------------
     PDF
  -------------------------------- */

  async function generatePDF() {
    if (
      !member ||
      !frontPdfRef.current ||
      !backPdfRef.current
    ) {
      alert(
        "Card preview ready ಆಗಿಲ್ಲ. ಸ್ವಲ್ಪ wait ಮಾಡಿ."
      );
      return;
    }

    try {
      setGenerating(true);
      setMessage("");

      /*
       * PDF refs must be rendered.
       * Wait for browser layout.
       */
      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            700
          )
      );

      const waitImages =
        async (
          root: HTMLElement
        ) => {
          const images =
            Array.from(
              root.querySelectorAll(
                "img"
              )
            );

          await Promise.all(
            images.map(
              (img) =>
                new Promise<void>(
                  (resolve) => {
                    if (
                      img.complete
                    ) {
                      resolve();
                      return;
                    }

                    img.onload =
                      () =>
                        resolve();

                    img.onerror =
                      () =>
                        resolve();
                  }
                )
            )
          );
        };

      await waitImages(
        frontPdfRef.current
      );

      await waitImages(
        backPdfRef.current
      );

      const frontCanvas =
        await html2canvas(
          frontPdfRef.current,
          {
            scale: 3,

            useCORS: true,

            allowTaint: false,

            backgroundColor:
              "#ffffff",

            logging: false,

            imageTimeout:
              30000,
          }
        );

      const backCanvas =
        await html2canvas(
          backPdfRef.current,
          {
            scale: 3,

            useCORS: true,

            allowTaint: false,

            backgroundColor:
              "#ffffff",

            logging: false,

            imageTimeout:
              30000,
          }
        );

      const frontImage =
        frontCanvas.toDataURL(
          "image/png",
          1
        );

      const backImage =
        backCanvas.toDataURL(
          "image/png",
          1
        );

      const orientation =
        cardWidth >=
        cardHeight
          ? "landscape"
          : "portrait";

      const pdf =
        new jsPDF({
          orientation,

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
        orientation
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
        `${
          member.membership_no ||
          "member"
        }-PVC.pdf`
      );

      setMessage(
        "✅ Front + Back PDF successfully generated."
      );
    } catch (error) {
      console.error(
        "PVC PDF ERROR:",
        error
      );

      setMessage(
        "❌ PDF generate ಆಗಲಿಲ್ಲ. Browser Consoleನಲ್ಲಿ error check ಮಾಡಿ."
      );
    } finally {
      setGenerating(false);
    }
  }

  /* --------------------------------
     SAVE MASTER
  -------------------------------- */

  function saveMaster() {
    if (!member?.id) return;

    localStorage.setItem(
      `pvc-designer-${member.id}`,
      JSON.stringify({
        elements,
        width: cardWidth,
        height: cardHeight,
      })
    );

    setMessage(
      "✅ PVC Master Design saved."
    );
  }

  /* --------------------------------
     LOADING
  -------------------------------- */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <h1 className="text-xl font-bold">
            PVC Designer Loading...
          </h1>

          <p className="text-slate-500 mt-2">
            Member information loading...
          </p>
        </div>
      </main>
    );
  }

  if (!member) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-5">
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <h1 className="text-xl font-bold">
            Member not found
          </h1>

          <p className="text-slate-500 mt-2">
            Member ID check ಮಾಡಿ.
          </p>
        </div>
      </main>
    );
  }

  /* --------------------------------
     UI
  -------------------------------- */

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-5">

      {/* TOP BAR */}

      <div className="max-w-7xl mx-auto">

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">

          <div>
            <h1 className="text-2xl font-bold">
              PVC Card Designer
            </h1>

            <p className="text-sm text-slate-500">
              Drag • Edit • Add • Delete • PDF
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            <button
              onClick={() =>
                setLocked(
                  !locked
                )
              }
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold"
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
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold disabled:opacity-50"
            >
              💾 Save Master
            </button>

            <button
              onClick={
                generatePDF
              }
              disabled={
                generating
              }
              className="px-4 py-2 rounded-xl bg-green-600 text-white font-semibold disabled:opacity-50"
            >
              {generating
                ? "Generating..."
                : "📄 Generate PDF"}
            </button>

          </div>
        </div>

        {message && (
          <div className="mb-4 bg-white border rounded-xl px-4 py-3 font-semibold">
            {message}
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_390px] gap-5">

          {/* LEFT - CARD AREA */}

          <div className="bg-white rounded-2xl p-5 shadow overflow-auto">

            <div className="flex justify-center">

              <div>

                <div className="flex gap-2 mb-4">

                  <button
                    onClick={() =>
                      setSide("front")
                    }
                    className={`px-5 py-2 rounded-xl font-bold ${
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
                    className={`px-5 py-2 rounded-xl font-bold ${
                      side === "back"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100"
                    }`}
                  >
                    Back
                  </button>

                </div>

                <p className="font-semibold mb-2">
                  {side ===
                  "front"
                    ? "Front Preview"
                    : "Back Preview"}
                </p>

                <div
                  className="overflow-auto"
                  style={{
                    maxWidth:
                      "100%",
                  }}
                >
                  <div
                    ref={
                      side ===
                      "front"
                        ? frontPreviewRef
                        : backPreviewRef
                    }
                  >
                    <CardPreview />
                  </div>
                </div>

              </div>

            </div>

            <div className="mt-5 bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
              💡 Blue border ಬಂದ element selected ಆಗಿದೆ.
              <br />
              Mouse / touch ಮೂಲಕ drag ಮಾಡಿ.
              <br />
              Right side Edit Sectionನಲ್ಲಿ text change ಮಾಡಿ.
            </div>

          </div>

          {/* RIGHT - EDIT SECTION */}

          <div className="bg-white rounded-2xl shadow">

            <div
              className="p-5 overflow-y-auto"
              style={{
                maxHeight:
                  "calc(100vh - 110px)",
              }}
            >

              <h2 className="text-xl font-bold">
                🎨 Edit Section
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                ಈ section ಮಾತ್ರ scroll ಆಗುತ್ತದೆ.
              </p>

              {/* SIDE */}

              <div className="grid grid-cols-2 gap-2 mt-5">

                <button
                  onClick={() =>
                    setSide("front")
                  }
                  className={`py-3 rounded-xl font-bold ${
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
                  className={`py-3 rounded-xl font-bold ${
                    side === "back"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100"
                  }`}
                >
                  Back
                </button>

              </div>

              {/* SIZE */}

              <div className="mt-5 border rounded-2xl p-4">

                <h3 className="font-bold">
                  📐 PVC Card Size
                </h3>

                <div className="grid grid-cols-2 gap-3 mt-3">

                  <label className="text-sm font-semibold">
                    Width (mm)

                    <input
                      type="number"
                      step="0.1"
                      value={
                        widthInput
                      }
                      disabled={
                        locked
                      }
                      onChange={(e) =>
                        setWidthInput(
                          e.target
                            .value
                        )
                      }
                      className="w-full border rounded-xl p-3 mt-1"
                    />
                  </label>

                  <label className="text-sm font-semibold">
                    Height (mm)

                    <input
                      type="number"
                      step="0.1"
                      value={
                        heightInput
                      }
                      disabled={
                        locked
                      }
                      onChange={(e) =>
                        setHeightInput(
                          e.target
                            .value
                        )
                      }
                      className="w-full border rounded-xl p-3 mt-1"
                    />
                  </label>

                </div>

                <button
                  onClick={
                    applySize
                  }
                  disabled={
                    locked
                  }
                  className="w-full mt-3 bg-blue-600 text-white rounded-xl py-3 font-bold disabled:opacity-50"
                >
                  Apply Size
                </button>

                <button
                  onClick={
                    standardPVC
                  }
                  disabled={
                    locked
                  }
                  className="w-full mt-2 border rounded-xl py-3 font-semibold disabled:opacity-50"
                >
                  Standard PVC
                  <span className="block text-xs text-slate-500">
                    85.6 × 53.9 mm
                  </span>
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
                  className="w-full mt-3 border rounded-xl p-3 text-left font-semibold disabled:opacity-50"
                >
                  ✏️ Add Text
                </button>

                <label
                  className={`block mt-2 border rounded-xl p-3 cursor-pointer font-semibold ${
                    locked
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                >
                  🖼️ Add Image

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
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

              </div>

              {/* SELECTED ELEMENT */}

              {selected && (
                <div className="mt-5 border-2 border-blue-200 rounded-2xl p-4">

                  <div className="flex items-center justify-between">

                    <h3 className="font-bold">
                      ✏️ Selected Element
                    </h3>

                    <button
                      onClick={() =>
                        deleteElement(
                          selected.id
                        )
                      }
                      disabled={
                        locked
                      }
                      className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                    >
                      🗑 Delete
                    </button>

                  </div>

                  {/* TEXT EDIT */}

                  {selected.type ===
                    "text" && (
                    <div className="mt-4 grid gap-3">

                      <label className="text-sm font-semibold">
                        Text

                        <textarea
                          value={
                            selected.text ||
                            ""
                          }
                          disabled={
                            locked
                          }
                          onChange={(e) =>
                            updateElement(
                              selected.id,
                              {
                                text:
                                  e.target
                                    .value,
                              }
                            )
                          }
                          className="w-full border rounded-xl p-3 mt-1 min-h-24"
                        />
                      </label>

                      <div className="grid grid-cols-2 gap-3">

                        <label className="text-sm font-semibold">
                          Font Size

                          <input
                            type="number"
                            value={
                              selected.fontSize ||
                              16
                            }
                            disabled={
                              locked
                            }
                            onChange={(e) =>
                              updateElement(
                                selected.id,
                                {
                                  fontSize:
                                    Number(
                                      e.target
                                        .value
                                    ),
                                }
                              )
                            }
                            className="w-full border rounded-xl p-3 mt-1"
                          />
                        </label>

                        <label className="text-sm font-semibold">
                          Weight

                          <select
                            value={
                              selected.fontWeight ||
                              "500"
                            }
                            disabled={
                              locked
                            }
                            onChange={(e) =>
                              updateElement(
                                selected.id,
                                {
                                  fontWeight:
                                    e.target
                                      .value,
                                }
                              )
                            }
                            className="w-full border rounded-xl p-3 mt-1"
                          >
                            <option value="400">
                              Normal
                            </option>

                            <option value="500">
                              Medium
                            </option>

                            <option value="600">
                              Semi Bold
                            </option>

                            <option value="700">
                              Bold
                            </option>

                            <option value="800">
                              Extra Bold
                            </option>
                          </select>
                        </label>

                      </div>

                      <div className="grid grid-cols-2 gap-3">

                        <label className="text-sm font-semibold">
                          Text Color

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
                              updateElement(
                                selected.id,
                                {
                                  color:
                                    e.target
                                      .value,
                                }
                              )
                            }
                            className="w-full h-12 mt-1"
                          />
                        </label>

                        <label className="text-sm font-semibold">
                          Background

                          <input
                            type="color"
                            value={
                              selected.background &&
                              selected.background.startsWith(
                                "#"
                              )
                                ? selected.background
                                : "#ffffff"
                            }
                            disabled={
                              locked
                            }
                            onChange={(e) =>
                              updateElement(
                                selected.id,
                                {
                                  background:
                                    e.target
                                      .value,
                                }
                              )
                            }
                            className="w-full h-12 mt-1"
                          />
                        </label>

                      </div>

                      <label className="text-sm font-semibold">
                        Alignment

                        <select
                          value={
                            selected.textAlign ||
                            "center"
                          }
                          disabled={
                            locked
                          }
                          onChange={(e) =>
                            updateElement(
                              selected.id,
                              {
                                textAlign:
                                  e.target
                                    .value as
                                    | "left"
                                    | "center"
                                    | "right",
                              }
                            )
                          }
                          className="w-full border rounded-xl p-3 mt-1"
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
                      </label>

                    </div>
                  )}

                  {/* IMAGE EDIT */}

                  {selected.type ===
                    "image" && (
                    <div className="mt-4 grid gap-3">

                      <p className="text-sm text-slate-500">
                        Image ಅನ್ನು cardನಲ್ಲಿ drag ಮಾಡಿ.
                      </p>

                    </div>
                  )}

                  {/* POSITION */}

                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <label className="text-sm font-semibold">
                      X

                      <input
                        type="number"
                        value={Math.round(
                          selected.x
                        )}
                        disabled={
                          locked
                        }
                        onChange={(e) =>
                          updateElement(
                            selected.id,
                            {
                              x: Number(
                                e.target
                                  .value
                              ),
                            }
                          )
                        }
                        className="w-full border rounded-xl p-3 mt-1"
                      />
                    </label>

                    <label className="text-sm font-semibold">
                      Y

                      <input
                        type="number"
                        value={Math.round(
                          selected.y
                        )}
                        disabled={
                          locked
                        }
                        onChange={(e) =>
                          updateElement(
                            selected.id,
                            {
                              y: Number(
                                e.target
                                  .value
                              ),
                            }
                          )
                        }
                        className="w-full border rounded-xl p-3 mt-1"
                      />
                    </label>

                    <label className="text-sm font-semibold">
                      Width

                      <input
                        type="number"
                        value={Math.round(
                          selected.width
                        )}
                        disabled={
                          locked
                        }
                        onChange={(e) =>
                          updateElement(
                            selected.id,
                            {
                              width:
                                Number(
                                  e.target
                                    .value
                                ),
                            }
                          )
                        }
                        className="w-full border rounded-xl p-3 mt-1"
                      />
                    </label>

                    <label className="text-sm font-semibold">
                      Height

                      <input
                        type="number"
                        value={Math.round(
                          selected.height
                        )}
                        disabled={
                          locked
                        }
                        onChange={(e) =>
                          updateElement(
                            selected.id,
                            {
                              height:
                                Number(
                                  e.target
                                    .value
                                ),
                            }
                          )
                        }
                        className="w-full border rounded-xl p-3 mt-1"
                      />
                    </label>

                  </div>

                  <button
                    onClick={() =>
                      updateElement(
                        selected.id,
                        {
                          x: 20,
                          y: 20,
                        }
                      )
                    }
                    disabled={
                      locked
                    }
                    className="w-full mt-3 border rounded-xl py-3 font-semibold disabled:opacity-50"
                  >
                    Reset Position
                  </button>

                </div>
              )}

              {!selected && (
                <div className="mt-5 bg-slate-50 rounded-2xl p-5 text-center text-sm text-slate-500">
                  Cardನಲ್ಲಿ ಯಾವುದಾದರೂ
                  text/image ಮೇಲೆ click ಮಾಡಿ
                  edit ಮಾಡಿ.
                </div>
              )}

              {/* INFO */}

              <div className="mt-5 bg-green-50 border border-green-200 rounded-2xl p-4">

                <h3 className="font-bold text-green-800">
                  QR Code
                </h3>

                <p className="text-sm text-green-700 mt-1">
                  QR scan ಮಾಡಿದಾಗ member Public Page open ಆಗುತ್ತದೆ.
                </p>

              </div>

            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------
          PDF RENDER AREA
          Kept inside viewport but invisible.
      -------------------------------- */}

      <div
        style={{
          position:
            "fixed",

          left: 0,
          top: 0,

          opacity: 0.01,

          pointerEvents:
            "none",

          zIndex: -1,

          width:
            displayWidth,

          height:
            displayHeight *
              2 +
            40,

          overflow:
            "hidden",
        }}
      >

        <div
          ref={
            frontPdfRef
          }
          style={{
            width:
              displayWidth,

            height:
              displayHeight,
          }}
        >
          {(() => {
            const oldSide =
              side;

            return (
              <div
                style={{
                  width:
                    displayWidth,

                  height:
                    displayHeight,
                }}
              >
                {elements
                  .filter(
                    (el) =>
                      el.side ===
                      "front"
                  )
                  .map(
                    (element) =>
                      renderElement(
                        element,
                        true
                      )
                  )}

                {qr && (
                  <div
                    style={{
                      position:
                        "absolute",
                      right: 15,
                      bottom: 15,
                      width: 70,
                      height: 70,
                    }}
                  >
                    <img
                      src={qr}
                      alt=""
                      style={{
                        width:
                          "100%",
                        height:
                          "100%",
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        <div
          ref={
            backPdfRef
          }
          style={{
            width:
              displayWidth,

            height:
              displayHeight,

            marginTop:
              20,
          }}
        >
          <div
            style={{
              width:
                displayWidth,

              height:
                displayHeight,

              position:
                "relative",

              overflow:
                "hidden",

              background:
                "linear-gradient(135deg,#ffffff 35%,#dcfce7)",
            }}
          >
            {elements
              .filter(
                (el) =>
                  el.side ===
                  "back"
              )
              .map(
                (element) =>
                  renderElement(
                    element,
                    true
                  )
              )}
          </div>
        </div>

      </div>

    </main>
  );
}

/* --------------------------------
   PAGE WRAPPER
-------------------------------- */

export default function CardPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-100 flex items-center justify-center">
          <div className="font-bold">
            Loading PVC Designer...
          </div>
        </main>
      }
    >
      <CardDesigner />
    </Suspense>
  );
}
