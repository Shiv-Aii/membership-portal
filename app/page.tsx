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
    "ರೈತರಿಗಾಗಿ ನಮ್ಮ ಸಂಘಟನೆಯ ಸದಸ್ಯತ್ವ";

  const sub =
    data?.sub_text ||
    "ಸರಳವಾಗಿ ಸದಸ್ಯರಾಗಿ, ನಿಮ್ಮ ಸದಸ್ಯತ್ವವನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು PVC ID Card ಪಡೆಯಿರಿ.";

  const brand =
    data?.brand_color ||
    "#15803d";

  return (
    <>
      <Nav />

      <main className="min-h-screen bg-[#f7faf7] text-slate-800">

        {/* =====================================================
            HERO
        ====================================================== */}
        <section
          style={{
            background: `
              linear-gradient(
                135deg,
                ${brand} 0%,
                #166534 55%,
                #14532d 100%
              )
            `,
          }}
          className="relative overflow-hidden text-white"
        >

          {/* Background decoration */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full" />
          <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-black/10 rounded-full" />

          <div className="relative max-w-7xl mx-auto px-5 py-14 md:py-20">

            <div className="grid lg:grid-cols-2 gap-10 items-center">

              {/* LEFT */}
              <div>

                <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-2 text-sm font-semibold mb-6">
                  🌾 ರೈತರಿಗಾಗಿ ಸದಸ್ಯತ್ವ ಪೋರ್ಟಲ್
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.08] max-w-3xl">
                  {hero}
                </h1>

                <p className="mt-6 text-lg md:text-xl text-white/90 leading-8 max-w-2xl">
                  {sub}
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-8">

                  <Link
                    href="/register"
                    className="inline-flex justify-center items-center bg-white text-green-800 font-extrabold px-7 py-4 rounded-2xl shadow-xl hover:-translate-y-1 transition"
                  >
                    🌾 ಸದಸ್ಯರಾಗಿ
                    <span className="ml-2">→</span>
                  </Link>

                  <Link
                    href="/verify"
                    className="inline-flex justify-center items-center bg-slate-950 text-white font-extrabold px-7 py-4 rounded-2xl shadow-xl hover:bg-slate-900 hover:-translate-y-1 transition"
                  >
                    🔎 Membership Verify
                  </Link>

                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-7 text-sm text-white/85">
                  <span>✓ ಸರಳ ನೋಂದಣಿ</span>
                  <span>✓ Admin Approval</span>
                  <span>✓ PVC ID Card</span>
                  <span>✓ QR Verification</span>
                </div>

              </div>

              {/* RIGHT - FARMER / TRACTOR VISUAL */}
              <div className="hidden lg:flex justify-center">

                <div className="relative w-full max-w-lg">

                  <div className="absolute inset-8 bg-white/10 rounded-[3rem] rotate-3" />

                  <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-[3rem] p-8">

                    <div className="text-center text-[100px] leading-none">
                      🚜
                    </div>

                    <div className="text-center mt-4">

                      <div className="text-3xl">
                        🌾 👨‍🌾 🌱
                      </div>

                      <h2 className="text-2xl font-black mt-3">
                        ರೈತರ ಒಗ್ಗಟ್ಟು
                      </h2>

                      <p className="text-white/80 mt-2">
                        ಸಂಘಟನೆ • ಸದಸ್ಯತ್ವ • ಸೇವೆ
                      </p>

                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-7">

                      <div className="bg-white/10 rounded-2xl p-4 text-center">
                        <div className="text-2xl">📝</div>
                        <div className="text-xs font-bold mt-2">
                          ನೋಂದಣಿ
                        </div>
                      </div>

                      <div className="bg-white/10 rounded-2xl p-4 text-center">
                        <div className="text-2xl">✅</div>
                        <div className="text-xs font-bold mt-2">
                          Approval
                        </div>
                      </div>

                      <div className="bg-white/10 rounded-2xl p-4 text-center">
                        <div className="text-2xl">💳</div>
                        <div className="text-xs font-bold mt-2">
                          ID Card
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>
        </section>


        {/* =====================================================
            QUICK ACTIONS
        ====================================================== */}
        <section className="max-w-7xl mx-auto px-5 -mt-8 relative z-10">

          <div className="grid md:grid-cols-3 gap-4">

            <Link
              href="/register"
              className="bg-white rounded-2xl p-5 shadow-xl border border-slate-100 hover:-translate-y-1 transition"
            >
              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-3xl">
                  📝
                </div>

                <div>
                  <h3 className="font-extrabold text-lg">
                    ಸದಸ್ಯತ್ವ ನೋಂದಣಿ
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    ಹೊಸ ಸದಸ್ಯರಾಗಿ ನೋಂದಣಿ ಮಾಡಿ
                  </p>
                </div>

              </div>
            </Link>


            <Link
              href="/verify"
              className="bg-white rounded-2xl p-5 shadow-xl border border-slate-100 hover:-translate-y-1 transition"
            >
              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-3xl">
                  🔎
                </div>

                <div>
                  <h3 className="font-extrabold text-lg">
                    Membership Verify
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    ನಿಮ್ಮ ಸದಸ್ಯತ್ವ ಪರಿಶೀಲಿಸಿ
                  </p>
                </div>

              </div>
            </Link>


            <a
              href="#how-it-works"
              className="bg-white rounded-2xl p-5 shadow-xl border border-slate-100 hover:-translate-y-1 transition"
            >
              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-3xl">
                  ℹ️
                </div>

                <div>
                  <h3 className="font-extrabold text-lg">
                    ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Membership ಪ್ರಕ್ರಿಯೆ ನೋಡಿ
                  </p>
                </div>

              </div>
            </a>

          </div>

        </section>


        {/* =====================================================
            FARMER MESSAGE
        ====================================================== */}
        <section className="max-w-7xl mx-auto px-5 pt-16">

          <div className="bg-green-50 border border-green-100 rounded-[2rem] p-7 md:p-10">

            <div className="grid md:grid-cols-[auto_1fr] gap-6 items-center">

              <div className="w-20 h-20 rounded-3xl bg-green-600 flex items-center justify-center text-5xl shadow-lg">
                🌾
              </div>

              <div>

                <p
                  style={{ color: brand }}
                  className="font-extrabold text-sm uppercase tracking-wide"
                >
                  ನಮ್ಮ ಉದ್ದೇಶ
                </p>

                <h2 className="text-2xl md:text-3xl font-black mt-2">
                  ರೈತರಿಗೆ ಸರಳವಾದ ಡಿಜಿಟಲ್ ಸದಸ್ಯತ್ವ ವ್ಯವಸ್ಥೆ
                </h2>

                <p className="text-slate-600 mt-3 leading-7 max-w-4xl">
                  ಸದಸ್ಯತ್ವ ಪಡೆಯಲು ಕಷ್ಟವಾಗದಂತೆ, ಮೊಬೈಲ್‌ನಿಂದಲೇ ನೋಂದಣಿ,
                  Approval ಸ್ಥಿತಿ ಪರಿಶೀಲನೆ ಮತ್ತು Membership Verification
                  ಮಾಡಲು ಈ ಪೋರ್ಟಲ್ ಸಹಾಯ ಮಾಡುತ್ತದೆ.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            VERIFY MEMBERSHIP
        ====================================================== */}
        <section className="max-w-7xl mx-auto px-5 pt-14">

          <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-slate-100 shadow-sm">

            <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">

              <div>

                <div className="inline-flex items-center gap-2 text-blue-700 bg-blue-50 px-4 py-2 rounded-full font-bold text-sm">
                  🔎 ಸದಸ್ಯತ್ವ ಪರಿಶೀಲನೆ
                </div>

                <h2 className="text-2xl md:text-4xl font-black mt-5">
                  ನಿಮ್ಮ Membership Verify ಮಾಡಿ
                </h2>

                <p className="text-slate-500 mt-3 max-w-2xl leading-7">
                  ನಿಮ್ಮ Membership Number ಬಳಸಿ ನಿಮ್ಮ membership
                  approved ಮತ್ತು active ಆಗಿದೆಯೇ ಎಂದು ಸುಲಭವಾಗಿ ಪರಿಶೀಲಿಸಿ.
                </p>

              </div>

              <Link
                href="/verify"
                style={{
                  backgroundColor: brand,
                }}
                className="inline-flex justify-center items-center text-white font-extrabold px-8 py-4 rounded-2xl shadow-lg hover:opacity-90 hover:-translate-y-1 transition"
              >
                🔎 Verify Now →
              </Link>

            </div>

          </div>

        </section>


        {/* =====================================================
            HOW IT WORKS
        ====================================================== */}
        <section
          id="how-it-works"
          className="max-w-7xl mx-auto px-5 py-16 md:py-20"
        >

          <div className="text-center max-w-2xl mx-auto mb-12">

            <p
              style={{ color: brand }}
              className="font-black text-sm tracking-wider"
            >
              MEMBERSHIP PROCESS
            </p>

            <h2 className="text-3xl md:text-4xl font-black mt-3">
              Membership ಹೇಗೆ ಪಡೆಯುವುದು?
            </h2>

            <p className="text-slate-500 mt-4 leading-7">
              ಕೇವಲ ಮೂರು ಸರಳ ಹಂತಗಳಲ್ಲಿ ನಿಮ್ಮ Membership ಪೂರ್ಣಗೊಳಿಸಿ.
            </p>

          </div>


          <div className="grid md:grid-cols-3 gap-6">

            {[
              {
                number: "01",
                icon: "📝",
                title: "ಸರಳ ನೋಂದಣಿ",
                description:
                  "ಮೊಬೈಲ್‌ನಿಂದಲೇ ನಿಮ್ಮ ಅಗತ್ಯ ವಿವರಗಳು ಮತ್ತು ಫೋಟೋವನ್ನು ಸಲ್ಲಿಸಿ.",
              },
              {
                number: "02",
                icon: "✅",
                title: "Admin Approval",
                description:
                  "Admin ನಿಮ್ಮ application ಪರಿಶೀಲಿಸಿ Pending → Approved ಮಾಡುತ್ತಾರೆ.",
              },
              {
                number: "03",
                icon: "💳",
                title: "PVC ID Card",
                description:
                  "Approval ನಂತರ Member ID ಮತ್ತು QR ಹೊಂದಿರುವ PVC ID Card ಪಡೆಯಬಹುದು.",
              },
            ].map((item) => (

              <div
                key={item.number}
                className="relative bg-white rounded-3xl p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition"
              >

                <div className="flex items-center justify-between">

                  <div
                    style={{
                      backgroundColor: `${brand}15`,
                      color: brand,
                    }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                  >
                    {item.icon}
                  </div>

                  <span className="text-4xl font-black text-slate-100">
                    {item.number}
                  </span>

                </div>

                <h3 className="font-black text-xl mt-6">
                  {item.title}
                </h3>

                <p className="text-slate-500 mt-3 leading-7">
                  {item.description}
                </p>

              </div>

            ))}

          </div>

        </section>


        {/* =====================================================
            BENEFITS
        ====================================================== */}
        <section className="bg-white border-y border-slate-100">

          <div className="max-w-7xl mx-auto px-5 py-16">

            <div className="text-center mb-10">

              <p
                style={{ color: brand }}
                className="font-black text-sm"
              >
                MEMBER BENEFITS
              </p>

              <h2 className="text-3xl md:text-4xl font-black mt-2">
                Membership ಮೂಲಕ ಏನು ಸಿಗುತ್ತದೆ?
              </h2>

            </div>


            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

              {[
                ["📱", "Digital Membership", "ನಿಮ್ಮ ಸದಸ್ಯತ್ವದ ಮಾಹಿತಿಯನ್ನು ಸುಲಭವಾಗಿ ನಿರ್ವಹಿಸಿ."],
                ["🪪", "PVC ID Card", "Approval ನಂತರ ನಿಮ್ಮ Membership ID Card ಪಡೆಯಿರಿ."],
                ["🔎", "QR Verification", "QR ಮೂಲಕ membership ಅನ್ನು ಪರಿಶೀಲಿಸಬಹುದು."],
                ["🌾", "ರೈತರ ಸಂಪರ್ಕ", "ಸಂಘಟನೆಯ ಸದಸ್ಯರೊಂದಿಗೆ ಉತ್ತಮ ಸಂಪರ್ಕ ಬೆಳೆಸಿಕೊಳ್ಳಿ."],
              ].map(([icon, title, text]) => (

                <div
                  key={title}
                  className="bg-slate-50 rounded-3xl p-6 text-center"
                >

                  <div className="text-4xl">
                    {icon}
                  </div>

                  <h3 className="font-extrabold text-lg mt-4">
                    {title}
                  </h3>

                  <p className="text-sm text-slate-500 mt-2 leading-6">
                    {text}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </section>


        {/* =====================================================
            FINAL CTA
        ====================================================== */}
        <section className="max-w-7xl mx-auto px-5 py-16">

          <div
            style={{
              background: `
                linear-gradient(
                  135deg,
                  ${brand},
                  #166534
                )
              `,
            }}
            className="relative overflow-hidden rounded-[2rem] p-8 md:p-14 text-white text-center"
          >

            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full" />
            <div className="absolute -bottom-24 -left-20 w-72 h-72 bg-black/10 rounded-full" />

            <div className="relative">

              <div className="text-5xl mb-5">
                🌾🚜🌱
              </div>

              <h2 className="text-3xl md:text-4xl font-black">
                ಇಂದೇ Membership ನೋಂದಣಿ ಮಾಡಿ
              </h2>

              <p className="mt-4 text-white/85 text-lg">
                ನಿಮ್ಮ ವಿವರ ಸಲ್ಲಿಸಿ ಮತ್ತು Admin Approval ಪಡೆಯಿರಿ.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">

                <Link
                  href="/register"
                  className="bg-white text-green-800 font-black px-8 py-4 rounded-2xl shadow-lg hover:-translate-y-1 transition"
                >
                  🌾 Register Now →
                </Link>

                <Link
                  href="/verify"
                  className="bg-slate-950 text-white font-black px-8 py-4 rounded-2xl shadow-lg hover:bg-slate-900 hover:-translate-y-1 transition"
                >
                  🔎 Verify Member
                </Link>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            FOOTER MESSAGE
        ====================================================== */}
        <footer className="bg-slate-950 text-white">

          <div className="max-w-7xl mx-auto px-5 py-8">

            <div className="flex flex-col md:flex-row justify-between gap-4 items-center">

              <div className="text-center md:text-left">

                <div className="font-black text-lg">
                  🌾 Organization Membership Portal
                </div>

                <p className="text-slate-400 text-sm mt-1">
                  ರೈತರಿಗಾಗಿ ಸರಳ ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹ ಸದಸ್ಯತ್ವ ವ್ಯವಸ್ಥೆ
                </p>

              </div>

              <div className="text-slate-500 text-sm">
                Membership • Verification • PVC ID Card
              </div>

            </div>

          </div>

        </footer>

      </main>
    </>
  );
}
