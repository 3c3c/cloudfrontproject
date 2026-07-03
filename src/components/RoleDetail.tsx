/**
 * 角色详情组件
 * 显示角色详细信息与权限（按 URL 的 id 加载）
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusSquare, Search, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Role } from '../types';
import { roleAPI } from '../api/roleApi';
import { toast } from '../utils/toastHelpers';

interface RoleDetailProps {
  refreshKey?: number;
  openModal: (type: 'editRole' | 'roleMember' | 'rolePermission', role?: Role) => void;
}

export function RoleDetail({ refreshKey, openModal }: RoleDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await roleAPI.getRoleById(Number(id));
        if (!cancelled) setRole(data);
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : '加载角色详情失败', 5000);
          navigate('/roles');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, refreshKey, navigate]);

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
          角色管理 / <span className="text-gray-500">{role.roleName}</span>
        </div>
        <div className="flex items-center text-xl font-bold text-gray-800">
          <button onClick={() => navigate('/roles')} className="mr-3 text-gray-500 hover:text-blue-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          {role.roleName}
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
            <span className="w-24 text-gray-500">角色名称</span>
            <span className="text-gray-800">{role.roleName}</span>
          </div>
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
                  disabled
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
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
              className="w-64 pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-gray-400 space-x-1">
              <X className="w-3 h-3 cursor-pointer hover:text-gray-600" />
              <div className="w-px h-3 bg-gray-300 mx-1"></div>
              <Search className="w-4 h-4 cursor-pointer hover:text-gray-600" />
            </div>
          </div>
        </div>
        <button className="text-blue-500 hover:rotate-180 transition-transform duration-500">
          <RefreshCw className="w-5 h-5" />
        </button>
      </section>

      <section className="px-8 flex-1 overflow-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-gray-50 text-gray-500 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 font-medium border-b border-gray-200 w-1/3">权限名称</th>
              <th className="px-6 py-3 font-medium border-b border-gray-200 w-1/3">权限说明</th>
              <th className="px-6 py-3 font-medium border-b border-gray-200">操作</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            <tr>
              <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                暂无权限数据
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <footer className="px-8 py-4 border-t border-gray-100 flex justify-end shrink-0 bg-white">
        <div className="flex items-center space-x-1 text-gray-500">
          <button className="p-1 border border-gray-300 rounded hover:bg-gray-50"><ChevronLeft className="w-4 h-4" /></button>
          <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">1</button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">2</button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">3</button>
          <span className="px-2 text-sm">...</span>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">10</button>
          <button className="p-1 border border-gray-300 rounded hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </footer>
    </div>
  );
}
