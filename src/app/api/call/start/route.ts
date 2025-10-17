import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type VehicleRow = { plate: string; owner_id: string | null; active?: boolean };

type CallerInfo = Record<string, unknown>;
type Body = {
  plate?: string;
  via?: string;
  caller_info?: CallerInfo;
};

type CallInsert = {
  plate: string;
  owner_id: string;
  channel: string;
  status: "ringing";
  caller_info: CallerInfo;
};

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function bad(msg: string, code = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error: msg, ...extra }, { status: code });
}

export async function POST(req: Request) {
  try {
    if (!URL || !SERVICE_KEY) return bad("Server env not configured", 500);

    const supabase = createClient(URL, SERVICE_KEY);

    // read body safely
    const raw = await req.text();
    const body: Body = raw ? (JSON.parse(raw) as Body) : {};

    const rawPlate = (body.plate ?? "").trim();
    if (!rawPlate) return bad("Missing plate");

    // normalize like your UI: uppercase + remove all spaces
    const norm = rawPlate.toUpperCase().replace(/\s+/g, "");

    // 1) try exact match first
    let found: VehicleRow[] = [];
    {
      const { data, error } = await supabase
        .from("vehicles")
        .select("plate, owner_id, active")
        .eq("plate", norm)
        .limit(1);
      if (error) return bad(`DB error(exact): ${error.message}`, 500);
      found = data ?? [];
    }

    // 2) fallback: case-insensitive and “contains” (handles stray dashes/spaces)
    if (found.length === 0) {
      const { data, error } = await supabase
        .from("vehicles")
        .select("plate, owner_id, active")
        .or(
          // plate.ilike.norm OR plate.ilike.%norm%
          // (norm is A–Z0–9 only after our replace, so safe)
          `plate.ilike.${norm},plate.ilike.%${norm}%`
        )
        .limit(3);
      if (error) return bad(`DB error(fuzzy): ${error.message}`, 500);
      found = data ?? [];
    }

    if (found.length === 0) {
      // helpful debug payload
      const { count } = await supabase.from("vehicles").select("plate", { count: "exact", head: true });
      return bad(`No owner found for plate "${rawPlate}"`, 404, {
        hint: "Add vehicle in /owner/vehicles or check plate formatting",
        vehicles_total: count ?? 0,
        normalized: norm,
      });
    }

    // prefer active + owner_id set
    const vehicle =
      found.find((v) => v.active !== false && v.owner_id) ??
      found.find((v) => v.owner_id) ??
      found[0];

    if (!vehicle.owner_id) {
      return bad(`Vehicle "${vehicle.plate}" has no owner_id`, 409, {
        fix: "Ensure owner_id is set for this vehicle",
      });
    }
    if (vehicle.active === false) {
      return bad(`Vehicle "${vehicle.plate}" is disabled`, 409, {
        fix: "Enable the vehicle from /owner/vehicles",
      });
    }

    const payload: CallInsert = {
      plate: vehicle.plate,          // canonical plate from DB
      owner_id: vehicle.owner_id,
      channel: vehicle.plate,        // both sides join same channel
      status: "ringing",
      caller_info: body.caller_info ?? { via: body.via ?? "api" },
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
