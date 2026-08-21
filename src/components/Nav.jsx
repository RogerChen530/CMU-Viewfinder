import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell.jsx";
import { supabase } from "../lib/supabaseClient.js";

function getGreeting() {
  // 用 UTC+8（台灣時間）判斷，不依賴瀏覽器所在時區
  const taipeiHour = new Date(Date.now() + 8 * 60 * 60 * 1000).getUTCHours();
  if (taipeiHour >= 5 && taipeiHour < 11) return "早安";
  if (taipeiHour >= 11 && taipeiHour < 18) return "午安";
  return "晚安";
}

export default function Nav({ user, role }) {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(null);

  useEffect(() => {
    if (!user) {
      setDisplayName(null);
      return;
    }

    supabase
      .from("profiles")
      .select("real_name, display_name")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setDisplayName(data?.display_name || data?.real_name || "神秘客");
      });
  }, [user]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <nav className="flex justify-between items-center px-10 py-7">
      <Link to="/" className="font-display font-semibold text-[19px]">
        CMU <span className="text-moss">Viewfinder</span>
      </Link>
      <div className="flex gap-8 text-sm text-ash items-center">
        <Link to="/" className="hover:text-ink">首頁</Link>
        <Link to="/equipment" className="hover:text-ink">器材</Link>
        <Link to="/gallery" className="hover:text-ink">相簿</Link>
        <Link to="/news" className="hover:text-ink">消息</Link>
        <Link to="/team" className="hover:text-ink">社員</Link>
        <Link to="/projects" className="hover:text-ink">專案</Link>
        {role === "admin" && (
          <Link to="/admin" className="hover:text-ink text-moss">管理</Link>
        )}
      </div>
      <div className="flex items-center gap-3">
        {user && <NotificationBell />}
        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-ash hidden lg:inline">
              {getGreeting()}，{displayName ?? "..."}
            </span>
            <Link to="/account" className="text-sm border border-seam px-4 py-2 rounded">
              維護個人資料
            </Link>
            <button onClick={handleLogout} className="text-sm border border-seam px-4 py-2 rounded">
              登出
            </button>
          </div>
        ) : (
          <Link to="/login" className="text-sm border border-seam px-4 py-2 rounded">
            會員登入
          </Link>
        )}
      </div>
    </nav>
  );
}
