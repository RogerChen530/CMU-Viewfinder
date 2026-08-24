-- ============================================================
-- 管理後台「拒絕」申請，之前是直接刪除 profiles 那筆，會留下
-- 殭屍帳號（auth.users 還在，但 profiles 沒了，那個人會卡在
-- pending 畫面、admin 後台也看不到他，沒人能再處理）。
--
-- 修法：拒絕改成把 role 標記成 'rejected'，不刪除。這樣：
-- - admin 後台留得住紀錄，看得到誰被拒絕過
-- - 萬一拒絕錯了，可以一鍵改回 pending 重新審核
-- - 被拒絕的人登入後，前端會顯示明確的拒絕訊息，不會誤導成
--   還在審核中
-- ============================================================

alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('pending', 'member', 'admin', 'rejected'));
