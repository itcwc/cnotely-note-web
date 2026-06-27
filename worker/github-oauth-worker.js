/**
 * Cloudflare Worker: GitHub OAuth Token 代理
 *
 * 职责：接收前端发来的 code + code_verifier + client_id，
 * 补上 client_secret（存在 Worker Secrets 里，前端看不到），
 * 转发给 GitHub token 端点，返回结果。
 *
 * client_secret 永远不会出现在前端代码或浏览器 Network 面板中。
 *
 * 部署：
 *   wrangler deploy
 *   wrangler secret put GITHUB_CLIENT_SECRET
 */

export default {
  async fetch(request, env) {
    // 处理 CORS 预检
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    if (request.method !== 'POST') {
      return json(405, { error: 'method_not_allowed' });
    }

    try {
      const body = await request.text();
      const params = new URLSearchParams(body);

      // 前端传来的参数
      const client_id = params.get('client_id');
      const code = params.get('code');
      const redirect_uri = params.get('redirect_uri');
      const code_verifier = params.get('code_verifier');
      const grant_type = params.get('grant_type') || 'authorization_code';

      if (!client_id || !code) {
        return json(400, { error: 'missing_params', error_description: 'client_id and code are required' });
      }

      // 补上 client_secret（从 Worker Secrets 读取，前端看不到）
      const forwardParams = new URLSearchParams({
        client_id,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        grant_type,
      });

      if (redirect_uri) forwardParams.set('redirect_uri', redirect_uri);
      if (code_verifier) forwardParams.set('code_verifier', code_verifier);

      // 转发给 GitHub
      const ghRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'cnotely-worker/1.0',
        },
        body: forwardParams,
      });

      const ghText = await ghRes.text();

      return new Response(ghText, {
        status: ghRes.status,
        headers: {
          'Content-Type': ghRes.headers.get('content-type') || 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    } catch (err) {
      return json(502, {
        error: 'proxy_error',
        error_description: err?.message || '未知错误',
      });
    }
  },
};

// ── 工具函数 ──────────────────────────────────────────

function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
