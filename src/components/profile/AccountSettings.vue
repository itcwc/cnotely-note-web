<template>
  <div class="setting-section">
    <h2 class="section-title">{{ t('account_settings.title') }}</h2>
    <el-divider />

    <!-- 昵称设置 -->
    <div class="setting-item">
      <h3 class="setting-item-title">{{ t('account_settings.nickname_settings') }}</h3>
      <el-form :model="userInfo" label-width="80px" class="nickname-form">
        <el-form-item :label="t('account_settings.nickname')">
          <el-input v-model="userInfo.nickname" :placeholder="t('account_settings.enter_nickname')" />
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="saveNickname">
            <el-icon>
              <Check />
            </el-icon>
            {{ t('account_settings.save') }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 头像设置 -->
    <div class="setting-item">
      <h3 class="setting-item-title">{{ t('account_settings.avatar_settings') }}</h3>
      <div class="avatar-setting">
        <!-- 当前头像预览 -->
        <div class="current-avatar">
          <!-- 实时预览：根据当前选择的状态显示 -->
          <template v-if="selectedAvatar === -2">
            <!-- 外部头像链接（如谷歌登录头像） -->
            <el-avatar :size="70" :src="props.userInfo.avatar">
              {{ userInfo.nickname ? userInfo.nickname.slice(0, 2) : "U" }}
            </el-avatar>
          </template>
          <template v-else-if="selectedAvatar !== -1">
            <!-- 如果选择了默认头像，显示默认头像图片 -->
            <el-avatar :size="70" :src="defaultAvatars[selectedAvatar]">
              {{ userInfo.nickname ? userInfo.nickname.slice(0, 2) : "U" }}
            </el-avatar>
          </template>
          <template v-else>
            <!-- 否则，显示带有当前选择背景色的文字头像 -->
            <el-avatar :size="70" :style="{ backgroundColor: avatarBgColor }">
              {{ userInfo.nickname ? userInfo.nickname.slice(0, 2) : "U" }}
            </el-avatar>
          </template>
          <div class="avatar-preview-text">{{ t('account_settings.current_avatar') }}</div>
        </div>

        <!-- 头像设置选项 -->
        <div class="avatar-options">
          <!-- 背景颜色选择 -->
          <div class="option-section">
            <h4 class="option-title">{{ t('account_settings.select_color_avatar') }}</h4>
            <div class="color-options">
              <div
                v-for="color in bgColors"
                :key="color"
                class="color-option"
                :class="{ active: avatarBgColor === color }"
                :style="{ backgroundColor: color }"
                @click="selectBgColor(color)"
              ></div>
            </div>
          </div>

          <!-- 系统默认头像选择 -->
          <div class="option-section">
            <h4 class="option-title">{{ t('account_settings.select_default_avatar') }}</h4>
            <div class="default-avatars">
              <div
                v-for="(avatar, index) in defaultAvatars"
                :key="index"
                class="default-avatar-option"
                :class="{ active: selectedAvatar === index }"
                @click="selectDefaultAvatar(index)"
              >
                <el-avatar :size="50" :src="avatar">
                  {{ index + 1 }}
                </el-avatar>
              </div>
            </div>
          </div>

          <!-- 保存按钮 -->
          <div class="avatar-actions">
            <el-button type="success" @click="saveAvatar">
              <el-icon>
                <Check />
              </el-icon>
              {{ t('account_settings.save') }}
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 第三方账号绑定 -->
    <div class="setting-item">
      <h3 class="setting-item-title">{{ t('account_settings.third_party_binding') }}</h3>
      <el-alert
        :title="t('account_settings.first_binding_tip')"
        type="info"
        :closable="false"
        style="margin-bottom: 15px"
      />
      <div class="platform-switch-tip" v-if="showPlatformSwitchTip">
        <el-tag type="warning" effect="plain" size="small">{{ t('account_settings.tip') }}</el-tag>
        <span style="margin-left: 8px; color: #606266">
          {{ t('account_settings.platform_switch_tip') }}
        </span>
      </div>
      <div class="oauth-binding">
        <!-- GitHub 绑定 -->
        <div class="binding-item">
          <div class="binding-info">
            <div class="binding-logo github-logo">
              <img
                src="/imgs/icon/github_favicon.svg"
                alt="GitHub图标"
                style="width: 20px; height: 20px; margin-right: 0px"
              />
            </div>
            <div class="binding-details">
              <div class="binding-name">GitHub</div>
              <div class="binding-status" v-if="oauthAccounts.github">
                <el-tag type="success">{{ t('account_settings.bound') }}</el-tag>
                <el-tag
                  v-if="props.userInfo.default_storage_provider === 'github'"
                  type="primary"
                  effect="dark"
                  size="small"
                  style="margin-left: 5px"
                >
                  {{ t('account_settings.default') }}
                </el-tag>
              </div>
              <div class="binding-status" v-else>
                <el-tag type="info">{{ t('account_settings.unbound') }}</el-tag>
              </div>
            </div>
          </div>
          <div class="binding-actions">
            <el-button
              v-if="!oauthAccounts.github"
              type="primary"
              @click="bindOAuthAccount('github')"
            >
              <el-icon>
                <LinkIcon />
              </el-icon>
              {{ t('account_settings.bind') }}
            </el-button>
            <template v-else>
              <el-button
                v-if="props.userInfo.default_storage_provider !== 'github'"
                type="default"
                @click="setDefaultStorageProvider('github')"
              >
                {{ t('account_settings.set_as_default') }}
              </el-button>
              <el-button type="danger" @click="unbindOAuthAccount('github')">
                <el-icon>
                  <Close />
                </el-icon>
                {{ t('account_settings.unbind') }}
              </el-button>
            </template>
          </div>
        </div>

        <!-- Google 绑定 -->
        <div class="binding-item">
          <div class="binding-info">
            <div class="binding-logo google-logo">
              <img
                src="/imgs/icon/google_favicon.ico"
                alt="谷歌图标"
                style="width: 20px; height: 20px; margin-right: 0"
              />
            </div>
            <div class="binding-details">
              <div class="binding-name">Google</div>
              <div class="binding-status" v-if="oauthAccounts.google">
                <el-tag type="success">{{ t('account_settings.bound') }}</el-tag>
                <el-tag
                  v-if="props.userInfo.default_storage_provider === 'google'"
                  type="primary"
                  effect="dark"
                  size="small"
                  style="margin-left: 5px"
                >
                  {{ t('account_settings.default') }}
                </el-tag>
              </div>
              <div class="binding-status" v-else>
                <el-tag type="info">{{ t('account_settings.unbound') }}</el-tag>
              </div>
            </div>
          </div>
          <div class="binding-actions">
            <el-button
              v-if="!oauthAccounts.google"
              type="primary"
              @click="bindOAuthAccount('google')"
            >
              <el-icon>
                <LinkIcon />
              </el-icon>
              {{ t('account_settings.bind') }}
            </el-button>
            <template v-else>
              <el-button
                v-if="props.userInfo.default_storage_provider !== 'google'"
                type="default"
                @click="setDefaultStorageProvider('google')"
              >
                {{ t('account_settings.set_as_default') }}
              </el-button>
              <el-button type="danger" @click="unbindOAuthAccount('google')">
                <el-icon>
                  <Close />
                </el-icon>
                {{ t('account_settings.unbind') }}
              </el-button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElUpload, ElForm, ElLink, ElTag } from "element-plus";
