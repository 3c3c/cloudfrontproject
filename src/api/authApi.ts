/**
 * 认证相关 API 接口
 * 基于 cloud-auth-api.md 文档实现
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
const AUTH_PREFIX = '/auth';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  nickname: string;
  password: string;
  mobile?: string;
  email?: string;
  avatar?: string;
}

export interface LoginResponse {
  token: string;
  tokenHead: string;
  userId: string;
  username: string;
  avatar: string;
  authorities: string[];
  mustChangePassword: boolean;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

class AuthAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * 用户登录
   */
  async login(params: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}${AUTH_PREFIX}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '登录失败');
    }

    const result: ApiResponse<LoginResponse> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '登录失败');
    }

    return result.data;
  }

  /**
   * 用户注册
   */
  async register(params: RegisterRequest): Promise<string> {
    const response = await fetch(`${this.baseUrl}${AUTH_PREFIX}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '注册失败');
    }

    const result: ApiResponse<string> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '注册失败');
    }

    return result.data;
  }

  /**
   * 用户登出
   */
  async logout(token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}${AUTH_PREFIX}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '登出失败');
    }

    const result: ApiResponse<null> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '登出失败');
    }
  }

  /**
   * 刷新令牌
   */
  async refreshToken(token: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}${AUTH_PREFIX}/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '刷新令牌失败');
    }

    const result: ApiResponse<LoginResponse> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '刷新令牌失败');
    }

    return result.data;
  }

  /**
   * 发送验证码
   */
  async sendSms(mobile: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}${AUTH_PREFIX}/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mobile }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '发送验证码失败');
    }

    const result: ApiResponse<null> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '发送验证码失败');
    }
  }

  /**
   * 短信验证码登录
   */
  async smsLogin(mobile: string, code: string, clientId: string, clientSecret: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}${AUTH_PREFIX}/sms/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobile,
        code,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '登录失败');
    }

    const result: ApiResponse<LoginResponse> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '登录失败');
    }

    return result.data;
  }
}

export const authAPI = new AuthAPI();
