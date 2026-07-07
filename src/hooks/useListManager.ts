/**
 * 通用列表管理 Hook
 * 统一列表组件的状态管理和操作逻辑
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from '../utils/toastHelpers';

export interface ListManagerOptions<T> {
  // 数据加载函数
  fetchData: (params: { current: number; size: number; keyword?: string }) => Promise<{
    records: T[];
    total: string | number;
    current: string | number;
    size: string | number;
    pages: string | number;
  }>;
  // 数据转换函数（可选）
  transform?: (item: any) => T;
  // 删除函数（可选）
  deleteItem?: (id: string | number) => Promise<void>;
  // 批量删除函数（可选）
  batchDelete?: (ids: (string | number)[]) => Promise<void>;
  // 更新状态函数（可选）
  updateStatus?: (id: string | number, status: number) => Promise<void>;
  // 批量更新状态函数（可选）
  batchUpdateStatus?: (ids: (string | number)[], status: number) => Promise<void>;
  // 每页大小（默认10）
  pageSize?: number;
}

export interface ListManagerReturn<T> {
  // 状态
  items: T[];
  loading: boolean;
  keyword: string;
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
  selectedIds: Set<number | string>;

  // 确认对话框状态
  showDeleteConfirm: boolean;
  showBatchDeleteConfirm: boolean;
  showBatchEnableConfirm: boolean;
  showBatchDisableConfirm: boolean;
  deleteTargetId: number | string | null;

  // 操作方法
  setKeyword: (keyword: string) => void;
  handleSearch: () => void;
  handleRefresh: () => void;
  setCurrentPage: (page: number) => void;
  handleSelectAll: (checked: boolean) => void;
  handleSelectItem: (id: number | string, checked: boolean) => void;
  handleDeleteItem: (id: number | string) => void;
  confirmDeleteItem: () => void;
  cancelDeleteItem: () => void;
  handleBatchDelete: () => void;
  confirmBatchDelete: () => void;
  cancelBatchDelete: () => void;
  handleBatchEnable: () => void;
  confirmBatchEnable: () => void;
  cancelBatchEnable: () => void;
  handleBatchDisable: () => void;
  confirmBatchDisable: () => void;
  cancelBatchDisable: () => void;
  handleToggleStatus: (item: T) => void;
  clearSelection: () => void;
}

/**
 * 通用列表管理 Hook
 * 提供列表加载、分页、搜索、选择、批量操作等功能的统一管理
 */
