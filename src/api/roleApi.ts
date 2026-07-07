/**
 * 角色管理 API 接口
 * 基于角色管理 API 文档实现
 */

// 使用代理模式，所有请求通过 Vite 代理到后端网关
const API_BASE_URL = '/api';
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

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

class RoleAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * 分页查询角色列表
   */
  async getRoleList(params?: {
    current?: number;
    size?: number;
    keyword?: string;
  }): Promise<RoleListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.current) queryParams.append('current', params.current.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.keyword) queryParams.append('keyword', params.keyword);

    const url = `${this.baseUrl}${ROLE_PREFIX}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': localStorage.getItem('auth_token') || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '查询角色列表失败');
    }

    const result: ApiResponse<RoleListResponse> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '查询角色列表失败');
    }

    return result.data;
  }

  /**
   * 根据 ID 查询角色
   */
  async getRoleById(id: string | number): Promise<RoleResponse> {
    const response = await fetch(`${this.baseUrl}${ROLE_PREFIX}/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': localStorage.getItem('auth_token') || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '查询角色失败');
    }

    const result: ApiResponse<RoleResponse> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '查询角色失败');
    }

    return result.data;
  }

  /**
   * 查询用户未拥有的角色（为用户分配角色时的候选列表）
   * GET /auth/users/notAssignedRole?userId=&keyword=
   */
  async getNotAssignedRoles(userId: string | number, keyword?: string): Promise<RoleResponse[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('userId', userId.toString());
    if (keyword) queryParams.append('keyword', keyword);

    const url = `${this.baseUrl}/auth/users/notAssignedRole?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': localStorage.getItem('auth_token') || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '查询用户未拥有角色失败');
    }

    const result: ApiResponse<RoleResponse[]> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '查询用户未拥有角色失败');
    }

    return result.data;
  }

  /**
   * 根据用户ID查询角色列表（用户已拥有的角色）
   * GET /auth/users/getRolesByUserId/{userId}?keyword=
   * keyword 可模糊匹配角色编码或角色说明，不区分大小写
   */
  async getRolesByUserId(userId: string | number, keyword?: string): Promise<RoleResponse[]> {
    const queryParams = new URLSearchParams();
    if (keyword) queryParams.append('keyword', keyword);

    const url = `${this.baseUrl}/auth/users/getRolesByUserId/${userId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': localStorage.getItem('auth_token') || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '查询用户角色列表失败');
    }

    const result: ApiResponse<RoleResponse[]> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '查询用户角色列表失败');
    }

    return result.data;
  }

  /**
   * 根据角色ID查询权限树
   * GET /auth/roles/{roleId}/permissions
   * 返回完整的权限树形结构，并在每个权限节点上标注指定角色是否拥有该权限
   */
  async getRolePermissions(roleId: string | number): Promise<PermissionTreeNode[]> {
    const response = await fetch(`${this.baseUrl}${ROLE_PREFIX}/${roleId}/permissions`, {
      method: 'GET',
      headers: {
        'Authorization': localStorage.getItem('auth_token') || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '查询角色权限树失败');
    }

    const result: ApiResponse<PermissionTreeNode[]> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '查询角色权限树失败');
    }

    return result.data;
  }

  /**
   * 批量删除用户拥有的角色（解除用户与角色的绑定关系）
   * DELETE /auth/users/{userId}/roles
   * 请求体为要删除的角色ID数组，如 [1, 2, 3]；
   * 仅删除绑定关系，不影响 sys_role 中的角色数据本身，操作幂等。
   */
  async deleteUserRoles(userId: string | number, roleIds: number[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/users/${userId}/roles`, {
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

    const result: ApiResponse<null> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '删除用户角色失败');
    }
  }

  /**
   * 创建角色
   */
  async createRole(params: RoleRequest): Promise<RoleResponse> {
    const response = await fetch(`${this.baseUrl}${ROLE_PREFIX}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('auth_token') || '',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '创建角色失败');
    }

    const result: ApiResponse<RoleResponse> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '创建角色失败');
    }

    return result.data;
  }

  /**
   * 更新角色
   */
  async updateRole(id: string | number, params: RoleRequest): Promise<RoleResponse> {
    const response = await fetch(`${this.baseUrl}${ROLE_PREFIX}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('auth_token') || '',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '更新角色失败');
    }

    const result: ApiResponse<RoleResponse> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '更新角色失败');
    }

    return result.data;
  }

  /**
   * 更新角色状态
   */
  async updateRoleStatus(id: string | number, enabled: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}${ROLE_PREFIX}/${id}/status?enabled=${enabled}`, {
      method: 'PUT',
      headers: {
        'Authorization': localStorage.getItem('auth_token') || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '更新角色状态失败');
    }

    const result: ApiResponse<null> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '更新角色状态失败');
    }
  }

  /**
   * 删除角色
   */
  async deleteRole(id: string | number): Promise<void> {
    const response = await fetch(`${this.baseUrl}${ROLE_PREFIX}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': localStorage.getItem('auth_token') || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '删除角色失败');
    }

    const result: ApiResponse<null> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '删除角色失败');
    }
  }

  /**
   * 批量删除角色
   */
  async batchDeleteRoles(ids: (string | number)[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}${ROLE_PREFIX}/batch`, {
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

    const result: ApiResponse<null> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '批量删除角色失败');
    }
  }

  /**
   * 批量更新角色状态
   */
  async batchUpdateRoleStatus(ids: (string | number)[], enabled: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}${ROLE_PREFIX}/batch/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('auth_token') || '',
      },
      body: JSON.stringify({ ids, enabled }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '批量更新角色状态失败');
    }

    const result: ApiResponse<null> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '批量更新角色状态失败');
    }
  }
}

export const roleAPI = new RoleAPI();
