"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function PhoneOTP() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Send OTP to phone
  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!phone) return alert("Please enter a phone number");

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);

    if (error) return alert(error.message);

    setSent(true);
  }

  // Verify OTP and upsert profile
  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!code) return alert("Please enter the OTP");

    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: "sms",
    });
    setLoading(false);

    if (error) return alert(error.message);

    if (!data.user || !data.user.id) {
      return alert("User data not available after verification");
    }

    const uid = data.user.id;

    const { error: insertErr } = await supabase
      .from("profiles")
      .upsert({ id: uid, role: "owner" }, { onConflict: "id" });

    if (insertErr) return alert(insertErr.message);

    alert("Signed in successfully!");
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 border rounded shadow-md">
      {!sent ? (
        <form onSubmit={sendOtp} className="space-y-3">
          <h2 className="text-xl font-semibold">Sign in with phone</h2>
          <input
            type="tel"
            className="input w-full"
            placeholder="Phone (+91...)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button type="submit" className="btn w-full" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-3">
          <h2 className="text-xl font-semibold">Enter OTP</h2>
          <input
            type="text"
            className="input w-full"
            placeholder="OTP code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button type="submit" className="btn w-full" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      )}
    </div>
  );
}
