 "use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Login(){
 const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [busy,setBusy]=useState(false); const router=useRouter();
 async function login(e:React.FormEvent){e.preventDefault();setBusy(true);const {error}=await supabase.auth.signInWithPassword({email,password});setBusy(false);if(error)alert(error.message);else router.push("/admin");}
 return <main className="min-h-screen grid place-items-center px-4"><form onSubmit={login} className="bg-white w-full max-w-md p-8 rounded-3xl card-shadow">
  <h1 className="text-2xl font-bold">Admin Login</h1><p className="text-slate-500 mt-1">ಸಂಸ್ಥೆ ನಿರ್ವಹಣೆ</p>
  <div className="grid gap-4 mt-6"><input required type="email" placeholder="Admin email" value={email} onChange={e=>setEmail(e.target.value)} className="border rounded-xl p-3"/>
  <input required type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="border rounded-xl p-3"/>
  <button disabled={busy} className="bg-slate-900 text-white rounded-xl py-3 font-bold">{busy?"Checking...":"Login"}</button></div>
 </form></main>;
}