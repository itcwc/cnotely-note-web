import router from '../router';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 通用请求函数，统一处理 401 响应
 */
export const request = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  // 获取 access_token
  const accessToken = localStorage.getItem('access_token') || '';
  // 获取当前语言
  const currentLanguage = localStorage.getItem('selectedLanguage') || navigator.language || 'en';

  // 设置默认请求头
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Accept-Language': currentLanguage,
    ...(options.headers as Record<string, string> || {}),
  };

  // 添加 Authorization 头
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // 发送请求
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // 解析响应
  const data: ApiResponse<T> = await response.json();

  // 处理 401 响应
  if (data.code === 401) {
    // 清空缓存
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('github_access_token');
    localStorage.removeItem('selected_platform');

    // 跳转到登录页
    router.push('/login');

    // 抛出错误，让调用者知道请求失败
    throw new Error( data.msg ?? '未登录或登录已失效');
  }

  return data;
};