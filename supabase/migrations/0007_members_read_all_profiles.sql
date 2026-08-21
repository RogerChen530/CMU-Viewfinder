-- ============================================================
-- 開放「社員名單」功能：讓 member/admin 能看到所有社員的
-- profiles（之前只能看自己的，或 admin 看全部）。
-- 這是為了新增的社員列表頁面。
-- ============================================================

create policy "members read all profiles"
  on profiles for select
  using (is_member_or_admin());
