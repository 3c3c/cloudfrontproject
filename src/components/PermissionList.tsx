import React, { useState } from 'react';
import { Search, RefreshCw, Plus, ChevronDown, ChevronRight, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Permission } from '../types';

interface PermissionListProps {
  permissions: Permission[];
  openModal: (type: 'createPermission' | 'editPermission', data?: Permission) => void;
  onRefresh: () => void;
  onDelete?: (id: number) => void;
  onUpdateEnabled?: (id: number, enabled: number) => void;
  onUpdateVisible?: (id: number, visible: number) => void;
  onCreateChild?: (parent: Permission) => void;
}

export function PermissionList({
  permissions,
  openModal,
  onRefresh,
  onDelete,
  onUpdateEnabled,
  onUpdateVisible,
  onCreateChild,
}: PermissionListProps) {
  const [expandedKeys, setExpandedKeys] = useState<Set<number>>(new Set());
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterType, setFilterType] = useState<number | ''>('');

  // 切换展开/收起状态
  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedKeys);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedKeys(newExpanded);
  };

  // 全部展开/收起
  const toggleExpandAll = () => {
    if (expandedKeys.size > 0) {
      setExpandedKeys(new Set());
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
      setExpandedKeys(allIds);
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
            <input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
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
          <td className="p-4 text-center">
            {permission.enabled === 1 ? (
              <span className="text-green-600">启用</span>
            ) : (
              <span className="text-red-500">禁用</span>
            )}
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
              {onUpdateEnabled && (
                <button
                  onClick={() => onUpdateEnabled(permission.id, permission.enabled === 1 ? 0 : 1)}
                  className="text-orange-500 hover:text-orange-700 text-sm"
                >
                  {permission.enabled === 1 ? '禁用' : '启用'}
                </button>
              )}
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
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-48 pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-shadow"
              />
              <button className="absolute right-3 top-2.5 text-gray-400">
                <Search className="w-4 h-4" />
              </button>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as number | '')}
              className="px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            >
              <option value="">所有类型</option>
              <option value="1">目录</option>
              <option value="2">菜单</option>
              <option value="3">按钮</option>
            </select>
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
                  <input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
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
      </div>
    </div>
  );
}
