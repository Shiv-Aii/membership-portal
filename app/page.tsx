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
            background: `linear-gradient(135deg, ${brand}, #2563eb)`,
          }}
          className="text-white"
        >
          <div className="max-w-6xl mx-auto px-4 py-20 md:py-28">

            <p className="text-sm md:text-base font-semibold opacity-90">
              Organization Membership Portal
            </p>

            <h1 className="text-4xl md:text-6xl font-extrabold mt-4 leading-tight max-w-4xl">
              {hero}
            </h1>

            <p className="mt-5 text-lg md:text-xl max-w-2xl text-white/90">
              {sub}
            </p>

            <div className="flex flex-wrap gap-3 mt-8">

              <Link
                href="/register"
                className="inline-block bg-white text-slate-900 font-bold px-7 py-3 rounded-xl shadow-lg hover:scale-[1.02] transition"
              >
                ಸದಸ್ಯತ್ವ ನೋಂದಣಿ →
              </Link>

              <a
                href="#how-it-works"
                className="inline-block border border-white/40 bg-white/10 px-7 py-3 rounded-xl font-semibold"
              >
                ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?
              </a>

            </div>

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

            <Link
              href="/register"
              className="inline-block mt-6 bg-white text-slate-900 font-bold px-7 py-3 rounded-xl"
            >
              Register Now →
            </Link>

          </div>

        </section>

      </main>
    </>
  );
}
