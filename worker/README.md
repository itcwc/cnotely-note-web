# Cloudflare Worker 部署指南

## 1. 安装 wrangler

```bash
npm install -g wrangler
# 或 npx wrangler
```

## 2. 登录 Cloudflare

```bash
cd worker
wrangler login
```

## 3. 设置 client_secret（加密存储，不出现在代码中）

```bash
wrangler secret put GITHUB_CLIENT_SECRET
# 粘贴你的 GitHub App Client Secret，回车
```

## 4. 部署

```bash
wrangler deploy
```

部署成功后会输出 Worker URL，格式如：
```
https://cnotely-github-oauth.<你的子域>.workers.dev
```

## 5. 配置前端

在 `note-app-web/.env.production` 中添加：

```
VITE_GITHUB_TOKEN_PROXY_URL=https://cnotely-github-oauth.<你的子域>.workers.dev/api/github/token
```

## 安全说明

- `client_secret` 存在 Cloudflare Secrets 中，加密存储
- Worker 代码可以放公开仓库，不含任何密钥
- 前端只发送 `code` + `code_verifier` + `client_id`，永远不接触 `client_secret`
- 浏览器 Network 面板看不到 `client_secret`
