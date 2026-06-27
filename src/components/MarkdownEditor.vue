<template>
  <div class="markdown-editor-container" :class="themeClass">
    <!-- 工具栏 -->
    <div class="editor-toolbar">
      <button @click="insertFormat('bold')" :title="t('editor.toolbar.bold')">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
        </svg>
      </button>
      <button
        @click="insertFormat('italic')"
        :title="t('editor.toolbar.italic')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="19" x2="10" y1="4" y2="4" />
          <line x1="14" x2="5" y1="20" y2="20" />
          <line x1="15" x2="9" y1="4" y2="20" />
        </svg>
      </button>
      <button
        @click="insertFormat('strikethrough')"
        :title="t('editor.toolbar.strikethrough')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M16 4H9a3 3 0 0 0-2.83 4" />
          <path d="M14 12a4 4 0 0 1 0 8H6" />
          <line x1="4" x2="20" y1="12" y2="12" />
        </svg>
      </button>
      <div class="toolbar-separator" />
      <button @click="insertFormat('h1')" :title="t('editor.toolbar.h1')">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-heading1-icon lucide-heading-1"
        >
          <path d="M4 12h8" />
          <path d="M4 18V6" />
          <path d="M12 18V6" />
          <path d="m17 12 3-2v8" />
        </svg>
      </button>
      <button @click="insertFormat('h2')" :title="t('editor.toolbar.h2')">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-heading2-icon lucide-heading-2"
        >
          <path d="M4 12h8" />
          <path d="M4 18V6" />
          <path d="M12 18V6" />
          <path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1" />
        </svg>
      </button>
      <button @click="insertFormat('h3')" :title="t('editor.toolbar.h3')">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M4 12h8" />
          <path d="M4 18V6" />
          <path d="M12 18V6" />
          <path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2" />
          <path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2" />
        </svg>
      </button>
      <div class="toolbar-separator" />
      <button @click="insertFormat('ul')" :title="t('editor.toolbar.ul')">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="8" x2="21" y1="6" y2="6" />
          <line x1="8" x2="21" y1="12" y2="12" />
          <line x1="8" x2="21" y1="18" y2="18" />
          <line x1="3" x2="3.01" y1="6" y2="6" />
          <line x1="3" x2="3.01" y1="12" y2="12" />
          <line x1="3" x2="3.01" y1="18" y2="18" />
        </svg>
      </button>
      <button @click="insertFormat('ol')" :title="t('editor.toolbar.ol')">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="10" x2="21" y1="6" y2="6" />
          <line x1="10" x2="21" y1="12" y2="12" />
          <line x1="10" x2="21" y1="18" y2="18" />
          <path d="M4 6h1v4" />
          <path d="M4 10h2" />
          <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
        </svg>
      </button>
      <div class="toolbar-separator" />
      <button @click="insertFormat('link')" :title="t('editor.toolbar.link')">
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
          <path
            d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
          />
          <path
            d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
          />
        </svg>
      </button>
      <button @click="insertFormat('image')" :title="t('editor.toolbar.image')">
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
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      </button>
      <button @click="insertFormat('code')" :title="t('editor.toolbar.code')">
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
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </button>
    </div>

    <!-- 双栏布局 -->
    <div class="editor-content">
      <!-- 左侧编辑区 -->
      <div class="editor-pane">
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
          placeholder="开始编写 Markdown..."
        />
      </div>

      <!-- 右侧预览区 -->
      <div
        ref="previewRef"
        class="preview-pane markdown-body"
        v-html="renderedHtml"
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
import { Marked } from "marked";
import { useI18n } from "vue-i18n";
import { Link, Picture } from "@element-plus/icons-vue";

const { t } = useI18n();

// Props - 保持与 Editormd.vue 相同的 API
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
const previewRef = ref<HTMLElement | null>(null);

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

// Marked 实例配置
const markedInstance = new Marked({
  breaks: true, // 支持 GitHub 风格的换行
  gfm: true, // 启用 GitHub Flavored Markdown
});

// 渲染 HTML
const renderedHtml = computed(() => {
  return markedInstance.parse(localContent.value || "");
});

// 统计信息
const charCount = computed(() => localContent.value.length);
const lineCount = computed(() => {
  const lines = localContent.value.split("\n");
  return Math.max(lines.length, 1);
});

// 监听外部内容变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== localContent.value) {
      localContent.value = newValue;
    }
  },
);

// 处理输入事件
const handleInput = () => {
  emit("update:modelValue", localContent.value);
};

