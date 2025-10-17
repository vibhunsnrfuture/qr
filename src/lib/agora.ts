// src/lib/agora.ts
// NOTE: client-only dynamic import; no top-level runtime access to window.

import type {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
} from "agora-rtc-sdk-ng";

type TokenResp = { appId: string; channel: string; uid: number; token: string };

// cache for client + mic between calls
let client: IAgoraRTCClient | null = null;
let mic: IMicrophoneAudioTrack | null = null;

// small helper to import SDK only on client
async function getAgora() {
  if (typeof window === "undefined") {
    // if ever called on server, fail fast with a clear message
    throw new Error("Agora SDK can only be used in the browser");
  }
  // dynamic import so SSR bundle me SDK include na ho
  return import("agora-rtc-sdk-ng");
}

async function getToken(channel: string): Promise<TokenResp> {
  const resp = await fetch(`/api/agora-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channel, role: "publisher" }),
  });
  if (!resp.ok) {
    // avoid reading body twice
    let msg = `Token request failed (${resp.status})`;
    try {
      const t = await resp.json();
      if (t?.message) msg = t.message;
    } catch {}
    throw new Error(msg);
  }
  return resp.json() as Promise<TokenResp>;
}

export async function startCall(channel: string) {
  // Ensure we’re on client
  const { default: AgoraRTC } = await getAgora();

  // Create client once
  if (!client) {
    client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

    client.on(
      "user-published",
      async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
        if (mediaType === "audio") {
          await client!.subscribe(user, "audio");
          const track: IRemoteAudioTrack | undefined = user.audioTrack ?? undefined;
          track?.play();
        }
      }
    );

    client.on("user-unpublished", (user) => {
      try {
        user.audioTrack?.stop();
      } catch {
        /* noop */
      }
    });
  }

  const { appId, token, uid } = await getToken(channel);

  // Join with the UID returned by the token (must match)
  await client.join(appId, channel, token, uid);

  // Publish your mic
  const mod = await getAgora();
  mic = await mod.default.createMicrophoneAudioTrack();
  await client.publish([mic]);

  // Return a proper stop fn
  return async function stop() {
    try {
      if (mic) {
        await client!.unpublish([mic]);
        mic.stop();
        mic.close();
        mic = null;
      }
      await client!.leave();
    } finally {
      client = null;
    }
  };
}
