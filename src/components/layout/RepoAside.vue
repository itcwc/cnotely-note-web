<template>
  <el-aside class="file-panel" :style="{ width: `${panel2Size}px` }">
    <div class="panel-inner">
      <!-- Header: Search + New -->
      <div class="panel-header">
        <div class="panel-search">
          <el-input
            v-model="localSearchKeyword"
            :placeholder="t('compile_view.search_files')"
            size="medium"
            clearable
            @input="handleSearchInput"
            @clear="handleSearchClear"
            style="font-size: 12px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <!-- <button class="rail-btn" @click="focusSearch" :title="t('compile_view.search_files')">
          <el-icon size="18"><Search /></el-icon>
        </button> -->
      </div>

      <div class="panel-divider" />

      <!-- File List -->
      <div class="file-list">
        <template v-if="timelineFiles.length > 0">
          <template
            v-for="(group, date) in groupFilesByDate(timelineFiles)"
            :key="date"
          >
            <div class="file-group-header">{{ date }}</div>
            <div
              v-for="file in group"
              :key="file.id"
              class="file-item"
              :class="{
                'file-item--active':
                  selectedFile && file.id === selectedFile.id,
              }"
              @click="handleNodeClick(file, null)"
              @contextmenu.prevent="showMenu(file, $event)"
            >
              <svg
                v-if="
                  file.editorMode === 'richtext' || file.name.endsWith('.html')
                "
                class="file-item-icon file-item-icon--richtext"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 256 256"
              >
                <path d="M0 0h256v256H0z" fill="none" />
                <path
                  fill="currentColor"
                  d="M48 128a12 12 0 0 0 12-12V44h76v48a12 12 0 0 0 12 12h48v12a12 12 0 0 0 24 0V88a12 12 0 0 0-3.51-8.49l-56-56A12 12 0 0 0 152 20H56a20 20 0 0 0-20 20v76a12 12 0 0 0 12 12m135-48h-23V57ZM68 160v48a12 12 0 0 1-24 0v-12H32v12a12 12 0 0 1-24 0v-48a12 12 0 0 1 24 0v12h12v-12a12 12 0 0 1 24 0m60 0a12 12 0 0 1-12 12h-4v36a12 12 0 0 1-24 0v-36h-4a12 12 0 0 1 0-24h32a12 12 0 0 1 12 12m72 0v48a12 12 0 0 1-24 0v-9.36l-.11.16a12 12 0 0 1-19.78 0l-.11-.16V208a12 12 0 0 1-24 0v-48a12 12 0 0 1 21.89-6.8L166 170.82l12.11-17.62A12 12 0 0 1 200 160m56 48a12 12 0 0 1-12 12h-24a12 12 0 0 1-12-12v-48a12 12 0 0 1 24 0v36h12a12 12 0 0 1 12 12"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="file-item-icon"
                width="20"
                height="20"
                viewBox="0 0 256 256"
              >
                <path d="M0 0h256v256H0z" fill="none" />
                <path
                  fill="currentColor"
                  d="M100 152v56a12 12 0 0 1-24 0v-17.93l-6.17 8.81a12 12 0 0 1-19.66 0L44 190.07V208a12 12 0 0 1-24 0v-56a12 12 0 0 1 21.83-6.88L60 171.07l18.17-25.95A12 12 0 0 1 100 152m84 28a40 40 0 0 1-40 40h-16a12 12 0 0 1-12-12v-56a12 12 0 0 1 12-12h16a40 40 0 0 1 40 40m-24 0a16 16 0 0 0-16-16h-4v32h4a16 16 0 0 0 16-16m60-92v136a12 12 0 0 1-24 0V104h-48a12 12 0 0 1-12-12V44H60v64a12 12 0 0 1-24 0V40a20 20 0 0 1 20-20h96a12 12 0 0 1 8.49 3.52l56 56A12 12 0 0 1 220 88m-60-8h23l-23-23Z"
                />
              </svg>
              <span class="file-item-name" :title="file.name">{{
                file.name
              }}</span>
            </div>
          </template>
        </template>
        <div v-else class="file-empty">
          {{ t("compile_view.no_files_yet") }}
        </div>
      </div>
    </div>

    <!-- Context Menu -->
    <div
      v-if="showingMenu"
      class="dropdown-menu"
      :style="{ left: menuLeft + 'px', top: menuTop + 'px' }"
      @click.stop
    >
      <div
        class="menu-item"
        @click.stop="handleAction('rename', activeMenuData)"
        :class="{ 'menu-item-disabled': activeMenuData?.type === 'dir' }"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
        <span>{{ t("compile_view.rename") }}</span>
      </div>
      <div
        class="menu-item"
        @click.stop="handleAction('export', activeMenuData)"
        :class="{ 'menu-item-disabled': activeMenuData?.type === 'dir' }"
      >
        <el-icon><Download /></el-icon>
        <span>{{ t("compile_view.export") }}</span>
      </div>
      <div
        class="menu-item"
        @click.stop="handleAction('delete', activeMenuData)"
        :class="{ 'menu-item-disabled': activeMenuData?.type === 'dir' }"
      >
        <el-icon><Delete /></el-icon>
        <span>{{ t("compile_view.delete") }}</span>
      </div>
    </div>

    <!-- Import Dialog -->
    <el-dialog
      v-model="showImportDialog"
      :title="t('compile_view.select_import_method')"
      width="400px"
      class="unified-choice-dialog"
    >
      <div style="display:flex;flex-direction:column;gap:10px;">
        <button class="choice-btn choice-btn-light" @click="handleLocalImport">
          <el-icon><Upload /></el-icon>
          {{ t("compile_view.local_import") }}
        </button>
        <button class="choice-btn choice-btn-light" @click="handleGoogleDriveImport">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {{ t("compile_view.google_drive_import") }}
        </button>
        <button class="choice-btn choice-btn-dark" @click="openRepoDialogLocal">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          {{ t("compile_view.github_import") }}
        </button>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showImportDialog = false">{{
            t("common.cancel")
          }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Export Dialog -->
    <el-dialog
      v-model="showExportDialog"
      :title="t('compile_view.select_export_format')"
      width="400px"
    >
      <el-form label-position="top" style="margin-top: 20px">
        <el-form-item :label="t('compile_view.export_format')">
          <el-select v-model="selectValue" style="width: 100%">
            <el-option
              v-for="item in exportOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleExportCancel">{{
            t("common.cancel")
          }}</el-button>
          <el-button type="primary" @click="confirmExport">{{
            t("common.confirm")
          }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Rename Dialog -->
    <el-dialog
      v-model="showRenameDialog"
      :title="t('compile_view.rename_file')"
      width="400px"
    >
      <el-form label-position="top" style="margin-top: 20px">
        <el-form-item :label="t('compile_view.file_name')">
          <div class="rename-input-wrapper">
            <el-input
              v-model="renameValue"
              ref="renameInputRef"
              @keyup.enter="confirmRename"
            />
            <span class="rename-extension">.{{ renameExtension }}</span>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRenameDialog = false">{{
            t("common.cancel")
          }}</el-button>
          <el-button type="primary" @click="confirmRename">{{
            t("common.confirm")
          }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Repo Selection Dialog -->
    <el-dialog
      v-model="showRepoDialog"
      :title="t('compile_view.select_repo')"
      width="50%"
    >
      <div v-if="repoLoading" style="padding: 40px; text-align: center">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span style="margin-left: 8px">{{
          t("compile_view.loading_repos")
        }}</span>
      </div>
      <div
        v-else-if="props.repos.length === 0"
        style="padding: 40px; text-align: center"
      >
        <el-empty :description="t('compile_view.no_repos')" />
      </div>
      <div v-else>
        <el-tree
          :data="props.repos"
          :props="{ label: 'full_name', children: 'children' }"
          :expand-on-click-node="false"
          @node-click="selectRepoLocal"
        >
          <template #default="{ data }">
            <span class="repo-item">{{ data.full_name || data.name }}</span>
          </template>
        </el-tree>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeRepoDialog">{{
            t("common.cancel")
          }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Google Drive Files Dialog -->
    <el-dialog
      v-model="showGoogleDriveFiles"
      :title="t('compile_view.select_google_drive_files')"
      width="680px"
    >
      <div v-if="googleDriveLoading" style="padding: 40px; text-align: center">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span style="margin-left: 8px">{{
          t("compile_view.loading_files")
        }}</span>
      </div>
      <div v-else-if="googleDriveError" style="padding: 20px; color: #f56c6c">
        {{ googleDriveError }}
      </div>
      <div
        v-else-if="
          Array.isArray(googleDriveFiles) && googleDriveFiles.length === 0
        "
        style="padding: 40px; text-align: center"
      >
        <el-empty :description="t('compile_view.no_files')" />
      </div>
      <div
        v-else-if="Array.isArray(googleDriveFiles)"
        style="max-height: 400px; overflow-y: auto"
      >
        <el-table
          :data="googleDriveFiles"
          style="width: 100%"
          @selection-change="handleGoogleDriveSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="文件名" width="300" />
          <el-table-column prop="mimeType" label="文件类型" width="150" />
          <el-table-column prop="size" label="大小" width="100" />
        </el-table>
      </div>
      <div v-else style="padding: 40px; text-align: center">
        <el-empty description="加载文件失败" />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeGoogleDriveDialog">{{
            t("common.cancel")
          }}</el-button>
          <el-button
            type="primary"
            @click="confirmGoogleDriveSelection"
            :disabled="selectedGoogleDriveFiles.length === 0"
          >
            {{
              t("compile_view.import_selected_files", {
                count: selectedGoogleDriveFiles.length,
              })
            }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- File Selection Dialog -->
    <el-dialog
      v-model="showFileSelectionDialog"
      :title="t('compile_view.select_files_to_import')"
      width="600px"
    >
      <div
        v-if="fileSelectionLoading"
        style="padding: 40px; text-align: center"
      >
        <el-icon class="is-loading"><Loading /></el-icon>
        <span style="margin-left: 8px">{{
          t("compile_view.loading_files")
        }}</span>
      </div>
      <div
        v-else-if="apiFileTree.length === 0"
        style="padding: 40px; text-align: center"
      >
        <el-empty :description="t('compile_view.no_files_in_repo')" />
      </div>
      <div v-else style="max-height: 400px; overflow-y: auto">
        <el-tree
          :data="apiFileTree"
          show-checkbox
          node-key="path"
          :props="{ label: 'name', children: 'children' }"
          default-expand-all
          @check-change="handleFileCheckChange"
        >
          <template #default="{ data }">
            <span class="file-item">{{ data.name }}</span>
          </template>
        </el-tree>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeFileSelectionDialog">{{
            t("common.cancel")
          }}</el-button>
          <el-button
            type="primary"
            @click="confirmFileSelection"
            :disabled="selectedFiles.length === 0"
          >
            {{
              t("compile_view.import_selected_files", {
                count: selectedFiles.length,
              })
            }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </el-aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import {
  Delete,
  Download,
  Search,
  Upload,
  Loading,
} from "@element-plus/icons-vue";
import { indexedDBHelper } from "../../utils/indexedDB";
import githubApi from "../../api/github";
import googleDriveApi from "../../api/googleDrive";

// 黑暗模式状态
const isDarkTheme = ref(localStorage.getItem("isDarkTheme") === "true");

// 监听 localStorage 主题变化
window.addEventListener("storage", (event: StorageEvent) => {
  if (event.key === "isDarkTheme") {
    isDarkTheme.value = event.newValue === "true";
  }
});

/* ================= props / emits ================= */

const props = defineProps({
  panel2Size: { type: Number, default: 250 },
  selectedPlatform: { type: String, default: "" },
  repos: { type: Array, default: () => [] },
  selectedRepo: { type: Object, default: null },
  repoTree: { type: Array, default: () => [] },
  defaultExpandedKeys: { type: Array, default: () => [] },
  showRepoDialog: { type: Boolean, default: false },
  timelineFiles: { type: Array as () => TreeData[], default: () => [] },
});

const emit = defineEmits([
  "togglePlatform",
  "openRepoDialog",
  "closeRepoDialog",
  "selectRepo",
  "handleNodeExpand",
  "handleNodeCollapse",
  "handleNodeClick",
  "deleteFile",
  "renameFile",
  "exportFile",
  "handleSearch",
  "resetSearch",
  "importFile",
  "importSelectedFiles",
  "refreshFiles",
]);

const { t, locale } = useI18n();

// 导出选项
const exportOptions = [
  { value: "md", label: t("compile_view.markdown") },
  { value: "pdf", label: t("compile_view.pdf") },
  { value: "html", label: t("compile_view.html") },
  { value: "docx", label: t("compile_view.docx") },
  { value: "txt", label: t("compile_view.txt") },
];

// 仓库列表加载完成
const handleRepoLoaded = () => {
  repoLoading.value = false;
};

// 暴露给父组件的方法，用于通知仓库列表加载完成 / 打开仓库选择对话框
defineExpose({
  handleRepoLoaded,
  openRepoSelectDialog: () => {
    repoLoading.value = true;
    showRepoDialog.value = true;
  },
});

/* ================= 类型 ================= */

import type { TreeData } from "../../views/compile/types";

interface Node {
  expanded: boolean;
  [key: string]: any;
}

/* ================= 计算属性 ================= */

// const selectedPlatformName = computed(() => {
//   if (props.selectedPlatform === "github") return "GitHub";
//   return props.selectedPlatform || "未绑定";
// });

/* ================= 右键菜单状态 ================= */

const showingMenu = ref(false);
const activeMenuData = ref<TreeData | null>(null);
const menuLeft = ref(0);
const menuTop = ref(0);

/* ================= 选中文件状态 ================= */

const selectedFile = ref<TreeData | null>(null); // 存储当前选中的文件路径

/* ================= 导出流程专用状态（关键） ================= */

const showExportDialog = ref(false);
const exportTarget = ref<TreeData | null>(null);

const showRenameDialog = ref(false);
const renameTarget = ref<TreeData | null>(null);
const renameValue = ref("");
const renameExtension = ref("");
const renameInputRef = ref<any>(null);
const selectValue = ref("md");

/* ================= 导入流程专用状态 ================= */

const showImportDialog = ref(false);
const importType = ref<string>("local"); // 导入类型：local 或 cloud
const showRepoDialog = ref(false); // 仓库选择对话框状态
const showFileSelectionDialog = ref(false); // 文件选择对话框状态
const selectedRepoData = ref<any>(null); // 保存选中的仓库数据
const selectedFiles = ref<string[]>([]); // 选中的文件路径列表
const fileSelectionLoading = ref(false); // 文件加载状态
const repoLoading = ref(false); // 仓库列表加载状态
const apiFileTree = ref<any[]>([]); // 从接口直接获取的文件树

/* ================= Google Drive 导入专用状态 ================= */

const showGoogleDriveFiles = ref(false);
const googleDriveFiles = ref<any[]>([]);
const googleDriveLoading = ref(false);
const googleDriveError = ref<string>("");
const selectedGoogleDriveFiles = ref<any[]>([]); // 选中的 Google Drive 文件列表

/* ================= 时光流模式和搜索状态 ================= */

const localSearchKeyword = ref<string>(""); // 本地搜索关键词

/* ================= 缓存检测状态 ================= */

let cacheCheckTimer: number | null = null;
let lastFileCount = 0;

// 导出选项将在setup函数内部定义

/* ================= 公共方法 ================= */

const closeMenu = () => {
  showingMenu.value = false;
  activeMenuData.value = null;
};

const showMenu = async (data: TreeData, event: MouseEvent) => {
  event.stopPropagation();

  // 如果是文件，尝试从 IndexedDB 获取实际文件类型
  if (data.type === "file") {
    try {
      const files = await indexedDBHelper.getFilesByName(data.name);
      if (files && files.length > 0) {
        // 创建一个新对象，合并原始数据和从 IndexedDB 获取的信息
        const updatedData = {
          ...data,
          id: files[0].id || data.id,
          // 不覆盖 type 属性，因为 TreeData 中 type 是 "file" | "dir"
        };
        activeMenuData.value = updatedData;
      } else {
        activeMenuData.value = data;
      }
    } catch (error) {
      console.error("获取文件类型失败:", error);
      activeMenuData.value = data;
    }
  } else {
    activeMenuData.value = data;
  }

  menuLeft.value = event.clientX;
  menuTop.value = event.clientY;
  showingMenu.value = true;
};

/* ================= 全局点击关闭菜单（修复版） ================= */

const handleGlobalClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;

  if (
    target.closest(".custom-dropdown") ||
    target.closest(".dropdown-menu") ||
    target.closest(".el-dropdown") ||
    target.closest(".el-button") ||
    target.closest(".el-dialog") ||
    target.closest(".el-overlay")
  ) {
    return;
  }

  closeMenu();
};

