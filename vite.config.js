import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/CMU-Viewfinder/", // GitHub Pages 專案頁路徑，正式網域確定後可調整
});
