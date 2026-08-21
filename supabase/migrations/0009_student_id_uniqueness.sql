-- ============================================================
-- 學號唯一性檢查
--
-- 1. profiles.student_id 加上 unique constraint，資料庫層面保底。
-- 2. handle_new_user() trigger 補上友善的錯誤訊息（不然使用者
--    只會看到 Postgres 原始的 constraint violation 訊息）。
-- 3. 新增 student_id_exists() RPC，讓前端在送出註冊表單「之前」
--    就能先問資料庫這個學號有沒有被用過，不用等 signUp 失敗才
--    知道。security definer，只回傳布林值，不會洩漏其他個資。
-- ============================================================

alter table profiles
  add constraint profiles_student_id_unique unique (student_id);

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
exception
  when unique_violation then
    raise exception '此學號已經註冊過，請確認學號是否正確';
end;
$$;

create or replace function public.student_id_exists(sid text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from profiles where student_id = sid);
$$;

grant execute on function public.student_id_exists(text) to anon, authenticated;
