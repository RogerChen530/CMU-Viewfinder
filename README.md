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

## 目前進度

- [x] 首頁視覺骨架（Hero / 器材卡片 / 相簿）
- [x] 登入頁
- [x] 註冊頁（含密碼規則：至少 10 碼、需含英文字母與數字；含學號欄位）
- [ ] Supabase 資料表 schema（equipment / photo / project）與 RLS 權限規則
- [ ] 學生證審核流程：管理員收到通知信 → 核准 → 帳號開通會員權限
- [ ] 管理員身份交接後台頁面
- [ ] 器材租借真實資料串接（目前是樣本資料）
- [ ] 相簿真實圖片串接

## 部署

透過 GitHub Actions 建置後部署到 GitHub Pages。`vite.config.js` 的 `base` 需對應到 repo 名稱或自訂網域路徑。