/* ================= 缓存检测方法 ================= */

const checkCacheChanges = async () => {
  try {
    // 获取本地缓存文件
    const localFiles = await indexedDBHelper.getAllFiles();

    // 检查文件数量是否变化
    if (localFiles.length !== lastFileCount) {
      lastFileCount = localFiles.length;
      // 通知父组件更新文件列表
      emit("refreshFiles");
    }
  } catch (error) {
    console.error("缓存检测失败:", error);
  }
};

onMounted(() => {
  window.addEventListener("click", handleGlobalClick);

  // 启动缓存检测定时器
  cacheCheckTimer = window.setInterval(checkCacheChanges, 5000);
});

onUnmounted(() => {
  window.removeEventListener("click", handleGlobalClick);

  // 清理定时器
  if (cacheCheckTimer) {
    clearInterval(cacheCheckTimer);
    cacheCheckTimer = null;
  }
});

/* ================= 菜单操作处理 ================= */

const handleAction = (command: string, data: TreeData | null) => {
  if (!data) return;

  const currentData = data;

  switch (command) {
    case "rename":
      closeMenu();
      renameTarget.value = currentData;
      {
        const dotIndex = currentData.name.lastIndexOf(".");
        if (dotIndex > 0) {
          renameValue.value = currentData.name.substring(0, dotIndex);
          renameExtension.value = currentData.name.substring(dotIndex + 1);
        } else {
          renameValue.value = currentData.name;
          renameExtension.value = "";
        }
      }
      showRenameDialog.value = true;
      nextTick(() => {
        renameInputRef.value?.focus();
        renameInputRef.value?.select();
      });
      break;

    case "delete":
      closeMenu();
      ElMessageBox.confirm(
        t("compile_view.confirm_delete", { name: currentData.name }),
        t("compile_view.delete_confirm"),
        { type: "warning" },
      )
        .then(() => {
          emit("deleteFile", currentData);
          ElMessage.success(t("compile_view.file_deleted"));
        })
        .catch(() => {
          ElMessage.info(t("compile_view.delete_canceled"));
        });
      break;

    case "export":
      // 🔒 锁定导出目标（关键修复点）
      exportTarget.value = currentData;

      showingMenu.value = false;
      selectValue.value = "md";
      showExportDialog.value = true;
      break;

    default:
      closeMenu();
  }
};

