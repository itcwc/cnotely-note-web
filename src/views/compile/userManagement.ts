import { ElMessage } from "element-plus";
import { authApi } from "../../api/auth";
import { useRouter } from "vue-router";

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
  
  const savedUserInfo = localStorage.getItem("user_info");
  if (savedUserInfo) {
    try {
      const parsedUserInfo = JSON.parse(savedUserInfo);
      state.userInfo.value = parsedUserInfo;
      state.isLoggedIn.value = true;
      // 更新选中的平台
      state.selectedPlatform.value = localStorage.getItem("selected_platform") ||
        state.userInfo.value.default_storage_provider ||
        "";
      // console.log('用户已登录:', state.userInfo.value)
    } catch (error) {
      console.error("解析用户信息失败:", error);
      state.isLoggedIn.value = false;
      console.log("解析用户信息失败，用户未登录");
    }
  } else {
    // console.log("未找到用户信息，用户未登录");
  }
  // console.log('当前登录状态:', state.isLoggedIn.value)
};

// 处理头像点击
const handleAvatarClick = () => {
  if (!state) return;
  
  if (!state.isLoggedIn.value) {
    // 未登录，跳转到登录页面
    router.push("/login");
  } else {
    // 已登录，跳转到个人中心页面
    router.push("/profile/account");
  }
};

// 处理退出登录
const handleLogout = async () => {
  if (!state || !t) return;
  
  try {
    // 调用后端退出登录接口
    await authApi.logout();
  } catch (error) {
    console.error("退出登录失败:", error);
  } finally {
    // 清除本地存储的用户信息
    localStorage.removeItem("user_info");
    localStorage.removeItem("access_token");

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

    // 显示退出成功消息
    ElMessage.success(t("compile_view.logout_success"));

    // 跳转到登录页面
    router.push("/login");
  }
};

// 处理登录/退出登录按钮点击
const handleLoginLogout = () => {
  if (!state) return;
  
  console.log("登录/退出登录按钮点击，当前登录状态:", state.isLoggedIn.value);
  if (state.isLoggedIn.value) {
    handleLogout();
  } else {
    router.push("/login");
  }
};

export {
  handleSettings,
  initUserInfo,
  handleAvatarClick,
  handleLogout,
  handleLoginLogout,
};
