"use client";

import {
  Suspense,
  useEffect,
  useRef,
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

function cloneElements(elements: CardElement[]) {
  return elements.map((e) => ({
    ...e,
  }));
}

/* ==================================================
   MASTER TEMPLATE SANITIZER

   Member values are displayed on the current card, but
   they must NEVER be saved into the master template.
   Only the design/position/style is saved.
================================================== */
const MEMBER_DATA_ELEMENT_IDS = new Set([
  "name",
  "membership",
  "village",
  "taluk",
  "district",
  "mobile",
  "valid-from",
  "valid-till",
  "back-valid-from",
  "back-valid-till",
]);

function getMasterTemplateElements(
  current: CardElement[]
): CardElement[] {
  const initialById = new Map(
    initialElements.map((element) => [element.id, element])
  );

  return current.map((element) => {
    if (!MEMBER_DATA_ELEMENT_IDS.has(element.id)) {
      return { ...element };
    }

    const original = initialById.get(element.id);

    if (!original) {
      return { ...element };
    }

    // Keep every design change (position, size, font, color,
    // background, label, etc.), but reset only the dynamic
    // member value so the next member gets their own details.
    return {
      ...element,
      text: original.text,
    };
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(String(reader.result));
    };

    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

function NewCardDesignerPageContent() {
  const [elements, setElements] = useState<CardElement[]>(
    cloneElements(initialElements)
  );

  const [side, setSide] = useState<Side>("front");

  const [selectedId, setSelectedId] =
    useState<string | null>("name");

  const [memberPhoto, setMemberPhoto] =
    useState<string | null>(null);

  const [qrImage, setQrImage] = useState("");

  const [templateId, setTemplateId] =
    useState<number | null>(null);

  const [locked, setLocked] = useState(false);

  const [loadingTemplate, setLoadingTemplate] =
    useState(true);

  const [saving, setSaving] = useState(false);

  const searchParams = useSearchParams();
  const memberId =
    searchParams.get("id") ||
    searchParams.get("member_id") ||
    searchParams.get("application_id") ||
    "";

  const [memberData, setMemberData] =
    useState<MemberRecord | null>(null);
  const [memberLoading, setMemberLoading] =
    useState(false);
  const [memberError, setMemberError] =
    useState("");

  const cardRef = useRef<HTMLDivElement>(null);

  /*
  =========================================
  LOAD TEMPLATE
  =========================================
  */

  useEffect(() => {
    async function loadTemplate() {
      setLoadingTemplate(true);

      try {
        const { data, error } = await supabase
          .from("card_templates")
          .select(
            "id, name, design, is_locked"
          )
          .eq("name", TEMPLATE_NAME)
          .order("id", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error(
            "Template load error:",
            error
          );

          setLoadingTemplate(false);
          return;
        }

        if (data) {
          setTemplateId(data.id);

          setLocked(
            Boolean(data.is_locked)
          );

          const design = data.design as any;

          if (
            design &&
            Array.isArray(
              design.elements
            ) &&
            design.elements.length > 0
          ) {
            const masterElements = cloneElements(
              design.elements
            );

            setElements(
              memberData
                ? applyMemberDataToElements(
                    masterElements,
                    memberData
                  )
                : masterElements
            );
          }
        }
      } catch (error) {
        console.error(
          "Template loading error:",
          error
        );
      }

      setLoadingTemplate(false);
    }

    loadTemplate();
  }, [memberData]);

  /*
  =========================================
  LOAD MEMBER DETAILS
  =========================================
  */

  useEffect(() => {
    if (!memberId) {
      setMemberLoading(false);
      setMemberError("Card URL ನಲ್ಲಿ member id ಇಲ್ಲ.");
      return;
    }

    let cancelled = false;

    async function loadMember() {
      setMemberLoading(true);
      setMemberError("");

      try {
        let found: MemberRecord | null = null;

        for (const table of MEMBER_TABLES) {
          try {
            const { data, error } = await supabase
              .from(table)
              .select("*")
              .eq("id", memberId)
              .maybeSingle();

            if (!error && data) {
              found = data as MemberRecord;
              break;
            }
          } catch (tableError) {
            console.warn(`Member table ${table} could not be read`, tableError);
          }
        }

        if (cancelled) return;

        if (!found) {
          setMemberData(null);
          setMemberError(
            "ಈ ID ಗೆ member details ಸಿಗಲಿಲ್ಲ. Member page ನಿಂದ ಬಂದ ಅದೇ id ಬಳಸಬೇಕು."
          );
          return;
        }

        setMemberData(found);
        setElements((current) =>
          applyMemberDataToElements(current, found as MemberRecord)
        );

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

        if (photo && typeof photo === "string") {
          if (photo.startsWith("data:") || photo.startsWith("http://") || photo.startsWith("https://")) {
            setMemberPhoto(photo);
          } else {
            // If the database stores a public Supabase URL/path, use it as-is.
            setMemberPhoto(photo);
          }
        }
      } catch (error: any) {
        console.error("Member load error:", error);
        if (!cancelled) {
          setMemberError(
            error?.message || "Member details load ಆಗಲಿಲ್ಲ."
          );
        }
      } finally {
        if (!cancelled) setMemberLoading(false);
      }
    }

    loadMember();

    return () => {
      cancelled = true;
    };
  }, [memberId]);

  /*
  =========================================
  QR CODE
  =========================================
  */

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

        /*
         * QR must identify THIS member.
         * Send all common identifiers so the existing /verify page
         * can use whichever parameter it already reads.
         */
        if (!memberId && !membershipNumber) {
          setQrImage("");
          return;
        }

        const params = new URLSearchParams();

        if (memberId) {
          params.set("id", memberId);
          params.set("member_id", memberId);
          params.set("application_id", memberId);
        }

        if (
          membershipNumber &&
          membershipNumber !== "MEMBERSHIP_NUMBER"
        ) {
          params.set("membership", membershipNumber);
        }

        const url =
          typeof window !== "undefined"
            ? `${window.location.origin}/verify?${params.toString()}`
            : `/verify?${params.toString()}`;

        const image =
          await QRCode.toDataURL(
            url,
            {
              width: 500,
              margin: 1,
              errorCorrectionLevel: "H",
              color: {
                dark: "#075c2b",
                light: "#ffffff",
              },
            }
          );

        setQrImage(image);
      } catch (error) {
        console.error(
          "QR generation error:",
          error
        );
      }
    }

    createQR();
  }, [memberData, memberId]);

  /*
  =========================================
  UPDATE ELEMENT
  =========================================
  */

  function updateElement(
    id: string,
    changes: Partial<CardElement>
  ) {
    if (locked) return;

    setElements((current) =>
      current.map((element) =>
        element.id === id
          ? {
              ...element,
              ...changes,
            }
          : element
      )
    );
  }

  /*
  =========================================
  DELETE ELEMENT
  =========================================
  */

  function deleteElement(id: string) {
    if (locked) return;

    setElements((current) =>
      current.filter(
        (element) =>
          element.id !== id
      )
    );

    setSelectedId(null);
  }

  /*
  =========================================
  DRAG ELEMENT
  =========================================
  */

  function handlePointerDown(
    event: React.PointerEvent,
    element: CardElement
  ) {
    if (locked) return;

    event.preventDefault();
    event.stopPropagation();

    setSelectedId(element.id);

    const startX = event.clientX;
    const startY = event.clientY;

    const originalX = element.x;
    const originalY = element.y;

    const rect =
      cardRef.current?.getBoundingClientRect();

    if (!rect) return;

    function move(e: PointerEvent) {
      const scaleX =
        rect!.width / CARD_WIDTH;

      const scaleY =
        rect!.height / CARD_HEIGHT;

      const dx =
        (e.clientX - startX) /
        scaleX;

      const dy =
        (e.clientY - startY) /
        scaleY;

      updateElement(
        element.id,
        {
          x: Math.max(
            0,
            Math.min(
              CARD_WIDTH -
                element.width,
              originalX + dx
            )
          ),

          y: Math.max(
            0,
            Math.min(
              CARD_HEIGHT -
                element.height,
              originalY + dy
            )
          ),
        }
      );
    }

    function up() {
      window.removeEventListener(
        "pointermove",
        move
      );

      window.removeEventListener(
        "pointerup",
        up
      );
    }

    window.addEventListener(
      "pointermove",
      move
    );

    window.addEventListener(
      "pointerup",
      up
    );
  }

  /*
  =========================================
  ADD TEXT
  =========================================
  */

  function addText() {
    if (locked) return;

    const newElement: CardElement = {
      id: `text-${Date.now()}`,
      label: "New Text",
      kind: "text",
      text: "ಹೊಸ Text",
      side,
      x: 250,
      y: 250,
      width: 300,
      height: 45,
      fontSize: 20,
      fontWeight: "600",
      color: "#111111",
      background: "transparent",
    };

    setElements((current) => [
      ...current,
      newElement,
    ]);

    setSelectedId(
      newElement.id
    );
  }

  /*
  =========================================
  ADD IMAGE
  =========================================
  */

  async function addImage(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    if (locked) return;

    const file =
      event.target.files?.[0];

    if (!file) return;

    try {
      const dataUrl =
        await fileToDataUrl(file);

      const newElement: CardElement = {
        id: `image-${Date.now()}`,
        label: "New Image",
        kind: "image",
        text: "",
        side,
        x: 250,
        y: 180,
        width: 180,
        height: 120,
        fontSize: 18,
        fontWeight: "600",
        color: "#111111",
        background: "#ffffff",
        borderRadius: 10,
        src: dataUrl,
      };

      setElements((current) => [
        ...current,
        newElement,
      ]);

      setSelectedId(
        newElement.id
      );
    } catch (error) {
      console.error(error);

      alert(
        "Image load ಆಗಲಿಲ್ಲ."
      );
    }

    event.target.value = "";
  }

  /*
  =========================================
  MEMBER PHOTO
  =========================================
  */

  async function uploadMemberPhoto(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    if (locked) return;

    const file =
      event.target.files?.[0];

    if (!file) return;

    try {
      const dataUrl =
        await fileToDataUrl(file);

      setMemberPhoto(dataUrl);

      const photoElement =
        elements.find(
          (e) =>
            e.kind === "photo"
        );

      if (photoElement) {
        setSelectedId(
          photoElement.id
        );
      }
    } catch (error) {
      console.error(error);

      alert(
        "Photo load ಆಗಲಿಲ್ಲ."
      );
    }

    event.target.value = "";
  }

  /*
  =========================================
  SAVE TEMPLATE
  =========================================
  */

  async function saveTemplate() {
    if (locked) {
      alert(
        "🔒 Template locked ಇದೆ. ಮೊದಲು Unlock ಮಾಡಿ."
      );

      return;
    }

    setSaving(true);

    const design = {
      version: 1,
      cardWidth: CARD_WIDTH,
      cardHeight: CARD_HEIGHT,
      // Save the MASTER design, never the current member's data.
      elements: getMasterTemplateElements(elements),
    };

    try {
      if (templateId) {
        const { error } =
          await supabase
            .from("card_templates")
            .update({
              name: TEMPLATE_NAME,
              design,
              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "id",
              templateId
            );

        if (error) {
          throw error;
        }
      } else {
        const { data, error } =
          await supabase
            .from("card_templates")
            .insert({
              name: TEMPLATE_NAME,
              design,
              is_locked: false,
            })
            .select("id")
            .single();

        if (error) {
          throw error;
        }

        if (data?.id) {
          setTemplateId(data.id);
        }
      }

      alert(
        "💾 Template Save ಆಯಿತು ✅"
      );
    } catch (error: any) {
      console.error(error);

      alert(
        "Template save ಆಗಲಿಲ್ಲ:\n\n" +
          (error?.message ||
            "Unknown error")
      );
    } finally {
      setSaving(false);
    }
  }

  /*
  =========================================
  LOCK TEMPLATE
  =========================================
  */

  async function lockTemplate() {
    if (saving) return;

    if (!templateId) {
      alert(
        "ಮೊದಲು 💾 Save Template ಮಾಡಿ."
      );

      return;
    }

    const ok = confirm(
      "🔒 ಈ Card Design ಅನ್ನು Lock ಮಾಡಬೇಕೇ?\n\nLock ಮಾಡಿದ ನಂತರ Text / Image / Position ಬದಲಾಯಿಸಲಾಗುವುದಿಲ್ಲ."
    );

    if (!ok) return;

    setSaving(true);

    try {
      const design = {
        version: 1,
        cardWidth: CARD_WIDTH,
        cardHeight: CARD_HEIGHT,
        // Lock the MASTER design, never the current member's data.
        elements: getMasterTemplateElements(elements),
      };

      const { error } =
        await supabase
          .from("card_templates")
          .update({
            design,
            is_locked: true,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            templateId
          );

      if (error) {
        throw error;
      }

      // Keep the current member visible on screen after locking.
      // The database stores the clean master template above.
      if (memberData) {
        setElements((current) =>
          applyMemberDataToElements(
            current,
            memberData
          )
        );
      }

      setLocked(true);

      alert(
        "🔒 Card Template Locked Successfully ✅"
      );
    } catch (error: any) {
      console.error(error);

      alert(
        "Lock ಆಗಲಿಲ್ಲ:\n\n" +
          (error?.message ||
            "Unknown error")
      );
    } finally {
      setSaving(false);
    }
  }

  /*
  =========================================
  UNLOCK TEMPLATE
  =========================================
  */

  async function unlockTemplate() {
    if (!templateId) return;

    const ok = confirm(
      "🔓 Template Unlock ಮಾಡಬೇಕೇ?"
    );

    if (!ok) return;

    setSaving(true);

    try {
      const { error } =
        await supabase
          .from("card_templates")
          .update({
            is_locked: false,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            templateId
          );

      if (error) {
        throw error;
      }

      setLocked(false);

      alert(
        "🔓 Template Unlocked ✅"
      );
    } catch (error: any) {
      console.error(error);

      alert(
        "Unlock ಆಗಲಿಲ್ಲ:\n\n" +
          (error?.message ||
            "Unknown error")
      );
    } finally {
      setSaving(false);
    }
  }

  /*
  =========================================
  RESET
  =========================================
  */

  /*
     =========================================
     PRINT / SAVE AS PDF
     =========================================
  */

  function escapePrintHtml(value: unknown): string {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .replace(/\n/g, "<br />");
  }

  function buildPrintCardHtml(printSide: Side): string {
    const sideElements = elements.filter(
      (element) => element.side === printSide
    );

    // The editor uses an 856 × 539 coordinate system.
    // For a CR80 card (85.6 × 53.9 mm), 1 editor px = 0.1 mm.
    const pxToMm = (value: number) => `${value / 10}mm`;

    const elementHtml = sideElements
      .map((element) => {
        const commonStyle = [
          "position:absolute",
          `left:${pxToMm(element.x)}`,
          `top:${pxToMm(element.y)}`,
          `width:${pxToMm(element.width)}`,
          `height:${pxToMm(element.height)}`,
          `font-size:${pxToMm(element.fontSize)}`,
          `font-weight:${element.fontWeight}`,
          `color:${element.color}`,
          `background:${element.background}`,
          `border-radius:${pxToMm(element.borderRadius || 0)}`,
          "box-sizing:border-box",
          "overflow:hidden",
          `z-index:${element.kind === "footer" ? 50 : 60}`,
          element.background !== "transparent"
            ? `padding:${pxToMm(6)}`
            : "padding:0",
          "font-family:Arial,'Noto Sans Kannada','Noto Sans',sans-serif",
          "line-height:1.2",
        ].join(";");

        if (element.kind === "photo") {
          return `
            <div style="${commonStyle};border:${pxToMm(4)} solid #166534;background:#fff;">
              ${
                memberPhoto
                  ? `<img src="${escapePrintHtml(memberPhoto)}" alt="Member Photo" style="width:100%;height:100%;object-fit:cover;display:block;" />`
                  : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:${pxToMm(42)};">👤</div>`
              }
            </div>
          `;
        }

        if (element.kind === "qr") {
          return `
            <div style="${commonStyle};border:${pxToMm(4)} solid #166534;background:#fff;padding:${pxToMm(8)};">
              ${
                qrImage
                  ? `<img src="${escapePrintHtml(qrImage)}" alt="QR Code" style="width:100%;height:100%;display:block;object-fit:contain;" />`
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
                  ? `<img src="${escapePrintHtml(element.src)}" alt="Card Image" style="width:100%;height:100%;object-fit:contain;display:block;" />`
                  : ""
              }
            </div>
          `;
        }

        return `
          <div style="${commonStyle};display:flex;align-items:center;">
            ${escapePrintHtml(element.text)}
          </div>
        `;
      })
      .join("");

    return `
      <section class="print-card-page">
        <div class="print-card-inner">
          <div class="print-card-background"></div>
          <div class="print-card-top"></div>
          <div class="print-card-bottom"></div>
          ${elementHtml}
        </div>
      </section>
    `;
  }

  async function printCard() {
    if (typeof window === "undefined") return;

    /*
     * PDF / Print output:
     * Page 1 = FRONT
     * Page 2 = BACK
     * Each page is exactly CR80 PVC card size: 85.6 × 53.9 mm.
     * No popup and no A4 layout are used.
     */
    document.getElementById("print-container")?.remove();

    const printContainer = document.createElement("div");
    printContainer.id = "print-container";
    printContainer.innerHTML = `
      ${buildPrintCardHtml("front")}
      ${buildPrintCardHtml("back")}
    `;

    document.body.appendChild(printContainer);

    const images = Array.from(
      printContainer.querySelectorAll("img")
    );

    await Promise.all(
      images.map(
        (image) =>
          image.complete
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                image.onload = () => resolve();
                image.onerror = () => resolve();
              })
      )
    );

    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch {}
    }

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });

    const cleanup = () => {
      document.getElementById("print-container")?.remove();
      window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup);
    window.print();
  }

  function resetDesign() {
    if (locked) return;

    const ok = confirm(
      "Current design reset ಮಾಡಬೇಕೇ?"
    );

    if (!ok) return;

    setElements(
      cloneElements(
        initialElements
      )
    );

    setSelectedId(null);

    setSide("front");

    setMemberPhoto(null);
  }

  const visibleElements =
    elements.filter(
      (element) =>
        element.side === side
    );

  const selected =
    elements.find(
      (element) =>
        element.id === selectedId
    ) || null;

  /*
  =========================================
  LOADING
  =========================================
  */

  if (loadingTemplate) {
    return (
      <AdminGuard>
        <main className="min-h-screen flex items-center justify-center bg-slate-100">
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <div className="text-3xl mb-3">
              ⏳
            </div>

            <div className="font-bold">
              Card Template Loading...
            </div>
          </div>
        </main>
      </AdminGuard>
    );
  }

  /*
  =========================================
  PAGE
  =========================================
  */

  return (
    <>
      <style jsx global>{`
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
            min-width: 85.6mm !important;
            max-width: 85.6mm !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            overflow: visible !important;
          }

          body > *:not(#print-container) {
            display: none !important;
          }

          #print-container {
            display: block !important;
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 85.6mm !important;
            height: 107.8mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            z-index: 2147483647 !important;
          }

          #print-container,
          #print-container * {
            visibility: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          #print-container .print-card-page {
            display: block !important;
            position: relative !important;
            width: 85.6mm !important;
            height: 53.9mm !important;
            min-width: 85.6mm !important;
            min-height: 53.9mm !important;
            max-width: 85.6mm !important;
            max-height: 53.9mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-before: auto !important;
            break-before: auto !important;
            visibility: visible !important;
          }

          #print-container .print-card-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }

          #print-container .print-card-inner {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 85.6mm !important;
            height: 53.9mm !important;
            transform: none !important;
            transform-origin: top left !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            border: 0.4mm solid #075c2b !important;
            border-radius: 2.2mm !important;
            background: linear-gradient(135deg,#ffffff 0%,#f7fff8 55%,#e8f6df 100%) !important;
          }

          .print-card-background {
            position: absolute !important;
            inset: 0 !important;
            background: linear-gradient(135deg,#ffffff 0%,#f7fff8 55%,#e8f6df 100%) !important;
          }

          .print-card-top {
            position: absolute !important;
            left: 0 !important;
            right: 0 !important;
            top: 0 !important;
            height: 11.5mm !important;
            background: linear-gradient(135deg,#ffffff,#f6fff8) !important;
            border-bottom: 1mm solid #075c2b !important;
          }

          .print-card-bottom {
            position: absolute !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            height: 15mm !important;
            background: linear-gradient(to top,#d8efc8,transparent) !important;
            opacity: 0.55 !important;
          }

          #print-container img {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }

          button,
          input,
          select,
          textarea,
          aside {
            display: none !important;
          }
        }
      `}</style>

      <AdminGuard>
      <main className="min-h-screen bg-slate-100 p-4 md:p-6">
        <div className="max-w-[1500px] mx-auto">

          {/* HEADER */}

          <div className="bg-white rounded-2xl shadow p-4 mb-5">

            <div className="flex flex-wrap items-center justify-between gap-4">

              <div>
                <h1 className="text-2xl font-extrabold">
                  🪪 Farmer PVC Card Designer
                </h1>

                <p className="text-slate-500">
                  Card ಅನ್ನು ನಿಮ್ಮ ಇಷ್ಟದಂತೆ design ಮಾಡಿ
                </p>
                {memberId && (
                  <p className="text-xs text-slate-400 mt-1">
                    Member ID: {memberId}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">

                <button
                  onClick={() =>
                    setSide("front")
                  }
                  className={`px-5 py-2 rounded-lg font-bold ${
                    side === "front"
                      ? "bg-green-700 text-white"
                      : "bg-slate-200"
                  }`}
                >
                  FRONT
                </button>

                <button
                  onClick={() =>
                    setSide("back")
                  }
                  className={`px-5 py-2 rounded-lg font-bold ${
                    side === "back"
                      ? "bg-green-700 text-white"
                      : "bg-slate-200"
                  }`}
                >
                  BACK
                </button>

                <button
                  type="button"
                  onClick={printCard}
                  className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                >
                  📄 Generate Card PDF
                </button>

                {!locked && (
                  <button
                    onClick={resetDesign}
                    className="px-5 py-2 rounded-lg bg-red-100 text-red-700 font-bold"
                  >
                    Reset
                  </button>
                )}

              </div>

            </div>

            {/* STATUS */}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">

              <div
                className={`px-4 py-2 rounded-lg font-bold ${
                  locked
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {locked
                  ? "🔒 TEMPLATE LOCKED"
                  : "🟢 TEMPLATE EDITABLE"}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {memberLoading && (
                  <div className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-bold">
                    ⏳ Member Loading...
                  </div>
                )}

                {memberData && !memberLoading && (
                  <div className="px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 font-bold">
                    👤 Member Details Loaded
                  </div>
                )}

                {memberError && !memberLoading && (
                  <div className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-bold text-sm">
                    ⚠️ {memberError}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">

                {!locked && (
                  <>
                    <button
                      onClick={addText}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold"
                    >
                      ➕ Add Text
                    </button>

                    <label className="px-4 py-2 rounded-lg bg-purple-600 text-white font-bold cursor-pointer">
                      🖼️ Add Image

                      <input
                        type="file"
                        accept="image/*"
                        onChange={addImage}
                        className="hidden"
                      />
                    </label>

                    <button
                      onClick={
                        saveTemplate
                      }
                      disabled={saving}
                      className="px-4 py-2 rounded-lg bg-green-700 text-white font-bold disabled:opacity-50"
                    >
                      {saving
                        ? "Saving..."
                        : "💾 Save Template"}
                    </button>

                    <button
                      onClick={
                        lockTemplate
                      }
                      disabled={saving}
                      className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold disabled:opacity-50"
                    >
                      🔒 Lock Template
                    </button>
                  </>
                )}

                {locked && (
                  <button
                    onClick={
                      unlockTemplate
                    }
                    disabled={saving}
                    className="px-5 py-2 rounded-lg bg-orange-600 text-white font-bold"
                  >
                    🔓 Unlock Template
                  </button>
                )}

              </div>
            </div>
          </div>

          {/* MAIN GRID */}

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-5">

            {/* CARD AREA */}

            <section className="bg-slate-200 rounded-2xl p-3 sm:p-4 md:p-8 overflow-x-auto overflow-y-visible">

              <div className="text-center mb-3 font-bold text-slate-600">
                {side === "front"
                  ? "FRONT SIDE"
                  : "BACK SIDE"}
              </div>

              <div className="flex justify-center">

                <div
                  ref={cardRef}
                  data-print-card="true"
                  className="relative overflow-hidden select-none shadow-2xl print-card"
                  style={{
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                    minWidth: CARD_WIDTH,

                    background:
                      "linear-gradient(135deg,#ffffff 0%,#f7fff8 55%,#e8f6df 100%)",

                    border:
                      "4px solid #075c2b",

                    borderRadius: 22,

                    touchAction: "none",
                  }}
                >

                  {/* TOP */}

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

                  {/* BOTTOM BACKGROUND */}

                  <div
                    className="absolute left-0 right-0 bottom-0 pointer-events-none"
                    style={{
                      height: 150,

                      background:
                        "linear-gradient(to top,#d8efc8,transparent)",

                      opacity: 0.55,
                    }}
                  />

                  {/* ELEMENTS */}

                  {visibleElements.map(
                    (element) => {

                      /* PHOTO */

                      if (
                        element.kind ===
                        "photo"
                      ) {
                        return (
                          <div
                            key={
                              element.id
                            }
                            onPointerDown={(
                              e
                            ) =>
                              handlePointerDown(
                                e,
                                element
                              )
                            }
                            onClick={() =>
                              setSelectedId(
                                element.id
                              )
                            }
                            className={`absolute cursor-move overflow-hidden border-4 border-green-800 bg-white ${
                              selectedId ===
                              element.id
                                ? "ring-2 ring-blue-500"
                                : ""
                            }`}
                            style={{
                              left:
                                element.x,

                              top:
                                element.y,

                              width:
                                element.width,

                              height:
                                element.height,

                              borderRadius:
                                element.borderRadius,

                              zIndex: 30,

                              touchAction:
                                "none",
                            }}
                          >

                            {memberPhoto ? (
                              <img
                                src={
                                  memberPhoto
                                }
                                alt="Member"
                                draggable={
                                  false
                                }
                                className="w-full h-full object-cover pointer-events-none"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 pointer-events-none">

                                <div className="text-5xl">
                                  👤
                                </div>

                                <div className="font-bold">
                                  Member Photo
                                </div>

                              </div>
                            )}

                          </div>
                        );
                      }

                      /* QR */

                      if (
                        element.kind ===
                        "qr"
                      ) {
                        return (
                          <div
                            key={
                              element.id
                            }
                            onPointerDown={(
                              e
                            ) =>
                              handlePointerDown(
                                e,
                                element
                              )
                            }
                            onClick={() =>
                              setSelectedId(
                                element.id
                              )
                            }
                            className={`absolute cursor-move bg-white border-4 border-green-800 p-2 ${
                              selectedId ===
                              element.id
                                ? "ring-2 ring-blue-500"
                                : ""
                            }`}
                            style={{
                              left:
                                element.x,

                              top:
                                element.y,

                              width:
                                element.width,

                              height:
                                element.height,

                              borderRadius:
                                element.borderRadius,

                              zIndex: 40,

                              touchAction:
                                "none",
                            }}
                          >

                            {qrImage && (
                              <img
                                src={
                                  qrImage
                                }
                                alt="QR"
                                draggable={
                                  false
                                }
                                className="w-full h-full pointer-events-none"
                              />
                            )}

                          </div>
                        );
                      }

                      /* IMAGE */

                      if (
                        element.kind ===
                        "image"
                      ) {
                        return (
                          <div
                            key={
                              element.id
                            }
                            onPointerDown={(
                              e
                            ) =>
                              handlePointerDown(
                                e,
                                element
                              )
                            }
                            onClick={() =>
                              setSelectedId(
                                element.id
                              )
                            }
                            className={`absolute cursor-move overflow-hidden ${
                              selectedId ===
                              element.id
                                ? "ring-2 ring-blue-500"
                                : ""
                            }`}
                            style={{
                              left:
                                element.x,

                              top:
                                element.y,

                              width:
                                element.width,

                              height:
                                element.height,

                              background:
                                element.background,

                              borderRadius:
                                element.borderRadius,

                              zIndex: 25,

                              touchAction:
                                "none",
                            }}
                          >

                            {element.src && (
                              <img
                                src={
                                  element.src
                                }
                                alt="Card"
                                draggable={
                                  false
                                }
                                className="w-full h-full object-contain pointer-events-none"
                              />
                            )}

                          </div>
                        );
                      }

                      /* TEXT / FOOTER */

                      return (
                        <div
                          key={
                            element.id
                          }
                          onPointerDown={(
                            e
                          ) =>
                            handlePointerDown(
                              e,
                              element
                            )
                          }
                          onClick={() =>
                            setSelectedId(
                              element.id
                            )
                          }
                          className={`absolute cursor-move flex items-center overflow-hidden ${
                            selectedId ===
                            element.id
                              ? "ring-2 ring-blue-500"
                              : ""
                          }`}
                          style={{
                            left:
                              element.x,

                            top:
                              element.y,

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

                            padding:
                              element.background !==
                              "transparent"
                                ? 6
                                : 0,

                            borderRadius:
                              element.borderRadius ||
                              0,

                            zIndex:
                              element.kind ===
                              "footer"
                                ? 50
                                : 60,

                            touchAction:
                              "none",
                          }}
                        >
                          {element.text}
                        </div>
                      );
                    }
                  )}

                </div>
              </div>

              <p className="text-center text-sm text-slate-500 mt-4">
                {locked
                  ? "🔒 Template locked — editing disabled"
                  : "💡 Text / Image / Photo / QR ಮೇಲೆ press ಮಾಡಿ drag ಮಾಡಿ"}
              </p>

            </section>

            {/* EDIT PANEL */}

            <aside className="bg-white rounded-2xl shadow p-4 sm:p-5 h-fit max-h-[70vh] overflow-y-auto lg:max-h-[calc(100vh-2rem)]">

              <h2 className="text-xl font-extrabold mb-4">
                ✏️ Edit Selected
              </h2>

              {/* MEMBER PHOTO */}

              <div className="mb-5">

                <label className="block font-bold mb-2">
                  Member Photo
                </label>

                <input
                  type="file"
                  accept="image/*"
                  disabled={locked}
                  onChange={
                    uploadMemberPhoto
                  }
                  className="w-full text-sm"
                />

              </div>

              {/* SELECT */}

              <div className="mb-5">

                <label className="block font-bold mb-2">
                  Select Element
                </label>

                <select
                  value={
                    selectedId || ""
                  }
                  disabled={locked}
                  onChange={(e) =>
                    setSelectedId(
                      e.target.value
                    )
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >

                  <option value="">
                    Select field
                  </option>

                  {elements
                    .filter(
                      (e) =>
                        e.side === side
                    )
                    .map(
                      (element) => (
                        <option
                          key={
                            element.id
                          }
                          value={
                            element.id
                          }
                        >
                          {
                            element.label
                          }
                        </option>
                      )
                    )}

                </select>

              </div>

              {selected && (
                <div className="space-y-4">

                  {/* LABEL */}

                  <div>

                    <label className="block font-semibold mb-1">
                      Field Name
                    </label>

                    <input
                      value={
                        selected.label
                      }
                      disabled={locked}
                      onChange={(e) =>
                        updateElement(
                          selected.id,
                          {
                            label:
                              e.target
                                .value,
                          }
                        )
                      }
                      className="w-full border rounded-lg p-2"
                    />

                  </div>

                  {/* TEXT */}

                  {selected.kind !==
                    "photo" &&
                    selected.kind !==
                      "qr" &&
                    selected.kind !==
                      "image" && (
                      <div>

                        <label className="block font-semibold mb-1">
                          Text
                        </label>

                        <textarea
                          value={
                            selected.text
                          }
                          disabled={
                            locked
                          }
                          onChange={(
                            e
                          ) =>
                            updateElement(
                              selected.id,
                              {
                                text:
                                  e.target
                                    .value,
                              }
                            )
                          }
                          rows={3}
                          className="w-full border rounded-lg p-2"
                        />

                      </div>
                    )}

                  {/* FONT SIZE */}

                  {selected.kind !==
                    "photo" &&
                    selected.kind !==
                      "qr" &&
                    selected.kind !==
                      "image" && (
                      <div>

                        <label className="block font-semibold mb-1">
                          Font Size
                        </label>

                        <input
                          type="number"
                          value={
                            selected.fontSize
                          }
                          disabled={
                            locked
                          }
                          onChange={(
                            e
                          ) =>
                            updateElement(
                              selected.id,
                              {
                                fontSize:
                                  Number(
                                    e
                                      .target
                                      .value
                                  ),
                              }
                            )
                          }
                          className="w-full border rounded-lg p-2"
                        />

                      </div>
                    )}

                  {/* COLOR */}

                  {selected.kind !==
                    "photo" &&
                    selected.kind !==
                      "qr" &&
                    selected.kind !==
                      "image" && (
                      <div>

                        <label className="block font-semibold mb-1">
                          Text Color
                        </label>

                        <input
                          type="color"
                          value={
                            selected.color
                          }
                          disabled={
                            locked
                          }
                          onChange={(
                            e
                          ) =>
                            updateElement(
                              selected.id,
                              {
                                color:
                                  e
                                    .target
                                    .value,
                              }
                            )
                          }
                          className="w-full h-10"
                        />

                      </div>
                    )}

                  {/* X */}

                  <div>

                    <label className="block font-semibold mb-1">
                      X Position
                    </label>

                    <input
                      type="number"
                      value={Math.round(
                        selected.x
                      )}
                      disabled={locked}
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
                      className="w-full border rounded-lg p-2"
                    />

                  </div>

                  {/* Y */}

                  <div>

                    <label className="block font-semibold mb-1">
                      Y Position
                    </label>

                    <input
                      type="number"
                      value={Math.round(
                        selected.y
                      )}
                      disabled={locked}
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
                      className="w-full border rounded-lg p-2"
                    />

                  </div>

                  {/* WIDTH */}

                  <div>

                    <label className="block font-semibold mb-1">
                      Width
                    </label>

                    <input
                      type="number"
                      value={Math.round(
                        selected.width
                      )}
                      disabled={locked}
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
                      className="w-full border rounded-lg p-2"
                    />

                  </div>

                  {/* HEIGHT */}

                  <div>

                    <label className="block font-semibold mb-1">
                      Height
                    </label>

                    <input
                      type="number"
                      value={Math.round(
                        selected.height
                      )}
                      disabled={locked}
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
                      className="w-full border rounded-lg p-2"
                    />

                  </div>

                  {/* DELETE */}

                  {!locked && (
                    <button
                      onClick={() =>
                        deleteElement(
                          selected.id
                        )
                      }
                      className="w-full bg-red-600 text-white rounded-lg py-3 font-bold"
                    >
                      🗑️ Delete Selected
                    </button>
                  )}

                </div>
              )}

            </aside>

          </div>
        </div>
      </main>
      </AdminGuard>
    </>
  );
}

/*
==================================================
IMPORTANT:
Next.js build fix
==================================================
*/

export default function NewCardDesignerPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-slate-100">
          <div className="bg-white rounded-2xl shadow p-8 text-center">

            <div className="text-3xl mb-3">
              ⏳
            </div>

            <div className="font-bold">
              Card Loading...
            </div>

          </div>
        </main>
      }
    >
      <NewCardDesignerPageContent />
    </Suspense>
  );
}