// 同步滚动
const syncScroll = () => {
  if (textareaRef.value && previewRef.value) {
    const ratio =
      textareaRef.value.scrollTop /
      (textareaRef.value.scrollHeight - textareaRef.value.clientHeight || 1);
    previewRef.value.scrollTop =
      ratio * (previewRef.value.scrollHeight - previewRef.value.clientHeight);
  }
};

// 插入 Markdown 格式
const insertFormat = (type: string) => {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = localContent.value.substring(start, end);
  const before = localContent.value.substring(0, start);
  const after = localContent.value.substring(end);

  let insert = "";
  let cursorOffset = 0;

  switch (type) {
    case "bold":
      insert = `**${selected || t("editor.placeholders.bold")}**`;
      cursorOffset = selected ? insert.length : 2;
      break;
    case "italic":
      insert = `*${selected || t("editor.placeholders.italic")}*`;
      cursorOffset = selected ? insert.length : 1;
      break;
    case "strikethrough":
      insert = `~~${selected || t("editor.placeholders.strikethrough")}~~`;
      cursorOffset = selected ? insert.length : 2;
      break;
    case "h1":
      insert = `\n# ${selected || t("editor.placeholders.h1")}`;
      cursorOffset = selected ? insert.length : 3;
      break;
    case "h2":
      insert = `\n## ${selected || t("editor.placeholders.h2")}`;
      cursorOffset = selected ? insert.length : 4;
      break;
    case "h3":
      insert = `\n### ${selected || t("editor.placeholders.h3")}`;
      cursorOffset = selected ? insert.length : 5;
      break;
    case "ul":
      insert = `\n- ${selected || t("editor.placeholders.listItem")}`;
      cursorOffset = selected ? insert.length : 3;
      break;
    case "ol":
      insert = `\n1. ${selected || t("editor.placeholders.listItem")}`;
      cursorOffset = selected ? insert.length : 4;
      break;
    case "link":
      insert = `[${selected || t("editor.placeholders.linkText")}](${t("editor.placeholders.url")})`;
      cursorOffset = selected ? insert.length : 1;
      break;
    case "image":
      insert = `![${selected || t("editor.placeholders.imageAlt")}](${t("editor.placeholders.url")})`;
      cursorOffset = selected ? insert.length : 1;
      break;
    case "code":
      insert = selected
        ? `\n\`\`\`\n${selected}\n\`\`\``
        : "\n```\n" + t("editor.placeholders.codeBlock") + "\n```";
      cursorOffset = selected ? insert.length : 4;
      break;
  }

  localContent.value = before + insert + after;
  emit("update:modelValue", localContent.value);

  // 恢复光标位置
  nextTick(() => {
    textarea.focus();
    const newPos = start + cursorOffset;
    textarea.setSelectionRange(newPos, newPos);
  });
};

// 快捷键处理
const handleKeydown = (e: KeyboardEvent) => {
  // Ctrl/Cmd + S 保存
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    // 触发保存事件（如果需要）
    return;
  }

  // Ctrl/Cmd + B 加粗
  if ((e.ctrlKey || e.metaKey) && e.key === "b") {
    e.preventDefault();
    insertFormat("bold");
    return;
  }

  // Ctrl/Cmd + I 斜体
  if ((e.ctrlKey || e.metaKey) && e.key === "i") {
    e.preventDefault();
    insertFormat("italic");
    return;
  }

  // Tab 键插入缩进
  if (e.key === "Tab") {
    e.preventDefault();
    const textarea = textareaRef.value;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      localContent.value =
        localContent.value.substring(0, start) +
        "  " +
        localContent.value.substring(end);

      nextTick(() => {
        textarea.setSelectionRange(start + 2, start + 2);
      });
    }
  }
};

// 生命周期
onMounted(() => {
  // 初始聚焦
  textareaRef.value?.focus();

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
.markdown-editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color);
}

/* 暗色主题 */
.markdown-editor-container.theme-dark {
  --editor-bg: var(--dt-editor-bg);
  --editor-text: var(--dt-editor-text);
  --toolbar-bg: var(--dt-editor-bg);
  --border-color: var(--dt-border);
  --line-num-bg: var(--dt-editor-line-num-bg);
  --line-num-color: var(--dt-editor-line-num);
  --statusbar-bg: var(--dt-bg-surface);
  --statusbar-color: var(--dt-text-muted);
}

.markdown-editor-container.theme-dark .editor-toolbar {
  background: var(--toolbar-bg);
  border-color: var(--border-color);
}

