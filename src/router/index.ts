import { createRouter, createWebHistory } from "vue-router";
import Settings from "../views/Settings.vue";
import Compile from '../views/Compile.vue';
import OAuthCallback from '../views/OAuthCallback.vue';
import { i18n } from '../main';

// 扩展 Vue Router 的 RouteMeta 接口
declare module 'vue-router' {
  interface RouteMeta {
    title: string;
  }
}

const routes = [
  { path: '/', name: 'Compile', component: Compile },
  { path: '/settings', name: 'Settings', component: Settings },
  { path: '/google-callback', name: 'GoogleCallback', component: OAuthCallback },
  { path: '/github-callback', name: 'GitHubCallback', component: OAuthCallback },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const pageTitle = i18n.global.t(`titles.${String(to.name)}`);
  if (pageTitle) {
    document.title = pageTitle;
  }
  next();
});

export default router;
