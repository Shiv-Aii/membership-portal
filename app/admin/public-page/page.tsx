```tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type PageData = {
  title: string | null;
  description: string | null;

  logo_url: string | null;
  image_url: string | null;
  cover_image_url: string | null;

  image_2_url: string | null;
  image_3_url: string | null;
  image_4_url: string | null;

  section_title_1: string | null;
  section_text_1: string | null;

  section_title_2: string | null;
  section_text_2: string | null;

  section_title_3: string | null;
  section_text_3: string | null;

  phone: string | null;
  address: string | null;
  website: string | null;

  is_active: boolean;
};

function PublicFarmerPage() {
  const searchParams = useSearchParams();
  const memberId = searchParams.get("id");

  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadPage() {
      if (!memberId) {
        setErrorMessage("Public Page ID ಸಿಗಲಿಲ್ಲ.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("member_info_page")
        .select(`
          title,
          description,
          logo_url,
          image_url,
          cover_image_url,
          image_2_url,
          image_3_url,
          image_4_url,
          section_title_1,
          section_text_1,
          section_title_2,
          section_text_2,
          section_title_3,
          section_text_3,
          phone,
          address,
          website,
          is_active
        `)
        .eq("member_id", memberId)
        .maybeSingle();

      if (error) {
        console.error(error);
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setErrorMessage("ಈ Public Page ಇನ್ನೂ ರಚಿಸಲಾಗಿಲ್ಲ.");
        setLoading(false);
        return;
      }

      if (!data.is_active) {
        setErrorMessage(
          "ಈ Public Page ಪ್ರಸ್ತುತ ಪ್ರಕಟವಾಗಿಲ್ಲ."
        );
        setLoading(false);
        return;
      }

      setPage(data);
      setLoading(false);
    }

    loadPage();
  }, [memberId]);

  function shareWhatsApp() {
    const url = window.location.href;

    const message =
      "🌾 ರೈತರಿಗೆ ಉಪಯುಕ್ತ ಕೃಷಿ ಮಾಹಿತಿ\n\n" +
      "ಕೃಷಿ ಮಾಹಿತಿ, ಸಲಹೆಗಳು ಮತ್ತು ಉಪಯುಕ್ತ ಮಾಹಿತಿಗಾಗಿ ಈ page ನೋಡಿ:\n\n" +
      url;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function sharePage() {
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title:
          page?.title ||
          "ರೈತರಿಗಾಗಿ ಕೃಷಿ ಮಾಹಿತಿ",
        text:
          "🌾 ರೈತರಿಗೆ ಉಪಯುಕ್ತ ಕೃಷಿ ಮಾಹಿತಿ",
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Page link copied.");
    }
  }

  function websiteUrl(url: string) {
    if (
      url.startsWith("http://") ||
      url.startsWith("https://")
    ) {
      return url;
    }

    return `https://${url}`;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#eef7e8] flex items-center justify-center px-5">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">🌾</div>

          <h1 className="text-xl font-black text-green-900">
            ಕೃಷಿ ಮಾಹಿತಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ...
          </h1>

          <p className="text-gray-500 mt-2">
            Please wait...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage || !page) {
    return (
      <main className="min-h-screen bg-[#eef7e8] flex items-center justify-center px-5">

        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">

          <div className="text-6xl mb-5">
            🌾
          </div>

          <h1 className="text-2xl font-black text-green-900">
            ಕೃಷಿ ಮಾಹಿತಿ ಕೇಂದ್ರ
          </h1>

          <p className="text-red-600 font-semibold mt-4">
            {errorMessage ||
              "Page ಸಿಗಲಿಲ್ಲ."}
          </p>

          <p className="text-gray-500 text-sm mt-3">
            Please check the Public Page link.
          </p>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#edf6e7]">

      {/* ================= TOP BAR ================= */}

      <div className="bg-green-950 text-white">

        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">

          <div className="flex items-center gap-2">

            <span className="text-2xl">
              🌾
            </span>

            <div>
              <div className="font-black text-sm md:text-base">
                ರೈತರ ಮಾಹಿತಿ ಕೇಂದ್ರ
              </div>

              <div className="text-[11px] text-green-300">
                FARMER INFORMATION
              </div>
            </div>

          </div>

          <button
            onClick={sharePage}
            className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl text-sm font-bold"
          >
            📤 Share
          </button>

        </div>

      </div>

      {/* ================= MAIN WEBSITE ================= */}

      <div className="max-w-5xl mx-auto px-3 md:px-5 py-5 md:py-8">

        <div className="bg-white rounded-[30px] overflow-hidden shadow-2xl">

          {/* ================= HERO ================= */}

          <section
            className="relative min-h-[390px] md:min-h-[470px] bg-green-950 bg-cover bg-center"
            style={
              page.cover_image_url
                ? {
                    backgroundImage: `
                      linear-gradient(
                        rgba(0,55,20,.58),
                        rgba(0,35,15,.82)
                      ),
                      url(${page.cover_image_url})
                    `,
                  }
                : undefined
            }
          >

            {/* FALLBACK AGRICULTURE DESIGN */}

            {!page.cover_image_url && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-green-950 via-green-800 to-green-500" />

                <div className="absolute -left-10 bottom-0 text-[130px] md:text-[180px] opacity-20">
                  🌾
                </div>

                <div className="absolute right-0 bottom-0 text-[130px] md:text-[180px] opacity-20">
                  🚜
                </div>
              </>
            )}

            {/* HERO CONTENT */}

            <div className="relative z-10 min-h-[390px] md:min-h-[470px] flex flex-col items-center justify-center text-center px-5 py-10 text-white">

              {/* LOGO */}

              {page.logo_url ? (
                <img
                  src={page.logo_url}
                  alt="Agriculture Logo"
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-2xl bg-white"
                />
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white flex items-center justify-center text-6xl md:text-7xl shadow-2xl">
                  🌾
                </div>
              )}

              <div className="mt-5 text-sm md:text-base font-bold tracking-wider text-green-200">
                🌱 FARMER INFORMATION CENTER 🌱
              </div>

              <h1 className="mt-3 max-w-4xl text-3xl md:text-5xl font-black leading-tight drop-shadow-lg">
                {page.title ||
                  "ರೈತರಿಗಾಗಿ ಕೃಷಿ ಮಾಹಿತಿ ಕೇಂದ್ರ"}
              </h1>

              <div className="flex items-center gap-3 mt-6 text-4xl">
                🌾 🚜 🌱
              </div>

            </div>

          </section>

          {/* ================= INTRODUCTION ================= */}

          {page.description && (
            <section className="px-5 md:px-8 py-7">

              <div className="rounded-3xl bg-green-50 border border-green-200 p-5 md:p-7">

                <div className="flex items-center gap-3">

                  <div className="w-12 h-12 rounded-2xl bg-green-700 text-white flex items-center justify-center text-2xl">
                    📢
                  </div>

                  <div>
                    <div className="text-xs font-bold text-green-600">
                      IMPORTANT INFORMATION
                    </div>

                    <h2 className="text-xl md:text-2xl font-black text-green-950">
                      ರೈತರಿಗೆ ಪ್ರಮುಖ ಮಾಹಿತಿ
                    </h2>
                  </div>

                </div>

                <p className="mt-5 text-gray-700 leading-8 text-[16px] md:text-lg whitespace-pre-line">
                  {page.description}
                </p>

              </div>

            </section>
          )}

          {/* ================= MAIN IMAGE ================= */}

          {page.image_url && (
            <section className="px-5 md:px-8 pb-7">

              <img
                src={page.image_url}
                alt="Farmer Agriculture"
                className="w-full max-h-[500px] object-cover rounded-3xl shadow-lg"
              />

            </section>
          )}

          {/* ================= SECTION 1 ================= */}

          {(page.section_title_1 ||
            page.section_text_1) && (

            <section className="px-5 md:px-8 pb-7">

              <div className="overflow-hidden rounded-3xl border border-green-200 shadow-sm">

                <div className="bg-gradient-to-r from-green-800 to-green-600 text-white p-5 md:p-6">

                  <div className="text-sm text-green-200 font-bold">
                    FARMING INFORMATION
                  </div>

                  <h2 className="text-2xl md:text-3xl font-black mt-1">
                    {page.section_title_1 ||
                      "🌱 ರೈತರಿಗೆ ಉಪಯುಕ್ತ ಮಾಹಿತಿ"}
                  </h2>

                </div>

                {page.section_text_1 && (
                  <div className="p-5 md:p-7 bg-white">

                    <p className="text-gray-700 leading-8 text-[16px] md:text-lg whitespace-pre-line">
                      {page.section_text_1}
                    </p>

                  </div>
                )}

              </div>

            </section>
          )}

          {/* ================= IMAGE 2 ================= */}

          {page.image_2_url && (
            <section className="px-5 md:px-8 pb-7">

              <img
                src={page.image_2_url}
                alt="Agriculture Information"
                className="w-full max-h-[450px] object-cover rounded-3xl shadow-md"
              />

            </section>
          )}

          {/* ================= SECTION 2 ================= */}

          {(page.section_title_2 ||
            page.section_text_2) && (

            <section className="px-5 md:px-8 pb-7">

              <div className="overflow-hidden rounded-3xl border border-orange-200 shadow-sm">

                <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white p-5 md:p-6">

                  <div className="text-sm text-orange-100 font-bold">
                    AGRICULTURE & MACHINERY
                  </div>

                  <h2 className="text-2xl md:text-3xl font-black mt-1">
                    {page.section_title_2 ||
                      "🚜 ಕೃಷಿ ಮತ್ತು ಯಂತ್ರೋಪಕರಣ ಮಾಹಿತಿ"}
                  </h2>

                </div>

                {page.section_text_2 && (
                  <div className="p-5 md:p-7 bg-white">

                    <p className="text-gray-700 leading-8 text-[16px] md:text-lg whitespace-pre-line">
                      {page.section_text_2}
                    </p>

                  </div>
                )}

              </div>

            </section>
          )}

          {/* ================= IMAGE 3 ================= */}

          {page.image_3_url && (
            <section className="px-5 md:px-8 pb-7">

              <img
                src={page.image_3_url}
                alt="Farmer"
                className="w-full max-h-[450px] object-cover rounded-3xl shadow-md"
              />

            </section>
          )}

          {/* ================= SECTION 3 ================= */}

          {(page.section_title_3 ||
            page.section_text_3) && (

            <section className="px-5 md:px-8 pb-7">

              <div className="overflow-hidden rounded-3xl border border-blue-200 shadow-sm">

                <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-5 md:p-6">

                  <div className="text-sm text-blue-200 font-bold">
                    FARMER TIPS
                  </div>

                  <h2 className="text-2xl md:text-3xl font-black mt-1">
                    {page.section_title_3 ||
                      "🌾 ಬೆಳೆ ಮತ್ತು ಕೃಷಿ ಸಲಹೆಗಳು"}
                  </h2>

                </div>

                {page.section_text_3 && (
                  <div className="p-5 md:p-7 bg-white">

                    <p className="text-gray-700 leading-8 text-[16px] md:text-lg whitespace-pre-line">
                      {page.section_text_3}
                    </p>

                  </div>
                )}

              </div>

            </section>
          )}

          {/* ================= IMAGE 4 ================= */}

          {page.image_4_url && (
            <section className="px-5 md:px-8 pb-7">

              <img
                src={page.image_4_url}
                alt="Agriculture"
                className="w-full max-h-[450px] object-cover rounded-3xl shadow-md"
              />

            </section>
          )}

          {/* ================= CONTACT ================= */}

          {(page.phone ||
            page.address ||
            page.website) && (

            <section className="bg-green-50 border-t border-green-100 px-5 md:px-8 py-8">

              <div className="text-center mb-6">

                <div className="text-4xl">
                  🤝
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-green-950 mt-2">
                  ಸಂಪರ್ಕ ಮಾಹಿತಿ
                </h2>

              </div>

              <div className="grid md:grid-cols-3 gap-4">

                {/* PHONE */}

                {page.phone && (
                  <a
                    href={`tel:${page.phone}`}
                    className="bg-white rounded-2xl p-5 border border-green-200 shadow-sm hover:shadow-lg transition"
                  >

                    <div className="text-4xl">
                      📞
                    </div>

                    <div className="font-black text-green-900 mt-3">
                      Call Now
                    </div>

                    <div className="text-gray-500 mt-1 break-all">
                      {page.phone}
                    </div>

                  </a>
                )}

                {/* ADDRESS */}

                {page.address && (
                  <div className="bg-white rounded-2xl p-5 border border-green-200 shadow-sm">

                    <div className="text-4xl">
                      📍
                    </div>

                    <div className="font-black text-green-900 mt-3">
                      ವಿಳಾಸ
                    </div>

                    <div className="text-gray-500 mt-1 whitespace-pre-line">
                      {page.address}
                    </div>

                  </div>
                )}

                {/* WEBSITE */}

                {page.website && (
                  <a
                    href={websiteUrl(page.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-2xl p-5 border border-green-200 shadow-sm hover:shadow-lg transition"
                  >

                    <div className="text-4xl">
                      🌐
                    </div>

                    <div className="font-black text-green-900 mt-3">
                      Website
                    </div>

                    <div className="text-blue-600 mt-1 break-all text-sm">
                      {page.website}
                    </div>

                  </a>
                )}

              </div>

            </section>
          )}

          {/* ================= SHARE SECTION ================= */}

          <section className="px-5 md:px-8 py-8">

            <div className="rounded-3xl bg-gradient-to-br from-green-700 to-green-900 text-white p-7 md:p-9 text-center shadow-lg">

              <div className="text-5xl">
                🌾
              </div>

              <h2 className="text-2xl md:text-3xl font-black mt-3">
                ಈ ಮಾಹಿತಿಯನ್ನು ಇತರ ರೈತರಿಗೂ ತಲುಪಿಸಿ
              </h2>

              <p className="text-green-100 mt-2">
                Share ಮಾಡಿ ಮತ್ತಷ್ಟು ರೈತರಿಗೆ ಉಪಯೋಗವಾಗುವಂತೆ ಮಾಡಿ.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">

                <button
                  onClick={shareWhatsApp}
                  className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-7 py-4 rounded-2xl font-black text-lg shadow-lg"
                >
                  💬 WhatsAppನಲ್ಲಿ Share ಮಾಡಿ
                </button>

                <button
                  onClick={sharePage}
                  className="bg-white text-green-900 px-7 py-4 rounded-2xl font-black text-lg shadow-lg"
                >
                  📤 Share Page
                </button>

              </div>

            </div>

          </section>

          {/* ================= FOOTER ================= */}

          <footer className="bg-green-950 text-white text-center px-5 py-8">

            <div className="text-4xl">
              🌾 🚜 🌱
            </div>

            <h3 className="font-black text-lg mt-3">
              ರೈತರಿಗಾಗಿ • ಕೃಷಿಗಾಗಿ • ನಮ್ಮ ನಾಡಿಗಾಗಿ
            </h3>

            <p className="text-green-300 text-sm mt-2">
              Farmer Information Public Website
            </p>

          </footer>

        </div>

      </div>

      {/* ================= MOBILE WHATSAPP BUTTON ================= */}

      <div className="fixed bottom-5 right-5 z-50">

        <button
          onClick={shareWhatsApp}
          aria-label="Share on WhatsApp"
          className="w-16 h-16 rounded-full bg-[#25D366] text-white text-3xl shadow-2xl border-4 border-white flex items-center justify-center hover:scale-105 transition"
        >
          💬
        </button>

      </div>

    </main>
  );
}

export default function PublicPageView() {
  return <PublicFarmerPage />;
}
```
