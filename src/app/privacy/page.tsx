"use client";

import { motion } from "framer-motion";
import {
  FiShield, FiLock, FiUser, FiDatabase, FiSettings, FiGlobe, FiServer,
  FiAlertCircle, FiDownload, FiMail, FiPhone, FiExternalLink,
  FiKey, FiRotateCcw, FiEyeOff
} from "react-icons/fi";

const updatedAt = "Oct 30, 2025";

/* ---------- Small helpers ---------- */
const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, delay: d },
});

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-white/5 px-3 py-1 text-xs text-cyan-200">
      {children}
    </span>
  );
}

function SectionCard({
  title,
  icon,
  children,
  delay = 0,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      {...fadeUp(delay)}
      className="relative overflow-hidden rounded-2xl border border-cyan-400/15 bg-[#0b1220]/70 p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.06)] backdrop-blur"
    >
      {/* corner glow */}
      <motion.div
        className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/10 blur-2xl"
        animate={{ x: [0, 20, 0], y: [0, 10, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-[radial-gradient(circle_at_30%_30%,#22d3ee_0%,#0ea5b7_55%,#0369a1_100%)] ring-1 ring-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.25)]">
          <div className="text-white">{icon}</div>
        </div>
        <h3 className="text-xl font-extrabold tracking-[-0.01em] text-white">
          {title}
        </h3>
      </div>
      <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-li:leading-relaxed text-white/85">
        {children}
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-cyan-400/0 transition-all duration-300 hover:ring-2 hover:ring-cyan-400/20" />
    </motion.section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0f1a] text-white">
      {/* Ambient lights */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl"
        animate={{ scale: [1, 1.06, 1], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-[-10%] h-[560px] w-[560px] rounded-full bg-indigo-500/10 blur-3xl"
        animate={{ y: [0, -30, 0], opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <motion.header
          {...fadeUp(0)}
          className="mx-auto mb-10 max-w-3xl text-center"
        >
          <motion.h1
            className="text-4xl sm:text-5xl font-black tracking-[-0.02em]"
            style={{ lineHeight: 1.15 }}
          >
            <span className="bg-gradient-to-b from-cyan-300 to-white bg-clip-text text-transparent">
              Qratech Privacy Policy
            </span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.05)}
            className="mx-auto mt-4 max-w-2xl text-lg text-white/80"
          >
            We respect your privacy. This policy explains the data we collect,
            how we use it, and the choices you have. It applies to qratech
            products, websites, and services.
          </motion.p>

          <div className="mt-5 flex items-center justify-center gap-3">
            <Pill>
              <FiShield className="text-cyan-300" />
              GDPR & CCPA Ready
            </Pill>
            <Pill>
              <FiLock className="text-cyan-300" />
              Security by Design
            </Pill>
            <Pill>
              Last Updated: {updatedAt}
            </Pill>
          </div>
        </motion.header>

        <div className="grid gap-6">
          <SectionCard title="Information We Collect" icon={<FiDatabase size={20} />} delay={0.05}>
            <ul>
              <li><b>Account Data:</b> name, email, password hash, phone (optional), profile info.</li>
              <li><b>QR Usage Data:</b> scan timestamps, device type, approximate location (city/region), referral source.</li>
              <li><b>Technical Data:</b> IP address (short-retained), browser, OS, app version, crash logs.</li>
              <li><b>Payment Data:</b> handled by PCI-compliant processors; we store non-sensitive references (e.g., last-4, token).</li>
              <li><b>Support Data:</b> messages, attachments, call notes you share with us.</li>
            </ul>
          </SectionCard>

          <SectionCard title="How We Use Data" icon={<FiKey size={20} />} delay={0.1}>
            <ul>
              <li>Provide, operate, and improve Qratech features and reliability.</li>
              <li>Authenticate users, secure accounts, and prevent fraud/abuse.</li>
              <li>Measure performance, diagnose issues, and run analytics.</li>
              <li>Process payments, subscriptions, and customer support requests.</li>
              <li>Send important service notices. With your consent, send product tips or updates (opt-out anytime).</li>
            </ul>
          </SectionCard>

          <SectionCard title="Cookies & Tracking" icon={<FiSettings size={20} />} delay={0.15}>
            <p>
              We use essential cookies for login/session security, and optional cookies for analytics and personalization. 
              You can control optional cookies in your browser and (where shown) in our cookie banner.
            </p>
            <ul className="mt-2">
              <li><b>Essential:</b> required for authentication and core features.</li>
              <li><b>Analytics:</b> usage trends to improve experience (aggregated).</li>
              <li><b>Preferences:</b> remembers settings like language or theme.</li>
            </ul>
          </SectionCard>

          <SectionCard title="Analytics & Third Parties" icon={<FiExternalLink size={20} />} delay={0.2}>
            <p>
              We may use privacy-minded analytics (IP truncation, no cross-site tracking). 
              Payment processing is handled by trusted PCI-compliant providers. 
              Service vendors access only what is necessary to perform their tasks under data-processing agreements.
            </p>
          </SectionCard>

          <SectionCard title="Data Sharing" icon={<FiGlobe size={20} />} delay={0.25}>
            <ul>
              <li><b>With Service Providers:</b> infrastructure, analytics, payments, support tools.</li>
              <li><b>For Legal Reasons:</b> to comply with law, enforce terms, protect users and Qratech.</li>
              <li><b>Mergers/Acquisitions:</b> in corporate transactions, we’ll notify you of any material changes.</li>
              <li>We never sell your personal data.</li>
            </ul>
          </SectionCard>

          <SectionCard title="Data Retention" icon={<FiRotateCcw size={20} />} delay={0.3}>
            <p>
              We keep personal data only as long as needed for the purposes above, accounting for legal, tax, and security requirements.
              Where possible, we aggregate or anonymize data.
            </p>
          </SectionCard>

          <SectionCard title="Your Privacy Choices & Rights" icon={<FiUser size={20} />} delay={0.35}>
            <ul>
              <li><b>Access/Portability:</b> request a copy of your personal data.</li>
              <li><b>Rectification:</b> correct inaccurate or incomplete data.</li>
              <li><b>Deletion:</b> request erasure (subject to lawful exceptions).</li>
              <li><b>Restriction/Object:</b> restrict or object to certain processing.</li>
              <li><b>Marketing Opt-Out:</b> unsubscribe from non-essential communications.</li>
            </ul>
            <p className="mt-2">
              To exercise rights, contact us at <a className="text-cyan-300 underline" href="mailto:privacy@qratech.com">privacy@qratech.com</a>. 
              We’ll verify and respond consistent with applicable laws (e.g., GDPR, CCPA/CPRA).
            </p>
          </SectionCard>

          <SectionCard title="Security" icon={<FiLock size={20} />} delay={0.4}>
            <ul>
              <li>Encryption in transit (TLS) and at rest for sensitive data.</li>
              <li>Least-privilege access, audit logging, and automated alerts.</li>
              <li>Regular vulnerability scanning and secure SDLC practices.</li>
              <li>Employee training and confidentiality obligations.</li>
            </ul>
            <p className="mt-2">
              No method is 100% secure, but we continuously improve our safeguards.
            </p>
          </SectionCard>

          <SectionCard title="International Data Transfers" icon={<FiServer size={20} />} delay={0.45}>
            <p>
              Where data moves across borders, we rely on appropriate safeguards (e.g., Standard Contractual Clauses, 
              adequacy decisions). We take steps to ensure your information receives equivalent protection.
            </p>
          </SectionCard>

          <SectionCard title="Children’s Privacy" icon={<FiAlertCircle size={20} />} delay={0.5}>
            <p>
              Qratech is not directed to children under 13 (or equivalent minimum age in your region). 
              We do not knowingly collect data from children. If you believe a child provided data, 
              contact us to remove it.
            </p>
          </SectionCard>

          <SectionCard title="Do Not Track" icon={<FiEyeOff size={20} />} delay={0.55}>
            <p>
              Some browsers send a “Do Not Track” signal. Because there is no uniform standard, 
              our services may not respond to these signals. We minimize tracking and provide granular choices instead.
            </p>
          </SectionCard>

          <SectionCard title="Changes to This Policy" icon={<FiDownload size={20} />} delay={0.6}>
            <p>
              We may update this policy to reflect changes in our practices. We’ll post updates here and 
              adjust the “Last Updated” date. For material changes, we’ll provide additional notice.
            </p>
          </SectionCard>

          <SectionCard title="Contact Us" icon={<FiMail size={20} />} delay={0.65}>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <FiMail className="text-cyan-300" />
                <a href="mailto:privacy@qratech.com" className="text-cyan-300 underline">
                  privacy@qratech.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="text-cyan-300" />
                <a href="tel:+919876543210" className="text-cyan-300 underline">
                  +91 98765 43210
                </a>
              </div>
            </div>
            <p className="mt-2 text-white/70">
              If you’re in the EU/UK, you may also have the right to lodge a complaint with your local supervisory authority.
            </p>
          </SectionCard>
        </div>

        {/* Footer note */}
        <motion.div {...fadeUp(0.75)} className="mt-10 text-center text-white/60">
          Last Updated: {updatedAt} • © {new Date().getFullYear()} Qratech
        </motion.div>
      </div>
    </main>
  );
}
