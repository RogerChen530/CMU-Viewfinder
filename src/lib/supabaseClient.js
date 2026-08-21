import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const hasRealConfig = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasRealConfig) {
  console.warn(
    "缺少 Supabase 環境變數，請在 .env.local 設定 VITE_SUPABASE_URL 與 VITE_SUPABASE_ANON_KEY。\n" +
    "目前用假的 placeholder 頂著，畫面能看但登入/註冊等功能都不會動。"
  );
}

// 用格式合法的假 URL 當 fallback，避免專案還沒建好 Supabase 時，
// createClient() 因為 supabaseUrl 是 undefined 而直接拋出例外，
// 導致整個 React App 連渲染都還沒開始就白畫面。
export const supabase = createClient(
  hasRealConfig ? supabaseUrl : "https://placeholder.supabase.co",
  hasRealConfig ? supabaseAnonKey : "placeholder-anon-key"
);
