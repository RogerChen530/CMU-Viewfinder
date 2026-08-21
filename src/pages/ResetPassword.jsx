import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";

function validatePassword(pwd) {
  if (pwd.length < 10) return "密碼至少需要 10 碼";
  if (!/[A-Za-z]/.test(pwd)) return "密碼須包含英文字母";
  if (!/[0-9]/.test(pwd)) return "密碼須包含數字";
  return null;
}

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("重設失敗，重設連結可能已過期，請重新申請一次");
      return;
    }

    setDone(true);
    setTimeout(() => navigate("/login"), 2000);
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper px-6">
        <p className="text-sm">密碼已更新，正在帶你前往登入頁...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm border border-seam rounded p-8">
        <h1 className="font-display text-xl font-medium mb-6">設定新密碼</h1>

        <label className="block text-xs text-ash mb-1">新密碼</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-seam rounded px-3 py-2 mb-1 text-sm"
        />
        <p className="text-[11px] text-ash mb-4">至少 10 碼，需同時包含英文字母與數字</p>

        {error && <p className="text-xs text-red-700 mb-3">{error}</p>}

        <button type="submit" className="w-full bg-moss text-paper text-sm py-2.5 rounded font-medium">
          更新密碼
        </button>
      </form>
    </div>
  );
}
