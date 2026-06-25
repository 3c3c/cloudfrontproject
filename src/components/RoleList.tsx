import { Plus, Search, RefreshCw, ChevronLeft, ChevronRight, CheckCircle2, Ban, Trash2 } from 'lucide-react';
import { Role } from '../types';

interface RoleListProps {
  roles: Role[];
  onViewDetail: (role: Role) => void;
  openModal: (type: 'createRole' | 'editRole' | 'roleMember' | 'rolePermission', role?: Role) => void;
}

export function RoleList({ roles, onViewDetail, openModal }: RoleListProps) {
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
              className="border border-gray-300 rounded-full pl-4 pr-10 py-2 w-64 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <button className="absolute right-3 top-2.5 text-gray-400">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
        <button className="text-blue-500 hover:text-blue-700 transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white rounded-sm shadow-sm overflow-hidden border border-gray-200 flex-1 flex flex-col min-h-0">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="p-4 w-12"><input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500" /></th>
                <th className="p-4 font-medium">角色名称</th>
                <th className="p-4 font-medium text-center">角色说明</th>
                <th className="p-4 font-medium text-center">角色状态</th>
                <th className="p-4 font-medium text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="p-4"><input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500" /></td>
                  <td className="p-4">
                    <button onClick={() => onViewDetail(role)} className="hover:text-blue-500 transition-colors font-medium text-gray-700">
                      {role.name}
                    </button>
                  </td>
                  <td className="p-4 text-center text-gray-600">{role.description}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-blue-500 text-sm">启用</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={role.status} className="sr-only peer" />
                        <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center space-x-4">
                      <button onClick={() => openModal('roleMember', role)} className="text-blue-500 hover:text-blue-700 text-sm">角色成员</button>
                      <button onClick={() => openModal('rolePermission', role)} className="text-emerald-500 hover:text-emerald-700 text-sm">角色权限</button>
                      <button className="text-red-500 hover:text-red-700 text-sm">删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="border-t border-gray-100 p-4 bg-white flex justify-between items-center shrink-0">
          <div className="flex space-x-3">
            <button className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded text-sm transition-colors flex items-center shadow-sm">
              <CheckCircle2 className="w-4 h-4 mr-1 opacity-70" /> 批量启用
            </button>
            <button className="bg-orange-400 text-white hover:bg-orange-500 px-4 py-2 rounded text-sm transition-colors flex items-center shadow-sm">
              <Ban className="w-4 h-4 mr-1 opacity-70" /> 批量禁用
            </button>
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
