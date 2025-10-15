// src/lib/agora.ts
import AgoraRTC from "agora-rtc-sdk-ng";
import { supabase } from "@/lib/supabaseClient";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

async function getToken(channel: string) {
  const { data: { session } } = await supabase.auth.getSession();
  const resp = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/agora-token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token ?? ""}`,
      },
      body: JSON.stringify({ channel, role: "publisher" })
    }
  );
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json() as Promise<{ appId: string; channel: string; uid: number; token: string }>;
}

export async function startCall(channel: string) {
  const { appId, token, uid } = await getToken(channel);

  const mic = await AgoraRTC.createMicrophoneAudioTrack();
  await client.join(appId, channel, token, uid || null);
  await client.publish([mic]);

  // play remote audio
  client.on("user-published", async (user, mediaType) => {
    if (mediaType === "audio") {
      await client.subscribe(user, "audio");
      user.audioTrack?.play();
    }
  });

  return async () => {
    mic.stop(); mic.close();
    await client.leave();
  };
}
