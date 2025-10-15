"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type {
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from "@supabase/supabase-js";
import { startCall } from "@/lib/agora";

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
  const [activeStop, setActiveStop] =
    useState<null | (() => Promise<void>)>(null);
  const [status, setStatus] = useState<
    "waiting" | "ringing" | "connecting" | "connected"
  >("waiting");

  // debug info
  const [userId, setUserId] = useState<string>("");
  const [rtStatus, setRtStatus] = useState<string>("INIT");
  const [lastPoll, setLastPoll] = useState<string>("");

  const ringRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let stopRealtime: (() => void) | undefined;
    let pollTimer: ReturnType<typeof setInterval> | undefined;

    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) {
        setRtStatus("NO_USER");
        return;
      }
      setUserId(user.id);

      // ---------- Realtime subscribe ----------
      const ch = supabase
        .channel("call_sessions_rt")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "call_sessions",
            filter: `owner_id=eq.${user.id}`,
          },
          (payload: RealtimePostgresInsertPayload<CallRow>) => {
            const row = payload.new;
            console.log("[RT INSERT]", row);
            if (row?.status === "ringing") {
              setIncoming(row);
              setStatus("ringing");
              playRingtone();
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "call_sessions",
            filter: `owner_id=eq.${user.id}`,
          },
          (payload: RealtimePostgresUpdatePayload<CallRow>) => {
            const row = payload.new;
            console.log("[RT UPDATE]", row);
            if (row?.status === "ringing") {
              setIncoming(row);
              setStatus("ringing");
              playRingtone();
            }
          }
        )
        .subscribe((s) => {
          setRtStatus(s);
          console.log("[RT STATUS]", s);
        });

      stopRealtime = () => supabase.removeChannel(ch);

      // ---------- Polling fallback (every 3s) ----------
      pollTimer = setInterval(async () => {
        const now = new Date().toISOString();
        setLastPoll(new Date().toLocaleTimeString());

        const { data, error } = await supabase
          .from("call_sessions")
          .select("*")
          .eq("owner_id", user.id)
          .eq("status", "ringing")
          .order("created_at", { ascending: false })
          .limit(1);

        if (error) {
          console.warn("[POLL ERROR]", error.message);
          return;
        }
        const row = data?.[0] as CallRow | undefined;
        if (row && (!incoming || incoming.id !== row.id)) {
          console.log("[POLL HIT]", row);
          setIncoming(row);
          setStatus("ringing");
          playRingtone();
        }
      }, 3000);
    })();

    return () => {
      if (stopRealtime) stopRealtime();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [incoming]);

  function playRingtone() {
    stopRingtone();
    const a = new Audio("/ringtone.mp3");
    a.loop = true;
    void a.play().catch((e) => console.warn("autoplay blocked", e));
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
      console.error("acceptCall error", e);
      setStatus("waiting");
    }
  }

  function declineCall() {
    stopRingtone();
    setIncoming(null);
    setStatus("waiting");
    // (optional) update status='declined'
  }

  async function endCall() {
    if (activeStop) await activeStop();
    setActiveStop(null);
    setIncoming(null);
    setStatus("waiting");
  }

  return (
    <div className="space-y-4 text-center">
      <h1 className="text-xl font-semibold">📞 Owner Call Dashboard</h1>
      <div className="text-sm opacity-70">{status}</div>

      {/* debug box */}
      <div className="mx-auto w-fit text-xs opacity-70 border rounded px-3 py-2">
        <div>user: {userId || "—"}</div>
        <div>rt: {rtStatus}</div>
        <div>last poll: {lastPoll || "—"}</div>
      </div>

      {incoming && status === "ringing" && (
        <div className="p-4 border rounded bg-neutral-100 dark:bg-neutral-800">
          <p className="mb-2">
            Incoming call for: <b>{incoming.plate}</b>
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
