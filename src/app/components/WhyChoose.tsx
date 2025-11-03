"use client";

import { motion } from "framer-motion";

/* =========================
   Small animated SVG icons
   ========================= */

const IconWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="grid h-16 w-16 place-items-center rounded-full bg-black ring-1 ring-cyan-400/30 shadow-[0_0_25px_rgba(34,211,238,0.35)]">
    {children}
  </div>
);

const IconBolt = () => (
  <motion.svg
    viewBox="0 0 64 64"
    className="h-8 w-8 text-cyan-400"
    animate={{ opacity: [0.8, 1, 0.8] }}
    transition={{ duration: 1.5, repeat: Infinity }}
  >
    <path
      d="M30 6L14 34h12l-2 24 20-32H34l4-20z"
      fill="currentColor"
      stroke="#22d3ee"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </motion.svg>
);

const IconLock = () => (
  <motion.svg
    viewBox="0 0 64 64"
    className="h-8 w-8 text-cyan-400"
    animate={{ y: [0, -1, 0] }}
    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
  >
    <rect
      x="12"
      y="28"
      width="40"
      height="28"
      rx="6"
      fill="none"
      stroke="#22d3ee"
      strokeWidth="2.5"
    />
    <path
      d="M20 28v-6a12 12 0 1124 0v6"
      fill="none"
      stroke="#22d3ee"
      strokeWidth="2.5"
    />
    <circle cx="32" cy="42" r="3" fill="#22d3ee" />
  </motion.svg>
);

const IconGlobe = () => (
  <motion.svg
    viewBox="0 0 64 64"
    className="h-8 w-8 text-cyan-400"
    animate={{ rotate: [0, 6, 0] }}
    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
  >
    <motion.circle cx="32" cy="32" r="20" fill="none" stroke="#22d3ee" strokeWidth="2.5" />
    <motion.ellipse cx="32" cy="32" rx="12" ry="20" fill="none" stroke="#22d3ee" strokeWidth="2.5" />
    <motion.ellipse cx="32" cy="32" rx="20" ry="10" fill="none" stroke="#22d3ee" strokeWidth="2.5" />
  </motion.svg>
);

const IconCoin = () => (
  <motion.svg
    viewBox="0 0 64 64"
    className="h-8 w-8 text-cyan-400"
    animate={{ rotateY: [0, 180, 360] }}
    transition={{ repeat: Infinity, duration: 3.6, ease: "linear" }}
  >
    <circle cx="32" cy="32" r="18" fill="#22d3ee" opacity="0.25" />
    <circle cx="32" cy="32" r="14" fill="none" stroke="#22d3ee" strokeWidth="2.5" />
    <path d="M32 22v20m-6-6h12" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
  </motion.svg>
);

const IconChart = () => (
  <motion.svg viewBox="0 0 64 64" className="h-8 w-8 text-cyan-400">
    <motion.rect
      x="12"
      y="36"
      width="10"
      height="16"
      rx="2"
      fill="#22d3ee"
      animate={{ height: [12, 16, 12] }}
      transition={{ duration: 2.2, repeat: Infinity }}
    />
    <motion.rect
      x="27"
      y="28"
      width="10"
      height="24"
      rx="2"
      fill="#22d3ee"
      animate={{ height: [18, 24, 18] }}
      transition={{ duration: 2.2, repeat: Infinity, delay: 0.15 }}
    />
    <motion.rect
      x="42"
      y="20"
      width="10"
      height="32"
      rx="2"
      fill="#22d3ee"
      animate={{ height: [26, 32, 26] }}
      transition={{ duration: 2.2, repeat: Infinity, delay: 0.3 }}
    />
  </motion.svg>
);

const IconWrench = () => (
  <motion.svg
    viewBox="0 0 64 64"
    className="h-8 w-8 text-cyan-400"
    animate={{ rotate: [0, -10, 0] }}
    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
  >
    <path
      d="M40 10a14 14 0 00-9 4l6 6-8 8-6-6a14 14 0 1017-12z"
      fill="none"
      stroke="#22d3ee"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <circle cx="48" cy="16" r="2" fill="#22d3ee" />
  </motion.svg>
);

/* =========================
   Card & Section
   ========================= */

type Feature = {
  title: string;
  copy: string;
  Icon: React.FC;
};

const features: Feature[] = [
  { title: "Lightning Fast", copy: "Connect in under 2 seconds with our optimized infrastructure and global CDN network.", Icon: IconBolt },
  { title: "Secure & Private", copy: "End-to-end encryption ensures your conversations remain private and secure at all times.", Icon: IconLock },
  { title: "Global Reach", copy: "Works worldwide with 99.9% uptime and support for over 50 languages and regions.", Icon: IconGlobe },
  { title: "Cost Effective", copy: "Reduce communication costs by up to 80% compared to traditional phone systems.", Icon: IconCoin },
  { title: "Analytics Driven", copy: "Detailed insights help you understand your audience and optimize engagement.", Icon: IconChart },
  { title: "Easy Integration", copy: "Seamlessly integrate with your systems through our API and webhooks.", Icon: IconWrench },
];

function FeatureCard({ title, copy, Icon }: Feature) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5 }}
      className="group relative overflow-hidden rounded-2xl border border-cyan-400/15 bg-black/90 p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.06)] backdrop-blur"
    >
      <div className="flex items-start gap-4">
        <IconWrapper>
          <Icon />
        </IconWrapper>
        <div>
          <h3 className="text-xl font-extrabold text-white">{title}</h3>
          <p className="mt-2 text-white/80 leading-relaxed">{copy}</p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-cyan-400/0 transition-all duration-300 group-hover:ring-2 group-hover:ring-cyan-400/30" />
    </motion.div>
  );
}

export default function WhyChoose() {
  return (
    <section className="relative overflow-hidden bg-[#0a0f1a]">
      {/* background glow */}
      <motion.div
        className="pointer-events-none absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl"
        animate={{ scale: [1, 1.06, 1], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* heading */}
        <div className="mx-auto max-w-4xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl font-black"
          >
            <span className="bg-gradient-to-b from-cyan-300 to-white bg-clip-text text-transparent">
              Why Choose Qratech?
            </span>
          </motion.h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-white/80 leading-relaxed">
            Experience the future of instant communication with cutting-edge technology.
          </p>
        </div>

        {/* grid */}
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}
