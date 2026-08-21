import React from "react";
import Nav from "./Nav.jsx";
import AdminNav from "./AdminNav.jsx";

// 包住每個 /admin/* 頁面：role 還在載入時顯示 loading，
// 不是 admin 就擋下來，是 admin 才渲染 children。
export default function AdminGuard({ user, role, title, children }) {
  if (role !== "admin") {
    return (
      <div>
        <Nav user={user} role={role} />
        <section className="px-10 py-16">
          <p className="text-sm text-ash">
            {role === null ? "載入中..." : "這個頁面只有管理員能存取。"}
          </p>
        </section>
      </div>
    );
  }

  return (
    <div>
      <Nav user={user} role={role} />
      <section className="px-10 py-16">
        <div className="flex justify-between items-baseline mb-2">
          <h1 className="font-display text-3xl font-medium">管理</h1>
        </div>
        <AdminNav />
        <h2 className="font-display text-xl font-medium mb-6">{title}</h2>
        {children}
      </section>
    </div>
  );
}
