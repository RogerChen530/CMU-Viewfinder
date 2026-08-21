import React from "react";
import { Mono } from "./ui.jsx";

export default function EquipmentCard({ item, canBorrow, isHolder, onToggle }) {
  const available = item.status === "available";

  return (
    <div className="bg-paper border border-seam rounded p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-base font-semibold mb-1">{item.name}</h3>
          <Mono>{item.asset_code}</Mono>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px]">
          <span className={`w-1.5 h-1.5 rounded-full ${available ? "bg-moss" : "bg-ash"}`} />
          {available ? "可租借" : "租借中"}
        </span>
      </div>

      <div className="flex flex-col gap-1 mt-3.5 pt-3.5 border-t border-concrete text-xs">
        <div className="flex justify-between">
          <span className="text-ash">型號</span>
          <span>{item.model}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ash">{available ? "持有人" : "歸還日"}</span>
          <span>{available ? "—" : item.due_date || "—"}</span>
        </div>
      </div>

      {available && canBorrow && (
        <button
          onClick={() => onToggle(item)}
          className="mt-4 w-full text-sm py-2.5 rounded bg-moss text-paper font-medium"
        >
          租借 7 天
        </button>
      )}

      {available && !canBorrow && (
        <button
          onClick={() => onToggle(item)}
          className="mt-4 w-full text-sm py-2.5 rounded border border-seam text-ash"
        >
          登入以租借
        </button>
      )}

      {!available && isHolder && (
        <button
          onClick={() => onToggle(item)}
          className="mt-4 w-full text-sm py-2.5 rounded bg-moss text-paper font-medium"
        >
          歸還器材
        </button>
      )}

      {!available && !isHolder && (
        <p className="mt-4 text-xs text-ash text-center">目前由其他社員借用中</p>
      )}
    </div>
  );
}
