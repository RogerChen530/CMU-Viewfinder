-- ============================================================
-- 個人資料維護功能
--
-- 新增欄位：
-- - avatar_url：大頭照
-- - real_name：真名
-- - nicknames：暱稱陣列（可以有多個）
-- - display_name：目前選擇要顯示的名字（真名或某個暱稱），
--   由社員自己在個人資料頁選擇，預設是真名
-- - ig_id / phone / contact_email：聯絡方式
--
-- 權限設計重點：
-- 「社員列表」頁面只能看到 avatar/name/ig/email，看不到電話跟學號。
-- 用一個 view 限制欄位範圍，不能只靠前端「不顯示」來擋，因為
-- RLS 是列層級不是欄位層級，如果社員對 profiles 整張表有 SELECT
-- 權限，電話號碼還是能被直接查表挖出來。
-- ============================================================

alter table profiles
  add column avatar_url text,
  add column real_name text,
  add column nicknames text[] not null default '{}',
  add column display_name text,
  add column ig_id text,
  add column phone text,
  add column contact_email text;

-- 收回原本過寬的「member 可讀全部 profiles」規則，
-- 這條規則會讓一般社員直接查表就看到別人的電話/學號。
drop policy if exists "members read all profiles" on profiles;

-- 社員名單專用的安全視圖，只曝露列表頁需要的欄位。
-- View 的 owner 是建表的角色（在 Supabase 是 postgres，
-- 是 superuser，會跳過 profiles 的 RLS），所以視圖本身
-- 定義了「只有 member/admin 能查到資料」這件事，
-- 不是靠 RLS，而是直接把資格判斷寫進 where 條件。
create view member_directory as
select
  id,
  avatar_url,
  real_name,
  display_name,
  nicknames,
  ig_id,
  contact_email,
  role,
  created_at
from profiles
where role in ('member', 'admin')
  and is_member_or_admin();

grant select on member_directory to authenticated;

-- 開放社員自己編輯自己的 profile（大頭照、真名、暱稱、聯絡方式）。
-- role 跟 student_id 不能透過這條規則被改，靠底下的 trigger 擋。
create policy "update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.enforce_profile_update_permissions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    if new.role is distinct from old.role then
      raise exception '只有管理員能修改角色';
    end if;
    if new.student_id is distinct from old.student_id then
      raise exception '學號不可自行修改';
    end if;
  end if;
  return new;
end;
$$;

create trigger enforce_profile_update
  before update on profiles
  for each row execute procedure public.enforce_profile_update_permissions();
