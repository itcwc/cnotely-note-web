/**
 * PKCE (Proof Key for Code Exchange) 工具
 * 纯前端 GitHub / Google OAuth 认证，无需后端
 */

// ============ PKCE 核心函数 ============

/** 生成随机 code_verifier（43-128 字符的随机字符串） */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/** 根据 code_verifier 生成 code_challenge（S256 方法） */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
}

/** 生成随机 state（防 CSRF） */
export function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/** Base64URL 编码（无 padding） */
function base64UrlEncode(bytes: Uint8Array): string {
  const str = btoa(String.fromCharCode(...bytes));
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ============ PKCE 状态存取 ============

const PKCE_STORAGE_KEY = "pkce_state";

interface PkceState {
  verifier: string;
  state: string;
  provider: "github" | "google";
}

/** 保存 PKCE 状态到 sessionStorage */
export function savePkceState(verifier: string, state: string, provider: "github" | "google"): void {
  const pkceState: PkceState = { verifier, state, provider };
  sessionStorage.setItem(PKCE_STORAGE_KEY, JSON.stringify(pkceState));
}

/** 读取并清除 PKCE 状态 */
export function getAndClearPkceState(): PkceState | null {
  const raw = sessionStorage.getItem(PKCE_STORAGE_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(PKCE_STORAGE_KEY);
  try {
    return JSON.parse(raw) as PkceState;
  } catch {
    return null;
  }
}

// ============ 登录入口 ============

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * GitHub token 交换端点。
 *
 * - 开发环境：走 Vite proxy（/api/github/token）→ 代理自动补 client_secret
 * - 生产环境：走 Cloudflare Worker（VITE_GITHUB_TOKEN_PROXY_URL）→ Worker 补 client_secret
 *
 * 两种模式下 client_secret 都不会出现在前端代码或浏览器 Network 面板中。
 */
const GITHUB_TOKEN_URL =
  import.meta.env.VITE_GITHUB_TOKEN_PROXY_URL || "/api/github/token";

/**
 * Google token 交换端点。
 *
 * - 开发环境：走 Vite proxy（/api/google/token）→ 代理自动补 client_secret
 * - 生产环境：走 Cloudflare Worker（VITE_GOOGLE_TOKEN_PROXY_URL）→ Worker 补 client_secret
 */
const GOOGLE_TOKEN_URL =
  import.meta.env.VITE_GOOGLE_TOKEN_PROXY_URL || "/api/google/token";

/** GitHub PKCE 登录：生成 verifier → 跳转授权页 */
export async function loginWithGitHub(): Promise<void> {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateState();
  const redirectUri = `${window.location.origin}/github-callback`;

  savePkceState(verifier, state, "github");

  // const params = new URLSearchParams({
  //   client_id: GITHUB_CLIENT_ID,
  //   redirect_uri: redirectUri,
  //   scope: "read:user user:email repo",
  //   state,
  //   code_challenge: challenge,
  //   code_challenge_method: "S256",
  // });

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "read:user user:email",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  window.location.href = `https://github.com/login/oauth/authorize?${params}`;
}

/** Google PKCE 登录：生成 verifier → 跳转授权页 */
export async function loginWithGoogle(): Promise<void> {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateState();
  const redirectUri = `${window.location.origin}/google-callback`;

  // 调试日志
  console.log("[Google OAuth] 发起登录", {
    redirectUri,
    scope: "openid email profile https://www.googleapis.com/auth/drive.file",
    clientId: GOOGLE_CLIENT_ID ? `${GOOGLE_CLIENT_ID.slice(0, 8)}...` : "(空)",
  });

  savePkceState(verifier, state, "google");

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile https://www.googleapis.com/auth/drive.file",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    access_type: "offline",
    prompt: "consent",
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  console.log("[Google OAuth] 跳转授权页:", authUrl);

  window.location.href = authUrl;
}

// ============ 回调处理 ============

interface OAuthResult {
  provider: "github" | "google";
  accessToken: string;
  refreshToken?: string;
  user: UserInfo;
}

export interface UserInfo {
  id: number | string;
  name: string;
  email: string;
  avatar: string;
  provider: "github" | "google";
}

/** 处理 OAuth 回调：code + verifier → 换 token → 获取用户信息 */
export async function handleOAuthCallback(code: string, state: string): Promise<OAuthResult> {
  console.log("[OAuth 回调] 开始处理", { provider: "unknown yet", code: `${code.slice(0, 8)}...` });

  const pkceState = getAndClearPkceState();
  if (!pkceState) {
    throw new Error("PKCE 状态不存在，请重新登录");
  }

  console.log("[OAuth 回调] PKCE 状态已读取", { provider: pkceState.provider });

  // 验证 state 防 CSRF
  if (state !== pkceState.state) {
    throw new Error("State 校验失败，请重新登录");
  }

  const { verifier, provider } = pkceState;

  // 用 code + verifier 换 access_token
  let tokenResponse: TokenResponse;
  if (provider === "github") {
    tokenResponse = await exchangeGitHubCode(code, verifier);
  } else {
    tokenResponse = await exchangeGoogleCode(code, verifier);
  }

  console.log("[OAuth 回调] Token 获取成功", { provider, hasAccessToken: !!tokenResponse.accessToken });

  // 获取用户信息
  const user = await fetchUserInfo(provider, tokenResponse.accessToken);

  // 存储到 localStorage
  localStorage.setItem("access_token", tokenResponse.accessToken);
  if (tokenResponse.refreshToken) {
    localStorage.setItem("refresh_token", tokenResponse.refreshToken);
  }
  localStorage.setItem("oauth_provider", provider);
  localStorage.setItem("user_info", JSON.stringify(user));

  return {
    provider,
    accessToken: tokenResponse.accessToken,
    refreshToken: tokenResponse.refreshToken,
    user,
  };
}

interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
}

/** GitHub: code → access_token */
async function exchangeGitHubCode(code: string, verifier: string): Promise<TokenResponse> {
  const redirectUri = `${window.location.origin}/github-callback`;

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
    grant_type: "authorization_code",
  });

  const res = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub token 交换失败: ${res.status} ${text}`);
  }

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error_description || data.error);
  }

  return { accessToken: data.access_token };
}

/** Google: code → access_token + refresh_token */
async function exchangeGoogleCode(code: string, verifier: string): Promise<TokenResponse> {
  const redirectUri = `${window.location.origin}/google-callback`;

  console.log("[Google OAuth] 开始交换 token", {
    redirectUri,
    codePreview: `${code.slice(0, 8)}...`,
    verifierPreview: `${verifier.slice(0, 8)}...`,
  });

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    code,
    code_verifier: verifier,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });

  console.log("[Google OAuth] token 请求参数", Object.fromEntries(params));

  console.log("[Google OAuth] 发送 token 请求", {
    url: GOOGLE_TOKEN_URL,
    redirectUri,
    codePreview: `${code.slice(0, 8)}...`,
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: params,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[Google OAuth] token 交换失败", {
      status: res.status,
      statusText: res.statusText,
      response: text,
    });
    throw new Error(`Google token 交换失败: ${res.status} ${text}`);
  }

  const data = await res.json();
  if (data.error) {
    console.error("[Google OAuth] token 响应错误", data);
    throw new Error(data.error_description || data.error);
  }

  console.log("[Google OAuth] token 交换成功", {
    hasAccessToken: !!data.access_token,
    hasRefreshToken: !!data.refresh_token,
  });

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
}

/** 获取用户信息（直接调 provider API） */
export async function fetchUserInfo(provider: "github" | "google", accessToken: string): Promise<UserInfo> {
  if (provider === "github") {
    return fetchGitHubUserInfo(accessToken);
  }
  return fetchGoogleUserInfo(accessToken);
}

/** GitHub 用户信息 */
async function fetchGitHubUserInfo(accessToken: string): Promise<UserInfo> {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!res.ok) throw new Error(`获取 GitHub 用户信息失败: ${res.status}`);
  const data = await res.json();

  // GitHub 可能没有公开邮箱，需要单独获取
  let email = data.email;
  if (!email) {
    const emailRes = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });
    if (emailRes.ok) {
      const emails = await emailRes.json();
      const primary = emails.find((e: any) => e.primary);
      email = primary?.email || emails[0]?.email || "";
    }
  }

  return {
    id: data.id,
    name: data.name || data.login,
    email: email || "",
    avatar: data.avatar_url,
    provider: "github",
  };
}

/** Google 用户信息 */
async function fetchGoogleUserInfo(accessToken: string): Promise<UserInfo> {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error(`获取 Google 用户信息失败: ${res.status}`);
  const data = await res.json();

  console.log("[Google OAuth] 用户信息原始返回", {
    hasId: !!data.id,
    name: data.name,
    email: data.email,
    picture: data.picture,  // 关键：打印头像 URL
    raw: data,
  });

  // Google 头像 URL 处理
  let avatar = data.picture || "";
  
  if (avatar) {
    // Google 头像 URL 格式：https://lh3.googleusercontent.com/a/...=s96-c
    // 去掉尺寸参数获取高清图（=s400 表示 400x400）
    avatar = avatar.replace(/=s\d+(-c)?/, "=s400-c");
    console.log("[Google OAuth] 头像 URL 处理后:", avatar);
  } else {
    console.warn("[Google OAuth] ⚠️ Google 未返回头像 URL，将使用默认头像");
  }

  const userInfo: UserInfo = {
    id: data.id,
    name: data.name,
    email: data.email,
    avatar,
    provider: "google",
  };
  
  console.log("[Google OAuth] 用户信息已构建:", userInfo);

  return userInfo;
}

// ============ 登出 ============

/** 清除所有认证相关 localStorage */
export function logout(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("oauth_provider");
  localStorage.removeItem("user_info");
  localStorage.removeItem("selected_platform");
}

// ============ 状态检查 ============

/** 检查是否已登录 */
export function isLoggedIn(): boolean {
  return localStorage.getItem("access_token") !== null && localStorage.getItem("user_info") !== null;
}

/** 获取当前用户信息 */
export function getCurrentUser(): UserInfo | null {
  const raw = localStorage.getItem("user_info");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserInfo;
  } catch {
    return null;
  }
}

/** 获取当前 access_token */
export function getAccessToken(): string | null {
  return localStorage.getItem("access_token");
}

/** Google token 刷新 */
export async function refreshGoogleToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return null;

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!res.ok) return null;

  const data = await res.json();
  if (data.error) return null;

  localStorage.setItem("access_token", data.access_token);
  return data.access_token;
}
