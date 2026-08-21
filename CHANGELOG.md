# Changelog

CMU Viewfinder 的功能開發紀錄，依主題分類（不是逐次 commit 的流水帳）。設定/部署步驟請看 `README.md`。

## 帳號與權限

- 登入 / 註冊（Email + 密碼，密碼規則：至少 10 碼、需同時包含英文字母與數字）
- 三層權限：訪客／pending（待審核）／member／admin
- 註冊時選擇「學生」或「外部人士」身份：
  - 學生填學號，唯一性由前端 RPC 預先檢查 + 資料庫 unique constraint 雙重把關
  - 外部人士（模特兒、業界攝影師等）不用填學號，由管理員另外審核，
    具體審核方式待社團決議
- 學生證/身份審核流程：註冊時建立 pending profile，寄通知信給管理員
  （Edge Function `notify-admin`，尚未設定 Resend secrets，見下方已知限制）
- Cloudflare Turnstile 人機驗證：註冊送出前，token 會先送到
  `verify-turnstile` Edge Function 做伺服器端驗證，通過才真的呼叫
  `signUp()`。Secret Key 只存在 Edge Function 裡，不會出現在前端或 git
- 忘記密碼流程：`/forgot-password` 申請信、`/reset-password` 設新密碼
- 登出按鈕
- `/account` 個人資料維護頁：大頭照上傳（Supabase Storage）、真名、
  多個暱稱（可選要顯示哪一個，預設真名）、聯絡 Email、IG、電話
  （電話只有管理員看得到）

## 社員名單（/team）

- 開放訪客瀏覽，但欄位分層：
  - 訪客／pending：只看得到照片、名字、IG（`public_member_directory` 視圖）
  - 登入的 member/admin：額外看得到聯絡 Email（`member_directory` 視圖）
  - 兩者都看不到學號、電話——這兩個欄位在資料庫查詢層級就不曝露，
    不是前端擋一擋而已
- 空資料的顯示規則：名字沒填顯示「神秘客」，聯絡方式留白就不顯示該行，
  沒有大頭照時顯示預設空白頭像圖示，不會出現 null/undefined 字樣

## 器材租借（/equipment）

- 首頁跟 `/equipment` 都接真實 Supabase 資料
- 租借會寫入 `current_holder`、`due_date`；歸還只有持有人自己看得到
  按鈕，其他人看到「目前由其他社員借用中」
- pending 帳號看不到租借按鈕（只有 member/admin 能借），
  避免看到按鈕卻按下去被權限擋下來的困惑體驗
- 欄位層級保護：非 admin 使用者更新器材時，如果動到
  name/model/category/asset_code 這些基本資料會被 trigger 直接拒絕，
  租借相關欄位不受影響

## 相簿（/gallery）

- 真的檔案上傳（Supabase Storage，公開讀取、只有 admin 能上傳/刪除），
  仍保留貼圖片網址的選項
- 點擊照片展開燈箱：全圖 + 詳細資訊（作者、拍攝條件、創作理念）
- 首頁 Hero 動態照片：後台可指定「精選圖」，沒指定時 fallback 抓最新一張

## 消息與通知

- `/news` 公開頁面，列出所有公告歷史
- 導覽列通知鈴：顯示最近 30 天公告，未讀狀態存在瀏覽器 localStorage
  （不跨裝置同步）
- `/admin/announcements` 公告發布/刪除

## 管理後台（/admin）

- 審核申請（核准/拒絕）、社員與管理員角色調整（用於幹部交接）
- `/admin/equipment` 器材新增/編輯/刪除
- `/admin/gallery` 相簿新增/刪除
- `/admin/announcements` 公告發布/刪除

## 介面 / 其他

- 都市森林 × 清水模視覺系統（見 README 視覺方向）
- 手機版導覽列改成漢堡選單
- 「會員登入」統一改成「社員登入」
- `/team` `/projects` 分開（原本合一頁，社員名單跟專案列表拆開）
- 修正 Login/Register 頁面互相切換的連結：原本用原生 `<a href>` 會
  整頁跳轉到網域根目錄，部署到 GitHub Pages（子路徑）會 404，
  改用 React Router 的 `<Link>` 解決

## 已知限制 / 待處理

- 相簿刪除、換頭像時，Storage 裡的舊實體檔案不會自動清掉，只刪資料庫那筆
- Resend 通知信還沒真的設定 secrets／deploy，`notify-admin` 目前不會
  真的寄出信
- 管理後台「拒絕」申請只會刪 `profiles` 那筆，不會刪除背後的登入帳號
  （`auth.users`，需要 Service Role Key 才能刪，不能放前端）。
  被拒絕的人還是能登入，會卡在「審核中」畫面，admin 後台也看不到他。
  討論過的修法：改成標記 `role='rejected'` 而不是刪除——先記著，
  還沒決定要不要做
