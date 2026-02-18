import { nextTick } from "vue";
import { ElMessage } from "element-plus";

// 定义状态类型
interface State {
  panel1Size: any;
  panel2Size: any;
  editorPanelSize: any;
  splitterWrapper: any;
  editorType: any;
  editorTheme: any;
  editorAreaTheme: any;
  previewAreaTheme: any;
}

// 状态对象，将在 Compile.vue 中设置
let state: State | null = null;
let t: any = null;

// 设置状态
export const setLayoutState = (s: State, i18n: any) => {
  state = s;
  t = i18n;
};

// 处理调整开始
const handleResizeStart = (index: number, sizes: number[]) => {
  // 记录调整开始前的面板1宽度
};

// 版面调整函数
const setLayout = (layout: number) => {
  if (!state) return;
  
  switch (layout) {
    case 1: // 默认版面
      state.panel1Size.value = 200;
      state.panel2Size.value = 250;
      break;

    case 2: // 折叠左侧
      state.panel1Size.value = 50;
      state.panel2Size.value = 250;
      break;

    case 3: // 专注编辑
      state.panel1Size.value = 50;
      state.panel2Size.value = 0;
      break;
  }

  // 保存布局设置到 localStorage
  localStorage.setItem("layout", layout.toString());

  // ⚠️ 关键：在布局变更后同步更新编辑器宽度
  nextTick(() => {
    updateEditorPanelSize();
  });
};

// 更新编辑器面板大小
const updateEditorPanelSize = () => {
  if (!state || !state.splitterWrapper.value) return;

  const totalWidth = state.splitterWrapper.value.clientWidth;
  state.editorPanelSize.value = totalWidth - state.panel1Size.value - state.panel2Size.value;
};

// 监听 localStorage 主题变化（可选，提升体验）
const setupLayoutListeners = () => {
  if (!state) return;
  
  window.addEventListener("storage", (event: StorageEvent) => {
    if (!state) return;
    
    if (event.key === "isDarkTheme") {
      const dark = event.newValue === "true";
      state.editorTheme.value = dark ? "dark" : "default";
      state.editorAreaTheme.value = dark ? "pastel-on-dark" : "default";
      state.previewAreaTheme.value = dark ? "dark" : "default";
    } else if (event.key === "editorType") {
      state.editorType.value = event.newValue || "editormd";
    }
  });
};

// 切换编辑器类型
const switchEditorType = (type: string) => {
  if (!state || !t) return;
  
  state.editorType.value = type;
  localStorage.setItem("editorType", type);
  ElMessage({
    message:
      type === "editormd"
        ? t("compile_view.switched_to_markdown_editor")
        : t("compile_view.switched_to_rich_text_editor"),
    type: "success",
    duration: 1500,
  });
};

export {
  handleResizeStart,
  setLayout,
  updateEditorPanelSize,
  setupLayoutListeners,
  switchEditorType,
};