import {
  Upload,
  Check,
  Link as LinkIcon,
  Close,
} from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import { authApi } from "../../api/auth";
import { userApi } from "../../api/user";

const { t } = useI18n();

// Props
interface UserInfo {
  avatar: string;
  nickname: string;
  email: string;
  default_storage_provider?: string;
}

const props = defineProps<{
  userInfo: UserInfo;
}>();

// Router
const router = useRouter();
const route = useRoute();

// Emits
const emit = defineEmits<{
  (e: "update:userInfo", userInfo: UserInfo): void;
  (e: "avatar-updated", avatar: string): void;
  (e: "nickname-updated", nickname: string): void;
  (
    e: "password-changed",
    password: { oldPassword: string; newPassword: string },
  ): void;
  (e: "oauth-account-updated", accounts: Record<string, boolean>): void;
}>();

// 平台切换提示显示状态
const showPlatformSwitchTip = ref(false);

// OAuth 账号绑定相关
interface OAuthAccounts {
  github: boolean;
  google: boolean;
}

// 当前绑定状态
const oauthAccounts = ref<OAuthAccounts>({
  github: false,
  google: false,
});

// 获取当前绑定状态
const getOAuthAccounts = async () => {
  try {
    // 调用后端 API 获取当前绑定状态
    const result = await userApi.getOAuthAccounts();
    if (result.code === 200) {
      // 初始化绑定状态为未绑定
      const accounts: OAuthAccounts = {
        github: false,
        google: false,
      };

      // 遍历返回的数组，根据 provider 字段设置绑定状态
      result.data.forEach((account: any) => {
        if (account.provider === "github") {
          accounts.github = true;
        } else if (account.provider === "google") {
          accounts.google = true;
        }
      });

      // 更新绑定状态
      oauthAccounts.value = accounts;
    }
  } catch (error) {
    console.error("获取绑定状态失败:", error);
  }
};

