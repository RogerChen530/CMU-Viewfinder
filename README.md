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

## Cloudflare Turnstile 設定步驟（註冊防機器人）

**1. Site Key 放進本地開發環境**
`.env.local` 加一行：
```
VITE_TURNSTILE_SITE_KEY=你的site_key
```

**2. Secret Key 只透過 CLI 設定，絕對不要寫進任何檔案**
```bash
supabase secrets set TURNSTILE_SECRET_KEY=你的secret_key
supabase functions deploy verify-turnstile
```

**3. 正式部署也要加這個 Secret**
去 repo 的 Settings → Secrets and variables → Actions，新增一筆：
- `VITE_TURNSTILE_SITE_KEY`

（Site Key 是公開的，可以放心當 GitHub Secret；Secret Key 完全不會出現在前端或 CI，只存在 Supabase Edge Function 裡）

## 功能與開發紀錄

完整的功能清單、開發歷史、已知限制，都放在 [`CHANGELOG.md`](./CHANGELOG.md)。這份 README 只放「怎麼把專案跑起來、怎麼部署」。

## 部署

透過 GitHub Actions 建置後部署到 GitHub Pages。`vite.config.js` 的 `base` 只在 `npm run build`（正式建置）時套用 `/CMU-Viewfinder/`，本地開發維持根目錄。

**1. 在 repo 設定 Secrets**（Settings → Secrets and variables → Actions → New repository secret）：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

跟你 `.env.local` 裡的值一樣，這樣建置時才能把 Supabase 連線資訊打包進靜態網頁。

**2. 開啟 GitHub Pages**（Settings → Pages）：
- Source 選 **GitHub Actions**（不是 "Deploy from a branch"）

**3. push 到 main 就會自動部署**
`.github/workflows/deploy.yml` 監聽 `main` 分支的 push，自動建置並發布。第一次設定完 Secrets 跟 Pages Source 後，可以去 repo 的 Actions 分頁手動觸發一次（workflow 右側有 "Run workflow" 按鈕），或者隨便 push 一個小改動觸發它。

**4. 確認網址**
部署成功後，網站網址會是 `https://rogerchen530.github.io/CMU-Viewfinder/`，可以在 repo 的 Settings → Pages 頁面上方看到這個連結。

**關於前端路由 404 的處理**：GitHub Pages 是純靜態主機，不懂 `/team`、`/gallery` 這種 React Router 的前端路由，直接訪問這些網址或重新整理會 404。Workflow 裡會自動把 `index.html` 複製成 `404.html`，讓 GitHub Pages 對任何未知路徑都回傳同一份內容，由瀏覽器端的 React Router 接手判斷要顯示哪一頁。