/* ================= 导出相关 ================= */

const handleExportCancel = () => {
  showExportDialog.value = false;
  exportTarget.value = null;
};

const confirmExport = () => {
  if (!exportTarget.value) {
    console.warn("exportTarget is null, export aborted");
    return;
  }

  emit("exportFile", exportTarget.value, selectValue.value);

  showExportDialog.value = false;
  exportTarget.value = null;
};

/* ================= 重命名相关 ================= */

const confirmRename = () => {
  if (!renameTarget.value) return;
  const baseName = renameValue.value.trim();
  if (!baseName) {
    ElMessage.warning(t("compile_view.file_name_required"));
    return;
  }
  const newName = renameExtension.value
    ? `${baseName}.${renameExtension.value}`
    : baseName;
  if (newName === renameTarget.value.name) {
    showRenameDialog.value = false;
    return;
  }

  emit("renameFile", renameTarget.value, newName);
  showRenameDialog.value = false;
  renameTarget.value = null;
};

/* ================= 搜索相关方法 ================= */

// 处理搜索输入
const handleSearchInput = (value: string) => {
  emit("handleSearch", value);
};

// 处理搜索清除
const handleSearchClear = () => {
  localSearchKeyword.value = "";
  emit("resetSearch");
};

// 聚焦搜索框
const focusSearch = () => {
  const searchInput = document.querySelector(
    ".panel-search input",
  ) as HTMLInputElement;
  if (searchInput) {
    searchInput.focus();
  }
};

