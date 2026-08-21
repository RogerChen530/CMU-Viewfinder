import React from "react";
import Nav from "../components/Nav.jsx";
import EquipmentCard from "../components/EquipmentCard.jsx";
import { Mono } from "../components/ui.jsx";

// 樣本資料 — 跟首頁一樣先用假資料，真實 Supabase 串接排在下一階段
const sampleEquipment = [
  { id: 1, name: "Canon EOS R5", asset_code: "CAM-014", model: "Mirrorless Body", status: "available", current_holder: null },
  { id: 2, name: "Sigma 24-70mm", asset_code: "LEN-008", model: "f/2.8 Art", status: "rented", due_date: "08/28" },
  { id: 3, name: "Godox AD200", asset_code: "LGT-002", model: "Portable Flash", status: "available", current_holder: null },
  { id: 4, name: "Sony A7 IV", asset_code: "CAM-021", model: "Mirrorless Body", status: "available", current_holder: null },
  { id: 5, name: "Manfrotto 190", asset_code: "SUP-005", model: "Aluminum Tripod", status: "rented", due_date: "09/02" },
  { id: 6, name: "Canon 50mm f/1.8", asset_code: "LEN-013", model: "Prime Lens", status: "available", current_holder: null },
];

export default function Equipment({ user }) {
  const canBorrow = !!user;
  const availableCount = sampleEquipment.filter((i) => i.status === "available").length;
  const rentedCount = sampleEquipment.length - availableCount;

  return (
    <div>
      <Nav user={user} />
      <section className="px-10 py-16">
        <div className="flex justify-between items-baseline mb-10">
          <h1 className="font-display text-3xl font-medium">器材租借</h1>
          <Mono>{availableCount} available · {rentedCount} rented</Mono>
        </div>

        {!canBorrow && (
          <div className="mb-8 border border-seam rounded p-4 text-sm text-ash bg-concrete/40">
            登入後即可租借器材。目前你以訪客身份瀏覽，只能查看目錄。
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {sampleEquipment.map((item) => (
            <EquipmentCard key={item.id} item={item} canBorrow={canBorrow} onToggle={() => {}} />
          ))}
        </div>
      </section>
    </div>
  );
}
