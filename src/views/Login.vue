<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 左侧：平台介绍 -->
      <div class="login-left">
        <!-- Logo -->
        <div class="logo-container">
          <img src="/icon.png" alt="Cnotely Logo" class="logo" />
          <h2 class="title">Cnotely</h2>
          <p class="subtitle">{{ t("login.title") }}</p>
        </div>

        <!-- 平台介绍内容 -->
        <div class="intro-content">
          <div class="intro-feature">
            <h3>🔒 {{ t("login.features.no_content_storage") }}</h3>
            <p>{{ t("login.features.no_content_desc") }}</p>
          </div>
          <div class="intro-feature">
            <h3>☁️ {{ t("login.features.multi_cloud") }}</h3>
            <p>{{ t("login.features.multi_cloud_desc") }}</p>
          </div>
          <div class="intro-feature">
            <h3>⚡ {{ t("login.features.enhanced_experience") }}</h3>
            <p>{{ t("login.features.enhanced_experience_desc") }}</p>
          </div>
          <div class="intro-feature">
            <h3>🔄 {{ t("login.features.secure_sync") }}</h3>
            <p>{{ t("login.features.secure_sync_desc") }}</p>
          </div>
        </div>
      </div>

      <!-- 右侧：登录表单 -->
      <div class="login-right">
        <!-- 登录方式切换 -->
        <div class="login-tabs">
          <div
            class="tab-item"
            :class="{ active: loginType === 'password' }"
            @click="loginType = 'password'"
          >
            {{ t("login.login_types.password") }}
          </div>
          <div
            class="tab-item"
            :class="{ active: loginType === 'code' }"
            @click="loginType = 'code'"
          >
            {{ t("login.login_types.code") }}
          </div>
        </div>

        <!-- 登录表单 -->
        <el-form
          :model="loginForm"
          :rules="loginRules"
          ref="loginFormRef"
          label-position="left"
          label-width="80px"
          size="large"
        >
          <!-- 全局错误信息 -->
          <el-form-item
            v-if="formError"
            prop="global"
            style="margin-bottom: 10px"
          >
            <div class="form-error-message">{{ formError }}</div>
          </el-form-item>

          <el-form-item :label="t('login.form.email')" prop="email">
            <el-input
              v-model="loginForm.email"
              :placeholder="t('login.placeholders.email')"
              type="email"
            >
              <template #prefix>
                <el-icon>
                  <Message />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 密码登录方式显示 -->
          <template v-if="loginType === 'password'">
            <el-form-item :label="t('login.form.password')" prop="password">
              <el-input
                v-model="loginForm.password"
                :placeholder="t('login.placeholders.password')"
                type="password"
                show-password
              >
                <template #prefix>
                  <el-icon>
                    <Lock />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
          </template>

          <!-- 验证码登录方式显示 -->
          <template v-else>
            <el-form-item
              :label="t('login.form.verification_code')"
              prop="code"
            >
              <div class="code-input-container">
                <el-input
                  v-model="loginForm.code"
                  :placeholder="t('login.placeholders.verification_code')"
                  type="text"
                  style="width: 60%"
                >
                  <template #prefix>
                    <el-icon>
                      <Message />
                    </el-icon>
                  </template>
                </el-input>
                <el-button
                  type="primary"
                  :disabled="loginForm.codeCountdown > 0"
                  @click="sendVerificationCode"
                  style="width: 35%"
                  size="large"
                >
                  {{
                    loginForm.codeCountdown > 0
                      ? t("forgot_password.buttons.resend_code", {
                          seconds: loginForm.codeCountdown,
                        })
                      : t("forgot_password.buttons.send_code")
                  }}
                </el-button>
              </div>
            </el-form-item>
          </template>

          <el-form-item prop="agreeToPrivacyPolicy">
            <el-checkbox v-model="loginForm.agreeToPrivacyPolicy" size="large">
              {{ t("login.checkbox.agree_to_terms") }}
              <el-link
                type="primary"
                :underline="true"
                @click="goToTermsOfService"
                style="margin: 0 0 5px 0"
              >
                {{ t("login.checkbox.terms_of_service") }}
              </el-link>
              {{ locale === "zh-CN" ? "和" : "and" }}
              <el-link
                type="primary"
                :underline="true"
                @click="goToPrivacyPolicy"
                style="margin: 0 0 5px 0"
              >
                {{ t("login.checkbox.privacy_policy") }}
              </el-link>
            </el-checkbox>
          </el-form-item>

          <el-form-item prop="captcha">
            <div class="captcha-container">
              <div
                ref="turnstileRef"
                class="cf-turnstile"
                :data-sitekey="turnstileSiteKey"
                data-theme="light"
              ></div>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :loading="isLoading"
              block
              size="large"
              @click="handleLogin"
            >
              {{ t("login.buttons.login") }}
            </el-button>
          </el-form-item>

          <el-form-item>
            <div class="forgot-password-container">
              <el-link
                type="primary"
                :underline="false"
                class="forgot-password"
                @click="goToForgotPassword"
                >{{ t("login.buttons.forgot_password") }}</el-link
              >
            </div>
          </el-form-item>

          <!-- 第三方登录 -->
          <el-divider>{{ t("login.dividers.other_login_methods") }}</el-divider>

          <el-form-item>
            <el-button
              type="default"
              block
              size="large"
              @click="handleGoogleLogin"
            >
              <img
                src="/imgs/icon/google_favicon.ico"
                alt="谷歌图标"
                class="login-icon google-icon"
              />
              <span>{{ t("login.buttons.google_login") }}</span>
            </el-button>
          </el-form-item>

          <el-form-item>
            <el-button
              type="default"
              block
              size="large"
              @click="handleGitHubLogin"
            >
              <img
                src="/imgs/icon/github_favicon.svg"
                alt="GitHub图标"
                class="login-icon github-icon"
              />
              <span>{{ t("login.buttons.github_login") }}</span>
            </el-button>
          </el-form-item>

          <!-- 注册链接 -->
          <el-form-item>
            <div class="register-link">
              {{ t("login.links.no_account") }}
              <el-link
                type="primary"
                :underline="false"
                @click="goToRegister"
                style="margin: 0 0 5px 0"
                >{{ t("login.buttons.register") }}</el-link
              >
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  ElMessage,
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElCheckbox,
  ElLink,
  ElDivider,
  FormRules,
} from "element-plus";
import { Message, Lock } from "@element-plus/icons-vue";
import { authApi } from "../api/auth";

