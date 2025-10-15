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
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">My Vehicles</h2>

      <form onSubmit={add} className="flex gap-2">
        <input
          className="input"
          placeholder="Plate (e.g., UP14AB1234)"
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
        />
        <button className="btn">Add</button>
      </form>

      {qr && (
        <div className="p-4 border rounded w-fit space-y-2">
          <div className="text-sm text-white/60 text-center">{qrPlate}</div>
          <Image
            src={qr}
            alt="QR"
            width={256}
            height={256}
            unoptimized
          />
          <div className="flex gap-2">
            <button className="btn" onClick={downloadQR}>Download</button>
            <a className="btn" href={`/scan/${encodeURIComponent(qrPlate)}`} target="_blank" rel="noreferrer">
              Open Scan Page
            </a>
          </div>
        </div>
      )}

      <ul className="divide-y">
        {list.map((v) => (
          <li key={v.id} className="py-3 flex flex-wrap items-center gap-3">
            <span className="font-mono">{v.plate}</span>
            <span className={`text-xs rounded-full px-2 py-0.5 border ${v.active ? "border-green-500/40 text-green-400" : "border-yellow-500/40 text-yellow-400"}`}>
              {v.active ? "Active" : "Disabled"}
            </span>
            <button className="btn" onClick={() => showQR(v.plate)}>QR</button>
            <button className="btn" onClick={() => toggleActive(v.id, !v.active)}>
              {v.active ? "Disable" : "Enable"}
            </button>
            <button className="btn" onClick={() => del(v.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
