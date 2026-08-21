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

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ success: false, error: "缺少驗證 token" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
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
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
