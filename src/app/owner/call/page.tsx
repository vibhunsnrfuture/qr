"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getRtcToken } from "@/lib/agora";
import type {
  IAgoraRTCClient,
  IRemoteAudioTrack,
  IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";

export default function ReceiveCalls() {
  const [plate, setPlate] = useState("");
  const [online, setOnline] = useState(false);
  const clientRef = useRef<IAgoraRTCClient | null>(null);

  const goOnline = async () => {
    if (!plate.trim()) return alert("Enter your plate");

    const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
    const channelName = `car-${plate.trim().toUpperCase()}`;
    const { appId, token } = await getRtcToken(channelName, 0, "publisher");

    const client: IAgoraRTCClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    clientRef.current = client;

    // Auto-renew token
    client.on("token-privilege-will-expire", async () => {
      const fresh = await getRtcToken(channelName, 0, "publisher");
      await client.renewToken(fresh.token);
    });

    // Subscribe to remote users (audio-only)
    client.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
      const track =
        mediaType === "audio"
          ? (await client.subscribe(user, mediaType)) as IRemoteAudioTrack
          : null; // ignore video

      if (track) {
        track.play(); // play remote audio
      }
    });

    await client.join(appId, channelName, token, 0);
    setOnline(true);

    // Update Supabase profile
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user?.id) {
      await supabase.from("profiles").update({ is_online: true }).eq("id", userData.user.id);
    }
  };

  const goOffline = async () => {
    await clientRef.current?.leave();
    clientRef.current = null;
    setOnline(false);

    const { data: userData } = await supabase.auth.getUser();
    if (userData.user?.id) {
      await supabase.from("profiles").update({ is_online: false }).eq("id", userData.user.id);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg shadow space-y-4">
      <h2 className="text-2xl font-bold">Receive Calls</h2>
      <input
        className="input w-full px-4 py-2 border rounded"
        placeholder="Your plate"
        value={plate}
        onChange={(e) => setPlate(e.target.value)}
      />
      {!online ? (
        <button className="btn w-full bg-blue-600 text-white py-2 rounded" onClick={goOnline}>
          Go Online
        </button>
      ) : (
        <button className="btn w-full bg-red-600 text-white py-2 rounded" onClick={goOffline}>
          Go Offline
        </button>
      )}
    </div>
  );
}
