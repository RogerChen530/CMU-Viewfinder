# Changelog

CMU Viewfinder 的功能開發紀錄。設定/部署步驟請看 `README.md`。

## 帳號與權限

- 登入 / 註冊（Email + 密碼，密碼規則：至少 10 碼、需同時包含英文字母與數字）
- 三層權限：訪客／pending（待審核）／member／admin
- 註冊時選擇「學生」或「外部人士」身份：
  - 學生填學號，唯一性由前端 RPC 預先檢查 + 資料庫 unique constraint 雙重把關
  - 外部人士（模特兒、業界攝影師等）不用填學號，由管理員另外審核，
    具體審核方式待社團決議
- 學生證/身份審核流程：註冊時建立 pending profile，寄通知信給管理員
  （Edge Function `notify-admin`，尚未設定 Resend secrets，見下方已知限制）
- Cloudflare Turnstile 人機驗證：註冊跟登入表單都有，共用同一組
  widget（同網域下可以重複用，不用分開申請）。token 送到
  `verify-turnstile` Edge Function 做伺服器端驗證，通過才真的呼叫
  `signUp()` / `signInWithPassword()`。Secret Key 只存在 Edge
  Function 裡，不會出現在前端或 git
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
- 可以編輯已上傳的照片（標題、拍攝資訊、作者、創作理念，也能換圖），
  不用刪掉重傳
- 刪除照片、換新圖時會一併清掉 Storage 裡的舊實體檔案，不會留下
  孤兒檔案佔用容量（個人資料頁換大頭照也是同樣邏輯，確定新檔案
  存檔成功後才清舊的，避免存檔前離開頁面導致頭像顯示不出來）
- 點擊照片展開燈箱：全圖 + 詳細資訊（作者、拍攝條件、創作理念）
- 首頁 Hero 動態照片：後台可指定「精選圖」，沒指定時 fallback 抓最新一張
- 首頁「Gallery」區塊（原「近期作品」）最多顯示 6 張，精選圖優先，
  不夠 6 張的話用最新上傳的補滿
- `/admin/gallery` 篩選/排序控制：可選顯示筆數、上傳時間範圍篩選、
  依上傳時間／作者／名稱排序（中文用拼音排序近似注音順序、日文用
  日文地區排序規則近似五十音、英文照字母排序——這是 Unicode 排序
  技術的合理近似，純漢字姓名沒有標注讀音時無法保證跟五十音順序
  100% 一致）

## 消息與通知

- `/news` 公開頁面，列出所有公告歷史
- 導覽列通知鈴：顯示最近 30 天公告，未讀狀態存在瀏覽器 localStorage
  （不跨裝置同步）
- `/admin/announcements` 公告發布/刪除

## 管理後台（/admin）

- 審核申請（核准/拒絕）、社員與管理員角色調整（用於幹部交接）。
  拒絕改成標記 `role='rejected'`，不再直接刪除 profiles——後台留得住
  紀錄，能看到「已拒絕」清單，拒絕錯了可以一鍵「重新開放審核」
  送回待審核；被拒絕的人登入後會看到明確的拒絕訊息，不會誤導成
  還在審核中
- `/admin/equipment` 器材新增/編輯/刪除
- `/admin/gallery` 相簿新增/刪除
- `/admin/announcements` 公告發布/刪除
- `/admin/storage` 容量顯示頁：仿 macOS 磁碟空間那種分色讀條，
  分別顯示資料庫（500MB 上限）跟檔案儲存空間（1GB 上限，拆相簿/
  大頭照兩段）目前用量。數字即時查詢 Postgres 自己算出來
  （pg_database_size + storage.objects 加總），不是走 Supabase
  Management API（那把 token 權限等同整個帳號，風險太高，特意
  避開）

## 介面 / 其他

- 都市森林 × 清水模視覺系統（見 README 視覺方向）
- 手機版導覽列改成漢堡選單
- 「會員登入」統一改成「社員登入」
- `/team` `/projects` 分開（原本合一頁，社員名單跟專案列表拆開）
- 修正 Login/Register 頁面互相切換的連結：原本用原生 `<a href>` 會
  整頁跳轉到網域根目錄，部署到 GitHub Pages（子路徑）會 404，
  改用 React Router 的 `<Link>` 解決
- Supabase 免費方案保活：`.github/workflows/keepalive.yml` 排程每週
  戳兩次資料庫，防止連續 7 天沒活動被自動暫停（細節見 README）
- 修正 `verify-turnstile`、`notify-admin` 兩支 Edge Function 都缺
  CORS 標頭：瀏覽器從 GitHub Pages 跨網域呼叫 Supabase Function
  前會先送 OPTIONS 預檢請求，沒有 `Access-Control-Allow-Origin`
  標頭會被瀏覽器直接擋下來，不分瀏覽器種類（一開始在 Safari 上
  發現，一度誤以為是 Safari 相容性問題，後來在 Edge 測試才確認
  是 CORS 設定漏掉，兩支 function 都補上）
