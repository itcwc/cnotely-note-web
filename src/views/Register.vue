<template>
  <div class="register-container">
    <div class="register-box">
      <!-- 左侧：平台介绍 -->
      <div class="register-left">
        <!-- Logo -->
        <div class="logo-container">
          <img src="/icon.png" alt="Cnotely Logo" class="logo" />
          <h2 class="title">Cnotely</h2>
          <p class="subtitle">{{ t("register.title") }}</p>
        </div>

        <!-- 平台介绍内容 -->
        <div class="intro-content">
          <div class="intro-feature">
            <h3>🔒 {{ t("register.features.no_content_storage") }}</h3>
            <p>{{ t("register.features.no_content_desc") }}</p>
          </div>
          <div class="intro-feature">
            <h3>☁️ {{ t("register.features.multi_cloud") }}</h3>
            <p>{{ t("register.features.multi_cloud_desc") }}</p>
          </div>
          <div class="intro-feature">
            <h3>⚡ {{ t("register.features.enhanced_experience") }}</h3>
            <p>{{ t("register.features.enhanced_experience_desc") }}</p>
          </div>
          <div class="intro-feature">
            <h3>🔄 {{ t("register.features.secure_sync") }}</h3>
            <p>{{ t("register.features.secure_sync_desc") }}</p>
          </div>
        </div>
      </div>

      <!-- 右侧：注册表单 -->
      <div class="register-right">
        <!-- 注册表单 -->
        <el-form
          :model="registerForm"
          :rules="registerRules"
          ref="registerFormRef"
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

          <el-form-item :label="t('register.form.nickname')" prop="nickname">
            <el-input
              v-model="registerForm.nickname"
              :placeholder="t('register.placeholders.nickname')"
            >
              <template #prefix>
                <el-icon>
                  <User />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item :label="t('register.form.email')" prop="email">
            <el-input
              v-model="registerForm.email"
              :placeholder="t('register.placeholders.email')"
              type="email"
            >
              <template #prefix>
                <el-icon>
                  <Message />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item :label="t('register.form.password')" prop="password">
            <el-input
              v-model="registerForm.password"
              :placeholder="t('register.placeholders.password')"
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

          <el-form-item
            :label="t('register.form.confirm_password')"
            prop="confirmPassword"
          >
            <el-input
              v-model="registerForm.confirmPassword"
              :placeholder="t('register.placeholders.confirm_password')"
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

          <el-form-item
            :label="t('register.form.verification_code')"
            prop="code"
          >
            <div class="code-input-container">
              <el-input
                v-model="registerForm.code"
                :placeholder="t('register.placeholders.verification_code')"
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
                :disabled="registerForm.codeCountdown > 0"
                @click="sendVerificationCode"
                style="width: 35%"
                size="large"
              >
                {{
                  registerForm.codeCountdown > 0
                    ? t("forgot_password.buttons.resend_code", {
                        seconds: registerForm.codeCountdown,
                      })
                    : t("forgot_password.buttons.send_code")
                }}
              </el-button>
            </div>
          </el-form-item>

          <el-form-item prop="agreement">
            <el-checkbox v-model="registerForm.agreement" size="large">
              {{ t("register.checkbox.agree_to_terms") }}
              <el-link
                type="primary"
                :underline="true"
                style="margin: 0 0 5px 0"
                @click="goToTermsOfService"
                >{{ t("register.checkbox.terms_of_service") }}</el-link
              >
              {{ locale === "zh-CN" ? "和" : "and" }}
              <el-link
                type="primary"
                :underline="true"
                @click="goToPrivacyPolicy"
                style="margin: 0 0 5px 0"
              >
                {{ t("register.checkbox.privacy_policy") }}
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
              native-type="submit"
              :loading="isLoading"
              block
              size="large"
              @click="handleRegister"
            >
              {{ t("register.buttons.register") }}
            </el-button>
          </el-form-item>

          <!-- 第三方注册 -->
          <el-divider>{{
            t("register.dividers.other_register_methods")
          }}</el-divider>

          <el-form-item>
            <el-button
              type="default"
              block
              size="large"
              @click="handleGoogleRegister"
            >
              <img
                src="/imgs/icon/google_favicon.ico"
                alt="谷歌图标"
                style="width: 20px; height: 20px; margin-right: 5px"
              />
              <span>{{ t("register.buttons.google_register") }}</span>
            </el-button>
          </el-form-item>

          <el-form-item>
            <el-button
              type="default"
              block
              size="large"
              @click="handleGitHubRegister"
            >
              <img
                src="/imgs/icon/github_favicon.svg"
                alt="GitHub图标"
                style="width: 20px; height: 20px; margin-right: 5px"
              />
              <span>{{ t("register.buttons.github_register") }}</span>
            </el-button>
          </el-form-item>

          <!-- 登录链接 -->
          <el-form-item>
            <div class="login-link">
              {{ t("register.links.has_account") }}
              <el-link
                type="primary"
                :underline="false"
                @click="goToLogin"
                style="margin: 0 0 5px 0"
                >{{ t("register.buttons.login") }}</el-link
              >
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
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
import { Message, Lock, User } from "@element-plus/icons-vue";
import { authApi } from "../api/auth";

