import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Editor from "../views/Editor.vue";
import Sync from "../views/Sync.vue";
import Settings from "../views/Settings.vue";
// import CNHome from "../views/zh-CN/Home.vue";
import Register from "../views/Register.vue";
import ForgotPassword from '../views/ForgotPassword.vue';
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
  // { path: '/', name: 'Home', component: Home },
  // { path: '/editor', name: 'Editor', component: Editor },
  // { path: '/sync', name: 'Sync', component: Sync },
  { path: '/settings', name: 'Settings', component: Settings },
  // { path: '/login', name: 'Login', component: Login },
  // { path: '/register', name: 'Register', component: Register },
  // { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPassword },
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
