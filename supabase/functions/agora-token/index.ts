/// <reference lib="deno.ns" />
// @ts-nocheck
// Public Agora token (NO login). Token only if plate exists AND active=true.

import { RtcTokenBuilder, RtcRole } from "npm:agora-access-token@2.0.4";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const AGORA_APP_ID = Deno.env.get("AGORA_APP_ID")!;
const AGORA_APP_CERTIFICATE = Deno.env.get("AGORA_APP_CERTIFICATE")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// optional: restrict to your site only (else keep "*")
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  global: { headers: { "x-ctx": "agora-token" } },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const channel = String(body?.channel ?? "").trim().toUpperCase();
    const roleStr = String(body?.role ?? "publisher").toLowerCase();
    const ttlSeconds = Number.isFinite(Number(body?.ttlSeconds)) ? Number(body.ttlSeconds) : 3600;

    if (!channel) return new Response("channel required", { status: 400, headers: corsHeaders });

    // ✅ check vehicles table
    const { data: v, error } = await admin
      .from("vehicles")
      .select("id, active")
      .eq("plate", channel)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[vehicles check]", error.message);
      return new Response("db error", { status: 500, headers: corsHeaders });
    }
    if (!v) return new Response("unknown channel", { status: 404, headers: corsHeaders });
    if (v.active === false) return new Response("channel disabled", { status: 403, headers: corsHeaders });

    const expireAt = Math.floor(Date.now() / 1000) + ttlSeconds;
    const uid = 0; // let Agora assign
    const role = roleStr === "subscriber" ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;

    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channel,
      uid,
      role,
      expireAt
    );

    return new Response(JSON.stringify({ appId: AGORA_APP_ID, channel, uid, token, expireAt }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    console.error("[agora-token]", e);
    return new Response("internal error", { status: 500, headers: corsHeaders });
  }
});
