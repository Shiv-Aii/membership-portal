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

type CardElement = {
  id: string;
  side: Side;
  type: "text" | "image";
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

const frontDefault: CardElement[] = [
  {
    id: "title",
    side: "front",
    type: "text",
    text: "ಸಂಸ್ಥೆ ಸದಸ್ಯತ್ವ ಕಾರ್ಡ್",
    x: 5,
    y: 5,
    width: 65,
    height: 10,
    fontSize: 16,
    bold: true,
    color: "#ffffff",
  },
  {
    id: "name",
    side: "front",
    type: "text",
    text: "ಹೆಸರು: [User Name]",
    x: 25,
    y: 32,
    width: 50,
    height: 8,
    fontSize: 10,
    bold: true,
  },
  {
    id: "designation",
    side: "front",
    type: "text",
    text: "ಹುದ್ದೆ: [Designation]",
    x: 25,
    y: 44,
    width: 50,
    height: 8,
    fontSize: 9,
  },
  {
    id: "village",
    side: "front",
    type: "text",
    text: "ಗ್ರಾಮ: [Village]",
    x: 25,
    y: 56,
    width: 50,
    height: 8,
    fontSize: 9,
  },
  {
    id: "mobile",
    side: "front",
    type: "text",
    text: "ಮೊಬೈಲ್: [Mobile]",
    x: 25,
    y: 68,
    width: 50,
    height: 8,
    fontSize: 9,
  },
  {
    id: "member-id",
    side: "front",
    type: "text",
    text: "Member ID: [Member ID]",
    x: 25,
    y: 80,
    width: 50,
    height: 8,
    fontSize: 9,
    bold: true,
  },
];

const backDefault: CardElement[] = [
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
    id: "back-text",
    side: "back",
    type: "text",
    text: "ಈ ಕಾರ್ಡ್ ಸಂಸ್ಥೆಯ ಅಧಿಕೃತ ಸದಸ್ಯತ್ವವನ್ನು ದೃಢೀಕರಿಸುತ್ತದೆ.",
    x: 10,
    y: 35,
    width: 80,
    height: 18,
    fontSize: 10,
  },
];

