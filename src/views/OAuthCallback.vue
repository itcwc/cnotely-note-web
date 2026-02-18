<template>
  <div class="callback-container">
    <div class="callback-content" v-if="!isCompleted">
      <el-icon class="loading-icon">
        <Loading />
      </el-icon>
      <h3>{{ t('oauth_callback.processing_login') }}</h3>
      <p>{{ t('oauth_callback.please_wait') }}</p>
    </div>
    <div class="callback-content" v-else>
      <el-icon class="success-icon" v-if="isSuccess">
        <CircleCheck />
      </el-icon>
      <el-icon class="error-icon" v-else>
        <CircleClose />
      </el-icon>
      <h3>{{ isSuccess ? t('oauth_callback.login_success') : t('oauth_callback.login_failure') }}</h3>
      <p>{{ message }}</p>
      <el-button type="primary" @click="manualClose">{{ t('oauth_callback.close_window') }}</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { Loading, CircleCheck, CircleClose } from "@element-plus/icons-vue";
import { authApi } from "../api/auth";

const route = useRoute();
const { t } = useI18n();
const isCompleted = ref(false);
const isSuccess = ref(true);
const message = ref(t('oauth_callback.redirecting_home'));

// 手动关闭窗口函数
const manualClose = () => {
  try {
    window.close();
  } catch (error) {
    console.error("无法关闭窗口:", error);
  }
};

onMounted(async () => {
  // try {
    // 获取URL参数
    const params = route.query;

    // 根据当前路径判断OAuth提供商
    let provider = "";
    if (window.location.pathname.includes("github")) {
      provider = "github";
    } else if (window.location.pathname.includes("google")) {
      provider = "google";
    }

    if (!provider) {
      throw new Error("无法识别OAuth提供商");
    }

    // 检查是否有授权码
    if (!params.code) {
      throw new Error("授权失败：未获取到授权码");
    }

    // 检查用户是否已经登录
    const isLoggedIn = localStorage.getItem("user_info") !== null;

    if (isLoggedIn) {
      // 用户已登录，执行绑定流程
      const userApi = await import("../api/user/index").then((m) => m.userApi);
      const result = await userApi.bindOAuthAccount(
        provider,
        params.code as string,
      );

      if (result.code === 200) {
        // 存储用户信息到 localStorage
        if (result.data.user) {
          localStorage.setItem("user_info", JSON.stringify(result.data.user));
        }

        // 存储 token 到 localStorage
        if (result.data.token) {
          localStorage.setItem("access_token", result.data.token);
        }

        // 发送成功消息给主窗口
        window.opener?.postMessage(
          {
            type: `${provider}-login-success`,
            message: `${provider} 账号绑定成功`,
          },
          window.location.origin,
        );

        isSuccess.value = true;
        message.value = `${provider} 账号绑定成功`;
      } else {
        // 发送失败消息给主窗口
        window.opener?.postMessage(
          {
            type: `${provider}-login-failure`,
            message: result.msg || `${provider} 账号绑定失败`,
          },
          window.location.origin,
        );

        isSuccess.value = false;
        message.value = result.msg || `${provider} 账号绑定失败`;
      }
    } else {
      // 用户未登录，执行登录流程
      // 调用后端统一的OAuth登录接口
      const result = await authApi.oauthLogin({
        provider,
        code: params.code as string,
      });

      if (result.code === 200) {
        // 存储用户信息到 localStorage
        if (result.data.user) {
          localStorage.setItem("user_info", JSON.stringify(result.data.user));
        }

        // 存储 token 到 localStorage
        if (result.data.token) {
          localStorage.setItem("access_token", result.data.token);
        }

        // 发送成功消息给主窗口
        window.opener?.postMessage(
          {
            type: `${provider}-login-success`,
            ...result.data,
          },
          window.location.origin,
        );

        isSuccess.value = true;
        message.value = t('oauth_callback.redirecting_home');
      } else {
        // 发送失败消息给主窗口
        window.opener?.postMessage(
          {
            type: `${provider}-login-failure`,
            message: result.msg || "登录失败",
          },
          window.location.origin,
        );

        isSuccess.value = false;
        message.value = result.msg || "登录失败，请重试";
      }
    }

    // 如果是在主窗口打开的回调页面，直接跳转到首页
    if (!window.opener) {
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  // } catch (error: any) {
  //   console.error("OAuth操作失败:", error);

  //   // 发送失败消息给主窗口
  //   window.opener?.postMessage(
  //     {
  //       type: "oauth-login-failure",
  //       message: error.message || "操作失败，请重试",
  //     },
  //     window.location.origin,
  //   );

  //   isSuccess.value = false;
  //   message.value = error.message || "操作失败，请重试";
  // } finally {
  //   // 显示完成状态
  //   isCompleted.value = true;

  //   // 延迟一段时间后尝试关闭窗口
  //   // setTimeout(() => {
  //   //   try {
  //   //     window.close();
  //   //   } catch (error) {
  //   //     console.error("无法自动关闭窗口:", error);
  //   //   }
  //   // }, 3000);
  // }
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
  /* color: #303133; */
  margin-bottom: 10px;
}

p {
  font-size: 16px;
  /* color: #909399; */
  margin-bottom: 20px;
}

.callback-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.callback-content button {
  margin-top: 20px;
}
</style>
