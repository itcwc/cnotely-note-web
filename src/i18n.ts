import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import zhCN from './locales/zh-CN.json';

// 设置默认语言，检测用户浏览器语言或其他逻辑
const browserLocale = navigator.language;
const defaultLocale = browserLocale.startsWith('zh') ? 'zh-CN' : 'en';

const i18n = createI18n({
  locale: defaultLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    'zh': zhCN, // 添加 'zh' 作为 'zh-CN' 的别名
    'zh-CN': zhCN,
  },
});

export default i18n;
