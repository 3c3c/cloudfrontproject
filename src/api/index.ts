/**
 * API 工具函数
 * 提供统一的请求接口，自动处理认证 token 和刷新机制
 */

import { useAuth } from '../contexts/AuthContext';

// 使用代理模式，所有请求通过 Vite 代理到后端网关
const API_BASE_URL = '/api';

// API 请求配置接口
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number>;
  skipAuth?: boolean; // 是否跳过认证
}

// API 响应接口
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * 构建 URL（包含查询参数）
 */
function buildUrl(baseUrl: string, path: string, params?: Record<string, string | number>): string {
  const url = new URL(path, baseUrl);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

/**
 * 统一的 API 请求函数
 * 自动处理 token 和刷新机制
 */
export async function apiRequest<T = any>(
  path: string,
  config: RequestConfig = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    params,
    skipAuth = false,
  } = config;

  // 构建 URL
  const url = buildUrl(API_BASE_URL, path, params);

  // 获取 token
  const token = localStorage.getItem('auth_token');

  // 准备请求头
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // 如果需要认证且 token 存在，添加 Authorization 头
  if (!skipAuth && token) {
    requestHeaders['Authorization'] = token;
  }

  // 准备请求配置
  const requestConfig: RequestInit = {
    method,
    headers: requestHeaders,
  };

  // 如果有 body，添加到请求中
  if (body) {
    requestConfig.body = JSON.stringify(body);
  }

  try {
    // 发送请求
    const response = await fetch(url, requestConfig);

    // 处理 401 未授权错误（token 过期）
    if (response.status === 401 && token) {
      console.log('收到 401 响应，尝试刷新 token');

      // 尝试刷新 token
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Authorization': token,
          },
        });

        if (refreshResponse.ok) {
          const result: ApiResponse<{ token: string; tokenHead: string }> = await refreshResponse.json();
          if (result.code === 200 && result.data) {
            const newToken = result.data.tokenHead + result.data.token;

            // 更新 localStorage 中的 token
            localStorage.setItem('auth_token', newToken);

            // 使用新的 token 重试原始请求
            requestHeaders['Authorization'] = newToken;
            const retryResponse = await fetch(url, {
              ...requestConfig,
              headers: requestHeaders,
            });

            if (!retryResponse.ok) {
              throw new Error('请求失败');
            }

            const retryData: ApiResponse<T> = await retryResponse.json();
            if (retryData.code !== 200) {
              throw new Error(retryData.message || '请求失败');
            }

            return retryData.data;
          }
        } else {
          // 刷新失败，清除认证信息并重定向
          console.log('刷新 token 失败，清除认证信息并重定向到登录页');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_token_expire');
          localStorage.removeItem('auth_user');
          window.location.href = '/'; // 重定向到登录页
          throw new Error('认证已过期，请重新登录');
        }
      } catch (refreshError) {
        // 刷新过程出错，清除认证信息并重定向
        console.error('刷新 token 出错:', refreshError);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_token_expire');
        localStorage.removeItem('auth_user');
        window.location.href = '/'; // 重定向到登录页
        throw new Error('认证已过期，请重新登录');
      }
    }

    // 处理其他 HTTP 错误
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    // 解析响应数据
    const data: ApiResponse<T> = await response.json();

    // 检查业务代码
    if (data.code !== 200) {
      throw new Error(data.message || '请求失败');
    }

    return data.data;
  } catch (error) {
    // 网络错误或其他错误
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('请求失败，请检查网络连接');
  }
}

/**
 * GET 请求
 */
export function get<T = any>(path: string, params?: Record<string, string | number>, skipAuth?: boolean): Promise<T> {
  return apiRequest<T>(path, { method: 'GET', params, skipAuth });
}

/**
 * POST 请求
 */
export function post<T = any>(path: string, body?: any, skipAuth?: boolean): Promise<T> {
  return apiRequest<T>(path, { method: 'POST', body, skipAuth });
}

/**
 * PUT 请求
 */
export function put<T = any>(path: string, body?: any): Promise<T> {
  return apiRequest<T>(path, { method: 'PUT', body });
}

/**
 * DELETE 请求
 */
export function del<T = any>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: 'DELETE' });
}

/**
 * 导出 API 基础 URL
 */
export { API_BASE_URL };
