// src/app/owner/call/page.tsx
"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { joinAsReceiver } from "@/lib/agora";

export default function ReceiveCalls() {
  const [plate, setPlate] = useState("");
  const [joined, setJoined] = useState(false);
  const [micOn, setMicOn] = useState(false);

  // retain session controls
  const [controls, setControls] = useState<null | {
    toggleMic: (on?: boolean) => Promise<void>;
    leave: () => Promise<void>;
  }>(null);

  async function goOnline() {
    const channel = plate.trim().toUpperCase();
    if (!channel) return alert("Enter plate/channel (e.g., UP20BB1234)");

    const c = await joinAsReceiver(channel);
    setControls(c);
    setJoined(true);

    // Optional: start with mic ON for two-way talk
    try {
      await c.toggleMic(true);
      setMicOn(true);
    } catch {
      // user might deny mic permission; ignore
    }
  }

  async function toggleMic() {
    if (!controls) return;
    await controls.toggleMic(!micOn);
    setMicOn((m) => !m);
  }

  async function goOffline() {
    try { await controls?.leave(); } finally {
      setControls(null);
      setMicOn(false);
      setJoined(false);
    }
  }

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-xl font-semibold">Receive Calls</h2>

      <input
        className="input"
        placeholder="Your vehicle plate (channel) e.g., UP20BB1234"
        value={plate}
        onChange={(e) => setPlate(e.target.value)}
      />

      {!joined ? (
        <button className="btn" onClick={goOnline}>Go Online</button>
      ) : (
        <div className="flex gap-2">
          <button className="btn" onClick={toggleMic}>{micOn ? "Mic Off" : "Mic On"}</button>
          <button className="btn" onClick={goOffline}>Go Offline</button>
        </div>
      )}

      <div className="text-sm text-white/60">
        Channel: <span className="font-mono">{plate.toUpperCase() || "—"}</span> •{" "}
        {joined ? "Online" : "Offline"} • Mic: {micOn ? "On" : "Off"}
      </div>
    </div>
  );
}
