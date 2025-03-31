<template>
  <div class="settings">
    <div class="card">
      <p id="setting">⚙ 设置</p>
      <hr>

      <div class="language">
        <label id="select_language" for="languageSelect">选择语言：</label>
        <select v-model="selectedLanguage" @change="changeLanguage" class="language-select select">
          <option value="en">English</option>
          <option value="zh-CN">中文</option>
        </select>
      </div>
      <hr>

      <!-- 主题设置 -->
      <div class="theme-preview">
        <p>选择主题：</p>

        <!-- 简约风 -->
        <label>
          <input type="radio" name="theme" value="theme-light" />
          <div class="theme-card theme-light">
            <div class="navbar">导航条</div>
            <div class="content">
              <p>字体颜色预览</p>
              <div class="card">卡片背景预览</div>
            </div>
          </div>
        </label>

        <!-- 深色护眼 -->
        <label>
          <input type="radio" name="theme" value="theme-dark" />
          <div class="theme-card theme-dark">
            <div class="navbar">导航条</div>
            <div class="content">
              <p>字体颜色预览</p>
              <div class="card">卡片背景预览</div>
            </div>
          </div>
        </label>

        <!-- 科技风 -->
        <label>
          <input type="radio" name="theme" value="theme-tech" />
          <div class="theme-card theme-tech">
            <div class="navbar">导航条</div>
            <div class="content">
              <p>字体颜色预览</p>
              <div class="card">卡片背景预览</div>
            </div>
          </div>
        </label>
      </div>
      <br>
      <hr>

      <div class="themes">
        <p id="theme_label">编辑器主题：</p>
        <p>
          <select v-model="editorTheme" @change="saveTheme('editorTheme', editorTheme)" id="editormd-theme-select">
            <option selected="selected" value="">select Editor.md themes</option>
          </select>
          <select v-model="editorAreaTheme" @change="saveTheme('editorAreaTheme', editorAreaTheme)"
            id="editor-area-theme-select">
            <option selected="selected" value="">select editor area themes</option>
          </select>
          <select v-model="previewAreaTheme" @change="saveTheme('previewAreaTheme', previewAreaTheme)"
            id="preview-area-theme-select">
            <option selected="selected" value="">select preview area themes</option>
          </select>
        </p>
      </div>

      <div id="test-editormd">
        <Editormd :value="selectedFile.content" :height="height" :editLanguage="editLanguage" :editorTheme="editorTheme"
          :editorAreaTheme="editorAreaTheme" :previewAreaTheme="previewAreaTheme" />
      </div>

      <button @click="saveSettings">保存配置到云</button>
      <button @click="remakeSettings">重制</button>

    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import Editormd from "../components/Editormd.vue";
import { useI18n } from "vue-i18n";

export default {
  name: "Settings",

  components: {
    Editormd
  },

  setup() {

    // 语言切换部分  ---------------------
    const { locale } = useI18n();
    // 从缓存中获取已保存的语言设置，如果没有则使用默认语言
    const savedLanguage = localStorage.getItem("selectedLanguage");
    const selectedLanguage = savedLanguage || "en"; // 默认设置为英文
    // 将选中的语言设置到 locale 中
    locale.value = selectedLanguage;
    // 语言切换函数
    const changeLanguage = (event) => {
      const newLanguage = event.target.value;
      locale.value = newLanguage; // 更新 locale
      // 将新的语言设置保存到缓存
      localStorage.setItem("selectedLanguage", newLanguage);
    };
    // 语言切换部分end ---------------------


    // 编辑器主题设置部分 ---------------------
    // 初始化主题设置，优先从缓存读取 
    const selectedFile = ref({ content: "初始内容" });
    const height = "200";
    const editLanguage = ref(savedLanguage || "en");
    const editorTheme = ref(localStorage.getItem("editorTheme") || "default");
    const editorAreaTheme = ref(localStorage.getItem("editorAreaTheme") || "default");
    const previewAreaTheme = ref(localStorage.getItem("previewAreaTheme") || "default");

    // 添加到缓存中
    const saveTheme = (key, value) => {
      localStorage.setItem(key, value);
    };
    // 编辑器主题设置部分end ---------------------

    return {
      selectedFile,
      height,
      editLanguage,
      editorTheme,
      editorAreaTheme,
      previewAreaTheme,
      saveTheme,
      selectedLanguage,
      changeLanguage,
    };

  },

  methods: {
    saveSettings() {
      // 保存设置逻辑
      alert("暂未上线");
    },

    remakeSettings() {
      // 重置设置逻辑

      location.reload()

      localStorage.clear();

      alert("重制成功");
    },
  }
};
</script>

<style scoped>
.card {
  background-color: white;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  margin-bottom: 20px;
}

.settings {
  font-family: Arial, sans-serif;
  margin: 10px 0 0 0;
}

.language {
  margin: 20px 0;
}



#setting {
  font-size: 22px;
}


/* 全局变量 */
:root {
  --background-color: white;
  --font-color: black;
  --card-background-color: #f9f9f9;
  --navbar-background-color: #007bff;
}

/* 卡片通用样式 */
.theme-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  margin: 10px 0;
  width: 200px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: inline-block;
}

/* 导航条 */
.theme-card .navbar {
  background-color: var(--navbar-background-color);
  color: white;
  padding: 10px;
  text-align: center;
}

/* 内容 */
.theme-card .content {
  background-color: var(--background-color);
  color: var(--font-color);
  padding: 20px;
  text-align: center;
}

/* 卡片背景 */
.theme-card .content .card {
  background-color: var(--card-background-color);
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
  color: var(--font-color);
}

/* 主题1：简约风 */
.theme-light {
  background-color: white;
  --background-color: white;
  --font-color: black;
  --card-background-color: #f9f9f9;
  --navbar-background-color: #007bff;
}

/* 主题2：深色护眼 */
.theme-dark {
  background-color: #333333;
  --background-color: #333333;
  --font-color: white;
  --card-background-color: #444444;
  --navbar-background-color: #004b91;
}

/* 主题3：科技风 */
.theme-tech {
  background-color: #1e1e1e;
  --background-color: #1e1e1e;
  --font-color: #aaaaaa;
  --card-background-color: #2a2a2a;
  --navbar-background-color: #1a73e8;
}

span {
  font-size: 14px;
}

select {
  padding: 5px;
  margin-left: 10px;
  font-size: 16px;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  width: 100px;
  margin: 10px 10px 0 0;
}
</style>