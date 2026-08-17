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

      <main className="min-h-screen bg-[#f5f8f1]">

        {/* HERO - FARMER / TRACTOR */}

        <section
          style={{
            background: `linear-gradient(135deg, ${brand}, #15803d 55%, #166534)`,
          }}
          className="relative overflow-hidden text-white"
        >
          {/* Decorative farming circles */}

          <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full" />
          <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-black/10 rounded-full" />

          <div className="max-w-6xl mx-auto px-4 py-14 md:py-20 relative z-10">

            <div className="grid lg:grid-cols-2 gap-10 items-center">

              {/* LEFT */}

              <div>

                <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 px-4 py-2 rounded-full text-sm font-semibold">
                  🚜 ರೈತರು • ಕೃಷಿ • ಸಂಘಟನೆ
                </div>

                <p className="text-sm md:text-base font-semibold opacity-90 mt-6">
                  Organization Membership Portal
                </p>

                <h1 className="text-4xl md:text-6xl font-extrabold mt-3 leading-tight">
                  {hero}
                </h1>

                <p className="mt-5 text-lg md:text-xl max-w-2xl text-white/90 leading-8">
                  {sub}
                </p>

                {/* BUTTONS */}

                <div className="flex flex-wrap gap-3 mt-8">

                  <Link
                    href="/register"
                    className="inline-block bg-white text-green-900 font-bold px-7 py-3 rounded-xl shadow-lg hover:scale-[1.02] transition"
                  >
                    ಸದಸ್ಯತ್ವ ನೋಂದಣಿ →
                  </Link>

                  <Link
                    href="/verify"
                    className="inline-block bg-slate-950 text-white font-bold px-7 py-3 rounded-xl shadow-lg hover:bg-slate-900 hover:scale-[1.02] transition"
                  >
                    🔎 Verify Membership
                  </Link>

                  <a
                    href="#how-it-works"
                    className="inline-block border border-white/40 bg-white/10 px-7 py-3 rounded-xl font-semibold"
                  >
                    ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?
                  </a>

                </div>

              </div>

              {/* FARMER + TRACTOR VISUAL */}

              <div className="relative">

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-[2rem] p-5 shadow-2xl">

                  <div className="rounded-[1.5rem] overflow-hidden bg-green-900">

                    <img
                      src="https://images.unsplash.com/photo-1592982537447-6f2a6a0a5e1b?auto=format&fit=crop&w=1200&q=85"
                      alt="Farmer working in agricultural field"
                      className="w-full h-[320px] md:h-[400px] object-cover"
                    />

                  </div>

                  <div className="flex items-center justify-between mt-4">

                    <div>
                      <p className="font-extrabold text-lg">
                        🚜 ನಮ್ಮ ರೈತರು
                      </p>

                      <p className="text-white/80 text-sm mt-1">
                        ಕೃಷಿ • ಪರಿಶ್ರಮ • ಅಭಿವೃದ್ಧಿ
                      </p>
                    </div>

                    <div className="text-5xl">
                      🌾
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>
        </section>


        {/* FARMER NEWS */}

        <section className="max-w-6xl mx-auto px-4 pt-12">

          <div className="text-center mb-8">

            <p
              style={{ color: brand }}
              className="font-bold"
            >
              🌾 ರೈತ ಸುದ್ದಿ
            </p>

            <h2 className="text-3xl md:text-4xl font-extrabold mt-2 text-slate-900">
              ರೈತರಿಗೆ ಉಪಯುಕ್ತ ಮಾಹಿತಿ ಮತ್ತು ಸುದ್ದಿ
            </h2>

            <p className="text-slate-500 mt-3">
              ಕೃಷಿ, ರೈತರ ಯೋಜನೆಗಳು ಮತ್ತು ಗ್ರಾಮೀಣ ಅಭಿವೃದ್ಧಿಯ ಮಾಹಿತಿಯನ್ನು ಇಲ್ಲಿ ಪ್ರಕಟಿಸಬಹುದು.
            </p>

          </div>


          <div className="grid md:grid-cols-3 gap-5">

            {/* NEWS COLUMN 1 */}

            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition">

              <div className="h-40 overflow-hidden">

                <img
                  src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=85"
                  alt="Agriculture farming"
                  className="w-full h-full object-cover"
                />

              </div>

              <div className="p-6">

                <span
                  style={{ color: brand }}
                  className="text-sm font-bold"
                >
                  🌾 ಕೃಷಿ ಸುದ್ದಿ
                </span>

                <h3 className="font-extrabold text-xl mt-2 text-slate-900">
                  ರೈತರಿಗೆ ಉಪಯುಕ್ತ ಕೃಷಿ ಮಾಹಿತಿ
                </h3>

                <p className="text-slate-600 mt-2 leading-6">
                  ರೈತರಿಗೆ ಅಗತ್ಯವಾದ ಕೃಷಿ ಮಾಹಿತಿ ಮತ್ತು ಹೊಸ ವಿಚಾರಗಳನ್ನು ಇಲ್ಲಿ ಪ್ರಕಟಿಸಬಹುದು.
                </p>

                <button className="mt-4 font-bold text-sm">
                  ಇನ್ನಷ್ಟು ಓದಿ →
                </button>

              </div>

            </div>


            {/* NEWS COLUMN 2 */}

            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition">

              <div className="h-40 overflow-hidden">

                <img
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=85"
                  alt="Farmer working in field"
                  className="w-full h-full object-cover"
                />

              </div>

              <div className="p-6">

                <span
                  style={{ color: brand }}
                  className="text-sm font-bold"
                >
                  🚜 ರೈತ ಮಾಹಿತಿ
                </span>

                <h3 className="font-extrabold text-xl mt-2 text-slate-900">
                  ಕೃಷಿ ಮತ್ತು ರೈತರ ಅಭಿವೃದ್ಧಿ
                </h3>

                <p className="text-slate-600 mt-2 leading-6">
                  ರೈತರ ಅಭಿವೃದ್ಧಿಗೆ ಸಂಬಂಧಿಸಿದ ಮಾಹಿತಿ, ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ಪ್ರಮುಖ ಸುದ್ದಿಗಳನ್ನು ಇಲ್ಲಿ ಹಾಕಬಹುದು.
                </p>

                <button className="mt-4 font-bold text-sm">
                  ಇನ್ನಷ್ಟು ಓದಿ →
                </button>

              </div>

            </div>


            {/* NEWS COLUMN 3 */}

            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition">

              <div className="h-40 overflow-hidden">

                <img
                  src="https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=800&q=85"
                  alt="Green agricultural field"
                  className="w-full h-full object-cover"
                />

              </div>

              <div className="p-6">

                <span
                  style={{ color: brand }}
                  className="text-sm font-bold"
                >
                  📢 ಪ್ರಮುಖ ಮಾಹಿತಿ
                </span>

                <h3 className="font-extrabold text-xl mt-2 text-slate-900">
                  ರೈತರಿಗೆ ಹೊಸ ಯೋಜನೆಗಳು
                </h3>

                <p className="text-slate-600 mt-2 leading-6">
                  ರೈತರಿಗೆ ಸಂಬಂಧಿಸಿದ ಯೋಜನೆಗಳು, ಪ್ರಕಟಣೆಗಳು ಮತ್ತು ಸಂಘಟನೆಯ ಪ್ರಮುಖ ಮಾಹಿತಿಯನ್ನು ಇಲ್ಲಿ ಹಾಕಬಹುದು.
                </p>

                <button className="mt-4 font-bold text-sm">
                  ಇನ್ನಷ್ಟು ಓದಿ →
                </button>

              </div>

            </div>

          </div>

        </section>


        {/* VERIFY MEMBERSHIP SECTION */}

        <section className="max-w-6xl mx-auto px-4 pt-12">

          <div
            className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 card-shadow text-center"
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
                className="bg-white p-6 md:p-7 rounded-2xl card-shadow border border-slate-100"
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
            className="rounded-3xl p-8 md:p-12 text-white text-center"
          >

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

        </section>

      </main>
    </>
  );
}
