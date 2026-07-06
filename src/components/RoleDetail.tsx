/**
 * 角色详情组件
 * 显示角色详细信息与权限（按 URL 的 id 加载）
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusSquare, Search, X, RefreshCw, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Role } from '../types';
import { roleAPI, PermissionTreeNode } from '../api/roleApi';
import { toast } from '../utils/toastHelpers';

interface RoleDetailProps {
  refreshKey?: number;
  openModal: (type: 'editRole' | 'roleMember' | 'rolePermission', role?: Role) => void;
  onRoleDataUpdate?: (updatedRole: Role) => void;
}

export function RoleDetail({ refreshKey, openModal, onRoleDataUpdate }: RoleDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [permissions, setPermissions] = useState<PermissionTreeNode[]>([]);
  const [filteredPermissions, setFilteredPermissions] = useState<PermissionTreeNode[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const loadRoleData = async () => {
      try {
        setLoading(true);
        const data = await roleAPI.getRoleById(id);

        if (!cancelled) {
          setRole(data);
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : '加载角色详情失败', 5000);
          navigate('/roles');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRoleData();

    return () => {
      cancelled = true;
    };
  }, [id]); // 只依赖 id

  // 监听全局的角色数据更新
  useEffect(() => {
    const handleRoleUpdate = () => {
      const updatedRole = (window as any).updatedRoleData;
      if (updatedRole && role && updatedRole.id === role.id) {
        // 是当前角色，直接更新本地数据
        setRole(updatedRole);
        // 清除全局数据
        (window as any).updatedRoleData = null;
      }
    };

    // 监听全局更新事件
    window.addEventListener('roleUpdated', handleRoleUpdate);

    return () => {
      window.removeEventListener('roleUpdated', handleRoleUpdate);
    };
  }, [role]);

  // 触发全局更新的函数
  useEffect(() => {
    (window as any).triggerRoleUpdate = (updatedRole: Role) => {
      (window as any).updatedRoleData = updatedRole;
      window.dispatchEvent(new Event('roleUpdated'));
    };
  }, []);

  // 加载角色权限树
  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const loadPermissions = async () => {
      try {
        setLoadingPermissions(true);
        const data = await roleAPI.getRolePermissions(id);

        if (!cancelled) {
          setPermissions(data);
          setFilteredPermissions(data);

          // 默认折叠所有节点
          setExpandedNodes(new Set<number>());
        }
      } catch (err) {
        console.error('加载权限失败:', err);
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : '加载权限失败', 5000);
          setPermissions([]);
          setFilteredPermissions([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingPermissions(false);
        }
      }
    };

    loadPermissions();

    return () => {
      cancelled = true;
    };
  }, [id, refreshKey]); // 依赖 id 和 refreshKey，权限保存后会刷新

  // 搜索权限
  const handleSearch = () => {
    if (!searchKeyword.trim()) {
      setFilteredPermissions(permissions);
      // 清空搜索时，恢复到折叠状态
      setExpandedNodes(new Set<number>());
      return;
    }

    // 递归搜索权限
    const searchNodes = (nodes: PermissionTreeNode[]): PermissionTreeNode[] => {
      const result: PermissionTreeNode[] = [];

      nodes.forEach(node => {
        const matchesSearch = node.permName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                             node.permCode.toLowerCase().includes(searchKeyword.toLowerCase());

        const filteredChildren = node.children && node.children.length > 0
          ? searchNodes(node.children)
          : [];

        // 如果当前节点匹配或有匹配的子节点，则保留
        if (matchesSearch || filteredChildren.length > 0) {
          result.push({
            ...node,
            children: filteredChildren
          });
        }
      });

      return result;
    };

    const filtered = searchNodes(permissions);

    // 展开所有包含匹配结果的节点
    const expandedIds = new Set<number>();
    const collectExpandedIds = (nodes: PermissionTreeNode[]) => {
      nodes.forEach(node => {
        expandedIds.add(node.id);
        if (node.children && node.children.length > 0) {
          collectExpandedIds(node.children);
        }
      });
    };
    collectExpandedIds(filtered);
    setExpandedNodes(expandedIds);

    setFilteredPermissions(filtered);
  };

  // 切换节点展开状态
  const toggleNode = (nodeId: number) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // 统计已分配权限数量
  const countAssignedPermissions = (nodes: PermissionTreeNode[]): number => {
    let count = 0;
    nodes.forEach(node => {
      if (node.assigned) count++;
      if (node.children && node.children.length > 0) {
        count += countAssignedPermissions(node.children);
      }
    });
    return count;
  };

  // 统计总权限数量
  const countTotalPermissions = (nodes: PermissionTreeNode[]): number => {
    let count = 0;
    nodes.forEach(node => {
      count++;
      if (node.children && node.children.length > 0) {
        count += countTotalPermissions(node.children);
      }
    });
    return count;
  };

  // 渲染权限树节点
  const renderPermissionNode = (node: PermissionTreeNode, level: number = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const indent = level * 24;

    return (
      <div key={node.id} className="permission-node">
        <div
          className="flex items-center py-2 hover:bg-gray-50 cursor-pointer"
          style={{ paddingLeft: `${indent + 24}px` }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          {/* 展开/折叠图标 */}
          <div className="w-6 h-6 flex items-center justify-center mr-2">
            {hasChildren ? (
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
              />
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>

          {/* 分配状态标识 */}
          <div className="mr-3">
            {node.assigned ? (
              <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            ) : (
              <div className="w-5 h-5 rounded border border-gray-300" />
            )}
          </div>

          {/* 权限名称 */}
          <div className="flex-1">
            <span className="text-sm text-gray-700">{node.permName}</span>
            <span className="text-xs text-gray-400 ml-2">({node.permCode})</span>
          </div>
        </div>

        {/* 子节点 */}
        {isExpanded && hasChildren && (
          <div>
            {node.children.map(child => renderPermissionNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // 处理角色状态切换
  const handleStatusChange = async (checked: boolean) => {
    if (!role || updatingStatus) return;

    const newStatus = checked ? 1 : 0;
    const originalStatus = role.enabled;

    try {
      setUpdatingStatus(true);

      // 乐观更新 UI
      setRole({ ...role, enabled: newStatus });

      // 调用 API 更新状态
      await roleAPI.updateRoleStatus(role.id, newStatus);
    } catch (error) {
      // 恢复原状态
      setRole({ ...role, enabled: originalStatus });
      toast.error(
        error instanceof Error ? error.message : '更新角色状态失败',
        5000
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!role) return null;

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden h-full">
      <header className="px-8 pt-6 pb-4 shrink-0">
        <div className="text-xs text-gray-400 mb-3">
          角色管理 / <span className="text-gray-500">{role.roleCode}</span>
        </div>
        <div className="flex items-center text-xl font-bold text-gray-800">
          <button onClick={() => navigate('/roles')} className="mr-3 text-gray-500 hover:text-blue-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          {role.roleCode}
        </div>
      </header>

      <section className="px-8 py-4 shrink-0">
        <div className="flex items-center mb-6">
          <h2 className="font-bold text-base mr-6 text-gray-800">角色基本信息</h2>
          <button onClick={() => openModal('editRole', role)} className="text-blue-500 text-sm mr-6 hover:underline">编辑基本信息</button>
          <button className="text-red-500 text-sm hover:underline">删除该角色</button>
        </div>
        <div className="grid grid-cols-1 gap-y-4 text-sm max-w-2xl">
          <div className="flex items-center">
            <span className="w-24 text-gray-500">角色编码</span>
            <span className="text-gray-800">{role.roleCode}</span>
          </div>
          <div className="flex items-center">
            <span className="w-24 text-gray-500">角色说明</span>
            <span className="text-gray-800">{role.remark || '-'}</span>
          </div>
          <div className="flex items-center">
            <span className="w-24 text-gray-500">角色状态</span>
            <div className="flex items-center">
              <span className={`${role.enabled === 1 ? 'text-blue-500' : 'text-gray-400'} mr-3 text-sm`}>
                {role.enabled === 1 ? '启用' : '禁用'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={role.enabled === 1}
                  onChange={(e) => handleStatusChange(e.target.checked)}
                  disabled={updatingStatus}
                  className="sr-only peer"
                />
                <div className={`w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500 ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 mt-2 shrink-0">
        <div className="flex border-b border-gray-200">
          <button className="px-8 py-2.5 text-sm font-medium bg-blue-500 text-white rounded-t-md">
            权限管理
          </button>
        </div>
      </section>

      <section className="px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => openModal('rolePermission', role)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded shadow-sm hover:bg-blue-600 transition-colors text-sm"
          >
            <PlusSquare className="w-4 h-4 mr-2" />
            添加权限
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="请输入权限名称"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-64 pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-gray-400">
              <button
                onClick={handleSearch}
                className="hover:text-gray-600 transition-colors"
                type="button"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            // 重新加载权限
            if (id) {
              roleAPI.getRolePermissions(Number(id))
                .then(data => {
                  setPermissions(data);
                  setFilteredPermissions(data);
                })
                .catch(err => {
                  toast.error(err instanceof Error ? err.message : '刷新权限失败', 5000);
                });
            }
          }}
          className="text-blue-500 hover:rotate-180 transition-transform duration-500"
        >
          <RefreshCw className={`w-5 h-5 ${loadingPermissions ? 'animate-spin' : ''}`} />
        </button>
      </section>

      <section className="px-8 flex-1 overflow-auto">
        {loadingPermissions ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : filteredPermissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Search className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-sm">
              {searchKeyword ? '没有找到匹配的权限' : '暂无权限数据'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200">
            {/* 表头 */}
            <div className="flex items-center px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
              <div className="w-8" />
              <div className="w-8" />
              <div className="flex-1">权限名称</div>
            </div>

            {/* 权限树 */}
            <div className="permission-tree">
              {filteredPermissions.map(node => renderPermissionNode(node))}
            </div>

            {/* 统计信息 */}
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span>权限分配说明：蓝色勾选表示已分配该权限</span>
                <span>
                  已分配: {countAssignedPermissions(filteredPermissions)} / 总计: {countTotalPermissions(filteredPermissions)}
                </span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
