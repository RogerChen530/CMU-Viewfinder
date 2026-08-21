# CMU Viewfinder

中國醫藥大學攝影社官網。Vite + React + Tailwind + Supabase。

## 視覺方向
都市森林 × 清水模。色票與字體定義在 `tailwind.config.js`：
- `paper` `concrete` `seam` `ash` `ink` `moss` `moss.deep`
- `font-display` = Fraunces（標題）／`font-sans` = Inter（內文）／`font-mono` = IBM Plex Mono（EXIF 風格技術標籤）

## 本地開發

```bash
npm install
cp .env.example .env.local   # 填入你的 Supabase 專案 URL 與 anon key
npm run dev
```

## Supabase 設定步驟

**1. 建立 Supabase 專案**
- 到 [supabase.com](https://supabase.com) 用 GitHub 帳號登入，免費方案即可
- New Project → 取名字（例如 `cmu-viewfinder`）→ 選新加坡或東京節點（離台灣近，延遲較低）→ 記下設定的資料庫密碼
- 建立完成後，到 Project Settings → API，複製 `Project URL` 跟 `anon public` key

**2. 填入本地環境變數**
```bash
cp .env.example .env.local
# 把剛剛複製的兩個值貼進去
```

**3. 安裝 Supabase CLI 並套用 schema**
```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref   # project-ref 在 Supabase 後台 URL 裡看得到
supabase db push                                 # 把 supabase/migrations/ 的 schema 推上去
```

**4. 設定 Edge Function 的環境變數（寄審核通知信用）**
```bash
supabase secrets set RESEND_API_KEY=你的resend key
supabase secrets set ADMIN_EMAIL=你要收審核信的信箱
supabase functions deploy notify-admin
```

**5. 手動把自己升級成 admin**
第一個帳號註冊完，role 預設是 `pending`。去 Supabase 後台 Table Editor → `profiles` 表，把自己那筆的 `role` 手動改成 `admin`，之後就能透過後台審核其他人、或未來做的管理頁面來交接。

## 目前進度

- [x] 首頁視覺骨架（Hero / 器材卡片 / 相簿）
- [x] 登入頁
- [x] 註冊頁（含密碼規則：至少 10 碼、需含英文字母與數字；含學號欄位）
- [x] Supabase 資料表 schema（profiles / equipment / photo / project）與 RLS 權限規則
- [x] 學生證審核流程：註冊時寫入 pending profile + 寄通知信給管理員（Edge Function）
- [ ] 管理員審核/交接後台頁面（目前用 Supabase Table Editor 手動審，之後可以做成網站內的頁面）
- [ ] 器材租借真實資料串接（目前是樣本資料，equipment 表已就緒）
- [ ] 相簿真實圖片串接（photos 表已就緒）

## 部署

透過 GitHub Actions 建置後部署到 GitHub Pages。`vite.config.js` 的 `base` 需對應到 repo 名稱或自訂網域路徑。
