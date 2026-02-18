<template>
  <div class="settings">
    <el-card shadow="always" class="settings-card">
      <template #header>
        <div class="back-button-container" style="margin-bottom: 20px">
          <el-button type="primary" @click="goBack">
            <el-icon>
              <ArrowLeft />
            </el-icon>
            {{ t('settings_view.back_to_editor_page') }}
          </el-button>
        </div>

        <h2 class="section-title" style="font-size: 20px">
          {{ t("settings_view.title") }}
        </h2>

        <!-- <el-button type="primary" @click="goBack" style="float:right;">{{ t('editor_view.left.back_to_edit_page') }}</el-button> -->
      </template>

      <!-- 基础设置 -->
      <div class="setting-section">
        <h3 class="section-title">{{ t("settings_view.basic_settings") }}</h3>
        <el-form label-width="120px" class="settings-form">
          <!-- 网站整体主题设置 -->
          <el-form-item :label="t('settings_view.select_theme')">
            <el-switch
              v-model="isDarkTheme"
              :active-text="t('settings_view.dark_theme')"
              :inactive-text="t('settings_view.light_theme')"
              :active-icon="Moon"
              :inactive-icon="Sunny"
              @change="toggleTheme"
            />
          </el-form-item>

          <!-- 语言设置 -->
          <el-form-item :label="t('settings_view.select_language')">
            <el-select
              v-model="selectedLanguage"
              @change="changeLanguage"
              class="language-select"
              style="width: 180px"
            >
              <el-option value="en" :label="t('settings_view.english')"></el-option>
              <el-option value="zh-CN" :label="t('settings_view.chinese')"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <el-divider style="margin: 30px 0" />

      <!-- 编辑器设置 -->
      <div class="setting-section">
        <h3 class="section-title">{{ t("settings_view.editor_settings") }}</h3>
        <el-form label-width="120px" class="settings-form">
          <!-- 编辑器主题选择 -->
          <el-form-item :label="t('settings_view.editor_theme')">
            <el-select
              v-model="editorTheme"
              @change="savelocalStorage('editorTheme', editorTheme)"
              placeholder="{{ t('settings_view.choose_editor_theme') }}"
              class="theme-select"
            >
              <el-option
                v-for="theme in editorThemes"
                :key="theme"
                :label="theme"
                :value="theme"
              />
            </el-select>
          </el-form-item>

          <!-- 编辑区域主题选择 -->
          <el-form-item :label="t('settings_view.editor_area_theme')">
            <el-select
              v-model="editorAreaTheme"
              @change="savelocalStorage('editorAreaTheme', editorAreaTheme)"
              :placeholder="t('settings_view.choose_edit_area_theme')"
              class="theme-select"
            >
              <el-option
                v-for="theme in areaThemes"
                :key="theme"
                :label="theme"
                :value="theme"
              />
            </el-select>
          </el-form-item>

          <!-- 预览区域主题选择 -->
          <el-form-item :label="t('settings_view.preview_area_theme')">
            <el-select
              v-model="previewAreaTheme"
              @change="savelocalStorage('previewAreaTheme', previewAreaTheme)"
              :placeholder="t('settings_view.choose_preview_area_theme')"
              class="theme-select"
            >
              <el-option
                v-for="theme in previewThemes"
                :key="theme"
                :label="theme"
                :value="theme"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 编辑器预览区域 -->
      <div class="editor-preview-section">
        <h3 class="preview-title">{{ t("settings_view.editor_preview") }}</h3>
        <div id="test-editormd">
          <Editormd
            v-model="selectedFile.content"
            :height="height"
            :editLanguage="editLanguage"
            :editorTheme="editorTheme"
            :editorAreaTheme="editorAreaTheme"
            :previewAreaTheme="previewAreaTheme"
          />
        </div>
      </div>

      <!-- 保存和重置按钮 -->
      <div class="settings-actions">
        <!-- <el-button type="success" @click="saveSettings">{{
          t("settings_view.save_settings")
        }}</el-button> -->
        <el-button
          type="danger"
          @click="resetSettings"
          style="margin-left: 10px"
          >{{ t("settings_view.reset") }}</el-button
        >
      </div>

      <!-- <el-divider style="margin: 30px 0" /> -->
    </el-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Editormd from "../components/Editormd.vue";
import { useI18n } from "vue-i18n";
import {
  ElButton,
  ElSwitch,
  ElSelect,
  ElOption,
  ElMessage,
} from "element-plus";
import { Sunny, Moon, Setting, ArrowLeft } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();
const selectedFile = ref({ content: t("settings_view.demo_content") });
const goBack = () => {
  const selectedFile = ref({ content: 1 });

  router.push("/");
};

