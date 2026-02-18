<template>
  <el-aside class="setting-aside" :style="{ width: `${panel1Size}px` }">
    <div class="user-panel">
      <!-- 左侧面板顶部用户信息 -->
      <div class="left-panel-user-info">
        <div class="user-info" @click="handleAvatarClick">
          <!-- 判断userInfo.avatar是否为颜色值 -->
          <template v-if="isColorValue(userInfo.avatar)">
            <!-- 是颜色值，显示文字头像加背景色 -->
            <el-avatar
              size="default"
              :style="{ backgroundColor: userInfo.avatar }"
            >
              {{
                isLoggedIn
                  ? userInfo.nickname
                    ? userInfo.nickname.slice(0, 2)
                    : "U"
                  : t('compile_view.login')
              }}
            </el-avatar>
          </template>
          <template v-else>
            <!-- 不是颜色值，显示图片链接 -->
            <el-avatar size="default" :src="userInfo.avatar">
              {{
                isLoggedIn
                  ? userInfo.nickname
                    ? userInfo.nickname.slice(0, 2)
                    : "U"
                  : t('compile_view.login')
              }}
            </el-avatar>
          </template>
          <div v-if="isLoggedIn && panel1Size > 50" class="user-details">
            <div class="user-nickname">{{ userInfo.nickname }}</div>
            <div class="user-email">{{ userInfo.email }}</div>
          </div>
        </div>
      </div>

      <!-- 登录/退出登录按钮，根据登录状态动态显示 -->
      <div class="login-logout-container" @click="handleLoginLogout">
        <template v-if="isLoggedIn">
          <logout
            class="user-icon"
            fill="#409EFF"
            theme="outline"
            size="16"
            :strokeWidth="3"
          />
          <span v-if="panel1Size >= 200" class="logout-text">{{ t('compile_view.logout') }}</span>
        </template>
        <template v-else>
          <login
            class="user-icon"
            fill="#409EFF"
            theme="outline"
            size="16"
            :strokeWidth="3"
          />
          <span v-if="panel1Size >= 200" class="logout-text">{{ t('compile_view.login') }}</span>
        </template>
      </div>

      <div class="file-add">
        <el-button
          v-if="panel1Size < 200"
          type="primary"
          :icon="Plus"
          class="file-add-button-small"
          @click="openNewFileDialog"
        />
        <el-button
          v-if="panel1Size >= 200"
          type="primary"
          :icon="Plus"
          class="file-add-button-large"
          @click="openNewFileDialog"
        >
          <div class="file-add-text">{{ t('compile_view.new_note') }}</div>
        </el-button>
      </div>

      <!-- 版面调整图标容器 -->
      <div class="icon-container">
        <!-- 浏览器图标容器，当面板宽度较小时显示 -->
        <div v-if="panel1Size <= 50" class="browser-icons">
          <!-- Chrome 浏览器图标 -->
          <a
            href="https://chromewebstore.google.com/detail/cnotely-%E2%80%93-save-web-content/adckfinclpmhjnijmeeejkdhocikacgd"
            target="_blank"
            class="browser-icon-link"
          >
            <img
              src="/imgs/icon/google_favicon.png"
              alt="Chrome"
              class="browser-icon"
              :title="t('compile_view.chrome_extension')"
            />
          </a>
          <!-- Edge 浏览器图标 -->
          <a
            href="https://microsoftedge.microsoft.com/addons/detail/bdcofhehaohhfckpelmkkpmigoemecpp"
            target="_blank"
            class="browser-icon-link"
          >
            <img
              src="/imgs/icon/microsoft_favicon.png"
              alt="Edge"
              class="browser-icon"
              :title="t('compile_view.edge_extension')"
            />
          </a>
          <!-- Firefox 浏览器图标 -->
          <a
            href="https://addons.mozilla.org/en-US/firefox/addon/cnote/"
            target="_blank"
            class="browser-icon-link"
          >
            <img
              src="/imgs/icon/mozilla_favicon.png"
              alt="Firefox"
              class="browser-icon"
              :title="t('compile_view.firefox_extension')"
            />
          </a>
          <!-- Markdown 指南图标 -->
          <a
            :href="
              locale === 'zh-CN'
                ? 'https://www.markdown.cn/docs/cheat-sheet/'
                : 'https://www.markdownguide.org/basic-syntax/'
            "
            target="_blank"
            class="browser-icon-link"
          >
            <el-button circle>
              <QuestionFilled class="question-filled-icon" />
            </el-button>
          </a>
        </div>

        <!-- 文本内容，当面板宽度足够时显示 -->
        <div v-else class="panel-content">
          <div class="panel-content-container">
            <div class="panel-content-item under-development">
              {{ t("compile_view.under_development") }}
            </div>

            <div class="panel-content-item browser-extensions">
              {{ t("compile_view.browser_extensions") }}
            </div>

            <br />

            <el-link
              class="extension-link"
              type="primary"
              href="https://chromewebstore.google.com/detail/cnotely-%E2%80%93-save-web-content/adckfinclpmhjnijmeeejkdhocikacgd"
              target="_blank"
            >
              <img
                src="/imgs/icon/google_favicon.png"
                alt="Chrome"
                title="Chrome 扩展"
                class="extension-icon"
              />
              {{ t("compile_view.chrome_extension") }}
            </el-link>

            <br />

            <el-link
              class="extension-link"
              type="primary"
              href="https://microsoftedge.microsoft.com/addons/detail/bdcofhehaohhfckpelmkkpmigoemecpp"
              target="_blank"
            >
              <img
                src="/imgs/icon/microsoft_favicon.png"
                alt="Edge"
                title="Edge 扩展"
                class="extension-icon"
              />
              {{ t("compile_view.edge_extension") }}
            </el-link>

            <br />

            <el-link
              class="extension-link"
              type="primary"
              href="https://addons.mozilla.org/en-US/firefox/addon/cnote/"
              target="_blank"
            >
              <img
                src="/imgs/icon/mozilla_favicon.png"
                alt="Firefox"
                title="Firefox 扩展"
                class="extension-icon"
              />
              {{ t("compile_view.firefox_extension") }}
            </el-link>

            <br />

            <p class="panel-content-item contact-me">
              {{ $t("compile_view.contact_me") }}
            </p>
            <el-link type="primary" href="mailto:support@cnotely.com">
              support@cnotely.com
            </el-link>

            <!-- Markdown 指南链接 -->
            <div class="markdown-guide-container">
              <p class="panel-content-item markdown-guide-title">
                {{ t("compile_view.markdown_guide") }}
              </p>
              <el-link
                :href="
                  locale === 'zh-CN'
                    ? 'https://www.markdown.cn/docs/cheat-sheet/'
                    : 'https://www.markdownguide.org/basic-syntax/'
                "
                target="_blank"
                :underline="false"
                type="primary"
              >
                {{ 
                  locale === "zh-CN"
                    ? t("compile_view.markdown_guide_cn")
                    : t("compile_view.markdown_guide_en")
                }}
              </el-link>
            </div>
          </div>
        </div>

        <el-divider class="custom-divider" />

        <!-- 语言切换 -->
        <div class="language-switcher">
          <el-select
            v-if="panel1Size >= 200"
            v-model="selectedLanguage"
            @change="changeLanguage"
            class="language-select language-select-large"
          >
            <el-option value="en" :label="t('compile_view.english')"></el-option>
            <el-option value="zh-CN" :label="t('compile_view.chinese')"></el-option>
          </el-select>

          <el-button
            v-if="panel1Size < 200"
            @click="showLanguageDialog = true"
            class="language-button"
            circle
          >
            <Translation
              class="translation-icon"
              theme="outline"
              size="22"
              fill="currentcolor"
              :strokeWidth="3"
            />
          </el-button>
        </div>

        <!-- 语言选择弹窗 -->
        <el-dialog v-model="showLanguageDialog" :title="t('settings_view.select_language')" width="200px" center>
          <div class="language-options">
            <div class="language-option" :class="{ 'selected': selectedLanguage === 'en' }" @click="changeLanguage('en')">
              {{ t('settings_view.english') }}
            </div>
            <div class="language-option" :class="{ 'selected': selectedLanguage === 'zh-CN' }" @click="changeLanguage('zh-CN')">
              {{ t('settings_view.chinese') }}
            </div>
          </div>
        </el-dialog>

        <el-button
          @click="handleSettings"
          :underline="false"
          id="settings-link"
          class="settings-button"
          circle
        >
          <Setting class="settings-icon" />
        </el-button>

        <el-divider class="custom-divider" />

        <!-- 1. 默认版面（显示所有面板） v-if="showOtherIcons" -->
        <margin
          class="user-icon"
          theme="outline"
          size="22"
          fill="#909399"
          :strokeWidth="3"
          @click="setLayout(1)"
        />
        <!-- 2. 关闭版面1 v-if="showOtherIcons" -->
        <left-bar
          class="user-icon"
          theme="outline"
          size="22"
          fill="#909399"
          :strokeWidth="3"
          @click="setLayout(2)"
        />
        <!-- 3. 关闭版面1和2 -->
        <align-text-both-one
          class="user-icon"
          theme="outline"
          size="22"
          fill="#909399"
          :strokeWidth="3"
          @click="setLayout(3)"
        />
      </div>
    </div>
  </el-aside>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Setting, Plus, QuestionFilled } from "@element-plus/icons-vue";
