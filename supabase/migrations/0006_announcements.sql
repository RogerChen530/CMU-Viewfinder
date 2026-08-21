-- ============================================================
-- 公告 / 社團動態
-- 用途：首頁「新消息」跟導覽列的通知鈴都從這張表讀資料。
-- 設計成公開可讀（訪客也看得到，有助於招生宣傳），
-- 只有 admin 能發布/編輯/刪除。
-- ============================================================

create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

alter table announcements enable row level security;

create policy "anyone reads announcements"
  on announcements for select
  using (true);

create policy "admin manages announcements insert"
  on announcements for insert
  with check (is_admin());

create policy "admin manages announcements update"
  on announcements for update
  using (is_admin());

create policy "admin manages announcements delete"
  on announcements for delete
  using (is_admin());

grant select on public.announcements to anon, authenticated;
grant insert, update, delete on public.announcements to authenticated;
