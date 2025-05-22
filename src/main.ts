import { createApp } from "vue";
import App from "./App.vue";
import router from "./router"; // 引入路由
import { createI18n } from "vue-i18n";

// 动态加载语言文件
import en from "./locales/en.json";
import zhCN from "./locales/zh-CN.json";

import 'element-plus/dist/index.css'
import './assets/css/global.css';
import 'element-plus/theme-chalk/dark/css-vars.css';

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
