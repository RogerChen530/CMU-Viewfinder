import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // 只有正式 build（部署到 GitHub Pages）才需要子路徑，
  // 本地 `npm run dev` 維持根目錄 "/"，避免路由對不上導致白畫面。
  base: command === "build" ? "/CMU-Viewfinder/" : "/",
}));
