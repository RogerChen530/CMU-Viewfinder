import React from "react";
import { Corner, Mono } from "./ui.jsx";

export default function Hero() {
  return (
    <div className="relative mx-10 mt-5 p-12 md:p-24 bg-concrete rounded overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "repeating-linear-gradient(180deg, transparent, transparent 63px, rgba(107,103,95,0.06) 64px)",
        }}
      />
      <Corner position="tl" />
      <Corner position="tr" />
      <Corner position="bl" />
      <Corner position="br" />
      <div className="relative z-10">
        <Mono className="block mb-4">f/2.8 · iso 400 · 24mm</Mono>
        <h1 className="font-display font-medium text-4xl md:text-5xl leading-tight max-w-xl">
          在框景之間，
          <br />
          看見城市的呼吸
        </h1>
        <p className="mt-5 max-w-md text-ash text-[15px]">
          中國醫藥大學攝影社，記錄光影、器材共享、與每一次快門背後的練習。
        </p>
        <div className="mt-9 flex gap-3.5">
          <span className="bg-moss text-paper text-sm px-5 py-3 rounded font-medium cursor-pointer">
            瀏覽相簿
          </span>
          <span className="text-sm px-5 py-3 rounded border border-seam cursor-pointer">
            加入社團
          </span>
        </div>
      </div>
    </div>
  );
}
