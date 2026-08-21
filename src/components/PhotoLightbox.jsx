import React, { useEffect } from "react";

export default function PhotoLightbox({ photo, onClose }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!photo) return null;

  const hasDetails = photo.author || photo.exif || photo.description;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(48,46,42,0.85)" }}
      onClick={onClose}
    >
      <div
        className="bg-paper rounded overflow-hidden max-w-4xl w-full max-h-[88vh] flex flex-col md:flex-row"
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
            onClick={onClose}
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
