"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "qrcode";

import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabase";

type Side = "front" | "back";

type CardElement = {
  id: string;
  label: string;
  kind: "text" | "photo" | "qr" | "image" | "footer";
  text: string;
  side: Side;

  x: number;
  y: number;
  width: number;
  height: number;

  fontSize: number;
  fontWeight: string;
  color: string;
  background: string;

  borderRadius?: number;
  src?: string;
};

type Member = {
  id: string;
  name?: string | null;
  membership_no?: string | number | null;
  designation?: string | null;
  village?: string | null;
  taluk?: string | null;
  district?: string | null;
  mobile?: string | null;
  aadhaar?: string | null;
  photo_url?: string | null;

  valid_from?: string | null;
  valid_until?: string | null;

  status?: string | null;
};

const DESIGN_WIDTH = 856;
const DESIGN_HEIGHT = 539;

const PVC_WIDTH_MM = 85.6;
const PVC_HEIGHT_MM = 53.98;

function formatDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${date.getFullYear()}`;
}

function getMemberValue(
  element: CardElement,
  member: Member
) {
  const label = `${element.label} ${element.id} ${element.text}`
    .toLowerCase()
    .replace(/\s+/g, " ");

  if (
    label.includes("name") ||
    label.includes("ಹೆಸರು")
  ) {
    return member.name || "";
  }

  if (
    label.includes("membership") ||
    label.includes("ಸದಸ್ಯತ್ವ") ||
    label.includes("ಸದಸ್ಯ ಸಂಖ್ಯೆ")
  ) {
    return member.membership_no
      ? String(member.membership_no)
      : "";
  }

  if (
    label.includes("designation") ||
    label.includes("ಹುದ್ದೆ")
  ) {
    return member.designation || "";
  }

  if (
    label.includes("village") ||
    label.includes("ಗ್ರಾಮ")
  ) {
    return member.village || "";
  }

  if (
    label.includes("taluk") ||
    label.includes("ತಾಲ್ಲೂಕು") ||
    label.includes("ತಾಲ್ಲೂಕಿನ")
  ) {
    return member.taluk || "";
  }

  if (
    label.includes("district") ||
    label.includes("ಜಿಲ್ಲೆ")
  ) {
    return member.district || "";
  }

  if (
    label.includes("mobile") ||
    label.includes("phone") ||
    label.includes("ಮೊಬೈಲ್")
  ) {
    return member.mobile || "";
  }

  if (
    label.includes("aadhaar") ||
    label.includes("ಆಧಾರ್")
  ) {
    return member.aadhaar || "";
  }

  if (
    label.includes("valid from") ||
    label.includes("valid-from") ||
    label.includes("validfrom") ||
    label.includes("validity from") ||
    label.includes("ಮಾನ್ಯತೆ ಪ್ರಾರಂಭ")
  ) {
    return member.valid_from
      ? `VALID FROM: ${formatDate(member.valid_from)}`
      : "";
  }

  if (
    label.includes("valid till") ||
    label.includes("valid-till") ||
    label.includes("validuntil") ||
    label.includes("valid until") ||
    label.includes("validity till") ||
    label.includes("ಮಾನ್ಯತೆ ಮುಕ್ತಾಯ")
  ) {
    return member.valid_until
      ? `VALID TILL: ${formatDate(member.valid_until)}`
      : "";
  }

  return element.text || "";
}

function getMemberPhoto(member: Member) {
  return member.photo_url || "";
}

export default function CardGeneratePage() {
  const [template, setTemplate] = useState<{
    id: number;
    name: string;
    design: {
      version?: number;
      cardWidth?: number;
      cardHeight?: number;
      elements: CardElement[];
    };
    is_locked: boolean;
  } | null>(null);

  const [members, setMembers] = useState<Member[]>([]);

  const [selectedMemberId, setSelectedMemberId] =
    useState("");

  const [pdfMode, setPdfMode] =
    useState<"pvc" | "manual">("pvc");

  const [manualWidth, setManualWidth] =
    useState("85.60");

  const [manualHeight, setManualHeight] =
    useState("53.98");

  const [loading, setLoading] = useState(true);

  const [generating, setGenerating] =
    useState(false);

  const [qrImage, setQrImage] = useState("");

  const frontRef =
    useRef<HTMLDivElement>(null);

  const backRef =
    useRef<HTMLDivElement>(null);

  /* =====================================================
     LOAD LOCKED TEMPLATE + APPROVED MEMBERS
  ===================================================== */

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const {
          data: templateData,
          error: templateError,
        } = await supabase
          .from("card_templates")
          .select(
            "id, name, design, is_locked"
          )
          .eq(
            "name",
            "Farmer PVC Card"
          )
          .eq("is_locked", true)
          .order("id", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

        if (templateError) {
          console.error(
            templateError
          );

          alert(
            "Locked Template load ಆಗಲಿಲ್ಲ:\n\n" +
              templateError.message
          );
        } else if (templateData) {
          setTemplate(
            templateData as any
          );
        }

        const {
          data: memberData,
          error: memberError,
        } = await supabase
          .from("applications")
          .select("*")
          .eq("status", "approved")
          .order("membership_no", {
            ascending: true,
          });

        if (memberError) {
          console.error(
            memberError
          );

          alert(
            "Approved Members load ಆಗಲಿಲ್ಲ:\n\n" +
              memberError.message
          );
        } else {
          setMembers(
            (memberData || []) as Member[]
          );
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* =====================================================
     SELECTED MEMBER
  ===================================================== */

  const selectedMember = useMemo(() => {
    return (
      members.find(
        (member) =>
          String(member.id) ===
          String(selectedMemberId)
      ) || null
    );
  }, [
    members,
    selectedMemberId,
  ]);

  /* =====================================================
     CREATE QR
  ===================================================== */

  useEffect(() => {
    async function makeQR() {
      if (!selectedMember) {
        setQrImage("");
        return;
      }

      const membership =
        selectedMember.membership_no;

      if (!membership) {
        setQrImage("");
        return;
      }

      try {
        const verificationUrl =
          typeof window !== "undefined"
            ? `${window.location.origin}/verify?membership=${encodeURIComponent(
                String(membership)
              )}`
            : `/verify?membership=${encodeURIComponent(
                String(membership)
              )}`;

        const image =
          await QRCode.toDataURL(
            verificationUrl,
            {
              width: 500,
              margin: 1,
              color: {
                dark: "#075c2b",
                light: "#ffffff",
              },
            }
          );

        setQrImage(image);
      } catch (error) {
        console.error(
          "QR error:",
          error
        );
      }
    }

    makeQR();
  }, [selectedMember]);

  /* =====================================================
     PDF SIZE
  ===================================================== */

  const pdfWidth =
    pdfMode === "pvc"
      ? PVC_WIDTH_MM
      : Number(manualWidth);

  const pdfHeight =
    pdfMode === "pvc"
      ? PVC_HEIGHT_MM
      : Number(manualHeight);

  /* =====================================================
     GENERATE PDF
  ===================================================== */

  async function generatePDF() {
    if (!template) {
      alert(
        "🔒 Locked Template ಸಿಗಲಿಲ್ಲ.\n\nಮೊದಲು Card Designerನಲ್ಲಿ template Lock ಮಾಡಿ."
      );
      return;
    }

    if (!template.is_locked) {
      alert(
        "Template locked ಆಗಿಲ್ಲ."
      );
      return;
    }

    if (!selectedMember) {
      alert(
        "ಮೊದಲು Approved Member select ಮಾಡಿ."
      );
      return;
    }

    if (
      !Number.isFinite(pdfWidth) ||
      !Number.isFinite(pdfHeight) ||
      pdfWidth <= 0 ||
      pdfHeight <= 0
    ) {
      alert(
        "PDF size ಸರಿಯಾಗಿ ನಮೂದಿಸಿ."
      );
      return;
    }

    if (
      !selectedMember.valid_from ||
      !selectedMember.valid_until
    ) {
      alert(
        "ಈ memberಗೆ Valid From / Valid Till ಇಲ್ಲ.\n\nಮೊದಲು member ಅನ್ನು ಮತ್ತೆ approve/update ಮಾಡಿ."
      );
      return;
    }

    if (
      !frontRef.current ||
      !backRef.current
    ) {
      alert(
        "Card preview ready ಆಗಿಲ್ಲ."
      );
      return;
    }

    setGenerating(true);

    try {
      /*
       * Wait for images/fonts to settle
       */
      await new Promise((resolve) =>
        setTimeout(resolve, 400)
      );

      const frontCanvas =
        await html2canvas(
          frontRef.current,
          {
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            scale: 3,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false,
          }
        );

      const backCanvas =
        await html2canvas(
          backRef.current,
          {
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            scale: 3,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false,
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
        pdfWidth >= pdfHeight
          ? "landscape"
          : "portrait";

      const pdf = new jsPDF({
        orientation,
        unit: "mm",
        format: [
          pdfWidth,
          pdfHeight,
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
        pdfWidth,
        pdfHeight,
        undefined,
        "FAST"
      );

      /*
       * BACK
       */

      pdf.addPage([
        pdfWidth,
        pdfHeight,
      ]);

      pdf.addImage(
        backImage,
        "PNG",
        0,
        0,
        pdfWidth,
        pdfHeight,
        undefined,
        "FAST"
      );

      const membership =
        selectedMember.membership_no ||
        selectedMember.id;

      const safeName =
        String(
          selectedMember.name ||
            "Member"
        )
          .replace(
            /[^a-zA-Z0-9\u0C80-\u0CFF_-]+/g,
            "-"
          )
          .replace(
            /^-+|-+$/g,
            ""
          );

      pdf.save(
        `PVC-Card-${membership}-${safeName}.pdf`
      );

      alert(
        "📄 PDF Generate ಆಯಿತು ✅"
      );
    } catch (error: any) {
      console.error(
        "PDF generation error:",
        error
      );

      alert(
        "PDF generate ಆಗಲಿಲ್ಲ:\n\n" +
          (error?.message ||
            "Unknown error")
      );
    } finally {
      setGenerating(false);
    }
  }

  /* =====================================================
     RENDER CARD
  ===================================================== */

  function renderCard(
    side: Side,
    cardRefValue: React.RefObject<HTMLDivElement | null>
  ) {
    if (!template) return null;

    const elements =
      template.design.elements.filter(
        (element) =>
          element.side === side
      );

    return (
      <div
        ref={cardRefValue}
        className="relative overflow-hidden"
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          minWidth: DESIGN_WIDTH,
          minHeight: DESIGN_HEIGHT,

          background:
            "linear-gradient(135deg,#ffffff 0%,#f7fff8 55%,#e8f6df 100%)",

          border:
            "4px solid #075c2b",

          borderRadius: 22,

          fontFamily:
            "Arial, Noto Sans Kannada, sans-serif",

          boxSizing: "border-box",
        }}
      >

        {/* =================================================
            CARD BACKGROUND
        ================================================= */}

        <div
          className="absolute left-0 right-0 top-0 pointer-events-none"
          style={{
            height: 115,
            background:
              "linear-gradient(135deg,#ffffff,#f6fff8)",
            borderBottom:
              "10px solid #075c2b",
          }}
        />

        <div
          className="absolute left-0 right-0 bottom-0 pointer-events-none"
          style={{
            height: 150,
            background:
              "linear-gradient(to top,#d8efc8,transparent)",
            opacity: 0.55,
          }}
        />

        {/* =================================================
            TEMPLATE ELEMENTS
        ================================================= */}

        {elements.map(
          (element) => {

            /*
             * MEMBER PHOTO
             */

            if (
              element.kind ===
              "photo"
            ) {
              const photo =
                getMemberPhoto(
                  selectedMember!
                );

              return (
                <div
                  key={element.id}
                  style={{
                    position:
                      "absolute",

                    left: element.x,
                    top: element.y,

                    width:
                      element.width,
                    height:
                      element.height,

                    background:
                      element.background ||
                      "#ffffff",

                    borderRadius:
                      element.borderRadius ||
                      0,

                    overflow:
                      "hidden",

                    zIndex: 30,

                    border:
                      "4px solid #075c2b",

                    boxSizing:
                      "border-box",
                  }}
                >
                  {photo ? (
                    <img
                      src={photo}
                      alt="Member"
                      crossOrigin="anonymous"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit:
                          "cover",
                        display:
                          "block",
                      }}
                    />
                  ) : (
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
                          "center",
                        flexDirection:
                          "column",
                        color:
                          "#64748b",
                        fontWeight:
                          700,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 45,
                        }}
                      >
                        👤
                      </div>

                      <div>
                        Photo
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            /*
             * QR CODE
             */

            if (
              element.kind ===
              "qr"
            ) {
              return (
                <div
                  key={element.id}
                  style={{
                    position:
                      "absolute",

                    left: element.x,
                    top: element.y,

                    width:
                      element.width,
                    height:
                      element.height,

                    background:
                      "#ffffff",

                    borderRadius:
                      element.borderRadius ||
                      0,

                    padding: 8,

                    boxSizing:
                      "border-box",

                    zIndex: 40,

                    border:
                      "4px solid #075c2b",
                  }}
                >
                  {qrImage && (
                    <img
                      src={qrImage}
                      alt="QR"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit:
                          "contain",
                        display:
                          "block",
                      }}
                    />
                  )}
                </div>
              );
            }

            /*
             * STATIC IMAGE
             */

            if (
              element.kind ===
              "image"
            ) {
              return (
                <div
                  key={element.id}
                  style={{
                    position:
                      "absolute",

                    left: element.x,
                    top: element.y,

                    width:
                      element.width,
                    height:
                      element.height,

                    background:
                      element.background,

                    borderRadius:
                      element.borderRadius ||
                      0,

                    overflow:
                      "hidden",

                    zIndex: 25,
                  }}
                >
                  {element.src && (
                    <img
                      src={element.src}
                      alt="Card Image"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit:
                          "contain",
                        display:
                          "block",
                      }}
                    />
                  )}
                </div>
              );
            }

            /*
             * TEXT / FOOTER
             */

            const text =
              getMemberValue(
                element,
                selectedMember!
              );

            return (
              <div
                key={element.id}
                style={{
                  position:
                    "absolute",

                  left: element.x,
                  top: element.y,

                  width:
                    element.width,
                  height:
                    element.height,

                  fontSize:
                    element.fontSize,

                  fontWeight:
                    element.fontWeight,

                  color:
                    element.color,

                  background:
                    element.background,

                  borderRadius:
                    element.borderRadius ||
                    0,

                  padding:
                    element.background !==
                    "transparent"
                      ? 6
                      : 0,

                  display:
                    "flex",

                  alignItems:
                    "center",

                  boxSizing:
                    "border-box",

                  overflow:
                    "hidden",

                  whiteSpace:
                    "pre-wrap",

                  zIndex:
                    element.kind ===
                    "footer"
                      ? 50
                      : 60,
                }}
              >
                {text}
              </div>
            );
          }
        )}

      </div>
    );
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <AdminGuard>
        <main className="min-h-screen flex items-center justify-center bg-slate-100">
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <div className="text-4xl mb-3">
              ⏳
            </div>

            <div className="font-bold">
              PDF Generator Loading...
            </div>
          </div>
        </main>
      </AdminGuard>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <AdminGuard>
      <main className="min-h-screen bg-slate-100 p-4 md:p-6">

        <div className="max-w-[1500px] mx-auto">

          {/* HEADER */}

          <div className="bg-white rounded-2xl shadow p-5 mb-5">

            <div className="flex flex-wrap items-center justify-between gap-4">

              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold">
                  📄 PVC Card PDF Generator
                </h1>

                <p className="text-slate-500 mt-1">
                  🔒 Locked Card Template ಬಳಸಿ PDF generate ಮಾಡಿ
                </p>
              </div>

              <div
                className={`px-4 py-2 rounded-xl font-bold ${
                  template
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {template
                  ? "🔒 Locked Template Ready"
                  : "❌ Locked Template Not Found"}
              </div>

            </div>

          </div>

          {/* CONTROLS */}

          <div className="grid lg:grid-cols-[350px_1fr] gap-5">

            <aside className="bg-white rounded-2xl shadow p-5 h-fit">

              <h2 className="text-xl font-extrabold mb-5">
                ⚙️ PDF Settings
              </h2>

              {/* MEMBER */}

              <div className="mb-5">

                <label className="block font-bold mb-2">
                  Approved Member
                </label>

                <select
                  value={
                    selectedMemberId
                  }
                  onChange={(e) =>
                    setSelectedMemberId(
                      e.target.value
                    )
                  }
                  className="w-full border rounded-xl p-3"
                >
                  <option value="">
                    -- Select Member --
                  </option>

                  {members.map(
                    (member) => (
                      <option
                        key={member.id}
                        value={member.id}
                      >
                        {member.membership_no ||
                          "-"}{" "}
                        —{" "}
                        {member.name ||
                          "Member"}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* SELECTED MEMBER INFO */}

              {selectedMember && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5">

                  <div className="font-bold text-green-800 mb-2">
                    Selected Member
                  </div>

                  <div className="text-sm space-y-1">

                    <div>
                      <b>Name:</b>{" "}
                      {selectedMember.name ||
                        "-"}
                    </div>

                    <div>
                      <b>Membership:</b>{" "}
                      {selectedMember.membership_no ||
                        "-"}
                    </div>

                    <div>
                      <b>Valid From:</b>{" "}
                      {formatDate(
                        selectedMember.valid_from
                      )}
                    </div>

                    <div>
                      <b>Valid Till:</b>{" "}
                      {formatDate(
                        selectedMember.valid_until
                      )}
                    </div>

                  </div>

                </div>
              )}

              {/* PDF MODE */}

              <div className="mb-5">

                <label className="block font-bold mb-2">
                  PDF Card Size
                </label>

                <div className="grid grid-cols-2 gap-2">

                  <button
                    onClick={() =>
                      setPdfMode("pvc")
                    }
                    className={`rounded-xl p-3 font-bold border ${
                      pdfMode === "pvc"
                        ? "bg-green-700 text-white border-green-700"
                        : "bg-white"
                    }`}
                  >
                    🪪 PVC Size
                  </button>

                  <button
                    onClick={() =>
                      setPdfMode(
                        "manual"
                      )
                    }
                    className={`rounded-xl p-3 font-bold border ${
                      pdfMode ===
                      "manual"
                        ? "bg-green-700 text-white border-green-700"
                        : "bg-white"
                    }`}
                  >
                    📐 Manual
                  </button>

                </div>

              </div>

              {/* PVC SIZE */}

              {pdfMode === "pvc" && (
                <div className="bg-slate-50 rounded-xl p-4 mb-5">

                  <div className="font-bold">
                    Standard PVC Card
                  </div>

                  <div className="text-slate-600 mt-1">
                    85.60 × 53.98 mm
                  </div>

                </div>
              )}

              {/* MANUAL SIZE */}

              {pdfMode ===
                "manual" && (
                <div className="grid grid-cols-2 gap-3 mb-5">

                  <div>
                    <label className="block text-sm font-bold mb-1">
                      Width (mm)
                    </label>

                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={
                        manualWidth
                      }
                      onChange={(e) =>
                        setManualWidth(
                          e.target.value
                        )
                      }
                      className="w-full border rounded-xl p-3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1">
                      Height (mm)
                    </label>

                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={
                        manualHeight
                      }
                      onChange={(e) =>
                        setManualHeight(
                          e.target.value
                        )
                      }
                      className="w-full border rounded-xl p-3"
                    />
                  </div>

                </div>
              )}

              {/* SIZE SUMMARY */}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">

                <div className="font-bold text-blue-800">
                  PDF Output
                </div>

                <div className="mt-1 text-blue-700">
                  {pdfWidth.toFixed(2)} ×{" "}
                  {pdfHeight.toFixed(2)} mm
                </div>

                <div className="text-sm text-blue-600 mt-1">
                  Page 1 = Front
                  <br />
                  Page 2 = Back
                </div>

              </div>

              {/* GENERATE */}

              <button
                onClick={generatePDF}
                disabled={
                  generating ||
                  !template ||
                  !selectedMember
                }
                className="w-full bg-green-700 hover:bg-green-800 disabled:bg-slate-400 text-white rounded-xl py-4 font-extrabold text-lg"
              >
                {generating
                  ? "⏳ Generating PDF..."
                  : "📄 Generate PDF"}
              </button>

            </aside>

            {/* PREVIEW */}

            <section className="bg-slate-200 rounded-2xl p-4 md:p-8 overflow-auto">

              <div className="text-center mb-4">

                <h2 className="text-xl font-extrabold">
                  👁️ PDF Preview
                </h2>

                <p className="text-slate-500 text-sm">
                  Locked templateನ exact design preview
                </p>

              </div>

              {!template && (
                <div className="bg-white rounded-2xl p-10 text-center">

                  <div className="text-5xl mb-4">
                    🔒
                  </div>

                  <h3 className="text-xl font-bold">
                    Locked Template ಇಲ್ಲ
                  </h3>

                  <p className="text-slate-500 mt-2">
                    ಮೊದಲು Card Designerನಲ್ಲಿ
                    template save ಮಾಡಿ lock ಮಾಡಿ.
                  </p>

                </div>
              )}

              {template && (
                <div className="space-y-10">

                  {/* FRONT */}

                  <div>

                    <div className="font-bold text-center mb-3">
                      FRONT
                    </div>

                    <div className="flex justify-center overflow-auto">

                      <div>
                        {renderCard(
                          "front",
                          frontRef
                        )}
                      </div>

                    </div>

                  </div>

                  {/* BACK */}

                  <div>

                    <div className="font-bold text-center mb-3">
                      BACK
                    </div>

                    <div className="flex justify-center overflow-auto">

                      <div>
                        {renderCard(
                          "back",
                          backRef
                        )}
                      </div>

                    </div>

                  </div>

                </div>
              )}

            </section>

          </div>

        </div>

      </main>
    </AdminGuard>
  );
}