const { t, locale } = useI18n();

const router = useRouter();
const loginFormRef = ref<InstanceType<typeof ElForm>>();
const turnstileRef = ref<HTMLElement | null>(null);

// 获取 Cloudflare Turnstile 站点密钥
const turnstileSiteKey = ref(import.meta.env.VITE_TURNSTILE_SITE_KEY);

// 登录类型：password - 密码登录，code - 验证码登录
const loginType = ref("password");

// 表单全局错误信息
const formError = ref("");

// 登录表单数据
const loginForm = reactive({
  email: "",
  password: "",
  rememberMe: false,
  agreeToPrivacyPolicy: false, // 同意隐私协议
  code: "", // 验证码
  codeCountdown: 0, // 验证码倒计时
  captcha: "", // 人机验证
});

// 动态表单验证规则
const loginRules = computed(() => {
  const rules: FormRules = {
    email: [
      {
        required: true,
        message: t("login.validation.email_required"),
        trigger: "blur",
      },
      {
        type: "email",
        message: t("login.validation.email_valid"),
        trigger: "blur",
      },
    ],
    agreeToPrivacyPolicy: [
      {
        required: true,
        message: t("login.validation.agree_to_terms"),
        trigger: "change",
      },
      {
        validator: (rule, value, callback) => {
          if (value) {
            callback();
          } else {
            callback(
              new Error(t("login.validation.agree_to_terms_validation")),
            );
          }
        },
        trigger: "change",
      },
    ],
  };

  // 根据登录类型动态添加验证规则
  if (loginType.value === "password") {
    rules.password = [
      {
        required: true,
        message: t("login.validation.password_required"),
        trigger: "blur",
      },
      { min: 6, message: t("login.validation.password_min"), trigger: "blur" },
    ];
  } else {
    rules.code = [
      {
        required: true,
        message: t("login.validation.code_required"),
        trigger: "blur",
      },
      {
        min: 6,
        max: 6,
        message: t("login.validation.code_length"),
        trigger: "blur",
      },
    ];
  }

  return rules;
});

