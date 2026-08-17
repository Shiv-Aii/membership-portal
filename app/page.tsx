import Link from "next/link";
import Nav from "@/components/Nav";
import { supabase } from "@/lib/supabase";

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
  hero?: {
    badge?: string;
    eyebrow?: string;
    title?: string;
    description?: string;
    image_url?: string;
    image_alt?: string;
  };
  news?: NewsItem[];
  process?: {
    title?: string;
    description?: string;
    items?: ProcessItem[];
  };
  cta?: {
    title?: string;
    description?: string;
  };
};

export default async function Home() {
  const { data } = await supabase
    .from("site_settings")
    .select(
      "hero_text, sub_text, brand_color, page_content"
    )
    .eq("id", 1)
    .maybeSingle();

  const content =
    (data?.page_content as PageContent | null) || {};

  const brand =
    data?.brand_color ||
    "#16a34a";

  const hero =
    content.hero?.title ||
    data?.hero_text ||
    "ನಮ್ಮ ಸಂಘಟನೆಗೆ ಸದಸ್ಯರಾಗಿ";

  const sub =
    content.hero?.description ||
    data?.sub_text ||
    "ಸದಸ್ಯತ್ವ ನೋಂದಣಿ ಮಾಡಿ ಮತ್ತು PVC ID Card ಪಡೆಯಿರಿ";

  const heroBadge =
    content.hero?.badge ||
    "🚜 ರೈತರು • ಕೃಷಿ • ಸಂಘಟನೆ";

  const heroEyebrow =
    content.hero?.eyebrow ||
    "Organization Membership Portal";

  const heroImage =
    content.hero?.image_url || "";

  const heroAlt =
    content.hero?.image_alt ||
    "ರೈತರು ಕೃಷಿ ಕೆಲಸ ಮಾಡುತ್ತಿರುವ ದೃಶ್ಯ";

  const news =
    content.news || [];

  const process =
    content.process?.items || [];

  const processTitle =
    content.process?.title ||
    "Membership ಹೇಗೆ ಪಡೆಯುವುದು?";

  const processDescription =
    content.process?.description ||
    "ಸರಳವಾದ ಮೂರು ಹಂತಗಳಲ್ಲಿ ನಿಮ್ಮ membership complete ಮಾಡಿ.";

  const ctaTitle =
    content.cta?.title ||
    "ಇಂದೇ Membership ನೋಂದಣಿ ಮಾಡಿ";

  const ctaDescription =
    content.cta?.description ||
    "ನಿಮ್ಮ ವಿವರ ಸಲ್ಲಿಸಿ ಮತ್ತು Admin approval ಪಡೆಯಿರಿ.";

  return (
    <>
      <Nav />

      <main className="min-h-screen bg-[#f5f8f1]">

        {/* HERO */}

        <section
          style={{
            background:
              `linear-gradient(135deg, ${brand}, #15803d 55%, #166534)`,
          }}
          className="relative overflow-hidden text-white"
        >

          <div className="max-w-6xl mx-auto px-4 py-14 md:py-20 relative z-10">

            <div className="grid lg:grid-cols-2 gap-10 items-center">

              <div>

                <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 px-4 py-2 rounded-full text-sm font-semibold">
                  {heroBadge}
                </div>

                <p className="text-sm md:text-base font-semibold opacity-90 mt-6">
                  {heroEyebrow}
                </p>

                <h1 className="text-4xl md:text-6xl font-extrabold mt-3 leading-tight">
                  {hero}
                </h1>

                <p className="mt-5 text-lg md:text-xl max-w-2xl text-white/90 leading-8 whitespace-pre-line">
                  {sub}
                </p>

                <div className="flex flex-wrap gap-3 mt-8">

                  <Link
                    href="/register"
                    className="bg-white text-green-900 font-bold px-7 py-3 rounded-xl shadow-lg"
                  >
                    ಸದಸ್ಯತ್ವ ನೋಂದಣಿ →
                  </Link>

                  <Link
                    href="/verify"
                    className="bg-slate-950 text-white font-bold px-7 py-3 rounded-xl shadow-lg"
                  >
                    🔎 Verify Membership
                  </Link>

                  <a
                    href="#how-it-works"
                    className="border border-white/40 bg-white/10 px-7 py-3 rounded-xl font-semibold"
                  >
                    ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?
                  </a>

                </div>

              </div>


              <div>

                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={heroAlt}
                    className="w-full h-[320px] md:h-[400px] object-cover rounded-[2rem] shadow-2xl"
                  />
                ) : (
                  <div className="w-full h-[320px] md:h-[400px] rounded-[2rem] bg-white/10 flex items-center justify-center text-8xl">
                    🚜🌾
                  </div>
                )}

              </div>

            </div>

          </div>

        </section>


        {/* NEWS */}

        <section className="max-w-6xl mx-auto px-4 pt-12">

          <div className="text-center mb-8">

            <p
              style={{
                color: brand,
              }}
              className="font-bold"
            >
              🌾 ರೈತ ಸುದ್ದಿ
            </p>

            <h2 className="text-3xl md:text-4xl font-extrabold mt-2">
              ರೈತರಿಗೆ ಉಪಯುಕ್ತ ಮಾಹಿತಿ ಮತ್ತು ಸುದ್ದಿ
            </h2>

            <p className="text-slate-500 mt-3">
              ಕೃಷಿ, ರೈತರ ಯೋಜನೆಗಳು ಮತ್ತು ಗ್ರಾಮೀಣ ಅಭಿವೃದ್ಧಿಯ ಮಾಹಿತಿಯನ್ನು ಇಲ್ಲಿ ಪ್ರಕಟಿಸಬಹುದು.
            </p>

          </div>


          <div className="grid md:grid-cols-3 gap-5">

            {news.map(
              (item, index) => (

                <div
                  key={index}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm"
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

                  <div className="p-6">

                    <span
                      style={{
                        color: brand,
                      }}
                      className="text-sm font-bold"
                    >
                      {item.category}
                    </span>

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
                      className="mt-4 font-bold text-sm"
                    >
                      ಇನ್ನಷ್ಟು ಓದಿ →
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        </section>


        {/* VERIFY */}

        <section className="max-w-6xl mx-auto px-4 pt-12">

          <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 text-center">

            <div className="text-5xl">
              🔎
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold mt-4">
              ನಿಮ್ಮ Membership Verify ಮಾಡಿ
            </h2>

            <p className="text-slate-500 mt-3 max-w-2xl mx-auto">
              ನಿಮ್ಮ Membership Number ಬಳಸಿ ನಿಮ್ಮ membership
              approved ಮತ್ತು active ಆಗಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.
            </p>

            <Link
              href="/verify"
              style={{
                backgroundColor: brand,
              }}
              className="inline-block mt-6 text-white font-bold px-8 py-3 rounded-xl shadow"
            >
              🔎 Verify Membership →
            </Link>

          </div>

        </section>


        {/* PROCESS */}

        <section
          id="how-it-works"
          className="max-w-6xl mx-auto px-4 py-14 md:py-16"
        >

          <div className="text-center mb-10">

            <p
              style={{
                color: brand,
              }}
              className="font-bold"
            >
              MEMBERSHIP PROCESS
            </p>

            <h2 className="text-3xl md:text-4xl font-extrabold mt-2">
              {processTitle}
            </h2>

            <p className="text-slate-500 mt-3">
              {processDescription}
            </p>

          </div>


          <div className="grid md:grid-cols-3 gap-5">

            {process.map(
              (item, index) => (

                <div
                  key={index}
                  className="bg-white p-6 md:p-7 rounded-2xl border border-slate-100 shadow-sm"
                >

                  <div
                    style={{
                      color: brand,
                    }}
                    className="font-extrabold text-lg"
                  >
                    {item.number}
                  </div>

                  <h2 className="font-bold text-xl mt-3">
                    {item.title}
                  </h2>

                  <p className="text-slate-600 mt-2 leading-6">
                    {item.description}
                  </p>

                </div>

              )
            )}

          </div>

        </section>


        {/* CTA */}

        <section className="max-w-6xl mx-auto px-4 pb-16">

          <div
            style={{
              backgroundColor: brand,
            }}
            className="rounded-3xl p-8 md:p-12 text-white text-center"
          >

            <h2 className="text-2xl md:text-3xl font-extrabold">
              {ctaTitle}
            </h2>

            <p className="mt-3 text-white/90">
              {ctaDescription}
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-6">

              <Link
                href="/register"
                className="bg-white text-slate-900 font-bold px-7 py-3 rounded-xl"
              >
                Register Now →
              </Link>

              <Link
                href="/verify"
                className="bg-slate-950 text-white font-bold px-7 py-3 rounded-xl"
              >
                🔎 Verify Member
              </Link>

            </div>

          </div>

        </section>

      </main>
    </>
  );
}
