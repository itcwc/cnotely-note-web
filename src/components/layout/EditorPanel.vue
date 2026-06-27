<template>
  <el-container :class="themeClass">
    <el-header
      height="59px"
      style="display: flex; align-items: center; gap: 12px"
    >
      <div class="file-name-editor" @click="handleEditFileName">
        <svg v-if="isRichTextMode" class="file-icon" width="18" height="18" viewBox="0 0 256 256" fill="none">
          <path fill="currentColor" d="M48 128a12 12 0 0 0 12-12V44h76v48a12 12 0 0 0 12 12h48v12a12 12 0 0 0 24 0V88a12 12 0 0 0-3.51-8.49l-56-56A12 12 0 0 0 152 20H56a20 20 0 0 0-20 20v76a12 12 0 0 0 12 12m135-48h-23V57ZM68 160v48a12 12 0 0 1-24 0v-12H32v12a12 12 0 0 1-24 0v-48a12 12 0 0 1 24 0v12h12v-12a12 12 0 0 1 24 0m60 0a12 12 0 0 1-12 12h-4v36a12 12 0 0 1-24 0v-36h-4a12 12 0 0 1 0-24h32a12 12 0 0 1 12 12m72 0v48a12 12 0 0 1-24 0v-9.36l-.11.16a12 12 0 0 1-19.78 0l-.11-.16V208a12 12 0 0 1-24 0v-48a12 12 0 0 1 21.89-6.8L166 170.82l12.11-17.62A12 12 0 0 1 200 160m56 48a12 12 0 0 1-12 12h-24a12 12 0 0 1-12-12v-48a12 12 0 0 1 24 0v36h12a12 12 0 0 1 12 12"/>
        </svg>
        <svg v-else class="file-icon" width="18" height="18" viewBox="0 0 256 256" fill="none">
          <path fill="currentColor" d="M100 152v56a12 12 0 0 1-24 0v-17.93l-6.17 8.81a12 12 0 0 1-19.66 0L44 190.07V208a12 12 0 0 1-24 0v-56a12 12 0 0 1 21.83-6.88L60 171.07l18.17-25.95A12 12 0 0 1 100 152m84 28a40 40 0 0 1-40 40h-16a12 12 0 0 1-12-12v-56a12 12 0 0 1 12-12h16a40 40 0 0 1 40 40m-24 0a16 16 0 0 0-16-16h-4v32h4a16 16 0 0 0 16-16m60-92v136a12 12 0 0 1-24 0V104h-48a12 12 0 0 1-12-12V44H60v64a12 12 0 0 1-24 0V40a20 20 0 0 1 20-20h96a12 12 0 0 1 8.49 3.52l56 56A12 12 0 0 1 220 88m-60-8h23l-23-23Z"/>
        </svg>
        <EditableText
          ref="editableTextRef"
          v-model="localFileName"
          :placeholder="t('compile_view.file_name_placeholder')"
        />
        <svg class="edit-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
          <path d="m15 5 4 4"/>
        </svg>
      </div>

      <!-- 右侧工具栏 -->
      <div
        style="
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 12px;
          margin-left: auto;
        "
      >
        <!-- 新建文件按钮 -->
        <el-tooltip :content="t('compile_view.new_file')" placement="top">
          <el-button
            class="toolbar-btn toolbar-btn--primary"
            @click="emit('openNewFileDialog')"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M10 4V16M4 10H16" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </el-button>
        </el-tooltip>

        <!-- 导入文件按钮 -->
        <el-tooltip :content="t('compile_view.import_file')" placement="top">
          <el-button
            class="toolbar-btn"
            :icon="Upload"
            @click="showImportDialog = true"
          />
        </el-tooltip>

        <!-- 导出按钮 -->
        <el-tooltip :content="t('compile_view.export')" placement="top">
          <el-button
            class="toolbar-btn"
            :icon="Download"
            @click="openExportDialog"
          />
        </el-tooltip>

        <!-- 保存到云按钮 -->
        <el-tooltip :content="t('compile_view.save_to_cloud')" placement="top">
          <el-button
            class="toolbar-btn"
            type="success"
            :icon="UploadFilled"
            @click="saveCloud"
            :loading="isSavingToCloud"
            :disabled="isSavingToCloud"
          />
        </el-tooltip>

        <!-- 存储提供者标签 -->
        <el-tag
          v-if="userInfo && userInfo.default_storage_provider"
          :type="
            userInfo.default_storage_provider === 'github' ? 'info' : 'success'
          "
          size="small"
          effect="plain"
        >
          {{
            userInfo.default_storage_provider === "github"
              ? "GitHub"
              : "Google Drive"
          }}
        </el-tag>
      </div>
    </el-header>
    <el-main
      style="padding: 0; height: 100%; display: flex; flex-direction: column"
    >
      <!-- 导入确认对话框 -->
      <el-dialog
        v-model="showImportDialog"
        :title="t('compile_view.select_import_method')"
        width="400px"
        class="unified-choice-dialog"
      >
        <div style="display:flex;flex-direction:column;gap:10px;">
          <button class="choice-btn choice-btn-light" @click="handleLocalImport">
            <el-icon><Upload /></el-icon>
            <span>{{ t("compile_view.local_import") }}</span>
            <span class="status-badge status-none">{{ t("cloud_storage.status_none") }}</span>
          </button>
          <button class="choice-btn choice-btn-light" @click="handleGoogleDriveImport">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>{{ t("compile_view.google_drive_import") }}</span>
            <span v-if="currentProvider === 'google'" class="status-badge status-connected">{{ t("cloud_storage.status_connected") }}</span>
            <span v-else class="status-badge status-disconnected">{{ t("cloud_storage.status_disconnected") }}</span>
          </button>
          <button class="choice-btn choice-btn-dark" @click="openRepoDialogLocal">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>{{ t("compile_view.github_import") }}</span>
            <span v-if="currentProvider === 'github'" class="status-badge status-connected">{{ t("cloud_storage.status_connected") }}</span>
            <span v-else class="status-badge status-disconnected">{{ t("cloud_storage.status_disconnected") }}</span>
          </button>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showImportDialog = false">取消</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- Google Drive 文件列表对话框 -->
      <el-dialog
        v-model="showGoogleDriveFiles"
        :title="t('compile_view.select_google_drive_files')"
        width="680px"
      >
        <div
          v-if="googleDriveLoading"
          style="padding: 40px; text-align: center"
        >
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
          <el-empty description="暂无文件" />
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
            <el-button @click="closeGoogleDriveDialog">取消</el-button>
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
      <!-- 根据 editorMode 选择编辑器 -->
      <div class="md-editor">
        <RichTextEditor
          v-if="isRichTextMode"
          v-model="selectedFile.content"
          :height="height"
          @contentChange="handleRichTextChange"
        />
        <MarkdownEditor
          v-else-if="isMarkdownFile"
          v-model="selectedFile.content"
          :height="height"
          :width="editorPanelSize"
          :editLanguage="editLanguage"
          :editorTheme="editorTheme"
          :editorAreaTheme="editorAreaTheme"
          :previewAreaTheme="previewAreaTheme"
        />
        <PlainTextEditor
          v-else
          v-model="selectedFile.content"
          :height="height"
          :width="editorPanelSize"
          :editLanguage="editLanguage"
          :editorTheme="editorTheme"
          :editorAreaTheme="editorAreaTheme"
          :previewAreaTheme="previewAreaTheme"
        />
      </div>
    </el-main>

    <!-- 导出对话框组件 -->
    <ExportDialog
      :visible="showExportDialog"
      @update:visible="showExportDialog = $event"
      :select-value="selectValue"
      @update:selectValue="selectValue = $event"
      :options="options"
      @confirm="handleExportConfirm"
      @cancel="handleExportCancel"
    />
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox, ElLoading } from "element-plus";
import MarkdownEditor from "../MarkdownEditor.vue";
import PlainTextEditor from "../PlainTextEditor.vue";
import RichTextEditor from "../RichTextEditor.vue";
import EditableText from "../EditableText.vue";
import ExportDialog from "../ExportDialog.vue";
import {
  Download,
  UploadFilled,
  Upload,
  Loading,
} from "@element-plus/icons-vue";
import {
  exportMarkdown,
  exportTxt,
  exportPdf,
  exportHtml,
  exportDocx,
  ExportOptions,
  exportMarkdownFromHtml,
} from "../../utils/export";
import { indexedDBHelper } from "../../utils/indexedDB";
import githubApi from "../../api/github/index";
import googleDriveApi from "../../api/googleDrive";
import { useCloudStorage } from "@/utils/useCloudStorage";

