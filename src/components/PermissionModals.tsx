import { X, Search } from 'lucide-react';
import { Permission } from '../types';

interface PermissionModalProps {
  onClose: () => void;
  permission?: Permission;
}

export function PermissionModal({ onClose, permission }: PermissionModalProps) {
  const isEdit = !!permission;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-[680px] rounded-sm shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800">{isEdit ? '编辑权限' : '新增权限'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8 flex-grow overflow-y-auto max-h-[70vh]">
          <div className="mb-6">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              <span className="text-red-500 mr-1">*</span>权限名称
            </label>
            <input 
              type="text" 
              defaultValue={permission?.name || ''}
              placeholder="输入权限名称" 
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all" 
              maxLength={64}
            />
            <div className="mt-1 flex justify-between text-xs text-gray-400">
              <span>最大长度64个字符，允许中文、英文字母、数字或特殊符号</span>
              <span>0/64</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              权限说明
            </label>
            <textarea 
              defaultValue={permission?.description || ''}
              placeholder="输入权限说明，便于记忆哦" 
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all min-h-[100px] resize-y"
            ></textarea>
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              <span className="text-red-500 mr-1">*</span>产品服务
            </label>
            <select className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all text-gray-600 appearance-none bg-white">
              <option value="">请选择产品服务</option>
            </select>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end space-x-3">
          <button onClick={onClose} className="bg-blue-500 text-white px-8 py-2 rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm">提交</button>
          <button onClick={onClose} className="bg-white text-gray-600 border border-gray-300 px-8 py-2 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">取消</button>
        </div>
      </div>
    </div>
  );
}

export function BatchAuthorizeModal({ onClose, permission }: { onClose: () => void, permission?: Permission }) {
  // Let's create some dummy roles
  const roles = Array.from({ length: 9 }, (_, i) => ({
    id: `role-${i + 1}`,
    name: `角色${i + 1}`,
    description: `角色说明${i + 1}`
  }));

  // Let's create some dummy users
  const users = Array.from({ length: 5 }, (_, i) => ({
    id: `user-${i + 1}`,
    account: `user${i + 1}`,
    name: `用户${i + 1}`
  }));

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-[680px] rounded-sm shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800">批量授权</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8 flex-grow overflow-y-auto max-h-[70vh]">
          <div className="mb-6">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              <span className="text-red-500 mr-1">*</span>策略名称
            </label>
            <input 
              type="text" 
              readOnly
              disabled
              value={permission?.name || ''}
              className="w-full border border-gray-200 bg-gray-100 rounded-sm px-3 py-2 text-sm text-gray-400 cursor-not-allowed select-none" 
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              选择角色
            </label>
            <div className="relative mb-2">
              <input 
                type="text" 
                placeholder="请输入角色名称或角色说明" 
                className="w-full border border-gray-300 rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all" 
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <Search className="w-4 h-4" />
              </button>
            </div>
            <div className="text-red-500 text-sm mb-2">请选择角色</div>
            
            <div className="border border-gray-100 rounded-sm overflow-hidden flex flex-col max-h-[300px]">
              <div className="overflow-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 text-gray-500 sticky top-0 z-10 border-b border-gray-100">
                    <tr>
                      <th className="p-3 w-16 text-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
                      </th>
                      <th className="p-3 font-medium text-center">角色名称</th>
                      <th className="p-3 font-medium text-center">角色说明</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {roles.map((role) => (
                      <tr key={role.id} className="transition-colors hover:bg-gray-50">
                        <td className="p-3 text-center">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
                        </td>
                        <td className="p-3 text-center text-gray-700">{role.name}</td>
                        <td className="p-3 text-center text-gray-700">{role.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mb-2">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              选择用户
            </label>
            <div className="relative mb-2">
              <input 
                type="text" 
                placeholder="请输入用户账号或名称" 
                className="w-full border border-gray-300 rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all" 
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <Search className="w-4 h-4" />
              </button>
            </div>
            <div className="text-red-500 text-sm mb-2">请选择用户</div>
            
            <div className="border border-gray-100 rounded-sm overflow-hidden flex flex-col max-h-[300px]">
              <div className="overflow-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 text-gray-500 sticky top-0 z-10 border-b border-gray-100">
                    <tr>
                      <th className="p-3 w-16 text-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
                      </th>
                      <th className="p-3 font-medium text-center">用户账号</th>
                      <th className="p-3 font-medium text-center">用户名称</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user.id} className="transition-colors hover:bg-gray-50">
                        <td className="p-3 text-center">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
                        </td>
                        <td className="p-3 text-center text-gray-700">{user.account}</td>
                        <td className="p-3 text-center text-gray-700">{user.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end space-x-3">
          <button onClick={onClose} className="bg-blue-500 text-white px-8 py-2 rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm">提交</button>
          <button onClick={onClose} className="bg-white text-gray-600 border border-gray-300 px-8 py-2 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">取消</button>
        </div>
      </div>
    </div>
  );
}
