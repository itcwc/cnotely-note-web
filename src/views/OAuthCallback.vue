<template>
  <div class="callback-container">
    <div class="callback-content" v-if="!isCompleted">
      <el-icon class="loading-icon">
        <Loading />
      </el-icon>
      <h3>{{ t("oauth_callback.processing_login") }}</h3>
      <p>{{ t("oauth_callback.please_wait") }}</p>
    </div>
    <div class="callback-content" v-else>
      <el-icon class="success-icon" v-if="isSuccess">
        <CircleCheck />
      </el-icon>
      <el-icon class="error-icon" v-else>
        <CircleClose />
      </el-icon>
      <h3>
        {{
          isSuccess
            ? t("oauth_callback.login_success")
            : t("oauth_callback.login_failure")
        }}
      </h3>
      <p>{{ message }}</p>
      <el-button type="primary" @click="goHome">{{
        t("oauth_callback.close_window")
      }}</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { Loading, CircleCheck, CircleClose } from "@element-plus/icons-vue";
import { handleOAuthCallback } from "../utils/pkce";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const isCompleted = ref(false);
const isSuccess = ref(false);
const message = ref("");

const goHome = () => {
  // 如果是弹窗，关闭；否则跳首页
  if (window.opener) {
    window.close();
  } else {
    router.push("/");
  }
};

onMounted(async () => {
  const code = route.query.code as string;
  const state = route.query.state as string;

  if (!code || !state) {
    isCompleted.value = true;
    isSuccess.value = false;
    message.value = t("oauth_callback.login_failure");
    return;
  }

  try {
    const result = await handleOAuthCallback(code, state);

    // 如果是弹窗模式，通知主窗口
    if (window.opener) {
      window.opener.postMessage(
        {
          type: `${result.provider}-login-success`,
          user: result.user,
        },
        window.location.origin,
      );
      setTimeout(() => window.close(), 500);
    } else {
      // 主窗口模式，直接跳首页
      ElMessage.success(t("oauth_callback.login_success"));
      setTimeout(() => router.push("/"), 800);
    }

    isCompleted.value = true;
    isSuccess.value = true;
    message.value = t("oauth_callback.redirecting_home");
  } catch (error: any) {
    console.error("OAuth 回调失败:", error);

    if (window.opener) {
      window.opener.postMessage(
        {
          type: "oauth-login-failure",
          message: error.message || "登录失败",
        },
        window.location.origin,
      );
    }

    isCompleted.value = true;
    isSuccess.value = false;
    message.value = error.message || t("oauth_callback.login_failure");
  }
});
</script>

<style scoped>
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--el-color-info-light-9);
}

.callback-content {
  text-align: center;
  background-color: var(--el-bg-color);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 20px;
  animation: spin 1s linear infinite;
}

.success-icon {
  font-size: 48px;
  color: #67c23a;
  margin-bottom: 20px;
}

.error-icon {
  font-size: 48px;
  color: #f56c6c;
  margin-bottom: 20px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

h3 {
  font-size: 24px;
  margin-bottom: 10px;
}

p {
  font-size: 16px;
  margin-bottom: 20px;
}

.callback-content button {
  margin-top: 20px;
}
</style>
