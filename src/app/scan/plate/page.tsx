"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getRtcToken } from "@/lib/agora";
import type { IAgoraRTCClient, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || "";
const CHANNEL = "vehicle_call";

type CallStatus = "ready" | "connecting" | "on_call" | "disconnected" | "error";

export default function ScanPage() {
  const { plate } = useParams<{ plate: string }>();
  const [status, setStatus] = useState<CallStatus>("ready");
  const [statusMessage, setStatusMessage] = useState<string>("Ready to call.");
  const [agoraClient, setAgoraClient] = useState<IAgoraRTCClient | null>(null);
  const [micTrack, setMicTrack] = useState<IMicrophoneAudioTrack | null>(null);

  // Initialize Agora client
  useEffect(() => {
    let client: IAgoraRTCClient | null = null;
    let mounted = true;

    async function initAgora() {
      if (typeof window === "undefined") return;

      try {
        const AgoraRTCModule = await import("agora-rtc-sdk-ng");
        const AgoraRTC = AgoraRTCModule.default;

        client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

        if (mounted) setAgoraClient(client);
      } catch (err) {
        console.error("Failed to load Agora SDK:", err);
        setStatus("error");
        setStatusMessage("Failed to initialize call client.");
      }
    }

    initAgora();

    // Log session in Supabase
    supabase.from("call_sessions").insert({ plate, scanner_ip: null }).then();

    return () => {
      mounted = false;

      if (micTrack) {
        micTrack.close();
        setMicTrack(null);
      }

      if (client) {
        client.leave().catch((err) => console.error("Error leaving Agora channel:", err));
      }
    };
  }, [plate, micTrack]);

  // Handle calling the owner
  const callOwner = async () => {
    if (!agoraClient) {
      setStatus("error");
      setStatusMessage("Agora client not loaded yet.");
      return;
    }

    try {
      setStatus("connecting");
      setStatusMessage("Connecting to the owner…");

      const AgoraRTCModule = await import("agora-rtc-sdk-ng");
      const AgoraRTC = AgoraRTCModule.default;

      // Get token from server
      const tokenData = await getRtcToken(CHANNEL, 0, "publisher");

      // Create microphone track
      const mic: IMicrophoneAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      setMicTrack(mic);

      // Handle token refresh automatically
      agoraClient.on("token-privilege-will-expire", async () => {
        const freshToken = await getRtcToken(CHANNEL, 0, "publisher");
        await agoraClient.renewToken(freshToken.token);
      });

      // Join channel and publish audio
      await agoraClient.join(APP_ID, CHANNEL, tokenData.token, 0);
      await agoraClient.publish([mic]);

      setStatus("on_call");
      setStatusMessage("On call… close tab to end.");
    } catch (err) {
      console.error("Call error:", err);
      setStatus("error");
      setStatusMessage("Failed to start call. Check console.");
    }
  };

  // Button text based on status
  const buttonText =
    status === "ready" ? "Call Owner" :
    status === "connecting" ? "Connecting…" :
    status === "on_call" ? "On Call" :
    status === "disconnected" ? "Disconnected" :
    "Error";

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto bg-white rounded shadow-md">
      <h2 className="text-xl font-semibold">Call Vehicle Owner</h2>
      <p>
        Plate: <span className="font-mono">{String(plate).toUpperCase()}</span>
      </p>

      <button
        className={`btn px-4 py-2 rounded text-white transition ${
          status === "ready" ? "bg-blue-600 hover:bg-blue-700" :
          status === "connecting" ? "bg-yellow-500 cursor-not-allowed" :
          status === "on_call" ? "bg-green-600 cursor-not-allowed" :
          "bg-red-600"
        }`}
        onClick={callOwner}
        disabled={status !== "ready"}
      >
        {buttonText}
      </button>

      <p className="text-sm text-gray-600">{statusMessage}</p>
    </div>
  );
}
