"use client";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { motion } from "framer-motion";

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
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1a] via-[#0b1220] to-[#0f172a] text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/10 shadow-2xl p-8 sm:p-10"
      >
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-lg shadow-cyan-500/20">
            🚀
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Create Account
          </h2>
          <p className="text-sm text-white/70 mt-1">
            Join Qratech and start connecting instantly
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-1 text-sm">
            <label className="text-white/80">Full Name</label>
            <input
              className="w-full rounded-xl bg-white/[0.08] border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/40"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-1 text-sm">
            <label className="text-white/80">Email</label>
            <input
              className="w-full rounded-xl bg-white/[0.08] border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/40"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-1 text-sm">
            <label className="text-white/80">Password</label>
            <input
              className="w-full rounded-xl bg-white/[0.08] border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/40"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            className="w-full mt-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 py-3 font-medium shadow-lg shadow-cyan-500/30 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-20"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-90"
                    fill="currentColor"
                    d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
                  />
                </svg>
                Signing up...
              </span>
            ) : (
              "Sign Up"
            )}
          </motion.button>

          <p className="text-center text-sm text-white/60 mt-3">
            Already have an account?{" "}
            <a
              href="/auth/sign-in"
              className="text-cyan-300 hover:underline hover:text-cyan-200"
            >
              Sign in
            </a>
          </p>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-white/45">
          By signing up, you agree to our{" "}
          <a
            href="/privacy"
            className="underline hover:text-white/70"
          >
            Privacy Policy
          </a>.
        </p>
      </motion.div>
    </section>
  );
}
