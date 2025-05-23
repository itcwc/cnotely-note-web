<template>

    <CommonLayout>
        <template #header>
            <div>📘 顶部导航</div>
        </template>

        <template #sidebar>
            <el-menu default-active="1">
                <el-menu-item index="1">首页</el-menu-item>
                <el-menu-item index="2">设置</el-menu-item>
            </el-menu>
        </template>

        <template #main>
            <div class="md-editor">
                <Editormd v-model:value="selectedFile.content" :height="height" :editLanguage="editLanguage"
                    :editorTheme="editorTheme" :editorAreaTheme="editorAreaTheme"
                    :previewAreaTheme="previewAreaTheme" />
            </div>
        </template>

        <template #footer>
            <el-card class="menu" shadow="always">
                <div class="menu-toolbar">
                    <el-select v-model="selectValue" :placeholder="t('compile_view.select')" class="export-select">
                        <el-option v-for="item in options" :key="item.value" :label="t(item.label)"
                            :value="item.value" />
                    </el-select>
                    <el-button class="export-btn" type="primary" @click="exportFile">{{ t('compile_view.export')
                        }}</el-button>
                    <el-button class="save-to-cloud" type="primary" @click="saveCloud">{{
                        t('compile_view.save_to_cloud')
                        }}</el-button>
                    <el-link v-if="locale === 'zh-CN'" href="https://www.markdown.cn/docs/cheat-sheet/" target="_blank"
                        :underline="false">
                        {{ t('compile_view.markdown_guide_cn') }}
                    </el-link>
                    <el-link v-else href="https://www.markdownguide.org/basic-syntax/" target="_blank"
                        :underline="false">
                        {{ t('compile_view.markdown_guide_en') }}
                    </el-link>

                    <div class="settings-link">
                        <el-link href="/settings" target="_blank" :underline="false" id="settings-link">
                            <Setting style="vertical-align: middle; width: 20px; height: 20px;" />
                        </el-link>
                    </div>
                </div>
            </el-card>
        </template>

    </CommonLayout>

    <div id="mdtohtml" style="display:none;"></div>


</template>

<script setup>
import CommonLayout from "@/components/CommonLayout.vue";
import { ref, watch } from "vue";
import Editormd from "../components/Editormd.vue";
import { ElMessageBox } from 'element-plus'
import {
    exportMarkdown,
    exportTxt,
    exportPdf,
    exportHtml,
    exportDocx
} from "../../utils/export";
import { Setting } from '@element-plus/icons-vue';
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();
const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
locale.value = savedLanguage;
document.documentElement.classList.toggle('dark', localStorage.getItem('theme') === 'dark');

// 编辑器相关响应式变量
const selectedFile = ref({ content: "" });
const height = "100%";
const editLanguage = ref(savedLanguage || "en");
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
    { value: 'md', label: 'compile_view.export_md' },
    { value: 'pdf', label: 'compile_view.export_pdf' },
    { value: 'html', label: 'compile_view.export_html' },
    { value: 'docx', label: 'compile_view.export_docx' },
    { value: 'txt', label: 'compile_view.export_txt' }
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
            ElMessageBox({
                title: t('compile_view.export_html_title'),
                message: t('compile_view.export_html_message'),
                dangerouslyUseHTMLString: true,
                showCancelButton: true,
                confirmButtonText: t('compile_view.dark_mode'),
                cancelButtonText: t('compile_view.light_mode'),
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
    ElMessage({
        message: t('settings_view.save_not_online'),
        type: 'warning',
        duration: 2000
    });
};

</script>

<style scoped>
.md-editor {
    height: calc(100% - 30px);
    margin-top: 3px;
    position: relative;
    z-index: 1001;
}

.menu {
    /* height: 30px;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #fff;
    padding: 10px;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);
    z-index: 1000; */
    /* display: 'flex'; */
    /* alignItems: 'center'; */
    /* gap: '10px'; */
    /* padding: '10px'; */
    height: 50px;
}

.menu>>>.el-card__body {
    padding: 10px;
}

.menu-toolbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: space-between;
}

.settings-link {
    display: flex;
    align-items: center;
    margin-left: auto;
    /* 推到最右边 */
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