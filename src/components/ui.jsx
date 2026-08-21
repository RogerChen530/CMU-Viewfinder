import React from "react";

// 觀景窗四角括號 — 攝影構圖語彙
export function Corner({ position, size = "w-[22px] h-[22px]", color = "border-moss" }) {
  const map = {
    tl: "top-6 left-6 border-t border-l",
    tr: "top-6 right-6 border-t border-r",
    bl: "bottom-6 left-6 border-b border-l",
    br: "bottom-6 right-6 border-b border-r",
  };
  return <span className={`absolute ${size} ${color} ${map[position]}`} style={{ borderWidth: 1.5 }} />;
}

// 清水模繫件孔分隔線
export function Seam() {
  return (
    <div className="relative h-px bg-seam mx-10">
      {["15%", "85%"].map((pos) => (
        <span
          key={pos}
          className="absolute top-1/2 w-[5px] h-[5px] rounded-full bg-paper border border-seam"
          style={{ left: pos, transform: "translate(-50%, -50%)" }}
        />
      ))}
    </div>
  );
}

// 技術性 EXIF 風格標籤
export function Mono({ children, className = "" }) {
  return (
    <span className={`font-mono text-[11px] tracking-wider uppercase text-ash ${className}`}>
      {children}
    </span>
  );
}
