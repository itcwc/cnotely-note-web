<template>
    <div class="md-editor">
        <Editormd :value="selectedFile.content" :height="height" :editLanguage="editLanguage" :editorTheme="editorTheme"
            :editorAreaTheme="editorAreaTheme" :previewAreaTheme="previewAreaTheme" />
    </div>
</template>

<script>
import { ref } from "vue";
import Editormd from "./Editormd.vue";

export default {
    name: "Compile",
    components: {
        Editormd
    },
    setup() {
        const selectedFile = ref({ content: "初始内容" });
        const height = "100%";
        const editLanguage = ref(localStorage.getItem("selectedLanguage") || "en");
        const editorTheme = localStorage.getItem("editorTheme") ?? "default";
        const editorAreaTheme = localStorage.getItem("editorAreaTheme") ?? "default";
        const previewAreaTheme = localStorage.getItem("previewAreaTheme") ?? "default";

        return {
            selectedFile,
            height,
            editLanguage,
            editorTheme,
            editorAreaTheme,
            previewAreaTheme,
        };
    },
    data() {
        return {
            selectedFile: { content: "# ccc" },
        }
    }
}
</script>

<style scoped>
.md-editor {
    height: 100%;
}
</style>