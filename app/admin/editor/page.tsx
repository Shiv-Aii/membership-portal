"use client";

import { useEffect, useState } from "react";
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
};

const defaultContent: PageContent = {
  hero: {
    badge: "🚜 ರೈತರು • ಕೃಷಿ • ಸಂಘಟನೆ",
    eyebrow: "Organization Membership Portal",
    title: "ನಮ್ಮ ಸಂಘಟನೆಗೆ ಸದಸ್ಯರಾಗಿ",
    description: "ಸದಸ್ಯತ್ವ ನೋಂದಣಿ ಮಾಡಿ ಮತ್ತು PVC ID Card ಪಡೆಯಿರಿ",
    image_url: "",
    image_alt: "ರೈತರು ಕೃಷಿ ಕೆಲಸ ಮಾಡುತ್ತಿರುವ ದೃಶ್ಯ",
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
};

export default function Editor() {
  const router = useRouter();

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
          setContent({
            ...defaultContent,
            ...settings.page_content,
            hero: {
              ...defaultContent.hero,
              ...settings.page_content.hero,
            },
            news:
              settings.page_content.news ||
              defaultContent.news,
            process: {
              ...defaultContent.process,
              ...settings.page_content.process,
              items:
                settings.page_content.process?.items ||
                defaultContent.process.items,
            },
            cta: {
              ...defaultContent.cta,
              ...settings.page_content.cta,
            },
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
      const items = [...prev.process.items];

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

  async function uploadImage(
    file: File,
    target:
      | {
          type: "hero";
        }
      | {
          type: "news";
          index: number;
        }
  ) {
    if (!file) return;

    setMessage("Image uploading...");

    const extension =
      file.name.split(".").pop() ||
      "jpg";

    const filename =
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${extension}`;

    const path =
      `main-page/${filename}`;

    const { error } =
      await supabase.storage
        .from("site-images")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

    if (error) {
      console.error(error);

      setMessage(
        "❌ Image upload ಆಗಲಿಲ್ಲ: " +
          error.message
      );

      return;
    }

    const { data } =
      supabase.storage
        .from("site-images")
        .getPublicUrl(path);

    if (target.type === "hero") {
      updateHero(
        "image_url",
        data.publicUrl
      );
    }

    if (target.type === "news") {
      updateNews(
        target.index,
        "image_url",
        data.publicUrl
      );
    }

    setMessage("✅ Image uploaded.");
  }

  async function save() {
    setSaving(true);
    setMessage("");

    const { error } =
      await supabase
        .from("site_settings")
        .upsert({
          id: 1,

          /*
           * Existing fields are also kept
           * synchronized.
           */
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
    setContent(defaultContent);
    setBrand("#16a34a");

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

  return (
    <main className="min-h-screen bg-slate-100">

      <header className="bg-slate-950 text-white sticky top-0 z-50">

        <div className="max-w-7xl mx-auto px-5 py-5 flex flex-wrap gap-4 justify-between items-center">

          <div>
            <h1 className="text-2xl font-bold">
              Visual Website Editor
            </h1>

            <p className="text-sm text-slate-400 mt-1">
              Main Page ಸಂಪೂರ್ಣ Content Editor
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

      <div className="max-w-7xl mx-auto p-5">

        {message && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-5 font-semibold">
            {message}
          </div>
        )}

        <div className="grid xl:grid-cols-2 gap-6">

          {/* HERO EDITOR */}

          <section className="bg-white rounded-3xl shadow-sm p-6">

            <h2 className="text-xl font-bold">
              🚜 Hero Section
            </h2>

            <div className="space-y-4 mt-5">

              <input
                value={content.hero.badge}
                onChange={(e) =>
                  updateHero(
                    "badge",
                    e.target.value
                  )
                }
                className="w-full border rounded-xl p-3"
                placeholder="Badge"
              />

              <input
                value={content.hero.eyebrow}
                onChange={(e) =>
                  updateHero(
                    "eyebrow",
                    e.target.value
                  )
                }
                className="w-full border rounded-xl p-3"
                placeholder="Eyebrow"
              />

              <textarea
                value={content.hero.title}
                onChange={(e) =>
                  updateHero(
                    "title",
                    e.target.value
                  )
                }
                rows={3}
                className="w-full border rounded-xl p-3"
                placeholder="Hero heading"
              />

              <textarea
                value={content.hero.description}
                onChange={(e) =>
                  updateHero(
                    "description",
                    e.target.value
                  )
                }
                rows={4}
                className="w-full border rounded-xl p-3"
                placeholder="Hero description"
              />

              <input
                value={content.hero.image_alt}
                onChange={(e) =>
                  updateHero(
                    "image_alt",
                    e.target.value
                  )
                }
                className="w-full border rounded-xl p-3"
                placeholder="Image alt text"
              />

              <div className="border rounded-2xl p-4">

                <label className="font-bold block mb-3">
                  Hero Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file =
                      e.target.files?.[0];

                    if (file) {
                      uploadImage(file, {
                        type: "hero",
                      });
                    }
                  }}
                  className="w-full"
                />

                {content.hero.image_url && (
                  <img
                    src={content.hero.image_url}
                    alt={content.hero.image_alt}
                    className="mt-4 w-full h-48 object-cover rounded-xl"
                  />
                )}

              </div>

              <div>

                <label className="font-semibold block mb-2">
                  Theme Colour
                </label>

                <div className="flex gap-3">

                  <input
                    type="color"
                    value={brand}
                    onChange={(e) =>
                      setBrand(e.target.value)
                    }
                    className="w-16 h-12"
                  />

                  <input
                    value={brand}
                    onChange={(e) =>
                      setBrand(e.target.value)
                    }
                    className="flex-1 border rounded-xl p-3"
                  />

                </div>

              </div>

            </div>

          </section>


          {/* NEWS EDITOR */}

          <section className="bg-white rounded-3xl shadow-sm p-6">

            <h2 className="text-xl font-bold">
              📰 News Columns
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              ಮೂರು News columnsನ content ಮತ್ತು images edit ಮಾಡಿ.
            </p>

            <div className="space-y-6 mt-5">

              {content.news.map(
                (item, index) => (

                  <div
                    key={index}
                    className="border rounded-2xl p-5"
                  >

                    <div className="flex justify-between items-center mb-4">

                      <h3 className="font-bold">
                        News Column {index + 1}
                      </h3>

                    </div>

                    <div className="space-y-3">

                      <input
                        value={item.category}
                        onChange={(e) =>
                          updateNews(
                            index,
                            "category",
                            e.target.value
                          )
                        }
                        className="w-full border rounded-xl p-3"
                        placeholder="Category"
                      />

                      <input
                        value={item.title}
                        onChange={(e) =>
                          updateNews(
                            index,
                            "title",
                            e.target.value
                          )
                        }
                        className="w-full border rounded-xl p-3"
                        placeholder="News title"
                      />

                      <textarea
                        value={item.description}
                        onChange={(e) =>
                          updateNews(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        rows={4}
                        className="w-full border rounded-xl p-3"
                        placeholder="News description"
                      />

                      <input
                        value={item.image_url}
                        onChange={(e) =>
                          updateNews(
                            index,
                            "image_url",
                            e.target.value
                          )
                        }
                        className="w-full border rounded-xl p-3"
                        placeholder="Image URL"
                      />

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file =
                            e.target.files?.[0];

                          if (file) {
                            uploadImage(file, {
                              type: "news",
                              index,
                            });
                          }
                        }}
                        className="w-full"
                      />

                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-40 object-cover rounded-xl"
                        />
                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          </section>


          {/* PROCESS EDITOR */}

          <section className="bg-white rounded-3xl shadow-sm p-6">

            <h2 className="text-xl font-bold">
              📋 Membership Process
            </h2>

            <div className="space-y-4 mt-5">

              <input
                value={content.process.title}
                onChange={(e) =>
                  updateProcessMain(
                    "title",
                    e.target.value
                  )
                }
                className="w-full border rounded-xl p-3"
                placeholder="Process title"
              />

              <textarea
                value={content.process.description}
                onChange={(e) =>
                  updateProcessMain(
                    "description",
                    e.target.value
                  )
                }
                rows={3}
                className="w-full border rounded-xl p-3"
                placeholder="Process description"
              />

              {content.process.items.map(
                (item, index) => (

                  <div
                    key={index}
                    className="border rounded-2xl p-4"
                  >

                    <h3 className="font-bold mb-3">
                      Step {index + 1}
                    </h3>

                    <input
                      value={item.number}
                      onChange={(e) =>
                        updateProcess(
                          index,
                          "number",
                          e.target.value
                        )
                      }
                      className="w-full border rounded-xl p-3 mb-3"
                      placeholder="Number"
                    />

                    <input
                      value={item.title}
                      onChange={(e) =>
                        updateProcess(
                          index,
                          "title",
                          e.target.value
                        )
                      }
                      className="w-full border rounded-xl p-3 mb-3"
                      placeholder="Title"
                    />

                    <textarea
                      value={item.description}
                      onChange={(e) =>
                        updateProcess(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      rows={3}
                      className="w-full border rounded-xl p-3"
                      placeholder="Description"
                    />

                  </div>

                )
              )}

            </div>

          </section>


          {/* CTA EDITOR */}

          <section className="bg-white rounded-3xl shadow-sm p-6">

            <h2 className="text-xl font-bold">
              📢 Bottom CTA
            </h2>

            <div className="space-y-4 mt-5">

              <input
                value={content.cta.title}
                onChange={(e) =>
                  updateCta(
                    "title",
                    e.target.value
                  )
                }
                className="w-full border rounded-xl p-3"
                placeholder="CTA title"
              />

              <textarea
                value={content.cta.description}
                onChange={(e) =>
                  updateCta(
                    "description",
                    e.target.value
                  )
                }
                rows={4}
                className="w-full border rounded-xl p-3"
                placeholder="CTA description"
              />

            </div>

          </section>

        </div>


        {/* LIVE PREVIEW */}

        <section className="bg-white rounded-3xl shadow-sm p-6 mt-6">

          <div className="flex justify-between items-center mb-5">

            <div>
              <h2 className="text-xl font-bold">
                👁️ Live Website Preview
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Edit ಮಾಡಿದ ತಕ್ಷಣ preview ಬದಲಾಗುತ್ತದೆ.
              </p>
            </div>

            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
              LIVE PREVIEW
            </span>

          </div>


          <div className="border rounded-3xl overflow-hidden">

            {/* HERO */}

            <div
              style={{
                background:
                  `linear-gradient(135deg, ${brand}, #166534)`,
              }}
              className="text-white p-8 md:p-14"
            >

              <div className="grid md:grid-cols-2 gap-8 items-center">

                <div>

                  <div className="inline-block bg-white/15 px-4 py-2 rounded-full text-sm font-semibold">
                    {content.hero.badge}
                  </div>

                  <p className="text-sm mt-5 opacity-80">
                    {content.hero.eyebrow}
                  </p>

                  <h1 className="text-3xl md:text-5xl font-extrabold mt-3">
                    {content.hero.title}
                  </h1>

                  <p className="mt-4 text-lg whitespace-pre-line">
                    {content.hero.description}
                  </p>

                  <button className="bg-white text-slate-900 font-bold px-6 py-3 rounded-xl mt-6">
                    ಸದಸ್ಯತ್ವ ನೋಂದಣಿ →
                  </button>

                </div>

                <div>

                  {content.hero.image_url ? (
                    <img
                      src={content.hero.image_url}
                      alt={content.hero.image_alt}
                      className="w-full h-64 object-cover rounded-3xl"
                    />
                  ) : (
                    <div className="h-64 rounded-3xl bg-white/10 flex items-center justify-center text-7xl">
                      🚜🌾
                    </div>
                  )}

                </div>

              </div>

            </div>


            {/* NEWS */}

            <div className="p-6 md:p-10 bg-[#f5f8f1]">

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
                          src={item.image_url}
                          alt={item.title}
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
                          {item.category}
                        </p>

                        <h3 className="font-extrabold text-xl mt-2">
                          {item.title}
                        </h3>

                        <p className="text-slate-600 mt-2 leading-6">
                          {item.description}
                        </p>

                        <button
                          style={{
                            color: brand,
                          }}
                          className="mt-4 font-bold"
                        >
                          ಇನ್ನಷ್ಟು ಓದಿ →
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>


            {/* PROCESS */}

            <div className="p-6 md:p-10">

              <div className="text-center mb-8">

                <h2 className="text-3xl font-extrabold">
                  {content.process.title}
                </h2>

                <p className="text-slate-500 mt-2">
                  {content.process.description}
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
                        className="font-extrabold text-lg"
                      >
                        {item.number}
                      </div>

                      <h3 className="font-bold text-xl mt-3">
                        {item.title}
                      </h3>

                      <p className="text-slate-600 mt-2">
                        {item.description}
                      </p>

                    </div>

                  )
                )}

              </div>

            </div>


            {/* CTA */}

            <div
              style={{
                backgroundColor: brand,
              }}
              className="p-10 text-center text-white"
            >

              <h2 className="text-3xl font-extrabold">
                {content.cta.title}
              </h2>

              <p className="mt-3">
                {content.cta.description}
              </p>

              <button className="bg-white text-slate-900 font-bold px-7 py-3 rounded-xl mt-6">
                Register Now →
              </button>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}
