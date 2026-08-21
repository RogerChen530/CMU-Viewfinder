import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";

function validatePassword(pwd) {
  if (pwd.length < 10) return "密碼至少需要 10 碼";
  if (!/[A-Za-z]/.test(pwd)) return "密碼須包含英文字母";
  if (!/[0-9]/.test(pwd)) return "密碼須包含數字";
  return null;
}

export default function Register() {
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    const { data: exists, error: checkError } = await supabase.rpc("student_id_exists", {
      sid: studentId,
    });

    if (checkError) {
      console.error("學號檢查失敗：", checkError);
    } else if (exists) {
      setError("此學號已經註冊過，請確認學號是否正確");
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { student_id: studentId, verified: false } },
    });

    if (signUpError) {
      setError(signUpError.message?.includes("學號") ? signUpError.message : "註冊失敗，請確認 Email 是否已被使用");
      return;
    }

    // profile 建立已改由資料庫 trigger（0002_handle_new_user_trigger.sql）自動處理，
    // 前端不用也不該自己 insert（signUp 剛完成時通常還沒有登入 session，
    // 手動 insert 會被 RLS 擋下來，靜默失敗）。
    // 這裡只需要通知管理員來審核。
    await supabase.functions.invoke("notify-admin", {
      body: { email, studentId },
    });

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper px-6">
        <div className="max-w-sm text-center">
          <h1 className="font-display text-xl font-medium mb-3">註冊申請已送出</h1>
          <p className="text-sm text-ash">
            請至信箱完成驗證信，並等待社團管理員確認學生身份後，帳號才會開通器材租借與社員專區的權限。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm border border-seam rounded p-8">
        <h1 className="font-display text-xl font-medium mb-6">申請加入社團</h1>

        <label className="block text-xs text-ash mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-seam rounded px-3 py-2 mb-4 text-sm"
        />

        <label className="block text-xs text-ash mb-1">學號</label>
        <input
          type="text"
          required
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-full border border-seam rounded px-3 py-2 mb-4 text-sm"
          placeholder="用於管理員審核學生身份"
        />

        <label className="block text-xs text-ash mb-1">密碼</label>
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
          送出申請
        </button>

        <p className="text-xs text-ash mt-4 text-center">
          已經有帳號？<a href="/login" className="text-moss">登入</a>
        </p>
      </form>
    </div>
  );
}
