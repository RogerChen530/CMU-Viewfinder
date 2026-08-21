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
- [x] 管理後台：/admin（審核申請、社員/管理員角色）、/admin/equipment（器材增刪改）、
  /admin/gallery（相簿新增/刪除，目前是貼圖片網址，還沒做真的檔案上傳）、
  /admin/announcements（公告發布/刪除）
- [x] 首頁 / 器材頁 / 相簿頁改接真實 Supabase 資料
- [x] /news 消息頁（公開，列出所有公告；通知鈴只顯示近 30 天，這裡是完整列表）
- [x] /team 改為社員名單（原本顯示專案的內容搬到 /projects）
- [x] /projects 專案頁（member/admin 限定，同原本 /team 的權限邏輯）
- [x] 管理連結文字從「管理後台」改成「管理」
- [x] 公告功能 + 導覽列通知鈴（顯示最近 30 天公告，未讀狀態存在瀏覽器 localStorage，不跨裝置同步）
- [x] 首頁 Hero 動態照片：後台可指定「精選圖」，沒指定時 fallback 抓最新一張
- [x] 相簿真的檔案上傳（Supabase Storage，公開讀取、只有 admin 能上傳/刪除），
  仍保留貼圖片網址的選項（外部連結、或先傳到別的圖床再貼連結時可用）
- [x] 器材租借按鈕真的動作：租借會寫入 current_holder/due_date，
  歸還只有持有人自己看得到按鈕（其他人看到的是「目前由其他社員借用中」）
- [x] 登出按鈕
- [x] 忘記密碼流程：/forgot-password 申請信、/reset-password 設新密碼
- [x] 學號唯一性：前端送出前先用 RPC 檢查給友善錯誤訊息，
  資料庫也加了 unique constraint 保底，兩層都會擋
- [x] equipment 欄位層級保護：改用 trigger，非 admin 更新器材時
  如果動到 name/model/category/asset_code 會直接被拒絕，
  租借相關欄位（status/current_holder/due_date）不受影響
- [x] /account 個人資料維護頁：大頭照上傳、真名、多個暱稱(可選要顯示哪個，預設真名)、
  聯絡 Email、IG、電話。電話只有管理員看得到，社員名單不會顯示
- [x] /team 社員名單改顯示大頭照/名字/Email/IG，改抓 member_directory
  這個安全視圖，不會曝露學號跟電話（避免一般社員直接查表挖出敏感資料）
- [x] 空資料的顯示規則：名字沒填顯示「神秘客」、聯絡方式留白就不顯示該行，
  沒有大頭照時顯示預設空白頭像圖示，都不會出現 null/undefined 字樣
- [x] 相簿燈箱：點擊照片展開全圖 + 詳細資訊（作者、拍攝條件、創作理念），
  首頁跟 /gallery 都有，/admin/gallery 新增照片時可以填作者跟創作理念
- [ ] 相簿刪除時沒有一併清掉 Storage 裡的實體檔案（只刪資料庫那筆），
  頭像也是同樣狀況（換新大頭照，舊檔案不會自動清掉）
- [ ] Resend 通知信還沒真的設定 secrets／deploy（notify-admin function 還沒接上真實 API key）

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
