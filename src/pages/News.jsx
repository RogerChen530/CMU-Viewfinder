import React, { useEffect, useState } from "react";
import Nav from "../components/Nav.jsx";
import { Mono } from "../components/ui.jsx";
import { supabase } from "../lib/supabaseClient.js";

export default function News({ user, role }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("讀取消息失敗：", error);
        setPosts(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <Nav user={user} role={role} />
      <section className="px-10 py-16">
        <div className="flex justify-between items-baseline mb-10">
          <h1 className="font-display text-3xl font-medium">消息</h1>
          <Mono>{posts.length} posts</Mono>
        </div>

        {loading ? (
          <p className="text-ash text-sm">載入中...</p>
        ) : posts.length === 0 ? (
          <p className="text-ash text-sm">目前還沒有任何消息。</p>
        ) : (
          <div className="flex flex-col gap-4 max-w-2xl">
            {posts.map((p) => (
              <div key={p.id} className="border border-seam rounded p-5">
                <p className="text-base font-medium mb-2">{p.title}</p>
                <p className="text-ash text-sm leading-relaxed mb-3">{p.content}</p>
                <Mono>{new Date(p.created_at).toLocaleDateString("zh-TW")}</Mono>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
