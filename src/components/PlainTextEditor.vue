<template>
  <div
    class="plain-text-editor-container"
    :class="themeClass"
    :style="{ height: props.height }"
  >
    <!-- 工具栏（简化版） -->
    <div class="editor-toolbar">
      <button
        @click="handleUndo"
        :title="t('editor.toolbar.undo')"
        :disabled="!canUndo"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 7v6h6" />
          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
        </svg>
      </button>
      <button
        @click="handleRedo"
        :title="t('editor.toolbar.redo')"
        :disabled="!canRedo"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 7v6h-6" />
          <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
        </svg>
      </button>
      <div class="toolbar-separator" />
      <button @click="insertTab" :title="t('editor.shortcuts.tab')">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 8h13" />
          <path d="M17 8l4-4-4-4" />
          <path d="M3 16h13" />
          <path d="M17 16l4-4-4-4" />
        </svg>
      </button>
    </div>

    <!-- 编辑区 -->
    <div class="editor-content">
      <div class="line-numbers">
        <div v-for="n in lineCount" :key="n">{{ n }}</div>
      </div>
      <textarea
        ref="textareaRef"
        v-model="localContent"
        @input="handleInput"
        @scroll="syncScroll"
        @keydown="handleKeydown"
        class="editor-textarea"
        :placeholder="t('editor.placeholders.plain_text') || '开始编写...'"
      />
    </div>

    <!-- 状态栏 -->
    <div class="editor-statusbar">
      <span>{{ t("editor.stats.chars") }}: {{ charCount }}</span>
      <span>{{ t("editor.stats.lines") }}: {{ lineCount }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// Props - 保持与 MarkdownEditor 相同的 API
const props = defineProps<{
  modelValue: string;
  height?: string;
  width?: string | number;
  editLanguage?: string;
  editorTheme?: string;
  editorAreaTheme?: string;
  previewAreaTheme?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

// 内部状态
const localContent = ref(props.modelValue);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

// 响应式主题状态
const currentTheme = ref("light");

// 根据主题设置动态类名
const themeClass = computed(() => `theme-${currentTheme.value}`);

// 更新主题函数
const updateTheme = () => {
  if (document.documentElement.classList.contains("theme-dark")) {
    currentTheme.value = "dark";
  } else if (document.documentElement.classList.contains("theme-sepia")) {
    currentTheme.value = "sepia";
  } else {
    currentTheme.value = "light";
  }
};

// 撤销/重做历史
const history = ref<string[]>([props.modelValue]);
const historyIndex = ref(0);
const maxHistorySize = 50;

// 计算属性
const charCount = computed(() => localContent.value.length);
const lineCount = computed(() => {
  if (!localContent.value) return 1;
  return localContent.value.split("\n").length;
});

const canUndo = computed(() => historyIndex.value > 0);
const canRedo = computed(() => historyIndex.value < history.value.length - 1);

// 监听外部变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== localContent.value) {
      localContent.value = newValue;
      // 重置历史记录
      history.value = [newValue];
      historyIndex.value = 0;
    }
  },
);

// 处理输入
const handleInput = () => {
  emit("update:modelValue", localContent.value);

  // 添加到历史记录
  if (historyIndex.value < history.value.length - 1) {
    // 如果在历史中间，删除后面的记录
    history.value = history.value.slice(0, historyIndex.value + 1);
  }
  history.value.push(localContent.value);
  historyIndex.value = history.value.length - 1;

  // 限制历史记录大小
  if (history.value.length > maxHistorySize) {
    history.value.shift();
    historyIndex.value--;
  }
};

// 同步滚动（纯文本编辑器不需要预览区，但保留接口）
const syncScroll = () => {
  // 预留：如果未来添加行号同步滚动功能
};

// 键盘事件处理
const handleKeydown = (e: KeyboardEvent) => {
  // Ctrl/Cmd + S: 保存
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    // 触发保存事件（如果需要）
  }

  // Tab: 插入缩进
  if (e.key === "Tab") {
    e.preventDefault();
    insertTab();
  }

  // Ctrl/Cmd + Z: 撤销
  if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
    e.preventDefault();
    handleUndo();
  }

  // Ctrl/Cmd + Shift + Z 或 Ctrl/Cmd + Y: 重做
  if (
    (e.ctrlKey || e.metaKey) &&
    (e.key === "y" || (e.key === "z" && e.shiftKey))
  ) {
    e.preventDefault();
    handleRedo();
  }
};

