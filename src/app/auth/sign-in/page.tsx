"use client";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { motion } from "framer-motion";

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
    <section className="min-h-[100vh] flex items-center justify-center bg-gradient-to-br from-[#0a0f1a] via-[#0b1220] to-[#0f172a] text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/10 shadow-2xl p-8 sm:p-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-lg shadow-cyan-500/20 mb-3"
          >
            🔐
          </motion.div>
          <h2 className="text-2xl font-semibold tracking-tight">Welcome Back</h2>
          <p className="text-sm text-white/70 mt-1">
            Sign in to access your dashboard
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-white/80">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-white/[0.08] border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/40 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-white/80">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-white/[0.08] border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/40 text-sm"
              required
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            className="w-full mt-4 bg-gradient-to-r from-cyan-400 to-indigo-500 py-3 rounded-xl font-medium shadow-lg shadow-cyan-500/30 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          >
            Sign In
          </motion.button>

          <p className="text-center text-sm text-white/60 mt-3">
            or{" "}
            <a
              href="/auth/otp"
              className="text-cyan-300 hover:underline hover:text-cyan-200"
            >
              Sign in with Phone OTP
            </a>
          </p>
        </form>
      </motion.div>
    </section>
  );
}