const { t, locale } = useI18n();

const router = useRouter();
const registerFormRef = ref<InstanceType<typeof ElForm>>();
const turnstileRef = ref<HTMLElement | null>(null);

// 获取 Cloudflare Turnstile 站点密钥
const turnstileSiteKey = ref(import.meta.env.VITE_TURNSTILE_SITE_KEY);

// 表单全局错误信息
const formError = ref("");

// 注册表单数据
const registerForm = reactive({
  email: "",
  nickname: "", // 用户昵称
  password: "",
  confirmPassword: "",
  agreement: false,
  code: "", // 验证码
  codeCountdown: 0, // 验证码倒计时
  captcha: "", // 人机验证
});

// 表单验证规则
const registerRules: FormRules = {
  email: [
    {
      required: true,
      message: t("register.validation.email_required"),
      trigger: "blur",
    },
    {
      type: "email",
      message: t("register.validation.email_valid"),
      trigger: "blur",
    },
  ],
  nickname: [
    {
      required: true,
      message: t("register.validation.nickname_required"),
      trigger: "blur",
    },
    {
      min: 2,
      max: 20,
      message: t("register.validation.nickname_length"),
      trigger: "blur",
    },
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/,
      message: t("register.validation.nickname_pattern"),
      trigger: "blur",
    },
  ],
  password: [
    {
      required: true,
      message: t("register.validation.password_required"),
      trigger: "blur",
    },
    { min: 6, message: t("register.validation.password_min"), trigger: "blur" },
  ],
  confirmPassword: [
    {
      required: true,
      message: t("register.validation.confirm_password_required"),
      trigger: "blur",
    },
    { min: 6, message: t("register.validation.password_min"), trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error(t("register.validation.passwords_match")));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  agreement: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error(t("register.validation.agree_to_terms")));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
  code: [
    {
      required: true,
      message: t("register.validation.code_required"),
      trigger: "blur",
    },
    {
      min: 6,
      max: 6,
      message: t("register.validation.code_length"),
      trigger: "blur",
    },
  ],
};

// 加载状态
const isLoading = ref(false);

