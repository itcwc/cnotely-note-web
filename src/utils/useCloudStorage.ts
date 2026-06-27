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

    // Google Drive 文件 ID 映射：本地文件名 → Google Drive fileId
    // 用于后续同步更新，避免按文件名查找（文件名可能被用户修改）
    const googleFileIdMap = ref<Record<string, string>>({});

    // 从 localStorage 恢复 fileIdMap
    const loadGoogleFileIdMap = () => {
        try {
            const raw = localStorage.getItem("google_file_id_map");
            if (raw) googleFileIdMap.value = JSON.parse(raw);
        } catch { }
    };
    const saveGoogleFileIdMap = () => {
        localStorage.setItem("google_file_id_map", JSON.stringify(googleFileIdMap.value));
    };

    // 初始化时恢复
    loadGoogleFileIdMap();

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
     * 获取当前有效的存储提供者（自动检测）
     */
    const getProvider = (): string | null => {
        if (userInfo.value?.default_storage_provider) {
            return userInfo.value.default_storage_provider;
        }
        // 自动检测：从 localStorage 读取 OAuth 登录信息
        try {
            const raw = localStorage.getItem("user_info");
            if (raw) {
                const info = JSON.parse(raw);
                if (info?.provider) return info.provider;
            }
        } catch { }
        return null;
    };

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

        const provider = getProvider();
        if (!provider) {
            ElMessage.warning(t("cloud_storage.no_default_provider") || "请先登录并授权存储平台");
            return false;
        }

        // 验证文件内容不能为空
        if (!content || content.trim() === '') {
            ElMessage.warning(t("cloud_storage.content_empty"));
            return false;
        }

        // 1. 处理文件名后缀
        let fileNameValue = fileName || "untitled";
        // 不再根据 editorType 强制补后缀，保留用户原始文件名
        // 调用方（EditorPanel.vue）应保证传入正确的文件名和后缀
        if (!fileNameValue.includes(".")) {
            // 只在完全没有后缀时，根据编辑器类型补一个默认后缀
            fileNameValue += (editorType === "editormd" ? ".md" : ".html");
        }
        // console.log('fileNameValue', fileNameValue);

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
        // 优先用缓存的 fileId 直接更新（避免按文件名查找，文件名可能被改）
        const cachedFileId = googleFileIdMap.value[fileName];
        const result = await googleDriveApi.syncFile(fileName, content, cachedFileId);

        // 缓存/更新 Google Drive fileId，下次同步直接用 ID
        if (result?.id) {
            googleFileIdMap.value[fileName] = result.id;
            saveGoogleFileIdMap();
        }

        ElMessage.success(t("cloud_storage.google_sync_success"));
        return true;
    };

    return {
        // userInfo,
        isSyncing,
        saveToCloud
    };
}