import {
  Margin,
  LeftBar,
  AlignTextBothOne,
  Logout,
  Login,
  Translation,
} from "@icon-park/vue-next";

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
  "setLayout",
  "handleSettings",
  "openNewFileDialog",
  "handleLoginLogout",
  "handleAvatarClick",
]);

const router = useRouter();
const { t, locale } = useI18n();

// 语言选择
const selectedLanguage = ref(localStorage.getItem("language") || locale.value);

// 切换语言
const changeLanguage = (lang: string) => {
  selectedLanguage.value = lang;
  locale.value = lang;
  localStorage.setItem("selectedLanguage", lang);
  showLanguageDialog.value = false;
};

/* ================= 语言选择弹窗状态 ================= */

const showLanguageDialog = ref(false);

// 检查是否为颜色值（只验证HEX格式）
const isColorValue = (value: string): boolean => {
  if (!value) return false;
  // 只检查是否为HEX格式（6位或3位），因为系统只会存储这种格式
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
};

const setLayout = (layout: number) => {
  emit("setLayout", layout);
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
/* 左侧面板顶部用户信息样式 */
.left-panel-user-info {
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
  justify-content: center;
}

.user-info:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.user-info .el-avatar {
  margin-bottom: 0;
}

.user-menu-icon {
  margin-left: 5px;
  font-size: 16px;
  color: #909399;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-menu-icon:hover {
  color: #409eff;
}

/* 当面板宽度较小时，隐藏下拉箭头 */
@media (max-width: 120px) {
  .user-menu-icon {
    display: none;
  }
}

.user-details {
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-nickname {
  font-size: 14px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}

/* 当左侧面板宽度足够时显示用户详情 */
@media (max-width: 120px) {
  .user-details {
    display: none;
  }
}

/* 图标容器样式 */
.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  width: 100%;
  margin: auto 0 5px 0;
  /* 合并 margin 声明，确保 margin-top: auto 生效 */
  flex-wrap: wrap;
  /* 允许图标换行 */
}

/* 图标样式 */
.user-icon {
  font-size: 24px;
  cursor: pointer;
  color: #606266;
  transition: color 0.3s;
}

.user-icon:hover {
  color: #409eff;
}

/* 退出登录文本样式 */
.logout-text {
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.logout-text:hover {
  color: #409eff;
}

/* 浏览器图标容器样式 */
.browser-icons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px;
  width: 100%;
  margin: auto 0 10px 0;
}

/* 浏览器图标链接样式 */
.browser-icon-link {
  text-decoration: none;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
}

/* 浏览器图标样式 */
.browser-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  object-fit: contain;
}

