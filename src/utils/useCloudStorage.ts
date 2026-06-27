import { ref, onMounted, h } from "vue";
import { ElMessage, ElLoading, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import githubApi from "../api/github/index";
import googleDriveApi from "../api/googleDrive";
import { indexedDBHelper } from "./indexedDB";
import { loginWithGitHub, loginWithGoogle } from "./pkce";

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
     * 弹出授权选择弹窗（未登录 / 未设置存储提供者时调用）
     */
    const showAuthDialog = () => {
        ElMessageBox({
            title: t("cloud_storage.auth_dialog_title") || "🔐 需要授权",
            message: h("div", { style: "text-align: center;" }, [
                h("p", { style: "color: var(--el-text-color-secondary); font-size: 13px; margin: 0 0 20px;" },
                    t("cloud_storage.auth_dialog_desc") || "请先授权登录后再进行云端操作"
                ),
                h("div", { style: "display: flex; gap: 12px; justify-content: center;" }, [
                    h("button", {
                        style: "display:flex;align-items:center;gap:8px;padding:10px 20px;border:1px solid #303030;border-radius:8px;background:#1a1a1a;color:#fff;cursor:pointer;font-size:14px;",
                        onClick: () => {
                            ElMessageBox.close();
                            loginWithGitHub();
                        }
                    }, [
                        h("svg", { viewBox: "0 0 24 24", width: "18", height: "18", fill: "currentColor" },
                            h("path", { d: "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" })
                        ),
                        t("cloud_storage.auth_github_btn") || "GitHub 授权"
                    ]),
                    h("button", {
                        style: "display:flex;align-items:center;gap:8px;padding:10px 20px;border:1px solid #e0e0e0;border-radius:8px;background:#fff;color:#333;cursor:pointer;font-size:14px;",
                        onClick: () => {
                            ElMessageBox.close();
                            loginWithGoogle();
                        }
                    }, [
                        h("svg", { viewBox: "0 0 24 24", width: "18", height: "18" }, [
                            h("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }),
                            h("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }),
                            h("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }),
                            h("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" }),
                        ]),
                        t("cloud_storage.auth_google_btn") || "Google 授权"
                    ])
                ])
            ]),
            showConfirmButton: false,
            showCancelButton: false,
            customClass: "cloud-auth-dialog",
        }).catch(() => { /* 关闭不报错 */ });
    };

    /**
     * 核心保存逻辑
     * @param fileName 当前文件名
     * @param content 文件内容
     * @param editorType 编辑器类型 'editormd' | 'quill'
     */
    const saveToCloud = async (fileName: string, content: string, editorType: string) => {
        if (!userInfo.value) {
            showAuthDialog();
            return false;
        }

        const provider = getProvider();
        if (!provider) {
            showAuthDialog();
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