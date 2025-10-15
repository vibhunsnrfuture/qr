// src/app/scan/[plate]/page.tsx
"use client";
export const dynamic = "force-dynamic";

import { useParams } from "next/navigation";
import { useState } from "react";
import { startCall } from "@/lib/agora";

function msg(e: unknown) {
  if (e instanceof Error) return e.message;
  try { return JSON.stringify(e); } catch { return String(e); }
}

export default function ScanCallPage() {
  const params = useParams<{ plate: string }>();
  const plate = String(params?.plate ?? "");
  const [stop, setStop] = useState<null | (() => Promise<void>)>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected">("idle");

  async function onCall() {
    try {
      setStatus("connecting");
      const end = await startCall(plate.toUpperCase());
      setStop(() => end);
      setStatus("connected");
    } catch (e: unknown) {
      alert(msg(e) || "Call failed");
      setStatus("idle");
    }
  }

  async function onHangup() {
    try { await stop?.(); } finally {
      setStop(null);
      setStatus("idle");
    }
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Call Owner — {plate.toUpperCase()}</h1>

      {stop ? (
        <button className="btn" onClick={onHangup}>Hang Up</button>
      ) : (
        <button className="btn" onClick={onCall} disabled={status !== "idle"}>
          {status === "connecting" ? "Connecting..." : "Start Call"}
        </button>
      )}

      <div className="text-sm text-white/60">Status: {status}</div>
      <p className="text-xs text-white/40">
        Allow microphone permission when asked.
      </p>
    </div>
  );
}
