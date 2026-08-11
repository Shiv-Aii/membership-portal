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
  color?: string;
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

  const [selectedId, setSelectedId] = useState<string | null>(
    null
  );

  const [showAddMenu, setShowAddMenu] = useState(false);

  const [newText, setNewText] = useState("");

  const [activeSide, setActiveSide] = useState<
    "front" | "back"
  >("front");

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

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
     LOAD LOCAL DESIGN
  ========================= */

  useEffect(() => {
    try {
      const savedElements = localStorage.getItem(
        "membership-pvc-elements"
      );

      const savedTitle = localStorage.getItem(
        "membership-pvc-title"
      );

      if (savedElements) {
        setElements(JSON.parse(savedElements));
      }

      if (savedTitle) {
        setTitle(savedTitle);
      }
    } catch (error) {
      console.error("Design load error:", error);
    }
  }, []);

  /* =========================
     SAVE DESIGN
  ========================= */

  function saveDesign() {
    try {
      localStorage.setItem(
        "membership-pvc-elements",
        JSON.stringify(elements)
      );

      localStorage.setItem(
        "membership-pvc-title",
        title
      );

      alert("Design saved successfully.");
    } catch (error) {
      console.error(error);
      alert("Design save ಆಗಲಿಲ್ಲ.");
    }
  }

  /* =========================
     ADD TEXT
  ========================= */

  function addText() {
    const text = newText.trim() || "ಹೊಸ ಪಠ್ಯ";

    const item: CardElement = {
      id: crypto.randomUUID(),
      type: "text",
      text,
      x: 42,
      y: 70,
      width: 180,
      height: 45,
      fontSize: 18,
      bold: true,
      color: "#111827",
    };

    setElements((prev) => [
      ...prev,
      item,
    ]);

    setSelectedId(item.id);
    setNewText("");
    setShowAddMenu(false);
  }

  /* =========================
     UPLOAD LOGO
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

    try {
      const fileName =
        `designer-${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("member-photos")
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        });

      if (error) {
        throw error;
      }

      const { data } = supabase.storage
        .from("member-photos")
        .getPublicUrl(fileName);

      const item: CardElement = {
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
        item,
      ]);

      setSelectedId(item.id);

      alert("Logo successfully added.");
    } catch (error: any) {
      console.error(error);

      alert(
        "Logo upload ಆಗಲಿಲ್ಲ: " +
        (error?.message || "Unknown error")
      );
    }

    if (fileInput.current) {
      fileInput.current.value = "";
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

    if (selectedId === elementId) {
      setSelectedId(null);
    }
  }

  /* =========================
     UPDATE ELEMENT
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
     DRAG ELEMENT
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
        (ev.clientX - startX) / 6;

      const dy =
        (ev.clientY - startY) / 6;

      updateElement(element.id, {
        x: Math.max(
          0,
          Math.min(
            88,
            originalX + dx
          )
        ),
        y: Math.max(
          0,
          Math.min(
            88,
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
     PDF
  ========================= */

  async function generatePDF() {
    if (!frontRef.current || !a) {
      return;
    }

    try {
      const canvas =
        await html2canvas(
          frontRef.current,
          {
            scale: 4,
            useCORS: true,
            backgroundColor: "#ffffff",
          }
        );

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
        `${a.membership_no || "member"}-PVC.pdf`
      );
    } catch (error) {
      console.error(error);
      alert("PDF generate ಆಗಲಿಲ್ಲ.");
    }
  }

  /* =========================
     SELECTED ELEMENT
  ========================= */

  const selectedElement =
    elements.find(
      (item) =>
        item.id === selectedId
    );

  /* =========================
     RENDER ELEMENTS
  ========================= */

  function renderElements() {
    return elements.map((element) => {
      const selected =
        selectedId === element.id;

      return (
        <div
          key={element.id}
          onPointerDown={(e) =>
            startDrag(e, element)
          }
          onClick={(e) => {
            e.stopPropagation();

            setSelectedId(
              element.id
            );
          }}
          className={`absolute cursor-move ${
            selected
              ? "ring-2 ring-blue-500"
              : ""
          }`}
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            width: `${element.width}px`,
            height:
              element.type === "logo"
                ? `${element.height}px`
                : "auto",
            zIndex: 50,
          }}
        >
          {element.type === "text" ? (
            <div
              style={{
                fontSize:
                  element.fontSize || 18,

                fontWeight:
                  element.bold
                    ? 700
                    : 400,

                color:
                  element.color ||
                  "#111827",

                whiteSpace:
                  "nowrap",
              }}
              className="px-2 py-1"
            >
              {element.text}
            </div>
          ) : (
            element.src && (
              <img
                src={element.src}
                alt="Logo"
                draggable={false}
                className="w-full h-full object-contain"
              />
            )
          )}

          {selected && !locked && (
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
              className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-red-600 text-white text-sm"
            >
              ×
            </button>
          )}
        </div>
      );
    });
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
     MAIN UI
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
              Kannada / English
              Membership Card
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() => {
                if (!locked) {
                  saveDesign();
                }

                setLocked(
                  !locked
                );
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white"
            >
              {locked
                ? "🔓 Unlock Design"
                : "🔒 Lock Design"}
            </button>

            <button
              type="button"
              onClick={saveDesign}
              disabled={locked}
              className="px-4 py-2 rounded-xl border bg-white disabled:opacity-50"
            >
              💾 Save
            </button>

            <button
              type="button"
              onClick={generatePDF}
              className="px-4 py-2 rounded-xl bg-green-600 text-white"
            >
              📄 Generate PDF
            </button>

          </div>
        </div>

        {/* FRONT / BACK */}

        <div className="flex gap-2 mb-5">

          <button
            type="button"
            onClick={() =>
              setActiveSide("front")
            }
            className={`px-5 py-2 rounded-xl ${
              activeSide === "front"
                ? "bg-blue-600 text-white"
                : "bg-white border"
            }`}
          >
            Front
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveSide("back")
            }
            className={`px-5 py-2 rounded-xl ${
              activeSide === "back"
                ? "bg-blue-600 text-white"
                : "bg-white border"
            }`}
          >
            Back
          </button>

        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* CARD */}

          <div>

            <p className="font-semibold mb-2">
              {activeSide === "front"
                ? "Front — 85.6 × 53.9 mm"
                : "Back — 85.6 × 53.9 mm"}
            </p>

            {/* FRONT */}

            {activeSide === "front" && (
              <div
                ref={frontRef}
                onClick={() =>
                  setSelectedId(null)
                }
                className="relative w-full aspect-[85.6/53.9] bg-white rounded-2xl overflow-hidden border shadow-xl"
                style={{
                  background:
                    "linear-gradient(135deg,#ffffff 35%,#dcfce7)",
                }}
              >

                {/* HEADER */}

                <div className="h-[18%] bg-gradient-to-r from-green-700 to-blue-700 text-white px-[4%] flex items-center font-bold text-xl">
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

                <div className="absolute left-[23%] top-[28%] text-xs md:text-sm leading-5">

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
            )}

            {/* BACK */}

            {activeSide === "back" && (
              <div
                ref={backRef}
                className="relative w-full aspect-[85.6/53.9] rounded-2xl border shadow-xl overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg,#ffffff,#dcfce7)",
                }}
              >

                <div className="absolute inset-0 grid place-items-center text-center">

                  <div>

                    <h2 className="text-2xl font-bold">
                      ನಮ್ಮ ಸಂಘಟನೆ — ನಮ್ಮ ಬಲ
                    </h2>

                    <p className="text-sm mt-3">
                      QR / Contact / Terms
                    </p>

                    <p className="text-xs mt-5 text-slate-500">
                      This card is the property
                      of the organization.
                    </p>

                  </div>

                </div>

              </div>
            )}

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

            {/* TITLE */}

            <div className="mt-5">

              <label className="font-semibold block mb-2">
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
                className="border rounded-xl p-3 w-full"
              />

            </div>

            {/* SIZE */}

            <div className="mt-4">

              <label className="font-semibold block mb-2">
                Card Size
              </label>

              <select
                disabled={locked}
                className="border rounded-xl p-3 w-full"
              >
                <option>
                  85.6 × 53.9 mm
                </option>

                <option>
                  Custom size
                </option>
              </select>

            </div>

            {/* ADD */}

            <button
              type="button"
              disabled={locked}
              onClick={() =>
                setShowAddMenu(
                  !showAddMenu
                )
              }
              className="border rounded-xl p-3 w-full mt-4 font-semibold disabled:opacity-50"
            >
              + Add Text / Logo
            </button>

            {showAddMenu && !locked && (
              <div className="border rounded-xl p-4 mt-3 bg-slate-50">

                <h3 className="font-bold mb-3">
                  Add Element
                </h3>

                <input
                  value={newText}
                  onChange={(e) =>
                    setNewText(
                      e.target.value
                    )
                  }
                  placeholder="Text / ಪಠ್ಯ"
                  className="border rounded-lg p-3 w-full bg-white"
                />

                <button
                  type="button"
                  onClick={addText}
                  className="bg-blue-600 text-white rounded-lg p-3 w-full mt-3"
                >
                  + Add Text
                </button>

                <button
                  type="button"
                  onClick={() =>
                    fileInput.current?.click()
                  }
                  className="bg-purple-600 text-white rounded-lg p-3 w-full mt-3"
                >
                  🖼️ Upload Logo
                </button>

                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  onChange={uploadLogo}
                  className="hidden"
                />

              </div>
            )}

            {/* SELECTED ELEMENT EDITOR */}

            {selectedElement &&
              !locked && (
                <div className="border rounded-2xl p-4 mt-5 bg-slate-50">

                  <h3 className="font-bold text-lg">
                    ✏️ Edit Selected Element
                  </h3>

                  {/* TEXT */}

                  {selectedElement.type ===
                    "text" && (
                    <div className="grid gap-3 mt-4">

                      <input
                        value={
                          selectedElement.text ||
                          ""
                        }
                        onChange={(e) =>
                          updateElement(
                            selectedElement.id,
                            {
                              text: e.target
                                .value,
                            }
                          )
                        }
                        className="border rounded-lg p-3"
                        placeholder="Text"
                      />

                      <label className="font-semibold">
                        Font Size:{" "}
                        {
                          selectedElement.fontSize
                        }px
                      </label>

                      <input
                        type="range"
                        min="8"
                        max="60"
                        value={
                          selectedElement.fontSize ||
                          18
                        }
                        onChange={(e) =>
                          updateElement(
                            selectedElement.id,
                            {
                              fontSize:
                                Number(
                                  e.target
                                    .value
                                ),
                            }
                          )
                        }
                      />

                      <label className="flex items-center gap-2">

                        <input
                          type="checkbox"
                          checked={
                            selectedElement.bold ||
                            false
                          }
                          onChange={(e) =>
                            updateElement(
                              selectedElement.id,
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

                      <label className="font-semibold">
                        Text Color
                      </label>

                      <input
                        type="color"
                        value={
                          selectedElement.color ||
                          "#111827"
                        }
                        onChange={(e) =>
                          updateElement(
                            selectedElement.id,
                            {
                              color:
                                e.target
                                  .value,
                            }
                          )
                        }
                        className="w-full h-12"
                      />

                    </div>
                  )}

                  {/* WIDTH */}

                  <div className="mt-4">

                    <label className="font-semibold">
                      Width:{" "}
                      {
                        selectedElement.width
                      }px
                    </label>

                    <input
                      type="range"
                      min="30"
                      max="450"
                      value={
                        selectedElement.width
                      }
                      onChange={(e) =>
                        updateElement(
                          selectedElement.id,
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

                  </div>

                  {/* HEIGHT */}

                  {selectedElement.type ===
                    "logo" && (
                    <div className="mt-4">

                      <label className="font-semibold">
                        Height:{" "}
                        {
                          selectedElement.height
                        }px
                      </label>

                      <input
                        type="range"
                        min="30"
                        max="300"
                        value={
                          selectedElement.height
                        }
                        onChange={(e) =>
                          updateElement(
                            selectedElement.id,
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

                    </div>
                  )}

                  {/* DELETE */}

                  <button
                    type="button"
                    onClick={() =>
                      deleteElement(
                        selectedElement.id
                      )
                    }
                    className="bg-red-600 text-white rounded-lg p-3 w-full mt-5"
                  >
                    🗑️ Delete Element
                  </button>

                </div>
              )}

            {/* ELEMENT LIST */}

            <div className="mt-6">

              <h3 className="font-semibold">
                Added Elements
              </h3>

              {elements.length === 0 ? (
                <p className="text-sm text-slate-400 mt-2">
                  ಇನ್ನೂ ಯಾವುದೇ element ಸೇರಿಸಿಲ್ಲ.
                </p>
              ) : (
                <div className="grid gap-2 mt-3">

                  {elements.map(
                    (element) => (
                      <button
                        type="button"
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
                          ? `📝 ${
                              element.text
                            }`
                          : "🖼️ Logo"}
                      </button>
                    )
                  )}

                </div>
              )}

            </div>

            {/* BACK INFO */}

            <div className="mt-6 border rounded-xl p-4">

              <p className="font-semibold">
                Back Card
              </p>

              <p className="text-sm text-slate-500 mt-2">
                Back side editor ಮುಂದಿನ ಹಂತದಲ್ಲಿ
                additional elements ಜೊತೆ connect ಮಾಡಬಹುದು.
              </p>

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
