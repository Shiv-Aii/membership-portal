"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
} from "react";

import { supabase } from "@/lib/supabase";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useSearchParams } from "next/navigation";

/* =========================================================
   TYPES
========================================================= */

type Side = "front" | "back";

type ElementType =
  | "text"
  | "image"
  | "shape";

type TextAlign =
  | "left"
  | "center"
  | "right";

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

  textAlign?: TextAlign;

  radius?: number;
};

type SavedDesign = {
  version?: number;
  width?: number;
  height?: number;
  elements?: CardElement[];
};

type DragState = {
  id: string;
  pointerX: number;
  pointerY: number;
  startX: number;
  startY: number;
};

/* =========================================================
   DESIGN CANVAS

   IMPORTANT:
   Preview + PDF ALWAYS use this same coordinate system.
========================================================= */

const DESIGN_WIDTH = 856;
const DESIGN_HEIGHT = 539;

const DEFAULT_WIDTH_MM = 85.6;
const DEFAULT_HEIGHT_MM = 53.9;

/* =========================================================
   COMPONENT
========================================================= */

function CardDesigner() {
  const params = useSearchParams();

  const id = params.get("id");

  /* -------------------------------------------------------
     MEMBER
  ------------------------------------------------------- */

  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------------
     QR
  ------------------------------------------------------- */

  const [qr, setQr] = useState("");

  /* -------------------------------------------------------
     ELEMENTS
  ------------------------------------------------------- */

  const [elements, setElements] =
    useState<CardElement[]>([]);

  /* -------------------------------------------------------
     SIDE
  ------------------------------------------------------- */

  const [side, setSide] =
    useState<Side>("front");

  /* -------------------------------------------------------
     SELECTED
  ------------------------------------------------------- */

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  /* -------------------------------------------------------
     LOCK
  ------------------------------------------------------- */

  const [locked, setLocked] =
    useState(false);

  /* -------------------------------------------------------
     PDF
  ------------------------------------------------------- */

  const [generating, setGenerating] =
    useState(false);

  /* -------------------------------------------------------
     MESSAGE
  ------------------------------------------------------- */

  const [message, setMessage] =
    useState("");

  /* -------------------------------------------------------
     CARD SIZE
  ------------------------------------------------------- */

  const [cardWidth, setCardWidth] =
    useState(DEFAULT_WIDTH_MM);

  const [cardHeight, setCardHeight] =
    useState(DEFAULT_HEIGHT_MM);

  const [widthInput, setWidthInput] =
    useState(String(DEFAULT_WIDTH_MM));

  const [heightInput, setHeightInput] =
    useState(String(DEFAULT_HEIGHT_MM));

  /* -------------------------------------------------------
     DRAG
  ------------------------------------------------------- */

  const dragRef =
    useRef<DragState | null>(null);

  /* -------------------------------------------------------
     VISIBLE PREVIEW REF
  ------------------------------------------------------- */

  const previewRef =
    useRef<HTMLDivElement | null>(null);

  /* -------------------------------------------------------
     PDF CAPTURE REFS
  ------------------------------------------------------- */

  const frontPdfRef =
    useRef<HTMLDivElement | null>(null);

  const backPdfRef =
    useRef<HTMLDivElement | null>(null);

  /* =======================================================
     DEFAULT DESIGN
  ======================================================= */

  function createDefaultElements(
    data: any
  ): CardElement[] {
    return [
      /* ---------------------------------------------------
         FRONT HEADER BACKGROUND
      --------------------------------------------------- */

      {
        id: "front-header-bg",
        type: "shape",
        side: "front",

        x: 0,
        y: 0,

        width: DESIGN_WIDTH,
        height: 65,

        background: "#1677e8",
        radius: 0,
      },

      /* ---------------------------------------------------
         FRONT HEADING TEXT
      --------------------------------------------------- */

      {
        id: "front-heading",
        type: "text",
        side: "front",

        x: 80,
        y: 10,

        width: 696,
        height: 45,

        text: "ಸಂಸ್ಥೆ ಸದಸ್ಯತ್ವ ಕಾರ್ಡ್",

        fontSize: 28,
        fontWeight: "700",

        color: "#ffffff",

        textAlign: "center",
      },

      /* ---------------------------------------------------
         FRONT PHOTO
      --------------------------------------------------- */

      {
        id: "front-photo",
        type: "image",
        side: "front",

        x: 45,
        y: 120,

        width: 105,
        height: 135,

        src: data?.photo_url || "",

        radius: 10,
      },

      /* ---------------------------------------------------
         NAME
      --------------------------------------------------- */

      {
        id: "front-name",
        type: "text",
        side: "front",

        x: 180,
        y: 105,

        width: 330,
        height: 42,

        text: `ಹೆಸರು: ${data?.name || "-"}`,

        fontSize: 19,
        fontWeight: "600",

        color: "#111827",

        textAlign: "left",
      },

      /* ---------------------------------------------------
         DESIGNATION
      --------------------------------------------------- */

      {
        id: "front-designation",
        type: "text",
        side: "front",

        x: 180,
        y: 150,

        width: 330,
        height: 42,

        text: `ಹುದ್ದೆ: ${data?.designation || "-"}`,

        fontSize: 19,
        fontWeight: "500",

        color: "#111827",

        textAlign: "left",
      },

      /* ---------------------------------------------------
         VILLAGE
      --------------------------------------------------- */

      {
        id: "front-village",
        type: "text",
        side: "front",

        x: 180,
        y: 195,

        width: 330,
        height: 42,

        text: `ಗ್ರಾಮ: ${data?.village || "-"}`,

        fontSize: 19,
        fontWeight: "500",

        color: "#111827",

        textAlign: "left",
      },

      /* ---------------------------------------------------
         MOBILE
      --------------------------------------------------- */

      {
        id: "front-mobile",
        type: "text",
        side: "front",

        x: 180,
        y: 240,

        width: 330,
        height: 42,

        text: `ಮೊಬೈಲ್: ${data?.mobile || "-"}`,

        fontSize: 19,
        fontWeight: "500",

        color: "#111827",

        textAlign: "left",
      },

      /* ---------------------------------------------------
         MEMBER ID
      --------------------------------------------------- */

      {
        id: "front-member-id",
        type: "text",
        side: "front",

        x: 180,
        y: 290,

        width: 330,
        height: 42,

        text: `Member ID: ${
          data?.membership_no || "-"
        }`,

        fontSize: 19,
        fontWeight: "700",

        color: "#111827",

        textAlign: "left",
      },

      /* ---------------------------------------------------
         QR
      --------------------------------------------------- */

      {
        id: "front-qr",
        type: "image",
        side: "front",

        x: 690,
        y: 345,

        width: 120,
        height: 120,

        src: "",

        radius: 0,
      },

      /* ---------------------------------------------------
         BACK HEADER BACKGROUND
      --------------------------------------------------- */

      {
        id: "back-header-bg",
        type: "shape",
        side: "back",

        x: 0,
        y: 0,

        width: DESIGN_WIDTH,
        height: 65,

        background: "#1677e8",
        radius: 0,
      },

      /* ---------------------------------------------------
         BACK HEADING
      --------------------------------------------------- */

      {
        id: "back-heading",
        type: "text",
        side: "back",

        x: 80,
        y: 10,

        width: 696,
        height: 45,

        text: "ನಮ್ಮ ಸಂಘಟನೆ — ನಮ್ಮ ಬಲ",

        fontSize: 28,
        fontWeight: "700",

        color: "#ffffff",

        textAlign: "center",
      },

      /* ---------------------------------------------------
         BACK INFO
      --------------------------------------------------- */

      {
        id: "back-info",
        type: "text",
        side: "back",

        x: 70,
        y: 150,

        width: 716,
        height: 90,

        text:
          "ಈ ಸದಸ್ಯತ್ವ ಕಾರ್ಡ್ ಅಧಿಕೃತ ಸದಸ್ಯತ್ವದ ಗುರುತಾಗಿದೆ.",

        fontSize: 21,
        fontWeight: "500",

        color: "#111827",

        textAlign: "center",
      },

      /* ---------------------------------------------------
         BACK CONTACT
      --------------------------------------------------- */

      {
        id: "back-contact",
        type: "text",
        side: "back",

        x: 70,
        y: 280,

        width: 716,
        height: 70,

        text:
          "ಸಂಪರ್ಕಕ್ಕಾಗಿ ಸಂಸ್ಥೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ.",

        fontSize: 18,
        fontWeight: "500",

        color: "#475569",

        textAlign: "center",
      },
    ];
  }

  /* =======================================================
     OLD DESIGN MIGRATION
  ======================================================= */

  function migrateDesign(
    savedElements: CardElement[],
    data: any
  ): CardElement[] {
    let result = [...savedElements];

    /* -----------------------------------------------------
       Add separate header backgrounds if old design
       had background attached to heading text.
    ----------------------------------------------------- */

    const frontHeading =
      result.find(
        (e) => e.id === "front-heading"
      );

    const backHeading =
      result.find(
        (e) => e.id === "back-heading"
      );

    if (
      frontHeading &&
      frontHeading.type === "text" &&
      frontHeading.background
    ) {
      const exists =
        result.some(
          (e) => e.id === "front-header-bg"
        );

      if (!exists) {
        result.push({
          id: "front-header-bg",
          type: "shape",
          side: "front",

          x: 0,
          y: 0,

          width: DESIGN_WIDTH,
          height: 65,

          background:
            frontHeading.background,

          radius: 0,
        });
      }

      delete frontHeading.background;

      frontHeading.x =
        Math.max(0, frontHeading.x);

      frontHeading.width =
        Math.min(
          frontHeading.width,
          DESIGN_WIDTH
        );
    }

    if (
      backHeading &&
      backHeading.type === "text" &&
      backHeading.background
    ) {
      const exists =
        result.some(
          (e) => e.id === "back-header-bg"
        );

      if (!exists) {
        result.push({
          id: "back-header-bg",
          type: "shape",
          side: "back",

          x: 0,
          y: 0,

          width: DESIGN_WIDTH,
          height: 65,

          background:
            backHeading.background,

          radius: 0,
        });
      }

      delete backHeading.background;

      backHeading.x =
        Math.max(0, backHeading.x);

      backHeading.width =
        Math.min(
          backHeading.width,
          DESIGN_WIDTH
        );
    }

    /* -----------------------------------------------------
       Ensure QR exists
    ----------------------------------------------------- */

    const qrIndex =
      result.findIndex(
        (e) => e.id === "front-qr"
      );

    if (qrIndex === -1) {
      result.push({
        id: "front-qr",
        type: "image",
        side: "front",

        x: 690,
        y: 345,

        width: 120,
        height: 120,

        src: qr,
      });
    } else {
      result[qrIndex] = {
        ...result[qrIndex],
        src: qr,
      };
    }

    /* -----------------------------------------------------
       Ensure header backgrounds exist
    ----------------------------------------------------- */

    if (
      !result.some(
        (e) =>
          e.id === "front-header-bg"
      )
    ) {
      result.push({
        id: "front-header-bg",
        type: "shape",
        side: "front",

        x: 0,
        y: 0,

        width: DESIGN_WIDTH,
        height: 65,

        background: "#1677e8",
        radius: 0,
      });
    }

    if (
      !result.some(
        (e) =>
          e.id === "back-header-bg"
      )
    ) {
      result.push({
        id: "back-header-bg",
        type: "shape",
        side: "back",

        x: 0,
        y: 0,

        width: DESIGN_WIDTH,
        height: 65,

        background: "#1677e8",
        radius: 0,
      });
    }

    /* -----------------------------------------------------
       Normalize old coordinate system
    ----------------------------------------------------- */

    result = result.map((element) => {
      let e = { ...element };

      if (
        e.x < 0 ||
        e.y < 0
      ) {
        e.x = Math.max(0, e.x);
        e.y = Math.max(0, e.y);
      }

      e.x = Math.min(
        e.x,
        DESIGN_WIDTH - 1
      );

      e.y = Math.min(
        e.y,
        DESIGN_HEIGHT - 1
      );

      return e;
    });

    return result;
  }

  /* =======================================================
     LOAD MEMBER
  ======================================================= */

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

        /* -------------------------------------------------
           QR
        ------------------------------------------------- */

        const verificationUrl =
          `${window.location.origin}/verify?membership=${encodeURIComponent(
            String(data.membership_no || "")
          )}`;

        const qrImage =
          await QRCode.toDataURL(
            verificationUrl,
            {
              width: 800,
              margin: 1,
              errorCorrectionLevel: "H",
            }
          );

        setQr(qrImage);

        /* -------------------------------------------------
           LOCAL STORAGE
        ------------------------------------------------- */

        const storageKey =
          `pvc-designer-${data.id}`;

        const raw =
          localStorage.getItem(
            storageKey
          );

        if (!raw) {
          const defaults =
            createDefaultElements(data);

          setElements(
            defaults.map(
              (element) =>
                element.id ===
                "front-qr"
                  ? {
                      ...element,
                      src: qrImage,
                    }
                  : element
            )
          );

          return;
        }

        try {
          const saved:
            SavedDesign =
            JSON.parse(raw);

          let savedElements =
            Array.isArray(
              saved.elements
            )
              ? saved.elements
              : createDefaultElements(
                  data
                );

          /* ---------------------------------------------
             Old version migration
          --------------------------------------------- */

          if (!saved.version) {
            savedElements =
              savedElements.map(
                (element) => ({
                  ...element,

                  x:
                    element.x * 2,

                  y:
                    element.y * 2,

                  width:
                    element.width * 2,

                  height:
                    element.height * 2,

                  fontSize:
                    element.fontSize
                      ? element.fontSize * 2
                      : element.fontSize,
                })
              );
          }

          savedElements =
            migrateDesign(
              savedElements,
              data
            );

          /* ---------------------------------------------
             Update QR
          --------------------------------------------- */

          savedElements =
            savedElements.map(
              (element) =>
                element.id ===
                "front-qr"
                  ? {
                      ...element,
                      src: qrImage,
                    }
                  : element
            );

          setElements(
            savedElements
          );

          /* ---------------------------------------------
             Physical size
          --------------------------------------------- */

          const savedWidth =
            Number(saved.width);

          const savedHeight =
            Number(saved.height);

          if (
            Number.isFinite(
              savedWidth
            ) &&
            savedWidth > 0
          ) {
            setCardWidth(
              savedWidth
            );

            setWidthInput(
              String(savedWidth)
            );
          }

          if (
            Number.isFinite(
              savedHeight
            ) &&
            savedHeight > 0
          ) {
            setCardHeight(
              savedHeight
            );

            setHeightInput(
              String(savedHeight)
            );
          }
        } catch (error) {
          console.error(
            error
          );

          const defaults =
            createDefaultElements(data);

          setElements(
            defaults.map(
              (element) =>
                element.id ===
                "front-qr"
                  ? {
                      ...element,
                      src: qrImage,
                    }
                  : element
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

  /* =======================================================
     AUTO SAVE
  ======================================================= */

  useEffect(() => {
    if (!member?.id) return;

    if (elements.length === 0) {
      return;
    }

    const storageKey =
      `pvc-designer-${member.id}`;

    const data:
      SavedDesign = {
      version: 4,

      width: cardWidth,

      height: cardHeight,

      elements,
    };

    localStorage.setItem(
      storageKey,
      JSON.stringify(data)
    );
  }, [
    member?.id,
    elements,
    cardWidth,
    cardHeight,
  ]);

  /* =======================================================
     UPDATE ELEMENT
  ======================================================= */

  function updateElement(
    elementId: string,
    patch: Partial<CardElement>
  ) {
    if (locked) return;

    setElements(
      (old) =>
        old.map(
          (element) =>
            element.id ===
            elementId
              ? {
                  ...element,
                  ...patch,
                }
              : element
        )
    );
  }

  /* =======================================================
     DELETE
  ======================================================= */

  function deleteElement(
    elementId: string
  ) {
    if (locked) return;

    setElements(
      (old) =>
        old.filter(
          (element) =>
            element.id !==
            elementId
        )
    );

    setSelectedId(null);
  }

  /* =======================================================
     ADD TEXT
  ======================================================= */

  function addText() {
    if (locked) return;

    const newElement:
      CardElement = {
      id:
        `text-${Date.now()}`,

      type: "text",

      side,

      x: 100,
      y: 100,

      width: 300,
      height: 60,

      text: "ಹೊಸ Text",

      fontSize: 22,
      fontWeight: "500",

      color: "#111827",

      textAlign: "center",

      radius: 5,
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
  }

  /* =======================================================
     ADD IMAGE
  ======================================================= */

  function addImage(
    file: File
  ) {
    if (locked) return;

    const reader =
      new FileReader();

    reader.onload = () => {
      const newElement:
        CardElement = {
        id:
          `image-${Date.now()}`,

        type: "image",

        side,

        x: 100,
        y: 100,

        width: 180,
        height: 140,

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

  /* =======================================================
     DRAG START
  ======================================================= */

  function startDrag(
    e: ReactPointerEvent<HTMLDivElement>,
    element: CardElement
  ) {
    if (locked) return;

    e.preventDefault();
    e.stopPropagation();

    setSelectedId(
      element.id
    );

    dragRef.current = {
      id: element.id,

      pointerX: e.clientX,
      pointerY: e.clientY,

      startX: element.x,
      startY: element.y,
    };

    try {
      e.currentTarget.setPointerCapture(
        e.pointerId
      );
    } catch {}
  }

  /* =======================================================
     DRAG MOVE
  ======================================================= */

  function moveDrag(
    e: ReactPointerEvent<HTMLDivElement>
  ) {
    if (
      locked ||
      !dragRef.current
    ) {
      return;
    }

    const drag =
      dragRef.current;

    const element =
      elements.find(
        (item) =>
          item.id ===
          drag.id
      );

    if (!element) return;

    const dx =
      e.clientX -
      drag.pointerX;

    const dy =
      e.clientY -
      drag.pointerY;

    const maxX =
      Math.max(
        0,
        DESIGN_WIDTH -
          element.width
      );

    const maxY =
      Math.max(
        0,
        DESIGN_HEIGHT -
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

  /* =======================================================
     DRAG END
  ======================================================= */

  function stopDrag(
    e: ReactPointerEvent<HTMLDivElement>
  ) {
    dragRef.current = null;

    try {
      e.currentTarget.releasePointerCapture(
        e.pointerId
      );
    } catch {}
  }

  /* =======================================================
     CARD SIZE
  ======================================================= */

  function applySize() {
    if (locked) return;

    const width =
      Number(widthInput);

    const height =
      Number(heightInput);

    if (
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      width < 20 ||
      height < 20 ||
      width > 300 ||
      height > 300
    ) {
      alert(
        "Width ಮತ್ತು Height 20–300 mm ನಡುವೆ ಇರಬೇಕು."
      );

      return;
    }

    setCardWidth(width);
    setCardHeight(height);

    setMessage(
      `Card size: ${width} × ${height} mm`
    );
  }

  /* =======================================================
     STANDARD PVC
  ======================================================= */

  function standardPVC() {
    if (locked) return;

    setCardWidth(
      DEFAULT_WIDTH_MM
    );

    setCardHeight(
      DEFAULT_HEIGHT_MM
    );

    setWidthInput(
      String(DEFAULT_WIDTH_MM)
    );

    setHeightInput(
      String(DEFAULT_HEIGHT_MM)
    );

    setMessage(
      "Standard PVC 85.6 × 53.9 mm applied."
    );
  }

  /* =======================================================
     RESET
  ======================================================= */

  function resetDesign() {
    if (locked) return;

    if (
      !confirm(
        "Current design reset ಮಾಡಿ default design ಹಾಕಬೇಕೇ?"
      )
    ) {
      return;
    }

    if (!member) return;

    const defaults =
      createDefaultElements(
        member
      );

    setElements(
      defaults.map(
        (element) =>
          element.id ===
          "front-qr"
            ? {
                ...element,
                src: qr,
              }
            : element
      )
    );

    setSelectedId(null);

    setCardWidth(
      DEFAULT_WIDTH_MM
    );

    setCardHeight(
      DEFAULT_HEIGHT_MM
    );

    setWidthInput(
      String(DEFAULT_WIDTH_MM)
    );

    setHeightInput(
      String(DEFAULT_HEIGHT_MM)
    );

    setMessage(
      "Design reset ಆಯಿತು."
    );
  }

  /* =======================================================
     SELECTED
  ======================================================= */

  const selected =
    elements.find(
      (element) =>
        element.id ===
        selectedId
    ) || null;

  /* =======================================================
     COMMON CANVAS STYLE
  ======================================================= */

  const canvasStyle:
    CSSProperties = {
    position: "relative",

    width:
      `${DESIGN_WIDTH}px`,

    height:
      `${DESIGN_HEIGHT}px`,

    minWidth:
      `${DESIGN_WIDTH}px`,

    minHeight:
      `${DESIGN_HEIGHT}px`,

    maxWidth:
      `${DESIGN_WIDTH}px`,

    maxHeight:
      `${DESIGN_HEIGHT}px`,

    overflow: "hidden",

    boxSizing: "border-box",

    background:
      "linear-gradient(135deg,#ffffff 35%,#dcfce7)",

    borderRadius: "14px",

    border:
      "1px solid #cbd5e1",

    boxShadow:
      "0 10px 30px rgba(0,0,0,.12)",

    flexShrink: 0,

    fontFamily:
      "'Noto Sans Kannada', 'Nirmala UI', Arial, sans-serif",
  };

  /* =======================================================
     RENDER ELEMENT
  ======================================================= */

  function renderElement(
    element: CardElement,
    captureMode = false
  ) {
    const selectedNow =
      !captureMode &&
      selectedId === element.id;

    const baseStyle:
      CSSProperties = {
      position: "absolute",

      left:
        `${element.x}px`,

      top:
        `${element.y}px`,

      width:
        `${element.width}px`,

      height:
        `${element.height}px`,

      boxSizing: "border-box",

      overflow: "hidden",

      zIndex:
        selectedNow
          ? 9999
          : element.type ===
              "shape"
            ? 1
            : 10,

      background:
        element.background ||
        "transparent",

      borderRadius:
        `${element.radius || 0}px`,

      userSelect: "none",

      touchAction: "none",

      cursor:
        locked ||
        captureMode
          ? "default"
          : "move",

      border:
        selectedNow
          ? "2px solid #2563eb"
          : "none",
    };

    /* -----------------------------------------------------
       SHAPE
    ----------------------------------------------------- */

    if (
      element.type ===
      "shape"
    ) {
      return (
        <div
          key={element.id}
          style={baseStyle}
          onPointerDown={
            captureMode
              ? undefined
              : (e) =>
                  startDrag(
                    e,
                    element
                  )
          }
          onPointerMove={
            captureMode
              ? undefined
              : moveDrag
          }
          onPointerUp={
            captureMode
              ? undefined
              : stopDrag
          }
          onPointerCancel={
            captureMode
              ? undefined
              : stopDrag
          }
          onClick={
            captureMode
              ? undefined
              : (e) => {
                  e.stopPropagation();

                  setSelectedId(
                    element.id
                  );
                }
          }
        />
      );
    }

    /* -----------------------------------------------------
       TEXT
    ----------------------------------------------------- */

    if (
      element.type ===
      "text"
    ) {
      return (
        <div
          key={element.id}
          style={baseStyle}
          onPointerDown={
            captureMode
              ? undefined
              : (e) =>
                  startDrag(
                    e,
                    element
                  )
          }
          onPointerMove={
            captureMode
              ? undefined
              : moveDrag
          }
          onPointerUp={
            captureMode
              ? undefined
              : stopDrag
          }
          onPointerCancel={
            captureMode
              ? undefined
              : stopDrag
          }
          onClick={
            captureMode
              ? undefined
              : (e) => {
                  e.stopPropagation();

                  setSelectedId(
                    element.id
                  );
                }
          }
        >
          <div
            style={{
              width: "100%",
              height: "100%",

              display: "flex",

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
                "6px",

              boxSizing:
                "border-box",

              fontSize:
                `${element.fontSize || 20}px`,

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
                "1.2",

              whiteSpace:
                "pre-wrap",

              wordBreak:
                "break-word",

              fontFamily:
                "'Noto Sans Kannada', 'Nirmala UI', Arial, sans-serif",
            }}
          >
            {element.text}
          </div>
        </div>
      );
    }

    /* -----------------------------------------------------
       IMAGE
    ----------------------------------------------------- */

    return (
      <div
        key={element.id}
        style={baseStyle}
        onPointerDown={
          captureMode
            ? undefined
            : (e) =>
                startDrag(
                  e,
                  element
                )
        }
        onPointerMove={
          captureMode
            ? undefined
            : moveDrag
        }
        onPointerUp={
          captureMode
            ? undefined
            : stopDrag
        }
        onPointerCancel={
          captureMode
            ? undefined
            : stopDrag
        }
        onClick={
          captureMode
            ? undefined
            : (e) => {
                e.stopPropagation();

                setSelectedId(
                  element.id
                );
              }
        }
      >
        {element.src ? (
          <img
            src={element.src}
            alt=""
            draggable={false}
            crossOrigin="anonymous"
            style={{
              display: "block",

              width: "100%",
              height: "100%",

              objectFit: "cover",

              userSelect: "none",

              pointerEvents:
                "none",
            }}
          />
        ) : (
          <div className="w-full h-full bg-slate-200 grid place-items-center text-slate-500 text-sm">
            Image
          </div>
        )}
      </div>
    );
  }

  /* =======================================================
     CANVAS
  ======================================================= */

  function CardCanvas({
    cardSide,
    canvasRef,
    captureMode = false,
  }: {
    cardSide: Side;
    canvasRef: React.MutableRefObject<HTMLDivElement | null>;
    captureMode?: boolean;
  }) {
    const visibleElements =
      elements.filter(
        (element) =>
          element.side ===
          cardSide
      );

    return (
      <div
        ref={canvasRef}
        style={{
          ...canvasStyle,

          borderRadius:
            captureMode
              ? "0"
              : canvasStyle.borderRadius,

          boxShadow:
            captureMode
              ? "none"
              : canvasStyle.boxShadow,
        }}
        onClick={
          captureMode
            ? undefined
            : () =>
                setSelectedId(
                  null
                )
        }
      >
        {visibleElements.map(
          (element) =>
            renderElement(
              element,
              captureMode
            )
        )}
      </div>
    );
  }

  /* =======================================================
     WAIT FOR IMAGES
  ======================================================= */

  async function waitForImages(
    root: HTMLElement
  ) {
    const images =
      Array.from(
        root.querySelectorAll(
          "img"
        )
      );

    await Promise.all(
      images.map(
        (image) =>
          new Promise<void>(
            (resolve) => {
              if (
                image.complete &&
                image.naturalWidth > 0
              ) {
                resolve();
                return;
              }

              image.onload =
                () => resolve();

              image.onerror =
                () => resolve();
            }
          )
      )
    );
  }

  /* =======================================================
     EXACT PDF CAPTURE

     Same DOM
     Same 856 × 539
     Same font
     Same positions
  ======================================================= */

  async function captureCard(
    root: HTMLDivElement
  ) {
    if (
      document.fonts &&
      document.fonts.ready
    ) {
      await document.fonts.ready;
    }

    await new Promise<void>(
      (resolve) =>
        requestAnimationFrame(
          () =>
            requestAnimationFrame(
              () => resolve()
            )
        )
    );

    await waitForImages(
      root
    );

    await new Promise<void>(
      (resolve) =>
        setTimeout(
          resolve,
          200
        )
    );

    return html2canvas(
      root,
      {
        scale: 3,

        width:
          DESIGN_WIDTH,

        height:
          DESIGN_HEIGHT,

        windowWidth:
          DESIGN_WIDTH,

        windowHeight:
          DESIGN_HEIGHT,

        x: 0,
        y: 0,

        scrollX: 0,
        scrollY: 0,

        useCORS: true,

        allowTaint: false,

        backgroundColor:
          "#ffffff",

        logging: false,

        imageTimeout:
          30000,

        foreignObjectRendering:
          false,
      }
    );
  }

  /* =======================================================
     GENERATE PDF
  ======================================================= */

  async function generatePDF() {
    if (
      !frontPdfRef.current ||
      !backPdfRef.current
    ) {
      alert(
        "PDF preview ready ಆಗಿಲ್ಲ."
      );

      return;
    }

    if (!member) {
      alert(
        "Member information ಇಲ್ಲ."
      );

      return;
    }

    try {
      setGenerating(true);

      setMessage(
        "PDF generating..."
      );

      const oldSelected =
        selectedId;

      /* Remove selection border */

      setSelectedId(null);

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            250
          )
      );

      /* -----------------------------------------------
         CAPTURE FRONT
      ------------------------------------------------ */

      const frontCanvas =
        await captureCard(
          frontPdfRef.current
        );

      /* -----------------------------------------------
         CAPTURE BACK
      ------------------------------------------------ */

      const backCanvas =
        await captureCard(
          backPdfRef.current
        );

      /* -----------------------------------------------
         Restore selection
      ------------------------------------------------ */

      setSelectedId(
        oldSelected
      );

      const frontImage =
        frontCanvas.toDataURL(
          "image/png"
        );

      const backImage =
        backCanvas.toDataURL(
          "image/png"
        );

      /* -----------------------------------------------
         PDF
      ------------------------------------------------ */

      const orientation =
        cardWidth >= cardHeight
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

      /* FRONT PAGE */

      pdf.addImage(
        frontImage,
        "PNG",

        0,
        0,

        cardWidth,
        cardHeight,

        undefined,
        "FAST"
      );

      /* BACK PAGE */

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
        cardHeight,

        undefined,
        "FAST"
      );

      pdf.save(
        `${
          member.membership_no ||
          "member"
        }-PVC.pdf`
      );

      setMessage(
        `✅ PDF Generated — ${cardWidth} × ${cardHeight} mm`
      );
    } catch (error) {
      console.error(
        "PDF ERROR:",
        error
      );

      setMessage(
        "❌ PDF generate ಆಗಲಿಲ್ಲ."
      );

      alert(
        "PDF generate ಆಗಲಿಲ್ಲ. Browser console check ಮಾಡಿ."
      );
    } finally {
      setGenerating(false);
    }
  }

  /* =======================================================
     SAVE MASTER
  ======================================================= */

  function saveMaster() {
    if (!member?.id) return;

    const storageKey =
      `pvc-designer-${member.id}`;

    const data:
      SavedDesign = {
      version: 4,

      width:
        cardWidth,

      height:
        cardHeight,

      elements,
    };

    localStorage.setItem(
      storageKey,
      JSON.stringify(data)
    );

    setMessage(
      "✅ Master Design Saved."
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-5">
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

  /* =======================================================
     MEMBER NOT FOUND
  ======================================================= */

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

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-5">

      <div className="max-w-7xl mx-auto">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-wrap justify-between items-center gap-3 mb-5">

          <div>
            <h1 className="text-2xl font-bold">
              PVC Card Designer
            </h1>

            <p className="text-sm text-slate-500">
              Preview ಮತ್ತು PDF ಒಂದೇ layout
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            <button
              onClick={() =>
                setLocked(!locked)
              }
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold"
            >
              {locked
                ? "🔓 Unlock Design"
                : "🔒 Lock Design"}
            </button>

            <button
              onClick={saveMaster}
              disabled={locked}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold disabled:opacity-50"
            >
              💾 Save Master
            </button>

            <button
              onClick={generatePDF}
              disabled={generating}
              className="px-4 py-2 rounded-xl bg-green-600 text-white font-semibold disabled:opacity-50"
            >
              {generating
                ? "Generating..."
                : "📄 Generate PDF"}
            </button>

          </div>
        </div>

        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <div className="mb-4 bg-white border rounded-xl px-4 py-3 font-semibold">
            {message}
          </div>
        )}

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="grid lg:grid-cols-[1fr_400px] gap-5">

          {/* =================================================
              PREVIEW
          ================================================= */}

          <div className="bg-white rounded-2xl shadow p-5 overflow-hidden">

            {/* SIDE */}

            <div className="flex gap-2 mb-5">

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

            {/* =================================================
                ONLY SELECTED SIDE IS SHOWN
            ================================================= */}

            <div className="overflow-auto pb-4">

              <p className="font-bold mb-2">
                {side === "front"
                  ? "Front Preview"
                  : "Back Preview"}
              </p>

              <CardCanvas
                cardSide={side}
                canvasRef={previewRef}
              />

            </div>

            {/* INFO */}

            <div className="mt-6 bg-slate-50 rounded-xl p-4 text-sm text-slate-600">

              <b>How to edit:</b>

              <br />

              Text / Image / QR / Heading / Design ಮೇಲೆ click ಮಾಡಿ.

              <br />

              Drag ಮಾಡಿ position ಬದಲಿಸಿ.

              <br />

              Right sideನಲ್ಲಿ X, Y, Width, Height manually ಹಾಕಬಹುದು.

              <br />

              Heading Text ಮತ್ತು Heading Design ಈಗ separate elements.

              <br />

              PDF ಕೂಡ ಇದೇ 856 × 539 design capture ಮಾಡುತ್ತದೆ.

            </div>

          </div>

          {/* =================================================
              EDIT SECTION
          ================================================= */}

          <div className="bg-white rounded-2xl shadow overflow-hidden">

            <div
              className="p-5 overflow-y-auto"
              style={{
                height:
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

              {/* =================================================
                  CARD SIZE
              ================================================= */}

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
                      value={widthInput}
                      disabled={locked}
                      onChange={(e) =>
                        setWidthInput(
                          e.target.value
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
                      value={heightInput}
                      disabled={locked}
                      onChange={(e) =>
                        setHeightInput(
                          e.target.value
                        )
                      }
                      className="w-full border rounded-xl p-3 mt-1"
                    />
                  </label>

                </div>

                <button
                  onClick={applySize}
                  disabled={locked}
                  className="w-full mt-3 bg-blue-600 text-white rounded-xl py-3 font-bold disabled:opacity-50"
                >
                  Apply Size
                </button>

                <button
                  onClick={standardPVC}
                  disabled={locked}
                  className="w-full mt-2 border rounded-xl py-3 font-semibold disabled:opacity-50"
                >
                  Standard PVC

                  <span className="block text-xs text-slate-500">
                    85.6 × 53.9 mm
                  </span>
                </button>

              </div>

              {/* =================================================
                  ADD
              ================================================= */}

              <div className="mt-5 border rounded-2xl p-4">

                <h3 className="font-bold">
                  ➕ Add Elements
                </h3>

                <button
                  onClick={addText}
                  disabled={locked}
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
                    disabled={locked}
                    className="hidden"
                    onChange={(e) => {
                      const file =
                        e.target.files?.[0];

                      if (file) {
                        addImage(file);
                      }

                      e.currentTarget.value =
                        "";
                    }}
                  />
                </label>

              </div>

              {/* =================================================
                  RESET
              ================================================= */}

              <button
                onClick={resetDesign}
                disabled={locked}
                className="w-full mt-5 border border-red-300 text-red-600 rounded-xl py-3 font-semibold disabled:opacity-50"
              >
                ♻️ Reset Design
              </button>

              {/* =================================================
                  SELECTED ELEMENT
              ================================================= */}

              {selected ? (

                <div className="mt-5 border-2 border-blue-200 rounded-2xl p-4">

                  <div className="flex items-center justify-between gap-2">

                    <h3 className="font-bold">
                      ✏️ Selected Element
                    </h3>

                    <button
                      onClick={() =>
                        deleteElement(
                          selected.id
                        )
                      }
                      disabled={locked}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                    >
                      🗑 Delete
                    </button>

                  </div>

                  <div className="mt-3 bg-slate-50 rounded-xl p-3 text-sm">

                    <b>Type:</b>{" "}
                    {selected.type}

                    <br />

                    <b>Side:</b>{" "}
                    {selected.side}

                  </div>

                  {/* =================================================
                      SHAPE SETTINGS
                  ================================================= */}

                  {selected.type ===
                    "shape" && (

                    <div className="mt-4 grid gap-3">

                      <label className="text-sm font-semibold">
                        Design / Background Color

                        <input
                          type="color"
                          value={
                            selected.background ||
                            "#1677e8"
                          }
                          disabled={locked}
                          onChange={(e) =>
                            updateElement(
                              selected.id,
                              {
                                background:
                                  e.target.value,
                              }
                            )
                          }
                          className="w-full h-12 mt-1"
                        />
                      </label>

                    </div>
                  )}

                  {/* =================================================
                      TEXT SETTINGS
                  ================================================= */}

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
                          disabled={locked}
                          onChange={(e) =>
                            updateElement(
                              selected.id,
                              {
                                text:
                                  e.target.value,
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
                            min="6"
                            max="100"
                            value={
                              selected.fontSize ||
                              20
                            }
                            disabled={locked}
                            onChange={(e) =>
                              updateElement(
                                selected.id,
                                {
                                  fontSize:
                                    Number(
                                      e.target.value
                                    ),
                                }
                              )
                            }
                            className="w-full border rounded-xl p-3 mt-1"
                          />
                        </label>

                        <label className="text-sm font-semibold">
                          Font Weight

                          <select
                            value={
                              selected.fontWeight ||
                              "500"
                            }
                            disabled={locked}
                            onChange={(e) =>
                              updateElement(
                                selected.id,
                                {
                                  fontWeight:
                                    e.target.value,
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
                            disabled={locked}
                            onChange={(e) =>
                              updateElement(
                                selected.id,
                                {
                                  color:
                                    e.target.value,
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
                              selected.background?.startsWith(
                                "#"
                              )
                                ? selected.background
                                : "#ffffff"
                            }
                            disabled={locked}
                            onChange={(e) =>
                              updateElement(
                                selected.id,
                                {
                                  background:
                                    e.target.value,
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
                          disabled={locked}
                          onChange={(e) =>
                            updateElement(
                              selected.id,
                              {
                                textAlign:
                                  e.target.value as TextAlign,
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

                  {/* =================================================
                      POSITION + SIZE
                  ================================================= */}

                  <div className="mt-5">

                    <h4 className="font-bold mb-3">
                      📍 Position & Size
                    </h4>

                    <div className="grid grid-cols-2 gap-3">

                      <label className="text-sm font-semibold">
                        X

                        <input
                          type="number"
                          value={
                            Math.round(
                              selected.x
                            )
                          }
                          disabled={locked}
                          onChange={(e) =>
                            updateElement(
                              selected.id,
                              {
                                x:
                                  Number(
                                    e.target.value
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
                          value={
                            Math.round(
                              selected.y
                            )
                          }
                          disabled={locked}
                          onChange={(e) =>
                            updateElement(
                              selected.id,
                              {
                                y:
                                  Number(
                                    e.target.value
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
                          min="10"
                          value={
                            Math.round(
                              selected.width
                            )
                          }
                          disabled={locked}
                          onChange={(e) =>
                            updateElement(
                              selected.id,
                              {
                                width:
                                  Number(
                                    e.target.value
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
                          min="10"
                          value={
                            Math.round(
                              selected.height
                            )
                          }
                          disabled={locked}
                          onChange={(e) =>
                            updateElement(
                              selected.id,
                              {
                                height:
                                  Number(
                                    e.target.value
                                  ),
                              }
                            )
                          }
                          className="w-full border rounded-xl p-3 mt-1"
                        />
                      </label>

                    </div>

                  </div>

                  {/* RESET POSITION */}

                  <button
                    onClick={() =>
                      updateElement(
                        selected.id,
                        {
                          x: 50,
                          y: 50,
                        }
                      )
                    }
                    disabled={locked}
                    className="w-full mt-4 border rounded-xl py-3 font-semibold disabled:opacity-50"
                  >
                    Reset Position
                  </button>

                </div>

              ) : (

                <div className="mt-5 bg-slate-50 rounded-2xl p-5 text-center text-sm text-slate-500">
                  Cardನಲ್ಲಿ text, image, QR ಅಥವಾ design ಮೇಲೆ click ಮಾಡಿ edit ಮಾಡಿ.
                </div>

              )}

              {/* =================================================
                  QR INFO
              ================================================= */}

              <div className="mt-5 bg-green-50 border border-green-200 rounded-2xl p-4">

                <h3 className="font-bold text-green-800">
                  📱 QR Code
                </h3>

                <p className="text-sm text-green-700 mt-1">
                  QR ಮೇಲೆ click ಮಾಡಿ drag ಮಾಡಬಹುದು.
                  X / Y / Width / Height manually
                  edit ಮಾಡಬಹುದು.
                </p>

              </div>

            </div>
          </div>

        </div>

        {/* =====================================================
            HIDDEN PDF CAPTURE CANVASES

            IMPORTANT:
            These are NOT display:none.
            They remain real DOM so html2canvas can capture
            the exact same layout.
        ===================================================== */}

        <div
          style={{
            position: "fixed",
            left: "-10000px",
            top: "0",
            width:
              `${DESIGN_WIDTH}px`,
            height:
              `${DESIGN_HEIGHT * 2}px`,
            pointerEvents: "none",
            overflow: "hidden",
            zIndex: -100,
          }}
        >

          <CardCanvas
            cardSide="front"
            canvasRef={frontPdfRef}
            captureMode
          />

          <div
            style={{
              height: "20px",
            }}
          />

          <CardCanvas
            cardSide="back"
            canvasRef={backPdfRef}
            captureMode
          />

        </div>

      </div>

    </main>
  );
}

/* =========================================================
   PAGE WRAPPER
========================================================= */

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