/* ================= 导入相关方法 ================= */

// 处理导入命令
const handleImportCommand = (command: string) => {
  console.log("handleImportCommand called with:", command);
  importType.value = command;
  if (command === "local") {
    // 本地导入，直接打开文件选择器
    handleLocalImport();
  } else if (command === "cloud") {
    // 云端导入，打开仓库选择对话框
    openRepoDialogLocal();
  }
};

// 处理本地导入
const handleLocalImport = () => {
  // 创建文件选择器
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".md,.html,.txt";
  input.onchange = (event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        emit("importFile", {
          name: file.name,
          content: content,
          type: file.name.endsWith(".md") ? "md" : "html",
        });
        showImportDialog.value = false;
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

// 把 GitHub 扁平 tree 转成 el-tree 需要的嵌套结构
const buildFileTree = (tree: any[]): any[] => {
  const root: any[] = [];
  const map = new Map<string, any>();

  for (const item of tree) {
    const parts = item.path.split("/");
    let currentPath = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const fullPath = currentPath ? `${currentPath}/${part}` : part;

      if (!map.has(fullPath)) {
        const isFile = i === parts.length - 1 && item.type === "blob";
        map.set(fullPath, {
          name: part,
          path: fullPath,
          type: isFile ? "file" : "dir",
          children: isFile ? undefined : [],
        });
      }

      currentPath = fullPath;
    }
  }

  for (const [path, node] of map) {
    const parts = path.split("/");
    if (parts.length === 1) {
      root.push(node);
    } else {
      const parentPath = parts.slice(0, -1).join("/");
      const parent = map.get(parentPath);
      if (parent && parent.children) {
        parent.children.push(node);
      }
    }
  }

  return root;
};

// 处理仓库选择
const selectRepoLocal = async (repo: any) => {
  selectedRepoData.value = repo;
  showRepoDialog.value = false;

  // 通知父组件获取仓库文件树
  emit("selectRepo", repo);

  // 显示文件选择对话框
  showFileSelectionDialog.value = true;
  selectedFiles.value = [];

  // 直接从 API 获取文件树
  fileSelectionLoading.value = true;
  try {
    const data = await githubApi.repos.getRepoTree(
      repo.full_name || repo.name,
    );
    // 把 GitHub 扁平 tree 转成嵌套树
    apiFileTree.value = buildFileTree(data);
  } catch (error) {
    console.error("获取仓库文件树失败:", error);
    ElMessage.error(t("compile_view.get_repo_tree_failure"));
  } finally {
    fileSelectionLoading.value = false;
  }
};

// 打开仓库选择对话框
const openRepoDialogLocal = () => {
  // 设置仓库加载状态
  repoLoading.value = true;
  // 通知父组件获取仓库列表
  emit("openRepoDialog");
  // 显示仓库选择对话框
  showRepoDialog.value = true;
  // 关闭导入对话框
  showImportDialog.value = false;
};

// 谷歌云盘导入
const handleGoogleDriveImport = async () => {
  showImportDialog.value = false;
  googleDriveLoading.value = true;
  googleDriveError.value = "";

  try {
    const data = await googleDriveApi.getFiles();
    console.log("Google Drive API 返回数据:", data);

    // 确保 googleDriveFiles 始终是一个数组
    if (Array.isArray(data)) {
      googleDriveFiles.value = data;
    } else if (data && typeof data === "object") {
      // 如果返回的是对象，可能需要从某个属性中提取数组
      googleDriveFiles.value = (data as any).files || [];
    } else {
      // 其他情况，设置为空数组
      googleDriveFiles.value = [];
    }

    console.log("处理后的 googleDriveFiles:", googleDriveFiles.value);
    showGoogleDriveFiles.value = true;
  } catch (error) {
    console.error("Google Drive 导入失败:", error);
    googleDriveError.value = t("compile_view.load_files_failed");
    // ElMessage.error("获取文件列表失败");
  } finally {
    googleDriveLoading.value = false;
  }
};

// 处理 Google Drive 文件选择变化
const handleGoogleDriveSelectionChange = (selection: any[]) => {
  selectedGoogleDriveFiles.value = selection;
};

// 确认 Google Drive 文件选择
const confirmGoogleDriveSelection = async () => {
  if (selectedGoogleDriveFiles.value.length === 0) return;

  googleDriveLoading.value = true;
  googleDriveError.value = "";

  try {
    for (const file of selectedGoogleDriveFiles.value) {
      const content = await googleDriveApi.getFileContent(file.id);

      // 导入文件内容到应用
      emit("importFile", {
        name: file.name,
        content: content,
        type: file.name.endsWith(".md") ? "md" : "html",
      });
    }

    ElMessage.success(
      t("compile_view.imported_files_success", {
        count: selectedGoogleDriveFiles.value.length,
      }),
    );
    closeGoogleDriveDialog();
  } catch (error) {
    console.error("导入Google Drive文件失败:", error);
    googleDriveError.value = t("compile_view.get_file_content_failure");
    ElMessage.error(t("compile_view.import_failure"));
  } finally {
    googleDriveLoading.value = false;
  }
};

// 关闭 Google Drive 对话框
const closeGoogleDriveDialog = () => {
  showGoogleDriveFiles.value = false;
  selectedGoogleDriveFiles.value = [];
  googleDriveFiles.value = [];
  googleDriveError.value = "";
};

// 关闭仓库选择对话框
const closeRepoDialog = () => {
  showRepoDialog.value = false;
  repoLoading.value = false;
};

// 处理文件勾选状态变化
const handleFileCheckChange = (
  data: any,
  checked: boolean,
  indeterminate: boolean,
) => {
  if (data.type === "file") {
    if (checked) {
      selectedFiles.value.push(data.path);
    } else {
      selectedFiles.value = selectedFiles.value.filter(
        (path) => path !== data.path,
      );
    }
  }
};

// 确认文件选择
const confirmFileSelection = () => {
  if (selectedFiles.value.length === 0) return;

  emit("importSelectedFiles", selectedRepoData.value, selectedFiles.value);
  closeFileSelectionDialog();
};

// 关闭文件选择对话框
const closeFileSelectionDialog = () => {
  showFileSelectionDialog.value = false;
  selectedRepoData.value = null;
  apiFileTree.value = [];
  selectedFiles.value = [];
};

// 格式化时间
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 获取时间分组标签
const getTimeGroupLabel = (timestamp: number) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return t("compile_view.today");
  } else if (isYesterday) {
    return t("compile_view.yesterday");
  } else {
    return date.toLocaleDateString(locale.value, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }
};

