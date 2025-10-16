"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CarFront,
  QrCode,
  Phone,
  User2,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  ChevronDown,
} from "lucide-react";

type UserLite = {
  id: string;
  email?: string;
};

// ✅ Lucide icons are React components that accept SVG props
type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export default function Header() {
  const [user, setUser] = useState<UserLite | null>(null);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      setUser(data.user ? { id: data.user.id, email: data.user.email ?? undefined } : null);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email ?? undefined } : null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setMenu(false);
    location.href = "/";
  }

  // ✅ icon prop now strongly typed
  const NavLink = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: IconType;
  }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
          active ? "bg-white/10 text-white" : "text-white/80 hover:text-white hover:bg-white/5"
        }`}
        onClick={() => setOpen(false)}
      >
        <Icon className="h-4 w-4" />
        {label}
      </Link>
    );
  };

  return (
    <div className="sticky top-0 z-40 w-full bg-gradient-to-b from-black/60 to-transparent backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <motion.div
            initial={{ rotate: -8, scale: 0.9, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg"
          >
            <QrCode className="h-5 w-5" />
          </motion.div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Scan to Call</div>
            <div className="text-[11px] opacity-60">Owners • Guests • Admin</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          <NavLink href="/owner/vehicles" label="Vehicles" icon={CarFront} />
          <NavLink href="/owner/call" label="Call" icon={Phone} />
        </div>

        {/* Right: profile / auth */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenu((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10"
              >
                <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
                  <User2 className="h-4 w-4" />
                </div>
                <span className="max-w-[140px] truncate">{user.email ?? "Profile"}</span>
                <ChevronDown className={`h-4 w-4 transition ${menu ? "rotate-180" : ""}`} />
              </button>
              {menu && (
                <div
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-zinc-900/90 p-1 shadow-2xl backdrop-blur"
                  onMouseLeave={() => setMenu(false)}
                >
                  <Link
                    href="/owner/profile"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/5"
                  >
                    <User2 className="h-4 w-4" /> Profile
                  </Link>
                  <Link
                    href="/owner/vehicles"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/5"
                  >
                    <CarFront className="h-4 w-4" /> My Vehicles
                  </Link>
                  <Link
                    href="/owner/call"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/5"
                  >
                    <Phone className="h-4 w-4" /> Call Dashboard
                  </Link>
                  <button
                    onClick={signOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
              >
                <LogIn className="h-4 w-4" /> Sign in
              </Link>
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-black"
                style={{ background: "linear-gradient(135deg,#fff,#ddd)" }}
              >
                <UserPlus className="h-4 w-4" /> Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="inline-flex items-center justify-center rounded-xl p-2 hover:bg-white/10 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="md:hidden">
          <div className="mx-3 mb-3 space-y-2 rounded-2xl border border-white/10 bg-zinc-900/70 p-3 backdrop-blur">
            <NavLink href="/owner/vehicles" label="Vehicles" icon={CarFront} />
            <NavLink href="/owner/call" label="Call" icon={Phone} />
            <div className="h-px bg-white/10" />
            {user ? (
              <>
                <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm">
                  <User2 className="h-4 w-4" />
                  <div className="truncate">{user.email ?? "Profile"}</div>
                </div>
                <button
                  onClick={signOut}
                  className="inline-flex w-full items-center gap-2 rounded-xl bg-red-600/90 px-3 py-2 text-sm text-white"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/auth/sign-in"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                >
                  <LogIn className="h-4 w-4" /> Sign in
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-black"
                  style={{ background: "linear-gradient(135deg,#fff,#ddd)" }}
                >
                  <UserPlus className="h-4 w-4" /> Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
