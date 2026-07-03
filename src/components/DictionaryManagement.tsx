import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Search, Plus, ChevronDown, ChevronRight, ChevronLeft,
  Pencil, Trash2, Tags, Ban,
  FolderPlus, FolderTree, X, RefreshCw,
} from 'lucide-react';
import { DictionaryType, DictionaryItem } from '../types';
import { dictAPI, type DictTypeRequest, type DictDataRequest } from '../api/dictApi';
import { toast } from '../utils/toastHelpers';
import { ConfirmModal } from './ConfirmModal';

interface TypeTreeNode extends DictionaryType {
  children: TypeTreeNode[];
}

type TypeModalState =
  | { mode: 'create-root' }
  | { mode: 'create-child'; parentId: string }
  | { mode: 'edit'; typeId: string };

type ItemModalState =
  | { mode: 'create' }
  | { mode: 'edit'; item: DictionaryItem };

interface ConfirmState {
  title: string;
  message: string;
  details?: string[];
  onConfirm: () => void;
}

export function DictionaryManagement() {
  const [types, setTypes] = useState<DictionaryType[]>([]);
  const [items, setItems] = useState<DictionaryItem[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [typesLoading, setTypesLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);

  const [typeSearch, setTypeSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [typeModal, setTypeModal] = useState<TypeModalState | null>(null);
  const [itemModal, setItemModal] = useState<ItemModalState | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  const [typeName, setTypeName] = useState('');
  const [typeCode, setTypeCode] = useState('');
  const [typeDesc, setTypeDesc] = useState('');
  const [itemLabel, setItemLabel] = useState('');
  const [itemValue, setItemValue] = useState('');
  const [itemSort, setItemSort] = useState<string>('0');
  const [itemDesc, setItemDesc] = useState('');
  const [formError, setFormError] = useState('');

  // 加载字典类型列表
  const fetchTypes = useCallback(async () => {
    try {
      setTypesLoading(true);
      const list = await dictAPI.getTypeTree();
      setTypes(list);
      setExpandedIds((prev) => {
        const next = new Set(prev);
        list.filter((t) => !t.parentId).forEach((t) => next.add(t.id));
        return next;
      });
      setSelectedTypeId((cur) => cur ?? list.find((t) => !t.parentId)?.id ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '加载字典类型失败', 5000);
    } finally {
      setTypesLoading(false);
    }
  }, []);

  // 加载指定类型编码下的全部字典项
  const fetchItems = useCallback(async (code: string) => {
    try {
      setItemsLoading(true);
      const list = await dictAPI.getDataByCode(code);
      setItems(list);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '加载字典数据失败', 5000);
      setItems([]);
    } finally {
      setItemsLoading(false);
    }
  }, []);

  // 初始加载类型（用 ref 规避 StrictMode 下的重复请求）
  const typesInitialized = useRef(false);
  useEffect(() => {
    if (typesInitialized.current) return;
    typesInitialized.current = true;
    fetchTypes();
  }, [fetchTypes]);

  const selectedType = types.find((t) => t.id === selectedTypeId) ?? null;
  // 用 ref 读取最新 types，使下方 effect 仅依赖 selectedTypeId，
  // 避免类型内容编辑（本地更新 types）误触发字典项重新请求
  const typesRef = useRef(types);
  typesRef.current = types;

  // 仅在选中的类型切换时加载该类型字典项
  useEffect(() => {
    const t = typesRef.current.find((x) => x.id === selectedTypeId) ?? null;
    if (t && t.enabled) {
      setPage(1);
      fetchItems(t.code);
    } else {
      setItems([]);
    }
  }, [selectedTypeId, fetchItems]);

  // 构建多级树
  const tree = useMemo<TypeTreeNode[]>(() => {
    const map = new Map<string, TypeTreeNode>();
    types.forEach((t) => map.set(t.id, { ...t, children: [] }));
    const roots: TypeTreeNode[] = [];
    types.forEach((t) => {
      const node = map.get(t.id)!;
      if (t.parentId && map.has(t.parentId)) {
        map.get(t.parentId)!.children.push(node);
      } else if (!t.parentId) {
        roots.push(node);
      }
    });
    const sortFn = (a: TypeTreeNode, b: TypeTreeNode) =>
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name);
    const sortRec = (n: TypeTreeNode) => {
      n.children.sort(sortFn);
      n.children.forEach(sortRec);
    };
    roots.sort(sortFn);
    roots.forEach(sortRec);
    return roots;
  }, [types]);

  // 类型搜索：匹配节点 + 需展开的祖先
  const { matchedIds, searchExpanded } = useMemo(() => {
    if (!typeSearch.trim()) return { matchedIds: null as Set<string> | null, searchExpanded: new Set<string>() };
    const kw = typeSearch.trim().toLowerCase();
    const matched = new Set<string>();
    const mark = (node: TypeTreeNode): boolean => {
      const self = node.name.toLowerCase().includes(kw) || node.code.toLowerCase().includes(kw);
      let childHit = false;
      for (const c of node.children) if (mark(c)) childHit = true;
      if (self || childHit) {
        matched.add(node.id);
        return true;
      }
      return false;
    };
    tree.forEach(mark);
    const expand = new Set<string>();
    const collect = (node: TypeTreeNode, ancestors: string[]) => {
      if (matched.has(node.id)) ancestors.forEach((id) => expand.add(id));
      for (const c of node.children) collect(c, [...ancestors, node.id]);
    };
    tree.forEach((n) => collect(n, []));
    return { matchedIds: matched, searchExpanded: expand };
  }, [tree, typeSearch]);

  const effectiveExpanded = useMemo(() => {
    if (!typeSearch.trim()) return expandedIds;
    const next = new Set(expandedIds);
    searchExpanded.forEach((id) => next.add(id));
    return next;
  }, [expandedIds, searchExpanded, typeSearch]);

  // 过滤 + 排序
  const filteredItems = useMemo(() => {
    if (!selectedTypeId) return [];
    const t = types.find((x) => x.id === selectedTypeId);
    if (!t || !t.enabled) return [];
    let list = items
      .filter((i) => i.typeId === selectedTypeId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    if (itemSearch.trim()) {
      const kw = itemSearch.trim().toLowerCase();
      list = list.filter(
        (i) =>
          i.label.toLowerCase().includes(kw) ||
          i.value.toLowerCase().includes(kw) ||
          (i.description?.toLowerCase().includes(kw) ?? false),
      );
    }
    return list;
  }, [items, selectedTypeId, types, itemSearch]);

  const total = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const pageItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const highlight = (text: string): ReactNode => {
    const kw = typeSearch.trim().toLowerCase();
    if (!kw) return text;
    const idx = text.toLowerCase().indexOf(kw);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="bg-yellow-200 text-gray-800 rounded px-0.5 font-medium">
          {text.slice(idx, idx + kw.length)}
        </span>
        {text.slice(idx + kw.length)}
      </>
    );
  };

  // —— 类型操作 ——
  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectType = (id: string) => {
    setSelectedTypeId(id);
    setPage(1);
  };

  const openCreateRootType = () => {
    setTypeName('');
    setTypeCode('');
    setTypeDesc('');
    setFormError('');
    setTypeModal({ mode: 'create-root' });
  };

  const openCreateChildType = (parentId: string) => {
    setTypeName('');
    setTypeCode('');
    setTypeDesc('');
    setFormError('');
    setTypeModal({ mode: 'create-child', parentId });
  };

  const openEditType = (t: DictionaryType) => {
    setTypeName(t.name);
    setTypeCode(t.code);
    setTypeDesc(t.description || '');
    setFormError('');
    setTypeModal({ mode: 'edit', typeId: t.id });
  };

  const saveType = async () => {
    if (!typeModal) return;
    const name = typeName.trim();
    const code = typeCode.trim();
    if (!name || !code) {
      toast.error('名称和编码不能为空', 3000);
      return;
    }
    const isEdit = typeModal.mode === 'edit';
    const originParentId = isEdit
      ? types.find((t) => t.id === typeModal.typeId)?.parentId
      : undefined;
    const payload: DictTypeRequest = {
      name,
      code,
      description: typeDesc.trim() || undefined,
      parentId:
        typeModal.mode === 'create-child' ? typeModal.parentId : originParentId ?? null,
    };
    try {
      setFormError('');
      if (isEdit) {
        const updated = await dictAPI.updateType(typeModal.typeId, payload);
        setTypes((prev) => prev.map((t) => (t.id === typeModal.typeId ? updated : t)));
      } else {
        const created = await dictAPI.createType(payload);
        setTypes((prev) => [...prev, created]);
        if (typeModal.mode === 'create-child') {
          const pid = typeModal.parentId;
          setExpandedIds((prev) => new Set(prev).add(pid));
        }
      }
      setTypeModal(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '保存失败', 5000);
    }
  };

  const toggleTypeEnabled = async (id: string) => {
    const t = types.find((x) => x.id === id);
    if (!t) return;
    const nextStatus = t.enabled ? 0 : 1;
    try {
      // 后端在变更父节点状态时会级联更新所有子节点，前端只需调用一次
      await dictAPI.updateTypeStatus(id, nextStatus);
      // 本地将该节点及其所有子孙节点的状态同步刷新，保持 UI 与后端一致
      const collectDescendants = (pid: string): string[] => {
        const direct = types.filter((x) => x.parentId === pid).map((x) => x.id);
        return [...direct, ...direct.flatMap(collectDescendants)];
      };
      const ids = [id, ...collectDescendants(id)];
      setTypes((prev) =>
        prev.map((x) => (ids.includes(x.id) ? { ...x, enabled: nextStatus === 1 } : x)),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新状态失败', 5000);
    }
  };

  const deleteType = (id: string) => {
    const type = types.find((t) => t.id === id);
    if (!type) return;
    const collectDescendants = (pid: string): string[] => {
      const direct = types.filter((t) => t.parentId === pid).map((t) => t.id);
      return [...direct, ...direct.flatMap(collectDescendants)];
    };
    const ids = [id, ...collectDescendants(id)];
    const childCount = ids.length - 1;
    const itemCount = items.filter((i) => ids.includes(i.typeId)).length;
    setConfirm({
      title: '删除字典类型',
      message: `确定删除类型"${type.name}"？`,
      details: [
        ...(childCount > 0 ? [`包含 ${childCount} 个子类型`] : []),
        ...(itemCount > 0 ? [`包含 ${itemCount} 个字典项`] : []),
        '删除后不可恢复',
      ],
      onConfirm: async () => {
        try {
          await dictAPI.batchDeleteTypes(ids);
          setConfirm(null);
          // 本地剔除被删节点及其子孙，不再整表刷新
          setTypes((prev) => prev.filter((t) => !ids.includes(t.id)));
          setSelectedTypeId((cur) => (cur && ids.includes(cur) ? null : cur));
        } catch (err) {
          toast.error(err instanceof Error ? err.message : '删除失败', 5000);
          setConfirm(null);
        }
      },
    });
  };

  // —— 字典项操作 ——
  const openCreateItem = () => {
    if (!selectedType?.enabled) return;
    setItemLabel('');
    setItemValue('');
    setItemSort('0');
    setItemDesc('');
    setFormError('');
    setItemModal({ mode: 'create' });
  };

  const openEditItem = (item: DictionaryItem) => {
    setItemLabel(item.label);
    setItemValue(item.value);
    setItemSort(String(item.sortOrder));
    setItemDesc(item.description || '');
    setFormError('');
    setItemModal({ mode: 'edit', item });
  };

  const saveItem = async () => {
    if (!itemModal || !selectedTypeId) return;
    const label = itemLabel.trim();
    const value = itemValue.trim();
    if (!label || !value) {
      toast.error('键和值不能为空', 3000);
      return;
    }
    const payload: DictDataRequest = {
      typeId: selectedTypeId,
      label,
      value,
      sortOrder: Number(itemSort) || 0,
      description: itemDesc.trim() || undefined,
    };
    try {
      setFormError('');
      if (itemModal.mode === 'edit') {
        const updated = await dictAPI.updateData(itemModal.item.id, payload);
        setItems((prev) => prev.map((i) => (i.id === itemModal.item.id ? updated : i)));
      } else {
        const created = await dictAPI.createData(payload);
        setItems((prev) => [...prev, created]);
      }
      setItemModal(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '保存失败', 5000);
    }
  };

  const deleteItem = (item: DictionaryItem) => {
    setConfirm({
      title: '删除字典项',
      message: `确认删除字典项"${item.label}"吗？`,
      onConfirm: async () => {
        try {
          await dictAPI.batchDeleteData([item.id]);
          setConfirm(null);
          if (selectedType) await fetchItems(selectedType.code);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : '删除失败', 5000);
          setConfirm(null);
        }
      },
    });
  };

  // 递归渲染树节点
  const renderNode = (node: TypeTreeNode, depth: number): ReactNode => {
    const visible = !matchedIds || matchedIds.has(node.id);
    if (!visible) return null;
    const hasChildren = node.children.length > 0;
    const isExpanded = effectiveExpanded.has(node.id);
    const isActive = selectedTypeId === node.id;
    return (
      <div key={node.id}>
        <div
          className={`group flex items-center justify-between pr-2 py-1.5 rounded-sm cursor-pointer transition-colors border-l-2 ${
            isActive ? 'bg-blue-50 border-blue-500' : 'border-transparent hover:bg-gray-50'
          }`}
          style={{ paddingLeft: `${depth * 16 + 6}px` }}
          onClick={() => selectType(node.id)}
        >
          <div className="flex items-center min-w-0 flex-1">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(node.id);
                }}
                className="mr-1 p-0.5 text-gray-400 hover:text-gray-700 shrink-0"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <span className="inline-block w-5 shrink-0" />
            )}
            <span className="text-sm font-medium text-gray-700 truncate">{highlight(node.name)}</span>
            <span className="ml-2 text-xs text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded font-mono shrink-0">
              {highlight(node.code)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleTypeEnabled(node.id);
              }}
              title={node.enabled ? '点击禁用' : '点击启用'}
              className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors shrink-0 ml-2 ${
                node.enabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  node.enabled ? 'translate-x-3.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              title="新增子类型"
              onClick={(e) => {
                e.stopPropagation();
                openCreateChildType(node.id);
              }}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded"
            >
              <FolderPlus className="w-5 h-5" />
            </button>
            <button
              title="编辑"
              onClick={(e) => {
                e.stopPropagation();
                openEditType(node);
              }}
              className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded"
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button
              title="删除"
              onClick={(e) => {
                e.stopPropagation();
                deleteType(node.id);
              }}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        {hasChildren && isExpanded && node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  // 表格内容
  let tableBody: ReactNode;
  if (itemsLoading) {
    tableBody = (
      <tr>
        <td colSpan={5} className="p-12 text-center text-sm text-gray-400">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            加载中...
          </div>
        </td>
      </tr>
    );
  } else if (!selectedTypeId) {
    tableBody = (
      <tr>
        <td colSpan={5} className="p-12 text-center text-sm text-gray-400">
          请从左侧选择一个字典类型
        </td>
      </tr>
    );
  } else if (!selectedType?.enabled) {
    tableBody = (
      <tr>
        <td colSpan={5} className="p-12 text-center text-sm text-gray-400">
          <Ban className="w-6 h-6 mx-auto mb-2 text-gray-300" />
          当前字典类型已禁用，请先启用类型后再管理字典项
        </td>
      </tr>
    );
  } else if (pageItems.length === 0) {
    tableBody = (
      <tr>
        <td colSpan={5} className="p-12 text-center text-sm text-gray-400">
          暂无字典项，点击"新增字典项"添加
        </td>
      </tr>
    );
  } else {
    tableBody = pageItems.map((item) => (
      <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
        <td className="p-4 text-center text-gray-700 font-medium">{item.label}</td>
        <td className="p-4 text-center">
          <code className="text-gray-600 bg-gray-50 px-2 py-0.5 rounded text-sm">{item.value}</code>
        </td>
        <td className="p-4 text-center text-gray-700">{item.sortOrder}</td>
        <td className="p-4 text-center text-gray-700">{item.description || '-'}</td>
        <td className="p-4">
          <div className="flex justify-center gap-4">
            <button onClick={() => openEditItem(item)} className="text-emerald-500 hover:text-emerald-700 text-sm">
              编辑
            </button>
            <button onClick={() => deleteItem(item)} className="text-red-500 hover:text-red-700 text-sm">
              删除
            </button>
          </div>
        </td>
      </tr>
    ));
  }

  return (
    <div className="flex-1 flex flex-col p-8 overflow-hidden">
      {/* 标题 */}
      <div className="flex items-center mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-gray-800 mr-3">字典管理</h2>
        <div className="group relative w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs cursor-pointer">
          i
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-52 p-2 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-center font-normal">
            管理系统中的字典类型与字典项，支持多级分类、搜索与启用控制。
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
          </div>
        </div>
      </div>

      {/* 左右两栏 */}
      <div className="flex gap-0 flex-1 min-h-0">
        {/* 左侧：字典类型树 */}
        <div className="w-[480px] bg-white rounded-sm shadow-sm border border-gray-200 flex flex-col shrink-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
            <h3 className="text-base font-semibold text-gray-800 flex items-center">
              <FolderTree className="w-4 h-4 mr-2 text-blue-500" />
              字典类型
            </h3>
            <button
              onClick={openCreateRootType}
              className="bg-blue-500 text-white px-4 py-2 rounded text-sm flex items-center hover:bg-blue-600 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              新增
            </button>
          </div>
          <div className="p-3 border-b border-gray-100 shrink-0">
            <div className="relative">
              <input
                value={typeSearch}
                onChange={(e) => setTypeSearch(e.target.value)}
                placeholder="搜索类型名称或编码"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {typesLoading ? (
              <div className="p-8 flex items-center justify-center text-sm text-gray-400">
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                加载中...
              </div>
            ) : tree.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">暂无字典类型，点击"新增"创建</div>
            ) : (
              tree.map((node) => renderNode(node, 0))
            )}
          </div>
        </div>

        {/* 右侧：字典项管理 */}
        <div className="flex-1 bg-white rounded-sm shadow-sm border border-gray-200 flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 shrink-0">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gray-800 flex items-center">
                <Tags className="w-4 h-4 mr-2 text-blue-500 shrink-0" />
                <span className="truncate">{selectedType ? selectedType.name : '未选择类型'}</span>
                {selectedType && !selectedType.enabled && (
                  <span className="ml-2 text-xs text-red-500 font-normal">（已禁用）</span>
                )}
              </h3>
              {selectedType && (
                <p className="text-sm text-gray-500 mt-1 ml-6 truncate">
                  <span className="font-mono">{selectedType.code}</span> · {selectedType.description || '无描述'}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <input
                  value={itemSearch}
                  onChange={(e) => {
                    setItemSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="搜索键/值/描述"
                  disabled={!selectedType?.enabled}
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-full text-sm w-56 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400"
                />
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              </div>
              <button
                onClick={openCreateItem}
                disabled={!selectedType?.enabled}
                className="bg-blue-500 text-white px-4 py-2 rounded text-sm flex items-center hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                新增字典项
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="p-4 font-medium text-center">键 (label)</th>
                  <th className="p-4 font-medium text-center">值 (value)</th>
                  <th className="p-4 font-medium text-center">排序</th>
                  <th className="p-4 font-medium text-center">描述</th>
                  <th className="p-4 font-medium text-center w-32">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">{tableBody}</tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 px-4 py-3 flex justify-between items-center shrink-0">
            <span className="text-sm text-gray-400">共 {total} 条记录</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center text-sm text-gray-500">
                每页
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="mx-2 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                条
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={currentPage >= totalPages}
                  className="p-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 字典类型模态框 */}
      {typeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-[480px] rounded-sm shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-800">
                {typeModal.mode === 'edit'
                  ? '编辑字典类型'
                  : typeModal.mode === 'create-child'
                    ? '新增子类型'
                    : '新增字典类型'}
              </h2>
              <button onClick={() => setTypeModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block mb-2 text-sm text-gray-700">
                  <span className="text-red-500 mr-1">*</span>类型名称
                </label>
                <input
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  placeholder="例如：性别"
                  maxLength={64}
                  autoComplete="off"
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm text-gray-700">
                  <span className="text-red-500 mr-1">*</span>类型编码
                </label>
                <input
                  value={typeCode}
                  onChange={(e) => setTypeCode(e.target.value)}
                  placeholder="唯一标识，如 gender"
                  maxLength={64}
                  autoComplete="off"
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm text-gray-700">描述</label>
                <textarea
                  value={typeDesc}
                  onChange={(e) => setTypeDesc(e.target.value)}
                  autoComplete="off"
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 min-h-[64px] resize-y"
                />
              </div>
              {formError && <p className="text-sm text-red-500">{formError}</p>}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setTypeModal(null)}
                className="bg-white text-gray-600 border border-gray-300 px-6 py-2 rounded-sm text-sm font-medium hover:bg-gray-50 shadow-sm"
              >
                取消
              </button>
              <button
                onClick={saveType}
                className="bg-blue-500 text-white px-6 py-2 rounded-sm text-sm font-medium hover:bg-blue-600 shadow-sm"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 字典项模态框 */}
      {itemModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-[480px] rounded-sm shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-800">
                {itemModal.mode === 'edit' ? '编辑字典项' : '新增字典项'}
              </h2>
              <button onClick={() => setItemModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block mb-2 text-sm text-gray-700">
                  <span className="text-red-500 mr-1">*</span>键 (label)
                </label>
                <input
                  value={itemLabel}
                  onChange={(e) => setItemLabel(e.target.value)}
                  autoComplete="off"
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm text-gray-700">
                  <span className="text-red-500 mr-1">*</span>值 (value)
                </label>
                <input
                  value={itemValue}
                  onChange={(e) => setItemValue(e.target.value)}
                  autoComplete="off"
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm text-gray-700">排序</label>
                <input
                  type="number"
                  value={itemSort}
                  onChange={(e) => setItemSort(e.target.value)}
                  autoComplete="off"
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm text-gray-700">描述</label>
                <input
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  autoComplete="off"
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>
              {formError && <p className="text-sm text-red-500">{formError}</p>}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setItemModal(null)}
                className="bg-white text-gray-600 border border-gray-300 px-6 py-2 rounded-sm text-sm font-medium hover:bg-gray-50 shadow-sm"
              >
                取消
              </button>
              <button
                onClick={saveItem}
                className="bg-blue-500 text-white px-6 py-2 rounded-sm text-sm font-medium hover:bg-blue-600 shadow-sm"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirm}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        type="danger"
        confirmText="删除"
        details={confirm?.details}
        onCancel={() => setConfirm(null)}
        onConfirm={() => confirm?.onConfirm()}
      />
    </div>
  );
}
