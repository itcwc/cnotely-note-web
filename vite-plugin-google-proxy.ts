/**
 * Vite 插件：开发环境下将 /api/google/token 转发到 Google
 *
 * 开发模式：从 .env 读取 GOOGLE_CLIENT_SECRET，自动追加到请求体
 * client_secret 只存在本地 .env 文件中（已 gitignore），不会进入前端代码
 *
 * 支持通过 HTTP 代理中转（国内网络）：
 *   在 .env 中设置 VITE_HTTP_PROXY=http://127.0.0.1:7899
 */
import type { Plugin } from 'vite';
import https from 'node:https';
import { loadEnv } from 'vite';
import { resolve } from 'path';
import { HttpsProxyAgent } from 'https-proxy-agent';

const ROOT = resolve(__dirname);

/** 从 .env 读取 GOOGLE_CLIENT_SECRET */
function getClientSecret(): string | undefined {
  const env = {
    ...loadEnv('development', ROOT, ''),
    ...loadEnv('', ROOT, ''),
  };
  return env.GOOGLE_CLIENT_SECRET || env.VITE_GOOGLE_CLIENT_SECRET;
}

/** 读取代理配置 */
function getProxyUrl(): string | undefined {
  const env = {
    ...process.env,
    ...loadEnv('development', ROOT, ''),
    ...loadEnv('', ROOT, ''),
  };
  return env.VITE_HTTP_PROXY || env.HTTPS_PROXY || env.HTTP_PROXY;
}

// ── Vite 插件 ─────────────────────────────────────────────

export function googleOAuthProxy(): Plugin {
  return {
    name: 'google-oauth-proxy',
    configureServer(server) {
      const proxyUrl = getProxyUrl();
      if (proxyUrl) {
        console.log('[GoogleProxy] 代理模式:', proxyUrl);
      } else {
        console.log('[GoogleProxy] 直连模式（未配置 VITE_HTTP_PROXY）');
      }

      server.middlewares.use('/api/google/token', async (req, res, _next) => {
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

            if (!clientSecret) {
              console.error('[GoogleProxy] ⚠️ 未配置 GOOGLE_CLIENT_SECRET');
              reply(500, JSON.stringify({
                error: 'config_error',
                error_description: '未配置 GOOGLE_CLIENT_SECRET，请在 .env 中设置'
              }));
              return;
            }

            params.set('client_secret', clientSecret);
            const forwardBody = params.toString();

            console.log('[GoogleProxy] 转发 token 请求到 Google');
            console.log('[GoogleProxy] client_id=', params.get('client_id')?.substring(0, 8) + '...');

            // 构建请求选项
            const options: https.RequestOptions = {
              hostname: 'oauth2.googleapis.com',
              path: '/token',
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(forwardBody),
                'User-Agent': 'cnotely-dev/1.0',
              },
              timeout: 20_000,
            };

            // 如果配置了代理，使用 HttpsProxyAgent
            if (proxyUrl) {
              try {
                const agent = new HttpsProxyAgent(proxyUrl);
                options.agent = agent;
                console.log('[GoogleProxy] 使用代理:', proxyUrl);
              } catch (e: any) {
                console.warn('[GoogleProxy] 代理初始化失败，将直连:', e?.message);
              }
            }

            // 发送请求到 Google
            const result = await new Promise<{ status: number; contentType: string; body: string }>((resolve, reject) => {
              const req = https.request(options, (ghRes) => {
                let data = '';
                ghRes.on('data', (chunk: Buffer) => { data += chunk.toString(); });
                ghRes.on('end', () =>
                  resolve({
                    status: ghRes.statusCode ?? 200,
                    contentType: (ghRes.headers['content-type'] as string) ?? 'application/json',
                    body: data,
                  })
                );
                ghRes.on('error', reject);
              });

              req.once('timeout', () => {
                req.destroy(new Error('GOOGLE_TIMEOUT'));
              });
              req.once('error', reject);

              req.write(forwardBody);
              req.end();
            });

            console.log('[GoogleProxy] Google 返回 status=', result.status);

            if (result.status !== 200) {
              console.error('[GoogleProxy] Google 错误响应:', result.body);
            }

            reply(result.status, result.body, result.contentType);
          } catch (err: any) {
            const isTimeout = err?.message === 'GOOGLE_TIMEOUT';
            console.error('[GoogleProxy] 失败:', err?.message);
            const payload = JSON.stringify(
              isTimeout
                ? { error: 'timeout', error_description: '连接 Google 超时，请检查代理配置是否正常' }
                : { error: 'proxy_error', error_description: err?.message ?? '未知错误' },
            );
            reply(isTimeout ? 504 : 502, payload);
          }
        });
      });
    },
  };
}
