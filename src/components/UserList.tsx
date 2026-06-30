import { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw, X, CheckCircle2, Ban, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { User } from '../types';
import { userAPI } from '../api/userApi';

interface UserListProps {
  refreshKey?: number;
  onViewDetail: (user: User) => void;
  openModal: (type: 'createUser' | 'selectRole' | 'userPermission', user?: User) => void;
}

export function UserList({ refreshKey, onViewDetail, openModal }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  // 加载用户列表
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUserList({
        current: currentPage,
        size: pageSize,
        keyword: keyword || undefined,
      });

      // 转换API响应数据为前端User类型
      const transformedUsers: User[] = response.records.map(user => ({
        id: user.id,
        account: user.username,
        username: user.username,
        name: user.nickname,
        nickname: user.nickname,
        status: user.enabled === 1,
        phone: user.mobile,
        mobile: user.mobile,
        email: user.email,
        avatar: user.avatar,
        createTime: user.createTime,
        updateTime: user.updateTime,
        createdBy: user.createdBy,
        updatedBy: user.updatedBy,
      }));

      setUsers(transformedUsers);
      setTotal(response.total);
      setTotalPages(response.pages);
    } catch (error) {
      console.error('加载用户列表失败:', error);
      // 可以在这里添加错误提示
    } finally {
      setLoading(false);
    }
  };

  // 搜索用户
  const handleSearch = () => {
    setCurrentPage(1);
    loadUsers();
  };

  // 清空搜索
  const handleClearSearch = () => {
    setKeyword('');
    setCurrentPage(1);
    loadUsers();
  };

  // 刷新列表
  const handleRefresh = () => {
    loadUsers();
  };

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(users.map(u => u.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  // 选择单个用户
  const handleSelectUser = (userId: number, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  // 切换用户状态
  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = user.status ? 0 : 1;
      await userAPI.updateUserStatus(user.id, newStatus);

      // 只更新本地状态，不重新加载列表
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === user.id ? { ...u, status: !u.status } : u
        )
      );
    } catch (error) {
      console.error('更新用户状态失败:', error);
      // 可以在这里添加错误提示
    }
  };

  // 删除单个用户
  const handleDeleteUser = async (userId: number) => {
    if (!confirm('确定要删除该用户吗？')) {
      return;
    }

    try {
      await userAPI.deleteUser(userId);

      // 只更新本地状态，不重新加载列表
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      setTotal(prev => prev - 1);
    } catch (error) {
      console.error('删除用户失败:', error);
      // 可以在这里添加错误提示
    }
  };

  // 批量启用用户
  const handleBatchEnable = async () => {
    if (selectedUsers.size === 0) {
      alert('请先选择要操作的用户');
      return;
    }

    try {
      await userAPI.batchUpdateUserStatus(Array.from(selectedUsers), 1);

      // 只更新本地状态，不重新加载列表
      setUsers(prevUsers =>
        prevUsers.map(u =>
          selectedUsers.has(u.id) ? { ...u, status: true } : u
        )
      );
      setSelectedUsers(new Set());
    } catch (error) {
      console.error('批量启用失败:', error);
      // 可以在这里添加错误提示
    }
  };

  // 批量禁用用户
  const handleBatchDisable = async () => {
    if (selectedUsers.size === 0) {
      alert('请先选择要操作的用户');
      return;
    }

    try {
      await userAPI.batchUpdateUserStatus(Array.from(selectedUsers), 0);

      // 只更新本地状态，不重新加载列表
      setUsers(prevUsers =>
        prevUsers.map(u =>
          selectedUsers.has(u.id) ? { ...u, status: false } : u
        )
      );
      setSelectedUsers(new Set());
    } catch (error) {
      console.error('批量禁用失败:', error);
      // 可以在这里添加错误提示
    }
  };

  // 批量删除用户
  const handleBatchDelete = async () => {
    if (selectedUsers.size === 0) {
      alert('请先选择要操作的用户');
      return;
    }

    if (!confirm(`确定要删除选中的 ${selectedUsers.size} 个用户吗？`)) {
      return;
    }

    try {
      await userAPI.batchDeleteUsers(Array.from(selectedUsers));

      // 只更新本地状态，不重新加载列表
      setUsers(prevUsers => prevUsers.filter(u => !selectedUsers.has(u.id)));
      setSelectedUsers(new Set());
      setTotal(prev => prev - selectedUsers.size);
    } catch (error) {
      console.error('批量删除失败:', error);
      // 可以在这里添加错误提示
    }
  };

  // 翻页
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // 初始加载、搜索变化和refreshKey变化时重新加载
  useEffect(() => {
    loadUsers();
  }, [currentPage, refreshKey]);

  // 检查是否全选
  const isAllSelected = users.length > 0 && selectedUsers.size === users.length;
  const isPartiallySelected = selectedUsers.size > 0 && selectedUsers.size < users.length;

  return (
    <div className="flex-1 flex flex-col p-8 overflow-hidden">
      <div className="flex items-center mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-gray-800 mr-3">用户管理</h2>
        <div className="group relative w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs cursor-pointer">
          i
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-center font-normal">
            管理系统中的用户，可为其分配角色或直接授权。
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => openModal('createUser')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow-sm flex items-center text-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" /> 添加用户
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="请输入用户名称或账号"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="border border-gray-300 rounded-full pl-4 pr-10 py-2 w-64 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
            {keyword && (
              <button
                onClick={handleClearSearch}
                className="absolute right-8 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="text-blue-500 hover:text-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-sm shadow-sm overflow-hidden border border-gray-200 flex-1 flex flex-col min-h-0">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = isPartiallySelected;
                        input.checked = isAllSelected;
                      }
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                </th>
                <th className="p-4 font-medium text-center">用户账号</th>
                <th className="p-4 font-medium text-center">用户名称</th>
                <th className="p-4 font-medium text-center">手机号码</th>
                <th className="p-4 font-medium text-center">电子邮箱</th>
                <th className="p-4 font-medium text-center">用户状态</th>
                <th className="p-4 font-medium text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    加载中...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    暂无数据
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => onViewDetail(user)}
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                  >
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-4 text-center text-gray-700">{user.account}</td>
                    <td className="p-4 text-center text-gray-700">{user.name}</td>
                    <td className="p-4 text-center text-gray-700">{user.phone || '-'}</td>
                    <td className="p-4 text-center text-gray-700">{user.email || '-'}</td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center space-x-2">
                        <span className={`text-sm ${user.status ? 'text-blue-500' : 'text-gray-400'}`}>
                          {user.status ? '启用' : '禁用'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={user.status}
                            onChange={() => handleToggleStatus(user)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={() => openModal('selectRole', user)}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          角色选择
                        </button>
                        <button
                          onClick={() => openModal('userPermission', user)}
                          className="text-emerald-500 hover:text-emerald-700 text-sm"
                        >
                          权限设置
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 p-4 bg-white flex justify-between items-center shrink-0">
          <div className="flex space-x-3">
            <button
              onClick={handleBatchEnable}
              disabled={selectedUsers.size === 0}
              className="bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed px-4 py-2 rounded text-sm transition-colors flex items-center shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 mr-1 opacity-70" /> 批量启用
            </button>
            <button
              onClick={handleBatchDisable}
              disabled={selectedUsers.size === 0}
              className="bg-orange-400 text-white hover:bg-orange-500 disabled:bg-gray-300 disabled:cursor-not-allowed px-4 py-2 rounded text-sm transition-colors flex items-center shadow-sm"
            >
              <Ban className="w-4 h-4 mr-1 opacity-70" /> 批量禁用
            </button>
            <button
              onClick={handleBatchDelete}
              disabled={selectedUsers.size === 0}
              className="bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed px-4 py-2 rounded text-sm transition-colors flex items-center shadow-sm"
            >
              <Trash2 className="w-4 h-4 mr-1 opacity-70" /> 批量删除
            </button>
          </div>

          <div className="flex space-x-1 items-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-500 text-white'
                      : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500 ml-2">
              共 {total} 条，第 {currentPage}/{totalPages} 页
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
