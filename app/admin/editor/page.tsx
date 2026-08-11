 "use client";
import { useEffect,useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Editor(){
 const [hero,setHero]=useState("ನಮ್ಮ ಸಂಘಟನೆಗೆ ಸದಸ್ಯರಾಗಿ"); const [sub,setSub]=useState("ಸದಸ್ಯತ್ವ ನೋಂದಣಿ ಮಾಡಿ ಮತ್ತು PVC ID Card ಪಡೆಯಿರಿ"); const [brand,setBrand]=useState("#16a34a"); const router=useRouter();
 useEffect(()=>{supabase.auth.getUser().then(({data})=>{if(!data.user)router.replace("/admin/login")});},[]);
 async function save(){const {error}=await supabase.from("site_settings").upsert({id:1,hero_text:hero,sub_text:sub,brand_color:brand});if(error)alert(error.message);else alert("Saved");}
 return <main className="min-h-screen bg-slate-100"><div className="max-w-6xl mx-auto p-5"><div className="flex justify-between mb-5"><h1 className="text-2xl font-bold">Visual Website Editor</h1><button onClick={save} className="bg-green-600 text-white px-5 py-2 rounded-xl">Save / Lock</button></div><div className="grid lg:grid-cols-3 gap-5"><div className="bg-white rounded-2xl p-5 grid gap-4 card-shadow"><label>Hero heading<input value={hero} onChange={e=>setHero(e.target.value)} className="border rounded-xl p-3 w-full mt-2"/></label><label>Description<textarea value={sub} onChange={e=>setSub(e.target.value)} className="border rounded-xl p-3 w-full mt-2"/></label><label>Theme colour<input type="color" value={brand} onChange={e=>setBrand(e.target.value)} className="w-full h-12 mt-2"/></label></div><div className="lg:col-span-2 bg-white rounded-2xl p-5 card-shadow"><div style={{background:brand}} className="rounded-2xl text-white p-10 min-h-72"><div className="text-sm">LIVE PREVIEW</div><h2 className="text-4xl font-extrabold mt-5">{hero}</h2><p className="mt-4 text-lg">{sub}</p><button className="bg-white text-slate-900 px-5 py-2 rounded-xl mt-7">ನೋಂದಣಿ</button></div></div></div></div></main>;
}