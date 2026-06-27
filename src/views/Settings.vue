<template>
  <div class="settings-page">
    <!-- 顶栏 -->
    <div class="settings-topbar">
      <button class="toolbar-btn" @click="goBack" :title="t('settings_view.back_to_editor_page')">
        <el-icon size="18"><ArrowLeft /></el-icon>
      </button>
      <span class="settings-title">{{ t("settings_view.title") }}</span>
      <button class="toolbar-btn toolbar-btn--danger" @click="resetSettings" :title="t('settings_view.reset')">
        <el-icon size="16"><RefreshRight /></el-icon>
      </button>
    </div>

    <!-- 内容区 -->
    <div class="settings-content">
      <!-- 基础设置 -->
      <div class="settings-section">
        <h3 class="section-label">{{ t("settings_view.basic_settings") }}</h3>
        <div class="settings-card">
          <!-- 主题 -->
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-name">{{ t('settings_view.select_theme') }}</span>
              <span class="setting-desc">{{ themeLabels[theme] }}</span>
            </div>
            <div class="segmented-control">
              <button
                v-for="t in themeOptions"
                :key="t.value"
                class="segment-btn"
                :class="{ 'segment-btn--active': theme === t.value }"
                @click="applyTheme(t.value)"
              >{{ t.label }}</button>
            </div>
          </div>
          <!-- 语言 -->
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-name">{{ t('settings_view.select_language') }}</span>
              <span class="setting-desc">{{ t('settings_view.language_desc') }}</span>
            </div>
            <div class="segmented-control">
              <button
                v-for="lang in languageOptions"
                :key="lang.value"
                class="segment-btn"
                :class="{ 'segment-btn--active': selectedLanguage === lang.value }"
                @click="changeLanguage(lang.value)"
              >{{ lang.label }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 账户 -->
      <div class="settings-section">
        <h3 class="section-label">{{ t("settings_view.account") }}</h3>
        <div class="settings-card">
          <div v-if="!isloggedIn" class="setting-row">
            <div class="setting-info">
              <span class="setting-name">{{ t('settings_view.login') }}</span>
              <span class="setting-desc">{{ t('settings_view.login_desc') }}</span>
            </div>
            <div class="login-buttons">
              <button class="auth-btn" @click="handleLoginGitHub" :disabled="loginLoading === 'github'">
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0016 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                GitHub
              </button>
              <button class="auth-btn" @click="handleLoginGoogle" :disabled="loginLoading === 'google'">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
            </div>
          </div>
          <div v-else class="setting-row">
            <div class="setting-info">
              <span class="setting-name">{{ t('settings_view.current_account') }}</span>
              <span class="setting-desc">{{ currentUser?.provider }}</span>
            </div>
            <div class="user-info-display">
              <el-avatar :size="28" :src="currentUser?.avatar" />
              <span class="user-name">{{ currentUser?.name }}</span>
              <button class="auth-btn auth-btn--logout" @click="handleLogout">
                {{ t('settings_view.logout') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 预览 -->
      <div class="settings-section">
        <div class="section-header">
          <h3 class="section-label">{{ t("settings_view.editor_preview") }}</h3>
          <div class="segmented-control segmented-control--sm">
            <button
              class="segment-btn"
              :class="{ 'segment-btn--active': previewMode === 'markdown' }"
              @click="previewMode = 'markdown'"
            >{{ t('settings_view.markdown_editor') }}</button>
            <button
              class="segment-btn"
              :class="{ 'segment-btn--active': previewMode === 'richtext' }"
              @click="previewMode = 'richtext'"
            >{{ t('settings_view.rich_text_editor') }}</button>
          </div>
        </div>
        <p class="preview-hint">{{ t("settings_view.preview_auto_theme") }}</p>
        <div class="settings-preview">
          <RichTextEditor
            v-if="previewMode === 'richtext'"
            v-model="richTextContent"
            :height="height"
          />
          <MarkdownEditor
            v-else
            v-model="selectedFile.content"
            :height="height"
            :editLanguage="editLanguage"
            :editorTheme="autoEditorTheme"
            :editorAreaTheme="autoEditorAreaTheme"
            :previewAreaTheme="autoPreviewTheme"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import MarkdownEditor from "../components/MarkdownEditor.vue";
import RichTextEditor from "../components/RichTextEditor.vue";
import { useI18n } from "vue-i18n";
import {
  ElButton,
  ElSwitch,
  ElMessage,
} from "element-plus";
import { ArrowLeft, RefreshRight } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { useTheme } from "../composables/useTheme";
import {
  loginWithGitHub,
  loginWithGoogle,
  logout as oauthLogout,
  isLoggedIn as checkLoggedIn,
  getCurrentUser,
} from "../utils/pkce";

const { t } = useI18n();
const router = useRouter();
const { theme, applyTheme, THEMES } = useTheme();

const selectedFile = ref({ content: t("settings_view.demo_content") });
const previewMode = ref("markdown");
const richTextContent = ref(t("settings_view.richtext_demo_content"));

const themeOptions = computed(() => [
  { value: 'light', label: t('settings_view.theme_light') },
  { value: 'dark', label: t('settings_view.theme_dark') },
  { value: 'sepia', label: t('settings_view.theme_sepia') },
]);

const themeLabels = computed(() => ({
  light: t('settings_view.theme_light_desc'),
  dark: t('settings_view.theme_dark_desc'),
  sepia: t('settings_view.theme_sepia_desc'),
}));

const languageOptions = computed(() => [
  { value: 'en', label: t('settings_view.english') },
  { value: 'zh-CN', label: t('settings_view.chinese') },
]);

const { locale } = useI18n();
watch(locale, () => {
  selectedFile.value.content = t("settings_view.demo_content");
  richTextContent.value = t("settings_view.richtext_demo_content");
});
const goBack = () => {
  router.push("/");
};

// ============ 账户认证 ============
const isloggedIn = ref(false);
const currentUser = ref(null);
const loginLoading = ref(null);

const refreshAuthState = () => {
  isloggedIn.value = checkLoggedIn();
  currentUser.value = getCurrentUser();
};

const handleLoginGitHub = async () => {
  loginLoading.value = "github";
  try {
    await loginWithGitHub();
  } catch (error) {
    ElMessage.error(error.message || "GitHub 登录失败");
    loginLoading.value = null;
  }
};

const handleLoginGoogle = async () => {
  loginLoading.value = "google";
  try {
    await loginWithGoogle();
  } catch (error) {
    ElMessage.error(error.message || "Google 登录失败");
    loginLoading.value = null;
  }
};

const handleLogout = () => {
  oauthLogout();
  refreshAuthState();
  ElMessage.success(t("compile_view.logout_success"));
};

// 监听 OAuth 回调消息（弹窗模式）
const handleOAuthMessage = (event) => {
  if (event.origin !== window.location.origin) return;
  if (event.data?.type?.includes("login-success")) {
    refreshAuthState();
    loginLoading.value = null;
    ElMessage.success(t("oauth_callback.login_success"));
  } else if (event.data?.type?.includes("login-failure")) {
    loginLoading.value = null;
    ElMessage.error(event.data.message || t("oauth_callback.login_failure"));
  }
};

onMounted(() => {
  refreshAuthState();
  window.addEventListener("message", handleOAuthMessage);
});

onUnmounted(() => {
  window.removeEventListener("message", handleOAuthMessage);
});

// 语言设置内容
const savedLanguage = localStorage.getItem("selectedLanguage");
const selectedLanguage = ref(savedLanguage || "en");
locale.value = selectedLanguage.value;
const editLanguage = ref(savedLanguage || "en");
const changeLanguage = (newLanguage) => {
  selectedLanguage.value = newLanguage;
  locale.value = newLanguage;
  savelocalStorage("selectedLanguage", newLanguage);
  editLanguage.value = newLanguage;
};

// 网站整体主题设置 — moved to useTheme composable
// theme switching handled via applyTheme(t.value) in template

// 自动根据系统主题设置编辑器主题
const autoEditorTheme = computed(() => {
  return theme.value === 'dark' ? 'dark' : 'default';
});

const autoEditorAreaTheme = computed(() => {
  if (theme.value === 'dark') return 'pastel-on-dark';
  if (theme.value === 'sepia') return 'default'; // Sepia 使用默认编辑区主题
  return 'default';
});

const autoPreviewTheme = computed(() => {
  return theme.value === 'dark' ? 'dark' : 'default';
});

const height = "200";

// 保存到 localStorage
const savelocalStorage = (key, value) => {
  localStorage.setItem(key, value);
};

// 保存设置
function saveSettings() {
  ElMessage({
    message: t("settings_view.save_success"),
    type: "success",
    duration: 2000,
  });
}

// 重置设置 - 仅清除指定的设置，不清除所有localStorage
function resetSettings() {
  // 重置语言设置
  selectedLanguage.value = "en";
  locale.value = "en";
  editLanguage.value = "en";

  // 重置网站主题
  applyTheme('light');

  // 清除相关localStorage项
  localStorage.removeItem("editorTheme");
  localStorage.removeItem("editorAreaTheme");
  localStorage.removeItem("previewAreaTheme");
  localStorage.removeItem("selectedLanguage");
  localStorage.removeItem("app-theme");

  ElMessage({
    message: t("settings_view.reset_success"),
    type: "success",
    duration: 2000,
  });
}
</script>

<style scoped>
/* ========== Page Shell ========== */
.settings-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--dt-bg-app);
  font-family: var(--dt-font);
  overflow: hidden;
}

/* ========== Topbar ========== */
.settings-topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 48px;
  padding: 0 16px;
  border-bottom: 1px solid var(--dt-border);
  background: var(--dt-bg-surface);
  flex-shrink: 0;
}

