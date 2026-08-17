"use client";

import {
  ChangeEvent,
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type NewsItem = {
  title: string;
  description: string;
  image_url: string;
  category: string;
};

type ProcessItem = {
  number: string;
  title: string;
  description: string;
};

type TextStyle = {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  textDecoration: "none" | "underline";
  textAlign: "left" | "center" | "right";
  color: string;
  backgroundColor: string;
  lineHeight: number;
  letterSpacing: number;
  opacity: number;
  borderRadius: number;
};

type PageElement = {
  id: string;
  type: "text" | "image";
  content: string;
  image_url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  style: TextStyle;
  objectFit: "cover" | "contain" | "fill";
};

type PageContent = {
  hero: {
    badge: string;
    eyebrow: string;
    title: string;
    description: string;
    image_url: string;
    image_alt: string;
  };

  news: NewsItem[];

  process: {
    title: string;
    description: string;
    items: ProcessItem[];
  };

  cta: {
    title: string;
    description: string;
  };

  elements: PageElement[];
};

const defaultTextStyle: TextStyle = {
  fontFamily: "Arial, sans-serif",
  fontSize: 24,
  fontWeight: 600,
  fontStyle: "normal",
  textDecoration: "none",
  textAlign: "left",
  color: "#111827",
  backgroundColor: "transparent",
  lineHeight: 1.4,
  letterSpacing: 0,
  opacity: 1,
  borderRadius: 0,
};

const defaultContent: PageContent = {
  hero: {
    badge: "🚜 ರೈತರು • ಕೃಷಿ • ಸಂಘಟನೆ",
    eyebrow: "Organization Membership Portal",
    title: "ನಮ್ಮ ಸಂಘಟನೆಗೆ ಸದಸ್ಯರಾಗಿ",
    description:
      "ಸದಸ್ಯತ್ವ ನೋಂದಣಿ ಮಾಡಿ ಮತ್ತು PVC ID Card ಪಡೆಯಿರಿ",
    image_url: "",
    image_alt:
      "ರೈತರು ಕೃಷಿ ಕೆಲಸ ಮಾಡುತ್ತಿರುವ ದೃಶ್ಯ",
  },

  news: [
    {
      category: "🌾 ಕೃಷಿ ಸುದ್ದಿ",
      title: "ರೈತರಿಗೆ ಉಪಯುಕ್ತ ಕೃಷಿ ಮಾಹಿತಿ",
      description:
        "ರೈತರಿಗೆ ಅಗತ್ಯವಾದ ಕೃಷಿ ಮಾಹಿತಿ ಮತ್ತು ಹೊಸ ವಿಚಾರಗಳನ್ನು ಇಲ್ಲಿ ಪ್ರಕಟಿಸಬಹುದು.",
      image_url: "",
    },
    {
      category: "🚜 ರೈತ ಮಾಹಿತಿ",
      title: "ಕೃಷಿ ಮತ್ತು ರೈತರ ಅಭಿವೃದ್ಧಿ",
      description:
        "ರೈತರ ಅಭಿವೃದ್ಧಿಗೆ ಸಂಬಂಧಿಸಿದ ಮಾಹಿತಿ, ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ಪ್ರಮುಖ ಸುದ್ದಿಗಳನ್ನು ಇಲ್ಲಿ ಹಾಕಬಹುದು.",
      image_url: "",
    },
    {
      category: "📢 ಪ್ರಮುಖ ಮಾಹಿತಿ",
      title: "ರೈತರಿಗೆ ಹೊಸ ಯೋಜನೆಗಳು",
      description:
        "ರೈತರಿಗೆ ಸಂಬಂಧಿಸಿದ ಯೋಜನೆಗಳು, ಪ್ರಕಟಣೆಗಳು ಮತ್ತು ಸಂಘಟನೆಯ ಪ್ರಮುಖ ಮಾಹಿತಿಯನ್ನು ಇಲ್ಲಿ ಹಾಕಬಹುದು.",
      image_url: "",
    },
  ],

  process: {
    title: "Membership ಹೇಗೆ ಪಡೆಯುವುದು?",
    description:
      "ಸರಳವಾದ ಮೂರು ಹಂತಗಳಲ್ಲಿ ನಿಮ್ಮ membership complete ಮಾಡಿ.",
    items: [
      {
        number: "01",
        title: "ಸರಳ ನೋಂದಣಿ",
        description:
          "ಮೊಬೈಲ್‌ನಿಂದಲೇ ನಿಮ್ಮ ವಿವರ ಮತ್ತು ಫೋಟೋ ಸಲ್ಲಿಸಿ.",
      },
      {
        number: "02",
        title: "Admin Approval",
        description:
          "Admin ನಿಮ್ಮ application ಪರಿಶೀಲಿಸಿ Pending → Approved ಮಾಡುತ್ತಾರೆ.",
      },
      {
        number: "03",
        title: "PVC ID Card",
        description:
          "Approval ನಂತರ Member ID ಮತ್ತು QR ಇರುವ PVC card generate ಮಾಡಬಹುದು.",
      },
    ],
  },

  cta: {
    title: "ಇಂದೇ Membership ನೋಂದಣಿ ಮಾಡಿ",
    description:
      "ನಿಮ್ಮ ವಿವರ ಸಲ್ಲಿಸಿ ಮತ್ತು Admin approval ಪಡೆಯಿರಿ.",
  },

  elements: [],
};

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

export default function Editor() {
  const router = useRouter();

  const previewRef =
    useRef<HTMLDivElement | null>(null);

  const [content, setContent] =
    useState<PageContent>(defaultContent);

  const [brand, setBrand] =
    useState("#16a34a");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [selectedElementId, setSelectedElementId] =
    useState<string | null>(null);

  const [cropSource, setCropSource] =
    useState<string | null>(null);

  const [cropTarget, setCropTarget] =
    useState<
      | { type: "hero" }
      | { type: "news"; index: number }
      | { type: "element"; id: string }
      | null
    >(null);

  const [cropX, setCropX] =
    useState(50);

  const [cropY, setCropY] =
    useState(50);

  const [cropZoom, setCropZoom] =
    useState(1);

  const [cropBusy, setCropBusy] =
    useState(false);

  useEffect(() => {
    async function loadSettings() {
      const { data } =
        await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/admin/login");
        return;
      }

      const { data: settings, error } =
        await supabase
          .from("site_settings")
          .select(
            "id, hero_text, sub_text, brand_color, page_content"
          )
          .eq("id", 1)
          .maybeSingle();

      if (error) {
        console.error(error);
      }

      if (settings) {
        setBrand(
          settings.brand_color ||
            "#16a34a"
        );

        if (settings.page_content) {
          const saved =
            settings.page_content as Partial<PageContent>;

          setContent({
            ...defaultContent,
            ...saved,

            hero: {
              ...defaultContent.hero,
              ...(saved.hero || {}),
            },

            news:
              saved.news ||
              defaultContent.news,

            process: {
              ...defaultContent.process,
              ...(saved.process || {}),
              items:
                saved.process?.items ||
                defaultContent.process.items,
            },

            cta: {
              ...defaultContent.cta,
              ...(saved.cta || {}),
            },

            elements:
              saved.elements ||
              [],
          });
        } else {
          setContent({
            ...defaultContent,

            hero: {
              ...defaultContent.hero,

              title:
                settings.hero_text ||
                defaultContent.hero.title,

              description:
                settings.sub_text ||
                defaultContent.hero.description,
            },
          });
        }
      }

      setLoading(false);
    }

    loadSettings();
  }, [router]);

  function updateHero(
    key: keyof PageContent["hero"],
    value: string
  ) {
    setContent((prev) => ({
      ...prev,

      hero: {
        ...prev.hero,
        [key]: value,
      },
    }));
  }

  function updateNews(
    index: number,
    key: keyof NewsItem,
    value: string
  ) {
    setContent((prev) => {
      const news = [...prev.news];

      news[index] = {
        ...news[index],
        [key]: value,
      };

      return {
        ...prev,
        news,
      };
    });
  }

  function updateProcess(
    index: number,
    key: keyof ProcessItem,
    value: string
  ) {
    setContent((prev) => {
      const items = [
        ...prev.process.items,
      ];

      items[index] = {
        ...items[index],
        [key]: value,
      };

      return {
        ...prev,

        process: {
          ...prev.process,
          items,
        },
      };
    });
  }

  function updateProcessMain(
    key: "title" | "description",
    value: string
  ) {
    setContent((prev) => ({
      ...prev,

      process: {
        ...prev.process,
        [key]: value,
      },
    }));
  }

  function updateCta(
    key: "title" | "description",
    value: string
  ) {
    setContent((prev) => ({
      ...prev,

      cta: {
        ...prev.cta,
        [key]: value,
      },
    }));
  }

  function updateElement(
    id: string,
    patch: Partial<PageElement>
  ) {
    setContent((prev) => ({
      ...prev,

      elements: prev.elements.map(
        (element) =>
          element.id === id
            ? {
                ...element,
                ...patch,
              }
            : element
      ),
    }));
  }

  function updateElementStyle(
    id: string,
    patch: Partial<TextStyle>
  ) {
    setContent((prev) => ({
      ...prev,

      elements: prev.elements.map(
        (element) =>
          element.id === id
            ? {
                ...element,
                style: {
                  ...element.style,
                  ...patch,
                },
              }
            : element
      ),
    }));
  }

  function addTextElement() {
    const element: PageElement = {
      id: createId("text"),
      type: "text",
      content: "ಹೊಸ Text ಇಲ್ಲಿ ಬರೆಯಿರಿ",
      image_url: "",
      x: 100,
      y: 500,
      width: 350,
      height: 100,
      zIndex: 100,
      style: {
        ...defaultTextStyle,
      },
      objectFit: "contain",
    };

    setContent((prev) => ({
      ...prev,

      elements: [
        ...prev.elements,
        element,
      ],
    }));

    setSelectedElementId(
      element.id
    );
  }

  function addImageElement() {
    const element: PageElement = {
      id: createId("image"),
      type: "image",
      content: "",
      image_url: "",
      x: 100,
      y: 650,
      width: 360,
      height: 220,
      zIndex: 100,
      style: {
        ...defaultTextStyle,
      },
      objectFit: "cover",
    };

    setContent((prev) => ({
      ...prev,

      elements: [
        ...prev.elements,
        element,
      ],
    }));

    setSelectedElementId(
      element.id
    );
  }

  function deleteElement(id: string) {
    setContent((prev) => ({
      ...prev,

      elements:
        prev.elements.filter(
          (element) =>
            element.id !== id
        ),
    }));

    setSelectedElementId(null);
  }

  function moveElement(
    id: string,
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    const preview =
      previewRef.current;

    if (!preview) return;

    const element =
      content.elements.find(
        (item) => item.id === id
      );

    if (!element) return;

    const startX =
      event.clientX;

    const startY =
      event.clientY;

    const originalX =
      element.x;

    const originalY =
      element.y;

    function move(
      e: globalThis.PointerEvent
    ) {
      const nextX =
        originalX +
        (e.clientX - startX);

      const nextY =
        originalY +
        (e.clientY - startY);

      updateElement(id, {
        x: Math.max(
          0,
          nextX
        ),

        y: Math.max(
          0,
          nextY
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

  function startCrop(
    file: File,
    target:
      | { type: "hero" }
      | { type: "news"; index: number }
      | { type: "element"; id: string }
  ) {
    const reader =
      new FileReader();

    reader.onload = () => {
      setCropSource(
        String(reader.result)
      );

      setCropTarget(target);

      setCropX(50);
      setCropY(50);
      setCropZoom(1);
    };

    reader.readAsDataURL(file);
  }

  async function cropAndUpload() {
    if (
      !cropSource ||
      !cropTarget
    ) {
      return;
    }

    setCropBusy(true);

    try {
      const image =
        new Image();

      image.src =
        cropSource;

      await new Promise<void>(
        (resolve, reject) => {
          image.onload = () =>
            resolve();

          image.onerror = () =>
            reject(
              new Error(
                "Image load failed"
              )
            );
        }
      );

      const canvas =
        document.createElement(
          "canvas"
        );

      const outputWidth =
        1200;

      const outputHeight =
        800;

      canvas.width =
        outputWidth;

      canvas.height =
        outputHeight;

      const ctx =
        canvas.getContext("2d");

      if (!ctx) {
        throw new Error(
          "Canvas unavailable"
        );
      }

      const targetRatio =
        outputWidth /
        outputHeight;

      const sourceRatio =
        image.width /
        image.height;

      let cropWidth =
        image.width;

      let cropHeight =
        image.height;

      if (
        sourceRatio >
        targetRatio
      ) {
        cropWidth =
          image.height *
          targetRatio;
      } else {
        cropHeight =
          image.width /
          targetRatio;
      }

      cropWidth /=
        cropZoom;

      cropHeight /=
        cropZoom;

      const maxX =
        image.width -
        cropWidth;

      const maxY =
        image.height -
        cropHeight;

      const sourceX =
        Math.max(
          0,
          Math.min(
            maxX,
            (maxX * cropX) /
              100
          )
        );

      const sourceY =
        Math.max(
          0,
          Math.min(
            maxY,
            (maxY * cropY) /
              100
          )
        );

      ctx.drawImage(
        image,
        sourceX,
        sourceY,
        cropWidth,
        cropHeight,
        0,
        0,
        outputWidth,
        outputHeight
      );

      const blob =
        await new Promise<Blob | null>(
          (resolve) =>
            canvas.toBlob(
              resolve,
              "image/jpeg",
              0.9
            )
        );

      if (!blob) {
        throw new Error(
          "Crop failed"
        );
      }

      const filename =
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.jpg`;

      const path =
        `main-page/${filename}`;

      const { error } =
        await supabase.storage
          .from("site-images")
          .upload(
            path,
            blob,
            {
              cacheControl:
                "3600",
              upsert: false,
              contentType:
                "image/jpeg",
            }
          );

      if (error) {
        throw error;
      }

      const { data } =
        supabase.storage
          .from("site-images")
          .getPublicUrl(path);

      const imageUrl =
        data.publicUrl;

      if (
        cropTarget.type ===
        "hero"
      ) {
        updateHero(
          "image_url",
          imageUrl
        );
      }

      if (
        cropTarget.type ===
        "news"
      ) {
        updateNews(
          cropTarget.index,
          "image_url",
          imageUrl
        );
      }

      if (
        cropTarget.type ===
        "element"
      ) {
        updateElement(
          cropTarget.id,
          {
            image_url:
              imageUrl,
          }
        );
      }

      setCropSource(null);
      setCropTarget(null);

      setMessage(
        "✅ Image crop ಮಾಡಿ previewಗೆ ಸೇರಿಸಲಾಗಿದೆ."
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "❌ Image crop/upload ಆಗಲಿಲ್ಲ."
      );
    } finally {
      setCropBusy(false);
    }
  }

  async function save() {
    setSaving(true);
    setMessage("");

    const { error } =
      await supabase
        .from("site_settings")
        .upsert({
          id: 1,

          hero_text:
            content.hero.title,

          sub_text:
            content.hero.description,

          brand_color:
            brand,

          page_content:
            content,
        });

    if (error) {
      console.error(error);

      setMessage(
        "❌ Save ಆಗಲಿಲ್ಲ: " +
          error.message
      );
    } else {
      setMessage(
        "✅ Website changes saved successfully!"
      );
    }

    setSaving(false);
  }

  function reset() {
    setContent(
      defaultContent
    );

    setBrand("#16a34a");

    setSelectedElementId(
      null
    );

    setMessage(
      "Reset preview ಮಾತ್ರ ಮಾಡಲಾಗಿದೆ. Save ಒತ್ತಿದರೆ database update ಆಗುತ್ತದೆ."
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-8">
          Loading Website Editor...
        </div>
      </main>
    );
  }

  const selectedElement =
    content.elements.find(
      (element) =>
        element.id ===
        selectedElementId
    ) || null;

  return (
    <main className="h-screen overflow-hidden bg-slate-100">

      {/* HEADER */}

      <header className="h-[76px] bg-slate-950 text-white">

        <div className="h-full px-5 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold">
              Visual Website Editor
            </h1>

            <p className="text-sm text-slate-400">
              Main Page Design Editor
            </p>
          </div>

          <div className="flex gap-2">

            <button
              onClick={reset}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20"
            >
              Reset
            </button>

            <button
              onClick={save}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 font-semibold disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "💾 Save Changes"}
            </button>

          </div>

        </div>

      </header>


      {/* EDITOR + PREVIEW */}

      <div className="h-[calc(100vh-76px)] grid lg:grid-cols-[430px_minmax(0,1fr)]">

        {/* EDIT SECTION */}

        <aside className="h-full overflow-y-auto bg-white border-r border-slate-200">

          <div className="p-5 space-y-5">

            {message && (
              <div className="bg-slate-50 border rounded-xl p-4 text-sm font-semibold">
                {message}
              </div>
            )}


            {/* ADD NEW */}

            <section className="border rounded-2xl p-4">

              <h2 className="font-bold text-lg">
                ➕ New Content
              </h2>

              <div className="grid grid-cols-2 gap-3 mt-4">

                <button
                  onClick={
                    addTextElement
                  }
                  className="border rounded-xl p-4 hover:bg-slate-50 font-semibold"
                >
                  ✏️
                  <br />
                  New Text
                </button>

                <button
                  onClick={
                    addImageElement
                  }
                  className="border rounded-xl p-4 hover:bg-slate-50 font-semibold"
                >
                  🖼️
                  <br />
                  New Image
                </button>

              </div>

            </section>


            {/* SELECTED ELEMENT */}

            {selectedElement && (
              <section className="border-2 border-green-500 rounded-2xl p-4">

                <div className="flex justify-between items-center">

                  <h2 className="font-bold">
                    ✏️ Selected
                  </h2>

                  <button
                    onClick={() =>
                      deleteElement(
                        selectedElement.id
                      )
                    }
                    className="text-red-600 font-bold"
                  >
                    Delete
                  </button>

                </div>


                {selectedElement.type ===
                  "text" && (
                  <div className="space-y-4 mt-4">

                    <textarea
                      value={
                        selectedElement.content
                      }
                      onChange={(e) =>
                        updateElement(
                          selectedElement.id,
                          {
                            content:
                              e.target
                                .value,
                          }
                        )
                      }
                      rows={5}
                      className="w-full border rounded-xl p-3"
                      placeholder="Text"
                    />


                    {/* FONT */}

                    <div>

                      <label className="text-sm font-semibold">
                        Font
                      </label>

                      <select
                        value={
                          selectedElement
                            .style
                            .fontFamily
                        }
                        onChange={(e) =>
                          updateElementStyle(
                            selectedElement.id,
                            {
                              fontFamily:
                                e.target
                                  .value,
                            }
                          )
                        }
                        className="w-full border rounded-xl p-3 mt-1"
                      >

                        <option value="Arial, sans-serif">
                          Arial
                        </option>

                        <option value="Georgia, serif">
                          Georgia
                        </option>

                        <option value="Verdana, sans-serif">
                          Verdana
                        </option>

                        <option value="'Trebuchet MS', sans-serif">
                          Trebuchet MS
                        </option>

                        <option value="'Times New Roman', serif">
                          Times New Roman
                        </option>

                      </select>

                    </div>


                    {/* SIZE + WEIGHT */}

                    <div className="grid grid-cols-2 gap-3">

                      <label className="text-sm font-semibold">

                        Font Size

                        <input
                          type="number"
                          min="8"
                          max="120"
                          value={
                            selectedElement
                              .style
                              .fontSize
                          }
                          onChange={(e) =>
                            updateElementStyle(
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
                          className="w-full border rounded-xl p-2 mt-1"
                        />

                      </label>


                      <label className="text-sm font-semibold">

                        Weight

                        <select
                          value={
                            selectedElement
                              .style
                              .fontWeight
                          }
                          onChange={(e) =>
                            updateElementStyle(
                              selectedElement.id,
                              {
                                fontWeight:
                                  Number(
                                    e.target
                                      .value
                                  ),
                              }
                            )
                          }
                          className="w-full border rounded-xl p-2 mt-1"
                        >

                          <option value="400">
                            Normal
                          </option>

                          <option value="500">
                            Medium
                          </option>

                          <option value="600">
                            Semi Bold
                          </option>

                          <option value="700">
                            Bold
                          </option>

                          <option value="800">
                            Extra Bold
                          </option>

                        </select>

                      </label>

                    </div>


                    {/* TEXT BUTTONS */}

                    <div className="grid grid-cols-4 gap-2">

                      <button
                        onClick={() =>
                          updateElementStyle(
                            selectedElement.id,
                            {
                              fontWeight:
                                selectedElement
                                  .style
                                  .fontWeight ===
                                700
                                  ? 400
                                  : 700,
                            }
                          )
                        }
                        className="border rounded-lg p-2 font-bold"
                      >
                        B
                      </button>

                      <button
                        onClick={() =>
                          updateElementStyle(
                            selectedElement.id,
                            {
                              fontStyle:
                                selectedElement
                                  .style
                                  .fontStyle ===
                                "italic"
                                  ? "normal"
                                  : "italic",
                            }
                          )
                        }
                        className="border rounded-lg p-2 italic"
                      >
                        I
                      </button>

                      <button
                        onClick={() =>
                          updateElementStyle(
                            selectedElement.id,
                            {
                              textDecoration:
                                selectedElement
                                  .style
                                  .textDecoration ===
                                "underline"
                                  ? "none"
                                  : "underline",
                            }
                          )
                        }
                        className="border rounded-lg p-2 underline"
                      >
                        U
                      </button>

                      <button
                        onClick={() => {
                          const current =
                            selectedElement
                              .style
                              .textAlign;

                          const next =
                            current ===
                            "left"
                              ? "center"
                              : current ===
                                "center"
                              ? "right"
                              : "left";

                          updateElementStyle(
                            selectedElement.id,
                            {
                              textAlign:
                                next,
                            }
                          );
                        }}
                        className="border rounded-lg p-2"
                      >
                        ≡
                      </button>

                    </div>


                    {/* COLORS */}

                    <div className="grid grid-cols-2 gap-3">

                      <label className="text-sm font-semibold">

                        Text Color

                        <input
                          type="color"
                          value={
                            selectedElement
                              .style
                              .color
                          }
                          onChange={(e) =>
                            updateElementStyle(
                              selectedElement.id,
                              {
                                color:
                                  e.target
                                    .value,
                              }
                            )
                          }
                          className="w-full h-10 mt-1"
                        />

                      </label>


                      <label className="text-sm font-semibold">

                        Background

                        <input
                          type="color"
                          value={
                            selectedElement
                              .style
                              .backgroundColor ===
                            "transparent"
                              ? "#ffffff"
                              : selectedElement
                                  .style
                                  .backgroundColor
                          }
                          onChange={(e) =>
                            updateElementStyle(
                              selectedElement.id,
                              {
                                backgroundColor:
                                  e.target
                                    .value,
                              }
                            )
                          }
                          className="w-full h-10 mt-1"
                        />

                      </label>

                    </div>


                    {/* LINE HEIGHT */}

                    <label className="text-sm font-semibold block">

                      Line Height

                      <input
                        type="range"
                        min="1"
                        max="2"
                        step="0.1"
                        value={
                          selectedElement
                            .style
                            .lineHeight
                        }
                        onChange={(e) =>
                          updateElementStyle(
                            selectedElement.id,
                            {
                              lineHeight:
                                Number(
                                  e.target
                                    .value
                                ),
                            }
                          )
                        }
                        className="w-full mt-2"
                      />

                    </label>


                    {/* LETTER SPACING */}

                    <label className="text-sm font-semibold block">

                      Letter Spacing

                      <input
                        type="range"
                        min="-2"
                        max="10"
                        step="0.5"
                        value={
                          selectedElement
                            .style
                            .letterSpacing
                        }
                        onChange={(e) =>
                          updateElementStyle(
                            selectedElement.id,
                            {
                              letterSpacing:
                                Number(
                                  e.target
                                    .value
                                ),
                            }
                          )
                        }
                        className="w-full mt-2"
                      />

                    </label>


                    {/* OPACITY */}

                    <label className="text-sm font-semibold block">

                      Opacity

                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={
                          selectedElement
                            .style
                            .opacity
                        }
                        onChange={(e) =>
                          updateElementStyle(
                            selectedElement.id,
                            {
                              opacity:
                                Number(
                                  e.target
                                    .value
                                ),
                            }
                          )
                        }
                        className="w-full mt-2"
                      />

                    </label>


                    {/* RADIUS */}

                    <label className="text-sm font-semibold block">

                      Border Radius

                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={
                          selectedElement
                            .style
                            .borderRadius
                        }
                        onChange={(e) =>
                          updateElementStyle(
                            selectedElement.id,
                            {
                              borderRadius:
                                Number(
                                  e.target
                                    .value
                                ),
                            }
                          )
                        }
                        className="w-full mt-2"
                      />

                    </label>


                    {/* SIZE */}

                    <div className="grid grid-cols-2 gap-3">

                      <label className="text-sm font-semibold">

                        Width

                        <input
                          type="number"
                          min="30"
                          max="1000"
                          value={
                            selectedElement.width
                          }
                          onChange={(e) =>
                            updateElement(
                              selectedElement.id,
                              {
                                width:
                                  Number(
                                    e.target
                                      .value
                                  ),
                              }
                            )
                          }
                          className="w-full border rounded-xl p-2 mt-1"
                        />

                      </label>


                      <label className="text-sm font-semibold">

                        Height

                        <input
                          type="number"
                          min="30"
                          max="800"
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
                          className="w-full border rounded-xl p-2 mt-1"
                        />

                      </label>

                    </div>

                  </div>
                )}


                {/* IMAGE EDIT */}

                {selectedElement.type ===
                  "image" && (
                  <div className="space-y-4 mt-4">

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {

                        const file =
                          e.target.files?.[0];

                        if (file) {
                          startCrop(
                            file,
                            {
                              type:
                                "element",
                              id:
                                selectedElement.id,
                            }
                          );
                        }

                      }}
                      className="w-full"
                    />


                    {selectedElement.image_url && (
                      <img
                        src={
                          selectedElement.image_url
                        }
                        alt=""
                        className="w-full h-44 object-cover rounded-xl"
                      />
                    )}


                    <div className="grid grid-cols-2 gap-3">

                      <label className="text-sm font-semibold">

                        Width

                        <input
                          type="number"
                          min="50"
                          max="1000"
                          value={
                            selectedElement.width
                          }
                          onChange={(e) =>
                            updateElement(
                              selectedElement.id,
                              {
                                width:
                                  Number(
                                    e.target
                                      .value
                                  ),
                              }
                            )
                          }
                          className="w-full border rounded-xl p-2 mt-1"
                        />

                      </label>


                      <label className="text-sm font-semibold">

                        Height

                        <input
                          type="number"
                          min="50"
                          max="800"
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
                          className="w-full border rounded-xl p-2 mt-1"
                        />

                      </label>

                    </div>


                    <label className="text-sm font-semibold block">

                      Image Fit

                      <select
                        value={
                          selectedElement.objectFit
                        }
                        onChange={(e) =>
                          updateElement(
                            selectedElement.id,
                            {
                              objectFit:
                                e.target
                                  .value as
                                  | "cover"
                                  | "contain"
                                  | "fill",
                            }
                          )
                        }
                        className="w-full border rounded-xl p-3 mt-1"
                      >

                        <option value="cover">
                          Crop / Cover
                        </option>

                        <option value="contain">
                          Fit / Contain
                        </option>

                        <option value="fill">
                          Fill
                        </option>

                      </select>

                    </label>

                  </div>
                )}

              </section>
            )}


            {/* HERO */}

            <section className="border rounded-2xl p-4">

              <h2 className="font-bold text-lg">
                🚜 Hero Section
              </h2>

              <div className="space-y-3 mt-4">

                <input
                  value={
                    content.hero.badge
                  }
                  onChange={(e) =>
                    updateHero(
                      "badge",
                      e.target.value
                    )
                  }
                  className="w-full border rounded-xl p-3"
                />

                <input
                  value={
                    content.hero.eyebrow
                  }
                  onChange={(e) =>
                    updateHero(
                      "eyebrow",
                      e.target.value
                    )
                  }
                  className="w-full border rounded-xl p-3"
                />

                <textarea
                  value={
                    content.hero.title
                  }
                  onChange={(e) =>
                    updateHero(
                      "title",
                      e.target.value
                    )
                  }
                  rows={3}
                  className="w-full border rounded-xl p-3"
                />

                <textarea
                  value={
                    content.hero.description
                  }
                  onChange={(e) =>
                    updateHero(
                      "description",
                      e.target.value
                    )
                  }
                  rows={4}
                  className="w-full border rounded-xl p-3"
                />

                <input
                  value={
                    content.hero.image_alt
                  }
                  onChange={(e) =>
                    updateHero(
                      "image_alt",
                      e.target.value
                    )
                  }
                  className="w-full border rounded-xl p-3"
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {

                    const file =
                      e.target.files?.[0];

                    if (file) {
                      startCrop(
                        file,
                        {
                          type:
                            "hero",
                        }
                      );
                    }

                  }}
                  className="w-full"
                />

                {content.hero.image_url && (
                  <img
                    src={
                      content.hero.image_url
                    }
                    alt={
                      content.hero.image_alt
                    }
                    className="w-full h-40 object-cover rounded-xl"
                  />
                )}

              </div>

            </section>


            {/* NEWS */}

            <section className="border rounded-2xl p-4">

              <h2 className="font-bold text-lg">
                📰 News Columns
              </h2>

              <div className="space-y-5 mt-4">

                {content.news.map(
                  (item, index) => (

                    <div
                      key={index}
                      className="border rounded-xl p-4"
                    >

                      <h3 className="font-bold mb-3">
                        News Column{" "}
                        {index + 1}
                      </h3>

                      <div className="space-y-3">

                        <input
                          value={
                            item.category
                          }
                          onChange={(e) =>
                            updateNews(
                              index,
                              "category",
                              e.target.value
                            )
                          }
                          className="w-full border rounded-xl p-3"
                        />

                        <input
                          value={
                            item.title
                          }
                          onChange={(e) =>
                            updateNews(
                              index,
                              "title",
                              e.target.value
                            )
                          }
                          className="w-full border rounded-xl p-3"
                        />

                        <textarea
                          value={
                            item.description
                          }
                          onChange={(e) =>
                            updateNews(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          rows={4}
                          className="w-full border rounded-xl p-3"
                        />

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {

                            const file =
                              e.target.files?.[0];

                            if (file) {
                              startCrop(
                                file,
                                {
                                  type:
                                    "news",
                                  index,
                                }
                              );
                            }

                          }}
                          className="w-full"
                        />

                        {item.image_url && (
                          <img
                            src={
                              item.image_url
                            }
                            alt={
                              item.title
                            }
                            className="w-full h-32 object-cover rounded-xl"
                          />
                        )}

                      </div>

                    </div>

                  )
                )}

              </div>

            </section>


            {/* PROCESS */}

            <section className="border rounded-2xl p-4">

              <h2 className="font-bold text-lg">
                📋 Membership Process
              </h2>

              <div className="space-y-3 mt-4">

                <input
                  value={
                    content.process.title
                  }
                  onChange={(e) =>
                    updateProcessMain(
                      "title",
                      e.target.value
                    )
                  }
                  className="w-full border rounded-xl p-3"
                />

                <textarea
                  value={
                    content.process
                      .description
                  }
                  onChange={(e) =>
                    updateProcessMain(
                      "description",
                      e.target.value
                    )
                  }
                  rows={3}
                  className="w-full border rounded-xl p-3"
                />

                {content.process.items.map(
                  (item, index) => (

                    <div
                      key={index}
                      className="border rounded-xl p-3"
                    >

                      <input
                        value={
                          item.number
                        }
                        onChange={(e) =>
                          updateProcess(
                            index,
                            "number",
                            e.target.value
                          )
                        }
                        className="w-full border rounded-xl p-3 mb-2"
                      />

                      <input
                        value={
                          item.title
                        }
                        onChange={(e) =>
                          updateProcess(
                            index,
                            "title",
                            e.target.value
                          )
                        }
                        className="w-full border rounded-xl p-3 mb-2"
                      />

                      <textarea
                        value={
                          item.description
                        }
                        onChange={(e) =>
                          updateProcess(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        rows={3}
                        className="w-full border rounded-xl p-3"
                      />

                    </div>

                  )
                )}

              </div>

            </section>


            {/* CTA */}

            <section className="border rounded-2xl p-4">

              <h2 className="font-bold text-lg">
                📢 Bottom CTA
              </h2>

              <div className="space-y-3 mt-4">

                <input
                  value={
                    content.cta.title
                  }
                  onChange={(e) =>
                    updateCta(
                      "title",
                      e.target.value
                    )
                  }
                  className="w-full border rounded-xl p-3"
                />

                <textarea
                  value={
                    content.cta.description
                  }
                  onChange={(e) =>
                    updateCta(
                      "description",
                      e.target.value
                    )
                  }
                  rows={3}
                  className="w-full border rounded-xl p-3"
                />

              </div>

            </section>


            {/* COLOR */}

            <section className="border rounded-2xl p-4">

              <label className="font-bold block mb-3">
                🎨 Theme Colour
              </label>

              <div className="flex gap-3">

                <input
                  type="color"
                  value={brand}
                  onChange={(e) =>
                    setBrand(
                      e.target.value
                    )
                  }
                  className="w-16 h-12"
                />

                <input
                  value={brand}
                  onChange={(e) =>
                    setBrand(
                      e.target.value
                    )
                  }
                  className="flex-1 border rounded-xl p-3"
                />

              </div>

            </section>

          </div>

        </aside>


        {/* PREVIEW */}

        <section className="h-full overflow-y-auto bg-slate-200">

          <div className="sticky top-0 z-30 bg-white border-b px-5 py-3 flex justify-between items-center">

            <div>
              <h2 className="font-bold">
                👁️ Live Preview
              </h2>

              <p className="text-xs text-slate-500">
                New Text / Image select ಮಾಡಿ drag ಮಾಡಿ.
              </p>
            </div>

            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
              LIVE
            </span>

          </div>


          <div className="p-6">

            <div
              ref={previewRef}
              onPointerDown={() =>
                setSelectedElementId(null)
              }
              className="relative mx-auto max-w-[1100px] min-h-[1200px] bg-white rounded-3xl shadow-xl overflow-hidden"
            >

              {/* HERO */}

              <section
                style={{
                  background:
                    `linear-gradient(135deg, ${brand}, #166534)`,
                }}
                className="text-white p-10 md:p-14"
              >

                <div className="grid md:grid-cols-2 gap-8 items-center">

                  <div>

                    <div className="inline-block bg-white/15 px-4 py-2 rounded-full text-sm font-semibold">
                      {
                        content.hero
                          .badge
                      }
                    </div>

                    <p className="text-sm mt-5 opacity-80">
                      {
                        content.hero
                          .eyebrow
                      }
                    </p>

                    <h1 className="text-4xl md:text-6xl font-extrabold mt-3">
                      {
                        content.hero
                          .title
                      }
                    </h1>

                    <p className="mt-5 text-lg whitespace-pre-line">
                      {
                        content.hero
                          .description
                      }
                    </p>

                  </div>

                  <div>

                    {content.hero
                      .image_url ? (
                      <img
                        src={
                          content.hero
                            .image_url
                        }
                        alt={
                          content.hero
                            .image_alt
                        }
                        className="w-full h-72 object-cover rounded-3xl"
                      />
                    ) : (
                      <div className="h-72 rounded-3xl bg-white/10 flex items-center justify-center text-7xl">
                        🚜🌾
                      </div>
                    )}

                  </div>

                </div>

              </section>


              {/* NEWS */}

              <section className="p-6 md:p-10 bg-[#f5f8f1]">

                <div className="text-center mb-8">

                  <p
                    style={{
                      color: brand,
                    }}
                    className="font-bold"
                  >
                    🌾 ರೈತ ಸುದ್ದಿ
                  </p>

                  <h2 className="text-3xl font-extrabold mt-2">
                    ರೈತರಿಗೆ ಉಪಯುಕ್ತ ಮಾಹಿತಿ ಮತ್ತು ಸುದ್ದಿ
                  </h2>

                </div>

                <div className="grid md:grid-cols-3 gap-5">

                  {content.news.map(
                    (item, index) => (

                      <div
                        key={index}
                        className="bg-white rounded-2xl overflow-hidden border shadow-sm"
                      >

                        {item.image_url ? (
                          <img
                            src={
                              item.image_url
                            }
                            alt={
                              item.title
                            }
                            className="w-full h-40 object-cover"
                          />
                        ) : (
                          <div className="w-full h-40 bg-green-100 flex items-center justify-center text-5xl">
                            🌾
                          </div>
                        )}

                        <div className="p-5">

                          <p
                            style={{
                              color: brand,
                            }}
                            className="text-sm font-bold"
                          >
                            {
                              item.category
                            }
                          </p>

                          <h3 className="font-extrabold text-xl mt-2">
                            {
                              item.title
                            }
                          </h3>

                          <p className="text-slate-600 mt-2 leading-6">
                            {
                              item.description
                            }
                          </p>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </section>


              {/* PROCESS */}

              <section className="p-6 md:p-10">

                <div className="text-center mb-8">

                  <h2 className="text-3xl font-extrabold">
                    {
                      content.process
                        .title
                    }
                  </h2>

                  <p className="text-slate-500 mt-2">
                    {
                      content.process
                        .description
                    }
                  </p>

                </div>

                <div className="grid md:grid-cols-3 gap-5">

                  {content.process.items.map(
                    (item, index) => (

                      <div
                        key={index}
                        className="border rounded-2xl p-6"
                      >

                        <div
                          style={{
                            color: brand,
                          }}
                          className="font-extrabold"
                        >
                          {
                            item.number
                          }
                        </div>

                        <h3 className="font-bold text-xl mt-3">
                          {
                            item.title
                          }
                        </h3>

                        <p className="text-slate-600 mt-2">
                          {
                            item.description
                          }
                        </p>

                      </div>

                    )
                  )}

                </div>

              </section>


              {/* CTA */}

              <section
                style={{
                  backgroundColor:
                    brand,
                }}
                className="p-10 text-center text-white"
              >

                <h2 className="text-3xl font-extrabold">
                  {
                    content.cta
                      .title
                  }
                </h2>

                <p className="mt-3">
                  {
                    content.cta
                      .description
                  }
                </p>

              </section>


              {/* DRAGGABLE NEW ELEMENTS */}

              {content.elements.map(
                (element) => {

                  const elementStyle: CSSProperties = {
                    position:
                      "absolute",

                    left:
                      element.x,

                    top:
                      element.y,

                    width:
                      element.width,

                    height:
                      element.height,

                    zIndex:
                      element.zIndex,

                    cursor:
                      "move",

                    touchAction:
                      "none",

                    userSelect:
                      "none",
                  };

                  return (
                    <div
                      key={
                        element.id
                      }
                      style={
                        elementStyle
                      }
                      onPointerDown={(
                        e
                      ) => {

                        e.stopPropagation();

                        setSelectedElementId(
                          element.id
                        );

                        moveElement(
                          element.id,
                          e
                        );

                      }}
                      className={`border-2 ${
                        selectedElementId ===
                        element.id
                          ? "border-green-500"
                          : "border-transparent hover:border-slate-300"
                      }`}
                    >

                      {element.type ===
                        "text" && (
                        <div
                          style={{
                            width:
                              "100%",

                            height:
                              "100%",

                            fontFamily:
                              element
                                .style
                                .fontFamily,

                            fontSize:
                              element
                                .style
                                .fontSize,

                            fontWeight:
                              element
                                .style
                                .fontWeight,

                            fontStyle:
                              element
                                .style
                                .fontStyle,

                            textDecoration:
                              element
                                .style
                                .textDecoration,

                            textAlign:
                              element
                                .style
                                .textAlign,

                            color:
                              element
                                .style
                                .color,

                            backgroundColor:
                              element
                                .style
                                .backgroundColor,

                            lineHeight:
                              element
                                .style
                                .lineHeight,

                            letterSpacing:
                              element
                                .style
                                .letterSpacing,

                            opacity:
                              element
                                .style
                                .opacity,

                            borderRadius:
                              element
                                .style
                                .borderRadius,

                            padding:
                              8,

                            overflow:
                              "hidden",

                            whiteSpace:
                              "pre-wrap",
                          }}
                        >
                          {
                            element.content
                          }
                        </div>
                      )}


                      {element.type ===
                        "image" && (
                        element.image_url ? (
                          <img
                            src={
                              element.image_url
                            }
                            alt=""
                            draggable={
                              false
                            }
                            style={{
                              width:
                                "100%",

                              height:
                                "100%",

                              objectFit:
                                element.objectFit,

                              pointerEvents:
                                "none",

                              borderRadius:
                                element
                                  .style
                                  .borderRadius,

                              opacity:
                                element
                                  .style
                                  .opacity,
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-5xl">
                            🖼️
                          </div>
                        )
                      )}

                    </div>
                  );
                }
              )}

            </div>

          </div>

        </section>

      </div>


      {/* CROP PREVIEW */}

      {cropSource && (
        <div className="fixed inset-0 z-[200] bg-black/75 flex items-center justify-center p-4">

          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-y-auto p-6">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-2xl font-bold">
                  🖼️ Image Crop Preview
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Crop ಮಾಡಿ ನಂತರ Upload ಮಾಡಿದರೆ image previewನಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.
                </p>

              </div>

              <button
                onClick={() => {
                  setCropSource(null);
                  setCropTarget(null);
                }}
                className="text-xl text-slate-500"
              >
                ✕
              </button>

            </div>


            {/* IMAGE PREVIEW */}

            <div className="mt-6 bg-slate-100 rounded-2xl p-5">

              <div className="relative mx-auto max-w-2xl aspect-[3/2] overflow-hidden rounded-2xl bg-black">

                <img
                  src={cropSource}
                  alt="Crop Preview"
                  style={{
                    position:
                      "absolute",

                    width:
                      `${cropZoom * 100}%`,

                    height:
                      `${cropZoom * 100}%`,

                    maxWidth:
                      "none",

                    left:
                      `${50 - cropX * 0.5}%`,

                    top:
                      `${50 - cropY * 0.5}%`,

                    transform:
                      "translate(-50%, -50%)",

                    objectFit:
                      "cover",
                  }}
                  className="select-none"
                />

                <div className="absolute inset-0 border-4 border-white/80 rounded-2xl pointer-events-none" />

              </div>

            </div>


            {/* CROP CONTROLS */}

            <div className="grid md:grid-cols-3 gap-5 mt-6">

              <label className="text-sm font-semibold">

                Horizontal Position

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cropX}
                  onChange={(e) =>
                    setCropX(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="w-full mt-2"
                />

              </label>


              <label className="text-sm font-semibold">

                Vertical Position

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cropY}
                  onChange={(e) =>
                    setCropY(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="w-full mt-2"
                />

              </label>


              <label className="text-sm font-semibold">

                Zoom

                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={cropZoom}
                  onChange={(e) =>
                    setCropZoom(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="w-full mt-2"
                />

              </label>

            </div>


            {/* ACTIONS */}

            <div className="flex justify-end gap-3 mt-7">

              <button
                onClick={() => {
                  setCropSource(null);
                  setCropTarget(null);
                }}
                className="px-5 py-3 rounded-xl border font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={
                  cropAndUpload
                }
                disabled={
                  cropBusy
                }
                className="px-6 py-3 rounded-xl bg-green-600 text-white font-bold disabled:opacity-50"
              >
                {cropBusy
                  ? "Uploading..."
                  : "✂️ Crop & Upload"}
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}
