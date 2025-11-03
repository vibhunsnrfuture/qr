// src/app/api/call/start/route.ts

export const runtime = "nodejs";          // make sure env vars are available on Vercel
export const dynamic = "force-dynamic";   // no caching for this API

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/* ----------------------------- Env & constants ---------------------------- */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// (debug guard) — remove after prod turns green
function envMissingResponse() {
  return NextResponse.json(
    {
      ok: false,
      error: "Env missing",
      have: { url: !!URL, service: !!SERVICE_KEY },
      vercel: { env: process.env.VERCEL_ENV },
    },
    { status: 500 }
  );
}

/* --------------------------------- Types --------------------------------- */

type VehicleRow = {
  plate: string;
  owner_id: string;
  active?: boolean | null;
};

type CallInsert = {
  plate: string;
  owner_id: string;
  channel: string;
  status: "ringing";
  caller_info: Record<string, unknown>;
};

type CallRow = CallInsert & {
  id: number | string;
  created_at: string;
  accepted_at: string | null;
  ended_at: string | null;
};

type StartBody = {
  plate?: string;
  via?: string;
  caller_info?: Record<string, unknown>;
};

/* -------------------------------- Helpers -------------------------------- */

function bad(msg: string, code = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error: msg, ...extra }, { status: code });
}

function normalizePlate(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

/* --------------------------------- Route --------------------------------- */

export async function POST(req: Request) {
  try {
    if (!URL || !SERVICE_KEY) return envMissingResponse();

    const supabase = createClient(URL, SERVICE_KEY);

    // parse body
    const body = (await req.json().catch(() => ({}))) as unknown as StartBody;
    const rawPlate = body.plate ?? "";
    const plateNorm = normalizePlate(rawPlate);
    if (!plateNorm) return bad("Missing plate");

    // 1) find vehicle owner (prefer exact match, else ILIKE), only active
    let vehicle: VehicleRow | null = null;

    {
      const { data, error } = await supabase
        .from("vehicles")
        .select<"plate, owner_id, active", VehicleRow>("plate, owner_id, active")
        .eq("plate", plateNorm)
        .eq("active", true)
        .limit(1)
        .maybeSingle();

      if (error) return bad(`DB error (exact): ${error.message}`, 500);
      vehicle = data ?? null;
    }

    if (!vehicle) {
      const { data, error } = await supabase
        .from("vehicles")
        .select<"plate, owner_id, active", VehicleRow>("plate, owner_id, active")
        .ilike("plate", plateNorm)
        .eq("active", true)
        .limit(1)
        .maybeSingle();

      if (error) return bad(`DB error (ilike): ${error.message}`, 500);
      vehicle = data ?? null;
    }

    if (!vehicle) {
      return bad(`No owner found for plate "${rawPlate}" (normalized "${plateNorm}")`, 404);
    }

    // 2) insert call_sessions → status "ringing"
    const payload: CallInsert = {
      plate: vehicle.plate,
      owner_id: vehicle.owner_id,
      channel: vehicle.plate, // channel == plate (your dashboard subscribes on this)
      status: "ringing",
      caller_info: body.caller_info ?? { via: body.via ?? "api" },
    };

    const { data: inserted, error: insErr } = await supabase
      .from("call_sessions")
      .insert(payload)
      .select("*")
      .limit(1)
      .maybeSingle<CallRow>();

    if (insErr) return bad(`Insert error: ${insErr.message}`, 500);
    if (!inserted) return bad("Insert returned no row", 500);

    // 3) success
    return NextResponse.json({ ok: true, call: inserted }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return bad(`Unhandled: ${msg}`, 500);
  }
}
