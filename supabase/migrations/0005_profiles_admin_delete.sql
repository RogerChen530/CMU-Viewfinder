-- ============================================================
-- 補上 profiles 表的刪除權限
-- 管理員審核頁「拒絕」某筆待審申請時，需要能刪除該筆 profile。
-- ============================================================

create policy "admin deletes profiles"
  on profiles for delete
  using (is_admin());

grant delete on public.profiles to authenticated;
