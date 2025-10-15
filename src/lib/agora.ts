// src/lib/agora.ts
"use client";

import type {
  IAgoraRTCClient,
  ILocalAudioTrack,
  UID,
} from "agora-rtc-sdk-ng";

/* ------------------------------------------------------------------ */
/*  Internal client handling (SSR-safe, strict TypeScript friendly)   */
/* ------------------------------------------------------------------ */

let client: IAgoraRTCClient | null = null;

async function getAgora() {
  // Dynamic import so this never runs during SSR
  const mod = await import("agora-rtc-sdk-ng");
  return mod.default;
}

/** Create (or return) a singleton client */
async function getClient(): Promise<IAgoraRTCClient> {
  if (client) return client;
  const AgoraRTC = await getAgora();
  client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  return client;
}

/** Throws if client is not initialized (for strict TS) */
function ensureClient(): IAgoraRTCClient {
  if (!client) throw new Error("Agora client not initialized");
  return client;
}

/* ------------------------------------------------------------------ */
/*                              Token API                              */
/* ------------------------------------------------------------------ */

type TokenResponse = {
  appId: string;
  channel: string;
  uid: UID | 0;
  token: string;
  expireAt?: number;
};

/** Call the public Supabase function to get an RTC token */
async function getToken(
  channel: string,
  role: "publisher" | "subscriber"
): Promise<TokenResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined");
  }

  const resp = await fetch(`${baseUrl}/functions/v1/agora-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channel: channel.toUpperCase(), role }),
  });

  if (!resp.ok) {
    // bubble up server error to the UI
    throw new Error(await resp.text());
  }
  return (await resp.json()) as TokenResponse;
}

/* ------------------------------------------------------------------ */
/*                          Public API (UI)                            */
/* ------------------------------------------------------------------ */

/**
 * Caller (QR side): join channel and publish the mic.
 * Returns a cleanup function that hangs up.
 */
export async function startCall(
  channel: string
): Promise<() => Promise<void>> {
  const normalized = channel.toUpperCase();
  const AgoraRTC = await getAgora();
  const c = await getClient();

  // Ask mic permission early
  const mic: ILocalAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();

  const { appId, token, uid } = await getToken(normalized, "publisher");
  await c.join(appId, normalized, token, uid || null);
  await c.publish([mic]);

  // Subscribe to any remote audio
  c.on("user-published", async (user, mediaType) => {
    if (mediaType === "audio") {
      await ensureClient().subscribe(user, "audio");
      user.audioTrack?.play();
      console.log("[caller] subscribed audio from", user.uid);
    }
  });

  // Handle users who were already published before handler bound
  for (const ru of c.remoteUsers) {
    if (ru.hasAudio) {
      await c.subscribe(ru, "audio");
      ru.audioTrack?.play();
      console.log("[caller] subscribed existing audio from", ru.uid);
    }
  }

  // cleanup / hangup
  return async () => {
    try {
      mic.stop();
      mic.close();
    } catch {}
    try {
      await ensureClient().leave();
    } catch {}
  };
}

/**
 * Receiver (owner): join as subscriber, auto-play remote audio,
 * and optionally publish mic for two-way talk.
 *
 * Returns controls: toggleMic(on?) and leave().
 */
export async function joinAsReceiver(channel: string) {
  const normalized = channel.toUpperCase();
  const AgoraRTC = await getAgora();
  const c = await getClient();

  // Join with a subscriber token
  const { appId, token, uid } = await getToken(normalized, "subscriber");
  await c.join(appId, normalized, token, uid || null);

  // Play any new remote audio
  c.on("user-published", async (user, mediaType) => {
    if (mediaType === "audio") {
      await ensureClient().subscribe(user, "audio");
      user.audioTrack?.play();
      console.log("[receiver] subscribed new audio from", user.uid);
    }
  });

  // Also play users that were already published
  for (const ru of c.remoteUsers) {
    if (ru.hasAudio) {
      await c.subscribe(ru, "audio");
      ru.audioTrack?.play();
      console.log("[receiver] subscribed existing audio from", ru.uid);
    }
  }

  // Optional local mic for two-way talk
  let localMic: ILocalAudioTrack | null = null;

  async function toggleMic(on?: boolean) {
    const wantOn = on ?? !localMic;

    if (wantOn && !localMic) {
      localMic = await AgoraRTC.createMicrophoneAudioTrack();
      await ensureClient().publish([localMic]);
      console.log("[receiver] mic ON");
    } else if (!wantOn && localMic) {
      await ensureClient().unpublish([localMic]);
      try {
        localMic.stop();
        localMic.close();
      } finally {
        localMic = null;
      }
      console.log("[receiver] mic OFF");
    }
  }

  async function leave() {
    try {
      if (localMic) {
        await ensureClient().unpublish([localMic]);
        localMic.stop();
        localMic.close();
        localMic = null;
      }
    } catch {}
    try {
      await ensureClient().leave();
    } catch {}
  }

  return { toggleMic, leave };
}
