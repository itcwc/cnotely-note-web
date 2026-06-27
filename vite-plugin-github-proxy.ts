/**
 * Vite 插件：开发环境下将 /api/github/token 转发到 GitHub
 *
 * 开发模式：从 .env 读取 GITHUB_CLIENT_SECRET，自动追加到请求体
 * （因为 GitHub Web 授权流要求 client_secret，即使使用了 PKCE）
 *
 * client_secret 只存在本地 .env 文件中（已 gitignore），不会进入前端代码
 *
 * 支持通过 HTTP 代理中转（国内网络）：
 *   在 .env.development 中设置 VITE_HTTP_PROXY=http://127.0.0.1:7890
 */
import type { Plugin } from 'vite';
import https from 'node:https';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { loadEnv } from 'vite';
import { resolve } from 'path';

const ROOT = resolve(__dirname);

// ── 代理解析 ──────────────────────────────────────────────

function getProxyAgent(): HttpsProxyAgent<string> | undefined {
  const env = {
    ...process.env,
    ...loadEnv('development', ROOT, ''),
    ...loadEnv('', ROOT, ''),
  };
  const raw = env.VITE_HTTP_PROXY || env.HTTPS_PROXY || env.HTTP_PROXY;
  if (!raw) return undefined;
  try {
    const url = raw.includes('://') ? raw : `http://${raw}`;
    console.log('[GhProxy] 使用代理:', url);
    return new HttpsProxyAgent(url);
  } catch (e) {
    console.warn('[GhProxy] 代理地址解析失败，将直连:', raw, e);
    return undefined;
  }
}

/** 从 .env 读取 GITHUB_CLIENT_SECRET */
function getClientSecret(): string | undefined {
  const env = {
    ...loadEnv('development', ROOT, ''),
    ...loadEnv('', ROOT, ''),
  };
  const secret = env.GITHUB_CLIENT_SECRET || env.VITE_GITHUB_CLIENT_SECRET;
  if (!secret) {
    console.warn('[GhProxy] ⚠️ 未配置 GITHUB_CLIENT_SECRET，请在 .env.development 中设置');
  }
  return secret;
}

// ── 核心请求 ──────────────────────────────────────────────

function sendTokenRequest(
  body: string,
  agent: HttpsProxyAgent<string> | undefined,
): Promise<{ status: number; contentType: string; body: string }> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'github.com',
        path: '/login/oauth/access_token',
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
          'User-Agent': 'cnotely-dev/1.0',
        },
        agent,
        timeout: 20_000,
      },
      (ghRes) => {
        let data = '';
        ghRes.on('data', (chunk: Buffer) => { data += chunk.toString(); });
        ghRes.on('end', () =>
          resolve({
            status: ghRes.statusCode ?? 200,
            contentType: (ghRes.headers['content-type'] as string) ?? 'application/json',
            body: data,
          }),
        );
        ghRes.on('error', reject);
      },
    );

    req.once('timeout', () => {
      req.destroy(new Error('GITHUB_TIMEOUT'));
    });
    req.once('error', reject);

    req.write(body);
    req.end();
  });
}

// ── Vite 插件 ─────────────────────────────────────────────

export function githubOAuthProxy(): Plugin {
  return {
    name: 'github-oauth-proxy',
    configureServer(server) {
      const agent = getProxyAgent();
      if (!agent) {
        console.log('[GhProxy] 直连模式（未配置 VITE_HTTP_PROXY）');
      }

      server.middlewares.use('/api/github/token', (req, res, _next) => {
        if (req.method !== 'POST') {
          res.writeHead(405);
          res.end('Method Not Allowed');
          return;
        }

        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });

        req.on('end', async () => {
          let responded = false;
          const reply = (status: number, payload: string, ct = 'application/json') => {
            if (responded) return;
            responded = true;
            res.writeHead(status, {
              'Content-Type': ct,
              'Access-Control-Allow-Origin': '*',
            });
            res.end(payload);
          };

          try {
            // 解析前端传来的 body，补上 client_secret
            const params = new URLSearchParams(body);
            const clientSecret = getClientSecret();

            if (clientSecret) {
              params.set('client_secret', clientSecret);
            }

            const forwardBody = params.toString();
            console.log('[GhProxy] 转发 token 请求（含 client_secret，PKCE mode）');
            console.log('[GhProxy] client_id=', params.get('client_id'));

            const result = await sendTokenRequest(forwardBody, agent);
            console.log('[GhProxy] status=', result.status);
            reply(result.status, result.body, result.contentType);
          } catch (err: any) {
            const isTimeout = err?.message === 'GITHUB_TIMEOUT';
            console.error('[GhProxy] 失败:', err?.message);
            const payload = JSON.stringify(
              isTimeout
                ? { error: 'timeout', error_description: '连接 GitHub 超时，请检查代理配置是否正常' }
                : { error: 'proxy_error', error_description: err?.message ?? '未知错误' },
            );
            reply(isTimeout ? 504 : 502, payload);
          }
        });
      });
    },
  };
}
