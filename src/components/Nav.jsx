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

const links = [
  { to: "/", label: "首頁" },
  { to: "/equipment", label: "器材" },
  { to: "/gallery", label: "相簿" },
  { to: "/news", label: "消息" },
  { to: "/team", label: "社員" },
  { to: "/projects", label: "專案" },
];

export default function Nav({ user, role }) {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

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
    setMobileOpen(false);
    await supabase.auth.signOut();
    navigate("/");
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <nav className="px-6 md:px-10 py-5 md:py-7">
      <div className="flex justify-between items-center">
        <Link to="/" className="font-display font-semibold text-[19px]" onClick={closeMobile}>
          CMU <span className="text-moss">Viewfinder</span>
        </Link>

        <div className="hidden md:flex gap-8 text-sm text-ash items-center">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-ink">
              {l.label}
            </Link>
          ))}
          {role === "admin" && (
            <Link to="/admin" className="hover:text-ink text-moss">管理</Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {user && <NotificationBell />}

          {user ? (
            <div className="hidden md:flex items-center gap-2">
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
            <Link to="/login" className="hidden md:inline text-sm border border-seam px-4 py-2 rounded">
              社員登入
            </Link>
          )}

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden w-9 h-9 flex items-center justify-center border border-seam rounded"
            aria-label={mobileOpen ? "關閉選單" : "開啟選單"}
          >
            {mobileOpen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden mt-5 pt-4 border-t border-seam flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={closeMobile}
              className="py-2.5 text-sm text-ash"
            >
              {l.label}
            </Link>
          ))}
          {role === "admin" && (
            <Link to="/admin" onClick={closeMobile} className="py-2.5 text-sm text-moss">
              管理
            </Link>
          )}

          <div className="mt-2 pt-4 border-t border-seam flex flex-col gap-2.5">
            {user ? (
              <>
                <span className="text-xs text-ash">
                  {getGreeting()}，{displayName ?? "..."}
                </span>
                <Link
                  to="/account"
                  onClick={closeMobile}
                  className="text-sm border border-seam px-4 py-2.5 rounded text-center"
                >
                  維護個人資料
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm border border-seam px-4 py-2.5 rounded"
                >
                  登出
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={closeMobile}
                className="text-sm border border-seam px-4 py-2.5 rounded text-center"
              >
                社員登入
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
