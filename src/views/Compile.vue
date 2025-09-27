<template>
    <CommonLayout>
        <template #header>
            <el-icon class="notebook-icon">
                <Notebook />
            </el-icon>
            <EditableText v-model="fileName" :placeholder="t('compile_view.file_name_placeholder')" />
        </template>

        <template #sidebar>
            <div style="font-size: 13px; color: #333">

                <p>{{ t('compile_view.under_development') }}</p>

                <p>
                    {{ t('compile_view.browser_extensions') }}<br>
                    <a href="https://chromewebstore.google.com/detail/cnotely-%E2%80%93-save-web-content/adckfinclpmhjnijmeeejkdhocikacgd" target="_blank">{{ t('compile_view.chrome_extension') }}</a><br>
                    <a href="https://microsoftedge.microsoft.com/addons/detail/bdcofhehaohhfckpelmkkpmigoemecpp" target="_blank">{{ t('compile_view.edge_extension') }}</a><br>
                    <a href="https://addons.mozilla.org/en-US/firefox/addon/cnotely/" target="_blank">{{ t('compile_view.firefox_extension') }}</a>
                </p>

                <p>
                    {{ $t("compile_view.contact_me")
                    }}<a href="mailto:support@cnotelyly.com"> support@cnotelyly.com </a>
                </p>
            </div>
        </template>

        <template #main>
            <div class="md-editor">
                <Editormd v-model:value="selectedFile.content" :height="height" :editLanguage="editLanguage"
                    :editorTheme="editorTheme" :editorAreaTheme="editorAreaTheme"
                    :previewAreaTheme="previewAreaTheme" />
            </div>
        </template>

        <template #footer>
            <!-- <el-card class="menu" shadow="always"> -->
            <div class="menu-toolbar">
                <el-tooltip :content="t('compile_view.select')" placement="top">
                    <el-select v-model="selectValue" :placeholder="t('compile_view.select')" class="export-select">
                        <el-option v-for="item in options" :key="item.value" :label="getOptionLabel(item)"
                            :value="item.value" />
                    </el-select>
                </el-tooltip>

                <el-tooltip :content="t('compile_view.export')" placement="top">
                    <el-button class="export-btn" type="primary" @click="exportFile">
                        <span class="btn-text">{{ t("compile_view.export") }}</span>
                        <el-icon class="btn-icon">
                            <Download />
                        </el-icon>
                    </el-button>
                </el-tooltip>

                <el-tooltip :content="t('compile_view.save_to_cloud')" placement="top">
                    <el-button class="save-to-cloud" type="primary" @click="saveCloud">
                        <span class="btn-text">{{ t("compile_view.save_to_cloud") }}</span>
                        <el-icon class="btn-icon">
                            <UploadFilled />
                        </el-icon>
                    </el-button>
                </el-tooltip>

                <el-tooltip :content="locale === 'zh-CN'
                    ? t('compile_view.markdown_guide_cn')
                    : t('compile_view.markdown_guide_en')
                    " placement="top">
                    <el-link v-if="locale === 'zh-CN'" href="https://www.markdown.cn/docs/cheat-sheet/" target="_blank"
                        :underline="false">
                        <span class="markdown-guide-text">{{
                            t("compile_view.markdown_guide_cn")
                            }}</span>
                        <!-- <QuestionFilled class="markdown-guide-icon" /> -->
                        <el-icon class="markdown-guide-icon">
                            <QuestionFilled />
                        </el-icon>
                    </el-link>

                    <el-link v-else href="https://www.markdownguide.org/basic-syntax/" target="_blank"
                        :underline="false">
                        <span class="markdown-guide-text">{{
                            t("compile_view.markdown_guide_en")
                            }}</span>
                        <!-- <QuestionFilled class="markdown-guide-icon" /> -->
                        <el-icon class="markdown-guide-icon">
                            <QuestionFilled />
                        </el-icon>
                    </el-link>
                </el-tooltip>
            </div>

            <div class="settings-link">
                <el-button @click="handleSettings" :underline="false" id="settings-link" circle>
                    <Setting style="vertical-align: middle; width: 20px; height: 20px" />
                </el-button>
            </div>

            <!-- </el-card> -->
        </template>
    </CommonLayout>

    <div id="mdtohtml" style="display: none"></div>
