/**
 * 权限管理 API 接口
 * 基于 PermissionController API 文档实现
 */

import { get, post, put, del } from './index';
import type { Permission } from '../types';

/**
 * 权限请求接口
 */
export interface PermissionRequest {
  permCode: string;
  permName: string;
  type: number; // 1=目录，2=菜单，3=按钮
  parentId?: number;
  icon?: string;
  path?: string;
  component?: string;
  visible?: number; // 0=隐藏，1=显示
  serviceCode?: string;
  enabled?: number; // 0=禁用，1=启用
  sort?: number;
  remark?: string;
}

/**
 * 权限查询参数
 */
export interface PermissionQueryParams {
  permName?: string;
  type?: number; // 1=目录，2=菜单，3=按钮
}

/**
 * 权限管理 API 类
 */
class PermissionAPI {
  private baseUrl = '/auth/permissions';

  /**
   * 查询权限树形列表
   */
  async getPermissionTree(params?: PermissionQueryParams): Promise<Permission[]> {
    const queryParams: Record<string, string | number> = {};
    if (params?.permName) queryParams.permName = params.permName;
    if (params?.type) queryParams.type = params.type;
    return get<Permission[]>(`${this.baseUrl}/tree`, queryParams);
  }

  /**
   * 查询所有权限列表（扁平化）
   */
  async getPermissionList(): Promise<Permission[]> {
    return get<Permission[]>(`${this.baseUrl}/list`);
  }

  /**
   * 根据ID查询权限
   */
  async getPermissionById(id: number): Promise<Permission> {
    return get<Permission>(`${this.baseUrl}/${id}`);
  }

  /**
   * 创建权限
   */
  async createPermission(data: PermissionRequest): Promise<Permission> {
    return post<Permission>(this.baseUrl, data);
  }

  /**
   * 更新权限
   */
  async updatePermission(id: number, data: PermissionRequest): Promise<Permission> {
    return put<Permission>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * 删除权限
   */
  async deletePermission(id: number): Promise<void> {
    return del<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * 批量删除权限
   */
  async batchDeletePermissions(ids: number[]): Promise<void> {
    return del<void>(`${this.baseUrl}/batch`);
  }

  /**
   * 更新权限状态
   */
  async updatePermissionEnabled(id: number, enabled: number): Promise<void> {
    return put<void>(`${this.baseUrl}/${id}/enabled?enabled=${enabled}`);
  }

  /**
   * 更新权限可见性
   */
  async updatePermissionVisible(id: number, visible: number): Promise<void> {
    return put<void>(`${this.baseUrl}/${id}/visible?visible=${visible}`);
  }
}

export const permissionAPI = new PermissionAPI();
