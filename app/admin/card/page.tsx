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

type ElementKey =
  | "photo"
  | "name"
  | "designation"
  | "village"
  | "mobile"
  | "memberId"
  | "qr";

type CardElement = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type CardLayout = Record<ElementKey, CardElement>;

const defaultLayout: CardLayout = {
  photo: {
    x: 18,
    y: 70,
    width: 80,
    height: 95,
  },

  name: {
    x: 115,
    y: 72,
    width: 150,
    height: 28,
  },

  designation: {
    x: 115,
    y: 103,
    width: 150,
    height: 24,
  },

  village: {
    x: 115,
    y: 130,
    width: 150,
    height: 24,
  },

  mobile: {
    x: 115,
    y: 157,
    width: 150,
    height: 24,
  },

  memberId: {
    x: 115,
    y: 184,
    width: 150,
    height: 26,
  },

  qr: {
    x: 315,
    y: 155,
    width: 70,
    height: 70,
  },
};

const labels: Record<ElementKey, string> = {
  photo: "Photo",
  name: "Name",
  designation: "Designation",
  village: "Village",
  mobile: "Mobile",
  memberId: "Member ID",
  qr: "QR Code",
};

function Card() {
  const params = useSearchParams();
  const id = params.get("id");

  const [a, setA] = useState<any>(null);
  const [qr, setQr] = useState("");
  const [locked, setLocked] = useState(false);

  const [layout, setLayout] =
    useState<CardLayout>(defaultLayout);

  const [selected, setSelected] =
    useState<ElementKey>("qr");

  const [dragging, setDragging] =
    useState<ElementKey | null>(null);

  const front =
    useRef<HTMLDivElement>(null);

  const dragStart = useRef({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  /*
   * LOAD MEMBER
   */

  useEffect(() => {
    async function loadMember() {
      if (!id) return;

      const { data, error } =
        await supabase
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
        const publicPageUrl =
          `${window.location.origin}/public-page?id=${data.id}`;

        const qrImage =
          await QRCode.toDataURL(
            publicPageUrl,
            {
              width: 300,
              margin: 2,
            }
          );

        setQr(qrImage);

        /*
         * LOAD SAVED DESIGN
         */

        try {
          const saved =
            localStorage.getItem(
              `pvc-master-design-${data.id}`
            );

          if (saved) {
            const parsed =
              JSON.parse(saved);

            if (parsed) {
              setLayout({
                ...defaultLayout,
                ...parsed,
              });
            }
          }
        } catch (error) {
          console.error(
            "Design loading error:",
            error
          );
        }
      }
    }

    loadMember();
  }, [id]);

  /*
   * START DRAG
   */

  function startDrag(
    key: ElementKey,
    e: React.PointerEvent<HTMLDivElement>
  ) {
    if (locked) return;

    e.preventDefault();
    e.stopPropagation();

    setSelected(key);
    setDragging(key);

    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: layout[key].x,
      startY: layout[key].y,
    };

    e.currentTarget.setPointerCapture(
      e.pointerId
    );
  }

  /*
   * MOVE ELEMENT
   */

  function moveElement(
    key: ElementKey,
    e: React.PointerEvent<HTMLDivElement>
  ) {
    if (
      locked ||
      dragging !== key
    ) {
      return;
    }

    const dx =
      e.clientX -
      dragStart.current.mouseX;

    const dy =
      e.clientY -
      dragStart.current.mouseY;

    const cardWidth =
      front.current?.clientWidth || 430;

    const cardHeight =
      front.current?.clientHeight || 270;

    let x =
      dragStart.current.startX + dx;

    let y =
      dragStart.current.startY + dy;

    const width =
      layout[key].width;

    const height =
      layout[key].height;

    x = Math.max(
      0,
      Math.min(
        x,
        cardWidth - width
      )
    );

    y = Math.max(
      0,
      Math.min(
        y,
        cardHeight - height
      )
    );

    setLayout((old) => ({
      ...old,
      [key]: {
        ...old[key],
        x,
        y,
      },
    }));
  }

  /*
   * STOP DRAG
   */

  function stopDrag(
    e: React.PointerEvent<HTMLDivElement>
  ) {
    setDragging(null);

    try {
      e.currentTarget.releasePointerCapture(
        e.pointerId
      );
    } catch {}
  }

  /*
   * CHANGE SIZE
   */

  function changeSize(
    key: ElementKey,
    value: number
  ) {
    if (locked) return;

    setLayout((old) => ({
      ...old,
      [key]: {
        ...old[key],
        width: value,
        height:
          key === "photo" ||
          key === "qr"
            ? value
            : old[key].height,
      },
    }));
  }

  /*
   * RESET
   */

  function resetDesign() {
    if (locked) return;

    setLayout({
      ...defaultLayout,
    });

    setSelected("qr");
  }

  /*
   * SAVE MASTER DESIGN
   */

  function saveMasterDesign() {
    if (!a?.id) return;

    localStorage.setItem(
      `pvc-master-design-${a.id}`,
      JSON.stringify(layout)
    );

    alert(
      "Master Design saved successfully."
    );
  }

  /*
   * GENERATE PDF
   */

  async function generatePDF() {
    if (!front.current || !a)
      return;

    try {
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
    } catch (error) {
      console.error(error);
      alert(
        "PDF generation failed."
      );
    }
  }

  /*
   * LOADING
   */

  if (!a) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-10">
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <h1 className="text-xl font-bold">
            Member loading...
          </h1>

          <p className="text-slate-500 mt-2">
            Approved member information loading.
          </p>
        </div>
      </main>
    );
  }

  /*
   * ELEMENT COMPONENT
   */

  function elementStyle(
    key: ElementKey
  ) {
    const item = layout[key];

    return {
      left: item.x,
      top: item.y,
      width: item.width,
      height: item.height,
      touchAction: "none" as const,
      zIndex:
        selected === key ? 30 : 20,
    };
  }

  return (
    <main className="min-h-screen bg-slate-100 p-5">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-wrap justify-between items-center gap-3 mb-5">

          <div>
            <h1 className="text-2xl font-bold">
              PVC Card Designer
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Drag elements and design your PVC card.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

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
              onClick={saveMasterDesign}
              disabled={locked}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white disabled:opacity-50"
            >
              💾 Save Master
            </button>

            <button
              onClick={generatePDF}
              className="px-4 py-2 rounded-xl bg-green-600 text-white"
            >
              📄 Generate PDF
            </button>

          </div>

        </div>

        <div className="grid xl:grid-cols-[1fr_360px] gap-6">

          {/* CARD AREA */}

          <div>

            <p className="mb-2 font-semibold">
              Front — 85.6 × 53.9 mm
            </p>

            <div className="bg-white rounded-3xl shadow p-5 overflow-auto">

              <div
                ref={front}
                className="relative bg-white border rounded-xl overflow-hidden select-none"
                style={{
                  width: 430,
                  height: 270,
                  background:
                    "linear-gradient(135deg,#ffffff 35%,#dcfce7)",
                }}
              >

                {/* HEADER */}

                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-green-700 to-blue-700 text-white px-4 flex items-center font-bold">
                  ಸಂಸ್ಥೆ ಸದಸ್ಯತ್ವ ಕಾರ್ಡ್
                </div>

                {/* PHOTO */}

                <div
                  onPointerDown={(e) =>
                    startDrag(
                      "photo",
                      e
                    )
                  }
                  onPointerMove={(e) =>
                    moveElement(
                      "photo",
                      e
                    )
                  }
                  onPointerUp={stopDrag}
                  onPointerCancel={stopDrag}
                  onClick={() =>
                    setSelected("photo")
                  }
                  className={`absolute rounded-lg overflow-hidden bg-slate-200 cursor-move ${
                    selected === "photo"
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                  style={elementStyle(
                    "photo"
                  )}
                >

                  {a.photo_url ? (
                    <img
                      src={a.photo_url}
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover pointer-events-none"
                      alt="Member"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-xs text-slate-400">
                      Photo
                    </div>
                  )}

                </div>

                {/* NAME */}

                <div
                  onPointerDown={(e) =>
                    startDrag(
                      "name",
                      e
                    )
                  }
                  onPointerMove={(e) =>
                    moveElement(
                      "name",
                      e
                    )
                  }
                  onPointerUp={stopDrag}
                  onPointerCancel={stopDrag}
                  onClick={() =>
                    setSelected("name")
                  }
                  className={`absolute flex items-center font-bold text-sm cursor-move ${
                    selected === "name"
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                  style={elementStyle(
                    "name"
                  )}
                >
                  ಹೆಸರು:{" "}
                  {a.name || "-"}
                </div>

                {/* DESIGNATION */}

                <div
                  onPointerDown={(e) =>
                    startDrag(
                      "designation",
                      e
                    )
                  }
                  onPointerMove={(e) =>
                    moveElement(
                      "designation",
                      e
                    )
                  }
                  onPointerUp={stopDrag}
                  onPointerCancel={stopDrag}
                  onClick={() =>
                    setSelected(
                      "designation"
                    )
                  }
                  className={`absolute flex items-center text-xs cursor-move ${
                    selected === "designation"
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                  style={elementStyle(
                    "designation"
                  )}
                >
                  ಹುದ್ದೆ:{" "}
                  {a.designation || "-"}
                </div>

                {/* VILLAGE */}

                <div
                  onPointerDown={(e) =>
                    startDrag(
                      "village",
                      e
                    )
                  }
                  onPointerMove={(e) =>
                    moveElement(
                      "village",
                      e
                    )
                  }
                  onPointerUp={stopDrag}
                  onPointerCancel={stopDrag}
                  onClick={() =>
                    setSelected("village")
                  }
                  className={`absolute flex items-center text-xs cursor-move ${
                    selected === "village"
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                  style={elementStyle(
                    "village"
                  )}
                >
                  ಗ್ರಾಮ:{" "}
                  {a.village || "-"}
                </div>

                {/* MOBILE */}

                <div
                  onPointerDown={(e) =>
                    startDrag(
                      "mobile",
                      e
                    )
                  }
                  onPointerMove={(e) =>
                    moveElement(
                      "mobile",
                      e
                    )
                  }
                  onPointerUp={stopDrag}
                  onPointerCancel={stopDrag}
                  onClick={() =>
                    setSelected("mobile")
                  }
                  className={`absolute flex items-center text-xs cursor-move ${
                    selected === "mobile"
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                  style={elementStyle(
                    "mobile"
                  )}
                >
                  ಮೊಬೈಲ್:{" "}
                  {a.mobile || "-"}
                </div>

                {/* MEMBER ID */}

                <div
                  onPointerDown={(e) =>
                    startDrag(
                      "memberId",
                      e
                    )
                  }
                  onPointerMove={(e) =>
                    moveElement(
                      "memberId",
                      e
                    )
                  }
                  onPointerUp={stopDrag}
                  onPointerCancel={stopDrag}
                  onClick={() =>
                    setSelected("memberId")
                  }
                  className={`absolute flex items-center font-semibold text-xs cursor-move ${
                    selected === "memberId"
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                  style={elementStyle(
                    "memberId"
                  )}
                >
                  Member ID:{" "}
                  {a.membership_no ||
                    "-"}
                </div>

                {/* QR */}

                {qr && (
                  <div
                    onPointerDown={(e) =>
                      startDrag(
                        "qr",
                        e
                      )
                    }
                    onPointerMove={(e) =>
                      moveElement(
                        "qr",
                        e
                      )
                    }
                    onPointerUp={stopDrag}
                    onPointerCancel={stopDrag}
                    onClick={() =>
                      setSelected("qr")
                    }
                    className={`absolute cursor-move ${
                      selected === "qr"
                        ? "ring-2 ring-blue-500 ring-offset-1"
                        : ""
                    }`}
                    style={elementStyle(
                      "qr"
                    )}
                  >
                    <img
                      src={qr}
                      draggable={false}
                      className="w-full h-full pointer-events-none"
                      alt="QR"
                    />
                  </div>
                )}

              </div>

            </div>

          </div>

          {/* CONTROLS */}

          <div className="bg-white rounded-3xl shadow p-5">

            <h2 className="font-bold text-xl">
              🎨 Design Controls
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Element select ಮಾಡಿ drag ಮಾಡಿ.
            </p>

            {/* ELEMENT LIST */}

            <div className="mt-5">

              <h3 className="font-semibold mb-2">
                Elements
              </h3>

              <div className="grid grid-cols-2 gap-2">

                {(Object.keys(
                  labels
                ) as ElementKey[]).map(
                  (key) => (

                    <button
                      key={key}
                      onClick={() =>
                        setSelected(key)
                      }
                      className={`border rounded-xl px-3 py-3 text-left ${
                        selected === key
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200"
                      }`}
                    >
                      {key === "photo" &&
                        "🖼️ "}

                      {key === "name" &&
                        "👤 "}

                      {key === "designation" &&
                        "💼 "}

                      {key === "village" &&
                        "🏠 "}

                      {key === "mobile" &&
                        "📱 "}

                      {key === "memberId" &&
                        "🆔 "}

                      {key === "qr" &&
                        "🔳 "}

                      {labels[key]}
                    </button>

                  )
                )}

              </div>

            </div>

            {/* SELECTED ELEMENT */}

            <div className="mt-6 border rounded-2xl p-4">

              <h3 className="font-bold">
                Selected:{" "}
                {labels[selected]}
              </h3>

              <div className="mt-4">

                <div className="flex justify-between text-sm mb-2">

                  <span>
                    Width / Size
                  </span>

                  <b>
                    {Math.round(
                      layout[selected]
                        .width
                    )}
                    px
                  </b>

                </div>

                <input
                  type="range"
                  min="30"
                  max="180"
                  value={
                    layout[selected]
                      .width
                  }
                  disabled={locked}
                  onChange={(e) =>
                    changeSize(
                      selected,
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="w-full"
                />

              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">

                <div className="border rounded-xl p-3">

                  <div className="text-xs text-slate-500">
                    X
                  </div>

                  <div className="font-bold">
                    {Math.round(
                      layout[selected]
                        .x
                    )}
                    px
                  </div>

                </div>

                <div className="border rounded-xl p-3">

                  <div className="text-xs text-slate-500">
                    Y
                  </div>

                  <div className="font-bold">
                    {Math.round(
                      layout[selected]
                        .y
                    )}
                    px
                  </div>

                </div>

              </div>

            </div>

            {/* ACTIONS */}

            <div className="mt-5 grid gap-3">

              <button
                onClick={resetDesign}
                disabled={locked}
                className="border border-red-200 text-red-600 rounded-xl p-3 disabled:opacity-50"
              >
                ♻️ Reset Design
              </button>

              <button
                onClick={saveMasterDesign}
                disabled={locked}
                className="bg-purple-600 text-white rounded-xl p-3 disabled:opacity-50"
              >
                💾 Save Master Template
              </button>

            </div>

            {/* LOCK INFO */}

            <div className="mt-5 bg-green-50 border border-green-200 rounded-2xl p-4">

              <h3 className="font-bold text-green-800">
                {locked
                  ? "🔒 Design Locked"
                  : "✏️ Editing Enabled"}
              </h3>

              <p className="text-sm text-green-700 mt-1">
                {locked
                  ? "Master design locked. Unlock ಮಾಡಿ edit ಮಾಡಬಹುದು."
                  : "Cardನಲ್ಲಿ ಯಾವುದೇ element click ಮಾಡಿ drag ಮಾಡಬಹುದು."}
              </p>

            </div>

            {/* BACK */}

            <div className="mt-6">

              <h3 className="font-semibold">
                Back Preview
              </h3>

              <div className="mt-2 rounded-xl border bg-white min-h-40 grid place-items-center text-center p-5">

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
