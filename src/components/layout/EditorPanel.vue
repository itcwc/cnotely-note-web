<template>
  <el-container>
    <el-header
      height="59px"
      style="display: flex; align-items: center; gap: 16px"
    >
      <el-icon class="notebook-icon">
        <Notebook />
      </el-icon>
      <EditableText
        v-model="localFileName"
        :placeholder="t('compile_view.file_name_placeholder')"
      />

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
            type="primary"
            :icon="Plus"
            @click="emit('openNewFileDialog')"
            plain
          >
            <span class="btn-text">{{ t("compile_view.new_file") }}</span>
          </el-button>
        </el-tooltip>

        <!-- 导入文件按钮 -->
        <el-tooltip :content="t('compile_view.import_file')" placement="top">
          <el-button
            type="primary"
            :icon="Upload"
            @click="showImportDialog = true"
            plain
          >
            <span class="btn-text">{{ t("compile_view.import_file") }}</span>
          </el-button>
        </el-tooltip>

        <!-- 导出按钮 -->
        <el-tooltip :content="t('compile_view.export')" placement="top">
          <el-button
            class="export-btn"
            type="primary"
            @click="openExportDialog"
            :icon="Download"
            plain
          >
            <span class="btn-text">{{ t("compile_view.export") }}</span>
          </el-button>
        </el-tooltip>

        <!-- 保存到云按钮 -->
        <el-tooltip :content="t('compile_view.save_to_cloud')" placement="top">
          <el-button
            class="save-to-cloud"
            type="success"
            @click="saveCloud"
            :icon="UploadFilled"
            :loading="isSavingToCloud"
            :disabled="isSavingToCloud"
          >
            <span class="btn-text">{{ t("compile_view.save_to_cloud") }}</span>
          </el-button>
        </el-tooltip>

        <!-- 默认存储提供者标签 -->
        <el-text v-if="userInfo && userInfo.default_storage_provider">{{
          t("compile_view.current_default")
        }}</el-text>
        <el-tag
          v-if="userInfo && userInfo.default_storage_provider"
          :type="
            userInfo.default_storage_provider === 'github' ? 'info' : 'success'
          "
          size="small"
          effect="light"
        >
          {{
            userInfo.default_storage_provider === "github"
              ? t("compile_view.github")
              : t("compile_view.google_drive")
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
      >
        <div style="margin-top: 20px">
          <el-button
            type="primary"
            size="large"
            style="width: 100%; margin-bottom: 12px"
            @click="handleLocalImport"
            plain
          >
            <el-icon><Upload /></el-icon>
            {{ t("compile_view.local_import") }}
          </el-button>
          <el-button
            size="large"
            style="width: 100%; margin-bottom: 12px; margin-left: 0px"
            @click="handleGoogleDriveImport"
            type="success"
            plain
          >
            <img
              src="/imgs/icon/google_drive.png"
              alt="Google Drive"
              style="
                width: 18px;
                height: 18px;
                margin-right: 8px;
                vertical-align: middle;
              "
            />
            {{ t("compile_view.google_drive_import") }}
          </el-button>
          <el-button
            size="large"
            style="width: 100%; margin-left: 0px"
            @click="openRepoDialogLocal"
            type="success"
            plain
          >
            <img
              src="/imgs/icon/github_favicon.svg"
              alt="GitHub"
              style="
                width: 18px;
                height: 18px;
                margin-right: 8px;
                vertical-align: middle;
              "
            />
            {{ t("compile_view.github_import") }}
          </el-button>
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
      <div class="md-editor">
        <Editormd
          :key="editorId"
          v-if="localEditorType === 'editormd'"
          v-model="selectedFile.content"
          :height="height"
          :width="editorPanelSize"
          :editLanguage="editLanguage"
          :editorTheme="editorTheme"
          :editorAreaTheme="editorAreaTheme"
          :previewAreaTheme="previewAreaTheme"
        />
        <QuillEditor
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
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox, ElLoading } from "element-plus";
import Editormd from "../Editormd.vue";
import QuillEditor from "../QuillEditor.vue";
import EditableText from "../EditableText.vue";
import ExportDialog from "../ExportDialog.vue";
import {
  Notebook,
  QuestionFilled,
  Download,
  UploadFilled,
  Plus,
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
  editorType: {
    type: String,
    default: "editormd",
  },
});

const emit = defineEmits([
  "switchEditorType",
  "exportFile",
  "saveCloud",
  "update:fileName",
  "contentChange",
  "openNewFileDialog",
  "importFile",
  "openRepoDialog",
]);

const { t, locale } = useI18n();

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

// 监听内容变化（通知父组件保存）
watch(
  () => props.selectedFile.content,
  (newContent, oldContent) => {
    if (newContent !== oldContent) {
      emit("contentChange", props.selectedFile);
    }
  },
);

// EditorPanel.vue 的 <script setup> 中
const editorId = ref(Date.now());

// 监听从最外层传进来的 selectedFile
watch(
  () => props.selectedFile.name, // 监听文件名，或者监听整个对象
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      // 文件名变了，说明切换了文件，更新 ID 触发 Editormd 销毁重装
      editorId.value = Date.now();
      // console.log("检测到文件切换，重置编辑器 ID");
    }
  },
);

// 编辑器类型从props获取，使用本地ref来处理v-model绑定
const localEditorType = defineModel<string>("editorType", {
  default: "editormd",
});

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

// 切换编辑器类型
const switchEditorType = (type: string) => {
  localStorage.setItem("editorType", type);
  emit("switchEditorType", type);
  ElMessage({
    message: t("compile_view.switched_to_editor", {
      editor:
        type === "editormd"
          ? t("compile_view.markdown")
          : t("compile_view.rich_text"),
    }),
    type: "success",
    duration: 1500,
  });
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

  // 判断是否为HTML内容（富文本编辑器）
  const isHtmlContent = localEditorType.value === "quill";

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
    const success = await saveToCloud(
      props.fileName,
      props.selectedFile.content,
      localEditorType.value,
    );

    // if (success) {
    //   emit("saveCloud");
    // }
  } finally {
    isSavingToCloud.value = false;
  }
};

// 监听fileName变化
watch(
  () => props.fileName,
  (newVal) => {
    emit("update:fileName", newVal);
  },
);
</script>

<style scoped>
.md-editor {
  height: 100%;
  position: relative;
  /* z-index: 1001; */
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
  color: #303133;
  max-width: 100%;
  overflow: hidden;
}

.notebook-icon {
  color: #409eff;
  font-size: 22px;
  flex-shrink: 0;
  margin-right: 8px;
}

/* 默认只显示文字，不显示图标 */
.markdown-guide-icon {
  display: none;
  font-size: 20px;
  margin: 0 0 0 10px;
  vertical-align: middle;
}

.btn-icon {
  display: none;
  font-size: 16px;
  vertical-align: middle;
}
</style>
