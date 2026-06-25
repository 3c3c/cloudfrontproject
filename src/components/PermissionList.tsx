import { Search, RefreshCw, X, Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Permission } from '../types';

interface PermissionListProps {
  permissions: Permission[];
  openModal: (type: 'createPermission' | 'editPermission' | 'batchAuthorize', data?: Permission) => void;
}

export function PermissionList({ permissions, openModal }: PermissionListProps) {
  return (
    <div className="flex-1 flex flex-col p-8 overflow-hidden">
      <div className="flex items-center mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-gray-800 mr-3">权限策略</h2>
        <div className="group relative w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs cursor-pointer">
          i
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-center font-normal">
            管理系统的权限策略，以便分配给角色或用户。
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 shrink-0">
          <div className="flex space-x-3">
            <button onClick={() => openModal('createPermission')} className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded text-sm transition-colors flex items-center shadow-sm">
              <span className="w-4 h-4 mr-2 border border-white flex items-center justify-center opacity-80">
                <Plus className="w-3 h-3" />
              </span>
              添加权限
            </button>
            <div className="relative">
              <input 
                type="text" 
                placeholder="请输入权限名称或说明" 
                className="w-64 pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-shadow"
              />
              <button className="absolute right-3 top-2.5 text-gray-400">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button className="text-blue-500 hover:text-blue-600 transition-colors bg-blue-50 p-2 rounded-full">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="border border-gray-100 rounded-sm overflow-hidden flex-1 flex flex-col shadow-sm">
          <div className="overflow-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="p-4 w-16 text-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
                  </th>
                  <th className="p-4 font-medium text-center">权限名称</th>
                  <th className="p-4 font-medium text-center">权限说明</th>
                  <th className="p-4 font-medium text-center w-48">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {permissions.map((perm, i) => (
                  <tr key={perm.id} className="transition-colors hover:bg-blue-50">
                    <td className="p-4 text-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
                    </td>
                    <td className="p-4 text-center text-gray-700">{perm.name}</td>
                    <td className="p-4 text-center text-gray-700">{perm.description}</td>
                    <td className="p-4">
                      <div className="flex justify-center space-x-4">
                        <button onClick={() => openModal('batchAuthorize', perm)} className="text-blue-500 hover:text-blue-700 text-sm">批量授权</button>
                        <button onClick={() => openModal('editPermission', perm)} className="text-emerald-500 hover:text-emerald-700 text-sm">编辑权限</button>
                        <button className="text-red-500 hover:text-red-700 text-sm">删除权限</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="border-t border-gray-100 p-4 bg-white flex justify-between items-center shrink-0">
            <div className="flex space-x-3">
              <button className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded text-sm transition-colors flex items-center shadow-sm">
                <Trash2 className="w-4 h-4 mr-1 opacity-70" /> 批量删除
              </button>
            </div>
            
            <div className="flex space-x-1 items-center">
              <button className="p-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-50"><ChevronLeft className="w-4 h-4" /></button>
              <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">1</button>
              <button className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 text-sm">2</button>
              <button className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 text-sm">3</button>
              <button className="p-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
    </div>
  );
}
