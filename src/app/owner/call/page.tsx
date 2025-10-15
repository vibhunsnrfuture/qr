"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import type { ILocalAudioTrack, IAgoraRTCClient } from "agora-rtc-sdk-ng";

let client: IAgoraRTCClient | null = null;
async function getAgora(){ return await import("agora-rtc-sdk-ng"); }

async function getToken(channel: string, role: "publisher" | "subscriber") {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const resp = await fetch(`${baseUrl}/functions/v1/agora-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channel: channel.toUpperCase(), role })
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json() as Promise<{ appId: string; channel: string; uid: number; token: string }>;
}

export default function ReceiveCalls() {
  const [plate, setPlate] = useState("");
  const [joined, setJoined] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [localMic, setLocalMic] = useState<ILocalAudioTrack | null>(null);

  async function ensureClient() {
    if (!client) {
      const Agora = await getAgora();
      client = Agora.default.createClient({ mode: "rtc", codec: "vp8" });
    }
  }

  async function goOnline() {
    const channel = plate.trim().toUpperCase();
    if (!channel) return alert("Enter plate/channel (e.g., UP20BB1234)");

    await ensureClient();
    const { appId, token, uid } = await getToken(channel, "subscriber");
    await client!.join(appId, channel, token, uid || null);

    client!.on("user-published", async (user, mediaType) => {
      if (mediaType === "audio") {
        await client!.subscribe(user, "audio");
        user.audioTrack?.play();
        console.log("[owner] subscribed new", user.uid);
      }
    });
    for (const ru of client!.remoteUsers) {
      if (ru.hasAudio) { await client!.subscribe(ru, "audio"); ru.audioTrack?.play(); }
    }

    // auto mic ON for two-way talk
    const Agora = await getAgora();
    const mic = await Agora.default.createMicrophoneAudioTrack();
    await client!.publish([mic]);
    setLocalMic(mic); setMicOn(true);
    setJoined(true);
  }

  async function toggleMic() {
    if (!joined) return;
    if (!micOn) {
      const Agora = await getAgora();
      const mic = await Agora.default.createMicrophoneAudioTrack();
      await client!.publish([mic]);
      setLocalMic(mic); setMicOn(true);
    } else {
      if (localMic) {
        await client!.unpublish([localMic]);
        localMic.stop(); localMic.close();
      }
      setLocalMic(null); setMicOn(false);
    }
  }

  async function goOffline() {
    try { if (localMic) { localMic.stop(); localMic.close(); } } catch {}
    try { await client?.leave(); } catch {}
    setLocalMic(null); setMicOn(false); setJoined(false);
  }

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-xl font-semibold">Receive Calls</h2>

      <input
        className="input"
        placeholder="Your vehicle plate (channel) e.g., UP20BB1234"
        value={plate}
        onChange={(e) => setPlate(e.target.value)}
      />

      {!joined ? (
        <button className="btn" onClick={goOnline}>Go Online</button>
      ) : (
        <div className="flex gap-2">
          <button className="btn" onClick={toggleMic}>{micOn ? "Mic Off" : "Mic On"}</button>
          <button className="btn" onClick={goOffline}>Go Offline</button>
        </div>
      )}
    </div>
  );
}
