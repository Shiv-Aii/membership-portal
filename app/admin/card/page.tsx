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

type ElementType = "text" | "logo";

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

function Card() {
  const params = useSearchParams();
  const id = params.get("id");

  const [a, setA] = useState<any>(null);
  const [qr, setQr] = useState("");
  const [locked, setLocked] = useState(false);

  const [title, setTitle] = useState(
    "ಸಂಸ್ಥೆ ಸದಸ್ಯತ್ವ ಕಾರ್ಡ್"
  );

  const [elements, setElements] = useState<CardElement[]>(
    []
  );

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [newText, setNewText] = useState("");

  const [activeSide, setActiveSide] = useState<
    "front" | "back"
  >("front");

  const front = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLDivElement>(null);

  const fileInput = useRef<HTMLInputElement>(null);

  /* =========================
     LOAD MEMBER
  ========================= */

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

      setA(data);

      if (data) {
        const code = await QRCode.toDataURL(
          String(data.membership_no || data.id)
        );

        setQr(code);
      }
    }

    loadMember();
  }, [id]);

  /* =========================
     LOAD SAVED DESIGN
  ========================= */

  useEffect(() => {
    const saved = localStorage.getItem(
      "pvc-card-elements"
    );

    const savedTitle = localStorage.getItem(
      "pvc-card-title"
    );

    if (saved) {
      try {
        setElements(JSON.parse(saved));
      } catch {
        console.log("No saved design");
      }
    }

    if (savedTitle) {
      setTitle(savedTitle);
    }
  }, []);

  /* =========================
     SAVE DESIGN
  ========================= */

  function saveDesign() {
    localStorage.setItem(
      "pvc-card-elements",
      JSON.stringify(elements)
    );

    localStorage.setItem(
      "pvc-card-title",
      title
    );
  }

  /* =========================
     ADD TEXT
  ========================= */

  function addText() {
    const text =
      newText.trim() || "ಹೊಸ ಪಠ್ಯ";

    const newElement: CardElement = {
      id: crypto.randomUUID(),
      type: "text",
      text,
      x: 45,
      y: 72,
      width: 180,
      height: 45,
      fontSize: 18,
      bold: true,
    };

    setElements((prev) => [
      ...prev,
      newElement,
    ]);

    setNewText("");
    setShowAddMenu(false);
  }

  /* =========================
     LOGO UPLOAD
  ========================= */

  async function uploadLogo(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("ದಯವಿಟ್ಟು image file ಆಯ್ಕೆ ಮಾಡಿ.");
      return;
    }

    const fileName = `designer-${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("member-photos")
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      console.error(error);
      alert(
        "Logo upload ಆಗಲಿಲ್ಲ: " +
          error.message
      );
      return;
    }

    const { data } = supabase.storage
      .from("member-photos")
      .getPublicUrl(fileName);

    const newElement: CardElement = {
      id: crypto.randomUUID(),
      type: "logo",
      src: data.publicUrl,
      x: 5,
      y: 5,
      width: 90,
      height: 70,
    };

    setElements((prev) => [
      ...prev,
      newElement,
    ]);

    alert("Logo ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ.");
  }

  /* =========================
     DELETE ELEMENT
  ========================= */

  function deleteElement(id: string) {
    setElements((prev) =>
      prev.filter((item) => item.id !== id)
    );
  }

  /* =========================
     MOVE ELEMENT
  ========================= */

  function moveElement(
    id: string,
    dx: number,
    dy: number
  ) {
    setElements((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        return {
          ...item,
          x: Math.max(
            0,
            Math.min(
              100 - item.width / 8,
              item.x + dx
            )
          ),
          y: Math.max(
            0,
            Math.min(
              90,
              item.y + dy
            )
          ),
        };
      })
    );
  }

  /* =========================
     DRAG SUPPORT
  ========================= */

  function startDrag(
    e: React.PointerEvent,
    element: CardElement
  ) {
    if (locked) return;

    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;

    const originalX = element.x;
    const originalY = element.y;

    function move(ev: PointerEvent) {
      const dx =
        ((ev.clientX - startX) / 8);

      const dy =
        ((ev.clientY - startY) / 5);

      setElements((prev) =>
        prev.map((item) =>
          item.id === element.id
            ? {
                ...item,
                x: Math.max(
                  0,
                  Math.min(
                    90,
                    originalX + dx
                  )
                ),
                y: Math.max(
                  0,
                  Math.min(
                    90,
                    originalY + dy
                  )
                ),
              }
            : item
        )
      );
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
     PDF
  ========================= */

  async function generatePDF() {
    if (!front.current || !a) return;

    saveDesign();

    const canvas =
      await html2canvas(
        front.current,
        {
          scale: 4,
          useCORS: true,
          backgroundColor: "#ffffff",
        }
      );

    const img =
      canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [85.6, 53.9],
    });

    pdf.addImage(
      img,
      "PNG",
      0,
      0,
      85.6,
      53.9
    );

    pdf.save(
      `${a.membership_no || "member"}-PVC.pdf`
    );
  }

  /* =========================
     ELEMENT RENDER
  ========================= */

  function renderElements() {
    return elements.map((element) => (
      <div
        key={element.id}
        onPointerDown={(e) =>
          startDrag(e, element)
        }
        className="absolute group cursor-move"
        style={{
          left: `${element.x}%`,
          top: `${element.y}%`,
          width:
            element.type === "logo"
              ? `${element.width}px`
              : `${element.width}px`,
          height:
            element.type === "logo"
              ? `${element.height}px`
              : "auto",
          zIndex: 30,
        }}
      >
        {element.type === "text" ? (
          <div
            style={{
              fontSize:
                element.fontSize || 18,
              fontWeight:
                element.bold
                  ? "700"
                  : "400",
            }}
            className="bg-white/50 px-2 py-1 rounded"
          >
            {element.text}
          </div>
        ) : (
          element.src && (
            <img
              src={element.src}
              alt="Logo"
              className="w-full h-full object-contain"
              draggable={false}
            />
          )
        )}

        {!locked && (
          <button
            onPointerDown={(e) =>
              e.stopPropagation()
            }
            onClick={() =>
              deleteElement(element.id)
            }
            className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-6 h-6 text-xs"
          >
            ×
          </button>
        )}
      </div>
    ));
  }

  /* =========================
     LOADING
  ========================= */

  if (!a) {
    return (
      <main className="p-10">
        Select an approved member from Dashboard.
      </main>
    );
  }

  /* =========================
     UI
  ========================= */

  return (
    <main className="min-h-screen bg-slate-100 p-5">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-wrap justify-between items-center gap-3 mb-5">

          <div>
            <h1 className="text-2xl font-bold">
              PVC Card Designer
            </h1>

            <p className="text-sm text-slate-500">
              Front — 85.6 × 53.9 mm
            </p>
          </div>

          <div className="flex gap-2">

            <button
              onClick={() => {
                setLocked(!locked);

                if (!locked) {
                  saveDesign();
                }
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white"
            >
              {locked
                ? "🔓 Unlock Design"
                : "🔒 Lock Design"}
            </button>

            <button
              onClick={generatePDF}
              className="px-4 py-2 rounded-xl bg-green-600 text-white"
            >
              Generate PDF
            </button>

          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* CARD */}

          <div>

            <div
              ref={front}
              className="relative w-full max-w-[856px] aspect-[85.6/53.9] bg-white rounded-2xl overflow-hidden border shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg,#ffffff 35%,#dcfce7)",
              }}
            >

              {/* HEADER */}

              <div className="h-[18%] bg-gradient-to-r from-green-700 to-blue-700 text-white px-[4%] flex items-center font-bold text-[2.2vw] max-lg:text-xl">
                {title}
              </div>

              {/* MEMBER PHOTO */}

              <div className="absolute left-[5%] top-[28%] w-[15%] aspect-[4/5] rounded-lg overflow-hidden bg-slate-200">

                {a.photo_url ? (
                  <img
                    src={a.photo_url}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                    alt="Member"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-xs">
                    Photo
                  </div>
                )}

              </div>

              {/* MEMBER DATA */}

              <div className="absolute left-[23%] top-[28%] text-[1.4vw] max-lg:text-sm leading-6">

                <div>
                  <b>ಹೆಸರು:</b>{" "}
                  {a.name}
                </div>

                <div>
                  <b>ಹುದ್ದೆ:</b>{" "}
                  {a.designation}
                </div>

                <div>
                  <b>ಗ್ರಾಮ:</b>{" "}
                  {a.village}
                </div>

                <div>
                  <b>ತಾಲೂಕು:</b>{" "}
                  {a.taluk}
                </div>

                <div>
                  <b>ಜಿಲ್ಲೆ:</b>{" "}
                  {a.district}
                </div>

                <div>
                  <b>ಮೊಬೈಲ್:</b>{" "}
                  {a.mobile}
                </div>

                <div>
                  <b>Member ID:</b>{" "}
                  {a.membership_no}
                </div>

              </div>

              {/* QR */}

              {qr && (
                <img
                  src={qr}
                  className="absolute right-[5%] top-[29%] w-[15%] aspect-square"
                  alt="QR Code"
                />
              )}

              {/* CUSTOM ELEMENTS */}

              {renderElements()}

            </div>

          </div>

          {/* CONTROLS */}

          <div className="bg-white rounded-2xl p-5 shadow">

            <h2 className="font-bold text-lg">
              Template Controls
            </h2>

            <p className="text-slate-500 mt-2">
              {locked
                ? "🔒 Design locked — master template active."
                : "✏️ Editing enabled."}
            </p>

            <div className="grid gap-3 mt-5">

              {/* TITLE */}

              <input
                placeholder="Card title"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                disabled={locked}
                className="border rounded-xl p-3"
              />

              {/* SIZE */}

              <select
                disabled={locked}
                className="border rounded-xl p-3"
              >
                <option>
                  85.6 × 53.9 mm
                </option>

                <option>
                  Custom size
                </option>
              </select>

              {/* ADD BUTTON */}

              <button
                disabled={locked}
                onClick={() =>
                  setShowAddMenu(
                    !showAddMenu
                  )
                }
                className="border rounded-xl p-3 font-semibold hover:bg-slate-50 disabled:opacity-50"
              >
                + Add Text / Logo
              </button>

              {/* ADD MENU */}

              {showAddMenu && !locked && (
                <div className="border rounded-xl p-4 bg-slate-50 space-y-3">

                  <p className="font-semibold">
                    Add Element
                  </p>

                  {/* TEXT */}

                  <input
                    value={newText}
                    onChange={(e) =>
                      setNewText(
                        e.target.value
                      )
                    }
                    placeholder="Text ಬರೆಯಿರಿ..."
                    className="w-full border rounded-lg p-3 bg-white"
                  />

                  <button
                    onClick={addText}
                    className="w-full bg-blue-600 text-white rounded-lg p-3"
                  >
                    + Add Text
                  </button>

                  {/* LOGO */}

                  <button
                    onClick={() =>
                      fileInput.current?.click()
                    }
                    className="w-full bg-purple-600 text-white rounded-lg p-3"
                  >
                    🖼️ Upload Logo
                  </button>

                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={uploadLogo}
                  />

                </div>
              )}

              {/* SAVE */}

              <button
                disabled={locked}
                onClick={saveDesign}
                className="border border-green-600 text-green-700 rounded-xl p-3 font-semibold disabled:opacity-50"
              >
                💾 Save Design
              </button>

            </div>

            {/* CURRENT ELEMENTS */}

            <div className="mt-6">

              <h3 className="font-semibold">
                Added Elements
              </h3>

              {elements.length === 0 ? (
                <p className="text-sm text-slate-400 mt-2">
                  ಇನ್ನೂ ಯಾವುದೇ Text / Logo ಸೇರಿಸಿಲ್ಲ.
                </p>
              ) : (
                <div className="mt-3 space-y-2">

                  {elements.map(
                    (element) => (
                      <div
                        key={element.id}
                        className="flex justify-between items-center border rounded-lg p-2"
                      >

                        <span>
                          {element.type ===
                          "text"
                            ? `📝 ${
                                element.text
                              }`
                            : "🖼️ Logo"}
                        </span>

                        <button
                          disabled={locked}
                          onClick={() =>
                            deleteElement(
                              element.id
                            )
                          }
                          className="text-red-600 text-sm"
                        >
                          Delete
                        </button>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

            {/* BACK */}

            <div className="mt-6">

              <p className="font-semibold">
                Back Preview
              </p>

              <div
                ref={back}
                className="mt-2 w-full aspect-[85.6/53.9] rounded-xl border bg-white grid place-items-center text-center"
                style={{
                  background:
                    "linear-gradient(135deg,#ffffff,#dcfce7)",
                }}
              >

                <div>

                  <b>
                    ನಮ್ಮ ಸಂಘಟನೆ — ನಮ್ಮ ಬಲ
                  </b>

                  <p className="text-xs mt-2">
                    QR / Contact / Terms
                  </p>

                </div>

              </div>

            </div>

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
          Loading card designer...
        </main>
      }
    >
      <Card />
    </Suspense>
  );
}
