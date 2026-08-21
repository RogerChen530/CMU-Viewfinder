import React, { useEffect, useState } from "react";
import Nav from "../components/Nav.jsx";
import EquipmentCard from "../components/EquipmentCard.jsx";
import { Mono } from "../components/ui.jsx";
import { supabase } from "../lib/supabaseClient.js";

export default function Equipment({ user, role }) {
  const canBorrow = !!user;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
            登入後即可租借器材。目前你以訪客身份瀏覽，只能查看目錄。
          </div>
        )}

        {loading ? (
          <p className="text-ash text-sm">載入中...</p>
        ) : items.length === 0 ? (
          <p className="text-ash text-sm">目前還沒有任何器材資料。</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {items.map((item) => (
              <EquipmentCard key={item.id} item={item} canBorrow={canBorrow} onToggle={() => {}} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
