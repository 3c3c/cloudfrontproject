import { useState, useEffect, useCallback, useRef } from 'react';
import { PermissionList } from './PermissionList';
import { PermissionModal } from './PermissionModals';
import { permissionAPI, PermissionRequest } from '../api/permissionApi';
import { ConfirmModal } from './ConfirmModal';
import { toast } from '../utils/toastHelpers';
import { dictAPI } from '../api/dictApi';
import type { Permission } from '../types';

interface PermissionManagementProps {
  refreshKey?: number;
}

export function PermissionManagement({
  refreshKey,
}: PermissionManagementProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeletePermission, setPendingDeletePermission] = useState<Permission | null>(null);
  const [pagination, setPagination] = useState({ current: 1, size: 10, total: 0, pages: 0 });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [serviceOptions, setServiceOptions] = useState<Array<{ value: string; label: string }>>([]);
  const isLoadingData = useRef(false);
  const lastRefreshKey = useRef(0);
  const searchKeywordRef = useRef(searchKeyword);
  const paginationRef = useRef(pagination);
  const pendingExpandParentId = useRef<number | null>(null); // 待展开的父节点ID
  const pendingSearchExpand = useRef<{ keyword: string; executed: boolean } | null>(null); // 待执行的搜索展开

  // 弹窗状态管理
  const [modalState, setModalState] = useState<{
    type: 'createPermission' | 'editPermission' | 'createChildPermission' | 'none';
    permission?: Permission;
    parentPermission?: Permission;
  }>({ type: 'none' });

  // 展开状态管理
  const [expandedKeys, setExpandedKeys] = useState<Set<number>>(new Set());

  // 切换节点展开状态
  const handleToggleExpand = (id: number) => {
    setExpandedKeys(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return newExpanded;
    });
  };

  // 保持 ref 同步
  useEffect(() => {
    searchKeywordRef.current = searchKeyword;
  }, [searchKeyword]);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  // 加载权限树（完全不依赖状态，使用 ref）
  const loadPermissions = useCallback(async (page?: number, pageSize?: number) => {
    // 防止重复调用
    if (isLoadingData.current) {
      return;
    }

    try {
      isLoadingData.current = true;
      setLoading(true);
      setError(null);

      // 使用 ref 中的值，而不是状态
      const actualPage = page ?? paginationRef.current.current;
      const actualPageSize = pageSize ?? paginationRef.current.size;

      const params: any = { current: actualPage, size: actualPageSize };
      if (searchKeywordRef.current) params.permName = searchKeywordRef.current;

      const result = await permissionAPI.getPermissionTree(params);
      setPermissions(result.records);

      // 确保分页数据类型正确（API可能返回字符串）
      setPagination({
        current: Number(result.current) || 1,
        size: Number(result.size) || 10,
        total: Number(result.total) || 0,
        pages: Number(result.pages) || Math.ceil((Number(result.total) || 0) / (Number(result.size) || 10))
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载权限失败');
      console.error('加载权限失败:', err);
    } finally {
      setLoading(false);
      isLoadingData.current = false;
    }
  }, []); // 空依赖数组，函数永远不会重新创建

  // 处理搜索
  const handleSearch = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
    setPagination(prev => ({ ...prev, current: 1 })); // 重置到第一页
  }, []);

  // 统一的数据加载逻辑
  useEffect(() => {
    // 防止重复调用
    if (lastRefreshKey.current === refreshKey) {
      return;
    }
    lastRefreshKey.current = refreshKey;

    loadPermissions();
  }, [refreshKey, loadPermissions]);

  // 查找包含关键词的节点及其所有父节点ID
  const findNodePathByKeyword = useCallback((nodes: Permission[], keyword: string): number[] => {
    const foundPaths: number[][] = [];

    const searchNode = (node: Permission, path: number[]): boolean => {
      const currentPath = [...path, node.id];

      // 检查当前节点是否包含关键词
      if (node.permName && node.permName.toLowerCase().includes(keyword.toLowerCase())) {
        foundPaths.push(currentPath);
        return true;
      }

      // 递归搜索子节点
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          if (searchNode(child, currentPath)) {
            return true; // 找到后停止搜索
          }
        }
      }

      return false;
    };

    // 搜索所有根节点
    for (const node of nodes) {
      if (searchNode(node, [])) {
        break; // 找到第一个匹配就停止
      }
    }

    // 返回第一个匹配路径的所有父节点ID（排除目标节点本身）
    return foundPaths.length > 0 ? foundPaths[0].slice(0, -1) : [];
  }, []);

  // 搜索或过滤条件变化时的处理（首次挂载时不执行）
  const isInitialMount = useRef(true);
  const prevSearchKeyword = useRef('');
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevSearchKeyword.current = searchKeywordRef.current;
      return; // 首次挂载时不执行
    }

    const currentKeyword = searchKeywordRef.current;
    const prevKeyword = prevSearchKeyword.current;

    // 如果有新的搜索关键词，设置待展开标记
    if (currentKeyword && currentKeyword !== prevKeyword) {
      pendingSearchExpand.current = { keyword: currentKeyword, executed: false };
    } else if (!currentKeyword && prevKeyword) {
      // 清空搜索时，清除展开状态和待展开标记
      pendingSearchExpand.current = null;
      setExpandedKeys(new Set());
    }

    // 搜索条件变化时重新加载
    loadPermissions(1, paginationRef.current.size);

    prevSearchKeyword.current = currentKeyword;
  }, [searchKeyword, loadPermissions]);

  // 加载产品服务字典数据（组件加载时只调用一次）
  const [loadingServiceOptions, setLoadingServiceOptions] = useState(true);

  useEffect(() => {
    const loadServiceOptions = async () => {
      try {
        setLoadingServiceOptions(true);
        const data = await dictAPI.getDataByCode('service_code');
        setServiceOptions(data.map(item => ({
          value: item.value,
          label: item.label
        })));
      } catch (error) {
        console.error('加载产品服务失败:', error);
        setServiceOptions([]);
      } finally {
        setLoadingServiceOptions(false);
      }
    };

    loadServiceOptions();
  }, []); // 空依赖数组，只执行一次

  // 当 pendingExpandParentId 变化时，自动展开父节点
  useEffect(() => {
    if (pendingExpandParentId.current !== null) {
      const parentId = pendingExpandParentId.current;
      setExpandedKeys(prev => {
        const newExpanded = new Set(prev);
        newExpanded.add(parentId);
        return newExpanded;
      });
      pendingExpandParentId.current = null; // 清除待展开的ID
    }
  }, [permissions]); // 依赖 permissions，确保权限树更新后再展开

  // 当权限数据更新且有待执行的搜索展开时，自动展开到匹配节点
  useEffect(() => {
    if (pendingSearchExpand.current && !pendingSearchExpand.current.executed && permissions.length > 0) {
      const { keyword } = pendingSearchExpand.current;
      const parentIds = findNodePathByKeyword(permissions, keyword);
      if (parentIds.length > 0) {
        setExpandedKeys(new Set(parentIds));
      }
      pendingSearchExpand.current = { keyword, executed: true };
    }
  }, [permissions, findNodePathByKeyword]);

  // 创建权限
  const handleCreatePermission = async (data: PermissionRequest) => {
    try {
      await permissionAPI.createPermission(data);
      return true;
    } catch (err) {
      console.error('创建权限失败:', err);
      throw err;
    }
  };

  // 更新权限
  const handleUpdatePermission = async (id: number, data: PermissionRequest) => {
    try {
      await permissionAPI.updatePermission(id, data);
      return true;
    } catch (err) {
      console.error('更新权限失败:', err);
      throw err;
    }
  };

  // 删除权限
  const handleDeletePermission = (id: number) => {
    // 查找要删除的权限
    const findPermission = (nodes: Permission[], targetId: number): Permission | null => {
      for (const node of nodes) {
        if (node.id === targetId) return node;
        if (node.children) {
          const found = findPermission(node.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    const permission = findPermission(permissions, id);
    if (permission) {
      setPendingDeletePermission(permission);
      setShowDeleteConfirm(true);
    }
  };

  // 确认删除权限
  const confirmDeletePermission = async () => {
    if (!pendingDeletePermission) return;

    try {
      await permissionAPI.deletePermission(pendingDeletePermission.id);

      // 本地删除权限树中的节点（包括所有子节点）
      deletePermissionFromLocalTree(pendingDeletePermission.id);

      setShowDeleteConfirm(false);
      setPendingDeletePermission(null);
    } catch (err) {
      console.error('删除权限失败:', err);
      const errorMessage = err instanceof Error ? err.message : '删除失败';
      toast.error(errorMessage, 5000);
      setShowDeleteConfirm(false);
      setPendingDeletePermission(null);
    }
  };

  // 更新权限状态（级联更新所有子节点）
  const handleUpdateEnabled = async (id: number, enabled: number) => {
    try {
      // 先调用API
      await permissionAPI.updatePermissionEnabled(id, enabled);

      // API成功后更新前端显示（级联更新所有子孙节点）
      const updateLocalState = (nodes: Permission[]): Permission[] => {
        return nodes.map(node => {
          // 如果是当前节点或其子孙节点，都更新状态
          if (node.id === id) {
            // 找到目标节点，更新它和所有子节点
            const updateNodeAndChildren = (n: Permission): Permission => {
              return {
                ...n,
                enabled,
                children: n.children ? n.children.map(updateNodeAndChildren) : undefined,
              };
            };
            return updateNodeAndChildren(node);
          }

          if (node.children) {
            return { ...node, children: updateLocalState(node.children) };
          }
          return node;
        });
      };

      setPermissions(updateLocalState(permissions));
    } catch (err) {
      console.error('更新权限状态失败:', err);
      const errorMessage = err instanceof Error ? err.message : '更新状态失败';
      toast.error(errorMessage, 5000);
    }
  };

  // 更新权限可见性
  const handleUpdateVisible = async (id: number, visible: number) => {
    try {
      await permissionAPI.updatePermissionVisible(id, visible);
    } catch (err) {
      console.error('更新权限可见性失败:', err);
      const errorMessage = err instanceof Error ? err.message : '更新可见性失败';
      toast.error(errorMessage, 5000);
    }
  };

  // 打开创建权限弹窗
  const handleOpenCreateModal = () => {
    setModalState({ type: 'createPermission' });
  };

  // 打开编辑权限弹窗
  const handleOpenEditModal = (permission: Permission) => {
    setModalState({ type: 'editPermission', permission });
  };

  // 打开创建子权限弹窗
  const handleOpenCreateChildModal = (parent: Permission) => {
    setModalState({ type: 'createChildPermission', parentPermission: parent });
  };

  // 关闭弹窗
  const handleCloseModal = () => {
    setModalState({ type: 'none' });
  };

  // 本地添加权限到树形结构
  const addPermissionToLocalTree = (newPermission: Permission, parentId?: number) => {
    // 如果是添加子权限，记录父节点ID用于后续展开
    if (parentId) {
      pendingExpandParentId.current = parentId;
    }

    setPermissions(prevPermissions => {
      const addToTree = (nodes: Permission[]): Permission[] => {
        return nodes.map(node => {
          // 如果是父节点，添加到其 children
          if (parentId && node.id === parentId) {
            return {
              ...node,
              children: [...(node.children || []), newPermission]
            };
          }
          // 递归检查子节点
          if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: addToTree(node.children)
            };
          }
          return node;
        });
      };

      // 如果没有 parentId，添加到根节点
      if (!parentId) {
        return [...prevPermissions, newPermission];
      }

      return addToTree(prevPermissions);
    });

    // 更新分页总数
    setPagination(prev => ({
      ...prev,
      total: prev.total + 1
    }));
  };

  // 本地更新权限
  const updatePermissionInLocalTree = (updatedPermission: Permission) => {
    setPermissions(prevPermissions => {
      const updateInTree = (nodes: Permission[]): Permission[] => {
        return nodes.map(node => {
          // 找到目标节点，更新它
          if (node.id === updatedPermission.id) {
            return {
              ...node,
              ...updatedPermission,
              children: node.children // 保持原有的 children 结构
            };
          }
          // 递归检查子节点
          if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: updateInTree(node.children)
            };
          }
          return node;
        });
      };

      return updateInTree(prevPermissions);
    });
  };

  // 本地删除权限从树形结构
  const deletePermissionFromLocalTree = (permissionId: number) => {
    // 用于记录需要折叠的父节点ID
    const parentIdsToCollapse: number[] = [];

    setPermissions(prevPermissions => {
      const deleteFromTree = (nodes: Permission[]): Permission[] => {
        return nodes.flatMap(node => {
          // 如果是目标节点，跳过它（删除）
          if (node.id === permissionId) {
            return []; // 返回空数组相当于删除
          }

          // 递归处理子节点
          if (node.children && node.children.length > 0) {
            const originalChildCount = node.children.length;
            const filteredChildren = deleteFromTree(node.children);

            // 如果子节点数量变化，说明删除了某个子节点
            if (filteredChildren.length < originalChildCount) {
              // 如果没有子节点了，标记父节点需要折叠
              if (filteredChildren.length === 0) {
                parentIdsToCollapse.push(node.id);
              }
              // 返回更新后的节点
              return [{ ...node, children: filteredChildren.length > 0 ? filteredChildren : undefined }];
            }

            return [{ ...node, children: filteredChildren }];
          }

          return [node];
        });
      };

      return deleteFromTree(prevPermissions);
    });

    // 折叠没有子节点的父节点
    if (parentIdsToCollapse.length > 0) {
      setExpandedKeys(prev => {
        const newExpanded = new Set(prev);
        parentIdsToCollapse.forEach(id => newExpanded.delete(id));
        return newExpanded;
      });
    }

    // 更新分页总数（估算：删除一个节点及其所有子节点）
    const countDeletedNodes = (nodes: Permission[], targetId: number): number => {
      for (const node of nodes) {
        if (node.id === targetId) {
          return 1 + (node.children ? countDeletedNodes(node.children, -1) : 0);
        }
        if (node.children) {
          const count = countDeletedNodes(node.children, targetId);
          if (count > 0) return count;
        }
      }
      return 0;
    };

    const deletedCount = countDeletedNodes(permissions, permissionId);
    setPagination(prev => ({
      ...prev,
      total: Math.max(0, prev.total - deletedCount)
    }));
  };

  // 处理弹窗提交（创建或编辑权限）
  const handleModalSubmit = async (data: PermissionRequest) => {
    try {
      if (modalState.type === 'editPermission' && modalState.permission) {
        // 编辑权限 - 调用 API 并本地更新
        const updated = await permissionAPI.updatePermission(modalState.permission.id, data);
        updatePermissionInLocalTree(updated);
      } else {
        // 创建权限 - 调用 API 并本地添加
        const created = await permissionAPI.createPermission(data);
        const parentId = modalState.type === 'createChildPermission' ? modalState.parentPermission?.id : undefined;
        addPermissionToLocalTree(created, parentId);
      }
      handleCloseModal();
    } catch (err) {
      console.error('提交权限失败:', err);
      const errorMessage = err instanceof Error ? err.message : '操作失败';
      toast.error(errorMessage, 5000);
      throw err; // 重新抛出错误，让弹窗知道操作失败
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={loadPermissions}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PermissionList
        permissions={permissions}
        openModal={(type, data) => {
          if (type === 'createPermission') {
            handleOpenCreateModal();
          } else if (type === 'editPermission' && data) {
            handleOpenEditModal(data as Permission);
          }
        }}
        onCreateChild={handleOpenCreateChildModal}
        onRefresh={loadPermissions}
        onDelete={handleDeletePermission}
        onUpdateEnabled={handleUpdateEnabled}
        onUpdateVisible={handleUpdateVisible}
        onSearch={handleSearch}
        searchKeyword={searchKeyword}
        expandedKeys={expandedKeys}
        onToggleExpand={handleToggleExpand}
        pagination={{
          current: pagination.current,
          size: pagination.size,
          total: pagination.total,
          pages: pagination.pages || Math.ceil(pagination.total / pagination.size),
        }}
        onPageChange={(page, pageSize) => {
          setPagination(prev => ({ ...prev, current: page, size: pageSize }));
          loadPermissions(page, pageSize);
        }}
      />

      {/* 删除确认弹框 */}
      {pendingDeletePermission && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          title="确认删除"
          message="确定要删除此权限吗？"
          type="danger"
          confirmText="删除"
          cancelText="取消"
          onConfirm={confirmDeletePermission}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setPendingDeletePermission(null);
          }}
          details={[
            `权限名称：${pendingDeletePermission.permName}`,
            `权限编码：${pendingDeletePermission.permCode}`,
            pendingDeletePermission.children && pendingDeletePermission.children.length > 0
              ? `⚠️ 此权限包含 ${pendingDeletePermission.children.length} 个子权限，删除后子权限将一并删除`
              : '',
          ].filter(Boolean)}
        />
      )}

      {/* 权限弹窗 */}
      {modalState.type !== 'none' && (
        <PermissionModalWrapper
          onClose={handleCloseModal}
          permission={modalState.permission}
          parentPermission={modalState.parentPermission}
          allPermissions={permissions}
          serviceOptions={serviceOptions}
          loadingServiceOptions={loadingServiceOptions}
          onSubmit={handleModalSubmit}
        />
      )}
    </>
  );
}

