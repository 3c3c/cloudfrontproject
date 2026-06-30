/**
 * 角色管理相关模态框组件
 * 连接真实的角色管理 API
 */

import { useState, type FormEvent, type ReactNode } from 'react';
import { X, AlertTriangle, Search } from 'lucide-react';
import { Role } from '../types';
import { mockUsers, mockPermissions } from '../data';
import { roleAPI } from '../api/roleApi';
import { toast } from '../utils/toastHelpers';

interface BaseModalProps {
  onClose: (shouldRefresh?: boolean) => void;
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
  const [roleName, setRoleName] = useState('');
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
    if (!roleName.trim()) {
      setError('角色名称不能为空');
      return;
    }
    if (roleCode.length > 50) {
      setError('角色编码最大长度为50个字符');
      return;
    }
    if (roleName.length > 50) {
      setError('角色名称最大长度为50个字符');
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
        roleName,
        remark,
        enabled: enabled ? 1 : 0,
      });
      // 创建成功，显示成功提示并关闭模态框（触发刷新）
      toast.success('角色创建成功', 3000);
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
            <label className="block mb-2 text-sm font-normal text-gray-700">
              <span className="text-red-500 mr-1">*</span>角色名称
            </label>
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="请输入角色名称"
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all"
              maxLength={50}
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-gray-400">最大长度50个字符</span>
              <span className="text-xs text-gray-400">{roleName.length}/50</span>
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
  const [roleName, setRoleName] = useState(role?.roleName || '');
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
    if (!roleName.trim()) {
      setError('角色名称不能为空');
      return;
    }
    if (roleCode.length > 50) {
      setError('角色编码最大长度为50个字符');
      return;
    }
    if (roleName.length > 50) {
      setError('角色名称最大长度为50个字符');
      return;
    }
    if (remark.length > 200) {
      setError('角色说明最大长度为200个字符');
      return;
    }

    try {
      setLoading(true);
      await roleAPI.updateRole(role.id, {
        roleCode,
        roleName,
        remark,
        enabled: enabled ? 1 : 0,
      });
      // 更新成功，显示成功提示并关闭模态框（触发刷新）
      toast.success('角色更新成功', 3000);
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
          <div className="bg-amber-50/80 border border-amber-200/50 p-3 rounded flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 leading-tight">
              温馨提示：修改角色信息可能会影响已分配该角色的用户权限，请谨慎操作。
            </p>
          </div>

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
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 text-sm focus:outline-none"
              maxLength={50}
            />
            <div className="flex justify-between text-xs text-gray-400 pt-1">
              <span>最大长度50个字符</span>
              <span>{roleCode.length}/50</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              <span className="text-red-500 mr-1">*</span>角色名称
            </label>
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 text-sm focus:outline-none"
              maxLength={50}
            />
            <div className="flex justify-between text-xs text-gray-400 pt-1">
              <span>最大长度50个字符</span>
              <span>{roleName.length}/50</span>
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
            {mockUsers.slice(0, 3).map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">{user.account}</td>
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3">
                  <button className="text-red-500 hover:text-red-600 text-sm">移除</button>
                </td>
              </tr>
            ))}
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
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  const togglePermission = (permissionId: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  return (
    <ModalWrapper title="角色权限配置" onClose={onClose} widthClass="max-w-[800px]">
      <div className="flex-1 flex flex-col p-6">
        <div className="mb-4 flex items-center justify-between">
          <input
            type="text"
            placeholder="请输入权限名称"
            className="flex-1 mr-4 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          />
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded text-sm hover:bg-emerald-600 transition-colors">
              全选
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors">
              保存
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto border rounded p-4">
          <div className="grid grid-cols-2 gap-4">
            {mockPermissions.map((permission) => (
              <div key={permission.id} className="flex items-center p-3 border rounded hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedPermissions.has(permission.id)}
                  onChange={() => togglePermission(permission.id)}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{permission.name}</div>
                  <div className="text-sm text-gray-500">{permission.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-50 bg-white flex justify-end">
        <button onClick={onClose} className="bg-white text-gray-600 border border-gray-300 px-8 py-2 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
          关闭
        </button>
      </div>
    </ModalWrapper>
  );
}
