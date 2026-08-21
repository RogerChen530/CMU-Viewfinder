import React, { useEffect, useState } from "react";
import AdminGuard from "../components/AdminGuard.jsx";
import { supabase } from "../lib/supabaseClient.js";

export default function AdminGallery({ user, role }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ image_url: "", caption: "", exif: "" });
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("photos").select("*").order("created_at", { ascending: false });
    if (error) console.error("讀取相簿失敗：", error);
    setPhotos(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (role === "admin") load();
  }, [role]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const { error } = await supabase.from("photos").insert({ ...form, uploaded_by: user.id });
    if (error) {
      setError("新增失敗：" + error.message);
      return;
    }
    setForm({ image_url: "", caption: "", exif: "" });
    await load();
  }

  async function handleDelete(id) {
    if (!confirm("確定要刪除這張照片嗎？")) return;
    const { error } = await supabase.from("photos").delete().eq("id", id);
    if (error) console.error("刪除失敗：", error);
    await load();
  }

  return (
    <AdminGuard user={user} role={role} title="相簿管理">
      <p className="text-ash text-xs mb-4 max-w-lg">
        目前是用圖片網址新增照片（例如先上傳到 Supabase Storage 或其他圖床，把連結貼進來）。
        直接在網頁上傳檔案的功能還沒做，排在下一階段。
      </p>

      <form onSubmit={handleSubmit} className="border border-seam rounded p-5 mb-8 max-w-lg">
        <p className="text-sm font-medium mb-4">新增照片</p>
        <div className="flex flex-col gap-3 mb-3">
          <input
            required
            placeholder="圖片網址"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className="border border-seam rounded px-3 py-2 text-sm"
          />
          <input
            placeholder="說明文字（選填）"
            value={form.caption}
            onChange={(e) => setForm({ ...form, caption: e.target.value })}
            className="border border-seam rounded px-3 py-2 text-sm"
          />
          <input
            placeholder="拍攝資訊，例如 iso 400 · f/2.8 · 35mm（選填）"
            value={form.exif}
            onChange={(e) => setForm({ ...form, exif: e.target.value })}
            className="border border-seam rounded px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-red-700 text-xs mb-3">{error}</p>}
        <button type="submit" className="text-sm px-4 py-2 rounded bg-moss text-paper font-medium">
          新增照片
        </button>
      </form>

      {loading ? (
        <p className="text-ash text-sm">載入中...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {photos.length === 0 && <p className="text-ash text-sm col-span-3">目前沒有任何照片。</p>}
          {photos.map((p) => (
            <div key={p.id} className="border border-seam rounded overflow-hidden">
              <img src={p.image_url} alt={p.caption ?? ""} className="w-full aspect-[4/5] object-cover" />
              <div className="p-3">
                <p className="text-xs text-ash mb-2">{p.caption || p.exif || "（無說明）"}</p>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-xs px-3 py-1.5 rounded border border-seam text-ash"
                >
                  刪除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminGuard>
  );
}
