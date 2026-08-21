import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("登入失敗，請確認帳號密碼是否正確");
      return;
    }
    navigate("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm border border-seam rounded p-8">
        <h1 className="font-display text-xl font-medium mb-6">社員登入</h1>

        <label className="block text-xs text-ash mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-seam rounded px-3 py-2 mb-4 text-sm"
        />

        <label className="block text-xs text-ash mb-1">密碼</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-seam rounded px-3 py-2 mb-2 text-sm"
        />
        <p className="text-xs text-right mb-2">
          <Link to="/forgot-password" className="text-ash hover:text-moss">忘記密碼？</Link>
        </p>

        {error && <p className="text-xs text-red-700 mb-3">{error}</p>}

        <button type="submit" className="w-full bg-moss text-paper text-sm py-2.5 rounded font-medium mt-2">
          登入
        </button>

        <p className="text-xs text-ash mt-4 text-center">
          還沒有帳號？<Link to="/register" className="text-moss">註冊</Link>
        </p>
      </form>
    </div>
  );
}
