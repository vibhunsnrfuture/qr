"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

type Profile = { id: string; full_name: string | null };

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1) load session
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user || null;
      setUser(u);
      if (u) loadProfile(u.id);
    });

    // 2) session change listener
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user || null;
      setUser(u);
      if (u) loadProfile(u?.id ?? "") ; else setProfile(null);
    });

    // 3) close dropdown on outside click
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("click", onClick);

    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("click", onClick);
    };
  }, []);

  async function loadProfile(id: string) {
    if (!id) return;
    const { data } = await supabase.from("profiles").select("id, full_name").eq("id", id).single();
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

  return (
    <nav className="flex justify-between items-center p-4 border-b bg-black text-white">
      <Link href="/" className="font-bold text-lg">Scan-to-Call</Link>

      <div className="flex items-center gap-4">
        <Link href="/owner/vehicles">My Vehicles</Link>

        {!user ? (
          <>
            <Link href="/auth/sign-in" className="bg-white text-black px-3 py-1 rounded">Sign In</Link>
            <Link href="/auth/sign-up" className="bg-orange-500 px-3 py-1 rounded">Sign Up</Link>
          </>
        ) : (
          <div ref={menuRef} className="relative">
            {/* Avatar button */}
            <button
              onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
              className="w-9 h-9 rounded-full bg-white/10 border border-white/20 grid place-items-center"
              aria-label="Open profile menu"
            >
              <span className="font-semibold">{initials}</span>
            </button>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/20 bg-zinc-900 text-sm shadow-lg p-3">
                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <div className="w-10 h-10 rounded-full bg-white/10 grid place-items-center">
                    <span className="font-semibold">{initials}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{profile?.full_name ?? "Profile"}</div>
                    <div className="text-zinc-400 truncate">{user.email}</div>
                  </div>
                </div>

                <div className="py-2">
                  <Link href="/owner/vehicles" className="block px-2 py-2 rounded hover:bg-white/10">
                    My Vehicles
                  </Link>
                  <Link href="/owner/profile" className="block px-2 py-2 rounded hover:bg-white/10">
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
    </nav>
  );
}
