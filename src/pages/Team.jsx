import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "../components/Nav.jsx";
import Avatar from "../components/Avatar.jsx";
import { Mono } from "../components/ui.jsx";
import { supabase } from "../lib/supabaseClient.js";

export default function Team({ user, role }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (role !== "member" && role !== "admin")) {
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from("member_directory")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error("讀取社員名單失敗：", error);
        setMembers(data ?? []);
        setLoading(false);
      });
  }, [user, role]);

  return (
    <div>
      <Nav user={user} role={role} />
      <section className="px-10 py-16">
        <div className="flex justify-between items-baseline mb-10">
          <h1 className="font-display text-3xl font-medium">社員</h1>
          <Mono>member roster</Mono>
        </div>

        {!user && (
          <div className="max-w-md">
            <p className="text-ash text-sm mb-5">
              社員名單只開放給審核通過的社員瀏覽，訪客無法查看這裡的內容。
            </p>
            <div className="flex gap-3">
              <Link to="/login" className="text-sm px-5 py-3 rounded bg-moss text-paper font-medium">
                會員登入
              </Link>
              <Link to="/register" className="text-sm px-5 py-3 rounded border border-seam">
                申請加入
              </Link>
            </div>
          </div>
        )}

        {user && role === null && <p className="text-ash text-sm">載入中...</p>}

        {user && role === "pending" && (
          <div className="max-w-md border border-seam rounded p-5">
            <p className="text-sm">你的帳號正在等候管理員審核學生身份。</p>
            <p className="text-ash text-xs mt-2">審核通過後即可看到社員名單與參與器材租借。</p>
          </div>
        )}

        {user && (role === "member" || role === "admin") && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loading && <p className="text-ash text-sm col-span-full">載入中...</p>}
            {!loading && members.length === 0 && (
              <p className="text-ash text-sm col-span-full">目前還沒有其他社員。</p>
            )}
            {members.map((m) => {
              const name = m.display_name || m.real_name || "神秘客";
              return (
                <div key={m.id} className="border border-seam rounded overflow-hidden flex flex-col">
                  <div className="bg-ink text-paper text-center py-2 px-1.5">
                    <p className="text-xs font-medium truncate">
                      {name}
                      {m.id === user.id && <span className="text-paper/60 ml-1">(你)</span>}
                    </p>
                  </div>
                  <Avatar url={m.avatar_url} shape="rect" alt={name} className="w-full aspect-[4/5]" />
                  <div className="p-2.5 text-center">
                    <Mono className="text-[10px]">{m.role === "admin" ? "管理員" : "社員"}</Mono>
                    <div className="mt-1.5 flex flex-col gap-0.5 text-[11px] text-ash">
                      {m.contact_email && <span className="truncate">{m.contact_email}</span>}
                      {m.ig_id && <span>@{m.ig_id}</span>}
                      {!m.contact_email && !m.ig_id && <span>—</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
