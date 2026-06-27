import { getAccessToken } from '../../utils/pkce';
import i18n from '../../i18n';

const t = i18n.global.t;

// ============ 通用请求函数：直接调 GitHub API ============

async function gh<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  if (!token) throw new Error('未登录，缺少 access_token');
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
  };
  if (options.headers) {
    const h = options.headers;
    if (typeof h === 'object' && !Array.isArray(h)) {
      Object.assign(headers, h as Record<string, string>);
    }
  }
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }
  // 204 No Content 时返回空对象
  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

// ============ Base64 编码（UTF-8 安全） ============

function base64Encode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach(b => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

// ============ 仓库相关 ============

export const repos = {

  // 获取当前用户的仓库列表
  async getUserRepos(): Promise<Array<{ name: string; full_name: string; description: string }>> {
    // GitHub 分页，每页最多 100 条
    const data = await gh<Array<{ name: string; full_name: string; description: string }>>(
      '/user/repos?per_page=100&sort=updated',
      { method: 'GET' },
    );
    return data;
  },

  // 获取仓库文件树
  async getRepoTree(repoName: string): Promise<any[]> {
    const [owner, repo] = repoName.split('/');
    const repoInfo = await gh<any>(`/repos/${owner}/${repo}`, { method: 'GET' });
    const branch = repoInfo.default_branch;
    const treeData = await gh<any>(`/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, { method: 'GET' });
    return treeData.tree;
  },

  // 获取文件内容
  async getFileContent(repoName: string, filePath: string): Promise<{ path: string; content: string }> {
    if (repoName === 'local/local-repo' || repoName === 'local') {
      return Promise.resolve({ path: filePath, content: '' });
    }
    const [owner, repo] = repoName.split('/');
    const data = await gh<any>(`/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}`, { method: 'GET' });
    let content = '';
    if (data && data.content) {
      content = atob(data.content.replace(/\n/g, ''));
    }
    return { path: filePath, content };
  },

  // 上传/更新文件到仓库（PKCE 模式，直接调 GitHub API）
  async uploadFile(
    repoName: string,
    path: string,
    content: string,
    message: string,
    branch?: string,
    sha?: string,
  ): Promise<{ path: string; sha: string; html_url: string; commit: { sha: string; message: string; html_url: string } }> {
    const [owner, repo] = repoName.split('/');
    const b = branch || (await gh<any>(`/repos/${owner}/${repo}`, { method: 'GET' })).default_branch;
    const body: Record<string, any> = {
      message,
      content: base64Encode(content),
      branch: b,
    };
    if (sha) body.sha = sha;

    const data = await gh<any>(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    return {
      path,
      sha: data.content?.sha || '',
      html_url: data.content?.html_url || '',
      commit: {
        sha: data.commit?.sha || '',
        message: data.commit?.message || message,
        html_url: data.commit?.html_url || '',
      },
    };
  },
};

// ============ 用户信息 ============

export const user = {
  async getAuthenticated(): Promise<{ login: string; avatar_url: string; name: string; email: string }> {
    return gh<any>('/user', { method: 'GET' });
  },
};

const githubApi = {
  repos,
  user,
};

export default githubApi;
