<template>
  <div class="profile-center-container">
    <!-- 主要内容区 -->
    <div class="main-content">
      <!-- 左侧用户信息和导航 -->
      <div class="left-sidebar">
        <!-- 用户头像 -->
        <div class="user-avatar-section">
          <!-- 判断userInfo.avatar是否为颜色值 -->
          <template v-if="isColorValue(userInfo.avatar)">
            <!-- 是颜色值，显示文字头像加背景色 -->
            <el-avatar :size="50" :style="{ backgroundColor: userInfo.avatar }">
              {{ userInfo.nickname ? userInfo.nickname.slice(0, 2) : "U" }}
            </el-avatar>
          </template>
          <template v-else>
            <!-- 不是颜色值，显示图片链接 -->
            <el-avatar :size="50" :src="userInfo.avatar">
              {{ userInfo.nickname ? userInfo.nickname.slice(0, 2) : "U" }}
            </el-avatar>
          </template>
          <div class="user-name">{{ userInfo.nickname }}</div>
          <div class="user-email">{{ userInfo.email }}</div>
          <el-divider style="margin: 10px 0" />
          <el-button type="text" class="logout-btn" @click="handleLogout">
            <logout
              class="user-icon"
              fill="#409EFF"
              theme="outline"
              size="16"
              :strokeWidth="3"
            />
            <span style="margin-left: 5px">{{ t("compile_view.logout") }}</span>
          </el-button>
        </div>

        <!-- 导航分隔线 -->
        <el-divider style="margin: 20px 0" />

        <!-- 导航菜单 -->
        <div class="nav-menu">
          <el-menu
            :default-active="activeNavItem"
            class="profile-nav-menu"
            router
            @select="handleNavSelect"
          >
            <el-menu-item index="/profile/account">
              <template #title>
                <el-icon>
                  <Setting />
                </el-icon>
                <span>{{ t("account_settings.title") }}</span>
              </template>
            </el-menu-item>

            <el-menu-item index="/profile/password">
              <template #title>
                <el-icon>
                  <Lock />
                </el-icon>
                <span>{{ t("account_settings.profile_password") }}</span>
              </template>
            </el-menu-item>

            <el-menu-item index="/profile/editor">
              <template #title>
                <el-icon>
                  <Setting />
                </el-icon>
                <span>{{ t("settings_view.title") }}</span>
              </template>
            </el-menu-item>
            <!-- <el-menu-item index="/profile/security">
              <template #title>
                <el-icon><Lock /></el-icon>
                <span>安全设置</span>
              </template>
            </el-menu-item>
            <el-menu-item index="/profile/notification">
              <template #title>
                <el-icon><Bell /></el-icon>
                <span>通知设置</span>
              </template>
            </el-menu-item> -->
          </el-menu>
        </div>

        <!-- 占位符，用于将隐私协议与服务条款推到底部 -->
        <div class="spacer"></div>

        <!-- 隐私协议与服务条款 -->
        <el-divider style="margin: 20px 0" />
        <div class="legal-links">
          <el-link class="legal-link" @click="router.push('/privacy-policy')" type="primary">
            {{ t("privacy_policy.title") }}
          </el-link>
          <el-link class="legal-link" @click="router.push('/terms-of-service')" type="primary">
            {{ t("terms_of_service.title") }}
          </el-link>
        </div>
      </div>

      <!-- 右侧主要内容 -->
      <div class="right-content">
        <!-- 返回按钮 -->
        <div class="back-button-container">
          <el-button type="primary" @click="goBack">
            <el-icon>
              <ArrowLeft />
            </el-icon>
            {{ t("settings_view.back_to_editor_page") }}
          </el-button>
        </div>

        <!-- 动态加载不同的设置组件 -->
        <account-settings
          v-if="activeNavItem === '/profile/account'"
          :user-info="userInfo"
          @avatar-updated="handleAvatarUpdated"
          @nickname-updated="handleNicknameUpdated"
          @update:userInfo="updateUserInfo"
        />

        <password-change
          v-else-if="activeNavItem === '/profile/password'"
          :user-info="userInfo"
        />

        <editor-config
          v-else-if="activeNavItem === '/profile/editor'"
          :editor-config="editorConfig"
          @editor-config-updated="handleEditorConfigUpdated"
        />

        <security-settings
          v-else-if="activeNavItem === '/profile/security'"
          :security-info="securityInfo"
          @email-verification="handleEmailVerification"
          @two-factor-toggle="handleTwoFactorToggle"
          @view-login-devices="handleViewLoginDevices"
        />

        <notification-settings
          v-else-if="activeNavItem === '/profile/notification'"
          :notification-config="notificationConfig"
          @notification-config-updated="handleNotificationConfigUpdated"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  Setting,
  User,
  EditPen,
  Lock,
  Bell,
  ArrowLeft,
  ArrowRight,
} from "@element-plus/icons-vue";
import { Logout } from "@icon-park/vue-next";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// 导入 authApi
import { authApi } from "../api/auth";

