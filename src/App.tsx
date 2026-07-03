/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { RoleList } from './components/RoleList';
import { RoleDetail } from './components/RoleDetail';
import { UserList } from './components/UserList';
import { UserDetail } from './components/UserDetail';
import { PermissionList } from './components/PermissionList';
import { LogList } from './components/LogList';
import { CreateRoleModal, EditRoleModal, RoleMemberModal, RolePermissionModal } from './components/RoleModals';
import { CreateUserModal, EditUserModal, SelectRoleModal, UserPermissionModal, ResetPasswordModal } from './components/UserModals';
import { PermissionModal } from './components/PermissionModals';
import { DictionaryManagement } from './components/DictionaryManagement';
import { Auth } from './components/Auth';
import { ModalState, Role, User, Permission } from './types';
import { mockPermissions, mockLogs } from './data';
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

  const handleOpenModal = (type: ModalState['type'], data?: Role | User | Permission) => {
    if (type === 'none' || type === 'createRole' || type === 'createUser' || type === 'createPermission') {
      setModalState({ type } as ModalState);
    } else if (type === 'editUser' && data) {
      setModalState({ type, user: data as User } as ModalState);
    } else if ((type === 'selectRole' || type === 'userPermission' || type === 'resetPassword') && data) {
      setModalState({ type, user: data as User } as ModalState);
    } else if (type === 'editPermission' && data) {
      setModalState({ type, permission: data as Permission } as ModalState);
    } else if (data) {
      setModalState({ type, role: data as Role } as ModalState);
    }
  };

  const handleCloseModal = (shouldRefresh = false) => {
    const currentType = modalState.type;
    setModalState({ type: 'none' });

    // 只有在明确需要刷新时才刷新列表（如创建、编辑成功后）
    if (shouldRefresh === true && ['createRole', 'editRole', 'roleMember', 'rolePermission', 'createUser', 'editUser', 'selectRole', 'userPermission', 'resetPassword'].includes(currentType)) {
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
          <Route path="/roles/:id" element={<RoleDetail refreshKey={refreshKey} openModal={handleOpenModal} />} />
          <Route path="/users" element={<UserList refreshKey={refreshKey} openModal={handleOpenModal} />} />
          <Route path="/users/:id" element={<UserDetail refreshKey={refreshKey} openModal={handleOpenModal} />} />
          <Route path="/permissions" element={<PermissionList permissions={mockPermissions} openModal={handleOpenModal} />} />
          <Route path="/logs" element={<LogList logs={mockLogs} />} />
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
      {modalState.type === 'createPermission' && <PermissionModal onClose={handleCloseModal} />}
      {modalState.type === 'editPermission' && <PermissionModal onClose={handleCloseModal} permission={modalState.permission} />}
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
