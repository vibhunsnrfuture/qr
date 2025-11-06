"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function FoundersMessagePage() {
  return (
    <main className="relative min-h-screen bg-[#050b14] text-white overflow-hidden">
      {/* ambient cyan glow */}
      <motion.div
        className="pointer-events-none absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl"
        animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.06, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* header / hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-8 md:pt-24 md:pb-12">
          <div className="flex flex-col items-start gap-6">
            <motion.span
              className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs tracking-wider text-white/80"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Founder’s Message
            </motion.span>

            <motion.h1
              className="text-3xl md:text-5xl font-semibold tracking-tight"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              Building <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">meaningful</span> tech that feels{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">human</span>
            </motion.h1>

            <motion.p
              className="max-w-3xl text-white/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              At QraTech, our mission is simple: use technology to bridge gaps, simplify lives, and help people connect better—instantly and effortlessly.
            </motion.p>
          </div>
        </div>
      </section>

      {/* content block */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
            {/* left: photo */}
            <motion.div
              className="md:col-span-2 relative"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              {/* subtle red glow behind photo */}
              <motion.div
                className="absolute -inset-6 -z-10 rounded-3xl bg-red-500/20 blur-3xl"
                animate={{ opacity: [0.25, 0.6, 0.25] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
                <Image
                  src="/images/founder.png" // <- update path if needed
                  alt="Adarsha Bhattacharya – Founder & Director, QraTech"
                  width={900}
                  height={1200}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Adarsha Bhattacharya</h3>
                <p className="text-white/60 text-sm">Founder & Director, QraTech</p>
              </div>
            </motion.div>

            {/* right: message card */}
            <motion.div
              className="md:col-span-3"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 p-6 md:p-8">
                {/* cyan corner glow */}
                <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="space-y-5 leading-relaxed text-white/85">
                  <p>
                    At QraTech, our journey began with a simple idea — to make technology more meaningful, accessible,
                    and human-centered. In a world that’s rapidly transforming, our goal is to create digital solutions
                    that bridge gaps, simplify lives, and empower people to connect better.
                  </p>
                  <p>
                    Every product we design is guided by curiosity, innovation, and purpose. We believe technology
                    should not just be smart — it should be intuitive, reliable, and built with empathy for the user.
                  </p>
                  <p>
                    As the founder of QraTech, I take pride in leading a team driven by passion and creativity.
                    Together, we’re committed to pushing boundaries, listening to our users, and continuously improving
                    what we build.
                  </p>
                  <p>
                    Thank you for being a part of our journey. Your trust, feedback, and support inspire us to keep
                    innovating — one idea, one solution, one experience at a time.
                  </p>

                  {/* signature */}
                  <div className="pt-4">
                    <div className="text-lg font-medium">– Adarsha Bhattacharya</div>
                    <div className="text-white/60">Founder & Director, QraTech</div>
                  </div>
                </div>
              </div>

              {/* small CTA row (optional) */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="/contact"
                  className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-semibold text-black shadow-[0_0_25px_rgba(34,211,238,0.45)] hover:shadow-[0_0_35px_rgba(34,211,238,0.75)] transition"
                >
                  Get in touch
                </a>
                <a
                  href="/use"
                  className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-white/90 hover:bg-white/10 transition"
                >
                  Explore use-cases
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* bottom spacer glow */}
      <motion.div
        className="pointer-events-none absolute bottom-[-140px] left-1/2 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl"
        animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.04, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </main>
  );
}
