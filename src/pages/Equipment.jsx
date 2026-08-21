import React, { useEffect, useState, useCallback } from "react";
import Nav from "../components/Nav.jsx";
import EquipmentCard from "../components/EquipmentCard.jsx";
import { Mono } from "../components/ui.jsx";
import { supabase } from "../lib/supabaseClient.js";

export default function Equipment({ user, role }) {
  const canBorrow = role === "member" || role === "admin";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    supabase
      .from("equipment")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("讀取器材失敗：", error);
        setItems(data ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleToggle(item) {
    if (!user) return;

    if (item.status === "available") {
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const { error } = await supabase
        .from("equipment")
        .update({ status: "rented", current_holder: user.id, due_date: dueDate })
        .eq("id", item.id);
      if (error) console.error("租借失敗：", error);
    } else if (item.current_holder === user.id) {
      const { error } = await supabase
        .from("equipment")
        .update({ status: "available", current_holder: null, due_date: null })
        .eq("id", item.id);
      if (error) console.error("歸還失敗：", error);
    }

    load();
  }

  const availableCount = items.filter((i) => i.status === "available").length;

  return (
    <div>
      <Nav user={user} role={role} />
      <section className="px-10 py-16">
        <div className="flex justify-between items-baseline mb-10">
          <h1 className="font-display text-3xl font-medium">器材租借</h1>
          <Mono>{availableCount} available · {items.length - availableCount} rented</Mono>
        </div>

        {!canBorrow && (
          <div className="mb-8 border border-seam rounded p-4 text-sm text-ash bg-concrete/40">
            {!user
              ? "登入後即可租借器材。目前你以訪客身份瀏覽，只能查看目錄。"
              : "你的帳號正在等候管理員審核學生身份，審核通過後才能租借器材。"}
          </div>
        )}

        {loading ? (
          <p className="text-ash text-sm">載入中...</p>
        ) : items.length === 0 ? (
          <p className="text-ash text-sm">目前還沒有任何器材資料。</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {items.map((item) => (
              <EquipmentCard
                key={item.id}
                item={item}
                canBorrow={canBorrow}
                isHolder={item.current_holder === user?.id}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
