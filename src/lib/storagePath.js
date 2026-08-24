// 從 Supabase Storage 的公開網址反推出 bucket 內的檔案路徑，
// 這樣才能呼叫 storage.remove() 真的刪掉實體檔案，而不是只刪
// 資料庫那筆紀錄。
//
// 公開網址格式固定是：
//   https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
//
// 如果 URL 不是這個 bucket 底下的檔案（例如貼的是外部圖床連結），
// 回傳 null，呼叫端應該跳過刪除動作。
export function extractStoragePath(url, bucket) {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}
