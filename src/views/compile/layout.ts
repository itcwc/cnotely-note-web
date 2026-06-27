import { ElMessage } from "element-plus";

// 定义状态类型
interface State {
  panel1Size: any;
  panel2Size: any;
  editorPanelSize: any;
  splitterWrapper: any;
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

// 更新编辑器面板大小
const updateEditorPanelSize = () => {
  if (!state || !state.splitterWrapper.value) return;

  const totalWidth = state.splitterWrapper.value.clientWidth;
  state.editorPanelSize.value = totalWidth - state.panel1Size.value - state.panel2Size.value;
};

// 监听 localStorage 主题变化（可选，提升体验）
const setupLayoutListeners = () => {
  if (!state) return;
  
  // 监听 app-theme 变化（当前标签页和其他标签页）
  const updateEditorThemes = (themeName: string) => {
    if (!state) return;
    
    const isDark = themeName === 'dark';
    state.editorTheme.value = isDark ? "dark" : "default";
    state.editorAreaTheme.value = isDark ? "pastel-on-dark" : "default";
    state.previewAreaTheme.value = isDark ? "dark" : "default";
  };
  
  // 监听其他标签页的变化
  window.addEventListener("storage", (event: StorageEvent) => {
    if (!state) return;
    
    if (event.key === "app-theme" && event.newValue) {
      updateEditorThemes(event.newValue);
    }
  });
  
  // 监听当前标签页的变化（通过自定义事件）
  window.addEventListener("theme-changed", ((event: CustomEvent) => {
    if (!state) return;
    updateEditorThemes(event.detail.theme);
  }) as EventListener);
};



export {
  handleResizeStart,
  updateEditorPanelSize,
  setupLayoutListeners,
};
