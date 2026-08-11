"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type ElementType = "text" | "image";

type CardElement = {
  id: string;
  type: ElementType;
  text?: string;
  src?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  bold?: boolean;
};

const defaultFront: CardElement[] = [
  {
    id: "title",
    type: "text",
    text: "ಸಂಸ್ಥೆ ಸದಸ್ಯತ್ವ ಕಾರ್ಡ್",
    x: 8,
    y: 6,
    width: 70,
    height: 10,
    fontSize: 16,
    bold: true,
  },
  {
    id: "name",
    type: "text",
    text: "[User Name]",
    x: 35,
    y: 30,
    width: 45,
    height: 8,
    fontSize: 11,
    bold: true,
  },
  {
    id: "designation",
    type: "text",
    text: "[Designation]",
    x: 35,
    y: 40,
    width: 45,
    height: 8,
    fontSize: 9,
  },
  {
    id: "mobile",
    type: "text",
    text: "[Mobile]",
    x: 35,
    y: 49,
    width: 45,
    height: 8,
    fontSize: 9,
  },
];

const defaultBack: CardElement[] = [
  {
    id: "back-title",
    type: "text",
    text: "ನಮ್ಮ ಸಂಘಟನೆ — ನಮ್ಮ ಬಲ",
    x: 15,
    y: 15,
    width: 55,
    height: 10,
    fontSize: 14,
    bold: true,
  },
  {
    id: "back-text",
    type: "text",
    text: "ಈ ಕಾರ್ಡ್ ಸಂಸ್ಥೆಯ ಸದಸ್ಯತ್ವವನ್ನು ದೃಢೀಕರಿಸುತ್ತದೆ.",
    x: 10,
    y: 30,
    width: 65,
    height: 15,
    fontSize: 9,
  },
];

