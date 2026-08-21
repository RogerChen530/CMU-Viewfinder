-- ============================================================
-- 1. photos 表加 is_featured 欄位：後台可以指定一張當首頁 Hero 圖，
--    Hero 沒有指定精選圖時，前端會 fallback 抓最新一張。
-- 2. 建立 Storage bucket 供相簿真的檔案上傳使用，設定對應權限：
--    公開讀取（訪客也看得到圖片），只有 admin 能上傳/刪除。
-- ============================================================

alter table photos
  add column is_featured boolean not null default false;

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "public read photos bucket"
  on storage.objects for select
  using (bucket_id = 'photos');

create policy "admin insert photos bucket"
  on storage.objects for insert
  with check (bucket_id = 'photos' and public.is_admin());

create policy "admin delete photos bucket"
  on storage.objects for delete
  using (bucket_id = 'photos' and public.is_admin());
