import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";

const LAST_SEEN_KEY = "cmu-viewfinder:announcements-last-seen";

export default function NotificationBell() {
  const [announcements, setAnnouncements] = useState([]);
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    supabase
      .from("announcements")
      .select("id, title, content, created_at")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("讀取公告失敗：", error);
          return;
        }
        const list = data ?? [];
        setAnnouncements(list);

        const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
        const newest = list[0]?.created_at;
        if (newest && (!lastSeen || new Date(newest) > new Date(lastSeen))) {
          setHasUnread(true);
        }
      });
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleOpen() {
    setOpen((o) => !o);
    if (!open) {
      localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
      setHasUnread(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleOpen}
        className="relative w-9 h-9 flex items-center justify-center border border-seam rounded"
        aria-label="動態通知"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {hasUnread && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-moss" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-paper border border-seam rounded shadow-lg z-10">
          <div className="p-4 border-b border-concrete">
            <p className="text-sm font-medium">近期動態</p>
            <p className="text-ash text-xs mt-0.5">最近 30 天內的社團公告</p>
          </div>
          {announcements.length === 0 && (
            <p className="text-ash text-sm p-4">目前沒有近期動態。</p>
          )}
          {announcements.map((a) => (
            <div key={a.id} className="p-4 border-b border-concrete last:border-b-0">
              <p className="text-sm font-medium mb-1">{a.title}</p>
              <p className="text-ash text-xs leading-relaxed">{a.content}</p>
              <p className="text-ash text-[11px] mt-2 font-mono">
                {new Date(a.created_at).toLocaleDateString("zh-TW")}
              </p>
            </div>
          ))}
          <Link
            to="/news"
            onClick={() => setOpen(false)}
            className="block text-center text-sm py-3 text-moss hover:underline"
          >
            查看全部消息
          </Link>
        </div>
      )}
    </div>
  );
}
