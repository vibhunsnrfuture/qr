"use client";

import { useState } from "react";
// import Link from "next/link";

type Topic = "bulk-qr" | "contract" | "helpline" | "fraud";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  topic: Topic;
  message: string;
};

export default function ContactsPage() {
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    phone: "",
    topic: "bulk-qr",
    message: "",
  });

  function handleChange<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((s) => ({ ...s, [key]: val }));
  }

  function toWhatsAppText(f: FormState) {
    return [
      "📞 *Qratech Contact Request*",
      `• Name: ${f.fullName || "-"}`,
      `• Email: ${f.email || "-"}`,
      `• Phone: ${f.phone || "-"}`,
      `• Topic: ${
        f.topic === "bulk-qr"
          ? "Bulk QR Orders"
          : f.topic === "contract"
          ? "Contracts & Partnerships"
          : f.topic === "helpline"
          ? "Helpline / Support"
          : "Report Fraud / Payment"
      }`,
      `• Message:\n${f.message || "-"}`,
    ].join("\n");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim() || !form.phone.trim()) {
      alert("Please enter your name and phone number.");
      return;
    }
    const phoneE164 = "919933309571";
    const text = encodeURIComponent(toWhatsAppText(form));
    window.open(`https://wa.me/${phoneE164}?text=${text}`, "_blank");

    setForm({
      fullName: "",
      email: "",
      phone: "",
      topic: "bulk-qr",
      message: "",
    });
  }

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-[#0b0f1a] to-[#0a0a0f] text-cyan-400">
      {/* Hero (static, no animation) */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-12 pb-8 text-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
            Qratech Support
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold">Contact Us</h1>
          <p className="mt-2 text-white/70 max-w-2xl mx-auto">
            From bulk QR deployments to partnership contracts—our team is here to help.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section id="contact" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Cards (static) */}
          <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-4">
            <QuickCard
              title="Bulk QR Orders"
              desc="Order thousands of branded QR tags with tracking."
              badge="Priority"
              onClick={() => handleChange("topic", "bulk-qr")}
            />
            <QuickCard
              title="Contracts & Partnerships"
              desc="Partner with us—OEMs, enterprises & channels."
              badge="Legal"
              onClick={() => handleChange("topic", "contract")}
            />
            <QuickCard
              title="Helpline / Support"
              desc="Account, device, or dashboard help."
              badge="Live"
              onClick={() => handleChange("topic", "helpline")}
            />
            <QuickCard
              title="Report Fraud / Payments"
              desc="Flag suspicious scans or payment issues."
              badge="Safe"
              onClick={() => handleChange("topic", "fraud")}
            />
          </div>

          {/* Form (static) */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Tell us what you need</h2>
            <p className="text-sm text-white/60">We usually reply within a few hours on business days.</p>

            <form onSubmit={onSubmit} className="mt-5 grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="Full Name"
                  value={form.fullName}
                  onChange={(v) => handleChange("fullName", v)}
                  placeholder="Your name"
                  autoComplete="name"
                />
                <Field
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => handleChange("email", v)}
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="Phone"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => handleChange("phone", v)}
                  placeholder="+91 98xxxxxx"
                  autoComplete="tel"
                />
                <Select
                  label="Topic"
                  value={form.topic}
                  onChange={(v) => handleChange("topic", v as Topic)}
                  options={[
                    { value: "bulk-qr", label: "Bulk QR Orders" },
                    { value: "contract", label: "Contracts & Partnerships" },
                    { value: "helpline", label: "Helpline / Support" },
                    { value: "fraud", label: "Report Fraud / Payment" },
                  ]}
                />
              </div>

              <TextArea
                label="Message"
                value={form.message}
                onChange={(v) => handleChange("message", v)}
                placeholder="Share details—volume, timeline, links, or issue description…"
              />

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  className="rounded-xl bg-gradient-to-r from-black-400 to-black-500 px-5 py-2.5 font-medium shadow-lg shadow-cyan-500/20 hover:opacity-95"
                >
                  Submit via WhatsApp
                </button>
                <span className="text-xs text-white/50">
                  You can also reach us at{" "}
                  <a
                    href="https://wa.me/919933309571"
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-300 hover:underline"
                  >
                    +91 9933309571
                  </a>
                  .
                </span>
              </div>
            </form>
          </div>
        </div>

        {/* Other ways (static) */}
        <div className="mt-10 grid md:grid-cols-3 gap-4">
          <InfoTile
            title="Email"
            content={<a className="hover:underline" href="mailto:support@qratech.app">support@qratech.app</a>}
          />
          <InfoTile title="Helpline" content={<span>+91-9933309571 (09:00–18:00 IST)</span>} />
          <InfoTile title="Address" content={<span>Pune — Qratech HQ</span>} />
        </div>
      </section>
    </main>
  );
}

/* ---------------- Reusable UI ---------------- */

function QuickCard({
  title,
  desc,
  badge,
  onClick,
}: {
  title: string;
  desc: string;
  badge: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur p-4 hover:border-cyan-400/40"
    >
      <div className="mb-2 inline-flex items-center gap-2 text-[11px] rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-cyan-200">
        {badge}
      </div>
      <div className="font-medium">{title}</div>
      <div className="text-sm text-white/65 mt-1">{desc}</div>
      <div className="mt-2 text-xs text-cyan-300 opacity-0 group-hover:opacity-100 transition">
        Prefill topic in the form →
      </div>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-white/80">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 outline-none focus:ring-2 focus:ring-cyan-500/40"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-white/80">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 outline-none focus:ring-2 focus:ring-cyan-500/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-white/80">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={5}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 outline-none focus:ring-2 focus:ring-cyan-500/40"
      />
    </label>
  );
}

function InfoTile({ title, content }: { title: string; content: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur p-4">
      <div className="text-sm text-white/60">{title}</div>
      <div className="mt-1">{content}</div>
    </div>
  );
}