// 发送验证码
const sendVerificationCode = async () => {
  if (!registerForm.email) {
    ElMessage.warning(t("register.messages.enter_email_first"));
    return;
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(registerForm.email)) {
    ElMessage.warning(t("register.messages.enter_valid_email"));
    return;
  }

  // 验证是否同意服务条款和隐私政策
  if (!registerForm.agreement) {
    ElMessage.warning(t("register.messages.agree_to_terms_first"));
    return;
  }

  // 验证人机验证
  const captchaToken = (
    document.querySelector('[name="cf-turnstile-response"]') as HTMLInputElement
  )?.value;
  if (!captchaToken) {
    ElMessage.warning(t("register.messages.complete_captcha"));
    return;
  }

  try {
    // 获取人机验证 token
    const captchaToken = (
      document.querySelector(
        '[name="cf-turnstile-response"]',
      ) as HTMLInputElement
    )?.value;

    // 调用后端注册验证码接口
    const result = await authApi.sendRegisterVerificationCode({
      email: registerForm.email,
      "cf-turnstile-response": captchaToken,
    });

    if (result.code === 200) {
      ElMessage.success(t("register.messages.code_sent_successfully"));

      // 开始倒计时
      registerForm.codeCountdown = 60;
      const countdownInterval = setInterval(() => {
        registerForm.codeCountdown--;
        if (registerForm.codeCountdown <= 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);
    } else {
      ElMessage.error(result.msg || t("register.messages.send_code_failed"));
    }
  } catch (error) {
    console.error("发送验证码失败:", error);
    ElMessage.error(t("register.messages.send_code_failed"));
  }
};

// 注册处理
const handleRegister = async () => {
  if (!registerFormRef.value) return;

  // 清空之前的错误信息
  formError.value = "";

  try {
    await registerFormRef.value.validate();
    isLoading.value = true;

    // 获取人机验证 token
    const captchaToken = (
      document.querySelector(
        '[name="cf-turnstile-response"]',
      ) as HTMLInputElement
    )?.value;
    if (!captchaToken) {
      ElMessage.warning(t("register.messages.complete_captcha"));
      isLoading.value = false;
      return;
    }

    // 调用后端注册接口
    const result = await authApi.register({
      email: registerForm.email,
      nickname: registerForm.nickname,
      password: registerForm.password,
      password_confirmation: registerForm.confirmPassword,
      code: registerForm.code,
      "cf-turnstile-response": captchaToken,
    });

    if (result.code === 200) {
      // 注册成功，保存token和用户信息
      localStorage.setItem("access_token", result.data.token);

      // 保存完整的用户信息到localStorage
      const userInfo = result.data.user;
      localStorage.setItem("user_info", JSON.stringify(userInfo));

      ElMessage.success(t("register.messages.register_success"));
      router.push("/");
    } else {
      // 使用表单全局错误信息显示后端返回的错误
      formError.value = result.msg || t("register.messages.register_failed");
    }

    isLoading.value = false;
  } catch (error: any) {
    console.error("注册失败:", error);
    // 使用表单全局错误信息显示网络错误
    formError.value =
      error.message || t("register.messages.register_failed_retry");
    isLoading.value = false;
  }
};

// Google注册处理
const handleGoogleRegister = () => {
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
  window.open(googleAuthUrl, "_blank", "width=800,height=600");
};

// GitHub注册处理
const handleGitHubRegister = () => {
  // 直接生成GitHub授权URL
  const githubAuthUrl =
    "https://github.com/login/oauth/authorize" +
    "?client_id=" +
    import.meta.env.VITE_GITHUB_CLIENT_ID +
    "&redirect_uri=" +
    window.location.origin +
    "/github-callback" +
    "&scope=user:email,repo";
  window.open(githubAuthUrl, "_blank", "width=800,height=600");
};

// 跳转到登录页面
const goToLogin = () => {
  router.push("/login");
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
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--el-color-info-light-9);
  padding: 20px;
}

.register-box {
  background-color: var(--el-bg-color);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 900px;
  display: flex;
  transition: all 0.3s ease;
  overflow: hidden;
}

.register-box:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

/* 左侧平台介绍 */
.register-left {
  flex: 1;
  padding: 40px;
  background: linear-gradient(135deg, #337ecc 0%, #409eff 100%);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 右侧注册表单 */
.register-right {
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
  color: white;
}

.intro-feature p {
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.9;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

.logo-container {
  text-align: center;
  margin-bottom: 30px;
}

.register-left .logo-container {
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

.register-left .title {
  color: white;
}

.subtitle {
  font-size: 16px;
  color: #909399;
  margin: 0;
}

.register-left .subtitle {
  color: rgba(255, 255, 255, 0.9);
}

.login-link {
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

.google-icon {
  margin-right: 8px;
  vertical-align: middle;
}

/* 验证码容器样式 */
.captcha-container {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-box {
    flex-direction: column;
  }

  .register-left {
    padding: 30px;
  }

  .register-right {
    padding: 30px;
  }

  .intro-content {
    margin-top: 20px;
  }

  .intro-feature {
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .register-box {
    padding: 20px;
  }

  .title {
    font-size: 24px;
  }
}
</style>
