import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { supabase } from "./lib/supabaseClient.js";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Equipment from "./pages/Equipment.jsx";
import Gallery from "./pages/Gallery.jsx";
import Team from "./pages/Team.jsx";
import Projects from "./pages/Projects.jsx";
import News from "./pages/News.jsx";
import Account from "./pages/Account.jsx";
import Admin from "./pages/Admin.jsx";
import AdminEquipment from "./pages/AdminEquipment.jsx";
import AdminGallery from "./pages/AdminGallery.jsx";
import AdminAnnouncements from "./pages/AdminAnnouncements.jsx";
import AdminStorage from "./pages/AdminStorage.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setRole(null);
      return;
    }

    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("讀取角色失敗：", error);
        }
        setRole(data?.role ?? "pending");
      });
  }, [user]);

  return (
    <Routes>
      <Route path="/" element={<Home user={user} role={role} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/equipment" element={<Equipment user={user} role={role} />} />
      <Route path="/gallery" element={<Gallery user={user} role={role} />} />
      <Route path="/team" element={<Team user={user} role={role} />} />
      <Route path="/projects" element={<Projects user={user} role={role} />} />
      <Route path="/news" element={<News user={user} role={role} />} />
      <Route path="/account" element={<Account user={user} role={role} />} />
      <Route path="/admin" element={<Admin user={user} role={role} />} />
      <Route path="/admin/equipment" element={<AdminEquipment user={user} role={role} />} />
      <Route path="/admin/gallery" element={<AdminGallery user={user} role={role} />} />
      <Route path="/admin/announcements" element={<AdminAnnouncements user={user} role={role} />} />
      <Route path="/admin/storage" element={<AdminStorage user={user} role={role} />} />
    </Routes>
  );
}
