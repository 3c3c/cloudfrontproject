import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, RefreshCw, CheckSquare } from 'lucide-react';
import { User } from '../types';
import { roleAPI, type RoleResponse } from '../api/roleApi';
import { userAPI, type UserResponse } from '../api/userApi';
import { ConfirmModal } from './ConfirmModal';
import { toast } from '../utils/toastHelpers';

interface UserDetailProps {
  refreshKey?: number;
  openModal: (type: 'editUser' | 'selectRole' | 'userPermission' | 'resetPassword', user: User) => void;
  onUserDataUpdate?: (updatedUser: User) => void;
}

// UserResponse(API) → User(前端) 映射
function mapUser(u: UserResponse): User {
  if (!u) {
    throw new Error('用户数据为空');
  }
  return {
    id: String(u.id), // 确保ID是字符串类型
    account: u.username,
    username: u.username,
    name: u.nickname,
    nickname: u.nickname,
    status: u.enabled === 1,
    phone: u.mobile,
    mobile: u.mobile,
    email: u.email,
    avatar: u.avatar,
    createTime: u.createTime,
    updateTime: u.updateTime,
    createdBy: u.createdBy,
    updatedBy: u.updatedBy,
  };
}

export function UserDetail({ refreshKey, openModal, onUserDataUpdate }: UserDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [keyword, setKeyword] = useState('');
  // 用 ref 保存最新搜索词，使 loadRoles 不依赖 keyword
  const keywordRef = useRef(keyword);
  keywordRef.current = keyword;
  const [rolesLoading, setRolesLoading] = useState(false);
  const [pendingDeleteRole, setPendingDeleteRole] = useState<RoleResponse | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [enabled, setEnabled] = useState(false);

  // 按 URL 的 id 加载用户详情
  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const loadUserData = async () => {
      try {
        setLoading(true);
        const data = await userAPI.getUserById(id);

        if (!cancelled) {
          const u = mapUser(data);
          setUser(u);
          setEnabled(u.status);
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : '加载用户详情失败', 5000);
          setTimeout(() => {
            navigate('/users');
          }, 100);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadUserData();

    return () => {
      cancelled = true;
    };
  }, [id]); // 只依赖 id

  // 加载用户已拥有的角色列表
  const loadRoles = useCallback(async (kw?: string) => {
    if (!user?.id) return;
    try {
      setRolesLoading(true);
      const data = await roleAPI.getRolesByUserId(user.id, kw);
      setRoles(data);
    } catch (error) {
      console.error('加载用户角色列表失败:', error);
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  }, [user?.id]); // 只依赖 user.id，避免整个 user 对象变化时触发

  const handleSearch = () => {
    loadRoles(keywordRef.current || undefined);
  };

  // 删除用户角色（解除该用户与角色的绑定关系）
  const handleDelete = (role: RoleResponse) => {
    setPendingDeleteRole(role);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteRole = async () => {
    if (!pendingDeleteRole || !user) return;
    try {
      await roleAPI.deleteUserRoles(user.id, [pendingDeleteRole.id]);
      setShowDeleteConfirm(false);
      setPendingDeleteRole(null);
      await loadRoles(keywordRef.current || undefined);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除用户角色失败', 5000);
    }
  };

  // 切换用户启用/禁用状态
  const handleToggleStatus = async () => {
    if (!user) return;
    const next = !enabled;
    try {
      await userAPI.updateUserStatus(user.id, next ? 1 : 0);
      setEnabled(next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新用户状态失败', 5000);
    }
  };

  // 监听全局的用户数据更新
  useEffect(() => {
    const handleUserUpdate = () => {
      const updatedUserData = (window as any).updatedUserData;
      if (updatedUserData && user && String(updatedUserData.id) === String(user.id)) {
        // 是当前用户，直接更新本地数据
        setUser(updatedUserData);
        // 清除全局数据
        (window as any).updatedUserData = null;
      }
    };

    // 监听 global update event
    window.addEventListener('userUpdated', handleUserUpdate);

    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, [user]);

  // 触发全局更新的函数
  useEffect(() => {
    (window as any).triggerUserUpdate = (updatedUser: UserResponse) => {
      (window as any).updatedUserData = updatedUser;
      window.dispatchEvent(new Event('userUpdated'));
    };
  }, []);

  // 用户就绪后加载角色（refreshKey 变化时也重新加载）
  useEffect(() => {
    if (user?.id) {
      loadRoles();
    }
  }, [user?.id, refreshKey, loadRoles]); // 只依赖 user.id，避免重复调用

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden h-full">
      <header className="px-8 pt-6 pb-4 shrink-0">
        <div className="text-xs text-gray-400 mb-3">
          用户管理 / <span className="text-gray-500">{user.account}</span>
        </div>
        <div className="flex items-center text-xl font-bold text-gray-800">
          <button onClick={() => navigate('/users')} className="mr-3 text-gray-500 hover:text-blue-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          {user.account}
        </div>
      </header>

      <section className="px-8 py-4 shrink-0">
        <div className="flex items-center mb-6">
          <h2 className="font-bold text-base mr-6 text-gray-800">用户基本信息</h2>
          <button onClick={() => openModal('editUser', user)} className="text-blue-500 text-sm mr-6 hover:underline">编辑基本信息</button>
          <button onClick={() => openModal('resetPassword', user)} className="text-orange-500 text-sm hover:underline">重置密码</button>
        </div>
        <div className="flex gap-x-12">
          <div className="shrink-0">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover border border-gray-200" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-3xl font-semibold border border-blue-200">
                {(user.name || user.account || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm flex-1 max-w-3xl">
            <div className="flex items-center">
              <span className="w-24 text-gray-500">用户账号</span>
              <span className="text-gray-800">{user.account}</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 text-gray-500">用户名称</span>
              <span className="text-gray-800">{user.name}</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 text-gray-500">手机号码</span>
              <span className="text-gray-800">{user.phone}</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 text-gray-500">电子邮箱</span>
              <span className="text-gray-800">{user.email}</span>
            </div>
            <div className="flex items-center col-span-2">
              <span className="w-24 text-gray-500">用户状态</span>
              <div className="flex items-center">
                <span className={`mr-3 text-sm ${enabled ? 'text-blue-500' : 'text-gray-400'}`}>{enabled ? '启用' : '禁用'}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={enabled} onChange={handleToggleStatus} className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 mt-2 shrink-0">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-8 py-2.5 text-sm font-medium transition-colors rounded-t-md ${activeTab === 'roles' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-r border-t border-gray-200'}`}
          >
            角色管理
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-8 py-2.5 text-sm font-medium transition-colors rounded-t-md ${activeTab === 'permissions' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-r border-t border-gray-200'}`}
          >
            权限管理
          </button>
        </div>
      </section>

      <section className="px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => openModal(activeTab === 'roles' ? 'selectRole' : 'userPermission', user)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded shadow-sm hover:bg-blue-600 transition-colors text-sm"
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            {activeTab === 'roles' ? '选择角色' : '添加权限'}
          </button>
          <div className="relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={activeTab === 'roles' ? '请输入角色编码或说明' : '请输入权限策略名称或说明'}
              className="w-64 pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
        <button
          onClick={() => loadRoles(keywordRef.current || undefined)}
          className="text-blue-500 hover:rotate-180 transition-transform duration-500"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </section>

      <section className="px-8 flex-1 overflow-auto pb-8">
        <table className="w-full text-center text-sm border-collapse">
          <thead className="bg-gray-50 text-gray-500 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 font-medium border-b border-gray-200 w-1/3">角色编码</th>
              <th className="px-6 py-3 font-medium border-b border-gray-200 w-1/3">角色说明</th>
              <th className="px-6 py-3 font-medium border-b border-gray-200">操作</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {rolesLoading ? (
              <tr>
                <td colSpan={3} className="px-6 py-3.5 text-center text-gray-400">加载中...</td>
              </tr>
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-3.5 text-center text-gray-400">暂无数据</td>
              </tr>
            ) : roles.map((r, i) => (
              <tr key={r.id} className={`transition-colors ${i === 0 ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                <td className="px-6 py-3.5 border-b border-gray-100">{r.roleCode}</td>
                <td className="px-6 py-3.5 border-b border-gray-100">{r.remark || '-'}</td>
                <td className="px-6 py-3.5 border-b border-gray-100">
                  <button onClick={() => handleDelete(r)} className="text-red-500 hover:text-red-600 transition-colors text-sm">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 删除用户角色确认弹框 */}
      {pendingDeleteRole && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          title="删除角色"
          message={`确定要删除该用户的角色"${pendingDeleteRole.roleCode}"吗？`}
          type="danger"
          confirmText="删除"
          cancelText="取消"
          onConfirm={confirmDeleteRole}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setPendingDeleteRole(null);
          }}
          details={['删除后，用户将失去该角色的所有权限。']}
        />
      )}
    </div>
  );
}