/* 文本内容容器样式 */
.panel-content {
  margin-bottom: 10px;
}

/* 响应式设计 */
/* 当宽度小于等于 120px 时，图标垂直排列 */
@media (max-width: 120px) {
  .icon-container {
    flex-direction: column;
    gap: 15px;
  }
}

/* 当宽度大于 120px 时，图标水平排列 */
@media (min-width: 121px) {
  .icon-container {
    flex-direction: row;
    gap: 20px;
  }
}

.user-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  text-align: center;
  height: 100%;
  background-color: var(--el-color-info-light-9);
}

/* 登录/退出登录按钮容器样式 */
.login-logout-container {
  margin-top: -12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
}

/* 文件添加按钮样式 */
.file-add {
  margin: 12px;
}

.file-add-button-small {
  width: 40px;
}

.file-add-button-large {
  /* 按钮大小由 Element Plus 自动处理 */
}

.file-add-text {
  /* 文本样式由 Element Plus 自动处理 */
}

/* QuestionFilled 图标样式 */
.question-filled-icon {
  vertical-align: middle;
  width: 20px;
  height: 20px;
}

/* 面板内容样式 */
.panel-content-container {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.panel-content-item {
  margin: 0 5px;
  color: var(--el-text-color-primary);
}

.panel-content-item.under-development {
  margin-top: 20px;
}

.panel-content-item.browser-extensions {
  margin-top: 10px;
}

.panel-content-item.contact-me {
  margin-top: 10px;
}

.panel-content-item.markdown-guide-title {
  margin-bottom: 10px;
}

/* 扩展链接样式 */
.extension-link {
  margin-top: 2px;
  display: inline-block;
}

/* 扩展图标样式 */
.extension-icon {
  width: 18px;
  height: 18px;
  margin-right: 5px;
  vertical-align: middle;
}

/* Markdown 指南容器样式 */
.markdown-guide-container {
  margin-top: 20px;
}

/* 自定义分割线样式 */
.custom-divider {
  margin: 0;
}

/* 语言切换器样式 */
.language-switcher {
  margin: 5px;
}

/* 语言选择器样式 */
.language-select-large {
  width: 110px;
}

.language-select-small {
  width: 30px;
}

/* 翻译图标样式 */
.translation-icon {
  margin: 2px 0px 0px 0px !important;
}

/* 语言按钮样式 */
.language-button {
  /* 按钮样式由 Element Plus 自动处理 */
}

/* 语言选择弹窗样式 */
.language-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 0;
}

.language-option {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.language-option:hover {
  background-color: var(--el-color-primary-light-9);
}

.language-option.selected {
  background-color: var(--el-color-primary-light-9);
  font-weight: 500;
}

/* 设置按钮样式 */
/* .settings-button {
  按钮样式由 Element Plus 自动处理
} */

/* 设置图标样式 */
.settings-icon {
  vertical-align: middle;
  width: 20px;
  height: 20px;
}

.markdown-guide-icon {
  vertical-align: middle;
}

/* 隐藏语言选择器的下拉箭头 */
.language-select-no-arrow :deep(.el-select__caret) {
  display: none;
}
</style>
