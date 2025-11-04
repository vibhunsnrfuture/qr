"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaEnvelope, FaPhoneAlt, FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="relative bg-[#050b14] text-white overflow-hidden pt-16 pb-6">
      {/* animated bg glow */}
      <motion.div
        className="pointer-events-none absolute top-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl"
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Left section - logo and info */}
        <div className="relative">
          {/* 🔴 Neon red glow behind logo */}
          <motion.div
            className="absolute -top-6 -left-8 h-[150px] w-[150px] rounded-full bg-red-500/30 blur-2xl z-0"
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.1, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="flex items-center gap-3 mb-4 relative z-10">
            {/* ✅ White background box added behind logo */}
            <div className="bg-white rounded-lg p-2 shadow-lg">
              <Image
                src="/images/logo.png"
                alt="Qratech Logo"
                width={100}
                height={100}
                className="rounded-md object-contain"
                priority
              />
            </div>
            <h3 className="text-xl font-semibold tracking-wide">Scan • Connect • Instantly</h3>
          </div>

          <p className="text-white/80 leading-relaxed relative z-10">
            Revolutionizing communication through innovative QR technology.
            Connect instantly, communicate effortlessly, and transform how you
            interact with the world.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xl font-semibold text-cyan-400 mb-4">Quick Links</h4>
          <ul className="space-y-2 text-white/80">
            <li>
              <Link href="/" className="hover:text-cyan-300 transition">
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-cyan-300 transition">
                About
              </Link>
            </li>
            <li>
              <Link
                href="/owner/vehicles"
                className="hover:text-cyan-300 transition"
              >
                My Vehicles
              </Link>
            </li>
            <li>
              <Link href="/use" className="hover:text-cyan-300 transition">
                Use-Cases
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-xl font-semibold text-cyan-400 mb-4">Support</h4>
          <ul className="space-y-2 text-white/80">
            <li>
              <Link href="/privacy" className="hover:text-cyan-300 transition">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-cyan-300 transition">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-cyan-300 transition">
                Help Center
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="relative mx-auto max-w-7xl border-t border-cyan-400/10 mt-12 mb-6" />

      {/* Contact + CTA */}
      <div className="relative mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-white/80 text-sm sm:text-base">
          <div className="flex items-center gap-2">
            <FaEnvelope className="text-cyan-400" />
            <span>support@qratech.com</span>
          </div>
          <a
            href="tel:+919933309571"
            className="flex items-center gap-2 hover:text-cyan-300 transition"
          >
            <FaPhoneAlt className="text-cyan-400" />
            <span>+91 9933309571</span>
          </a>

          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/919933309571"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-green-400 transition"
            >
              <FaWhatsapp className="text-green-400" />
              <span>+91-9933309571</span>
            </a>
          </div>
        </div>

        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="/owner/vehicles"
          className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold px-6 py-3 rounded-full shadow-[0_0_25px_rgba(34,211,238,0.5)] hover:shadow-[0_0_35px_rgba(34,211,238,0.8)] transition"
        >
          Get Your QR
        </motion.a>
      </div>

      {/* bottom line */}
      <p className="text-center text-white/60 text-sm mt-8">
        © {new Date().getFullYear()} Qratech. All rights reserved.
      </p>
    </footer>
  );
}
