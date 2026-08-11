 "use client";
import { useEffect,useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Application } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Admin(){
 const [apps,setApps]=useState<Application[]>([]); const [status,setStatus]=useState("all"); const [q,setQ]=useState(""); const [loading,setLoading]=useState(true); const router=useRouter();
 async function load(){const {data}=await supabase.from("applications").select("*").order("created_at",{ascending:false});setApps((data||[]) as Application[]);setLoading(false);}
 useEffect(()=>{supabase.auth.getUser().then(({data})=>{if(!data.user)router.replace("/admin/login");else load()});},[]);
 async function update(id:string,patch:Partial<Application>){const {error}=await supabase.from("applications").update(patch).eq("id",id);if(error)alert(error.message);else load();}
 async function approve(a:Application){
  const next=prompt("Membership Number (leave blank for auto 6164, 6165...)","");
  const {error}=await supabase.rpc("approve_application",{p_id:a.id,p_membership_no:next||null});
  if(error) alert(error.message); else load();
}
 const shown=apps.filter(a=>(status==="all"||a.status===status)&&Object.values(a).join(" ").toLowerCase().includes(q.toLowerCase()));
 const counts={all:apps.length,pending:apps.filter(a=>a.status==="pending").length,approved:apps.filter(a=>a.status==="approved").length,rejected:apps.filter(a=>a.status==="rejected").length};
 return <main className="min-h-screen"><header className="bg-slate-950 text-white"><div className="max-w-7xl mx-auto px-4 py-5 flex justify-between"><b>Admin Dashboard</b><div className="flex gap-3"><Link href="/admin/editor" className="bg-white/10 px-3 py-2 rounded-lg">Website Editor</Link><Link href="/admin/card" className="bg-green-600 px-3 py-2 rounded-lg">PVC Designer</Link><button onClick={async()=>{await supabase.auth.signOut();router.push("/admin/login")}}>Logout</button></div></div></header>
 <div className="max-w-7xl mx-auto px-4 py-8"><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{(["all","pending","approved","rejected"] as const).map(s=><button key={s} onClick={()=>setStatus(s)} className={`bg-white rounded-2xl p-5 text-left card-shadow ${status===s?"ring-2 ring-green-500":""}`}><div className="text-sm text-slate-500">{s.toUpperCase()}</div><div className="text-3xl font-bold mt-1">{counts[s]}</div></button>)}</div>
 <div className="bg-white rounded-2xl mt-6 card-shadow overflow-hidden"><div className="p-4 flex gap-3"><input placeholder="ಹೆಸರು / Mobile / District ಹುಡುಕಿ..." value={q} onChange={e=>setQ(e.target.value)} className="border rounded-xl px-4 py-3 w-full"/></div>
 {loading?<p className="p-6">Loading...</p>:<div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50"><tr>{["ಹೆಸರು","ಮೊಬೈಲ್","ಜಿಲ್ಲೆ","Status","Member ID","Action"].map(x=><th key={x} className="text-left p-3">{x}</th>)}</tr></thead><tbody>{shown.map(a=><tr key={a.id} className="border-t"><td className="p-3 font-semibold">{a.name}</td><td className="p-3">{a.mobile}</td><td className="p-3">{a.district}</td><td className="p-3"><span className="px-2 py-1 rounded-full bg-slate-100">{a.status}</span></td><td className="p-3">{a.membership_no||"—"}</td><td className="p-3 flex gap-2"><Link href={`/admin/application?id=${a.id}`} className="border px-3 py-2 rounded-lg">Edit</Link>{a.status==="pending"&&<button onClick={()=>approve(a)} className="bg-green-600 text-white px-3 py-2 rounded-lg">Approve</button>}{a.status==="pending"&&<button onClick={()=>update(a.id,{status:"rejected"})} className="bg-red-600 text-white px-3 py-2 rounded-lg">Reject</button>}{a.status==="approved"&&<Link href={`/admin/card?id=${a.id}`} className="bg-blue-600 text-white px-3 py-2 rounded-lg">Card</Link>}</td></tr>)}</tbody></table></div>}</div></div></main>;
}