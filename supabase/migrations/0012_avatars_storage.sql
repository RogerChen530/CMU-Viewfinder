-- ============================================================
-- 大頭照 Storage bucket。
-- 檔案路徑規定要是 {使用者 id}/xxx 這種格式，這樣才能用資料夾
-- 名稱是不是等於自己的 auth.uid() 來判斷「這是不是本人的檔案」。
-- ============================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "public read avatars bucket"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "user manages own avatar insert"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "user manages own avatar update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "user manages own avatar delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