function CardDesigner() {
  const params = useSearchParams();
  const id = params.get("id");

  const [member, setMember] = useState<any>(null);
  const [qr, setQr] = useState("");
  const [locked, setLocked] = useState(false);

  const [side, setSide] = useState<"front" | "back">("front");

  const [frontElements, setFrontElements] =
    useState<CardElement[]>(defaultFront);

  const [backElements, setBackElements] =
    useState<CardElement[]>(defaultBack);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [dragging, setDragging] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");

  const cardRef = useRef<HTMLDivElement>(null);

  const elements =
    side === "front" ? frontElements : backElements;

  function setElements(next: CardElement[]) {
    if (side === "front") {
      setFrontElements(next);
    } else {
      setBackElements(next);
    }
  }

  useEffect(() => {
    async function loadMember() {
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

      const publicUrl =
        `${window.location.origin}/member/${data.id}`;

      const qrImage =
        await QRCode.toDataURL(publicUrl, {
          width: 500,
          margin: 1,
        });

      setQr(qrImage);
    }

    loadMember();
  }, [id]);

  function getValue(text: string) {
    if (!member) return text;

    return text
      .replaceAll("[User Name]", member.name || "")
      .replaceAll("[Designation]", member.designation || "")
      .replaceAll("[Village]", member.village || "")
      .replaceAll("[Taluk]", member.taluk || "")
      .replaceAll("[District]", member.district || "")
      .replaceAll("[Mobile]", member.mobile || "")
      .replaceAll(
        "[Aadhaar]",
        member.aadhaar || ""
      )
      .replaceAll(
        "[Member ID]",
        member.membership_no || ""
      );
  }

  function updateElement(
    elementId: string,
    changes: Partial<CardElement>
  ) {
    setElements(
      elements.map((el) =>
        el.id === elementId
          ? { ...el, ...changes }
          : el
      )
    );
  }

  function addText() {
    if (locked) return;

    const element: CardElement = {
      id: crypto.randomUUID(),
      type: "text",
      text: "ಹೊಸ ಪಠ್ಯ",
      x: 20,
      y: 20,
      width: 50,
      height: 10,
      fontSize: 10,
    };

    setElements([...elements, element]);
    setSelectedId(element.id);
    setEditingId(element.id);
  }

  function addImage() {
    if (locked) return;

    const input =
      document.createElement("input");

    input.type = "file";
    input.accept = "image/*";

    input.onchange = () => {
      const file = input.files?.[0];

      if (!file) return;

      const reader = new FileReader();

      reader.onload = () => {
        const element: CardElement = {
          id: crypto.randomUUID(),
          type: "image",
          src: reader.result as string,
          x: 65,
          y: 25,
          width: 18,
          height: 22,
        };

        setElements([...elements, element]);
        setSelectedId(element.id);
      };

      reader.readAsDataURL(file);
    };

    input.click();
  }

  function deleteSelected() {
    if (!selectedId || locked) return;

    setElements(
      elements.filter(
        (el) => el.id !== selectedId
      )
    );

    setSelectedId(null);
  }

  function startDrag(
    e: React.MouseEvent,
    element: CardElement
  ) {
    if (locked) return;

    e.preventDefault();

    setSelectedId(element.id);
    setDragging(element.id);

    const startX = e.clientX;
    const startY = e.clientY;

    const originalX = element.x;
    const originalY = element.y;

    function move(ev: MouseEvent) {
      const dx =
        ((ev.clientX - startX) / 600) * 100;

      const dy =
        ((ev.clientY - startY) / 380) * 100;

      updateElement(element.id, {
        x: Math.max(
          0,
          Math.min(100 - element.width, originalX + dx)
        ),
        y: Math.max(
          0,
          Math.min(100 - element.height, originalY + dy)
        ),
      });
    }

    function stop() {
      setDragging(null);

      window.removeEventListener(
        "mousemove",
        move
      );

      window.removeEventListener(
        "mouseup",
        stop
      );
    }

    window.addEventListener(
      "mousemove",
      move
    );

    window.addEventListener(
      "mouseup",
      stop
    );
  }

  async function saveTemplate() {
    try {
      localStorage.setItem(
        "pvc-front-template",
        JSON.stringify(frontElements)
      );

      localStorage.setItem(
        "pvc-back-template",
        JSON.stringify(backElements)
      );

      setMessage("Design saved successfully.");
    } catch {
      setMessage("Design save failed.");
    }
  }

  useEffect(() => {
    const f =
      localStorage.getItem(
        "pvc-front-template"
      );

    const b =
      localStorage.getItem(
        "pvc-back-template"
      );

    if (f) {
      try {
        setFrontElements(JSON.parse(f));
      } catch {}
    }

    if (b) {
      try {
        setBackElements(JSON.parse(b));
      } catch {}
    }
  }, []);

  async function generatePDF() {
    if (!cardRef.current || !member) return;

    const canvas =
      await html2canvas(cardRef.current, {
        scale: 4,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

    const image =
      canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [85.6, 53.9],
    });

    pdf.addImage(
      image,
      "PNG",
      0,
      0,
      85.6,
      53.9
    );

    pdf.save(
      `${member.membership_no || "member"}-PVC.pdf`
    );
  }

  function addQRCodeElement() {
    if (locked || !qr) return;

    const element: CardElement = {
      id: crypto.randomUUID(),
      type: "image",
      src: qr,
      x: 75,
      y: 60,
      width: 18,
      height: 25,
    };

    setFrontElements([
      ...frontElements,
      element,
    ]);

    setSide("front");
    setSelectedId(element.id);
  }

  if (!member) {
    return (
      <main className="p-10">
        Member loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">

      <header className="bg-white border-b p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-3 justify-between items-center">

          <h1 className="text-xl font-bold">
            PVC Card Designer
          </h1>

          <div className="flex gap-2">

            <button
              onClick={() =>
                setLocked(!locked)
              }
              className="px-4 py-2 rounded-xl bg-slate-900 text-white"
            >
              {locked
                ? "🔓 Unlock Design"
                : "🔒 Lock Design"}
            </button>

            <button
              onClick={saveTemplate}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white"
            >
              Save Design
            </button>

            <button
              onClick={generatePDF}
              className="px-4 py-2 rounded-xl bg-green-600 text-white"
            >
              Generate PDF
            </button>

          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-5 grid lg:grid-cols-[1fr_380px] gap-6">

        {/* CARD AREA */}

        <section>

          <div className="flex gap-2 mb-4">

            <button
              onClick={() => setSide("front")}
              className={`px-4 py-2 rounded-xl ${
                side === "front"
                  ? "bg-blue-600 text-white"
                  : "bg-white"
              }`}
            >
              Front
            </button>

            <button
              onClick={() => setSide("back")}
              className={`px-4 py-2 rounded-xl ${
                side === "back"
                  ? "bg-blue-600 text-white"
                  : "bg-white"
              }`}
            >
              Back
            </button>

          </div>

          <div
            ref={cardRef}
            className="relative w-full max-w-[700px] aspect-[85.6/53.9] mx-auto bg-white rounded-2xl overflow-hidden shadow-2xl border"
            style={{
              background:
                "linear-gradient(135deg,#ffffff,#dcfce7)",
            }}
          >

            {elements.map((el) => (

              <div
                key={el.id}
                onMouseDown={(e) =>
                  startDrag(e, el)
                }
                onClick={() =>
                  setSelectedId(el.id)
                }
                className={`absolute cursor-move ${
                  selectedId === el.id &&
                  !locked
                    ? "ring-2 ring-blue-500"
                    : ""
                }`}
                style={{
                  left: `${el.x}%`,
                  top: `${el.y}%`,
                  width: `${el.width}%`,
                  height: `${el.height}%`,
                  fontSize: `${el.fontSize || 10}px`,
                  fontWeight: el.bold
                    ? "bold"
                    : "normal",
                  zIndex: 10,
                }}
              >

                {el.type === "text" ? (
                  editingId === el.id &&
                  !locked ? (
                    <textarea
                      autoFocus
                      value={el.text || ""}
                      onChange={(e) =>
                        updateElement(
                          el.id,
                          {
                            text: e.target.value,
                          }
                        )
                      }
                      onBlur={() =>
                        setEditingId(null)
                      }
                      className="w-full h-full bg-white/90 border p-1 resize-none"
                    />
                  ) : (
                    <div
                      onDoubleClick={() =>
                        !locked &&
                        setEditingId(el.id)
                      }
                      className="w-full h-full whitespace-pre-wrap"
                    >
                      {getValue(
                        el.text || ""
                      )}
                    </div>
                  )
                ) : (
                  <img
                    src={el.src}
                    className="w-full h-full object-contain pointer-events-none"
                    alt=""
                  />
                )}

              </div>

            ))}

          </div>

          <p className="text-center mt-3 text-sm text-gray-500">
            Double-click text → edit
            <br />
            Drag → position change
          </p>

        </section>

        {/* EDITOR */}

        <aside className="bg-white rounded-2xl shadow p-5 h-[calc(100vh-120px)] overflow-y-auto">

          <h2 className="font-bold text-lg">
            Template Controls
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            {locked
              ? "🔒 Design locked"
              : "✏️ Editing enabled"}
          </p>

          <div className="grid gap-3 mt-5">

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
              + Add Image / Logo
            </button>

            <button
              disabled={locked}
              onClick={addQRCodeElement}
              className="border rounded-xl p-3 disabled:opacity-40"
            >
              + Add QR Code
            </button>

            <button
              disabled={
                locked || !selectedId
              }
              onClick={deleteSelected}
              className="border border-red-300 text-red-600 rounded-xl p-3 disabled:opacity-40"
            >
              Delete Selected
            </button>

          </div>

          {/* SELECTED ELEMENT */}

          {selectedId && (
            <div className="mt-6 border-t pt-5">

              <h3 className="font-bold mb-3">
                Edit Selected
              </h3>

              {(() => {
                const selected =
                  elements.find(
                    (x) =>
                      x.id === selectedId
                  );

                if (!selected)
                  return null;

                return (
                  <div className="grid gap-3">

                    {selected.type ===
                      "text" && (
                      <textarea
                        disabled={locked}
                        value={
                          selected.text || ""
                        }
                        onChange={(e) =>
                          updateElement(
                            selected.id,
                            {
                              text:
                                e.target.value,
                            }
                          )
                        }
                        className="border rounded-xl p-3 min-h-[100px]"
                      />
                    )}

                    <label>
                      X Position
                      <input
                        disabled={locked}
                        type="range"
                        min="0"
                        max="90"
                        value={selected.x}
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
                        className="w-full"
                      />
                    </label>

                    <label>
                      Y Position
                      <input
                        disabled={locked}
                        type="range"
                        min="0"
                        max="90"
                        value={selected.y}
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
                        className="w-full"
                      />
                    </label>

                    <label>
                      Width
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
                                  e.target.value
                                ),
                            }
                          )
                        }
                        className="w-full"
                      />
                    </label>

                    <label>
                      Height
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
                                  e.target.value
                                ),
                            }
                          )
                        }
                        className="w-full"
                      />
                    </label>

                    {selected.type ===
                      "text" && (
                      <>
                        <label>
                          Font Size
                          <input
                            disabled={locked}
                            type="range"
                            min="6"
                            max="32"
                            value={
                              selected.fontSize ||
                              10
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
                        </label>

                        <label className="flex gap-2">
                          <input
                            disabled={locked}
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
                      </>
                    )}

                  </div>
                );
              })()}

            </div>
          )}

          {message && (
            <div className="mt-5 bg-green-50 text-green-700 p-3 rounded-xl">
              {message}
            </div>
          )}

        </aside>

      </div>
    </main>
  );
}

export default function CardPage() {
  return (
    <Suspense
      fallback={
        <main className="p-10">
          Loading...
        </main>
      }
    >
      <CardDesigner />
    </Suspense>
  );
}
