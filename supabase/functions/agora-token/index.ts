/// <reference lib="deno.ns" />
// @ts-nocheck
// Supabase Edge Function (Deno) — Agora RTC token via agora-access-token

import { RtcTokenBuilder, RtcRole } from "npm:agora-access-token@2.0.4";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const AGORA_APP_ID = Deno.env.get("AGORA_APP_ID")!;
const AGORA_APP_CERTIFICATE = Deno.env.get("AGORA_APP_CERTIFICATE")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function getUser(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await supabase.auth.getUser();
  if (error) console.error("[getUser]", error.message);
  return data.user;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  const user = await getUser(req);
  if (!user) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const channel = String(body?.channel ?? "").trim();
    if (!channel) return new Response("channel required", { status: 400, headers: corsHeaders });

    const ttlSeconds = Number.isFinite(Number(body?.ttlSeconds)) ? Number(body.ttlSeconds) : 3600;
    const expireAt = Math.floor(Date.now() / 1000) + ttlSeconds;

    // Agora requires numeric uid. 0 => let Agora assign.
    const uidNum = Number(body?.uid);
    const uid = Number.isFinite(uidNum) ? uidNum : 0;

    const roleStr = String(body?.role ?? "publisher").toLowerCase();
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
    console.error("[agora-token] error", e);
    return new Response("internal error", { status: 500, headers: corsHeaders });
  }
});
