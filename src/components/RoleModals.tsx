import { type ReactNode } from 'react';
import { X, AlertTriangle, Search } from 'lucide-react';
import { Role } from '../types';
import { mockUsers, mockPermissions } from '../data';

interface BaseModalProps {
  onClose: () => void;
}

function ModalWrapper({ children, title, onClose, widthClass = "max-w-[680px]" }: { children: ReactNode, title: string, onClose: () => void, widthClass?: string }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className={`bg-white w-full ${widthClass} rounded-sm shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function CreateRoleModal({ onClose }: BaseModalProps) {
  return (
    <ModalWrapper title="创建角色" onClose={onClose}>
      <div className="p-8 flex-grow">
        <div className="mb-6">
          <label className="block mb-2 text-sm font-normal text-gray-700">
            <span className="text-red-500 mr-1">*</span>角色名称
          </label>
          <input 
            type="text" 
            placeholder="请输入唯一的角色名称" 
            className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all"
            maxLength={64}
          />
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-gray-400">最大长度64个字符，允许中文、英文字母、数字或特殊符号</span>
            <span className="text-xs text-gray-400">0/64</span>
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-normal text-gray-700">角色说明</label>
          <textarea 
            placeholder="输入角色说明，便于记忆哦" 
            className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all min-h-[100px] resize-y"
          ></textarea>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-gray-50 bg-white flex justify-end space-x-3">
        <button onClick={onClose} className="bg-blue-500 text-white px-8 py-2 rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm">提交</button>
        <button onClick={onClose} className="bg-white text-gray-600 border border-gray-300 px-8 py-2 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">取消</button>
      </div>
    </ModalWrapper>
  );
}

export function EditRoleModal({ onClose, role }: BaseModalProps & { role?: Role }) {
  return (
    <ModalWrapper title="编辑角色" onClose={onClose} widthClass="max-w-[500px]">
      <div className="flex-1 px-6 py-6 space-y-6">
        <div className="bg-amber-50/80 border border-amber-200/50 p-3 rounded flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 leading-tight">
            温馨提示：修改角色权限可能会影响已分配该角色的用户权限，请谨慎操作。
          </p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            <span className="text-red-500 mr-1">*</span>角色名称
          </label>
          <input 
            type="text" 
            defaultValue={role?.name || "运营经理"}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 text-sm focus:outline-none" 
          />
          <div className="flex justify-between text-xs text-gray-400 pt-1">
            <span>最大长度64个字符，允许中文、英文字母、数字或特殊符号</span>
            <span>4/64</span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">角色说明</label>
          <textarea 
            placeholder="输入角色说明，便于记忆哦" 
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 text-sm min-h-[100px] resize-y focus:outline-none"
          ></textarea>
        </div>

        <div className="flex items-center justify-between py-2">
          <label className="text-sm font-medium text-gray-700">角色状态</label>
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
            <span className="ml-3 text-sm text-gray-600">已开启</span>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-100">
        <button onClick={onClose} className="px-8 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded shadow-sm transition-colors">提交</button>
        <button onClick={onClose} className="px-8 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded border border-gray-300 shadow-sm transition-colors">取消</button>
      </div>
    </ModalWrapper>
  );
}

export function RoleMemberModal({ onClose, role }: BaseModalProps & { role?: Role }) {
  return (
    <ModalWrapper title="角色成员管理" onClose={onClose}>
      <div className="p-6 overflow-y-auto max-h-[75vh]">
        <div className="bg-orange-50 border border-orange-100 rounded-md p-3 flex items-center mb-6">
          <AlertTriangle className="h-5 w-5 text-orange-400 mr-2 shrink-0" />
          <p className="text-sm text-gray-700">用户加入到角色后，将拥有该角色的所有权限。</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="text-red-500 mr-1">*</span>角色名称
          </label>
          <input 
            type="text" 
            value={role?.name || "角色名称"}
            disabled
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-500 focus:outline-none text-sm" 
          />
        </div>

        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">选择用户</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="请输入用户账号或名称" 
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <p className="mt-1 text-xs text-red-500">请选择用户</p>
        </div>

        <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
          <div className="max-h-[300px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500" />
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">用户账号</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">用户名称</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {mockUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500" /></td>
                    <td className="px-4 py-3 text-gray-700">{u.account}</td>
                    <td className="px-4 py-3 text-gray-700">{u.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-white">
        <button onClick={onClose} className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium transition-colors">提交</button>
        <button onClick={onClose} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors">取消</button>
      </div>
    </ModalWrapper>
  );
}

export function RolePermissionModal({ onClose, role }: BaseModalProps & { role?: Role }) {
  return (
    <ModalWrapper title="角色权限管理" onClose={onClose}>
      <div className="p-6 overflow-y-auto max-h-[75vh]">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            <span className="text-red-500 mr-1">*</span>角色名称
          </label>
          <input 
            type="text" 
            value={role?.name || "角色名称"}
            disabled
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-500 focus:outline-none text-sm" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">选择权限</label>
          <div className="relative mb-2">
            <input 
              type="text" 
              placeholder="请输入权限策略名称或说明" 
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 cursor-pointer" />
          </div>
          <p className="text-red-500 text-xs mb-3">请选择权限策略</p>

          <div className="border border-gray-200 rounded overflow-hidden">
            <div className="max-h-[350px] overflow-y-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200 shadow-sm">
                  <tr>
                    <th className="p-3 w-12 text-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500" />
                    </th>
                    <th className="p-3 text-center font-medium text-gray-500">权限名称</th>
                    <th className="p-3 text-center font-medium text-gray-500">权限说明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockPermissions.map((p, i) => (
                    <tr key={p.id} className={`transition-colors ${i === 1 ? 'bg-blue-50/50' : 'hover:bg-blue-50/30'}`}>
                      <td className="p-3 text-center"><input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500" /></td>
                      <td className={`p-3 text-center ${i === 1 ? 'text-blue-500' : 'text-gray-700'}`}>{p.name}</td>
                      <td className="p-3 text-center text-gray-600">{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 gap-3">
        <button onClick={onClose} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded text-sm font-medium transition-colors">提交</button>
        <button onClick={onClose} className="bg-white hover:bg-gray-50 text-gray-600 border border-gray-300 px-8 py-2 rounded text-sm font-medium transition-colors">取消</button>
      </div>
    </ModalWrapper>
  );
}
