import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type VehicleRow = { plate: string; owner_id: string | null; active?: boolean };

type CallerInfo = Record<string, unknown>;
type Body = { plate?: string; via?: string; caller_info?: CallerInfo; };

type CallInsert = {
  plate: string;
  owner_id: string;
  channel: string;
  status: "ringing";
  caller_info: CallerInfo;
};

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // ✅ no fallback now
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function bad(msg: string, code = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error: msg, ...extra }, { status: code });
}

export async function POST(req: Request) {
  try {
    if (!URL) return bad("Server env not configured (URL)", 500);
    if (!SERVICE_KEY) {
      // Helpful error so aap turant dekh pao
      return bad("SERVICE_ROLE key missing (SUPABASE_SERVICE_ROLE_KEY). API using anon would violate RLS.", 500, {
        hint: "Set SUPABASE_SERVICE_ROLE_KEY in .env.local (server-only). Restart dev server."
      });
    }

    // ✅ server-side client (no session persistence)
    const supabase = createClient(URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${SERVICE_KEY}` } }
    });

    const raw = await req.text();
    const body: Body = raw ? (JSON.parse(raw) as Body) : {};
    const rawPlate = (body.plate ?? "").trim();
    if (!rawPlate) return bad("Missing plate");

    const norm = rawPlate.toUpperCase().replace(/\s+/g, "");

    // 1) exact
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

    // 2) fuzzy fallback
    if (found.length === 0) {
      const { data, error } = await supabase
        .from("vehicles")
        .select("plate, owner_id, active")
        .or(`plate.ilike.${norm},plate.ilike.%${norm}%`)
        .limit(3);
      if (error) return bad(`DB error(fuzzy): ${error.message}`, 500);
      found = data ?? [];
    }

    if (found.length === 0) {
      return bad(`No owner found for plate "${rawPlate}"`, 404, {
        normalized: norm
      });
    }

    const vehicle =
      found.find((v) => v.active !== false && v.owner_id) ??
      found.find((v) => v.owner_id) ??
      found[0];

    if (!vehicle.owner_id) {
      return bad(`Vehicle "${vehicle.plate}" has no owner_id`, 409);
    }
    if (vehicle.active === false) {
      return bad(`Vehicle "${vehicle.plate}" is disabled`, 409);
    }

    const payload: CallInsert = {
      plate: vehicle.plate,
      owner_id: vehicle.owner_id,
      channel: vehicle.plate,
      status: "ringing",
      caller_info: body.caller_info ?? { via: body.via ?? "api" },
    };

    const { data: inserted, error: insErr } = await supabase
      .from("call_sessions")
      .insert(payload)
      .select("*")
      .limit(1);
    if (insErr) return bad(`Insert error: ${insErr.message}`, 500);

    // small debug: confirm service key actually used
    const keyType =
      SERVICE_KEY && ANON_KEY && SERVICE_KEY !== ANON_KEY ? "service" : "maybe-anon";

    return NextResponse.json({ ok: true, keyType, call: (inserted ?? [])[0] }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return bad(`Unhandled: ${msg}`, 500);
  }
}
