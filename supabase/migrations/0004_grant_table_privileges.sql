-- ============================================================
-- 補上四張表的 GRANT 權限
--
-- 問題：建立 Supabase 專案時關掉了「Automatically expose new tables」
-- （這是我們刻意的選擇，安全性考量正確），但這個開關除了控制
-- API 是否自動曝露，也負責自動幫新表下 GRANT，讓 anon/authenticated
-- 角色有權限碰觸資料表本身。
--
-- RLS 規則管的是「哪些列」可以被存取，GRANT 管的是「這張表能不能
-- 被碰」——是兩層獨立的權限檢查，RLS 設對了不代表 GRANT 有給，
-- 兩層都要過，PostgREST 才會放行。我們當初只寫了 RLS，漏了 GRANT，
-- 導致所有查詢都被擋在「還沒進到 RLS 檢查」的更前面一層，
-- 回傳 42501 (insufficient privilege)。
-- ============================================================

-- profiles：不開放 anon 讀取（訪客不需要看到任何人的個資／角色）
-- authenticated 可以 select 自己的（read own profile policy 限制列範圍）
-- 也可以 update（admin 專用，policy 限制哪些人能改）
grant select, update on public.profiles to authenticated;

-- equipment：訪客也能瀏覽器材目錄
grant select on public.equipment to anon, authenticated;
-- 借還、新增、刪除都要登入，RLS policy 再進一步限制誰能做什麼
grant insert, update, delete on public.equipment to authenticated;

-- photos：相簿公開瀏覽
grant select on public.photos to anon, authenticated;
grant insert, update, delete on public.photos to authenticated;

-- projects：訪客完全不給碰（連 grant 都不給，RLS 也會擋，雙重保險）
grant select, insert, update, delete on public.projects to authenticated;