export function useListManager<T extends { id: number | string }>(
  options: ListManagerOptions<T>
): ListManagerReturn<T> {
  const {
    fetchData,
    transform,
    deleteItem,
    batchDelete,
    updateStatus,
    batchUpdateStatus,
    pageSize: initialPageSize = 10,
  } = options;

  // 列表数据状态
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set());

  // 确认对话框状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);
  const [showBatchEnableConfirm, setShowBatchEnableConfirm] = useState(false);
  const [showBatchDisableConfirm, setShowBatchDisableConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | string | null>(null);

  // 搜索提交计数器
  const [searchNonce, setSearchNonce] = useState(0);

  // 防止重复请求
  const lastFetchKey = useRef<string | null>(null);

  // 加载数据
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const fetchKey = `${currentPage}-${pageSize}-${keyword}-${searchNonce}`;
      if (lastFetchKey.current === fetchKey) {
        return; // 避免重复请求
      }
      lastFetchKey.current = fetchKey;

      const response = await fetchData({
        current: currentPage,
        size: pageSize,
        keyword: keyword || undefined,
      });

      // 转换数据
      const transformedItems: T[] = (response.records || [])
        .filter(item => item != null)
        .map(item => transform ? transform(item) : item);

      setItems(transformedItems);
      setTotal(Number(response.total) || 0);
      setTotalPages(Number(response.pages) || 0);
    } catch (error) {
      console.error('加载数据失败:', error);
      const errorMessage = error instanceof Error ? error.message : '加载数据失败';
      toast.error(errorMessage, 5000);
    } finally {
      setLoading(false);
    }
  }, [fetchData, transform, currentPage, pageSize, keyword, searchNonce]);

  // 初始化加载和依赖变化时重新加载
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 搜索
  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    setSearchNonce(n => n + 1);
  }, []);

  // 刷新
  const handleRefresh = useCallback(() => {
    loadData();
  }, [loadData]);

  // 全选/取消全选
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(items.map(item => item.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [items]);

  // 选择单个项目
  const handleSelectItem = useCallback((id: number | string, checked: boolean) => {
    setSelectedIds(prev => {
      const newSelected = new Set(prev);
      if (checked) {
        newSelected.add(id);
      } else {
        newSelected.delete(id);
      }
      return newSelected;
    });
  }, []);

  // 删除单个项目
  const handleDeleteItem = useCallback((id: number | string) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  }, []);

  // 确认删除单个项目
  const confirmDeleteItem = useCallback(async () => {
    if (!deleteItem || deleteTargetId === null) return;

    try {
      await deleteItem(deleteTargetId);
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
      loadData(); // 重新加载数据
    } catch (error) {
      console.error('删除失败:', error);
      const errorMessage = error instanceof Error ? error.message : '删除失败';
      toast.error(errorMessage, 5000);
    }
  }, [deleteItem, deleteTargetId, loadData]);

  // 取消删除单个项目
  const cancelDeleteItem = useCallback(() => {
    setShowDeleteConfirm(false);
    setDeleteTargetId(null);
  }, []);

  // 批量删除
  const handleBatchDelete = useCallback(() => {
    if (selectedIds.size === 0) {
      toast.warning('请先选择要删除的项目', 3000);
      return;
    }
    setShowBatchDeleteConfirm(true);
  }, [selectedIds]);

  // 确认批量删除
  const confirmBatchDelete = useCallback(async () => {
    if (!batchDelete) return;

    try {
      await batchDelete(Array.from(selectedIds));
      setShowBatchDeleteConfirm(false);
      setSelectedIds(new Set());
      loadData(); // 重新加载数据
    } catch (error) {
      console.error('批量删除失败:', error);
      const errorMessage = error instanceof Error ? error.message : '批量删除失败';
      toast.error(errorMessage, 5000);
    }
  }, [batchDelete, selectedIds, loadData]);

  // 取消批量删除
  const cancelBatchDelete = useCallback(() => {
    setShowBatchDeleteConfirm(false);
  }, []);

  // 批量启用
  const handleBatchEnable = useCallback(() => {
    if (selectedIds.size === 0) {
      toast.warning('请先选择要启用的项目', 3000);
      return;
    }
    setShowBatchEnableConfirm(true);
  }, [selectedIds]);

  // 确认批量启用
  const confirmBatchEnable = useCallback(async () => {
    if (!batchUpdateStatus) return;

    try {
      // 乐观更新UI
      setItems(prevItems =>
        prevItems.map(item =>
          selectedIds.has(item.id) ? { ...item, status: true as any } : item
        )
      );

      await batchUpdateStatus(Array.from(selectedIds), 1);
      setShowBatchEnableConfirm(false);
      setSelectedIds(new Set());
      loadData(); // 重新加载数据以确保一致性
    } catch (error) {
      console.error('批量启用失败:', error);
      const errorMessage = error instanceof Error ? error.message : '批量启用失败';
      toast.error(errorMessage, 5000);
      loadData(); // 出错时重新加载数据以恢复状态
    }
  }, [batchUpdateStatus, selectedIds, loadData]);

  // 取消批量启用
  const cancelBatchEnable = useCallback(() => {
    setShowBatchEnableConfirm(false);
  }, []);

  // 批量禁用
  const handleBatchDisable = useCallback(() => {
    if (selectedIds.size === 0) {
      toast.warning('请先选择要禁用的项目', 3000);
      return;
    }
    setShowBatchDisableConfirm(true);
  }, [selectedIds]);

  // 确认批量禁用
  const confirmBatchDisable = useCallback(async () => {
    if (!batchUpdateStatus) return;

    try {
      // 乐观更新UI
      setItems(prevItems =>
        prevItems.map(item =>
          selectedIds.has(item.id) ? { ...item, status: false as any } : item
        )
      );

      await batchUpdateStatus(Array.from(selectedIds), 0);
      setShowBatchDisableConfirm(false);
      setSelectedIds(new Set());
      loadData(); // 重新加载数据以确保一致性
    } catch (error) {
      console.error('批量禁用失败:', error);
      const errorMessage = error instanceof Error ? error.message : '批量禁用失败';
      toast.error(errorMessage, 5000);
      loadData(); // 出错时重新加载数据以恢复状态
    }
  }, [batchUpdateStatus, selectedIds, loadData]);

  // 取消批量禁用
  const cancelBatchDisable = useCallback(() => {
    setShowBatchDisableConfirm(false);
  }, []);

  // 切换单个项目状态
  const handleToggleStatus = useCallback(async (item: T) => {
    if (!updateStatus) return;

    try {
      const newStatus = (item as any).status ? 0 : 1;
      await updateStatus(item.id, newStatus);

      // 乐观更新UI
      setItems(prevItems =>
        prevItems.map(i =>
          i.id === item.id ? { ...i, status: !((i as any).status) } : i
        )
      );
    } catch (error) {
      console.error('更新状态失败:', error);
      const errorMessage = error instanceof Error ? error.message : '更新状态失败';
      toast.error(errorMessage, 5000);
      loadData(); // 出错时重新加载数据
    }
  }, [updateStatus, loadData]);

  // 清空选择
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    // 状态
    items,
    loading,
    keyword,
    currentPage,
    pageSize,
    total,
    totalPages,
    selectedIds,
    showDeleteConfirm,
    showBatchDeleteConfirm,
    showBatchEnableConfirm,
    showBatchDisableConfirm,
    deleteTargetId,

    // 操作方法
    setKeyword,
    handleSearch,
    handleRefresh,
    setCurrentPage,
    handleSelectAll,
    handleSelectItem,
    handleDeleteItem,
    confirmDeleteItem,
    cancelDeleteItem,
    handleBatchDelete,
    confirmBatchDelete,
    cancelBatchDelete,
    handleBatchEnable,
    confirmBatchEnable,
    cancelBatchEnable,
    handleBatchDisable,
    confirmBatchDisable,
    cancelBatchDisable,
    handleToggleStatus,
    clearSelection,
  };
}
