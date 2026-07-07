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
  id: string; // API返回的是字符串类型的ID
  username: string;
  nickname: string;
  mobile?: string;
  email?: string;
  avatar?: string;
  enabled: number;
  mustChangePassword: boolean;
  createTime: string;
  updateTime: string;
  createdBy: string;
  updatedBy: string;
}

export interface UserListResponse {
  records: UserResponse[];
  total: string; // API返回的是字符串类型的total
  size: string;  // API返回的是字符串类型的size
  current: string; // API返回的是字符串类型的current
  pages: string;  // API返回的是字符串类型的pages
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
  async getUserById(id: string | number): Promise<UserResponse> {
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
  async updateUser(id: string | number, params: UserRequest): Promise<UserResponse> {
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
  async updateUserStatus(id: string | number, enabled: number): Promise<void> {
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
  async deleteUser(id: string | number): Promise<void> {
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
  async batchDeleteUsers(ids: (string | number)[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}${USER_PREFIX}/batch`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('auth_token') || '',
      },
      body: JSON.stringify(ids), // 直接发送数组，不是 { ids } 对象
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
  async batchUpdateUserStatus(userIds: (string | number)[], enabled: number): Promise<void> {
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

  /**
   * 用户绑定角色（覆盖式分配）
   * PUT /auth/users/roles
   * roleIds 为该用户的最终角色集合——不在其中的原有角色将被解绑；
   * 传空数组表示解除该用户的所有角色绑定。
   */
  async bindUserRoles(userId: string | number, roleIds: number[]): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}${USER_PREFIX}/roles`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('auth_token') || '',
      },
      body: JSON.stringify({ userId, roleIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '分配角色失败');
    }

    const result: ApiResponse<boolean> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '分配角色失败');
    }

    return result.data;
  }
}

export const userAPI = new UserAPI();
