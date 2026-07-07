/**
 * 字典管理 API 接口
 * 基于 DictController API 文档实现
 * 基础路径：/admin/dict
 */

import { DictionaryType, DictionaryItem } from '../types';

// 使用代理模式，所有请求通过 Vite 代理到后端网关
const API_BASE_URL = '/api';
const DICT_PREFIX = '/admin/dict';

// 后端响应 DTO
interface DictTypeResponse {
  // 后端将 Long 序列化为字符串以防精度丢失，故 id/parentId 实际可能是 number 或 string
  id: number | string;
  dictName: string;
  dictCode: string;
  parentId: number | string;
  sortOrder: number;
  status: number;
  remark?: string;
  isLeaf?: boolean;
}

// 树形结构响应（/types/tree）：在扁平节点基础上增加 children
interface DictTypeTreeResponse extends DictTypeResponse {
  children?: DictTypeTreeResponse[];
}

interface DictDataResponse {
  id: number | string;
  dictTypeId: number | string;
  dictLabel: string;
  dictValue: string;
  sortOrder: number;
  remark?: string;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 请求体类型（使用前端字段名，内部再映射为后端字段）
export interface DictTypeRequest {
  name: string;
  code: string;
  parentId?: string | null;
  sortOrder?: number;
  enabled?: boolean;
  description?: string;
}

export interface DictDataRequest {
  typeId: string;
  label: string;
  value: string;
  sortOrder?: number;
  description?: string;
}

// 响应映射：后端 DTO → 前端类型
function mapType(t: DictTypeResponse): DictionaryType {
  const pidStr = t.parentId == null ? '' : String(t.parentId);
  return {
    id: String(t.id),
    name: t.dictName,
    code: t.dictCode,
    description: t.remark || undefined,
    parentId: !pidStr || pidStr === '0' ? null : pidStr,
    enabled: t.status === 1,
    sortOrder: t.sortOrder,
  };
}

function mapItem(i: DictDataResponse): DictionaryItem {
  return {
    id: String(i.id),
    typeId: String(i.dictTypeId),
    label: i.dictLabel,
    value: i.dictValue,
    sortOrder: i.sortOrder,
    description: i.remark || undefined,
  };
}

// 将后端返回的嵌套树递归扁平化为 DictionaryType[]（保留 parentId，组件自行 buildTree）
function flattenTree(nodes: DictTypeTreeResponse[]): DictionaryType[] {
  const result: DictionaryType[] = [];
  const walk = (list: DictTypeTreeResponse[]) => {
    list.forEach((node) => {
      result.push(mapType(node));
      if (node.children && node.children.length > 0) {
        walk(node.children);
      }
    });
  };
  walk(nodes);
  return result;
}

// 请求映射：前端类型 → 后端 body
function typeToBody(t: DictTypeRequest) {
  return {
    dictName: t.name,
    dictCode: t.code,
    parentId: t.parentId ? Number(t.parentId) : 0,
    sortOrder: t.sortOrder ?? 0,
    status: t.enabled === false ? 0 : 1,
    remark: t.description ?? '',
  };
}

function dataToBody(d: DictDataRequest) {
  return {
    dictTypeId: Number(d.typeId),
    dictLabel: d.label,
    dictValue: d.value,
    sortOrder: d.sortOrder ?? 0,
    remark: d.description ?? '',
  };
}

class DictionaryAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * 查询字典类型树形结构（扁平化后返回，保留 parentId）
   * GET /types/tree
   */
  async getTypeTree(): Promise<DictionaryType[]> {
    const response = await fetch(`${this.baseUrl}${DICT_PREFIX}/types/tree`, {
      method: 'GET',
      headers: {
        'Authorization': localStorage.getItem('auth_token') || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '查询字典类型树失败');
    }

    const result: ApiResponse<DictTypeTreeResponse[]> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '查询字典类型树失败');
    }

