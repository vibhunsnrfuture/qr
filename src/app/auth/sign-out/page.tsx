"use client";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { motion } from "framer-motion";

export default function SignOut() {
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);

    if (error) return alert(error.message);
    location.href = "/";
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1a] via-[#0b1220] to-[#0f172a] text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/10 shadow-2xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-lg shadow-cyan-500/20"
        >
          👋
        </motion.div>

        <h1 className="text-2xl font-semibold tracking-tight">
          Ready to sign out?
        </h1>
        <p className="mt-2 text-sm text-white/70 max-w-sm mx-auto">
          You can always log back in anytime. Make sure your current work is saved.
        </p>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={signOut}
          disabled={loading}
          className="mt-8 w-full bg-gradient-to-r from-cyan-400 to-indigo-500 py-3 rounded-xl font-medium shadow-lg shadow-cyan-500/30 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-60"
        >
          {loading ? "Signing out..." : "Sign Out"}
        </motion.button>

        <a
          href="/owner/vehicles"
          className="block mt-6 text-sm text-cyan-300 hover:text-cyan-200 underline"
        >
          Go back to dashboard
        </a>
      </motion.div>
    </section>
  );
}