const { isSyncing, saveToCloud } = useCloudStorage();

const props = defineProps({
  height: {
    type: String,
    default: "100%",
  },
  editorPanelSize: {
    type: Number,
    default: undefined,
  },
  editLanguage: {
    type: String,
    default: "en",
  },
  editorTheme: {
    type: String,
    default: "default",
  },
  editorAreaTheme: {
    type: String,
    default: "default",
  },
  previewAreaTheme: {
    type: String,
    default: "default",
  },
  selectedFile: {
    type: Object,
    default: () => ({ name: "", path: "", content: "" }),
  },
  fileName: {
    type: String,
    default: "",
  },
});

const emit = defineEmits([
  "exportFile",
  "saveCloud",
  "update:fileName",
  "contentChange",
  "openNewFileDialog",
  "importFile",
  "openRepoDialog",
]);

const { t, locale } = useI18n();

// 响应式主题状态
const currentTheme = ref('light')

// 根据主题设置动态类名
const themeClass = computed(() => `theme-${currentTheme.value}`)

// 更新主题函数
const updateTheme = () => {
  if (document.documentElement.classList.contains('theme-dark')) {
    currentTheme.value = 'dark'
  } else if (document.documentElement.classList.contains('theme-sepia')) {
    currentTheme.value = 'sepia'
  } else {
    currentTheme.value = 'light'
  }
}

