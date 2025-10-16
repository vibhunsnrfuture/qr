// src/app/api/agora-token/route.ts
// Next.js Node runtime API for Agora tokens (GET for browser test, POST for app)

import { NextRequest } from "next/server";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";

export const runtime = "nodejs";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

const AGORA_APP_ID = mustEnv("AGORA_APP_ID");
const AGORA_APP_CERTIFICATE = mustEnv("AGORA_APP_CERTIFICATE");

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

function buildToken(
  channel: string,
  uid = 0,
  role: "publisher" | "subscriber" = "publisher",
  ttlSeconds = 3600
) {
  const expireAt = Math.floor(Date.now() / 1000) + Number(ttlSeconds);
  const rtcRole = role === "subscriber" ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;

  const token = RtcTokenBuilder.buildTokenWithUid(
    AGORA_APP_ID,
    AGORA_APP_CERTIFICATE,
    String(channel),
    Number(uid),
    rtcRole,
    expireAt
  );

  return { appId: AGORA_APP_ID, channel, uid, token, expireAt };
}

export async function OPTIONS() {
  return new Response(null, { headers: cors });
}

// ⭐ GET: browser test
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const channel = url.searchParams.get("channel");

  if (!channel) {
    const html = `
      <html>
        <body style="font-family: sans-serif; padding: 20px">
          <h3>Agora Token API</h3>
          <p>Use POST from your app, or test via GET:</p>
          <pre>GET /api/agora-token?channel=TEST123</pre>
          <p><b>Note:</b> Don’t expose these tokens publicly.</p>
        </body>
      </html>`;
    return new Response(html, { headers: { "Content-Type": "text/html", ...cors } });
  }

  const data = buildToken(channel);
  return Response.json(data, { headers: cors });
}

// ⭐ POST: for app
export async function POST(req: NextRequest) {
  try {
    const { channel, uid = 0, role = "publisher", ttlSeconds = 3600 } =
      (await req.json()) as {
        channel: string;
        uid?: number;
        role?: "publisher" | "subscriber";
        ttlSeconds?: number;
      };

    if (!channel)
      return new Response("Missing 'channel'", { status: 400, headers: cors });

    const data = buildToken(channel, Number(uid), role, Number(ttlSeconds));
    return Response.json(data, { headers: cors });
  } catch (error) {
    // ✅ Explicitly type the caught variable
    const err = error as Error;
    return new Response(err.message || "Server error", {
      status: 500,
      headers: cors,
    });
  }
}
