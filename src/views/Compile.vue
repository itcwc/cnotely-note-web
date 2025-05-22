<template>
    <div class="md-editor">
        <Editormd v-model:value="selectedFile.content" :height="height" :editLanguage="editLanguage"
            :editorTheme="editorTheme" :editorAreaTheme="editorAreaTheme" :previewAreaTheme="previewAreaTheme" />
    </div>

    <el-card class="menu" shadow="hover" body-style="{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px' }">
        <el-select v-model="selectValue" placeholder="Select" class="export-select">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button class="export-btn" type="primary" @click="exportFile">导出</el-button>
        <el-button class="save-to-cloud" type="primary" @click="saveCloud">保存到云</el-button>
        <el-link href="https://www.markdown.cn/docs/cheat-sheet/" target="_blank" :underline="false">Markdown笔记使用指南</el-link>
        <el-link href="https://www.markdownguide.org/basic-syntax/" target="_blank" :underline="false">Markdown笔记使用指南-英文版</el-link>
        <el-link href="/settings" target="_blank" :underline="false" id="settings-link">
            <img src="/gear-icon.png" alt="Settings" id="settings-icon" style="vertical-align: middle;">
        </el-link>
    </el-card>

    <!-- <div class="menu">
        <el-select v-model="selectValue" placeholder="Select" class="export-select">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button class="export-btn" type="primary" @click="exportFile">导出</el-button>
        <el-button class="save-to-cloud" type="primary" @click="saveCloud">保存到云</el-button>
        <a href="https://www.markdown.cn/docs/cheat-sheet/">Markdown笔记使用指南</a>

        <a href="https://www.markdownguide.org/basic-syntax/">Markdown笔记使用指南-英文版</a>

        <div id="settings-container">
            <a id="settings-btn" href="/settings" target="_blank">
                <img src="/gear-icon.png" alt="Settings" id="settings-icon">
            </a>
        </div>
    </div> -->
    
    <div id="mdtohtml" style="display:none;"></div>
</template>

<script setup>
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

// const isDarkTheme = ref(localStorage.getItem('theme') === 'dark');
document.documentElement.classList.toggle('dark', localStorage.getItem('theme') === 'dark');

// 编辑器相关响应式变量
const selectedFile = ref({ content: "# CNote" });
const height = "100%";
const editLanguage = ref(localStorage.getItem("selectedLanguage") || "en");
const editorTheme = localStorage.getItem("editorTheme") ?? "default";
const editorAreaTheme = localStorage.getItem("editorAreaTheme") ?? "default";
const previewAreaTheme = localStorage.getItem("previewAreaTheme") ?? "default";

// 监听 localStorage 主题变化（可选，提升体验）
window.addEventListener("storage", (event) => {
    if (event.key === "isDarkTheme") {
        const dark = event.newValue === "true";
        editorTheme.value = dark ? "dark" : "default";
        editorAreaTheme.value = dark ? "pastel-on-dark" : "default";
        previewAreaTheme.value = dark ? "dark" : "default";
    }
});

// 导出选项
const options = [
    { value: 'md', label: '导出 .md 格式' },
    { value: 'pdf', label: '导出 .pdf 格式' },
    { value: 'html', label: '导出 .html 格式' },
    { value: 'docx', label: '导出 .docx 格式' },
    { value: 'txt', label: '导出 .txt 格式' }
];
const selectValue = ref(options[0].value);

// 导出文件方法
const exportFile = () => {
    const format = selectValue.value;
    switch (format) {
        case 'md':
            exportMarkdown(selectedFile.value.content);
            break;
        case 'pdf':
            exportPdf(selectedFile.value.content);
            break;
        case 'html':
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

// 保存到云方法（如有实现）
const saveCloud = () => {
    // 这里可根据实际需求实现保存到云的逻辑
};

</script>

<style scoped>
.md-editor {
    height: calc(100% - 30px);
    margin-top: 3px;
    position: relative;
    z-index: 1001;
}

/* .menu {
    height: 30px;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #fff;
    padding: 10px;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);
    z-index: 1000;
} */

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