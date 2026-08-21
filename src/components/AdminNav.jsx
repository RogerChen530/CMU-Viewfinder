import React from "react";
import { Link, useLocation } from "react-router-dom";

const tabs = [
  { to: "/admin", label: "審核與社員" },
  { to: "/admin/equipment", label: "器材" },
  { to: "/admin/gallery", label: "相簿" },
  { to: "/admin/announcements", label: "公告" },
];

export default function AdminNav() {
  const { pathname } = useLocation();

  return (
    <div className="flex gap-2 mb-10 border-b border-seam">
      {tabs.map((tab) => {
        const active = pathname === tab.to;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`text-sm px-4 py-2.5 -mb-px border-b-2 ${
              active ? "border-moss text-ink font-medium" : "border-transparent text-ash hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
