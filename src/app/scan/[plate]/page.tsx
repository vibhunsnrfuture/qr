"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { startCall } from "@/lib/agora";

type StopFn = () => Promise<void>;

export default function ScanCallPage() {
  const params = useParams<{ plate: string }>();
  const plate = String(params.plate || "").toUpperCase().replace(/\s+/g, "");

  const [status, setStatus] = useState<"idle" | "calling" | "oncall">("idle");
  const [stopFn, setStopFn] = useState<StopFn | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onStart() {
    try {
      setError(null);
      if (!plate) return setError("Missing plate");

      // 1) create ringing row (dashboard will ring)
      const resp = await fetch("/api/call/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plate,
          caller_info: { ua: navigator.userAgent, ts: Date.now() },
        }),
      });
      if (!resp.ok) {
        const t = await resp.json().catch(() => ({}));
        throw new Error(t?.error || "Failed to start call session");
      }

      // 2) always use channel returned by server
      const { call } = await resp.json();

      setStatus("calling");
      const stop = await startCall(call.channel);
      setStopFn(() => stop);
      setStatus("oncall");
    } catch (e) {
      setStatus("idle");
      setError(e instanceof Error ? e.message : "Call failed");
    }
  }

  async function onHangup() {
    try {
      await stopFn?.();
    } finally {
      setStopFn(null);
      setStatus("idle");
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Call Owner — {plate || "—"}</h1>

      {error && (
        <div className="rounded bg-red-600/20 text-red-200 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {status !== "oncall" ? (
        <button className="btn bg-indigo-600 text-white px-4 py-2 rounded" onClick={onStart}>
          Start Call
        </button>
      ) : (
        <button className="btn bg-red-600 text-white px-4 py-2 rounded" onClick={onHangup}>
          Hang Up
        </button>
      )}

      <div className="text-sm opacity-70">status: {status}</div>
    </div>
  );
}
