<template>
  <div class="setting-section">
    <h2 class="section-title">{{ t('titles.ProfilePassword') }}</h2>
    <el-divider />

    <div class="setting-item">
      <el-form :model="passwordForm" label-width="100px" class="password-form" :rules="passwordRules" ref="passwordFormRef">
        <el-form-item :label="t('forgot_password.form.email')" prop="email">
          <el-input v-model="passwordForm.email" :placeholder="t('forgot_password.placeholders.email')" type="email" disabled />
        </el-form-item>
        <el-form-item :label="t('forgot_password.form.verification_code')" prop="code">
          <div class="code-input-container">
            <el-input v-model="passwordForm.code" :placeholder="t('forgot_password.placeholders.verification_code')" type="text" style="width: 60%" />
            <el-button type="primary" :disabled="passwordForm.codeCountdown > 0" @click="sendVerificationCode"
              style="width: 35%">
              {{ passwordForm.codeCountdown > 0 ? t('forgot_password.buttons.resend_code', { seconds: passwordForm.codeCountdown }) : t('forgot_password.buttons.send_code') }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item :label="t('forgot_password.form.new_password')" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" :placeholder="t('forgot_password.placeholders.new_password')" show-password />
        </el-form-item>
        <el-form-item :label="t('forgot_password.form.confirm_password')" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" :placeholder="t('forgot_password.placeholders.confirm_password')" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="changePassword">
            <el-icon>
              <Check />
            </el-icon>
            {{ t('forgot_password.buttons.reset_password') }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage, ElForm } from 'element-plus';
import { Check } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { authApi } from '../../api/auth';

const { t } = useI18n();

// Props
interface UserInfo {
  email: string;
}

const props = defineProps<{
  userInfo: UserInfo;
}>();

// 密码表单
const passwordForm = ref({
  email: props.userInfo.email,
  code: '',
  codeCountdown: 0,
  newPassword: '',
  confirmPassword: ''
});

// 密码表单验证规则
const passwordRules = {
  code: [
    { required: true, message: t('forgot_password.validation.code_required'), trigger: 'blur' },
    { min: 6, max: 6, message: t('forgot_password.validation.code_length'), trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: t('forgot_password.validation.password_required'), trigger: 'blur' },
    { min: 6, message: t('forgot_password.validation.password_min'), trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: t('forgot_password.validation.confirm_password_required'), trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error(t('forgot_password.validation.passwords_match')));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 表单引用
const passwordFormRef = ref<InstanceType<typeof ElForm>>();

// 发送验证码
const sendVerificationCode = async () => {
  if (!passwordForm.value.email) {
    ElMessage.warning(t('forgot_password.messages.enter_email_first'));
    return;
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(passwordForm.value.email)) {
    ElMessage.warning(t('forgot_password.messages.enter_valid_email'));
    return;
  }

  try {
    const result = await authApi.sendForgotPasswordCode({
      email: passwordForm.value.email
    });

    if (result.code === 200) {
      ElMessage.success(t('forgot_password.messages.code_sent_successfully'));

      // 开始倒计时
      passwordForm.value.codeCountdown = 60;
      const countdownInterval = setInterval(() => {
        passwordForm.value.codeCountdown--;
        if (passwordForm.value.codeCountdown <= 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);
    } else {
      ElMessage.error(result.msg || t('forgot_password.messages.send_code_failed'));
    }
  } catch (error: any) {
    console.error('发送验证码失败:', error);
    ElMessage.error(error.message || t('forgot_password.messages.send_code_failed_retry'));
  }
};

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return;
  
  try {
    await passwordFormRef.value.validate();
    
    // 调用后端修改密码接口
    const result = await authApi.resetPassword({
      email: passwordForm.value.email,
      code: passwordForm.value.code,
      password: passwordForm.value.newPassword,
      password_confirmation: passwordForm.value.confirmPassword
    });
    
    if (result.code === 200) {
      ElMessage.success(t('forgot_password.messages.password_reset_success'));
      // 重置表单
      passwordForm.value.code = '';
      passwordForm.value.newPassword = '';
      passwordForm.value.confirmPassword = '';
    } else {
      ElMessage.error(result.msg || t('forgot_password.messages.password_reset_failed'));
    }
  } catch (error: any) {
    console.error('密码修改失败:', error);
    ElMessage.error(error.message || t('forgot_password.messages.reset_failed_retry'));
  }
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

/* 表单样式 */
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
</style>
