import React, { useEffect, useState } from "react";
import AdminGuard from "../components/AdminGuard.jsx";
import { supabase } from "../lib/supabaseClient.js";

export default function AdminGallery({ user, role }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ image_url: "", caption: "", exif: "", author: "", description: "" });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
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

    let imageUrl = form.image_url.trim();

    if (file) {
      setUploading(true);
      const path = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("photos").upload(path, file);
      setUploading(false);

      if (uploadError) {
        setError("上傳失敗：" + uploadError.message);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from("photos").getPublicUrl(path);
      imageUrl = publicUrlData.publicUrl;
    }

    if (!imageUrl) {
      setError("請選擇要上傳的檔案，或填入圖片網址");
      return;
    }

    const { error } = await supabase.from("photos").insert({
      image_url: imageUrl,
      caption: form.caption,
      exif: form.exif,
      uploaded_by: user.id,
    });

    if (error) {
      setError("新增失敗：" + error.message);
      return;
    }

    setForm({ image_url: "", caption: "", exif: "", author: "", description: "" });
    setFile(null);
    await load();
  }

  async function handleDelete(id) {
    if (!confirm("確定要刪除這張照片嗎？")) return;
    const { error } = await supabase.from("photos").delete().eq("id", id);
    if (error) console.error("刪除失敗：", error);
    await load();
  }

  async function setFeatured(id) {
    // 先把其他張的精選狀態清掉，再把指定這張設成精選（同時間只有一張是首頁精選圖）
    await supabase.from("photos").update({ is_featured: false }).neq("id", id);
    const { error } = await supabase.from("photos").update({ is_featured: true }).eq("id", id);
    if (error) console.error("設定精選圖失敗：", error);
    await load();
  }

  return (
    <AdminGuard user={user} role={role} title="相簿管理">
      <form onSubmit={handleSubmit} className="border border-seam rounded p-5 mb-8 max-w-lg">
        <p className="text-sm font-medium mb-4">新增照片</p>
        <div className="flex flex-col gap-3 mb-3">
          <div>
            <label className="block text-xs text-ash mb-1">上傳檔案</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm w-full"
            />
          </div>
          <p className="text-ash text-[11px] -mt-1">或者，貼上圖片網址（有選檔案時優先用檔案）：</p>
          <input
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
          <input
            placeholder="作者（選填，不一定是上傳的管理員本人）"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            className="border border-seam rounded px-3 py-2 text-sm"
          />
          <textarea
            placeholder="創作理念（選填，會顯示在點開照片的詳細頁）"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border border-seam rounded px-3 py-2 text-sm resize-none"
          />
        </div>
        {error && <p className="text-red-700 text-xs mb-3">{error}</p>}
        <button
          type="submit"
          disabled={uploading}
          className="text-sm px-4 py-2 rounded bg-moss text-paper font-medium disabled:opacity-50"
        >
          {uploading ? "上傳中..." : "新增照片"}
        </button>
      </form>

      {loading ? (
        <p className="text-ash text-sm">載入中...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {photos.length === 0 && <p className="text-ash text-sm col-span-3">目前沒有任何照片。</p>}
          {photos.map((p) => (
            <div key={p.id} className="border border-seam rounded overflow-hidden">
              <div className="relative">
                <img src={p.image_url} alt={p.caption ?? ""} className="w-full aspect-[4/5] object-cover" />
                {p.is_featured && (
                  <span className="absolute top-2 left-2 text-[10px] font-mono uppercase bg-moss text-paper px-2 py-1 rounded">
                    首頁精選
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs text-ash mb-2">{p.caption || p.exif || "（無說明）"}</p>
                <div className="flex gap-2">
                  {!p.is_featured && (
                    <button
                      onClick={() => setFeatured(p.id)}
                      className="text-xs px-3 py-1.5 rounded border border-seam"
                    >
                      設為首頁精選圖
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-xs px-3 py-1.5 rounded border border-seam text-ash"
                  >
                    刪除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminGuard>
  );
}
