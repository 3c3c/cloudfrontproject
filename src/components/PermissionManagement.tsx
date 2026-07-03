import { useState, useEffect } from 'react';
import { PermissionList } from './PermissionList';
import { PermissionModal } from './PermissionModals';
import { permissionAPI, PermissionRequest } from '../api/permissionApi';
import type { Permission } from '../types';

interface PermissionManagementProps {
  refreshKey?: number;
  openModal: (type: 'createPermission' | 'editPermission', data?: Permission) => void;
  openChildModal?: (type: 'createChildPermission', parent: Permission) => void;
}

export function PermissionManagement({
  refreshKey,
  openModal,
  openChildModal,
}: PermissionManagementProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载权限树
  const loadPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await permissionAPI.getPermissionTree();
      setPermissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载权限失败');
      console.error('加载权限失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, [refreshKey]);

  // 创建权限
  const handleCreatePermission = async (data: PermissionRequest) => {
    try {
      await permissionAPI.createPermission(data);
      await loadPermissions();
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
      await loadPermissions();
      return true;
    } catch (err) {
      console.error('更新权限失败:', err);
      throw err;
    }
  };

  // 删除权限
  const handleDeletePermission = async (id: number) => {
    if (!confirm('确定要删除此权限吗？')) return;

    try {
      await permissionAPI.deletePermission(id);
      await loadPermissions();
    } catch (err) {
      console.error('删除权限失败:', err);
      alert(err instanceof Error ? err.message : '删除失败');
    }
  };

  // 更新权限状态
  const handleUpdateEnabled = async (id: number, enabled: number) => {
    try {
      await permissionAPI.updatePermissionEnabled(id, enabled);
      await loadPermissions();
    } catch (err) {
      console.error('更新权限状态失败:', err);
      alert(err instanceof Error ? err.message : '更新状态失败');
    }
  };

  // 更新权限可见性
  const handleUpdateVisible = async (id: number, visible: number) => {
    try {
      await permissionAPI.updatePermissionVisible(id, visible);
      await loadPermissions();
    } catch (err) {
      console.error('更新权限可见性失败:', err);
      alert(err instanceof Error ? err.message : '更新可见性失败');
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
        openModal={openModal}
        onCreateChild={(parent) => openChildModal?.('createChildPermission', parent)}
        onRefresh={loadPermissions}
        onDelete={handleDeletePermission}
        onUpdateEnabled={handleUpdateEnabled}
        onUpdateVisible={handleUpdateVisible}
      />
    </>
  );
}

// 权限弹窗包装组件
interface PermissionModalWrapperProps {
  onClose: (shouldRefresh?: boolean) => void;
  permission?: Permission;
  parentPermission?: Permission;
  allPermissions?: Permission[];
}

export function PermissionModalWrapper({
  onClose,
  permission,
  parentPermission,
  allPermissions = [],
}: PermissionModalWrapperProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: PermissionRequest) => {
    try {
      setSubmitting(true);

      if (permission) {
        // 更新权限
        await permissionAPI.updatePermission(permission.id, data);
      } else {
        // 创建权限
        await permissionAPI.createPermission(data);
      }

      onClose(true);
    } catch (err) {
      console.error('提交权限失败:', err);
      alert(err instanceof Error ? err.message : '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PermissionModal
      onClose={() => onClose(false)}
      permission={permission}
      parentPermission={parentPermission}
      onSubmit={handleSubmit}
      allPermissions={allPermissions}
    />
  );
}
