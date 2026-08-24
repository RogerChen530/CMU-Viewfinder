// supabase/functions/notify-admin/index.ts
//
// 註冊流程呼叫這支 function，寄信通知管理員有新的學生證審核申請。
// 沿用你在純沂網站的 Resend 經驗，這裡一樣用 Resend API 寄信。
//
// 部署：supabase functions deploy notify-admin
// 需要設定的 secret：
//   supabase secrets set RESEND_API_KEY=your_resend_key
//   supabase secrets set ADMIN_EMAIL=admin@example.com

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// 同一個問題：瀏覽器跨網域打這支 function 之前會先送 OPTIONS
// 預檢請求，沒有這組標頭會被瀏覽器直接擋下來，不分瀏覽器種類。
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
    const { email, studentId } = await req.json();

    if (!email || !studentId) {
      return new Response(JSON.stringify({ error: "缺少 email 或 studentId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_EMAIL");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CMU Viewfinder <onboarding@resend.dev>",
        to: [adminEmail],
        subject: "新社員審核申請",
        html: `
          <p>有新的社團加入申請待審核：</p>
          <ul>
            <li>Email：${email}</li>
            <li>學號：${studentId}</li>
          </ul>
          <p>請至 Supabase 後台的 profiles 資料表，將該使用者的 role 從 pending 改為 member。</p>
        `,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(JSON.stringify({ error: "寄信失敗", detail: text }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
