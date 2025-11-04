"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { AnimatePresence, motion } from "framer-motion";

type Profile = { id: string; full_name: string | null };

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/use", label: "Use Cases" },
    { href: "/contact", label: "Contact" },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      if (u) loadProfile(u.id);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadProfile(u.id);
      else setProfile(null);
    });

    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    window.addEventListener("click", onClick);

    return () => {
      sub?.subscription?.unsubscribe();
      window.removeEventListener("click", onClick);
    };
  }, []);

  async function loadProfile(id: string) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("id", id)
      .single();
    setProfile(data || null);
  }

  async function signOut() {
    await supabase.auth.signOut();
    location.href = "/";
  }

  const initials =
    profile?.full_name?.trim()?.[0]?.toUpperCase() ??
    user?.email?.[0]?.toUpperCase() ??
    "U";

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const sheetVariants = {
    hidden: { opacity: 0, y: -12 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  };

  return (
    <header className="relative z-10 bg-[#0a0f1a]">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Row */}
        <div className="flex items-center justify-between py-4">
          {/* Brand + Logo with glow */}
          <Link href="/" className="flex items-center gap-3 text-white">
            <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-md ring-1 ring-white/30 overflow-hidden">
              {/* Red or white glow for contrast */}
              <div
                className="pointer-events-none absolute -inset-2 rounded-2xl bg-red-500/25 blur-xl"
                aria-hidden
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo.png" // replace with your logo path
                alt="Qratech logo"
                className="relative max-h-16 w-auto object-contain"
              />
            </div>

            <span className="font-semibold tracking-wide text-lg">
              Qratech
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-white/80 hover:text-white"
              >
                {l.label}
              </a>
            ))}

            <Link
              href="/owner/vehicles"
              className="text-sm text-white/80 hover:text-white"
            >
              Vehicles & QR
            </Link>

            {user && (
              <>
                <Link
                  href="/owner/call"
                  className="text-sm text-white/80 hover:text-white"
                >
                  Calls
                </Link>
              </>
            )}

            {!user && (
              <Link
                href="/auth/sign-up"
                className="rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-2 text-sm font-medium shadow-lg shadow-cyan-500/20 hover:opacity-95"
              >
                Get Started
              </Link>
            )}

            {!user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/sign-in"
                  className="bg-white text-black px-3 py-1 rounded text-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="bg-orange-500 px-3 py-1 rounded text-sm"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div ref={menuRef} className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileOpen((o) => !o);
                  }}
                  className="w-9 h-9 rounded-full bg-white/10 border border-white/20 grid place-items-center"
                >
                  <span className="font-semibold">{initials}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/20 bg-zinc-900 text-sm shadow-lg p-3">
                    <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                      <div className="w-10 h-10 rounded-full bg-white/10 grid place-items-center">
                        <span className="font-semibold">{initials}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {profile?.full_name ?? "Profile"}
                        </div>
                        <div className="text-zinc-400 truncate">
                          {user?.email}
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link
                        href="/owner/vehicles"
                        className="block px-2 py-2 rounded hover:bg-white/10"
                      >
                        My Vehicles
                      </Link>
                      <Link
                        href="/owner/calls"
                        className="block px-2 py-2 rounded hover:bg-white/10"
                      >
                        Calls
                      </Link>
                      <Link
                        href="/owner/vehicles"
                        className="block px-2 py-2 rounded hover:bg-white/10"
                      >
                        Add Vehicle
                      </Link>
                      <Link
                        href="/owner/profile"
                        className="block px-2 py-2 rounded hover:bg-white/10"
                      >
                        Profile
                      </Link>
                    </div>

                    <button
                      onClick={signOut}
                      className="w-full mt-1 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMenuOpen((s) => !s)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/5 ring-1 ring-white/10 text-white"
          >
            <span className="sr-only">Toggle menu</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6">
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.button
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-40 bg-black/40 md:hidden"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={backdropVariants}
                transition={{ duration: 0.15 }}
              />
              <motion.div
                id="mobile-menu"
                className="relative z-50 md:hidden"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={sheetVariants}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="grid gap-2 pb-4 text-white rounded-lg border border-white/10 bg-zinc-900/80 backdrop-blur p-2">
                  {links.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      className="rounded-md px-3 py-2 text-white/90 hover:bg-white/5"
                      onClick={() => setMenuOpen(false)}
                    >
                      {l.label}
                    </a>
                  ))}

                  <Link
                    href="/owner/vehicles"
                    className="rounded-md px-3 py-2 text-white/90 hover:bg-white/5"
                    onClick={() => setMenuOpen(false)}
                  >
                    My Vehicles
                  </Link>

                  {user && (
                    <>
                      <Link
                        href="/owner/call"
                        className="rounded-md px-3 py-2 text-white/90 hover:bg-white/5"
                        onClick={() => setMenuOpen(false)}
                      >
                        Calls
                      </Link>
                      <Link
                        href="/owner/vehicles"
                        className="rounded-md px-3 py-2 text-white/90 hover:bg-white/5"
                        onClick={() => setMenuOpen(false)}
                      >
                        Add Vehicle
                      </Link>
                    </>
                  )}

                  {!user && (
                    <Link
                      href="/auth/sign-up"
                      className="rounded-md bg-gradient-to-r from-cyan-400 to-indigo-500 px-3 py-2 text-sm font-medium"
                      onClick={() => setMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  )}

                  {!user ? (
                    <div className="mt-2 grid gap-2">
                      <Link
                        href="/auth/sign-in"
                        className="bg-white text-black px-3 py-2 rounded text-sm"
                        onClick={() => setMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/sign-up"
                        className="bg-orange-500 px-3 py-2 rounded text-sm"
                        onClick={() => setMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut();
                      }}
                      className="mt-2 w-full bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg"
                    >
                      Sign Out
                    </button>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
