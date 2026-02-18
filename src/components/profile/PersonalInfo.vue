<template>
  <div class="setting-section">
    <h2 class="section-title">个人资料</h2>
    <el-divider />
    <el-form :model="userInfo" label-width="120px" class="personal-form">
      <el-form-item label="昵称">
        <el-input v-model="userInfo.nickname" placeholder="请输入昵称" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="userInfo.email" type="email" placeholder="请输入邮箱" disabled />
      </el-form-item>
      <el-form-item label="性别">
        <el-radio-group v-model="userInfo.gender">
          <el-radio label="male">男</el-radio>
          <el-radio label="female">女</el-radio>
          <el-radio label="other">其他</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="生日">
        <el-date-picker v-model="userInfo.birthday" type="date" placeholder="请选择生日" style="width: 100%;" />
      </el-form-item>
      <el-form-item label="简介">
        <el-input v-model="userInfo.bio" type="textarea" :rows="4" placeholder="请输入个人简介" />
      </el-form-item>
      <el-form-item>
        <el-button type="success" @click="savePersonalInfo">
          <el-icon><Check /></el-icon>
          保存修改
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { Check } from '@element-plus/icons-vue';

// Props
interface UserInfo {
  avatar: string;
  nickname: string;
  email: string;
  gender: 'male' | 'female' | 'other';
  birthday: string;
  bio: string;
}

const props = defineProps<{
  userInfo: UserInfo;
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:userInfo', userInfo: UserInfo): void;
  (e: 'personal-info-updated', userInfo: UserInfo): void;
}>();

// 保存个人信息
const savePersonalInfo = () => {
  emit('personal-info-updated', props.userInfo);
  ElMessage.success('个人信息保存成功');
};
</script>

<style scoped>
.section-title {
  font-size: 20px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin-bottom: 15px;
}

.personal-form {
  background-color: #fafafa;
  padding: 20px;
  border-radius: 4px;
}
</style>