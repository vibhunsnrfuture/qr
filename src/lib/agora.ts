"use client";

import type { IAgoraRTCClient, ILocalAudioTrack } from "agora-rtc-sdk-ng";

let client: IAgoraRTCClient | null = null;
async function getAgora() { return await import("agora-rtc-sdk-ng"); }

type TokenResponse = { appId: string; channel: string; uid: number; token: string; expireAt?: number; };

async function getToken(channel: string): Promise<TokenResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const resp = await fetch(`${baseUrl}/functions/v1/agora-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channel: channel.toUpperCase(), role: "publisher" })
  });
  if (!resp.ok) throw new Error(await resp.text());
  return (await resp.json()) as TokenResponse;
}

/** Caller: join + publish mic, returns hangup() */
export async function startCall(channel: string): Promise<() => Promise<void>> {
  const Agora = await getAgora();
  if (!client) client = Agora.default.createClient({ mode: "rtc", codec: "vp8" });

  const normalized = channel.toUpperCase();
  const mic: ILocalAudioTrack = await Agora.default.createMicrophoneAudioTrack();

  const { appId, token, uid } = await getToken(normalized);
  await client.join(appId, normalized, token, uid || null);
  await client.publish([mic]);

  client.on("user-published", async (user, mediaType) => {
    if (mediaType === "audio") {
      await client!.subscribe(user, "audio");
      user.audioTrack?.play();
      console.log("[caller] subscribed", user.uid);
    }
  });
  for (const ru of client.remoteUsers) {
    if (ru.hasAudio) { await client.subscribe(ru, "audio"); ru.audioTrack?.play(); }
  }

  return async () => {
    try { mic.stop(); mic.close(); } catch {}
    try { await client?.leave(); } catch {}
  };
}
