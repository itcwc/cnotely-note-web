import { request, ApiResponse } from '../../utils/request';

export interface UpdateUserInfoRequest {
  nickname?: string;
  avatar?: string;
  default_storage_provider?: string;
}

export interface UserInfo {
  id: number;
  email: string;
  nickname: string;
  avatar: string;
  created_at: string;
  updated_at: string;
}

// OAuth 账号信息接口
export interface OAuthAccount {
  provider: string;
  email: string;
  avatar: string;
  created_at: string;
}

export const userApi = {
  // 获取用户信息
  getUserInfo: async (): Promise<ApiResponse<UserInfo>> => {
    return await request('/user/profile', {
      method: 'GET'
    });
  },

  // 更新用户信息
  updateUserInfo: async (data: UpdateUserInfoRequest): Promise<ApiResponse<UserInfo>> => {
    return await request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // 获取 OAuth 账号绑定状态
  getOAuthAccounts: async (): Promise<ApiResponse<OAuthAccount[]>> => {
    return await request('/user/oauth-accounts', {
      method: 'GET'
    });
  },

  // 绑定 OAuth 账号
  bindOAuthAccount: async (provider: string, code: string): Promise<ApiResponse> => {
    return await request(`/auth/oauth/bind/${provider}`, {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  },

  // 解绑 OAuth 账号
  unbindOAuthAccount: async (provider: string): Promise<ApiResponse> => {
    return await request(`/user/oauth-accounts/${provider}`, {
      method: 'DELETE'
    });
  }
};
