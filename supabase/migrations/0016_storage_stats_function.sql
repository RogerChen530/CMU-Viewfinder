-- ============================================================
-- 容量統計，給管理後台的儲存空間讀條用。
--
-- 不用 Supabase Management API（那把 token 權限等同整個帳號，
-- 風險太高），改成直接問 Postgres 自己：
-- - 資料庫大小：pg_database_size() 內建函式
-- - Storage 各 bucket 用量：storage.objects 表本身就記錄每個
--   檔案的大小(metadata->>'size')，加總分組即可
-- ============================================================

create or replace function public.get_storage_stats()
returns table (
  database_bytes bigint,
  photos_bytes bigint,
  avatars_bytes bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception '只有管理員能查詢儲存空間統計';
  end if;

  return query
  select
    pg_database_size(current_database()) as database_bytes,
    coalesce(
      (select sum((metadata->>'size')::bigint) from storage.objects where bucket_id = 'photos'),
      0
    ) as photos_bytes,
    coalesce(
      (select sum((metadata->>'size')::bigint) from storage.objects where bucket_id = 'avatars'),
      0
    ) as avatars_bytes;
end;
$$;

grant execute on function public.get_storage_stats() to authenticated;
