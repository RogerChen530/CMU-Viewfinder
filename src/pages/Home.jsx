import React from "react";
import Nav from "../components/Nav.jsx";
import Hero from "../components/Hero.jsx";
import EquipmentCard from "../components/EquipmentCard.jsx";
import GalleryFrame from "../components/GalleryFrame.jsx";
import { Seam, Mono } from "../components/ui.jsx";

// 樣本資料 — 之後接上 Supabase 後由 useEffect + supabase.from('equipment').select() 取代
const sampleEquipment = [
  { id: 1, name: "Canon EOS R5", asset_code: "CAM-014", model: "Mirrorless Body", status: "available", current_holder: null },
  { id: 2, name: "Sigma 24-70mm", asset_code: "LEN-008", model: "f/2.8 Art", status: "rented", due_date: "08/28" },
  { id: 3, name: "Godox AD200", asset_code: "LGT-002", model: "Portable Flash", status: "available", current_holder: null },
];

const samplePhotos = [
  { id: 1, exif: "iso 200 · f/8 · 35mm", placeholderGradient: "linear-gradient(135deg, #B9B5AC 0%, #E4E1DA 60%)" },
  { id: 2, exif: "iso 800 · f/1.8 · 50mm", placeholderGradient: "linear-gradient(200deg, #6B675F 0%, #E4E1DA 55%)" },
  { id: 3, exif: "iso 400 · f/4 · 85mm", placeholderGradient: "linear-gradient(160deg, #34402F 0%, #E4E1DA 55%)" },
];

export default function Home({ user }) {
  const canBorrow = !!user;

  return (
    <div>
      <Nav user={user} />
      <Hero />

      <div className="mt-16">
        <Seam />
      </div>

      <section className="px-10 py-16">
        <div className="flex justify-between items-baseline mb-8">
          <h2 className="font-display text-2xl font-medium">器材租借</h2>
          <Mono>3 available · 1 rented</Mono>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {sampleEquipment.map((item) => (
            <EquipmentCard key={item.id} item={item} canBorrow={canBorrow} onToggle={() => {}} />
          ))}
        </div>
      </section>

      <Seam />

      <section className="px-10 py-16">
        <div className="flex justify-between items-baseline mb-8">
          <h2 className="font-display text-2xl font-medium">近期作品</h2>
          <Mono>gallery / 12 photos</Mono>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {samplePhotos.map((p) => (
            <GalleryFrame key={p.id} photo={p} />
          ))}
        </div>
      </section>

      <footer className="px-10 py-8 text-ash text-xs flex justify-between">
        <span>© 2026 CMU Viewfinder</span>
        <Mono>as-cast · no.14</Mono>
      </footer>
    </div>
  );
}