// 插入 Tab
const insertTab = () => {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = localContent.value.substring(0, start);
  const after = localContent.value.substring(end);

  localContent.value = before + "  " + after;
  emit("update:modelValue", localContent.value);

  nextTick(() => {
    textarea.focus();
    textarea.setSelectionRange(start + 2, start + 2);
  });
};

// 撤销
const handleUndo = () => {
  if (!canUndo.value) return;

  historyIndex.value--;
  localContent.value = history.value[historyIndex.value];
  emit("update:modelValue", localContent.value);

  nextTick(() => {
    textareaRef.value?.focus();
  });
};

// 重做
const handleRedo = () => {
  if (!canRedo.value) return;

  historyIndex.value++;
  localContent.value = history.value[historyIndex.value];
  emit("update:modelValue", localContent.value);

  nextTick(() => {
    textareaRef.value?.focus();
  });
};

// 初始化
onMounted(() => {
  nextTick(() => {
    textareaRef.value?.focus();
  });

  // 初始化主题
  updateTheme();

  // 监听主题变化事件
  window.addEventListener("theme-changed", updateTheme);
});

onUnmounted(() => {
  // 清理监听器
  window.removeEventListener("theme-changed", updateTheme);
});
</script>

<style scoped>
.plain-text-editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  background: var(--el-bg-color);
}

/* 暗色主题 - 使用 CSS 变量统一色调 */
.plain-text-editor-container.theme-dark {
  --editor-bg: var(--dt-editor-bg);
  --editor-text: var(--dt-editor-text);
  --toolbar-bg: var(--dt-editor-bg);
  --border-color: var(--dt-border);
  --line-num-bg: var(--dt-editor-line-num-bg);
  --line-num-color: var(--dt-editor-line-num);
  --statusbar-bg: var(--dt-bg-surface);
  --statusbar-color: var(--dt-text-muted);
}

.plain-text-editor-container.theme-dark .editor-toolbar {
  background: var(--toolbar-bg);
  border-color: var(--border-color);
}

.plain-text-editor-container.theme-dark .editor-toolbar button {
  background: var(--dt-btn-bg);
  color: var(--dt-btn-icon);
}

.plain-text-editor-container.theme-dark
  .editor-toolbar
  button:hover:not(:disabled) {
  background: var(--dt-btn-hover);
  color: var(--dt-accent);
}

.plain-text-editor-container.theme-dark .toolbar-separator {
  background: var(--border-color);
}

.plain-text-editor-container.theme-dark .editor-textarea {
  background: var(--editor-bg);
  color: var(--editor-text);
}

.plain-text-editor-container.theme-dark .line-numbers {
  background: var(--line-num-bg);
  color: var(--line-num-color);
  border-color: var(--border-color);
}

.plain-text-editor-container.theme-dark .editor-statusbar {
  background: var(--statusbar-bg);
  border-color: var(--border-color);
  color: var(--statusbar-color);
}

/* 护眼主题 - 使用 CSS 变量统一色调 */
.plain-text-editor-container.theme-sepia {
  --editor-bg: var(--dt-editor-bg);
  --editor-text: var(--dt-editor-text);
  --toolbar-bg: var(--dt-editor-bg);
  --border-color: var(--dt-border);
  --line-num-bg: var(--dt-editor-line-num-bg);
  --line-num-color: var(--dt-editor-line-num);
  --statusbar-bg: var(--dt-bg-surface);
  --statusbar-color: var(--dt-text-muted);
}

.plain-text-editor-container.theme-sepia .editor-toolbar {
  background: var(--toolbar-bg);
  border-color: var(--border-color);
}

.plain-text-editor-container.theme-sepia .editor-toolbar button {
  background: var(--dt-btn-bg);
  color: var(--dt-btn-icon);
}

.plain-text-editor-container.theme-sepia
  .editor-toolbar
  button:hover:not(:disabled) {
  background: var(--dt-btn-hover);
  color: var(--dt-accent);
}