// 按日期分组文件
const groupFilesByDate = (files: TreeData[]) => {
  const grouped: Record<string, TreeData[]> = {};

  files.forEach((file) => {
    const timestamp = file.updatedAt || file.createdAt || Date.now();
    const dateLabel = getTimeGroupLabel(timestamp);

    if (!grouped[dateLabel]) {
      grouped[dateLabel] = [];
    }

    grouped[dateLabel].push(file);
  });

  return grouped;
};

/* ================= Tree 事件转发 ================= */

const togglePlatform = () => emit("togglePlatform");

const handleNodeExpand = (data: TreeData, node: any) => {
  emit("handleNodeExpand", data, node);
};

const handleNodeCollapse = (data: TreeData, node: any) => {
  emit("handleNodeCollapse", data, node);
};

const handleNodeClick = (data: TreeData, node: any) => {
  selectedFile.value = data;
  // selectedFile.value = data.path;
  emit("handleNodeClick", data, node);
};
</script>

<style scoped>
/* 中间面板右边添加线条 */
.user-aside {
  border-right: 1px solid var(--el-border-color);
}

/* 仓库树样式 */
.repo-tree {
  height: 100%;
  overflow: auto;
}

.tree-node-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 4px;
}

.tree-node-label {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.tree-node-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  /* 关键：提升操作按钮的层级，确保可以被点击 */
  z-index: 10;
  position: relative;
}

