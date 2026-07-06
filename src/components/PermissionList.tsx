import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Plus, ChevronDown, ChevronRight, ChevronLeft, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Permission } from '../types';

interface PermissionListProps {
  permissions: Permission[];
  openModal: (type: 'createPermission' | 'editPermission', data?: Permission) => void;
  onRefresh: () => void;
  onDelete?: (id: number) => void;
  onUpdateEnabled?: (id: number, enabled: number) => void;
  onUpdateVisible?: (id: number, visible: number) => void;
  onCreateChild?: (parent: Permission) => void;
  onSearch?: (keyword: string) => void;
  searchKeyword?: string; // 从父组件传入的搜索关键词
  expandedKeys?: Set<number>;
  onToggleExpand?: (id: number) => void;
  // 分页相关
  pagination?: {
    current: number;
    size: number;
    total: number;
    pages: number;
  };
  onPageChange?: (page: number, pageSize: number) => void;
}

export function PermissionList({
  permissions,
  openModal,
  onRefresh,
  onDelete,
  onUpdateEnabled,
  onUpdateVisible,
  onCreateChild,
  onSearch,
  searchKeyword: externalSearchKeyword = '',
  expandedKeys: externalExpandedKeys,
  onToggleExpand: externalOnToggleExpand,
  pagination,
  onPageChange,
}: PermissionListProps) {
  // 如果外部传入了 expandedKeys，使用外部的，否则使用本地的
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<Set<number>>(new Set());
  const expandedKeys = externalExpandedKeys ?? internalExpandedKeys;

  // 统一的展开状态管理
  const setExpandedKeysList = externalOnToggleExpand
    ? (keys: Set<number>) => {
        // 外部管理展开状态，比较新旧 Set 差异并调用 onToggleExpand
        const currentIds = Array.from(expandedKeys);
        const newIds = Array.from(keys);

        // 需要展开的 ID（在新 Set 中但不在旧 Set 中）
        newIds.forEach((id: number) => {
          if (!expandedKeys.has(id)) {
            externalOnToggleExpand(id);
          }
        });

        // 需要折叠的 ID（在旧 Set 中但不在新 Set 中）
        currentIds.forEach((id: number) => {
          if (!keys.has(id)) {
            externalOnToggleExpand(id);
          }
        });
      }
    : setInternalExpandedKeys;

  // 切换单个节点的展开状态
  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedKeys);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedKeysList(newExpanded);
  };

  const [searchKeyword, setSearchKeyword] = useState(externalSearchKeyword);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // 当外部 searchKeyword 变化时，同步更新本地状态
  useEffect(() => {
    setSearchKeyword(externalSearchKeyword);
  }, [externalSearchKeyword]);

  // 处理搜索输入（只更新本地状态）
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  // 处理搜索按钮点击（调用API）
  const handleSearchClick = () => {
    if (onSearch) {
      onSearch(searchKeyword);
    }
  };

  // 处理回车键搜索
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  // 递归获取所有子孙节点的ID
  const getAllChildrenIds = (permission: Permission): number[] => {
    const ids: number[] = [permission.id];
    if (permission.children && permission.children.length > 0) {
      permission.children.forEach(child => {
        ids.push(...getAllChildrenIds(child));
      });
    }
    return ids;
  };

  // 处理勾选/取消勾选权限
  const handleTogglePermission = (permission: Permission, checked: boolean) => {
    const newSelected = new Set(selectedPermissions);
    const allChildrenIds = getAllChildrenIds(permission);

    if (checked) {
      // 勾选父节点，同步勾选所有子节点
      allChildrenIds.forEach(id => newSelected.add(id));
    } else {
      // 取消勾选父节点，同步取消勾选所有子节点
      allChildrenIds.forEach(id => newSelected.delete(id));
    }

    setSelectedPermissions(newSelected);
  };

  // 处理全选/取消全选
  const handleToggleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      // 勾选所有权限
      const allIds = new Set<number>();
      const collectIds = (nodes: Permission[]) => {
        nodes.forEach(node => {
          allIds.add(node.id);
          if (node.children && node.children.length > 0) {
            collectIds(node.children);
          }
        });
      };
      collectIds(permissions);
      setSelectedPermissions(allIds);
    } else {
      // 取消勾选所有权限
      setSelectedPermissions(new Set());
    }
  };

  // 全部展开/收起
  const toggleExpandAll = () => {
    if (expandedKeys.size > 0) {
      setExpandedKeysList(new Set());
    } else {
      const allIds = new Set<number>();
      const collectIds = (nodes: Permission[]) => {
        nodes.forEach(node => {
          if (node.children && node.children.length > 0) {
            allIds.add(node.id);
            collectIds(node.children);
          }
        });
      };
      collectIds(permissions);
      setExpandedKeysList(allIds);
    }
  };

  // 获取权限类型文本
  const getTypeText = (type: number) => {
    switch (type) {
      case 1:
        return '目录';
      case 2:
        return '菜单';
      case 3:
        return '按钮';
      default:
        return '未知';
    }
  };

  // 获取权限类型颜色
  const getTypeColor = (type: number) => {
    switch (type) {
      case 1:
        return 'text-blue-600 bg-blue-50';
      case 2:
        return 'text-green-600 bg-green-50';
      case 3:
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // 渲染权限树节点
  const renderPermissionNode = (permission: Permission, level: number = 0) => {
    const hasChildren = permission.children && permission.children.length > 0;
    const isExpanded = expandedKeys.has(permission.id);
    const canCreateChild = permission.type === 1 || permission.type === 2;

    return (
      <React.Fragment key={permission.id}>
        <tr className="transition-colors hover:bg-blue-50">
          <td className="p-4 text-center">
            <input
              type="checkbox"
              checked={selectedPermissions.has(permission.id)}
              onChange={(e) => handleTogglePermission(permission, e.target.checked)}
              className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 w-4 h-4 cursor-pointer"
            />
          </td>
          <td className="p-4">
            <div
              className="flex items-center"
              style={{ paddingLeft: `${level * 24}px` }}
            >
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(permission.id)}
                  className="mr-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              ) : (
                <span className="mr-6" />
              )}
              {permission.icon && (
                <span className="mr-2 text-gray-500">{permission.icon}</span>
              )}
              <span className="text-gray-700">{permission.permName}</span>
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full font-medium">
                {permission.permCode}
              </span>
            </div>
          </td>
          <td className="p-4 text-center">
            <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(permission.type)}`}>
              {getTypeText(permission.type)}
            </span>
          </td>
          <td className="p-4 text-center text-gray-700">{permission.path || '-'}</td>
          <td className="p-4 text-center">
            {permission.visible === 1 ? (
              <span className="text-green-600 flex items-center justify-center">
                <Eye className="w-4 h-4 mr-1" /> 显示
              </span>
            ) : (
              <span className="text-gray-500 flex items-center justify-center">
                <EyeOff className="w-4 h-4 mr-1" /> 隐藏
              </span>
            )}
          </td>
          <td className="p-4">
            <div className="flex items-center justify-center space-x-2">
              <span className={`${permission.enabled === 1 ? 'text-blue-500' : 'text-gray-400'} text-sm`}>
                {permission.enabled === 1 ? '启用' : '禁用'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={permission.enabled === 1}
                  onChange={() => onUpdateEnabled?.(permission.id, permission.enabled === 1 ? 0 : 1)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </td>
          <td className="p-4 text-center text-gray-700">{permission.sort}</td>
          <td className="p-4">
            <div className="flex justify-center space-x-3">
              {canCreateChild && (
                <button
                  onClick={() => onCreateChild?.(permission)}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  新增子项
                </button>
              )}
              <button
                onClick={() => openModal('editPermission', permission)}
                className="text-emerald-500 hover:text-emerald-700 text-sm flex items-center"
              >
                <Edit className="w-3 h-3 mr-1" /> 编辑
              </button>
              {onDelete && (
                <button
                  onClick={() => onDelete(permission.id)}
                  className="text-red-500 hover:text-red-700 text-sm flex items-center"
                >
                  <Trash2 className="w-3 h-3 mr-1" /> 删除
                </button>
              )}
            </div>
          </td>
        </tr>
        {hasChildren && isExpanded && permission.children?.map(child => renderPermissionNode(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="flex-1 flex flex-col p-8 overflow-hidden">
      <div className="flex items-center mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-gray-800 mr-3">权限策略</h2>
        <div className="group relative w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs cursor-pointer">
          i
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-center font-normal">
            管理系统的权限策略，支持树形结构展示权限层级。
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex space-x-3">
          <button
            onClick={() => openModal('createPermission')}
            className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded text-sm transition-colors flex items-center shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加权限
          </button>
          <div className="flex space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索权限名称"
                value={searchKeyword}
                onChange={handleSearchChange}
                onKeyPress={handleSearchKeyPress}
                className="w-48 pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-shadow"
              />
              <button
                onClick={handleSearchClick}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                type="button"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={toggleExpandAll}
            className="text-gray-600 hover:text-gray-800 transition-colors bg-gray-100 px-3 py-2 rounded-full text-sm"
          >
            {expandedKeys.size > 0 ? '全部收起' : '全部展开'}
          </button>
          <button
            onClick={onRefresh}
            className="text-blue-500 hover:text-blue-600 transition-colors bg-blue-50 p-2 rounded-full"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="border border-gray-100 rounded-sm overflow-hidden flex-1 flex flex-col shadow-sm">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="p-4 w-16 text-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={(e) => handleToggleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="p-4 font-medium text-left">权限名称</th>
                <th className="p-4 font-medium text-center w-24">类型</th>
                <th className="p-4 font-medium text-center w-48">路由地址</th>
                <th className="p-4 font-medium text-center w-24">可见性</th>
                <th className="p-4 font-medium text-center w-20">状态</th>
                <th className="p-4 font-medium text-center w-16">排序</th>
                <th className="p-4 font-medium text-center w-48">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {permissions.map(permission => renderPermissionNode(permission))}
            </tbody>
          </table>
        </div>

        {/* 分页栏 */}
        {pagination && pagination.pages > 0 && pagination.current > 0 && (
          <div className="border-t border-gray-100 p-4 bg-white flex justify-end items-center shrink-0">
            <div className="flex space-x-1 items-center">
              <button
                onClick={() => onPageChange?.(Math.max(1, pagination.current - 1), pagination.size)}
                disabled={pagination.current === 1}
                className="p-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(pagination.pages, 10) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange?.(pageNum, pagination.size)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      pagination.current === pageNum
                        ? 'bg-blue-500 text-white border-0'
                        : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => onPageChange?.(Math.min(pagination.pages, pagination.current + 1), pagination.size)}
                disabled={pagination.current === pagination.pages}
                className="p-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-500 ml-2">
                共 {pagination.total} 条，第 {pagination.current}/{pagination.pages} 页
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
