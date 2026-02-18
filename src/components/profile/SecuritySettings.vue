<template>
  <div class="setting-section">
    <h2 class="section-title">安全设置</h2>
    <el-divider />
    
    <div class="security-item">
      <div class="security-item-title">
        <span>邮箱验证</span>
        <el-tag type="success" v-if="securityInfo.emailVerified">已验证</el-tag>
        <el-tag type="warning" v-else>未验证</el-tag>
      </div>
      <div class="security-item-desc">验证邮箱可以提升账号安全性</div>
      <el-button type="primary" v-if="!securityInfo.emailVerified" @click="handleEmailVerification">立即验证</el-button>
    </div>

    <el-divider style="margin: 20px 0;" />

    <div class="security-item">
      <div class="security-item-title">
        <span>二步验证</span>
        <el-tag type="info" v-if="securityInfo.twoFactorEnabled">已开启</el-tag>
        <el-tag type="warning" v-else>未开启</el-tag>
      </div>
      <div class="security-item-desc">开启二步验证可以提升账号安全性</div>
      <el-button type="primary" v-if="!securityInfo.twoFactorEnabled" @click="toggleTwoFactor">开启</el-button>
      <el-button type="danger" v-else @click="toggleTwoFactor">关闭</el-button>
    </div>

    <el-divider style="margin: 20px 0;" />

    <div class="security-item">
      <div class="security-item-title">
        <span>登录设备</span>
      </div>
      <div class="security-item-desc">查看最近登录设备</div>
      <el-button type="primary" @click="viewLoginDevices">查看</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';

// Props
interface SecurityInfo {
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

const props = defineProps<{
  securityInfo: SecurityInfo;
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:securityInfo', securityInfo: SecurityInfo): void;
  (e: 'email-verification', email: string): void;
  (e: 'two-factor-toggle', enabled: boolean): void;
  (e: 'view-login-devices'): void;
}>();

// 处理邮箱验证
const handleEmailVerification = () => {
  emit('email-verification', 'user@example.com'); // 这里应该从用户信息中获取邮箱
  ElMessage.success('验证邮件已发送，请查收');
};

// 切换二步验证
const toggleTwoFactor = () => {
  const newState = !props.securityInfo.twoFactorEnabled;
  emit('update:securityInfo', { ...props.securityInfo, twoFactorEnabled: newState });
  emit('two-factor-toggle', newState);
  ElMessage.success(newState ? '二步验证已开启' : '二步验证已关闭');
};

// 查看登录设备
const viewLoginDevices = () => {
  emit('view-login-devices');
  ElMessage.info('登录设备列表功能开发中');
};
</script>

<style scoped>
.section-title {
  font-size: 20px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin-bottom: 15px;
}

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
</style>