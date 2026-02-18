import { request, ApiResponse } from '../../utils/request';

export interface SendForgotPasswordCodeRequest {
  email: string;
  'cf-turnstile-response'?: string;
}

export interface RegisterRequest {
  email: string;
  nickname: string;
  password: string;
  password_confirmation: string;
  code: string;
  'cf-turnstile-response'?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
  code?: string;
  'cf-turnstile-response'?: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  password: string;
  password_confirmation: string;
}

export interface OAuthLoginRequest {
  provider: string;
  code: string;
}

export const authApi = {
  // 发送忘记密码验证码
  sendForgotPasswordCode: async (data: SendForgotPasswordCodeRequest): Promise<ApiResponse> => {
    return await request('/auth/password/send-code', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 发送登录验证码
  sendLoginVerificationCode: async (data: SendForgotPasswordCodeRequest): Promise<ApiResponse> => {
    return await request('/auth/login/send-code', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 发送注册验证码
  sendRegisterVerificationCode: async (data: SendForgotPasswordCodeRequest): Promise<ApiResponse> => {
    return await request('/auth/register/send-code', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 注册
  register: async (data: RegisterRequest): Promise<ApiResponse> => {
    return await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 登录
  login: async (data: LoginRequest): Promise<ApiResponse> => {
    return await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 忘记密码 
  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse> => {
    return await request('/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // OAuth登录
  oauthLogin: async (data: OAuthLoginRequest): Promise<ApiResponse> => {
    return await request(`/auth/oauth/${data.provider}`, {
      method: 'POST',
      body: JSON.stringify({
        code: data.code
      })
    });
  },

  // 退出登录
  logout: async (): Promise<ApiResponse> => {
    return await request('/auth/logout', {
      method: 'POST'
    });
  }
};