// 加载状态
const isLoading = ref(false);

// 发送验证码
const sendVerificationCode = async () => {
  if (!loginForm.email) {
    ElMessage.warning(t("login.messages.enter_email_first"));
    return;
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(loginForm.email)) {
    ElMessage.warning(t("login.messages.enter_valid_email"));
    return;
  }

  // 验证是否同意服务条款和隐私政策
  if (!loginForm.agreeToPrivacyPolicy) {
    ElMessage.warning(t("login.messages.agree_to_terms_first"));
    return;
  }

  // 验证人机验证
  const captchaToken = (
    document.querySelector('[name="cf-turnstile-response"]') as HTMLInputElement
  )?.value;
  if (!captchaToken) {
    ElMessage.warning(t("login.messages.complete_captcha"));
    return;
  }

  try {
    // 获取人机验证 token
    const captchaToken = (
      document.querySelector(
        '[name="cf-turnstile-response"]',
      ) as HTMLInputElement
    )?.value;

    // 调用后端登录验证码接口
    const result = await authApi.sendLoginVerificationCode({
      email: loginForm.email,
      "cf-turnstile-response": captchaToken,
    });

    if (result.code === 200) {
      ElMessage.success(t("login.messages.code_sent_successfully"));

      // 开始倒计时
      loginForm.codeCountdown = 60;
      const countdownInterval = setInterval(() => {
        loginForm.codeCountdown--;
        if (loginForm.codeCountdown <= 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);
    } else {
      ElMessage.error(result.msg || t("login.messages.send_code_failed"));
    }
  } catch (error) {
    console.error("发送验证码失败:", error);
    ElMessage.error(t("login.messages.send_code_failed"));
  }
};

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return;

  // 清空之前的错误信息
  formError.value = "";

  try {
    await loginFormRef.value.validate();
    isLoading.value = true;

    // 获取人机验证 token
    const captchaToken = (
      document.querySelector(
        '[name="cf-turnstile-response"]',
      ) as HTMLInputElement
    )?.value;
    if (!captchaToken) {
      ElMessage.warning(t("login.messages.complete_captcha"));
      isLoading.value = false;
      return;
    }

    // 根据登录类型构建请求数据
    const loginData = {
      email: loginForm.email,
      "cf-turnstile-response": captchaToken,
    };

    if (loginType.value === "password") {
      // 密码登录
      Object.assign(loginData, { password: loginForm.password });
    } else {
      // 验证码登录
      Object.assign(loginData, { code: loginForm.code });
    }

    // 调用后端登录接口
    const result = await authApi.login(loginData);

    if (result.code === 200) {
      // 登录成功，保存token和用户信息
      localStorage.setItem("access_token", result.data.token);

      // 保存完整的用户信息到localStorage
      const userInfo = result.data.user;
      localStorage.setItem("user_info", JSON.stringify(userInfo));

      ElMessage.success(t("login.messages.login_success"));
      // router.push('/compile');
      router.push("/");
    } else {
      // 使用表单全局错误信息显示后端返回的错误
      formError.value = result.msg || t("login.messages.login_failed");
    }

    isLoading.value = false;
  } catch (error: any) {
    console.error("登录失败:", error);
    // 使用表单全局错误信息显示网络错误
    formError.value = error.message || t("login.messages.login_failed_retry");
    isLoading.value = false;
  }
};

// 谷歌登录处理
const handleGoogleLogin = () => {
  // 直接生成Google授权URL
  const googleAuthUrl =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    "?client_id=" +
    import.meta.env.VITE_GOOGLE_CLIENT_ID +
    "&redirect_uri=" +
    window.location.origin +
    "/google-callback" +
    "&response_type=code" +
    "&scope=email profile https://www.googleapis.com/auth/drive.file" + // 加上这一行
    "&access_type=offline" + // 必须加上，否则拿不到 refresh_token
    "&prompt=consent"; // 强制弹出授权页面，确保用户勾选新权限

    console.log(googleAuthUrl);
    

  // 打开新窗口
  const popup = window.open(googleAuthUrl, "_blank", "width=800,height=600");

  if (!popup) {
    ElMessage.error(t("login.messages.cannot_open_popup"));
    return;
  }

  // 监听弹窗消息
  const handlePopupMessage = (event: MessageEvent) => {
    // 验证消息来源
    if (event.origin !== window.location.origin) {
      return;
    }

    const data = event.data;
    // 处理Google和GitHub登录成功的情况
    if (
      data.type === "google-login-success" ||
      data.type === "github-login-success"
    ) {
      // 登录成功，保存token和用户信息
      if (data.token) {
        localStorage.setItem("access_token", data.token);
      }
      // if (data.access_token) {
      //   localStorage.setItem("access_token", data.access_token);
      // }
      // if (data.github_access_token) {
      //   localStorage.setItem('github_access_token', data.github_access_token);
      // }

      // 保存完整的用户信息到localStorage
      const userInfo = data.user || {
        email: data.email,
        avatar: data.avatar,
        nickname: data.nickname,
        default_storage_provider: data.default_storage_provider,
      };
      localStorage.setItem("user_info", JSON.stringify(userInfo));

      ElMessage.success("登录成功");
      router.push("/");

      // 关闭弹窗
      popup.close();
      // 移除事件监听
      window.removeEventListener("message", handlePopupMessage);
    } else if (
      data.type === "google-login-failure" ||
      data.type === "github-login-failure"
    ) {
      console.error("登录失败:", data.message || "登录失败，请稍后重试");
      ElMessage.error(data.message || "登录失败，请稍后重试");
      popup.close();
      window.removeEventListener("message", handlePopupMessage);
    }
  };

  // 添加事件监听
  window.addEventListener("message", handlePopupMessage);

  // 监听弹窗关闭事件
  const checkPopupClosed = setInterval(() => {
    if (popup.closed) {
      clearInterval(checkPopupClosed);
      window.removeEventListener("message", handlePopupMessage);
    }
  }, 1000);
};

// GitHub登录处理
const handleGitHubLogin = () => {
  // 调用GitHub授权登录接口
  // const authUrl = authApi.generateGithubAuthUrl();

  const githubAuthUrl =
    "https://github.com/login/oauth/authorize" +
    "?client_id=" +
    import.meta.env.VITE_GITHUB_CLIENT_ID +
    "&redirect_uri=" +
    window.location.origin +
    "/github-callback" +
    "&scope=user:email,repo";

  // 打开新窗口
  const popup = window.open(githubAuthUrl, "_blank", "width=800,height=600");

  if (!popup) {
    ElMessage.error(t("login.messages.cannot_open_popup"));
    return;
  }

  // 监听弹窗消息
  const handlePopupMessage = (event: MessageEvent) => {
    // 验证消息来源
    if (event.origin !== window.location.origin) {
      return;
    }

    const data = event.data;
    console.log("GitHub登录消息:", data);
    if (data.type === "github-login-success") {
      // 登录成功，保存token和用户信息
      if (data.token) {
        localStorage.setItem("access_token", data.token);
      }
      // if (data.access_token) {
      //   localStorage.setItem("access_token", data.access_token);
      // }
      // if (data.github_access_token) {
      //   localStorage.setItem("github_access_token", data.github_access_token);
      // }

      // 保存完整的用户信息到localStorage
      const userInfo = data.user || {
        email: data.email,
        avatar: data.avatar,
        nickname: data.nickname,
      };
      localStorage.setItem("user_info", JSON.stringify(userInfo));

      ElMessage.success("登录成功");
      router.push("/");

      // 关闭弹窗
      popup.close();
      // 移除事件监听
      window.removeEventListener("message", handlePopupMessage);
    } else if (data.type === "github-login-failure") {
      console.error("GitHub登录失败:", data.message || "登录失败，请稍后重试");
      ElMessage.error(data.message || "登录失败，请稍后重试");
      popup.close();
      window.removeEventListener("message", handlePopupMessage);
    }
  };

  // 添加事件监听
  window.addEventListener("message", handlePopupMessage);

  // 监听弹窗关闭事件
  const checkPopupClosed = setInterval(() => {
    if (popup.closed) {
      clearInterval(checkPopupClosed);
      window.removeEventListener("message", handlePopupMessage);
    }
  }, 1000);
};

// 跳转到注册页面
const goToRegister = () => {
  router.push("/register");
};

// 跳转到忘记密码页面
const goToForgotPassword = () => {
  router.push("/forgot-password");
};

// 跳转到隐私政策页面
const goToPrivacyPolicy = () => {
  router.push("/privacy-policy");
};

// 跳转到服务条款页面
const goToTermsOfService = () => {
  router.push("/terms-of-service");
};

// 初始化Cloudflare Turnstile验证码
onMounted(() => {
  // 检查窗口对象是否存在turnstile属性和验证码元素是否存在
  if ((window as any).turnstile && turnstileRef.value) {
    // 检查元素是否已有内容，如果为空则初始化
    if (turnstileRef.value.children.length === 0) {
      (window as any).turnstile.render(turnstileRef.value);
    }
  }
});
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--el-color-info-light-9);
  padding: 20px;
}