// 判断是否为 Markdown 文件
const isMarkdownFile = computed(() => {
  if (!props.selectedFile?.name) return true;
  return props.selectedFile.name.endsWith('.md');
});

// 判断是否为富文本模式（兼容 editorMode 字段和 .html 后缀两种判断方式）
const isRichTextMode = computed(() => {
  if (props.selectedFile?.editorMode === 'richtext') return true;
  if (props.selectedFile?.name?.endsWith('.html')) return true;
  return false;
});

const handleRichTextChange = (html: string) => {
  emit("contentChange", { ...props.selectedFile, content: html });
};

// 本地文件名状态，用于EditableText组件的v-model
// const localFileName = ref(props.fileName);
const localFileName = defineModel<string>("fileName", { default: "" });

// 用户信息，用于显示默认存储提供者
const userInfo = ref<any>(null);

// 初始化获取用户信息
const initUserInfo = () => {
  const storedUserInfo = localStorage.getItem("user_info");
  if (storedUserInfo) {
    try {
      userInfo.value = JSON.parse(storedUserInfo);
    } catch (error) {
      console.error("解析用户信息失败:", error);
    }
  }
};

// 初始化调用
initUserInfo();

// 当前授权的平台（用于导入弹窗显示状态）
const currentProvider = ref<string | null>(localStorage.getItem("oauth_provider"));

// 监听内容变化（通知父组件保存）
watch(
  () => props.selectedFile.content,
  (newContent, oldContent) => {
    if (newContent !== oldContent) {
      emit("contentChange", props.selectedFile);
    }
  },
);

// 导出选项
const options = [
  { value: "md", label: "compile_view.export_md" },
  { value: "pdf", label: "compile_view.export_pdf" },
  { value: "html", label: "compile_view.export_html" },
  { value: "docx", label: "compile_view.export_docx" },
  { value: "txt", label: "compile_view.export_txt" },
];
const selectValue = ref(options[0].value);

// 弹窗相关状态
const showExportDialog = ref(false);

// 导入对话框状态
const showImportDialog = ref(false);
const showGoogleDriveFiles = ref(false);
const googleDriveFiles = ref<any[]>([]);
const selectedGoogleDriveFiles = ref<any[]>([]);
const googleDriveLoading = ref(false);
const googleDriveError = ref<string>("");

// 云存储保存状态
const isSavingToCloud = ref(false);

// 文件名编辑 ref
const editableTextRef = ref<any>(null);

const handleEditFileName = () => {
  editableTextRef.value?.startEdit();
};

const getOptionLabel = (item: { value: string; label: string }) =>
  t(item.label);

// 打开导出对话框
const openExportDialog = () => {
  showExportDialog.value = true;
};

// 处理导出确认
const handleExportConfirm = (format: string) => {
  exportFile();
};

// 处理导出取消
const handleExportCancel = () => {
  // 对话框关闭由ExportDialog组件内部处理
};

// 处理本地导入
const handleLocalImport = () => {
  // 创建隐藏的文件输入元素
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".md,.html,.txt";
  input.style.display = "none";

  // 添加到DOM
  document.body.appendChild(input);

  // 监听文件选择事件
  input.addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      // 检查文件类型
      if (
        file.type === "text/markdown" ||
        file.type === "text/html" ||
        file.type === "text/plain" ||
        file.name.endsWith(".md") ||
        file.name.endsWith(".html") ||
        file.name.endsWith(".txt")
      ) {
        // 读取文件内容
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          // 触发导入事件，将文件内容传递给父组件
          emit("importFile", {
            name: file.name,
            content,
            type: file.name.endsWith(".md")
              ? "md"
              : file.name.endsWith(".txt")
                ? "txt"
                : "html",
          });
          // 关闭导入对话框
          showImportDialog.value = false;
        };
        reader.readAsText(file);
      } else {
        ElMessage.error(t("compile_view.only_support_formats"));
      }
    }

    // 清理DOM
    document.body.removeChild(input);
  });

  // 触发文件选择对话框
  input.click();
};

