import React, { useEffect, useState } from "react";
import AdminGuard from "../components/AdminGuard.jsx";
import StorageUsageBar from "../components/StorageUsageBar.jsx";
import { supabase } from "../lib/supabaseClient.js";

// 免費方案的容量上限（如果之後升級方案，這兩個數字要跟著改）
const DATABASE_CAP_BYTES = 500 * 1024 * 1024; // 500 MB
const FILES_CAP_BYTES = 1024 * 1024 * 1024; // 1 GB

export default function AdminStorage({ user, role }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (role !== "admin") return;

    setLoading(true);
    supabase.rpc("get_storage_stats").then(({ data, error }) => {
      if (error) {
        console.error("讀取容量統計失敗：", error);
        setError("讀取容量統計失敗：" + error.message);
      } else {
        setStats(data?.[0] ?? null);
      }
      setLoading(false);
    });
  }, [role]);

  return (
    <AdminGuard user={user} role={role} title="容量">
      <p className="text-ash text-xs mb-6 max-w-lg">
        數字是即時查詢資料庫算出來的，不是 Supabase 帳單系統的官方數字，僅供參考。
        容量上限是照免費方案設定寫死的，如果之後升級付費方案，這裡的上限數字要跟著調整。
      </p>

      {loading && <p className="text-ash text-sm">載入中...</p>}
      {error && <p className="text-red-700 text-xs">{error}</p>}

      {stats && (
        <div className="flex flex-col gap-5 max-w-2xl">
          <StorageUsageBar
            title="資料庫"
            capBytes={DATABASE_CAP_BYTES}
            segments={[{ label: "已使用", bytes: stats.database_bytes, colorClass: "bg-moss" }]}
          />

          <StorageUsageBar
            title="檔案儲存空間（相簿 + 大頭照）"
            capBytes={FILES_CAP_BYTES}
            segments={[
              { label: "相簿照片", bytes: stats.photos_bytes, colorClass: "bg-moss" },
              { label: "大頭照", bytes: stats.avatars_bytes, colorClass: "bg-moss-deep" },
            ]}
          />
        </div>
      )}
    </AdminGuard>
  );
}