// 绑定 OAuth 账号
const bindOAuthAccount = (provider: string) => {
  try {
    // 构造授权 URL
    let authUrl = "";
    const clientId =
      provider === "github"
        ? import.meta.env.VITE_GITHUB_CLIENT_ID
        : import.meta.env.VITE_GOOGLE_CLIENT_ID;
    // 设置正确的回调 URL，匹配应用配置
    const redirectUri = window.location.origin + `/${provider}-callback`;

    if (provider === "github") {
      authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email,repo`;
    } else if (provider === "google") {
      authUrl =
        "https://accounts.google.com/o/oauth2/v2/auth" +
        "?client_id=" +
        import.meta.env.VITE_GOOGLE_CLIENT_ID +
        "&redirect_uri=" +
        window.location.origin +
        "/google-callback" +
        "&response_type=code" +
        "&scope=email profile https://www.googleapis.com/auth/drive.file" + // 加上这一行
        "&access_type=offline" + // 必须加上，否则拿不到 refresh_token
        "&prompt=consent"; // 强制弹出授权页面，确保用户勾选新权限;
    }

    // 打开授权窗口
    const width = 500;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const popup = window.open(
      authUrl,
      `${provider}-auth`,
      `width=${width},height=${height},left=${left},top=${top},toolbar=0,location=0,menubar=0,status=0`,
    );

    // 监听弹窗的消息事件
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === `${provider}-login-success`) {
        // 登录成功，更新绑定状态
        oauthAccounts.value[provider as keyof OAuthAccounts] = true;
        emit("oauth-account-updated", oauthAccounts.value);
        ElMessage.success(`${t('account_settings.binding_success', { provider })}`)
        window.removeEventListener("message", handleMessage);
      } else if (event.data.type === `${provider}-login-failure`) {
        // 登录失败
        ElMessage.error(event.data.message || `${t('account_settings.binding_failure', { provider })}`);
        window.removeEventListener("message", handleMessage);
      }
    };

    // 添加消息监听
    window.addEventListener("message", handleMessage);

    // 定期检查弹窗是否关闭
    const checkPopup = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(checkPopup);
        window.removeEventListener("message", handleMessage);
        return;
      }
    }, 500);
  } catch (error: any) {
    console.error("绑定失败:", error);
    ElMessage.error(
      `${t('account_settings.binding_failure', { provider })}: ${error.message || t('account_settings.try_again_later')}`,
    );
  }
};

// 处理 OAuth 回调
const handleOAuthCallback = async (provider: string, code: string) => {
  try {
    // 调用新的绑定接口
    const result = await userApi.bindOAuthAccount(provider, code);
    if (result.code === 200) {
      // 绑定成功，更新状态
      oauthAccounts.value[provider as keyof OAuthAccounts] = true;
      emit("oauth-account-updated", oauthAccounts.value);
      ElMessage.success(`${t('account_settings.binding_success', { provider })}`);
    } else {
      ElMessage.error(result.msg || `${t('account_settings.binding_failure', { provider })}`);
    }
  } catch (error: any) {
    console.error("绑定失败:", error);
    ElMessage.error(
      `${t('account_settings.binding_failure', { provider })}: ${error.message || t('account_settings.try_again_later')}`,
    );
  }
};

// 解绑 OAuth 账号
const unbindOAuthAccount = async (provider: string) => {
  try {
    // 调用后端 API 解绑账号
    const result = await userApi.unbindOAuthAccount(provider);
    if (result.code === 200) {
      // 更新绑定状态
      oauthAccounts.value[provider as keyof OAuthAccounts] = false;
      emit("oauth-account-updated", oauthAccounts.value);
      ElMessage.success(`${t('account_settings.unbinding_success', { provider })}`);
    } else {
      ElMessage.error(result.msg || `${t('account_settings.unbinding_failure', { provider })}`);
    }
  } catch (error: any) {
    console.error("解绑失败:", error);
    ElMessage.error(
      `${t('account_settings.unbinding_failure', { provider })}: ${error.message || t('account_settings.try_again_later')}`,
    );
  }
};

// 设置默认存储提供者
const setDefaultStorageProvider = async (provider: string) => {
  try {
    // 调用后端 API 更新默认存储提供者
    const result = await userApi.updateUserInfo({
      default_storage_provider: provider,
    });
    if (result.code === 200) {
      // 更新用户信息
      emit("update:userInfo", result.data);
      ElMessage.success(t('account_settings.set_default_success', { provider }));
    } else {
      ElMessage.error(result.msg || t('account_settings.set_default_failure'));
    }
  } catch (error: any) {
    console.error("设置默认失败:", error);
    ElMessage.error(`${t('account_settings.set_default_failure')}: ${error.message || t('account_settings.try_again_later')}`);
  }
};

// 组件挂载时获取绑定状态和检查平台切换标识
onMounted(() => {
  getOAuthAccounts();

  // 检查是否从平台切换跳转过来
  checkPlatformSwitch();

  // 监听路由变化
  router.afterEach((to) => {
    if (to.path === "/profile/account") {
      checkPlatformSwitch();
    }
  });
});

// 检查是否从平台切换跳转过来
const checkPlatformSwitch = () => {
  const fromPlatformSwitch = route.query.fromPlatformSwitch === "true";
  showPlatformSwitchTip.value = fromPlatformSwitch;
};

// 组件卸载前清理
onBeforeUnmount(() => {
  // 清理路由监听
  router.afterEach(() => {});
});

// 语言设置

// 头像设置相关
// 背景颜色列表
const bgColors = [
  "#79BBFF", // 默认蓝色
  "#FF6B6B", // 红色
  "#6BCA6B", // 绿色
  "#FFB84D", // 橙色
  "#B66BFF", // 紫色
  "#4DB6FF", // 浅蓝色
  "#FF4DB6", // 粉色
  "#949494", // 灰色
  "#FFCC4D", // 黄色
  "#4DFFB8", // 青色
];

// 系统默认头像列表 - 使用dicebear API生成10个不同的头像
const defaultAvatars = [
  "https://api.dicebear.com/9.x/notionists/svg?seed=Adrian",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Leah",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Jessica",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Nolan",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Aidan",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Jude",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Liliana",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Mackenzie",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Easton",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Luis",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Brooklynn",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Destiny",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Eden",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Avery",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Aiden",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Vivian",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Kimberly",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Christopher",
];

// 头像背景颜色
const avatarBgColor = ref("#79BBFF"); // 默认蓝色

// 选中的默认头像索引
const selectedAvatar = ref(-1); // -1 表示未选择默认头像，使用文字头像

// 检查是否为颜色值（只验证HEX格式）
const isColorValue = (value: string): boolean => {
  if (!value) return false;
  // 只检查是否为HEX格式（6位或3位），因为系统只会存储这种格式
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
};

// 选择背景颜色
const selectBgColor = (color: string) => {
  avatarBgColor.value = color;
  // 如果选择了背景颜色，清空默认头像选择
  selectedAvatar.value = -1;
};

// 选择默认头像
const selectDefaultAvatar = (index: number) => {
  selectedAvatar.value = index;
  // 如果选择了默认头像，清空背景颜色
  if (index !== -1) {
    avatarBgColor.value = "";
  }
};

// 监听userInfo变化，更新内部状态
watch(
  () => props.userInfo,
  (newUserInfo) => {
    if (newUserInfo.avatar) {
      if (isColorValue(newUserInfo.avatar)) {
        // 如果是颜色值，设置背景颜色
        avatarBgColor.value = newUserInfo.avatar;
        selectedAvatar.value = -1;
      } else {
        // 如果是图片链接，检查是否在默认头像列表中
        const index = defaultAvatars.indexOf(newUserInfo.avatar);
        if (index !== -1) {
          // 在默认头像列表中，设置选中的默认头像
          selectedAvatar.value = index;
          avatarBgColor.value = "";
        } else {
          // 不在默认头像列表中，可能是谷歌登录或其他第三方登录的头像
          selectedAvatar.value = -2; // -2 表示使用外部头像链接
          avatarBgColor.value = "";
        }
      }
    }
  },
  { immediate: true, deep: true },
);

// 保存头像设置
const saveAvatar = async () => {
  try {
    let avatarValue = "";

    // 根据选择生成最终的头像值
    if (selectedAvatar.value !== -1) {
      // 如果选择了默认头像，使用头像URL
      avatarValue = defaultAvatars[selectedAvatar.value];
    } else {
      // 否则使用背景颜色
      avatarValue = avatarBgColor.value;
    }

    // 调用后端API更新头像
    const result = await userApi.updateUserInfo({
      avatar: avatarValue,
    });

    if (result.code === 200) {
      // 更新用户信息
      const updatedUserInfo = {
        ...props.userInfo,
        avatar: result.data.avatar,
      };
      emit("update:userInfo", updatedUserInfo);
      emit("avatar-updated", result.data.avatar);

      // 更新localStorage中的用户信息缓存
      localStorage.setItem("user_info", JSON.stringify(updatedUserInfo));

      ElMessage.success(t('account_settings.avatar_save_success'));
    } else {
      ElMessage.error(result.msg || t('account_settings.avatar_save_failure'));
    }
  } catch (error: any) {
    console.error("保存头像失败:", error);
    ElMessage.error(error.message || t('account_settings.avatar_save_retry'));
  }
};

// 保存昵称
const saveNickname = async () => {
  // try {
  // 调用后端API更新昵称
  const result = await userApi.updateUserInfo({
    nickname: props.userInfo.nickname,
  });

  if (result.code === 200) {
    // 更新用户信息
    const updatedUserInfo = {
      ...props.userInfo,
      nickname: result.data.nickname,
    };
    emit("update:userInfo", updatedUserInfo);
    emit("nickname-updated", result.data.nickname);

    // 更新localStorage中的用户信息缓存
    localStorage.setItem("user_info", JSON.stringify(updatedUserInfo));

    ElMessage.success(t('account_settings.nickname_save_success'));
  } else {
    ElMessage.error(result.msg || t('account_settings.nickname_save_failure'));
  }
  // } catch (error: any) {
  //   console.error('保存昵称失败:', error);
  //   ElMessage.error(error.message || t('account_settings.nickname_save_retry'));
  // }
};
</script>

<style scoped>
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
  gap: 40px;
  padding: 20px;
  background-color: var(--el-color-info-light-9);
  border-radius: 4px;
  flex-wrap: wrap;
}

/* 当前头像预览样式 */
.current-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  min-width: 120px;
}

.avatar-preview-text {
  font-size: 14px;
  color: #606266;
  font-weight: bold;
}

/* 头像设置选项样式 */
.avatar-options {
  flex: 1;
  min-width: 300px;
}

.option-section {
  margin-bottom: 25px;
}

.option-title {
  font-size: 16px;
  font-weight: bold;
  color: #606266;
  margin-bottom: 15px;
}

/* 背景颜色选择样式 */
.color-options {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.color-option {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  /* border: 2px solid transparent; */
  transition: all 0.3s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: #409eff;
  transform: scale(1.2);
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
}

/* 系统默认头像选择样式 */
.default-avatars {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.default-avatar-option {
  cursor: pointer;
  /* border: 2px solid transparent; */
  /* padding: 8px; */
  border-radius: 8px;
  transition: all 0.3s ease;
}

.default-avatar-option:hover {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.default-avatar-option.active {
  border-color: #409eff;
  background-color: #ecf5ff;
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
}

/* 头像操作按钮样式 */
.avatar-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.avatar-actions .el-button {
  font-size: 14px;
}

/* 表单样式 */
.nickname-form,
.password-form {
  background-color: var(--el-color-info-light-9);
  padding: 20px;
  border-radius: 4px;
}

/* 验证码输入容器样式 */
.code-input-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 忘记密码链接样式 */
.forgot-password-link {
  margin-top: 10px;
  text-align: right;
}

.forgot-password-link .el-link {
  font-size: 14px;
}

/* 平台切换提示样式 */
.platform-switch-tip {
  display: flex;
  align-items: center;
  background-color: #fdf6ec;
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 15px;
  border: 1px solid #faecd8;
}

/* 第三方账号绑定样式 */
.oauth-binding {
  background-color: var(--el-color-info-light-9);
  padding: 20px;
  border-radius: 4px;
}

.binding-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.binding-item:last-child {
  border-bottom: none;
}

.binding-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.binding-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f0f0f0;
}

.github-logo svg {
  color: #333;
}

.google-logo svg {
  color: #4285f4;
}

.binding-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.binding-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.binding-status {
  font-size: 14px;
}

.binding-actions {
  display: flex;
  gap: 10px;
}

.binding-actions .el-button {
  font-size: 14px;
}
</style>
