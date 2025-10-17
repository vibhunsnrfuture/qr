"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type {
  RealtimeChannel,
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from "@supabase/supabase-js";
import dayjs from "dayjs";
import { Phone, PhoneIncoming, PhoneOff, Wifi, Loader2, Mic, User2, Check, X } from "lucide-react";

/* ----------------------------- types & helpers ---------------------------- */

type StopFn = () => Promise<void>;
type StartCallFn = (channel: string) => Promise<StopFn | void>;

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

function isCallRow(x: unknown): x is CallRow {
  if (!x || typeof x !== "object") return false;
  const r = x as Partial<CallRow>;
  return (
    typeof r.id === "string" &&
    typeof r.plate === "string" &&
    typeof r.owner_id === "string" &&
    typeof r.channel === "string" &&
    typeof r.status === "string" &&
    typeof r.created_at === "string"
  );
}

function isStopFn(v: unknown): v is StopFn {
  return typeof v === "function";
}

/* ------------------------------- component -------------------------------- */

export default function OwnerCallPage() {
  const [incoming, setIncoming] = useState<CallRow | null>(null);
  const [status, setStatus] = useState<"waiting" | "ringing" | "connecting" | "connected">("waiting");
  const [rt, setRt] = useState("INIT");
  const [userId, setUserId] = useState<string>("");
  const [connecting, setConnecting] = useState(false);

  const currentIdRef = useRef<string | null>(null);
  const ringRef = useRef<HTMLAudioElement | null>(null);
  const stopRef = useRef<StopFn | null>(null);

  
const [now, setNow] = useState<string>("");

// start ticking on client only
useEffect(() => {
  setNow(new Date().toLocaleTimeString());
  const id = setInterval(() => setNow(new Date().toLocaleTimeString()), 1000);
  return () => clearInterval(id);
}, []);


  const stopRingtone = useCallback(() => {
    const a = ringRef.current;
    if (!a) return;
    try {
      a.pause();
      a.currentTime = 0;
    } catch {}
    ringRef.current = null;
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
    const call = incoming;
    if (!call) return;

    stopRingtone();
    setConnecting(true);
    setStatus("connecting");
    await updateStatus(call.id, "accepted");

    let startCallToUse: StartCallFn | null = null;
    try {
      // use your existing lib/agora (does mic join + remote subscribe)
      const mod = await import("@/lib/agora");
      startCallToUse = (mod as unknown as { startCall?: StartCallFn }).startCall ?? null;
    } catch {
      startCallToUse = null;
    }

    // if lib/agora is present it returns a stop() or void
    const mayStop = await (startCallToUse ? startCallToUse(call.channel) : Promise.resolve(undefined));
    stopRef.current = isStopFn(mayStop) ? mayStop : null;

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
      const fresh = dayjs(row.created_at).isAfter(dayjs().subtract(2, "minute"));
      if (row.status === "ringing" && fresh) {
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
    let mounted = true;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let channel: RealtimeChannel | null = null;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      const user = data?.user;
      if (!user) return;

      setUserId(user.id);

      channel = supabase
        .channel("owner_call_sessions")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "call_sessions", filter: `owner_id=eq.${user.id}` },
          (payload: RealtimePostgresInsertPayload<Record<string, unknown>>) => {
            const row = payload.new;
            if (isCallRow(row)) maybeShowRinging(row);
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "call_sessions", filter: `owner_id=eq.${user.id}` },
          (payload: RealtimePostgresUpdatePayload<Record<string, unknown>>) => {
            const row = payload.new;
            if (isCallRow(row)) maybeShowRinging(row);
          }
        )
        .subscribe((s) => setRt(s === "SUBSCRIBED" ? "SUBSCRIBED" : String(s)));

      // safety net polling (for missed RT events)
      pollTimer = setInterval(async () => {
        const { data: rows, error } = await supabase
          .from("call_sessions")
          .select("*")
          .eq("owner_id", user.id)
          .eq("status", "ringing")
          .gt("created_at", dayjs().subtract(2, "minute").toISOString())
          .order("created_at", { ascending: false })
          .limit(1);

        if (!mounted || error || !rows || rows.length === 0) return;
        const row = rows[0];
        if (isCallRow(row)) maybeShowRinging(row);
      }, 3000);
    });

    return () => {
      mounted = false;
      if (pollTimer) clearInterval(pollTimer);
      try {
        if (channel) {
          (channel as unknown as { unsubscribe?: () => void }).unsubscribe?.();
          supabase.removeChannel(channel);
        }
      } catch {}
      stopRingtone();
    };
  }, [maybeShowRinging, stopRingtone]);

  /* --------------------------------- UI ---------------------------------- */

  const StatusBadge = () => {
    const cls =
      status === "connected"
        ? "bg-emerald-600/15 text-emerald-300 ring-1 ring-emerald-500/30"
        : status === "ringing"
        ? "bg-amber-600/15 text-amber-300 ring-1 ring-amber-500/30"
        : status === "connecting"
        ? "bg-sky-600/15 text-sky-300 ring-1 ring-sky-500/30"
        : "bg-zinc-600/15 text-zinc-300 ring-1 ring-zinc-500/30";
    const Icon =
      status === "connected" ? Wifi : status === "ringing" ? PhoneIncoming : status === "connecting" ? Loader2 : User2;
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${cls}`}>
        <Icon className={`h-3.5 w-3.5 ${status === "connecting" ? "animate-spin" : ""}`} />
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      {/* header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">Owner Call Dashboard</h1>
            <p className="text-xs opacity-60">Manage incoming roadside calls</p>
          </div>
        </div>
        <StatusBadge />
      </div>

      {/* debug strip */}
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
           <div className="truncate" suppressHydrationWarning>{now || "—"}</div>
</div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-2">
          <div className="opacity-60">Current Call</div>
          <div className="truncate">{currentIdRef.current ?? "—"}</div>
        </div>
      </div>

      {/* waiting */}
      {status === "waiting" && (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/60 to-zinc-800/60 p-6 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
            <Mic className="h-6 w-6 opacity-80" />
          </div>
          <h3 className="text-base font-semibold">Waiting for incoming call…</h3>
          <p className="mt-1 text-sm opacity-70">Keep this page open. You’ll get a ringtone + notification here.</p>
        </div>
      )}

      {/* ringing */}
      {incoming && status === "ringing" && (
        <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-6">
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
            <div className="text-xs opacity-60">{dayjs(incoming.created_at).format("HH:mm:ss")}</div>
          </div>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={acceptCall}
              disabled={connecting}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 active:scale-[0.98]"
            >
              {connecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
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
        </div>
      )}

      {/* connected */}
      {status === "connected" && (
        <div className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
                <Wifi className="h-6 w-6 text-emerald-400" />
              </div>
              <div className="text-base font-semibold">On Call</div>
            </div>
            <div className="text-xs opacity-60">{incoming?.plate ? `Vehicle: ${incoming.plate}` : ""}</div>
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
        </div>
      )}
    </div>
  );
}
