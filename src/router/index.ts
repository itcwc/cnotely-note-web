import { createRouter, createWebHistory } from "vue-router";
import Settings from "../views/Settings.vue";
import Compile from '../views/Compile.vue';
import OAuthCallback from '../views/OAuthCallback.vue';
import NotFound from '../views/NotFound.vue';
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
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  if (to.name) {
    const pageTitle = i18n.global.t(`titles.${String(to.name)}`);
    // i18n.global.t 返回 key 本身说明翻译不存在，不应设为标题
    if (pageTitle && pageTitle !== `titles.${String(to.name)}`) {
      document.title = pageTitle;
    } else {
      document.title = 'cnotely';
    }
  } else {
    document.title = 'cnotely';
  }
  next();
});

export default router;