/* 鼠标悬停时显示操作按钮 */
:deep(.el-tree-node:hover) .tree-node-actions {
  opacity: 1;
}

/* .action-trigger {
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
} */

/* .action-trigger:hover {
  background-color: #f5f7fa;
} */

.more-icon {
  font-size: 16px;
  color: #909399;
}

/* 自定义下拉菜单样式 */
.custom-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: fixed;
  /* 提高z-index值，确保显示在编辑器之上 */
  z-index: 99999;
  background-color: var(--el-color-info-light-9);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  min-width: 120px;
  padding: 4px 0;
  /* 确保菜单始终显示在最上层 */
  pointer-events: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
}

.menu-item:hover {
  background-color: var(--el-color-info-light-8);
}

.menu-item-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* 文件信息展示区域样式 */
.menu-info-section {
  padding: 8px 12px;
  border-top: 1px solid var(--el-border-color);
  background-color: var(--el-color-info-light-9);
}

.info-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 12px;
  line-height: 1.4;
}

.info-label {
  color: var(--el-text-color-primary);
  min-width: 35px;
  flex-shrink: 0;
}

.info-value {
  color: var(--el-text-color-secondary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.repo-item {
  display: block;
  padding: 4px 0;
}

/* GitHub 仓库选择弹窗样式 */
.repo-list-container {
  padding: 10px 0;
}

.repo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.repo-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.repo-itemext-icon {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.repo-name {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 4px;
}

.repo-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 0;
}

.loading-icon {
  font-size: 24px;
  color: #409eff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ================= 时光流模式样式 ================= */

.timeline-view {
  height: 100%;
  overflow-y: auto;
  /* padding: 12px; */
}

.timeline-group {
  margin-bottom: 20px;
}

.timeline-group-header {
  display: flex;
  align-items: center;
  /* gap: 8px; */
  /* padding: 8px 12px; */
  /* background-color: #f5f7fa; */
  border-radius: 6px;
  /* margin-bottom: 12px; */
  font-size: 14px;
  font-weight: 600;
  /* color: #303133; */
  margin: 0 0 0 0;
}

.timeline-files {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timeline-file-header {
  flex: 1;
  min-width: 0;
}

.timeline-file-name {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timeline-file-time {
  font-size: 12px;
  color: #909399;
}

.timeline-file-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
  position: relative;
}

.timeline-file-item:hover .timeline-file-actions {
  opacity: 1;
}

/* ================= 卡片式时光流样式 ================= */

.timeline-group-card {
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.timeline-group-card:hover {
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-card__header) {
  padding: 13px;
}

/* 设置 el-card__body 的样式 */
:deep(.el-card__body) {
  padding: 0;
  margin: 0;
  flex: 0;
  overflow: visible;
}

/* 重新设计卡片样式 */
.timeline-group-card {
  margin-bottom: 20px;
  transition: all 0.3s ease;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.timeline-group-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 使用 Element Plus 的 CSS 变量适配黑暗模式 */

/* 设置 el-container 的样式 */
el-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 设置 el-main 的样式 */
el-main {
  flex: 1;
  overflow-y: auto;
}

/* 设置 repo-header 的样式 */
.repo-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  height: 60px;
  border-bottom: 1px solid var(--el-border-color);
  position: sticky;
  top: 0;
  background-color: var(--el-bg-color);
  z-index: 10;
}

/* 设置 el-card__header 的样式 */
:deep(.el-card__header) {
  border: none;
  background-color: var(--el-color-info-light-9);
  color: var(--el-text-color-primary);
  border-radius: 8px 8px 0 0;
  padding: 12px 16px;
}

.timeline-file-item {
  border: 1px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 4px;
}

/* 文件名样式 */
.timeline-file-name {
  color: var(--el-text-color-primary);
}

/* 时间样式 */
.timeline-file-time {
  color: var(--el-text-color-secondary);
}

/* 卡片样式 */
.timeline-group-card {
  background-color: var(--el-bg-color);
  box-shadow: var(--el-box-shadow-light);
  border: none;
}

/*
.timeline-file-item:hover {
   background-color: var(--el-fill-color-light); 
}
*/

/* 选中文件样式 */
.timeline-file-item.selected {
  background-color: var(--el-color-primary-light-9) !important;
  /* border-color: var(--el-color-primary-light-5); */
}

.timeline-file-item.selected .timeline-file-name {
  color: var(--el-color-primary);
  font-weight: 600;
}

.file-text-limit {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  /* margin-left: 6px; */
  display: inline-block;
  vertical-align: middle;
}

.file-item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
}

.file-type-badge {
  font-size: 10px;
  text-transform: uppercase;
  background: #f4f4f5;
  padding: 0 4px;
  border-radius: 3px;
  margin: 0 0 0 0;
}

/* 移除最后一个文件项目的底部边框 */
.timeline-file-item:last-child {
  border-bottom: none;
  padding-bottom: 12px;
  margin-bottom: 0;
}

.file-item-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item-top {
  display: flex;
  align-items: center;
  width: 100%;
  /* padding-right: 30px; */
  /* 为菜单按钮留出空间 */
}

.timeline-file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-trigger {
  /* position: absolute; */
  /* top: 12px; */
  right: 12px;
  flex-shrink: 0;
}

.file-item-bottom {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-body {
  min-height: 60px;
  cursor: pointer;
}

.file-preview {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  display: box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  box-orient: vertical;
}

/* 搜索框样式 */
:deep(.el-input__wrapper) {
  box-shadow: none;
  border-radius: 4px;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

/* 时光流模式切换按钮样式 */
:deep(.el-button--plain.is-primary) {
  border-color: #409eff;
  color: #409eff;
}

:deep(.el-button--plain.is-primary:hover) {
  background-color: rgba(64, 158, 255, 0.1);
}

/* 重命名输入框样式 */
.rename-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0;
}

.rename-input-wrapper :deep(.el-input) {
  flex: 1;
}

.rename-input-wrapper :deep(.el-input .el-input__wrapper) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
}

.rename-extension {
  padding: 0 12px;
  height: 32px;
  line-height: 32px;
  background: var(--dt-btn-bg);
  border: 1px solid var(--dt-border);
  border-left: none;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  color: var(--dt-text-muted);
  font-size: 14px;
  white-space: nowrap;
}
</style>
