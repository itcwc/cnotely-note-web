import { createApp } from "vue";
import App from "./App.vue";
import router from "./router"; // 引入路由
import { createI18n } from "vue-i18n";

// 动态加载语言文件
import en from "./locales/en.json";
import zhCN from "./locales/zh-CN.json";

import 'element-plus/dist/index.css'
import './assets/css/global.css';
import './assets/css/design-tokens.css';
import 'element-plus/theme-chalk/dark/css-vars.css';

// 初始化 Analytics
import { initAnalytics, updateUser as analyticsUpdateUser } from './utils/analytics-sdk.js';
import { getCurrentUser } from './utils/pkce';
const pkceUser = getCurrentUser();
initAnalytics({
  site: 'note-app',
  userId: pkceUser?.username || null,
  loginProvider: pkceUser?.provider || null,
  endpoint: import.meta.env.VITE_ANALYTICS_ENDPOINT || '/api/analytics',
});
// 暴露给全局，供 OAuthCallback 调用
window.__cnotely_analytics_updateUser = analyticsUpdateUser;

// 监听弹窗登录成功消息（popup 模式）
window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) return;
  if (event.data?.type?.endsWith('-login-success') && event.data?.user?.username) {
    analyticsUpdateUser(event.data.user.username, event.data.user.provider || event.data.type.replace('-login-success', ''));
  }
});

// 初始化主题
const savedTheme = localStorage.getItem('app-theme') || 'light';
document.documentElement.classList.add(`theme-${savedTheme}`);
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
}

const app = createApp(App);
// 创建 i18n 实例
export const i18n = createI18n({
  locale: "en", // 默认语言
  messages: {
    en, // 加载英文语言文件
    "zh-CN": zhCN, // 加载中文语言文件
  },
});

app.use(router); // 使用路由
app.use(i18n);
app.mount("#app"); // 挂载应用

// 解析来自浏览器扩展的 URL 导入（?import=1&note=<encoded JSON>）
// 数据暂存到 window.__pendingExtensionImport，待 Compile.vue 注册扩展状态后消费
(function setupUrlImport() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("import") === "1" && params.get("note")) {
      const decoded = JSON.parse(decodeURIComponent(params.get("note")!));
      (window as any).__pendingExtensionImport = decoded;
      // 立即清理 URL，避免刷新重复导入
      const u = new URL(window.location.href);
      u.searchParams.delete("import");
      u.searchParams.delete("note");
      u.searchParams.delete("from");
      window.history.replaceState({}, "", u.pathname + u.search + u.hash);
    }
  } catch (e) {
    console.error("[urlImport] parse failed:", e);
  }
})();
