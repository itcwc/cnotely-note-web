import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Settings from "../views/Settings.vue";
import Compile from '../views/Compile.vue';
import { i18n } from '../main'; // 导入 i18n 实例

// 扩展 Vue Router 的 RouteMeta 接口
declare module 'vue-router' {
  interface RouteMeta {
    title: string;
  }
}

// 使用 i18n 实例
const routes = [
  { path: '/settings', name: 'Settings', component: Settings },
  { path: '/', name: 'Compile', component: Compile }
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  // 使用 String() 确保 to.name 是一个字符串
  const pageTitle = i18n.global.t(`titles.${String(to.name)}`);
  if (pageTitle) {
    document.title = pageTitle;
  }
  next();
});

export default router;
