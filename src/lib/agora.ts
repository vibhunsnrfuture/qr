import { supabase } from "./supabaseClient";

export async function getRtcToken(channel: string, uid = 0, role: "publisher"|"subscriber"="publisher") {
  const { data, error } = await supabase.functions.invoke("agora-token", {
    body: { channel, uid, role, ttlSeconds: 3600 }
  });
  if (error) throw error;
  return data as { appId: string; token: string; expireAt: number };
}
