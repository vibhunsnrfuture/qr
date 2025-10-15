"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { RealtimePostgresInsertPayload, RealtimePostgresUpdatePayload } from "@supabase/supabase-js";
import { startCall } from "@/lib/agora";

/** DB row we care about */
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
  const [activeStop, setActiveStop] = useState<null | (() => Promise<void>)>(null);
  const [status, setStatus] = useState<"waiting" | "ringing" | "connecting" | "connected">("waiting");

  const ringRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let stopCleanup: (() => void) | undefined;

    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) {
        console.warn("[owner-call] no logged-in user; not listening");
        return;
      }

      console.log("[owner-call] listening for calls for owner_id:", user.id);

      const ch = supabase
        .channel("call_sessions_rt")
        // INSERTs for my owner_id
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "call_sessions", filter: `owner_id=eq.${user.id}` },
          (payload: RealtimePostgresInsertPayload<CallRow>) => {
            console.log("[owner-call] INSERT payload:", payload);
            const newCall = payload.new;
            if (newCall?.status === "ringing") {
              setIncoming(newCall);
              setStatus("ringing");
              playRingtone();
            }
          }
        )
        // UPDATEs to ringing (in case your RPC inserts non-ringing first, then updates)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "call_sessions", filter: `owner_id=eq.${user.id}` },
          (payload: RealtimePostgresUpdatePayload<CallRow>) => {
            console.log("[owner-call] UPDATE payload:", payload);
            const row = payload.new;
            if (row?.status === "ringing") {
              setIncoming(row);
              setStatus("ringing");
              playRingtone();
            }
          }
        )
        .subscribe((status) => {
          console.log("[owner-call] channel status:", status);
          if (status === "CHANNEL_ERROR") {
            console.error("[owner-call] realtime channel error");
          }
        });

      stopCleanup = () => {
        supabase.removeChannel(ch);
      };
    })();

    return () => {
      if (stopCleanup) stopCleanup();
    };
  }, []);

  function playRingtone() {
    stopRingtone();
    const a = new Audio("/ringtone.mp3");
    a.loop = true;
    void a.play().catch((e) => {
      // mobile may require user gesture; at least we see a log.
      console.warn("[owner-call] autoplay blocked:", e);
    });
    ringRef.current = a;
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
    try {
      const stop = await startCall(incoming.channel);
      setActiveStop(() => stop);
      setStatus("connected");
    } catch (e) {
      console.error("[owner-call] acceptCall failed:", e);
      setStatus("waiting");
    }
  }

  function declineCall() {
    stopRingtone();
    setIncoming(null);
    setStatus("waiting");
    // (optional) you could update call_sessions.status='declined' here
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
            Incoming call for: <b>{incoming.plate}</b>
          </p>
          <div className="flex justify-center gap-3">
            <button onClick={acceptCall} className="btn bg-green-600 text-white px-4 py-2 rounded">
              Accept
            </button>
            <button onClick={declineCall} className="btn bg-red-600 text-white px-4 py-2 rounded">
              Decline
            </button>
          </div>
        </div>
      )}

      {status === "connected" && (
        <button onClick={endCall} className="btn bg-red-600 text-white px-4 py-2 rounded">
          End Call
        </button>
      )}
    </div>
  );
}
