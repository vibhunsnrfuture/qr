"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

/** Tiny count-up hook (unchanged) */
function useCountUp({
  end,
  duration = 1500,
  decimals = 0,
}: { end: number; duration?: number; decimals?: number }) {
  const [val, setVal] = useState(0);
  const raf = useRef<number | null>(null);
  const t0 = useRef<number | null>(null);

  useEffect(() => {
    const step = (t: number) => {
      if (t0.current == null) t0.current = t;
      const p = Math.min(1, (t - t0.current) / duration);
      const cur = end * (1 - Math.pow(1 - p, 3));
      setVal(cur);
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      t0.current = null;
    };
  }, [end, duration]);

  return useMemo(() => val.toFixed(decimals), [val, decimals]);
}

type HeroProps = { imageSrc?: string };

export default function Hero({
  imageSrc = "/images/HOME-QR.png",
}: HeroProps) {
  const users = useCountUp({ end: 5000, duration: 1600 });
  const scans = useCountUp({ end: 25000, duration: 1800 });
  const uptime = useCountUp({ end: 99.9, duration: 2000, decimals: 1 });

  return (
    <section className="relative overflow-hidden bg-[#0a0f1a] text-white">
      {/* BG glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_65%_at_20%_20%,rgba(34,211,238,0.12),transparent_60%),radial-gradient(60%_60%_at_80%_20%,rgba(99,102,241,0.12),transparent_60%)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-16">
        {/* LEFT */}
        <div className="space-y-6">
          <p className="text-xs font-semibold tracking-[0.25em] text-cyan-300">
            SCAN. CONNECT. COMMUNICATE INSTANTLY.
          </p>

          <div className="relative">
            <motion.div
              className="absolute -inset-8 rounded-full blur-3xl bg-cyan-500/20"
              animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            />
            <motion.h1
              animate={{
                textShadow: [
                  "0 0 20px rgba(34,211,238,0.6)",
                  "0 0 40px rgba(34,211,238,0.8)",
                  "0 0 20px rgba(34,211,238,0.6)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 text-5xl sm:text-7xl font-black leading-[1.1] tracking-[-0.03em]"
            >
              <span className="block bg-gradient-to-r from-[#00bfff] to-white bg-clip-text text-transparent">
                Scan to Connect
              </span>
              <span className="block bg-gradient-to-r from-white to-[#00bfff] bg-clip-text text-transparent">
                Instantly
              </span>
            </motion.h1>
          </div>

          <p className="max-w-xl text-[1.2rem] font-semibold text-white/85 leading-relaxed">
            No apps. No numbers. Just scan to talk. Transform any surface into a
            direct communication gateway with revolutionary QR technology that
            bridges the gap between physical and digital interaction.
          </p>

          {/* Stats */}
          <div className="mt-6 grid max-w-xl grid-cols-3 gap-4">
            <div>
              <div className="text-3xl font-bold tracking-tight text-cyan-300">
                {Number(users).toLocaleString()}+
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-wider text-white/60">
                Active Users
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold tracking-tight text-cyan-300">
                {Number(scans).toLocaleString()}+
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-wider text-white/60">
                QR Scans
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold tracking-tight text-cyan-300">
                {uptime}%
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-wider text-white/60">
                Uptime
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col items-start gap-4 pt-2 sm:flex-row">
            <a
              href="/contact"
              className="rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 px-6 py-3 font-medium shadow-lg shadow-cyan-500/20 hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              Get Your QR
            </a>
            <a
              href="/use"
              className="rounded-full border border-cyan-400/40 bg-white/5 px-6 py-3 font-medium text-cyan-100 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              Watch Demo
            </a>
          </div>
        </div>

        {/* RIGHT: compact PHONE with centered scan line */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1, scale: [0.99, 1, 0.99] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="relative mx-auto w-full max-w-[320px] sm:max-w-[360px] md:max-w-[400px]"
        >
          <div className="relative mx-auto w-full">
            {/* Shorter phone: aspect 9/14 (less tall) */}
            <div className="relative mx-auto w-full aspect-[9/14] max-w-[360px] rounded-[1.8rem] border border-white/15 bg-gradient-to-b from-slate-900 to-slate-950 p-2 shadow-2xl shadow-cyan-500/20">
              {/* Bezel shine */}
              <div className="pointer-events-none absolute inset-0 rounded-[1.8rem] ring-1 ring-white/10" />

              {/* Notch */}
              <div className="absolute top-1.5 left-1/2 z-20 h-4 w-32 -translate-x-1/2 rounded-b-2xl bg-black/70 backdrop-blur border-x border-b border-white/10" />

              {/* Buttons hint */}
              <div className="absolute left-0 top-20 h-8 w-1 rounded-r bg-white/10" />
              <div className="absolute right-0 top-28 h-14 w-1 rounded-l bg-white/10" />

              {/* Screen */}
              <div className="relative z-10 h-full w-full overflow-hidden rounded-[1.4rem] border border-white/10 bg-black">
                {/* Wallpaper pulse */}
                <motion.div
                  className="absolute inset-0 bg-[radial-gradient(70%_60%_at_30%_20%,rgba(34,211,238,0.20),transparent_60%),radial-gradient(70%_60%_at_80%_20%,rgba(99,102,241,0.18),transparent_60%)]"
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ repeat: Infinity, duration: 6 }}
                />

                {/* App/preview image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSrc}
                  alt="Scan to Call preview"
                  className="absolute inset-0 h-full w-full object-contain opacity-90"
                />

                {/* QR frame */}
                <motion.div
                  className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-cyan-400/50 bg-cyan-400/10 backdrop-blur-[2px]"
                  style={{ width: "9rem", height: "9rem" }} // 144px box (responsive enough)
                  initial={{ opacity: 0.9, scale: 0.98 }}
                  animate={{ opacity: [0.9, 1, 0.9], scale: [0.98, 1, 0.98] }}
                  transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
                >
                  <div className="absolute inset-2 rounded-lg border-2 border-cyan-400/80" />
                </motion.div>

                {/* Scan line: centered, equal travel up & down */}
                <motion.div
                  className="pointer-events-none absolute left-8 right-8 z-10 h-1.5 rounded bg-cyan-400/70"
                  style={{ top: "50%" }}
                  animate={{ y: [-110, 110, -110] }} // equal distance from center
                  transition={{ repeat: Infinity, duration: 2.4, ease: "linear" }}
                />

                {/* Status */}
                <motion.p
                  className="absolute bottom-4 left-0 right-0 z-10 text-center text-[12px] tracking-wide text-cyan-200"
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  Scanning…
                </motion.p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
