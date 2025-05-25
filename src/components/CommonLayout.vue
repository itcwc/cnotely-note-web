<template>
  <div class="common-layout">
    <el-container style="height: 100vh;">
      <!-- 侧边栏 -->
      <el-aside width="200px" v-if="isSidebarVisible" class="aside">
        <!-- 用户自定义 sidebar 内容 -->
        <slot name="sidebar" />

        <!-- 关闭按钮 -->
        <div class="aside-close-btn">
          <el-button size="small" :icon="ArrowLeft" @click="isSidebarVisible = false" />
        </div>
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
    <el-button size="small" v-if="!isSidebarVisible" class="open-sidebar-btn" type="primary" :icon="ArrowRight"
      @click="isSidebarVisible = true" />
  </div>
</template>

<script setup>
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
import { ref } from 'vue';

const isSidebarVisible = ref(false);
</script>

<style scoped>
.common-layout {
  overflow: hidden;
  position: relative;
}

.el-header,
.el-footer {
  display: flex;
  align-items: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

}

.el-header {
  height: 60px;
}

.el-footer {
  height: 50px;
}

.el-main {
  padding: 0px;
  overflow-y: auto;
}

.aside {
  padding: 16px;
  position: relative;
  box-shadow: 1px 0 2px rgba(0, 0, 0, 0.05);
}

.open-sidebar-btn {
  position: absolute;
  left: 0;
  bottom: 65px;
  z-index: 1001;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 0 5px 5px 0;
  border: none;
  /* 去除边框 */
  width: 0px;
}

.aside-close-btn {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