// 导入子组件
import AccountSettings from "../components/profile/AccountSettings.vue";
import PasswordChange from "../components/profile/PasswordChange.vue";
import EditorConfig from "../components/profile/EditorConfig.vue";
import SecuritySettings from "../components/profile/SecuritySettings.vue";
import NotificationSettings from "../components/profile/NotificationSettings.vue";

const route = useRoute();
const router = useRouter();

// 激活的导航项
const activeNavItem = ref(route.path);

// 用户信息类型定义
interface UserInfo {
  avatar: string;
  nickname: string;
  email: string;
  gender?: "male" | "female" | "other";
  birthday?: string;
  bio?: string;
  default_storage_provider?: string;
}

// 用户信息
const userInfo = reactive<UserInfo>({
  avatar: "",
  nickname: "",
  email: "",
  gender: "male",
  birthday: "",
  bio: "",
});

// 从 localStorage 获取用户信息
const loadUserInfo = () => {
  const storedUserInfo = localStorage.getItem("user_info");
  if (storedUserInfo) {
    const parsedUserInfo = JSON.parse(storedUserInfo);
    Object.assign(userInfo, parsedUserInfo);
  }
};

// 检查是否为颜色值（只验证HEX格式）
const isColorValue = (value: string): boolean => {
  if (!value) return false;
  // 只检查是否为HEX格式（6位或3位），因为系统只会存储这种格式
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
};

// 监听 localStorage 变化
const handleStorageChange = () => {
  loadUserInfo();
};

// 添加 localStorage 监听
window.addEventListener("storage", handleStorageChange);

// 编辑器配置类型定义
interface EditorConfig {
  fontSize: number;
  lineHeight: string;
  autoSave: boolean;
  realTimePreview: boolean;
  editorTheme: string;
  editorAreaTheme: string;
  previewAreaTheme: string;
}

// 编辑器配置
const editorConfig = reactive<EditorConfig>({
  fontSize: 16,
  lineHeight: "1.5",
  autoSave: true,
  realTimePreview: true,
  editorTheme: localStorage.getItem("editorTheme") || "default",
  editorAreaTheme: localStorage.getItem("editorAreaTheme") || "default",
  previewAreaTheme: localStorage.getItem("previewAreaTheme") || "default",
});

