"use client";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function SignUp() {
  const [email, setEmail] = useState("");   // using email for password auth
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName || !phone || !email || !password) {
      return alert("Please fill in all fields");
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) return alert(error.message);

    if (!data.user || !data.user.id) {
      return alert("User data not available after signup");
    }

    const uid = data.user.id;

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ id: uid, full_name: fullName, phone, role: "owner" }, { onConflict: "id" });

    if (profileError) return alert(profileError.message);

    alert("Check your email to verify, then sign in.");
  }

  return (
    <form onSubmit={submit} className="max-w-md mx-auto space-y-3 p-4 border rounded shadow-md">
      <h2 className="text-xl font-semibold">Create owner account</h2>
      <input
        className="input w-full"
        placeholder="Full name"
        value={fullName}
        onChange={e => setFullName(e.target.value)}
      />
      <input
        className="input w-full"
        placeholder="Phone (+91...)"
        value={phone}
        onChange={e => setPhone(e.target.value)}
      />
      <input
        className="input w-full"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        className="input w-full"
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button className="btn w-full" disabled={loading}>
        {loading ? "Signing up..." : "Sign up"}
      </button>
      <p className="text-sm">
        or <a className="underline" href="/(auth)/phone-otp">Use phone OTP</a>
      </p>
    </form>
  );
}
