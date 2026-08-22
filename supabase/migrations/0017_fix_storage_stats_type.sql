-- ============================================================
-- 修正 get_storage_stats() 的型別錯誤：
-- Postgres 的 SUM() 加總 bigint 欄位，回傳型別是 numeric，
-- 不是 bigint（這是 Postgres 本身的固定行為，不是我們寫錯
-- SQL 邏輯）。函式宣告的欄位型別是 bigint，跟查詢實際跑出來
-- 的 numeric 對不上，導致 structure of query does not match
-- function result type 這個錯誤。
--
-- 修法：把 sum(...) 的結果整個轉型成 bigint 再拿去跟 0 取
-- coalesce，這樣型別從頭到尾都是 bigint，不會再對不上。
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
      (select sum((metadata->>'size')::bigint) from storage.objects where bucket_id = 'photos')::bigint,
      0::bigint
    ) as photos_bytes,
    coalesce(
      (select sum((metadata->>'size')::bigint) from storage.objects where bucket_id = 'avatars')::bigint,
      0::bigint
    ) as avatars_bytes;
end;
$$;
