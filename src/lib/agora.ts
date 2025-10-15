// src/lib/agora.ts
"use client";

import type {
  IAgoraRTCClient,
  ILocalAudioTrack,
} from "agora-rtc-sdk-ng";
import { supabase } from "@/lib/supabaseClient";

let client: IAgoraRTCClient | null = null;

// load Agora only in the browser
async function getAgora() {
  const mod = await import("agora-rtc-sdk-ng");
  return mod;
}

type TokenResponse = {
  appId: string;
  channel: string;
  uid: number;
  token: string;
  expireAt?: number;
};

async function getToken(channel: string): Promise<TokenResponse> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Please sign in first.");

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const resp = await fetch(`${baseUrl}/functions/v1/agora-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ channel, role: "publisher" }),
  });

  if (!resp.ok) throw new Error(await resp.text());
  return (await resp.json()) as TokenResponse;
}

/** Join and publish mic; returns a cleanup function */
export async function startCall(channel: string): Promise<() => Promise<void>> {
  const Agora = await getAgora();
  if (!client) client = Agora.default.createClient({ mode: "rtc", codec: "vp8" });

  // ask mic first
  const mic: ILocalAudioTrack = await Agora.default.createMicrophoneAudioTrack();

  const { appId, token, uid } = await getToken(channel);
  await client.join(appId, channel, token, uid || null);
  await client.publish([mic]);

  client.on("user-published", async (user, mediaType) => {
    if (mediaType === "audio") {
      await client!.subscribe(user, "audio");
      user.audioTrack?.play();
    }
  });

  return async () => {
    try {
      mic.stop();
      mic.close();
    } catch {}
    try {
      await client?.leave();
    } catch {}
  };
}
