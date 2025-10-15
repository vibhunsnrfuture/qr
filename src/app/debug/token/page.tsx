"use client";
import { useState } from "react";

export default function DebugToken() {
  const [plate, setPlate] = useState("");
  const [out, setOut] = useState("");

  async function test() {
    try {
      const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const r = await fetch(`${base}/functions/v1/agora-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: plate.toUpperCase(), role: "publisher" })
      });
      const txt = await r.text();
      setOut(`${r.status} ${r.statusText}\n${txt}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setOut(msg);
    }
  }

  return (
    <div className="p-6 space-y-3">
      <h2 className="text-xl font-semibold">Debug Token</h2>
      <input
        className="input"
        placeholder="PLATE"
        value={plate}
        onChange={(e) => setPlate(e.target.value)}
      />
      <button className="btn" onClick={test}>Test</button>
      <pre className="p-3 bg-black/30 rounded whitespace-pre-wrap text-xs">
        {out}
      </pre>
    </div>
  );
}
