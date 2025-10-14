"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import Image from "next/image"; // <-- import Next.js Image

type Vehicle = { id: number; plate: string; active: boolean };

export default function Vehicles() {
  const [list, setList] = useState<Vehicle[]>([]);
  const [plate, setPlate] = useState("");
  const [qr, setQr] = useState<string>("");

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
      .insert({ owner_id: user.id, plate: plateClean });

    if (error) return alert(error.message);

    setPlate("");
    await load();
  }

  async function del(id: number) {
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) return alert(error.message);
    await load();
  }

  async function showQR(p: string) {
    const url = `${location.origin}/scan/${encodeURIComponent(p)}`;
    const QR = await import("qrcode");             // dynamic import avoids SSR/bundler issues
    const dataUrl = await QR.toDataURL(url);       // generate QR as data URL
    setQr(dataUrl);
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
        <div className="p-4 border rounded w-fit">
          <Image
            src={qr}
            alt="QR"
            width={192}          // 48 * 4 for better resolution
            height={192}
            unoptimized         // important for data URLs
          />
        </div>
      )}

      <ul className="divide-y">
        {list.map((v) => (
          <li key={v.id} className="py-3 flex items-center gap-3">
            <span className="font-mono">{v.plate}</span>
            <button className="btn" onClick={() => showQR(v.plate)}>QR</button>
            <button className="btn" onClick={() => del(v.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
