"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { RealtimePostgresInsertPayload } from "@supabase/supabase-js";
import dayjs from "dayjs";

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
  const [status, setStatus] = useState<
    "waiting" | "ringing" | "connecting" | "connected"
  >("waiting");
  const [rt, setRt] = useState("INIT");
  const [userId, setUserId] = useState<string>("");

  const currentIdRef = useRef<string | null>(null);
  const ringRef = useRef<HTMLAudioElement | null>(null);

  // ---- helpers ----
  const stopRingtone = useCallback(() => {
    if (ringRef.current) {
      ringRef.current.pause();
      ringRef.current.currentTime = 0;
      ringRef.current = null;
    }
  }, []);

  const playRingtone = useCallback(() => {
    stopRingtone();
    const audio = new Audio("/ringtone.mp3");
    audio.loop = true;
    void audio.play().catch(() => {});
    ringRef.current = audio;
  }, [stopRingtone]);

  async function updateStatus(id: string, next: CallRow["status"]) {
    const { error } = await supabase
      .from("call_sessions")
      .update({
        status: next,
        accepted_at: next === "accepted" ? new Date().toISOString() : null,
        ended_at:
          next === "declined" || next === "ended" || next === "timeout"
            ? new Date().toISOString()
            : null,
      })
      .eq("id", id);
    if (error) console.error("updateStatus error:", error.message);
  }

  async function acceptCall() {
    if (!incoming) return;
    stopRingtone();
    setStatus("connecting");
    await updateStatus(incoming.id, "accepted");

    const { startCall } = await import("@/lib/agora");
    await startCall(incoming.channel);
    setStatus("connected");
  }

  async function declineCall() {
    if (!incoming) return;
    stopRingtone();
    await updateStatus(incoming.id, "declined");
    currentIdRef.current = null;
    setIncoming(null);
    setStatus("waiting");
  }

  async function endCall() {
    if (!incoming) return;
    stopRingtone();
    await updateStatus(incoming.id, "ended");
    currentIdRef.current = null;
    setIncoming(null);
    setStatus("waiting");
  }

  // ---- realtime + poll ----
  useEffect(() => {
    let unsubscribed = false;

    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return;
      setUserId(user.id);

      // Realtime subscribe for new call rows for this owner
      const sub = supabase
        .channel("call_sessions_owner")
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
            const recent =
              dayjs(row.created_at).isAfter(dayjs().subtract(120, "second")) &&
              row.status === "ringing";

            if (recent && !unsubscribed) {
              if (currentIdRef.current === row.id) return;
              currentIdRef.current = row.id;
              setIncoming(row);
              setStatus("ringing");
              playRingtone();
            }
          }
        )
        .subscribe((s) => setRt(s === "SUBSCRIBED" ? "SUBSCRIBED" : String(s)));

      // Fallback poll every 5 seconds (ensure reliability)
      const poll = setInterval(async () => {
        const { data: rows, error } = await supabase
          .from("call_sessions")
          .select("*")
          .eq("owner_id", user.id)
          .eq("status", "ringing")
          .gt("created_at", dayjs().subtract(60, "second").toISOString())
          .order("created_at", { ascending: false })
          .limit(1);
        if (error) return;

        const row = rows?.[0];
        if (!row) return;

        if (currentIdRef.current !== row.id) {
          currentIdRef.current = row.id;
          setIncoming(row);
          setStatus("ringing");
          playRingtone();
        }
      }, 5000);

      // Cleanup
      return () => {
        unsubscribed = true;
        supabase.removeChannel(sub);
        clearInterval(poll);
      };
    })();
  }, [playRingtone]);

  return (
    <div className="space-y-4 text-center">
      <h1 className="text-xl font-semibold">📞 Owner Call Dashboard</h1>
      <div className="text-sm opacity-70">{status}</div>

      <div className="mx-auto w-fit rounded border px-4 py-2 text-xs opacity-70">
        <div>user: {userId || "—"}</div>
        <div>rt: {rt}</div>
        <div>last poll: {new Date().toLocaleTimeString()}</div>
        <div>current: {currentIdRef.current || "—"}</div>
      </div>

      {incoming && status === "ringing" && (
        <div className="mx-auto max-w-3xl rounded border bg-neutral-900/40 p-6">
          <p className="mb-4">
            Incoming call for: <b>{incoming.plate}</b>
          </p>
          <div className="flex justify-center gap-3">
            <button onClick={acceptCall} className="btn bg-green-600 text-white">
              Accept
            </button>
            <button onClick={declineCall} className="btn bg-red-600 text-white">
              Decline
            </button>
          </div>
        </div>
      )}

      {status === "connected" && (
        <button onClick={endCall} className="btn bg-red-600 text-white">
          End Call
        </button>
      )}
    </div>
  );
}
