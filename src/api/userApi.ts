/**
 * 用户管理 API 接口
 * 基于 UserController API 文档实现
 * 使用统一的API调用方式
 */

import { get, post, put, del } from './index';

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

/**
 * 用户API类
 * 使用统一的API调用函数
 */
class UserAPI {
  /**
   * 分页查询用户列表
   */
  async getUserList(params?: {
    current?: number;
    size?: number;
    keyword?: string;
  }): Promise<UserListResponse> {
    return get<UserListResponse>(USER_PREFIX, params);
  }

  /**
   * 根据 ID 查询用户
   */
  async getUserById(id: string | number): Promise<UserResponse> {
    return get<UserResponse>(`${USER_PREFIX}/${id}`);
  }

  /**
   * 创建用户
   */
  async createUser(params: UserRequest): Promise<UserResponse> {
    return post<UserResponse>(USER_PREFIX, params);
  }

  /**
   * 更新用户
   */
  async updateUser(id: string | number, params: UserRequest): Promise<UserResponse> {
    return put<UserResponse>(`${USER_PREFIX}/${id}`, params);
  }

  /**
   * 更新用户状态
   */
  async updateUserStatus(id: string | number, enabled: number): Promise<void> {
    return put<void>(`${USER_PREFIX}/${id}/status`, { enabled });
  }

  /**
   * 删除用户
   */
  async deleteUser(id: string | number): Promise<void> {
    return del<void>(`${USER_PREFIX}/${id}`);
  }

  /**
   * 批量删除用户
   * 后端接口：@DeleteMapping("/batch") public Result<Boolean> batchDelete(@RequestBody List<Long> ids)
   * 注意：后端期望直接接收数组，不是对象
   */
  async batchDeleteUsers(ids: (string | number)[]): Promise<void> {
    // 需要使用fetch直接发送，因为del函数不支持body
    const response = await fetch(`/api${USER_PREFIX}/batch`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('auth_token') || '',
      },
      body: JSON.stringify(ids), // 直接发送数组，不是 { ids }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '批量删除用户失败');
    }

    const result = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '批量删除用户失败');
    }
  }

  /**
   * 批量更新用户状态
   */
  async batchUpdateUserStatus(userIds: (string | number)[], enabled: number): Promise<void> {
    return put<void>(`${USER_PREFIX}/batch/status`, { userIds, enabled });
  }

  /**
   * 用户绑定角色（覆盖式分配）
   * PUT /auth/users/roles
   * roleIds 为该用户的最终角色集合——不在其中的原有角色将被解绑；
   * 传空数组表示解除该用户的所有角色绑定。
   */
  async bindUserRoles(userId: string | number, roleIds: number[]): Promise<boolean> {
    return put<boolean>(`${USER_PREFIX}/roles`, { userId, roleIds });
  }
}

export const userAPI = new UserAPI();
