 "use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { supabase } from "@/lib/supabase";

export default function Register() {
  const [form,setForm] = useState({name:"",designation:"",village:"",taluk:"",district:"",mobile:"",aadhaar:""});
  const [photo,setPhoto] = useState<File|null>(null);
  const [done,setDone] = useState(false);
  const [busy,setBusy] = useState(false);
  const set=(k:string,v:string)=>setForm({...form,[k]:v});

  async function submit(e:React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try {
      let photo_url = null;
      if(photo){
        const ext = photo.name.split(".").pop() || "jpg";
        const path = `public/${crypto.randomUUID()}.${ext}`;
        const up = await supabase.storage.from("member-photos").upload(path,photo,{upsert:false});
        if(up.error) throw up.error;
        photo_url = supabase.storage.from("member-photos").getPublicUrl(path).data.publicUrl;
      }
      const {error}=await supabase.from("applications").insert({...form,photo_url,status:"pending"});
      if(error) throw error;
      setDone(true);
    } catch(err:any) { alert(err.message || "Submission failed"); }
    finally { setBusy(false); }
  }

  if(done) return <><Nav/><main className="max-w-xl mx-auto px-4 py-20 text-center">
    <div className="bg-white rounded-3xl p-10 card-shadow">
      <div className="text-5xl">✅</div><h1 className="text-3xl font-bold mt-4">ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ</h1>
      <p className="mt-3 text-slate-600">ನಿಮ್ಮ ಅರ್ಜಿ ಈಗ <b>Pending Approval</b> ಸ್ಥಿತಿಯಲ್ಲಿದೆ.</p>
    </div></main>;

  const fields=[["name","ಹೆಸರು / Name"],["designation","ಹುದ್ದೆ / Designation"],["village","ಗ್ರಾಮ / Village"],["taluk","ತಾಲೂಕು / Taluk"],["district","ಜಿಲ್ಲೆ / District"],["mobile","ಮೊಬೈಲ್ ಸಂಖ್ಯೆ / Mobile"],["aadhaar","ಆಧಾರ್ ಸಂಖ್ಯೆ / Aadhaar"]];
  return <><Nav/><main className="max-w-3xl mx-auto px-4 py-10">
    <div className="bg-white rounded-3xl p-6 md:p-9 card-shadow">
      <h1 className="text-3xl font-bold">ಸದಸ್ಯತ್ವ ನೋಂದಣಿ</h1><p className="text-slate-500 mt-2">ಕೆಳಗಿನ ವಿವರಗಳನ್ನು ಸರಿಯಾಗಿ ನಮೂದಿಸಿ.</p>
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-5 mt-7">
        {fields.map(([k,l])=><label key={k} className="grid gap-2"><span className="font-semibold">{l} *</span><input required value={(form as any)[k]} onChange={e=>set(k,e.target.value)} className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"/></label>)}
        <label className="md:col-span-2 grid gap-2"><span className="font-semibold">ಫೋಟೋ / Photo *</span><input required type="file" accept="image/*" onChange={e=>setPhoto(e.target.files?.[0]||null)} className="border rounded-xl p-3"/></label>
        <button disabled={busy} className="md:col-span-2 bg-green-600 disabled:opacity-50 text-white font-bold rounded-xl py-3">{busy?"Submitting...":"ಅರ್ಜಿ ಸಲ್ಲಿಸಿ / Submit"}</button>
      </form>
    </div>
  </main></>;
}