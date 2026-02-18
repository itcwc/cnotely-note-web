<template>
  <div class="setting-section">
    <h2 class="section-title">通知设置</h2>
    <el-divider />
    <el-form :model="notificationConfig" label-width="120px" class="notification-form">
      <el-form-item label="邮件通知">
        <el-switch v-model="notificationConfig.emailNotification" />
      </el-form-item>
      <el-form-item label="评论通知">
        <el-switch v-model="notificationConfig.commentNotification" />
      </el-form-item>
      <el-form-item label="系统通知">
        <el-switch v-model="notificationConfig.systemNotification" />
      </el-form-item>
      <el-form-item label="活动通知">
        <el-switch v-model="notificationConfig.activityNotification" />
      </el-form-item>
      <el-form-item label="营销通知">
        <el-switch v-model="notificationConfig.marketingNotification" />
      </el-form-item>
      <el-form-item>
        <el-button type="success" @click="saveNotificationConfig">
          <el-icon><Check /></el-icon>
          保存设置
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { Check } from '@element-plus/icons-vue';

// Props
interface NotificationConfig {
  emailNotification: boolean;
  commentNotification: boolean;
  systemNotification: boolean;
  activityNotification: boolean;
  marketingNotification: boolean;
}

const props = defineProps<{
  notificationConfig: NotificationConfig;
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:notificationConfig', config: NotificationConfig): void;
  (e: 'notification-config-updated', config: NotificationConfig): void;
}>();

// 保存通知配置
const saveNotificationConfig = () => {
  emit('notification-config-updated', props.notificationConfig);
  ElMessage.success('通知设置保存成功');
};
</script>

<style scoped>
.section-title {
  font-size: 20px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin-bottom: 15px;
}

.notification-form {
  background-color: #fafafa;
  padding: 20px;
  border-radius: 4px;
}
</style>