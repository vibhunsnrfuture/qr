"use client";

import { motion } from "framer-motion";

/* ---------- Inline icons ---------- */

function ScanIcon() {
  // phone frame + scanning square + animated vertical sweep
  return (
    <div className="relative h-20 w-20 rounded-2xl bg-[#0c1424] border border-cyan-400/40 overflow-hidden grid place-items-center">
      <svg viewBox="0 0 64 64" className="h-14 w-14 text-cyan-300">
        {/* phone bezel */}
        <rect x="8" y="6" width="48" height="52" rx="8" fill="none" stroke="currentColor" strokeWidth="2.5" />
        {/* scanning frame */}
        <rect x="22" y="20" width="20" height="24" rx="6" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* inner square */}
        <rect x="26" y="24" width="12" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>

      {/* sweeping scan line */}
      <motion.div
        className="absolute left-3 right-3 top-8 h-1 bg-cyan-400/70"
        animate={{ y: [0, 26, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
      />
      {/* soft inner glow */}
      <div className="pointer-events-none absolute inset-0 bg-cyan-400/5" />
    </div>
  );
}

function LinkIcon() {
  return (
    <div className="h-20 w-20 rounded-2xl bg-[#0c1424] border border-cyan-400/40 grid place-items-center">
      <motion.svg
        viewBox="0 0 64 64"
        className="h-14 w-14 text-cyan-300"
        animate={{ rotate: [0, -3, 3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M26 40l-4 4a8 8 0 01-11-11l4-4M38 24l4-4a8 8 0 0111 11l-4 4M28 36l8-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    </div>
  );
}

function ChatIcon() {
  return (
    <div className="h-20 w-20 rounded-2xl bg-[#0c1424] border border-cyan-400/40 grid place-items-center">
      <motion.svg
        viewBox="0 0 64 64"
        className="h-14 w-14 text-cyan-300"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M12 18h40v22a8 8 0 01-8 8H28l-8 6v-6h-8a8 8 0 01-8-8V18z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="30" r="2.8" fill="currentColor" />
        <circle cx="32" cy="30" r="2.8" fill="currentColor" />
        <circle cx="40" cy="30" r="2.8" fill="currentColor" />
      </motion.svg>
    </div>
  );
}

/* ---------- Step card ---------- */

function Step({
  step,
  title,
  desc,
  icon,
  delay = 0,
}: {
  step: number;
  title: string;
  desc: string;
  icon: "scan" | "link" | "chat";
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay }}
      className="text-center"
    >
      {/* number bubble with pulsing halo */}
      <div className="relative mx-auto mb-6 h-20 w-20">
        <motion.div
          className="absolute inset-0 rounded-full bg-cyan-500/20 blur-2xl"
          animate={{ opacity: [0.45, 0.9, 0.45], scale: [1, 1.06, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative grid h-20 w-20 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#24e8ff_0%,#00b4d8_45%,#0088cc_70%,#005b9a_100%)] text-white text-3xl font-extrabold shadow-[0_0_30px_8px_rgba(34,211,238,0.2)]">
          {step}
        </div>
      </div>

      {/* icon box */}
      <div className="mx-auto mb-6 flex h-[96px] w-[96px] items-center justify-center rounded-2xl border border-cyan-400/40 bg-[#0c1424] shadow-[0_0_20px_rgba(34,211,238,0.1)]">
  {icon === "scan" && <ScanIcon />}
  {icon === "link" && <LinkIcon />}
  {icon === "chat" && <ChatIcon />}
</div>

      <h3 className="text-2xl font-extrabold tracking-[-0.02em] text-cyan-300">{title}</h3>
      <p className="mx-auto mt-4 max-w-md text-white/80 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* ---------- Section ---------- */

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-[#0a0f1a]">
      {/* animated background light */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(0,174,255,0.07),transparent_60%)]" />
      <motion.div
        className="pointer-events-none absolute -left-24 top-1/3 h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-3xl"
        animate={{ x: [0, 60, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute right-0 top-1/2 h-[480px] w-[480px] rounded-full bg-indigo-500/10 blur-3xl"
        animate={{ y: [0, -50, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            className="absolute left-1/2 -z-10 h-48 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl"
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.05, 1] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.02em]">
            <span className="bg-gradient-to-b from-cyan-300 to-white bg-clip-text text-transparent">
              How Qratech Works
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-white/80 leading-relaxed">
            Simple 3-step process to revolutionize your communication experience
          </p>
        </div>

        {/* Steps */}
        <div className="mt-14 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          <Step
            step={1}
            icon="scan"
            title="Scan QR Code"
            desc="Point your smartphone camera at any Qratech QR. No special app needed — works with any standard camera on iOS or Android."
            delay={0}
          />
          <Step
            step={2}
            icon="link"
            title="Get Connected"
            desc="Connect to the QR owner through our secure bridge in milliseconds with end-to-end encryption."
            delay={0.08}
          />
          <Step
            step={3}
            icon="chat"
            title="Talk Instantly"
            desc="Start a conversation immediately via voice — connect in seconds."
            delay={0.16}
          />
        </div>
      </div>
    </section>
  );
}
