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
  side: Side;
  type: ElementType;

  text?: string;
  src?: string;

  x: number;
  y: number;

  width: number;
  height: number;

  fontSize?: number;
  bold?: boolean;
  color?: string;
  align?: "left" | "center" | "right";
};

const CARD_WIDTH = 856;
const CARD_HEIGHT = 539;

function Card() {
  const params = useSearchParams();
  const id = params.get("id");

  const [member, setMember] = useState<any>(null);
  const [qr, setQr] = useState("");

  const [side, setSide] = useState<Side>("front");

  const [locked, setLocked] = useState(false);

  const [title, setTitle] = useState(
    "ಸಂಸ್ಥೆ ಸದಸ್ಯತ್ವ ಕಾರ್ಡ್"
  );

  const [elements, setElements] = useState<CardElement[]>(
    []
  );

  const [selectedId, setSelectedId] = useState<string | null>(
    null
  );

  const [showAdd, setShowAdd] = useState(false);

  const [newText, setNewText] = useState("");

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const imageInput = useRef<HTMLInputElement>(null);

  /* =========================
     LOAD MEMBER
  ========================= */

  useEffect(() => {
    async function load() {
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

      setMember(data);

      if (data) {
        const publicUrl =
          `${window.location.origin}/member?id=${data.id}`;

        const qrData = await QRCode.toDataURL(
          publicUrl,
          {
            width: 400,
            margin: 2,
          }
        );

        setQr(qrData);
      }
    }

    load();
  }, [id]);

  /* =========================
     DEFAULT ELEMENTS
  ========================= */

  useEffect(() => {
    if (!member) return;

    const saved = localStorage.getItem(
      `pvc-design-${member.id}`
    );

    if (saved) {
      try {
        setElements(JSON.parse(saved));
        return;
      } catch {
        console.log("Saved design invalid");
      }
    }

    const defaults: CardElement[] = [
      {
        id: crypto.randomUUID(),
        side: "front",
        type: "text",
        text: "ಸಂಸ್ಥೆ ಸದಸ್ಯತ್ವ ಕಾರ್ಡ್",
        x: 28,
        y: 20,
        width: 450,
        height: 50,
        fontSize: 28,
        bold: true,
        color: "#ffffff",
        align: "left",
      },

      {
        id: crypto.randomUUID(),
        side: "front",
        type: "text",
        text: "ಹೆಸರು: [User Name]",
        x: 210,
        y: 155,
        width: 400,
        height: 40,
        fontSize: 22,
        bold: false,
        color: "#111827",
        align: "left",
      },

      {
        id: crypto.randomUUID(),
        side: "front",
        type: "text",
        text: "ಹುದ್ದೆ: [Designation]",
        x: 210,
        y: 200,
        width: 400,
        height: 40,
        fontSize: 20,
        color: "#111827",
        align: "left",
      },

      {
        id: crypto.randomUUID(),
        side: "front",
        type: "text",
        text: "ಗ್ರಾಮ: [Village]",
        x: 210,
        y: 240,
        width: 400,
        height: 40,
        fontSize: 18,
        color: "#111827",
        align: "left",
      },

      {
        id: crypto.randomUUID(),
        side: "front",
        type: "text",
        text: "ಮೊಬೈಲ್: [Mobile]",
        x: 210,
        y: 280,
        width: 400,
        height: 40,
        fontSize: 18,
        color: "#111827",
        align: "left",
      },

      {
        id: crypto.randomUUID(),
        side: "front",
        type: "text",
        text: "Member ID: [Member ID]",
        x: 210,
        y: 320,
        width: 400,
        height: 40,
        fontSize: 20,
        bold: true,
        color: "#111827",
        align: "left",
      },

      {
        id: crypto.randomUUID(),
        side: "front",
        type: "text",
        text: "ನಮ್ಮ ಸಂಘಟನೆ — ನಮ್ಮ ಬಲ",
        x: 170,
        y: 455,
        width: 500,
        height: 40,
        fontSize: 20,
        bold: true,
        color: "#166534",
        align: "center",
      },

      {
        id: crypto.randomUUID(),
        side: "back",
        type: "text",
        text: "ಸದಸ್ಯರ ವಿವರಗಳು",
        x: 280,
        y: 70,
        width: 350,
        height: 45,
        fontSize: 25,
        bold: true,
        color: "#166534",
        align: "center",
      },

      {
        id: crypto.randomUUID(),
        side: "back",
        type: "text",
        text: "ಜಿಲ್ಲೆ: [District]",
        x: 120,
        y: 150,
        width: 600,
        height: 40,
        fontSize: 20,
        color: "#111827",
        align: "left",
      },

      {
        id: crypto.randomUUID(),
        side: "back",
        type: "text",
        text: "ತಾಲೂಕು: [Taluk]",
        x: 120,
        y: 195,
        width: 600,
        height: 40,
        fontSize: 20,
        color: "#111827",
        align: "left",
      },

      {
        id: crypto.randomUUID(),
        side: "back",
        type: "text",
        text: "Aadhaar: [Aadhaar]",
        x: 120,
        y: 240,
        width: 600,
        height: 40,
        fontSize: 18,
        color: "#111827",
        align: "left",
      },

      {
        id: crypto.randomUUID(),
        side: "back",
        type: "text",
        text: "QR Scan ಮಾಡಿ Member Details ನೋಡಿ",
        x: 180,
        y: 440,
        width: 500,
        height: 40,
        fontSize: 16,
        color: "#475569",
        align: "center",
      },
    ];

    setElements(defaults);
  }, [member]);

  /* =========================
     SAVE DESIGN
  ========================= */

  function saveDesign() {
    if (!member) return;

    localStorage.setItem(
      `pvc-design-${member.id}`,
      JSON.stringify(elements)
    );

    alert("PVC Design saved successfully.");
  }

  /* =========================
     REPLACE PLACEHOLDERS
  ========================= */

  function displayText(text: string) {
    if (!member) return text;

    return text
      .replaceAll("[User Name]", member.name || "")
      .replaceAll(
        "[Designation]",
        member.designation || ""
      )
      .replaceAll(
        "[Village]",
        member.village || ""
      )
      .replaceAll(
        "[Taluk]",
        member.taluk || ""
      )
      .replaceAll(
        "[District]",
        member.district || ""
      )
      .replaceAll(
        "[Mobile]",
        member.mobile || ""
      )
      .replaceAll(
        "[Aadhaar]",
        member.aadhaar || ""
      )
      .replaceAll(
        "[Member ID]",
        member.membership_no || ""
      );
  }

  /* =========================
     ADD TEXT
  ========================= */

  function addText() {
    const item: CardElement = {
      id: crypto.randomUUID(),
      side,
      type: "text",
      text: newText || "ಹೊಸ ಪಠ್ಯ",
      x: 150,
      y: 350,
      width: 450,
      height: 50,
      fontSize: 22,
      bold: false,
      color: "#111827",
      align: "left",
    };

    setElements((prev) => [
      ...prev,
      item,
    ]);

    setSelectedId(item.id);
    setNewText("");
    setShowAdd(false);
  }

  /* =========================
     IMAGE UPLOAD
  ========================= */

  async function uploadImage(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      const path =
        `designer-${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("member-photos")
        .upload(path, file, {
          upsert: true,
          contentType: file.type,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("member-photos")
        .getPublicUrl(path);

      const item: CardElement = {
        id: crypto.randomUUID(),
        side,
        type: "image",
        src: data.publicUrl,
        x: 50,
        y: 60,
        width: 130,
        height: 100,
      };

      setElements((prev) => [
        ...prev,
        item,
      ]);

      setSelectedId(item.id);

      alert("Image added.");
    } catch (error: any) {
      alert(
        "Image upload failed: " +
        (error?.message || "Unknown error")
      );
    }

    if (imageInput.current) {
      imageInput.current.value = "";
    }
  }

  /* =========================
     DELETE
  ========================= */

  function deleteElement(elementId: string) {
    setElements((prev) =>
      prev.filter(
        (item) => item.id !== elementId
      )
    );

    setSelectedId(null);
  }

  /* =========================
     UPDATE
  ========================= */

  function updateElement(
    elementId: string,
    changes: Partial<CardElement>
  ) {
    setElements((prev) =>
      prev.map((item) =>
        item.id === elementId
          ? {
              ...item,
              ...changes,
            }
          : item
      )
    );
  }

  /* =========================
     DRAG
  ========================= */

  function startDrag(
    e: React.PointerEvent,
    element: CardElement
  ) {
    if (locked) return;

    e.preventDefault();
    e.stopPropagation();

    setSelectedId(element.id);

    const startX = e.clientX;
    const startY = e.clientY;

    const originalX = element.x;
    const originalY = element.y;

    function move(ev: PointerEvent) {
      const dx =
        ev.clientX - startX;

      const dy =
        ev.clientY - startY;

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

    function stop() {
      window.removeEventListener(
        "pointermove",
        move
      );

      window.removeEventListener(
        "pointerup",
        stop
      );
    }

    window.addEventListener(
      "pointermove",
      move
    );

    window.addEventListener(
      "pointerup",
      stop
    );
  }

  /* =========================
     CURRENT ELEMENT
  ========================= */

  const selected =
    elements.find(
      (x) => x.id === selectedId
    ) || null;

  /* =========================
     RENDER ELEMENT
  ========================= */

  function renderElement(
    element: CardElement
  ) {
    if (element.side !== side) {
      return null;
    }

    const isSelected =
      selectedId === element.id;

    return (
      <div
        key={element.id}
        onPointerDown={(e) =>
          startDrag(e, element)
        }
        onClick={(e) => {
          e.stopPropagation();
          setSelectedId(element.id);
        }}
        className={`absolute ${
          isSelected
            ? "ring-2 ring-blue-500"
            : ""
        }`}
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          zIndex: 20,
          cursor: locked
            ? "default"
            : "move",
        }}
      >
        {element.type === "text" ? (
          <div
            style={{
              fontSize:
                element.fontSize || 20,

              fontWeight:
                element.bold
                  ? 700
                  : 400,

              color:
                element.color ||
                "#111827",

              textAlign:
                element.align ||
                "left",

              width: "100%",
            }}
          >
            {displayText(
              element.text || ""
            )}
          </div>
        ) : (
          element.src && (
            <img
              src={element.src}
              alt="Card element"
              className="w-full h-full object-contain"
              draggable={false}
            />
          )
        )}

        {isSelected && !locked && (
          <button
            type="button"
            onPointerDown={(e) =>
              e.stopPropagation()
            }
            onClick={() =>
              deleteElement(
                element.id
              )
            }
            className="absolute -top-3 -right-3 bg-red-600 text-white w-7 h-7 rounded-full"
          >
            ×
          </button>
        )}
      </div>
    );
  }

  /* =========================
     CARD
  ========================= */

  function CardPreview() {
    return (
      <div
        className="relative bg-white overflow-hidden border rounded-xl shadow-xl"
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          transformOrigin: "top left",
        }}
        onClick={() =>
          setSelectedId(null)
        }
      >
        {side === "front" && (
          <>
            <div className="absolute inset-x-0 top-0 h-[110px] bg-gradient-to-r from-green-700 to-blue-700" />

            {member?.photo_url && (
              <img
                src={member.photo_url}
                crossOrigin="anonymous"
                className="absolute object-cover rounded-lg"
                style={{
                  left: 40,
                  top: 145,
                  width: 130,
                  height: 165,
                }}
                alt="Member"
              />
            )}

            {qr && (
              <img
                src={qr}
                className="absolute"
                style={{
                  right: 40,
                  top: 155,
                  width: 125,
                  height: 125,
                }}
                alt="QR"
              />
            )}
          </>
        )}

        {side === "back" && (
          <div className="absolute inset-0 bg-gradient-to-br from-white to-green-100" />
        )}

        {elements.map(
          renderElement
        )}
      </div>
    );
  }

  /* =========================
     PDF
  ========================= */

  async function generatePDF() {
    if (!frontRef.current || !backRef.current) {
      return;
    }

    try {
      const frontCanvas =
        await html2canvas(
          frontRef.current,
          {
            scale: 4,
            useCORS: true,
          }
        );

      const backCanvas =
        await html2canvas(
          backRef.current,
          {
            scale: 4,
            useCORS: true,
          }
        );

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85.6, 53.9],
      });

      pdf.addImage(
        frontCanvas.toDataURL(
          "image/png"
        ),
        "PNG",
        0,
        0,
        85.6,
        53.9
      );

      pdf.addPage(
        [85.6, 53.9],
        "landscape"
      );

      pdf.addImage(
        backCanvas.toDataURL(
          "image/png"
        ),
        "PNG",
        0,
        0,
        85.6,
        53.9
      );

      pdf.save(
        `${member?.membership_no || "member"}-PVC.pdf`
      );
    } catch (error) {
      console.error(error);
      alert("PDF generation failed.");
    }
  }

  /* =========================
     LOADING
  ========================= */

  if (!member) {
    return (
      <main className="p-10">
        Loading card designer...
      </main>
    );
  }

  /* =========================
     UI
  ========================= */

  return (
    <main className="min-h-screen bg-slate-100 p-4">

      <div className="max-w-[1400px] mx-auto">

        {/* HEADER */}

        <div className="flex flex-wrap justify-between items-center gap-3 mb-5">

          <div>
            <h1 className="text-2xl font-bold">
              PVC Card Designer
            </h1>

            <p className="text-sm text-slate-500">
              Front + Back •
              85.6 × 53.9 mm
            </p>
          </div>

          <div className="flex gap-2">

            <button
              onClick={() => {
                setLocked(
                  !locked
                );

                if (!locked) {
                  saveDesign();
                }
              }}
              className="bg-slate-900 text-white px-4 py-2 rounded-xl"
            >
              {locked
                ? "🔓 Unlock"
                : "🔒 Lock Design"}
            </button>

            <button
              onClick={saveDesign}
              disabled={locked}
              className="bg-white border px-4 py-2 rounded-xl disabled:opacity-50"
            >
              💾 Save
            </button>

            <button
              onClick={generatePDF}
              className="bg-green-600 text-white px-4 py-2 rounded-xl"
            >
              📄 Generate PDF
            </button>

          </div>
        </div>

        {/* SIDE SWITCH */}

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

        {/* MAIN */}

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">

          {/* FIXED CARD AREA */}

          <div className="overflow-auto bg-slate-200 rounded-2xl p-5">

            <div
              className="mx-auto"
              style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
              }}
            >
              <CardPreview />
            </div>

          </div>

          {/* EDIT PANEL */}

          <div className="bg-white rounded-2xl shadow">

            <div className="p-5 border-b">

              <h2 className="text-lg font-bold">
                Edit Panel
              </h2>

              <p className="text-sm text-slate-500">
                Card fixed • ಈ panel ಮಾತ್ರ scroll ಆಗುತ್ತದೆ
              </p>

            </div>

            <div className="max-h-[75vh] overflow-y-auto p-5">

              {/* TITLE */}

              <label className="font-semibold block">
                Card Title
              </label>

              <input
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                disabled={locked}
                className="w-full border rounded-xl p-3 mt-2"
              />

              {/* ADD */}

              <button
                onClick={() =>
                  setShowAdd(
                    !showAdd
                  )
                }
                disabled={locked}
                className="w-full border rounded-xl p-3 mt-4 font-semibold disabled:opacity-50"
              >
                + Add Text / Image
              </button>

              {showAdd && !locked && (
                <div className="bg-slate-50 border rounded-xl p-4 mt-3">

                  <input
                    value={newText}
                    onChange={(e) =>
                      setNewText(
                        e.target.value
                      )
                    }
                    placeholder="Text / ಪಠ್ಯ"
                    className="w-full border rounded-lg p-3"
                  />

                  <button
                    onClick={addText}
                    className="w-full bg-blue-600 text-white rounded-lg p-3 mt-3"
                  >
                    + Add Text
                  </button>

                  <button
                    onClick={() =>
                      imageInput.current?.click()
                    }
                    className="w-full bg-purple-600 text-white rounded-lg p-3 mt-3"
                  >
                    🖼️ Add Image / Logo
                  </button>

                  <input
                    ref={imageInput}
                    type="file"
                    accept="image/*"
                    onChange={uploadImage}
                    className="hidden"
                  />

                </div>
              )}

              {/* ELEMENTS */}

              <div className="mt-6">

                <h3 className="font-bold">
                  {side === "front"
                    ? "Front Elements"
                    : "Back Elements"}
                </h3>

                <div className="grid gap-2 mt-3">

                  {elements
                    .filter(
                      (x) =>
                        x.side === side
                    )
                    .map((element) => (
                      <button
                        key={element.id}
                        onClick={() =>
                          setSelectedId(
                            element.id
                          )
                        }
                        className={`text-left border rounded-lg p-3 ${
                          selectedId ===
                          element.id
                            ? "border-blue-500 bg-blue-50"
                            : ""
                        }`}
                      >
                        {element.type ===
                        "text"
                          ? `📝 ${element.text}`
                          : "🖼️ Image / Logo"}
                      </button>
                    ))}

                </div>

              </div>

              {/* EDIT SELECTED */}

              {selected && (
                <div className="mt-6 border rounded-2xl p-4">

                  <h3 className="font-bold">
                    ✏️ Edit Element
                  </h3>

                  {selected.type ===
                    "text" && (
                    <>
                      <label className="block font-semibold mt-4">
                        Text
                      </label>

                      <textarea
                        value={
                          selected.text ||
                          ""
                        }
                        onChange={(e) =>
                          updateElement(
                            selected.id,
                            {
                              text: e.target
                                .value,
                            }
                          )
                        }
                        className="w-full border rounded-xl p-3 mt-2"
                        rows={3}
                      />

                      <label className="block font-semibold mt-4">
                        Font Size
                      </label>

                      <input
                        type="range"
                        min="8"
                        max="60"
                        value={
                          selected.fontSize ||
                          20
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
                        className="w-full"
                      />

                      <label className="flex gap-2 items-center mt-4">
                        <input
                          type="checkbox"
                          checked={
                            selected.bold ||
                            false
                          }
                          onChange={(e) =>
                            updateElement(
                              selected.id,
                              {
                                bold:
                                  e.target
                                    .checked,
                              }
                            )
                          }
                        />
                        Bold
                      </label>

                      <label className="block font-semibold mt-4">
                        Color
                      </label>

                      <input
                        type="color"
                        value={
                          selected.color ||
                          "#111827"
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
                        className="w-full h-12 mt-2"
                      />

                      <label className="block font-semibold mt-4">
                        Alignment
                      </label>

                      <select
                        value={
                          selected.align ||
                          "left"
                        }
                        onChange={(e) =>
                          updateElement(
                            selected.id,
                            {
                              align:
                                e.target
                                  .value as
                                  | "left"
                                  | "center"
                                  | "right",
                            }
                          )
                        }
                        className="w-full border rounded-xl p-3 mt-2"
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
                    </>
                  )}

                  <label className="block font-semibold mt-4">
                    Width
                  </label>

                  <input
                    type="range"
                    min="40"
                    max="700"
                    value={
                      selected.width
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
                    className="w-full"
                  />

                  <label className="block font-semibold mt-4">
                    Height
                  </label>

                  <input
                    type="range"
                    min="30"
                    max="500"
                    value={
                      selected.height
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
                    className="w-full"
                  />

                  <button
                    onClick={() =>
                      deleteElement(
                        selected.id
                      )
                    }
                    className="w-full bg-red-600 text-white rounded-xl p-3 mt-5"
                  >
                    🗑️ Delete
                  </button>

                </div>
              )}

            </div>

          </div>

        </div>

        {/* HIDDEN FULL SIZE CARDS FOR PDF */}

        <div
          style={{
            position: "fixed",
            left: "-10000px",
            top: 0,
          }}
        >
          <div ref={frontRef}>
            <CardPDF side="front" />
          </div>

          <div ref={backRef}>
            <CardPDF side="back" />
          </div>
        </div>

      </div>

    </main>
  );

  /* =========================
     PDF CARD
  ========================= */

  function CardPDF({
    side: pdfSide,
  }: {
    side: Side;
  }) {
    return (
      <div
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          position: "relative",
          background:
            pdfSide === "front"
              ? "linear-gradient(135deg,#ffffff 35%,#dcfce7)"
              : "linear-gradient(135deg,#ffffff,#dcfce7)",
          overflow: "hidden",
        }}
      >
        {pdfSide === "front" && (
          <>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: 110,
                background:
                  "linear-gradient(90deg,#15803d,#1d4ed8)",
              }}
            />

            {member?.photo_url && (
              <img
                src={member.photo_url}
                crossOrigin="anonymous"
                style={{
                  position: "absolute",
                  left: 40,
                  top: 145,
                  width: 130,
                  height: 165,
                  objectFit: "cover",
                }}
                alt=""
              />
            )}

            {qr && (
              <img
                src={qr}
                style={{
                  position: "absolute",
                  right: 40,
                  top: 155,
                  width: 125,
                  height: 125,
                }}
                alt=""
              />
            )}
          </>
        )}

        {elements
          .filter(
            (x) => x.side === pdfSide
          )
          .map((element) => (
            <div
              key={element.id}
              style={{
                position: "absolute",
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                fontSize:
                  element.fontSize ||
                  20,
                fontWeight:
                  element.bold
                    ? 700
                    : 400,
                color:
                  element.color ||
                  "#111827",
                textAlign:
                  element.align ||
                  "left",
              }}
            >
              {element.type ===
              "text" ? (
                displayText(
                  element.text || ""
                )
              ) : (
                element.src && (
                  <img
                    src={element.src}
                    crossOrigin="anonymous"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit:
                        "contain",
                    }}
                    alt=""
                  />
                )
              )}
            </div>
          ))}
      </div>
    );
  }
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
