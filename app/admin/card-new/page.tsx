"use client";

import { useEffect, useRef, useState } from "react";
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
  return elements.map((e) => ({ ...e }));
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

export default function NewCardDesignerPage() {
  const [elements, setElements] = useState<CardElement[]>(
    cloneElements(initialElements)
  );

  const [side, setSide] = useState<Side>("front");

  const [selectedId, setSelectedId] = useState<string | null>("name");

  const [memberPhoto, setMemberPhoto] = useState<string | null>(null);

  const [qrImage, setQrImage] = useState("");

  const [templateId, setTemplateId] = useState<number | null>(null);

  const [locked, setLocked] = useState(false);

  const [loadingTemplate, setLoadingTemplate] = useState(true);

  const [saving, setSaving] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  /* =========================
     LOAD TEMPLATE
  ========================= */

  useEffect(() => {
    async function loadTemplate() {
      setLoadingTemplate(true);

      const { data, error } = await supabase
        .from("card_templates")
        .select("id, name, design, is_locked")
        .eq("name", TEMPLATE_NAME)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Template load error:", error);
        setLoadingTemplate(false);
        return;
      }

      if (data) {
        setTemplateId(data.id);
        setLocked(Boolean(data.is_locked));

        const design = data.design as any;

        if (
          design &&
          Array.isArray(design.elements) &&
          design.elements.length > 0
        ) {
          setElements(design.elements);
        }
      }

      setLoadingTemplate(false);
    }

    loadTemplate();
  }, []);

  /* =========================
     QR
  ========================= */

  useEffect(() => {
    async function createQR() {
      try {
        const url =
          typeof window !== "undefined"
            ? `${window.location.origin}/verify?membership=MEMBERSHIP_NUMBER`
            : "https://example.com/verify";

        const image = await QRCode.toDataURL(url, {
          width: 300,
          margin: 1,
          color: {
            dark: "#075c2b",
            light: "#ffffff",
          },
        });

        setQrImage(image);
      } catch (error) {
        console.error(error);
      }
    }

    createQR();
  }, []);

  /* =========================
     UPDATE
  ========================= */

  function updateElement(
    id: string,
    changes: Partial<CardElement>
  ) {
    if (locked) return;

    setElements((current) =>
      current.map((element) =>
        element.id === id
          ? { ...element, ...changes }
          : element
      )
    );
  }

  /* =========================
     DELETE
  ========================= */

  function deleteElement(id: string) {
    if (locked) return;

    setElements((current) =>
      current.filter((element) => element.id !== id)
    );

    setSelectedId(null);
  }

  /* =========================
     DRAG
  ========================= */

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

    const rect = cardRef.current?.getBoundingClientRect();

    if (!rect) return;

    function move(e: PointerEvent) {
      const scaleX = rect!.width / CARD_WIDTH;
      const scaleY = rect!.height / CARD_HEIGHT;

      const dx = (e.clientX - startX) / scaleX;
      const dy = (e.clientY - startY) / scaleY;

      updateElement(element.id, {
        x: Math.max(
          0,
          Math.min(
            CARD_WIDTH - element.width,
            originalX + dx
          )
        ),
        y: Math.max(
          0,
          Math.min(
            CARD_HEIGHT - element.height,
            originalY + dy
          )
        ),
      });
    }

    function up() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    }

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  /* =========================
     ADD TEXT
  ========================= */

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

    setSelectedId(newElement.id);
  }

  /* =========================
     ADD IMAGE
  ========================= */

  async function addImage(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    if (locked) return;

    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);

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

      setSelectedId(newElement.id);
    } catch (error) {
      console.error(error);

      alert("Image load ಆಗಲಿಲ್ಲ.");
    }

    event.target.value = "";
  }

  /* =========================
     MEMBER PHOTO
  ========================= */

  async function uploadMemberPhoto(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);

      setMemberPhoto(dataUrl);

      const photoElement = elements.find(
        (e) => e.kind === "photo"
      );

      if (photoElement) {
        setSelectedId(photoElement.id);
      }
    } catch (error) {
      console.error(error);
    }

    event.target.value = "";
  }

  /* =========================
     SAVE TEMPLATE
  ========================= */

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
      elements,
    };

    try {
      if (templateId) {
        const { error } = await supabase
          .from("card_templates")
          .update({
            name: TEMPLATE_NAME,
            design,
            updated_at: new Date().toISOString(),
          })
          .eq("id", templateId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("card_templates")
          .insert({
            name: TEMPLATE_NAME,
            design,
            is_locked: false,
          })
          .select("id")
          .single();

        if (error) throw error;

        if (data?.id) {
          setTemplateId(data.id);
        }
      }

      alert("💾 Template Save ಆಯಿತು ✅");
    } catch (error: any) {
      console.error(error);

      alert(
        "Template save ಆಗಲಿಲ್ಲ:\n\n" +
          (error?.message || "Unknown error")
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================
     LOCK
  ========================= */

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
        elements,
      };

      const { error } = await supabase
        .from("card_templates")
        .update({
          design,
          is_locked: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", templateId);

      if (error) throw error;

      setLocked(true);

      alert(
        "🔒 Card Template Locked Successfully ✅"
      );
    } catch (error: any) {
      console.error(error);

      alert(
        "Lock ಆಗಲಿಲ್ಲ:\n\n" +
          (error?.message || "Unknown error")
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================
     UNLOCK
  ========================= */

  async function unlockTemplate() {
    if (!templateId) return;

    const ok = confirm(
      "🔓 Template Unlock ಮಾಡಬೇಕೇ?"
    );

    if (!ok) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("card_templates")
        .update({
          is_locked: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", templateId);

      if (error) throw error;

      setLocked(false);

      alert(
        "🔓 Template Unlocked ✅"
      );
    } catch (error: any) {
      console.error(error);

      alert(
        "Unlock ಆಗಲಿಲ್ಲ:\n\n" +
          (error?.message || "Unknown error")
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================
     RESET
  ========================= */

  function resetDesign() {
    if (locked) return;

    const ok = confirm(
      "Current design reset ಮಾಡಬೇಕೇ?"
    );

    if (!ok) return;

    setElements(
      cloneElements(initialElements)
    );

    setSelectedId(null);
    setSide("front");
  }

  const visibleElements =
    elements.filter(
      (element) => element.side === side
    );

  const selected =
    elements.find(
      (element) =>
        element.id === selectedId
    ) || null;

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

  return (
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

            {/* TEMPLATE STATUS */}

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
                      onClick={saveTemplate}
                      disabled={saving}
                      className="px-4 py-2 rounded-lg bg-green-700 text-white font-bold disabled:opacity-50"
                    >
                      {saving
                        ? "Saving..."
                        : "💾 Save Template"}
                    </button>

                    <button
                      onClick={lockTemplate}
                      disabled={saving}
                      className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold disabled:opacity-50"
                    >
                      🔒 Lock Template
                    </button>
                  </>
                )}

                {locked && (
                  <button
                    onClick={unlockTemplate}
                    disabled={saving}
                    className="px-5 py-2 rounded-lg bg-orange-600 text-white font-bold"
                  >
                    🔓 Unlock Template
                  </button>
                )}

              </div>

            </div>

          </div>

          <div className="grid lg:grid-cols-[1fr_340px] gap-5">

            {/* CARD AREA */}

            <section className="bg-slate-200 rounded-2xl p-4 md:p-8 overflow-auto">

              <div className="text-center mb-3 font-bold text-slate-600">
                {side === "front"
                  ? "FRONT SIDE"
                  : "BACK SIDE"}
              </div>

              <div className="flex justify-center">

                <div
                  ref={cardRef}
                  className="relative overflow-hidden select-none shadow-2xl"
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

                  {/* BACKGROUND */}

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
                            key={element.id}
                            onPointerDown={(e) =>
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
                              left: element.x,
                              top: element.y,
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
                                src={memberPhoto}
                                alt="Member"
                                draggable={false}
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
                            key={element.id}
                            onPointerDown={(e) =>
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
                              left: element.x,
                              top: element.y,
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
                                src={qrImage}
                                alt="QR"
                                draggable={false}
                                className="w-full h-full pointer-events-none"
                              />
                            )}
                          </div>
                        );
                      }

                      /* STATIC IMAGE */

                      if (
                        element.kind ===
                        "image"
                      ) {
                        return (
                          <div
                            key={element.id}
                            onPointerDown={(e) =>
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
                              left: element.x,
                              top: element.y,
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
                                src={element.src}
                                alt="Card"
                                draggable={false}
                                className="w-full h-full object-contain pointer-events-none"
                              />
                            )}
                          </div>
                        );
                      }

                      /* TEXT / FOOTER */

                      return (
                        <div
                          key={element.id}
                          onPointerDown={(e) =>
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

            <aside className="bg-white rounded-2xl shadow p-5 h-fit">

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
                  onChange={uploadMemberPhoto}
                  className="w-full text-sm"
                />

              </div>

              {/* SELECT */}

              <div className="mb-5">

                <label className="block font-bold mb-2">
                  Select Element
                </label>

                <select
                  value={selectedId || ""}
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
                    .map((element) => (
                      <option
                        key={element.id}
                        value={element.id}
                      >
                        {element.label}
                      </option>
                    ))}
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
                          disabled={locked}
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
                          disabled={locked}
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
                          disabled={locked}
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
                            width: Number(
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
                            height: Number(
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
  );
}
