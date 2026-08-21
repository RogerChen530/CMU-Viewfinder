import React from "react";
import Nav from "../components/Nav.jsx";
import GalleryFrame from "../components/GalleryFrame.jsx";
import { Mono } from "../components/ui.jsx";

// 樣本資料 — 真實圖片上傳/Supabase Storage 串接排在下一階段
const samplePhotos = [
  { id: 1, exif: "iso 200 · f/8 · 35mm", placeholderGradient: "linear-gradient(135deg, #B9B5AC 0%, #E4E1DA 60%)" },
  { id: 2, exif: "iso 800 · f/1.8 · 50mm", placeholderGradient: "linear-gradient(200deg, #6B675F 0%, #E4E1DA 55%)" },
  { id: 3, exif: "iso 400 · f/4 · 85mm", placeholderGradient: "linear-gradient(160deg, #34402F 0%, #E4E1DA 55%)" },
  { id: 4, exif: "iso 100 · f/11 · 16mm", placeholderGradient: "linear-gradient(120deg, #4B5D45 0%, #E4E1DA 55%)" },
  { id: 5, exif: "iso 640 · f/2 · 35mm", placeholderGradient: "linear-gradient(180deg, #B9B5AC 0%, #E4E1DA 60%)" },
  { id: 6, exif: "iso 320 · f/5.6 · 24mm", placeholderGradient: "linear-gradient(210deg, #6B675F 0%, #E4E1DA 55%)" },
];

export default function Gallery({ user }) {
  return (
    <div>
      <Nav user={user} />
      <section className="px-10 py-16">
        <div className="flex justify-between items-baseline mb-10">
          <h1 className="font-display text-3xl font-medium">近期作品</h1>
          <Mono>gallery / {samplePhotos.length} photos</Mono>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {samplePhotos.map((p) => (
            <GalleryFrame key={p.id} photo={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
