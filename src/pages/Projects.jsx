import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "../components/Nav.jsx";
import { Mono } from "../components/ui.jsx";
import { supabase } from "../lib/supabaseClient.js";

export default function Projects({ user, role }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (role !== "member" && role !== "admin")) {
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("讀取 projects 失敗：", error);
        setProjects(data ?? []);
        setLoading(false);
      });
  }, [user, role]);

  return (
    <div>
      <Nav user={user} role={role} />
      <section className="px-10 py-16">
        <div className="flex justify-between items-baseline mb-10">
          <h1 className="font-display text-3xl font-medium">專案</h1>
          <Mono>teamwork hub</Mono>
        </div>

        {!user && (
          <div className="max-w-md">
            <p className="text-ash text-sm mb-5">
              專案頁只開放給審核通過的社員瀏覽，訪客無法查看這裡的內容。
            </p>
            <div className="flex gap-3">
              <Link to="/login" className="text-sm px-5 py-3 rounded bg-moss text-paper font-medium">
                社員登入
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
            <p className="text-ash text-xs mt-2">審核通過後即可看到目前進行中的專案。</p>
          </div>
        )}

        {user && (role === "member" || role === "admin") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {loading && <p className="text-ash text-sm col-span-2">載入中...</p>}
            {!loading && projects.length === 0 && (
              <p className="text-ash text-sm col-span-2">目前還沒有進行中的專案。</p>
            )}
            {projects.map((p) => (
              <div key={p.id} className="border border-seam rounded p-5">
                <h3 className="font-display text-lg font-medium mb-2">{p.title}</h3>
                <p className="text-ash text-sm">{p.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
