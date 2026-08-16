import Link from "next/link";
import Nav from "@/components/Nav";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data } = await supabase
    .from("site_settings")
    .select("hero_text, sub_text, brand_color")
    .eq("id", 1)
    .maybeSingle();

  const hero =
    data?.hero_text ||
    "ನಮ್ಮ ಸಂಘಟನೆಗೆ ಸದಸ್ಯರಾಗಿ";

  const sub =
    data?.sub_text ||
    "ಸದಸ್ಯತ್ವ ನೋಂದಣಿ ಮಾಡಿ ಮತ್ತು PVC ID Card ಪಡೆಯಿರಿ";

  const brand =
    data?.brand_color ||
    "#16a34a";

  return (
    <>
      <Nav />

      <main className="min-h-screen bg-slate-50">

        {/* HERO */}

        <section
          style={{
            background: `
              linear-gradient(135deg, ${brand} 0%, #15803d 45%, #166534 100%)
            `,
          }}
          className="relative overflow-hidden text-white"
        >

          {/* AGRICULTURE DECORATION */}

          <div className="absolute inset-0 pointer-events-none">

            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />

            <div className="absolute bottom-0 left-0 w-full h-24 bg-black/10" />

            <div className="absolute left-5 bottom-5 text-5xl opacity-20">
              🌾
            </div>

            <div className="absolute right-5 top-10 text-6xl opacity-20">
              🌾
            </div>

          </div>


          <div className="relative max-w-6xl mx-auto px-4 py-14 md:py-20">

            <div className="grid lg:grid-cols-2 gap-10 items-center">

              {/* LEFT CONTENT */}

              <div>

                <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                  🌾 ರೈತರಿಗಾಗಿ Membership Portal
                </div>

                <p className="text-sm md:text-base font-semibold opacity-90 mt-5">
                  Organization Membership Portal
                </p>

                <h1 className="text-4xl md:text-6xl font-extrabold mt-4 leading-tight max-w-4xl">
                  {hero}
                </h1>

                <p className="mt-5 text-lg md:text-xl max-w-2xl text-white/90">
                  {sub}
                </p>


                {/* BUTTONS */}

                <div className="flex flex-wrap gap-3 mt-8">

                  {/* REGISTER */}

                  <Link
                    href="/register"
                    className="inline-block bg-white text-slate-900 font-bold px-7 py-3 rounded-xl shadow-lg hover:scale-[1.02] transition"
                  >
                    ಸದಸ್ಯತ್ವ ನೋಂದಣಿ →
                  </Link>


                  {/* VERIFY */}

                  <Link
                    href="/verify"
                    className="inline-block bg-slate-950 text-white font-bold px-7 py-3 rounded-xl shadow-lg hover:bg-slate-900 hover:scale-[1.02] transition"
                  >
                    🔎 Verify Membership
                  </Link>


                  {/* HOW IT WORKS */}

                  <a
                    href="#how-it-works"
                    className="inline-block border border-white/40 bg-white/10 px-7 py-3 rounded-xl font-semibold backdrop-blur-sm"
                  >
                    ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?
                  </a>

                </div>

              </div>


              {/* FARMER + TRACTOR VISUAL */}

              <div className="flex justify-center lg:justify-end">

                <div className="relative w-full max-w-md">

                  {/* SKY / FIELD */}

                  <div className="relative rounded-[2rem] overflow-hidden border border-white/20 bg-gradient-to-b from-sky-300/90 via-sky-200/70 to-green-700/90 shadow-2xl">

                    <div className="h-72 md:h-80 relative">

                      {/* SUN */}

                      <div className="absolute top-7 right-8 w-16 h-16 rounded-full bg-yellow-300/90 shadow-lg" />

                      {/* CLOUDS */}

                      <div className="absolute top-8 left-8 text-5xl opacity-70">
                        ☁️
                      </div>

                      <div className="absolute top-20 left-32 text-4xl opacity-60">
                        ☁️
                      </div>


                      {/* FARMER */}

                      <div className="absolute bottom-28 left-10 md:left-16 text-[5rem] md:text-[6rem] drop-shadow-lg">
                        👨‍🌾
                      </div>


                      {/* TRACTOR */}

                      <div className="absolute bottom-7 right-4 md:right-8">

                        <div className="text-[7rem] md:text-[8rem] leading-none drop-shadow-2xl">
                          🚜
                        </div>

                      </div>


                      {/* FIELD */}

                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-green-900/80 to-green-700/30" />

                      <div className="absolute bottom-3 left-5 text-4xl">
                        🌾
                      </div>

                      <div className="absolute bottom-2 left-24 text-3xl">
                        🌱
                      </div>

                      <div className="absolute bottom-3 right-28 text-4xl">
                        🌾
                      </div>

                    </div>


                    {/* FARMING LABEL */}

                    <div className="bg-black/30 backdrop-blur-md px-5 py-4">

                      <div className="flex items-center justify-between">

                        <div>
                          <p className="font-bold text-lg">
                            🌾 ರೈತ • ಕೃಷಿ • ಸಂಘಟನೆ
                          </p>

                          <p className="text-white/80 text-sm mt-1">
                            ರೈತರಿಗಾಗಿ ಸರಳ ಮತ್ತು ಸುಲಭ Membership
                          </p>
                        </div>

                        <div className="text-3xl">
                          🚜
                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* VERIFY MEMBERSHIP SECTION */}

        <section className="max-w-6xl mx-auto px-4 pt-12">

          <div
            className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-sm text-center"
          >

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
              className="inline-block mt-6 text-white font-bold px-8 py-3 rounded-xl shadow hover:opacity-90 transition"
            >
              🔎 Verify Membership →
            </Link>

          </div>

        </section>


        {/* HOW IT WORKS */}

        <section
          id="how-it-works"
          className="max-w-6xl mx-auto px-4 py-14 md:py-16"
        >

          <div className="text-center mb-10">

            <p
              style={{ color: brand }}
              className="font-bold"
            >
              MEMBERSHIP PROCESS
            </p>

            <h2 className="text-3xl md:text-4xl font-extrabold mt-2">
              Membership ಹೇಗೆ ಪಡೆಯುವುದು?
            </h2>

            <p className="text-slate-500 mt-3">
              ಸರಳವಾದ ಮೂರು ಹಂತಗಳಲ್ಲಿ ನಿಮ್ಮ membership complete ಮಾಡಿ.
            </p>

          </div>


          <div className="grid md:grid-cols-3 gap-5">

            {[

              [
                "01",
                "ಸರಳ ನೋಂದಣಿ",
                "ಮೊಬೈಲ್‌ನಿಂದಲೇ ನಿಮ್ಮ ವಿವರ ಮತ್ತು ಫೋಟೋ ಸಲ್ಲಿಸಿ.",
              ],

              [
                "02",
                "Admin Approval",
                "Admin ನಿಮ್ಮ application ಪರಿಶೀಲಿಸಿ Pending → Approved ಮಾಡುತ್ತಾರೆ.",
              ],

              [
                "03",
                "PVC ID Card",
                "Approval ನಂತರ Member ID ಮತ್ತು QR ಇರುವ PVC card generate ಮಾಡಬಹುದು.",
              ],

            ].map(([number, title, description]) => (

              <div
                key={number}
                className="bg-white p-6 md:p-7 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition"
              >

                <div
                  style={{ color: brand }}
                  className="font-extrabold text-lg"
                >
                  {number}
                </div>

                <h2 className="font-bold text-xl mt-3">
                  {title}
                </h2>

                <p className="text-slate-600 mt-2 leading-6">
                  {description}
                </p>

              </div>

            ))}

          </div>

        </section>


        {/* CTA */}

        <section className="max-w-6xl mx-auto px-4 pb-16">

          <div
            style={{
              backgroundColor: brand,
            }}
            className="rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden"
          >

            {/* AGRICULTURE DECORATION */}

            <div className="absolute left-5 bottom-3 text-5xl opacity-20">
              🌾
            </div>

            <div className="absolute right-5 top-3 text-5xl opacity-20">
              🚜
            </div>


            <div className="relative">

              <h2 className="text-2xl md:text-3xl font-extrabold">
                ಇಂದೇ Membership ನೋಂದಣಿ ಮಾಡಿ
              </h2>

              <p className="mt-3 text-white/90">
                ನಿಮ್ಮ ವಿವರ ಸಲ್ಲಿಸಿ ಮತ್ತು Admin approval ಪಡೆಯಿರಿ.
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

          </div>

        </section>

      </main>
    </>
  );
}
