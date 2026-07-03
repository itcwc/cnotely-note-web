/**
 * cnotely Analytics SDK
 *
 * 使用方式：
 *   import { initAnalytics, track } from './analytics-sdk.js'
 *
 *   // 初始化（在 app 启动时调用一次）
 *   initAnalytics({ site: 'note-app' })
 *
 *   // 追踪自定义事件
 *   track('card_created', { cardType: 'markdown', size: 'large' })
 */

const STORAGE_KEY_ANON_ID = '__cnotely_analytics_anon_id';
const STORAGE_KEY_SESSION = '__cnotely_analytics_session';

let _config = null;
let _anonymousId = null;
let _sessionId = null;

/** 生成 UUID v4 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

/** 获取或创建匿名 ID */
function getAnonymousId() {
  if (_anonymousId) return _anonymousId;
  let id = localStorage.getItem(STORAGE_KEY_ANON_ID);
  if (!id) {
    id = generateUUID();
    localStorage.setItem(STORAGE_KEY_ANON_ID, id);
  }
  _anonymousId = id;
  return id;
}

/** 获取或创建会话 ID（页面刷新后重置） */
function getSessionId() {
  if (_sessionId) return _sessionId;
  // 会话 ID 存在 sessionStorage，页面关闭即失效
  let id = sessionStorage.getItem(STORAGE_KEY_SESSION);
  if (!id) {
    id = generateUUID();
    sessionStorage.setItem(STORAGE_KEY_SESSION, id);
  }
  _sessionId = id;
  return id;
}

/**
 * 初始化 analytics
 * @param {Object} config
 * @param {string} config.site - 'note-app' | 'card-app'
 * @param {string} [config.endpoint] - analytics worker 地址，默认同域 /api/analytics
 * @param {string} [config.userId] - 已登录用户名（可选，登录后调用 updateUser）
 * @param {string} [config.loginProvider] - 'github' | 'google'
 */
function initAnalytics(config) {
  _config = {
    endpoint: '/api/analytics',
    ...config,
  };

  // 自动发送 page_view 事件
  track('page_view', {
    path: location.pathname,
    title: document.title,
  });

  // SPA 路由变化时自动追踪
  if (typeof window !== 'undefined' && window.addEventListener) {
    // 监听 popstate（SPA 路由变化）
    window.addEventListener('popstate', () => {
      track('page_view', { path: location.pathname, title: document.title });
    });
  }

  return { track, updateUser, getAnonymousId: getAnonymousId };
}

/**
 * 更新已登录用户信息（登录成功后调用）
 */
function updateUser(userId, provider) {
  if (!_config) return;
  _config.userId = userId;
  _config.loginProvider = provider;

  // 发送 identify 事件
  track('identify', { user_id: userId, login_provider: provider });
}

/**
 * 发送埋点事件
 * @param {string} eventType
 * @param {Object} [metadata] - 额外数据
 */
async function track(eventType, metadata = {}) {
  if (!_config) return;

  try {
    const payload = {
      event_type: eventType,
      user_id: _config.userId || null,
      anonymous_id: getAnonymousId(),
      session_id: getSessionId(),
      site: _config.site,
      metadata: metadata || null,
      referrer: document.referrer || null,
    };

    // 使用 sendBeacon 保证页面关闭时也能发送
    const endpoint = _config.endpoint + '/event';
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, blob);
    } else {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {}); // 静默失败
    }
  } catch {
    // 静默失败，不影响主流程
  }
}

export { initAnalytics, track, updateUser };