.markdown-editor-container.theme-dark .editor-toolbar button {
  /* background: var(--dt-btn-bg); */
  color: var(--dt-btn-icon);
}

.markdown-editor-container.theme-dark .editor-toolbar button:hover {
  background: var(--dt-btn-hover);
  color: var(--dt-accent);
}

.markdown-editor-container.theme-dark .toolbar-separator {
  background: var(--border-color);
}

.markdown-editor-container.theme-dark .editor-pane {
  background: var(--editor-bg);
  border-color: var(--border-color);
}

.markdown-editor-container.theme-dark .editor-textarea {
  background: var(--editor-bg);
  color: var(--editor-text);
}

.markdown-editor-container.theme-dark .line-numbers {
  background: var(--line-num-bg);
  color: var(--line-num-color);
  border-color: var(--border-color);
}

.markdown-editor-container.theme-dark .preview-pane {
  background: var(--editor-bg);
  color: var(--editor-text);
}

.markdown-editor-container.theme-dark .preview-pane :deep(code) {
  background: #0F172A;
  color: #E2E8F0;
}

.markdown-editor-container.theme-dark .preview-pane :deep(pre) {
  background: #0F172A;
  color: #E2E8F0;
}

.markdown-editor-container.theme-dark .preview-pane :deep(pre code) {
  background: transparent;
  color: inherit;
}

.markdown-editor-container.theme-dark .preview-pane :deep(blockquote) {
  border-left-color: var(--dt-accent);
  color: var(--dt-text-secondary);
}

.markdown-editor-container.theme-dark .preview-pane :deep(th),
.markdown-editor-container.theme-dark .preview-pane :deep(td) {
  border-color: var(--dt-border);
}

.markdown-editor-container.theme-dark .preview-pane :deep(th) {
  background: #0F172A;
}

.markdown-editor-container.theme-dark .preview-pane :deep(a) {
  color: var(--dt-accent);
}

.markdown-editor-container.theme-dark .editor-statusbar {
  background: var(--statusbar-bg);
  border-color: var(--border-color);
  color: var(--statusbar-color);
}

/* 护眼主题 - 使用 CSS 变量统一色调 */
.markdown-editor-container.theme-sepia {
  --editor-bg: var(--dt-editor-bg);
  --editor-text: var(--dt-editor-text);
  --toolbar-bg: var(--dt-editor-bg);
  --border-color: var(--dt-border);
  --line-num-bg: var(--dt-editor-line-num-bg);
  --line-num-color: var(--dt-editor-line-num);
  --statusbar-bg: var(--dt-bg-surface);
  --statusbar-color: var(--dt-text-muted);
}

.markdown-editor-container.theme-sepia .editor-toolbar {
  background: var(--toolbar-bg);
  border-color: var(--border-color);
}

.markdown-editor-container.theme-sepia .editor-toolbar button {
  /* background: var(--dt-btn-bg); */
  color: var(--dt-btn-icon);
}

.markdown-editor-container.theme-sepia .editor-toolbar button:hover {
  background: var(--dt-btn-hover);
  color: var(--dt-accent);
}

.markdown-editor-container.theme-sepia .toolbar-separator {
  background: var(--border-color);
}

.markdown-editor-container.theme-sepia .editor-pane {
  background: var(--editor-bg);
  border-color: var(--border-color);
}

.markdown-editor-container.theme-sepia .editor-textarea {
  background: var(--editor-bg);
  color: var(--editor-text);
}

.markdown-editor-container.theme-sepia .line-numbers {
  background: var(--line-num-bg);
  color: var(--line-num-color);
  border-color: var(--border-color);
}

.markdown-editor-container.theme-sepia .preview-pane {
  background: var(--editor-bg);
  color: var(--editor-text);
}

.markdown-editor-container.theme-sepia .preview-pane :deep(code) {
  background: #E8DFCC;
  color: var(--dt-editor-text);
}

.markdown-editor-container.theme-sepia .preview-pane :deep(pre) {
  background: #E8DFCC;
  color: var(--dt-editor-text);
}

.markdown-editor-container.theme-sepia .preview-pane :deep(pre code) {
  background: transparent;
  color: inherit;
}

.markdown-editor-container.theme-sepia .preview-pane :deep(blockquote) {
  border-left-color: var(--dt-accent);
  color: var(--dt-text-secondary);
}

.markdown-editor-container.theme-sepia .preview-pane :deep(th),
.markdown-editor-container.theme-sepia .preview-pane :deep(td) {
  border-color: var(--dt-border);
}