    return flattenTree(result.data || []);
  }

  /**
   * 创建字典类型
   * POST /types
   */
  async createType(payload: DictTypeRequest): Promise<DictionaryType> {
    const response = await fetch(`${this.baseUrl}${DICT_PREFIX}/types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('auth_token') || '',
      },
      body: JSON.stringify(typeToBody(payload)),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '创建字典类型失败');
    }

    const result: ApiResponse<DictTypeResponse> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '创建字典类型失败');
    }

    return mapType(result.data);
  }

  /**
   * 更新字典类型
   * PUT /types/{id}
   */
  async updateType(id: string, payload: DictTypeRequest): Promise<DictionaryType> {
    const response = await fetch(`${this.baseUrl}${DICT_PREFIX}/types/${Number(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('auth_token') || '',
      },
      body: JSON.stringify(typeToBody(payload)),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '更新字典类型失败');
    }

    const result: ApiResponse<DictTypeResponse> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '更新字典类型失败');
    }

    return mapType(result.data);
  }

  /**
   * 更新字典类型状态（启用/禁用）
   * PUT /types/{id}/status?status=
   */
  async updateTypeStatus(id: string, status: number): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}${DICT_PREFIX}/types/${Number(id)}/status?status=${status}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': localStorage.getItem('auth_token') || '',
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '更新字典类型状态失败');
    }

    const result: ApiResponse<unknown> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '更新字典类型状态失败');
    }
  }

  /**
   * 批量删除字典类型（文档未提供单删，单个删除也走 batch）
   * DELETE /types/batch  body: [id, ...]
   */
  async batchDeleteTypes(ids: string[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}${DICT_PREFIX}/types/batch`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('auth_token') || '',
      },
      body: JSON.stringify(ids.map(Number)),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '删除字典类型失败');
    }

    const result: ApiResponse<unknown> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '删除字典类型失败');
    }
  }

  /**
   * 根据字典类型编码查询该类型全部字典数据
   * GET /data/getDictDataByCode?dictCode={code}
   */
  async getDataByCode(code: string): Promise<DictionaryItem[]> {
    const response = await fetch(
      `${this.baseUrl}${DICT_PREFIX}/data/getDictDataByCode?dictCode=${encodeURIComponent(code)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': localStorage.getItem('auth_token') || '',
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '查询字典数据失败');
    }

    const result: ApiResponse<DictDataResponse[]> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '查询字典数据失败');
    }

    return (result.data || []).map(mapItem);
  }

  /**
   * 创建字典数据
   * POST /data
   */
  async createData(payload: DictDataRequest): Promise<DictionaryItem> {
    const response = await fetch(`${this.baseUrl}${DICT_PREFIX}/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('auth_token') || '',
      },
      body: JSON.stringify(dataToBody(payload)),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '创建字典数据失败');
    }

    const result: ApiResponse<DictDataResponse> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '创建字典数据失败');
    }

    return mapItem(result.data);
  }

  /**
   * 更新字典数据
   * PUT /data/{id}
   */
  async updateData(id: string, payload: DictDataRequest): Promise<DictionaryItem> {
    const response = await fetch(`${this.baseUrl}${DICT_PREFIX}/data/${Number(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('auth_token') || '',
      },
      body: JSON.stringify(dataToBody(payload)),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '更新字典数据失败');
    }

    const result: ApiResponse<DictDataResponse> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '更新字典数据失败');
    }

    return mapItem(result.data);
  }

  /**
   * 批量删除字典数据（单个删除也走 batch）
   * DELETE /data/batch  body: [id, ...]
   */
  async batchDeleteData(ids: string[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}${DICT_PREFIX}/data/batch`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('auth_token') || '',
      },
      body: JSON.stringify(ids.map(Number)),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '删除字典数据失败');
    }

    const result: ApiResponse<unknown> = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '删除字典数据失败');
    }
  }
}

export const dictAPI = new DictionaryAPI();
