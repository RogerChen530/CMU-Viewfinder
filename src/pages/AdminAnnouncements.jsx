import React, { useEffect, useState } from "react";
import AdminGuard from "../components/AdminGuard.jsx";
import { Mono } from "../components/ui.jsx";
import { supabase } from "../lib/supabaseClient.js";

export default function AdminAnnouncements({ user, role }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", content: "" });
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error("讀取公告失敗：", error);
    setPosts(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (role === "admin") load();
  }, [role]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const { error } = await supabase.from("announcements").insert({ ...form, created_by: user.id });
    if (error) {
      setError("發布失敗：" + error.message);
      return;
    }
    setForm({ title: "", content: "" });
    await load();
  }

  async function handleDelete(id) {
    if (!confirm("確定要刪除這則公告嗎？")) return;
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) console.error("刪除失敗：", error);
    await load();
  }

  return (
    <AdminGuard user={user} role={role} title="公告管理">
      <p className="text-ash text-xs mb-4 max-w-lg">
        這裡發布的公告會出現在首頁的「近期動態」跟導覽列的通知鈴（顯示最近 30 天內的公告）。
      </p>

      <form onSubmit={handleSubmit} className="border border-seam rounded p-5 mb-8 max-w-lg">
        <p className="text-sm font-medium mb-4">發布新公告</p>
        <div className="flex flex-col gap-3 mb-3">
          <input
            required
            placeholder="標題"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border border-seam rounded px-3 py-2 text-sm"
          />
          <textarea
            required
            placeholder="內容"
            rows={4}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="border border-seam rounded px-3 py-2 text-sm resize-none"
          />
        </div>
        {error && <p className="text-red-700 text-xs mb-3">{error}</p>}
        <button type="submit" className="text-sm px-4 py-2 rounded bg-moss text-paper font-medium">
          發布公告
        </button>
      </form>

      {loading ? (
        <p className="text-ash text-sm">載入中...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.length === 0 && <p className="text-ash text-sm">目前沒有任何公告。</p>}
          {posts.map((p) => (
            <div key={p.id} className="border border-seam rounded p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium">{p.title}</p>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-xs px-3 py-1.5 rounded border border-seam text-ash shrink-0 ml-3"
                >
                  刪除
                </button>
              </div>
              <p className="text-ash text-xs leading-relaxed mb-2">{p.content}</p>
              <Mono>{new Date(p.created_at).toLocaleString("zh-TW")}</Mono>
            </div>
          ))}
        </div>
      )}
    </AdminGuard>
  );
}
