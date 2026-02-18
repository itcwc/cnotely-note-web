// Google Drive API 封装
import { request as httpRequest } from '../utils/request';
import { ElMessage } from 'element-plus';
import i18n from '../i18n';

const t = i18n.global.t;

// 通用请求函数
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  // 获取当前语言
  const currentLanguage = localStorage.getItem('selectedLanguage') || navigator.language || 'en';
  
  // 设置请求头，添加语言参数
  const headers: Record<string, string> = {
    'Accept-Language': currentLanguage,
    ...(options.headers as Record<string, string> || {}),
  };
  
  try {
    const response = await httpRequest<T>(url, {
      ...options,
      headers,
    });

    // 检查响应数据是否包含错误信息
    if (response && response.code === 403 && response.data && typeof response.data === 'object' && 'message' in response.data) {
      const errorMessage = response.data.message as string;
      ElMessage.warning(errorMessage);
      throw new Error(errorMessage);
    }

    return response.data as T;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : t('github_api.request_failed');
    if (!errorMessage.includes(t('compile_view.not_bound'))) {
      ElMessage.error(errorMessage);
    }
    throw error;
  }
}

const googleDriveApi = {
  // 获取 Google Drive 文件列表
  async getFiles() {
    try {
      return await request<any[]>('/storage/google-drive/files');
    } catch (error) {
      // console.error("获取 Google Drive 文件失败:", error);
      throw error;
    }
  },

  // 获取 Google Drive 文件内容
  async getFileContent(fileId: string) {
    try {
      return await request<any>(`/storage/google-drive/file?file_id=${encodeURIComponent(fileId)}`);
    } catch (error) {
      console.error("获取 Google Drive 文件内容失败:", error);
      throw error;
    }
  },

  // 同步文件到 Google Drive
  async syncFile(name: string, content: string) {
    try {
      return await request<any>('/storage/google-drive/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          content,
        }),
      });
    } catch (error) {
      console.error("同步文件到 Google Drive 失败:", error);
      throw error;
    }
  },

  // 上传文件到 Google Drive
  async uploadFile(fileName: string, fileContent: string) {
    try {
      return await request<any>('/storage/google-drive/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_name: fileName,
          file_content: fileContent,
        }),
      });
    } catch (error) {
      console.error("上传文件到 Google Drive 失败:", error);
      throw error;
    }
  },
};

export default googleDriveApi;