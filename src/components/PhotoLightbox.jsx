import React, { useCallback, useEffect, useState } from "react";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// 注意：父層（Home、Gallery）是無條件渲染 <PhotoLightbox photo={...} />，
// 這個元件從頁面載入起就一直掛著，沒選照片時只是 return null。
// 所以「開／關」一律以 photo 是否為 null 判斷，不能用 mount／unmount。
export default function PhotoLightbox({ photo, onClose }) {
  // closing = 正在播退場動畫。動畫播完才真的呼叫 onClose 把 photo 設回 null。
  const [closing, setClosing] = useState(false);

  // 三個關閉入口（Esc、點背景、關閉按鈕）都走這裡。
  const requestClose = useCallback(() => {
    if (!photo) return;
    // reduced motion 時不播動畫，animationend 也不會觸發，必須直接關閉，
    // 否則 lightbox 會關不掉。
    if (prefersReducedMotion()) {
      onClose();
      return;
    }
    setClosing(true);
  }, [photo, onClose]);

  // backdrop 自己的退場動畫播完才關閉。
  // - 面板的 animationend 會冒泡上來，用 target 檢查擋掉。
  // - 進場的 animationend 也會到這裡，用 closing 檢查擋掉。
  // - closing 在同一個 handler 裡歸零：元件不會重掛，closing 不會自己變回 false；
  //   若改用 useEffect 依賴 photo 來重設，effect 在 paint 之後才跑，
  //   下次打開會先閃一幀退場動畫。React 18 會把這兩個更新合併成一次 render。
  function handleAnimationEnd(e) {
    if (e.target !== e.currentTarget || !closing) return;
    setClosing(false);
    onClose();
  }

  // Esc：只在 lightbox 開著時監聽。
  useEffect(() => {
    if (!photo) return;
    function handleKey(e) {
      if (e.key === "Escape") requestClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [photo, requestClose]);

  // 開著時鎖住背景捲動。依賴 photo 而不是 []（理由同上方註解）。
  // 退場動畫期間 photo 仍非 null，所以會等動畫播完、onClose 之後才解鎖。
  useEffect(() => {
    if (!photo) return;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    // 捲軸消失會讓版面變寬、內容往右跳，用 padding 補回捲軸的寬度。
    // macOS 預設的浮動捲軸寬度是 0，這段在 Windows 上才看得出效果。
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      const currentPadding = parseFloat(getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [photo]);

  if (!photo) return null;

  const hasDetails = photo.author || photo.exif || photo.description;

  // 進場加 motion-safe:，reduced motion 時直接出現。
  // 退場不加前綴：只有在非 reduced motion 時才會進入 closing 狀態，
  // 加了前綴反而可能讓動畫不播、animationend 不來而卡住。
  // backdrop 只做淡入淡出；縮放放在面板上，全螢幕遮罩縮放會在四周露出頁面。
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-6 ${
        closing ? "animate-fade-out" : "motion-safe:animate-fade-in"
      }`}
      style={{ background: "rgba(48,46,42,0.85)" }}
      onClick={requestClose}
      onAnimationEnd={handleAnimationEnd}
    >
      <div
        className={`bg-paper rounded overflow-hidden max-w-4xl w-full max-h-[88vh] flex flex-col md:flex-row ${
          closing ? "animate-lb-out" : "motion-safe:animate-lb-in"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:w-2/3 bg-concrete flex items-center justify-center max-h-[50vh] md:max-h-[88vh]">
          <img
            src={photo.image_url}
            alt={photo.caption ?? ""}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="md:w-1/3 p-6 overflow-y-auto flex flex-col">
          <button
            onClick={requestClose}
            className="self-end text-xs text-ash mb-4 border border-seam rounded px-3 py-1.5 shrink-0"
          >
            關閉 ✕
          </button>

          {photo.caption && (
            <h2 className="font-display text-lg font-medium mb-4">{photo.caption}</h2>
          )}

          {hasDetails ? (
            <div className="flex flex-col gap-4 text-sm">
              {photo.author && (
                <div>
                  <p className="text-ash text-xs mb-1">作者</p>
                  <p>{photo.author}</p>
                </div>
              )}
              {photo.exif && (
                <div>
                  <p className="text-ash text-xs mb-1">拍攝資訊</p>
                  <p className="font-mono text-xs">{photo.exif}</p>
                </div>
              )}
              {photo.description && (
                <div>
                  <p className="text-ash text-xs mb-1">創作理念</p>
                  <p className="text-ash leading-relaxed whitespace-pre-wrap">{photo.description}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-ash text-xs">這張照片還沒有補充說明。</p>
          )}
        </div>
      </div>
    </div>
  );
}
