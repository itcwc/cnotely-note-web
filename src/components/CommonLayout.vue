<template>
  <div class="common-layout">
    <el-container style="height: 100vh;">
      <!-- 侧边栏 -->
      <el-aside width="200px" v-if="isSidebarVisible" class="aside">
        <!-- 关闭按钮 -->
        <div class="aside-close-btn">
          <el-button size="small" icon="el-icon-close" @click="isSidebarVisible = false">关闭</el-button>
        </div>

        <!-- 用户自定义 sidebar 内容 -->
        <slot name="sidebar" />
      </el-aside>

      <!-- 主体部分 -->
      <el-container>
        <!-- 头部 -->
        <el-header height="60px" v-if="$slots.header">
          <slot name="header" />
        </el-header>

        <!-- 主体 -->
        <el-main>
          <slot name="main" />
        </el-main>

        <!-- 底部 -->
        <el-footer height="40px" v-if="$slots.footer">
          <slot name="footer" />
        </el-footer>
      </el-container>
    </el-container>

    <!-- 显示侧边栏的浮动按钮 -->
    <el-button
      v-if="!isSidebarVisible"
      class="open-sidebar-btn"
      type="primary"
      icon="el-icon-menu"
      size="small"
      @click="isSidebarVisible = true"
    >
      打开菜单
    </el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isSidebarVisible = ref(true);
</script>

<style scoped>
.common-layout {
  height: 100vh;
  overflow: hidden;
  background-color: #f5f7fa;
  position: relative;
}

.el-header,
.el-footer {
  background-color: #fff;
  color: #333;
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.el-main {
  padding: 20px;
  background-color: #fff;
  overflow-y: auto;
}

.aside {
  background-color: #fff;
  padding: 16px;
  position: relative;
  box-shadow: 1px 0 2px rgba(0, 0, 0, 0.05);
}

.aside-close-btn {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

/* 左下角打开菜单按钮 */
.open-sidebar-btn {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 999;
}
</style>
