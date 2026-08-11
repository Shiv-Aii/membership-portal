import Link from "next/link";
import Nav from "@/components/Nav";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data } = await supabase.from("site_settings").select("*").eq("id",1).single();
  const hero = data?.hero_text || "ನಮ್ಮ ಸಂಘಟನೆಗೆ ಸದಸ್ಯರಾಗಿ";
  const sub = data?.sub_text || "ಸದಸ್ಯತ್ವ ನೋಂದಣಿ ಮಾಡಿ ಮತ್ತು PVC ID Card ಪಡೆಯಿರಿ";
  const brand = data?.brand_color || "#16a34a";

  return <><Nav />
    <main>
      <section style={{background:`linear-gradient(135deg, ${brand}, #2563eb)`}} className="text-white">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <p className="opacity-90">Organization Membership Portal</p>
          <h1 className="text-4xl md:text-6xl font-extrabold mt-3">{hero}</h1>
          <p className="mt-5 text-lg max-w-2xl">{sub}</p>
          <Link href="/register" className="inline-block mt-8 bg-white text-green-700 font-bold px-7 py-3 rounded-xl">ಸದಸ್ಯತ್ವ ನೋಂದಣಿ →</Link>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-5">
        {[
          ["01","ಸರಳ ನೋಂದಣಿ","ಮೊಬೈಲ್‌ನಿಂದಲೇ ನಿಮ್ಮ ವಿವರ ಮತ್ತು ಫೋಟೋ ಸಲ್ಲಿಸಿ."],
          ["02","Admin Approval","Admin ಪರಿಶೀಲಿಸಿ Pending → Approved ಮಾಡುತ್ತಾರೆ."],
          ["03","PVC ID Card","Approval ನಂತರ Member ID ಮತ್ತು QR ಇರುವ card generate ಮಾಡಬಹುದು."]
        ].map(x=><div key={x[0]} className="bg-white p-6 rounded-2xl card-shadow"><b className="text-green-700">{x[0]}</b><h2 className="font-bold text-xl mt-2">{x[1]}</h2><p className="text-slate-600 mt-2">{x[2]}</p></div>)}
      </section>
    </main>
  </>;
}