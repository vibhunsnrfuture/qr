"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Car,
  QrCode,
  PhoneCall,
  Shield,
  Users,
  Settings2,
  ArrowRightCircle,
} from "lucide-react";

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* soft glow background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-white/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] translate-x-1/3 translate-y-1/3 rounded-full bg-gradient-to-t from-white/10 to-transparent blur-3xl" />
      </div>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.06 }}
          className="text-center"
        >
          <motion.h1
            variants={fade}
            className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight md:text-6xl"
          >
            Scan ➜ Call
            <span className="block text-white/60">QR se direct call, zero friction.</span>
          </motion.h1>

          <motion.p
            variants={fade}
            className="mx-auto mt-4 max-w-2xl text-white/70 md:text-lg"
          >
            Owners apni gaadi add karein, QR print karein. Guest bas scan karke
            seedha call kare. Admin sab manage karta hai.
          </motion.p>

          <motion.div
            variants={fade}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <Link
              href="/auth/sign-up"
              className="rounded-xl bg-white px-5 py-3 font-medium text-black hover:opacity-90"
            >
              Get started
            </Link>
            <Link
              href="/scan/vehicles"
              className="group inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-white/90 hover:bg-white/5"
            >
              Demo scan
              <ArrowRightCircle className="size-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Quick Stats / Steps */}
        <motion.ol
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.08 }}
          className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-3"
        >
          {[
            { n: 1, t: "Sign up", d: "Account banao aur login karo" },
            { n: 2, t: "Add Vehicle", d: "Plate number save karein" },
            { n: 3, t: "Print QR", d: "Scan se seedha call connect" },
          ].map((s) => (
            <motion.li
              key={s.n}
              variants={fade}
              className="rounded-2xl border border-white/15 bg-white/5 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-full bg-white/10 text-sm font-semibold">
                  {s.n}
                </div>
                <div>
                  <div className="font-semibold">{s.t}</div>
                  <div className="text-sm text-white/60">{s.d}</div>
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </section>

      {/* FEATURES GRID */}
      <section className="mx-auto max-w-6xl px-6 pb-14">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: 0.06 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {[
            {
              icon: Car,
              title: "Vehicle Library",
              desc: "Multiple gaadiyan add karein; ek tap me manage.",
            },
            {
              icon: QrCode,
              title: "Instant QR",
              desc: "Plate se auto‑QR; print ya share karein.",
            },
            {
              icon: PhoneCall,
              title: "One‑tap Call",
              desc: "Guest scan kare aur turant call connect.",
            },
            {
              icon: Shield,
              title: "Secure by RLS",
              desc: "Har user ko sirf apna data dikhe (Supabase RLS).",
            },
            {
              icon: Users,
              title: "Admin Controls",
              desc: "Admins sab users aur vehicles dekh/disable kar sakte hain.",
            },
            {
              icon: Settings2,
              title: "Edge Functions",
              desc: "Agora token server-side generate hota hai.",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              variants={fade}
              whileHover={{ y: -4 }}
              className="group rounded-2xl border border-white/15 bg-white/5 p-5"
            >
              <div className="mb-3 inline-flex size-11 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                <f.icon className="size-5" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-white/70">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* DEMO PREVIEW */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 items-center gap-6 rounded-3xl border border-white/15 bg-white/5 p-6 md:grid-cols-2"
        >
          <div>
            <h3 className="text-xl font-semibold">Vehicle Card Preview</h3>
            <p className="mt-2 text-sm text-white/70">
              Owner side se plate add hote hi QR ready. Guest is card ko scan karte hi
              direct call connect ho jata hai.
            </p>
            <div className="mt-4 flex gap-3">
              <Link href="/owner/vehicles" className="rounded-xl bg-white px-4 py-2 text-black">
                Add Vehicle
              </Link>
              <Link href="/scan/UP20BB1234" className="rounded-xl border border-white/20 px-4 py-2">
                Try Scan
              </Link>
            </div>
          </div>

          {/* fake card */}
          <div className="mx-auto w-full max-w-sm">
            <div className="rounded-2xl border border-white/15 bg-zinc-950/60 p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-white/10">
                    <Car className="size-5" />
                  </div>
                  <div>
                    <div className="text-sm text-white/60">Plate</div>
                    <div className="font-semibold tracking-wider">UP20BB1234</div>
                  </div>
                </div>
                <div className="grid size-20 place-items-center rounded-lg border border-white/15 bg-white/10">
                  {/* animated QR shimmer */}
                  <motion.div
                    className="size-12 rounded bg-white/80"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 2.2 }}
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-white/60">
                <span className="rounded-full border border-white/10 px-2 py-1">Active</span>
                <span className="rounded-full border border-white/10 px-2 py-1">Owner‑only</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
