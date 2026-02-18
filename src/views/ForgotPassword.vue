<template>
  <div class="forgot-password-container">
    <div class="forgot-password-box">
      <!-- Logo -->
      <div class="logo-container">
        <img src="/icon.png" alt="Cnotely Logo" class="logo" />
        <h2 class="title">Cnotely</h2>
        <p class="subtitle">{{ t('forgot_password.title') }}</p>
      </div>

      <!-- 步骤指示器 -->
      <div class="steps-indicator">
        <div class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
          <div class="step-number">1</div>
          <div class="step-label">{{ t('forgot_password.steps.verify_email') }}</div>
        </div>
        <div class="step-line"></div>
        <div class="step" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
          <div class="step-number">2</div>
          <div class="step-label">{{ t('forgot_password.steps.reset_password') }}</div>
        </div>
      </div>

      <!-- 第一步：验证邮箱 -->
      <el-form v-if="currentStep === 1" :model="step1Form" :rules="step1Rules" ref="step1FormRef" label-position="left"
        label-width="80px" size="large">
        <!-- 全局错误信息 -->
        <el-form-item v-if="formError" prop="global" style="margin-bottom: 10px;">
          <div class="form-error-message">{{ formError }}</div>
        </el-form-item>

        <el-form-item :label="t('forgot_password.form.email')" prop="email">
          <el-input v-model="step1Form.email" :placeholder="t('forgot_password.placeholders.email')" type="email">
            <template #prefix>
              <el-icon>
                <Message />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item :label="t('forgot_password.form.verification_code')" prop="code">
          <div class="code-input-container">
            <el-input v-model="step1Form.code" :placeholder="t('forgot_password.placeholders.verification_code')" type="text" style="width: 60%">
              <template #prefix>
                <el-icon>
                  <Message />
                </el-icon>
              </template>
            </el-input>
            <el-button type="primary" :disabled="step1Form.codeCountdown > 0" @click="sendVerificationCode"
              style="width: 35%" size="large">
              {{ step1Form.codeCountdown > 0 ? t('forgot_password.buttons.resend_code', { seconds: step1Form.codeCountdown }) : t('forgot_password.buttons.send_code') }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" native-type="submit" :loading="isLoading" block size="large"
            @click="handleStep1Next">
            {{ t('forgot_password.buttons.next_step') }}
          </el-button>
        </el-form-item>

        <el-form-item>
          <div class="back-link">
            <el-link type="primary" :underline="false" @click="goToLogin">{{ t('forgot_password.buttons.back_to_login') }}</el-link>
          </div>
        </el-form-item>
      </el-form>

      <!-- 第二步：重置密码 -->
      <el-form v-if="currentStep === 2" :model="step2Form" :rules="step2Rules" ref="step2FormRef" label-position="left"
        label-width="80px" size="large">
        <!-- 全局错误信息 -->
        <el-form-item v-if="formError" prop="global" style="margin-bottom: 10px;">
          <div class="form-error-message">{{ formError }}</div>
        </el-form-item>

        <el-form-item :label="t('forgot_password.form.new_password')" prop="newPassword">
          <el-input v-model="step2Form.newPassword" :placeholder="t('forgot_password.placeholders.new_password')" type="password" show-password>
            <template #prefix>
              <el-icon>
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item :label="t('forgot_password.form.confirm_password')" prop="confirmPassword">
          <el-input v-model="step2Form.confirmPassword" :placeholder="t('forgot_password.placeholders.confirm_password')" type="password" show-password>
            <template #prefix>
              <el-icon>
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" native-type="submit" :loading="isLoading" block size="large"
            @click="handleResetPassword">
            {{ t('forgot_password.buttons.reset_password') }}
          </el-button>
        </el-form-item>

        <el-form-item>
          <div class="back-link">
            <el-link type="primary" :underline="false" @click="currentStep = 1">{{ t('forgot_password.buttons.previous_step') }}</el-link>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElForm, ElFormItem, ElInput, ElButton, ElLink, FormRules } from 'element-plus';
import { Message, Lock } from '@element-plus/icons-vue';
import { authApi } from '../api/auth';

const { t } = useI18n();

const router = useRouter();
const step1FormRef = ref<InstanceType<typeof ElForm>>();
const step2FormRef = ref<InstanceType<typeof ElForm>>();

// 当前步骤
const currentStep = ref(1);

// 表单全局错误信息
const formError = ref('');

// 加载状态
const isLoading = ref(false);

// 第一步表单数据
const step1Form = reactive({
  email: '',
  code: '',
  codeCountdown: 0
});

// 第二步表单数据
const step2Form = reactive({
  newPassword: '',
  confirmPassword: ''
});

