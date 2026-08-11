"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";

import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
};

const defaultFront: CardElement[] = [
  {
    id: "front-title",
    side: "front",
    type: "text",
    text: "ಸಂಸ್ಥೆ ಸದಸ್ಯತ್ವ ಕಾರ್ಡ್",
    x: 5,
    y: 5,
    width: 60,
    height: 10,
    fontSize: 16,
    bold: true,
    color: "#ffffff",
  },

  {
    id: "front-name",
    side: "front",
    type: "text",
    text: "ಹೆಸರು: [User Name]",
    x: 25,
    y: 32,
    width: 50,
    height: 8,
    fontSize: 10,
    bold: true,
    color: "#111827",
  },

  {
    id: "front-designation",
    side: "front",
    type: "text",
    text: "ಹುದ್ದೆ: [Designation]",
    x: 25,
    y: 43,
    width: 50,
    height: 8,
    fontSize: 9,
    color: "#111827",
  },

  {
    id: "front-village",
    side: "front",
    type: "text",
    text: "ಗ್ರಾಮ: [Village]",
    x: 25,
    y: 54,
    width: 50,
    height: 8,
    fontSize: 9,
    color: "#111827",
  },

  {
    id: "front-mobile",
    side: "front",
    type: "text",
    text: "ಮೊಬೈಲ್: [Mobile]",
    x: 25,
    y: 65,
    width: 50,
    height: 8,
    fontSize: 9,
    color: "#111827",
  },

  {
    id: "front-id",
    side: "front",
    type: "text",
    text: "Member ID: [Member ID]",
    x: 25,
    y: 76,
    width: 50,
    height: 8,
    fontSize: 9,
    bold: true,
    color: "#111827",
  },
];

const defaultBack: CardElement[] = [
  {
    id: "back-title",
    side: "back",
    type: "text",
    text: "ನಮ್ಮ ಸಂಘಟನೆ — ನಮ್ಮ ಬಲ",
    x: 15,
    y: 15,
    width: 70,
    height: 10,
    fontSize: 15,
    bold: true,
    color: "#166534",
  },

  {
    id: "back-description",
    side: "back",
    type: "text",
    text: "ಈ ಕಾರ್ಡ್ ಸಂಸ್ಥೆಯ ಅಧಿಕೃತ ಸದಸ್ಯತ್ವವನ್ನು ದೃಢೀಕರಿಸುತ್ತದೆ.",
    x: 10,
    y: 35,
    width: 80,
    height: 20,
    fontSize: 10,
    color: "#111827",
  },
];