.markdown-editor-container.theme-sepia .preview-pane :deep(th) {
  background: #E8DFCC;
}

.markdown-editor-container.theme-sepia .preview-pane :deep(a) {
  color: var(--dt-accent);
}

.markdown-editor-container.theme-sepia .editor-statusbar {
  background: var(--statusbar-bg);
  border-color: var(--border-color);
  color: var(--statusbar-color);
}

/* 浅色主题 - 使用 CSS 变量 */
.markdown-editor-container.theme-light {
  --editor-bg: var(--dt-editor-bg);
  --editor-text: var(--dt-editor-text);
  --toolbar-bg: var(--dt-editor-bg);
  --border-color: var(--dt-border);
  --line-num-bg: var(--dt-editor-line-num-bg);
  --line-num-color: var(--dt-editor-line-num);
  --statusbar-bg: var(--dt-bg-surface);
  --statusbar-color: var(--dt-text-muted);
}

.markdown-editor-container.theme-light .preview-pane {
  background: var(--editor-bg);
  color: var(--editor-text);
}

.markdown-editor-container.theme-light .preview-pane :deep(code) {
  background: var(--dt-editor-line-num-bg);
  color: var(--dt-editor-text);
}

.markdown-editor-container.theme-light .preview-pane :deep(pre) {
  background: var(--dt-editor-line-num-bg);
  color: var(--dt-editor-text);
}

.markdown-editor-container.theme-light .preview-pane :deep(pre code) {
  background: transparent;
  color: inherit;
}

.markdown-editor-container.theme-light .preview-pane :deep(blockquote) {
  border-left-color: var(--dt-accent);
  color: var(--dt-text-secondary);
}

.markdown-editor-container.theme-light .preview-pane :deep(th),
.markdown-editor-container.theme-light .preview-pane :deep(td) {
  border-color: var(--dt-border);
}

.markdown-editor-container.theme-light .preview-pane :deep(th) {
  background: var(--dt-editor-line-num-bg);
}

.markdown-editor-container.theme-light .preview-pane :deep(a) {
  color: var(--dt-accent);
}

/* 工具栏样式 - 使用 design tokens，与编辑器区域色调一致 */
.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0px 12px;
  border-bottom: 1px solid var(--dt-border);
  background: var(--dt-editor-bg);
  flex-wrap: wrap;
  height: 40px;
}

.editor-toolbar button {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--dt-btn-icon);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.editor-toolbar button:hover {
  background: var(--dt-btn-bg);
  color: var(--dt-accent);
}

.toolbar-separator {
  width: 1px;
  height: 20px;
  background: var(--dt-border);
  margin: 0 6px;
}

/* 双栏布局 */
.editor-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.editor-pane {
  flex: 1;
  display: flex;
  border-right: 1px solid var(--el-border-color);
  overflow: hidden;
}

.line-numbers {
  padding: 16px 8px;
  text-align: right;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  user-select: none;
  overflow: hidden;
}

.editor-textarea {
  flex: 1;
  padding: 16px;
  border: none;
  outline: none;
  resize: none;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-primary);
  background: transparent;
  overflow-y: auto;
}

.preview-pane {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.8;
}

/* Markdown 预览样式 */
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
}

.markdown-body :deep(p) {
  margin-bottom: 16px;
}

.markdown-body :deep(code) {
  padding: 2px 6px;
  background: var(--el-fill-color-light);
  border-radius: 3px;
  font-family: monospace;
}

.markdown-body :deep(pre) {
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  overflow-x: auto;
}

.markdown-body :deep(blockquote) {
  padding-left: 16px;
  border-left: 4px solid var(--el-color-primary);
  color: var(--el-text-color-secondary);
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 24px;
  margin-bottom: 16px;
}

.markdown-body :deep(img) {
  max-width: 100%;
  border-radius: 4px;
}

.markdown-body :deep(a) {
  color: var(--el-color-primary);
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 16px;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid var(--el-border-color);
  padding: 8px 12px;
}

.markdown-body :deep(th) {
  background: var(--el-fill-color-light);
  font-weight: 600;
}

/* 状态栏 */
.editor-statusbar {
  display: flex;
  gap: 16px;
  padding: 6px 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  border-top: 1px solid var(--el-border-color);
  background: var(--el-fill-color-lighter);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .editor-content {
    flex-direction: column;
  }

  .editor-pane {
    border-right: none;
    border-bottom: 1px solid var(--el-border-color);
    height: 50%;
  }

  .preview-pane {
    height: 50%;
  }
}
</style>
