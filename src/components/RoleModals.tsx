/**
 * 角色管理相关模态框组件
 * 连接真实的角色管理 API
 */

import { useState, type FormEvent, type ReactNode, useEffect } from 'react';
import { X, Search, ChevronDown, RefreshCw } from 'lucide-react';
import { Role } from '../types';
import { roleAPI, PermissionTreeNode } from '../api/roleApi';
import { toast } from '../utils/toastHelpers';

interface BaseModalProps {
  onClose: (shouldRefresh?: boolean, updatedData?: Role) => void;
}

function ModalWrapper({ children, title, onClose, widthClass = "max-w-[680px]" }: { children: ReactNode, title: string, onClose: (shouldRefresh?: boolean) => void, widthClass?: string }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className={`bg-white w-full ${widthClass} rounded-sm shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800">{title}</h2>
          <button onClick={() => onClose(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function CreateRoleModal({ onClose }: BaseModalProps) {
  const [roleCode, setRoleCode] = useState('');
  const [remark, setRemark] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // 表单验证
    if (!roleCode.trim()) {
      setError('角色编码不能为空');
      return;
    }
    if (roleCode.length > 50) {
      setError('角色编码最大长度为50个字符');
      return;
    }
    if (remark.length > 200) {
      setError('角色说明最大长度为200个字符');
      return;
    }

    try {
      setLoading(true);
      await roleAPI.createRole({
        roleCode,
        remark,
        enabled: enabled ? 1 : 0,
      });
      // 创建成功，关闭模态框（触发刷新）
      onClose(true);
    } catch (err) {
      console.error('创建角色失败:', err);
      toast.error(err instanceof Error ? err.message : '创建角色失败', 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper title="创建角色" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="p-8 flex-grow space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="block mb-2 text-sm font-normal text-gray-700">
              <span className="text-red-500 mr-1">*</span>角色编码
            </label>
            <input
              type="text"
              value={roleCode}
              onChange={(e) => setRoleCode(e.target.value)}
              placeholder="请输入角色编码，如：ADMIN"
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all"
              maxLength={50}
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-gray-400">最大长度50个字符</span>
              <span className="text-xs text-gray-400">{roleCode.length}/50</span>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-normal text-gray-700">角色说明</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="输入角色说明，便于记忆哦"
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all min-h-[100px] resize-y"
              maxLength={200}
            ></textarea>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-gray-400">最大长度200个字符</span>
              <span className="text-xs text-gray-400">{remark.length}/200</span>
            </div>
          </div>

          <div className="flex items-center">
            <label className="text-sm font-normal text-gray-700 mr-3">角色状态</label>
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
              <span className="ml-2 text-sm text-gray-600">{enabled ? '启用' : '禁用'}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-50 bg-white flex justify-end space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-8 py-2 rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? '提交中...' : '提交'}
          </button>
          <button
            type="button"
            onClick={() => onClose(false)}
            disabled={loading}
            className="bg-white text-gray-600 border border-gray-300 px-8 py-2 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            取消
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

export function EditRoleModal({ onClose, role }: BaseModalProps & { role?: Role }) {
  const [roleCode, setRoleCode] = useState(role?.roleCode || '');
  const [remark, setRemark] = useState(role?.remark || '');
  const [enabled, setEnabled] = useState(role?.enabled === 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!role) return;

    // 表单验证
    if (!roleCode.trim()) {
      setError('角色编码不能为空');
      return;
    }
    if (roleCode.length > 50) {
      setError('角色编码最大长度为50个字符');
      return;
    }
    if (remark.length > 200) {
      setError('角色说明最大长度为200个字符');
      return;
    }

    try {
      setLoading(true);

      // 构建更新后的角色数据
      const updatedRole: Role = {
        ...role,
        roleCode,
        remark,
        enabled: enabled ? 1 : 0,
      };

      // 调用API更新服务器
      await roleAPI.updateRole(role.id, {
        roleCode,
        remark,
        enabled: enabled ? 1 : 0,
      });

      // 更新成功，通过全局事件通知父组件进行本地更新
      if ((window as any).triggerRoleUpdate) {
        (window as any).triggerRoleUpdate(updatedRole);
      }
      onClose(true);
    } catch (err) {
      console.error('更新角色失败:', err);
      toast.error(err instanceof Error ? err.message : '更新角色失败', 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper title="编辑角色" onClose={onClose} widthClass="max-w-[500px]">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 px-6 py-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              <span className="text-red-500 mr-1">*</span>角色编码
            </label>
            <input
              type="text"
              value={roleCode}
              onChange={(e) => setRoleCode(e.target.value)}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-500 cursor-not-allowed text-sm focus:outline-none"
              maxLength={50}
            />
            <div className="flex justify-between text-xs text-gray-400 pt-1">
              <span>最大长度50个字符</span>
              <span>{roleCode.length}/50</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">角色说明</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="输入角色说明，便于记忆哦"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 text-sm min-h-[100px] resize-y focus:outline-none"
              maxLength={200}
            ></textarea>
            <div className="flex justify-between text-xs text-gray-400 pt-1">
              <span>最大长度200个字符</span>
              <span>{remark.length}/200</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <label className="text-sm font-medium text-gray-700">角色状态</label>
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
              <span className="ml-2 text-sm text-gray-600">{enabled ? '启用' : '禁用'}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-50 bg-white flex justify-end space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-8 py-2 rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? '保存中...' : '保存'}
          </button>
          <button
            type="button"
            onClick={() => onClose(false)}
            disabled={loading}
            className="bg-white text-gray-600 border border-gray-300 px-8 py-2 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            取消
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

export function RoleMemberModal({ onClose, role }: BaseModalProps & { role?: Role }) {
  return (
    <ModalWrapper title="角色成员管理" onClose={onClose}>
      <div className="flex-1 flex flex-col p-6">
        <div className="mb-4 flex items-center justify-between">
          <input
            type="text"
            placeholder="请输入用户名称或账号"
            className="flex-1 mr-4 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          />
          <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors">
            添加成员
          </button>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">用户账号</th>
              <th className="px-4 py-2 font-medium">用户名称</th>
              <th className="px-4 py-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            <tr>
              <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                暂无数据
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-50 bg-white flex justify-end">
        <button onClick={onClose} className="bg-white text-gray-600 border border-gray-300 px-8 py-2 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
          关闭
        </button>
      </div>
    </ModalWrapper>
  );
}

export function RolePermissionModal({ onClose, role }: BaseModalProps & { role?: Role }) {
  const [allPermissions, setAllPermissions] = useState<PermissionTreeNode[]>([]);
  const [filteredPermissions, setFilteredPermissions] = useState<PermissionTreeNode[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  // 加载所有权限树
  useEffect(() => {
    if (!role) return;

    const loadAllPermissions = async () => {
      try {
        setLoading(true);
        const data = await roleAPI.getRolePermissions(role.id);
        setAllPermissions(data);
        setFilteredPermissions(data);

        // 默认折叠所有节点
        setExpandedNodes(new Set());
      } catch (err) {
        console.error('加载权限失败:', err);
        toast.error(err instanceof Error ? err.message : '加载权限失败', 5000);
      } finally {
        setLoading(false);
      }
    };

    loadAllPermissions();
  }, [role]);

  // 点击搜索图标时执行本地搜索
  const handleSearch = () => {
    if (!searchKeyword.trim()) {
      setFilteredPermissions(allPermissions);
      setExpandedNodes(new Set());
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

        if (matchesSearch || filteredChildren.length > 0) {
          result.push({
            ...node,
            children: filteredChildren
          });
        }
      });

      return result;
    };

    const filtered = searchNodes(allPermissions);

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

  // 切换权限选择状态（选中父节点时自动选中所有子孙节点，取消父节点时级联取消所有子孙节点）
  const togglePermission = (clickedNode: PermissionTreeNode) => {
    const newState = !clickedNode.assigned;

    // 递归查找包含目标节点的所有父节点路径
    const findParentIds = (nodes: PermissionTreeNode[], targetId: number, parentIds: number[] = []): number[] => {
      for (const node of nodes) {
        if (node.id === targetId) {
          return [...parentIds, node.id];
        }
        if (node.children && node.children.length > 0) {
          const result = findParentIds(node.children, targetId, [...parentIds, node.id]);
          if (result.length > 0) return result;
        }
      }
      return [];
    };

    const parentPath = findParentIds(allPermissions, clickedNode.id);

    // 递归选中某个节点及其所有子孙节点
    const selectNodeAndChildren = (nodeId: number, nodes: PermissionTreeNode[]): PermissionTreeNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          // 找到目标节点，选中它及其所有子孙节点
          const selectAllChildren = (n: PermissionTreeNode): PermissionTreeNode => {
            const newChildren = n.children && n.children.length > 0
              ? n.children.map(selectAllChildren)
              : n.children;

            return {
              ...n,
              assigned: true,
              children: newChildren
            };
          };
          return selectAllChildren(node);
        }

        if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: selectNodeAndChildren(nodeId, node.children)
          };
        }

        return node;
      });
    };

    // 递归取消某个节点及其所有子孙节点
    const cancelNodeAndChildren = (nodeId: number, nodes: PermissionTreeNode[]): PermissionTreeNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          // 找到目标节点，取消它及其所有子孙节点
          const cancelAllChildren = (n: PermissionTreeNode): PermissionTreeNode => {
            const newChildren = n.children && n.children.length > 0
              ? n.children.map(cancelAllChildren)
              : n.children;

            return {
              ...n,
              assigned: false,
              children: newChildren
            };
          };
          return cancelAllChildren(node);
        }

        if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: cancelNodeAndChildren(nodeId, node.children)
          };
        }

        return node;
      });
    };

    // 分步更新
    const step1Update = (nodes: PermissionTreeNode[]): PermissionTreeNode[] => {
      return nodes.map(node => {
        const isInParentPath = parentPath.includes(node.id);
        let newAssignedState = node.assigned;

        if (isInParentPath) {
          if (newState) {
            newAssignedState = true;
          } else {
            if (node.id === clickedNode.id) {
              newAssignedState = false;
            }
          }
        }

        return {
          ...node,
          assigned: newAssignedState,
          children: node.children ? step1Update(node.children) : node.children
        };
      });
    };

    let afterStep1 = step1Update(allPermissions);
    if (newState) {
      afterStep1 = selectNodeAndChildren(clickedNode.id, afterStep1);
    } else {
      afterStep1 = cancelNodeAndChildren(clickedNode.id, afterStep1);
    }

    // 第三步：只检查父路径中的父节点状态
    const step2Update = (nodes: PermissionTreeNode[]): PermissionTreeNode[] => {
      return nodes.map(node => {
        let updatedChildren = node.children ? step2Update(node.children) : node.children;

        if (parentPath.includes(node.id) && updatedChildren && updatedChildren.length > 0) {
          const hasSelectedDescendant = (n: PermissionTreeNode): boolean => {
            if (n.assigned) return true;
            if (n.children && n.children.length > 0) {
              return n.children.some(hasSelectedDescendant);
            }
            return false;
          };

          const hasAnySelected = updatedChildren.some(hasSelectedDescendant);
          if (!hasAnySelected && node.assigned) {
            return {
              ...node,
              assigned: false,
              children: updatedChildren
            };
          }
        }

        return {
          ...node,
          assigned: node.assigned,
          children: updatedChildren
        };
      });
    };

    let finalPermissions = afterStep1;
    if (!newState) {
      finalPermissions = step2Update(afterStep1);
    }

    setAllPermissions(finalPermissions);

    let afterStep1Filtered = step1Update(filteredPermissions);
    if (newState) {
      afterStep1Filtered = selectNodeAndChildren(clickedNode.id, afterStep1Filtered);
    } else {
      afterStep1Filtered = cancelNodeAndChildren(clickedNode.id, afterStep1Filtered);
    }

    let finalFiltered = afterStep1Filtered;
    if (!newState) {
      finalFiltered = step2Update(afterStep1Filtered);
    }

    setFilteredPermissions(finalFiltered);
  };

  // 渲染权限树节点（使用角色详情的权限树样式）
  const renderPermissionNode = (node: PermissionTreeNode, level: number = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const indent = level * 24;

    return (
      <div key={node.id} className="permission-node">
        <div
          className="flex items-center py-2 hover:bg-gray-50 cursor-pointer"
          style={{ paddingLeft: `${indent + 24}px` }}
          onClick={() => togglePermission(node)}
        >
          <div className="w-6 h-6 flex items-center justify-center mr-2">
            {hasChildren ? (
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(node.id);
                }}
              />
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>

          <div className="mr-3">
            {node.assigned ? (
              <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            ) : (
              <div className="w-5 h-5 rounded border border-gray-300" />
            )}
          </div>

          <div className="flex-1">
            <span className="text-sm text-gray-700">{node.permName}</span>
            <span className="text-xs text-gray-400 ml-2">({node.permCode})</span>
          </div>
        </div>

        {isExpanded && hasChildren && node.children.map(child => renderPermissionNode(child, level + 1))}
      </div>
    );
  };

  // 保存权限配置
  const handleSave = async () => {
    if (!role) return;

    try {
      setSaving(true);

      const selectedIds: number[] = [];
      const collectSelectedIds = (nodes: PermissionTreeNode[]) => {
        nodes.forEach(node => {
          if (node.assigned) {
            selectedIds.push(node.id);
          }
          if (node.children && node.children.length > 0) {
            collectSelectedIds(node.children);
          }
        });
      };
      collectSelectedIds(allPermissions);

      const response = await fetch(`/api/auth/roles/${role.id}/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('auth_token') || '',
        },
        body: JSON.stringify({
          permissionIds: selectedIds
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '保存权限配置失败');
      }

      const result = await response.json();
      if (result.code !== 200) {
        throw new Error(result.message || '保存权限配置失败');
      }

      if ((window as any).triggerRoleUpdate) {
        (window as any).triggerRoleUpdate({ ...role, permissions: selectedIds });
      }
      onClose(true);
    } catch (err) {
      console.error('保存权限配置失败:', err);
      toast.error(err instanceof Error ? err.message : '保存权限配置失败', 5000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper title="角色权限配置" onClose={onClose} widthClass="max-w-[800px]">
      <div className="flex-1 flex flex-col p-6">
        <div className="mb-4 flex items-center space-x-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="请输入权限名称"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
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

        <div className="flex-1 overflow-auto border border-gray-200 rounded-lg bg-white">
          {loading ? (
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
            <div className="p-4">
              <div className="flex items-center px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500 mb-2">
                <div className="w-8" />
                <div className="w-8" />
                <div className="flex-1">权限名称</div>
              </div>

              <div className="permission-tree">
                {filteredPermissions.map(node => renderPermissionNode(node))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-50 bg-white flex justify-end space-x-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-500 text-white px-8 py-2 rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {saving ? '保存中...' : '保存'}
        </button>
        <button
          onClick={() => onClose(false)}
          disabled={saving}
          className="bg-white text-gray-600 border border-gray-300 px-8 py-2 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          取消
        </button>
      </div>
    </ModalWrapper>
  );
}
