<template>
  <!-- <div id="app"> -->
  <!-- <nav class="navbar">
    <div class="navbar-left">
      <router-link to="/">
        <img src="/src/assets/images/logo.png" alt="Logo" class="logo" />
      </router-link>

      <router-link to="/" class="nav-link" active-class="active">{{
        $t("home")
      }}</router-link>
      <router-link to="/editor" class="nav-link" active-class="active">{{
        $t("editor")
      }}</router-link>
      <router-link to="/sync" class="nav-link" active-class="active">{{
        $t("sync")
      }}</router-link>

      <router-link to="/settings" class="nav-link" active-class="active">{{
        $t("settings")
      }}</router-link>
    </div>

    <div class="navbar-right">
      <router-link to="/login" class="nav-link" active-class="active">{{
        $t("login")
      }}</router-link>

      <div class="language-select">
        <select v-model="selectedLanguage" @change="changeLanguage">
          <option value="en">English</option>
          <option value="zh-CN">中文</option>
        </select>
      </div>
    </div>
  </nav> -->
  <router-view></router-view>
  <!-- 渲染当前路由的组件 -->
  <!-- </div> -->
</template>

<script>
import { useI18n } from "vue-i18n";

export default {
  name: "App",
  setup() {
    const { locale } = useI18n();

    // 从 localStorage 中获取已保存的语言设置，如果没有则使用默认语言
    const savedLanguage = localStorage.getItem("selectedLanguage");
    const selectedLanguage = savedLanguage || "en"; // 默认设置为英文

    // 将选中的语言设置到 locale 中
    locale.value = selectedLanguage;

    // 语言切换函数
    const changeLanguage = (event) => {
      const newLanguage = event.target.value;
      locale.value = newLanguage; // 更新 locale
      // 将新的语言设置保存到 localStorage
      localStorage.setItem("selectedLanguage", newLanguage);
    };

    return {
      selectedLanguage,
      changeLanguage,
    };
  },
};
</script>

<style>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: #f0f3f5;
  border-radius: 8px;
  height: 5%;
}

.navbar-left {
  display: flex;
  align-items: center;
  margin: 15px 0px 15px 20px;
}

.logo {
  width: 40px;
  height: auto;
  margin-right: 15px;
}

.nav-link {
  margin: 0 10px;
  text-decoration: none;
  color: #333;
  transition: color 0.3s;
}

/* Hover效果 */
.nav-link:hover {
  color: #007bff;
}

/* 激活状态 */
.active {
  color: #007bff;
  font-weight: bold;
  border-bottom: 2px solid #007bff;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.language-select select {
  padding: 5px;
  margin-left: 10px;
  font-size: 16px;
}

div::-webkit-scrollbar {
  width: 3px;
}

div::-webkit-scrollbar-track {
  background: rgb(239, 239, 239);
  border-radius: 2px;
}

div::-webkit-scrollbar-thumb {
  background: #40a0ff49;
  border-radius: 10px;
}

div::-webkit-scrollbar-thumb:hover {
  background: #40a0ff;
}
</style>
