-- ============================================================
-- 修正：註冊流程的 profile 建立改由資料庫 trigger 自動處理
--
-- 問題：Supabase 預設 email signUp() 之後，使用者要等驗證信點擊完成
-- 才會真正取得登入 session。如果前端在 signUp() 成功後馬上手動
-- insert profiles，這時 auth.uid() 其實還是 null（還沒登入），
-- 會被 profiles 的 RLS 規則擋下來，靜默失敗，使用者以為註冊成功
-- 但資料庫完全沒有他的 profile。
--
-- 解法：改用 trigger，在 auth.users 新增一筆使用者的當下，
-- 由資料庫自己（security definer，跳過 RLS）建立對應 profile，
-- 不依賴前端當下的登入狀態。這是 Supabase 官方建議的標準模式。
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, student_id)
  values (new.id, new.raw_user_meta_data ->> 'student_id');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 前端不再需要自己 insert profiles 了，這條 policy 留著也無妨（trigger 用
-- security definer 會跳過 RLS），但已經不是必要路徑，保留作為防呆。
