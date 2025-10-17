import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type VehicleRow = { plate: string; owner_id: string };
type CallInsert = {
  plate: string;
  owner_id: string;
  channel: string;
  status: "ringing";
  caller_info: Record<string, unknown>;
};

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function bad(msg: string, code = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status: code });
}

export async function POST(req: Request) {
  try {
    if (!URL || !SERVICE_KEY) return bad("Server env not configured", 500);

    const supabase = createClient(URL, SERVICE_KEY);

    const body = (await req.json().catch(() => ({}))) as { plate?: string; via?: string };
    const rawPlate = (body.plate ?? "").trim();
    if (!rawPlate) return bad("Missing plate");

    // normalize: trim + uppercase
    const norm = rawPlate.toUpperCase();

    // Try exact match on normalized plate
    const { data: byExact, error: exErr } = await supabase
      .from("vehicles")
      .select("plate, owner_id")
      .eq("plate", norm)
      .limit(1);

    if (exErr) return bad(`DB error: ${exErr.message}`, 500);

    let vehicle: VehicleRow | undefined = (byExact ?? [])[0] as VehicleRow | undefined;

    // If exact didn’t find anything, try case-insensitive (ILike needs %)
    if (!vehicle) {
      const { data: byLike, error: likeErr } = await supabase
        .from("vehicles")
        .select("plate, owner_id")
        .ilike("plate", norm) // norm is already uppercase; ILIKE works case-insensitive
        .limit(1);

      if (likeErr) return bad(`DB error: ${likeErr.message}`, 500);
      vehicle = (byLike ?? [])[0] as VehicleRow | undefined;
    }

    if (!vehicle) {
      return bad(`No owner found for plate "${rawPlate}" (normalized "${norm}")`, 404);
    }

    const payload: CallInsert = {
      plate: vehicle.plate, // keep canonical plate from DB
      owner_id: vehicle.owner_id,
      channel: vehicle.plate, // channel == plate
      status: "ringing",
      caller_info: { via: body.via ?? "api" },
    };

    const { data: inserted, error: insErr } = await supabase
      .from("call_sessions")
      .insert(payload)
      .select("*")
      .limit(1);

    if (insErr) return bad(`Insert error: ${insErr.message}`, 500);

    return NextResponse.json({ ok: true, call: (inserted ?? [])[0] }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return bad(`Unhandled: ${msg}`, 500);
  }
}
