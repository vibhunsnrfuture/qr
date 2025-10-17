"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { startCall } from "@/lib/agora";

type StopFn = () => Promise<void>;

export default function ScanCallPage() {
  // Read the dynamic route param safely on the client
  const params = useParams<{ plate: string }>();
  const plate = String(params?.plate ?? "");

  const [stopFn, setStopFn] = useState<StopFn | null>(null);
  const [status, setStatus] = useState<"idle" | "calling" | "oncall">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onStart() {
    try {
      setError(null);
      if (!plate) {
        setError("Missing plate from URL.");
        return;
      }
      setStatus("calling");
      const stop = await startCall(plate); // joins & publishes mic
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
    <div className="p-4 max-w-md mx-auto space-y-3">
      <h1 className="text-xl font-semibold">Call Owner — {plate || "…"}</h1>

      {error && (
        <div className="rounded bg-red-500/10 border border-red-500/30 p-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {status !== "oncall" ? (
        <button
          className="btn bg-emerald-600 text-white px-4 py-2 rounded"
          onClick={onStart}
          disabled={!plate || status === "calling"}
        >
          {status === "calling" ? "Connecting…" : "Start Call"}
        </button>
      ) : (
        <button
          className="btn bg-red-600 text-white px-4 py-2 rounded"
          onClick={onHangup}
        >
          Hang Up
        </button>
      )}

      <div className="text-sm opacity-70">status: {status}</div>
    </div>
  );
}
