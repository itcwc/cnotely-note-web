<template>
    <div class="md-editor">
        <Editormd v-model:value="selectedFile.content" :height="height" :editLanguage="editLanguage"
            :editorTheme="editorTheme" :editorAreaTheme="editorAreaTheme" :previewAreaTheme="previewAreaTheme" />
    </div>

    <div class="menu">
        <el-select v-model="selectValue" placeholder="Select" class="export-select">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button class="export-btn" type="primary" @click="exportFile">导出</el-button>
    </div>
</template>

<script>
import { ref } from "vue";
import { saveAs } from "file-saver";
import Editormd from "./Editormd.vue";

export default {
    name: "Compile",
    components: {
        Editormd
    },
    setup() {
        const selectedFile = ref({ content: "# CNote" });
        const height = "100%";
        const editLanguage = ref(localStorage.getItem("selectedLanguage") || "en");
        const editorTheme = localStorage.getItem("editorTheme") ?? "default";
        const editorAreaTheme = localStorage.getItem("editorAreaTheme") ?? "default";
        const previewAreaTheme = localStorage.getItem("previewAreaTheme") ?? "default";



        const options = [
            {
                value: 'md',
                label: '导出 .md 格式',
            },
            {
                value: 'pdf',
                label: '导出 .pdf 格式',
            },
            {
                value: 'html',
                label: '导出 .html 格式',
            },
            {
                value: 'docx',
                label: '导出 .docx 格式',
            },
            {
                value: 'txt',
                label: '导出 .txt 格式',
            },
        ]
        const selectValue = ref(options[0].value)
        const exportFile = () => {

            // 获取导出格式的值，用于后续处理导出内容的格式
            const format = selectValue.value;

            const content = selectedFile.value.content;

            // console.log(format, content);

            switch (format) {
                case 'md':
                    exportMarkdown(content);
                    break;
                case 'pdf':
                    exportPdf(content);
                    break;
                case 'html':
                    exportHtml(content);
                    break;
                case 'docx':
                    exportDocx(content);
                    break;
                case 'txt':
                    exportTxt(content);
                    break;
                default:
                    console.error('Unsupported format');
            }
        };

        const exportMarkdown = (content) => {
            // 导出为 Markdown 格式的逻辑
            // console.log('Exporting as Markdown');
            const mdBlob = new Blob([content], {
                type: "text/markdown;charset=utf-8",
            });
            saveAs(mdBlob, "note.md");
        };


        const exportPdf = () => {
            // 导出为 PDF 格式的逻辑
            console.log('Exporting as PDF');
        };


        const exportHtml = (content) => {
            // 导出为 HTML 格式的逻辑
            console.log('Exporting as HTML');
            console.log(content);
        };



        const exportDocx = () => {
            // 导出为 DOCX 格式的逻辑
            console.log('Exporting as DOCX');
        };

        const exportTxt = () => {
            // 导出为 TXT 格式的逻辑
            console.log('Exporting as TXT');
        };


        return {
            selectedFile,
            height,
            editLanguage,
            editorTheme,
            editorAreaTheme,
            previewAreaTheme,
            selectValue,
            options,
            exportFile,
        };
    },
    // data() {
    //     return {
    //         selectedFile: { content: "# ccc" },
    //     }
    // }
}
</script>

<style scoped>
.md-editor {
    height: calc(100% - 30px);
    margin-top: 3px;
    position: relative;
    z-index: 1001;
}

.menu {
    height: 30px;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #fff;
    padding: 10px;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);
    z-index: 1000;
}

.export-select {
    width: 180px;
}

.export-btn {
    margin-left: 10px;
}
</style>