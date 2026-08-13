"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

import QRCode from "qrcode";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabase";

type Side = "front" | "back";

type ElementKind =
  | "text"
  | "photo"
  | "qr"
  | "image"
  | "footer";

type CardElement = {
  id: string;
  label: string;
  kind: ElementKind;
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

const CARD_WIDTH = 856;
const CARD_HEIGHT = 539;

const TEMPLATE_NAME = "Farmer PVC Card";

/* ==================================================
   MEMBER DATA
   The card-new page is opened as /admin/card-new?id=<UUID>.
   We try the common member/application tables and map
   whichever columns exist to the card fields.
================================================== */

type MemberRecord = Record<string, any>;

const MEMBER_TABLES = [
  "members",
  "applications",
  "membership_applications",
  "member_applications",
  "member_profiles",
];

function firstValue(
  row: MemberRecord | null | undefined,
  keys: string[]
): any {
  if (!row) return null;

  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }

  return null;
}

function textValue(
  row: MemberRecord | null | undefined,
  keys: string[],
  fallback: string
): string {
  const value = firstValue(row, keys);
  return value === null ? fallback : String(value);
}

function dateValue(
  row: MemberRecord | null | undefined,
  keys: string[],
  fallback: string
): string {
  const value = firstValue(row, keys);
  if (!value) return fallback;

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function applyMemberDataToElements(
  current: CardElement[],
  member: MemberRecord
): CardElement[] {
  const name = textValue(
    member,
    [
      "full_name",
      "member_name",
      "applicant_name",
      "name",
      "kannada_name",
      "fullName",
    ],
    "ಸದಸ್ಯರ ಹೆಸರು"
  );

  const membership = textValue(
    member,
    [
      "membership_number",
      "membership_no",
      "member_number",
      "member_no",
      "membership_id",
      "card_number",
    ],
    "Membership Number"
  );

  const village = textValue(
    member,
    ["village", "village_name", "gram", "gram_name"],
    "ಗ್ರಾಮದ ಹೆಸರು"
  );

  const taluk = textValue(
    member,
    ["taluk", "taluk_name", "talukName"],
    "ತಾಲ್ಲೂಕಿನ ಹೆಸರು"
  );

  const district = textValue(
    member,
    ["district", "district_name", "districtName"],
    "ಜಿಲ್ಲೆಯ ಹೆಸರು"
  );

  const mobile = textValue(
    member,
    [
      "mobile",
      "mobile_number",
      "phone",
      "phone_number",
      "contact_number",
    ],
    "9980XXXXXX"
  );

  const validFrom = dateValue(
    member,
    [
      "valid_from",
      "valid_from_date",
      "membership_from",
      "start_date",
      "approved_date",
      "approval_date",
    ],
    "13-08-2026"
  );

  const validTill = dateValue(
    member,
    [
      "valid_till",
      "valid_till_date",
      "valid_until",
      "expiry_date",
      "membership_expiry",
      "expires_at",
      "end_date",
    ],
    "12-08-2027"
  );

  return current.map((element) => {
    switch (element.id) {
      case "name":
        return { ...element, text: name };
      case "membership":
        return { ...element, text: membership };
      case "village":
        return { ...element, text: village };
      case "taluk":
        return { ...element, text: taluk };
      case "district":
        return { ...element, text: district };
      case "mobile":
        return { ...element, text: mobile };
      case "valid-from":
      case "back-valid-from":
        return { ...element, text: `VALID FROM: ${validFrom}` };
      case "valid-till":
      case "back-valid-till":
        return { ...element, text: `VALID TILL: ${validTill}` };
      default:
        return element;
    }
  });
}

const initialElements: CardElement[] = [
  {
    id: "org-kn",
    label: "ಸಂಘಟನೆಯ ಹೆಸರು",
    kind: "text",
    text: "ಕರ್ನಾಟಕ ರಾಜ್ಯ ರೈತ ಸಂಘ ಹಾಗೂ ಹಸಿರು ಸೇನೆ",
    side: "front",
    x: 190,
    y: 25,
    width: 620,
    height: 45,
    fontSize: 28,
    fontWeight: "800",
    color: "#075c2b",
    background: "transparent",
  },

  {
    id: "org-en",
    label: "English Organization Name",
    kind: "text",
    text: "KARNATAKA RAJYA RAITHA SANGH & GREEN BRIGADE",
    side: "front",
    x: 205,
    y: 72,
    width: 620,
    height: 32,
    fontSize: 18,
    fontWeight: "700",
    color: "#087332",
    background: "transparent",
  },

  {
    id: "reg",
    label: "Registration Number",
    kind: "text",
    text: "RGE:303/1/23",
    side: "front",
    x: 690,
    y: 8,
    width: 150,
    height: 25,
    fontSize: 17,
    fontWeight: "700",
    color: "#111111",
    background: "transparent",
  },

  {
    id: "name",
    label: "ಹೆಸರು",
    kind: "text",
    text: "ಸದಸ್ಯರ ಹೆಸರು",
    side: "front",
    x: 300,
    y: 155,
    width: 400,
    height: 35,
    fontSize: 22,
    fontWeight: "700",
    color: "#111111",
    background: "transparent",
  },

  {
    id: "membership",
    label: "Membership Number",
    kind: "text",
    text: "Membership Number",
    side: "front",
    x: 300,
    y: 200,
    width: 400,
    height: 32,
    fontSize: 20,
    fontWeight: "600",
    color: "#111111",
    background: "transparent",
  },

  {
    id: "village",
    label: "ಗ್ರಾಮ",
    kind: "text",
    text: "ಗ್ರಾಮದ ಹೆಸರು",
    side: "front",
    x: 300,
    y: 245,
    width: 350,
    height: 32,
    fontSize: 19,
    fontWeight: "500",
    color: "#111111",
    background: "transparent",
  },

  {
    id: "taluk",
    label: "ತಾಲ್ಲೂಕು",
    kind: "text",
    text: "ತಾಲ್ಲೂಕಿನ ಹೆಸರು",
    side: "front",
    x: 300,
    y: 285,
    width: 350,
    height: 32,
    fontSize: 19,
    fontWeight: "500",
    color: "#111111",
    background: "transparent",
  },

  {
    id: "district",
    label: "ಜಿಲ್ಲೆ",
    kind: "text",
    text: "ಜಿಲ್ಲೆಯ ಹೆಸರು",
    side: "front",
    x: 300,
    y: 325,
    width: 350,
    height: 32,
    fontSize: 19,
    fontWeight: "500",
    color: "#111111",
    background: "transparent",
  },

  {
    id: "mobile",
    label: "ಮೊಬೈಲ್",
    kind: "text",
    text: "9980XXXXXX",
    side: "front",
    x: 300,
    y: 365,
    width: 300,
    height: 32,
    fontSize: 19,
    fontWeight: "500",
    color: "#111111",
    background: "transparent",
  },

  {
    id: "valid-from",
    label: "Valid From",
    kind: "text",
    text: "VALID FROM: 13-08-2026",
    side: "front",
    x: 300,
    y: 415,
    width: 250,
    height: 35,
    fontSize: 18,
    fontWeight: "800",
    color: "#075c2b",
    background: "#ffffff",
  },

  {
    id: "valid-till",
    label: "Valid Till",
    kind: "text",
    text: "VALID TILL: 12-08-2027",
    side: "front",
    x: 560,
    y: 415,
    width: 250,
    height: 35,
    fontSize: 18,
    fontWeight: "800",
    color: "#075c2b",
    background: "#ffffff",
  },

  {
    id: "front-photo",
    label: "Member Photo",
    kind: "photo",
    text: "",
    side: "front",
    x: 45,
    y: 145,
    width: 190,
    height: 230,
    fontSize: 18,
    fontWeight: "700",
    color: "#075c2b",
    background: "#ffffff",
    borderRadius: 12,
  },

  {
    id: "front-qr",
    label: "QR Code",
    kind: "qr",
    text: "",
    side: "front",
    x: 650,
    y: 145,
    width: 170,
    height: 170,
    fontSize: 18,
    fontWeight: "700",
    color: "#075c2b",
    background: "#ffffff",
    borderRadius: 12,
  },

  {
    id: "back-title",
    label: "Back Heading",
    kind: "text",
    text: "ಸದಸ್ಯತ್ವ ಗುರುತಿನ ಚೀಟಿ",
    side: "back",
    x: 180,
    y: 35,
    width: 500,
    height: 45,
    fontSize: 28,
    fontWeight: "800",
    color: "#075c2b",
    background: "transparent",
  },

  {
    id: "back-note",
    label: "Back Information",
    kind: "text",
    text: "ಈ ಕಾರ್ಡ್ ಸಂಘಟನೆಯ ಸದಸ್ಯತ್ವವನ್ನು ದೃಢೀಕರಿಸುತ್ತದೆ.",
    side: "back",
    x: 90,
    y: 130,
    width: 600,
    height: 45,
    fontSize: 20,
    fontWeight: "600",
    color: "#222222",
    background: "transparent",
  },

  {
    id: "back-valid-from",
    label: "Back Valid From",
    kind: "text",
    text: "VALID FROM: 13-08-2026",
    side: "back",
    x: 100,
    y: 400,
    width: 270,
    height: 35,
    fontSize: 18,
    fontWeight: "800",
    color: "#075c2b",
    background: "#ffffff",
  },

  {
    id: "back-valid-till",
    label: "Back Valid Till",
    kind: "text",
    text: "VALID TILL: 12-08-2027",
    side: "back",
    x: 390,
    y: 400,
    width: 270,
    height: 35,
    fontSize: 18,
    fontWeight: "800",
    color: "#075c2b",
    background: "#ffffff",
  },

  {
    id: "front-footer",
    label: "Front Footer",
    kind: "footer",
    text: "🌱 ರೈತರು ನಮ್ಮ ಹೆಮ್ಮೆ",
    side: "front",
    x: 45,
    y: 475,
    width: 766,
    height: 45,
    fontSize: 17,
    fontWeight: "800",
    color: "#ffffff",
    background: "#075c2b",
    borderRadius: 8,
  },

  {
    id: "back-footer",
    label: "Back Footer",
    kind: "footer",
    text: "🌱 ರೈತರು ನಮ್ಮ ಹೆಮ್ಮೆ | 🚜 ರೈತ ಬೆಳೆ — ದೇಶದ ಬೆಳೆ",
    side: "back",
    x: 45,
    y: 475,
    width: 766,
    height: 45,
    fontSize: 17,
    fontWeight: "800",
    color: "#ffffff",
    background: "#075c2b",
    borderRadius: 8,
  },
];


function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const CARD_PRINT_WIDTH_MM = 85.6;
const CARD_PRINT_HEIGHT_MM = 53.9;

function pxToMm(px: number) {
  return (px / CARD_WIDTH) * CARD_PRINT_WIDTH_MM;
}

function buildCardHtml(
  elements: CardElement[],
  side: Side,
  memberPhoto: string | null,
  qrImage: string
) {
  const sideElements = elements.filter((e) => e.side === side);

  const elementHtml = sideElements.map((element) => {
    const commonStyle = [
      "position:absolute",
      `left:${pxToMm(element.x)}mm`,
      `top:${pxToMm(element.y)}mm`,
      `width:${pxToMm(element.width)}mm`,
      `height:${pxToMm(element.height)}mm`,
      `font-size:${pxToMm(element.fontSize)}mm`,
      `font-weight:${escapeHtml(element.fontWeight)}`,
      `color:${escapeHtml(element.color)}`,
      `background:${escapeHtml(element.background)}`,
      `border-radius:${pxToMm(element.borderRadius || 0)}mm`,
      "box-sizing:border-box",
      "overflow:hidden",
      `z-index:${element.kind === "footer" ? 50 : 60}`,
      element.background !== "transparent" ? `padding:${pxToMm(6)}mm` : "padding:0",
    ].join(";");

    if (element.kind === "photo") {
      return `
        <div style="${commonStyle};border:${pxToMm(4)}mm solid #166534;background:#fff;">
          ${
            memberPhoto
              ? `<img src="${escapeHtml(memberPhoto)}" alt="Member" style="width:100%;height:100%;object-fit:cover;display:block;" />`
              : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:${pxToMm(42)}mm;">👤</div>`
          }
        </div>
      `;
    }

    if (element.kind === "qr") {
      return `
        <div style="${commonStyle};border:${pxToMm(4)}mm solid #166534;background:#fff;padding:${pxToMm(8)}mm;">
          ${
            qrImage
              ? `<img src="${escapeHtml(qrImage)}" alt="QR" style="width:100%;height:100%;display:block;" />`
              : ""
          }
        </div>
      `;
    }

    if (element.kind === "image") {
      return `
        <div style="${commonStyle};">
          ${
            element.src
              ? `<img src="${escapeHtml(element.src)}" alt="Card" style="width:100%;height:100%;object-fit:contain;display:block;" />`
              : ""
          }
        </div>
      `;
    }

    return `
      <div style="${commonStyle};display:flex;align-items:center;">
        ${escapeHtml(element.text)}
      </div>
    `;
  }).join("");

  return elementHtml;
}

function PdfGeneratorPageContent() {
  const searchParams = useSearchParams();
  const memberId =
    searchParams.get("id") ||
    searchParams.get("member_id") ||
    searchParams.get("application_id") ||
    "";

  const [elements, setElements] = useState<CardElement[]>(
    cloneElements(initialElements)
  );
  const [memberData, setMemberData] = useState<MemberRecord | null>(null);
  const [memberPhoto, setMemberPhoto] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        // Load the saved card template first.
        const { data: template, error: templateError } = await supabase
          .from("card_templates")
          .select("id, name, design, is_locked")
          .eq("name", TEMPLATE_NAME)
          .order("id", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (templateError) throw templateError;

        let nextElements = cloneElements(initialElements);

        if (
          template?.design &&
          Array.isArray((template.design as any).elements) &&
          (template.design as any).elements.length > 0
        ) {
          nextElements = cloneElements((template.design as any).elements);
        }

        if (memberId) {
          let found: MemberRecord | null = null;

          for (const table of MEMBER_TABLES) {
            try {
              const { data, error: tableError } = await supabase
                .from(table)
                .select("*")
                .eq("id", memberId)
                .maybeSingle();

              if (!tableError && data) {
                found = data as MemberRecord;
                break;
              }
            } catch {
              // Try the next possible member table.
            }
          }

          if (!found) {
            throw new Error(
              "ಈ ID ಗೆ member details ಸಿಗಲಿಲ್ಲ. URL ನಲ್ಲಿ ಸರಿಯಾದ member id ಬಳಸಿ."
            );
          }

          nextElements = applyMemberDataToElements(nextElements, found);
          setMemberData(found);

          const photo = firstValue(found, [
            "photo_url",
            "photo",
            "profile_photo",
            "profile_photo_url",
            "member_photo",
            "image_url",
            "image",
            "photo_path",
          ]);

          if (photo) {
            setMemberPhoto(String(photo));
          }
        }

        if (!cancelled) {
          setElements(nextElements);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "PDF data load ಆಗಲಿಲ್ಲ.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [memberId]);

  useEffect(() => {
    async function createQR() {
      try {
        const membershipNumber = textValue(
          memberData,
          [
            "membership_number",
            "membership_no",
            "member_number",
            "member_no",
            "membership_id",
            "card_number",
          ],
          memberId || "MEMBERSHIP_NUMBER"
        );

        const url =
          typeof window !== "undefined"
            ? `${window.location.origin}/verify?membership=${encodeURIComponent(
                membershipNumber
              )}`
            : `https://example.com/verify?membership=${encodeURIComponent(
                membershipNumber
              )}`;

        const image = await QRCode.toDataURL(url, {
          width: 500,
          margin: 1,
          color: {
            dark: "#075c2b",
            light: "#ffffff",
          },
        });

        setQrImage(image);
      } catch (e) {
        console.error("QR generation error:", e);
      }
    }

    createQR();
  }, [memberData, memberId]);

  async function generatePdf() {
    if (typeof window === "undefined") return;

    const container = document.getElementById("pdf-print-container");
    if (!container) return;

    const images = Array.from(container.querySelectorAll("img"));

    await Promise.all(
      images.map(
        (img) =>
          img.complete
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                img.onload = () => resolve();
                img.onerror = () => resolve();
              })
      )
    );

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });

    window.print();
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <div className="text-4xl mb-3">⏳</div>
          <div className="font-bold">PDF data loading...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100 p-5">
        <div className="bg-white rounded-2xl shadow p-8 max-w-xl text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <div className="font-bold text-red-700 mb-3">{error}</div>
          <div className="text-slate-500 text-sm">
            URL format: /admin/card-pdf?id=MEMBER_ID
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media screen {
          body {
            margin: 0;
            background: #e5e7eb;
          }

          .pdf-toolbar {
            position: sticky;
            top: 0;
            z-index: 999;
            padding: 14px;
            background: #ffffff;
            border-bottom: 1px solid #d1d5db;
            display: flex;
            justify-content: center;
            gap: 10px;
          }

          .pdf-page {
            margin: 20px auto;
            background: #ffffff;
            box-shadow: 0 8px 30px rgba(0,0,0,.15);
          }
        }

        @media print {
          @page {
            size: 85.6mm 53.9mm;
            margin: 0;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            width: 85.6mm !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .pdf-toolbar {
            display: none !important;
          }

          #pdf-print-container {
            display: block !important;
            width: 85.6mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .pdf-page {
            position: relative !important;
            width: 85.6mm !important;
            height: 53.9mm !important;
            min-height: 53.9mm !important;
            max-height: 53.9mm !important;
            margin: 0 !important;
            padding: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            break-after: page !important;
            page-break-after: always !important;
          }

          .pdf-page:last-child {
            break-after: auto !important;
            page-break-after: auto !important;
          }

          .pdf-card {
            position: relative !important;
            width: ${CARD_PRINT_WIDTH_MM}mm !important;
            height: ${CARD_PRINT_HEIGHT_MM}mm !important;
            min-width: ${CARD_PRINT_WIDTH_MM}mm !important;
            min-height: ${CARD_PRINT_HEIGHT_MM}mm !important;
            max-width: ${CARD_PRINT_WIDTH_MM}mm !important;
            max-height: ${CARD_PRINT_HEIGHT_MM}mm !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            border: ${pxToMm(4)}mm solid #075c2b !important;
            border-radius: ${pxToMm(22)}mm !important;
            background: linear-gradient(
              135deg,
              #ffffff 0%,
              #f7fff8 55%,
              #e8f6df 100%
            ) !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .pdf-card-background {
            position: absolute !important;
            inset: 0 !important;
            background: linear-gradient(
              135deg,
              #ffffff 0%,
              #f7fff8 55%,
              #e8f6df 100%
            ) !important;
          }

          .pdf-card-top {
            position: absolute !important;
            left: 0 !important;
            right: 0 !important;
            top: 0 !important;
            height: ${pxToMm(115)}mm !important;
            background: linear-gradient(135deg, #ffffff, #f6fff8) !important;
            border-bottom: ${pxToMm(10)}mm solid #075c2b !important;
          }

          .pdf-card-bottom {
            position: absolute !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            height: ${pxToMm(150)}mm !important;
            background: linear-gradient(
              to top,
              #d8efc8,
              transparent
            ) !important;
            opacity: 0.55 !important;
          }

          #pdf-print-container img {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
        }
      `}</style>

      <AdminGuard>
        <main className="min-h-screen bg-slate-100 p-4">
          <div className="pdf-toolbar">
            <button
              type="button"
              onClick={generatePdf}
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold"
            >
              🖨️ Generate PDF / Print
            </button>
          </div>

          <div id="pdf-print-container">
            <div className="pdf-page">
              <div className="pdf-card">
                <div className="pdf-card-background" />
                <div className="pdf-card-top" />
                <div className="pdf-card-bottom" />
                <div
                  dangerouslySetInnerHTML={{
                    __html: buildCardHtml(
                      elements,
                      "front",
                      memberPhoto,
                      qrImage
                    )
                      .replace(
                        /^\\s*<div class="pdf-page">[\\s\\S]*?<div class="pdf-card">/,
                        ""
                      )
                      .replace(/<\\/div>\\s*$/, ""),
                  }}
                />
              </div>
            </div>

            <div className="pdf-page">
              <div className="pdf-card">
                <div className="pdf-card-background" />
                <div className="pdf-card-top" />
                <div className="pdf-card-bottom" />
                <div
                  dangerouslySetInnerHTML={{
                    __html: buildCardHtml(
                      elements,
                      "back",
                      memberPhoto,
                      qrImage
                    )
                      .replace(
                        /^\\s*<div class="pdf-page">[\\s\\S]*?<div class="pdf-card">/,
                        ""
                      )
                      .replace(/<\\/div>\\s*$/, ""),
                  }}
                />
              </div>
            </div>
          </div>
        </main>
      </AdminGuard>
    </>
  );
}

export default function CardPdfPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-slate-100">
          <div className="bg-white rounded-2xl shadow p-8 font-bold">
            PDF Loading...
          </div>
        </main>
      }
    >
      <PdfGeneratorPageContent />
    </Suspense>
  );
}
