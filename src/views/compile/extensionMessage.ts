import { ElMessage } from "element-plus";
import { indexedDBHelper } from "../../utils/indexedDB";
import { refreshFiles } from "./search";
import { ref } from "vue";

// 定义状态类型
interface State {
  selectedFile: any;
  editorType: any;
  fileName: any;
  editorId: any;
}

// 状态对象，将在 Compile.vue 中设置
let state: State | null = null;
let t: any = null;

// 设置状态
export const setExtensionState = (s: State, i18n: any) => {
  state = s;
  t = i18n;
};

// 核心处理逻辑：将插件数据写入 IndexedDB 并更新 UI
const processSyncData = async (data: any) => {
  if (!state) return;

  // 1. 获取插件传来的类型：rich-text 或 markdown
  const { id, content, title, type: pluginEditorType } = data;
  if (!content) return;

  // --- 【关键：建立映射关系】 ---
  // 将插件的 'rich-text' 映射为 Web 的 'html'，'markdown' 映射为 'md'
  const isRichText = pluginEditorType === "rich-text" || pluginEditorType === "html";
  const targetType = isRichText ? "html" : "md";
  const targetEditor = isRichText ? "quill" : "editormd";
  // ----------------------------

  const ext = `.${targetType}`;
  const rawName = title || "未命名笔记";
  const finalFileName = rawName.endsWith(ext) ? rawName : `${rawName}${ext}`;

  const fileRecord: any = {
    name: finalFileName,
    content: content,
    type: targetType,
    updatedAt: Date.now(),
  };

  if (id && id !== "null" && id !== "") {
    fileRecord.id = Number(id);
  }

  // 2. 执行数据库保存
  console.log(`同步中: 识别为 ${targetEditor} 模式`);
  const result = await indexedDBHelper.saveFile(fileRecord);

  if (result.content === undefined || result.content === null) {
    result.content = "";
  }

  state.selectedFile.value = {
    ...result, // 展开所有属性，包含 id, name, content, type
  };

  // 3. 【核心修复】同步 Web 端的状态机
  // 必须更新 state 里的这几个响应式变量，UI 才会切换
  if (state.editorType) {
    state.editorType.value = targetEditor;
  }

  if (state.selectedFile) {
    state.selectedFile.value = result; // 包含新内容和 ID
  }

  if (state.fileName) {
    // 移除后缀显示在标题输入框
    state.fileName.value = rawName.replace(/\.(md|html)$/, "");
  }

  // 4. 【强制刷新】触发编辑器组件销毁并重建，确保内容渲染正确
  if (state.editorId) {
    state.editorId.value = Date.now();
  }

  // 5. 刷新时光流显示
  await refreshFiles();

  return result.id;
};

// 统一的消息处理函数
const handleExtensionMessage = async (event: MessageEvent) => {
  if (!t) return;

  // 1. 过滤非同步指令
  if (event.data?.action !== "syncFromExtension") return;

  console.log("Web 端收到同步指令:", event.data);

  try {
    // 2. 处理数据并获取保存后的 ID
    const savedId = await processSyncData(event.data);

    // 3. ✅ 关键反馈：通知插件（通过 Content Script）本次操作的 ID
    window.postMessage(
      {
        action: "syncResult",
        status: "success",
        id: savedId,
      },
      "*",
    );

    ElMessage.success(t("compile_view.import_success") || "同步成功");
  } catch (err) {
    console.error("同步失败:", err);
    ElMessage.error("插件同步失败");
  }
};

// 处理跨页面跳转同步 (场景 B)
const handleCrossPageSync = async () => {
  if (typeof chrome !== "undefined" && chrome?.storage) {
    chrome.storage.local.get(["transfer_sync_data"], async (result) => {
      const data = result.transfer_sync_data;
      if (
        data &&
        data.action === "syncFromExtension" &&
        Date.now() - data.timestamp < 60000
      ) {
        await processSyncData(data);
        chrome.storage.local.remove("transfer_sync_data");
      }
    });
  }
};

// 注册插件消息监听器
const registerExtensionListeners = () => {
  window.addEventListener("message", handleExtensionMessage);
};

// 清理插件消息监听器
const cleanupExtensionListeners = () => {
  window.removeEventListener("message", handleExtensionMessage);
};

export {
  processSyncData,
  handleExtensionMessage,
  handleCrossPageSync,
  registerExtensionListeners,
  cleanupExtensionListeners,
};
