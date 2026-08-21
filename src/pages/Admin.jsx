import React, { useEffect, useState } from "react";
import AdminGuard from "../components/AdminGuard.jsx";
import { Mono } from "../components/ui.jsx";
import { supabase } from "../lib/supabaseClient.js";

export default function Admin({ user, role }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  async function loadProfiles() {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, student_id, role, created_at, real_name, phone, contact_email, ig_id")
      .order("created_at", { ascending: false });

    if (error) console.error("讀取 profiles 失敗：", error);
    setProfiles(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (role === "admin") loadProfiles();
  }, [role]);

  async function approve(id) {
    setActioningId(id);
    const { error } = await supabase.from("profiles").update({ role: "member" }).eq("id", id);
    if (error) console.error("核准失敗：", error);
    await loadProfiles();
    setActioningId(null);
  }

  async function reject(id) {
    if (!confirm("確定要拒絕這筆申請嗎？這會刪除該筆審核資料，且無法復原。")) return;
    setActioningId(id);
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) console.error("拒絕失敗：", error);
    await loadProfiles();
    setActioningId(null);
  }

  async function setRole(id, newRole) {
    setActioningId(id);
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", id);
    if (error) console.error("更新角色失敗：", error);
    await loadProfiles();
    setActioningId(null);
  }

  const pending = profiles.filter((p) => p.role === "pending");
  const others = profiles.filter((p) => p.role !== "pending");

  return (
    <AdminGuard user={user} role={role} title="審核與社員">
      {loading ? (
        <p className="text-ash text-sm">載入中...</p>
      ) : (
        <>
          <div className="mb-12">
            <h3 className="font-display text-lg font-medium mb-4">待審核申請</h3>
            {pending.length === 0 && <p className="text-ash text-sm">目前沒有待審核的申請。</p>}
            <div className="flex flex-col gap-3">
              {pending.map((p) => (
                <div key={p.id} className="flex justify-between items-center border border-seam rounded p-4">
                  <div>
                    <p className="text-sm font-medium">
                      {p.student_id ? `學號：${p.student_id}` : "外部人士申請"}
                    </p>
                    <Mono>{new Date(p.created_at).toLocaleString("zh-TW")}</Mono>
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={actioningId === p.id}
                      onClick={() => approve(p.id)}
                      className="text-sm px-4 py-2 rounded bg-moss text-paper font-medium disabled:opacity-50"
                    >
                      核准
                    </button>
                    <button
                      disabled={actioningId === p.id}
                      onClick={() => reject(p.id)}
                      className="text-sm px-4 py-2 rounded border border-seam disabled:opacity-50"
                    >
                      拒絕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg font-medium mb-2">社員與管理員</h3>
            <p className="text-ash text-xs mb-4">
              要交接管理權，先讓對方完成一般註冊、經過核准成為社員後，在這裡把角色改成「管理員」即可。
            </p>
            <div className="flex flex-col gap-3">
              {others.map((p) => (
                <div key={p.id} className="flex justify-between items-center border border-seam rounded p-4">
                  <div>
                    <p className="text-sm font-medium">
                      {p.real_name || "（尚未填寫真名）"} · {p.student_id ? `學號：${p.student_id}` : "外部人士"}
                      {p.id === user.id && <span className="text-ash text-xs ml-2">(你)</span>}
                    </p>
                    <p className="text-ash text-xs mt-1">
                      {[p.phone, p.contact_email, p.ig_id && `@${p.ig_id}`].filter(Boolean).join(" · ") || "尚無聯絡方式"}
                    </p>
                    <Mono>{p.role}</Mono>
                  </div>
                  <div className="flex gap-2">
                    {p.role === "member" && (
                      <button
                        disabled={actioningId === p.id}
                        onClick={() => setRole(p.id, "admin")}
                        className="text-sm px-4 py-2 rounded border border-seam disabled:opacity-50"
                      >
                        設為管理員
                      </button>
                    )}
                    {p.role === "admin" && p.id !== user.id && (
                      <button
                        disabled={actioningId === p.id}
                        onClick={() => setRole(p.id, "member")}
                        className="text-sm px-4 py-2 rounded border border-seam disabled:opacity-50"
                      >
                        降為社員
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </AdminGuard>
  );
}