// 第一步表单验证规则
const step1Rules: FormRules = {
  email: [
    { required: true, message: t('forgot_password.validation.email_required'), trigger: 'blur' },
    { type: 'email', message: t('forgot_password.validation.email_valid'), trigger: 'blur' }
  ],
  code: [
    { required: true, message: t('forgot_password.validation.code_required'), trigger: 'blur' },
    { min: 6, max: 6, message: t('forgot_password.validation.code_length'), trigger: 'blur' }
  ]
};

// 第二步表单验证规则
const step2Rules: FormRules = {
  newPassword: [
    { required: true, message: t('forgot_password.validation.password_required'), trigger: 'blur' },
    { min: 6, message: t('forgot_password.validation.password_min'), trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: t('forgot_password.validation.confirm_password_required'), trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== step2Form.newPassword) {
          callback(new Error(t('forgot_password.validation.passwords_match')));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 发送验证码
const sendVerificationCode = async () => {
  if (!step1Form.email) {
    ElMessage.warning(t('forgot_password.messages.enter_email_first'));
    return;
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(step1Form.email)) {
    ElMessage.warning(t('forgot_password.messages.enter_valid_email'));
    return;
  }

  try {
    // 清空之前的错误信息
    formError.value = '';

    const result = await authApi.sendForgotPasswordCode({
      email: step1Form.email
    });

    if (result.code === 200) {
      ElMessage.success(t('forgot_password.messages.code_sent_successfully'));

      // 开始倒计时
      step1Form.codeCountdown = 60;
      const countdownInterval = setInterval(() => {
        step1Form.codeCountdown--;
        if (step1Form.codeCountdown <= 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);
    } else {
      // 使用表单全局错误信息显示后端返回的错误
      formError.value = result.msg || t('forgot_password.messages.send_code_failed');
    }
  } catch (error: any) {
    console.error('发送验证码失败:', error);
    // 使用表单全局错误信息显示网络错误
    formError.value = error.message || t('forgot_password.messages.send_code_failed_retry');
  }
};

// 第一步：验证邮箱和验证码格式
const handleStep1Next = async () => {
  if (!step1FormRef.value) return;

  try {
    // 清空之前的错误信息
    formError.value = '';

    // 仅验证表单格式，不调用后端API验证验证码
    await step1FormRef.value.validate();
    isLoading.value = true;

    // 表单验证通过，直接进入第二步
    // 验证码将在第二步的重置密码接口中传递
    setTimeout(() => {
      isLoading.value = false;
      currentStep.value = 2;
    }, 500); // 短暂延迟，提升用户体验
  } catch (error: any) {
    console.error('表单验证失败:', error);
    // 使用表单全局错误信息显示验证失败
    formError.value = error.message || t('forgot_password.messages.verification_failed');
    isLoading.value = false;
  }
};

// 第二步：重置密码
const handleResetPassword = async () => {
  if (!step2FormRef.value) return;

  try {
    // 清空之前的错误信息
    formError.value = '';

    await step2FormRef.value.validate();
    isLoading.value = true;

    const result = await authApi.resetPassword({
      email: step1Form.email,
      code: step1Form.code,
      password: step2Form.newPassword,
      password_confirmation: step2Form.confirmPassword
    });

    if (result.code === 200) {
      ElMessage.success(t('forgot_password.messages.password_reset_success'));
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } else {
      // 使用表单全局错误信息显示后端返回的错误
      formError.value = result.msg || t('forgot_password.messages.password_reset_failed');
      isLoading.value = false;
    }
  } catch (error: any) {
    console.error('重置密码失败:', error);
    // 使用表单全局错误信息显示网络错误
    formError.value = error.message || t('forgot_password.messages.reset_failed_retry');
    isLoading.value = false;
  }
};

// 返回登录页面
const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--el-color-info-light-9);
  padding: 20px;
}

.forgot-password-box {
  background-color: var(--el-bg-color);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  transition: all 0.3s ease;
}

.forgot-password-box:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.logo-container {
  text-align: center;
  margin-bottom: 30px;
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

.subtitle {
  font-size: 16px;
  color: #909399;
  margin: 0;
}

.steps-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  padding: 0 20px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #dcdfe6;
  color: #909399;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background-color: #409eff;
  color: white;
}

.step.completed .step-number {
  background-color: #67c23a;
  color: white;
}

.step-label {
  font-size: 12px;
  color: #909399;
}

.step.active .step-label {
  color: #409eff;
  font-weight: bold;
}

.step.completed .step-label {
  color: #67c23a;
}

.step-line {
  width: 60px;
  height: 2px;
  background-color: #dcdfe6;
  margin: 0 10px;
}

.step.completed~.step-line {
  background-color: #67c23a;
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

.back-link {
  text-align: center;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .forgot-password-box {
    padding: 20px;
  }

  .title {
    font-size: 24px;
  }

  .step-line {
    width: 40px;
  }
}
</style>