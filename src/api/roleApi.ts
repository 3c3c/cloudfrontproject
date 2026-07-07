/**
 * 角色管理 API 接口
 * 基于角色管理 API 文档实现
 * 使用统一的API调用方式
 */

import { get, post, put, del } from './index';

const ROLE_PREFIX = '/auth/roles';

export interface RoleRequest {
  roleCode: string;
  remark?: string;
  enabled?: number;
}

export interface RoleResponse {
  id: string; // API返回字符串类型的ID
  roleCode: string;
  remark: string;
  enabled: number;
  createTime?: string; // 可选字段
  updateTime?: string; // 可选字段
  createdBy?: string; // 可选字段
  updatedBy?: string; // 可选字段
}

export interface RoleListResponse {
  records: RoleResponse[];
  total: string; // API返回字符串类型的total
  size: string; // API返回字符串类型的size
  current: string; // API返回字符串类型的current
  pages: string; // API返回字符串类型的pages
}

// 权限树节点（带分配状态）
export interface PermissionTreeNode {
  id: number;
  permCode: string;
  permName: string;
  assigned: boolean;
  children: PermissionTreeNode[];
}

/**
 * 角色API类
 * 使用统一的API调用函数
 */
class RoleAPI {
  /**
   * 分页查询角色列表
   */
  async getRoleList(params?: {
    current?: number;
    size?: number;
    keyword?: string;
  }): Promise<RoleListResponse> {
    return get<RoleListResponse>(ROLE_PREFIX, params);
  }

  /**
   * 根据 ID 查询角色
   */
  async getRoleById(id: string | number): Promise<RoleResponse> {
    return get<RoleResponse>(`${ROLE_PREFIX}/${id}`);
  }

  /**
   * 查询用户未拥有的角色（为用户分配角色时的候选列表）
   * GET /auth/users/notAssignedRole?userId=&keyword=
   */
  async getNotAssignedRoles(userId: string | number, keyword?: string): Promise<RoleResponse[]> {
    return get<RoleResponse[]>('/auth/users/notAssignedRole', { userId, keyword });
  }

  /**
   * 根据用户ID查询角色列表（用户已拥有的角色）
   * GET /auth/users/getRolesByUserId/{userId}?keyword=
   * keyword 可模糊匹配角色编码或角色说明，不区分大小写
   */
  async getRolesByUserId(userId: string | number, keyword?: string): Promise<RoleResponse[]> {
    const params: any = {};
    if (keyword) params.keyword = keyword;
    return get<RoleResponse[]>(`/auth/users/getRolesByUserId/${userId}`, params);
  }

  /**
   * 根据角色ID查询权限树
   * GET /auth/roles/{roleId}/permissions
   * 返回完整的权限树形结构，并在每个权限节点上标注指定角色是否拥有该权限
   */
  async getRolePermissions(roleId: string | number): Promise<PermissionTreeNode[]> {
    return get<PermissionTreeNode[]>(`${ROLE_PREFIX}/${roleId}/permissions`);
  }

  /**
   * 批量删除用户拥有的角色（解除用户与角色的绑定关系）
   * DELETE /auth/users/{userId}/roles
   * 请求体为要删除的角色ID数组，如 [1, 2, 3]；
   * 仅删除绑定关系，不影响 sys_role 中的角色数据本身，操作幂等。
   */
  async deleteUserRoles(userId: string | number, roleIds: number[]): Promise<void> {
    const response = await fetch(`/api/auth/users/${userId}/roles`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('auth_token') || '',
      },
      body: JSON.stringify(roleIds),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '删除用户角色失败');
    }

    const result = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '删除用户角色失败');
    }
  }

  /**
   * 创建角色
   */
  async createRole(params: RoleRequest): Promise<RoleResponse> {
    return post<RoleResponse>(ROLE_PREFIX, params);
  }

  /**
   * 更新角色
   */
  async updateRole(id: string | number, params: RoleRequest): Promise<RoleResponse> {
    return put<RoleResponse>(`${ROLE_PREFIX}/${id}`, params);
  }

  /**
   * 更新角色状态
   * PUT /auth/roles/{id}/status?enabled={status}
   * 注意：enabled 作为查询参数，不是请求体
   */
  async updateRoleStatus(id: string | number, enabled: number): Promise<void> {
    const response = await fetch(`/api${ROLE_PREFIX}/${id}/status?enabled=${enabled}`, {
      method: 'PUT',
      headers: {
        'Authorization': localStorage.getItem('auth_token') || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '更新角色状态失败');
    }

    const result = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '更新角色状态失败');
    }
  }

  /**
   * 删除角色
   */
  async deleteRole(id: string | number): Promise<void> {
    return del<void>(`${ROLE_PREFIX}/${id}`);
  }

  /**
   * 批量删除角色
   * DELETE /auth/roles/batch
   */
  async batchDeleteRoles(ids: (string | number)[]): Promise<void> {
    const response = await fetch(`/api${ROLE_PREFIX}/batch`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('auth_token') || '',
      },
      body: JSON.stringify(ids),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '批量删除角色失败');
    }

    const result = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '批量删除角色失败');
    }
  }

  /**
   * 批量更新角色状态
   */
  async batchUpdateRoleStatus(ids: (string | number)[], enabled: number): Promise<void> {
    return put<void>(`${ROLE_PREFIX}/batch/status`, { ids, enabled });
  }
}

export const roleAPI = new RoleAPI();