// 安全信息类型定义
interface SecurityInfo {
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

// 安全信息
const securityInfo = reactive<SecurityInfo>({
  emailVerified: true,
  twoFactorEnabled: false,
});

// 通知配置类型定义
interface NotificationConfig {
  emailNotification: boolean;
  commentNotification: boolean;
  systemNotification: boolean;
  activityNotification: boolean;
  marketingNotification: boolean;
}

// 通知配置
const notificationConfig = reactive<NotificationConfig>({
  emailNotification: true,
  commentNotification: true,
  systemNotification: true,
  activityNotification: true,
  marketingNotification: false,
});

// 导航菜单选择事件
const handleNavSelect = (index: string) => {
  activeNavItem.value = index;
  router.push(index);
};

// 返回编辑器页面
const goBack = () => {
  router.push("/");
};

// 退出登录
const handleLogout = async () => {
  try {
    // 调用后端退出登录接口
    await authApi.logout();
  } catch (error) {
    console.error("退出登录失败:", error);
  } finally {
    // 清除localStorage中的用户信息和token
    localStorage.removeItem("user_info");
    localStorage.removeItem("access_token");
    localStorage.removeItem("github_access_token");

    // 跳转到登录页面
    router.push("/login");

    // 显示退出成功提示
    ElMessage.success(t("compile_view.logout_success"));
  }
};

// 账号设置事件处理
const handleAvatarUpdated = (avatar: string) => {
  userInfo.avatar = avatar;
  console.log("头像更新:", avatar);
};

const handleNicknameUpdated = (nickname: string) => {
  userInfo.nickname = nickname;
  console.log("昵称更新:", nickname);
};

const updateUserInfo = (updatedUserInfo: UserInfo) => {
  Object.assign(userInfo, updatedUserInfo);
  localStorage.setItem("user_info", JSON.stringify(userInfo));
  console.log("用户信息更新:", userInfo);
};

const handlePasswordChanged = (password: {
  oldPassword: string;
  newPassword: string;
}) => {
  console.log("密码修改:", password);
  // 这里可以添加实际的密码修改逻辑
};

// 编辑器配置事件处理
const handleEditorConfigUpdated = (config: typeof editorConfig) => {
  console.log("编辑器配置更新:", config);
  // 这里可以添加实际的编辑器配置更新逻辑
};

// 安全设置事件处理
const handleEmailVerification = (email: string) => {
  console.log("邮箱验证:", email);
  // 这里可以添加实际的邮箱验证逻辑
};

const handleTwoFactorToggle = (enabled: boolean) => {
  console.log("二步验证切换:", enabled);
  // 这里可以添加实际的二步验证切换逻辑
};

const handleViewLoginDevices = () => {
  console.log("查看登录设备");
  // 这里可以添加实际的查看登录设备逻辑
};

// 通知设置事件处理
const handleNotificationConfigUpdated = (config: typeof notificationConfig) => {
  console.log("通知配置更新:", config);
  // 这里可以添加实际的通知配置更新逻辑
};

onMounted(() => {
  // 初始化逻辑
  console.log("ProfileCenter mounted");
  // 加载用户信息
  loadUserInfo();
});
</script>

<style scoped>
.profile-center-container {
  width: 100%;
  min-height: 100vh;
  background-color: var(--el-color-info-light-9);
  padding: 20px;
  box-sizing: border-box;
}

.main-content {
  display: flex;
  gap: 20px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 左侧边栏样式 */
.left-sidebar {
  width: 240px;
  background-color: var(--el-bg-color-page);
  padding: 20px;
  box-sizing: border-box;
  /* border-right: 1px solid var(--el-color-info-light-5); */
  display: flex;
  flex-direction: column;
  min-height: 800px;
}

.user-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.user-name {
  margin-top: 15px;
  font-size: 18px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.user-email {
  margin-top: 5px;
  font-size: 14px;
  color: #909399;
}

/* 导航菜单样式 */
.profile-nav-menu {
  border-right: none;
}

/* 占位符样式，用于将隐私协议与服务条款推到底部 */
.spacer {
  flex: 1;
}

.profile-nav-menu :deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  font-size: 14px;
}

.profile-nav-menu :deep(.el-menu-item.is-active) {
  background-color: var(--el-color-info-light-9);
  color: var(--el-color-primary);
}

/* 右侧内容样式 */
.right-content {
  flex: 1;
  padding: 20px 30px;
  overflow-y: auto;
}

.back-button-container {
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin-bottom: 15px;
}

.setting-item {
  margin-bottom: 30px;
}

.setting-item-title {
  font-size: 16px;
  font-weight: bold;
  color: #606266;
  margin-bottom: 15px;
}

/* 头像设置样式 */
.avatar-setting {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 4px;
}

.avatar-actions {
  display: flex;
  gap: 10px;
}

/* 表单样式 */
.nickname-form,
.password-form,
.personal-form,
.editor-form,
.notification-form {
  background-color: #fafafa;
  padding: 20px;
  border-radius: 4px;
}

/* 安全设置样式 */
.security-item {
  padding: 20px;
  background-color: #fafafa;
  border-radius: 4px;
  margin-bottom: 15px;
}

.security-item-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #606266;
  margin-bottom: 5px;
}

.security-item-desc {
  color: #909399;
  margin-bottom: 15px;
  font-size: 14px;
}

/* 滑块值样式 */
.slider-value {
  margin-left: 10px;
  font-size: 14px;
  color: #606266;
}

/* 隐私协议与服务条款样式 */
.legal-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
  align-items: center;
}

.legal-link {
  font-size: 13px;
  /* color: #909399; */
  margin-bottom: 10px;
  display: block;
  text-align: center;
}

.legal-link:hover {
  color: var(--el-color-primary);
  text-decoration: none;
}
</style>
