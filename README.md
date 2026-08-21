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
- [ ] 相簿真的檔案上傳（Supabase Storage），現在只能貼網址
- [ ] 器材租借按鈕還沒接上真的 update（按下去沒有動作）
- [ ] 登出按鈕
- [ ] 忘記密碼流程
- [ ] 學號唯一性檢查（目前同一個學號可以重複註冊）
- [ ] 已知權限缺口：equipment 的 RLS 目前讓任何 member 都能 update 整筆資料
  （原本設計是給租借狀態切換用），理論上一般社員也能透過 API 改器材名稱/型號，
  之後應該用欄位層級的 GRANT 限制只有 admin 能改名稱等基本資料

## 部署

透過 GitHub Actions 建置後部署到 GitHub Pages。`vite.config.js` 的 `base` 需對應到 repo 名稱或自訂網域路徑。
