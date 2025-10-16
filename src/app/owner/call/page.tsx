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

/* ---------------------------------------------------------------------------
   Types + Guards
--------------------------------------------------------------------------- */
type StopFn = () => Promise<void>;
type StartCallFn = (ch: string) => Promise<StopFn | void>;
type AgoraModule = { startCall?: StartCallFn };

function isStopFn(v: unknown): v is StopFn {
  return typeof v === "function";
}

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

/* ---------------------------------------------------------------------------
   Inline fallback for Agora (only if "@/lib/agora".startCall is missing)
--------------------------------------------------------------------------- */
async function fetchAgToken(channel: string): Promise<{
  appId: string;
  token: string | null;
  uid: number;
}> {
  try {
    const res = await fetch(`/api/agora-token?channel=${encodeURIComponent(channel)}`);
    if (res.ok) {
      const j = (await res.json()) as { appId?: string; token?: string | null; uid?: number };
      if (j?.appId) return { appId: j.appId, token: j.token ?? null, uid: j.uid ?? 0 };
    }
  } catch {
    /* ignore */
  }
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || "";
  if (!appId) throw new Error("Missing NEXT_PUBLIC_AGORA_APP_ID or token API.");
  return { appId, token: null, uid: 0 };
}

const inlineStartCall: StartCallFn = async (channel: string) => {
  if (typeof window === "undefined") return;

  const { default: AgoraRTC } = await import("agora-rtc-sdk-ng");
  type IAgoraRTCClient = import("agora-rtc-sdk-ng").IAgoraRTCClient;
  type IMicrophoneAudioTrack = import("agora-rtc-sdk-ng").IMicrophoneAudioTrack;
  type IRemoteAudioTrack = import("agora-rtc-sdk-ng").IRemoteAudioTrack;
  type IAgoraRTCRemoteUser = import("agora-rtc-sdk-ng").IAgoraRTCRemoteUser;

  const { appId, token, uid } = await fetchAgToken(channel);

  const client: IAgoraRTCClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  const localTracks: { mic: IMicrophoneAudioTrack | null } = { mic: null };

  client.on("token-privilege-will-expire", async () => {
    try {
      const fresh = await fetchAgToken(channel);
      await client.renewToken(fresh.token || "");
    } catch {}
  });

  client.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
    await client.subscribe(user, mediaType);
    if (mediaType === "audio") {
      const track = user.audioTrack as IRemoteAudioTrack | null;
      track?.play();
    }
  });

  await client.join(appId, channel, token || null, uid || null);
  localTracks.mic = await AgoraRTC.createMicrophoneAudioTrack();
  await client.publish([localTracks.mic]);

  const stop: StopFn = async () => {
    try {
      if (localTracks.mic) {
        localTracks.mic.stop();
        localTracks.mic.close();
        localTracks.mic = null;
      }
    } catch {}
    try {
      await client.leave();
    } catch {}
  };

  return stop;
};

/* ---------------------------------------------------------------------------
   Component
--------------------------------------------------------------------------- */
export default function OwnerCallPage() {
  const [incoming, setIncoming] = useState<CallRow | null>(null);
  const [status, setStatus] = useState<"waiting" | "ringing" | "connecting" | "connected">(
    "waiting"
  );
  const [rt, setRt] = useState("INIT");
  const [userId, setUserId] = useState<string>("");
  const [connecting, setConnecting] = useState(false);

  const currentIdRef = useRef<string | null>(null);
  const ringRef = useRef<HTMLAudioElement | null>(null);
  const stopRef = useRef<StopFn | null>(null);

  const stopRingtone = useCallback((): void => {
    const a = ringRef.current;
    if (a) {
      try {
        a.pause();
        a.currentTime = 0;
      } catch {}
      ringRef.current = null;
    }
  }, []);

  const playRingtone = useCallback((): void => {
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
    const call = incoming;
    if (!call) return;

    stopRingtone();
    setConnecting(true);
    setStatus("connecting");
    await updateStatus(call.id, "accepted");

    let startCallToUse: StartCallFn | null = null;
    try {
      const mod = (await import("@/lib/agora")) as unknown as AgoraModule;
      startCallToUse = mod.startCall ?? null;
    } catch {
      startCallToUse = null;
    }

    const maybeStop = await (startCallToUse
      ? startCallToUse(call.channel)
      : inlineStartCall(call.channel));

    stopRef.current = isStopFn(maybeStop) ? maybeStop : null;

    setConnecting(false);
    setStatus("connected");
  }

  async function declineCall() {
    const call = incoming;
    if (!call) return;

    stopRingtone();
    await updateStatus(call.id, "declined");
    currentIdRef.current = null;
    setIncoming(null);
    setStatus("waiting");
  }

  async function endCall() {
    stopRingtone();
    const call = incoming;
    if (call) await updateStatus(call.id, "ended");

    const stopper = stopRef.current;
    if (isStopFn(stopper)) await stopper();
    stopRef.current = null;

    currentIdRef.current = null;
    setIncoming(null);
    setStatus("waiting");
  }

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

  useEffect(() => {
    let isMounted = true;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let realtimeChannel: RealtimeChannel | null = null;

    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return;
      const user = data?.user;
      if (!user) return;

      setUserId(user.id);

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

      // Poll fallback
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

      // Safe cleanup without ts-ignore
      try {
        if (realtimeChannel) {
          // Prefer unsubscribe if available
          (realtimeChannel as unknown as { unsubscribe?: () => void }).unsubscribe?.();

          // Optional: remove from client if present (older/newer SDKs differ)
          type SupabaseWithRemove = typeof supabase & {
            removeChannel?: (ch: RealtimeChannel) => void;
          };
          const removeFn = (supabase as SupabaseWithRemove).removeChannel;
          if (typeof removeFn === "function") removeFn(realtimeChannel);
        }
      } catch {
        /* ignore */
      }
      stopRingtone();
    };
  }, [maybeShowRinging, stopRingtone]);

  /* --------------------------- UI --------------------------- */

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
