<template>
  <div class="setting-section">
    <h2 class="section-title">{{ t('settings_view.title') }}</h2>
    <el-divider />

    <!-- 基础设置 -->
    <div class="setting-subsection">
      <h3 class="subsection-title">{{ t('settings_view.basic_settings') }}</h3>
      <el-form :model="editorConfig" label-width="120px" class="editor-form">
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
            :placeholder="t('settings_view.select_language')"
            class="language-select"
            style="width: 180px"
          >
            <el-option value="en" label="English"></el-option>
            <el-option value="zh-CN" label="中文"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <el-divider style="margin: 30px 0" />

    <!-- 编辑器设置 -->
    <div class="setting-subsection">
      <h3 class="subsection-title">{{ t('settings_view.editor_settings') }}</h3>
      <el-form :model="editorConfig" label-width="120px" class="editor-form">
        <!-- 编辑器主题选择 -->
        <el-form-item :label="t('settings_view.editor_theme')">
          <el-select
            v-model="editorConfig.editorTheme"
            @change="
              saveToLocalStorage('editorTheme', editorConfig.editorTheme)
            "
            :placeholder="t('settings_view.choose_editor_theme')"
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
            v-model="editorConfig.editorAreaTheme"
            @change="
              saveToLocalStorage(
                'editorAreaTheme',
                editorConfig.editorAreaTheme,
              )
            "
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
            v-model="editorConfig.previewAreaTheme"
            @change="
              saveToLocalStorage(
                'previewAreaTheme',
                editorConfig.previewAreaTheme,
              )
            "
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
      <h4 class="preview-title">{{ t('settings_view.editor_preview') }}</h4>
      <div id="test-editormd">
        <Editormd
          v-model="selectedFile.content"
          :height="200"
          :edit-language="'en'"
          :editor-theme="props.editorConfig.editorTheme"
          :editor-area-theme="props.editorConfig.editorAreaTheme"
          :preview-area-theme="props.editorConfig.previewAreaTheme"
        />
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="save-button-container">
      <!-- <el-button type="success" @click="saveEditorConfig">
        <el-icon><Check /></el-icon>
        {{ t('settings_view.save_settings') }}
      </el-button> -->
      <el-button type="danger" @click="resetSettings" style="margin-left: 10px">
        <el-icon><RefreshRight /></el-icon>
        {{ t('settings_view.reset') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { Check, Moon, Sunny, RefreshRight } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import Editormd from "../Editormd.vue";

const { t } = useI18n();

// Props
interface EditorConfig {
  fontSize: number;
  lineHeight: string;
  autoSave: boolean;
  realTimePreview: boolean;
  editorTheme: string;
  editorAreaTheme: string;
  previewAreaTheme: string;
}

const props = defineProps<{
  editorConfig: EditorConfig;
}>();
const selectedFile = ref({ content: t("settings_view.demo_content") });
// Emits
const emit = defineEmits<{
  (e: "update:editorConfig", config: EditorConfig): void;
  (e: "editor-config-updated", config: EditorConfig): void;
}>();

// 网站主题状态
const isDarkTheme = ref(localStorage.getItem("theme") === "dark");

// 语言设置
const { locale } = useI18n();
const savedLanguage = localStorage.getItem("selectedLanguage");
const selectedLanguage = ref(savedLanguage || "en");

// 初始化语言
locale.value = selectedLanguage.value;

// 编辑器主题列表
const editorThemes = ["default", "dark"];

// 编辑区域主题列表
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

// 预览区域主题列表
const previewThemes = ["default", "dark"];

// 保存到 localStorage
const saveToLocalStorage = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

// 切换网站主题
const toggleTheme = (value: boolean) => {
  const theme = value ? "dark" : "light";
  document.documentElement.classList.toggle("dark", value);
  localStorage.setItem("theme", theme);

  // 根据主题自动调整编辑器主题
  if (theme === "dark") {
    props.editorConfig.editorTheme = "dark";
    props.editorConfig.editorAreaTheme = "lesser-dark";
    props.editorConfig.previewAreaTheme = "dark";
    saveToLocalStorage("editorTheme", "dark");
    saveToLocalStorage("editorAreaTheme", "lesser-dark");
    saveToLocalStorage("previewAreaTheme", "dark");
  } else if (theme === "light") {
    props.editorConfig.editorTheme = "default";
    props.editorConfig.editorAreaTheme = "default";
    props.editorConfig.previewAreaTheme = "default";
    saveToLocalStorage("editorTheme", "default");
    saveToLocalStorage("editorAreaTheme", "default");
    saveToLocalStorage("previewAreaTheme", "default");
  }
};

// 保存编辑器配置
const saveEditorConfig = () => {
  emit("editor-config-updated", props.editorConfig);
  ElMessage.success(t('settings_view.save_settings'));
};

// 更改语言
const changeLanguage = (newLanguage: string) => {
  locale.value = newLanguage;
  localStorage.setItem("selectedLanguage", newLanguage);
  selectedLanguage.value = newLanguage;
  ElMessage.success(t('settings_view.select_language'));
};

// 重置设置
const resetSettings = () => {
  // 仅清除指定的编辑器主题配置
  localStorage.removeItem("editorAreaTheme");
  localStorage.removeItem("editorTheme");
  localStorage.removeItem("previewAreaTheme");

  ElMessage.success(t('settings_view.reset_success'));
  // 延迟刷新页面，让消息有时间显示
  setTimeout(() => {
    location.reload();
  }, 2000);
};

// 组件挂载时初始化网站主题
onMounted(() => {
  document.documentElement.classList.toggle("dark", isDarkTheme.value);
});
</script>

<style scoped>
.section-title {
  font-size: 20px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin-bottom: 15px;
}

.editor-form {
  background-color: var(--el-color-info-light-9);
  padding: 20px;
  border-radius: 4px;
}

/* 滑块值样式 */
.slider-value {
  margin-left: 10px;
  font-size: 14px;
  color: #606266;
}

/* 主题选择器样式 */
.theme-select {
  width: 180px;
  margin-right: 10px;
}

/* 编辑器预览区域样式 */
.editor-preview-section {
  margin: 30px 0 30px 0;
  padding: 20px;
  background-color: var(--el-color-info-light-9);
  border-radius: 4px;
}

.preview-title {
  font-size: 16px;
  font-weight: bold;
  /* color: #606266; */
  margin-bottom: 15px;
}

#test-editormd {
  margin-top: 20px;
  /* border: 1px solid #e4e7ed; */
  border-radius: 4px;
  overflow: hidden;
}
</style>
