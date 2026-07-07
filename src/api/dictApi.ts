/**
 * 字典管理 API 接口
 * 基于 DictController API 文档实现
 * 使用统一的API调用方式
 * 基础路径：/admin/dict
 */

import { get, post, put, del } from './index';
import { DictionaryType, DictionaryItem } from '../types';

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

/**
 * 字典API类
 * 使用统一的API调用函数
 */
class DictionaryAPI {
  /**
   * 查询字典类型树形结构（扁平化后返回，保留 parentId）
   */
  async getTypeTree(): Promise<DictionaryType[]> {
    const data = await get<DictTypeTreeResponse[]>(`${DICT_PREFIX}/types/tree`);
    return flattenTree(data || []);
  }

  /**
   * 创建字典类型
   */
  async createType(payload: DictTypeRequest): Promise<DictionaryType> {
    const data = await post<DictTypeResponse>(`${DICT_PREFIX}/types`, typeToBody(payload));
    return mapType(data);
  }

  /**
   * 更新字典类型
   */
  async updateType(id: string, payload: DictTypeRequest): Promise<DictionaryType> {
    const data = await put<DictTypeResponse>(`${DICT_PREFIX}/types/${Number(id)}`, typeToBody(payload));
    return mapType(data);
  }

  /**
   * 更新字典类型状态（启用/禁用）
   */
  async updateTypeStatus(id: string, status: number): Promise<void> {
    return put<void>(`${DICT_PREFIX}/types/${Number(id)}/status`, { status });
  }

  /**
   * 批量删除字典类型（文档未提供单删，单个删除也走 batch）
   * DELETE /admin/dict/types/batch
   */
  async batchDeleteTypes(ids: string[]): Promise<void> {
    const response = await fetch(`/api${DICT_PREFIX}/types/batch`, {
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

    const result = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '删除字典类型失败');
    }
  }

  /**
   * 根据字典类型编码查询该类型全部字典数据
   * GET /admin/dict/data/getDictDataByCode?dictCode={code}
   */
  async getDataByCode(code: string): Promise<DictionaryItem[]> {
    const data = await get<DictDataResponse[]>(`${DICT_PREFIX}/data/getDictDataByCode`, { dictCode: code });
    return (data || []).map(mapItem);
  }

  /**
   * 创建字典数据
   */
  async createData(payload: DictDataRequest): Promise<DictionaryItem> {
    const data = await post<DictDataResponse>(`${DICT_PREFIX}/data`, dataToBody(payload));
    return mapItem(data);
  }

  /**
   * 更新字典数据
   */
  async updateData(id: string, payload: DictDataRequest): Promise<DictionaryItem> {
    const data = await put<DictDataResponse>(`${DICT_PREFIX}/data/${Number(id)}`, dataToBody(payload));
    return mapItem(data);
  }

  /**
   * 批量删除字典数据（单个删除也走 batch）
   * DELETE /admin/dict/data/batch
   */
  async batchDeleteData(ids: string[]): Promise<void> {
    const response = await fetch(`/api${DICT_PREFIX}/data/batch`, {
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

    const result = await response.json();
    if (result.code !== 200) {
      throw new Error(result.message || '删除字典数据失败');
    }
  }
}

export const dictAPI = new DictionaryAPI();