// 处理Google Drive导入
const handleGoogleDriveImport = async () => {
  try {
    googleDriveLoading.value = true;
    googleDriveError.value = "";

    // 调用Google Drive API获取文件列表
    const files = await googleDriveApi.getFiles();
    googleDriveFiles.value = files;
    selectedGoogleDriveFiles.value = [];
    showGoogleDriveFiles.value = true;
  } catch (error: any) {
    console.error("获取Google Drive文件失败:", error);
    googleDriveError.value = error.message || "获取文件失败，请检查授权状态";
    ElMessage.error(googleDriveError.value);
  } finally {
    googleDriveLoading.value = false;
  }
};

// 处理Google Drive文件选择
const handleGoogleDriveSelectionChange = (selection: any[]) => {
  selectedGoogleDriveFiles.value = selection;
};

// 确认Google Drive文件导入
const confirmGoogleDriveSelection = async () => {
  if (selectedGoogleDriveFiles.value.length === 0) return;

  try {
    const loading = ElLoading.service({
      lock: true,
      text: t("compile_view.importing"),
      background: "rgba(0, 0, 0, 0.7)",
    });

    for (const file of selectedGoogleDriveFiles.value) {
      try {
        // 获取文件内容
        const content = await googleDriveApi.getFileContent(file.id);

        // 触发导入事件
        emit("importFile", {
          name: file.name,
          content,
          type: file.name.endsWith(".md") ? "md" : "html",
        });
      } catch (error: any) {
        console.error(`导入文件 ${file.name} 失败:`, error);
        ElMessage.error(
          t("compile_view.import_file_failed", {
            name: file.name,
            error: error.message,
          }),
        );
      }
    }

    loading.close();
    ElMessage.success(
      t("compile_view.imported_files_success", {
        count: selectedGoogleDriveFiles.value.length,
      }),
    );
    closeGoogleDriveDialog();
    showImportDialog.value = false;
  } catch (error: any) {
    console.error("导入Google Drive文件失败:", error);
    ElMessage.error(t("compile_view.import_failed"));
  }
};

// 关闭Google Drive对话框
const closeGoogleDriveDialog = () => {
  showGoogleDriveFiles.value = false;
  googleDriveFiles.value = [];
  selectedGoogleDriveFiles.value = [];
  googleDriveError.value = "";
};

// 打开GitHub仓库对话框
const openRepoDialogLocal = () => {
  // 触发仓库选择事件，将控制权传递给父组件
  emit("openRepoDialog");
  showImportDialog.value = false;
};

// 导出文件方法
const exportFile = async () => {
  const format = selectValue.value;
  const content = props.selectedFile.content;
  if (!content.trim()) {
    ElMessage({
      message: t("compile_view.empty_input_message"),
      type: "error",
      duration: 2000,
    });
    return;
  }
  const name = props.fileName || t("compile_view.new_note"); // 使用输入的文件名或默认值

  // 判断是否为HTML内容（根据文件扩展名）
  const isHtmlContent = props.selectedFile.name.endsWith('.html');

  // 基本导出选项
  const baseExportOptions: ExportOptions = {
    content,
    fileName: name,
    isHtmlContent,
  };

  switch (format) {
    case "md":
      if (isHtmlContent) {
        exportMarkdownFromHtml(baseExportOptions);
        return;
      }
      exportMarkdown(baseExportOptions);
      break;
    case "pdf":
      await exportPdf(baseExportOptions);
      break;
    case "html":
      ElMessageBox({
        title: t("compile_view.export_html_title"),
        message: t("compile_view.export_html_message"),
        dangerouslyUseHTMLString: true,
        showCancelButton: true,
        confirmButtonText: t("compile_view.dark_mode"),
        cancelButtonText: t("compile_view.light_mode"),
        confirmButtonClass: "export-hmd-cbtn",
      })
        .then(() => {
          exportHtml({ ...baseExportOptions, theme: "dark" });
        })
        .catch(() => {
          exportHtml({ ...baseExportOptions, theme: "light" });
        });
      break;
    case "docx":
      exportDocx(baseExportOptions);
      break;
    case "txt":
      exportTxt(baseExportOptions);
      break;
    default:
      console.error("Unsupported format");
  }
  // emit("exportFile", format, content, name);
};

