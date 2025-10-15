"use client";
export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { startCall } from "@/lib/agora";

type CallRow = {
  id: string;
  channel: string;
  status: "ringing" | "accepted" | "declined" | "timeout" | "ended";
};

export default function ScanCallPage() {
  const { plate } = useParams<{ plate: string }>();
  const [ui, setUi] = useState("starting...");
  const sessionIdRef = useRef<string | null>(null);
  const stopRef = useRef<null | (() => Promise<void>)>(null);
  const channelRef = useRef<string | null>(null);
  const subRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    async function run() {
      setUi("Ringing owner...");
      // 1) create session via RPC
      const { data, error } = await supabase.rpc("create_call_session", {
        p_plate: String(plate),
        p_caller: { ua: navigator.userAgent },
      });
      if (error) {
        setUi(`Failed: ${error.message}`);
        return;
      }
      const row = data as CallRow & { channel: string };
      sessionIdRef.current = row.id;
      channelRef.current = row.channel;

      // 2) subscribe to this row for status changes
      const ch = supabase
        .channel(`call_${row.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "call_sessions",
            filter: `id=eq.${row.id}`,
          },
          async (payload) => {
            const next = payload.new as CallRow;
            if (!next) return;

            if (next.status === "accepted") {
              setUi("Connecting...");
              const stop = await startCall(channelRef.current!);
              stopRef.current = stop;
              setUi("Connected — talking");
            } else if (next.status === "declined") {
              setUi("Declined by owner");
            } else if (next.status === "timeout") {
              setUi("No answer (timeout)");
            } else if (next.status === "ended") {
              setUi("Call ended");
              await stopRef.current?.();
            }
          }
        )
        .subscribe();
      subRef.current = ch;

      // Optional: timeout after 25s if no accept
      setTimeout(async () => {
        if (!sessionIdRef.current) return;
        // just mark UI; server-side timeout rule optional later
        if (!stopRef.current) setUi("No answer (timeout)");
      }, 25000);
    }

    run();
    return () => {
      stopRef.current?.();
      if (subRef.current) supabase.removeChannel(subRef.current);
    };
  }, [plate]);

  return (
    <div className="space-y-3 p-6">
      <h1 className="text-xl font-semibold">Calling owner — {String(plate).toUpperCase()}</h1>
      <div className="text-sm">{ui}</div>
      {stopRef.current && (
        <button className="btn" onClick={() => stopRef.current?.()}>
          Hang Up
        </button>
      )}
    </div>
  );
}
