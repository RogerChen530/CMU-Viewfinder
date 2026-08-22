import React from "react";

function formatBytes(bytes) {
  if (bytes === 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

// segments: [{ label, bytes, colorClass }]
export default function StorageUsageBar({ title, capBytes, segments }) {
  const usedBytes = segments.reduce((sum, s) => sum + s.bytes, 0);
  const freeBytes = Math.max(0, capBytes - usedBytes);
  const overCap = usedBytes > capBytes;

  return (
    <div className="border border-seam rounded p-5">
      <div className="flex justify-between items-baseline mb-3">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-ash">
          已使用 {formatBytes(usedBytes)}（共 {formatBytes(capBytes)}）
        </p>
      </div>

      <div className="flex h-3 rounded-full overflow-hidden bg-concrete">
        {segments.map((s, i) => {
          const pct = Math.min(100, (s.bytes / capBytes) * 100);
          if (pct <= 0) return null;
          return <div key={i} className={s.colorClass} style={{ width: `${pct}%` }} />;
        })}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
        {segments.map((s, i) => (
          <span key={i} className="flex items-center gap-1.5 text-[11px] text-ash">
            <span className={`w-2 h-2 rounded-full ${s.colorClass}`} />
            {s.label}（{formatBytes(s.bytes)}）
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-[11px] text-ash">
          <span className="w-2 h-2 rounded-full bg-concrete border border-seam" />
          剩餘（{formatBytes(freeBytes)}）
        </span>
      </div>

      {overCap && (
        <p className="text-red-700 text-[11px] mt-2">已超過容量上限，建議清理或考慮升級方案。</p>
      )}
    </div>
  );
}
