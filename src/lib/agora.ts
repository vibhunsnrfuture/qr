// src/lib/agora.ts
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
} from "agora-rtc-sdk-ng";

type TokenResp = { appId: string; channel: string; uid: number; token: string };

async function getToken(channel: string): Promise<TokenResp> {
  const resp = await fetch(`/api/agora-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channel, role: "publisher" }),
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json() as Promise<TokenResp>;
}

let client: IAgoraRTCClient | null = null;
let mic: IMicrophoneAudioTrack | null = null;

export async function startCall(channel: string) {
  if (!client) {
    client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

    client.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
      if (mediaType === "audio") {
        await client!.subscribe(user, "audio");
        const track: IRemoteAudioTrack | undefined = user.audioTrack ?? undefined;
        track?.play();
      }
    });

    client.on("user-unpublished", (user) => {
      try {
        user.audioTrack?.stop();
      } catch {}
    });
  }

  const { appId, token, uid } = await getToken(channel);
  await client.join(appId, channel, token, uid);

  mic = await AgoraRTC.createMicrophoneAudioTrack();
  await client.publish([mic]);

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