.settings-title {
  flex: 1;
  font-size: var(--dt-text-sm);
  font-weight: 600;
  color: var(--dt-text-primary);
  letter-spacing: 0.01em;
}

/* ========== Content ========== */
.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
}

/* ========== Sections ========== */
.settings-section {
  margin-bottom: 28px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.section-label {
  font-size: var(--dt-text-xs);
  font-weight: 600;
  color: var(--dt-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0;
  padding: 0;
}

/* ========== Card ========== */
.settings-card {
  background: var(--dt-bg-surface);
  border: 1px solid var(--dt-border);
  border-radius: var(--dt-radius-md);
  overflow: hidden;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  min-height: 52px;
  gap: 12px;
}

.setting-row + .setting-row {
  border-top: 1px solid var(--dt-border-light);
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.setting-name {
  font-size: var(--dt-text-sm);
  font-weight: 500;
  color: var(--dt-text-primary);
}

.setting-desc {
  font-size: var(--dt-text-xs);
  color: var(--dt-text-muted);
  line-height: 1.4;
}

/* ========== Segmented Control (Theme Picker) ========== */
.segmented-control {
  display: inline-flex;
  background: var(--dt-bg-app);
  border-radius: var(--dt-radius-md);
  padding: 3px;
  gap: 2px;
}

.segment-btn {
  padding: 5px 14px;
  border: none;
  border-radius: var(--dt-radius-sm);
  background: transparent;
  color: var(--dt-text-muted);
  font-size: var(--dt-text-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.segment-btn:hover {
  color: var(--dt-text-primary);
}

.segment-btn--active {
  background: var(--dt-bg-surface);
  color: var(--dt-text-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.segmented-control--sm .segment-btn {
  padding: 4px 10px;
  font-size: 11px;
}

/* ========== Auth Buttons ========== */
.login-buttons {
  display: flex;
  gap: 8px;
}

.auth-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--dt-border);
  border-radius: var(--dt-radius-sm);
  background: var(--dt-bg-surface);
  color: var(--dt-text-primary);
  font-size: var(--dt-text-xs);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.auth-btn:hover {
  background: var(--dt-bg-hover);
  border-color: var(--dt-text-muted);
}

.auth-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.auth-btn--logout {
  color: #EF4444;
  border-color: #FECACA;
  background: #FEF2F2;
}

.auth-btn--logout:hover {
  background: #FEE2E2;
  border-color: #FCA5A5;
}

.user-info-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: var(--dt-text-sm);
  font-weight: 500;
  color: var(--dt-text-primary);
}

/* ========== Preview ========== */
.settings-preview {
  background: var(--dt-bg-surface);
  border: 1px solid var(--dt-border);
  border-radius: var(--dt-radius-md);
  overflow: hidden;
}

/* ========== Preview hint ========== */
.preview-hint {
  margin: 0 0 12px 0;
  font-size: var(--dt-text-xs);
  color: var(--dt-text-muted);
  padding: 0 4px;
}

/* ========== Toolbar btn overrides ========== */
.toolbar-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--dt-radius-sm);
  border: none;
  background: var(--dt-btn-bg);
  color: var(--dt-btn-icon);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
  padding: 0;
}

.toolbar-btn:hover {
  background: var(--dt-btn-hover);
}

.toolbar-btn--danger {
  color: #EF4444;
}

.toolbar-btn--danger:hover {
  background: #FEE2E2;
}

/* ========== Select overrides ========== */
:deep(.el-select .el-input__wrapper) {
  background: var(--dt-bg-app);
  border-radius: var(--dt-radius-sm);
  border: none;
  box-shadow: none;
  height: 32px;
  padding: 0 10px;
}

:deep(.el-select .el-input__wrapper:hover) {
  background: var(--dt-bg-hover);
}

:deep(.el-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--dt-accent) inset;
  background: var(--dt-bg-surface);
}

:deep(.el-select .el-input__inner) {
  font-size: var(--dt-text-xs);
  color: var(--dt-text-primary);
}

/* ========== Switch overrides ========== */
:deep(.el-switch__label) {
  font-size: var(--dt-text-xs);
  color: var(--dt-text-muted);
}
</style>
