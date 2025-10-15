"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { RealtimePostgresInsertPayload } from "@supabase/supabase-js";
import { startCall } from "@/lib/agora";

/** DB row shape we care about (public.call_sessions) */
type CallRow = {
  id: string;
  plate: string;
  owner_id: string;
  channel: string;
  status: "ringing" | "accepted" | "declined" | "timeout" | "ended";
  caller_info: Record<string, unknown> | null;
  created_at: string;
  accepted_at: string | null;
  ended_at: string | null;
};

export default function OwnerCallPage() {
  const [incoming, setIncoming] = useState<CallRow | null>(null);
  const [activeStop, setActiveStop] = useState<null | (() => Promise<void>)>(
    null
  );
  const [status, setStatus] = useState<"waiting" | "ringing" | "connecting" | "connected">(
    "waiting"
  );

  // keep ringtone audio without using "any"
  const ringRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let unsubscribed = false;

    async function listenForCalls() {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) {
        console.warn("No logged-in owner");
        return;
      }

      const channel = supabase
        .channel("call_sessions_channel")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "call_sessions",
            filter: `owner_id=eq.${user.id}`,
          },
          (payload: RealtimePostgresInsertPayload<CallRow>) => {
            if (unsubscribed) return;
            const newCall = payload.new;
            if (newCall.status === "ringing") {
              setIncoming(newCall);
              setStatus("ringing");
              playRingtone();
            }
          }
        )
        .subscribe();

      // cleanup
      return () => {
        unsubscribed = true;
        supabase.removeChannel(channel);
      };
    }

    const cleanupPromise = listenForCalls();
    return () => {
      // cleanupPromise can return void or a function; handle both safely
      Promise.resolve(cleanupPromise).then((cleanup) => {
        if (typeof cleanup === "function") cleanup();
      });
    };
  }, []);

  function playRingtone() {
    stopRingtone();
    const audio = new Audio("/ringtone.mp3");
    audio.loop = true;
    // play() returns a promise; ignore rejection (e.g., autoplay policy)
    void audio.play().catch(() => {});
    ringRef.current = audio;
  }

  function stopRingtone() {
    if (ringRef.current) {
      ringRef.current.pause();
      ringRef.current.currentTime = 0;
      ringRef.current = null;
    }
  }

  async function acceptCall() {
    if (!incoming) return;
    stopRingtone();
    setStatus("connecting");
    const stop = await startCall(incoming.channel);
    setActiveStop(() => stop);
    setStatus("connected");
  }

  function declineCall() {
    stopRingtone();
    setIncoming(null);
    setStatus("waiting");
  }

  async function endCall() {
    if (activeStop) {
      await activeStop();
    }
    setActiveStop(null);
    setIncoming(null);
    setStatus("waiting");
  }

  return (
    <div className="space-y-3 text-center">
      <h1 className="text-xl font-semibold">📞 Owner Call Dashboard</h1>
      <div className="text-sm opacity-70">{status}</div>

      {incoming && status === "ringing" && (
        <div className="p-4 border rounded bg-neutral-100 dark:bg-neutral-800">
          <p className="mb-2">
            Incoming call from: <b>{incoming.plate}</b>
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={acceptCall}
              className="btn bg-green-600 text-white px-4 py-2 rounded"
            >
              Accept
            </button>
            <button
              onClick={declineCall}
              className="btn bg-red-600 text-white px-4 py-2 rounded"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {status === "connected" && (
        <button
          onClick={endCall}
          className="btn bg-red-600 text-white px-4 py-2 rounded"
        >
          End Call
        </button>
      )}
    </div>
  );
}
