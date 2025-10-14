"use client";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Create auth user
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const uid = data.user?.id;

    // Insert or update profile in "profiles" table
    if (uid) {
      const { error: insertError } = await supabase
        .from("profiles")
        .upsert({ id: uid, full_name: fullName, role: "owner" }, { onConflict: "id" });

      if (insertError) alert(insertError.message);
      else alert("Sign-up successful! Please verify your email before logging in.");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <h2 className="text-2xl font-semibold">Create Account</h2>
      <input
        className="input"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />
      <input
        className="input"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className="input"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button disabled={loading} className="btn">
        {loading ? "Signing up..." : "Sign Up"}
      </button>

      <p className="text-sm">
        Already have an account?{" "}
        <a className="underline" href="/auth/sign-in">
          Sign in
        </a>
      </p>
    </form>
  );
}
