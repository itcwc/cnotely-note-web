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
  },

  setup(props) {

    function themeSelect(id, themes, lsKey, callback) {
      var select = $("#" + id);
      for (var i = 0, len = themes.length; i < len; i++) {
        var theme = themes[i];
        var selected = localStorage[lsKey] == theme ? ' selected="selected"' : "";
        select.append(
          '<option value="' + theme + '"' + selected + ">" + theme + "</option>"
        );
      }
      select.bind("change", function () {
        var theme = $(this).val();
        if (theme === "") {
          alert('theme == ""');
          return false;
        }
        callback(select, theme);
      });
      return select;
    }

    onMounted(() => {
      // 初始化 Editor.md
      const editor = editormd("editor-container", {
        path: "/libs/editor.md/lib/",
        width: "99%",
        height: "100%",
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
        imageUploadURL: "/upload/path", // 替换成你的图片上传接口
        // lang: currentLang, // 初始化语言
        toolbarIcons: function () {
          return [
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
            "fullscreen"
          ];
        },
      });

      // 编辑器语言选项
      var editLanguage = props.editLanguage;
      var path = "/libs/editor.md/languages/";
      if (editLanguage == "zh_CN") {
        editLanguage = "zh-cn";
      }
      editormd.loadScript(path + editLanguage, function () {
        editor.lang = editormd.defaults.lang;
      });



      // 监听主题变化，动态更新配置
      watch(
        () => [props.editLanguage, props.editorTheme, props.editorAreaTheme, props.previewAreaTheme],
        ([editLanguage, newEditorTheme, newEditorAreaTheme, newPreviewAreaTheme]) => {
          if (editor) {
            // 更新主题
            editor.setTheme(newEditorTheme);
            editor.setEditorTheme(newEditorAreaTheme);
            editor.setPreviewTheme(newPreviewAreaTheme);

            // 动态加载语言包并更新语言
            const langPath = "/libs/editor.md/languages/"; // 根据实际路径调整
            editormd.loadScript(`${langPath}${editLanguage}.js`, () => {
              if (editormd.defaults.lang) {
                editor.lang = editormd.defaults.lang;
                editor.recreate(); // 重建编辑器以更新语言
                console.log(`语言切换为：${editLanguage}`);
              } else {
                console.error(`语言包加载失败：${editLanguage}`);
              }
            });
          }
        }
      );

      themeSelect(
        "editormd-theme-select",
        editormd.themes,
        "theme",
        function ($this, theme) {
          editor.setTheme(theme);
        }
      );

      themeSelect(
        "editor-area-theme-select",
        editormd.editorThemes,
        "editorTheme",
        function ($this, theme) {
          editor.setCodeMirrorTheme(theme);
        }
      );

      themeSelect(
        "preview-area-theme-select",
        editormd.previewThemes,
        "previewTheme",
        function ($this, theme) {
          editor.setPreviewTheme(theme);
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