- 修正 Supabase Security Advisor（後台安全掃描工具，不會主動通知，
  要自己進去看）抓出的問題：`heartbeat` 表補上明確的拒絕存取
  policy（原本是故意鎖死但沒寫 policy，被誤判成錯誤）；`is_admin()`
  等函式收回預設開放給 `PUBLIC` 的執行權限，只留給真的需要的
  `anon`／`authenticated`；`storage.avatars`／`storage.photos` 拿掉
  過寬的 select policy——已查證公開網址讀圖完全不經過這條 RLS，
  拿掉不影響顯示，同時解決「檔名可被列出」的疑慮。`member_directory`
  那個 Security Definer View 的 ERROR 提示，審視後判定是設計上
  故意如此、風險可控，決定不修（改寫成函式雖然能消除這則報告，
  但除了報告好看沒有實質安全性提升，卻有機率動壞現在正常運作的
  功能，不符合效益）

## 動畫

全站只用 Tailwind 內建的 transition 與自訂 keyframes，沒有加任何動畫
套件。所有動畫都尊重系統的「減少動態效果」設定，而且只動
`opacity`／`transform`，不觸發版面重排。

- 相簿格子 hover 時照片 300ms 放大到 1.03 倍（Home 與 Gallery 共用的
  `GalleryFrame`）。注意 `ease-out` 也要加 `motion-safe:` 前綴，否則會被
  `motion-safe:transition-transform` 內建的緩動曲線蓋掉
- `tailwind.config.js` 定義 `fade-in`／`fade-out`（只有透明度）與
  `lb-in`／`lb-out`（透明度加縮放），進場 200ms、退場 150ms
- 燈箱（`PhotoLightbox`）進退場動畫：背景遮罩淡入淡出、中間面板縮放
  淡入淡出；Esc、點背景、關閉按鈕都會先播退場再關閉。燈箱開著時鎖住
  背景捲動，並用 padding 補回捲軸寬度，避免 Windows 上版面左右跳。
  `PhotoLightbox` 從頁面載入起就一直掛著（沒選照片時只是不輸出畫面），
  修改時要以 `photo` 是否為 null 判斷開關，細節見元件內註解

## 已知限制 / 待處理

- **一般人收不到註冊驗證信與重設密碼信**：Supabase 內建寄信只寄給
  專案團隊成員的信箱，而且每小時上限 2 封，必須設定自訂 SMTP 才能
  正式上線。正在討論的兩個方向：
  - 買自有網域，在 Resend 驗證網域後當作 SMTP
  - 不買網域，直接用社團 Gmail（`smtp.gmail.com`）加應用程式密碼當
    SMTP。社團信箱要先開兩步驟驗證；改密碼或關閉兩步驟驗證會讓
    應用程式密碼失效，交接換密碼後要重新產生並填回 Supabase
  兩種都只要在 Supabase 後台設定，網站程式碼不用改
- **新註冊通知信還不會寄出**：`notify-admin` 走的是 Resend 的 API，
  不經過上面的 SMTP 設定，還需要 `RESEND_API_KEY`、`ADMIN_EMAIL`
  兩組 secrets。API key 由持有人自己用 `supabase secrets set` 設定，
  不要貼到任何對話、檔案或 issue 裡。Resend 沒有驗證網域時只能寄到
  帳號本身的信箱，能不能寄到社團信箱要實際測試
- 圖片儲存空間策略未定：目前上傳的照片/頭像都是原檔直接存，沒有
  壓縮，容量會撐得比想像快。討論過方向（前端上傳前壓縮／升級
  Supabase 付費方案／改用 Cloudflare R2），等跟社團討論出結果
  再處理
- 已修正忘記密碼連結指向錯誤網址：`redirectTo` 用 `window.location.origin`
  組出來的網址不含 `/CMU-Viewfinder/` 這段 GitHub Pages 子路徑，
  補上 `import.meta.env.BASE_URL` 才對。Supabase 後台
  Authentication → URL Configuration 也已設定：
  - **Site URL**：`https://rogerchen530.github.io/CMU-Viewfinder/`
  - **Redirect URLs**：`https://rogerchen530.github.io/CMU-Viewfinder/**`
    與 `http://localhost:5173/**`
  repo 轉移後網址會改變，這兩項要跟著改，否則驗證信與重設密碼連結
  會導向舊網址，出現 `otp_expired`／`access_denied` 這類錯誤。
  忘記密碼功能目前仍受上面的寄信限制，一般人收不到信
- 首頁 Hero 的「瀏覽相簿」「加入社團」是 `<span>`，沒有連結，點了
  沒有反應，應改成 React Router 的 `<Link>`
- 相簿格子是可點擊的 `div`，鍵盤無法 focus 也無法打開燈箱
- Supabase Security Advisor 還有三項警告未審視：Auth RLS
  Initialization Plan、Multiple Permissive Policies、Leaked Password
  Protection Disabled