</template>


<script setup>
import CommonLayout from "@/components/CommonLayout.vue";
import { ref, watch } from "vue";
import EditableText from "../components/EditableText.vue";
import Editormd from "../components/Editormd.vue";
import { ElMessageBox } from 'element-plus'
import {
    exportMarkdown,
    exportTxt,
    exportPdf,
    exportHtml,
    exportDocx
} from "../../utils/export";
import {
    Setting,
    QuestionFilled,
    Download,
    UploadFilled,
    Notebook,
} from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();
const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
locale.value = savedLanguage;
console.log('savedLanguage', savedLanguage);


document.documentElement.classList.toggle('dark', localStorage.getItem('theme') === 'dark');

// 移动端判断
const isMobile = () => window.innerWidth <= 768;
const getOptionLabel = (item) => isMobile() ? "." + item.value : t(item.label);

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

const isEditing = ref(false);
const fileName = ref(t("compile_view.new_note")); // 默认文件名为 "note"
// 导出文件方法
const exportFile = () => {
    const format = selectValue.value;
    const content = selectedFile.value.content;
    if (!content.trim()) {
        ElMessage({
            message: t('compile_view.empty_input_message'),
            type: 'error',
            duration: 2000
        });
        return;
    }
    const name = fileName.value || t("compile_view.new_note"); // 使用输入的文件名或默认值
    switch (format) {
        case 'md':
            exportMarkdown(content, name);
            break;
        case 'pdf':
            exportPdf(content, name);
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
                    exportHtml(content, 'dark', name)
                })
                .catch(() => {
                    exportHtml(content, 'light', name)
                })
            break;
        case 'docx':
            exportDocx(content, name);
            break;
        case 'txt':
            exportTxt(content, name);
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


// ----------------------
// 打开设置
// ----------------------
const handleSettings = () => {
    window.open('/settings', '_blank');
};

</script>

<style scoped>
.md-editor {
    height: 99%;
    margin-top: 3px;
    position: relative;
    z-index: 1001;
}

.menu {
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
    margin-right: auto;
}

.settings-link {
    display: flex;
    align-items: center;
    margin-left: auto;
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

.file-name-header {
    display: flex;
    align-items: center;
    font-size: 22px;
    /* font-weight: bold; */
    color: #303133;
    max-width: 100%;
    overflow: hidden;
}

.notebook-icon {
    color: #409eff;
    font-size: 22px;
    flex-shrink: 0;
    /* 避免图标被压缩 */
    margin-right: 8px;
}

/* 默认只显示文字，不显示图标 */
.markdown-guide-icon {
    display: none;
    font-size: 20px;
    margin: 0 0 0 10px;
    vertical-align: middle;
}

.btn-icon {
    display: none;
    font-size: 16px;
    vertical-align: middle;
}

/* 移动端（<=768px）隐藏文字，显示图标 */
@media (max-width: 768px) {
    .menu-toolbar {
        gap: 6px;
        flex-wrap: wrap;
        justify-content: flex-start;
        transform: scale(0.9);
        transform-origin: left center;
    }

    .export-select {
        width: 100px;
        font-size: 12px;
        height: 30px;
    }

    .export-btn,
    .save-to-cloud {
        font-size: 12px;
        padding: 4px 8px;
    }

    .markdown-guide-text {
        display: none;
    }

    .markdown-guide-icon {
        display: inline-block;
    }

    /* 按钮缩小 */
    .export-btn,
    .save-to-cloud {
        font-size: 0;
        /* 隐藏文字 */
        padding: 6px 10px;
    }

    .btn-text {
        display: none;
        /* 移动端不显示文字 */
    }

    .btn-icon {
        display: inline-flex;
        /* 显示图标 */
        font-size: 20px;
    }
}
</style>