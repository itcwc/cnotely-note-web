<template>
  <el-aside class="left-rail" :style="{ width: `${panel1Size}px` }">
    <div class="rail-inner">
      <!-- Avatar -->
      <div class="rail-avatar" @click="handleAvatarClick">
        <template v-if="isColorValue(userInfo.avatar)">
          <el-avatar size="small" :style="{ backgroundColor: userInfo.avatar }">
            {{ isLoggedIn && userInfo.nickname ? userInfo.nickname.charAt(0) : 'U' }}
          </el-avatar>
        </template>
        <template v-else-if="userInfo.avatar">
          <el-avatar size="small" :src="userInfo.avatar" />
        </template>
        <template v-else>
          <el-avatar size="small" class="default-avatar">
            <el-icon><User /></el-icon>
          </el-avatar>
        </template>
      </div>

      <!-- New Note -->
      <el-button class="rail-btn rail-btn--primary" type="primary" @click="openNewFileDialog" :title="t('compile_view.new_note')">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 4V16M4 10H16" stroke="white" stroke-width="2" stroke-linecap="round" />
        </svg>
      </el-button>

      <!-- Spacer -->
      <div class="rail-spacer"></div>

      <!-- Extensions (compact) -->
      <div class="rail-extensions">
        <a href="https://chromewebstore.google.com/detail/cnotely-%E2%80%93-save-web-content/adckfinclpmhjnijmeeejkdhocikacgd"
          target="_blank" :title="t('compile_view.chrome_extension')">
          <img src="/imgs/icon/google_favicon.png" alt="Chrome" class="ext-icon" />
        </a>
        <a href="https://microsoftedge.microsoft.com/addons/detail/bdcofhehaohhfckpelmkkpmigoemecpp" target="_blank"
          :title="t('compile_view.edge_extension')">
          <img src="/imgs/icon/microsoft_favicon.png" alt="Edge" class="ext-icon" />
        </a>
        <a href="https://addons.mozilla.org/en-US/firefox/addon/cnote/" target="_blank"
          :title="t('compile_view.firefox_extension')">
          <img src="/imgs/icon/mozilla_favicon.png" alt="Firefox" class="ext-icon" />
        </a>

      </div>

      <!-- Theme Toggle -->
      <button class="rail-btn" @click="cycleTheme" :title="themeTooltip">
        <Sunny v-if="theme === 'light'" class="rail-icon" />
        <Moon v-else-if="theme === 'dark'" class="rail-icon" />
        <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none" class="rail-icon">
          <circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.5" />
          <path d="M10 2V4M10 16V18M18 10H16M4 10H2M15.66 4.34L14.24 5.76M5.76 14.24L4.34 15.66M15.66 15.66L14.24 14.24M5.76 5.76L4.34 4.34" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>

      <!-- Language Toggle -->
      <button class="rail-btn rail-btn--lang" @click="toggleLanguage"
        :title="locale === 'zh-CN' ? 'Switch to English' : '切换为中文'">
        {{ locale === 'zh-CN' ? 'EN' : '中' }}
      </button>

      <!-- Settings -->
      <button class="rail-btn" @click="handleSettings" :title="t('settings_view.settings')">
        <Setting class="rail-icon" />
      </button>

      <!-- Login/Logout -->
      <button class="rail-btn" @click="handleLoginLogout"
        :title="isLoggedIn ? t('compile_view.logout') : t('compile_view.login')">
        <component :is="isLoggedIn ? Logout : Login" class="rail-icon" theme="outline" size="18" fill="currentColor"
          :strokeWidth="3" />
      </button>
    </div>
  </el-aside>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { Setting, Sunny, Moon, User } from "@element-plus/icons-vue";
import { Logout, Login } from "@icon-park/vue-next";
import { useTheme } from "../../composables/useTheme";
import { computed } from "vue";

const props = defineProps({
  panel1Size: {
    type: Number,
    default: 50,
  },
  isLoggedIn: {
    type: Boolean,
    default: false,
  },
  userInfo: {
    type: Object,
    default: () => ({
      email: "",
      avatar: "",
      nickname: "",
      access_token: "",
      default_storage_provider: "",
    }),
  },
});

const emit = defineEmits([
  "handleSettings",
  "openNewFileDialog",
  "handleLoginLogout",
  "handleAvatarClick",
]);

const { t, locale } = useI18n();
const { theme, cycleTheme } = useTheme();

const themeLabels = {
  light: '浅色 Light',
  dark: '深色 Dark',
  sepia: '护眼 Sepia',
} as Record<string, string>;

const themeTooltip = computed(() => {
  const name = themeLabels[theme.value] || theme.value;
  return `${t('settings_view.select_theme')} ${name} (${t('compile_view.cycle_theme')})`;
});

// 切换语言
const toggleLanguage = () => {
  const next = locale.value === 'zh-CN' ? 'en' : 'zh-CN';
  locale.value = next;
  localStorage.setItem("selectedLanguage", next);
};

// 检查是否为颜色值（只验证HEX格式）
const isColorValue = (value: string): boolean => {
  if (!value) return false;
  // 只检查是否为HEX格式（6位或3位），因为系统只会存储这种格式
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
};

const handleSettings = () => {
  emit("handleSettings");
};

const openNewFileDialog = () => {
  emit("openNewFileDialog");
};

const handleLoginLogout = () => {
  emit("handleLoginLogout");
};

const handleAvatarClick = () => {
  emit("handleAvatarClick");
};
</script>

<style scoped>
/* All rail styling is in design-tokens.css */
/* Scoped overrides only */

.rail-extensions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 8px 0;
}

.ext-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  opacity: 0.9;
  transition: opacity 0.15s;
}

.ext-icon:hover {
  opacity: 1;
}
</style>
