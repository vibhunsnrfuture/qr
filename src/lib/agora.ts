// src/lib/agora.ts
import AgoraRTC from "agora-rtc-sdk-ng";

/** Minimal shapes (SDK full types import ki zarurat nahi) */
type MediaType = "audio" | "video";

interface RemoteAudioTrack {
  play(): void;
  stop?(): void;
}
interface RemoteUser {
  uid?: string | number;
  audioTrack?: RemoteAudioTrack;
}
interface LocalAudioTrack {
  stop(): void;
  close(): void;
}

/** Sirf woh methods jinhe hum use karte hain */
interface MinimalClient {
  join(
    appId: string,
    channel: string,
    token: string,
    uid?: number | null
  ): Promise<void>;
  leave(): Promise<void>;
  publish(tracks: unknown[]): Promise<void>;
  unpublish(tracks: unknown[]): Promise<void>;
  subscribe(user: unknown, mediaType: MediaType): Promise<void>;
  on(
    event: "user-published" | "user-unpublished",
    cb: (...args: unknown[]) => void
  ): void;
}

/** Module-level singletons */
let client: MinimalClient | null = null;
let localMic: LocalAudioTrack | null = null;

/** Helper: token from Next.js API */
async function getToken(channel: string) {
  const resp = await fetch(`/api/agora-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channel, role: "publisher" }),
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json() as Promise<{
    appId: string;
    channel: string;
    uid: number;
    token: string;
  }>;
}

/** Start a call: join, mic create + publish, remote subscribe */
export async function startCall(channel: string) {
  // Create / reuse client
  if (!client) {
    client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }) as unknown as MinimalClient;

    client.on("user-published", async (...args: unknown[]) => {
      // args: [user, mediaType]
      const user = args[0] as RemoteUser;
      const mediaType = args[1] as MediaType;

      try {
        if (mediaType === "audio") {
          await client!.subscribe(user as unknown, "audio");
          user.audioTrack?.play();
        }
      } catch {
        /* no-op */
      }
    });

    client.on("user-unpublished", (...args: unknown[]) => {
      const user = args[0] as RemoteUser;
      try {
        user.audioTrack?.stop?.();
      } catch {
        /* no-op */
      }
    });
  }

  // Get token
  const { appId, token, uid } = await getToken(channel);

  // Join the channel
  await client.join(appId, channel, token, uid || null);

  // Create and publish mic track
  const mic = await AgoraRTC.createMicrophoneAudioTrack();
  localMic = mic as unknown as LocalAudioTrack;

  // MinimalClient expects unknown[], so direct pass ok
  await client.publish([localMic]);

  // Return stop function
  return async function stop() {
    try {
      if (client) {
        if (localMic) {
          try {
            await client.unpublish([localMic]);
          } catch {
            /* no-op */
          }
          try {
            localMic.stop();
          } catch {
            /* no-op */
          }
          try {
            localMic.close();
          } catch {
            /* no-op */
          }
          localMic = null;
        }
        await client.leave();
      }
    } finally {
      client = null;
    }
  };
}

/** Toggle local mic on/off (optional helper) */
export async function setMic(enabled: boolean) {
  if (!client) return;

  if (enabled) {
    if (!localMic) {
      const mic = await AgoraRTC.createMicrophoneAudioTrack();
      localMic = mic as unknown as LocalAudioTrack;
      await client.publish([localMic]);
    }
  } else {
    if (localMic) {
      try {
        await client.unpublish([localMic]);
      } catch {
        /* no-op */
      }
      try {
        localMic.stop();
      } catch {
        /* no-op */
      }
      try {
        localMic.close();
      } catch {
        /* no-op */
      }
      localMic = null;
    }
  }
}
