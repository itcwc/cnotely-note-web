<template>
  <div class="rich-text-editor-container" :class="themeClass">
    <Toolbar
      class="editor-toolbar"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      mode="default"
    />
    <Editor
      class="editor-content"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      mode="default"
      @onCreated="handleCreated"
      @onChange="handleChange"
    />
    <!-- 状态栏 -->
    <div class="editor-statusbar">
      <span>{{ t("editor.stats.chars") }}: {{ charCount }}</span>
      <span>{{ t("editor.stats.lines") }}: {{ lineCount }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onBeforeUnmount, computed, watch } from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import type { IDomEditor } from "@wangeditor/editor";
import { useTheme } from "../composables/useTheme";
import { useI18n } from "vue-i18n";

import "@wangeditor/editor/dist/css/style.css";

const props = defineProps<{
  modelValue: string;
  height?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "contentChange", value: string): void;
}>();

const { theme } = useTheme();
const { t, locale } = useI18n();

const editorRef = shallowRef<IDomEditor | undefined>(undefined);
const valueHtml = ref(props.modelValue);

const themeClass = computed(() => {
  if (theme.value === "dark") return "theme-dark";
  if (theme.value === "sepia") return "theme-sepia";
  return "theme-light";
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== valueHtml.value) {
      valueHtml.value = newVal;
    }
  },
);

const toolbarConfig = computed(() => ({
  excludeKeys: ["fullScreen", "group-video", "insertVideo", "uploadVideo"],
}));

const editorConfig = computed(() => ({
  placeholder: t("compile_view.rich_text_placeholder") || "开始输入...",
  readOnly: false,
  scroll: true,
}));

const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor;
};

const handleChange = (editor: IDomEditor) => {
  const html = editor.getHtml();
  valueHtml.value = html;
  emit("update:modelValue", html);
  emit("contentChange", html);
};

// 纯文本内容（去除 HTML 标签）
const plainText = computed(() => {
  const div = document.createElement("div");
  div.innerHTML = valueHtml.value;
  return div.textContent || div.innerText || "";
});

// 字数统计
const charCount = computed(() => plainText.value.length);

// 行数统计
const lineCount = computed(() => {
  const lines = plainText.value.split("\n");
  return Math.max(lines.length, 1);
});

onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});
</script>

<style scoped>
.rich-text-editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.editor-toolbar {
  border-bottom: 1px solid var(--dt-border);
  background: var(--dt-editor-bg);
  /* background: var(--dt-bg-surface); */
  flex-shrink: 0;
  z-index: 10;
  height: 40px;
  padding: 0 12px;
}

.editor-content {
  flex: 1;
  overflow-y: auto;
  background: var(--dt-editor-bg);
}

/* 状态栏 */
.editor-statusbar {
  display: flex;
  gap: 16px;
  padding: 6px 12px;
  font-size: 12px;
  color: var(--dt-text-muted);
  border-top: 1px solid var(--dt-border);
  /* background: var(--dt-bg-surface); */
  background: var(--el-fill-color-lighter);
  flex-shrink: 0;
}

:deep(.w-e-toolbar) {
  background: var(--dt-editor-bg) !important;
  /* background: var(--dt-bg-surface) !important; */
  border-bottom: none !important;
}

:deep(.w-e-bar) {
  border-bottom: none !important;
}

:deep(.w-e-text-container) {
  background: var(--dt-editor-bg) !important;
}

/* 编辑器主体文字 - 使用通配符 + 高优先级确保覆盖所有元素 */
:deep(.w-e-text-container [data-slate-editor]),
:deep(.w-e-text-container [data-slate-editor] *),
:deep(.w-e-text-area),
:deep(.w-e-text-area *) {
  color: var(--dt-text-primary) !important;
}

/* 占位符文字 - 次要颜色 */
:deep(.w-e-text-placeholder) {
  color: var(--dt-text-secondary) !important;
}

:deep(.w-e-text-area p) {
  margin: 0.5em 0;
  line-height: 1.7;
  color: var(--dt-text-primary) !important;
}

:deep(.w-e-text-area h1),
:deep(.w-e-text-area h2),
:deep(.w-e-text-area h3),
:deep(.w-e-text-area h4),
:deep(.w-e-text-area h5),
:deep(.w-e-text-area h6) {
  color: var(--dt-text-primary) !important;
  font-weight: 600;
  margin: 1em 0 0.5em;
}

:deep(.w-e-text-area blockquote) {
  border-left: 4px solid var(--dt-accent);
  padding-left: 16px;
  margin: 1em 0;
  color: var(--dt-text-secondary) !important;
  background: transparent;
}

:deep(.w-e-text-area blockquote p) {
  color: var(--dt-text-secondary) !important;
}

:deep(.w-e-text-area pre) {
  background: var(--dt-code-bg) !important;
  border-radius: 6px;
  padding: 16px;
  margin: 1em 0;
  overflow-x: auto;
}

:deep(.w-e-text-area code) {
  background: var(--dt-code-bg) !important;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  color: var(--dt-code-text) !important;
}

:deep(.w-e-text-area pre code) {
  padding: 0;
  background: transparent !important;
  color: var(--dt-code-text) !important;
}

:deep(.w-e-text-area ul),
:deep(.w-e-text-area ol) {
  padding-left: 24px;
  margin: 0.5em 0;
  color: var(--dt-text-primary) !important;
}

:deep(.w-e-text-area ul li),
:deep(.w-e-text-area ol li) {
  color: var(--dt-text-primary) !important;
}

:deep(.w-e-text-area a) {
  color: var(--dt-accent) !important;
  text-decoration: none;
}

:deep(.w-e-text-area a:hover) {
  text-decoration: underline;
}

:deep(.w-e-text-area table) {
  border-collapse: collapse;
  margin: 1em 0;
  width: 100%;
}

:deep(.w-e-text-area table th),
:deep(.w-e-text-area table td) {
  border: 1px solid var(--dt-border);
  padding: 8px 12px;
  text-align: left;
  color: var(--dt-text-primary) !important;
}

:deep(.w-e-text-area table th) {
  background: var(--dt-bg-surface);
  font-weight: 600;
}

:deep(.w-e-text-area hr) {
  border: none;
  border-top: 1px solid var(--dt-border);
  margin: 1.5em 0;
}

:deep(.w-e-text-area img) {
  max-width: 100%;
  border-radius: 6px;
}

/* 工具栏图标颜色适配 */
:deep(.w-e-toolbar .w-e-bar-item button) {
  color: var(--dt-text-secondary) !important;
}

:deep(.w-e-toolbar .w-e-bar-item button:hover) {
  color: var(--dt-text-primary) !important;
  background: var(--dt-bg-hover) !important;
}

:deep(.w-e-toolbar .w-e-bar-item button[title="bold"]) {
  font-weight: bold;
}

/* 下拉菜单样式适配 */
:deep(.w-e-drop-panel) {
  background: var(--dt-bg-surface) !important;
  border: 1px solid var(--dt-border) !important;
  color: var(--dt-text-primary) !important;
}

:deep(.w-e-drop-panel .w-e-drop-panel-item) {
  color: var(--dt-text-primary) !important;
}

:deep(.w-e-drop-panel .w-e-drop-panel-item:hover) {
  background: var(--dt-bg-hover) !important;
}

/* 编辑器内容区域内的 span 元素强制继承文字颜色 */
:deep(.w-e-text-area span) {
  color: inherit !important;
}
</style>
