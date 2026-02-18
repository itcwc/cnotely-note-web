<template>
  <div class="common-layout">
    <el-container style="height: 100vh">
      <!-- 用户面板 -->
      <UserAside
        :panel1Size="panel1Size"
        :isLoggedIn="isLoggedIn"
        :userInfo="userInfo"
        @setLayout="setLayout"
        @handleSettings="handleSettings"
        @openNewFileDialog="openNewFileDialog"
        @handleLoginLogout="handleLoginLogout"
        @handleAvatarClick="handleAvatarClick"
      />

      <!-- 仓库面板 -->
      <RepoAside
        ref="repoAsideRef"
        :panel2Size="panel2Size"
        :selectedPlatform="selectedPlatform"
        :repos="repos"
        :selectedRepo="selectedRepo"
        :repoTree="repoTree"
        :defaultExpandedKeys="defaultExpandedKeys"
        :timelineFiles="timelineFiles"
        @togglePlatform="togglePlatform"
        @openRepoDialog="openRepoDialog"
        @selectRepo="selectRepo"
        @handleNodeExpand="handleNodeExpand"
        @handleNodeCollapse="handleNodeCollapse"
        @handleNodeClick="handleNodeClick"
        @exportFile="handleExportFile"
        @deleteFile="handleDeleteFile"
        @handleSearch="handleSearch"
        @resetSearch="resetSearch"
        @importFile="handleImportFile"
        @importSelectedFiles="handleImportSelectedFiles"
        @refreshFiles="refreshFiles"
      />

      <!-- 编辑器面板 -->
      <EditorPanel
        :height="height"
        :editorPanelSize="editorPanelSize"
        :editLanguage="editLanguage"
        :editorTheme="editorTheme"
        :editorAreaTheme="editorAreaTheme"
        :previewAreaTheme="previewAreaTheme"
        :selectedFile="selectedFile"
        :fileName="fileName"
        :editor-type="editorType"
        @switchEditorType="switchEditorType"
        @exportFile="exportFile"
        @saveCloud="saveCloud"
        @update:fileName="(val) => (fileName = val)"
        @contentChange="handleContentChange"
        @openNewFileDialog="openNewFileDialog"
        @importFile="handleImportFile"
      />
    </el-container>

    <!-- 新建文件对话框 -->
    <el-dialog
      v-model="showNewFileDialog"
      :title="t('compile_view.new_file_dialog')"
      width="400px"
    >
      <el-form label-position="top">
        <el-form-item :label="t('compile_view.file_type')">
          <el-radio-group v-model="newFileType">
            <el-radio label="md">{{ t("compile_view.markdown") }}</el-radio>
            <el-radio label="html">{{ t("compile_view.rich_text") }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showNewFileDialog = false">{{
            t("common.cancel")
          }}</el-button>
          <el-button type="primary" @click="createNewFile">{{
            t("common.confirm")
          }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import UserAside from "../components/layout/UserAside.vue";
import RepoAside from "../components/layout/RepoAside.vue";
import EditorPanel from "../components/layout/EditorPanel.vue";

// 初始化路由和国际化
const router = useRouter();
const { t, locale } = useI18n();

// 导入拆分后的文件
// 状态和基本设置
import { createState } from "./compile/state";

// 创建状态
const {
  isProcessing,
  repoAsideRef,
  isInitializing,
  selectedFile,
  height,
  editLanguage,
  editorTheme,
  editorAreaTheme,
  previewAreaTheme,
  editorType,
  showNewFileDialog,
  newFileType,
  panel1Size,
  panel2Size,
  editorPanelSize,
  timelineFiles,
  isLoggedIn,
  userInfo,
  selectedPlatform,
  repos,
  selectedRepo,
  repoTree,
  defaultExpandedKeys,
  fileName,
  editorId,
  selectValue,
} = createState();

// 设置语言
const savedLanguage = localStorage.getItem("selectedLanguage") || "en";
locale.value = savedLanguage;

// 文件操作
import {
  setState,
  getIsAutoCreating,
  autoCreateFirstFile,
  handleContentChange as originalHandleContentChange,
  handleDeleteFile as originalHandleDeleteFile,
  handleImportFile as originalHandleImportFile,
  handleImportSelectedFiles as originalHandleImportSelectedFiles,
  handleExportFile as originalHandleExportFile,
  createNewFile as originalCreateNewFile,
  exportFile as originalExportFile,
  saveCloud,
  saveCurrentFileContent,
  handleNodeClick,
  restoreFilesFromIndexedDB,
} from "./compile/fileOperations";

// 包装事件处理函数，确保传递 t 参数
const handleContentChange = (file: any) => originalHandleContentChange(file);
const handleDeleteFile = (file: any) => originalHandleDeleteFile(file, t);
const handleImportFile = (importData: any) =>
  originalHandleImportFile(importData, t);
const handleImportSelectedFiles = (repo: any, selectedFiles: any[]) =>
  originalHandleImportSelectedFiles(repo, selectedFiles, t);
const handleExportFile = (file: any, format?: string) =>
  originalHandleExportFile(file, format, t);
const exportFile = (format?: string) => originalExportFile(format, t);
const createNewFile = () => originalCreateNewFile(t);

// 设置状态
setState({
  selectedFile,
  fileName,
  editorType,
  repoTree,
  defaultExpandedKeys,
  isInitializing,
  editorId,
  newFileType,
  showNewFileDialog,
  selectValue,
  selectedRepo,
  isProcessing,
});

// 布局管理
import {
  setLayoutState,
  setLayout,
  updateEditorPanelSize,
  setupLayoutListeners,
  switchEditorType,
} from "./compile/layout";

// 设置布局状态
setLayoutState(
  {
    panel1Size,
    panel2Size,
    editorPanelSize,
    splitterWrapper: { value: null }, // 暂时设置为null，实际值会在组件挂载后更新
    editorType,
    editorTheme,
    editorAreaTheme,
    previewAreaTheme,
  },
  t,
);

// 用户管理
import {
  setUserState,
  handleSettings,
  initUserInfo,
  handleAvatarClick,
  handleLoginLogout,
} from "./compile/userManagement";

// 设置用户状态
setUserState(
  {
    isLoggedIn,
    userInfo,
    selectedPlatform,
    userMenuRef: { value: null }, // 暂时设置为null，实际值会在组件挂载后更新
  },
  t,
  router,
);

// 平台和仓库管理
import {
  setRepoState,
  togglePlatform,
  handleNodeExpand,
  handleNodeCollapse,
  openRepoDialog,
  selectRepo,
} from "./compile/repoManagement";

// 设置仓库状态
setRepoState(
  {
    selectedPlatform,
    repos,
    selectedRepo,
    repoTree,
    defaultExpandedKeys,
    repoAsideRef,
  },
  t,
  router,
);

// 搜索功能
import {
  setSearchState,
  sortFilesByTime,
  refreshFiles,
  handleSearch,
  resetSearch,
} from "./compile/search";

// 设置搜索状态
setSearchState({
  searchKeyword: { value: "" }, // 暂时设置为空字符串，实际值会在组件挂载后更新
  timelineFiles,
});

// 插件消息处理
import {
  setExtensionState,
  handleCrossPageSync,
  registerExtensionListeners,
  cleanupExtensionListeners,
} from "./compile/extensionMessage";

// 设置插件消息状态
setExtensionState(
  {
    selectedFile,
    editorType,
    fileName,
    editorId,
  },
  t,
);

// 打开新建文件对话框
const openNewFileDialog = () => {
  newFileType.value = "md"; // 默认md类型
  showNewFileDialog.value = true;
};

// 监听编辑器内容变化，实时保存到repoTree
watch(
  () => selectedFile.value.content,
  async (newContent: string, oldContent: string) => {
    // 1. 基础拦截：正在初始化或内容完全没变
    if (isInitializing.value || newContent === oldContent) return;

    // 2. 【核心修复】定义什么是“真正的空内容”
    // 过滤 Quill 常见的空标签：<p><br></p>, <p></p>, 以及纯空格
    const isActuallyEmpty = (html: string) => {
      if (!html) return true;
      const cleanText = html.replace(/<[^>]*>/g, "").trim(); // 剥离 HTML 标签看是否有文字
      return cleanText === "" && !html.includes("<img"); // 没文字且没图片才算空
    };

    if (isActuallyEmpty(newContent)) return;

    // 3. 【核心修复】增加“切换锁”判断
    // 如果当前正在处理文件切换（isProcessing），坚决不自动创建
    if (isProcessing.value) return;

    // 4. 自动创建逻辑：必须满足既没有 ID 也没有 Name，且不是在切换中
    if (!selectedFile.value.id && !selectedFile.value.name) {
      console.log("检测到真正的新内容输入，准备自动创建...");
      await autoCreateFirstFile(newContent, t);
    }
  },
);

// 监听选中文件变化，保存之前的文件内容
// watch(
//   () => selectedFile.value.name,
//   async (newPath, oldPath) => {
//     if (oldPath && newPath !== oldPath) {
//       console.log('使用1');
//       await saveCurrentFileContent();
//     }
//   },
// );

watch(
  () => fileName.value,
  async (newFileName) => {
    // 1. 拦截非法状态
    if (isInitializing.value || getIsAutoCreating() || isProcessing.value)
      return;

    if (selectedFile.value.name && newFileName) {
      const currentExtension = selectedFile.value.name.split(".").pop();
      const hasExtension = newFileName.includes(".");
      let finalFileName = newFileName;

      if (!hasExtension && currentExtension) {
        finalFileName = `${newFileName}.${currentExtension}`;
      }

      // 避免名字没变时触发逻辑
      if (finalFileName === selectedFile.value.name) return;

      const originalFileName = selectedFile.value.name;

      // 2. 更新选中文件的内存状态
      selectedFile.value.name = finalFileName;
      // 如果你的 path 依赖文件名，也需要更新
      selectedFile.value.path = finalFileName;

      // 3. 递归更新文件树 (RepoTree)
      const updateTree = (files: any[]): boolean => {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.name === originalFileName) {
            file.name = finalFileName;
            file.path = finalFileName; // 同步更新 path，确保 Tree 的 Key 生效
            return true;
          }
          if (file.children?.length) {
            if (updateTree(file.children)) return true;
          }
        }
        return false;
      };

      const found = updateTree(repoTree.value);

      // 【关键修复 1】如果找到了并修改了，强制触发响应式
      if (found) {
        repoTree.value = [...repoTree.value];
      }

      // 【关键修复 2】同步更新时光流中的显示
      if (timelineFiles.value) {
        const timelineFile = timelineFiles.value.find(
          (f) => f.name === originalFileName,
        );
        if (timelineFile) {
          timelineFile.name = finalFileName;
          timelineFile.path = finalFileName;
        }
      }

      // 4. 执行持久化
      console.log("使用2 - 正在重命名并同步 UI");
      await saveCurrentFileContent(originalFileName, selectedFile.value.id);

      // 更新最后一次选择的文件名缓存
      localStorage.setItem("lastSelectedFile", finalFileName);
    }
  },
);

onMounted(async () => {
  // 初始化工作
  updateEditorPanelSize();
  initUserInfo();
  await restoreFilesFromIndexedDB(t);

  // 读取布局
  const savedLayout = localStorage.getItem("layout");
  if (savedLayout) setLayout(parseInt(savedLayout));

  // 注册监听器
  setupLayoutListeners();
  registerExtensionListeners();

  // 处理跨页面跳转同步
  handleCrossPageSync();

  // 初始化文件列表
  await sortFilesByTime();
});

// 清理监听器
onBeforeUnmount(() => {
  cleanupExtensionListeners();
  // 保存最后选中的文件
  if (selectedFile.value.name) {
    localStorage.setItem("lastSelectedFile", selectedFile.value.name);
  }
});
</script>

<style scoped>
/* 动态宽度由 Vue 绑定控制，此处不再设置静态宽度 */

/* 中间面板右边添加线条 */
.user-aside {
  border-right: 1px solid var(--el-border-color);
}

.md-editor {
  height: 100%;
  position: relative;
  /* z-index: 1001; */
  flex: 1;
  overflow: hidden;
}
</style>
