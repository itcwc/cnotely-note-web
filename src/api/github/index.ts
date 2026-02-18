import { ElMessage } from 'element-plus';
import { request as httpRequest } from '../../utils/request';
import i18n from '../../i18n';

const t = i18n.global.t;

// 文件类型定义
export interface FileItem {
  name: string;
  path: string;
  content: string;
}

// 通用请求函数（封装成与之前相同的接口）
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

// GitHub 授权相关函数
export const auth = {
  // 保存访问令牌
  saveToken(token: string): void {
    localStorage.setItem('github_access_token', token);
  },

  // 获取访问令牌
  getToken(): string | null {
    return localStorage.getItem('github_access_token');
  },

  // 清除访问令牌
  clearToken(): void {
    localStorage.removeItem('github_access_token');
  },

  // 检查是否已授权
  isAuthorized(): boolean {
    return this.getToken() !== null;
  },
};

// 仓库相关函数
export const repos = {

  // 获取用户仓库列表
  async getUserRepos(): Promise<Array<{ name: string; full_name: string; description: string }>> {
    return request<Array<{ name: string; full_name: string; description: string }>>(`/storage/github/repos`, {
      method: 'GET',
    });
  },

  // 获取仓库文件树
  async getRepoTree(repoName: string): Promise<any[]> {
    return request<any[]>(`/storage/github/tree?repo=${repoName}`, {
      method: 'GET',
    });
  },

  // 获取文件内容
  async getFileContent(repoName: string, filePath: string): Promise<{ path: string; content: string }> {
    // 如果是本地仓库，直接返回空内容，避免不必要的 API 调用
    if (repoName === 'local/local-repo' || repoName === 'local') {
      return Promise.resolve({ path: filePath, content: '' });
    }
    return request<{ path: string; content: string }>(`/storage/github/file?repo=${repoName}&path=${encodeURIComponent(filePath)}`, {
      method: 'GET',
    });
  },

  // 上传文件到仓库
  async uploadFile(repoName: string, path: string, content: string, message: string, branch?: string, sha?: string): Promise<{ path: string; sha: string; html_url: string; commit: { sha: string; message: string; html_url: string } }> {
    return request<{ path: string; sha: string; html_url: string; commit: { sha: string; message: string; html_url: string } }>('/storage/github/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repo: repoName,
        path: path,
        content: content,
        message: message,
        branch: branch,
        sha: sha
      }),
    });
  },
};

// 默认导出所有 GitHub API 函数
const githubApi = {
  auth,
  repos,
};

export default githubApi;
