-- ============================================================
-- 社員列表開放給訪客瀏覽，但欄位要分層：
-- - 訪客(未登入)：只看得到照片、名字、IG
-- - 登入的 member/admin：維持原本規格，多看到聯絡 Email
--
-- 做法：另外開一個不含 contact_email 的公開視圖，任何人（含 anon）
-- 都能查；原本的 member_directory（含 email）維持只給
-- member/admin，前端依登入狀態決定要查哪一個。
-- ============================================================

create view public_member_directory as
select
  id,
  avatar_url,
  real_name,
  display_name,
  nicknames,
  ig_id,
  role,
  created_at
from profiles
where role in ('member', 'admin');

grant select on public_member_directory to anon, authenticated;
