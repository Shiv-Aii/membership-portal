 "use client";
import { useEffect,useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter,useSearchParams } from "next/navigation";

export default function ApplicationDetail(){
 const id=useSearchParams().get("id"); const router=useRouter();
 const [a,setA]=useState<any>(null);
 useEffect(()=>{supabase.auth.getUser().then(({data})=>{if(!data.user)router.replace("/admin/login"); else if(id)supabase.from("applications").select("*").eq("id",id).single().then(({data})=>setA(data));});},[id]);
 if(!a)return <main className="p-10">Loading...</main>;
 const fields=["name","designation","village","taluk","district","mobile","aadhaar","membership_no"];
 async function save(){const {error}=await supabase.from("applications").update(a).eq("id",a.id);if(error)alert(error.message);else alert("Details saved");}
 return <main className="min-h-screen bg-slate-100 p-5"><div className="max-w-3xl mx-auto bg-white rounded-3xl p-7 card-shadow">
 <h1 className="text-2xl font-bold">Application Details / ಅರ್ಜಿ ವಿವರ</h1>
 <div className="grid md:grid-cols-2 gap-4 mt-6">{fields.map(k=><label key={k} className="grid gap-2"><span className="font-semibold">{k}</span><input value={a[k]||""} onChange={e=>setA({...a,[k]:e.target.value})} className="border rounded-xl p-3"/></label>)}</div>
 {a.photo_url&&<img src={a.photo_url} className="w-32 h-40 object-cover rounded-xl mt-5" alt="member"/>}
 <div className="flex gap-3 mt-7"><button onClick={save} className="bg-green-600 text-white px-5 py-3 rounded-xl">Save</button><button onClick={()=>router.back()} className="border px-5 py-3 rounded-xl">Back</button></div>
 </div></main>;
}