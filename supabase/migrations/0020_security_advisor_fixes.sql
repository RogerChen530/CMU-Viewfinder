-- ============================================================
-- 修正 Supabase Security Advisor 掃出的問題
-- （這個工具在 Dashboard 裡，不會主動通知，要自己進後台看）
-- ============================================================

-- ----------------------------------------------------------------
-- 1. [Error] heartbeat 表 RLS 開了但沒有任何 policy
--
-- 這是故意的：heartbeat 只給 ping_heartbeat() 這個 security definer
-- 函式碰，不開放任何人直接查表。但 linter 沒辦法分辨「故意鎖死」
-- 跟「忘記寫 policy」，一律當錯誤。補一條明確拒絕所有存取的
-- policy，把意圖寫清楚，讓後台不再標記這個誤報。
-- ----------------------------------------------------------------
create policy "no direct access to heartbeat"
  on heartbeat for all
  using (false);


-- ----------------------------------------------------------------
-- 2. [Warning] 一堆函式被標記「Public Can Execute」
--
-- Postgres 建立函式時，預設會把執行權限開放給 PUBLIC（等於所有
-- 角色都能呼叫），我們之前額外用 grant ... to authenticated 這種
-- 方式加開特定角色的權限，但從來沒有把預設的 PUBLIC 權限收回去。
-- 等於「鎖了新鎖，但舊鑰匙沒收回來」，兩把鑰匙同時存在。
--
-- 分兩種處理：
-- (a) is_admin() / is_member_or_admin()：很多 RLS policy 內部
--     會呼叫它們判斷身份，authenticated/anon 角色需要能執行它們，
--     RLS 才能正常運作。收回 PUBLIC 之後要明確重新開給
--     anon + authenticated。
-- (b) 純粹給 trigger 用的函式（enforce_equipment_update_permissions、
--     enforce_profile_update_permissions、handle_new_user）：
--     這些從來不該被任何人直接呼叫，收回 PUBLIC 後不用再開給
--     任何角色——trigger 本身的觸發機制不需要呼叫端有 EXECUTE
--     權限，收回不影響 trigger 正常運作。
-- (c) get_storage_stats() / ping_heartbeat() / student_id_exists()：
--     這幾個原本就有明確的 grant to anon/authenticated，收回
--     PUBLIC 不影響現有功能，純粹補上這道防線。
-- ----------------------------------------------------------------

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

revoke execute on function public.is_member_or_admin() from public;
grant execute on function public.is_member_or_admin() to anon, authenticated;

revoke execute on function public.get_storage_stats() from public;
-- 保留原本 0016 就有的 grant to authenticated，不用重下

revoke execute on function public.ping_heartbeat() from public;
-- 保留原本 0019 就有的 grant to anon, authenticated

revoke execute on function public.student_id_exists(text) from public;
-- 保留原本 0009 就有的 grant to anon, authenticated

revoke execute on function public.enforce_equipment_update_permissions() from public;
revoke execute on function public.enforce_profile_update_permissions() from public;
revoke execute on function public.handle_new_user() from public;
-- 這三個純粹給 trigger 內部用，不重新開放給任何角色


-- ----------------------------------------------------------------
-- 3. [Warning] storage.avatars / storage.photos 允許被列出所有檔案
--
-- 已經查證 Supabase 官方文件：public bucket 透過公開網址讀取圖片
-- 完全不經過 RLS（bucket 跟 objects 兩邊都不需要任何 policy）。
-- RLS 的 select policy 只影響透過 API 呼叫 .list() / .download()
-- 這種操作。我們的程式碼從頭到尾都是直接組公開網址塞進 <img src>，
-- 沒有任何地方呼叫這兩個 API，所以可以直接把這條過寬的 policy
-- 整個拿掉，不影響任何現有功能，同時解決「可被列出全部檔名」
-- 這個資安疑慮（尤其 avatars 的路徑帶有使用者 id，被列出來等於
-- 洩漏誰有帳號）。
-- ----------------------------------------------------------------

drop policy if exists "public read photos bucket" on storage.objects;
drop policy if exists "public read avatars bucket" on storage.objects;
