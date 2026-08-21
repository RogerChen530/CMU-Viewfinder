import React from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell.jsx";
import { supabase } from "../lib/supabaseClient.js";

export default function Nav({ user, role }) {
  const navigate = useNavigate();

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
            <Link to="/account" className="text-sm text-ash hover:text-ink hidden md:inline">
              {user.email}
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm border border-seam px-4 py-2 rounded"
            >
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
