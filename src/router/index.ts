import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Settings from "../views/Settings.vue";
import Compile from '../views/Compile.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import ForgotPassword from '../views/ForgotPassword.vue';
import ProfileCenter from '../views/ProfileCenter.vue';
import OAuthCallback from '../views/OAuthCallback.vue';
import PrivacyPolicy from '../views/PrivacyPolicy.vue';
import TermsOfService from '../views/TermsOfService.vue';
import { i18n } from '../main'; // 导入 i18n 实例

// 扩展 Vue Router 的 RouteMeta 接口
declare module 'vue-router' {
  interface RouteMeta {
    title: string;
  }
}

// 使用 i18n 实例
const routes = [
  { path: '/', name: 'Compile', component: Compile },
  { path: '/settings', name: 'Settings', component: Settings },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPassword },
  { 
    path: '/profile', 
    name: 'ProfileCenter', 
    component: ProfileCenter,
    children: [
      { path: 'account', name: 'ProfileAccount', component: ProfileCenter },
      { path: 'password', name: 'ProfilePassword', component: ProfileCenter },
      { path: 'personal', name: 'ProfilePersonal', component: ProfileCenter },
      { path: 'editor', name: 'ProfileEditor', component: ProfileCenter },
      { path: 'security', name: 'ProfileSecurity', component: ProfileCenter },
      { path: 'notification', name: 'ProfileNotification', component: ProfileCenter }
    ]
  },
  { path: '/google-callback', name: 'GoogleCallback', component: OAuthCallback },
  { path: '/github-callback', name: 'GitHubCallback', component: OAuthCallback },
  { path: '/privacy-policy', name: 'PrivacyPolicy', component: PrivacyPolicy },
  { path: '/terms-of-service', name: 'TermsOfService', component: TermsOfService }
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

  // 检查用户是否已登录
  const isLoggedIn = localStorage.getItem('user_info') !== null;
  
  // 允许访问回调页面，不受登录状态限制
  if (to.path === '/google-callback' || to.path === '/github-callback') {
    next();
    return;
  }
  
  // 如果已登录，且访问的是登录或注册页面，重定向到首页
  if (isLoggedIn && (to.path === '/login' || to.path === '/register')) {
    next('/');
  }
  // 如果未登录，且访问的是个人中心页面，重定向到登录页面
  else if (!isLoggedIn && to.path.startsWith('/profile')) {
    next('/login');
  }
  else {
    next();
  }
});

export default router;
