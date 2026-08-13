"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import AdminGuard from "@/components/AdminGuard";

type Side = "front" | "back";

type CardElement = {
  id: string;
  label: string;
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
};

const CARD_WIDTH = 856;
const CARD_HEIGHT = 539;

const initialElements: CardElement[] = [
  {
    id: "org-kn",
    label: "ಸಂಘಟನೆಯ ಹೆಸರು",
    text: "ಕರ್ನಾಟಕ ರಾಜ್ಯ ರೈತ ಸಂಘ ಹಾಗೂ ಹಸಿರು ಸೇನೆ",
    side: "front",
    x: 190,
    y: 30,
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
    text: "KARNATAKA RAJYA RAITHA SANGH & GREEN BRIGADE",
    side: "front",
    x: 205,
    y: 78,
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

  /* BACK */

  {
    id: "back-title",
    label: "Back Title",
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
    useState<string>("");

  const cardRef = useRef<HTMLDivElement>(null);

  const selected =
    elements.find((e) => e.id === selectedId) || null;

  /* QR CODE */

  useEffect(() => {
    async function createQR() {
      const url =
        typeof window !== "undefined"
          ? `${window.location.origin}/verify?membership=KRRS/2026/000001`
          : "https://example.com/verify";

      try {
        const dataUrl =
          await QRCode.toDataURL(url, {
            width: 180,
            margin: 1,
            color: {
              dark: "#075c2b",
              light: "#ffffff",
            },
          });

        setQrImage(dataUrl);
      } catch {
        setQrImage("");
      }
    }

    createQR();
  }, []);

  /* UPDATE ELEMENT */

  function updateElement(
    id: string,
    changes: Partial<CardElement>
  ) {
    setElements((current) =>
      current.map((element) =>
        element.id === id
          ? { ...element, ...changes }
          : element
      )
    );
  }

  /* DELETE ELEMENT */

  function deleteElement(id: string) {
    setElements((current) =>
      current.filter((element) => element.id !== id)
    );

    setSelectedId(null);
  }

  /* DRAG */

  function handlePointerDown(
    event: React.PointerEvent,
    element: CardElement
  ) {
    event.preventDefault();
    event.stopPropagation();

    setSelectedId(element.id);

    const startX = event.clientX;
    const startY = event.clientY;

    const originalX = element.x;
    const originalY = element.y;

    function move(e: PointerEvent) {
      const dx =
        ((e.clientX - startX) /
          (cardRef.current?.getBoundingClientRect().width || CARD_WIDTH)) *
        CARD_WIDTH;

      const dy =
        ((e.clientY - startY) /
          (cardRef.current?.getBoundingClientRect().height || CARD_HEIGHT)) *
        CARD_HEIGHT;

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

  /* PHOTO */

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

  /* RESET */

  function resetDesign() {
    setElements(initialElements);
    setSelectedId(null);
    setSide("front");
  }

  const visibleElements =
    elements.filter(
      (element) => element.side === side
    );

  return (
    <AdminGuard>
      <main className="min-h-screen bg-slate-100 p-4 md:p-6">

        {/* HEADER */}

        <div className="max-w-[1500px] mx-auto">

          <div className="bg-white rounded-2xl shadow p-4 mb-5 flex flex-wrap gap-3 items-center justify-between">

            <div>
              <h1 className="text-2xl font-extrabold">
                🪪 New PVC Card Designer
              </h1>

              <p className="text-slate-500">
                ಹೊಸ Card Design — ಎಲ್ಲ information editable
              </p>
            </div>

            <div className="flex gap-2">

              <button
                onClick={() => setSide("front")}
                className={`px-5 py-2 rounded-lg font-bold ${
                  side === "front"
                    ? "bg-green-700 text-white"
                    : "bg-slate-200"
                }`}
              >
                FRONT
              </button>

              <button
                onClick={() => setSide("back")}
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
                  }}
                >

                  {/* TOP GREEN STRIP */}

                  <div
                    className="absolute left-0 right-0 top-0"
                    style={{
                      height: 115,
                      background:
                        "linear-gradient(135deg,#ffffff,#f6fff8)",
                      borderBottom:
                        "10px solid #075c2b",
                    }}
                  />

                  {/* FARM FIELD WATERMARK */}

                  <div
                    className="absolute bottom-0 left-0 right-0"
                    style={{
                      height: 150,
                      background:
                        "linear-gradient(to top,#d8efc8,transparent)",
                      opacity: 0.55,
                    }}
                  />

                  {/* PHOTO */}

                  {side === "front" && (
                    <div
                      className="absolute overflow-hidden rounded-xl border-4 border-green-800 bg-white"
                      style={{
                        left: 45,
                        top: 145,
                        width: 190,
                        height: 230,
                      }}
                    >
                      {photo ? (
                        <img
                          src={photo}
                          alt="Member"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-center">
                          <div>
                            <div className="text-5xl">
                              👤
                            </div>
                            <div className="mt-2 font-bold">
                              Member Photo
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* QR */}

                  {side === "front" && qrImage && (
                    <div
                      className="absolute bg-white p-2 rounded-xl border-4 border-green-800"
                      style={{
                        right: 40,
                        top: 150,
                        width: 180,
                        height: 180,
                      }}
                    >
                      <img
                        src={qrImage}
                        alt="QR"
                        className="w-full h-full"
                      />
                    </div>
                  )}

                  {/* ELEMENTS */}

                  {visibleElements.map(
                    (element) => (
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
                          width: element.width,
                          height: element.height,
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
                          borderRadius: 8,
                          zIndex: 10,
                        }}
                      >
                        {element.text}
                      </div>
                    )
                  )}

                  {/* FOOTER */}

                  <div
                    className="absolute bottom-0 left-0 right-0 bg-green-900 text-white text-center font-bold py-3"
                    style={{
                      fontSize: 17,
                    }}
                  >
                    🌱 ರೈತರು ನಮ್ಮ ಹೆಮ್ಮೆ
                    &nbsp; | &nbsp;
                    🚜 ರೈತ ಬೆಳೆ — ದೇಶದ ಬೆಳೆ
                    &nbsp; | &nbsp;
                    🌾 ರೈತರಿಗೆ ನಮ್ಮ ಶಕ್ತಿ
                  </div>

                </div>

              </div>

              <p className="text-center text-sm text-slate-500 mt-4">
                💡 Information ಮೇಲೆ click ಮಾಡಿ → drag ಮಾಡಿ position set ಮಾಡಿ
              </p>

            </section>

            {/* EDIT PANEL */}

            <aside className="bg-white rounded-2xl shadow p-5 h-fit">

              <h2 className="text-xl font-extrabold mb-4">
                ✏️ Edit Information
              </h2>

              {/* PHOTO */}

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

              {/* ELEMENT LIST */}

              <div className="mb-5">

                <label className="block font-bold mb-2">
                  Select Information
                </label>

                <select
                  value={selectedId || ""}
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

                  {/* TEXT */}

                  <div>

                    <label className="block font-semibold mb-1">
                      Text
                    </label>

                    <textarea
                      value={selected.text}
                      onChange={(e) =>
                        updateElement(
                          selected.id,
                          {
                            text:
                              e.target.value,
                          }
                        )
                      }
                      rows={3}
                      className="w-full border rounded-lg p-2"
                    />

                  </div>

                  {/* FONT SIZE */}

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
                                e.target.value
                              ),
                          }
                        )
                      }
                      className="w-full border rounded-lg p-2"
                    />

                  </div>

                  {/* COLOR */}

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
                              e.target.value,
                          }
                        )
                      }
                      className="w-full h-10"
                    />

                  </div>

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
                              e.target.value
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
                              e.target.value
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
                              e.target.value
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
                  ) && (
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
