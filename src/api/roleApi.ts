/**
 * 角色管理 API 接口
 * 基于角色管理 API 文档实现
 */

// 使用代理模式，所有请求通过 Vite 代理到后端网关
const API_BASE_URL = '/api';
const ROLE_PREFIX = '/auth/roles';

export interface RoleRequest {
  roleCode: string;
  roleName: string;
  remark?: string;
  enabled?: number;
}

export interface RoleResponse {
  id: number;
  roleCode: string;
  roleName: string;
  remark: string;
  enabled: number;
  createTime: string;
  updateTime: string;
  createdBy: string;
  updatedBy: string;
}

export interface RoleListResponse {
  records: RoleResponse[];
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
    roleName?: string;
  }): Promise<RoleListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.current) queryParams.append('current', params.current.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.roleName) queryParams.append('roleName', params.roleName);

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
  async getRoleById(id: number): Promise<RoleResponse> {
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
  async updateRole(id: number, params: RoleRequest): Promise<RoleResponse> {
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
  async updateRoleStatus(id: number, enabled: number): Promise<void> {
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
  async deleteRole(id: number): Promise<void> {
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
  async batchDeleteRoles(ids: number[]): Promise<void> {
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
  async batchUpdateRoleStatus(ids: number[], enabled: number): Promise<void> {
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
