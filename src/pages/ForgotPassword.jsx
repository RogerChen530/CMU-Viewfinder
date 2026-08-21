import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError("發送失敗，請稍後再試");
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper px-6">
        <div className="max-w-sm text-center">
          <h1 className="font-display text-xl font-medium mb-3">重設密碼信已寄出</h1>
          <p className="text-sm text-ash">
            如果 {email} 有對應的帳號，重設密碼的連結會寄到這個信箱，請去信箱點擊連結繼續。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm border border-seam rounded p-8">
        <h1 className="font-display text-xl font-medium mb-2">忘記密碼</h1>
        <p className="text-ash text-xs mb-6">輸入註冊時使用的 Email，我們會寄一封重設密碼的信給你。</p>

        <label className="block text-xs text-ash mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-seam rounded px-3 py-2 mb-4 text-sm"
        />

        {error && <p className="text-xs text-red-700 mb-3">{error}</p>}

        <button type="submit" className="w-full bg-moss text-paper text-sm py-2.5 rounded font-medium">
          寄送重設密碼信
        </button>

        <p className="text-xs text-ash mt-4 text-center">
          想起密碼了？<Link to="/login" className="text-moss">回登入</Link>
        </p>
      </form>
    </div>
  );
}
