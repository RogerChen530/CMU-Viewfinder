// supabase/functions/verify-turnstile/index.ts
//
// 註冊表單送出前，前端先呼叫這支 function 確認 Turnstile 驗證有通過，
// 通過才繼續走 signUp。Secret Key 只存在這裡（伺服器端），
// 不會出現在任何前端程式碼或 git repo 裡。
//
// 部署：supabase functions deploy verify-turnstile
// 需要設定的 secret：
//   supabase secrets set TURNSTILE_SECRET_KEY=你的secret_key

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// 瀏覽器從 GitHub Pages（跟這支 function 不同網域）打過來之前，
// 會先送一個 OPTIONS 預檢請求問「你允許我跨網域打你嗎」。
// 沒有這組標頭，瀏覽器會直接把請求擋下來，連 function 本體的
// 程式碼都不會被執行到——這不是哪個瀏覽器特有的問題，是所有
// 瀏覽器都會擋，這裡漏寫過一次，之前一直沒發現。
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ success: false, error: "缺少驗證 token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const secretKey = Deno.env.get("TURNSTILE_SECRET_KEY");

    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: secretKey ?? "",
        response: token,
      }),
    });

    const result = await verifyRes.json();

    return new Response(JSON.stringify({ success: result.success === true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
