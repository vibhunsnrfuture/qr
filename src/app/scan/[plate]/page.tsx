"use client";
export const dynamic = "force-dynamic";

import { useParams } from "next/navigation";
import { useState } from "react";
import { startCall } from "@/lib/agora";

function humanError(err: unknown) {
  if (err instanceof Error) return err.message;
  try { return JSON.stringify(err); } catch { return String(err); }
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
      alert(humanError(e) || "Call failed");
      setStatus("idle");
    }
  }

  async function onHangup() {
    try { await stop?.(); } finally { setStop(null); setStatus("idle"); }
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
    </div>
  );
}
