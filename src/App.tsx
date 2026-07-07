/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { RoleList } from './components/RoleList';
import { RoleDetail } from './components/RoleDetail';
import { UserList } from './components/UserList';
import { UserDetail } from './components/UserDetail';
import { PermissionManagement } from './components/PermissionManagement';
import { LogList } from './components/LogList';
import { CreateRoleModal, EditRoleModal, RoleMemberModal, RolePermissionModal } from './components/RoleModals';
import { CreateUserModal, EditUserModal, SelectRoleModal, UserPermissionModal, ResetPasswordModal } from './components/UserModals';
import { DictionaryManagement } from './components/DictionaryManagement';
import { Auth } from './components/Auth';
import { ModalState, Role, User } from './types';
import { generateMockLogs } from './data';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function MainApp() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  const handleOpenModal = (type: ModalState['type'], data?: Role | User) => {
    if (type === 'none' || type === 'createRole' || type === 'createUser') {
      setModalState({ type } as ModalState);
    } else if (type === 'editUser' && data) {
      setModalState({ type, user: data as User } as ModalState);
    } else if ((type === 'selectRole' || type === 'userPermission' || type === 'resetPassword') && data) {
      setModalState({ type, user: data as User } as ModalState);
    } else if (data) {
      setModalState({ type, role: data as Role } as ModalState);
    }
  };

  const handleCloseModal = (shouldRefresh = false) => {
    const currentType = modalState.type;
    setModalState({ type: 'none' });

    // 只有在明确需要刷新时才刷新列表
    // editRole 和 editUser 不触发刷新，通过全局事件机制更新本地数据
    if (shouldRefresh === true && ['createRole', 'roleMember', 'rolePermission', 'createUser', 'selectRole', 'userPermission', 'resetPassword'].includes(currentType)) {
      setRefreshKey(prev => prev + 1);
    }
  };

  const currentUser = user ? {
    id: user.id,
    account: user.username,
    name: user.username,
    avatar: user.avatar,
    authorities: user.authorities,
  } as User : null;

  return (
    <div className="flex h-screen w-full bg-gray-50 font-sans text-gray-800 overflow-hidden">
      <Sidebar onLogout={logout} currentUser={currentUser || undefined} />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Routes>
          <Route path="/" element={<Navigate to="/roles" replace />} />
          <Route path="/roles" element={<RoleList refreshKey={refreshKey} openModal={handleOpenModal} />} />
          <Route path="/roles/:id" element={<RoleDetail refreshKey={refreshKey} openModal={handleOpenModal} onRoleDataUpdate={(updatedRole) => {
            // 本地更新角色数据，不需要重新请求服务器
            // 通过全局方式传递给 RoleDetail
            (window as any).updatedRoleData = updatedRole;
          }} />} />
          <Route path="/users" element={<UserList refreshKey={refreshKey} openModal={handleOpenModal} />} />
          <Route path="/users/:id" element={<UserDetail refreshKey={refreshKey} openModal={handleOpenModal} onUserDataUpdate={(updatedUser) => {
              // 本地更新用户数据，不需要重新请求服务器
              // 通过全局方式传递给 UserDetail
              (window as any).updatedUserData = updatedUser;
            }} />} />
          <Route
            path="/permissions"
            element={
              <PermissionManagement
                refreshKey={refreshKey}
              />
            }
          />
          <Route path="/logs" element={<LogList logs={generateMockLogs(12)} />} />
          <Route path="/dictionaries" element={<DictionaryManagement />} />
          <Route path="*" element={<Navigate to="/roles" replace />} />
        </Routes>
      </main>

      {modalState.type === 'createRole' && <CreateRoleModal onClose={handleCloseModal} />}
      {modalState.type === 'editRole' && <EditRoleModal onClose={handleCloseModal} role={modalState.role} />}
      {modalState.type === 'roleMember' && <RoleMemberModal onClose={handleCloseModal} role={modalState.role} />}
      {modalState.type === 'rolePermission' && <RolePermissionModal onClose={handleCloseModal} role={modalState.role} />}
      {modalState.type === 'createUser' && <CreateUserModal onClose={handleCloseModal} />}
      {modalState.type === 'editUser' && <EditUserModal onClose={handleCloseModal} user={modalState.user} />}
      {modalState.type === 'selectRole' && <SelectRoleModal onClose={handleCloseModal} user={modalState.user} />}
      {modalState.type === 'userPermission' && <UserPermissionModal onClose={handleCloseModal} user={modalState.user} />}
      {modalState.type === 'resetPassword' && <ResetPasswordModal onClose={handleCloseModal} user={modalState.user} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
