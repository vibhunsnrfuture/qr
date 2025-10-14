"use client";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function SignIn() {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);
    location.href = "/owner/vehicles";
  }

  return (
    <form onSubmit={submit} className="max-w-md space-y-3">
      <h2 className="text-xl font-semibold">Sign in</h2>
      <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button className="btn">Sign in</button>
      <p className="text-sm">or <a className="underline" href="/auth/otp">Phone OTP</a></p>
    </form>
  );
}
