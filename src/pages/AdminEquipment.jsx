import React, { useEffect, useState } from "react";
import AdminGuard from "../components/AdminGuard.jsx";
import { supabase } from "../lib/supabaseClient.js";

const emptyForm = { name: "", category: "", model: "", asset_code: "", image_url: "" };

export default function AdminEquipment({ user, role }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("equipment").select("*").order("created_at", { ascending: false });
    if (error) console.error("讀取器材失敗：", error);
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (role === "admin") load();
  }, [role]);

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      model: item.model,
      asset_code: item.asset_code,
      image_url: item.image_url ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (editingId) {
      const { error } = await supabase.from("equipment").update(form).eq("id", editingId);
      if (error) {
        setError("更新失敗：" + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("equipment").insert({ ...form, status: "available" });
      if (error) {
        setError("新增失敗：" + error.message);
        return;
      }
    }

    cancelEdit();
    await load();
  }

  async function handleDelete(id) {
    if (!confirm("確定要刪除這項器材嗎？")) return;
    const { error } = await supabase.from("equipment").delete().eq("id", id);
    if (error) console.error("刪除失敗：", error);
    await load();
  }

  return (
    <AdminGuard user={user} role={role} title="器材管理">
      <form onSubmit={handleSubmit} className="border border-seam rounded p-5 mb-8 max-w-lg">
        <p className="text-sm font-medium mb-4">{editingId ? "編輯器材" : "新增器材"}</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            required
            placeholder="名稱，例如 Canon EOS R5"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-seam rounded px-3 py-2 text-sm col-span-2"
          />
          <input
            required
            placeholder="分類，例如 Camera"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="border border-seam rounded px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="型號說明"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            className="border border-seam rounded px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="財產編號，例如 CAM-014"
            value={form.asset_code}
            onChange={(e) => setForm({ ...form, asset_code: e.target.value })}
            className="border border-seam rounded px-3 py-2 text-sm"
          />
          <input
            placeholder="圖片網址（選填）"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className="border border-seam rounded px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-red-700 text-xs mb-3">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" className="text-sm px-4 py-2 rounded bg-moss text-paper font-medium">
            {editingId ? "儲存變更" : "新增器材"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="text-sm px-4 py-2 rounded border border-seam">
              取消
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-ash text-sm">載入中...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.length === 0 && <p className="text-ash text-sm">目前沒有任何器材。</p>}
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center border border-seam rounded p-4">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-ash text-xs font-mono mt-0.5">
                  {item.asset_code} · {item.model} · {item.status === "available" ? "可租借" : "租借中"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(item)}
                  className="text-sm px-4 py-2 rounded border border-seam"
                >
                  編輯
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-sm px-4 py-2 rounded border border-seam text-ash"
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