// 权限弹窗包装组件
interface PermissionModalWrapperProps {
  onClose: () => void;
  permission?: Permission;
  parentPermission?: Permission;
  allPermissions?: Permission[];
  serviceOptions?: Array<{ value: string; label: string }>;
  loadingServiceOptions?: boolean;
  onSubmit?: (data: PermissionRequest) => Promise<void>;
}

export function PermissionModalWrapper({
  onClose,
  permission,
  parentPermission,
  allPermissions = [],
  serviceOptions = [],
  loadingServiceOptions = false,
  onSubmit,
}: PermissionModalWrapperProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: PermissionRequest) => {
    try {
      setSubmitting(true);

      // 如果有自定义的 onSubmit，使用它（本地更新）
      if (onSubmit) {
        await onSubmit(data);
      } else {
        // 否则使用原有的逻辑（刷新页面）
        if (permission) {
          await permissionAPI.updatePermission(permission.id, data);
        } else {
          await permissionAPI.createPermission(data);
        }
        onClose();
      }
    } catch (err) {
      console.error('提交权限失败:', err);
      alert(err instanceof Error ? err.message : '操作失败');
      throw err; // 重新抛出错误
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PermissionModal
      onClose={onClose}
      permission={permission}
      parentPermission={parentPermission}
      serviceOptions={serviceOptions}
      loadingServiceOptions={loadingServiceOptions}
      onSubmit={handleSubmit}
      allPermissions={allPermissions}
    />
  );
}
