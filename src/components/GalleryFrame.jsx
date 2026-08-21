import React from "react";
import { Corner, Mono } from "./ui.jsx";

export default function GalleryFrame({ photo, onClick }) {
  return (
    <div
      className={`relative aspect-[4/5] bg-concrete rounded overflow-hidden ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {photo.image_url ? (
        <img src={photo.image_url} alt={photo.caption || ""} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0" style={{ background: photo.placeholderGradient }} />
      )}
      <Corner position="tl" size="w-4 h-4" color="border-paper" />
      <Corner position="br" size="w-4 h-4" color="border-paper" />
      <div
        className="absolute bottom-0 left-0 right-0 p-3.5"
        style={{ background: "linear-gradient(0deg, rgba(48,46,42,0.55), transparent)" }}
      >
        <Mono className="text-paper/90">{photo.exif}</Mono>
      </div>
    </div>
  );
}
