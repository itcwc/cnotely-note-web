import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import {
  isLoggedIn as checkLoggedIn,
  getCurrentUser,
  logout as oauthLogout,
  type UserInfo,
} from "../../utils/pkce";

// 定义状态类型
interface State {
  isLoggedIn: any;
  userInfo: any;
  selectedPlatform: any;
  userMenuRef: any;
}

// 状态对象，将在 Compile.vue 中设置
let state: State | null = null;
let t: any = null;
let router: any = null;

// 设置状态
export const setUserState = (s: State, i18n: any, r: any) => {
  state = s;
  t = i18n;
  router = r;
};

// 打开设置
const handleSettings = () => {
  router.push("/settings");
};

// 初始化用户信息
const initUserInfo = () => {
  if (!state) return;

  if (checkLoggedIn()) {
    const user = getCurrentUser();
    if (user) {
      state.userInfo.value = {
        email: user.email,
        avatar: user.avatar,
        nickname: user.name,
        access_token: localStorage.getItem("access_token") || "",
        default_storage_provider: user.provider,
      };
      state.isLoggedIn.value = true;
      state.selectedPlatform.value =
        localStorage.getItem("selected_platform") || user.provider || "";
    }
  } else {
    state.isLoggedIn.value = false;
  }
};

// 处理头像点击 — 跳转设置页
const handleAvatarClick = () => {
  if (!state) return;
  router.push("/settings");
};

// 处理退出登录
const handleLogout = () => {
  if (!state || !t) return;

  oauthLogout();

  // 重置用户状态
  state.isLoggedIn.value = false;
  state.userInfo.value = {
    email: "",
    avatar: "",
    nickname: "",
    access_token: "",
    default_storage_provider: "",
  };

  // 关闭菜单
  if (state.userMenuRef.value) {
    state.userMenuRef.value.hide();
  }

  ElMessage.success(t("compile_view.logout_success"));
};

// 处理登录/退出登录按钮点击
const handleLoginLogout = () => {
  if (!state) return;

  if (state.isLoggedIn.value) {
    handleLogout();
  } else {
    // 跳转设置页登录
    router.push("/settings");
  }
};

export {
  handleSettings,
  initUserInfo,
  handleAvatarClick,
  handleLogout,
  handleLoginLogout,
};