.plain-text-editor-container.theme-sepia .toolbar-separator {
  background: var(--border-color);
}

.plain-text-editor-container.theme-sepia .editor-textarea {
  background: var(--editor-bg);
  color: var(--editor-text);
}

.plain-text-editor-container.theme-sepia .line-numbers {
  background: var(--line-num-bg);
  color: var(--line-num-color);
  border-color: var(--border-color);
}

.plain-text-editor-container.theme-sepia .editor-statusbar {
  background: var(--statusbar-bg);
  border-color: var(--border-color);
  color: var(--statusbar-color);
}

/* 浅色主题 - 使用 CSS 变量 */
.plain-text-editor-container.theme-light {
  --editor-bg: var(--dt-editor-bg);
  --editor-text: var(--dt-editor-text);
  --toolbar-bg: var(--dt-editor-bg);
  --border-color: var(--dt-border);
  --line-num-bg: var(--dt-editor-line-num-bg);
  --line-num-color: var(--dt-editor-line-num);
  --statusbar-bg: var(--dt-bg-surface);
  --statusbar-color: var(--dt-text-muted);
}

.plain-text-editor-container.theme-light .editor-toolbar {
  background: var(--toolbar-bg);
  border-color: var(--border-color);
}

.plain-text-editor-container.theme-light .editor-toolbar button {
  background: var(--dt-btn-bg);
  color: var(--dt-btn-icon);
}

.plain-text-editor-container.theme-light
  .editor-toolbar
  button:hover:not(:disabled) {
  background: var(--dt-btn-hover);
  color: var(--dt-accent);
}

.plain-text-editor-container.theme-light .toolbar-separator {
  background: var(--border-color);
}

.plain-text-editor-container.theme-light .editor-textarea {
  background: var(--editor-bg);
  color: var(--editor-text);
}

.plain-text-editor-container.theme-light .line-numbers {
  background: var(--line-num-bg);
  color: var(--line-num-color);
  border-color: var(--border-color);
}

.plain-text-editor-container.theme-light .editor-statusbar {
  background: var(--statusbar-bg);
  border-color: var(--border-color);
  color: var(--statusbar-color);
}

/* 工具栏 - 使用 design tokens，与编辑器区域色调一致 */
.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--dt-border);
  background: var(--dt-editor-bg);
  height: 40px;
}

.editor-toolbar button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 4px 8px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: var(--dt-btn-icon);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.editor-toolbar button:hover:not(:disabled) {
  background: var(--dt-btn-bg);
  border-color: var(--dt-border);
  color: var(--dt-accent);
}

.editor-toolbar button:active:not(:disabled) {
  background: var(--dt-btn-hover);
}

.editor-toolbar button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-separator {
  width: 1px;
  height: 20px;
  margin: 0 4px;
  background: var(--dt-border);
}

/* 编辑内容区 */
.editor-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 行号 */
.line-numbers {
  width: 50px;
  padding: 16px 8px;
  text-align: right;
  background: var(--el-fill-color-lighter);
  color: var(--el-text-color-secondary);
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 14px;
  line-height: 1.6;
  user-select: none;
  overflow: hidden;
  border-right: 1px solid var(--el-border-color);
}

/* 文本编辑区 */
.editor-textarea {
  flex: 1;
  padding: 16px;
  border: none;
  outline: none;
  resize: none;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color);
  white-space: pre-wrap;
  word-wrap: break-word;
}

.editor-textarea::placeholder {
  color: var(--el-text-color-placeholder);
}

/* 状态栏 */
.editor-statusbar {
  display: flex;
  gap: 16px;
  padding: 6px 12px;
  border-top: 1px solid var(--el-border-color);
  background: var(--el-fill-color-lighter);
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

/* 暗色主题适配 */
:deep(.dark) .plain-text-editor-container {
  border-color: var(--el-border-color-dark);
}

:deep(.dark) .editor-toolbar {
  border-color: var(--el-border-color-dark);
  background: var(--el-fill-color-dark);
}

:deep(.dark) .line-numbers {
  background: var(--el-fill-color-darker);
  border-color: var(--el-border-color-dark);
}

:deep(.dark) .editor-statusbar {
  border-color: var(--el-border-color-dark);
  background: var(--el-fill-color-darker);
}
</style>
