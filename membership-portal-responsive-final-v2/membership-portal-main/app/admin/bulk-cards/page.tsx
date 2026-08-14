"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRouter } from "next/navigation";

/* =========================================================
   TYPES
========================================================= */

type Side = "front" | "back";

type ElementType =
  | "text"
  | "image"
  | "shape";

type TextAlign =
  | "left"
  | "center"
  | "right";

type CardElement = {
  id: string;
  type: ElementType;
  side: Side;

  x: number;
  y: number;
  width: number;
  height: number;

  text?: string;
  src?: string;

  fontSize?: number;
  fontWeight?: string;
  color?: string;
  background?: string;
  textAlign?: TextAlign;
  radius?: number;
};

type SavedDesign = {
  version?: number;
  width?: number;
  height?: number;
  elements?: CardElement[];
};

type Member = {
  id: string;
  name?: string;
  membership_no?: string | number;
  status?: string;
  is_deleted?: boolean;
  photo_url?: string;
};

/* =========================================================
   SAME DESIGN SIZE AS PVC DESIGNER
========================================================= */

const DESIGN_WIDTH = 856;
const DESIGN_HEIGHT = 539;

/* =========================================================
   PAGE
========================================================= */

export default function BulkCardsPage() {
  const router = useRouter();

  const [members, setMembers] =
    useState<Member[]>([]);

  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [generating, setGenerating] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [search, setSearch] =
    useState("");

  /* =======================================================
     LOAD APPROVED MEMBERS
  ======================================================= */

  useEffect(() => {
    async function load() {
      const {
        data: userData,
      } = await supabase.auth.getUser();

      if (!userData.user) {
        router.replace(
          "/admin/login"
        );
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("applications")
        .select(
          "id,name,membership_no,status,is_deleted,photo_url"
        )
        .eq(
          "status",
          "approved"
        )
        .eq(
          "is_deleted",
          false
        )
        .order(
          "membership_no",
          {
            ascending: true,
          }
        );

      if (error) {
        console.error(error);

        alert(
          "Approved Members load ಆಗಲಿಲ್ಲ:\n\n" +
            error.message
        );

        setLoading(false);
        return;
      }

      setMembers(
        (data || []) as Member[]
      );

      setLoading(false);
    }

    load();
  }, [router]);

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredMembers =
    useMemo(() => {
      const text =
        search
          .trim()
          .toLowerCase();

      if (!text) {
        return members;
      }

      return members.filter(
        (member) => {
          const value =
            [
              member.name,
              member.membership_no,
            ]
              .join(" ")
              .toLowerCase();

          return value.includes(
            text
          );
        }
      );
    }, [members, search]);

  /* =======================================================
     SELECT / UNSELECT
  ======================================================= */

  function toggleMember(
    id: string
  ) {
    setSelectedIds(
      (old) =>
        old.includes(id)
          ? old.filter(
              (x) => x !== id
            )
          : [
              ...old,
              id,
            ]
    );
  }

  function selectAll() {
    setSelectedIds(
      filteredMembers.map(
        (member) =>
          member.id
      )
    );
  }

  function clearAll() {
    setSelectedIds([]);
  }

  /* =======================================================
     IMAGE WAIT
  ======================================================= */

  async function waitForImages(
    container: HTMLElement
  ) {
    const images =
      Array.from(
        container.querySelectorAll(
          "img"
        )
      );

    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>(
            (resolve) => {
              if (
                img.complete &&
                img.naturalWidth > 0
              ) {
                resolve();
                return;
              }

              img.onload = () =>
                resolve();

              img.onerror = () =>
                resolve();
            }
          )
      )
    );

    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          200
        )
    );
  }

  /* =======================================================
     CREATE ELEMENT DOM
  ======================================================= */

  function createElementDom(
    element: CardElement
  ) {
    const outer =
      document.createElement(
        "div"
      );

    outer.style.position =
      "absolute";

    outer.style.left =
      `${element.x}px`;

    outer.style.top =
      `${element.y}px`;

    outer.style.width =
      `${element.width}px`;

    outer.style.height =
      `${element.height}px`;

    outer.style.boxSizing =
      "border-box";

    outer.style.overflow =
      "hidden";

    outer.style.zIndex =
      element.type ===
      "shape"
        ? "1"
        : "10";

    outer.style.background =
      element.background ||
      "transparent";

    outer.style.borderRadius =
      `${element.radius || 0}px`;

    outer.style.userSelect =
      "none";

    /* =====================================================
       SHAPE
    ===================================================== */

    if (
      element.type ===
      "shape"
    ) {
      return outer;
    }

    /* =====================================================
       IMAGE
    ===================================================== */

    if (
      element.type ===
      "image"
    ) {
      if (
        element.src
      ) {
        const img =
          document.createElement(
            "img"
          );

        img.src =
          element.src;

        img.alt = "";

        img.draggable =
          false;

        img.crossOrigin =
          "anonymous";

        img.style.display =
          "block";

        img.style.width =
          "100%";

        img.style.height =
          "100%";

        img.style.objectFit =
          "cover";

        img.style.userSelect =
          "none";

        outer.appendChild(
          img
        );
      }

      return outer;
    }

    /* =====================================================
       TEXT
    ===================================================== */

    const textBox =
      document.createElement(
        "div"
      );

    textBox.style.width =
      "100%";

    textBox.style.height =
      "100%";

    textBox.style.display =
      "flex";

    textBox.style.alignItems =
      "center";

    if (
      element.textAlign ===
      "left"
    ) {
      textBox.style.justifyContent =
        "flex-start";
    } else if (
      element.textAlign ===
      "right"
    ) {
      textBox.style.justifyContent =
        "flex-end";
    } else {
      textBox.style.justifyContent =
        "center";
    }

    textBox.style.padding =
      "6px";

    textBox.style.boxSizing =
      "border-box";

    textBox.style.fontSize =
      `${element.fontSize || 20}px`;

    textBox.style.fontWeight =
      element.fontWeight ||
      "500";

    textBox.style.color =
      element.color ||
      "#111827";

    textBox.style.textAlign =
      element.textAlign ||
      "center";

    textBox.style.lineHeight =
      "1.2";

    textBox.style.whiteSpace =
      "pre-wrap";

    textBox.style.wordBreak =
      "break-word";

    textBox.style.fontFamily =
      "'Noto Sans Kannada', 'Nirmala UI', Arial, sans-serif";

    textBox.textContent =
      element.text ||
      "";

    outer.appendChild(
      textBox
    );

    return outer;
  }

  /* =======================================================
     CREATE CARD
  ======================================================= */

  function createCardDom(
    elements: CardElement[],
    side: Side
  ) {
    const card =
      document.createElement(
        "div"
      );

    card.style.position =
      "relative";

    card.style.width =
      `${DESIGN_WIDTH}px`;

    card.style.height =
      `${DESIGN_HEIGHT}px`;

    card.style.background =
      "#ffffff";

    card.style.overflow =
      "hidden";

    card.style.boxSizing =
      "border-box";

    card.style.flexShrink =
      "0";

    card.style.fontFamily =
      "'Noto Sans Kannada', 'Nirmala UI', Arial, sans-serif";

    const sideElements =
      elements.filter(
        (element) =>
          element.side ===
          side
      );

    sideElements.forEach(
      (element) => {
        card.appendChild(
          createElementDom(
            element
          )
        );
      }
    );

    return card;
  }

  /* =======================================================
     LOAD SAVED DESIGN
  ======================================================= */

  function loadSavedDesign(
    memberId: string
  ): SavedDesign | null {
    try {
      const key =
        `pvc-designer-${memberId}`;

      const raw =
        localStorage.getItem(
          key
        );

      if (!raw) {
        return null;
      }

      const saved =
        JSON.parse(
          raw
        ) as SavedDesign;

      if (
        !Array.isArray(
          saved.elements
        ) ||
        saved.elements.length ===
          0
      ) {
        return null;
      }

      return saved;
    } catch (error) {
      console.error(
        "Design load error:",
        error
      );

      return null;
    }
  }

  /* =======================================================
     CAPTURE CARD
  ======================================================= */

  async function captureCard(
    card: HTMLElement
  ) {
    await waitForImages(
      card
    );

    return await html2canvas(
      card,
      {
        width:
          DESIGN_WIDTH,

        height:
          DESIGN_HEIGHT,

        scale: 2,

        useCORS: true,

        allowTaint: false,

        backgroundColor:
          "#ffffff",

        logging: false,
      }
    );
  }

  /* =======================================================
     GENERATE BULK PDF
  ======================================================= */

  async function generateBulkPDF(
    onlySelected: boolean
  ) {
    if (
      generating
    ) {
      return;
    }

    let selectedMembers: Member[] =
      [];

    if (
      onlySelected
    ) {
      selectedMembers =
        members.filter(
          (member) =>
            selectedIds.includes(
              member.id
            )
        );
    } else {
      selectedMembers =
        [...members];
    }

    if (
      selectedMembers.length ===
      0
    ) {
      alert(
        onlySelected
          ? "ಮೊದಲು members select ಮಾಡಿ."
          : "Approved Members ಯಾರೂ ಇಲ್ಲ."
      );

      return;
    }

    setGenerating(true);

    setMessage(
      "PDF preparing..."
    );

    let pdf:
      jsPDF | null =
      null;

    let generatedCount =
      0;

    const missingDesigns: string[] =
      [];

    try {
      for (
        let i = 0;
        i <
        selectedMembers.length;
        i++
      ) {
        const member =
          selectedMembers[i];

        setMessage(
          `Generating ${i + 1} / ${selectedMembers.length} — ${
            member.name ||
            "Member"
          }`
        );

        /* ---------------------------------------------
           LOAD DESIGN
        --------------------------------------------- */

        const saved =
          loadSavedDesign(
            member.id
          );

        if (
          !saved ||
          !saved.elements
        ) {
          missingDesigns.push(
            `${
              member.membership_no ||
              "No Number"
            } - ${
              member.name ||
              "Member"
            }`
          );

          continue;
        }

        const elements =
          saved.elements;

        const width =
          Number(
            saved.width
          ) > 0
            ? Number(
                saved.width
              )
            : 85.6;

        const height =
          Number(
            saved.height
          ) > 0
            ? Number(
                saved.height
              )
            : 53.9;

        /* ---------------------------------------------
           HIDDEN HOLDER
        --------------------------------------------- */

        const holder =
          document.createElement(
            "div"
          );

        holder.style.position =
          "fixed";

        holder.style.left =
          "-100000px";

        holder.style.top =
          "0";

        holder.style.width =
          `${DESIGN_WIDTH}px`;

        holder.style.height =
          `${DESIGN_HEIGHT}px`;

        holder.style.background =
          "#ffffff";

        holder.style.overflow =
          "hidden";

        holder.style.zIndex =
          "-99999";

        document.body.appendChild(
          holder
        );

        /* ---------------------------------------------
           FRONT
        --------------------------------------------- */

        const frontCard =
          createCardDom(
            elements,
            "front"
          );

        holder.appendChild(
          frontCard
        );

        const frontCanvas =
          await captureCard(
            frontCard
          );

        /* ---------------------------------------------
           BACK
        --------------------------------------------- */

        holder.removeChild(
          frontCard
        );

        const backCard =
          createCardDom(
            elements,
            "back"
          );

        holder.appendChild(
          backCard
        );

        const backCanvas =
          await captureCard(
            backCard
          );

        /* ---------------------------------------------
           REMOVE HOLDER
        --------------------------------------------- */

        document.body.removeChild(
          holder
        );

        const frontImage =
          frontCanvas.toDataURL(
            "image/png"
          );

        const backImage =
          backCanvas.toDataURL(
            "image/png"
          );

        const orientation =
          width >= height
            ? "landscape"
            : "portrait";

        /* ---------------------------------------------
           CREATE PDF
        --------------------------------------------- */

        if (!pdf) {
          pdf =
            new jsPDF({
              orientation,

              unit: "mm",

              format: [
                width,
                height,
              ],

              compress:
                true,
            });
        } else {
          pdf.addPage(
            [
              width,
              height,
            ],
            orientation
          );
        }

        /* FRONT */

        pdf.addImage(
          frontImage,
          "PNG",
          0,
          0,
          width,
          height,
          undefined,
          "FAST"
        );

        /* BACK */

        pdf.addPage(
          [
            width,
            height,
          ],
          orientation
        );

        pdf.addImage(
          backImage,
          "PNG",
          0,
          0,
          width,
          height,
          undefined,
          "FAST"
        );

        generatedCount++;

        /*
         * Browserಗೆ ಸ್ವಲ್ಪ breathing time.
         * ದೊಡ್ಡ number of cards ಇದ್ದರೂ freeze ಆಗದಂತೆ.
         */

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              50
            )
        );
      }

      /* =================================================
         RESULT
      ================================================= */

      if (
        !pdf ||
        generatedCount ===
          0
      ) {
        alert(
          "ಯಾವುದೇ card generate ಆಗಲಿಲ್ಲ.\n\nಮೊದಲು PVC Designerನಲ್ಲಿ members cards save ಆಗಿರುವುದನ್ನು ಖಚಿತಪಡಿಸಿ."
        );

        setMessage("");

        return;
      }

      /* =================================================
         SAVE
      ================================================= */

      const filename =
        onlySelected
          ? "Selected-Approved-PVC-Cards.pdf"
          : "All-Approved-PVC-Cards.pdf";

      pdf.save(
        filename
      );

      let resultMessage =
        `✅ ${generatedCount} member cards PDF generated.`;

      if (
        missingDesigns.length >
        0
      ) {
        resultMessage +=
          `\n\n⚠️ Design save ಆಗಿರದ members: ${missingDesigns.length}`;
      }

      setMessage(
        resultMessage
      );

      if (
        missingDesigns.length >
        0
      ) {
        alert(
          `PDF generate ಆಯಿತು ✅\n\nGenerated: ${generatedCount}\nDesign save ಆಗಿರದವು: ${missingDesigns.length}\n\nDesign ಇಲ್ಲದ members:\n\n${missingDesigns.join(
            "\n"
          )}`
        );
      } else {
        alert(
          `ಎಲ್ಲಾ ${generatedCount} cards PDF generate ಆಯಿತು ✅`
        );
      }
    } catch (error: any) {
      console.error(
        "BULK PDF ERROR:",
        error
      );

      setMessage(
        "❌ Bulk PDF generate ಆಗಲಿಲ್ಲ."
      );

      alert(
        "Bulk PDF generate ಆಗಲಿಲ್ಲ.\n\n" +
          (
            error?.message ||
            "Browser console check ಮಾಡಿ."
          )
      );
    } finally {
      setGenerating(
        false
      );
    }
  }

  /* =======================================================
     LOGOUT
  ======================================================= */

  async function logout() {
    await supabase.auth.signOut();

    router.push(
      "/admin/login"
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-100">

      {/* HEADER */}

      <header className="bg-slate-950 text-white">

        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-wrap gap-3 justify-between items-center">

          <div>

            <h1 className="text-xl font-bold">
              PVC Card Bulk Download
            </h1>

            <p className="text-sm text-slate-400 mt-1">
              Approved Members Cards
            </p>

          </div>

          <div className="flex gap-2">

            <button
              onClick={() =>
                router.push(
                  "/admin"
                )
              }
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg"
            >
              ← Admin
            </button>

            <button
              onClick={
                logout
              }
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
            >
              Logout
            </button>

          </div>

        </div>

      </header>

      {/* CONTENT */}

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* TITLE */}

        <section className="bg-white rounded-2xl shadow-sm p-6">

          <h2 className="text-2xl font-bold">
            📥 Approved PVC Cards
          </h2>

          <p className="text-slate-500 mt-2">
            Approved members select ಮಾಡಿ
            Front + Back cards ಒಂದೇ PDFನಲ್ಲಿ
            download ಮಾಡಬಹುದು.
          </p>

        </section>

        {/* ACTIONS */}

        <section className="bg-white rounded-2xl shadow-sm p-5 mt-5">

          <div className="flex flex-wrap gap-3">

            <button
              onClick={
                selectAll
              }
              disabled={
                loading ||
                filteredMembers.length ===
                  0
              }
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-semibold"
            >
              ☑️ Select All
            </button>

            <button
              onClick={
                clearAll
              }
              className="border border-slate-300 hover:bg-slate-100 px-5 py-3 rounded-xl font-semibold"
            >
              Clear Selection
            </button>

            <button
              onClick={() =>
                generateBulkPDF(
                  true
                )
              }
              disabled={
                generating ||
                selectedIds.length ===
                  0
              }
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-bold"
            >
              {generating
                ? "Generating..."
                : `📥 Download Selected (${selectedIds.length})`}
            </button>

            <button
              onClick={() =>
                generateBulkPDF(
                  false
                )
              }
              disabled={
                generating ||
                members.length ===
                  0
              }
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-bold"
            >
              {generating
                ? "Generating..."
                : `📦 Download All Approved (${members.length})`}
            </button>

          </div>

          {message && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-800 whitespace-pre-line">
              {message}
            </div>
          )}

        </section>

        {/* SEARCH */}

        <section className="bg-white rounded-2xl shadow-sm p-5 mt-5">

          <input
            type="text"
            value={
              search
            }
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Name ಅಥವಾ Membership Number ಹುಡುಕಿ..."
            className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

        </section>

        {/* MEMBERS */}

        <section className="bg-white rounded-2xl shadow-sm mt-5 overflow-hidden">

          <div className="p-5 border-b flex flex-wrap justify-between gap-3">

            <div>

              <h3 className="font-bold text-lg">
                Approved Members
              </h3>

              <p className="text-sm text-slate-500">
                Total:{" "}
                {
                  members.length
                }
                {" | "}
                Selected:{" "}
                {
                  selectedIds.length
                }
              </p>

            </div>

          </div>

          {loading ? (

            <div className="p-10 text-center">
              Loading approved members...
            </div>

          ) : filteredMembers.length ===
            0 ? (

            <div className="p-10 text-center text-slate-500">
              Approved members ಇಲ್ಲ.
            </div>

          ) : (

            <div className="divide-y">

              {filteredMembers.map(
                (
                  member
                ) => {

                  const checked =
                    selectedIds.includes(
                      member.id
                    );

                  return (
                    <label
                      key={
                        member.id
                      }
                      className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 ${
                        checked
                          ? "bg-blue-50"
                          : ""
                      }`}
                    >

                      <input
                        type="checkbox"
                        checked={
                          checked
                        }
                        onChange={() =>
                          toggleMember(
                            member.id
                          )
                        }
                        className="w-5 h-5"
                      />

                      {member.photo_url ? (

                        <img
                          src={
                            member.photo_url
                          }
                          alt=""
                          className="w-12 h-14 rounded-lg object-cover border"
                        />

                      ) : (

                        <div className="w-12 h-14 rounded-lg bg-slate-200 grid place-items-center text-xl">
                          👤
                        </div>

                      )}

                      <div className="flex-1">

                        <div className="font-bold">
                          {
                            member.name ||
                            "Unnamed Member"
                          }
                        </div>

                        <div className="text-sm text-slate-500 mt-1">
                          Membership No:{" "}
                          <b>
                            {
                              member.membership_no ||
                              "—"
                            }
                          </b>
                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={(
                          e
                        ) => {
                          e.preventDefault();

                          router.push(
                            `/admin/card?id=${member.id}`
                          );
                        }}
                        className="border border-blue-300 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm"
                      >
                        🎨 Edit Card
                      </button>

                    </label>
                  );
                }
              )}

            </div>

          )}

        </section>

        {/* INFORMATION */}

        <section className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mt-5">

          <h3 className="font-bold text-yellow-900">
            ℹ️ ಗಮನಿಸಿ
          </h3>

          <ul className="mt-2 text-sm text-yellow-800 space-y-1">

            <li>
              • PDFನಲ್ಲಿ ಪ್ರತಿಯೊಬ್ಬ memberಗೆ Front + Back ಎರಡು pages ಬರುತ್ತವೆ.
            </li>

            <li>
              • ಈಗಿರುವ PVC Designerನಲ್ಲಿ save ಮಾಡಿದ designನೇ ಬಳಸುತ್ತದೆ.
            </li>

            <li>
              • Card size ಕೂಡ save ಮಾಡಿದ physical size ಬಳಸುತ್ತದೆ.
            </li>

            <li>
              • Deleted / Recycle Bin members PDFಗೆ ಬರುವುದಿಲ್ಲ.
            </li>

            <li>
              • PVC Designerನಲ್ಲಿ design save ಆಗದ member ಇದ್ದರೆ ಆ member PDFಗೆ skip ಆಗುತ್ತದೆ.
            </li>

          </ul>

        </section>

      </div>

    </main>
  );
}
