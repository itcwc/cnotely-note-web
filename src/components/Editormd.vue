<template>
  <div id="editormd-page">
    <div id="editor-container"></div>
  </div>
</template>

<script>
// import $ from "jquery";
import "../../public/libs/editor.md/css/editormd.css";
// 恢复直接导入，确保脚本在组件初始化前加载完成
import "../../public/libs/editor.md/editormd.min.js";
import { onMounted, watch, ref, onBeforeUnmount, onUnmounted } from "vue";

// window.$ = window.jQuery = $;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

export default {
  name: "Editormd",
  props: {
    modelValue: { type: String, required: true },

    height: { type: String, default: "100%" },

    width: { type: [String, Number], default: "100%" },

    editLanguage: { type: String, default: "en" },

    editorTheme: { type: String, default: "default" },

    editorAreaTheme: { type: String, default: "default" },

    previewAreaTheme: { type: String, default: "default" },

    imageUploadURL: { type: String, default: "/upload/path" }, // 动态配置图片上传路径
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const editorRef = ref(null);
    const isEditorFullyInitialized = ref(false);
    const pendingValue = ref(props.modelValue);
    const isSelfChange = ref(false);
    let resizeObserver = null;

    // 1. 核心监听器优化：增加更强的防御
    watch(
      () => props.modelValue,
      (newValue) => {
        if (isSelfChange.value) {
          isSelfChange.value = false;
          return;
        }

        const editor = editorRef.value;
        // 必须确保 editor.cm (CodeMirror 实例) 存在，否则 length 报错就出在这里
        const isReady = editor && isEditorFullyInitialized.value && editor.cm;

        if (isReady) {
          const currentContent = editor.getMarkdown();
          if (newValue === currentContent) return;

          // 使用 CodeMirror 提供的安全操作
          editor.cm.operation(() => {
            const cursor = editor.cm.getCursor(); // 记住光标位置
            editor.cm.setValue(newValue || ""); // 保证 newValue 不为 undefined
            editor.cm.setCursor(cursor); // 恢复光标，防止跳动
          });
        } else {
          pendingValue.value = newValue;
        }
      },
    );

    onMounted(async () => {
      // 内部工具栏配置

      const fullToolbarIcons = () => [
        "bold",

        "italic",

        "pagebreak",

        "|",

        "h1",

        "h2",

        "h3",

        "|",

        "hr",

        "quote",

        "list-ul",

        "list-ol",

        "|",

        "link",

        "image",

        "code",

        "preformatted-text",

        "code-block",

        "table",

        "datetime",

        "|",

        "preview",

        "watch",
      ];

      const mobileToolbarIcons = () => [
        "bold",

        "italic",

        "hr",

        "del",

        "quote",

        "h1",

        "h2",

        "watch",
      ];

      const isMobile = window.innerWidth <= 768;

      const toolbarIconsFunc = isMobile ? mobileToolbarIcons : fullToolbarIcons;

      const getWidthWithUnit = (width) =>
        typeof width === "number" ? `${width}px` : width;

      try {
        // 将实例挂载到 editorRef.value
        editorRef.value = window.editormd("editor-container", {
          path: "/libs/editor.md/lib/",
          width: getWidthWithUnit(props.width),
          height: props.height,
          markdown: props.modelValue || "", // 初始内容防御
          tex: true,
          flowChart: true,
          sequenceDiagram: true,
          theme: props.editorTheme,
          previewTheme: props.previewAreaTheme,
          editorTheme: props.editorAreaTheme,
          codeFold: true,
          syncScrolling: "single",
          saveHTMLToTextarea: true,
          imageUpload: true,
          imageUploadURL: props.imageUploadURL,
          watch: !isMobile,
          preview: !isMobile,
          lineNumbers: !isMobile,
          toolbarIcons: toolbarIconsFunc,

          onload: function () {
            isEditorFullyInitialized.value = true;

            // 处理挂起的内容
            if (
              pendingValue.value !== undefined &&
              pendingValue.value !== props.modelValue
            ) {
              this.setMarkdown(pendingValue.value);
            }

            this.on("change", () => {
              const markdownContent = this.getMarkdown();
              if (markdownContent !== props.modelValue) {
                isSelfChange.value = true;
                emit("update:modelValue", markdownContent);
              }
            });

            const container = document.getElementById("editor-container");
            if (container) {
              resizeObserver = new ResizeObserver(() => {
                window.requestAnimationFrame(() => {
                  if (
                    isEditorFullyInitialized.value &&
                    editorRef.value?.resize
                  ) {
                    editorRef.value.resize();
                  }
                });
              });
              resizeObserver.observe(container);
            }
          },
        });
      } catch (error) {
        console.error("Editor initialization failed:", error);
      }
    });

    /**
     * 关键修复：合并清理逻辑，确保不报错
     */
    onBeforeUnmount(() => {
      // 1. 断开尺寸监听
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }

      // 2. 销毁编辑器实例
      if (editorRef.value) {
        try {
          // 停止初始化标记
          isEditorFullyInitialized.value = false;

          // 如果 Editor.md 的 remove 方法存在
          if (
            editorRef.value.editor &&
            typeof editorRef.value.editor.remove === "function"
          ) {
            editorRef.value.editor.remove();
          } else if (typeof editorRef.value.clear === "function") {
            editorRef.value.clear();
          }

          editorRef.value = null;
        } catch (e) {
          console.warn("Editor.md remove error:", e);
        }
      }

      // 3. 彻底清空 DOM，防止 CodeMirror 残留事件在同名切换时报错
      const container = document.getElementById("editor-container");
      if (container) {
        container.innerHTML = "";
      }
    });

    // 删除原本错误的 onUnmounted，因为逻辑已合并到 onBeforeUnmount

    return {
      editorRef,
      isEditorFullyInitialized,
    };
  },
};
</script>

<style scoped>
#editormd-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  margin: 0px 0 0 0;
}

#editor-container {
  margin: 0 0 1px 0;
}

@media (max-width: 768px) {
  .file-name-header {
    font-size: 16px;
    /* header 字体缩小 */
  }

  .menu-toolbar {
    flex-wrap: wrap;
    gap: 5px;
  }

  .export-btn,
  .save-to-cloud {
    padding: 4px 8px;
    font-size: 12px;
  }

  .custom-input {
    width: 70%;
    font-size: 16px;
  }

  #editor-container {
    height: calc(100% - 100px);
    /* 根据 header/footer 调整 */
  }
}
</style>
