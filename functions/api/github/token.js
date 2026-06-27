/**
 * Cloudflare Pages Function — GitHub OAuth token 交换代理
 * 
 * 生产环境：前端 POST /api/github/token
 * → 此函数补上 client_secret 后转发给 GitHub
 * → client_secret 存在 Cloudflare Pages 环境变量里，不进前端代码
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  // 读取环境变量（在 Cloudflare Dashboard → Pages → Settings → Environment variables 里设置）
  const clientSecret = env.GITHUB_CLIENT_SECRET;

  if (!clientSecret) {
    return new Response(JSON.stringify({ error: "server_error", error_description: "GITHUB_CLIENT_SECRET 未设置" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 读取前端发来的 body（code、code_verifier、redirect_uri 等）
  const body = await request.text();

  // 追加 client_secret
  const params = new URLSearchParams(body);
  params.set("client_secret", clientSecret);

  // 转发给 GitHub
  const githubRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: params.toString(),
  });

  const data = await githubRes.json();

  return new Response(JSON.stringify(data), {
    status: githubRes.status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
