-- ============================================================
-- 保活機制：Supabase 免費方案連續 7 天沒有資料庫活動會自動暫停
-- 專案（資料不會消失，但需要人工手動 restore）。這張表加一個
-- 函式，讓 GitHub Actions 排程定期呼叫，做一次真的寫入動作
-- （UPDATE），維持專案被判定為「活躍」。
--
-- 只用來記錄「最後一次被戳的時間」，沒有其他用途，只有一筆資料。
-- ============================================================

create table heartbeat (
  id boolean primary key default true,
  pinged_at timestamptz not null default now(),
  constraint heartbeat_singleton check (id = true)
);

alter table heartbeat enable row level security;
-- 故意不開放任何直接查表的 policy，外部只能透過下面這個函式碰它。

insert into heartbeat (id, pinged_at) values (true, now());

create or replace function public.ping_heartbeat()
returns void
language sql
security definer
set search_path = public
as $$
  update heartbeat set pinged_at = now() where id = true;
$$;

grant execute on function public.ping_heartbeat() to anon, authenticated;
