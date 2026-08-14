"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Editor() {
  const router = useRouter();

  const [hero, setHero] = useState(
    "ನಮ್ಮ ಸಂಘಟನೆಗೆ ಸದಸ್ಯರಾಗಿ"
  );

  const [sub, setSub] = useState(
    "ಸದಸ್ಯತ್ವ ನೋಂದಣಿ ಮಾಡಿ ಮತ್ತು PVC ID Card ಪಡೆಯಿರಿ"
  );

  const [brand, setBrand] = useState("#16a34a");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  /*
   * ADMIN CHECK + LOAD SETTINGS
   */
  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/admin/login");
        return;
      }

      const { data: settings, error } =
        await supabase
          .from("site_settings")
          .select(
            "id, hero_text, sub_text, brand_color"
          )
          .eq("id", 1)
          .maybeSingle();

      if (error) {
        console.error(error);
      }

      if (settings) {
        setHero(
          settings.hero_text ||
            "ನಮ್ಮ ಸಂಘಟನೆಗೆ ಸದಸ್ಯರಾಗಿ"
        );

        setSub(
          settings.sub_text ||
            "ಸದಸ್ಯತ್ವ ನೋಂದಣಿ ಮಾಡಿ ಮತ್ತು PVC ID Card ಪಡೆಯಿರಿ"
        );

        setBrand(
          settings.brand_color ||
            "#16a34a"
        );
      }

      setLoading(false);
    }

    loadSettings();
  }, [router]);

  /*
   * SAVE
   */
  async function save() {
    setSaving(true);
    setMessage("");

    const { error } =
      await supabase
        .from("site_settings")
        .upsert({
          id: 1,
          hero_text: hero,
          sub_text: sub,
          brand_color: brand,
        });

    if (error) {
      console.error(error);

      setMessage(
        "❌ Save ಆಗಲಿಲ್ಲ: " +
          error.message
      );
    } else {
      setMessage(
        "✅ Website settings saved successfully!"
      );
    }

    setSaving(false);
  }

  /*
   * RESET
   */
  function reset() {
    setHero(
      "ನಮ್ಮ ಸಂಘಟನೆಗೆ ಸದಸ್ಯರಾಗಿ"
    );

    setSub(
      "ಸದಸ್ಯತ್ವ ನೋಂದಣಿ ಮಾಡಿ ಮತ್ತು PVC ID Card ಪಡೆಯಿರಿ"
    );

    setBrand("#16a34a");

    setMessage(
      "Reset preview ಮಾತ್ರ ಮಾಡಲಾಗಿದೆ. Save ಒತ್ತಿದ ನಂತರ website update ಆಗುತ್ತದೆ."
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

      {/* HEADER */}

      <header className="bg-slate-950 text-white">

        <div className="max-w-7xl mx-auto px-5 py-5 flex flex-wrap gap-4 justify-between items-center">

          <div>
            <h1 className="text-2xl font-bold">
              Visual Website Editor
            </h1>

            <p className="text-sm text-slate-400 mt-1">
              Website Content Management
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

        {/* MESSAGE */}

        {message && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-5 font-semibold">
            {message}
          </div>
        )}

        <div className="grid xl:grid-cols-3 gap-6">

          {/* ================= EDIT PANEL ================= */}

          <section className="bg-white rounded-3xl shadow-sm p-6">

            <div className="mb-6">

              <h2 className="text-xl font-bold">
                ✏️ Edit Website
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Kannada ಅಥವಾ Englishನಲ್ಲಿ content edit ಮಾಡಿ.
              </p>

            </div>

            <div className="space-y-6">

              {/* HERO */}

              <div>

                <label className="block font-semibold mb-2">
                  Hero Heading / ಮುಖ್ಯ ಶೀರ್ಷಿಕೆ
                </label>

                <input
                  value={hero}
                  onChange={(e) =>
                    setHero(e.target.value)
                  }
                  className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="ನಿಮ್ಮ heading ಇಲ್ಲಿ..."
                />

                <p className="text-xs text-slate-400 mt-2">
                  Example: ನಮ್ಮ ಸಂಘಟನೆಗೆ ಸದಸ್ಯರಾಗಿ
                </p>

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="block font-semibold mb-2">
                  Description / ವಿವರಣೆ
                </label>

                <textarea
                  value={sub}
                  onChange={(e) =>
                    setSub(e.target.value)
                  }
                  rows={6}
                  className="w-full border rounded-xl p-3 resize-none outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Website description..."
                />

              </div>

              {/* COLOR */}

              <div>

                <label className="block font-semibold mb-2">
                  Theme Colour / ಬಣ್ಣ
                </label>

                <div className="flex gap-3 items-center">

                  <input
                    type="color"
                    value={brand}
                    onChange={(e) =>
                      setBrand(e.target.value)
                    }
                    className="w-16 h-12 rounded-lg cursor-pointer border"
                  />

                  <input
                    value={brand}
                    onChange={(e) =>
                      setBrand(e.target.value)
                    }
                    className="flex-1 border rounded-xl p-3 uppercase"
                    placeholder="#16a34a"
                  />

                </div>

              </div>

              {/* QUICK COLORS */}

              <div>

                <label className="block font-semibold mb-2">
                  Quick Theme
                </label>

                <div className="grid grid-cols-5 gap-2">

                  {[
                    "#16a34a",
                    "#2563eb",
                    "#7c3aed",
                    "#db2777",
                    "#ea580c",
                  ].map((color) => (

                    <button
                      key={color}
                      onClick={() =>
                        setBrand(color)
                      }
                      className="h-10 rounded-lg border-2 border-white ring-1 ring-slate-200"
                      style={{
                        backgroundColor:
                          color,
                      }}
                      aria-label={
                        `Theme ${color}`
                      }
                    />

                  ))}

                </div>

              </div>

            </div>

          </section>

          {/* ================= LIVE PREVIEW ================= */}

          <section className="xl:col-span-2 bg-white rounded-3xl shadow-sm p-6">

            <div className="flex justify-between items-center mb-5">

              <div>

                <h2 className="text-xl font-bold">
                  👁️ Live Website Preview
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  ನೀವು edit ಮಾಡುವಾಗ preview ಕೂಡಲೇ ಬದಲಾಗುತ್ತದೆ.
                </p>

              </div>

              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                LIVE PREVIEW
              </span>

            </div>

            {/* WEBSITE PREVIEW */}

            <div className="border rounded-3xl overflow-hidden bg-white">

              {/* NAVBAR */}

              <div className="px-6 py-4 flex justify-between items-center border-b">

                <div className="font-bold text-lg">
                  ನಮ್ಮ ಸಂಸ್ಥೆ
                </div>

                <div className="hidden md:flex gap-5 text-sm text-slate-600">
                  <span>Home</span>
                  <span>About</span>
                  <span>Membership</span>
                  <span>Contact</span>
                </div>

              </div>

              {/* HERO */}

              <div
                style={{
                  backgroundColor: brand,
                }}
                className="text-white p-8 md:p-14"
              >

                <div className="max-w-3xl">

                  <div className="text-sm font-semibold opacity-80">
                    ORGANIZATION MEMBERSHIP
                  </div>

                  <h1 className="text-3xl md:text-5xl font-extrabold mt-4 leading-tight">
                    {hero ||
                      "ನಮ್ಮ ಸಂಘಟನೆಗೆ ಸದಸ್ಯರಾಗಿ"}
                  </h1>

                  <p className="text-base md:text-xl mt-5 opacity-95 whitespace-pre-line">
                    {sub ||
                      "ಸದಸ್ಯತ್ವ ನೋಂದಣಿ ಮಾಡಿ ಮತ್ತು PVC ID Card ಪಡೆಯಿರಿ"}
                  </p>

                  <button className="bg-white text-slate-900 font-bold px-6 py-3 rounded-xl mt-7 shadow">
                    ಸದಸ್ಯತ್ವ ನೋಂದಣಿ
                  </button>

                </div>

              </div>

              {/* CONTENT CARDS */}

              <div className="p-6 md:p-10">

                <div className="grid md:grid-cols-3 gap-4">

                  <div className="border rounded-2xl p-5">

                    <div className="text-2xl">
                      📝
                    </div>

                    <h3 className="font-bold mt-3">
                      Online Registration
                    </h3>

                    <p className="text-sm text-slate-500 mt-2">
                      Onlineನಲ್ಲಿ membership application ಸಲ್ಲಿಸಿ.
                    </p>

                  </div>

                  <div className="border rounded-2xl p-5">

                    <div className="text-2xl">
                      🪪
                    </div>

                    <h3 className="font-bold mt-3">
                      PVC ID Card
                    </h3>

                    <p className="text-sm text-slate-500 mt-2">
                      Approval ನಂತರ PVC membership card ಪಡೆಯಿರಿ.
                    </p>

                  </div>

                  <div className="border rounded-2xl p-5">

                    <div className="text-2xl">
                      📱
                    </div>

                    <h3 className="font-bold mt-3">
                      Public Member Page
                    </h3>

                    <p className="text-sm text-slate-500 mt-2">
                      QR scan ಮೂಲಕ member public page ತೆರೆಯಿರಿ.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </section>

        </div>

        {/* INFORMATION */}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-5">

          <h3 className="font-bold text-blue-800">
            Website Editor
          </h3>

          <p className="text-sm text-blue-700 mt-1">
            ಈಗ Hero heading, description ಮತ್ತು global theme
            colour databaseನಲ್ಲಿ save ಆಗುತ್ತವೆ. ನಂತರ website
            ಇನ್ನಷ್ಟು sections add ಮಾಡಬಹುದು.
          </p>

        </div>

      </div>

    </main>
  );
}