function CardDesigner() {
  const params = useSearchParams();
  const memberId = params.get("id");

  const [member, setMember] = useState<any>(null);
  const [qr, setQr] = useState("");

  const [side, setSide] = useState<Side>("front");
  const [locked, setLocked] = useState(false);

  const [frontElements, setFrontElements] =
    useState<CardElement[]>(frontDefault);

  const [backElements, setBackElements] =
    useState<CardElement[]>(backDefault);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");

  const frontPdfRef =
    useRef<HTMLDivElement>(null);

  const backPdfRef =
    useRef<HTMLDivElement>(null);

  const elements =
    side === "front"
      ? frontElements
      : backElements;

  function setCurrentElements(
    next: CardElement[]
  ) {
    if (side === "front") {
      setFrontElements(next);
    } else {
      setBackElements(next);
    }
  }

  useEffect(() => {
    async function load() {
      if (!memberId) return;

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("id", memberId)
        .single();

      if (error) {
        console.error(error);
        setMessage("Member load ಆಗಲಿಲ್ಲ.");
        return;
      }

      setMember(data);

      /*
       * IMPORTANT:
       * QR now opens the separate Public Page.
       */

      const publicUrl =
        `${window.location.origin}/public-page?id=${data.id}`;

      const qrImage =
        await QRCode.toDataURL(publicUrl, {
          width: 500,
          margin: 2,
        });

      setQr(qrImage);
    }

    load();
  }, [memberId]);

  useEffect(() => {
    if (!memberId) return;

    const front =
      localStorage.getItem(
        `pvc-front-${memberId}`
      );

    const back =
      localStorage.getItem(
        `pvc-back-${memberId}`
      );

    if (front) {
      try {
        setFrontElements(JSON.parse(front));
      } catch {}
    }

    if (back) {
      try {
        setBackElements(JSON.parse(back));
      } catch {}
    }
  }, [memberId]);

  function displayText(text: string) {
    if (!member) return text;

    return text
      .replaceAll("[User Name]", member.name || "")
      .replaceAll(
        "[Designation]",
        member.designation || ""
      )
      .replaceAll("[Village]", member.village || "")
      .replaceAll("[Taluk]", member.taluk || "")
      .replaceAll(
        "[District]",
        member.district || ""
      )
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
    id: string,
    changes: Partial<CardElement>
  ) {
    setCurrentElements(
      elements.map((item) =>
        item.id === id
          ? { ...item, ...changes }
          : item
      )
    );
  }

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

    setCurrentElements([
      ...elements,
      item,
    ]);

    setSelectedId(item.id);
    setEditingId(item.id);
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

        setCurrentElements([
          ...elements,
          item,
        ]);

        setSelectedId(item.id);
      };

      reader.readAsDataURL(file);
    };

    input.click();
  }

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

    setCurrentElements([
      ...elements,
      item,
    ]);

    setSelectedId(item.id);
  }

  function deleteSelected() {
    if (!selectedId || locked) return;

    setCurrentElements(
      elements.filter(
        (item) =>
          item.id !== selectedId
      )
    );

    setSelectedId(null);
    setEditingId(null);
  }

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

    function move(event: PointerEvent) {
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

  function saveDesign() {
    if (!memberId) return;

    localStorage.setItem(
      `pvc-front-${memberId}`,
      JSON.stringify(frontElements)
    );

    localStorage.setItem(
      `pvc-back-${memberId}`,
      JSON.stringify(backElements)
    );

    setMessage(
      "Design saved successfully ✅"
    );
  }

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
            backgroundColor: "#ffffff",
          }
        );

      const backCanvas =
        await html2canvas(
          backPdfRef.current,
          {
            scale: 4,
            useCORS: true,
            backgroundColor: "#ffffff",
          }
        );

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85.6, 53.9],
      });

      pdf.addImage(
        frontCanvas.toDataURL("image/png"),
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
        backCanvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        85.6,
        53.9
      );

      pdf.save(
        `${member.membership_no || "member"}-PVC.pdf`
      );
    } catch (error) {
      console.error(error);
      alert("PDF generate ಆಗಲಿಲ್ಲ.");
    }
  }

  function CardPreview({
    pdf = false,
    pdfSide,
  }: {
    pdf?: boolean;
    pdfSide?: Side;
  }) {
    const showSide =
      pdf && pdfSide
        ? pdfSide
        : side;

    const showElements =
      showSide === "front"
        ? frontElements
        : backElements;

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
          aspectRatio: pdf
            ? undefined
            : "85.6 / 53.9",
          background:
            "linear-gradient(135deg,#ffffff,#dcfce7)",
        }}
        onClick={() =>
          !pdf && setSelectedId(null)
        }
      >

        {showSide === "front" && (
          <div
            className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-700 to-blue-700"
            style={{
              height: "20%",
            }}
          />
        )}

        {showSide === "front" &&
          member?.photo_url && (
            <img
              src={member.photo_url}
              crossOrigin="anonymous"
              alt=""
              className="absolute object-cover rounded-lg"
              style={{
                left: "5%",
                top: "28%",
                width: "16%",
                height: "38%",
              }}
            />
          )}

        {showElements.map((item) => {
          const selected =
            selectedId === item.id;

          return (
            <div
              key={item.id}
              onPointerDown={(e) =>
                !pdf &&
                startDrag(e, item)
              }
              onClick={(e) => {
                if (pdf) return;

                e.stopPropagation();

                setSelectedId(item.id);
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

              {item.type === "text" ? (
                editingId === item.id &&
                !locked &&
                !pdf ? (
                  <textarea
                    autoFocus
                    value={item.text || ""}
                    onChange={(e) =>
                      updateElement(
                        item.id,
                        {
                          text: e.target.value,
                        }
                      )
                    }
                    onBlur={() =>
                      setEditingId(null)
                    }
                    className="w-full h-full border bg-white p-1 resize-none"
                  />
                ) : (
                  <div
                    onDoubleClick={() =>
                      !pdf &&
                      !locked &&
                      setEditingId(item.id)
                    }
                    style={{
                      fontSize: pdf
                        ? `${
                            (item.fontSize || 10) *
                            4
                          }px`
                        : `${item.fontSize || 10}px`,
                      fontWeight:
                        item.bold ? 700 : 400,
                      color:
                        item.color || "#111827",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {displayText(
                      item.text || ""
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
        })}

        {showSide === "front" &&
          qr && (
            <img
              src={qr}
              alt="QR"
              className="absolute"
              style={{
                right: "4%",
                bottom: "5%",
                width: "15%",
                aspectRatio: "1 / 1",
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
        item.id === selectedId
    );

  return (
    <main className="min-h-screen bg-slate-100">

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
                setLocked(!locked)
              }
              className="bg-slate-900 text-white px-4 py-2 rounded-xl"
            >
              {locked
                ? "🔓 Unlock"
                : "🔒 Lock Design"}
            </button>

            <button
              onClick={saveDesign}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl"
            >
              💾 Save
            </button>

            <button
              onClick={generatePDF}
              className="bg-green-600 text-white px-4 py-2 rounded-xl"
            >
              📄 PDF
            </button>

          </div>

        </div>

      </header>

      <div className="max-w-7xl mx-auto p-5">

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

          <section className="bg-slate-200 rounded-2xl p-5">

            <div className="max-w-[850px] mx-auto">
              <CardPreview />
            </div>

            <p className="text-center text-sm text-slate-500 mt-4">
              Text ಮೇಲೆ double-click → edit
              <br />
              Drag → position change
            </p>

          </section>

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
                    locked || !qr
                  }
                  onClick={addQr}
                  className="border rounded-xl p-3 disabled:opacity-40"
                >
                  ▣ Add QR Code
                </button>

                <button
                  disabled={
                    locked || !selectedId
                  }
                  onClick={deleteSelected}
                  className="border border-red-300 text-red-600 rounded-xl p-3 disabled:opacity-40"
                >
                  🗑️ Delete Selected
                </button>

              </div>

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
                        key={item.id}
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
                        {item.type === "text"
                          ? `📝 ${item.text}`
                          : "🖼️ Image"}
                      </button>
                    )
                  )}

                </div>

              </div>

              {selected && (
                <div className="border-t mt-6 pt-5">

                  <h3 className="font-bold">
                    ✏️ Edit Element
                  </h3>

                  {selected.type === "text" && (
                    <>
                      <label className="block font-semibold mt-4">
                        Text
                      </label>

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
                          selected.fontSize || 10
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
                        className="w-full"
                      />

                      <label className="flex items-center gap-2 mt-4">

                        <input
                          disabled={locked}
                          type="checkbox"
                          checked={
                            selected.bold || false
                          }
                          onChange={(e) =>
                            updateElement(
                              selected.id,
                              {
                                bold:
                                  e.target.checked,
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
                        onChange={(e) =>
                          updateElement(
                            selected.id,
                            {
                              color:
                                e.target.value,
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

                  <label className="block font-semibold mt-4">
                    Y Position
                  </label>

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

                  <label className="block font-semibold mt-4">
                    Width
                  </label>

                  <input
                    disabled={locked}
                    type="range"
                    min="5"
                    max="90"
                    value={selected.width}
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

                  <label className="block font-semibold mt-4">
                    Height
                  </label>

                  <input
                    disabled={locked}
                    type="range"
                    min="5"
                    max="80"
                    value={selected.height}
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
            <CardPreview
              pdf
              pdfSide="front"
            />
          </div>

          <div
            ref={backPdfRef}
            style={{
              width: "856px",
              height: "539px",
            }}
          >
            <CardPreview
              pdf
              pdfSide="back"
            />
          </div>
        </div>

      </div>

    </main>
  );
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
