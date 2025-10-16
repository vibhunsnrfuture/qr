"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { startCall } from "@/lib/agora";
import { motion } from "framer-motion";
import { PhoneCall, PhoneOff, Disc3, CarFront } from "lucide-react";

export default function ScanCallPage() {
  const { plate } = useParams<{ plate: string }>();
  const [end, setEnd] = useState<null | (() => Promise<void>)>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected">("idle");

  async function onCall() {
    try {
      setStatus("connecting");
      const stop = await startCall(String(plate));
      setEnd(() => stop);
      setStatus("connected");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Call failed";
      alert(msg);
      setStatus("idle");
    }
  }

  async function onHangup() {
    await end?.();
    setEnd(null);
    setStatus("idle");
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/60 to-zinc-800/50 p-6"
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20">
              <CarFront className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <div className="text-sm opacity-70">Calling for vehicle</div>
              <div className="text-2xl font-bold tracking-wide">{String(plate)}</div>
            </div>
          </div>
          <div className="rounded-full bg-white/10 px-3 py-1 text-xs">
            {status === "connected" ? "ON CALL" : status === "connecting" ? "CONNECTING…" : "READY"}
          </div>
        </div>

        {/* Big Call Button */}
        <div className="flex flex-col items-center justify-center gap-4 py-6">
          {end ? (
            <>
              <button
                onClick={onHangup}
                className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-500 active:scale-95 transition"
                aria-label="Hang Up"
              >
                <PhoneOff className="h-7 w-7" />
              </button>
              <div className="text-sm opacity-70">Tap to end the call</div>
            </>
          ) : (
            <>
              <button
                onClick={onCall}
                className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 active:scale-95 transition disabled:opacity-50"
                disabled={status === "connecting"}
                aria-label="Start Call"
              >
                {status === "connecting" ? (
                  <Disc3 className="h-7 w-7 animate-spin" />
                ) : (
                  <PhoneCall className="h-7 w-7" />
                )}
              </button>
              <div className="text-sm opacity-70">
                {status === "connecting" ? "Connecting…" : "Tap to start voice call"}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