// 语言设置内容
const { locale } = useI18n();
const savedLanguage = localStorage.getItem("selectedLanguage");
const selectedLanguage = ref(savedLanguage || "en");
locale.value = selectedLanguage.value;
const editLanguage = ref(savedLanguage || "en");
const changeLanguage = (event) => {
  const newLanguage = event;
  locale.value = newLanguage;
  savelocalStorage("selectedLanguage", newLanguage);
  editLanguage.value = newLanguage;
};

// 网站整体主题设置内容
const isDarkTheme = ref(localStorage.getItem("theme") === "dark");
document.documentElement.classList.toggle(
  "dark",
  localStorage.getItem("theme") === "dark",
);
const toggleTheme = (value) => {
  const theme = value ? "dark" : "light";
  document.documentElement.classList.toggle("dark", value);
  savelocalStorage("theme", theme);
  if (theme === "dark") {
    editorTheme.value = "dark";
    editorAreaTheme.value = "lesser-dark";
    previewAreaTheme.value = "dark";
    savelocalStorage("editorTheme", "dark");
    savelocalStorage("editorAreaTheme", "lesser-dark");
    savelocalStorage("previewAreaTheme", "dark");
  } else if (theme === "light") {
    editorTheme.value = "default";
    editorAreaTheme.value = "default";
    previewAreaTheme.value = "default";
    savelocalStorage("editorTheme", "default");
    savelocalStorage("editorAreaTheme", "default");
    savelocalStorage("previewAreaTheme", "default");
  }
};

// 编辑器主题设置内容
const editorThemes = ["default", "dark"];

const areaThemes = [
  "default",
  "3024-day",
  "3024-night",
  "ambiance",
  "ambiance-mobile",
  "base16-dark",
  "base16-light",
  "blackboard",
  "cobalt",
  "eclipse",
  "elegant",
  "erlang-dark",
  "lesser-dark",
  "mbo",
  "mdn-like",
  "midnight",
  "monokai",
  "neat",
  "neo",
  "night",
  "paraiso-dark",
  "paraiso-light",
  "pastel-on-dark",
  "rubyblue",
  "solarized",
  "the-matrix",
  "tomorrow-night-eighties",
  "twilight",
  "vibrant-ink",
  "xq-dark",
  "xq-light",
];

const previewThemes = ["default", "dark"];

const height = "200";
const editorTheme = ref(localStorage.getItem("editorTheme") || "default");
const editorAreaTheme = ref(
  localStorage.getItem("editorAreaTheme") || "default",
);
const previewAreaTheme = ref(
  localStorage.getItem("previewAreaTheme") || "default",
);

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
  // 重置编辑器主题设置
  editorTheme.value = "default";
  editorAreaTheme.value = "default";
  previewAreaTheme.value = "default";

  // 重置语言设置
  selectedLanguage.value = "en";
  locale.value = "en";
  editLanguage.value = "en";

  // 重置网站主题
  isDarkTheme.value = false;
  document.documentElement.classList.remove("dark");

  // 清除相关localStorage项
  localStorage.removeItem("editorTheme");
  localStorage.removeItem("editorAreaTheme");
  localStorage.removeItem("previewAreaTheme");
  localStorage.removeItem("selectedLanguage");
  localStorage.removeItem("theme");

  ElMessage({
    message: t("settings_view.reset_success"),
    type: "success",
    duration: 2000,
  });
}
</script>

<style scoped>
.settings {
  font-family: Arial, sans-serif;
  padding: 10px;
}

.settings-card {
  width: 100%;
  margin: 0;
}

#setting {
  font-size: 22px;
  font-weight: bold;
}

/* 设置区块样式 */
.setting-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin: 20px 0 10px 0;
}

/* 表单样式 */
.settings-form {
  background-color: var(--el-color-info-light-9);
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

/* 编辑器预览样式 */
.editor-preview-section {
  margin: 30px 0 30px 0;
  padding: 20px;
  background-color: var(--el-color-info-light-9);
  border-radius: 4px;
}

.preview-title {
  font-size: 16px;
  font-weight: bold;
  color: #606266;
  margin-bottom: 15px;
}

/* 按钮样式 */
.settings-actions {
  display: flex;
  margin-top: 20px;
  margin-bottom: 20px;
}

button {
  margin: 10px 10px 0 0;
}

.language-select {
  width: 180px;
}

.theme-select {
  width: 180px;
  margin-right: 10px;
}
</style>
