import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { supabase } from "./lib/supabaseClient.js";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Equipment from "./pages/Equipment.jsx";
import Gallery from "./pages/Gallery.jsx";
import Team from "./pages/Team.jsx";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home user={user} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/equipment" element={<Equipment user={user} />} />
      <Route path="/gallery" element={<Gallery user={user} />} />
      <Route path="/team" element={<Team user={user} />} />
      {/* TODO: /account 帳號設定頁待補 */}
    </Routes>
  );
}
