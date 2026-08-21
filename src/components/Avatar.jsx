import React from "react";

export default function Avatar({ url, size = 40, alt = "", shape = "circle", className = "" }) {
  const shapeClass = shape === "circle" ? "rounded-full" : "rounded";
  const style = shape === "circle" ? { width: size, height: size } : undefined;

  if (url) {
    return (
      <img
        src={url}
        alt={alt}
        style={style}
        className={`${shapeClass} object-cover border border-seam shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      style={style}
      className={`${shapeClass} bg-concrete border border-seam flex items-center justify-center shrink-0 ${className}`}
    >
      <svg
        width={shape === "circle" ? size * 0.5 : 40}
        height={shape === "circle" ? size * 0.5 : 40}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-ash"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
      </svg>
    </div>
  );
}
