import React, { useEffect, useState } from "react";
import Nav from "../components/Nav.jsx";
import GalleryFrame from "../components/GalleryFrame.jsx";
import { Mono } from "../components/ui.jsx";
import { supabase } from "../lib/supabaseClient.js";

export default function Gallery({ user, role }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("photos")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("讀取相簿失敗：", error);
        setPhotos(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <Nav user={user} role={role} />
      <section className="px-10 py-16">
        <div className="flex justify-between items-baseline mb-10">
          <h1 className="font-display text-3xl font-medium">近期作品</h1>
          <Mono>gallery / {photos.length} photos</Mono>
        </div>
        {loading ? (
          <p className="text-ash text-sm">載入中...</p>
        ) : photos.length === 0 ? (
          <p className="text-ash text-sm">目前還沒有任何照片。</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {photos.map((p) => (
              <GalleryFrame key={p.id} photo={{ ...p, exif: p.exif || p.caption }} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
