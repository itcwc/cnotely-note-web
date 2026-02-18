import { ref, onMounted } from "vue";
import { ElMessage, ElLoading } from "element-plus";
import { useI18n } from "vue-i18n";
import githubApi from "../api/github/index";
import googleDriveApi from "../api/googleDrive";
import { indexedDBHelper } from "./indexedDB";

export function useCloudStorage() {
    const { t } = useI18n();
    const userInfo = ref<any>(null);
    const isSyncing = ref(false);

    // 初始化用户信息
    const initUserInfo = () => {
        const storedUserInfo = localStorage.getItem("user_info");
        if (storedUserInfo) {
            try {
                userInfo.value = JSON.parse(storedUserInfo);
            } catch (error) {
                console.error("解析用户信息失败:", error);
            }
        }
    };

    onMounted(() => {
        initUserInfo();
    });

    /**
     * 核心保存逻辑
     * @param fileName 当前文件名
     * @param content 文件内容
     * @param editorType 编辑器类型 'editormd' | 'quill'
     */
    const saveToCloud = async (fileName: string, content: string, editorType: string) => {
        if (!userInfo.value) {
            ElMessage.warning(t("cloud_storage.not_logged_in"));
            return false;
        }
        
        if (!userInfo.value.default_storage_provider) {
            ElMessage.warning(t("cloud_storage.no_default_provider"));
            return false;
        }
        
        // 验证文件内容不能为空
        if (!content || content.trim() === '') {
            ElMessage.warning(t("cloud_storage.content_empty"));
            return false;
        }

        // 1. 处理文件名后缀
        let fileNameValue = fileName || "untitled";
        if (!fileNameValue.includes(".")) {
            fileNameValue += (editorType === "editormd" ? ".md" : ".html");
        }

        const provider = userInfo.value.default_storage_provider;
        isSyncing.value = true;

        try {
            if (provider === "github") {
                return await handleGithubUpload(fileNameValue, content);
            } else if (provider === "google") {
                return await handleGoogleUpload(fileNameValue, content);
            }
        } catch (error) {
            console.error("云端保存失败:", error);
            ElMessage.error(t("cloud_storage.sync_failed"));
            return false;
        } finally {
            isSyncing.value = false;
        }
    };

    // --- 私有处理方法 ---

    const handleGithubUpload = async (fileName: string, content: string) => {
        const existingFile = await indexedDBHelper.getFileByName(fileName);

        if (existingFile && existingFile.repo && existingFile.path) {
            const responseData = await githubApi.repos.uploadFile(
                existingFile.repo,
                existingFile.path,
                content,
                `Update ${existingFile.path}`,
                existingFile.branch,
                existingFile.sha
            );

            // 更新本地 SHA
            await indexedDBHelper.saveFile({
                ...existingFile,
                content,
                sha: responseData.sha,
                // provider: 'github'
            });

            ElMessage.success(t("cloud_storage.github_sync_success"));
            return true;
        } else {
            ElMessage.info(t("cloud_storage.github_sync_info"));
            return false;
        }
    };

    const handleGoogleUpload = async (fileName: string, content: string) => {
        await googleDriveApi.syncFile(fileName, content);

        // await indexedDBHelper.saveFile({
        //     name: fileName,
        //     content,
        //     type: fileName.endsWith(".md") ? "md" : "html",
        //     // provider: "google",
        // });

        ElMessage.success(t("cloud_storage.google_sync_success"));
        return true;
    };

    return {
        // userInfo,
        isSyncing,
        saveToCloud
    };
}