// 保存到云方法
const saveCloud = async () => {
  // 防止重复点击
  if (isSavingToCloud.value) return;
  
  try {
    isSavingToCloud.value = true;
    // 根据文件名的后缀判断类型，而不是 selectedFile.name（两者可能不同步）
    const fileType = props.fileName.endsWith('.html') ? 'html' : 'md';
    // 确保文件名有正确的后缀（防止无后缀文件被错误分类）
    let saveFileName = props.fileName;
    if (!saveFileName.includes('.')) {
      saveFileName += fileType === 'md' ? '.md' : '.html';
    }
    const success = await saveToCloud(
      saveFileName,
      props.selectedFile.content,
      fileType,
    );

    // if (success) {
    //   emit("saveCloud");
    // }
  } finally {
    isSavingToCloud.value = false;
  }
};

// 生命周期
onMounted(() => {
  // 初始化主题
  updateTheme()
  
  // 监听主题变化事件
  window.addEventListener('theme-changed', updateTheme)
})

onUnmounted(() => {
  // 清理监听器
  window.removeEventListener('theme-changed', updateTheme)
})

// 监听fileName变化
watch(
  () => props.fileName,
  (newVal) => {
    emit("update:fileName", newVal);
  },
);
</script>

<style scoped>
/* Header 主题样式 - 使用 CSS 变量统一色调 */
:deep(.el-header) {
  background: var(--dt-bg-surface);
  border-bottom: 1px solid var(--dt-border);
  transition: background 0.3s, border-color 0.3s;
}

/* File Name Editor - 文件名编辑区域 */
.file-name-editor {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  /* background: var(--dt-bg-hover); */
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-name-editor:hover {
  background: var(--dt-bg-active);
  border-color: var(--dt-border);
}

.file-name-editor:hover .edit-icon {
  opacity: 1;
}

.file-icon {
  color: var(--dt-text-secondary);
  flex-shrink: 0;
}

.edit-icon {
  color: var(--dt-text-muted);
  opacity: 0;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

/* 暗色主题 */
.theme-dark :deep(.el-header) .el-button:not(.toolbar-btn--primary) {
  background: var(--dt-btn-bg);
  color: var(--dt-btn-icon);
  border-color: var(--dt-border);
}

.theme-dark :deep(.el-header) .el-button:not(.toolbar-btn--primary):hover {
  background: var(--dt-btn-hover);
  color: var(--dt-accent);
}

.theme-dark :deep(.el-header) .el-tag {
  background: var(--dt-btn-bg);
  border-color: var(--dt-border);
  color: var(--dt-text-secondary);
}

/* 米色护眼主题 */
.theme-sepia :deep(.el-header) .el-button:not(.toolbar-btn--primary) {
  background: var(--dt-btn-bg);
  color: var(--dt-btn-icon);
  border-color: var(--dt-border);
}

.theme-sepia :deep(.el-header) .el-button:not(.toolbar-btn--primary):hover {
  background: var(--dt-btn-hover);
  color: var(--dt-accent);
}

.theme-sepia :deep(.el-header) .el-tag {
  background: var(--dt-btn-bg);
  border-color: var(--dt-border);
  color: var(--dt-text-secondary);
}

/* 浅色主题 */
.theme-light :deep(.el-header) .el-button:not(.toolbar-btn--primary) {
  background: var(--dt-btn-bg);
  color: var(--dt-btn-icon);
  border-color: var(--dt-border);
}

.theme-light :deep(.el-header) .el-button:not(.toolbar-btn--primary):hover {
  background: var(--dt-btn-hover);
  color: var(--dt-accent);
}

.theme-light :deep(.el-header) .el-tag {
  background: var(--dt-btn-bg);
  border-color: var(--dt-border);
  color: var(--dt-text-secondary);
}

.md-editor {
  height: 100%;
  position: relative;
  flex: 1;
  overflow: hidden;
}

.menu {
  height: 50px;
}

.menu >>> .el-card__body {
  padding: 10px;
}

.menu-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-right: auto;
}

.settings-link {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.export-select {
  width: 180px;
}

.export-btn {
  margin-left: 10px;
}

.menu a {
  margin-left: 10px;
}

.file-name-header {
  display: flex;
  align-items: center;
  font-size: 22px;
  color: var(--dt-text-primary);
  max-width: 100%;
  overflow: hidden;
}

.notebook-icon {
  color: var(--dt-accent);
  font-size: 22px;
  flex-shrink: 0;
  margin-right: 8px;
}

.toolbar-btn {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  padding: 0;
}

.toolbar-btn--primary {
  background: var(--dt-accent);
  border-color: var(--dt-accent);
}

.toolbar-btn--primary:hover {
  background: var(--dt-accent-hover);
  border-color: var(--dt-accent-hover);
}
</style>
