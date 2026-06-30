/**
 * 用户管理 API 接口
 * 基于 UserController API 文档实现
 */

// 使用代理模式，所有请求通过 Vite 代理到后端网关
const API_BASE_URL = '/api';
const USER_PREFIX = '/auth/users';

export interface UserRequest {
  username: string;
  nickname: string;
  password?: string; // RSA加密后的密码
  mobile?: string;
  email?: string;
  avatar?: string;
}

export interface UserResponse {
  id: number;
  username: string;
  nickname: string;
  mobile?: string;
  email?: string;
  avatar?: string;
  enabled: number;
  createTime: string;
  updateTime: string;
  createdBy: string;
  updatedBy: string;
}

export interface UserListResponse {
  records: UserResponse[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

class UserAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * 分页查询用户列表
   */
  async getUserList(params?: {
    current?: number;
    size?: number;
    keyword?: string;
  }): Promise<UserListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.current) queryParams.append('current', params.current.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.keyword) queryParams.append('keyword', params.keyword);

    const url = `${this.baseUrl}${USER_PREFIX}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': localStorage.getItem('auth_token') || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '查询用户列表失败');
    }

    const result: ApiResponse<UserListResponse> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '查询用户列表失败');
    }

    return result.data;
  }

  /**
   * 根据 ID 查询用户
   */
  async getUserById(id: number): Promise<UserResponse> {
    const response = await fetch(`${this.baseUrl}${USER_PREFIX}/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': localStorage.getItem('auth_token') || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '查询用户失败');
    }

    const result: ApiResponse<UserResponse> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '查询用户失败');
    }

    return result.data;
  }

  /**
   * 创建用户
   */
  async createUser(params: UserRequest): Promise<UserResponse> {
    const response = await fetch(`${this.baseUrl}${USER_PREFIX}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('auth_token') || '',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '创建用户失败');
    }

    const result: ApiResponse<UserResponse> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '创建用户失败');
    }

    return result.data;
  }

  /**
   * 更新用户
   */
  async updateUser(id: number, params: UserRequest): Promise<UserResponse> {
    const response = await fetch(`${this.baseUrl}${USER_PREFIX}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('auth_token') || '',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '更新用户失败');
    }

    const result: ApiResponse<UserResponse> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '更新用户失败');
    }

    return result.data;
  }

  /**
   * 更新用户状态
   */
  async updateUserStatus(id: number, enabled: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}${USER_PREFIX}/${id}/status?enabled=${enabled}`, {
      method: 'PUT',
      headers: {
        'Authorization': localStorage.getItem('auth_token') || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '更新用户状态失败');
    }

    const result: ApiResponse<null> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '更新用户状态失败');
    }
  }

  /**
   * 删除用户
   */
  async deleteUser(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}${USER_PREFIX}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': localStorage.getItem('auth_token') || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '删除用户失败');
    }

    const result: ApiResponse<null> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '删除用户失败');
    }
  }

  /**
   * 批量删除用户
   */
  async batchDeleteUsers(ids: number[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}${USER_PREFIX}/batch`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('auth_token') || '',
      },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '批量删除用户失败');
    }

    const result: ApiResponse<null> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '批量删除用户失败');
    }
  }

  /**
   * 批量更新用户状态
   */
  async batchUpdateUserStatus(userIds: number[], enabled: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}${USER_PREFIX}/batch/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('auth_token') || '',
      },
      body: JSON.stringify({ userIds, enabled }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '批量更新用户状态失败');
    }

    const result: ApiResponse<null> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '批量更新用户状态失败');
    }
  }
}

export const userAPI = new UserAPI();
