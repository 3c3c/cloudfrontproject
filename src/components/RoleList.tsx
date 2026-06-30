/**
 * 角色列表组件
 * 连接真实的角色管理 API
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Search, RefreshCw, ChevronLeft, ChevronRight, CheckCircle2, Ban, Trash2, AlertCircle } from 'lucide-react';
import { Role } from '../types';
import { roleAPI } from '../api/roleApi';
import { toast } from '../utils/toastHelpers';
import { ConfirmModal } from './ConfirmModal';

interface RoleListProps {
  refreshKey?: number;
  onViewDetail: (role: Role) => void;
  openModal: (type: 'createRole' | 'editRole' | 'roleMember' | 'rolePermission', role?: Role) => void;
}

export function RoleList({ refreshKey, onViewDetail, openModal }: RoleListProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 确认弹框状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);
  const [showBatchDisableConfirm, setShowBatchDisableConfirm] = useState(false);
  const [showBatchEnableConfirm, setShowBatchEnableConfirm] = useState(false);
  const [pendingDeleteRole, setPendingDeleteRole] = useState<Role | null>(null);
  const [noSelectionAlert, setNoSelectionAlert] = useState(false);

  // 使用 ref 来防止 StrictMode 双重调用
  const isInitialized = useRef(false);

  // 获取角色列表
  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await roleAPI.getRoleList({
        current: currentPage,
        size: pageSize,
        roleName: searchKeyword || undefined,
      });

      setRoles(response.records);
      setTotal(response.total);
    } catch (err) {
      console.error('获取角色列表失败:', err);
      const errorMessage = err instanceof Error ? err.message : '获取角色列表失败';
      toast.error(errorMessage, 5000);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchKeyword]);

  // 初始化加载
  useEffect(() => {
    // 防止 React StrictMode 导致的双重调用
    if (isInitialized.current) {
      return;
    }
    isInitialized.current = true;
    fetchRoles();
  }, [fetchRoles]);

  // 当 refreshKey 变化时，重新获取数据
  useEffect(() => {
    if (isInitialized.current && refreshKey !== undefined) {
      console.log('refreshKey 变化，重新获取角色列表:', refreshKey);
      fetchRoles();
    }
  }, [refreshKey, fetchRoles]);

  // 搜索处理
  const handleSearch = () => {
    setCurrentPage(1);
    // 立即触发搜索
    fetchRoles();
  };

  // 清空搜索
  const handleClearSearch = () => {
    setSearchKeyword('');
    setCurrentPage(1);
  };

  // 刷新列表
  const handleRefresh = () => {
    fetchRoles();
  };

  // 更新角色状态
  const handleToggleStatus = async (role: Role) => {
    try {
      const newEnabled = role.enabled === 1 ? 0 : 1;
      console.log('切换角色状态:', { roleId: role.id, roleName: role.roleName, currentEnabled: role.enabled, newEnabled });

      await roleAPI.updateRoleStatus(role.id, newEnabled);
      console.log('状态更新成功，刷新列表');

      // 刷新列表
      await fetchRoles();

      // 显示成功提示
      toast.success(`角色"${role.roleName}"状态已更新`, 3000);
    } catch (err) {
      console.error('更新角色状态失败:', err);
      const errorMessage = err instanceof Error ? err.message : '更新角色状态失败';
      toast.error(errorMessage, 5000);
    }
  };

  // 删除角色
  const handleDelete = async (role: Role) => {
    setPendingDeleteRole(role);
    setShowDeleteConfirm(true);
  };

  // 确认删除角色
  const confirmDeleteRole = async () => {
    if (!pendingDeleteRole) return;

    try {
      await roleAPI.deleteRole(pendingDeleteRole.id);
      // 刷新列表
      await fetchRoles();

      // 显示成功提示
      toast.success(`角色"${pendingDeleteRole.roleName}"已删除`, 3000);
      setShowDeleteConfirm(false);
      setPendingDeleteRole(null);
    } catch (err) {
      console.error('删除角色失败:', err);
      const errorMessage = err instanceof Error ? err.message : '删除角色失败';
      toast.error(errorMessage, 5000);
    }
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedIds.length === 0) {
      setNoSelectionAlert(true);
      return;
    }
    setShowBatchDeleteConfirm(true);
  };

  // 确认批量删除
  const confirmBatchDelete = async () => {
    try {
      await roleAPI.batchDeleteRoles(selectedIds);
      setSelectedIds([]);
      // 刷新列表
      await fetchRoles();

      // 显示成功提示
      toast.success(`成功删除 ${selectedIds.length} 个角色`, 3000);
      setShowBatchDeleteConfirm(false);
    } catch (err) {
      console.error('批量删除角色失败:', err);
      const errorMessage = err instanceof Error ? err.message : '批量删除角色失败';
      toast.error(errorMessage, 5000);
    }
  };

  // 批量启用/禁用
  const handleBatchUpdateStatus = (enabled: number) => {
    if (selectedIds.length === 0) {
      setNoSelectionAlert(true);
      return;
    }

    if (enabled === 1) {
      setShowBatchEnableConfirm(true);
    } else {
      setShowBatchDisableConfirm(true);
    }
  };

  // 确认批量启用
  const confirmBatchEnable = async () => {
    try {
      // 并发更新所有选中的角色
      await Promise.all(
        selectedIds.map(id => roleAPI.updateRoleStatus(id, 1))
      );
      setSelectedIds([]);
      // 刷新列表
      await fetchRoles();

      // 显示成功提示
      toast.success(`成功启用 ${selectedIds.length} 个角色`, 3000);
      setShowBatchEnableConfirm(false);
    } catch (err) {
      console.error('批量更新角色状态失败:', err);
      const errorMessage = err instanceof Error ? err.message : '批量更新角色状态失败';
      toast.error(errorMessage, 5000);
    }
  };

  // 确认批量禁用
  const confirmBatchDisable = async () => {
    try {
      // 并发更新所有选中的角色
      await Promise.all(
        selectedIds.map(id => roleAPI.updateRoleStatus(id, 0))
      );
      setSelectedIds([]);
      // 刷新列表
      await fetchRoles();

      // 显示成功提示
      toast.success(`成功禁用 ${selectedIds.length} 个角色`, 3000);
      setShowBatchDisableConfirm(false);
    } catch (err) {
      console.error('批量更新角色状态失败:', err);
      const errorMessage = err instanceof Error ? err.message : '批量更新角色状态失败';
      toast.error(errorMessage, 5000);
    }
  };

  // 选择/取消选择角色
  const handleSelectRole = (roleId: number) => {
    setSelectedIds(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedIds.length === roles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(roles.map(role => role.id));
    }
  };

  // 分页计算
  const totalPages = Math.ceil(total / pageSize);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex-1 flex flex-col p-8 overflow-hidden">
      <div className="flex items-center mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-gray-800 mr-3">角色管理</h2>
        <div className="group relative w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs cursor-pointer">
          i
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-center font-normal">
            管理系统中的角色，为其分配不同的权限。
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
          </div>
        </div>
      </div>


      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => openModal('createRole')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow-sm flex items-center text-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" /> 添加角色
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="请输入角色名称"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="border border-gray-300 rounded-full pl-4 pr-10 py-2 w-64 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
              type="button"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
        <button onClick={handleRefresh} className="text-blue-500 hover:text-blue-700 transition-colors" disabled={loading}>
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-sm shadow-sm overflow-hidden border border-gray-200 flex-1 flex flex-col min-h-0">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="p-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === roles.length && roles.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                </th>
                <th className="p-4 font-medium">角色名称</th>
                <th className="p-4 font-medium text-center">角色编码</th>
                <th className="p-4 font-medium text-center">角色说明</th>
                <th className="p-4 font-medium text-center">角色状态</th>
                <th className="p-4 font-medium text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      加载中...
                    </div>
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    暂无角色数据
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(role.id)}
                        onChange={() => handleSelectRole(role.id)}
                        className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-4">
                      <button onClick={() => onViewDetail(role)} className="hover:text-blue-500 transition-colors font-medium text-gray-700">
                        {role.roleName}
                      </button>
                    </td>
                    <td className="p-4 text-center text-gray-600">{role.roleCode}</td>
                    <td className="p-4 text-center text-gray-600">{role.remark || '-'}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-2">
                        <span className={`${role.enabled === 1 ? 'text-blue-500' : 'text-gray-400'} text-sm`}>
                          {role.enabled === 1 ? '启用' : '禁用'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={role.enabled === 1}
                            onChange={() => handleToggleStatus(role)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center space-x-4">
                        <button onClick={() => openModal('editRole', role)} className="text-blue-500 hover:text-blue-700 text-sm">编辑</button>
                        <button onClick={() => openModal('roleMember', role)} className="text-blue-500 hover:text-blue-700 text-sm">角色成员</button>
                        <button onClick={() => openModal('rolePermission', role)} className="text-emerald-500 hover:text-emerald-700 text-sm">角色权限</button>
                        <button onClick={() => handleDelete(role)} className="text-red-500 hover:text-red-700 text-sm">删除</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 p-4 bg-white flex justify-between items-center shrink-0">
          <div className="flex space-x-3">
            <button
              onClick={() => handleBatchUpdateStatus(1)}
              className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded text-sm transition-colors flex items-center shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 mr-1 opacity-70" /> 批量启用
            </button>
            <button
              onClick={() => handleBatchUpdateStatus(0)}
              className="bg-orange-400 text-white hover:bg-orange-500 px-4 py-2 rounded text-sm transition-colors flex items-center shadow-sm"
            >
              <Ban className="w-4 h-4 mr-1 opacity-70" /> 批量禁用
            </button>
            <button
              onClick={handleBatchDelete}
              className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded text-sm transition-colors flex items-center shadow-sm"
            >
              <Trash2 className="w-4 h-4 mr-1 opacity-70" /> 批量删除
            </button>
          </div>

          <div className="flex space-x-1 items-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {pageNumbers.map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  currentPage === page
                    ? 'bg-blue-500 text-white'
                    : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 删除角色确认弹框 */}
      {pendingDeleteRole && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          title="删除角色"
          message={`确定要删除角色"${pendingDeleteRole.roleName}"吗？`}
          type="danger"
          confirmText="删除"
          cancelText="取消"
          onConfirm={confirmDeleteRole}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setPendingDeleteRole(null);
          }}
          details={[
            `角色编码：${pendingDeleteRole.roleCode}`,
            pendingDeleteRole.remark ? `角色说明：${pendingDeleteRole.remark}` : undefined,
            `当前状态：${pendingDeleteRole.enabled === 1 ? '启用' : '禁用'}`,
            '此操作将逻辑删除该角色，删除后数据将无法恢复！'
          ].filter(Boolean)}
        />
      )}

      {/* 批量删除确认弹框 */}
      {(() => {
        const roleNames = roles
          .filter(r => selectedIds.includes(r.id))
          .map(r => r.roleName)
          .slice(0, 3);
        const details = [
          `将要删除 ${selectedIds.length} 个角色`,
          ...roleNames.map(name => `- ${name}`),
          selectedIds.length > 3 ? `... 还有 ${selectedIds.length - 3} 个角色` : undefined,
          '此操作将逻辑删除选中角色，删除后数据将无法恢复！'
        ].filter(Boolean);

        return (
          <ConfirmModal
            isOpen={showBatchDeleteConfirm}
            title="批量删除角色"
            message={`确定要删除选中的 ${selectedIds.length} 个角色吗？`}
            type="danger"
            confirmText="删除"
            cancelText="取消"
            onConfirm={confirmBatchDelete}
            onCancel={() => setShowBatchDeleteConfirm(false)}
            details={details}
          />
        );
      })()}

      {/* 批量启用确认弹框 */}
      {(() => {
        const roleNames = roles
          .filter(r => selectedIds.includes(r.id))
          .map(r => r.roleName)
          .slice(0, 3);
        const details = [
          `将要启用 ${selectedIds.length} 个角色`,
          ...roleNames.map(name => `- ${name}`),
          selectedIds.length > 3 ? `... 还有 ${selectedIds.length - 3} 个角色` : undefined
        ].filter(Boolean);

        return (
          <ConfirmModal
            isOpen={showBatchEnableConfirm}
            title="批量启用角色"
            message={`确定要启用选中的 ${selectedIds.length} 个角色吗？`}
            type="success"
            confirmText="启用"
            cancelText="取消"
            onConfirm={confirmBatchEnable}
            onCancel={() => setShowBatchEnableConfirm(false)}
            details={details}
          />
        );
      })()}

      {/* 批量禁用确认弹框 */}
      {(() => {
        const roleNames = roles
          .filter(r => selectedIds.includes(r.id))
          .map(r => r.roleName)
          .slice(0, 3);
        const details = [
          `将要禁用 ${selectedIds.length} 个角色`,
          ...roleNames.map(name => `- ${name}`),
          selectedIds.length > 3 ? `... 还有 ${selectedIds.length - 3} 个角色` : undefined
        ].filter(Boolean);

        return (
          <ConfirmModal
            isOpen={showBatchDisableConfirm}
            title="批量禁用角色"
            message={`确定要禁用选中的 ${selectedIds.length} 个角色吗？`}
            type="warning"
            confirmText="禁用"
            cancelText="取消"
            onConfirm={confirmBatchDisable}
            onCancel={() => setShowBatchDisableConfirm(false)}
            details={details}
          />
        );
      })()}

      {/* 未选择角色提示 */}
      <ConfirmModal
        isOpen={noSelectionAlert}
        title="提示"
        message="请先选择要操作的角色"
        type="info"
        confirmText="知道了"
        cancelText="取消"
        onConfirm={() => setNoSelectionAlert(false)}
        onCancel={() => setNoSelectionAlert(false)}
      />
    </div>
  );
}
