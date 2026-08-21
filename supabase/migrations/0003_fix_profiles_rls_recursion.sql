-- ============================================================
-- 修正：profiles 表的 admin policy 造成 RLS 無限遞迴
--
-- 問題：0001_init.sql 裡 "admin reads all profiles" 跟
-- "admin updates roles" 這兩條規則，檢查「目前使用者是不是
-- admin」的方法是直接對 profiles 自己下 subquery：
--
--   exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
--
-- 但這個 subquery 本身又會被 profiles 的 RLS 規則檢查一次，
-- 導致無限遞迴，Postgres 會直接讓查詢失敗
-- （infinite recursion detected in policy for relation "profiles"）。
--
-- 結果：任何人查詢自己的 profile 都會連帶觸發這條壞掉的 admin
-- policy 被一併求值，導致整個 select 失敗，前端拿到的 data 是
-- undefined，程式碼預設當成 pending —— 不管資料庫裡實際的
-- role 是什麼，畫面永遠顯示審核中。
--
-- 修法：跟 equipment/photos/projects 一樣，改用 is_admin()
-- 這個 security definer 函式。Supabase 裡函式的 owner 是
-- postgres（superuser），執行時會直接跳過 RLS，不會遞迴。
-- ============================================================

drop policy if exists "admin reads all profiles" on profiles;
create policy "admin reads all profiles"
  on profiles for select
  using (is_admin());

drop policy if exists "admin updates roles" on profiles;
create policy "admin updates roles"
  on profiles for update
  using (is_admin());