.login-box {
  background-color: var(--el-bg-color);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 900px;
  display: flex;
  transition: all 0.3s ease;
  overflow: hidden;
}

.login-box:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

/* 左侧平台介绍 */
.login-left {
  flex: 1;
  padding: 40px;
  background: linear-gradient(135deg, #337ecc 0%, #409eff 100%);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 右侧登录表单 */
.login-right {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
}

/* 平台介绍内容 */
.intro-content {
  margin-top: 40px;
}

.intro-feature {
  margin-bottom: 25px;
}

.intro-feature h3 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.intro-feature p {
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.9;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-box {
    flex-direction: column;
  }

  .login-left {
    padding: 30px;
  }

  .login-right {
    padding: 30px;
  }

  .intro-content {
    margin-top: 20px;
  }

  .intro-feature {
    margin-bottom: 20px;
  }
}

.logo-container {
  text-align: center;
  margin-bottom: 30px;
}

.login-left .logo-container {
  margin-bottom: 0;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 10px;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 5px 0;
}

.login-left .title {
  color: white;
}

.subtitle {
  font-size: 16px;
  color: #909399;
  margin: 0;
}

.login-left .subtitle {
  color: rgba(255, 255, 255, 0.9);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.register-link {
  text-align: center;
  font-size: 14px;
  color: #606266;
  margin-top: 20px;
}

.code-input-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

.form-error-message {
  color: #f56c6c;
  font-size: 14px;
  padding: 0px 10px;
  background-color: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  margin-bottom: 10px;
}

/* 登录图标样式 */
.login-icon {
  width: 20px;
  height: 20px;
  margin-right: 5px;
  vertical-align: middle;
}

/* 谷歌图标样式 */
.google-icon {
  /* 可以添加谷歌特定的样式 */
}

/* GitHub图标样式 */
.github-icon {
  /* 可以添加GitHub特定的样式 */
}

/* 验证码容器样式 */
.captcha-container {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.forgot-password-container {
  text-align: center;
  margin-top: 10px;
}

.login-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  cursor: pointer;
  font-size: 16px;
  color: #606266;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
}

.tab-item:hover {
  color: #409eff;
}

.tab-item.active {
  color: #409eff;
  border-bottom-color: #409eff;
  font-weight: bold;
}

.google-icon {
  margin-right: 8px;
  vertical-align: middle;
}

@media (max-width: 768px) {
  .login-box {
    padding: 20px;
  }

  .title {
    font-size: 24px;
  }
}
</style>
