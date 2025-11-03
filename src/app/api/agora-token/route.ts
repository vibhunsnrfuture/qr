// src/app/api/agora-token/route.ts
export const runtime = 'nodejs';        // env vars 100% available
export const dynamic = 'force-dynamic'; // koi caching nahi

import { NextRequest, NextResponse } from "next/server";
import { RtcRole, RtcTokenBuilder } from "agora-access-token";

type Body = { channel: string; role?: "publisher" | "subscriber"; ttlSeconds?: number };

export async function POST(req: NextRequest) {
  try {
    const { channel, role = "publisher", ttlSeconds = 3600 } = (await req.json()) as Body;
    if (!channel || typeof channel !== "string") {
      return NextResponse.json({ message: "channel required" }, { status: 400 });
    }

    const APP_ID = process.env.AGORA_APP_ID ?? "";
    const APP_CERT = process.env.AGORA_APP_CERTIFICATE ?? "";
    if (!APP_ID || !APP_CERT) {
      return NextResponse.json(
        { message: "Missing AGORA_APP_ID / AGORA_APP_CERTIFICATE" },
        { status: 500 }
      );
    }

    const expireAt = Math.floor(Date.now() / 1000) + Number(ttlSeconds || 3600);
    const uid = Math.floor(Math.random() * 2_000_000_000);
    const rtcRole = role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

    const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERT, channel, uid, rtcRole, expireAt);
    return NextResponse.json({ appId: APP_ID, channel, uid, token, expireAt });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
