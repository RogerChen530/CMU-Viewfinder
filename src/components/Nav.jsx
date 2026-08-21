import React from "react";
import { Link } from "react-router-dom";

export default function Nav({ user }) {
  return (
    <nav className="flex justify-between items-center px-10 py-7">
      <Link to="/" className="font-display font-semibold text-[19px]">
        CMU <span className="text-moss">Viewfinder</span>
      </Link>
      <div className="flex gap-8 text-sm text-ash">
        <Link to="/" className="hover:text-ink">首頁</Link>
        <Link to="/equipment" className="hover:text-ink">器材</Link>
        <Link to="/gallery" className="hover:text-ink">相簿</Link>
        <Link to="/team" className="hover:text-ink">社員</Link>
      </div>
      {user ? (
        <Link to="/account" className="text-sm border border-seam px-4 py-2 rounded">
          {user.email}
        </Link>
      ) : (
        <Link to="/login" className="text-sm border border-seam px-4 py-2 rounded">
          會員登入
        </Link>
      )}
    </nav>
  );
}
