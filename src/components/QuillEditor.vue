<template>
  <div class="quill-editor-container">
    <div ref="editorRef" class="quill-editor"></div>
  </div>
</template>

<script setup lang="ts">
// import { ref, onMounted, watch, defineProps, defineEmits } from "vue";
import { ref, onMounted, watch } from "vue";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const props = defineProps<{
  modelValue: string;
  height: string;
  width?: string | number;
  editLanguage?: string;
  editorTheme?: string;
  editorAreaTheme?: string;
  previewAreaTheme?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const editorRef = ref<HTMLElement | null>(null);
let quillInstance: Quill | null = null;

onMounted(() => {
  if (!editorRef.value) return;

  // 初始化 Quill 编辑器
  quillInstance = new Quill(editorRef.value, {
    theme: "snow",
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        // ["link", "image", "code-block"],
        ["link", "code-block"],
        ["clean"],
      ],
    },
    placeholder: "开始编辑...",
  });

  // 设置初始内容 - 使用 Quill 提供的 API
  if (props.modelValue) {
    quillInstance.clipboard.dangerouslyPasteHTML(props.modelValue);
  }

  // 监听内容变化
  quillInstance.on("text-change", () => {
    emit("update:modelValue", quillInstance?.root.innerHTML || "");
  });
});

// 监听外部内容变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (quillInstance && newValue !== quillInstance.root.innerHTML) {
      // 使用 Quill 提供的 API 设置内容，确保编辑器状态正确
      quillInstance.clipboard.dangerouslyPasteHTML(newValue);
    }
  },
  { immediate: true }, // 立即执行，确保初始内容能正确加载
);
</script>

<style scoped>
.quill-editor-container {
  width: 100%;
  height: 100%;
  /* border: 1px solid #e4e7ed; */
  border-radius: 4px;
  overflow: hidden;
}

.quill-editor {
  height: 100%;
  width: 100%;
}

/* 确保 Quill 编辑器的高度正确设置 */
:deep(.ql-container) {
  height: calc(100% - 42px); /* 减去工具栏高度 */
}

/* 让工具栏居中显示 */
:deep(.ql-toolbar) {
  /* display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  padding: 8px; */
  border: 1px solid var(--el-border-color);
  border-left: none;
  border-right: none;
}

:deep(.ql-container) {
  border: 0px solid var(--el-border-color);
}

/* 调整工具栏按钮组间距 */
:deep(.ql-toolbar .ql-formats) {
  margin-right: 10px;
  margin-bottom: 4px;
}
</style>
