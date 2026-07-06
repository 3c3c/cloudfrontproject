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
 * 分页参数
 */
export interface BasePage {
  current?: number; // 当前页码，从1开始
  size?: number; // 每页大小
}

/**
 * 权限查询参数
 */
export interface PermissionQueryParams extends BasePage {
  permName?: string; // 权限名称，支持模糊查询
  type?: number; // 1=目录，2=菜单，3=按钮
}

/**
 * 分页结果
 */
export interface PageResult<T> {
  records: T[];
  total: number; // 第一级节点的总数
  size: number; // 每页大小
  current: number; // 当前页码
  pages: number; // 总页数
}

/**
 * 权限管理 API 类
 */
class PermissionAPI {
  private baseUrl = '/auth/permissions';

  /**
   * 查询权限树形列表
   * @param params 查询参数，包含分页和过滤条件
   * @returns 分页结果，records为树形数据列表，total为第一级节点总数
   */
  async getPermissionTree(params?: PermissionQueryParams): Promise<PageResult<Permission>> {
    const queryParams: Record<string, string | number> = {};
    // 分页参数
    if (params?.current) queryParams.current = params.current;
    if (params?.size) queryParams.size = params.size;
    // 过滤参数
    if (params?.permName) queryParams.permName = params.permName;
    if (params?.type) queryParams.type = params.type;
    return get<PageResult<Permission>>(`${this.baseUrl}/tree`, queryParams);
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
