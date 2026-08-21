-- ============================================================
-- CMU Viewfinder — 初始 schema
-- 三層權限：guest（未登入） / member（審核通過的社員） / admin（管理員）
-- ============================================================

-- ---------- profiles ----------
-- 延伸 auth.users，多存學號與角色。
-- 註冊當下 role 預設 'pending'，要管理員審核學生證後才手動改成 'member'。
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  student_id text not null,
  role text not null default 'pending' check (role in ('pending', 'member', 'admin')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- 使用者能看到自己的 profile
create policy "read own profile"
  on profiles for select
  using (auth.uid() = id);

-- admin 能看到所有 profile（審核用）
create policy "admin reads all profiles"
  on profiles for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- admin 能更新任何人的角色（審核通過 / 交接管理員）
create policy "admin updates roles"
  on profiles for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- 新使用者註冊時允許自己 insert 一筆 pending 的 profile
create policy "self insert on signup"
  on profiles for insert
  with check (auth.uid() = id);


-- ---------- helper functions ----------
-- 判斷目前登入者是否為 member 或 admin（用來寫 equipment/projects 的 RLS）
create or replace function is_member_or_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('member', 'admin')
  );
$$;

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;


-- ---------- equipment ----------
create table equipment (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  asset_code text not null unique,
  category text not null,
  model text not null,
  status text not null default 'available' check (status in ('available', 'rented')),
  current_holder uuid references profiles(id),
  due_date date,
  image_url text,
  created_at timestamptz not null default now()
);

alter table equipment enable row level security;

-- 訪客也能看器材目錄（瀏覽不用登入）
create policy "anyone reads equipment"
  on equipment for select
  using (true);

-- 只有 member/admin 能借還（更新 status）
create policy "members update equipment"
  on equipment for update
  using (is_member_or_admin());

-- 只有 admin 能新增/刪除器材
create policy "admin inserts equipment"
  on equipment for insert
  with check (is_admin());

create policy "admin deletes equipment"
  on equipment for delete
  using (is_admin());


-- ---------- photos（相簿）----------
create table photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  exif text,
  uploaded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

alter table photos enable row level security;

-- 相簿公開瀏覽，訪客也看得到
create policy "anyone reads photos"
  on photos for select
  using (true);

create policy "admin manages photos insert"
  on photos for insert
  with check (is_admin());

create policy "admin manages photos update"
  on photos for update
  using (is_admin());

create policy "admin manages photos delete"
  on photos for delete
  using (is_admin());


-- ---------- projects（社員 teamwork hub）----------
create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

alter table projects enable row level security;

-- 只有 member/admin 看得到專案版，訪客完全看不到
create policy "members read projects"
  on projects for select
  using (is_member_or_admin());

create policy "admin manages projects insert"
  on projects for insert
  with check (is_admin());

create policy "admin manages projects update"
  on projects for update
  using (is_admin());

create policy "admin manages projects delete"
  on projects for delete
  using (is_admin());
