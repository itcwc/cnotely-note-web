<template>
  <div id="editormd-page">
    <div id="editor-container"></div>
  </div>
</template>

<script>
import { onMounted, watch } from "vue";

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
      'update:value',
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

    onMounted(() => {
      let editor = null;

      try {
        editor = window.editormd("editor-container", {
          path: "/libs/editor.md/lib/",
          width: "99%",
          tex: true,
          flowChart: true,
          sequenceDiagram: true,
          height: props.height, // 修复重复定义问题
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
          imageUploadURL: props.imageUploadURL, // 动态配置
          katexURL: {
          },
          toolbarIcons: () => [
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
            "fullscreen",
          ],
        });

        // 监听内容变化并触发事件
        editor.on("change", () => {
          const markdownContent = editor.getMarkdown();
          // const htmlContent = editor.getHTML();
          emit('update:value', markdownContent); // 传递 markdown 内容
          // emit('update:html', htmlContent); // 传递 html 内容
          // console.log(htmlContent);
        });


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

      var editLanguage = props.editLanguage ?? 'en';
      loadLanguagePack(editLanguage);

      watch(
        () => [props.editLanguage, props.editorTheme, props.editorAreaTheme, props.previewAreaTheme],
        async ([editLanguage, newEditorTheme, newEditorAreaTheme, newPreviewAreaTheme]) => {
          if (!editor) return;

          try {
            editor.setTheme(newEditorTheme);
            editor.setEditorTheme(newEditorAreaTheme);
            editor.setPreviewTheme(newPreviewAreaTheme);

            const normalizedLang = editLanguage === "zh_CN" ? "zh-cn" : editLanguage;
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
</style>