/**
 * Cloudflare Pages Function — Google OAuth token 交换代理
 * 
 * 生产环境：前端 POST /api/google/token
 * → 此函数补上 client_secret 后转发给 Google
 * → client_secret 存在 Cloudflare Pages 环境变量里，不进前端代码
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  const clientSecret = env.GOOGLE_CLIENT_SECRET;

  if (!clientSecret) {
    return new Response(JSON.stringify({ error: "server_error", error_description: "GOOGLE_CLIENT_SECRET 未设置" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.text();
  const params = new URLSearchParams(body);
  params.set("client_secret", clientSecret);

  const googleRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: params.toString(),
  });

  const data = await googleRes.json();

  return new Response(JSON.stringify(data), {
    status: googleRes.status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
