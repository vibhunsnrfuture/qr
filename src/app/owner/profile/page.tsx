"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user;
      if (!u) return;
      setEmail(u.email ?? "");
      const { data: p } = await supabase.from("profiles").select("full_name").eq("id", u.id).single();
      setName(p?.full_name ?? "");
    });
  }, []);

  async function save() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update({ full_name: name }).eq("id", user.id);
    alert("Saved");
  }

  return (
    <div className="max-w-md p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <div className="text-sm text-zinc-400">Email: {email}</div>
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
      <button className="btn" onClick={save}>Save</button>
    </div>
  );
}
