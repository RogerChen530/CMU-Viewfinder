import React, { useEffect, useState, useCallback } from "react";
import Nav from "../components/Nav.jsx";
import Hero from "../components/Hero.jsx";
import EquipmentCard from "../components/EquipmentCard.jsx";
import GalleryFrame from "../components/GalleryFrame.jsx";
import PhotoLightbox from "../components/PhotoLightbox.jsx";
import { Seam, Mono } from "../components/ui.jsx";
import { supabase } from "../lib/supabaseClient.js";

export default function Home({ user, role }) {
  const canBorrow = role === "member" || role === "admin";
  const [equipment, setEquipment] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [heroPhoto, setHeroPhoto] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const loadEquipment = useCallback(() => {
    supabase
      .from("equipment")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        if (error) console.error("讀取器材失敗：", error);
        setEquipment(data ?? []);
      });
  }, []);

  useEffect(() => {
    loadEquipment();

    // 首頁相簿：精選圖優先，不夠 6 張的話用最新上傳的補滿
    supabase
      .from("photos")
      .select("*")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(6)
      .then(async ({ data: featured, error }) => {
        if (error) {
          console.error("讀取相簿失敗：", error);
          return;
        }

        const featuredList = featured ?? [];
        if (featuredList.length >= 6) {
          setPhotos(featuredList.slice(0, 6));
          return;
        }

        const excludeIds = featuredList.map((p) => p.id);
        let query = supabase
          .from("photos")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(6 - featuredList.length + excludeIds.length);

        const { data: latest, error: latestError } = await query;
        if (latestError) {
          console.error("讀取相簿失敗：", latestError);
          setPhotos(featuredList);
          return;
        }

        const fill = (latest ?? []).filter((p) => !excludeIds.includes(p.id)).slice(0, 6 - featuredList.length);
        setPhotos([...featuredList, ...fill]);
      });

    // Hero 圖：優先用後台指定的精選圖，沒有的話 fallback 抓最新一張
    supabase
      .from("photos")
      .select("*")
      .eq("is_featured", true)
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.error("讀取精選圖失敗：", error);
          return;
        }
        if (data && data.length > 0) {
          setHeroPhoto(data[0]);
        } else {
          supabase
            .from("photos")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(1)
            .then(({ data: latest }) => setHeroPhoto(latest?.[0] ?? null));
        }
      });

    supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        if (error) console.error("讀取公告失敗：", error);
        setAnnouncements(data ?? []);
      });
  }, [loadEquipment]);

  async function handleToggle(item) {
    if (!user) return;

    if (item.status === "available") {
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const { error } = await supabase
        .from("equipment")
        .update({ status: "rented", current_holder: user.id, due_date: dueDate })
        .eq("id", item.id);
      if (error) console.error("租借失敗：", error);
    } else if (item.current_holder === user.id) {
      const { error } = await supabase
        .from("equipment")
        .update({ status: "available", current_holder: null, due_date: null })
        .eq("id", item.id);
      if (error) console.error("歸還失敗：", error);
    }

    loadEquipment();
  }

  const availableCount = equipment.filter((i) => i.status === "available").length;

  return (
    <div>
      <Nav user={user} role={role} />
      <Hero photo={heroPhoto} />

      <div className="mt-16">
        <Seam />
      </div>

      {announcements.length > 0 && (
        <>
          <section className="px-10 py-16">
            <div className="flex justify-between items-baseline mb-8">
              <h2 className="font-display text-2xl font-medium">近期動態</h2>
              <Mono>announcements</Mono>
            </div>
            <div className="flex flex-col gap-3">
              {announcements.map((a) => (
                <div key={a.id} className="border border-seam rounded p-4">
                  <p className="text-sm font-medium mb-1">{a.title}</p>
                  <p className="text-ash text-xs leading-relaxed">{a.content}</p>
                </div>
              ))}
            </div>
          </section>
          <Seam />
        </>
      )}

      <section className="px-10 py-16">
        <div className="flex justify-between items-baseline mb-8">
          <h2 className="font-display text-2xl font-medium">器材租借</h2>
          <Mono>{availableCount} available · {equipment.length - availableCount} rented</Mono>
        </div>
        {equipment.length === 0 ? (
          <p className="text-ash text-sm">目前還沒有任何器材資料。</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {equipment.map((item) => (
              <EquipmentCard
                key={item.id}
                item={item}
                canBorrow={canBorrow}
                isHolder={item.current_holder === user?.id}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </section>

      <Seam />

      <section className="px-10 py-16">
        <div className="flex justify-between items-baseline mb-8">
          <h2 className="font-display text-2xl font-medium">Gallery</h2>
          <Mono>gallery</Mono>
        </div>
        {photos.length === 0 ? (
          <p className="text-ash text-sm">目前還沒有任何照片。</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((p) => (
              <GalleryFrame
                key={p.id}
                photo={{ ...p, exif: p.exif || p.caption }}
                onClick={() => setSelectedPhoto(p)}
              />
            ))}
          </div>
        )}
      </section>

      <footer className="px-10 py-8 text-ash text-xs flex justify-between">
        <span>© 2026 CMU Viewfinder</span>
        <Mono>as-cast · no.14</Mono>
      </footer>

      <PhotoLightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
    </div>
  );
}
