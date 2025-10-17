// src/app/api/call/start/route.ts
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
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
  try {
    const { plate } = (await req.json()) as { plate?: string };
    if (!plate) return NextResponse.json({ ok: false, error: "Missing plate" }, { status: 400 });

    const supabase = createClient(URL, KEY);

    // find owner for the plate
    const { data: vehicles, error: vErr } = await supabase
      .from("vehicles")
      .select("plate, owner_id")
      .eq("plate", plate)
      .limit(1);

    if (vErr) return NextResponse.json({ ok: false, error: vErr.message }, { status: 500 });
    const vehicle = (vehicles ?? [])[0] as VehicleRow | undefined;
    if (!vehicle) return NextResponse.json({ ok: false, error: "No owner found for plate" }, { status: 404 });

    const payload: CallInsert = {
      plate,
      owner_id: vehicle.owner_id,
      channel: plate,
      status: "ringing",
      caller_info: { via: "api" },
    };

    const { data: inserted, error: iErr } = await supabase
      .from("call_sessions")
      .insert(payload)
      .select("*")
      .limit(1);

    if (iErr) return NextResponse.json({ ok: false, error: iErr.message }, { status: 500 });
    return NextResponse.json({ ok: true, call: (inserted ?? [])[0] }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
