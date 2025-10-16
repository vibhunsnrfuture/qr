"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type {
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
  RealtimeChannel,
} from "@supabase/supabase-js";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import {
  PhoneIncoming,
  PhoneOff,
  Phone,
  Check,
  X,
  Wifi,
  Mic,
  Loader2,
  User2,
} from "lucide-react";

/* ------------------------------------------------------------------------------------------
   Types for Agora interop + small type guard
------------------------------------------------------------------------------------------ */
type StopFn = () => Promise<void>;
type StartCallFn = (ch: string) => Promise<StopFn | void>;
type AgoraModule = { startCall?: StartCallFn };

function isStopFn(v: unknown): v is StopFn {
  return typeof v === "function";
}

/** DB row shape from public.call_sessions */
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
  const [status, setStatus] = useState<"waiting" | "ringing" | "connecting" | "connected">(
    "waiting"
  );
  const [rt, setRt] = useState("INIT");
  const [userId, setUserId] = useState<string>("");
  const [connecting, setConnecting] = useState(false);

  /** track the call we’re currently showing so we don’t replay the same one */
  const currentIdRef = useRef<string | null>(null);

  /** ringtone player */
  const ringRef = useRef<HTMLAudioElement | null>(null);

  /** stop() returned by startCall() */
  const stopRef = useRef<StopFn | null>(null);

  /** ringtone helpers */
  const stopRingtone = useCallback((): void => {
    const a = ringRef.current;
    if (a) {
      try {
        a.pause();
        a.currentTime = 0;
      } catch {
        // no-op
      }
      ringRef.current = null;
    }
  }, []);

  const playRingtone = useCallback((): void => {
    stopRingtone();
    const audio = new Audio("/ringtone.mp3");
    audio.loop = true;
  
    audio.play().catch(() => {});
    ringRef.current = audio;
  }, [stopRingtone]);

  /** Update call session status (requires your RLS policy) */
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

  /** Accept & join via Agora */
  async function acceptCall() {
    const call = incoming;
    if (!call) return;

    stopRingtone();
    setConnecting(true);
    setStatus("connecting");
    await updateStatus(call.id, "accepted");

    // Type-safe dynamic import of your Agora helper
    const mod = (await import("@/lib/agora")) as unknown as AgoraModule;
    const startCall = mod.startCall;

    if (startCall) {
      const stopMaybe = await startCall(call.channel);
      stopRef.current = isStopFn(stopMaybe) ? stopMaybe : null;
    } else {
      console.error("startCall not found in '@/lib/agora'");
      stopRef.current = null;
    }

    setConnecting(false);
    setStatus("connected");
  }

  /** Decline call */
  async function declineCall() {
    const call = incoming;
    if (!call) return;

    stopRingtone();
    await updateStatus(call.id, "declined");
    currentIdRef.current = null;
    setIncoming(null);
    setStatus("waiting");
  }

  /** End call (hang up) */
  async function endCall() {
    stopRingtone();

    const call = incoming;
    if (call) {
      await updateStatus(call.id, "ended");
    }

    const stopper = stopRef.current;
    if (isStopFn(stopper)) {
      await stopper();
    }
    stopRef.current = null;

    currentIdRef.current = null;
    setIncoming(null);
    setStatus("waiting");
  }

  /** Show a ringing row if fresh & not already shown */
  const maybeShowRinging = useCallback(
    (row: CallRow) => {
      const isFresh = dayjs(row.created_at).isAfter(dayjs().subtract(2, "minute"));
      if (row.status === "ringing" && isFresh) {
        if (currentIdRef.current === row.id) return;
        currentIdRef.current = row.id;
        setIncoming(row);
        setStatus("ringing");
        playRingtone();
      }
    },
    [playRingtone]
  );

  /** Realtime + Poll (no async cleanup; effect cleanup is sync) */
  useEffect(() => {
    let isMounted = true;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let realtimeChannel: RealtimeChannel | null = null;

   
    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return;
      const user = data?.user;
      if (!user) return;

      setUserId(user.id);

      // subscribe to INSERT + UPDATE for this owner
      const channel = supabase
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
            if (!isMounted) return;
            maybeShowRinging(payload.new as unknown as CallRow);
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
            if (!isMounted) return;
            maybeShowRinging(payload.new as unknown as CallRow);
          }
        )
        .subscribe((s) => setRt(s === "SUBSCRIBED" ? "SUBSCRIBED" : String(s)));

      realtimeChannel = channel;

      // poll fallback every 3s
      pollTimer = setInterval(async () => {
        const { data: rows, error } = await supabase
          .from("call_sessions")
          .select("*")
          .eq("owner_id", user.id)
          .eq("status", "ringing")
          .gt("created_at", dayjs().subtract(2, "minute").toISOString())
          .order("created_at", { ascending: false })
          .limit(1);

        if (!error && rows && rows[0]) {
          maybeShowRinging(rows[0] as CallRow);
        }
      }, 3000);
    });

    return () => {
      isMounted = false;
      if (pollTimer) clearInterval(pollTimer);

      try {
        // Prefer unsubscribe; removeChannel as optional fallback
        realtimeChannel?.unsubscribe?.();
        // @ts-expect-error removeChannel may exist at runtime depending on SDK minor
        supabase.removeChannel?.(realtimeChannel);
      } catch {
        // no-op
      }
      stopRingtone();
    };
  }, [maybeShowRinging, stopRingtone]);

  // ---------- UI ----------

  const StatusBadge = () => {
    const color =
      status === "connected"
        ? "bg-emerald-600/15 text-emerald-400 ring-1 ring-emerald-500/30"
        : status === "ringing"
        ? "bg-amber-600/15 text-amber-400 ring-1 ring-amber-500/30"
        : status === "connecting"
        ? "bg-sky-600/15 text-sky-400 ring-1 ring-sky-500/30"
        : "bg-zinc-600/15 text-zinc-300 ring-1 ring-zinc-500/30";
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${color}`}>
        {status === "connected" ? (
          <Wifi className="h-3.5 w-3.5" />
        ) : status === "ringing" ? (
          <PhoneIncoming className="h-3.5 w-3.5" />
        ) : status === "connecting" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <User2 className="h-3.5 w-3.5" />
        )}
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg"
          >
            <Phone className="h-5 w-5" />
          </motion.div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">Owner Call Dashboard</h1>
            <p className="text-xs opacity-60">Manage incoming roadside calls</p>
          </div>
        </div>
        <StatusBadge />
      </div>

      {/* Debug strip */}
      <div className="mb-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div className="rounded-lg border border-white/10 bg-white/5 p-2">
          <div className="opacity-60">User</div>
          <div className="truncate">{userId || "—"}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-2">
          <div className="opacity-60">Realtime</div>
          <div className="truncate">{rt}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-2">
          <div className="opacity-60">Time</div>
          <div className="truncate">{new Date().toLocaleTimeString()}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-2">
          <div className="opacity-60">Current Call</div>
          <div className="truncate">{currentIdRef.current ?? "—"}</div>
        </div>
      </div>

      {/* Waiting */}
      {status === "waiting" && (
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/60 to-zinc-800/60 p-6 text-center"
        >
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
            <Mic className="h-6 w-6 opacity-80" />
          </div>
          <h3 className="text-base font-semibold">Waiting for incoming call…</h3>
          <p className="mt-1 text-sm opacity-70">
            Keep this page open. You’ll get a ringtone + notification here.
          </p>
        </motion.div>
      )}

      {/* Ringing */}
      {incoming && status === "ringing" && (
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
                <PhoneIncoming className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <div className="text-sm opacity-70">Incoming for vehicle</div>
                <div className="text-xl font-bold tracking-wide">{incoming.plate}</div>
              </div>
            </div>
            <div className="text-xs opacity-60">
              {dayjs(incoming.created_at).format("HH:mm:ss")}
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={acceptCall}
              disabled={connecting}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 active:scale-[0.98]"
            >
              {connecting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Check className="h-5 w-5" />
              )}
              {connecting ? "Connecting…" : "Accept"}
            </button>

            <button
              onClick={declineCall}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500 active:scale-[0.98]"
            >
              <X className="h-5 w-5" />
              Decline
            </button>
          </div>
        </motion.div>
      )}

      {/* Connected */}
      {status === "connected" && (
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-6"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
                <Wifi className="h-6 w-6 text-emerald-400" />
              </div>
              <div className="text-base font-semibold">On Call</div>
            </div>
            <div className="text-xs opacity-60">
              {incoming?.plate ? `Vehicle: ${incoming.plate}` : ""}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={endCall}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500 active:scale-[0.98]"
            >
              <PhoneOff className="h-5 w-5" />
              End Call
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