function CardDesigner() {
  const params = useSearchParams();

  const memberId = params.get("id");

  const [member, setMember] = useState<any>(null);

  const [qr, setQr] = useState("");

  const [side, setSide] =
    useState<Side>("front");

  const [locked, setLocked] =
    useState(false);

  const [frontElements, setFrontElements] =
    useState<CardElement[]>(defaultFront);

  const [backElements, setBackElements] =
    useState<CardElement[]>(defaultBack);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  const frontPdfRef =
    useRef<HTMLDivElement>(null);

  const backPdfRef =
    useRef<HTMLDivElement>(null);

  const elements =
    side === "front"
      ? frontElements
      : backElements;

  function updateCurrentElements(
    next: CardElement[]
  ) {
    if (side === "front") {
      setFrontElements(next);
    } else {
      setBackElements(next);
    }
  }

  /* =========================
     LOAD MEMBER
  ========================= */

  useEffect(() => {
    async function loadMember() {
      if (!memberId) return;

      const { data, error } =
        await supabase
          .from("applications")
          .select("*")
          .eq("id", memberId)
          .single();

      if (error) {
        console.error(error);
        setMessage(
          "Member load ಆಗಲಿಲ್ಲ."
        );
        return;
      }

      setMember(data);

      /*
        QR ಯಾವಾಗಲೂ ಈ memberನ
        separate public pageಗೆ ಹೋಗುತ್ತದೆ.
      */

      const publicUrl =
        `${window.location.origin}/member/${data.id}`;

      const qrImage =
        await QRCode.toDataURL(
          publicUrl,
          {
            width: 500,
            margin: 2,
          }
        );

      setQr(qrImage);
    }

    loadMember();
  }, [memberId]);

  /* =========================
     LOAD SAVED DESIGN
  ========================= */

  useEffect(() => {
    if (!memberId) return;

    const savedFront =
      localStorage.getItem(
        `pvc-front-${memberId}`
      );

    const savedBack =
      localStorage.getItem(
        `pvc-back-${memberId}`
      );

    if (savedFront) {
      try {
        setFrontElements(
          JSON.parse(savedFront)
        );
      } catch {}
    }

    if (savedBack) {
      try {
        setBackElements(
          JSON.parse(savedBack)
        );
      } catch {}
    }
  }, [memberId]);

  /* =========================
     PLACEHOLDER
  ========================= */

  function displayText(
    text: string
  ) {
    if (!member) return text;

    return text
      .replaceAll(
        "[User Name]",
        member.name || ""
      )
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
     UPDATE
  ========================= */

  function updateElement(
    id: string,
    changes: Partial<CardElement>
  ) {
    updateCurrentElements(
      elements.map((item) =>
        item.id === id
          ? {
              ...item,
              ...changes,
            }
          : item
      )
    );
  }

  /* =========================
     ADD TEXT
  ========================= */

  function addText() {
    if (locked) return;

    const item: CardElement = {
      id: crypto.randomUUID(),
      side,
      type: "text",
      text: "ಹೊಸ ಪಠ್ಯ",
      x: 20,
      y: 20,
      width: 55,
      height: 10,
      fontSize: 10,
      color: "#111827",
    };

    updateCurrentElements([
      ...elements,
      item,
    ]);

    setSelectedId(item.id);
    setEditingId(item.id);
  }

  /* =========================
     ADD IMAGE
  ========================= */

  function addImage() {
    if (locked) return;

    const input =
      document.createElement("input");

    input.type = "file";
    input.accept = "image/*";

    input.onchange = () => {
      const file =
        input.files?.[0];

      if (!file) return;

      const reader =
        new FileReader();

      reader.onload = () => {
        const item: CardElement = {
          id: crypto.randomUUID(),
          side,
          type: "image",
          src: reader.result as string,
          x: 65,
          y: 25,
          width: 20,
          height: 25,
        };

        updateCurrentElements([
          ...elements,
          item,
        ]);

        setSelectedId(item.id);
      };

      reader.readAsDataURL(file);
    };

    input.click();
  }

  /* =========================
     ADD QR
  ========================= */

  function addQr() {
    if (locked || !qr) return;

    const item: CardElement = {
      id: crypto.randomUUID(),
      side,
      type: "image",
      src: qr,
      x: 75,
      y: 55,
      width: 18,
      height: 30,
    };

    updateCurrentElements([
      ...elements,
      item,
    ]);

    setSelectedId(item.id);
  }

  /* =========================
     DELETE
  ========================= */

  function deleteElement() {
    if (!selectedId || locked) return;

    updateCurrentElements(
      elements.filter(
        (item) =>
          item.id !== selectedId
      )
    );

    setSelectedId(null);
    setEditingId(null);
  }

  /* =========================
     DRAG
  ========================= */

  function startDrag(
    e: React.PointerEvent,
    item: CardElement
  ) {
    if (locked) return;

    e.preventDefault();
    e.stopPropagation();

    setSelectedId(item.id);

    const startX = e.clientX;
    const startY = e.clientY;

    const originalX = item.x;
    const originalY = item.y;

    function move(
      event: PointerEvent
    ) {
      const dx =
        ((event.clientX - startX) /
          600) *
        100;

      const dy =
        ((event.clientY - startY) /
          380) *
        100;

      updateElement(item.id, {
        x: Math.max(
          0,
          Math.min(
            95 - item.width,
            originalX + dx
          )
        ),

        y: Math.max(
          0,
          Math.min(
            95 - item.height,
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
     SAVE
  ========================= */

  function saveDesign() {
    if (!memberId) return;

    localStorage.setItem(
      `pvc-front-${memberId}`,
      JSON.stringify(
        frontElements
      )
    );

    localStorage.setItem(
      `pvc-back-${memberId}`,
      JSON.stringify(
        backElements
      )
    );

    setMessage(
      "Design saved successfully ✅"
    );
  }

  /* =========================
     PDF
  ========================= */

  async function generatePDF() {
    if (
      !frontPdfRef.current ||
      !backPdfRef.current ||
      !member
    ) {
      return;
    }

    try {
      const frontCanvas =
        await html2canvas(
          frontPdfRef.current,
          {
            scale: 4,
            useCORS: true,
            backgroundColor:
              "#ffffff",
          }
        );

      const backCanvas =
        await html2canvas(
          backPdfRef.current,
          {
            scale: 4,
            useCORS: true,
            backgroundColor:
              "#ffffff",
          }
        );

      const pdf =
        new jsPDF({
          orientation:
            "landscape",
          unit: "mm",
          format: [
            85.6,
            53.9,
          ],
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
        `${
          member.membership_no ||
          "member"
        }-PVC.pdf`
      );

    } catch (error) {
      console.error(error);

      alert(
        "PDF generate ಆಗಲಿಲ್ಲ."
      );
    }
  }

  /* =========================
     CARD
  ========================= */

  function CardPreview({
    pdf = false,
  }: {
    pdf?: boolean;
  }) {
    return (
      <div
        className={
          pdf
            ? "relative bg-white overflow-hidden"
            : "relative bg-white overflow-hidden rounded-2xl shadow-xl border"
        }
        style={{
          width: pdf
            ? "856px"
            : "100%",

          height: pdf
            ? "539px"
            : undefined,

          aspectRatio:
            pdf
              ? undefined
              : "85.6 / 53.9",

          background:
            "linear-gradient(135deg,#ffffff,#dcfce7)",
        }}
        onClick={() =>
          !pdf &&
          setSelectedId(null)
        }
      >

        {/* FRONT BACK BACKGROUND */}

        {side === "front" && (
          <>
            <div
              className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-700 to-blue-700"
              style={{
                height: "20%",
              }}
            />

            {member?.photo_url && (
              <img
                src={
                  member.photo_url
                }
                crossOrigin="anonymous"
                className="absolute object-cover rounded-lg"
                style={{
                  left: "5%",
                  top: "28%",
                  width: "16%",
                  height: "38%",
                }}
                alt=""
              />
            )}
          </>
        )}

        {side === "back" && (
          <div className="absolute inset-0 bg-gradient-to-br from-white to-green-100" />
        )}

        {/* ELEMENTS */}

        {elements.map(
          (item) => {

            const selected =
              selectedId ===
              item.id;

            return (
              <div
                key={item.id}
                onPointerDown={(e) =>
                  !pdf &&
                  startDrag(
                    e,
                    item
                  )
                }
                onClick={(e) => {
                  if (pdf) return;

                  e.stopPropagation();

                  setSelectedId(
                    item.id
                  );
                }}
                className={
                  !pdf &&
                  selected &&
                  !locked
                    ? "absolute ring-2 ring-blue-500 cursor-move"
                    : "absolute"
                }
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  width: `${item.width}%`,
                  height: `${item.height}%`,
                  zIndex: 20,
                }}
              >

                {item.type ===
                "text" ? (
                  editingId ===
                    item.id &&
                  !locked &&
                  !pdf ? (
                    <textarea
                      autoFocus
                      value={
                        item.text ||
                        ""
                      }
                      onChange={(
                        e
                      ) =>
                        updateElement(
                          item.id,
                          {
                            text:
                              e.target
                                .value,
                          }
                        )
                      }
                      onBlur={() =>
                        setEditingId(
                          null
                        )
                      }
                      className="w-full h-full border bg-white p-1 resize-none"
                    />
                  ) : (
                    <div
                      onDoubleClick={() =>
                        !pdf &&
                        !locked &&
                        setEditingId(
                          item.id
                        )
                      }
                      style={{
                        fontSize:
                          pdf
                            ? `${
                                (item.fontSize ||
                                  10) *
                                4
                              }px`
                            : `${item.fontSize || 10}px`,

                        fontWeight:
                          item.bold
                            ? 700
                            : 400,

                        color:
                          item.color ||
                          "#111827",

                        whiteSpace:
                          "pre-wrap",
                      }}
                    >
                      {displayText(
                        item.text ||
                          ""
                      )}
                    </div>
                  )
                ) : (
                  item.src && (
                    <img
                      src={item.src}
                      alt=""
                      className="w-full h-full object-contain"
                      draggable={false}
                    />
                  )
                )}

              </div>
            );
          }
        )}

        {/* QR */}

        {side === "front" &&
          qr && (
            <img
              src={qr}
              alt="QR"
              className="absolute"
              style={{
                right: "4%",
                bottom: "5%",
                width: "15%",
                aspectRatio:
                  "1 / 1",
              }}
            />
          )}

      </div>
    );
  }

  if (!member) {
    return (
      <main className="min-h-screen grid place-items-center">
        Loading PVC Card...
      </main>
    );
  }

  const selected =
    elements.find(
      (item) =>
        item.id ===
        selectedId
    );

  return (
    <main className="min-h-screen bg-slate-100">

      {/* HEADER */}

      <header className="sticky top-0 z-50 bg-white border-b p-4">

        <div className="max-w-7xl mx-auto flex flex-wrap justify-between gap-3">

          <div>
            <h1 className="text-xl font-bold">
              PVC Card Designer
            </h1>

            <p className="text-sm text-slate-500">
              {member.name} •{" "}
              {member.membership_no}
            </p>
          </div>

          <div className="flex gap-2">

            <button
              onClick={() =>
                setLocked(
                  !locked
                )
              }
              className="bg-slate-900 text-white px-4 py-2 rounded-xl"
            >
              {locked
                ? "🔓 Unlock"
                : "🔒 Lock Design"}
            </button>

            <button
              onClick={
                saveDesign
              }
              className="bg-blue-600 text-white px-4 py-2 rounded-xl"
            >
              💾 Save
            </button>

            <button
              onClick={
                generatePDF
              }
              className="bg-green-600 text-white px-4 py-2 rounded-xl"
            >
              📄 PDF
            </button>

          </div>

        </div>

      </header>

      <div className="max-w-7xl mx-auto p-5">

        {/* FRONT BACK */}

        <div className="flex gap-2 mb-5">

          <button
            onClick={() =>
              setSide("front")
            }
            className={`px-5 py-2 rounded-xl ${
              side === "front"
                ? "bg-blue-600 text-white"
                : "bg-white"
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
                : "bg-white"
            }`}
          >
            Back
          </button>

        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">

          {/* CARD */}

          <section className="bg-slate-200 rounded-2xl p-5 overflow-auto">

            <div className="max-w-[850px] mx-auto">

              <CardPreview />

            </div>

            <p className="text-center text-sm text-slate-500 mt-4">
              Text ಮೇಲೆ double-click → edit
              <br />
              Drag → position change
            </p>

          </section>

          {/* EDIT PANEL */}

          <aside className="bg-white rounded-2xl shadow">

            <div className="p-5 border-b">

              <h2 className="font-bold text-lg">
                Edit Panel
              </h2>

              <p className="text-sm text-slate-500">
                ಈ panel ಮಾತ್ರ scroll ಆಗುತ್ತದೆ.
              </p>

            </div>

            <div className="max-h-[75vh] overflow-y-auto p-5">

              <div className="grid gap-3">

                <button
                  disabled={locked}
                  onClick={addText}
                  className="border rounded-xl p-3 disabled:opacity-40"
                >
                  + Add Text
                </button>

                <button
                  disabled={locked}
                  onClick={addImage}
                  className="border rounded-xl p-3 disabled:opacity-40"
                >
                  🖼️ Add Image / Logo
                </button>

                <button
                  disabled={
                    locked ||
                    !qr
                  }
                  onClick={addQr}
                  className="border rounded-xl p-3 disabled:opacity-40"
                >
                  ▣ Add QR Code
                </button>

                <button
                  disabled={
                    locked ||
                    !selectedId
                  }
                  onClick={
                    deleteElement
                  }
                  className="border border-red-300 text-red-600 rounded-xl p-3 disabled:opacity-40"
                >
                  🗑️ Delete Selected
                </button>

              </div>

              {/* ELEMENT LIST */}

              <div className="mt-6">

                <h3 className="font-bold">
                  {side === "front"
                    ? "Front Elements"
                    : "Back Elements"}
                </h3>

                <div className="grid gap-2 mt-3">

                  {elements.map(
                    (item) => (
                      <button
                        key={
                          item.id
                        }
                        onClick={() =>
                          setSelectedId(
                            item.id
                          )
                        }
                        className={`text-left border rounded-xl p-3 ${
                          selectedId ===
                          item.id
                            ? "bg-blue-50 border-blue-500"
                            : ""
                        }`}
                      >
                        {item.type ===
                        "text"
                          ? `📝 ${item.text}`
                          : "🖼️ Image"}
                      </button>
                    )
                  )}

                </div>

              </div>

              {/* EDIT SELECTED */}

              {selected && (
                <div className="border-t mt-6 pt-5">

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
                        disabled={locked}
                        value={
                          selected.text ||
                          ""
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
                        className="w-full border rounded-xl p-3 mt-2"
                        rows={4}
                      />

                      <label className="block font-semibold mt-4">
                        Font Size
                      </label>

                      <input
                        disabled={locked}
                        type="range"
                        min="6"
                        max="30"
                        value={
                          selected.fontSize ||
                          10
                        }
                        onChange={(
                          e
                        ) =>
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

                      <label className="flex items-center gap-2 mt-4">

                        <input
                          disabled={locked}
                          type="checkbox"
                          checked={
                            selected.bold ||
                            false
                          }
                          onChange={(
                            e
                          ) =>
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
                        Text Color
                      </label>

                      <input
                        disabled={locked}
                        type="color"
                        value={
                          selected.color ||
                          "#111827"
                        }
                        onChange={(
                          e
                        ) =>
                          updateElement(
                            selected.id,
                            {
                              color:
                                e.target
                                  .value,
                            }
                          )
                        }
                        className="w-full h-12"
                      />

                    </>
                  )}

                  <label className="block font-semibold mt-4">
                    X Position
                  </label>

                  <input
                    disabled={locked}
                    type="range"
                    min="0"
                    max="90"
                    value={
                      selected.x
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
                    className="w-full"
                  />

                  <label className="block font-semibold mt-4">
                    Y Position
                  </label>

                  <input
                    disabled={locked}
                    type="range"
                    min="0"
                    max="90"
                    value={
                      selected.y
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
                    className="w-full"
                  />

                  <label className="block font-semibold mt-4">
                    Width
                  </label>

                  <input
                    disabled={locked}
                    type="range"
                    min="5"
                    max="90"
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
                    disabled={locked}
                    type="range"
                    min="5"
                    max="80"
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
                    disabled={locked}
                    onClick={
                      deleteElement
                    }
                    className="w-full bg-red-600 text-white rounded-xl p-3 mt-5 disabled:opacity-40"
                  >
                    🗑️ Delete
                  </button>

                </div>
              )}

              {message && (
                <div className="mt-5 bg-green-50 text-green-700 rounded-xl p-3">
                  {message}
                </div>
              )}

            </div>

          </aside>

        </div>

        {/* HIDDEN PDF FRONT */}

        <div
          style={{
            position: "fixed",
            left: "-10000px",
            top: 0,
          }}
        >

          <div
            ref={frontPdfRef}
            style={{
              width: "856px",
              height: "539px",
            }}
          >
            <CardPDF
              side="front"
            />
          </div>

          <div
            ref={backPdfRef}
            style={{
              width: "856px",
              height: "539px",
            }}
          >
            <CardPDF
              side="back"
            />
          </div>

        </div>

      </div>

    </main>
  );

  function CardPDF({
    side: pdfSide,
  }: {
    side: Side;
  }) {
    const pdfElements =
      pdfSide === "front"
        ? frontElements
        : backElements;

    return (
      <div
        style={{
          width: "856px",
          height: "539px",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg,#ffffff,#dcfce7)",
        }}
      >

        {pdfSide === "front" && (
          <>
            <div
              style={{
                position:
                  "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "20%",
                background:
                  "linear-gradient(90deg,#15803d,#1d4ed8)",
              }}
            />

            {member?.photo_url && (
              <img
                src={
                  member.photo_url
                }
                crossOrigin="anonymous"
                style={{
                  position:
                    "absolute",
                  left: "5%",
                  top: "28%",
                  width: "16%",
                  height: "38%",
                  objectFit:
                    "cover",
                  borderRadius:
                    "10px",
                }}
                alt=""
              />
            )}
          </>
        )}

        {pdfElements.map(
          (item) => (
            <div
              key={
                item.id
              }
              style={{
                position:
                  "absolute",
                left:
                  `${item.x}%`,
                top:
                  `${item.y}%`,
                width:
                  `${item.width}%`,
                height:
                  `${item.height}%`,
                fontSize:
                  `${
                    (item.fontSize ||
                      10) *
                    4
                  }px`,
                fontWeight:
                  item.bold
                    ? 700
                    : 400,
                color:
                  item.color ||
                  "#111827",
              }}
            >

              {item.type ===
              "text"
                ? displayText(
                    item.text ||
                      ""
                  )
                : item.src && (
                    <img
                      src={
                        item.src
                      }
                      style={{
                        width:
                          "100%",
                        height:
                          "100%",
                        objectFit:
                          "contain",
                      }}
                      alt=""
                    />
                  )}

            </div>
          )
        )}

        {pdfSide ===
          "front" &&
          qr && (
            <img
              src={qr}
              style={{
                position:
                  "absolute",
                right: "4%",
                bottom: "5%",
                width: "15%",
              }}
              alt=""
            />
          )}

      </div>
    );
  }
}

export default function CardPage() {
  return (
    <Suspense
      fallback={
        <main className="p-10">
          Loading Card Designer...
        </main>
      }
    >
      <CardDesigner />
    </Suspense>
  );
}
