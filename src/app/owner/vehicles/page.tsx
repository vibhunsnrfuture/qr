"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import Image from "next/image";

type Vehicle = { id: number; plate: string; active: boolean };

export default function Vehicles() {
  const [list, setList] = useState<Vehicle[]>([]);
  const [plate, setPlate] = useState("");
  const [qr, setQr] = useState<string>("");     // data URL
  const [qrPlate, setQrPlate] = useState<string>("");

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setList([]);
      return;
    }
    const { data, error } = await supabase
      .from("vehicles")
      .select("id, plate, active")
      .eq("owner_id", user.id)
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }
    setList(data ?? []);
  }

  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Sign in required");

    const plateClean = plate.trim().toUpperCase().replace(/\s+/g, "");
    if (!plateClean) return alert("Enter a plate number");

    const { error } = await supabase
      .from("vehicles")
      .insert({ owner_id: user.id, plate: plateClean, active: true }); // ✅ active true

    if (error) return alert(error.message); // unique constraint msg aayega agar duplicate hua
    setPlate("");
    await load();
  }

  async function del(id: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Sign in required");
    const { error } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", id)
      .eq("owner_id", user.id); // ✅ owner scoped

    if (error) return alert(error.message);
    await load();
  }

  async function toggleActive(id: number, nextVal: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Sign in required");
    const { error } = await supabase
      .from("vehicles")
      .update({ active: nextVal })
      .eq("id", id)
      .eq("owner_id", user.id);

    if (error) return alert(error.message);
    await load();
  }

  async function showQR(p: string) {
    const channel = p.toUpperCase(); // ✅ normalize channel
    const url = `${location.origin}/scan/${encodeURIComponent(channel)}`;
    const QR = await import("qrcode");             // dynamic import
    const dataUrl = await QR.toDataURL(url, { width: 512, margin: 2 }); // sharp QR
    setQr(dataUrl);
    setQrPlate(channel);
  }

  function downloadQR() {
    if (!qr) return;
    const a = document.createElement("a");
    a.href = qr;
    a.download = `${qrPlate}_QR.png`;
    a.click();
  }

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">My Vehicles</h2>
        <p className="text-sm text-white/60 mt-1">
          Add your vehicle, generate a QR, and manage activation.
        </p>
      </div>

      {/* Add form */}
      <form
        onSubmit={add}
        className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur p-4 sm:p-5 shadow-sm mb-6"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            className="input flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 outline-none focus:ring-2 focus:ring-cyan-500/40"
            placeholder="Plate (e.g., UP14AB1234)"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
          />
          <button
            className="btn rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-2 font-medium shadow-lg shadow-cyan-500/20 hover:opacity-95"
          >
            Add
          </button>
        </div>
      </form>

      {/* QR Preview */}
      {qr && (
        <div className="flex justify-center mb-6">
          <div className="p-4 border border-white/10 rounded-2xl bg-zinc-900/50 backdrop-blur w-full max-w-sm space-y-3 shadow-sm">
            <div className="text-sm text-white/70 text-center font-mono tracking-wide">
              {qrPlate}
            </div>
            <div className="flex justify-center">
              <Image
                src={qr}
                alt="QR"
                width={256}
                height={256}
                unoptimized
                className="rounded-lg ring-1 ring-white/10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                className="btn rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-2"
                onClick={downloadQR}
              >
                Download
              </button>
              <a
                className="btn rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 px-3 py-2 text-cyan-300"
                href={`/scan/${encodeURIComponent(qrPlate)}`}
                target="_blank"
                rel="noreferrer"
              >
                Open Scan Page
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Vehicles list */}
      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="text-center text-white/60 text-sm py-8 border border-dashed border-white/10 rounded-2xl">
            No vehicles yet. Add your first vehicle above.
          </div>
        ) : (
          <ul className="grid gap-3">
            {list.map((v) => (
              <li
                key={v.id}
                className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Left block (center-friendly on small screens) */}
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base sm:text-lg tracking-wide">
                      {v.plate}
                    </span>
                    <span
                      className={`text-xs rounded-full px-2 py-0.5 border ${
                        v.active
                          ? "border-green-500/40 text-green-400"
                          : "border-yellow-500/40 text-yellow-400"
                      }`}
                    >
                      {v.active ? "Active" : "Disabled"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="btn rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-1.5"
                      onClick={() => showQR(v.plate)}
                    >
                      QR
                    </button>
                    <button
                      className="btn rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-1.5"
                      onClick={() => toggleActive(v.id, !v.active)}
                    >
                      {v.active ? "Disable" : "Enable"}
                    </button>
                    <button
                      className="btn rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-400/30 px-3 py-1.5 text-red-300"
                      onClick={() => del(v.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
