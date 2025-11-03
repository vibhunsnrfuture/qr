"use client";

import { motion } from "framer-motion";

/** ----------------------------- */
/** Small, self-contained SVG icons wrapped in a gradient badge */
function IconBadge({ type }: { type:
  | "phone" | "bell" | "chart" | "bot" | "cloud" | "mobile"
}) {
  return (
    <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_30%_30%,#24e8ff_0%,#00b4d8_35%,#0088cc_65%,#005b9a_100%)] shadow-[0_0_40px_8px_rgba(34,211,238,0.15)] grid place-items-center">
      <svg viewBox="0 0 48 48" className="h-14 w-14 text-cyan-100">
        {type === "phone" && (
          <path
            d="M31.5 33.2l-2.7 2.7c-1 .9-2.7.8-4.8-.2-2.4-1.1-5.1-3.1-7.5-5.6C13 27.6 11 25 9.9 22.6c-1-2.1-1.1-3.8-.2-4.8l2.7-2.7a2 2 0 012.2-.45l3.1 1.3c1 .4 1.6 1.6 1.3 2.6l-.6 2c-.1.4 0 .8.3 1.1l6 6a1.2 1.2 0 001.1.3l2-.6c1-.3 2.1.3 2.6 1.3l1.3 3.1c.4.8.2 1.7-.4 2.2z"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          />
        )}
        {type === "bell" && (
          <>
            <path d="M24 40a4 4 0 004-4h-8a4 4 0 004 4z" fill="currentColor" />
            <path d="M36 30H12c2-3 3-6 3-11a9 9 0 0118 0c0 5 1 8 3 11z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}
        {type === "chart" && (
          <>
            <rect x="8" y="30" width="6" height="10" rx="2" fill="currentColor" />
            <rect x="21" y="24" width="6" height="16" rx="2" fill="currentColor" />
            <rect x="34" y="18" width="6" height="22" rx="2" fill="currentColor" />
          </>
        )}
        {type === "bot" && (
          <>
            <rect x="10" y="16" width="28" height="20" rx="6" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="19" cy="26" r="2.5" fill="currentColor" />
            <circle cx="29" cy="26" r="2.5" fill="currentColor" />
            <path d="M24 10v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}
        {type === "cloud" && (
          <path
            d="M33 34a7 7 0 000-14 9 9 0 00-17-2 6 6 0 00-2 12"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          />
        )}
        {type === "mobile" && (
          <rect x="16" y="8" width="16" height="32" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
        )}
      </svg>
    </div>
  );
}

/** ----------------------------- */
/** Card */
function FeatureCard({
  title,
  desc,
  icon,
  delay = 0,
}: {
  title: string;
  desc: string;
  icon: React.ComponentProps<typeof IconBadge>["type"];
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -6 }}
      className="relative rounded-3xl bg-[#0f1b2d] px-8 pb-10 pt-10 shadow-[0_0_0_1px_rgba(59,130,246,0.08)]"
    >
      {/* soft card border glow */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-cyan-400/10" />
      {/* bottom cyan glow shadow */}
      <div className="pointer-events-none absolute -bottom-6 left-1/2 h-12 w-4/5 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-2xl" />

      <motion.div
        className="relative"
        animate={{ translateY: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
      >
        <IconBadge type={icon} />
      </motion.div>

      <h3 className="text-center text-2xl font-extrabold tracking-[-0.02em] text-cyan-300">
        {title}
      </h3>
      <p className="mt-4 text-center text-white/80 leading-relaxed">
        {desc}
      </p>
    </motion.div>
  );
}

/** ----------------------------- */
/** Section */
export default function Features() {
  const featuresTop = [
    {
      title: "QR Calling",
      icon: "phone" as const,
      desc:
        "Scan any QR code to instantly connect with the owner. No phone numbers needed, no apps required.",
    },
    {
      title: "Real-time Notifications",
      icon: "bell" as const,
      desc:
        "Get instant alerts when someone scans your QR code. Never miss a lead or a call.",
    },
    {
      title: "Smart Dashboard",
      icon: "chart" as const,
      desc:
        "Track all interactions, analyze scan patterns, and manage your QR communications from one place.",
    },
  ];

  const featuresBottom = [
    {
      title: "AI Assistant",
      icon: "bot" as const,
      desc:
        "Smart AI handles calls when you're offline, takes messages, and auto-responds to common queries 24/7.",
    },
    {
      title: "Cloud Integration",
      icon: "cloud" as const,
      desc:
        "All your data stays in sync with enterprise-grade security. Access history from anywhere, anytime.",
    },
    {
      title: "Mobile Optimized",
      icon: "mobile" as const,
      desc:
        "Works perfectly on any device with a camera. No special hardware — just scan and connect.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#0a0f1a]">
      {/* section backdrop gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(15,27,45,0),rgba(0,174,255,0.06)_40%,transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        {/* Heading + sub */}
        <div className="mx-auto max-w-4xl text-center">
          {/* pulsing glow */}
          <motion.div
            className="absolute left-1/2 top-6 -z-10 h-48 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl"
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3.6, ease: "easeInOut" }}
          />
          <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.02em]">
            <span className="bg-gradient-to-b from-cyan-300 to-white bg-clip-text text-transparent">
              Instant QR Communication Platform
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg text-white/80 leading-relaxed">
            Transform any surface into a direct communication gateway with our
            revolutionary QR technology that connects people instantly without
            barriers
          </p>
        </div>

        {/* Animated cross-grid cyan light (between cards) */}
        <div className="pointer-events-none absolute left-1/2 top-[58%] -z-10 h-[520px] w-[520px] -translate-x-1/2 rounded-[40%] bg-[radial-gradient(circle,rgba(34,211,238,0.13)_0%,rgba(34,211,238,0.08)_30%,transparent_60%)] blur-2xl" />
        <motion.div
          className="pointer-events-none absolute left-1/2 top-[58%] -z-10 h-[540px] w-[540px] -translate-x-1/2 rounded-[42%] bg-[conic-gradient(from_0deg,rgba(34,211,238,0.07),transparent_50%,rgba(34,211,238,0.07))] blur-[70px]"
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
        />

        {/* Grid */}
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuresTop.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 0.08} />
          ))}
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuresBottom.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={0.24 + i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}
