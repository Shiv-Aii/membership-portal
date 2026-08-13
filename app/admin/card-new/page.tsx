"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import AdminGuard from "@/components/AdminGuard";

type Side = "front" | "back";

type ElementKind =
  | "text"
  | "photo"
  | "qr"
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
};

const CARD_WIDTH = 856;
const CARD_HEIGHT = 539;

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
    label: "Organization English Name",
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
    text: "KRRS/2026/000001",
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

  /* BACK */

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
    id: "back-footer",
    label: "Footer Heading",
    kind: "footer",
    text: "🌱 ರೈತರು ನಮ್ಮ ಹೆಮ್ಮೆ | 🚜 ರೈತ ಬೆಳೆ — ದೇಶದ ಬೆಳೆ | 🌾 ರೈತರಿಗೆ ನಮ್ಮ ಶಕ್ತಿ",
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
];

export default function NewCardDesignerPage() {
  const [elements, setElements] =
    useState<CardElement[]>(initialElements);

  const [side, setSide] =
    useState<Side>("front");

  const [selectedId, setSelectedId] =
    useState<string | null>("name");

  const [photo, setPhoto] =
    useState<string | null>(null);

  const [qrImage, setQrImage] =
    useState("");

  const cardRef =
    useRef<HTMLDivElement>(null);

  /* =========================
     QR
  ========================= */

  useEffect(() => {
    async function createQR() {
      try {
        const url =
          typeof window !== "undefined"
            ? `${window.location.origin}/verify?membership=KRRS-2026-000001`
            : "https://example.com/verify";

        const dataUrl =
          await QRCode.toDataURL(url, {
            width: 300,
            margin: 1,
            color: {
              dark: "#075c2b",
              light: "#ffffff",
            },
          });

        setQrImage(dataUrl);
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

  /* =========================
     DRAG
  ========================= */

  function handlePointerDown(
    event: React.PointerEvent,
    element: CardElement
  ) {
    event.preventDefault();
    event.stopPropagation();

    setSelectedId(element.id);

    const startX =
      event.clientX;

    const startY =
      event.clientY;

    const originalX =
      element.x;

    const originalY =
      element.y;

    const rect =
      cardRef.current?.getBoundingClientRect();

    if (!rect) return;

    function move(e: PointerEvent) {
      const scaleX =
        rect!.width /
        CARD_WIDTH;

      const scaleY =
        rect!.height /
        CARD_HEIGHT;

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

  /* =========================
     PHOTO
  ========================= */

  function handlePhoto(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const url =
      URL.createObjectURL(file);

    setPhoto(url);
  }

  /* =========================
     DELETE
  ========================= */

  function deleteElement(
    id: string
  ) {
    setElements((current) =>
      current.filter(
        (element) =>
          element.id !== id
      )
    );

    setSelectedId(null);
  }

  /* =========================
     RESET
  ========================= */

  function resetDesign() {
    setElements(
      initialElements.map(
        (element) => ({
          ...element,
        })
      )
    );

    setSelectedId(null);
    setSide("front");
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

  return (
    <AdminGuard>
      <main className="min-h-screen bg-slate-100 p-4 md:p-6">

        <div className="max-w-[1500px] mx-auto">

          {/* HEADER */}

          <div className="bg-white rounded-2xl shadow p-4 mb-5 flex flex-wrap items-center justify-between gap-3">

            <div>
              <h1 className="text-2xl font-extrabold">
                🪪 Farmer PVC Card Designer
              </h1>

              <p className="text-slate-500">
                ಪ್ರತಿಯೊಂದು information ಅನ್ನು drag & edit ಮಾಡಬಹುದು
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">

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
                onClick={resetDesign}
                className="px-5 py-2 rounded-lg bg-red-100 text-red-700 font-bold"
              >
                Reset
              </button>

            </div>

          </div>

          <div className="grid lg:grid-cols-[1fr_330px] gap-5">

            {/* CARD */}

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

                  {/* TOP DESIGN */}

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

                  {/* FIELD BACKGROUND */}

                  <div
                    className="absolute left-0 right-0 bottom-0 pointer-events-none"
                    style={{
                      height: 150,
                      background:
                        "linear-gradient(to top,#d8efc8,transparent)",
                      opacity: 0.55,
                    }}
                  />

                  {/* DRAGGABLE ELEMENTS */}

                  {visibleElements.map(
                    (element) => {

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
                              zIndex: 20,
                              touchAction:
                                "none",
                            }}
                          >
                            {photo ? (
                              <img
                                src={photo}
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
                            {qrImage && (
                              <img
                                src={qrImage}
                                alt="QR Code"
                                draggable={false}
                                className="w-full h-full pointer-events-none"
                              />
                            )}
                          </div>
                        );
                      }

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
                                ? 40
                                : 50,
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
                💡 Photo / QR / Heading / Text ಮೇಲೆ press ಮಾಡಿ drag ಮಾಡಿ
              </p>

            </section>

            {/* EDIT PANEL */}

            <aside className="bg-white rounded-2xl shadow p-5 h-fit">

              <h2 className="text-xl font-extrabold mb-4">
                ✏️ Edit Information
              </h2>

              {/* PHOTO UPLOAD */}

              <div className="mb-5">

                <label className="block font-bold mb-2">
                  Member Photo
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhoto}
                  className="w-full text-sm"
                />

              </div>

              {/* FIELD SELECT */}

              <div className="mb-5">

                <label className="block font-bold mb-2">
                  Select Field
                </label>

                <select
                  value={
                    selectedId || ""
                  }
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
                        value={
                          element.id
                        }
                      >
                        {element.label}
                      </option>
                    ))}

                </select>

              </div>

              {selected && (
                <div className="space-y-4">

                  {/* TEXT */}

                  {selected.kind !==
                    "photo" &&
                    selected.kind !==
                      "qr" && (
                      <div>
                        <label className="block font-semibold mb-1">
                          Text
                        </label>

                        <textarea
                          value={
                            selected.text
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
                          rows={3}
                          className="w-full border rounded-lg p-2"
                        />
                      </div>
                    )}

                  {/* FONT */}

                  {selected.kind !==
                    "photo" &&
                    selected.kind !==
                      "qr" && (
                      <div>
                        <label className="block font-semibold mb-1">
                          Font Size
                        </label>

                        <input
                          type="number"
                          value={
                            selected.fontSize
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
                          className="w-full border rounded-lg p-2"
                        />
                      </div>
                    )}

                  {/* COLOR */}

                  {selected.kind !==
                    "photo" &&
                    selected.kind !==
                      "qr" && (
                      <div>
                        <label className="block font-semibold mb-1">
                          Text Color
                        </label>

                        <input
                          type="color"
                          value={
                            selected.color
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

                  {!selected.id.includes(
                    "valid"
                  ) &&
                    selected.kind !==
                      "photo" &&
                    selected.kind !==
                      "qr" && (
                      <button
                        onClick={() =>
                          deleteElement(
                            selected.id
                          )
                        }
                        className="w-full bg-red-600 text-white rounded-lg py-3 font-bold"
                      >
                        🗑️ Remove Field
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
