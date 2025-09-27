<template>
  <div id="editormd-page">
    <div id="editor-container"></div>
  </div>
</template>

<script>
// import $ from "jquery";
import "../../public/libs/editor.md/css/editormd.css";
import "../../public/libs/editor.md/editormd.min.js";
import { onMounted, watch } from "vue";

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
    value: { type: String, required: true },
    height: { type: String, default: "100%" },
    editLanguage: { type: String, default: "en" },
    editorTheme: { type: String, default: "default" },
    editorAreaTheme: { type: String, default: "default" },
    previewAreaTheme: { type: String, default: "default" },
    imageUploadURL: { type: String, default: "/upload/path" }, // 动态配置图片上传路径
  },

  emits: [
    "update:value",
    // 'update:html'
  ],
  setup(props, { emit }) {
    function themeSelect(id, themes, lsKey, callback) {
      const select = document.getElementById(id);
      if (!select) return;

      const savedTheme = localStorage.getItem(lsKey) || "";
      for (const theme of themes) {
        const option = document.createElement("option");
        option.value = theme;
        option.textContent = theme;
        if (theme === savedTheme) {
          option.selected = true;
        }
        select.appendChild(option);
      }

      select.addEventListener("change", (event) => {
        const theme = event.target.value;
        if (!theme) {
          alert("Invalid theme selected.");
          return false;
        }
        callback(select, theme);
      });

      return select;
    }

    onMounted(async () => {
      let editor = null;

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

      try {
        await loadScript("/libs/editor.md/editormd.min.js");
        editor = window.editormd("editor-container", {
          path: "/libs/editor.md/lib/",
          width: "99%",
          tex: true,
          flowChart: true,
          sequenceDiagram: true,
          height: props.height,
          theme: props.editorTheme,
          previewTheme: props.previewAreaTheme,
          editorTheme: props.editorAreaTheme,
          markdown: props.value,
          codeFold: true,
          syncScrolling: "single",
          toolbar: true,
          saveHTMLToTextarea: true,
          imageUpload: true,
          imageFormats: ["jpg", "jpeg", "gif", "png", "bmp", "webp"],
          imageUploadURL: props.imageUploadURL,
          katexURL: {},
          watch: !isMobile,
          preview: !isMobile,
          lineNumbers: !isMobile,
          toolbarIcons: toolbarIconsFunc
          // toolbarIcons: () => [
          //   "bold",
          //   "italic",
          //   "pagebreak",
          //   "|",
          //   "h1",
          //   "h2",
          //   "h3",
          //   "|",
          //   "hr",
          //   "quote",
          //   "list-ul",
          //   "list-ol",
          //   "|",
          //   "link",
          //   "image",
          //   "code",
          //   "preformatted-text",
          //   "code-block",
          //   "table",
          //   "datetime",
          //   "|",
          //   "preview",
          //   "watch",
          // ],
        });

        // 监听内容变化并触发事件
        editor.on("change", () => {
          const markdownContent = editor.getMarkdown();
          emit("update:value", markdownContent);
        });

        // 添加对 value 属性的监听
        watch(
          () => props.value,
          (newValue) => {
            if (editor && editor.getMarkdown() !== newValue) {
              editor.setMarkdown(newValue);
            }
          }
        );
      } catch (error) {
        console.error("Editor initialization failed:", error);
      }

      const loadLanguagePack = (language) => {
        const langPath = `/libs/editor.md/languages/${language}`;
        return new Promise((resolve, reject) => {
          window.editormd.loadScript(langPath, () => {
            if (window.editormd.defaults.lang) {
              resolve();
            } else {
              reject(new Error(`Failed to load language pack: ${language}`));
            }
          });
        });
      };

      var editLanguage = props.editLanguage ?? "en";
      loadLanguagePack(editLanguage);

      watch(
        () => [
          props.editLanguage,
          props.editorTheme,
          props.editorAreaTheme,
          props.previewAreaTheme,
        ],
        async ([
          editLanguage,
          newEditorTheme,
          newEditorAreaTheme,
          newPreviewAreaTheme,
        ]) => {
          if (!editor) return;

          try {
            editor.setTheme(newEditorTheme);
            editor.setEditorTheme(newEditorAreaTheme);
            editor.setPreviewTheme(newPreviewAreaTheme);

            const normalizedLang =
              editLanguage === "zh_CN" ? "zh-cn" : editLanguage;
            await loadLanguagePack(normalizedLang);
            editor.lang = window.editormd.defaults.lang;
            editor.recreate();
            console.log(`Language switched to: ${editLanguage}`);
          } catch (error) {
            console.error("Failed to update editor configuration:", error);
          }
        }
      );

      themeSelect(
        "editormd-theme-select",
        window.editormd.themes,
        "theme",
        (select, theme) => {
          if (editor) editor.setTheme(theme);
        }
      );

      themeSelect(
        "editor-area-theme-select",
        window.editormd.editorThemes,
        "editorTheme",
        (select, theme) => {
          if (editor) editor.setCodeMirrorTheme(theme);
        }
      );

      themeSelect(
        "preview-area-theme-select",
        window.editormd.previewThemes,
        "previewTheme",
        (select, theme) => {
          if (editor) editor.setPreviewTheme(theme);
        }
      );
    });
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
  width: 100%;
  margin: 0 0 5px 0;
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
