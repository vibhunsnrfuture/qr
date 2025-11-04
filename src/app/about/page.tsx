"use client";

import { motion } from "framer-motion";
import {
  QrCode,
  PhoneCall,
  Shield,
  GaugeCircle,
  Lock,
  BarChart3,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-[#0b0f1a] to-[#0a0a0f] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 pb-10 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200"
          >
            <Sparkles className="h-3.5 w-3.5" />
            About Qratech
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-3 text-3xl sm:text-5xl font-semibold tracking-tight"
          >
            Scan. Connect. Simplify.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mt-3 text-white/70 max-w-2xl mx-auto"
          >
            We turn static QR codes into live, actionable conversations for people and products—at scale.
          </motion.p>

          {/* Quick features strip */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            <Pill icon={<QrCode className="h-4 w-4" />} label="Smart QR" />
            <Pill icon={<PhoneCall className="h-4 w-4" />} label="Instant Call" />
            <Pill icon={<BarChart3 className="h-4 w-4" />} label="Analytics" />
            <Pill icon={<Lock className="h-4 w-4" />} label="Privacy-first" />
          </motion.div>
        </div>
      </section>

      {/* Mission + Stats */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur p-6"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-cyan-300" />
              <h2 className="text-xl font-semibold">Our Mission</h2>
            </div>
            <p className="text-white/70 mt-2">
              Build the world’s simplest, smartest way to connect people to the right action—instantly—using QR.
            </p>
            <ul className="mt-3 space-y-2">
              <Li icon={<CheckCircle2 className="h-4 w-4 text-cyan-300" />}>
                Frictionless scan → call, chat, or workflow
              </Li>
              <Li icon={<BarChart3 className="h-4 w-4 text-cyan-300" />}>
                Enterprise-grade analytics and device management
              </Li>
              <Li icon={<Lock className="h-4 w-4 text-cyan-300" />}>
                Privacy-first architecture with owner controls
              </Li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur p-6"
          >
            <div className="flex items-center gap-2">
              <GaugeCircle className="h-5 w-5 text-indigo-300" />
              <h2 className="text-xl font-semibold">By the numbers</h2>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <Stat number="500K+" label="Scans tracked" />
              <Stat number="2.4s" label="Avg. connect time" />
              <Stat number="99.95%" label="Uptime" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-cyan-300" />
          <h2 className="text-xl font-semibold">What we value</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <ValueCard
            title="Simplicity"
            desc="One scan. One tap. That’s it."
            icon={<QrCode className="h-5 w-5 text-cyan-300" />}
          />
          <ValueCard
            title="Trust"
            desc="Transparent analytics and strong privacy."
            icon={<Shield className="h-5 w-5 text-cyan-300" />}
          />
          <ValueCard
            title="Scale"
            desc="From one device to a million—same experience."
            icon={<BarChart3 className="h-5 w-5 text-cyan-300" />}
          />
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-indigo-300" />
          <h2 className="text-xl font-semibold">The journey</h2>
        </div>

        <ol className="relative border-l border-white/10 ml-2 space-y-6">
          {[
            {
              year: "2023",
              title: "Prototype",
              desc: "First live call via QR, instant owner connect.",
            },
            {
              year: "2024",
              title: "Platform",
              desc: "Launched dashboard, analytics, and device management.",
            },
            {
              year: "2025",
              title: "Scale",
              desc: "Bulk QR, OEM partnerships, and enterprise rollouts.",
            },
          ].map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * i }}
              className="ml-6"
            >
              <span className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500" />
              <div className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur p-4">
                <div className="text-xs text-cyan-200">{item.year}</div>
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-white/70">{item.desc}</div>
              </div>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="text-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-8"
        >
          <h3 className="text-2xl font-semibold">Ready to connect the world with a scan?</h3>
          <p className="text-white/70 mt-2">Get a demo tailored to your use case in minutes.</p>
          <a
            href="/owner/vehicles"
            className="inline-block mt-4 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 px-6 py-2.5 font-medium shadow-lg shadow-cyan-500/20 hover:opacity-95"
          >
            Get a Demo
          </a>
        </motion.div>
      </section>
    </main>
  );
}

/* ---------------- UI bits ---------------- */

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur p-4 text-center"
    >
      <div className="text-xl font-semibold">{number}</div>
      <div className="text-xs text-white/60">{label}</div>
    </motion.div>
  );
}

function ValueCard({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur p-5"
    >
      <div className="flex items-center gap-2">
        <span className="inline-grid h-8 w-8 place-items-center rounded-lg bg-cyan-400/10 border border-cyan-400/20">
          {icon}
        </span>
        <div className="font-medium">{title}</div>
      </div>
      <div className="text-sm text-white/70 mt-2">{desc}</div>
    </motion.div>
  );
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/80">
      <span className="text-cyan-300">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function Li({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-white/70">
      <span className="mt-0.5">{icon}</span>
      <span>{children}</span>
    </li>
  );
}
