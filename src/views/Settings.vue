<template>
  <div class="settings">
    <el-card shadow="always" class="settings-card">
      <template #header>
        <span id="setting">
          <Setting style="vertical-align: middle; width: 20px; height: 20px;" /> {{ t('settings_view.title') }}
        </span>
        <el-button type="primary" @click="goBack" style="float:right;">{{ t('editor_view.left.back_to_edit_page')
        }}</el-button>
      </template>

      <div class="language">
        <label id="select_language" for="languageSelect">{{ t('settings_view.select_language') }}</label>
        <el-select v-model="selectedLanguage" @change="changeLanguage" class="language-select">
          <el-option value="en" label="English"></el-option>
          <el-option value="zh-CN" label="中文"></el-option>
        </el-select>
      </div>
      <el-divider />
      <div class="theme-preview">
        <label id="select_language" for="languageSelect">{{ t('settings_view.select_theme') }}</label>
        <el-switch v-model="isDarkTheme" active-text="t('settings_view.dark_theme')"
          inactive-text="t('settings_view.light_theme')" :active-icon="Moon" :inactive-icon="Sunny"
          @change="toggleTheme"></el-switch>
      </div>

      <el-divider />

      <div class="themes">
        <label id="theme_label">{{ t('settings_view.editor_theme') }}</label>
        <!-- 编辑器主题选择 -->
        <el-select v-model="editorTheme" @change="savelocalStorage('editorTheme', editorTheme)" placeholder="选择编辑器主题"
          class="theme-select">
          <el-option v-for="theme in editorThemes" :key="theme" :label="theme" :value="theme" />
        </el-select>

        <!-- 编辑区域主题选择 -->
        <el-select v-model="editorAreaTheme" @change="savelocalStorage('editorAreaTheme', editorAreaTheme)"
          placeholder="选择编辑区主题" class="theme-select">
          <el-option v-for="theme in areaThemes" :key="theme" :label="theme" :value="theme" />
        </el-select>

        <!-- 预览区域主题选择 -->
        <el-select v-model="previewAreaTheme" @change="savelocalStorage('previewAreaTheme', previewAreaTheme)"
          placeholder="选择预览区主题" class="theme-select">
          <el-option v-for="theme in previewThemes" :key="theme" :label="theme" :value="theme" />
        </el-select>
      </div>

      <div id="test-editormd">
        <Editormd :value="selectedFile.content" :height="height" :editLanguage="editLanguage" :editorTheme="editorTheme"
          :editorAreaTheme="editorAreaTheme" :previewAreaTheme="previewAreaTheme" />
      </div>

      <div class="actions">
        <el-button type="success" @click="saveSettings">{{ t('settings_view.save_to_cloud') }}</el-button>
        <el-button type="danger" @click="remakeSettings">{{ t('settings_view.reset') }}</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Editormd from "../components/Editormd.vue";
import { useI18n } from "vue-i18n";
import { ElButton, ElSwitch, ElSelect, ElOption, ElMessage } from 'element-plus';
import { Sunny, Moon, Setting } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();
const goBack = () => {
  router.push('/');
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
  savelocalStorage('selectedLanguage', newLanguage);
  editLanguage.value = newLanguage;
};

// 网站整体主题设置内容
const isDarkTheme = ref(localStorage.getItem('theme') === 'dark');
document.documentElement.classList.toggle('dark', localStorage.getItem('theme') === 'dark');
const toggleTheme = (value) => {
  const theme = value ? 'dark' : 'light';
  document.documentElement.classList.toggle('dark', value);
  savelocalStorage('theme', theme);
  if (theme === 'dark') {
    editorTheme.value = "dark";
    editorAreaTheme.value = "lesser-dark";
    previewAreaTheme.value = "dark";
    savelocalStorage('editorTheme', "dark")
    savelocalStorage('editorAreaTheme', "lesser-dark")
    savelocalStorage('previewAreaTheme', "dark")
  } else if (theme === 'light') {
    editorTheme.value = "default";
    editorAreaTheme.value = "default";
    previewAreaTheme.value = "default";
    savelocalStorage('editorTheme', "default")
    savelocalStorage('editorAreaTheme', "default")
    savelocalStorage('previewAreaTheme', "default")
  }

};


// 编辑器主题设置内容
const editorThemes = [
  'default',
  'dark',
];

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
  "xq-light"
];

const previewThemes = [
  'default',
  'dark'
];

const selectedFile = ref({ content: t('settings_view.demo_content') });
const height = "200";
const editorTheme = ref(localStorage.getItem("editorTheme") || "default");
const editorAreaTheme = ref(localStorage.getItem("editorAreaTheme") || "default");
const previewAreaTheme = ref(localStorage.getItem("previewAreaTheme") || "default");

// 保存到 localStorage
const savelocalStorage = (key, value) => {
  localStorage.setItem(key, value);
};

// 方法可以直接定义为函数
function saveSettings() {
  ElMessage({
    message: t('settings_view.save_not_online'),
    type: 'warning',
    duration: 2000
  });
}

function remakeSettings() {
  localStorage.clear();
  ElMessage({
    message: t('settings_view.reset_success'),
    type: 'success',
    duration: 2000
  });
  setTimeout(() => {
    location.reload();
  }, 2000);

  // 延迟2秒后重新加载页面，让消息有时间显示
  setTimeout(() => {
    location.reload();
  }, 2000);
}
</script>

<style scoped>
.settings {
  font-family: Arial, sans-serif;
  padding: 10px;
}

.language,
.theme-preview,
.themes,
.actions {
  margin-bottom: 20px;
}

#setting {
  font-size: 20px;
  font-weight: bold;
}

select {
  padding: 4px 8px;
}

.actions button {
  margin-right: 10px;
}

.actions {
  margin-left: 10px;
  margin-top: 20px;
}

.language {
  margin: 20px 0;
}

#setting {
  font-size: 22px;
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