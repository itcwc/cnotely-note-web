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
        <el-button class="save-to-cloud" type="primary" @click="saveCloud">保存到云</el-button>
        <a href="https://www.markdown.cn/docs/cheat-sheet/">Markdown笔记使用指南</a>

        <a href="https://www.markdownguide.org/basic-syntax/">Markdown笔记使用指南-英文版</a>

        <div id="settings-container">
            <button id="settings-btn">
                <img src="/gear-icon.png" alt="Settings" id="settings-icon">
            </button>
        </div>
    </div>

    <div id="mdtohtml" style="display:none;"></div>
</template>

<script>
import { ref } from "vue";
import Editormd from "../components/Editormd.vue";
import { ElMessageBox } from 'element-plus'
import {
    exportMarkdown,
    exportTxt,
    exportPdf,
    exportHtml,
    exportDocx
} from "../../utils/export";

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
            { value: 'md', label: '导出 .md 格式' },
            { value: 'pdf', label: '导出 .pdf 格式' },
            { value: 'html', label: '导出 .html 格式' },
            { value: 'docx', label: '导出 .docx 格式' },
            { value: 'txt', label: '导出 .txt 格式' }
        ];
        const selectValue = ref(options[0].value)

        const exportFile = () => {

            // 获取导出格式的值，用于后续处理导出内容的格式
            const format = selectValue.value;

            switch (format) {
                case 'md':
                    exportMarkdown(selectedFile.value.content);
                    break;
                case 'pdf':
                    exportPdf(selectedFile.value.content);
                    break;
                case 'html':
                    // 和
                    // <a href="https://github.com/pandao/editor.md/blob/master/css/editormd.min.css" target="_blank">此处</a>
                    const message = `
                        <div>
                            请选择导出的 HTML 主题：
                            <br>
                            请注意这里引入了本站的远程css样式，如本站样式失效请移步
                            <a href="https://theme.typora.io/theme/Notion-Style/" target="_blank">此处</a>
                            下载
                        </div>
                    `;
                    ElMessageBox({
                        title: '选择导出模式',
                        message: message,
                        dangerouslyUseHTMLString: true,
                        showCancelButton: true,
                        confirmButtonText: '黑暗模式',
                        cancelButtonText: '白天模式',
                        confirmButtonClass: 'export-hmd-cbtn'
                    })
                        .then(() => {
                            exportHtml(selectedFile.value.content, 'dark')
                        })
                        .catch(() => {
                            exportHtml(selectedFile.value.content, 'light')
                        })
                    break;
                case 'docx':
                    exportDocx(selectedFile.value.content);
                    break;
                case 'txt':
                    exportTxt(selectedFile.value.content);
                    break;
                default:
                    console.error('Unsupported format');
            }
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
            exportFile
        };
    }
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

.menu a {
    margin-left: 10px;
}

#settings-container {
    position: absolute;
    top: 10px;
    right: 25px;
}


#settings-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
}

#settings-icon {
    width: 25px;
    height: 25px;
}
</style>